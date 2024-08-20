"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { questionStatus, reArrangeAnswers, serialize } from "@/lib/common";
import { getSession } from "next-auth/react";

import clientApi from "@/lib/clientApi";
import alertify from "alertifyjs";
import { success, error } from "alertifyjs";
import * as testSvc from "@/services/practice-service";
import * as questionSvc from "@/services/question-service";
import * as feedbackSvc from "@/services/feedbackService";
import * as authService from "@/services/auth";
import * as studentSvc from "@/services/student-service";
import MathJax from "@/components/assessment/mathjax";
import CodeMirror from "@uiw/react-codemirror";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { replaceQuestionText, replaceUserAnswer } from "@/lib/pipe";
import TestSeriesModal from "@/app/(main)/testSeries/components/Modal";
import QuestionFeedback from "@/components/assessment/question-feedback";
import ScratchPad from "@/components/assessment/scratchpad";
import CalculatorModal from "@/components/calculator";

const QuestionReview = () => {
  const { id } = useParams();
  const router = useRouter();
  const { push } = useRouter();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let testId = urlParams.get("testId");
  let attemptId = urlParams.get("attemptId");
  const questionId = urlParams.get("questionId");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [clientData, setClientData]: any = useState();

  const user: any = useSession()?.data?.user?.info || {};
  const [question, setQuestion] = useState<any>(null);
  const [line, setLine] = useState<number>(1);
  const [col, setCol] = useState<number>(1);
  const [showSketchpad, setShowSketchpad] = useState<boolean>(false);
  const [topicAnalysis, setTopicAnalysis] = useState<number>(0);
  const [hasTopicAnalysisData, setHasTopicAnalysisData] =
    useState<boolean>(false);
  //review mode code
  const [framePlaying, setFramePlaying] = useState<boolean>(false);
  const [frame, setFrame] = useState<any>({
    val: 1,
  });
  const [showReportIssue, setShowReportIssue] = useState<any[]>([]);
  const [ishasFeedback, setIsHasFeedback] = useState<any[]>([]);
  const [languageIndex, setLanguageIndex] = useState<number>(0);
  const [questionPerformance, setQuestionPerformance] = useState<number>(0);
  const [showLine, setShowLine] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [code, setCode] = useState<any>({
    isJava: false,
  });
  const [params, setParams] = useState<any>({
    limit: 6,
    page: 1,
    contentType: "video",
  });
  const [isShowCal, setIsShowCal] = useState<boolean>(false);

  const [videoCount, setVideoCount] = useState<number>(0);

  const codemirrorOptions: any = {
    java: {
      mode: "text/x-java", // text/x-csrc (C), text/x-c++src (C++), text/x-java (Java) text/x-csharp
      fileExt: "java",
    },
    cpp: {
      mode: "text/x-csharp", // text/x-csrc (C), text/x-c++src (C++), text/x-java (Java) text/x-csharp
      fileExt: "cpp",
    },
    python: {
      mode: "text/x-python",
      fileExt: "py",
    },
    c: {
      mode: "text/x-c++src",
      fileExt: "c",
    },
    ruby: {
      mode: "text/x-ruby",
      fileExt: "ruby",
    },
    javascript: {
      mode: "text/javascript",
      fileExt: "js",
    },
  };

  const codeMirrorCompileOptions = {
    readOnly: "nocursor",
  };
  const [refreshCodeMirror, setRefreshCodeMirror] = useState<boolean>(false);
  const [dayRanger, setDayRanger] = useState<any>(["English"]);

  const [secondLenguage, setSecondLenguage] = useState<any>(null);
  const [qStartTime, setQStartTime] = useState<any>(null);
  const [watchingVid, setWatchingVid] = useState<any>({});
  const [loadedTopics, setLoadedTopics] = useState<any>({});

  const [contents, setContents] = useState<any>(null);

  const [performance, setPerformance] = useState<any>([]);
  const [toggleCal, setToggleCal] = useState<boolean>(false);

  const [test, setTest] = useState<any>(null);

  const [questions, setQuestions] = useState<any>([]);
  const [showAnswer, setShowAnswer] = useState<any>({});
  const [attempt, setAttempt] = useState<any>(null);
  const [sections, setSections] = useState<any>([]);
  const queryParams = useSearchParams();

  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");

      setClientData(data);
    };
    getClientData();

    if (queryParams.get("attemptId")) {
      testSvc.showDetail(id, { short: true }).then((test) => {
        setTest(test);
        studentSvc.getAttempt(queryParams.get("attemptId")).then((attempt) => {
          setAttempt(attempt);

          questionSvc.getByAttempt(queryParams.get("attemptId")).then((qs) => {
            let toOpen: any = null;

            let foundQ: any = null;
            console.log(qs, "qs");
            setQuestions(qs);
            for (const que of qs) {
              que.showCalculator = test.showCalculator;
              if (test.showCalculator != "none" && test?.enableSection) {
                const sec = test.sections.find(
                  (sec) => sec.name == que.section
                );
                if (sec && !sec.showCalculator) {
                  que.showCalculator = "none";
                }
              }
              checkAnswerQuestion(
                que,
                attempt.QA.find((qa) => qa.question == que._id)
              );

              if (que._id == queryParams.get("questionId")) {
                foundQ = que;
              }
              if (que.status == 2 && toOpen == -1) {
                toOpen = que;
              }
            }

            checkFeedback(qs);

            loadSections(qs);
            setQuestionFunc(foundQ || toOpen || qs[0]);
            // if (clientData?.features?.classboard && user.primaryInstitute?.preferences?.classboard) {

            //   getByTest(test._id).then((cb: any) => {
            //     if (cb) {
            //       foundQ = qs.find(q => q._id == cb.currentQuestion._id)
            //       // loadClassboard(cb, foundQ)
            //     }

            //     setQuestionFunc(foundQ || toOpen || qs[0])
            //   })
            // } else {
            //   setQuestionFunc(foundQ || toOpen || qs[0])
            // }
          });
        });
      });
    } else {
      testSvc.findOneWithQuestions(id).then((test) => {
        setTest(test);
        setQuestions(test.questions);

        let foundQ = null;

        for (const question of test.questions) {
          question.showCalculator = test.showCalculator;
          if (test?.showCalculator != "none") {
            const sec = test.sections.find(
              (sec) => sec.name == question.section
            );
            if (sec && !sec.showCalculator) {
              question.showCalculator = "none";
            }
          }

          if (question._id == queryParams.get("questionId")) {
            foundQ = question;
          }
        }

        checkFeedback(test.questions);

        loadSections(test.questions);

        foundQ ? setQuestionFunc(foundQ) : setQuestionFunc(test.questions[0]);
      });
    }
  }, []);

  // const loadClassboard(cb, currentQ) {
  //   this.startClassboard = true
  //   this.classboard = cb

  //   this.users = this.classboard.users

  //   for (const usr of this.users) {
  //     const q = usr.questions.find(q => q._id == cb.currentQuestion._id)
  //     if (q) {
  //       usr.answers = q.answers

  //       for (const ua of usr.answers) {
  //         for (let i = 0; i < this.classboard.currentQuestion.answers.length; i++) {
  //           const a = this.classboard.currentQuestion.answers[i]
  //           if (a._id == ua._id) {
  //             ua.isCorrectAnswerOfUser = a.isCorrectAnswer
  //             ua.display = this.helper.numberToAlpha(i)
  //             break;
  //           }
  //         }
  //       }
  //     }
  //   }

  //   this.showAnswer[currentQ._id] = cb.currentQuestion.showAnswer

  //   this.socketSvc.emit('join.classboard', { code: this.classboard.code, userId: this.user._id, name: this.user.name, avatar: this.user.avatar })

  //   this.socketSvc.on("join.classboard", this.onUserJoin, "class-board")
  //   this.socketSvc.on("leave.classboard", this.onUserLeave, "class-board")
  //   this.socketSvc.on("action.classboard", this.onUserAction, "class-board")
  // }
  const getByTest = async (testId) => {
    const session = await getSession();

    await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/classboard/byTest/${testId}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
  };
  const loadSections = (ques?: any) => {
    if (ques) {
      if (test?.section) {
        const filteredSections = test.sections.filter(
          (sec) => !sec.isBreakTime
        );
        filteredSections.forEach((sec) => (sec.questions = []));

        for (const question of ques) {
          for (const sec of filteredSections) {
            if (question.section === sec.name) {
              sec.questions.push(question);
            }
          }
        }
        const sectionsWithQuestions = filteredSections.filter(
          (sect) => sect.questions.length > 0
        );
        setSections(sectionsWithQuestions);
      } else {
        setSections([
          {
            questions: ques,
          },
        ]);
      }
    } else {
      if (test?.section) {
        const filteredSections = test.sections.filter(
          (sec) => !sec.isBreakTime
        );
        filteredSections.forEach((sec) => (sec.questions = []));

        for (const question of questions) {
          for (const sec of filteredSections) {
            if (question.section === sec.name) {
              sec.questions.push(question);
            }
          }
        }
        const sectionsWithQuestions = filteredSections.filter(
          (sect) => sect.questions.length > 0
        );
        setSections(sectionsWithQuestions);
      } else {
        setSections([
          {
            questions: questions,
          },
        ]);
      }
    }
  };

  const checkFeedback = (ques?: any) => {
    if (ques) {
      feedbackSvc
        .getQuestionFeedbacks({
          practiceSet: id,
          studentId: user._id,
          idOnly: true,
        })
        .then((qs: any[]) => {
          const updatedQuestions = ques.map((q) => {
            if (qs.indexOf(q._id) > -1) {
              return { ...q, hasFeedback: true };
            }
            return q;
          });
          setQuestions(updatedQuestions);
        });
    } else {
      feedbackSvc
        .getQuestionFeedbacks({
          practiceSet: id,
          studentId: user._id,
          idOnly: true,
        })
        .then((qs: any[]) => {
          const updatedQuestions = questions.map((q) => {
            if (qs.indexOf(q._id) > -1) {
              return { ...q, hasFeedback: true };
            }
            return q;
          });
          setQuestions(updatedQuestions);
        });
    }
  };

  const setQuestionFunc = (ques) => {
    setQuestion(ques);

    if (ques?.category == "mcq") {
      ques.correctAnswerCount = ques.answers.filter(
        (a) => a.isCorrectAnswer
      ).length;
    } else if (ques?.category == "code" && !ques.selectedLang) {
      ques.selectedLang = ques.coding[0];
    }

    // Ensure we have second language here, Indian font may have '{'
    // var re = /\{(.*)\}/i

    const secondLenguage_temp = ques?.questionText.match(
      /\{\s{0,1}Hindi|Marathi|English\s{0,1}\}/i
    );
    setSecondLenguage(secondLenguage_temp);

    if (secondLenguage != null) {
      const newTxt = question.questionText.split("{");
      const updatedDayRanger = [];
      for (let i = 1; i < newTxt.length; i++) {
        updatedDayRanger.push(newTxt[i].split("}")[0]);
      }
      setDayRanger(updatedDayRanger);
    }
    getQuestionPerformance(ques);
  };

  const openSketch = () => {
    setShowSketchpad(!showSketchpad);
  };

  const onScratchpadDrawing = (ev) => {
    if (question._id === ev.q) {
      if (!question.scratchPad) {
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          scratchPad: [],
        }));
      }
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        scratchPad: [...prevQuestion.scratchPad, ev.data],
      }));
    }
  };

  const reportIssue = (index: any) => {
    setShowReportIssue({
      ...showReportIssue,
      [index]: true,
    });
  };

  const openCodeEditor = (answer: any) => {
    sessionStorage.setItem(
      `current-code-snippet-${user._id}`,
      JSON.stringify({
        code: answer.code,
        language: answer.codeLanguage,
        tags: [],
        pairCoding: false,
      })
    );

    const baseUrl = window.location.href.replace(router.url, "");
    const url = new URL(["code-editor"].join("/"), baseUrl).href;
    window.open(url, "_blank");
  };

  const track = (index: number, item: any) => {
    return item._id;
  };

  const openCalculatorModal = () => {
    setToggleCal(!toggleCal);
    console.log(toggleCal, "cal");
  };

  const graphingCalculatorModal = () => {
    // if (this.graphingModal && !this.graphingModal.isOpen) {
    //   this.graphingModal.open()
    //   this.toggleCal = true
    //   this.graphingModal.isOpen$.pipe(filter(x => !x), take(1)).subscribe(val => {
    //     this.toggleCal = val
    //   })
    // }
  };

  const checkAnswerQuestion = (ques: any, attemptedQuestion: any) => {
    ques.processed = true;
    ques.hasNoAnswer = true;
    if (!attemptedQuestion) {
      ques.status = 3;
      return;
    }
    ques.status = attemptedQuestion.status;
    ques.timeEslapse = (attemptedQuestion.timeEslapse / 1000).toFixed(0);
    const userAnswers = attemptedQuestion.answers;
    const questionAnswers = { ...ques.answers };
    ques.userAnswers = attemptedQuestion.answers;
    if (attemptedQuestion.scratchPad) {
      ques.scratchPad = attemptedQuestion.scratchPad;
    }
    if (ques.category == "code") {
      ques.answers = attemptedQuestion.answers;

      const codingLanguages: any = [];

      // Load list of language
      ques.coding.forEach((c) => {
        if (c.language === "python") {
          codingLanguages.push({
            display: "Python",
            language: "python",
          });
          c.display = "Python";
        } else if (c.language === "c") {
          codingLanguages.push({
            display: "C",
            language: "c",
          });
          c.display = "C";
        } else if (c.language === "cpp") {
          codingLanguages.push({
            display: "C++",
            language: "cpp",
          });
          c.display = "C++";
        } else if (c.language === "java") {
          codingLanguages.push({
            display: "Java",
            language: "java",
          });
          c.display = "Java";
        } else if (c.language == "ruby") {
          codingLanguages.push({
            display: "Ruby",
            language: "ruby",
          });
          c.display = "Ruby";
        }

        ques.codingLanguages = codingLanguages;
        ques.stats = {};
        ques.stats[c.language] = {
          compileTime: 0,
          runTime: 0,
          testcasesPassed: 0,
          totalTestcases: 0,
        };
      });

      if (attemptedQuestion.answers.length > 0) {
        ques.hasNoAnswer = false;

        ques.answers[0].isCorrectAnswerOfUser =
          attemptedQuestion.status === questionStatus.CORRECT;

        const idx = ques.coding.findIndex(
          (c) => c.language == attemptedQuestion.answers[0].codeLanguage
        );

        ques.selectedLang = idx > -1 ? ques.coding[idx] : ques.coding[0];

        // Check testcase status of student code
        if (attemptedQuestion.answers[0].testcases) {
          let runTime = 0;
          let testPassed = 0;
          ques.testcases.forEach((t) => {
            const idx = attemptedQuestion.answers[0].testcases.findIndex(
              (ts) => ts.input == t.input && ts.args == t.args
            );

            if (idx > -1) {
              t.status = attemptedQuestion.answers[0].testcases[idx].status;
              t.studentCodeOutput =
                attemptedQuestion.answers[0].testcases[idx].output;

              runTime += attemptedQuestion.answers[0].testcases[idx].runTime;
              testPassed += t.status ? 1 : 0;
            }
          });

          ques.stats[ques.selectedLang.language].compileTime =
            attemptedQuestion.answers[0].compileTime;
          ques.stats[ques.selectedLang.language].runTime = runTime;
          ques.stats[ques.selectedLang.language].testcasesPassed = testPassed;
          ques.stats[ques.selectedLang.language].totalTestcases =
            ques.testcases.length;
        }
      } else {
        ques.selectedLang = ques.coding[0];
      }
    } else if (ques.category == "mcq" || ques.category == "fib") {
      for (const k in questionAnswers) {
        for (const j in userAnswers) {
          if (userAnswers[j].answerId) {
            if (userAnswers[j].answerId === questionAnswers[k]._id) {
              if (ques.category == "fib") {
                if (attemptedQuestion.status == 1) {
                  ques.answers[k].isCorrectAnswerOfUser = true;
                  ques.isUserAnsweredCorrect = true;
                } else {
                  ques.answers[k].isCorrectAnswerOfUser = false;
                  ques.isUserAnsweredCorrect = false;
                }
              } else {
                questionAnswers[k].isCheckedByUser = true;
                if (!questionAnswers[k].isCorrectAnswer) {
                  ques.answers[k].isCorrectAnswerOfUser = false;
                }
              }
            }
          } else {
            if (userAnswers[j] === questionAnswers[k]._id) {
              questionAnswers[k].isCheckedByUser = true;
              if (!questionAnswers[k].isCorrectAnswer) {
                ques.answers[k].isCorrectAnswerOfUser = false;
              }
            }
          }
        }
      }
    } else if (ques.category == "mixmatch") {
      ques.isUserAnsweredCorrect = true;
      for (const actualA of ques.answers) {
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
        ques.isUserAnsweredCorrect &&= actualA.isCorrectAnswerOfUser;
      }
    }
    console.log(questionAnswers, "qu");
    setQuestion({
      ...question,
      answer: questionAnswers,
    });
  };

  const getQuestionPerformance = async (ques: any) => {
    try {
      let res: any;

      if (!performance[ques._id]) {
        ques.loadingPerformance = true;
        console.log("perfor", id);
        res = await questionSvc.getQuestionPerformanceByTest(ques._id, id);
        ques.loadingPerformance = false;

        setPerformance((prevPerformance) => ({
          ...prevPerformance,
          [ques._id]: res,
        }));
      }

      ques.performance = res.percentCorrect;

      if (res.answerStats && res.answerStats.length) {
        let total = 0;
        res.answerStats.forEach((st) => {
          total += st.totalSelected;
        });

        for (const ans of ques.answers) {
          ans.percentSelected = 0;
          if (total) {
            const fa = res.answerStats.find((a) => a._id == ans._id);
            if (fa) {
              ans.percentSelected = Math.round(
                (fa.totalSelected / total) * 100
              );
            }
          }
        }
      }
      // setQuestion(ques)
    } catch (ex) {
      ques.loadingPerformance = true;
    }
  };

  const refreshPage = () => {
    const tmp = question;
    setQuestion(null);

    setTimeout(() => {
      setQuestionFunc(tmp);
    }, 100);
  };

  const returnFunc = () => {
    if (queryParams.get("classId") && queryParams.get("menu")) {
      push(
        `/classroom/details/${queryParams.get(
          "classId"
        )}?menu=${queryParams.get("menu")}`
      );
      return;
    }
    if (
      (!queryParams.get("attemptId") || queryParams.get("page") == "test") &&
      queryParams.get("menu")
    ) {
      push(`/assessment/details/${id}?menu=${queryParams.get("menu")}`);

      return;
    }
    router.back();
  };

  const onReturn = () => {
    router.back();
  };

  const dropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleAnswer = () => {
    const updateShowAns = !showAnswer[question._id];
    setShowAnswer({
      ...showAnswer,
      [question._id]: updateShowAns,
    });
  };

  const nextQuestion = () => {
    setQuestionFunc(
      questions[questions.findIndex((q) => q._id == question._id) + 1]
    );
  };

  const previousQuestion = () => {
    setQuestionFunc(
      questions[questions.findIndex((q) => q._id == question._id) - 1]
    );
  };

  const createClassBoard = (question) => {};

  const handleLanguageChange = () => {};

  return (
    <>
      <div className="adaptive-question-header">
        <div className="container">
          <div className="adaptive-header-area mx-auto mw-100 d-none d-lg-block">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <div className="navbar-brand clearfix p-0 m-0 d-flex align-items-center">
                <figure className="user_img_circled_wrap mt-0">
                  <div
                    className="avatar"
                    style={{ backgroundImage: `url(${user?.avatar})` }}
                  ></div>
                </figure>
                <span className="ml-2 p-0">{user?.name}</span>
              </div>
              <div className="assesment-name mx-auto text-black">
                <span>{test?.title}</span>
              </div>
              <div className="navbar-nav ml-auto">
                <div className="finish-btn">
                  <a className="text-center text-white px-2" onClick={onReturn}>
                    Return
                  </a>
                </div>
              </div>
            </nav>
          </div>
          <div className="adaptive-header-area mx-auto mw-100 d-block d-lg-none">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1 d-flex align-items-center">
                <figure className="user_img_circled_wrap mt-0">
                  <div
                    className="avatar"
                    style={{ backgroundImage: `url(${user?.avatar})` }}
                  ></div>
                </figure>
                <span className="ml-2 p-0">{user?.name}</span>
              </div>
            </div>
            <div className="d-flex">
              <div className="assesment-name text-black flex-grow-1">
                <span>{test?.title}</span>
              </div>
              <div className="finish-btn position-relative mr-0">
                <a className="text-center text-white px-2" onClick={onReturn}>
                  Return
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="adaptive-question ">
        <div className="container">
          <div className="heading">
            <div className="row">
              <div className="col-6">
                <div className="d-flex align-items-center gap-xs">
                  <h6 className="h6 mb-0">Question</h6>
                  <div className="count text-white clearfix">
                    <div className="btn-group">
                      <button
                        id="button-basic"
                        onClick={dropdownToggle}
                        type="button"
                        className="btn btn-primary dropdown-toggle btn-sm px-3 bold"
                        aria-controls="dropdown-basic"
                      >
                        <span>{question?.order}</span>
                        <span> / </span>
                        <span>{questions.length}</span>
                        &nbsp;
                        <span className="caret text-white"></span>
                      </button>
                      {showDropdown && (
                        <ul
                          id="dropdown-basic"
                          className="dropdown-menu-custom"
                          role="menu"
                          aria-labelledby="button-basic"
                          style={{ display: "block !important" }}
                        >
                          {sections.map((section, index) => (
                            <div key={index}>
                              {section.name && (
                                <li role="menuitem">
                                  <b>{section.name}</b>
                                </li>
                              )}
                              {section.questions.map((secQuestion) => (
                                <li role="menuitem" key={secQuestion._id}>
                                  <a
                                    className={`dropdown-item ${
                                      secQuestion._id === question?._id
                                        ? "bg-color1 text-white"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      dropdownToggle();
                                      setQuestionFunc(secQuestion);
                                    }}
                                  >
                                    {attempt && (
                                      <>
                                        {secQuestion.status === 1 && (
                                          <i
                                            className="fas fa-check correct-color"
                                            title="Correct"
                                          ></i>
                                        )}
                                        {secQuestion.status === 2 && (
                                          <i
                                            className="fas fa-times incorrect-color"
                                            title="Incorrect"
                                          ></i>
                                        )}
                                        {secQuestion.status === 3 && (
                                          <i
                                            className="fas fa-exclamation missed-color"
                                            title="Missed"
                                          ></i>
                                        )}
                                        {secQuestion.status === 4 && (
                                          <i
                                            className="fas fa-pause pending-color"
                                            title="Pending"
                                          ></i>
                                        )}
                                        {secQuestion.status === 5 && (
                                          <i
                                            className="fas fa-check partial-color"
                                            title="Partial"
                                          ></i>
                                        )}
                                      </>
                                    )}
                                    {secQuestion.order}
                                  </a>
                                </li>
                              ))}
                            </div>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <a className="btn" onClick={refreshPage} title="refresh">
                    <i className="fas fa-sync"></i>
                  </a>

                  {id && question && (
                    <a
                      className="btn text-danger"
                      onClick={() => reportIssue(question?.order - 1)}
                    >
                      <i
                        className={
                          questions[question?.order - 1].hasFeedback ||
                          ishasFeedback[question?.order - 1]
                            ? "fas fa-flag"
                            : "far fa-flag"
                        }
                      ></i>
                      {}
                    </a>
                  )}

                  {question && (
                    <a className="btn text-primary" onClick={toggleAnswer}>
                      <i
                        className={
                          showAnswer[question._id]
                            ? "far fa-eye"
                            : "far fa-eye-slash"
                        }
                      ></i>
                    </a>
                  )}
                </div>
              </div>
              <div className="col-6 d-flex justify-content-end gap-xs">
                {question &&
                  clientData?.features?.classboard &&
                  user.primaryInstitute?.preferences?.classboard &&
                  (question.category === "mcq" ||
                    question.category === "code") && (
                    <a
                      className="text-primary"
                      tooltip="Open Class Board"
                      title="Classboard"
                      onClick={() => {
                        createClassBoard(question);
                      }}
                    >
                      <i className="fa fa-share fa-2x"></i>
                    </a>
                  )}
                {question && question.category !== "code" && (
                  <div className="d-inline-block cal">
                    <button
                      id="popoverCal"
                      className="btn p-0"
                      type="button"
                      onClick={openCalculatorModal}
                      style={{
                        display:
                          question.showCalculator === "scientific"
                            ? "block"
                            : "none",
                      }}
                    >
                      <figure>
                        <img
                          src={
                            toggleCal
                              ? "assets/images/icon-cal-active.png"
                              : "assets/images/icon-cal.png"
                          }
                          alt=""
                        />
                      </figure>
                    </button>
                    <button
                      id="popoverCal"
                      className="btn p-0"
                      type="button"
                      onClick={openCalculatorModal}
                      style={{
                        display:
                          question.showCalculator === "desmos"
                            ? "block"
                            : "none",
                      }}
                    >
                      <figure>
                        <img
                          src={
                            toggleCal
                              ? "/assets/images/icon-cal-active.png"
                              : "/assets/images/icon-cal.png"
                          }
                          alt="calculator"
                        />
                      </figure>
                    </button>
                  </div>
                )}
                {question && (
                  <div className="d-inline-block brush">
                    <button
                      id="popoverBrush"
                      className="btn p-0"
                      type="button"
                      onClick={openSketch}
                    >
                      <figure>
                        <img
                          src={
                            showSketchpad
                              ? "/assets/images/eva_brush-fill-active.png"
                              : "/assets/images/eva_brush-fill.png"
                          }
                          alt="scratchpad"
                        />
                      </figure>
                    </button>
                  </div>
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

          {question ? (
            <>
              <div
                className="adaptive-question-box bg-white ans"
                style={{ overflow: "hidden" }}
              >
                {question?.category === "mcq" ? (
                  <div className="adaptive-question-item span-black row">
                    <div className="col">
                      <div className="question-header">
                        {question.questionHeader && (
                          <div>
                            {question.showHeader ? (
                              <div
                                style={{ fontSize: "19px", marginTop: "10px" }}
                              >
                                <MathJax value={question.questionHeader} />
                                <div className="d-flex justify-content-start">
                                  <a
                                    className="btn btn-sm btn-link px-0"
                                    onClick={() =>
                                      setQuestion({
                                        ...question,
                                        showHeader: false,
                                      })
                                    }
                                  >
                                    Hide Instruction
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-start">
                                <a
                                  className="btn btn-sm btn-link px-0"
                                  onClick={() =>
                                    setQuestion({
                                      ...question,
                                      showHeader: true,
                                    })
                                  }
                                >
                                  Show Instruction
                                </a>
                              </div>
                            )}
                            <hr className="mt-0" />
                          </div>
                        )}
                      </div>
                      <div className="question-item my-3">
                        <MathJax
                          value={question.questionText}
                          className="ques-mathjax"
                        />
                        <div className="row no-gutters">
                          {question.audioFiles?.map((audio, index) => (
                            <div
                              key={index}
                              className="position-relative my-2 col-lg-6 col-12"
                            >
                              <label>{audio.name}</label>
                              <audio
                                controls
                                src={audio.url}
                                className="w-100"
                              ></audio>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="question-answers mb-0">
                        {question.answers.map((answer, index) => (
                          <>
                            <div key={index} className="row d-flex">
                              <label
                                style={{
                                  display: showAnswer[question._id]
                                    ? "block"
                                    : "none",
                                }}
                                className={`col-auto ${
                                  answer.isCorrectAnswer &&
                                  answer.isCorrectAnswerOfUser !== false
                                    ? "green"
                                    : answer.isCorrectAnswerOfUser === false
                                    ? "red"
                                    : ""
                                }`}
                              >
                                <input
                                  disabled
                                  name={`answer_${index}`}
                                  type="checkbox"
                                  checked={answer.isCheckedByUser}
                                />
                                <span className="checkmark"></span>

                                {answer.isCheckedByUser && (
                                  <span
                                    className="material-icons"
                                    style={{
                                      fontSize: "22px",
                                      fontWeight: 700,
                                      position: "absolute",
                                      left: "33px",
                                      top: "10px",
                                    }}
                                  >
                                    checkmark
                                  </span>
                                )}
                              </label>
                              <label
                                className="col-auto"
                                style={{
                                  display: !showAnswer[question._id]
                                    ? "block"
                                    : "none",
                                }}
                              >
                                <input
                                  disabled
                                  name={`answer_${index}`}
                                  type="checkbox"
                                />
                                <span className="checkmark"></span>
                              </label>
                              <span className="col answer-text">
                                <MathJax
                                  value={answer.answerText}
                                  className="ques-mathjax"
                                />
                              </span>
                              {answer.audioFiles?.map((audio, audioIndex) => (
                                <div
                                  key={audioIndex}
                                  className="position-relative my-2 col-lg-6 col-12"
                                >
                                  <label>{audio.name}</label>
                                  <audio
                                    controls
                                    src={audio.url}
                                    className="w-100"
                                  ></audio>
                                </div>
                              ))}
                            </div>
                            <div className="row">
                              {answer.percentSelected > 0 && (
                                <div style={{ paddingLeft: "60px" }}>
                                  <em>{answer.percentSelected}% students</em>
                                </div>
                              )}
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {(question?.questionHeader ||
                      question?.category !== "fib") && (
                      <div className="adaptive-question-item span-black">
                        {question?.questionHeader && (
                          <div className="question-header">
                            {question.showHeader ? (
                              <div>
                                <MathJax value={question.questionHeader} />
                                <div className="d-flex justify-content-start">
                                  <a
                                    className="btn btn-sm btn-link px-0"
                                    onClick={() =>
                                      (question.showHeader = false)
                                    }
                                  >
                                    Hide Instruction
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-start">
                                <a
                                  className="btn btn-sm btn-link px-0"
                                  onClick={() => (question.showHeader = true)}
                                >
                                  Show Instruction
                                </a>
                              </div>
                            )}
                            <hr className="mt-0" />
                          </div>
                        )}
                        {question?.category !== "fib" && (
                          <div className="question-item mb-3">
                            <MathJax value={question.questionText} />
                            <div className="row no-gutters">
                              {question.audioFiles?.map((audio, index) => (
                                <div
                                  key={index}
                                  className="position-relative my-2 col-lg-6 col-12"
                                >
                                  <label>{audio.name}</label>
                                  <audio
                                    controls
                                    src={audio.url}
                                    className="w-100"
                                  ></audio>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {question.category === "fib" && (
                      <>
                        {showAnswer[question._id] ? (
                          <>
                            <i
                              className={`float-right ${
                                question.isUserAnsweredCorrect
                                  ? "fas fa-check text-info"
                                  : "far fa-dot-circle text-danger"
                              }`}
                            ></i>

                            {!question.isUserAnsweredCorrect ? (
                              <MathJax
                                value={replaceQuestionText(question, "review")}
                              ></MathJax>
                            ) : (
                              <MathJax
                                value={replaceQuestionText(question, true)}
                              />
                            )}
                          </>
                        ) : (
                          <MathJax
                            value={replaceUserAnswer(question, "hidden")}
                          />
                        )}

                        <div className="row">
                          {question.audioFiles?.length &&
                            question.audioFiles.map((audio, index) => (
                              <div
                                key={index}
                                className="position-relative my-2 col-lg-6 col-12"
                              >
                                <label>{audio.name}</label>
                                <audio
                                  controls
                                  src={audio.url}
                                  className="w-100"
                                ></audio>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                    {question.category === "descriptive" && (
                      <>
                        {question.userAnswers && question.userAnswers[0] && (
                          <div>
                            <h5>Your answer:</h5>
                            <div
                              style={{
                                border: "solid 1px transparent",
                                padding: "5px",
                                background: "white",
                                borderRadius: "8px",
                              }}
                            >
                              {question.userAnswers[0].answerText && (
                                <MathJax
                                  value={question.userAnswers[0].answerText}
                                />
                              )}
                              <div className="row">
                                {question.userAnswers[0].attachments &&
                                  question.userAnswers[0].attachments.map(
                                    (att, index) => (
                                      <div key={index} className="col-sm-3">
                                        {att.type === "image" && (
                                          <a href={att.url} target="_system">
                                            <img
                                              src={att.url}
                                              style={{
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                              }}
                                            />
                                          </a>
                                        )}
                                        {att.type === "file" && (
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
                                        )}
                                        {att.type === "audio" && (
                                          <audio
                                            controls
                                            className="w-100"
                                            src={att.url}
                                          ></audio>
                                        )}
                                      </div>
                                    )
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {question.category === "code" && (
                      <>
                        {attempt && !question.hasNoAnswer && (
                          <>
                            <div className="rounded-boxes bg-light">
                              <div className="clearfix">
                                <h5 className="pull-left">
                                  Student Code &nbsp;&nbsp;
                                  <button
                                    className="btn btm-sm"
                                    onClick={() =>
                                      openCodeEditor(question.answers[0])
                                    }
                                    title="open code editor"
                                  >
                                    <i className="fas fa-terminal"></i>
                                  </button>
                                </h5>
                                <div
                                  className="pull-right"
                                  style={{ margin: "10px 0px" }}
                                >
                                  <i
                                    className="fa fa-check pull-right text-info"
                                    style={{
                                      display: question.answers[0]
                                        .isCorrectAnswerOfUser
                                        ? "block"
                                        : "none",
                                    }}
                                  ></i>
                                  <i
                                    className="fa fa-dot-circle-o pull-right text-danger"
                                    style={{
                                      display: question.answers[0]
                                        .isCorrectAnswerOfUser
                                        ? "none"
                                        : "block",
                                    }}
                                  ></i>
                                </div>
                              </div>
                              <CodeMirror value={question.answers[0].code} />
                              {/* <ngx-codemirror [(ngModel)]="question.answers[0].code" [options]="codemirrorConfig"></ngx-codemirror> */}
                            </div>
                            <div className="rounded-boxes bg-light">
                              <div>
                                <Tabs title="Output" key="output">
                                  {!question.hasNoAnswer && (
                                    <>
                                      <div>
                                        <label>Compile Message</label>
                                      </div>
                                      <div>
                                        <textarea
                                          value={
                                            question.answers[0].compileMessage
                                          }
                                          readOnly
                                          style={{
                                            width: "100%",
                                            resize: "none",
                                            height: "75px",
                                          }}
                                        ></textarea>
                                      </div>
                                      {!question.hasNoAnswer &&
                                        (question.answers[0].userInput ||
                                          question.answers[0].userArgs) && (
                                          <>
                                            <div>
                                              <label>Your Args</label>
                                              <textarea
                                                value={
                                                  question.answers[0].userArgs
                                                }
                                                readOnly
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
                                            {question.hasUserInput && (
                                              <>
                                                <div>
                                                  <label>Your Input</label>
                                                </div>
                                                <div>
                                                  <textarea
                                                    value={
                                                      question.answers[0]
                                                        .userInput
                                                    }
                                                    readOnly
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
                                            )}
                                            <div>
                                              <label>Your Output</label>
                                            </div>
                                            <div>
                                              <textarea
                                                value={
                                                  question.answers[0].output
                                                }
                                                readOnly
                                                style={{
                                                  resize: "none",
                                                  height: "auto",
                                                  maxHeight: "75px",
                                                  width: "100%",
                                                  color: "black",
                                                }}
                                              ></textarea>
                                            </div>
                                          </>
                                        )}
                                    </>
                                  )}
                                  {showAnswer[question._id] && (
                                    <div className="rounded-boxes bg-light">
                                      <div className="clearfix">
                                        <h5 className="pull-left">Solutions</h5>
                                        <select
                                          className="pull-right"
                                          chosen
                                          name="language"
                                          value={question.selectedLang}
                                          onChange={(e) =>
                                            (question.selectedLang =
                                              e.target.value)
                                          }
                                        >
                                          {question.coding.map((lang) => (
                                            <option
                                              key={lang.value}
                                              value={lang.value}
                                            >
                                              {lang.display}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <CodeMirror
                                        value={question.selectedLang.solution}
                                      />
                                    </div>
                                  )}
                                </Tabs>
                                {question.hasNoAnswer && (
                                  <Tabs title="Stats" key="stats">
                                    {question.selectedLang.language == "cpp" ||
                                      question.selectedLang.language == "c" ||
                                      (question.selectedLang.language ==
                                        "java" && (
                                        <div className="row">
                                          <div className="col-sm-6">
                                            <span>
                                              Time taken to compile (ms)
                                            </span>
                                          </div>
                                          <div className="col-sm-6 text-right">
                                            <span>
                                              {
                                                question.stats[
                                                  question.selectedLang.language
                                                ].compileTime
                                              }
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    <div className="row">
                                      <div className="col-sm-6">
                                        <span>Time taken to run (ms)</span>
                                      </div>
                                      <div className="col-sm-6 text-right">
                                        <span>
                                          {
                                            question.stats[
                                              question.selectedLang.language
                                            ].runTime
                                          }
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
                                            question.stats[
                                              question.selectedLang.language
                                            ].testcasesPassed
                                          }
                                          /
                                          {
                                            question.stats[
                                              question.selectedLang.language
                                            ].totalTestcases
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
                                          {question.stats[
                                            question.selectedLang.language
                                          ].timeToSubmit | millisecondsToTime}
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
                                          {
                                            question.stats[
                                              question.selectedLang.language
                                            ].attempts
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div className="row">
                                      <div className="col-sm-9">
                                        <span>
                                          Number of compilation attempts
                                          witnessing a successful compile
                                        </span>
                                      </div>
                                      <div className="col-sm-3 text-right">
                                        <span>
                                          {
                                            question.stats[
                                              question.selectedLang.language
                                            ].successAttempts
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div className="row">
                                      <div className="col-sm-9">
                                        <span>
                                          Number of compile attempts witnessing
                                          a time-out
                                        </span>
                                      </div>
                                      <div className="col-sm-3 text-right">
                                        <span>
                                          {
                                            question.stats[
                                              question.selectedLang.language
                                            ].timeoutAttempts
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div className="row">
                                      <div className="col-sm-9">
                                        <span>
                                          Number of compile attempts witnessing
                                          a runtime errors
                                        </span>
                                      </div>
                                      <div className="col-sm-3 text-right">
                                        <span>
                                          {
                                            question.stats[
                                              question.selectedLang.language
                                            ].errorAttempts
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div className="row">
                                      <div className="col-sm-9">
                                        <span>
                                          Avg. no. of cases passed in each
                                          compile
                                        </span>
                                      </div>
                                      <div className="col-sm-3 text-right">
                                        <span>
                                          {
                                            question.stats[
                                              question.selectedLang.language
                                            ].avgCasesPassed
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
                                          {question.stats[
                                            question.selectedLang.language
                                          ].avgTimeBetweenAttempts |
                                            millisecondsToTime}
                                        </span>
                                      </div>
                                    </div>
                                  </Tabs>
                                )}
                                <Tabs title="Test Case" key="test-case">
                                  {question.testcases.map((testcase, index) => (
                                    <div
                                      key={index}
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
                                          {question.hasUserInput && (
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
                                          testcase.studentCodeOutput && (
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
                                              {question.hasUserInput && (
                                                <div
                                                  style={{
                                                    display: "table-cell",
                                                    width: "1%",
                                                  }}
                                                ></div>
                                              )}
                                              {question.hasUserInput && (
                                                <div
                                                  style={{
                                                    display: "table-cell",
                                                  }}
                                                ></div>
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
                                          )}
                                      </div>
                                    </div>
                                  ))}
                                </Tabs>
                              </div>
                            </div>
                          </>
                        )}
                        {/* {!attempt || question.hasNoAnswer && ( */}
                        <div>
                          {showAnswer[question._id] && (
                            <Tabs
                              defaultActiveKey="solution"
                              id="noanim-tab-example"
                              className="mb-3"
                            >
                              <Tab eventKey="solution" title="Solution">
                                <div className="rounded-boxes bg-light">
                                  <div className="clearfix">
                                    <h5 className="pull-left">Solutions</h5>
                                    <select
                                      className="pull-right"
                                      value={question.selectedLang}
                                      onChange={handleLanguageChange}
                                    >
                                      {question.coding.map((lang, index) => (
                                        <option key={index} value={lang}>
                                          {lang.display}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <CodeMirror
                                    value={question.selectedLang.solution}
                                  ></CodeMirror>
                                </div>
                              </Tab>
                              <Tab eventKey="test-case" title="Test Cases">
                                <div>
                                  {question.testcases.map((testcase, index) => (
                                    <div
                                      key={index}
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
                                            />
                                          </div>
                                          {question.hasUserInput && (
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
                                                />
                                              </div>
                                            </>
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
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Tab>
                            </Tabs>
                          )}
                        </div>
                        {/* )} */}
                      </>
                    )}
                    {question.category === "mixmatch" && (
                      <div className="question-review">
                        <div className="mix-match row">
                          <div className="col-5 mix-match-content">
                            {question.answers.map((ans, index) => (
                              <div key={index} className="mix-match-drag">
                                <MathJax value={ans.answerText} />
                              </div>
                            ))}
                          </div>

                          <div className="col-5 ml-auto">
                            <div className="mix-match-drop-wrap w-100">
                              {question.answers.map((a, index) => (
                                <div
                                  key={index}
                                  className="mix-match-dragd border-0"
                                >
                                  {a.userText && <MathJax value={a.userText} />}
                                  {showAnswer[question._id] && (
                                    <div className="pull-right">
                                      <i
                                        className={`fas fa-check pull-right text-info ${
                                          !a.isCorrectAnswerOfUser
                                            ? "hidden"
                                            : ""
                                        }`}
                                      ></i>
                                      <i
                                        className={`far fa-dot-circle pull-right text-danger ${
                                          a.isCorrectAnswerOfUser
                                            ? "hidden"
                                            : ""
                                        }`}
                                      ></i>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          {showAnswer[question._id] &&
                            !question.isUserAnsweredCorrect && (
                              <div>
                                <h1 className="h4 text-dark">Correct Answer</h1>
                                <div className="mix-match row">
                                  <div className="col-5 mix-match-content">
                                    {question.answers.map((ans, index) => (
                                      <div
                                        key={index}
                                        className="mix-match-drag"
                                      >
                                        <span>
                                          <MathJax value={ans.answerText} />
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="col-5 ml-auto">
                                    <div className="mix-match-content w-100">
                                      {question.answers.map((ans, index) => (
                                        <div
                                          key={index}
                                          className="mix-match-dragd"
                                        >
                                          <span>
                                            <MathJax value={ans.correctMatch} />
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="question-details d-flex justify-content-between flex-wrap">
                <div className="dropdown text">
                  <b>Subject:</b> {question?.subject?.name} |<b>Unit:</b>{" "}
                  {question?.unit?.name} |<b>Topic:</b> {question?.topic?.name}
                  {question.performance && (
                    <span>
                      | <b>Students solved correctly:</b>{" "}
                      {question.performance.toFixed(0)}%
                    </span>
                  )}
                  {/* {question.loadingPerformance && (
                  <span>
                    <i className="fa fa-spinner fa-pulse"></i>
                  </span>
                )} */}
                </div>
                <em>% is rounded to nearest whole number</em>
              </div>
              {question?.answerExplain && showAnswer[question._id] && (
                <div className="vedio-section mt-2 mb-2">
                  <div className="vedio-section-box">
                    <div className="vedio-name">
                      <h3>Explanation</h3>
                    </div>
                    <div className="vedio-body exp pt-2">
                      <p>
                        <MathJax value={question.answerExplain} />
                      </p>
                      {question.answerExplainAudioFiles?.length > 0 && (
                        <div className="row">
                          {question.answerExplainAudioFiles?.map(
                            (index, audio) => (
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
                      )}
                    </div>
                  </div>
                </div>
              )}
              {question &&
                question.videos &&
                question.videos.length &&
                showAnswer[question._id] && (
                  <div className="vedio-section mt-3 mb-2">
                    <div className="vedio-section-box">
                      <div className="vedio-name">
                        <h3>Recommended Learning</h3>
                      </div>
                      <div className="vedio-body">
                        <div className="row">
                          {question.videos?.map((video, index) => (
                            <div
                              className="col-sm-12 col-md-6 col-lg-4"
                              key={index}
                            >
                              <div className="video-cart">
                                <div className="image">
                                  {video.local ? (
                                    <video
                                      className="w-100"
                                      height="180"
                                      controls
                                    >
                                      <source
                                        src={video.url}
                                        type="video/mp4"
                                      />
                                    </video>
                                  ) : (
                                    <iframe
                                      className="w-100"
                                      height="180"
                                      src={video.url}
                                      frameBorder="0"
                                      allowFullScreen
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
                          ))}
                        </div>
                        {question.videos &&
                          question.videos.length < videoCount && (
                            <div className="text-center">
                              <a
                                className="btn btn-light"
                                onClick={loadMoreVideos}
                              >
                                Load More
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              <div className="d-flex justify-content-end">
                {question.order > 1 && (
                  <a
                    className="btn btn-secondary mr-2"
                    onClick={previousQuestion}
                  >
                    Previous
                  </a>
                )}
                {question.order < questions.length && (
                  <a className="btn btn-primary" onClick={nextQuestion}>
                    Next
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className="adaptive-question-box bg-white ans">
              <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
              <hr />
              <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
            </div>
          )}
        </div>
      </div>

      {showSketchpad && (
        <ScratchPad
          question={question}
          onClose={() => setShowSketchpad(false)}
        />
      )}
      {toggleCal && (
        <CalculatorModal show={toggleCal} onClose={() => setToggleCal(false)} />
      )}

      {question && (
        <QuestionFeedback
          // reloadQuestions={reloadQuestions}
          show={showReportIssue[question?.order - 1]}
          // practiceId={practice._id}
          // teacherId={practice.user._id}
          attemptId={question.attemptId}
          questionId={question._id}
          userId={user._id}
          onClose={() =>
            setShowReportIssue({
              ...showReportIssue,
              [question?.order - 1]: false,
            })
          }
          setIsHasFeedback={setIsHasFeedback}
          ishasFeedback={ishasFeedback}
          index={question?.order - 1}
        />
      )}
    </>
  );
};

export default QuestionReview;
