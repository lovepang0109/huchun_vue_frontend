"use client";
import Countdown from "react-countdown";
import { useSession, getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Numeral from "react-numeral";
import LoadingOverlay from "react-loading-overlay-ts";
import McqQuestion from "@/components/assessment/mcq-question";
import clientApi from "@/lib/clientApi";
import {
  codeLanguageDisplay,
  numberToWord,
  toQueryString,
} from "@/lib/validator";
import { formatQuestion } from "@/lib/pipe";
import FibQuestion from "@/components/assessment/fib-question";
import Descriptive from "@/components/assessment/descriptive-question";
import CodingQuestion from "@/components/assessment/coding-question";
import MixmatchQuestion from "@/components/assessment/mixmatch-question";
import { replaceQuestionText, replaceUserAnswer } from "@/lib/pipe";
import { Tab, Tabs, Modal } from "react-bootstrap";
import { deepCopy } from "@/lib/common";
import { embedVideo, getElearningFullPath } from "@/lib/helpers";
import MathJax from "@/components/assessment/mathjax";
import { success, alert } from "alertifyjs";
import QuestionFeedback from "@/components/assessment/question-feedback";
import CalculatorModal from "@/components/calculator";
import CodeMirror from "@uiw/react-codemirror";
import { QFeedbacksEntry } from "@/interfaces/interface";
import { setTimers, timers } from "react-idle-timer/dist/utils/timers";
import { attempt } from "lodash";

const Learning = () => {
  const { query } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(useSession()?.data || {});
  const ref: any = useRef();
  const ref1: any = useRef();
  const startDate = useRef(Date.now());
  const [params, setParams] = useState<any>({
    limit: 6,
    page: 1,
    contentType: "video",
  });
  const [qStartTime, setQStartTime] = useState<any>();
  const [videoCount, setVideoCount] = useState<number>(0);
  const [clientData, setClientData] = useState<any>();
  const [practice, setPractice] = useState<any>({});
  const [question, setQuestion] = useState<any>({});
  const [answer, setAnswer] = useState<any>();
  const [answers, setAnswers] = useState([]);
  const [reviewQuestion, setReviewQuestion] = useState<any>();
  const [hasNoAnswer, setHasNoAnswer] = useState<boolean>();
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [selectedLang, setSelectedLang] = useState<any>();
  const [onlineTeachers, setOnlineTeachers] = useState<any[]>([]);
  const [leftTime, setLeftTime] = useState<number>(0);
  const [codingQuestion, setCodingQuestion] = useState<any>();
  const [stats, setStats] = useState<any>();
  const [performance, setPerformance] = useState<any>();
  const [topicAnalysis, setTopicAnalysis] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [startTimer, setStartTimer] = useState<boolean>(true);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showCalculateModal, setShowCalculateModal] = useState<boolean>(false);
  const [showSketch, setShowSketch] = useState<boolean>(false);
  const [loadedTopics, setLoadedTopics] = useState<any>();
  const [newQuestion, setNewQuestion] = useState<any>();
  const [review, setReview] = useState<boolean>(false);
  const [useranswer, setUserAnswer] = useState<any>([]);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [pauseTimer, setPauseTimer] = useState<boolean>(false);
  const [attemptId, setAttemptId] = useState<String>("");
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [clockHidden, setClockHidden] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>("");
  const [feedbackSubmitting, setFeedbacksubmitting] = useState<boolean>(false);
  const [questionReported, setQuestionReported] = useState<boolean>(false);
  const [reportCheckboxs, setReportCheckboxs] = useState({
    ckFrame: false,
    ckExplanation: false,
    ckLearningVideo: false,
    ckMore: false,
    ckAnother: false,
    txtAnother: "",
  });
  const [avgTimeSpent, setAvgTimeSpent] = useState<number>(0);
  const [timeElapse, setTimeElapse] = useState<number>(0);

  const handleReportCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checkboxName: string
  ) => {
    setReportCheckboxs((prevState) => ({
      ...prevState,
      [checkboxName]: event.target.checked,
      txtAnother: !event.target.checked ? "" : prevState.txtAnother,
    }));
  };

  const onTextAnotherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReportCheckboxs((prevState) => ({
      ...prevState,
      txtAnother: event.target.value,
    }));
  };

  const feedbackSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedbacksubmitting(true);
    const feedbackData: string[] = [];
    if (
      !reportCheckboxs.ckFrame &&
      !reportCheckboxs.ckExplanation &&
      !reportCheckboxs.ckLearningVideo &&
      !reportCheckboxs.ckMore &&
      !reportCheckboxs.ckAnother
    ) {
      setFeedbackError("Please select at least one option.");
      return;
    }
    if (reportCheckboxs.ckAnother && !reportCheckboxs.txtAnother) {
      setFeedbackError("Please enter your comment.");
      return;
    }
    if (reportCheckboxs.ckFrame)
      feedbackData.push("The question isn't framed correctly");
    if (reportCheckboxs.ckExplanation)
      feedbackData.push(
        "Explanation is incorrect, unclear, or needs improvement"
      );
    if (reportCheckboxs.ckLearningVideo)
      feedbackData.push(
        "Learning video is irrelevant, not loading, or inappropiate"
      );
    if (reportCheckboxs.ckMore)
      feedbackData.push("Problem with one to more options");

    const qFeedbacks: QFeedbacksEntry = {
      teacherId: practice.user._id,
      practicesetId: practice._id,
      questionid: question._id,
      studentId: user._id,
      isReviewing: false,
      feedbacks: feedbackData,
      comment: reportCheckboxs.txtAnother,
    };

    clientApi
      .post("/api/feedbacks/questionFeedback", qFeedbacks)
      .then(() => {
        setFeedbacksubmitting(false);
        setShowReportModal(false);
        setQuestionReported(true);
        success("Your feedback is submitted.");
      })
      .catch(() => {
        setFeedbacksubmitting(false);
        alert("Feedback error", "Failed to submit your feedback.");
      });
  };

  const cancelReport = () => {
    setReportCheckboxs({
      ckFrame: false,
      ckExplanation: false,
      ckLearningVideo: false,
      ckMore: false,
      ckAnother: false,
      txtAnother: "",
    });
    setShowReportModal(false);
  };

  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get(`/api/settings`);
      setClientData(data);
      const session = (await clientApi.get("/api/users/me")).data;
      console.log(session, "session>>>>>");
      setUser(session);
    };

    const getPractice = async () => {
      const { data } = await clientApi.get(`/api/adaptiveTest/get/${query}`);
      setPractice(data);
      let uanswer = [];
      for (var i = 0; i < data?.totalQuestion; i++) {
        uanswer.push({});
      }
      setUserAnswer(uanswer);
      setLeftTime(data.totalTime * 60);
      setAvgTimeSpent((data.totalTime * 60 * 1000) / data.totalQuestion);
    };

    const getOnlineTeachers = async () => {
      const { data } = await clientApi.get(
        `/api/user/online${toQueryString({ roles: "teacher,mentor" })}`
      );
      setOnlineTeachers(data);
    };

    const getPerformance = async (data: any) => {
      const { data: result } = await clientApi.get(
        `/api/questions/getPerformance/${data._id}`
      );
      setPerformance(result.percentCorrect);
    };

    const getTopicAnalysis = async (data: any) => {
      try {
        const { data: result } = await clientApi.get(
          `/api/questions/personalTopicAnalysis/${data._id}`
        );
        setTopicAnalysis(result);
        if (data.category === "mcq")
          setQuestion((prev: any) => ({
            ...prev,
            correctAnswerCount: data.answers.filter(
              (a: any) => a.isCorrectAnswer
            ).length,
          }));
      } catch (error) {
        console.error(error);
      }
    };

    const getFirstQuestion = async () => {
      const { data } = await clientApi.get(
        `/api/adaptiveTest/getFirstQuestion${toQueryString({
          practiceset: query,
        })}`
      );
      setQuestion(data);
      getPerformance(data);
      getTopicAnalysis(data);
      // const cp = localStorage.getItem(data.attemptId + "_currPage");
      // setCurrentPage(!!cp ? Number(cp) : 1);
      setCurrentPage(1);
      setPageLoaded(true);
      setStartTimer(true);
      setQStartTime(new Date().getTime());
    };

    getClientData();
    getPractice();
    getOnlineTeachers();
    getFirstQuestion();
  }, []);
  console.log(timeElapse, avgTimeSpent, "ddddd");
  // useEffect(() => {
  //   console.log("quesiont chage");
  //   questionChange();
  // }, [question]);

  useEffect(() => {
    let timer: any;
    // const startTimer = () => {
    if (timerStarted && !pauseTimer) {
      timer = setInterval(() => {
        setLeftTime((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timerStarted, leftTime]);

  useEffect(() => {
    if (!timerStarted) {
      setStartTimer(true);
      setTimerStarted(true);
      // ref.current.start();
      // ref1.current.start();
    }
  }, [timerStarted]);

  const finishTest = () => {
    if (practice?.totalQuestion == currentPage) {
      router.push(`/attempt-summary/${question.attemptID}`);
    } else {
      alert("Message", "Test is not completed.");
    }
    // if (!review) {
    //   nextQuestion(1);
    // } else {
    //   alert("Message","Are you sure you want to end this practice test?");
    //   testCompleted();
    // }
  };
  const reportIssue = () => {
    setShowReportModal(true);
  };

  const chat = (teacher: any) => {};

  const renderer = ({
    hours,
    minutes,
    seconds,
    completed,
  }: {
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      // if (startTimer) finishTest();
    } else {
      return (
        <span>{`${hours ? (hours > 9 ? hours : "0" + hours + ":") : ""}${
          minutes > 9 ? minutes : "0" + minutes
        }:${seconds > 9 ? seconds : "0" + seconds}`}</span>
      );
    }
  };

  const selectAnswer = (answer: any) => {
    let selAnswers = selectedAnswers;
    if (question?.questionType === "single") {
      question?.answers.forEach((a: any) => {
        if (a._id != answer.answer._id) {
          selAnswers[a._id] = false;
        }
      });
    }
    selAnswers[answer.answer._id] = true;
    let ua = useranswer;
    ua[currentPage - 1] = answer;
    setUserAnswer(ua);
    setSelectedAnswers(selAnswers);
  };

  const onFibTextChange = (evt: any) => {
    const index = evt.index;
    let text = evt.text;
    const latex = evt.latex;
    // Mean this is math data comming from mathlive tool
    if (latex && text.indexOf("<math ") == -1) {
      text =
        '<math xmlns="http://www.w3.org/1998/Math/MathML">' + text + "</math>";
    }

    setQuestion((prev: any) => ({
      ...prev,
      answers: prev.answers.map((answer: any, i: number) =>
        i === index
          ? {
              ...answer,
              isChecked: !!text ? true : false,
              answeredText: text,
              mathData: latex,
            }
          : answer
      ),
    }));
  };

  const onDescriptiveUpdate = () => {};

  const onCodeUpdate = (e: any) => {
    let ans = e.answer;
    ans.timeElapse = new Date().getTime() - qStartTime;
    setAnswer(ans);
  };

  const getQuestionPerformance = async () => {
    try {
      const { data: result } = await clientApi.get(
        `/api/questions/getPerformance/${question._id}`
      );
      setPerformance(result.percentCorrect);
    } catch (error) {
      setPerformance(null);
    }
  };

  const nextQuestion = async (finish = 0) => {
    let answers = [];
    console.log(question, selectedAnswers, "ques>>>>");
    if (question?.category === "mcq") {
      for (const k in selectedAnswers) {
        if (selectedAnswers[k]) {
          answers.push(k);
        }
      }
    } else if (question?.category === "fib") {
      if (question.answers.length > 0) {
        question.answers.forEach((doc: any) => {
          if (doc.answeredText) {
            if (doc.answeredText.trim() !== "" && doc.answeredText != null) {
              answers.push({
                answerId: doc._id,
                answerText: doc.answeredText,
                mathData: doc.mathData,
              });
            }
          }
        });
      }
    } else if (question?.category === "code") {
      if (answer && (answer.status || answer.status == 0)) {
        answers.push(answer);
      }
    } else if (question?.category == "descriptive") {
      if (
        question.answerText ||
        (question.attachments && question.attachments.length)
      ) {
        answers.push({
          answerText: question.answerText,
          attachments: question.attachments,
        });
      }
    } else if (question?.category === "mixmatch") {
      if (question.answers.length > 0) {
        answers = question.answers;
      }
    }

    if (answers.length > 0) {
      setPageLoaded(false);
      setPauseTimer(true);
      // ref.current.pause();
      // ref1.current.pause();
      if (question.attemptID) {
        setAttemptId(question.attemptID);
      }
      let parameters: any = {
        attempt: question.attemptID ? question.attemptID : attemptId,
        question: question._id,
        answers: answers,
        finish: finish,
        index: question.index ? question.index : question.answerNumber,
        adaptiveObject: question.adaptiveObject,
        feedback: question.feedback ? question.feedback : "",
        category: question.category,
        testId: practice._id,
        reviewScreenTime: 0,
        practiceset: practice._id,
        qSpendTime: new Date().getTime() - qStartTime,
      };

      if (question.scratchPad) {
        parameters.scratchPad = question.scratchPad;
      }

      console.log(parameters, question, "para>>>>");

      try {
        const { data } = await clientApi.post(
          "/api/learningTest/getQuestion",
          parameters
        );
        console.log(data, "post>>>>");
        setPageLoaded(true);
        if (data) {
          setSelectedAnswers({});
          if (typeof data.status !== "undefined" && data.status === 202) {
            testCompleted();
          } else {
            setNewQuestion(data);
            setQuestion(deepCopy(reviewQuestion));

            checkAnswerQuestion(data.previousResponse);
            setReview(true);

            try {
              loadRecommendedVideos();
            } catch (ex) {
              console.log(ex);
            }
            getQuestionPerformance();

            return;
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Message", "Please answer the question, or try your best guess.");
    }
  };

  const loadRecommendedVideos = async () => {
    const topic = question.topic._id;
    let loadedTopic = loadedTopics;
    if (!!loadedTopic && Object.keys(loadedTopic).includes(topic)) {
      setQuestion((prev: any) => ({ ...prev, videos: loadedTopic[topic] }));
    } else {
      try {
        const { data } = await clientApi.get(
          `/api/contents/taggedWithTopic/${topic}${toQueryString({
            ...params,
            includeCount: true,
          })}`
        );
        loadedTopic[topic] = byPassSecurity(data.contents);
        question.videos = loadedTopic[topic];
        setLoadedTopics(loadedTopic);
        setVideoCount(data.count);
      } catch (error) {
        setQuestion((prev: any) => ({ ...prev, videos: [] }));
      }
    }
  };
  const testCompleted = () => {
    if (!!practice?.showFeedback) {
      alert(
        "Message",
        "<h5>You have successfully completed the Adaptive-Test.</h5>"
      );
      router.push(
        `/assessment/test-feedbacks/${question.attemptID}/${practice._id}`
      );
    } else {
      if (!practice?.isShowAttempt) {
        alert(
          "Message",
          "Thank you for attempting the test. Your result has been submitted for evaluation. Please contact publisher of the test for any questions"
        );
        router.push("/assessment/home");
      } else {
        alert(
          "Message",
          "<h5>You have successfully completed the Adaptive-Test.</h5>"
        );
        router.push(`/attempt-summary/${question.attemptID}`);
      }
    }
  };

  const checkAnswerQuestion = (attempt: any) => {
    let quest = question;
    let stat = stats;
    console.log(quest, attempt, "check>>>>>>");
    if (quest._id) {
      quest.timeEslapse = (attempt.timeEslapse / 1000).toFixed(0);
      setTimeElapse(quest.timeEslapse, "timeEslapse");
      const userAnswers = attempt.answers;
      const questionAnswers = { ...quest.answers };
      quest.userAnswers = attempt.answers;
      if (attempt.scratchPad) {
        quest.scratchPad = attempt.scratchPad;
      }
      if (quest.category === "code") {
        quest.answers = attempt.answers;

        quest.coding.forEach((c: any) => {
          if (c.language === "python") {
            c.display = "Python";
          } else if (c.language === "c") {
            c.display = "C";
          } else if (c.language === "cpp") {
            c.display = "C++";
          } else if (c.language === "java") {
            c.display = "Java";
          } else if (c.language == "ruby") {
            c.display = "Ruby";
          }

          if (!stat) {
            stat = {};
          }
          stat[c.language] = {
            compileTime: 0,
            runTime: 0,
            testcasesPassed: 0,
            totalTestcases: 0,
          };
        });
        setTimeout(() => {
          setSelectedLang(null);
        }, 100);

        if (attempt.answers.length > 0) {
          quest.answers[0].isCorrectAnswerOfUser = attempt.status === 1;
          const idx = quest.coding.findIndex(
            (x: any) => x.language === attempt.answers[0].codeLanguage
          );
          setTimeout(() => {
            setHasNoAnswer(false);
            let selectedLan = question.coding[idx];
            setSelectedLang(selectedLan);

            if (!stat[selectedLan.language]) {
              stat[selectedLan.language] = {};
            }
            // Check testcase status of student code
            if (attempt.answers[0].testcases) {
              let runTime = 0;
              var testPassed = 0;
              quest.testcases.forEach((t: any) => {
                const idx = attempt.answers[0].testcases.findIndex(
                  (test: any) => test.input == t.input && test.args == t.args
                );
                if (idx > -1) {
                  t.status = attempt.answers[0].testcases[idx].status;
                  t.studentCodeOutput =
                    attempt.answers[0].testcases[idx].output;
                  t.studentCodeOutput +=
                    attempt.answers[0].testcases[idx].error;

                  runTime += attempt.answers[0].testcases[idx].runTime;
                  testPassed += t.status ? 1 : 0;
                }
              });

              stat[selectedLan.language].compileTime =
                attempt.answers[0].compileTime;
              stat[selectedLan.language].runTime = runTime;
              stat[selectedLan.language].testcasesPassed = testPassed;
              stat[selectedLan.language].totalTestcases =
                quest.testcases.length;
            }

            stat[selectedLan.language].attempts = attempt.answers.length;
            stat[selectedLan.language].timeToSubmit = attempt.timeEslapse;
            stat[selectedLan.language].successAttempts = 0;
            stat[selectedLan.language].timeoutAttempts = 0;
            stat[selectedLan.language].errorAttempts = 0;
            stat[selectedLan.language].avgCasesPassed = 0;
            stat[selectedLan.language].avgTimeBetweenAttempts = 0;

            const answersCasesPassed = [];
            const times = [];

            for (let j = attempt.answers.length - 1; j >= 0; j--) {
              var ans = attempt.answers[j];

              times.push(ans.timeElapse);
              var hasTimeout = false;
              var hasError = false;
              if (
                ans.compileMessage === "done" ||
                ans.compileMessage == "Compiled Successfully"
              ) {
                stat[selectedLan.language].successAttempts++;
                var testPassed = 0;
                quest.testcases.forEach((t: any) => {
                  const tInput = quest.hasUserInput ? t.input : "";
                  const tArgs = quest.hasArgs ? t.args : "";

                  const idx = ans.testcases.findIndex(
                    (test: any) => test.input == tInput && test.args == tArgs
                  );
                  if (idx > -1) {
                    testPassed += ans.testcases[idx].status ? 1 : 0;
                    if (!testPassed) {
                      if (ans.testcases[idx].error) {
                        if (ans.testcases[idx].error == "Timed out") {
                          hasTimeout = true;
                        } else {
                          hasError = true;
                        }
                      }
                    }
                  }
                });

                answersCasesPassed.push(testPassed / question.testcases.length);
              }

              if (hasTimeout) {
                stat[selectedLan.language].timeoutAttempts++;
              } else if (hasError) {
                stat[selectedLan.language].errorAttempts++;
              }
            }

            // round to 1 decimal place
            stat[selectedLan.language].avgCasesPassed =
              !answersCasesPassed.length
                ? 0
                : Math.round(
                    (answersCasesPassed.reduce((a1, a2) => {
                      return a1 + a2;
                    }, 0) /
                      answersCasesPassed.length) *
                      1000
                  ) / 10;

            stat[selectedLan.language].avgTimeBetweenAttempts = !times.length
              ? 0
              : Math.round(
                  times.reduce((t1, t2) => {
                    return t1 + t2;
                  }, 0) / times.length
                );
          }, 200);
        } else {
          setTimeout(() => {
            setSelectedLang(quest.coding[0]);
          }, 200);
        }
      } else if (quest.category === "mcq" || quest.category === "fib") {
        // tslint:disable-next-line: forin
        for (const k in questionAnswers) {
          for (const j in userAnswers) {
            if (userAnswers[j].answerId) {
              if (userAnswers[j].answerId === questionAnswers[k]._id) {
                if (quest.category === "fib") {
                  if (attempt.status === 1) {
                    quest.answers[k].isCorrectAnswerOfUser = true;
                    quest.isUserAnsweredCorrect = true;
                  } else {
                    quest.answers[k].isCorrectAnswerOfUser = false;
                    quest.isUserAnsweredCorrect = false;
                  }
                } else {
                  questionAnswers[k].isCheckedByUser = true;
                  if (!questionAnswers[k].isCorrectAnswer) {
                    quest.answers[k].isCorrectAnswerOfUser = false;
                  }
                }
              }
            } else {
              if (userAnswers[j] === questionAnswers[k]._id) {
                questionAnswers[k].isCheckedByUser = true;
                if (!questionAnswers[k].isCorrectAnswer) {
                  quest.answers[k].isCorrectAnswerOfUser = false;
                }
              }
            }
          }
        }
      } else if (quest.category == "mixmatch") {
        quest.isUserAnsweredCorrect = true;
        for (const actualA of quest.answers) {
          actualA.isCorrectAnswerOfUser = false;
          for (const userA of userAnswers) {
            if (actualA.answerText == userA.answerText) {
              actualA.userText = userA.userText;
              if (actualA.correctMatch == userA.userText) {
                actualA.isCorrectAnswerOfUser = true;
              }
              break;
            }
          }
          quest.isUserAnsweredCorrect &&= actualA.isCorrectAnswerOfUser;
        }
      }
    }
    setStats(stat);
    setQuestion(quest);
  };

  const saveMixMatchAnswers = () => {};

  const loadMoreVideos = async () => {
    setParams((prev: any) => ({ ...prev, page: prev.page + 1 }));
    const payload = { ...params, page: params.page + 1 };
    const topic = question?.topic._id;
    let loadedTopic = loadedTopics;
    try {
      const { data } = await clientApi.get(
        `/api/contents/taggedWithTopic/${topic}${toQueryString(payload)}`
      );
      loadedTopic[topic] = byPassSecurity(data.contents);
      setQuestion((prev: any) => ({
        ...prev,
        videos: prev.videos.concat(loadedTopics[topic]),
      }));
      setLoadedTopics(loadedTopic);
    } catch (error) {
      setQuestion((prev: any) => ({ ...prev, videos: [] }));
    }
  };

  const byPassSecurity = (items: any) => {
    return items.map((item: any) => {
      let e = item;
      if (e.url) {
        e.url = embedVideo(item.url);
      } else {
        e.local = true;
        e.url = embedVideo(
          getElearningFullPath(clientData.baseUrl, item.filePath)
        );
      }
      return e;
    });
  };

  const questionChange = async (que?: any) => {
    if (!que) {
      que = question;
    }
    setTimeElapse(0);
    if (que) {
      if (que?._id) {
        try {
          const { data } = await clientApi.get(
            `/api/questions/personalTopicAnalysis/${que?._id}`
          );
          setTopicAnalysis(data);
        } catch (error) {
          console.error("topic-anlysis: ", error);
          setTopicAnalysis(null);
        }

        if (que?.category == "mcq") {
          setQuestion((prev: any) => ({
            ...prev,
            correctAnswerCount: prev.answers.filter(
              (a: any) => a.isCorrectAnswer
            ).length,
          }));
        }
        console.log(que, "que");
        setTimeElapse(que.timeEslapse || 0);
      }
    } else {
      // fullscreen = false
    }
  };
  const getNextQuestion = () => {
    const currPage = currentPage + 1;
    params.page = 1;
    localStorage.setItem(
      question?.attemptID + "_currPage",
      currPage.toString()
    );
    setCurrentPage(currPage);
    setReviewQuestion(
      Object.keys(newQuestion).length ? deepCopy(newQuestion) : newQuestion
    );
    if (newQuestion) {
      setReview(false);
      setAnswers([]);
      setQStartTime(new Date().getTime());
      setSelectedAnswers({});
      setQuestion(newQuestion);
      questionChange();

      setPauseTimer(false);
      // ref.current.start();
      // ref1.current.start();
    }
  };

  const rendertime = (value: number) => {
    if (value === 0) {
      // if (timerStarted) finishTest();
    } else {
      const hours = Math.floor(value / 60 / 60);
      const minutes = Math.floor((value / 60) % 60);
      const seconds = Math.floor(value % 60);
      return (
        <span>{`${hours ? (hours > 9 ? hours : "0" + hours + ":") : ""}${
          minutes > 9 ? minutes : "0" + minutes
        }:${seconds > 9 ? seconds : "0" + seconds}`}</span>
      );
    }
  };

  return (
    <>
      <LoadingOverlay
        active={!pageLoaded}
        spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
        styles={{
          overlay: (base) => ({
            ...base,
            height: "100vh",
          }),
        }}
      >
        <div className="adaptive-question-header">
          <div className="container">
            <div className="navbar navbar-expand-lg navbar-light p-0 form-row d-flex">
              <div className="col-lg-6">
                <div className="p-0 m-0">
                  <div className="d-flex align-items-lg-center">
                    <figure className="user_img_circled_wrap col-auto px-0">
                      <div
                        className="avatar"
                        style={{
                          backgroundImage: user?.avatar?.fileUrl
                            ? "url(" +
                              "https://www.practiz.xyz" +
                              user.avatar?.fileUrl +
                              ")"
                            : 'url("/assets/images/defaultProfile.png")',
                        }}
                      ></div>
                    </figure>
                    <h4 className="ml-2 text-capitalize f-16">{user?.name}</h4>
                  </div>
                </div>
              </div>

              <div className="assesment-name d-lg-block d-none">
                <span>{practice.title}</span>
              </div>

              <div className="col-auto ml-auto">
                <div className="d-flex justify-content-end align-items-start gap-xs">
                  {!clockHidden && (
                    <div className="timer d-none d-lg-block">
                      <strong className="text-center">Time Remaining</strong>

                      <div className="timer-clock text-center wh-100">
                        {rendertime(leftTime)}
                        {/* <countdown #timer [config]="timerConfig" (event)="onNotifyTimer($event)"></countdown> */}
                      </div>
                    </div>
                  )}
                  {clockHidden && (
                    <div
                      className="text-center mt-1"
                      style={{ height: "35px" }}
                    >
                      <i className="far fa-clock fa-2x"></i>
                    </div>
                  )}
                  <button
                    className="btn btn-outline btn-sm bg-whilte border-dark text-dark rounded mt-1"
                    onClick={() => {
                      setClockHidden(!clockHidden);
                    }}
                    style={{ width: "65px" }}
                  >
                    {clockHidden ? "Show" : "Hide"}
                  </button>
                  <div className="btn btn-success">
                    <a
                      className="text-center text-white px-2"
                      onClick={finishTest}
                    >
                      Finish
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="timer d-block d-lg-none mt-3">
            <h6 className="text-center">Time Remaining</h6>
            <div className="timer-clock text-center">
            </div>
          </div> */}
          </div>
        </div>

        <div className="adaptive-question">
          <div className="container">
            <div className="adaptive-question-area mx-auto mw-100">
              <div className="heading">
                <div className="row">
                  <div className="col-6">
                    <div className="d-flex">
                      <ul className="nav info pl-0 mb-3">
                        <li className="p-0">Question</li>
                        <li className="count text-white clearfix">
                          <span>{currentPage}</span>
                          <span> / </span>
                          <span>{practice?.totalQuestion}</span>
                        </li>
                      </ul>
                      <a
                        onClick={reportIssue}
                        className="mt-1 mx-3 text-danger"
                      >
                        <i
                          className={`fa-flag ${
                            questionReported ? "fas" : "far"
                          }`}
                        ></i>
                      </a>
                      {!!onlineTeachers.length ? (
                        <div className="btn-group">
                          <a
                            type="button"
                            className="dropdown-toggle mt-1"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            Need help?
                          </a>
                          <div className="dropdown-menu">
                            {onlineTeachers.map((teacher: any) => (
                              <a
                                className="dropdown-item"
                                key={teacher.name}
                                onClick={() => chat(teacher)}
                              >
                                {teacher.isOnline ? (
                                  <i
                                    className="fa fa-circle mr-1 text-success"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <></>
                                )}
                                {teacher.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}

                      {user.primaryInstitute?.preferences?.assessment
                        .overrunNotification &&
                        avgTimeSpent > 0 &&
                        timeElapse > avgTimeSpent && (
                          <div className="animate-float-left">
                            <img
                              src="/assets/images/turtle.png"
                              style={{ width: "35px" }}
                              title="Average Time Overrun"
                            />
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="col-6 d-flex justify-content-end">
                    <div className="d-inline-block brush">
                      <button
                        id="popoverBrush"
                        className="btn p-0"
                        type="button"
                        onClick={() => setShowSketch(!showSketch)}
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Brush"
                      >
                        <figure>
                          <img
                            src={
                              !showSketch
                                ? "/assets/images/eva_brush-fill.png"
                                : "/assets/images/eva_brush-fill-active.png"
                            }
                            alt=""
                          />
                        </figure>
                      </button>
                    </div>
                    {question?.category !== "code" ? (
                      <div className="d-inline-block cal pl-3">
                        <button
                          id="popoverCal"
                          className="btn p-0"
                          type="button"
                          onClick={() =>
                            setShowCalculateModal(!showCalculateModal)
                          }
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Calculator"
                        >
                          <figure>
                            <img
                              src={
                                !showCalculateModal
                                  ? "/assets/images/icon-cal.png"
                                  : "/assets/images/icon-cal-active.png"
                              }
                              alt=""
                            />
                          </figure>
                        </button>
                      </div>
                    ) : (
                      <></>
                    )}

                    <div className="d-none d-lg-inline-block pl-3">
                      <div className="difficulty ml-auto">
                        <div className="d-flex">
                          <span>Difficult</span>
                          <ul className="nav">
                            <li className="active"></li>
                            <li
                              className={
                                question?.complexity === "moderate" ||
                                question?.complexity === "hard"
                                  ? "active"
                                  : ""
                              }
                            ></li>
                            <li
                              className={
                                question?.complexity === "hard" ? "active" : ""
                              }
                            ></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {!review ? (
                <>
                  <div className="adaptive-question-box bg-white p-1">
                    {question?.questionHeader ||
                    (question?.category == "mcq" &&
                      question?.questionType == "multiple") ? (
                      <div className="question-header">
                        <span>
                          <div>
                            <MathJax
                              value={formatQuestion(
                                clientData?.baseUrl,
                                question?.questionHeader
                              )}
                            />
                            {question?.category == "mcq" &&
                            question?.questionType == "multiple" ? (
                              <p className="text-success">
                                ({numberToWord(question?.correctAnswerCount)}{" "}
                                Correct Answers)
                              </p>
                            ) : (
                              <></>
                            )}
                            <hr />
                          </div>
                        </span>
                      </div>
                    ) : (
                      <></>
                    )}
                    {question?.category === "mcq" ? (
                      <McqQuestion
                        question={question}
                        setQuestion={setQuestion}
                        answerChanged={selectAnswer}
                        answerText={useranswer[currentPage - 1]}
                      />
                    ) : (
                      <></>
                    )}
                    {question?.category === "fib" ? (
                      <FibQuestion
                        question={question}
                        setQuestion={setQuestion}
                        inputChanged={onFibTextChange}
                      />
                    ) : (
                      <></>
                    )}

                    {question?.category === "descriptive" ? (
                      <Descriptive
                        question={question}
                        practice={practice}
                        answerChanged={onDescriptiveUpdate}
                      />
                    ) : (
                      <></>
                    )}
                    {question?.category === "code" ? (
                      <div className="mb-3">
                        <CodingQuestion
                          question={question}
                          userAnswers={answers}
                          setQuestion={setQuestion}
                          practice={practice}
                          answerChanged={onCodeUpdate}
                          hideRunButton={true}
                        />
                        {codingQuestion?.stats[
                          question?.userCode.selectedLang.language
                        ].show ? (
                          <div className="clearfix d-lg-block rounded-boxes bg-light">
                            <div id="result">
                              <div
                                className={`result-board bg-white ${
                                  codingQuestion?.stats[
                                    question?.userCode.selectedLang.language
                                  ].correct
                                    ? "correct"
                                    : ""
                                }`}
                              >
                                <div className="result-board-title">
                                  <h4>
                                    Result:
                                    {codingQuestion?.stats[
                                      question?.userCode.selectedLang.language
                                    ].testcasesPassed !=
                                    codingQuestion?.stats[
                                      question?.userCode.selectedLang.language
                                    ].totalTestcases ? (
                                      <span> Wrong Answer</span>
                                    ) : (
                                      <></>
                                    )}
                                  </h4>
                                </div>

                                <div className="result-board-wrap">
                                  <div className="row">
                                    <div className="col-lg-4">
                                      <div className="result-info">
                                        <h5>Time (sec)</h5>
                                        <span>
                                          {codingQuestion?.stats[
                                            question?.userCode.selectedLang
                                              .language
                                          ].runTime / 1000}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="col-lg-4">
                                      <div className="result-info">
                                        <h5>Language</h5>
                                        <span>
                                          {codeLanguageDisplay(
                                            question?.userCode.selectedLang
                                              .language
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="col-lg-4">
                                      <div className="result-info">
                                        <h5>Passed Test Cases</h5>
                                        <span>
                                          {
                                            codingQuestion?.stats[
                                              question?.userCode.selectedLang
                                                .language
                                            ].testcasesPassed
                                          }{" "}
                                          out of{" "}
                                          {
                                            codingQuestion?.stats[
                                              question?.userCode.selectedLang
                                                .language
                                            ].totalTestcases
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {codingQuestion?.stats[
                                question?.userCode.selectedLang.language
                              ].compileError ? (
                                <div className="output compile-error">
                                  <div className="output-info">
                                    <h4>Compilation error</h4>
                                    <p className="pre-wrap">
                                      {
                                        codingQuestion?.stats[
                                          question?.userCode.selectedLang
                                            .language
                                        ].compileError
                                      }
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <></>
                              )}
                              {!codingQuestion?.stats[
                                question?.userCode.selectedLang.language
                              ].compileError ? (
                                <div className="output">
                                  <div
                                    className={`output-info ${
                                      codingQuestion?.stats[
                                        question?.userCode.selectedLang.language
                                      ].correct
                                        ? "correct"
                                        : ""
                                    }`}
                                  >
                                    <h4>Your Code’s Output</h4>
                                    {codingQuestion?.stats[
                                      question?.userCode.selectedLang.language
                                    ].testcaseToDisplay.output ? (
                                      <p className="pre-wrap">
                                        {
                                          codingQuestion?.stats[
                                            question?.userCode.selectedLang
                                              .language
                                          ].testcaseToDisplay.output
                                        }
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                    {codingQuestion?.stats[
                                      question?.userCode.selectedLang.language
                                    ].testcaseToDisplay.error ? (
                                      <p className="pre-wrap">
                                        {
                                          codingQuestion?.stats[
                                            question?.userCode.selectedLang
                                              .language
                                          ].testcaseToDisplay.error
                                        }
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                    {!codingQuestion?.stats[
                                      question?.userCode.selectedLang.language
                                    ].testcaseToDisplay.output &&
                                    !codingQuestion?.stats[
                                      question?.userCode.selectedLang.language
                                    ].testcaseToDisplay.error ? (
                                      <p>
                                        Your code didn&apos;t print anything.
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                  </div>

                                  <div
                                    className={`output-info ${
                                      codingQuestion?.stats[
                                        question?.userCode.selectedLang.language
                                      ].correct
                                        ? "correct"
                                        : ""
                                    }`}
                                  >
                                    <h4>Expected Output</h4>

                                    <p className="pre-wrap">
                                      {
                                        codingQuestion?.stats[
                                          question?.userCode.selectedLang
                                            .language
                                        ].testcaseToDisplay.expected
                                      }
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    ) : (
                      <></>
                    )}
                    {question?.category === "mixmatch" ? (
                      <MixmatchQuestion
                        question={question}
                        clientData={clientData}
                        answerChanged={saveMixMatchAnswers}
                      />
                    ) : (
                      <></>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-lg-8 question-details">
                      <div className="d-inline-block mr-2">
                        <strong>Subject:</strong> {question?.subject?.name}
                      </div>
                      <div className="d-inline-block mr-2">
                        <strong>Unit:</strong> {question?.unit?.name}
                      </div>
                      <div className="d-inline-block mr-2">
                        <strong>Topic:</strong> {question?.topic?.name}
                      </div>
                      {!!topicAnalysis ? (
                        <div className="d-inline-block mr-2">
                          Your accuracy for this topic:{" "}
                          {topicAnalysis?.accuracy}%
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

                    <div className="col-4 text-right">
                      {question?.category == "code" ? (
                        <button
                          className="btn btn-danger mr-2"
                          onClick={codingQuestion?.executeCode(question)}
                        >
                          Run Code
                        </button>
                      ) : (
                        <></>
                      )}

                      <div className="d-none d-lg-inline-block">
                        <div className="save-next-btn-remove ml-auto">
                          <a
                            className="btn btn-primary"
                            onClick={() => nextQuestion()}
                          >
                            Save & Next
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-block d-lg-none fixed-bottom">
                    <div className="save-next-btn">
                      <a
                        className="text-center px-2 text-white"
                        onClick={() => nextQuestion()}
                      >
                        Save & Next
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="adaptive-question-box bg-white ans">
                    {question?.questionHeader || question?.category != "fib" ? (
                      <div className="adaptive-question-item span-black">
                        {question?.questionHeader ? (
                          <div className="question-header">
                            <MathJax
                              value={formatQuestion(
                                clientData?.baseUrl,
                                question?.questionHeader
                              )}
                            />

                            <hr />
                          </div>
                        ) : (
                          <></>
                        )}
                        {question?.category != "fib" ? (
                          <div className="question-item mb-3">
                            <MathJax
                              value={formatQuestion(
                                clientData?.baseUrl,
                                question?.questionText
                              )}
                            />
                            {question?.audioFiles?.length ? (
                              <div className="row">
                                {question?.audioFiles.map(
                                  (audio: any, index: number) => (
                                    <div
                                      className="position-relative my-2 col-lg-6 col-12"
                                      key={index}
                                    >
                                      <label>{audio?.name}</label>
                                      <audio
                                        controls
                                        src={audio?.url}
                                        className="w-100"
                                      ></audio>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    ) : (
                      <></>
                    )}
                    {question?.category === "mcq" ? (
                      <div className="question-answers">
                        {question?.answers.map((answer: any, index: number) => (
                          <div className="mb-2" key={answer._id}>
                            <div className="row">
                              <label
                                className={`col-auto my-0
                              ${
                                !!answer.isCorrectAnswer &&
                                answer.isCorrectAnswerOfUser !== false
                                  ? "green"
                                  : ""
                              } ${
                                  answer.isCorrectAnswerOfUser === false
                                    ? "red"
                                    : ""
                                }`}
                              >
                                <input
                                  disabled
                                  name={`answer_${index}`}
                                  type="checkbox"
                                  aria-label="adaptive_learning_mcqOptions"
                                  value={answer.isCheckedByUser}
                                />
                                <span className="checkmark"></span>
                              </label>

                              <span className="col answer-text">
                                <MathJax value={answer.answerText} />
                              </span>
                            </div>
                            {answer.audioFiles?.length ? (
                              <div className="row">
                                {answer.audioFiles.map(
                                  (audio: any, i: number) => (
                                    <div
                                      className="position-relative my-2 col-lg-6 col-12"
                                      key={i}
                                    >
                                      <label>{audio.name}</label>
                                      <audio
                                        controls
                                        src={audio.url}
                                        className="w-100"
                                      ></audio>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <></>
                    )}
                    {question?.category === "fib" ? (
                      <>
                        <i
                          className={`float-right ${
                            question?.isUserAnsweredCorrect
                              ? "fas fa-check text-info"
                              : "far fa-dot-circle text-danger"
                          }`}
                        ></i>
                        {!question?.isUserAnsweredCorrect ? (
                          <MathJax
                            value={replaceUserAnswer(question, "review")}
                          />
                        ) : (
                          <MathJax
                            value={replaceQuestionText(question, "", true)}
                          />
                        )}
                        {question?.audioFiles?.length ? (
                          <div className="row">
                            {question?.audioFiles.map(
                              (audio: any, index: number) => (
                                <div
                                  className="position-relative my-2 col-lg-6 col-12"
                                  key={index}
                                >
                                  <label>{audio.name}</label>
                                  <audio
                                    controls
                                    src={audio.url}
                                    className="w-100"
                                  ></audio>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                    {question?.category === "descriptive" ? (
                      <div className="exp mb-3">
                        <h5>Your answer:</h5>
                        <div
                          style={{
                            border: "solid 1px transparent",
                            padding: "5px",
                            background: "white",
                            borderRadius: "8px",
                          }}
                        >
                          {question?.userAnswers[0].answerText ? (
                            <MathJax
                              value={formatQuestion(
                                clientData?.baseUrl,
                                question?.userAnswers[0].answerText
                              )}
                            />
                          ) : (
                            <></>
                          )}
                          {question?.userAnswers[0].attachments ? (
                            <div className="row">
                              {question?.userAnswers[0].attachments.map(
                                (att: any, index: number) => (
                                  <div key={index} className="col-sm-3">
                                    {att.type == "image" ? (
                                      <a href={att.ur} target="_system">
                                        <img
                                          src={att.url}
                                          style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                          }}
                                          alt=""
                                        />
                                      </a>
                                    ) : (
                                      <></>
                                    )}
                                    {att.type == "file" ? (
                                      <a
                                        href={att.url}
                                        target="_system"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {att.name}
                                      </a>
                                    ) : (
                                      <></>
                                    )}
                                    {att.type == "audio" ? (
                                      <audio
                                        controls
                                        className="w-100"
                                        src={att.url}
                                      ></audio>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    {question?.category === "code" ? (
                      <>
                        <div className="rounded-boxes bg-light">
                          <div className="clearfix">
                            <h5 className="pull-left">Student Code</h5>
                            <div
                              className="pull-right"
                              style={{ margin: "10px 0px" }}
                            >
                              <i
                                className="fa fa-check pull-right text-info"
                                hidden={
                                  !question?.answers[0].isCorrectAnswerOfUser
                                }
                              ></i>
                              <i
                                className="fa fa-dot-circle-o pull-right text-danger"
                                hidden={
                                  question?.answers[0].isCorrectAnswerOfUser
                                }
                              ></i>
                            </div>
                          </div>
                          <CodeMirror value={question?.answers[0].code} />
                          <div className="rounded-boxes bg-light">
                            <Tabs>
                              <Tab title="Output" key="output">
                                {!hasNoAnswer ? (
                                  <>
                                    <div>
                                      <label>Compile Message</label>
                                    </div>
                                    <div>
                                      <textarea
                                        value={
                                          question?.answers[0].compileMessage
                                        }
                                        readOnly
                                        style={{
                                          width: "100%",
                                          resize: "none",
                                          height: "75px",
                                        }}
                                      ></textarea>
                                    </div>
                                    {question?.answers[0].userInput ||
                                    question?.answers[0].userArgs ? (
                                      <div>
                                        <div>
                                          <label>Your Args</label>
                                          <textarea
                                            readOnly
                                            value={
                                              question?.answers[0].userArgs
                                            }
                                            style={{
                                              resize: "none",
                                              height: "auto",
                                              maxHeight: "75px",
                                              width: "100%",
                                              color: "black",
                                              padding: "2px 5px",
                                            }}
                                          ></textarea>
                                        </div>
                                        {question?.hasUserInput ? (
                                          <>
                                            <div>
                                              <label>Your Input</label>
                                            </div>
                                            <div>
                                              <textarea
                                                readOnly
                                                value={
                                                  question?.answers[0].userInput
                                                }
                                                style={{
                                                  resize: "none",
                                                  height: "auto",
                                                  maxHeight: "75px",
                                                  width: "100%",
                                                  color: "black",
                                                  padding: "2px 5px",
                                                }}
                                              ></textarea>
                                            </div>
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                        <div>
                                          <label>Your Output</label>
                                        </div>
                                        <div>
                                          <textarea
                                            value={question?.answers[0].output}
                                            style={{
                                              resize: "none",
                                              height: "auto",
                                              maxHeight: "75px",
                                              width: "100%",
                                              color: "black",
                                            }}
                                            readOnly
                                          ></textarea>
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}

                                <div className="rounded-boxes bg-light">
                                  <div className="clearfix">
                                    <h5 className="pull-left">Solutions</h5>

                                    <select
                                      className="pull-right"
                                      name="language"
                                      value={selectedLang}
                                    >
                                      {question?.coding.map(
                                        (lang: any, index: number) => (
                                          <option value={lang} key={index}>
                                            {lang.display}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  <CodeMirror value={selectedLang.solution} />
                                  {/* <ngx-codemirror #code_source
                                                [(ngModel)]="selectedLang.solution"
                                                [options]="codemirrorConfig"></ngx-codemirror> */}
                                </div>
                              </Tab>
                              <Tab title="Stats" key="stats">
                                {selectedLang?.language == "cpp" ||
                                selectedLang?.language == "c" ||
                                selectedLang?.language == "java" ? (
                                  <div className="row">
                                    <div className="col-sm-6">
                                      <span>Time taken to compile (ms)</span>
                                    </div>
                                    <div className="col-sm-6 text-right">
                                      <span>
                                        {
                                          stats[selectedLang?.language]
                                            .compileTime
                                        }
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                <div className="row">
                                  <div className="col-sm-6">
                                    <span>Time taken to run (ms)</span>
                                  </div>
                                  <div className="col-sm-6 text-right">
                                    <span>
                                      {stats[selectedLang?.language].runTime}
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-6">
                                    <span>Number of test cases passed</span>
                                  </div>
                                  <div className="col-sm-6 text-right">
                                    <span>
                                      {
                                        stats[selectedLang?.language]
                                          .testcasesPassed
                                      }
                                      /
                                      {
                                        stats[selectedLang?.language]
                                          .totalTestcases
                                      }
                                    </span>
                                  </div>
                                </div>
                                <h4>Execution Statistics</h4>
                                <div className="row">
                                  <div className="col-sm-9">
                                    <span>Time taken to submit</span>
                                  </div>
                                  <div className="col-sm-3 text-right">
                                    <span>
                                      {
                                        stats[selectedLang?.language]
                                          .timeToSubmit
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-9">
                                    <span>
                                      Number of compiles attempts made
                                    </span>
                                  </div>
                                  <div className="col-sm-3 text-right">
                                    <span>
                                      {stats[selectedLang?.language].attempts}
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-9">
                                    <span>
                                      Number of compilation attempts witnessing
                                      a successful compile
                                    </span>
                                  </div>
                                  <div className="col-sm-3 text-right">
                                    <span>
                                      {
                                        stats[selectedLang?.language]
                                          .successAttempts
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-9">
                                    <span>
                                      Number of compile attempts witnessing a
                                      time-out
                                    </span>
                                  </div>
                                  <div className="col-sm-3 text-right">
                                    <span>
                                      {
                                        stats[selectedLang?.language]
                                          .timeoutAttempts
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-9">
                                    <span>
                                      Number of compile attempts witnessing a
                                      runtime errors
                                    </span>
                                  </div>
                                  <div className="col-sm-3 text-right">
                                    <span>
                                      {
                                        stats[selectedLang?.language]
                                          .errorAttempts
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-9">
                                    <span>
                                      Avg. no. of cases passed in each compile
                                    </span>
                                  </div>
                                  <div className="col-sm-3 text-right">
                                    <span>
                                      {
                                        stats[selectedLang?.language]
                                          .avgCasesPassed
                                      }
                                      %
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-9">
                                    <span>
                                      Avg. time taken between each compile
                                    </span>
                                  </div>
                                  <div className="col-sm-3 text-right">
                                    <span>
                                      {
                                        stats[selectedLang?.language]
                                          .avgTimeBetweenAttempts
                                      }
                                    </span>
                                  </div>
                                </div>
                              </Tab>
                              <Tab title="Test Cases" key="test-cases">
                                {selectedLang?.testcases.map(
                                  (testcase: any, index: number) => (
                                    <div key={index}>
                                      <div
                                        style={{
                                          display: "table",
                                          width: "100%",
                                          padding: "10px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "table",
                                            width: "100%",
                                          }}
                                        >
                                          <div
                                            style={{ display: "table-row" }}
                                            className="code-display"
                                          >
                                            <div
                                              style={{
                                                display: "table-cell",
                                                width: "1%",
                                                padding: "10px",
                                                verticalAlign: "top",
                                              }}
                                            >
                                              Argument
                                            </div>
                                            <div
                                              style={{ display: "table-cell" }}
                                            >
                                              <textarea
                                                value={testcase.args}
                                                readOnly
                                                style={{
                                                  resize: "none",
                                                  height: "auto",
                                                  width: "100%",
                                                  color: "black",
                                                  padding: "2px 5px",
                                                }}
                                              ></textarea>
                                            </div>
                                            {question?.hasUserInput ? (
                                              <>
                                                <div
                                                  style={{
                                                    display: "table-cell",
                                                    width: "1%",
                                                    padding: "10px",
                                                    verticalAlign: "top",
                                                  }}
                                                >
                                                  Input
                                                </div>
                                                <div
                                                  style={{
                                                    display: "table-cell",
                                                  }}
                                                >
                                                  <textarea
                                                    value={testcase.input}
                                                    readOnly
                                                    style={{
                                                      resize: "none",
                                                      height: "auto",
                                                      width: "100%",
                                                      color: "black",
                                                      padding: "2px 5px",
                                                    }}
                                                  ></textarea>
                                                </div>
                                              </>
                                            ) : (
                                              <></>
                                            )}
                                            <div
                                              style={{
                                                display: "table-cell",
                                                width: "1%",
                                                whiteSpace: "nowrap",
                                                padding: "10px",
                                                verticalAlign: "top",
                                                textAlign: "right",
                                              }}
                                            >
                                              Expected output
                                            </div>
                                            <div
                                              style={{
                                                display: "table-cell",
                                                verticalAlign: "top",
                                              }}
                                            >
                                              <textarea
                                                value={testcase.output}
                                                style={{
                                                  resize: "none",
                                                  height: "auto",
                                                  maxHeight: "75px",
                                                  width: "100%",
                                                  color: "black",
                                                  padding: "2px 5px",
                                                }}
                                                readOnly
                                              ></textarea>
                                            </div>
                                            <div
                                              style={{
                                                display: "table-cell",
                                                width: "1%",
                                                whiteSpace: "nowrap",
                                                padding: "10px",
                                                verticalAlign: "top",
                                              }}
                                            >
                                              {testcase.status ? (
                                                <i className="fa fa-check pull-right text-info"></i>
                                              ) : (
                                                <i className="fa fa-dot-circle-o pull-right text-danger"></i>
                                              )}
                                            </div>
                                          </div>
                                          {!testcase.status &&
                                          testcase.studentCodeOutput ? (
                                            <div
                                              style={{ display: "table-row" }}
                                              className="code-display"
                                            >
                                              <div
                                                style={{
                                                  display: "table-cell",
                                                  width: "1%",
                                                }}
                                              ></div>
                                              <div
                                                style={{
                                                  display: "table-cell",
                                                }}
                                              ></div>
                                              {question?.hasUserInput ? (
                                                <>
                                                  <div
                                                    style={{
                                                      display: "table-cell",
                                                      width: "1%",
                                                    }}
                                                  ></div>
                                                  <div
                                                    style={{
                                                      display: "table-cell",
                                                    }}
                                                  ></div>
                                                </>
                                              ) : (
                                                <></>
                                              )}
                                              <div
                                                style={{
                                                  display: "table-cell",
                                                  width: "1%",
                                                  whiteSpace: "nowrap",
                                                  padding: "10px",
                                                  verticalAlign: "top",
                                                  textAlign: "right",
                                                }}
                                              >
                                                Your output
                                              </div>
                                              <div
                                                style={{
                                                  display: "table-cell",
                                                  padding: "10px",
                                                }}
                                              >
                                                <div
                                                  className="preserve-newline"
                                                  style={{ color: "red" }}
                                                >
                                                  {testcase.studentCodeOutput}
                                                </div>
                                              </div>
                                              <div
                                                style={{
                                                  display: "table-cell",
                                                  width: "1%",
                                                  whiteSpace: "nowrap",
                                                  padding: "10px",
                                                  verticalAlign: "top",
                                                }}
                                              ></div>
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </Tab>
                            </Tabs>
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                    {question?.category === "mixmatch" ? (
                      <div className="selection-wrap mx-4">
                        <div className="mix-match d-flex">
                          <div className="mix-match-content d-flex">
                            <div className="mix-match-content-inner">
                              {question?.answers.map(
                                (ans: any, index: number) => (
                                  <div className="mix-match-drag" key={index}>
                                    <MathJax value={ans.answerText} />
                                  </div>
                                )
                              )}
                            </div>

                            <div className="line-wrap">
                              {question?.answers.map(
                                (ans: any, index: number) => (
                                  <div className="line" key={index}></div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="mix-match-drop-wrap">
                            {question?.answers.map((a: any, index: number) => (
                              <div
                                className="mix-match-drop border-0 bg-white"
                                key={index}
                              >
                                <MathJax value={a.userText} />
                                <div
                                  className="pull-right"
                                  style={{ margin: "10px 0px" }}
                                >
                                  {a.isCorrectAnswerOfUser ? (
                                    <i className="fas fa-check pull-right text-info"></i>
                                  ) : (
                                    <i className="far fa-dot-circle pull-right text-danger"></i>
                                  )}
                                </div>
                                <MathJax value={a.correctMatch} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  {!!question?.videos?.length ? (
                    <div className="vedio-section mt-3 mb-2">
                      <div className="vedio-section-box">
                        <div className="vedio-name">
                          <h3>Recommended Learning</h3>
                        </div>
                        <div className="vedio-body">
                          <div className="row">
                            {question?.videos.map(
                              (video: any, index: number) => (
                                <div
                                  className="col-sm-12 col-md-6 col-lg-4"
                                  key={index}
                                >
                                  <div className="vedio-cart">
                                    <div className="image">
                                      {video.local ? (
                                        <video
                                          className="w-100"
                                          height="180"
                                          controls
                                          autoPlay={false}
                                        >
                                          <source src={video.url} />
                                        </video>
                                      ) : (
                                        <iframe
                                          className="w-100"
                                          height="180"
                                          src={video.url}
                                          style={{ border: "none" }}
                                        ></iframe>
                                      )}
                                    </div>
                                    <div className="content-box">
                                      <h4
                                        data-toggle="tooltip"
                                        title={video.title}
                                        className="recommendedTitle_new text-truncate"
                                      >
                                        {video.title}
                                      </h4>
                                      <p>{video.summary}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        {question?.videos &&
                        question?.videos.length < videoCount ? (
                          <div className="text-center">
                            <a
                              className="btn btn-light"
                              onClick={() => loadMoreVideos()}
                            >
                              Load More
                            </a>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  {question?.answerExplain ? (
                    <div className="vedio-section mt-2 mb-2">
                      <div className="vedio-section-box">
                        <div className="vedio-name">
                          <h3>Explanation:</h3>
                        </div>
                        <div className="vedio-body exp pt-2">
                          <MathJax value={question?.answerExplain} />
                          {question?.answerExplainAudioFiles?.length ? (
                            <div className="row">
                              {question?.answerExplainAudioFiles.map(
                                (audio: any, i: number) => (
                                  <div
                                    className="position-relative my-2 col-lg-6 col-12"
                                    key={audio.name + i}
                                  >
                                    <label>{audio.name}</label>
                                    <audio
                                      controls
                                      src={audio.url}
                                      className="w-100"
                                    ></audio>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="row">
                    <div className="col-sm-6 col-12 question-details">
                      {!!performance ? (
                        <div className="dropdown text">
                          <a href="#">
                            <span>
                              <Numeral
                                value={performance}
                                className="p-0"
                                format={"0,0"}
                              />
                              % of students got this right
                            </span>
                          </a>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

                    {currentPage < practice?.totalQuestion && (
                      <div className="col-6">
                        <div className="d-none d-lg-block">
                          <div className="save-next-btn-remove ml-auto text-right">
                            <a
                              className="btn btn-primary"
                              onClick={() => getNextQuestion()}
                            >
                              Next
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {currentPage < practice?.totalQuestion && (
                    <div className="save-next-btn d-block d-lg-none fixed-bottom">
                      <a
                        className="text-center px-2 text-white"
                        onClick={() => getNextQuestion()}
                      >
                        Next
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {showFeedback && (
          <QuestionFeedback
            show={showFeedback}
            practiceId={practice._id}
            teacherId={practice.user._id}
            attemptId={question.attemptId}
            questionId={question._id}
            userId={user?.info._id}
            onClose={() => setShowFeedback(false)}
          />
        )}
        {showCalculateModal && (
          <CalculatorModal
            show={showCalculateModal}
            onClose={() => setShowCalculateModal(false)}
          />
        )}
      </LoadingOverlay>
      <Modal
        show={showReportModal}
        onHide={() => {
          setShowReportModal(false);
        }}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div className="modal-header border-0">
          <h5>
            What’s <span className="text-danger">wrong</span> with this
            question?
          </h5>
        </div>

        <div>
          <div className="modal-body pb-0">
            {feedbackError && <h5 className="error mb-2">{feedbackError}</h5>}
            <div className="answer-box p-0">
              <ul>
                <li>
                  <div className="answer d-flex align-items-center">
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          autoComplete="off"
                          checked={reportCheckboxs.ckFrame}
                          onChange={(e) =>
                            handleReportCheckboxChange(e, "ckFrame")
                          }
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>

                    <span>The question isn’t framed correctly</span>
                  </div>
                </li>

                <li>
                  <div className="answer d-flex align-items-center">
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          autoComplete="off"
                          checked={reportCheckboxs.ckExplanation}
                          onChange={(e) =>
                            handleReportCheckboxChange(e, "ckExplanation")
                          }
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>

                    <span>
                      Explanation is incorrect, unclear, or needs improvement
                    </span>
                  </div>
                </li>

                <li>
                  <div className="answer d-flex align-items-center">
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          autoComplete="off"
                          checked={reportCheckboxs.ckLearningVideo}
                          onChange={(e) =>
                            handleReportCheckboxChange(e, "ckLearningVideo")
                          }
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>

                    <span>
                      Learning video is irrelevant, not loading, or
                      inappropriate
                    </span>
                  </div>
                </li>

                <li>
                  <div className="answer d-flex align-items-center">
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          autoComplete="off"
                          checked={reportCheckboxs.ckMore}
                          onChange={(e) =>
                            handleReportCheckboxChange(e, "ckMore")
                          }
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>

                    <span>Problem with one or more options</span>
                  </div>
                </li>

                <li>
                  <div className="answer d-flex align-items-center">
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          autoComplete="off"
                          checked={reportCheckboxs.ckAnother}
                          onChange={(e) =>
                            handleReportCheckboxChange(e, "ckAnother")
                          }
                        />
                        <span
                          data-toggle="collapse"
                          data-target="#collapseQuestionFeedback"
                          aria-expanded="true"
                          aria-controls="collapseQuestionFeedback"
                          className="checkmark"
                        ></span>
                      </label>
                    </div>

                    <span>Another problem or suggestion to improve:</span>
                  </div>

                  <div id="collapseQuestionFeedback" className="collapse">
                    <div className="form-group mb-0">
                      <textarea
                        className="form-control"
                        value={reportCheckboxs.txtAnother}
                        placeholder="Write your problem"
                        onChange={(e) => onTextAnotherChange(e)}
                      ></textarea>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-light mr-2"
              onClick={() => cancelReport()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={feedbackError || feedbackSubmitting}
              onClick={(e) => feedbackSubmit(e)}
            >
              Report
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Learning;
