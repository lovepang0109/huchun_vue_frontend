"use client";
import React, { useEffect, useState, useRef } from "react";
import clientApi from "@/lib/clientApi";
import { success, alert, confirm } from "alertifyjs";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import * as contentService from "@/services/contentService";
import * as questionSvc from "@/services/question-service";
import { Modal } from "react-bootstrap";
import { getCodeLanguages } from "@/lib/common";
import { getElearningFullPath, embedVideo } from "@/lib/helpers";
import MathJax from "@/components/assessment/mathjax";
import CodeMirror from "@uiw/react-codemirror";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { replaceQuestionText, replaceUserAnswer } from "@/lib/pipe";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import ScratchPad from "@/components/assessment/scratchpad";
import CalculatorModal from "@/components/calculator";
import { AppLogo } from "@/components/AppLogo";
import { VideoPlayer } from "@/components/VideoPlayer";
const QuestionView = () => {
  const router = useRouter();
  const [question, setQuestion] = useState<any>(null);
  const [line, setLine] = useState<Number>(1);
  const [col, setCol] = useState<Number>(1);
  const [showSketchpad, setShowSketchpad] = useState<boolean>(false);
  const [topicAnalysis, setTopicAnalysis] = useState<Number>(0);
  const [hasTopicAnalysisData, setHasTopicAnalysisData] =
    useState<boolean>(false);
  const [videoTemplate, setVideoTemplate] = useState<boolean>(false);
  const [answerExplainVideo, setAnswerExplainVideo] = useState<any>("");

  const [framePlaying, setFramePlaying] = useState<boolean>(false);
  const [frame, setFrame] = useState({
    val: 1,
  });

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

  const [videoCount, setVideoCount] = useState<Number>(0);

  let codemirrorOptions: any = {
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
  let codeMirrorCompileOptions = {
    readOnly: "nocursor",
  };

  const [refreshCodeMirror, setRefreshCodeMirror] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<any>({});
  const [dayRanger, setDayRanger] = useState<any>(["English"]);
  const [secondLenguage, setSecondLenguage] = useState<any>(null);
  const [codingLanguages, setCodingLanguages] = useState<any>(null);
  const [watchingVid, setWatchingVid] = useState<any>({});
  const [loadedTopics, setLoadedTopics] = useState<any>({});
  const [hasNoAnswer, setHasNoAnswer] = useState<boolean>(false);
  const [stats, setStats] = useState<any>({});
  const [contents, setContents] = useState<any>(null);
  const user: any = useSession()?.data?.user?.info || {};
  const [performance, setPerformance] = useState<any>(null);
  const [toggleCal, setToggleCal] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>([]);
  const { id } = useParams();
  const [showAnswer, setShowAnswer] = useState<any>({});

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    getClientDataFunc();
    // get question
    questionSvc.getQ(id, { checkFeedback: true }).then((ques) => {
      setQuestion(ques);

      questionChange(ques);

      setSecondLenguage(
        ques.questionText.match(/\{\s{0,1}Hindi|Marathi|English\s{0,1}\}/i)
      );
      setCodingLanguages(getCodeLanguages());

      if (secondLenguage != null) {
        const newTxt = ques.questionText.split("{");
        for (let i = 1; i < newTxt.length; i++) {
          const updatedDayRanger = [...dayRanger, newTxt[i].split("}")[0]];
          setDayRanger(updatedDayRanger);
        }
      }

      loadRecommendedVideos(ques);
    });
  }, []);

  const watchVideo = (link: any) => {
    setWatchingVid({
      ...watchingVid,
      link: link,
    });

    setTimeout(() => {
      document.getElementById("openModalButton").click();
    }, 500);
  };

  const loadRecommendedVideos = (q?: any) => {
    if (!q) {
      q = question;
    }
    const topic = q?.topic._id;
    if (loadedTopics[topic]) {
      setQuestion({
        ...q,
        videos: loadedTopics[topic],
      });
    } else {
      contentService
        .getContentsTaggedWithTopic(topic, { ...params, includeCount: true })
        .then((res: any) => {
          setLoadedTopics((prevState) => ({
            ...prevState,
            [topic]: byPassSecurity(res.contents),
          }));
          setQuestion({
            ...q,
            videos: byPassSecurity(res.contents),
          });
          setVideoCount(res.count);
        })
        .catch((err) => {
          setQuestion({
            ...q,
            videos: [],
          });
        });
    }
  };

  const loadMoreVideo = () => {
    setParams({
      ...params,
      page: params.page + 1,
    });
    const topic = question.topic._id;
    contentService
      .getContentsTaggedWithTopic(topic, params)
      .then((res: any) => {
        this.loadedTopics[topic] = this.byPassSecurity(res.contents);
        setLoadedTopics((prevState) => ({
          ...prevState,
          [topic]: byPassSecurity(res.contents),
        }));
        setQuestion({
          ...question,
          videos: question.videos.concat(byPassSecurity(res.contents)),
        });
      })
      .catch((err) => {
        setQuestion({
          ...question,
          videos: [],
        });
      });
  };

  const openSketch = () => {
    setShowSketchpad(!showSketchpad);
  };

  const onScratchpadDrawing = (ev: any) => {
    if (question._id == ev.q) {
      if (!question.scratchPad) {
        setQuestion({
          ...question,
          scratchPad: [],
        });
      }
      setQuestion((prevState) => ({
        ...prevState,
        scratchPad: [...prevState.scratchPad, ev.data],
      }));
    }
  };

  const questionChange = (q: any) => {
    q.showHeader = q.questionHeader && q.questionHeader.length < 250;
    questionSvc
      .personalTopicAnalysis(q._id)
      .then((res: any) => {
        setHasTopicAnalysisData(true);
        setTopicAnalysis(res);
      })
      .catch((err) => {
        setHasTopicAnalysisData(false);
      });

    if (q.category == "mcq") {
      q.correctAnswerCount = q.answers.filter((a) => a.isCorrectAnswer).length;
    }
  };

  const updateCount = (content: any) => {
    let viewCount = 0;
    if (content.viewed) {
      viewCount = content.viewed + 1;
    } else {
      viewCount = 1;
    }
    const params = {
      id: content._id,
      viewCount: viewCount,
      feedback: false,
    };
    contentService.updateCount(params).then((data) => {
      console.log(data, "===>");
    });
  };

  const redirectToContent = (content: any) => {
    updateCount(content);

    let url = "";
    if (content.filePath) {
      url = getElearningFullPath(settings.baseUrl, content.filePath);
    } else {
      url = content.link;
    }
    window.open(url, "_blank");
  };

  const getQuestionPerformance = () => {
    if (id) {
      questionSvc
        .getQuestionPerformanceByTest(question._id, id)
        .then((res: any) => {
          setQuestionPerformance(res.percentCorrect);

          if (res.answerStats && res.answerStats.length) {
            let total = 0;
            res.answerStats.forEach((st) => {
              total += st.totalSelected;
            });

            for (const ans of question.answers) {
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
        });
    }
  };

  const byPassSecurity = (items: any) => {
    return items.map((item) => {
      if (item.url) {
        item.url = embedVideo(item.url);
      } else {
        item.local = true;
        item.url = embedVideo(
          getElearningFullPath(settings.baseUrl, item.filePath)
        );
      }
      return item;
    });
  };

  const openVideoExp = (question: any) => {
    setTimeout(() => {
      setAnswerExplainVideo(question.answerExplainVideo);

      setVideoTemplate(true);
    });
  };

  const reportIssue = () => {
    // const mdref = this.modalSvc.show(QuestionFeedbackComponent, {
    //   ignoreBackdropClick: true,
    //   keyboard: false,
    //   initialState: {
    //     practiceId: this.testId,
    //     questionId: this.question._id,
    //     userId: this.user._id
    //   }
    // })
    // mdref.content.onClose.subscribe(result => {
    //   if (result) {
    //     this.question.hasFeedback = true
    //   }
    // })
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

  const track = (index, item) => {
    return item._id;
  };

  const openCalculatorModal = () => {
    // if (calculatorModal && !this.calculatorModal.isOpen) {
    //   this.calculatorModal.open()
    //   this.toggleCal = true
    //   this.calculatorModal.isOpen$.pipe(filter(x => !x), take(1)).subscribe(val => {
    //     this.toggleCal = val
    //   })
    // }
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

  const refreshPage = () => {
    const tmp = question;
    setQuestion(null);
    setTimeout(() => {
      setQuestion(tmp);
    }, 100);
  };

  const returnFunc = () => {
    router.back();
  };

  const toggleAnswer = () => {
    setShowAnswer({
      ...showAnswer,
      [question._id]: !showAnswer[question._id],
    });
  };

  return (
    <>
      <div className="adaptive-question-header">
        <div className="container">
          <div className="adaptive-header-area mx-auto mw-100 d-none d-lg-block ">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <div className="navbar-brand clearfix p-0 m-0 d-flex align-items-center">
                <figure className="user_img_circled_wrap mt-0">
                  <div
                    className="avatar"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  ></div>
                </figure>

                <span className="ml-2 p-0">{user.name}</span>
              </div>

              <div className="navbar-nav ml-auto">
                <div className="finish-btn">
                  <a
                    className="text-center text-white px-2"
                    onClick={returnFunc}
                  >
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
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  ></div>
                </figure>

                <span className="ml-2 p-0">{user.name}</span>
              </div>
            </div>
            <div className="d-flex">
              <div className="finish-btn position-relative mr-0">
                <a className="text-center text-white px-2" onClick={returnFunc}>
                  Return
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="adaptive-question">
        <div className="container">
          <div className="adaptive-question-area mx-auto mw-100">
            <div className="heading">
              <div className="d-flex align-items-center gap-xs">
                <h6 className="h6 mb-0">Question</h6>

                <a className="btn" onClick={refreshPage} title="refresh">
                  <i className="fas fa-sync"></i>
                </a>

                {/* {id && question && (
                  <a className="btn text-danger" onClick={reportIssue}>
                    <i className={question.hasFeedback ? "fas fa-flag" : "far fa-flag"}></i>
                  </a>
                )} */}

                {question && (
                  <a className="btn text-primary" onClick={toggleAnswer}>
                    <i
                      className={
                        showAnswer[question._id]
                          ? "fas fa-eye"
                          : "far fa-eye-slash"
                      }
                    ></i>
                  </a>
                )}
              </div>
            </div>
            {question ? (
              <div>
                <div className="adaptive-question-box bg-white ans">
                  {question.category === "mcq" ? (
                    <div className="adaptive-question-item span-black row">
                      <div className="col">
                        {question.questionHeader && (
                          <div
                            className="question-header"
                            style={{ fontSize: "19px", marginTop: "10px" }}
                          >
                            {question.showHeader ? (
                              <div>
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

                        <div className="question-item mb-3">
                          <MathJax
                            value={question.questionText}
                            className="ques-mathjax"
                          />

                          {question.audioFiles?.length > 0 && (
                            <div className="row no-gutters">
                              {question.audioFiles.map((audio, index) => (
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
                          )}
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
                      {(question.questionHeader ||
                        question.category !== "fib") && (
                        <div className="adaptive-question-item span-black">
                          {question.questionHeader && (
                            <div className="question-header">
                              {question.showHeader ? (
                                <div>
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
                          {question.category !== "fib" && (
                            <div className="question-item mb-3">
                              <MathJax value={question.questionText} />
                              {question.audioFiles?.length > 0 && (
                                <div className="row no-gutters">
                                  {question.audioFiles.map((audio, index) => (
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
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {question.category === "fib" && (
                        <div>
                          {showAnswer[question._id] && (
                            <div>
                              <i
                                className={`float-right ${
                                  question.isUserAnsweredCorrect
                                    ? "fas fa-check text-info"
                                    : "far fa-dot-circle text-danger"
                                }`}
                              ></i>
                              {!question.isUserAnsweredCorrect ? (
                                <MathJax
                                  value={replaceQuestionText(
                                    question,
                                    "review"
                                  )}
                                ></MathJax>
                              ) : (
                                <MathJax
                                  value={replaceQuestionText(question, true)}
                                />
                              )}
                            </div>
                          )}
                          {!showAnswer[question._id] && (
                            <MathJax
                              value={replaceUserAnswer(question, "hidden")}
                            />
                          )}
                          {question.audioFiles?.length > 0 && (
                            <div className="row">
                              {question.audioFiles.map((audio, index) => (
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
                          )}
                        </div>
                      )}
                      {question.category === "descriptive" && (
                        <div className="exp mb-3">
                          <h5>Your answer:</h5>
                          {question.userAnswers && question.userAnswers[0] && (
                            <>
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
                            </>
                          )}
                        </div>
                      )}
                      {question.category === "code" && (
                        <>
                          <div className="rounded-boxes bg-light">
                            <div className="clearfix">
                              <h6 className="pull-left">
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
                              </h6>
                              <div
                                className="pull-right"
                                style={{ margin: "10px 0px" }}
                              >
                                <i
                                  className={`fa ${
                                    question.answers[0].isCorrectAnswerOfUser
                                      ? "fa-check text-info"
                                      : "fa-dot-circle-o text-danger"
                                  }`}
                                ></i>
                              </div>
                            </div>
                            <CodeMirror value={question?.answers[0].code} />
                          </div>
                          <div className="rounded-boxes bg-light">
                            {/* <Tabs title="Output" key="output"> */}
                            <div>
                              {!question.hasNoAnswer && (
                                <div>
                                  <label>Compile Message</label>
                                </div>
                              )}
                              {!question.hasNoAnswer && (
                                <div>
                                  <textarea
                                    value={question.answers[0].compileMessage}
                                    readOnly
                                    style={{
                                      width: "100%",
                                      resize: "none",
                                      height: "75px",
                                    }}
                                  ></textarea>
                                </div>
                              )}
                              {(question.answers[0].userInput ||
                                question.answers[0].userArgs) && (
                                <div>
                                  <div>
                                    <label>Your Args</label>
                                    <textarea
                                      value={question.answers[0].userArgs}
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
                                    <div>
                                      <label>Your Input</label>
                                      <textarea
                                        value={question.answers[0].userInput}
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
                                  )}
                                  <div>
                                    <label>Your Output</label>
                                  </div>
                                  <div>
                                    <textarea
                                      value={question.answers[0].output}
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
                                </div>
                              )}

                              <div className="rounded-boxes bg-light">
                                <div className="clearfix">
                                  <h6 className="pull-left">Solutions</h6>

                                  <select
                                    className="pull-right"
                                    value={selectedLang}
                                    onChange={(e) =>
                                      setSelectedLang(e.target.value)
                                    }
                                    style={{ float: "right" }}
                                  >
                                    {question.coding.map((lang, index) => (
                                      <option key={index} value={lang}>
                                        {lang.display}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <CodeMirror
                                  value={selectedLang.solution}
                                ></CodeMirror>

                                {/* <textarea
                                    value={selectedLang.solution}
                                    style={{ width: '100%', resize: 'none', height: '300px' }} // Adjust height as needed
                                    readOnly
                                  ></textarea> */}
                              </div>
                            </div>
                            {/* </Tabs> */}
                            {/* <Tabs title="Stats" key="stats"> */}
                            {(selectedLang.language === "cpp" ||
                              selectedLang.language === "c" ||
                              selectedLang.language === "java") && (
                              <div className="row">
                                <div className="col-sm-6">
                                  <span>Time taken to compile (ms)</span>
                                </div>
                                <div className="col-sm-6 text-right">
                                  <span>
                                    {stats[selectedLang.language]?.compileTime}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="row">
                              <div className="col-sm-6">
                                <span>Time taken to run (ms)</span>
                              </div>
                              <div className="col-sm-6 text-right">
                                <span>
                                  {stats[selectedLang.language]?.runTime}
                                </span>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-6">
                                <span>Number of test cases passed</span>
                              </div>
                              <div className="col-sm-6 text-right">
                                {/* <span>{stats[selectedLang.language]?.testcasesPassed}/{stats[selectedLang.language]?.totalTestcases}</span> */}
                              </div>
                            </div>
                            <h6>Execution Statistics</h6>
                            <div className="row">
                              <div className="col-sm-9">
                                <span>Time taken to submit</span>
                              </div>
                              <div className="col-sm-3 text-right">
                                <span>
                                  {stats[selectedLang.language]?.timeToSubmit}
                                </span>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-9">
                                <span>Number of compiles attempts made</span>
                              </div>
                              <div className="col-sm-3 text-right">
                                <span>
                                  {stats[selectedLang.language]?.attempts}
                                </span>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-9">
                                <span>
                                  Number of compilation attempts witnessing a
                                  successful compile
                                </span>
                              </div>
                              <div className="col-sm-3 text-right">
                                <span>
                                  {
                                    stats[selectedLang.language]
                                      ?.successAttempts
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
                                    stats[selectedLang.language]
                                      ?.timeoutAttempts
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
                                  {stats[selectedLang.language]?.errorAttempts}
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
                                {/* <span>{stats[selectedLang.language]?.avgCasesPassed}%</span> */}
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
                                    stats[selectedLang.language]
                                      ?.avgTimeBetweenAttempts
                                  }
                                </span>
                              </div>
                            </div>
                            {/* </Tabs> */}
                            {/* <Tabs title="Test Cases" key="test-cases"> */}
                            {/* {question.testcases.map((testcase, index) => (
                                <div key={index} style={{ display: 'table', width: '100%', padding: '10px' }}>
                                  <div style={{ display: 'table', width: '100%' }}>
                                    <div style={{ display: 'table-row' }} className="code-display">
                                      <div style={{ display: 'table-cell', width: '1%', padding: '10px', verticalAlign: 'top' }}>Argument</div>
                                      <div style={{ display: 'table-cell' }}>
                                        <textarea
                                          value={testcase.args}
                                          readOnly
                                          style={{ resize: 'none', height: 'auto', width: '100%', color: 'black', padding: '2px 5px' }}
                                        ></textarea>
                                      </div>
                                      {question.hasUserInput && (
                                        <>
                                          <div style={{ display: 'table-cell', width: '1%', padding: '10px', verticalAlign: 'top' }}>Input</div>
                                          <div style={{ display: 'table-cell' }}>
                                            <textarea
                                              value={testcase.input}
                                              readOnly
                                              style={{ resize: 'none', height: 'auto', width: '100%', color: 'black', padding: '2px 5px' }}
                                            ></textarea>
                                          </div>
                                        </>
                                      )}
                                      <div style={{ display: 'table-cell', width: '1%', whiteSpace: 'nowrap', padding: '10px', verticalAlign: 'top', textAlign: 'right' }}>Expected output</div>
                                      <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
                                        <textarea
                                          value={testcase.output}
                                          readOnly
                                          style={{ resize: 'none', height: 'auto', maxHeight: '75px', width: '100%', color: 'black', padding: '2px 5px' }}
                                        ></textarea>
                                      </div>
                                      <div style={{ display: 'table-cell', width: '1%', whiteSpace: 'nowrap', padding: '10px', verticalAlign: 'top' }}>
                                        {testcase.status ? (
                                          <i className="fa fa-check pull-right text-info"></i>
                                        ) : (
                                          <i className="fa fa-dot-circle-o pull-right text-danger"></i>
                                        )}
                                      </div>
                                    </div>
                                    {!testcase.status && testcase.studentCodeOutput && (
                                      <div style={{ display: 'table-row' }} className="code-display">
                                        <div style={{ display: 'table-cell', width: '1%' }}></div>
                                        <div style={{ display: 'table-cell' }}></div>
                                        {question.hasUserInput && <div style={{ display: 'table-cell', width: '1%' }}></div>}
                                        {question.hasUserInput && <div style={{ display: 'table-cell' }}></div>}
                                        <div style={{ display: 'table-cell', width: '1%', whiteSpace: 'nowrap', padding: '10px', verticalAlign: 'top', textAlign: 'right' }}>Your output</div>
                                        <div style={{ display: 'table-cell', padding: '10px' }}>
                                          <div className="preserve-newline" style={{ color: 'red' }}>{testcase.studentCodeOutput}</div>
                                        </div>
                                        <div style={{ display: 'table-cell', width: '1%', whiteSpace: 'nowrap', padding: '10px', verticalAlign: 'top' }}></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))} */}
                            {/* </Tabs> */}
                          </div>
                        </>
                      )}
                      {question.category === "mixmatch" && (
                        <div className="question-review">
                          <div className="mix-match row">
                            <div className="col-5 mix-match-content ">
                              {question.answers.map((ans) => (
                                <div className="mix-match-drag" key={ans.id}>
                                  <MathJax value={ans.answerText} />
                                </div>
                              ))}
                            </div>

                            <div className="col-5 ml-auto">
                              <div className="mix-match-drop-wrap w-100">
                                {question.answers.map((a) => (
                                  <div
                                    className="mix-match-dragd border-0"
                                    key={a.id}
                                  >
                                    <MathJax value={a.userText} />

                                    {showAnswer[question._id] && (
                                      <div
                                        className="pull-right"
                                        style={{ float: "right" }}
                                      >
                                        {a.isCorrectAnswerOfUser ? (
                                          <i className="fas fa-check pull-right text-info"></i>
                                        ) : (
                                          <i className="far fa-dot-circle pull-right text-danger"></i>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {showAnswer[question._id] &&
                            !question.isUserAnsweredCorrect && (
                              <div>
                                <h1 className="h4 text-dark">Correct Answer</h1>
                                <div className="mix-match row">
                                  <div className="col-5 mix-match-content">
                                    {question.answers.map((ans) => (
                                      <div
                                        className="mix-match-drag"
                                        key={ans.id}
                                      >
                                        <MathJax value={ans.answerText} />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="col-5 ml-auto">
                                    <div className="mix-match-content w-100">
                                      {question.answers.map((ans) => (
                                        <div
                                          className="mix-match-dragd"
                                          key={ans.id}
                                        >
                                          <MathJax value={ans.correctMatch} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {question && (
                  <div className="question-details">
                    <div className="dropdown text">
                      <b>Subject:</b> {question.subject.name} |<b>Unit:</b>{" "}
                      {question.unit.name} |<b>Topic:</b> {question.topic.name}
                      {questionPerformance > 0 && (
                        <span>
                          | <b>Students solved correctly:</b>{" "}
                          {questionPerformance.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {question?.answerExplain && showAnswer[question._id] && (
                  <div className="vedio-section mt-2 mb-2">
                    <div className="vedio-section-box">
                      <div className="d-flex justify-content-between">
                        <h3>Explanation</h3>
                        {question.answerExplain &&
                          question.answerExplainVideo && (
                            <button
                              className="btn btn-primary m-2"
                              onClick={() => openVideoExp(question)}
                            >
                              Video Explanation
                            </button>
                          )}
                      </div>
                      <div className="vedio-body exp pt-2">
                        <p>
                          <MathJax value={question.answerExplain} />
                        </p>

                        {question.answerExplainAudioFiles?.length > 0 && (
                          <div className="row">
                            {question.answerExplainAudioFiles.map(
                              (audio, index) => (
                                <div
                                  key={index}
                                  className="position-relative my-2 col-lg-6 col-12"
                                >
                                  <label>{audio.name}</label>
                                  <audio
                                    controls
                                    src={audio.url}
                                    className="w-100"
                                  />
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
                  question.videos.length > 0 &&
                  showAnswer[question._id] && (
                    <div className="vedio-section mt-3 mb-2">
                      <div className="vedio-section-box">
                        <div className="vedio-name">
                          <h3>Recommended Learning</h3>
                        </div>
                        <div className="vedio-body">
                          <div className="row">
                            {question.videos.map((video, index) => (
                              <div
                                key={index}
                                className="col-sm-12 col-md-6 col-lg-4"
                              >
                                <div className="vedio-cart">
                                  <div className="image">
                                    {video.local ? (
                                      <video
                                        className="w-100"
                                        height="180"
                                        controls
                                      >
                                        <source
                                          src={video.url}
                                          autostart="false"
                                        />
                                      </video>
                                    ) : (
                                      <iframe
                                        className="w-100"
                                        height="180"
                                        src={video.url}
                                        frameBorder="0"
                                        allowFullScreen
                                      />
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
                          <div className="text-center">
                            {question.videos.length < videoCount && (
                              <a
                                className="btn btn-light"
                                onClick={loadMoreVideos}
                              >
                                Load More
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="adaptive-question-box bg-white ans">
                <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                <hr />
                <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
              </div>
            )}
          </div>
        </div>
      </div>
      {question && (
        <>
          {/* <app-calculator ref={scModalRef}></app-calculator>

          <graphing-calculator-modal ref={graphingModalRef}></graphing-calculator-modal> */}
          {toggleCal && (
            <CalculatorModal
              show={toggleCal}
              onClose={() => setToggleCal(false)}
            />
          )}

          {showSketchpad && (
            <ScratchPad
              question={question}
              onClose={() => setShowSketchpad(false)}
            />
          )}
        </>
      )}

      <Modal
        show={videoTemplate}
        onHide={() => setVideoTemplate(false)}
        backdrop="static"
        keyboard={false}
        className=""
      >
        <div className="modal-header">
          <AppLogo />
          <a className="pull-right" onClick={() => setVideoTemplate(false)}>
            <i className="fas fa-times"></i>
          </a>
        </div>
        <div className="modal-body">
          <VideoPlayer
            link={answerExplainVideo}
            height={400}
            show={videoTemplate}
            setShow={setVideoTemplate}
          />
        </div>
      </Modal>
    </>
  );
};

export default QuestionView;
