import { useState, useEffect, useRef } from "react";
import MathJax from "@/components/assessment/mathjax";
import McqQuestion from "@/components/assessment/mcq-question";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import {
  formatQuestion,
  millisecondsToTime,
  replaceQuestionText,
  replaceUserAnswer,
} from "@/lib/pipe";
import {
  codeLanguageDisplay,
  numberToWord,
  toQueryString,
} from "@/lib/validator";
import { faDotCircle } from "@fortawesome/free-regular-svg-icons";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clientApi from "@/lib/clientApi";
import { deepCopy, questionStatus } from "@/lib/common";
import { alert, success, warning } from "alertifyjs";
import alertify from "alertifyjs";
import { useSession } from "next-auth/react";
import { useTakeTestStore } from "@/stores/take-test-store";
import { Tab, Tabs } from "react-bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import FibQuestion from "@/components/assessment/fib-question";
import CodingQuestion from "@/components/assessment/coding-question";
import LearningTestReportModal from "../stage/ReportModal";
import CourseAttempt from "./CourseAttempt";

interface props {
  viewmode?: boolean;
  courseId: string;
  content: any;
  finished: any;
  questionNumberChanged: any;
}

const CourseLearningTest = ({
  viewmode,
  courseId,
  content,
  finished,
  questionNumberChanged,
}: props) => {
  const codingRef: any = useRef();
  const { clientData, codingQuestion } = useTakeTestStore();
  const { user } = useSession().data || {};
  const [loading, setLoading] = useState<boolean>(false);
  const [attemptId, setAttemptId] = useState<string>();
  const [showAttemptSummary, setShowAttemptSummary] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const [isFinish, setIsFinish] = useState<boolean>(false);
  const [test, setTest] = useState<any>();
  const [totalQuestion, setTotalQuestion] = useState<any>();
  const [QA, setQA] = useState<any[]>([]);
  const [currPage, setCurrPage] = useState<number>(1);
  const [attemptDetailId, setAttemptDetailId] = useState<string>();
  const [question, setQuestion] = useState<any>();
  const [reviewQuestion, setReviewQuestion] = useState<any>();
  const [qStartTime, setQStartTime] = useState<any>();
  const [newQuestion, setNewQuestion] = useState<any>();
  const [loadedQuestions, setLoadedQuestions] = useState<any>({});
  const [answers, setAnswers] = useState<any[]>([]);
  const [answersarray, setAnswersArray] = useState<any[]>([]);
  const [answer, setAnswer] = useState<any>();
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [codingLanguages, setCodingLanguages] = useState<any>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedLang, setSelectedLang] = useState<any>(null);
  const [hasNoAnswer, setHasNoAnswer] = useState<boolean>(true);
  const [feedbackSubmiting, setFeedbackSubmiting] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>("");
  const [qfeedbackForm, setQFeedbackForm] = useState<any>({
    ckFrame: false,
    ckMore: false,
    ckAnother: false,
    ckVideo: false,
    ckExp: false,
    txtAnother: "",
  });

  const codemirrorConfig = {
    theme: "default",
    lineNumbers: true,
    fullScreen: false,
    lineWrapping: true,
    foldGutter: true,
    autoCloseBrackets: "()[]{}''\"\"",
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: "text/x-java",
  };

  const setQuest = (val: any) => {
    let value = val;
    if (value && value.category === "mcq") {
      value = {
        ...value,
        correctAnswerCount: value.answers.filter((a: any) => a.isCorrectAnswer)
          .length,
      };
    }
    setQuestion(value);
    return value;
  };

  const takeQuiz = async () => {
    setShowAttemptSummary(false);
    setLoading(true);
    setReview(false);
    setIsFinish(false);
    const { data } = await clientApi.get(
      `/api/learningTest/getPracticeSet/${content.source}`
    );

    setAttemptId(data.attempt);
    setTest({ ...data.practice, attemptId: data.attempt });
    setTotalQuestion(data.practice.totalQuestion);
    setQA(data.QA);
    setCurrPage(Number(data.currPage));
    questionNumberChanged({ number: data.currPage });
    setAttemptDetailId(data.attemptDetailId);
    setQuest(data.question);
    setReviewQuestion(deepCopy(data.question));
    setQStartTime(new Date().getTime());
    setLoading(false);
    if (answers.length == 0) {
      let tanswers = answersarray;
      for (var i = 0; i < data.practice.totalQuestion; i++) {
        tanswers.push({});
      }

      setAnswersArray(tanswers);
    }
  };

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    const checkLastAttempt = async () => {
      setLoading(true);
      const { data } = await clientApi.get(
        `/api/learningTest/checkLastAttempt/${content.source}`
      );
      if (data._id) {
        setLoading(false);
        setAttemptId(data._id);
        setShowAttemptSummary(true);
      } else {
        takeQuiz();
      }
    };
    checkLastAttempt();
  }, []);

  const nextQuestion = async (finish: any = 0) => {
    let quest = question;
    window.scrollTo(0, 0);
    if (finish) {
      setIsFinish(true);
      setShowAttemptSummary(true);
      if (!content.completed) {
        finished({ showAttemptSummary: true });
      }
      return;
    }
    if (review) {
      getNextQuestion();
      return;
    }

    const keys = Object.keys(selectedAnswers);
    let answers = [];

    if (quest.category === "mcq") {
      for (let i = 0; i < keys.length; i++) {
        if (selectedAnswers[keys[i]] == true) {
          answers.push(keys[i]);
        }
      }
    } else if (quest.category === "fib") {
      if (quest.answers.length > 0) {
        quest.answers.forEach((doc: any, i: number) => {
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
    } else if (quest.category === "code") {
      if (answer && (answer.status || answer.status == 0)) {
        answers.push(answer);
      }
    } else if (quest.category == "descriptive") {
      if (quest.answerText || (quest.attachments && quest.attachments.length)) {
        answers.push({
          answerText: quest.answerText,
          attachments: quest.attachments,
        });
      }
    } else if (quest.category === "mixmatch") {
      if (quest.answers.length > 0) {
        answers = quest.answers;
      }
    }

    const spendTime = new Date().getTime() - qStartTime;

    if (answers.length > 0) {
      const parameters: any = {
        question: quest._id,
        answers: answers,
        index: currPage - 1,
        category: quest.category,
        testId: test._id,
        practiceset: test._id,
        finish: finish,
        attempt: attemptId,
        qSpendTime: spendTime,
      };
      setLoading(true);
      try {
        const { data } = await clientApi.post(
          "/api/learningTest/getQuestion",
          parameters
        );
        setLoading(false);
        if (data) {
          setSelectedAnswers({});
          if (finish === 1) {
            // testCompleted();
            setIsFinish(true);
            finished(true);
          } else {
            setNewQuestion(data);
            setQuest(deepCopy(reviewQuestion));
            checkAnswerQuestion(
              deepCopy(reviewQuestion),
              data.previousResponse
            );
            setReview(true);
            setQA((prev: any) => [...prev, data.previousResponse]);
            let loadedQuest = loadedQuestions;
            loadedQuest[data.previousResponse.question] = question;
            setLoadedQuestions(loadedQuest);
            return;
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      if (quest.category === "fib") {
        alertify
          .alert("Message", "Please enter your answer.")
          .setHeader("Message");
        return;
      }

      // if (!answer?.answer) {
      //   alertify.alert("Message","Please answer the question, or try your best guess.").setHeader('Message');
      //   return;
      // }
    }
    setQuest(quest);
  };

  const getNextQuestion = () => {
    console.log("getNextQuestion");
    setCurrPage(currPage + 1);
    questionNumberChanged({ number: currPage + 1 });
    localStorage.setItem(
      question.attemptID + "_currPage",
      (currPage + 1).toString()
    );
    const tmp_reviewQuestion = newQuestion
      ? deepCopy(newQuestion)
      : newQuestion;
    setReviewQuestion(tmp_reviewQuestion);
    if (QA[currPage]) {
      setQuestion(loadedQuestions[QA[currPage].question]);
      const quest = loadedQuestions[QA[currPage].question];

      checkAnswerQuestion(QA.find((q) => q.question == quest._id));
    } else {
      if (newQuestion) {
        setReview(false);
        setQStartTime(new Date().getTime());
        setAnswers([]);
        setSelectedAnswers([]);
        setQuestion(newQuestion);
      }
    }
  };

  const checkAnswerQuestion = (question: any, attempt: any) => {
    let quest: any = question;
    let stat: any = stats;
    let selected_lang = selectedLang;
    if (quest._id) {
      quest.timeEslapse = (attempt.timeEslapse / 1000).toFixed(0);
      const userAnswers = attempt.answers;
      const questionAnswers = [...quest.answers];
      quest.userAnswers = attempt.answers;

      if (quest.category == "code") {
        quest.answers = attempt.answers;

        let codingLang: any = [];

        // Load list of language
        quest.coding.forEach((c: any) => {
          if (c.language === "python") {
            codingLang.push({
              display: "Python",
              language: "python",
            });
            c.display = "Python";
          } else if (c.language === "c") {
            codingLang.push({
              display: "C",
              language: "c",
            });
            c.display = "C";
          } else if (c.language === "cpp") {
            codingLang.push({
              display: "C++",
              language: "cpp",
            });
            c.display = "C++";
          } else if (c.language === "java") {
            codingLang.push({
              display: "Java",
              language: "java",
            });
            c.display = "Java";
          } else if (c.language == "ruby") {
            codingLang.push({
              display: "Ruby",
              language: "ruby",
            });
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
        setCodingLanguages(codingLang);
        if (attempt.answers.length > 0) {
          setHasNoAnswer(false);
          quest.answers[0].isCorrectAnswerOfUser =
            attempt.status === questionStatus.CORRECT;
          selected_lang = quest.coding.find(
            (c: any) => c.language == attempt.answers[0].codeLanguage
          );

          if (attempt.answers[0].testcases) {
            let runTime = 0;
            let testPassed = 0;
            quest.testcases.forEach((t: any) => {
              const tc = attempt.answers[0].testcases.find((tc: any) => {
                return tc.input == t.input && tc.args == t.Args;
              });

              if (tc) {
                t.status = tc.status;
                t.studentCodeOutput = tc.output;

                runTime += tc.runTime;
                testPassed += t.status ? 1 : 0;
              }
            });
            console.log(
              selected_lang,
              stats,
              stats[selected_lang?.language],
              "00000000000"
            );
            const temp = stats;
            temp[selected_lang?.language] = {
              ...(stats[selected_lang?.language] && {
                ...stats[selected_lang?.language],
              }),
              compileTime: attempt.answers[0].compileTime,
              runTime: runTime,
              testcasesPassed: testPassed,
              totalTestcases: quest.testcases.length,
            };
            setStats(temp);
          }
        } else {
          setHasNoAnswer(true);
          selected_lang = quest.coding[0];
        }
      } else if (quest.category == "mcq" || quest.category == "fib") {
        for (const k in questionAnswers) {
          for (const j in userAnswers) {
            if (userAnswers[j].answerId) {
              if (userAnswers[j].answerId === questionAnswers[k]._id) {
                if (quest.category == "fib") {
                  quest.answers[k] = {
                    ...quest.answers[k],
                    isCorrectAnswerOfUser: !!(attempt.status == 1),
                  };
                  quest = {
                    ...quest,
                    isUserAnsweredCorrect: !!(attempt.status == 1),
                  };
                } else {
                  questionAnswers[k] = {
                    ...questionAnswers[k],
                    isCheckedByUser: true,
                  };
                  if (!questionAnswers[k].isCorrectAnswer) {
                    quest.answers[k] = {
                      ...quest.answers[k],
                      isCorrectAnswerOfUser: false,
                    };
                  }
                }
              }
            } else {
              if (userAnswers[j] === questionAnswers[k]._id) {
                questionAnswers[k] = {
                  ...questionAnswers[k],
                  isCheckedByUser: true,
                };
                if (!questionAnswers[k].isCorrectAnswer) {
                  quest.answers[k] = {
                    ...quest.answers[k],
                    isCorrectAnswerOfUser: false,
                  };
                }
              }
            }
          }
        }
      } else if (quest.category == "mixmatch") {
        quest = { ...quest, isUserAnsweredCorrect: true };
        for (let actualA of quest.answers) {
          actualA = { ...actualA, isCorrectAnswerOfUser: false };
          for (let userA of userAnswers) {
            if (actualA.answerText == userA.answerText) {
              actualA = { ...actualA, userText: userA.userText };
              if (actualA.correctMatch == userA.userText) {
                actualA = { ...actualA, isCorrectAnswerOfUser: true };
              }
              break;
            }
          }
          quest.isUserAnsweredCorrect &&= actualA.isCorrectAnswerOfUser;
        }
      }
      setStats(stat);
      setSelectedLang(selected_lang);
      setQuest(quest);
      setQuestion({
        ...question,
        answers: questionAnswers,
      });
      console.log(questionAnswers, "quest");
      return quest;
    }
  };

  const selectAnswer = (data: any) => {
    let { answer } = data;
    let selectedAns = selectedAnswers;
    if (question.questionType === "single") {
      question.answers.forEach((a: any) => {
        if (a._id != answer._id) {
          selectedAns[a._id] = false;
        }
      });
    }
    selectedAns[answer._id] = answer.isChecked;
    setSelectedAnswers(selectedAns);
    const temanswer = answersarray;
    temanswer[currPage - 1] = data;
    setAnswersArray(temanswer);
    console.log(selectedAns, data, answer, temanswer, "ans>>>>>");
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
    let quest = question;
    quest.answers[index] = {
      ...quest.answers[index],
      isChecked: !!text,
      answeredText: text,
      mathData: latex,
    };
  };

  const onDescriptiveUpdate = (event: any) => {};

  const onCodeUpdate = (event: any) => {
    setAnswer({
      ...event.answer,
      timeElapse: new Date().getTime() - qStartTime,
    });
  };

  const saveMixMatchAnswers = (event: any) => {};

  const feedbackSubmit = async () => {
    if (feedbackSubmiting) {
      return;
    }
    setFeedbackError("");
    if (
      !qfeedbackForm.ckFrame &&
      !qfeedbackForm.ckMore &&
      !qfeedbackForm.ckAnother &&
      !qfeedbackForm.ckExp &&
      !qfeedbackForm.ckVideo
    ) {
      setFeedbackError("Please select at least one option.");
      return;
    }

    if (
      qfeedbackForm.ckFrame +
        qfeedbackForm.ckMore +
        qfeedbackForm.ckAnother +
        qfeedbackForm.ckExp +
        qfeedbackForm.ckVideo >
      1
    ) {
      setFeedbackError("Please select only one option");
      return;
    }

    if (qfeedbackForm.ckAnother && !qfeedbackForm.txtAnother) {
      setFeedbackError("Please enter your comment.");
      return;
    }
    let qfeedback: any = {
      courseId: courseId,
      teacherId: test.user._id,
      practicesetId: test._id,
      attemptId: test.attemptId,
      questionId: question?._id,
      studentId: user?.info._id,
      feedbacks: [],
      comment: "",
    };

    if (qfeedbackForm.ckFrame) {
      qfeedback.feedbacks.push("The question isn’t framed correctly");
    }
    if (qfeedbackForm.ckMore) {
      qfeedback.feedbacks.push("Problem with one or more options");
    }
    if (qfeedbackForm.ckExp) {
      qfeedback.feedbacks.push(
        "Explanation is correct, unclear, or needs improvement"
      );
    }
    if (qfeedbackForm.ckVideo) {
      qfeedback.feedbacks.push(
        "Learning video is irrelevant, not loading, or inappropriate"
      );
    }
    if (qfeedbackForm.ckAnother) {
      qfeedback.comment = qfeedbackForm.txtAnother;
    }

    setFeedbackSubmiting(true);
    try {
      await clientApi.post("/api/feedbacks/questionFeedback", qfeedback);
      setFeedbackSubmiting(false);
      success("Your feedback is submitted.");
      feedbackClose();
    } catch (error) {
      setFeedbackSubmiting(false);
      warning("Failed to submit your feedback.");
    }
  };

  const feedbackClose = () => {
    setShowReportModal(false);
    setQFeedbackForm({
      ckFrame: false,
      ckMore: false,
      ckAnother: false,
      ckVideo: false,
      ckExp: false,
      txtAnother: "",
    });
  };

  const reportIssue = () => {
    // modalRef = modalSvc.show(reportModal, {
    //   ignoreBackdropClick: true,
    //   keyboard: false
    // })
    console.log("report");
    setShowReportModal(true);
  };

  const onFeedbackCheck = (event: any, checkProp: any) => {
    let qfeedbackF = qfeedbackForm;
    // if this prop is checked, uncheck others
    qfeedbackF[checkProp] = !qfeedbackF[checkProp];
    for (const prop in qfeedbackF) {
      if (prop != checkProp && qfeedbackF[prop] == true) {
        qfeedbackF[prop] = false;
      }
    }
    setQFeedbackForm(qfeedbackF);
    // setQFeedbackForm(qfeedbackF)
    // if (qfeedbackF[checkProp]) {
    //   for (const prop in qfeedbackF) {
    //     if (prop != checkProp && qfeedbackF[prop] === true) {
    //       qfeedbackF[prop] = false;
    //     }
    //   }
    //   setQFeedbackForm(qfeedbackF);
    //   if (checkProp !== "ckAnother") {
    //     // jQuery('#collapseQuestionFeedback').collapse('hide')
    //   }
    // }
  };

  const getPreviousQuestion = async () => {
    if (QA[currPage - 2]) {
      if (!review) {
        setNewQuestion(question);
      }
      setReview(true);
      setCurrPage((prev: any) => prev - 1);
      let currQuest;
      console.log(QA, currPage);
      if (loadedQuestions[QA[currPage - 2]?.question]) {
        currQuest = setQuest(loadedQuestions[QA[currPage - 2].question]);

        currQuest = checkAnswerQuestion(currQuest, QA[currPage - 2]);
      } else {
        const { data } = await clientApi.get(
          `/api/questions/show/${QA[currPage - 2].question}`
        );
        const currQuest = setQuest(data);
        setLoadedQuestions((prev: any) => {
          let cur = prev;
          cur[QA[currPage - 2].question] = data;
          return cur;
        });
        checkAnswerQuestion(currQuest, QA[currPage - 2]);
      }
    }
  };

  return (
    <>
      {!showAttemptSummary ? (
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
                    <a onClick={reportIssue} className="mr-1 text-danger">
                      <FontAwesomeIcon icon={faFlag} />
                    </a>
                  </div>
                </div>
                {review ? (
                  <>
                    <div className="adaptive-question-box bg-white ans">
                      {question?.questionHeader ||
                      question?.category != "fib" ? (
                        <div className="question-item span-black">
                          {question?.questionHeader && (
                            <div className="question-header">
                              <MathJax
                                value={formatQuestion(
                                  clientData.baseUrl,
                                  question?.questionHeader
                                )}
                              />
                              <hr />
                            </div>
                          )}
                          {question?.category != "fib" ? (
                            <div className="question-item mb-3">
                              <MathJax
                                value={formatQuestion(
                                  clientData.baseUrl,
                                  question?.questionText
                                )}
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
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
                      {question?.category === "mcq" && (
                        <div className="adaptive-answer-box">
                          <ul>
                            {question?.answers.map(
                              (answer: any, index: number) => (
                                <li
                                  className={`mb-3 ${
                                    answer.isCorrectAnswer &&
                                    answer.isCorrectAnswerOfUser !== false
                                      ? "green"
                                      : ""
                                  } ${
                                    answer.isCorrectAnswerOfUser === false
                                      ? "red"
                                      : ""
                                  }`}
                                  key={"section" + index}
                                >
                                  <div className="d-flex answer">
                                    <div className="checkbox-group">
                                      <label>
                                        <input
                                          id={`section${index}`}
                                          disabled={viewmode ? true : false}
                                          name={`answer_${index}`}
                                          type="checkbox"
                                          value={answer.isCheckedByUser}
                                        />
                                        <span className="checkmark"></span>
                                        {answer.isCheckedByUser && (
                                          <span
                                            className="material-icons"
                                            style={{
                                              fontSize: "22px",
                                              fontWeight: 700,
                                              position: "absolute",
                                              left: "-38px",
                                              top: "8px",
                                            }}
                                          >
                                            checkmark
                                          </span>
                                        )}
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
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {question?.category === "fib" && (
                        <div>
                          <i
                            className={`float-right ${
                              question?.isUserAnsweredCorrect
                                ? "fas fa-check text-info"
                                : "far fa-dot-circle text-danger"
                            }`}
                          ></i>
                          <div className="question-item">
                            {!question?.isUserAnsweredCorrect ? (
                              <MathJax
                                value={replaceUserAnswer(
                                  question?.questionText,
                                  question
                                )}
                              />
                            ) : (
                              <MathJax
                                value={replaceQuestionText(
                                  question?.questionText,
                                  question,
                                  true
                                )}
                              />
                            )}
                          </div>
                          {question?.audioFiles?.length && (
                            <div className="row">
                              {question?.audioFiles.map(
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
                          )}
                        </div>
                      )}
                      {question?.category === "descriptive" && (
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
                            {question?.userAnswers[0].answerText && (
                              <MathJax
                                value={formatQuestion(
                                  clientData.baseUrl,
                                  question?.userAnswers[0].answerText
                                )}
                              />
                            )}
                            {question?.userAnswers[0].attachments && (
                              <div className="row">
                                {question?.userAnswers[0].attachments.map(
                                  (att: any, i: number) => (
                                    <div className="col-sm-3" key={att.url + i}>
                                      {att.type == "image" && (
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
                                      {att.type == "file" && (
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
                                      {att.type == "audio" && (
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
                            )}
                          </div>
                        </div>
                      )}
                      {question?.category === "code" && (
                        <div>
                          <div className="rounded-boxes bg-light">
                            <div className="clearfix">
                              <h5 className="pull-left">Student Code</h5>
                              <div
                                className="pull-right"
                                style={{ margin: "10px 0px" }}
                              >
                                {question?.answers[0].isCorrectAnswerOfUser && (
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="pull-right text-info"
                                  />
                                )}
                                {!question?.answers[0]
                                  .isCorrectAnswerOfUser && (
                                  <FontAwesomeIcon
                                    icon={faDotCircle}
                                    className="pull-right text-danger"
                                  />
                                )}
                              </div>
                            </div>
                            <CodeMirror
                              value={question?.answers[0].code}
                              options={codemirrorConfig}
                            />
                          </div>
                          <div className="rounded-boxes bg-light">
                            <Tabs>
                              <Tab title="Output" key="output">
                                {!hasNoAnswer && (
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
                                  </>
                                )}
                                {(question?.answers[0].userInput ||
                                  question?.answers[0].userArgs) && (
                                  <div>
                                    <div>
                                      <label>Your Args</label>
                                      <textarea
                                        readOnly
                                        value={question?.answers[0].userArgs}
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
                                    {question?.hasUserInput && (
                                      <div>
                                        <label>Your Input</label>
                                      </div>
                                    )}
                                    {question?.hasUserInput && (
                                      <div>
                                        <textarea
                                          readOnly
                                          value={question?.answers[0].userInput}
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
                                        (lang: any, i: number) => (
                                          <option
                                            value={lang}
                                            key={"select" + i}
                                          >
                                            {lang.display}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  <CodeMirror
                                    value={selectedLang?.solution}
                                    options={codemirrorConfig}
                                  />
                                </div>
                              </Tab>
                              <Tab title="Stats" key="stat">
                                {(selectedLang?.language == "cpp" ||
                                  selectedLang?.language == "c" ||
                                  selectedLang?.language == "java") && (
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
                                )}
                                <div className="row">
                                  <div className="col-sm-6">
                                    <span>Time taken to run (ms)</span>
                                  </div>
                                  <div className="col-sm-6 text-right">
                                    <span>
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]?.runTime}
                                    </span>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-6">
                                    <span>Number of test cases passed</span>
                                  </div>
                                  <div className="col-sm-6 text-right">
                                    <span>
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]
                                          ?.testcasesPassed}
                                      /
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]
                                          ?.totalTestcases}
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
                                      {millisecondsToTime(
                                        selectedLang?.language &&
                                          stats[selectedLang?.language]
                                            ?.timeToSubmit
                                      )}
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
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]?.attempts}
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
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]
                                          ?.successAttempts}
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
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]
                                          ?.timeoutAttempts}
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
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]
                                          ?.errorAttempts}
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
                                      {selectedLang?.language &&
                                        stats[selectedLang?.language]
                                          ?.avgCasesPassed}
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
                                      {millisecondsToTime(
                                        selectedLang?.language &&
                                          stats[selectedLang?.language]
                                            ?.avgTimeBetweenAttempts
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </Tab>
                              <Tab title="Test Cases" key="test_cases">
                                {selectedLang?.testcases.length > 0 &&
                                  selectedLang?.testcases.map(
                                    (testcase: any, i: number) => (
                                      <div key={"testcase" + i}>
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
                                                style={{
                                                  display: "table-cell",
                                                }}
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
                                              {question?.hasUserInput && (
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
                                                  <FontAwesomeIcon
                                                    icon={faCheck}
                                                    className="pull-right text-info"
                                                  />
                                                ) : (
                                                  <FontAwesomeIcon
                                                    icon={faDotCircle}
                                                    className="pull-right text-danger"
                                                  />
                                                )}
                                              </div>
                                            </div>
                                            {!testcase.status &&
                                              testcase.studentCodeOutput && (
                                                <div
                                                  style={{
                                                    display: "table-row",
                                                  }}
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
                                                  {question?.hasUserInput && (
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
                                                      {
                                                        testcase.studentCodeOutput
                                                      }
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
                                      </div>
                                    )
                                  )}
                              </Tab>
                            </Tabs>
                          </div>
                        </div>
                      )}
                      {question?.category === "mixmatch" && (
                        <div className="question-review">
                          <div className="mix-match row">
                            <div className="col-5 mix-match-content ">
                              {question?.answers.map((ans: any, i: number) => (
                                <div
                                  className="mix-match-drag"
                                  key={"answer" + i}
                                >
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
                                    <MathJax value={a.userText} />
                                    <div className="pull-right">
                                      {a.isCorrectAnswerOfUser ? (
                                        <FontAwesomeIcon
                                          icon={faCheck}
                                          className="pull-right text-info"
                                        />
                                      ) : (
                                        <FontAwesomeIcon
                                          icon={faDotCircle}
                                          className="pull-right text-danger"
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {!question?.isUserAnsweredCorrect && (
                            <div>
                              <h1 className="h4 text-dark">Correct Answer</h1>
                              <div className="mix-match row">
                                <div className="col-5 mix-match-content">
                                  {question?.answers.map(
                                    (ans: any, i: number) => (
                                      <div
                                        className="mix-match-drag"
                                        key={"answer" + i}
                                      >
                                        <span>
                                          <MathJax value={ans.answerText} />
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="col-5 ml-auto">
                                  <div className="mix-match-content w-100">
                                    {question?.answers.map(
                                      (ans: any, i: number) => (
                                        <div
                                          className="mix-match-dragd"
                                          key={"correctMatch" + i}
                                        >
                                          <span>
                                            <MathJax value={ans.correctMatch} />
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {question?.answerExplain && (
                        <div className="exp pt-2">
                          <h5>Explanation:</h5>
                          <p>
                            <MathJax value={question?.answerExplain} />
                          </p>
                          {question?.answerExplainAudioFiles?.length && (
                            <div className="row">
                              {question?.answerExplainAudioFiles.map(
                                (audio: any, i: number) => (
                                  <div
                                    className="position-relative my-2 col-lg-6 col-12"
                                    key={"answer_explain_audio_file" + i}
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
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="adaptive-question-box bg-white">
                      {(question?.questionHeader ||
                        (question?.category == "mcq" &&
                          question?.questionType == "multiple")) && (
                        <div className="text-dark question-header">
                          {question?.questionHeader && (
                            <MathJax
                              value={formatQuestion(
                                clientData.baseUrl,
                                question?.questionHeader
                              )}
                            />
                          )}
                          {question?.category == "mcq" &&
                            question?.questionType == "multiple" && (
                              <p className="text-success">
                                {" "}
                                {`(${numberToWord(
                                  question?.correctAnswerCount
                                )} Correct Answers)`}
                              </p>
                            )}
                          <hr />
                        </div>
                      )}

                      {question?.category === "mcq" && (
                        <McqQuestion
                          question={question}
                          setQuestion={setQuest}
                          answerChanged={selectAnswer}
                          answerText={answersarray[currPage - 1]}
                        />
                      )}
                      {question?.category === "fib" && (
                        <>
                          {/* <fib-question [(question)] = "question"(inputChanged) = "onFibTextChange($event)" id = "questionText"[userAnswers] = "answers" ></fib - question > */}
                        </>
                      )}
                      {question?.category === "descriptive" && (
                        <>
                          {/* <descriptive-question * ngSwitchCase="'descriptive'"[(question)] = "question"[practice] = "test"(answerChanged) = "onDescriptiveUpdate($event)" ></descriptive - question > */}
                        </>
                      )}
                      {question?.category === "code" && (
                        <div className="mb-3">
                          <CodingQuestion
                            question={question}
                            setQuestion={setQuest}
                            practice={test}
                            userAnswers={answers}
                            answerChanged={onCodeUpdate}
                            ref={codingRef}
                          />
                          <div className="clearfix d-lg-block">
                            {codingQuestion?.stats[
                              question?.userCode
                                ? question?.userCode.selectedLang.language
                                : ""
                            ]?.show && (
                              <div id="result">
                                <div
                                  className={`result-board bg-white ${
                                    codingQuestion?.stats[
                                      question?.userCode
                                        ? question?.userCode.selectedLang
                                            .language
                                        : ""
                                    ]?.correct
                                      ? "correct"
                                      : ""
                                  }`}
                                >
                                  <div className="result-board-title">
                                    {codingQuestion?.stats[
                                      question?.userCode.selectedLang.language
                                    ]?.testcasesPassed !=
                                      codingQuestion?.stats[
                                        question?.userCode.selectedLang.language
                                      ]?.totalTestcases && (
                                      <h4>
                                        Result:<span> Wrong Answer</span>
                                      </h4>
                                    )}
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
                                ].compileError && (
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
                                )}
                                {!codingQuestion?.stats[
                                  question?.userCode.selectedLang.language
                                ].compileError && (
                                  <div className="output">
                                    <div
                                      className={`output-info ${
                                        codingQuestion?.stats[
                                          question?.userCode.selectedLang
                                            .language
                                        ].correct
                                          ? "correct"
                                          : ""
                                      }`}
                                    >
                                      <h4>Your Code’s Output</h4>
                                      {codingQuestion?.stats[
                                        question?.userCode.selectedLang.language
                                      ].testcaseToDisplay.output && (
                                        <p className="pre-wrap">
                                          {" "}
                                          {
                                            codingQuestion?.stats[
                                              question?.userCode.selectedLang
                                                .language
                                            ].testcaseToDisplay.output
                                          }
                                        </p>
                                      )}
                                      {codingQuestion?.stats[
                                        question?.userCode.selectedLang.language
                                      ].testcaseToDisplay.error && (
                                        <p className="pre-wrap">
                                          {" "}
                                          {
                                            codingQuestion?.stats[
                                              question?.userCode.selectedLang
                                                .language
                                            ].testcaseToDisplay.error
                                          }
                                        </p>
                                      )}
                                      {!codingQuestion?.stats[
                                        question?.userCode.selectedLang.language
                                      ].testcaseToDisplay.output &&
                                        !codingQuestion?.stats[
                                          question?.userCode.selectedLang
                                            .language
                                        ].testcaseToDisplay.error && (
                                          <p>
                                            Your code didn&apos;t print
                                            anything.
                                          </p>
                                        )}
                                    </div>

                                    <div
                                      className={`output-info ${
                                        codingQuestion?.stats[
                                          question?.userCode.selectedLang
                                            .language
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
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!viewmode && !isFinish && (
                  <div>
                    <div className="text-right">
                      {currPage > 1 && (
                        <a
                          className="btn btn-secondary mr-2"
                          onClick={getPreviousQuestion}
                        >
                          Previous
                        </a>
                      )}
                      {(!review ||
                        (newQuestion &&
                          question?._id !== newQuestion?._id)) && (
                        <a
                          className="btn btn-primary"
                          onClick={() => nextQuestion()}
                        >
                          {" "}
                          {review ? "Save & Next" : "Check Answer"}
                        </a>
                      )}
                      {review &&
                        (!newQuestion || question?._id == newQuestion?._id) && (
                          <a
                            className="btn btn-primary"
                            onClick={() => nextQuestion(1)}
                          >
                            Finish
                          </a>
                        )}
                    </div>
                  </div>
                )}
                {viewmode && (
                  <div className="d-flex justify-content-end">
                    {currPage > 1 && (
                      <a
                        className="btn btn-secondary mr-2"
                        onClick={getPreviousQuestion}
                      >
                        Previous Question
                      </a>
                    )}
                    {currPage !== totalQuestion && (
                      <a className="btn btn-secondary" onClick={nextQuestion}>
                        Next Question
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <CourseAttempt
            attemptId={attemptId}
            takeQuiz={takeQuiz}
            show={showAttemptSummary}
          ></CourseAttempt>
        </>
      )}
      <LearningTestReportModal
        show={showReportModal}
        onClose={feedbackClose}
        feedbackSubmit={feedbackSubmit}
        feedbackError={feedbackError}
        qfeedbackForm={qfeedbackForm}
        onFeedbackCheck={onFeedbackCheck}
        setQFeedbackForm={setQFeedbackForm}
      />
    </>
  );
};

export default CourseLearningTest;
