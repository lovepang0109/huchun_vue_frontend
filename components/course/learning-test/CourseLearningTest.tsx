import { useState, useEffect, useRef } from "react";
import MathJax from "@/components/assessment/mathjax";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { formatQuestion, replaceQuestionText } from "@/lib/pipe";
import clientApi from "@/lib/clientApi";
import { deepCopy } from "@/lib/common";
import { useTakeTestStore } from "@/stores/take-test-store";
import { Modal } from "react-bootstrap";
import {
  getQuestionByTest,
  getQuestionFeedbacks,
} from "@/services/questionService";
import { useParams } from "next/navigation";
import { success, alert } from "alertifyjs";

const TeacherCourseLearningTest = ({
  user,
  settings,
  content,
  finished,
}: any) => {
  const { order } = useParams();
  const [questions, setQuestions] = useState<any>([]);
  const [showAnswer, setShowAnswer] = useState<any>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFinish, setIsFinish] = useState<boolean>(false);
  const [totalQuestion, setTotalQuestion] = useState<any>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [question, setQuestion] = useState<any>();
  const [codingLanguages, setCodingLanguages] = useState<any>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedLang, setSelectedLang] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>("");
  const [feedbackSubmitting, setFeedbacksubmitting] = useState<boolean>(false);
  const [reportCheckboxs, setReportCheckboxs] = useState({
    ckFrame: false,
    ckExplanation: false,
    ckLearningVideo: false,
    ckMore: false,
    ckAnother: false,
    txtAnother: "",
  });

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

  const onTextAnotherChange = (event: any) => {
    setReportCheckboxs((prevState) => ({
      ...prevState,
      txtAnother: event.target.value,
    }));
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

  const feedbackSubmit = (e: any) => {
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

    const qFeedbacks: any = {
      teacherId: user._id,
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
        success("Your feedback is submitted.");
      })
      .catch(() => {
        setFeedbacksubmitting(false);
        alert("Feedback error", "Failed to submit your feedback.");
      });
  };

  useEffect(() => {
    setLoading(true);
    getQuestionByTextFun();
  }, []);

  const getQuestionByTextFun = async () => {
    getQuestionByTest(content.source).then((res: any) => {
      let currPageData = currPage;
      let questionsData = res;
      let questionData = question;
      setTotalQuestion(questionsData.length);

      if (order) {
        try {
          currPageData = Number(order);
          questionData = questionsData[currPageData - 1];
        } catch (exx) {
          currPageData = 1;
          questionData = questionsData[0];
        }
      } else {
        currPageData = 1;
        questionData = questionsData[0];
      }
      setCurrPage(currPageData);
      handleNewQuestion(questionData);

      getQuestionFeedbacks({
        practiceSet: content.source,
        studentId: user._id,
        idOnly: true,
      }).then((qs: any[]) => {
        questionsData.forEach((q: any) => {
          if (qs.indexOf(q._id) > -1) {
            q.hasFeedback = true;
          }
        });
      });
      setQuestions(questionsData);
      setQuestion(questionData);
      setLoading(false);
    });
  };

  const handleNewQuestion = (questionData: any) => {
    if (questionData.category == "code") {
      const codingLanguageData = codingLanguages || [];
      let statsData = stats || [];

      // Load list of language
      questionData.coding.forEach((c: any) => {
        if (c.language === "python") {
          codingLanguageData.push({
            display: "Python",
            language: "python",
          });
          c.display = "Python";
        } else if (c.language === "c") {
          codingLanguageData.push({
            display: "C",
            language: "c",
          });
          c.display = "C";
        } else if (c.language === "cpp") {
          codingLanguageData.push({
            display: "C++",
            language: "cpp",
          });
          c.display = "C++";
        } else if (c.language === "java") {
          codingLanguageData.push({
            display: "Java",
            language: "java",
          });
          c.display = "Java";
        } else if (c.language == "ruby") {
          codingLanguageData.push({
            display: "Ruby",
            language: "ruby",
          });
          c.display = "Ruby";
        }

        if (!stats) {
          statsData = {};
        }

        statsData[c.language] = {
          compileTime: 0,
          runTime: 0,
          testcasesPassed: 0,
          totalTestcases: 0,
        };
      });
      setSelectedLang(questionData.coding[0]);
      setCodingLanguages(codingLanguageData);
      setStats(statsData);
    }
  };

  const nextQuestion = async (finish: any = 0) => {
    window.scrollTo(0, 0);
    if (finish) {
      setIsFinish(true);
      finished({ redirect: true });
      return;
    }

    setShowAnswer(false);

    if (questions[currPage]) {
      setQuestion(questions[currPage]);
      setCurrPage(currPage + 1);

      handleNewQuestion(questions[currPage]);
    }
  };

  const previousQuestion = () => {
    if (questions[currPage - 2]) {
      setShowAnswer(false);
      setQuestion(questions[currPage - 2]);
      setCurrPage(currPage - 1);
      handleNewQuestion(questions[currPage - 2]);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
    if (!showAnswer && question.category == "code") {
      setTimeout(() => {
        refreshCodeMirror();
      }, 500);
    }
  };

  const refreshCodeMirror = () => {
    // if (codeSrc) {
    //   codeSrc.codeMirror.refresh()
    // }
  };

  const createClassBoard = (question: any) => {
    // createClassBoard(question._id).then((res: any) => {
    //   sessionStorage.setItem('classboard_org', `/${this.authSvc.userRole}/course/view-mode/${this.courseId}?content=${this.content._id}&order=${this.currPage}`)
    //   route.push(['/classboard', res.code])
    // })
    alert("Comming soon", "This page is ready soon");
  };

  const reportIssue = () => {
    setShowReportModal(true);
  };
  console.log(question?.questionHeader);
  console.log(formatQuestion(question?.questionHeader));
  return (
    <>
      <div className="adaptive-question mt-lg-0 mt-4 p-0">
        <div className="adaptive-question-area mx-auto mw-100">
          {loading ? (
            <div className="position-relative">
              <SkeletonLoaderComponent Cwidth="100" Cheight="300" />
            </div>
          ) : (
            <>
              <div className="heading">
                <div className="d-flex justify-content-between">
                  <ul className="nav info pl-0 mb-3">
                    <li className="p-0">Question</li>
                    <li className="count text-center clearfix">
                      <span className="text-white">{currPage}</span>
                      <span className="text-white"> / </span>
                      <span className="text-white">{totalQuestion}</span>
                    </li>
                  </ul>
                  <div>
                    {/* Report Issue Button */}
                    <a onClick={reportIssue} className="mr-3 text-danger">
                      <i
                        className={`fa-flag ${question?.hasFeedback ? "fas" : "far"
                          }`}
                      ></i>
                    </a>

                    {/* Open Class Board Button */}
                    {settings?.features.classboard &&
                      user.primaryInstitute?.preferences?.classboard &&
                      (question?.category === "mcq" ||
                        question?.category === "code") && (
                        <a
                          onClick={() => createClassBoard(question)}
                          className="mr-3"
                          title="Open Class Board"
                        >
                          <i className="fa fa-share f-16"></i>
                        </a>
                      )}

                    {/* Toggle Answer Button */}
                    {question?.category !== "descriptive" && (
                      <a onClick={toggleAnswer} title="Toggle Answer">
                        <i
                          className={`far f-16 ${showAnswer ? "fa-eye" : "fa-eye-slash"
                            }`}
                        ></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="adaptive-question-box bg-white ans">
                {question?.questionHeader || question?.category != "fib" ? (
                  <div className="question-item span-black">
                    {question?.questionHeader && (
                      <div className="question-header">
                        <MathJax
                          value={formatQuestion(question?.questionHeader)}
                        />
                        <hr />
                      </div>
                    )}
                    {question?.category != "fib" &&
                      question?.category !== "mixmatch" ? (
                      <div className="question-item mb-3">
                        <MathJax
                          value={formatQuestion(question?.questionText)}
                        />
                        {question?.audioFiles?.length ? (
                          <div className="row">
                            {question?.audioFiles.map(
                              (audio: any, i: number) => (
                                <div
                                  className="position-relative my-2 col-lg-6 col-12"
                                  key={"audio_file" + i}
                                >
                                  <label>{audio.name}</label>
                                  <audio controls className="w-100">
                                    <source src={audio.url} type="audio/mpeg" />
                                  </audio>
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
                {question?.category === "mcq" &&
                  (showAnswer ? (
                    <div className="adaptive-answer-box">
                      <ul>
                        {question?.answers.map((answer: any, index: number) => (
                          <li
                            className={`mb-2 ${answer.isCorrectAnswer &&
                              answer.isCorrectAnswerOfUser !== false
                              ? "green"
                              : ""
                              } ${answer.isCorrectAnswerOfUser === false
                                ? "red"
                                : ""
                              }`}
                            key={"section" + index}
                          >
                            <div className="d-flex answer">
                              <div className="checkbox-group">
                                <label>
                                  <input
                                    disabled
                                    name={`answer_${index}`}
                                    type="checkbox"
                                    checked={answer.isCheckedByUser}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </div>

                              <span className="answer-text">
                                <MathJax value={answer.answerText} />
                              </span>
                            </div>
                            {answer.audioFiles?.length ? (
                              <div className="row">
                                {answer.audioFiles.map(
                                  (audio: any, i: number) => (
                                    <div
                                      className="position-relative my-2 col-lg-6 col-12"
                                      key={"audio" + i}
                                    >
                                      <label>{audio.name}</label>
                                      <audio controls className="w-100">
                                        <source
                                          src={audio.url}
                                          type="audio/mpeg"
                                        />
                                      </audio>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <></>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="adaptive-answer-box">
                      <ul>
                        {question?.answers.map((answer: any, index: number) => (
                          <li className="mb-2" key={"section" + index}>
                            <div className="d-flex answer">
                              <div className="checkbox-group">
                                <label>
                                  <input
                                    disabled
                                    name={`answer_${index}`}
                                    type="checkbox"
                                    checked={answer.isCheckedByUser}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </div>

                              <span className="answer-text">
                                <MathJax value={answer.answerText} />
                              </span>
                            </div>
                            {answer.audioFiles?.length ? (
                              <div className="row">
                                {answer.audioFiles.map(
                                  (audio: any, i: number) => (
                                    <div
                                      className="position-relative my-2 col-lg-6 col-12"
                                      key={"audio" + i}
                                    >
                                      <label>{audio.name}</label>
                                      <audio controls className="w-100">
                                        <source
                                          src={audio.url}
                                          type="audio/mpeg"
                                        />
                                      </audio>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <></>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                {question?.category === "fib" && (
                  <div className="question-item">
                    <MathJax
                      value={replaceQuestionText(
                        question?.questionText,
                        question
                      )}
                    />
                  </div>
                )}
                {question?.category === "descriptive" && (
                  <div className="exp mb-3"></div>
                )}
                {question?.category === "code" && (
                  <>{/* TODO: coding question component */}</>
                )}
                {question?.category === "mixmatch" && (
                  <div className="question-review">
                    <div className="mix-match row">
                      <div className="col-5 mix-match-content ">
                        {question?.answers.map((ans: any, i: number) => (
                          <div className="mix-match-drag" key={"answer" + i}>
                            <MathJax value={ans.answerText} />
                          </div>
                        ))}
                      </div>

                      <div className="col-5 ml-auto">
                        <div className="mix-match-drop-wrap w-100">
                          {question?.answers.map((a: any, i: number) => (
                            <div
                              className="mix-match-dragd border-0"
                              key={"answer" + i}
                            >
                              {showAnswer ? (
                                <span>
                                  <MathJax value={a.correctMatch} />
                                </span>
                              ) : (
                                <></>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {showAnswer && question?.answerExplain && (
                <div className="adaptive-question-box bg-white ans">
                  <div className="exp pt-2">
                    <h5>Explanation:</h5>
                    <p>
                      <MathJax value={question.answerExplain} />
                    </p>

                    {question.answerExplainAudioFiles?.length && (
                      <div className="row">
                        {question.answerExplainAudioFiles.map(
                          (audio: any, i: number) => (
                            <div
                              key={i}
                              className="position-relative my-2 col-lg-6 col-12"
                            >
                              <label>{audio.name}</label>
                              <audio controls className="w-100">
                                <source src={audio.url} type="audio/mpeg" />
                              </audio>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end">
                {currPage > 1 && (
                  <a
                    className="btn btn-primary mx-2"
                    onClick={() => previousQuestion()}
                  >
                    Previous Question
                  </a>
                )}
                {currPage !== totalQuestion && (
                  <a className="btn btn-primary" onClick={() => nextQuestion()}>
                    Next Question
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Modal
        show={showReportModal}
        onHide={() => { }}
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
                        onChange={(e: any) => onTextAnotherChange(e)}
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
              disabled={feedbackSubmitting}
              onClick={(e: any) => feedbackSubmit(e)}
            >
              Report
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TeacherCourseLearningTest;
