"use client";

import { useState, useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useLocation } from "react-router-dom";
import { copyText } from "@/lib/helpers";

import AttemptAccuracyAnalysis from "@/components/assessment/attempt-accuracy-analysis";
import AttemptOverview from "@/components/assessment/attempt-overview";
import AttemptPerformanceAnalysis from "@/components/assessment/attempt-performance-analysis";
import AttemptSolution from "@/components/assessment/attempt-solution";
import AttempRecommendations from "@/components/assessment/attempt-recommendations";
import LoadingOverlay from "react-loading-overlay-ts";
import StudentAttemptComparativeAnalysis from "@/components/assessment/student-attempt-comparative-analysis";
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
import { setDefaultLocale } from "react-datepicker";
import { time } from "console";

const StudentAttemptSummary = () => {
  const { id } = useParams();
  const pathname = usePathname();
  const { user } = useSession()?.data || {};
  const router = useRouter();
  const params = {
    timezoneOffset: new Date().getTimezoneOffset(),
  };
  const [userInfo, setUserInfo] = useState<any>();
  const [totalMark, setTotalMark] = useState<number>(0);
  const [clientData, setClientData] = useState<any>();
  const [allQuestions, setAllQuestions] = useState<any>();
  const [selectedTabs, setSelectedTabs] = useState<string>("solutions");
  const [attempt, setAttempt] = useState<any>();
  const [stats, setStats] = useState<any>({});
  const [practiceset, setPracticeset] = useState<any>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any>();
  const [loadedAccuracy, setLoadAccuracy] = useState<any>({});
  const [averageAttempt, setAverageAttempt] = useState<any>();
  const [topperAttempt, setTopperAttempt] = useState<any>();
  const [selectedLang, setSelectedLang] = useState<any>();
  const [paginationQuestion, setPaginationQuestion] = useState<any>({
    currentPage: 1,
    questions: [],
  });
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);
  let percentile = urlParams.get("percentile");

  const [downloading, setDownloading] = useState<boolean>(false);
  const [codingLanguages, setCodingLanguages] = useState<any[]>([]);
  const [selectLang, setSelectLang] = useState<string>("");
  // const location = useLocation()

  useEffect(() => {
    const getAttempt = async () => {
      let data = (await clientApi.get(`/api/attempts/summary/${id}`)).data;
      if (!!id) {
        setUserInfo(data.user);
      } else {
        setUserInfo(user);
      }

      data.totalMark =
        Math.round((Number(data.totalMark) + Number.EPSILON) * 100) / 100;
      if (data.subjects.length > 0) {
        data["units"] = [];
        data.subjects.forEach((d: any) => {
          d.mark = Math.round((Number(d.mark) + Number.EPSILON) * 100) / 100;
          data["units"] = [...data["units"], ...d.units];
          data["units"].map((unit, index) => {
            data["subjects"].map((sub, i) => {
              sub.units.map((un, j) => {
                if (un._id === unit._id) {
                  unit.subject = sub.name;
                }
              });
            });
          });
        });
      } else {
        data["units"] = [];
      }
      setAttempt(data);

      getAccuracyPercentile(params, data);
      if (!data?.practiceSetInfo.isShowResult) {
        setLoaded(true);
      }
      setQuestions(data.QA);

      if (data.practiceSetInfo.isShowResult && data.isEvaluated) {
        if (data.practiceSetInfo.isShowAttempt) {
          loadQuestionDetail(data);
          getAccuracyPercentile(params, data);
        }

        getAverageAttempt(data.practicesetId);
        getTopperAttempt(data.practicesetId);
      } else {
        setTopperAttempt({});
        setAverageAttempt([]);
      }
      setTotalMark(data.minusMark + data.plusMark);

      if (data.practiceSetInfo.fullLength) {
        getSatScore(data._id);
      }

      const currentPage = sessionStorage.getItem(
        `attempt_summary_current_page_${data._id}`
      );
      if (currentPage) {
        sessionStorage.removeItem(`attempt_summary_current_page_${data._id}`);
        setSelectedTabs(currentPage);
      }

      if (!data?.practiceSetInfo.isShowResult) {
        setTimeout(() => {
          setPracticeset(data.practiceSetInfo);
          setLoaded(true);
        }, 7000);
      } else {
        setPracticeset(data.practiceSetInfo);
        setLoaded(true);
      }
    };

    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      setClientData(data);
    };
    const getAverageAttempt = async (id: string) => {
      const { data } = await clientApi.get(`/api/student/averageAttempt/${id}`);
      setAverageAttempt(data);
    };

    const getTopperAttempt = async (id: string) => {
      const { data } = await clientApi.get(`/api/student/bestAttempt/${id}`);
      setTopperAttempt(data);
    };

    const getSatScore = async (id: string) => {
      const { data } = await clientApi.get(`/api/student/satScore/${id}`);
    };
    getAttempt();
    getClientData();
  }, []);

  const downloadPdf = async () => {
    setDownloading(true);
    const query = { attempt: attempt._id, directDownload: true };
    try {
      const session = await getSession();
      const response = await clientApi.get(
        `https://newapi.practiz.xyz/api/v1/admin/reportData/attempt_report_pdf${toQueryString(
          query
        )}`,
        {
          responseType: "blob",
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );

      saveBlobFromResponse({
        fileName: slugify(practiceset.title + " - " + attempt.user.name),
        blob: response.data,
      });
      setDownloading(false);
    } catch (err) {
      alert("Message", "Report has no data to download!");
      setDownloading(false);
    }
  };

  const goToNextPage = () => {
    if (attempt.referenceType == "course") {
      const contentInfo = localStorage.getItem(
        `${user?.info._id}_${attempt.practicesetId}_course_content_back`
      );
      const queryParams: any = {
        finishedContent: attempt.referenceData,
      };
      if (contentInfo) {
        const courseParams = JSON.parse(contentInfo);
        localStorage.removeItem(
          `${user?.info._id}_${attempt.practicesetId}_course_content_back`
        );
        if (courseParams.demoSection) {
          queryParams.demoSection = courseParams.demoSection;
        }
      }
      router.push(`/course/stage/${attempt.referenceId}`);
    } else {
      router.push(`/testSeries/details/${attempt.referenceId}`);
    }
  };

  const getAccuracyPercentile = async (params: any, attempt: any) => {
    const query = serialize(params);
    let loadedAccurac = loadedAccuracy;
    if (!!loadedAccurac[query]) {
      setAttempt((prev: any) => ({
        ...prev,
        accuracyPercent: loadedAccurac[query],
      }));
    } else {
      const session = await getSession();
      const { data } = await clientApi.get(
        `https://newapi.practiz.xyz/api/v1/student/attempts/${
          attempt._id
        }/percentile${toQueryString(params)}`,
        {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );
      // if (data && data.percentlite) {
      setAttempt({
        ...attempt,
        accuracyPercent: data.percentile,
      });
      loadedAccurac[query] = data.percentlite;
      // }
    }
    setLoadAccuracy(loadedAccurac);
  };

  const loadQuestionDetail = async (attempt: any) => {
    if (!allQuestions) {
      let { data: question } = await clientApi.get(
        `/api/questions/byAttempt/${attempt._id}`
      );
      let stat = stats;
      let selectLang = selectedLang;

      for (let i = 0; i < question.length; i++) {
        // Need to rearrange answers array to make it consistent with take-test screen
        question[i].answers = reArrangeAnswers(question[i].answers);
        const QA = attempt.QA;
        for (let j = 0; j < QA.length; j++) {
          if (QA[j] && question[i]._id === QA[j].question) {
            // store time eslapse for each question
            question[i].number = QA[j].number || QA[j].index;
            question[i].status = QA[j].status;
            question[i].obtainMarks = QA[i].obtainMarks;

            question[i].isMissed = QA[j].isMissed;
            question[i].timeEslapse = QA[j].timeEslapse;
            question[i].isCorrect =
              question[i].status === questionStatus.CORRECT;
            question[i].answerSelected = [];
            question[i].answerCorrect = [];
            const questionAnswers = question[i].answers;
            const userAnswers = QA[j].answers;

            if (question[i].category == "descriptive") {
              question[i].answers = QA[i].answers;
              question[i].teacherEvaluation = QA[i].teacherComment;
              question[i].evaluatedMarks = QA[i].obtainMarks;
              question[i].actualMarks = QA[i].actualMarks;
              question[i].status = QA[i].status;
            } else if (question[i].category === "code") {
              question[i].answers = QA[i].answers;

              // Load list of language
              question[i].coding.forEach((c: any) => {
                if (c.language === "python") {
                  c["display"] = "Python";
                } else if (c.language === "c") {
                  c["display"] = "C";
                } else if (c.language === "cpp") {
                  c["display"] = "C++";
                } else if (c.language === "java") {
                  c["display"] = "Java";
                } else if (c.language == "ruby") {
                  c["display"] = "Ruby";
                }

                stat = {
                  ...stat,
                  [c.language]: {
                    compileTime: 0,
                    runTime: 0,
                    testcasesPassed: 0,
                    totalTestcases: 0,
                  },
                };
              });

              question[i].hasNoAnswer = true;

              if (QA[i].answers.length > 0) {
                question[i].answers[0].isCorrectAnswerOfUser =
                  QA[i].status === questionStatus.CORRECT;

                const idx = question[i].coding.findIndex(
                  (x: any) => x.language === QA[i].answers[0].codeLanguage
                );

                question[i].hasNoAnswer = false;

                selectLang = question[i].coding[idx];
                // Check testcase status of student code
                if (QA[i].answers[0].testcases) {
                  let runTime = 0;
                  let testPassed = 0;
                  question[i].testcases.forEach((t: any) => {
                    const tInput = question[i].hasUserInput ? t.input : "";
                    const tArgs = question[i].hasArgs ? t.args : "";
                    const idx = QA[i].answers[0].testcases.findIndex(
                      (x: any) => x.input === tInput && x.args === tArgs
                    );
                    if (idx > -1) {
                      t.status = QA[i].answers[0].testcases[idx].status;
                      t.studentCodeOutput =
                        QA[i].answers[0].testcases[idx].output;
                      runTime += QA[i].answers[0].testcases[idx].runTime;
                      testPassed += t.status ? 1 : 0;
                    }
                  });
                  stat[selectLang.language].compileTime =
                    QA[i].answers[0].compileTime;
                  stat[selectLang.language].runTime = runTime;
                  stat[selectLang.language].testcasesPassed = testPassed;
                  stat[selectLang.language].totalTestcases =
                    question[i].testcases.length;
                }
                stat[selectLang.language].attempts = QA[i].answers.length;
                stat[selectLang.language].timeToSubmit = QA[i].timeEslapse;
                stat[selectLang.language].successAttempts = 0;
                stat[selectLang.language].timeoutAttempts = 0;
                stat[selectLang.language].errorAttempts = 0;
                stat[selectLang.language].avgCasesPassed = 0;
                stat[selectLang.language].avgTimeBetweenAttempts = 0;
                let answersCasesPassed = [];
                let times = [];
                for (let j = QA[i].answers.length - 1; j >= 0; j--) {
                  const ans = QA[i].answers[j];
                  times.push(ans.timeElapse);
                  let hasTimeout = false;
                  let hasError = false;
                  if (
                    ans.compileMessage === "done" ||
                    ans.compileMessage === "Compiled Successfully"
                  ) {
                    stat[selectLang.language].successAttempts++;
                    let testPassed = 0;
                    question[i].testcases.forEach((t: any) => {
                      t.Input = question[i].hasUserInput ? t.input : "";
                      t.Args = question[i].hasArgs ? t.args : "";
                      const idx = ans.testcases.findIndex(
                        (x: any) => x.input === t.Input && x.args === t.Args
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
                      testPassed / question[i].testcases.length
                    );
                  }

                  if (hasTimeout) {
                    stat[selectLang.language].timeoutAttempts++;
                  } else if (hasError) {
                    stat[selectLang.language].errorAttempts++;
                  }
                }

                // round to 1 decimal place
                stat[selectLang.language].avgCasesPassed =
                  !answersCasesPassed.length
                    ? 0
                    : Math.round(
                        (answersCasesPassed.reduce((a1, a2) => {
                          return a1 + a2;
                        }, 0) /
                          answersCasesPassed.length) *
                          1000
                      ) / 10;

                stat[selectLang.language].avgTimeBetweenAttempts = !times.length
                  ? 0
                  : Math.round(
                      times.reduce((t1, t2) => {
                        return t1 + t2;
                      }) / times.length
                    );
              } else {
                selectLang = question[i].coding[0];
              }
            } else {
              for (const k in questionAnswers) {
                for (const j in userAnswers) {
                  if (userAnswers[j].answerId) {
                    if (userAnswers[j].answerId === questionAnswers[k]._id) {
                      if (question[i].category == "fib") {
                        if (QA[i].status == 1) {
                          question[i].answers[k].isCorrectAnswerOfUser = true;
                          question[i].answers[k]["answeredText"] =
                            userAnswers[j].answerText;
                          question[i].isUserAnsweredCorrect = true;
                        } else {
                          question[i].answers[k].isCorrectAnswerOfUser = false;
                          question[i].isUserAnsweredCorrect = false;
                          question[i].answers[k]["answeredText"] =
                            userAnswers[j].answerText;
                        }
                      } else {
                        questionAnswers[k].isCheckedByUser = true;
                        if (!questionAnswers[k].isCorrectAnswer) {
                          question[i].answers[k].isCorrectAnswerOfUser = false;
                        }
                      }
                    }
                  } else {
                    if (userAnswers[j] === questionAnswers[k]._id) {
                      questionAnswers[k].isCheckedByUser = true;
                      if (!questionAnswers[k].isCorrectAnswer) {
                        question[i].answers[k].isCorrectAnswerOfUser = false;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        question[i]["stats"] = { ...stat };
        question[i]["selectedLang"] = { ...selectLang };
      }

      setStats(stat);
      setSelectedLang(selectLang);
      setAllQuestions(question);
      setQuestions(question);
      setPaginationQuestion((prev: any) => ({ ...prev, questions: question }));
      if (attempt.practiceSetInfo.enableSection) {
        for (const section of practiceset.sections) {
          section.questions = [];
          section.timeElapse = 0;
          for (const q of question) {
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
        for (const q of question) {
          q.stdTime = Math.round(
            (attempt.practiceSetInfo.totalTime * 60 * 1000) / question.length
          );
          q.avgTime = Math.round(attempt.totalTime / question.length);
        }
      }

      for (const q of question) {
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
    }
  };

  const copyPublicLink = () => {
    copyText("https://react.practiz.xyz/public/attempt/" + attempt._id);
    success("Public attempt link is copied to your clipboard!");
  };

  const Loading = () => (
    <div className="error-analysis mx-auto mw-100 pt-0">
      <div className="row">
        <div className="col-lg-2">
          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
        </div>
        <div className="col-lg-10">
          <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
        </div>
      </div>
    </div>
  );
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
      {attempt?.isEvaluated ? (
        <>
          <section className="details details_top_area_common mt-0">
            <div className="container">
              <div className="details-area mx-auto mw-100">
                <div className="row align-items-center">
                  <div className="col-lg">
                    <div className="asses-info overview">
                      <span className="text-white">Assesment Report</span>
                      <h3 className="main_title text-white mb-0 set_fontSize14">
                        {practiceset?.title}
                      </h3>
                    </div>
                    <div className="position-relative">
                      <div className="asses-user clearfix d-flex align-items-center pt-2 pb-0">
                        <figure className="user_img_circled_wrap">
                          <div className="profile-user">
                            {attempt?.user.avatar.length > 0 ? (
                              <img
                                src={attempt?.user.avatar}
                                alt=""
                                className="user_img_circled"
                              />
                            ) : (
                              <img
                                className="user_img_circled"
                                src="/assets/images/defaultProfile.png"
                                alt="user-img"
                              />
                            )}
                          </div>
                        </figure>
                        <div className="position-relative">
                          <div className="name ml-2 pl-0">
                            <h6 className="py-0">{attempt?.user.name}</h6>
                            <small className="f-12 text-white">
                              Attempted on{" "}
                              {date(attempt?.createdAt, "mediumDate")}{" "}
                              {attempt?.createdAt
                                ? `(${fromNow(attempt?.createdAt)})`
                                : ""}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-auto ml-auto">
                    <div
                      className="d-none d-lg-block"
                      style={{ paddingBottom: "30px" }}
                    >
                      <div className="asses-right overview clearfix border-0 ml-auto">
                        {attempt.isEvaluated && (
                          <div className="asses-item border-0">
                            <button
                              className="btn btn-sm text-white p-0"
                              onClick={copyPublicLink}
                            >
                              <i className="fas fa-link d-block mb-1"></i>
                              <strong className="up ah-cursor">
                                Copy Link
                              </strong>
                            </button>
                          </div>
                        )}
                        <div className="asses-item border-0">
                          <button
                            className="btn btn-sm text-white p-0"
                            onClick={() =>
                              router.push(
                                `/assessment/review/${practiceset._id}?attemptId=${attempt._id}`
                              )
                            }
                            disabled={false}
                          >
                            <i className="fas fa-book-reader d-block mb-1"></i>
                            <strong className="up ah-cursor">Review</strong>
                          </button>
                        </div>
                        <div className="asses-item ">
                          <button
                            className="btn btn-sm text-white p-0"
                            onClick={downloadPdf}
                            disabled={downloading}
                          >
                            {!downloading ? (
                              <i className="fas fa-file-download d-block mb-1"></i>
                            ) : (
                              <i className="fa fa-spinner fa-pulse d-block mb-1"></i>
                            )}

                            <strong className="up ah-cursor">Download</strong>
                            <p className="small font-italic down">(PDF)</p>
                          </button>
                        </div>
                        <div className="asses-item ">
                          <figure>
                            <img src="/assets/images/clock.png" alt="" />
                          </figure>
                          <h4 className="text-white">
                            {secondsToDateTime(attempt?.totalTime / 1000)}
                          </h4>
                          <span className="text-white">Time taken</span>
                        </div>

                        <div className="asses-item">
                          <figure>
                            <img src="/assets/images/question.png" alt="" />
                          </figure>
                          <h4 className="text-white">
                            {attempt?.totalMark} / {attempt?.maximumMarks}
                          </h4>
                          <span className="text-white">Score</span>
                        </div>

                        <div className="asses-item pr-3">
                          <figure>
                            <img src="/assets/images/pen.png" alt="" />
                          </figure>
                          <h4 className="text-white">
                            {percentile
                              ? percentile
                              : Math.round(attempt?.accuracyPercent)}
                          </h4>
                          <span className="text-white">Percentile</span>
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
                <div
                  className="tabs mx-auto nav-justified tabs-bottom-content-gap"
                  style={{ overflow: "unset", paddingBottom: 0 }}
                >
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
                          <div>
                            {!!attempt && (
                              <AttemptSolution
                                attempt={attempt}
                                questions={paginationQuestion.questions}
                                setQuestions={(val: any) =>
                                  setPaginationQuestion((prev: any) => ({
                                    ...prev,
                                    questions: val,
                                  }))
                                }
                              />
                            )}
                          </div>
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
                      {!!attempt && (
                        <AttemptOverview
                          attempt={attempt}
                          setAttempt={setAttempt}
                          percentile={
                            percentile
                              ? percentile
                              : Math.round(attempt?.accuracyPercent)
                          }
                        />
                      )}
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

                          <h6 className="text-center mx-auto">
                            Accuracy Analysis
                          </h6>
                        </span>
                      }
                      tabClassName="coloredTab"
                    >
                      <div>
                        {allQuestions ? (
                          <div>
                            {!!attempt && (
                              <AttemptAccuracyAnalysis attempt={attempt} />
                            )}
                          </div>
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
                          <div>
                            {!!attempt && (
                              <AttemptPerformanceAnalysis
                                attempt={attempt}
                                topperAttempt={topperAttempt}
                                averageAttempt={averageAttempt}
                                questions={allQuestions}
                              />
                            )}
                          </div>
                        ) : (
                          <Loading />
                        )}
                      </div>
                    </Tab>
                    <Tab
                      eventKey="recommendation"
                      title={
                        <span className="mx-auto">
                          <figure>
                            <img
                              src="/assets/images/Overview_icon.png"
                              alt=""
                              className="mx-auto"
                            />
                          </figure>
                          <h6 className="text-center mx-auto">
                            Recommendations{" "}
                          </h6>
                        </span>
                      }
                      tabClassName="coloredTab"
                    >
                      {!!attempt && (
                        <AttempRecommendations
                          attempt={attempt}
                          setAttempt={setAttempt}
                          settings={clientData}
                        />
                      )}
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
                          <div>
                            {!!attempt && (
                              <StudentAttemptComparativeAnalysis
                                attempt={attempt}
                                topperAttempt={topperAttempt}
                                averageAttempt={averageAttempt}
                              />
                            )}
                          </div>
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
      ) : (
        <>
          <section className="details details_top_area_common mt-0">
            <div className="container">
              <div className="details-area mx-auto mw-100">
                <div className="row">
                  <div className="col-md-6">
                    <div className="asses-info overview">
                      <span className="text-white">
                        Assesment Report <b>Name</b>
                      </span>
                      <h3 className="main_title text-white mb-0">
                        {practiceset?.title}
                      </h3>
                      <small className="f-12 text-white">
                        Attempted on {date(attempt?.createdAt, "mediumDate")}{" "}
                        {fromNow(attempt?.createdAt)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* <section className="post-asses">
            <div className="container">
              <div className="post-asses-area mx-auto">
                <div className="row">
                  <div className="col-md-6">
                    <div className="post-asses-area-wrap d-flex">
                      <figure>
                        <img
                          src="/assets/images/animation_200_khwgqy4s.gif"
                          alt=""
                        />
                      </figure>
                      {(!user?.info.provider ||
                        user.info.provider !== "prodapt") && (
                          <div className="heading">
                            <h2>Your attempt was successfully recorded</h2>
                          </div>
                        )}
                      {user?.info.provider === "prodapt" && (
                        <div className="heading">
                          <h2>
                            Your attempt was successfully recorded. Please close
                            the current window and mark the assessment completed
                            on Propel to ensure the scores are updated correctly
                          </h2>
                        </div>
                      )}
                    </div>
                    {(!user?.info.provider ||
                      user.info.provider !== "prodapt") && (
                        <div>
                          {attempt?.referenceType == "course" && (
                            <a
                              className="btn btn-primary btn-lg"
                              onClick={goToNextPage}
                            >
                              Continue to Course
                            </a>
                          )}
                          {attempt?.referenceType == "testseries" && (
                            <a
                              className="btn btn-primary btn-lg"
                              onClick={goToNextPage}
                            >
                              Continue to Test Series
                            </a>
                          )}
                          {!attempt?.referenceType && (
                            <a
                              className="btn btn-primary btn-lg"
                              href="/assessment/home"
                            >
                              Continue
                            </a>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="col-md-6">
                    <div className="result-overview-area pt-0">
                      <div className="row">
                        <div className="col-md-6 gap-bottom">
                          <div className="result-overview-box">
                            <div className="title">
                              <h4 className="text-center">Time taken</h4>
                            </div>

                            <div className="box-content clearfix mx-auto">
                              <figure>
                                <img
                                  src="/assets/images/stopwatch.png"
                                  alt=""
                                />
                              </figure>

                              <div className="info">
                                <span>
                                  {secondsToDateTime(
                                    attempt?.totalTime
                                      ? attempt?.totalTime / 100
                                      : attempt?.maximumMarks
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="result-overview-box">
                            <div className="title">
                              <h4 className="text-center">
                                Questions Attempted
                              </h4>
                            </div>

                            <div className="box-content clearfix mx-auto">
                              <figure>
                                <img src="/assets/images/calender.png" alt="" />
                              </figure>

                              <div className="info">
                                <span>
                                  {user?.info.role == "student"
                                    ? attempt?.totalQuestions
                                      ? `${Math.ceil(
                                        attempt?.totalQuestions -
                                        attempt?.totalMissed
                                      )}/${attempt?.practiceSetInfo.totalQuestion
                                      }`
                                      : `0/${attempt?.practiceSetInfo.totalQuestion}`
                                    : attempt?.totalQuestions
                                      ? `${attempt?.totalQuestions -
                                      attempt?.totalMissed
                                      }/${attempt?.practiceSetInfo.totalQuestion
                                      }`
                                      : `0/${attempt?.practiceSetInfo.totalQuestion}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
        </>
      )}
    </LoadingOverlay>
  );
};

export default StudentAttemptSummary;
