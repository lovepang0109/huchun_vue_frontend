"use client";
import CodeMirror from "@uiw/react-codemirror";
import CircleProgress from "@/components/CircleProgress";
import Mathjax from "@/components/assessment/mathjax";
import {
  formatQuestion,
  getAvgTime,
  millisecondsToTime,
  numberToAlpha,
  replaceQuestionText,
  militoHour,
} from "@/lib/pipe";
import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionCollapse,
  AccordionToggle,
  Tabs,
  Tab,
  Card,
} from "react-bootstrap";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
const OverviewComponent = ({
  activeTab,
  course,
  questions,
  setQuestions,
  activeContent,
  setActiveContent,
  attempts,
  onContentChange,
}: any) => {
  const [activeSection, setActiveSection] = useState<any>();
  const [selectedLang, setSelectedLang] = useState({});
  const [selectLang, setSelectLang] = useState("");
  const [line, setLine] = useState(1);
  const [col, setCol] = useState(1);
  const [allQuestions, setAllQuestions] = useState(null);
  const [paginationQuestion, setPaginationQuestion] = useState(null);
  const [idx, setIdx] = useState<any>([]);
  // Define other states as needed

  const codemirrorConfig = {
    theme: "default",
    lineNumbers: true,
    fullScreen: false,
    lineWrapping: true,
    foldGutter: true,
    autoCloseBrackets: "()[]{}''\"\"",
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: "text/x-c++src",
  };

  const codeMirrorCompileOptions = {
    readOnly: "nocursor",
  };

  const chartOptions = {
    chart: {
      height: 32,
      type: "pie",
    },
    dataLabels: {
      enabled: false,
      name: {
        show: false,
      },
      value: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
    fill: {
      colors: ["#00ff00", "#999999"],
    },
  };

  useEffect(() => {
    setIdx([]);
    setActiveSection(course?.sections[0]);
    selectContent(course?.sections[0], course?.sections[0].contents[0]);
  }, []);

  const selectContent = (section: any, content: any) => {
    setActiveSection(section);
    setActiveContent(content);
    onContentChange({ section: section, content: content });
  };

  const selectSection = (section: any) => {
    if (activeSection === section || !section.contents.length) {
      return;
    }
    setActiveSection(section);
    selectContent(section, section.contents[0]);
  };

  const onLanguageChanged = (lang: any, index: any) => {
    const questionsData = questions;
    questionsData[index].selectedLang = lang;
    setQuestions(questionsData);
  };

  return (
    <div className="over-view" id="solutions">
      <div className="error-analysis error-analysis_new mx-auto mw-100 pb-3">
        <div className="row">
          <div className="col-lg-2">
            <div className="accordion" id="accordion">
              {course?.sections?.map((section: any, i: any) => (
                <div className="item mb-1" key={i}>
                  <div
                    id={`section${i}`}
                    className="row no-gutters section-chart-wrapper align-items-center"
                  >
                    <div className="col-auto section-chart align-self-start">
                      <div
                        className="custom-pie"
                        style={{ "--p": `${section.chartSeries[0]}` }}
                      ></div>
                    </div>
                    <div className="col my-1">
                      <button
                        className="text-left border-0 p-0 bg-transparent"
                        type="button"
                        data-toggle="collapse"
                        onClick={() => selectSection(section)}
                        data-target={`#collapse${i}`}
                        aria-expanded={activeContent === section}
                        aria-controls={`collapse${i}`}
                      >
                        {section.title}
                      </button>
                    </div>
                  </div>
                  <div
                    id={`collapse${i}`}
                    aria-labelledby={`section${i}`}
                    data-parent="#accordion"
                    className={`collapse ${i === 0 ? "show" : ""}`}
                  >
                    {section.contents?.map((content: any, j: any) => (
                      <div key={j}>
                        <a
                          onClick={() => selectContent(section, content)}
                          role="button"
                        >
                          {content.type === "quiz" && (
                            <span className="iconc-quiz d-flex my-1 ml-3">
                              <span
                                className={`font-karla ml-1 ${
                                  activeContent === content ? "active" : ""
                                }`}
                                style={{
                                  display: "inline-flex",
                                }}
                              >
                                {content.title}
                              </span>
                            </span>
                          )}
                          {content.type === "assessment" && (
                            <span className="icon3-assesment d-flex my-1 ml-3">
                              <span
                                className={`font-karla ml-1 ${
                                  activeContent === content ? "active" : ""
                                }`}
                                style={{
                                  display: "inline-flex",
                                }}
                              >
                                {content.title}
                              </span>
                            </span>
                          )}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-10">
            <div className="error-analysis-area w-100">
              <div className="accordation-area pt-0 ">
                <div className="accordion">
                  <div className="area mb-3 init" style={{ padding: "13px" }}>
                    <h4 className="f-16 pb-2 border-bottom">
                      {activeSection?.title}
                    </h4>
                    <div className="row mt-3 mb-3">
                      <div className="col-auto text-center">
                        <div className="items">
                          <div className="course-progress">
                            <div className="circle-title">
                              <span>
                                <strong>Quiz</strong>
                              </span>
                            </div>
                            <div className="circle" style={{ width: "100px" }}>
                              <CircleProgress
                                value={activeSection?.analytics?.quiz}
                                text={activeSection?.analytics?.quiz + "%"}
                                outerStrokeColor={
                                  activeSection?.analytics?.quiz > 80
                                    ? "green"
                                    : activeSection?.analytics?.quiz > 40
                                    ? "yellow"
                                    : "red"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-auto text-center">
                        <div className="items">
                          <div className="course-progress">
                            <div className="circle-title">
                              <span>
                                <strong>Test</strong>
                              </span>
                            </div>
                            <div className="circle" style={{ width: "100px" }}>
                              <CircleProgress
                                value={activeSection?.analytics?.test}
                                text={activeSection?.analytics?.test + "%"}
                                outerStrokeColor={
                                  activeSection?.analytics?.test > 80
                                    ? "green"
                                    : activeSection?.analytics?.test > 40
                                    ? "yellow"
                                    : "red"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-auto text-center">
                        <div className="items">
                          <div className="course-progress">
                            <div className="circle-title">
                              <span>
                                <strong>Attempt</strong>
                              </span>
                            </div>
                            <div className="circle" style={{ width: "100px" }}>
                              <CircleProgress
                                value={activeSection?.analytics?.attempt}
                                text={activeSection?.analytics?.attempt + "%"}
                                outerStrokeColor={
                                  activeSection?.analytics?.attempt > 80
                                    ? "green"
                                    : activeSection?.analytics?.attempt > 40
                                    ? "yellow"
                                    : "red"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-auto text-center">
                        <div className="items">
                          <div className="course-program">
                            <div className="circle-title">
                              <span>
                                <strong>Accuracy</strong>
                              </span>
                            </div>
                            <div className="circle" style={{ width: "100px" }}>
                              <CircleProgress
                                value={activeSection?.analytics?.accuracy}
                                text={activeSection?.analytics?.accuracy + "%"}
                                outerStrokeColor={
                                  activeSection?.analytics?.accuracy > 80
                                    ? "green"
                                    : activeSection?.analytics?.accuracy > 40
                                    ? "yellow"
                                    : "red"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {questions && (
                    <Accordion defaultActiveKey="0">
                      {questions?.map((question: any, index: number) => (
                        <div
                          className="mb-3"
                          style={{ background: "white", padding: "10px" }}
                          key={index}
                        >
                          <AccordionToggle
                            as="div"
                            eventKey={index.toString()}
                            className="pl-2"
                            id={`header-${question._id}`}
                            onClick={() => {
                              if (idx.includes(index))
                                setIdx(idx.filter((i: any) => i !== index));
                              else setIdx([...idx, index]);
                            }}
                          >
                            <h2 className="heading heading_new">
                              <button
                                className="border-0 text-left p-0 bg-white"
                                style={{ width: "100%" }}
                                type="button"
                              >
                                <table className="table mb-0">
                                  <tr>
                                    <td className="border-0 p-0">
                                      <div className="number p-0">
                                        <span>{question.number}</span>
                                      </div>
                                    </td>
                                    <td className="border-0 p-0">
                                      <strong className="ques w-auto min-w-100 mw-100">
                                        Marks:{" "}
                                        {question.status == 4
                                          ? "pending"
                                          : question.obtainMarks}
                                      </strong>
                                    </td>

                                    <td className="border-0 p-0">
                                      <div className="taken-time p-0">
                                        <span>
                                          {" "}
                                          Time Taken:{" "}
                                          {millisecondsToTime(
                                            question.timeEslapse
                                          )}
                                        </span>
                                      </div>
                                    </td>

                                    <td className="border-0 p-0">
                                      <div className="average-time p-0">
                                        <span>
                                          Average Time:{" "}
                                          {millisecondsToTime(
                                            getAvgTime(
                                              attempts[activeTab][
                                                activeContent.source
                                              ]
                                            )
                                          )}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="border-0 p-0">
                                      <div className="expand-more cursor-pointer">
                                        <span
                                          className="pull-right my-2 material-icons"
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                          }}
                                        >
                                          {idx.includes(index)
                                            ? "expand_less"
                                            : "expand_more"}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </button>
                            </h2>
                          </AccordionToggle>
                          <AccordionCollapse eventKey={index.toString()}>
                            <div className="selection-wrap">
                              <div className="ques-text">
                                <span>
                                  <Mathjax
                                    value={replaceQuestionText(
                                      question,
                                      "",
                                      true
                                    )}
                                  />
                                </span>

                                <div className="row">
                                  {question.audioFiles?.length > 0 &&
                                    question.audioFiles?.map(
                                      (audio: any, index: any) => (
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
                                      )
                                    )}
                                </div>
                              </div>

                              {question.category === "mcq" && (
                                <div>
                                  {question.answers?.map(
                                    (item: any, index: any) => (
                                      <div key={index} className="selection">
                                        <div className="d-flex flex-row align-items-center">
                                          <div className="checkbox-group">
                                            <label>
                                              <input type="checkbox" />
                                              <span
                                                className={`checkmark text-center mt-0 ${
                                                  item.isCheckedByUser &&
                                                  item.isCorrectAnswer
                                                    ? "green"
                                                    : item.isCheckedByUser &&
                                                      !item.isCorrectAnswer
                                                    ? "red"
                                                    : item.isCorrectAnswer
                                                    ? "green"
                                                    : ""
                                                }`}
                                              >
                                                {numberToAlpha(index)}
                                              </span>
                                            </label>
                                          </div>
                                          <div className="p-1">
                                            <Mathjax value={item.answerText} />
                                          </div>
                                        </div>

                                        <div className="row">
                                          {item.audioFiles?.length > 0 &&
                                            item.audioFiles?.map(
                                              (audio: any, audioIndex: any) => (
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
                                              )
                                            )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                              {question.category == "mixmatch" && (
                                <div className="selection-wrap mx-4">
                                  <div className="mix-match d-flex">
                                    <div className="mix-match-content d-flex">
                                      <div className="mix-match-content-inner">
                                        {question.answers?.map(
                                          (ans: any, index: any) => (
                                            <div
                                              key={index}
                                              className="mix-match-drag"
                                            >
                                              <Mathjax value={ans.answerText} />
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>

                                    <div className="mix-match-drop-wrap">
                                      {question.answers?.map(
                                        (a: any, index: any) => (
                                          <div
                                            key={index}
                                            className="mix-match-drop border-0 bg-white"
                                          >
                                            <Mathjax value={a.correctMatch} />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {question.category === "fib" && (
                                <div>
                                  {question.answers?.map(
                                    (item: any, index: any) => (
                                      <>
                                        <div className="given-answer">
                                          <h3>Your Answer</h3>
                                          <span>{item.answeredText}</span>
                                        </div>

                                        <div className="correct-answer">
                                          <h2>Correct Answer</h2>
                                          <span>{item.answerText}</span>
                                        </div>
                                      </>
                                    )
                                  )}
                                </div>
                              )}
                              {question.category === "descriptive" && (
                                <>
                                  {question.answers?.map(
                                    (item: any, index: number) => (
                                      <>
                                        <div className="given-answer">
                                          <h3>Your Answer</h3>

                                          {item?.answerText && (
                                            <Mathjax
                                              value={formatQuestion(
                                                item.answerText
                                              )}
                                            />
                                          )}

                                          {item?.attachments &&
                                            item.attachments?.map(
                                              (att: any, index: any) => (
                                                <div
                                                  key={index}
                                                  className="mt-3 row"
                                                >
                                                  {att.type === "image" && (
                                                    <img
                                                      src={att.url}
                                                      className="col mw-100 mh-100 w-auto h-auto img-thumbnail rounded"
                                                      style={{
                                                        objectFit: "scale-down",
                                                      }}
                                                    />
                                                  )}
                                                  {att.type === "file" && (
                                                    <a
                                                      href={att.url}
                                                      target="_blank"
                                                      className="col"
                                                    >
                                                      {att.name}
                                                    </a>
                                                  )}
                                                  {att.type === "audio" && (
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
                                      </>
                                    )
                                  )}
                                </>
                              )}
                              {question.category === "code" && (
                                <>
                                  <div className="bg-white">
                                    {question.answers.length > 0 && (
                                      <CodeMirror
                                        value={question?.answers[0].code}
                                      />
                                    )}
                                  </div>
                                  <div className="course-tab py-4">
                                    <Tabs
                                      defaultActiveKey="output"
                                      id="question-tabs"
                                    >
                                      <Tab eventKey="output" title="Output">
                                        <div className="heading">
                                          {!question.hasNoAnswer && (
                                            <h4>Compiler Message</h4>
                                          )}
                                        </div>

                                        <form>
                                          <textarea
                                            defaultValue={
                                              question.answers[0]
                                                ?.compileMessage
                                            }
                                            readOnly
                                            className="form-control bg-white border-0"
                                            name="compiler_msg"
                                          />
                                        </form>
                                        {question.answers[0] && (
                                          <div>
                                            <div>
                                              <label>Your Args</label>
                                              <textarea
                                                defaultValue={
                                                  question.answers[0]?.userArgs
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
                                                name="userArgs"
                                              />
                                            </div>
                                            {question.hasUserInput && (
                                              <div>
                                                <label>Your Input</label>
                                                <textarea
                                                  value={
                                                    question.answers[0]
                                                      ?.userInput
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
                                                  name="userInput"
                                                />
                                              </div>
                                            )}
                                            <div>
                                              <label>Your Output</label>
                                              <textarea
                                                value={
                                                  question.answers[0]?.output
                                                }
                                                readOnly
                                                style={{
                                                  resize: "none",
                                                  height: "auto",
                                                  maxHeight: "75px",
                                                  width: "100%",
                                                  color: "black",
                                                }}
                                                name="output"
                                              />
                                            </div>
                                          </div>
                                        )}
                                        <div className="heading">
                                          <div className="row">
                                            <div className="col-6">
                                              <h4>Correct Answer</h4>
                                            </div>

                                            <div className="col-6">
                                              <div className="dropdown ml-auto">
                                                <a
                                                  className="dropdown-toggle bg-white"
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
                                                  {question.coding?.map(
                                                    (lang: any, i: number) => (
                                                      <a
                                                        key={i}
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
                                        <div className="bg-white">
                                          <CodeMirror
                                            style={{ overflowY: "scroll" }}
                                            value={
                                              question.selectedLang.solution
                                            }
                                          />
                                        </div>
                                      </Tab>
                                      <Tab eventKey="stats" title="Stats">
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
                                                        question.selectedLang
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
                                                        question.selectedLang
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
                                                  Number of test cases passed
                                                </span>
                                              </div>
                                              <div className="col-2">
                                                <div className="count ml-auto">
                                                  <span>{`${
                                                    question.stats[
                                                      question.selectedLang
                                                        .language
                                                    ].testcasesPassed
                                                  }/${
                                                    question.stats[
                                                      question.selectedLang
                                                        .language
                                                    ].totalTestcases
                                                  }`}</span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="heading mb-0">
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
                                                        question.selectedLang
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
                                                        question.selectedLang
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
                                                  witnessed a successful compile
                                                </span>
                                              </div>

                                              <div className="col-2">
                                                <div className="count ml-auto">
                                                  <span>
                                                    {
                                                      question.stats[
                                                        question.selectedLang
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
                                                        question.selectedLang
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
                                                        question.selectedLang
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
                                                  Avg. no. of cases passed in
                                                  each compile
                                                </span>
                                              </div>

                                              <div className="col-2">
                                                <div className="count ml-auto">
                                                  <span>
                                                    {
                                                      question.stats[
                                                        question.selectedLang
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
                                                  Avg. time taken between each
                                                  compile
                                                </span>
                                              </div>

                                              <div className="col-2">
                                                <div className="count ml-auto">
                                                  <span>
                                                    {millisecondsToTime(
                                                      question.stats[
                                                        question.selectedLang
                                                          .language
                                                      ].avgTimeBetweenAttempts
                                                    )}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </Tab>
                                      <Tab
                                        eventKey="Test Cases"
                                        title="Test Cases"
                                      >
                                        {question.testcases.map(
                                          (testcase: any, index: number) => (
                                            <div key={index}>
                                              {testcase.useTestFramework ? (
                                                <CodeMirror
                                                  style={{
                                                    overflowY: "scroll",
                                                  }}
                                                  value={testcase.input}
                                                />
                                              ) : (
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
                                                          readOnly
                                                          style={{
                                                            resize: "none",
                                                            height: "auto",
                                                            width: "100%",
                                                            color: "black",
                                                            padding: "2px 5px",
                                                          }}
                                                          name={`testcase_args_${index}`}
                                                        />
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
                                                          value={
                                                            testcase.output
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
                                                        />
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
                                                        <i
                                                          className={`fa fa-check pull-right text-info ${
                                                            testcase.status
                                                              ? ""
                                                              : "hidden"
                                                          }`}
                                                        ></i>
                                                        <i
                                                          className={`fa fa-dot-circle-o pull-right text-danger ${
                                                            !testcase.status
                                                              ? ""
                                                              : "hidden"
                                                          }`}
                                                        ></i>
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
                                                              className="preserve-newline"
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
                                              )}
                                            </div>
                                          )
                                        )}
                                      </Tab>
                                    </Tabs>
                                  </div>
                                </>
                              )}
                              {question?.answerExplain && (
                                <div className="exp">
                                  <h2>Explanation:</h2>
                                  <p>
                                    <Mathjax value={question.answerExplain} />
                                  </p>
                                  {question.answerExplainAudioFiles?.length !==
                                    0 && (
                                    <div className="row">
                                      {question.answerExplainAudioFiles?.map(
                                        (audio: any, index: number) => (
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
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </AccordionCollapse>
                        </div>
                      ))}
                    </Accordion>
                  )}
                  {!questions && (
                    <>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                      <div className="area mb-3">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                      </div>
                    </>
                  )}
                  {questions && !questions.length && (
                    <div className="text-center">
                      <div className="error-analysis-area w-100">
                        <div className="container">
                          <div className="empty-data">
                            <figure className="mx-auto">
                              <img src="/assets/images/bro.png" alt="" />
                            </figure>
                            <svg
                              id="b21613c9-2bf0-4d37-bef0-3b193d34fc5d"
                              data-name="Layer 1"
                              xmlns="http://www.w3.org/2000/svg"
                              width="200.63626"
                              height="200.17383"
                              viewBox="0 0 647.63626 632.17383"
                            >
                              <path
                                d="M687.3279,276.08691H512.81813a15.01828,15.01828,0,0,0-15,15v387.85l-2,.61005-42.81006,13.11a8.00676,8.00676,0,0,1-9.98974-5.31L315.678,271.39691a8.00313,8.00313,0,0,1,5.31006-9.99l65.97022-20.2,191.25-58.54,65.96972-20.2a7.98927,7.98927,0,0,1,9.99024,5.3l32.5498,106.32Z"
                                transform="translate(-276.18187 -133.91309)"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M725.408,274.08691l-39.23-128.14a16.99368,16.99368,0,0,0-21.23-11.28l-92.75,28.39L380.95827,221.60693l-92.75,28.4a17.0152,17.0152,0,0,0-11.28028,21.23l134.08008,437.93a17.02661,17.02661,0,0,0,16.26026,12.03,16.78926,16.78926,0,0,0,4.96972-.75l63.58008-19.46,2-.62v-2.09l-2,.61-64.16992,19.65a15.01489,15.01489,0,0,1-18.73-9.95l-134.06983-437.94a14.97935,14.97935,0,0,1,9.94971-18.73l92.75-28.4,191.24024-58.54,92.75-28.4a15.15551,15.15551,0,0,1,4.40966-.66,15.01461,15.01461,0,0,1,14.32032,10.61l39.0498,127.56.62012,2h2.08008Z"
                                transform="translate(-276.18187 -133.91309)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M398.86279,261.73389a9.0157,9.0157,0,0,1-8.61133-6.3667l-12.88037-42.07178a8.99884,8.99884,0,0,1,5.9712-11.24023l175.939-53.86377a9.00867,9.00867,0,0,1,11.24072,5.9707l12.88037,42.07227a9.01029,9.01029,0,0,1-5.9707,11.24072L401.49219,261.33887A8.976,8.976,0,0,1,398.86279,261.73389Z"
                                transform="translate(-276.18187 -133.91309)"
                                fill="#6c63ff"
                              />
                              <circle
                                cx="190.15351"
                                cy="24.95465"
                                r="20"
                                fill="#6c63ff"
                              />
                              <circle
                                cx="190.15351"
                                cy="24.95465"
                                r="12.66462"
                                fill="#fff"
                              />
                              <path
                                d="M878.81836,716.08691h-338a8.50981,8.50981,0,0,1-8.5-8.5v-405a8.50951,8.50951,0,0,1,8.5-8.5h338a8.50982,8.50982,0,0,1,8.5,8.5v405A8.51013,8.51013,0,0,1,878.81836,716.08691Z"
                                transform="translate(-276.18187 -133.91309)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M723.31813,274.08691h-210.5a17.02411,17.02411,0,0,0-17,17v407.8l2-.61v-407.19a15.01828,15.01828,0,0,1,15-15H723.93825Zm183.5,0h-394a17.02411,17.02411,0,0,0-17,17v458a17.0241,17.0241,0,0,0,17,17h394a17.0241,17.0241,0,0,0,17-17v-458A17.02411,17.02411,0,0,0,906.81813,274.08691Zm15,475a15.01828,15.01828,0,0,1-15,15h-394a15.01828,15.01828,0,0,1-15-15v-458a15.01828,15.01828,0,0,1,15-15h394a15.01828,15.01828,0,0,1,15,15Z"
                                transform="translate(-276.18187 -133.91309)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M801.81836,318.08691h-184a9.01015,9.01015,0,0,1-9-9v-44a9.01016,9.01016,0,0,1,9-9h184a9.01016,9.01016,0,0,1,9,9v44A9.01015,9.01015,0,0,1,801.81836,318.08691Z"
                                transform="translate(-276.18187 -133.91309)"
                                fill="#6c63ff"
                              />
                              <circle
                                cx="433.63626"
                                cy="105.17383"
                                r="20"
                                fill="#6c63ff"
                              />
                              <circle
                                cx="433.63626"
                                cy="105.17383"
                                r="12.18187"
                                fill="#fff"
                              />
                            </svg>
                            <h3>The student has not attempted the test</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewComponent;
