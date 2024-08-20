"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getStudentReportOverview,
  getCourseContentAttemptByStudent,
} from "@/services/courseService";
import { getByAttempt } from "@/services/questionService";
import LoadingOverlay from "react-loading-overlay-ts";
import { questionStatus, reArrangeAnswers } from "@/lib/common";
import { avatar, date, elipsis, fromNow, millisecondsToTime } from "@/lib/pipe";
import { Tab, Tabs, TabContent, Button } from "react-bootstrap";
import OverviewComponent from "./OverviewComponent";
import EvaluationComponent from "./EvaluationComponent";
import ErrorComponent from "./ErrorComponent";

const StudentReviewDetails = ({ settings }: any) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [user, setUser] = useState<any>([]);
  const { id, studentId } = useParams();
  const router = useRouter();
  const [sectionIndex, setSectionIndex] = useState<any>([]);
  const [tabs, setTabs] = useState<any>({
    overview: true,
    error: false,
    evaluation: false,
  });
  const [activeTab, setActiveTab] = useState<any>("overview");
  const [codingLanguages, setCodingLanguages] = useState<any>([]);
  const [selectedLang, setSelectedLang] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [selectLang, setSelectLang] = useState<any>("");
  const [practiceset, setPracticeset] = useState<any>({});
  const [attempId, setAttempId] = useState<any>("");
  const [attempt, setAttempt] = useState<any>({});
  const [totalQuestion, setTotalQuestion] = useState<any>(0);
  const [totalCorrections, setTotalCorrections] = useState<any>(0);
  const [topics, setTopics] = useState<any>([]);
  const [totalErrors, setTotalErrors] = useState<any>(0);
  const [totalMissed, setTotalMissed] = useState<any>(0);
  const [paramsNew, setParamsNew] = useState<any>({
    limit: 15,
    page: 1,
    list: true,
    currentPage: 1,
  });
  const [totalTimeSecond, setTotalTimeSecond] = useState<any>(0);
  const [avgTimeSecond, setAvgTimeSecond] = useState<any>(0);
  const [practices, setPractices] = useState<any>([]);
  const [nowTime, setNowTime] = useState<any>(new Date());
  const [maxTime, setMaxTime] = useState<any>(
    Date.UTC(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate())
  );
  const [params, setParams] = useState<any>({
    timezoneOffset: nowTime.getTimezoneOffset(),
  });
  const [totalMark, setTotalMark] = useState<any>(0);
  const [userResMixMatch, setUserResMixMatch] = useState<any>([]);
  const [topperAttempt, setTopperAttempt] = useState<any>({});
  const [averageAttempt, setAverageAttempt] = useState<any>([]);
  const [QA, setQA] = useState<any>([]);
  const [isExpired, setIsExpired] = useState<any>();
  const [classroom, setClassroom] = useState<any>();
  const [currentUser, setCurrentUser] = useState<any>({});
  const [hasNoAnswer, setHasNoAnswer] = useState<any>(false);
  const [topperSummery, setTopperSummery] = useState<any>();
  const [previousAccuracyBySub, setPreviousAccuracyBySub] = useState<any>();
  const [initialized, setInitialized] = useState<any>(false);
  const [course, setCourse] = useState<any>([]);
  const [attempts, setAttempts] = useState<any>({
    overview: {},
    error: {},
    evaluation: {},
  });
  const [questions, setQuestions] = useState<any>({
    overview: {},
    error: {},
    evaluation: {},
  });
  const [allQuestions, setAllQuestions] = useState<any>({
    overview: {},
    error: {},
    evaluation: {},
  });
  const [activeContent, setActiveContent] = useState<any>({});
  const [totalContents, setTotalContents] = useState<any>(0);
  const [timeSpent, setTimeSpent] = useState<any>(0);

  useEffect(() => {
    getStudentReportOverviewFunction();
  }, []);

  const getStudentReportOverviewFunction = async () => {
    getStudentReportOverview(id, studentId, { ...params })
      .then((over: any) => {
        setCourse(over);
        setUser({ ...over.user });
        setSectionProgress(over);

        if (over && over.sections && over.sections.length) {
          setActiveContent(over.sections[0].contents[0]);
        }

        setInitialized(true);
        setLoaded(true);
      })
      .catch((err: any) => {
        setInitialized(true);
        setLoaded(true);
        console.error(err);
      });
  };

  const setSectionProgress = (data: any) => {
    if (data && data.sections) {
      const updatedSections = data.sections.map((section: any) => {
        const progress = section.progress > 100 ? 100 : section.progress;
        return {
          ...section,
          chartSeries: [progress, 100 - progress],
        };
      });
      setCourse({
        ...data,
        sections: updatedSections,
      });
    }
  };

  const selectContent = (data: any) => {
    const { content, section } = data;
    setActiveContent(content);
    const source = content.source;
    const attemptsData = attempts;

    if (!attempts[activeTab][content.source]) {
      if (!content.attempt._id) {
        // Assuming courseService is a service that fetches content attempt data
        getCourseContentAttemptByStudent(source, studentId, {})
          .then((res) => {
            attemptsData[activeTab][content.source] = res;
            setAttempts({
              ...attempts,
              [activeTab]: {
                ...attempts[activeTab],
                [content?.source]: res,
              },
            });
            loadQuestionDetail(attemptsData, content);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        attemptsData[activeTab][content.source] = content.attempt;
        setAttempts({
          ...attempts,
          [activeTab]: {
            ...attempts[activeTab],
            [content?.source]: content.attempt,
          },
        });
        loadQuestionDetail(attemptsData, content);
      }
    }
  };

  const afterEvaluation = (data: any) => {
    for (const q in questions) {
      if (questions[q][activeContent?.source]) {
        const updatedQuestions = questions[q][activeContent?.source].map(
          (d: any) => {
            if (d._id === data._id) {
              return { ...data };
            }
            return d;
          }
        );
        setQuestions({
          ...questions,
          [q]: {
            ...questions[q],
            [activeContent?.source]: updatedQuestions,
          },
        });
      }
    }
  };

  const loadQuestionDetail = async (data: any, activeContentData: any) => {
    let codingLanguagesData = codingLanguages;
    let statsData = stats;
    let selectLangData = selectLang;
    let selectedLangData = selectedLang;
    if (!allQuestions[activeTab][activeContentData.source]) {
      let questionAnswers: any = [];
      let userAnswers: any = [];
      const id = data[activeTab][activeContentData.source]._id;
      const qIds: any = [];
      data[activeTab][activeContentData.source].QA.forEach((e: any) => {
        qIds.push(e.question);
      });
      getByAttempt(id).then((res: any) => {
        res = res.filter((q: any) => qIds.indexOf(q._id) > -1);
        for (let i = 0; i < res.length; i++) {
          // Need to rearrange answers array to make it consistent with take-test screen
          res[i].teacherEvaluation = "";

          res[i].answers = reArrangeAnswers(res[i].answers);
          const QA = data[activeTab][activeContentData.source].QA;
          for (let j = 0; j < QA.length; j++) {
            if (QA[j] && res[i]._id === QA[j].question) {
              // store time eslapse for each question
              res[i].number = QA[j].number || QA[j].index;
              if (QA[i].teacherComment) {
                res[i].teacherEvaluation = QA[i].teacherComment;
              }
              res[i].evaluatedMarks = QA[i].obtainMarks;
              res[i].obtainMarks = QA[i].obtainMarks;

              res[i].actualMarks = QA[i].actualMarks;
              res[i].status = QA[i].status;

              res[i].isMissed = QA[j].isMissed;
              res[i].timeEslapse = QA[j].timeEslapse;
              res[i].isCorrect = res[i].status === questionStatus.CORRECT;
              res[i].answerSelected = [];
              res[i].answerCorrect = [];
              questionAnswers = res[i].answers;
              userAnswers = QA[j].answers;
              // console.log(this.attempt.QA[i].answers[0].testcases);
              if (res[i].category == "descriptive") {
                res[i].answers = QA[i].answers;
              } else if (res[i].category === "code") {
                res[i].answers = QA[i].answers;

                codingLanguagesData = [];

                // Load list of language
                res[i].coding.forEach((c: any) => {
                  if (c.language === "python") {
                    codingLanguagesData.push({
                      display: "Python",
                      language: "python",
                    });
                    c["display"] = "Python";
                  } else if (c.language === "c") {
                    codingLanguagesData.push({
                      display: "C",
                      language: "c",
                    });
                    c["display"] = "C";
                  } else if (c.language === "cpp") {
                    codingLanguagesData.push({
                      display: "C++",
                      language: "cpp",
                    });
                    c["display"] = "C++";
                  } else if (c.language === "java") {
                    codingLanguagesData.push({
                      display: "Java",
                      language: "java",
                    });
                    c["display"] = "Java";
                  } else if (c.language == "ruby") {
                    codingLanguagesData.push({
                      display: "Ruby",
                      language: "ruby",
                    });
                    c["display"] = "Ruby";
                  }

                  statsData[c.language] = {
                    compileTime: 0,
                    runTime: 0,
                    testcasesPassed: 0,
                    totalTestcases: 0,
                  };
                });

                res[i].hasNoAnswer = true;

                if (QA[i].answers.length > 0) {
                  res[i].answers[0].isCorrectAnswerOfUser =
                    QA[i].status === questionStatus.CORRECT;

                  const idx = res[i].coding.findIndex(
                    (c: any) => c.language === QA[i].answers[0].codeLanguage
                  );

                  res[i].hasNoAnswer = false;
                  selectLangData = res[i].coding[idx].language;

                  selectedLangData = res[i].coding[idx];
                  // Check testcase status of student code
                  if (QA[i].answers[0].testcases) {
                    let runTime = 0;
                    let testPassed = 0;
                    res[i].testcases.forEach((t: any) => {
                      const tInput = res[i].hasUserInput ? t.input : "";
                      const tArgs = res[i].hasArgs ? t.args : "";
                      const idx = QA[i].answers[0].testcases.findIndex(
                        (testcases: any) => {
                          return (
                            testcases.input === tInput &&
                            testcases.input === tArgs
                          );
                        }
                      );
                      if (idx > -1) {
                        t.status = QA[i].answers[0].testcases[idx].status;
                        t.studentCodeOutput =
                          QA[i].answers[0].testcases[idx].output;
                        // t.studentCodeOutput = t.studentCodeOuptut + QA[i].answers[0].testcases[idx].error;

                        console.log(t);
                        runTime += QA[i].answers[0].testcases[idx].runTime;
                        testPassed += t.status ? 1 : 0;
                      }
                    });
                    statsData[selectedLangData.language].compileTime =
                      QA[i].answers[0].compileTime;
                    statsData[selectedLangData.language].runTime = runTime;
                    statsData[selectedLangData.language].testcasesPassed =
                      testPassed;
                    statsData[selectedLangData.language].totalTestcases =
                      res[i].testcases.length;
                  }
                  statsData[selectedLangData.language].attempts =
                    QA[i].answers.length;
                  statsData[selectedLangData.language].timeToSubmit =
                    QA[i].timeEslapse;
                  statsData[selectedLangData.language].successAttempts = 0;
                  statsData[selectedLangData.language].timeoutAttempts = 0;
                  statsData[selectedLangData.language].errorAttempts = 0;
                  statsData[selectedLangData.language].avgCasesPassed = 0;
                  statsData[
                    selectedLangData.language
                  ].avgTimeBetweenAttempts = 0;
                  const answersCasesPassed = [];
                  const times = [];
                  for (let j = QA[i].answers.length - 1; j >= 0; j--) {
                    const ans = QA[i].answers[j];
                    times.push(ans.timeElapse);
                    let hasTimeout = false;
                    let hasError = false;
                    if (
                      ans.compileMessage === "done" ||
                      ans.compileMessage === "Compiled Successfully"
                    ) {
                      statsData[selectedLangData.language].successAttempts++;
                      let testPassed = 0;
                      res[i].testcases.forEach((t: any) => {
                        t.Input = res[i].hasUserInput ? t.input : "";
                        t.Args = res[i].hasArgs ? t.args : "";
                        const idx = ans.testcases.findIndex(
                          (testcases: any) => {
                            return (
                              testcases.input === t.Input &&
                              testcases.args === t.Args
                            );
                          }
                        );
                        if (idx > -1) {
                          testPassed += ans.testcases[idx].status ? 1 : 0;
                          if (!testPassed) {
                            if (ans.testcases[idx].error) {
                              if (ans.testcases[idx].error === "Timed out") {
                                hasTimeout = true;
                              } else {
                                hasError = true;
                              }
                            }
                          }
                        }
                      });

                      answersCasesPassed.push(
                        testPassed / res[i].testcases.length
                      );
                    }

                    if (hasTimeout) {
                      statsData[selectedLangData.language].timeoutAttempts++;
                    } else if (hasError) {
                      statsData[selectedLangData.language].errorAttempts++;
                    }
                  }

                  // round to 1 decimal place
                  statsData[selectedLangData.language].avgCasesPassed =
                    !answersCasesPassed.length
                      ? 0
                      : Math.round(
                          (answersCasesPassed.reduce((a1, a2) => {
                            return a1 + a2;
                          }, 0) /
                            answersCasesPassed.length) *
                            1000
                        ) / 10;

                  statsData[selectedLangData.language].avgTimeBetweenAttempts =
                    !times.length
                      ? 0
                      : Math.round(
                          times.reduce((t1, t2) => {
                            return t1 + t2;
                          }) / times.length
                        );
                } else {
                  selectLangData = res[i].coding[0].language;
                  selectedLangData = res[i].coding[0];
                }
              } else {
                for (const k in questionAnswers) {
                  for (const j in userAnswers) {
                    if (userAnswers[j].answerId) {
                      if (userAnswers[j].answerId === questionAnswers[k]._id) {
                        if (res[i].category == "fib") {
                          if (QA[i].status == 1) {
                            res[i].answers[k].isCorrectAnswerOfUser = true;
                            res[i].answers[k]["answeredText"] =
                              userAnswers[j].answerText;
                            res[i].isUserAnsweredCorrect = true;
                          } else {
                            res[i].answers[k].isCorrectAnswerOfUser = false;
                            res[i].isUserAnsweredCorrect = false;
                            res[i].answers[k]["answeredText"] =
                              userAnswers[j].answerText;
                          }
                        } else {
                          questionAnswers[k].isCheckedByUser = true;
                          if (!questionAnswers[k].isCorrectAnswer) {
                            res[i].answers[k].isCorrectAnswerOfUser = false;
                          }
                        }
                      }
                    } else {
                      if (userAnswers[j] === questionAnswers[k]._id) {
                        questionAnswers[k].isCheckedByUser = true;
                        if (!questionAnswers[k].isCorrectAnswer) {
                          res[i].answers[k].isCorrectAnswerOfUser = false;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          res[i]["stats"] = { ...statsData };
          res[i]["selectedLang"] = { ...selectedLangData };
        }

        setAllQuestions({
          ...allQuestions,
          [activeTab]: {
            ...allQuestions[activeTab],
            [activeContentData?.source]: res,
          },
        });

        setQuestions({
          ...questions,
          [activeTab]: {
            ...questions[activeTab],
            [activeContentData?.source]: res,
          },
        });
      });
      setAttempts(data);
      setCodingLanguages(codingLanguagesData);
      setStats(statsData);
      setSelectLang(selectLangData);
      setSelectedLang(selectedLangData);
    }
  };

  const changeTabs = (tab: any) => {
    setActiveTab(tab);
    let tabData = tabs;
    for (const key in tabData) {
      if (key === tab) {
        tabData[tab] = true;
      } else {
        tabData[key] = false;
      }
    }
    setTabs(tabData);
  };

  const goback = () => {
    router.back();
  };

  return (
    <LoadingOverlay
      active={!loaded}
      spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
      styles={{
        overlay: (base) => ({
          ...base,
          height: "100vh",
        }),
      }}
    >
      <section className="details details_top_area_common mt-0">
        <div className="container">
          <div className="details-area mw-100">
            <div className="row">
              <div className="col-lg">
                <div className="asses-info overview d-flex align-items-center">
                  <figure className="mb-0 mr-2 user_img_circled_wrap">
                    <div className="profile-user">
                      <img src={avatar(user, "sm")} alt="image" />
                    </div>
                  </figure>
                  <div className="d-flex flex-column">
                    {course && (
                      <>
                        <h3
                          className="main_title text-white"
                          data-toggle="tooltip"
                          data-placement="top"
                          title={course?.title}
                        >
                          {elipsis(course?.title, 40, true)}
                          {course?.title?.length > 40 && "..."}
                        </h3>
                        <div className="bold">{user.name}</div>
                        <span className="text-white">
                          Last Attempt on{" "}
                          {date(course?.updatedAt, "mediumDate")} (
                          {fromNow(course?.updatedAt)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-auto ml-auto">
                <div className="row">
                  <div className="asses-right overview clearfix border-0 ml-auto">
                    <div className="asses-item border-0">
                      <figure>
                        <img src={"/assets/images/clock.png"} alt="clock" />
                      </figure>
                      <h4 className="text-white">
                        {millisecondsToTime(course?.timeSpent, "short")}
                      </h4>
                      <span className="text-white">Time Spent</span>
                    </div>
                    <div className="asses-item">
                      <figure>
                        <img src={"/assets/images/pen.png"} alt="pen" />
                      </figure>
                      <h4 className="text-white">
                        {course &&
                          `${Math.round(
                            (course?.completedContents /
                              course?.totalContents) *
                              100
                          )}%`}
                      </h4>
                      <span className="text-white">Overall Progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="overview-board">
        <div className="container">
          <div className="overview-board-area">
            <div className="tabs mx-auto nav-justified tabs-bottom-content-gap">
              <section className="overview-board">
                <div className="container">
                  <div className="overview-board-area">
                    <Tab.Container defaultActiveKey={activeTab}>
                      <div
                        className="d-flex justify-content-center"
                        style={{ paddingBottom: "1rem" }}
                      >
                        <div
                          className={
                            activeTab === "overview" ? "tab_border" : ""
                          }
                          style={{ width: "30%" }}
                        >
                          <span onClick={(e: any) => changeTabs("overview")}>
                            <figure className="mx-auto d-flex justify-content-center">
                              <img
                                src="/assets/images/Overview_icon.png"
                                alt=""
                              />
                            </figure>
                            <h5 className="text-center mx-auto">
                              Curriculum Overview
                            </h5>
                          </span>
                        </div>
                        <div
                          className={activeTab === "error" ? "tab_border" : ""}
                          style={{ width: "30%" }}
                        >
                          <span onClick={(e: any) => changeTabs("error")}>
                            <figure className="mx-auto d-flex justify-content-center">
                              <img
                                src="/assets/images/error_analysis_icon.png"
                                alt=""
                              />
                            </figure>
                            <h5 className="text-center mx-auto">
                              Error Analysis
                            </h5>
                          </span>
                        </div>
                        <div
                          className={
                            activeTab === "evaluation" ? "tab_border" : ""
                          }
                          style={{ width: "30%" }}
                        >
                          <span onClick={(e: any) => changeTabs("evaluation")}>
                            <figure className="mx-auto d-flex justify-content-center">
                              <img
                                src="/assets/images/solutions_icon.png"
                                alt=""
                              />
                            </figure>
                            <h5 className="text-center mx-auto">Evaluations</h5>
                          </span>
                        </div>
                      </div>
                      <Tab.Content>
                        {tabs.overview &&
                          initialized &&
                          activeContent &&
                          activeContent._id && (
                            <OverviewComponent
                              attempts={attempts}
                              activeContent={activeContent}
                              setActiveContent={setActiveContent}
                              activeTab={activeTab}
                              course={course}
                              onContentChange={selectContent}
                              questions={
                                questions[activeTab]?.[activeContent?.source]
                              }
                              setQuestions={setQuestions}
                            />
                          )}
                        {tabs.overview === true &&
                          activeContent &&
                          !activeContent._id && (
                            <div className="text-center mx-auto">
                              <img
                                className="mx-auto"
                                src="/assets/images/undraw_upgrade_re_gano.svg"
                                alt="No assessments or quizzes"
                              />
                              <h2>No assessment or quiz to show till now</h2>
                            </div>
                          )}
                        {tabs.error &&
                          initialized &&
                          activeContent &&
                          activeContent._id && (
                            <ErrorComponent
                              id={id}
                              studentId={studentId}
                              attempts={attempts}
                              activeTab={activeTab}
                              course={course}
                              onContentChange={selectContent}
                              questions={
                                questions[activeTab]?.[activeContent?.source]
                              }
                              setQuestions={setQuestions}
                            />
                          )}
                        {tabs.error === true &&
                          activeContent &&
                          !activeContent._id && (
                            <div className="text-center mx-auto">
                              <img
                                className="mx-auto"
                                src="/assets/images/undraw_upgrade_re_gano.svg"
                                alt="No assessments or quizzes"
                              />
                              <h2>No assessment or quiz to show till now</h2>
                            </div>
                          )}
                        {tabs.evaluation &&
                          initialized &&
                          activeContent &&
                          activeContent._id && (
                            <EvaluationComponent
                              id={id}
                              studentId={studentId}
                              attempts={attempts}
                              activeTab={activeTab}
                              course={course}
                              onContentChange={selectContent}
                              onEvaluation={afterEvaluation}
                              questions={
                                questions[activeTab]?.[activeContent?.source]
                              }
                              setQuestions={setQuestions}
                            />
                          )}
                        {tabs.evaluation === true &&
                          activeContent &&
                          !activeContent._id && (
                            <div className="text-center mx-auto">
                              <img
                                className="mx-auto"
                                src="/assets/images/undraw_upgrade_re_gano.svg"
                                alt="No assessments or quizzes"
                              />
                              <h2>No assessment or quiz to show till now</h2>
                            </div>
                          )}
                      </Tab.Content>
                    </Tab.Container>

                    <div className="text-right mb-3">
                      <Button variant="light" onClick={goback}>
                        Back To Course
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </LoadingOverlay>
  );
};

export default StudentReviewDetails;
