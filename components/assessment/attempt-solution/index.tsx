import { useEffect, useState } from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faFlag as regularFlag } from "@fortawesome/free-regular-svg-icons";
import { faFlag as solidFlag } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import {
  Accordion,
  AccordionCollapse,
  AccordionToggle,
  Tabs,
  Tab,
  Card,
} from "react-bootstrap";
import MathJax from "../mathjax";
import CodeRenderer from "../code-renderer";
import QuestionFeedback from "../question-feedback";
import clientApi from "@/lib/clientApi";
import { questionStatus } from "@/lib/common";
import { embedVideo, getElearningFullPath } from "@/lib/helpers";
import {
  formatQuestion,
  getAvgTime,
  millisecondsToTime,
  numberToAlpha,
  replaceQuestionText,
} from "@/lib/pipe";
import { toQueryString } from "@/lib/validator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface props {
  attempt: any;
  questions: any;
  setQuestions: any;
  userResMixMatch: any;
}
const AttemptSolution = ({
  attempt,
  questions,
  userResMixMatch,
  setQuestions,
}: props) => {
  const { user } = useSession()?.data || {};
  const [settings, setSettings] = useState<any>();
  const [sortedQuestions, setSortedQuestions] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<string>();
  const [selectedUnit, setSelectedUnit] = useState<boolean>(false);
  const [questionStates, setQuestionStates] = useState<any>({});
  const [unit, setUnit] = useState<any>({});
  const [reportButtonClicked, setReportButtonClicked] = useState(false);
  const [hideAnswer, setHideAnswer] = useState<any>({});
  const [showQuestionFeedback, setShowQuestionFeedback] =
    useState<boolean>(false);
  const [questionFeedbackProps, setQuestionFeedbackProps] = useState<any>({});
  const [videos, setVideos] = useState<any>({});
  const [issueReported, setIssueReported] = useState(false);

  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      setSettings(data);
      let sortedQuestion = [...questions];
      sortedQuestion.forEach((q: any) => {
        for (const qa of attempt.QA) {
          if (qa.question == q._id) {
            q.isCorrect = qa.status == questionStatus.CORRECT;
            q.timeTaken = qa.timeEslapse;
            q.index = qa.index;
            q.annotation = qa.annotation;
            q.wasMarked = qa.wasMarked;
            // const t = q.answers;
            // t[qa.index - 1] = { ...t[qa.index - 1], isCheckedByUser: true }
            // q.answers = t;
            break;
          }
        }
        if (
          q.status === questionStatus.INCORRECT ||
          q.status === questionStatus.MISSED
        ) {
          setHideAnswer((prevState) => ({
            ...prevState,
            [q._id]: true,
          }));
        }
      });
      sortedQuestion.sort((q1: any, q2: any) => {
        if (q1.isCorrect && !q2.isCorrect) {
          return 1;
        }
        if (!q1.isCorrect && q2.isCorrect) {
          return -1;
        }

        return q1.index - q2.index;
      });

      setSortedQuestions(sortedQuestion);
      sortQuestion("wrongAnswer", sortedQuestion);
    };

    getClientData();
  }, []);

  const handleReportButtonClick = () => {
    setReportButtonClicked(true);
  };

  const sortQuestion = (by: string, sortQ?: any) => {
    if (!sortQ) {
      sortQ = sortedQuestions;
    }
    setSortBy(by);

    switch (by) {
      case "wrongAnswer":
        sortQ.sort((q1, q2) => {
          if (q1.isCorrect && !q2.isCorrect) {
            return 1;
          }
          if (!q1.isCorrect && q2.isCorrect) {
            return -1;
          }
          return q1.index - q2.index;
        });
        break;
      case "order":
        sortQ = [...questions];
        // No sorting needed, already in order of appearance
        break;
      case "timeTakenDesc":
        sortQ.sort((q1, q2) => {
          // Handle null and 0 values appropriately
          const time1 = q1.timeEslapse === null ? Infinity : q1.timeEslapse;
          const time2 = q2.timeEslapse === null ? Infinity : q2.timeEslapse;

          return time2 - time1;
        });
        break;
      case "timeTakenAsce":
        sortQ.sort((q1, q2) => {
          // Handle null and 0 values appropriately
          const time1 = q1.timeEslapse === null ? Infinity : q1.timeEslapse;
          const time2 = q2.timeEslapse === null ? Infinity : q2.timeEslapse;

          return time1 - time2;
        });
        break;
      default:
        // Handle default case or do nothing
        break;
    }

    setSortedQuestions(sortQ);
  };

  const onAllUnits = () => {
    setSelectedUnit(false);
    setUnit({});
  };

  const onUnitChanges = (unit: any) => {
    setSelectedUnit(true);
    setUnit(unit);
  };
  const onLanguageChanged = (lang: any, index: number) => {
    let question = questions;
    question[index].selectedLang = lang;
    setQuestions(question);
  };

  const byPassSecurity = (items: any) => {
    return items.map((item: any) => {
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
  interface User {
    _id: string;
  }

  interface Question {
    _id: string;
  }

  const reportIssue = (question) => {
    setShowQuestionFeedback(true);
    setQuestionFeedbackProps({
      practiceId: attempt.practicesetId,
      teacherId: attempt.createdBy.user,
      attemptId: attempt._id,
      questionId: question._id,
      show: true,
      userId: user?.info?._id,
      isReviewing: true,
    });
    setQuestionStates((prevStates) => ({
      ...prevStates,
      [question._id]: { issueReported: false, userId: user?.info?._id },
    }));
    setIssueReported(true);
  };

  const isIssueReported = (questionId) => {
    const questionState = questionStates[questionId];
    return (
      questionState &&
      questionState.issueReported &&
      questionState.userId === user?.info?._id
    );
  };

  const loadVideos = async (question: any, i: any) => {
    let questions = sortedQuestions;
    let video = videos;
    if (!question.videos) {
      if (video[question.topic._id]) {
        question.videos = video[question.topic._id];
      } else {
        try {
          const { data } = await clientApi.get(
            `/api/contents/taggedWithTopic/${question.topic._id}${toQueryString(
              {
                contentType: "video",
              }
            )}`
          );
          video[question.topic._id] = byPassSecurity(data.contents);
          questions[i].videos = video[question.topic._id];
        } catch (error) {
          questions[i].videos = [];
        }
      }
    }

    setSortedQuestions(questions);
  };

  const toggleAnswer = (question: any, event: any) => {
    event.stopPropagation();
    setHideAnswer((prevState) => ({
      ...prevState,
      [question._id]: !prevState[question._id],
    }));
  };

  return (
    <div className="" id="solutions">
      <div className="error-analysis error-analysis_new mx-auto mw-100 p-0">
        <div className="text-right">
          <span className="mr-2">Sort By</span>
          <select
            name=""
            className="form-control w-auto d-inline-block"
            onChange={(e) => sortQuestion(e.target.value)}
            value={sortBy}
          >
            <option value="wrongAnswer">Incorrectly Answered</option>
            <option value="order">Order of appearance</option>
            <option value="timeTakenDesc">Time Taken (Descending)</option>
            <option value="timeTakenAsce">Time Taken (Ascending)</option>
          </select>
        </div>

        <div className="row">
          <div className="col-lg-2">
            <div className="sidebar">
              <div className="title">
                <h4 onClick={onAllUnits}>All Units</h4>
              </div>

              <ul>
                {attempt?.units.map((item: any) => (
                  <li key={item._id}>
                    <a
                      className={`${unit._id == item._id ? "active" : ""}`}
                      onClick={() => onUnitChanges(item)}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-10">
            <div className="error-analysis-area w-100">
              <div className="accordation-area attemptSummary-vedio pt-0">
                <div className="accordion" id="accordion_solution">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">{unit?.name}</h3>
                  </div>
                  <div className="mb-2">
                    <em>Click Eye icon on each question to view correct answer and answer explaination. We hide to give student another chance to solve</em>
                  </div>
                  <Accordion defaultActiveKey="0">
                    {sortedQuestions.map((question: any, i: number) => (
                      <div key={question.unit._id + i}>
                        {(!selectedUnit || question.unit._id == unit._id) && (
                          <div className="area mb-3 py-0">
                            <AccordionToggle
                              as={Card.Header}
                              eventKey={i.toString()}
                              // onClick={() => loadVideos(question, i)}
                              style={{
                                backgroundColor: "white",
                                border: 0,
                                padding: "0.75rem",
                              }}
                            >
                              <h2 className="heading heading_new">
                                <button
                                  className="btn-accordion-header border-0 text-left p-0"
                                  type="button"
                                >
                                  <table className="table mb-0 ">
                                    <tr>
                                      <td className="border-0 p-0 number-circle">
                                        <div className="number p-0">
                                          <span>{question.number}</span>
                                        </div>
                                      </td>

                                      <td
                                        className="border-0 p-0 result-solution result-td"
                                        style={{
                                          padding: "0 !important",
                                          paddingRight: "0px !important",
                                        }}
                                      >
                                        {question.status === 1 && (
                                          <div>
                                            <i className="fas fa-check correct-color "></i>
                                            &nbsp;Correct
                                          </div>
                                        )}
                                        {question.status === 2 && (
                                          <div>
                                            <i className="fas fa-times incorrect-color"></i>
                                            &nbsp;Incorrect
                                          </div>
                                        )}
                                        {question.status === 3 && (
                                          <div>
                                            <i className="fas fa-exclamation missed-color"></i>
                                            &nbsp;Missed
                                          </div>
                                        )}
                                        {question.status === 4 && (
                                          <div>
                                            <i className="fas fa-pause pending-color"></i>
                                            &nbsp;Pending
                                          </div>
                                        )}
                                        {question.status === 5 && (
                                          <div>
                                            <i className="fas fa-check partial-color"></i>
                                            &nbsp;Partial
                                          </div>
                                        )}
                                      </td>
                                      <td
                                        className="border-0 p-0 "
                                        style={{
                                          fontSize: "15px",
                                          textAlign: "left",
                                        }}
                                      >
                                        Difficulty:{" "}
                                        {question.complexity
                                          .charAt(0)
                                          .toUpperCase() +
                                          question.complexity
                                            .slice(1)
                                            .toLowerCase()}
                                        {(question.status === 2 ||
                                          question.status === 3) &&
                                          question.category !==
                                            "descriptive" && (
                                            <a
                                              className="p-4"
                                              onClick={(e) =>
                                                toggleAnswer(question, e)
                                              }
                                              style={{
                                                verticalAlign: "middle",
                                                fontSize: "15px",
                                              }}
                                            >
                                              <i
                                                className={`far ${
                                                  !hideAnswer[question._id]
                                                    ? "fa-eye"
                                                    : "fa-eye-slash"
                                                }`}
                                              ></i>
                                            </a>
                                          )}
                                      </td>
                                      <td className="border-0 pr-0">
                                        {question.timeEslapse > 0 && (
                                          <>
                                            {question.timeEslapse >
                                            question.avgTime ? (
                                              <img
                                                src="/assets/images/turtle.png"
                                                style={{
                                                  width: "35px",
                                                  float: "right",
                                                  paddingRight: "10px"
                                                }}
                                              />
                                            ) : (
                                              <img
                                                src="/assets/images/bunny.png"
                                                style={{
                                                  width: "35px",
                                                  float: "right",
                                                }}
                                              />
                                            )}
                                          </>
                                        )}
                                      </td>

                                      <td className="border-0 p-0">
                                        <a
                                          type="button"
                                          onClick={() => {
                                            reportIssue(question);
                                          }}
                                          className="text-danger text-uppercase"
                                        >
                                          <i
                                            className={`${
                                              question.hasFeedback ||
                                              isIssueReported(question._id)
                                                ? "fa-solid fa-flag"
                                                : "fa-regular fa-flag"
                                            } fa-2xs`}
                                          ></i>
                                        </a>
                                      </td>
                                      
                                      <td
                                        className="border-0 pr-0 pl-2"
                                        style={{ width: "200px " }}
                                      >
                                        <div className="taken-time pr-0 pl-2">
                                          <span
                                            className="font-weight-normal h-100"
                                            style={{
                                              verticalAlign: "middle",
                                              fontSize: "14px",
                                            }}
                                          >
                                            {question.wasMarked && (
                                              <i className="fas fa-bookmark text-danger mr-2"></i>
                                            )}
                                            Time student spent:{" "}
                                            {millisecondsToTime(
                                              question.timeEslapse,
                                              "short"
                                            )}
                                          </span>
                                        </div>
                                      </td>
                                      <td
                                        className="border-0 pr-2 pl-1"
                                        style={{ minWidth: "180px" }}
                                      >
                                        <div
                                          className="average-time p-0"
                                          style={{ textAlign: "left" }}
                                        >
                                          <span
                                            className="font-weight-normal"
                                            style={{
                                              verticalAlign: "middle",
                                              fontSize: "14px",
                                            }}
                                          >
                                            Average Time by Others:{" "}
                                            {millisecondsToTime(
                                              getAvgTime(attempt),
                                              "short"
                                            )}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </button>
                              </h2>
                            </AccordionToggle>
                            <AccordionCollapse eventKey={i.toString()}>
                              <div className="selection-wrap">
                                <div className="qqq">
                                  <MathJax
                                    value={replaceQuestionText(question, true)}
                                  />
                                  {question.audioFiles?.length ? (
                                    <div className="row">
                                      {question.audioFiles.map(
                                        (audio: any, i: number) => (
                                          <div
                                            key={audio.name + i}
                                            className="position-relative my-2 col-lg-6 col-12"
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
                                {question.category == "mcq" && (
                                  <>
                                    {question.answers.map(
                                      (item: any, i: number) => (
                                        <div
                                          className="selection my-2"
                                          key={"mcq" + i}
                                        >
                                          <div className="d-flex align-items-center">
                                            <form>
                                              <div className="checkbox-group h-auto">
                                                <label className="m-0">
                                                  <input type="checkbox" />
                                                  {hideAnswer[question._id] ? (
                                                    <span
                                                      className={`checkmark text-center mt-0 `}
                                                    >
                                                      {numberToAlpha(i)}
                                                    </span>
                                                  ) : (
                                                    <>
                                                      <span
                                                        className={`checkmark text-center mt-0 ${
                                                          item.isCheckedByUser &&
                                                          item.isCorrectAnswer
                                                            ? "green"
                                                            : ""
                                                        } ${
                                                          item.isCheckedByUser &&
                                                          !item.isCorrectAnswer
                                                            ? "red"
                                                            : ""
                                                        } ${
                                                          item.isCorrectAnswer
                                                            ? "green"
                                                            : ""
                                                        }`}
                                                      >
                                                        {numberToAlpha(i)}
                                                      </span>
                                                      {item.isCheckedByUser ? (
                                                        <span
                                                          className="material-icons"
                                                          style={{
                                                            fontSize: "22px",
                                                            fontWeight: "700",
                                                            position:
                                                              "absolute",
                                                            left: "18px",
                                                            top: "6px",
                                                          }}
                                                        >
                                                          <FontAwesomeIcon
                                                            icon={faCheck}
                                                          />
                                                        </span>
                                                      ) : (
                                                        <></>
                                                      )}
                                                    </>
                                                  )}
                                                </label>
                                              </div>
                                            </form>
                                            <span className="p-0 pl-2 font-weight-bolder">
                                              <MathJax
                                                value={item.answerText}
                                                className="pl-1"
                                              />
                                            </span>
                                          </div>
                                          {item.audioFiles?.length ? (
                                            <div className="row">
                                              {item.audioFiles.map(
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
                                      )
                                    )}
                                  </>
                                )}

                                {question.category == "mixmatch" && (
                                  <div className="adaptive-question-box adaptive-question-ans overflow-hidden">
                                    <div className="mix-match row">
                                      <div className="col-5 mix-match-content">
                                        {question.answers.map(
                                          (ans: any, i: number) => (
                                            <div
                                              className="mix-match-drag"
                                              key={"ans" + i}
                                            >
                                              <span>
                                                <MathJax
                                                  value={ans.answerText}
                                                />
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                      {hideAnswer[question._id] && (
                                        <div className="col-5 ml-auto">
                                          <div className="mix-match-content w-100">
                                            {question.answers.map(
                                              (ans: any, i: number) => (
                                                <div
                                                  className="mix-match-dragd"
                                                  key={"ans" + i}
                                                >
                                                  <span>
                                                    <MathJax
                                                      value={ans.correctMatch}
                                                    />
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {question.category == "fib" && (
                                  <>
                                    {question.answers.map(
                                      (item: any, i: number) => (
                                        <div key={"fib" + i}>
                                          <div className="given-answer p-0 mb-3">
                                            <h6>Your Answer</h6>
                                            <span>{item.answeredText}</span>
                                          </div>

                                          <div className="correct-answer p-0 mb-3">
                                            <h6>Correct Answer</h6>
                                            <span>{item.answerText}</span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </>
                                )}
                                {question.category == "descriptive" && (
                                  <>
                                    {question.answers.map(
                                      (item: any, i: number) => (
                                        <div
                                          className="given-answer p-0 mb-3"
                                          key={"answer" + i}
                                        >
                                          <h6>Your Answer</h6>
                                          {item?.answerText && (
                                            <MathJax
                                              value={formatQuestion(
                                                item.answerText
                                              )}
                                            />
                                          )}
                                          {item?.attachments.map(
                                            (att: any, index: number) => (
                                              <div
                                                className="mt-3 row"
                                                key={att.url}
                                              >
                                                {att.type == "image" && (
                                                  <img
                                                    src={att.url}
                                                    className="col mw-100 mh-100 w-auto h-auto img-thumbnail rounded"
                                                    style={{
                                                      objectFit: "scale-down",
                                                    }}
                                                  />
                                                )}
                                                {att.type == "file" && (
                                                  <a
                                                    href={att.url}
                                                    target="_blank"
                                                    className="col"
                                                  >
                                                    {att.name}
                                                  </a>
                                                )}
                                                {att.type == "audio" && (
                                                  <audio
                                                    controls
                                                    className="col w-100"
                                                    src={att.url}
                                                  ></audio>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )
                                    )}
                                  </>
                                )}
                                {question.category == "code" && (
                                  <>
                                    {
                                      <>
                                        {question.answers.length && (
                                          <CodeRenderer
                                            code={question.answers[0].code}
                                            language={
                                              question.answers[0].codeLanguage
                                            }
                                          />
                                        )}

                                        <Tabs activeKey={"output"}>
                                          <Tab
                                            title="Output"
                                            activekey={"output"}
                                          >
                                            <div className="code-wrap">
                                              {!question.hasNoAnswer && (
                                                <>
                                                  <div className="heading heading_new">
                                                    <h4>Compiler Message</h4>
                                                  </div>

                                                  <form>
                                                    <textarea
                                                      value={
                                                        question.answers[0]
                                                          .compileMessage
                                                      }
                                                      readOnly
                                                      className="form-control bg-white border-0"
                                                      name="compiler_msg"
                                                    ></textarea>
                                                  </form>
                                                </>
                                              )}
                                              {question.answers[0] && (
                                                <div>
                                                  <div>
                                                    <label>Your Args</label>
                                                    <textarea
                                                      readOnly
                                                      value={
                                                        question.answers[0]
                                                          .userArgs
                                                      }
                                                      name="userArgs"
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
                                                        <label>
                                                          Your Input
                                                        </label>
                                                      </div>
                                                      <div>
                                                        <textarea
                                                          readOnly
                                                          value={
                                                            question.answers[0]
                                                              .userInput
                                                          }
                                                          name="userInput"
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
                                                        question.answers[0]
                                                          .output
                                                      }
                                                      name="output"
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
                                              <div className="heading heading_new">
                                                <div className="row mt-2">
                                                  <div className="col">
                                                    <h4>Correct Answer</h4>
                                                  </div>

                                                  <div className="col-auto ml-auto">
                                                    <div className="dropdown ml-auto">
                                                      <a
                                                        className="btn dropdown-toggle caret-on-dropdown bg-white text-capitalize"
                                                        type="button"
                                                        id="dropdownMenuButton"
                                                        data-toggle="dropdown"
                                                        aria-haspopup="true"
                                                        aria-expanded="false"
                                                      >
                                                        {
                                                          question.selectedLang
                                                            .language
                                                        }
                                                      </a>

                                                      <div
                                                        className="dropdown-menu dropdown-menu-right"
                                                        aria-labelledby="dropdownMenuButton"
                                                      >
                                                        {question.coding.map(
                                                          (
                                                            lang: any,
                                                            i: number
                                                          ) => (
                                                            <a
                                                              key={"lang" + i}
                                                              className="dropdown-item"
                                                              onClick={() =>
                                                                onLanguageChanged(
                                                                  lang,
                                                                  i
                                                                )
                                                              }
                                                            >
                                                              {lang.display}
                                                            </a>
                                                          )
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              <CodeRenderer
                                                code={
                                                  question.selectedLang.solution
                                                }
                                                language={
                                                  question.selectedLang.language
                                                }
                                              />
                                            </div>
                                          </Tab>
                                          <Tab title="Stats" eventKey="stats">
                                            <div className="code-wrap">
                                              <div className="info">
                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Time taken to compile(ms)
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].compileTime
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Time taken to run(ms)
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].runTime
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Number of test cases
                                                      passed
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {question.stats[
                                                          question.selectedLang
                                                            .language
                                                        ].testcasesPassed /
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].totalTestcases}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="heading heading_new mb-0">
                                                  <h4>Execution Statistics</h4>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Time taken to submit
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {millisecondsToTime(
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].timeToSubmit
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Number of compile attempts
                                                      made
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].attempts
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Number of compile attempts
                                                      witnessed a successful
                                                      compile
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].successAttempts
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Number of compile attempts
                                                      witnessed a time-out
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].timeoutAttempts
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Number of compile attempts
                                                      witnessed a run time error
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].errorAttempts
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Avg. no. of cases passed
                                                      in each compile
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].avgCasesPassed
                                                        }
                                                        %
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row">
                                                  <div className="col-10">
                                                    <span>
                                                      Avg. time taken between
                                                      each compile
                                                    </span>
                                                  </div>

                                                  <div className="col-2">
                                                    <div className="count ml-auto">
                                                      <span>
                                                        {millisecondsToTime(
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ]
                                                            .avgTimeBetweenAttempts
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </Tab>
                                          <Tab
                                            title="Test Cases"
                                            eventKey="title cases"
                                          >
                                            {question.testcases.map(
                                              (
                                                testcase: any,
                                                index: number
                                              ) => (
                                                <div
                                                  style={{
                                                    display: "table",
                                                    width: "100%",
                                                    padding: "10px",
                                                  }}
                                                  key={index}
                                                >
                                                  <div
                                                    style={{
                                                      display: "table",
                                                      width: "100%",
                                                    }}
                                                  >
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
                                                          name="testcase_args"
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
                                                              display:
                                                                "table-cell",
                                                              width: "1%",
                                                              padding: "10px",
                                                              verticalAlign:
                                                                "top",
                                                            }}
                                                          >
                                                            Input
                                                          </div>
                                                          <div
                                                            style={{
                                                              display:
                                                                "table-cell",
                                                            }}
                                                          >
                                                            <textarea
                                                              value={
                                                                testcase.input
                                                              }
                                                              readOnly
                                                              style={{
                                                                resize: "none",
                                                                height: "auto",
                                                                width: "100%",
                                                                color: "black",
                                                                padding:
                                                                  "2px 5px",
                                                              }}
                                                              placeholder="Each argument in a line..."
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
                                                          value={
                                                            testcase.output
                                                          }
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
                                                          <i className="fa fa-check pull-right text-info "></i>
                                                        ) : (
                                                          <i className="fa fa-dot-circle-o pull-right text-danger "></i>
                                                        )}
                                                      </div>
                                                    </div>
                                                    {!testcase.status &&
                                                      testcase.studentCodeOutput && (
                                                        <div
                                                          style={{
                                                            display:
                                                              "table-row",
                                                          }}
                                                          className="code-display"
                                                        >
                                                          <div
                                                            style={{
                                                              display:
                                                                "table-cell",
                                                              width: "1%",
                                                            }}
                                                          ></div>
                                                          <div
                                                            style={{
                                                              display:
                                                                "table-cell",
                                                            }}
                                                          ></div>
                                                          {question.hasUserInput && (
                                                            <>
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "table-cell",
                                                                  width: "1%",
                                                                }}
                                                              ></div>
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "table-cell",
                                                                }}
                                                              ></div>
                                                            </>
                                                          )}
                                                          <div
                                                            style={{
                                                              display:
                                                                "table-cell",
                                                              width: "1%",
                                                              whiteSpace:
                                                                "nowrap",
                                                              padding: "10px",
                                                              verticalAlign:
                                                                "top",
                                                              textAlign:
                                                                "right",
                                                            }}
                                                          >
                                                            Your output
                                                          </div>
                                                          <div
                                                            style={{
                                                              display:
                                                                "table-cell",
                                                              padding: "10px",
                                                            }}
                                                          >
                                                            <div
                                                              className="preserve-newline "
                                                              style={{
                                                                color: "red",
                                                              }}
                                                            >
                                                              {
                                                                testcase.studentCodeOutput
                                                              }
                                                            </div>
                                                          </div>
                                                          <div
                                                            style={{
                                                              display:
                                                                "table-cell",
                                                              width: "1%",
                                                              whiteSpace:
                                                                "nowrap",
                                                              padding: "10px",
                                                              verticalAlign:
                                                                "top",
                                                            }}
                                                          ></div>
                                                        </div>
                                                      )}
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </Tab>
                                        </Tabs>
                                      </>
                                    }
                                  </>
                                )}
                                {question?.teacherEvaluation && (
                                  <div className="vedio-section mt-2 mb-2 exp">
                                    <div className="vedio-section-box">
                                      <div className="vedio-name">
                                        <h3>Teacher Feedback:</h3>
                                      </div>
                                      <div className="vedio-body   pt-2">
                                        <MathJax
                                          value={question.teacherEvaluation}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {question?.answerExplain &&
                                  !hideAnswer[question._id] && (
                                    <div className="vedio-section mt-2 mb-2 exp">
                                      <div className="vedio-section-box">
                                        <div className="vedio-name">
                                          <h3 style={{color: "#FFFFFF"}}>Explanation</h3>
                                        </div>
                                        <div className="vedio-body pl-5 pt-2">
                                          <p>
                                            <MathJax
                                              value={question.answerExplain}
                                            />
                                            {question.answerExplainAudioFiles
                                              ?.length ? (
                                              <div className="row">
                                                {question.answerExplainAudioFiles.map(
                                                  (audio: any, i: number) => (
                                                    <div
                                                      className="position-relative my-2 col-lg-6 col-12"
                                                      key={audio.url}
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
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                {question?.videos && question?.videos.length &&  !hideAnswer[question._id] ? (
                                  <div className="vedio-section">
                                    <div className="vedio-section-box">
                                      <div className="vedio-name">
                                        <h3>Recommended Learning</h3>
                                      </div>
                                      <div className="vedio-body">
                                        <div className="row">
                                          {question.videos.map(
                                            (video: any, index: number) => (
                                              <div
                                                className="col-sm-12 col-md-6"
                                                key={video.title + index}
                                              >
                                                <div className="vedio-cart">
                                                  <div className="image">
                                                    {video.local ? (
                                                      <video
                                                        className="w-100"
                                                        height="180"
                                                        // controls="controls"
                                                      >
                                                        <source
                                                          src={video.url}
                                                          // autostart="false"
                                                        />
                                                      </video>
                                                    ) : (
                                                      <iframe
                                                        className="w-100"
                                                        height="180"
                                                        src={video.url}
                                                        // frameBorder="0"
                                                        // allowfullscreen
                                                      ></iframe>
                                                    )}
                                                  </div>
                                                  <div className="content-box">
                                                    <h4>{video.title}</h4>
                                                    <p>{video.summary}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </AccordionCollapse>
                          </div>
                        )}
                      </div>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showQuestionFeedback && (
        <QuestionFeedback
          {...questionFeedbackProps}
          onClose={(feedbackSubmitted) => {
            setShowQuestionFeedback(false);
            if (feedbackSubmitted) {
              setQuestionStates((prevStates) => ({
                ...prevStates,
                [questionFeedbackProps.questionId]: {
                  issueReported: true,
                  userId: questionFeedbackProps.userId,
                },
              }));
            }
          }}
          setQuestionStates={setQuestionStates}
        />
      )}
    </div>
  );
};

export default AttemptSolution;
