"use client";

import { useState, useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useLocation } from "react-router-dom";
import { copyText } from "@/lib/helpers";

import PublicAttemptAccuracyAnalysis from "./PublicAttemptAccuracyAnalysis";
import PublicAttemptOverview from "./PublicAttemptOverview";
import PublicAttemptPerformanceAnalysis from "./PublicAttemptPerformanceAnalysis";
import PublicAttemptSolutions from "./PublicAttemptSolutions";
import AttempRecommendations from "@/components/assessment/attempt-recommendations";
import LoadingOverlay from "react-loading-overlay-ts";
import PublicAttemptComparativeAnalysis from "./PublicAttemptComparativeAnalysis";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { date, fromNow, round, secondsToDateTime } from "@/lib/pipe";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import {
  questionStatus,
  reArrangeAnswers,
  serialize,
  saveBlobFromResponse,
} from "@/lib/common";
import { slugify } from "@/lib/validator";
import { alert, success } from "alertifyjs";
import { getSession } from "next-auth/react";

import * as questionService from "@/services/questionService";
import * as studentService from "@/services/student-service";
import * as attemptService from "@/services/attemptService";
import { setDefaultLocale } from "react-datepicker";
import { time } from "console";

const StudentAttemptSummary = () => {
  const { id } = useParams();
  const pathname = usePathname();
  // const { user } = useSession()?.data || {};
  const [user, ssetUser] = useState();
  const router = useRouter();
  const [selectedTabs, setSelectedTabs] = useState<string>("solutions");

  const [sectionIndex, setSectionIndex] = useState<any>([]);
  const [averageTime, setAverageTime] = useState<number>(0);
  const [correctedPercent, setCorrectedPercent] = useState<string>("");
  const [tabs, setTabs] = useState<any>({
    overview: false,
    accuracy: false,
    error: false,
    performance: false,
    solutions: true,
    comparative: false,
    recommendation: false,
  });
  const [codingLanguages, setCodingLanguages] = useState<any>([]);
  const [selectedLang, setSelectedLang] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [selectLang, setSelectLang] = useState<string>("");
  const [practice, setPractice] = useState<any>();
  const [attempId, setAttempId] = useState<string>("");
  const [attempt, setAttempt] = useState<any>();
  const [totalQuestion, setTotalQuestion] = useState<number>(0);
  const [totalCorrections, setTotalCorrections] = useState<number>(0);
  const [topics, setTopics] = useState<any>([]);
  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [totalMissed, setTotalMissed] = useState<number>(0);
  const [paramsNew, setParamsNew] = useState<any>({
    limit: 15,
    page: 1,
    list: true,
    currentPage: 1,
  });
  const [questions, setQuestions] = useState<any>([]);
  const [totalTimeSecond, setTotalTimeSecond] = useState<number>(0);
  const [avgTimeSecond, setAvgTimeSecond] = useState<number>(0);
  const [practices, setPractices] = useState<any>([]);
  const [nowTime, setNowTime] = useState<Date>(new Date());
  const [maxTime, setMaxTime] = useState<any>(
    Date.UTC(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate())
  );
  const [params, setParams] = useState<any>({
    timezoneOffset: nowTime.getTimezoneOffset(),
  });
  const [totalMark, setTotalMark] = useState<number>(0);
  const [paginationQuestion, setPaginationQuestion] = useState<any>({
    currentPage: 1,
    questions: [],
  });

  const [topperAttempt, setTopperAttempt] = useState<any>();
  const [averageAttempt, setAverageAttempt] = useState<any>();
  const [allQuestions, setAllQuestions] = useState<any>();
  const [isExpired, setIsExpired] = useState<any>();
  const [hasNoAnswer, setHasNoAnswer] = useState<boolean>(false);
  const [loadedAccuracy, setLoadedAccuracy] = useState<any>({});
  const [userResMixMatch, setUserResMixMatch] = useState<any>({});
  const [previousAccuracyBySub, setPreviousAccuracyBySub] = useState<any>({});

  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    studentService
      .getPublicAttempt(id)
      .then((attempt: any) => {
        setAttempt(attempt);
        setPractice(attempt.practiceSetInfo);
        setQuestions(attempt.QA);
        ssetUser(attempt.user);
        const para = params;

        para.location = attempt.location;

        for (const q of attempt.QA) {
          setUserResMixMatch({
            ...userResMixMatch,
            [q.question]: q.answers,
          });
        }

        attempt.totalMark =
          Math.round((Number(attempt.totalMark) + Number.EPSILON) * 100) / 100;
        attempt.units = [];

        if (attempt.subjects.length) {
          attempt.subjects.sort((a, b) => a.name.localeCompare(b.name));

          attempt.subjects.forEach((d) => {
            d.mark = Math.round((Number(d.mark) + Number.EPSILON) * 100) / 100;
            d.units.forEach((u) => {
              u.subject = d.name;
            });

            d.units.sort((a, b) => a.name.localeCompare(b.name));

            attempt.units = [...attempt.units, ...d.units];
          });
        }

        setAttempId(attempt._id);
        setTotalQuestion(attempt.totalQuestions);
        setTotalCorrections(attempt.totalCorrects);
        setTotalErrors(attempt.totalErrors);
        setTotalMissed(attempt.totalMissed);

        if (attempt.preferences?.assessment.comparativeAnalysis) {
          getAccuracyPercentile(para);
        }

        loadQuestionDetail();

        studentService
          .getAverageAttempt(attempt.practicesetId, {
            location: attempt.location,
          })
          .then((ad: []) => {
            setAverageAttempt(ad);
          });

        studentService
          .getBestAttempt(attempt.practicesetId, { location: attempt.location })
          .then((dat) => {
            setTopperAttempt(dat || { subjects: [] });
          });

        const subjectIds = [];
        let unitIds = [];
        for (const sub of attempt.subjects) {
          subjectIds.push(sub._id);
          unitIds = [...unitIds, ...sub.units.map((u) => u._id)];
        }

        const condObj = {
          user: user._id,
          subjects: subjectIds.join(","),
          units: unitIds.join(","),
          practicesetId: attempt.practicesetId,
          currentAttempt: attempt._id,
          attemptDate: attempt.createdAt,
        };

        attemptService.accuracyBySubject(condObj).then((res: any) => {
          if (res) {
            res.forEach((el) => {
              const sub = attempt.units.find((d) => d.name == el.unit);
              if (sub) {
                el.cAcc = sub.accuracy;
              } else {
                el.cAcc = 0;
              }
            });

            const tmp = res.filter((s) => s.cAcc * 100 < s.accuracy);

            tmp.sort((s1, s2) => s2.accuracy - s1.accuracy);
            setPreviousAccuracyBySub(tmp);
          }
        });

        setTotalMark(attempt.minusMark + attempt.plusMark);
        setAttempt(attempt);
      })
      .catch((err) => {
        alert("Message", "Attempt data is not available!");
      });
  }, [id]);

  const loadQuestionDetail = () => {
    if (!allQuestions) {
      const id = attempId;
      questionService.getByAttempt(id).then((questions: any) => {
        for (let i = 0; i < questions.length; i++) {
          // Need to rearrange answers array to make it consistent with take-test screen
          questions[i].answers = reArrangeAnswers(questions[i].answers);
          const QA = attempt.QA;
          for (let j = 0; j < QA.length; j++) {
            if (QA[j] && questions[i]._id === QA[j].question) {
              // store time eslapse for each question
              questions[i].number = QA[j].number || QA[j].index;
              questions[i].status = QA[j].status;
              questions[i].obtainMarks = QA[i].obtainMarks;

              questions[i].isMissed = QA[j].isMissed;
              questions[i].timeEslapse = QA[j].timeEslapse;
              questions[i].isCorrect =
                questions[i].status === questionStatus.CORRECT;
              questions[i].answerSelected = [];
              questions[i].answerCorrect = [];
              const questionAnswers = questions[i].answers;
              const userAnswers = QA[j].answers;
              // console.log(this.attempt.QA[i].answers[0].testcases);
              if (questions[i].category == "descriptive") {
                questions[i].answers = QA[i].answers;
                questions[i].teacherEvaluation = QA[i].teacherComment;
                questions[i].evaluatedMarks = QA[i].obtainMarks;
                questions[i].actualMarks = QA[i].actualMarks;
                questions[i].status = QA[i].status;
              } else if (questions[i].category === "code") {
                questions[i].answers = QA[i].answers;

                const codingLang = [];

                // Load list of language
                questions[i].coding.forEach((c) => {
                  if (c.language === "python") {
                    codingLang.push({
                      display: "Python",
                      language: "python",
                    });
                    c["display"] = "Python";
                  } else if (c.language === "c") {
                    codingLang.push({
                      display: "C",
                      language: "c",
                    });
                    c["display"] = "C";
                  } else if (c.language === "cpp") {
                    codingLang.push({
                      display: "C++",
                      language: "cpp",
                    });
                    c["display"] = "C++";
                  } else if (c.language === "java") {
                    codingLang.push({
                      display: "Java",
                      language: "java",
                    });
                    c["display"] = "Java";
                  } else if (c.language == "ruby") {
                    codingLang.push({
                      display: "Ruby",
                      language: "ruby",
                    });
                    c["display"] = "Ruby";
                  }
                  setCodingLanguages(codingLang);

                  setStats({
                    ...stats,
                    [c.language]: {
                      compileTime: 0,
                      runTime: 0,
                      testcasesPassed: 0,
                      totalTestcases: 0,
                    },
                  });
                });

                questions[i].hasNoAnswer = true;

                if (QA[i].answers.length > 0) {
                  questions[i].answers[0].isCorrectAnswerOfUser =
                    QA[i].status === questionStatus.CORRECT;

                  const idx = _.findIndex(questions[i].coding, {
                    language: QA[i].answers[0].codeLanguage,
                  });

                  questions[i].hasNoAnswer = false;
                  setSelectLang(questions[i].coding[idx].language);
                  setSelectedLang(questions[i].coding[idx]);

                  // Check testcase status of student code
                  if (QA[i].answers[0].testcases) {
                    let runTime = 0;
                    let testPassed = 0;
                    questions[i].testcases.forEach((t: any) => {
                      const tInput = questions[i].hasUserInput ? t.input : "";
                      const tArgs = questions[i].hasArgs ? t.args : "";
                      const idx = _.findIndex(QA[i].answers[0].testcases, {
                        input: tInput,
                        args: tArgs,
                      });
                      if (idx > -1) {
                        t.status = QA[i].answers[0].testcases[idx].status;
                        t.studentCodeOutput =
                          QA[i].answers[0].testcases[idx].output;
                        // t.studentCodeOutput = t.studentCodeOuptut + QA[i].answers[0].testcases[idx].error;

                        runTime += QA[i].answers[0].testcases[idx].runTime;
                        testPassed += t.status ? 1 : 0;
                      }
                    });
                    setStats({
                      ...stats,
                      [selectedLang.language]: {
                        compileTime: QA[i].answers[0].compileTime,
                        runTime: runTime,
                        testcasesPassed: testPassed,
                        totalTestcases: questions[i].testcases.length,
                      },
                    });
                  }
                  setStats({
                    ...stats,
                    [selectedLang.language]: {
                      attempts: QA[i].answers.length,
                      timeToSubmit: QA[i].timeEslapse,
                      successAttempts: 0,
                      timeoutAttempts: 0,
                      errorAttempts: 0,
                      avgCasesPassed: 0,
                      avgTimeBetweenAttempts: 0,
                    },
                  });

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
                      setStats({
                        ...stats,
                        [selectedLang.language]: {
                          ...stats[selectedLang.language],
                          successAttempts:
                            stats[selectedLang.language].successAttempts + 1,
                        },
                      });
                      let testPassed = 0;
                      questions[i].testcases.forEach((t) => {
                        t.Input = questions[i].hasUserInput ? t.input : "";
                        t.Args = questions[i].hasArgs ? t.args : "";
                        const idx = _.findIndex(ans.testcases, {
                          input: t.Input,
                          args: t.Args,
                        });
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
                        testPassed / questions[i].testcases.length
                      );
                    }

                    if (hasTimeout) {
                      setStats({
                        ...stats,
                        [selectedLang.language]: {
                          ...stats[selectedLang.language],
                          timeoutAttempts:
                            stats[selectedLang.language].timeoutAttempts + 1,
                        },
                      });
                    } else if (hasError) {
                      setStats({
                        ...stats,
                        [selectedLang.language]: {
                          ...stats[selectedLang.language],
                          errorAttempts:
                            stats[selectedLang.language].errorAttempts + 1,
                        },
                      });
                    }
                  }

                  // round to 1 decimal place
                  setStats({
                    ...stats,
                    [selectedLang.language]: {
                      ...stats[selectedLang.language],
                      avgCasesPassed: !answersCasesPassed.length
                        ? 0
                        : Math.round(
                            (answersCasesPassed.reduce((a1, a2) => {
                              return a1 + a2;
                            }, 0) /
                              answersCasesPassed.length) *
                              1000
                          ) / 10,
                      avgTimeBetweenAttempts: !times.length
                        ? 0
                        : Math.round(
                            times.reduce((t1, t2) => {
                              return t1 + t2;
                            }) / times.length
                          ),
                    },
                  });
                } else {
                  setSelectLang(questions[i].coding[0].language);
                  setSelectedLang(questions[i].coding[0]);
                }
              } else {
                for (const k in questionAnswers) {
                  for (const j in userAnswers) {
                    if (userAnswers[j].answerId) {
                      if (userAnswers[j].answerId === questionAnswers[k]._id) {
                        if (questions[i].category == "fib") {
                          if (QA[i].status == 1) {
                            questions[i].answers[k].isCorrectAnswerOfUser =
                              true;
                            questions[i].answers[k]["answeredText"] =
                              userAnswers[j].answerText;
                            questions[i].isUserAnsweredCorrect = true;
                          } else {
                            questions[i].answers[k].isCorrectAnswerOfUser =
                              false;
                            questions[i].isUserAnsweredCorrect = false;
                            questions[i].answers[k]["answeredText"] =
                              userAnswers[j].answerText;
                          }
                        } else {
                          questionAnswers[k].isCheckedByUser = true;
                          if (!questionAnswers[k].isCorrectAnswer) {
                            questions[i].answers[k].isCorrectAnswerOfUser =
                              false;
                          }
                        }
                      }
                    } else {
                      if (userAnswers[j] === questionAnswers[k]._id) {
                        questionAnswers[k].isCheckedByUser = true;
                        if (!questionAnswers[k].isCorrectAnswer) {
                          questions[i].answers[k].isCorrectAnswerOfUser = false;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          questions[i]["stats"] = { ...this.stats };
          questions[i]["selectedLang"] = { ...this.selectedLang };
        }
        setAllQuestions(questions);
        setQuestions(questions);
        setPaginationQuestion({
          ...paginationQuestion,
          questions: questions,
        });

        // set average time per question
        if (practice.enableSection) {
          for (const section of practice.sections) {
            section.questions = [];
            section.timeElapse = 0;
            for (const q of allQuestions) {
              if (q.section == section.name) {
                section.questions.push(q);
                section.timeElapse += q.timeEslapse;
              }
            }

            for (const q of section.questions) {
              q.stdTime = Math.round(
                (section.time * 60 * 1000) / section.questions.length
              );
              q.avgTime = Math.round(
                section.timeElapse / section.questions.length
              );
            }
          }
        } else {
          for (const q of allQuestions) {
            q.stdTime = Math.round(
              (practice.totalTime * 60 * 1000) / allQuestions.length
            );
            q.avgTime = Math.round(attempt.totalTime / allQuestions.length);
          }
        }

        for (const q of allQuestions) {
          if (q.status == 2) {
            q.wastedTime = q.timeEslapse - q.stdTime;

            const unit = attempt.units.find((u) => u._id == q.unit._id);
            if (unit) {
              if (!unit.wastedTime) {
                unit.wastedTime = 0;
              }
              unit.wastedTime += q.wastedTime;
            }
          }
        }
      });
    }
  };
  const getAccuracyPercentile = (params: any) => {
    const query = serialize(params);

    if (loadedAccuracy[query]) {
      setAttempt({
        ...attempt,
        accuracyPercent: loadedAccuracy[query],
      });
    } else {
      studentService
        .getAccuracyPercentile(attempt._id, params)
        .then((accuracyPercent: any) => {
          if (accuracyPercent && accuracyPercent.percentile) {
            setAttempt({
              ...attempt,
              accuracyPercent: accuracyPercent.percentile,
            });
            setLoadedAccuracy({
              ...loadedAccuracy,
              [query]: accuracyPercent.percentile,
            });
          }
        });
    }
  };

  const loadNewQuestion = () => {
    if (!(paginationQuestion.currentPage < questions.length / 20)) return;
    const questionList = [...questions];
    setPaginationQuestion({
      ...paginationQuestion,
      currentPage: paginationQuestion.currentPage + 1,
      questions: questionList.splice(
        (this.paginationQuestion.currentPage - 1) * 20,
        20
      ),
    });
  };

  const changeTabs = (tab: any) => {
    for (const key in tabs) {
      setTabs({
        ...tabs,
        [key]: key === tab,
      });
    }
  };

  const Loading = () => (
    <div className="error-analysis mx-auto mw-100 pt-0">
      <div className="row">
        <div className="col-lg-2">
          <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth={100} Cheight={30} />

          <p>&nbsp;</p>
        </div>
        <div className="col-lg-10">
          <SkeletonLoaderComponent Cwidth={100} Cheight={30} />

          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth={100} Cheight={30} />

          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="details details_top_area_common mt-0">
        <div className="container">
          <div className="details-area mx-auto mw-100">
            <div className="row align-items-center">
              <div className="col-lg">
                <div className="asses-info overview">
                  <span className="text-white">Assessment Report</span>
                  <h3 className="main_title text-white mb-0 set_fontSize14">
                    {practice?.title}
                  </h3>
                </div>

                <div className="position-relative">
                  <div className="asses-user clearfix d-flex align-items-center pt-2 pb-0">
                    <figure className="user_img_circled_wrap">
                      <div className="profile-user">
                        <img
                          src={attempt?.user?.avatar}
                          alt=""
                          className="user_img_circled"
                        />
                      </div>
                    </figure>
                    <div className="position-relative">
                      <div className="name ml-2 pl-0">
                        <h4 className="py-0">{attempt?.user?.name}</h4>
                        <small className="f-12 text-white">
                          Attempted on{" "}
                          {new Date(attempt?.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-auto ml-auto">
                <div className="d-none d-lg-block">
                  <div className="asses-right overview clearfix border-0 ml-auto">
                    <div className="asses-item border-0">
                      <figure>
                        <img src="assets/images/clock.png" alt="" />
                      </figure>
                      <h4 className="text-white">
                        {(attempt?.totalTime / 1000).toFixed(2)}
                      </h4>
                      <span className="text-white">Time taken</span>
                    </div>

                    <div className="asses-item">
                      <figure>
                        <img src="assets/images/question.png" alt="" />
                      </figure>
                      <h4 className="text-white">
                        {attempt?.totalMark} / {attempt?.maximumMarks}
                      </h4>
                      <span className="text-white">Score</span>
                    </div>

                    {attempt?.preferences?.assessment.comparativeAnalysis && (
                      <div className="asses-item pr-3">
                        <figure>
                          <img src="assets/images/pen.png" alt="" />
                        </figure>
                        <h4 className="text-white">
                          {Math.round(attempt?.accuracyPercent)}
                        </h4>
                        <span className="text-white">Percentile</span>
                      </div>
                    )}
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
              <div className="tabset">
                <div
                  className={`tab ${tabs.solutions ? "active" : ""}`}
                  onClick={() => changeTabs("solutions")}
                >
                  <span className="mx-auto border-0">
                    <figure className="mx-auto">
                      <img src="assets/images/solutions_icon.png" alt="" />
                    </figure>
                    <h4 className="text-center mx-auto">Solutions</h4>
                  </span>
                </div>

                <div
                  className={`tab ${tabs.overview ? "active" : ""}`}
                  onClick={() => changeTabs("overview")}
                >
                  <span className="mx-auto">
                    <figure className="mx-auto">
                      <img src="assets/images/Overview_icon.png" alt="" />
                    </figure>
                    <h4 className="text-center mx-auto">Score Card </h4>
                  </span>
                </div>

                <div
                  className={`tab ${tabs.accuracy ? "active" : ""}`}
                  onClick={() => changeTabs("accuracy")}
                >
                  <span className="mx-auto">
                    <figure className="mx-auto">
                      <img src="assets/images/bow-arrow.png" alt="" />
                    </figure>
                    <h4 className="text-center mx-auto">Accuracy Analysis</h4>
                  </span>
                </div>

                <div
                  className={`tab ${tabs.performance ? "active" : ""}`}
                  onClick={() => changeTabs("performance")}
                >
                  <span className="mx-auto">
                    <figure className="mx-auto">
                      <img
                        src="/assets/images/performance_analysis_chart_icon.png"
                        alt=""
                      />
                    </figure>
                    <h4 className="text-center mx-auto">
                      Performance Analysis
                    </h4>
                  </span>
                </div>

                {attempt?.preferences?.assessment.comparativeAnalysis && (
                  <div
                    className={`tab ${tabs.comparative ? "active" : ""}`}
                    onClick={() => changeTabs("comparative")}
                  >
                    <span className="mx-auto">
                      <figure className="mx-auto">
                        <img
                          src="/assets/images/performance_analysis_chart_icon.png"
                          alt=""
                        />
                      </figure>
                      <h4 className="text-center mx-auto">
                        Comparative Analysis
                      </h4>
                    </span>
                  </div>
                )}
              </div>
              <Tabs
                activeKey={selectedTabs}
                onSelect={(k: any) => setSelectedTabs(k)}
                style={{ borderBottom: "0px" }}
              >
                <Tab
                  eventKey="solutions"
                  title={
                    <span className="mx-auto border-0">
                      <figure>
                        <img
                          src="/assets/images/solutions_icon.png"
                          alt=""
                          className="mx-auto"
                        />
                      </figure>

                      <h6 className="text-center mx-auto">Solutions</h6>
                    </span>
                  }
                  tabClassName="coloredTab"
                >
                  <div>
                    {allQuestions ? (
                      <PublicAttemptSolutions
                        attempt={attempt}
                        userResMixMatch={userResMixMatch}
                        questions={paginationQuestion.questions}
                        setQuestions={(val: any) =>
                          setPaginationQuestion((prev: any) => ({
                            ...prev,
                            questions: val,
                          }))
                        }
                      />
                    ) : (
                      <Loading />
                    )}
                  </div>
                </Tab>
                <Tab
                  eventKey="overview"
                  title={
                    <span className="mx-auto">
                      <figure>
                        <img
                          src="/assets/images/Overview_icon.png"
                          alt=""
                          className="mx-auto"
                        />
                      </figure>
                      <h6 className="text-center mx-auto">Score Card </h6>
                    </span>
                  }
                  tabClassName="coloredTab"
                >
                  <div>
                    <PublicAttemptOverview
                      attempt={attempt}
                      setAttempt={setAttempt}
                    />
                  </div>
                </Tab>
                <Tab
                  eventKey="accuracy"
                  title={
                    <span className="mx-auto">
                      <figure>
                        <img
                          src="/assets/images/bow-arrow.png"
                          className="mx-auto"
                          alt=""
                        />
                      </figure>

                      <h6 className="text-center mx-auto">Accuracy Analysis</h6>
                    </span>
                  }
                  tabClassName="coloredTab"
                >
                  <div>
                    {attempt && previousAccuracyBySub ? (
                      <PublicAttemptAccuracyAnalysis
                        attempt={attempt}
                        previousAccuracyBySub={previousAccuracyBySub}
                      />
                    ) : (
                      <Loading />
                    )}
                  </div>
                </Tab>
                <Tab
                  eventKey="performance"
                  title={
                    <span className="mx-auto">
                      <figure>
                        <img
                          src="/assets/images/performance_analysis_chart_icon.png"
                          alt=""
                          className="mx-auto"
                        />
                      </figure>

                      <h6 className="text-center mx-auto">
                        Performance Analysis
                      </h6>
                    </span>
                  }
                  tabClassName="coloredTab"
                >
                  <div>
                    {topperAttempt && averageAttempt && allQuestions ? (
                      <PublicAttemptPerformanceAnalysis
                        attempt={attempt}
                        topperAttempt={topperAttempt}
                        averageAttempt={averageAttempt}
                        questions={allQuestions}
                      />
                    ) : (
                      <Loading />
                    )}
                  </div>
                </Tab>
                <Tab
                  eventKey="comparative"
                  title={
                    <span className="mx-auto">
                      <figure>
                        <img
                          src="/assets/images/performance_analysis_chart_icon.png"
                          alt=""
                          className="mx-auto"
                        />
                      </figure>

                      <h6 className="text-center mx-auto">
                        Comparative Analysis
                      </h6>
                    </span>
                  }
                  tabClassName="coloredTab"
                >
                  <div>
                    {topperAttempt && averageAttempt ? (
                      <PublicAttemptComparativeAnalysis
                        attempt={attempt}
                        topperAttempt={topperAttempt}
                        averageAttempt={averageAttempt}
                      />
                    ) : (
                      <Loading />
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StudentAttemptSummary;
