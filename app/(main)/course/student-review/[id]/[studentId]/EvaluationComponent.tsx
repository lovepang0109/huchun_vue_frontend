"use client";
import CodeMirror from "@uiw/react-codemirror";
import { getSession } from "next-auth/react";
import CircleProgress from "@/components/CircleProgress";
import Mathjax from "@/components/assessment/mathjax";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
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
import { getCourseSectionsByStatus } from "@/services/courseService";
import { questionEvaluation } from "@/services/evaluationService";
import { success } from "alertifyjs";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

const EvaluationComponent = ({
  id,
  studentId,
  course,
  questions,
  setQuestions,
  activeTab,
  attempts,
  onContentChange,
  onEvaluation,
}: any) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeContent, setActiveContent] = useState<any>([]);
  const [activeSection, setActiveSection] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [sections, setSections] = useState<any>([]);
  const [token, setToken] = useState(null);
  const [line, setLine] = useState(1);
  const [col, setCol] = useState(1);
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
  const [params, setParams] = useState<any>({
    status: 4,
  });
  const ckeOptions = {
    placeholder: "Share somethings...",
    toolbar: {
      items: [
        "|",
        "bold",
        "italic",
        "|",
        "numberedList",
        "bulletedList",
        "|",
        "undo",
        "redo",
        "|",
      ],
    },
  };

  useEffect(() => {
    getCourseFunction();
  }, []);

  const getCourseFunction = async () => {
    getCourseSectionsByStatus(id, studentId, { ...params })
      .then((res: any) => {
        console.log(res, "this is res data");
        setEvaluationSections(res);

        setLoading(false);
        setInitialized(true);
      })
      .catch((err: any) => {
        setLoading(false);
        setInitialized(true);
      });
  };

  const setEvaluationSections = (sectionData: any) => {
    console.log(sectionData, "this is rasadsadses data");
    const updatedSections = sectionData.map((pendingSec: any) => {
      const sec = course.sections.find((s: any) => s._id === pendingSec._id);
      return {
        ...pendingSec,
        title: sec.title,
        pending: 0,
        contents: pendingSec.forEach((c: any) => {
          pendingSec.pending += c.attempt.QA.length;
          c.pending = c.attempt.QA.length;
        }),
      };
    });
    setSections(updatedSections);
    console.log(updatedSections, "this isupdated section");
    setActiveSection(updatedSections[0]);
    if (updatedSections[0] && updatedSections[0].contents) {
      selectContent(updatedSections[0], updatedSections[0].contents[0]);
    }
  };

  const selectContent = (section: any, content: any) => {
    let activeContentData = content;
    setActiveSection(section);
    if (!content.source) {
      activeContentData.source = content.content;
    }
    setActiveContent({ ...activeContentData });
    onContentChange({ section: section, content: { ...activeContentData } });
  };

  const onLanguageChanged = (lang: any, index: any) => {
    const questionsData = questions;
    questionsData[index].selectedLang = lang;
    setQuestions(questionsData);
  };

  const submitQuestionMarks = (question: any, qI: any) => {
    const params = {
      _id: attempts[activeTab][activeContent.source]._id,
      question: question._id,
      marks: question.evaluatedMarks,
      teacherComment: question.teacherEvaluation,
      status: 4,
    };

    if (question.category === "descriptive") {
      params.status = 5;
    } else {
      if (question.evaluatedMarks == question.plusMark) {
        params.status = 1;
      } else if (question.evaluatedMarks == question.minusMark) {
        params.status = 2;
      } else {
        params.status = 5;
      }
    }

    questionEvaluation(params._id, params).then((data) => {
      const attempt = { ...attempts[activeTab][activeContent.source] };
      success("Question Marks submitted successfully.");
      setActiveIndex(qI + 1);
      const questionsData = questions;
      questionsData[qI] = {
        ...question,
        status: params.status,
        obtainMarks: params.marks,
        teacherEvaluation: question.teacherEvaluation,
      };
      setQuestions(questionsData);
      for (let i = 0; i < attempt.QA.length; i++) {
        if (attempt.QA[i] && attempt.QA[i].question === question._id) {
          attempt.QA[i].teacherComment = question.teacherEvaluation;
          attempt.QA[i].obtainMarks = question.evaluatedMarks;
          attempt.QA[i].status = params.status;
        }
      }
      onEvaluation({
        ...question,
        status: params.status,
        obtainMarks: params.marks,
        teacherEvaluation: question.teacherEvaluation,
      });
    });
  };

  return (
    <div className="over-view" id="solutions">
      <div className="error-analysis error-analysis_new clearfix mx-auto mw-100">
        {loading ? (
          <SkeletonLoaderComponent Cwidth="100" Cheight="150" />
        ) : (
          <>
            <div className="row">
              <div className="col-lg-2">
                <div className="accordion" id="accordion">
                  {sections.map((section: any, i: any) => (
                    <div className="item mb-2" key={i}>
                      <div id={`section${i}`} className="row ">
                        <div className="col my-12">
                          <button
                            className="text-left border-0 p-0 bg-transparent"
                            type="button"
                            data-toggle="collapse"
                            data-target={`#collapse${i}`}
                            aria-expanded={activeContent === section}
                            aria-controls={`collapse${i}`}
                          >
                            {section.title + "(" + section?.pending + ")"}
                          </button>
                        </div>
                      </div>
                      <div
                        id={`collapse${i}`}
                        aria-labelledby={`section${i}`}
                        data-parent="#accordion"
                        className={`collapse ${
                          activeSection == section ? "show" : ""
                        }`}
                      >
                        {section.contents.map((content: any, j: any) => (
                          <div key={j} className="row">
                            <div className="col-12">
                              <a
                                onClick={() => selectContent(section, content)}
                                role="button"
                              >
                                {content.type === "quiz" && (
                                  <span className="iconc-quiz d-flex ml-3 my-1">
                                    <span
                                      className={`font-karla ml-1 ${
                                        activeContent === content
                                          ? "active"
                                          : ""
                                      }`}
                                      style={{ display: "inline-flex" }}
                                    >
                                      {content.title +
                                        "(" +
                                        content?.pending +
                                        ")"}
                                    </span>
                                  </span>
                                )}
                                {content.type === "assessment" && (
                                  <span className="iconc-assesment d-flex ml-3 my-1">
                                    <span
                                      className={`font-karla ml-1 ${
                                        activeContent === content
                                          ? "active"
                                          : ""
                                      }`}
                                      style={{ display: "inline-flex" }}
                                    >
                                      {content.title +
                                        "(" +
                                        content?.pending +
                                        ")"}
                                    </span>
                                  </span>
                                )}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-10">
                {questions && questions.length > 0 && (
                  <div className="error-analysis-area w-100">
                    <div className="accordation-area pt-0 ">
                      <div className="accordion">
                        <div className="title">
                          <div className="section_heading_wrapper">
                            <h3 className="section_top_heading">
                              Pending Evaluations
                            </h3>
                          </div>
                        </div>
                        {questions && (
                          <Accordion defaultActiveKey="0">
                            {questions.map((question: any, index: number) => (
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
                                >
                                  <div
                                    className="accordation-heading-marks"
                                    style={{ width: "100%" }}
                                  >
                                    <div className="row">
                                      <div className="col-md-12">
                                        <div className="form-row">
                                          <div className="col-auto">
                                            <div className="ques-num number p-0">
                                              <span>{question.number}</span>
                                            </div>
                                          </div>
                                          <div className="col align-self-center">
                                            <Mathjax
                                              value={replaceQuestionText(
                                                question,
                                                "",
                                                true
                                              )}
                                            />
                                            {question.audioFiles?.length && (
                                              <div className="row">
                                                {question.audioFiles.map(
                                                  (
                                                    audio: any,
                                                    index: number
                                                  ) => (
                                                    <div
                                                      key={index}
                                                      className="position-relative my-2 col-lg-6 col-12"
                                                    >
                                                      <label>
                                                        {audio.name}
                                                      </label>
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
                                          <div className="col-auto">
                                            <span className="mark-p text-white d-inline-block">
                                              +{question.plusMark}
                                            </span>
                                            <span className="mark-n text-white d-inline-block">
                                              {question.minusMark}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="heading">
                                        <button
                                          className="border-0 text-left p-0"
                                          type="button"
                                        ></button>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionToggle>
                                <AccordionCollapse eventKey={index.toString()}>
                                  <div className="selection-wrap">
                                    {question.category === "mcq" && (
                                      <div>
                                        {question.answers.map(
                                          (item: any, index: any) => (
                                            <div
                                              key={index}
                                              className="selection"
                                            >
                                              <div className="d-flex align-items-center">
                                                <div className="checkbox-group h-auto">
                                                  <label className="m-0">
                                                    <input type="checkbox" />
                                                    <span
                                                      className={`checkmark text-center ${
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
                                                <div className="p-0 pl-2">
                                                  <Mathjax
                                                    value={item.answerText}
                                                  />
                                                </div>
                                              </div>

                                              <div className="row">
                                                {item.audioFiles?.length > 0 &&
                                                  item.audioFiles.map(
                                                    (
                                                      audio: any,
                                                      audioIndex: any
                                                    ) => (
                                                      <div
                                                        key={audioIndex}
                                                        className="position-relative my-2 col-lg-6 col-12"
                                                      >
                                                        <label>
                                                          {audio.name}
                                                        </label>
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
                                              {question.answers.map(
                                                (ans: any, index: any) => (
                                                  <div
                                                    key={index}
                                                    className="mix-match-drag"
                                                  >
                                                    <Mathjax
                                                      value={ans.answerText}
                                                    />
                                                  </div>
                                                )
                                              )}
                                            </div>
                                            <div className="line-wrap">
                                              {question.answers.map(
                                                (ans: any, index: number) => (
                                                  <div
                                                    key={index}
                                                    className="line"
                                                  ></div>
                                                )
                                              )}
                                            </div>
                                          </div>

                                          <div className="mix-match-drop-wrap">
                                            {question.answers.map(
                                              (a: any, index: any) => (
                                                <div
                                                  key={index}
                                                  className="mix-match-drop border-0 bg-white"
                                                >
                                                  <Mathjax
                                                    value={a.correctMatch}
                                                  />
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {question.category === "fib" && (
                                      <div>
                                        {question.answers.map(
                                          (item: any, index: any) => (
                                            <>
                                              <div className="given-answer">
                                                <h3>Your Answer</h3>
                                                <span>{item.answeredText}</span>
                                              </div>

                                              <div className="correct-answer">
                                                <h6>Correct Answer</h6>
                                                <span>{item.answerText}</span>
                                              </div>
                                            </>
                                          )
                                        )}
                                      </div>
                                    )}
                                    {question.category === "descriptive" && (
                                      <>
                                        {question.answers.map(
                                          (item: any, index: number) => (
                                            <>
                                              <div>
                                                <h3>Your Answer</h3>

                                                {item?.answerText && (
                                                  <Mathjax
                                                    value={item.answerText}
                                                  />
                                                )}

                                                {item?.attachments &&
                                                  item.attachments.map(
                                                    (att: any, index: any) => (
                                                      <div
                                                        key={index}
                                                        className="mt-3 row"
                                                      >
                                                        {att.type ===
                                                          "image" && (
                                                          <img
                                                            src={att.url}
                                                            className="col mw-100 mh-100 w-auto h-auto img-thumbnail rounded"
                                                            style={{
                                                              objectFit:
                                                                "scale-down",
                                                            }}
                                                            alt=""
                                                          />
                                                        )}
                                                        {att.type ===
                                                          "file" && (
                                                          <a
                                                            href={att.url}
                                                            target="_blank"
                                                            className="col"
                                                          >
                                                            {att.name}
                                                          </a>
                                                        )}
                                                        {att.type ===
                                                          "audio" && (
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
                                            <Tab
                                              eventKey="output"
                                              title="Output"
                                            >
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
                                                        question.answers[0]
                                                          ?.userArgs
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
                                                        question.answers[0]
                                                          ?.output
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
                                                        {question.coding.map(
                                                          (
                                                            lang: any,
                                                            i: number
                                                          ) => (
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
                                                  style={{
                                                    overflowY: "scroll",
                                                  }}
                                                  value={
                                                    question.selectedLang
                                                      .solution
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
                                                        Time taken to
                                                        compile(ms)
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
                                                        <span>{`${
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].testcasesPassed
                                                        }/${
                                                          question.stats[
                                                            question
                                                              .selectedLang
                                                              .language
                                                          ].totalTestcases
                                                        }`}</span>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <div className="heading mb-0">
                                                    <h4>
                                                      Execution Statistics
                                                    </h4>
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
                                                        Number of compile
                                                        attempts made
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
                                                        Number of compile
                                                        attempts witnessed a
                                                        successful compile
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
                                                        Number of compile
                                                        attempts witnessed a
                                                        time-out
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
                                                        Number of compile
                                                        attempts witnessed a run
                                                        time error
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
                                              eventKey="Test Cases"
                                              title="Test Cases"
                                            >
                                              {question.testcases.map(
                                                (
                                                  testcase: any,
                                                  index: number
                                                ) => (
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
                                                                padding: "10px",
                                                                verticalAlign:
                                                                  "top",
                                                              }}
                                                            >
                                                              Argument
                                                            </div>
                                                            <div
                                                              style={{
                                                                display:
                                                                  "table-cell",
                                                              }}
                                                            >
                                                              <textarea
                                                                value={
                                                                  testcase.args
                                                                }
                                                                readOnly
                                                                style={{
                                                                  resize:
                                                                    "none",
                                                                  height:
                                                                    "auto",
                                                                  width: "100%",
                                                                  color:
                                                                    "black",
                                                                  padding:
                                                                    "2px 5px",
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
                                                                    padding:
                                                                      "10px",
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
                                                                      resize:
                                                                        "none",
                                                                      height:
                                                                        "auto",
                                                                      width:
                                                                        "100%",
                                                                      color:
                                                                        "black",
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
                                                              Expected output
                                                            </div>
                                                            <div
                                                              style={{
                                                                display:
                                                                  "table-cell",
                                                                verticalAlign:
                                                                  "top",
                                                              }}
                                                            >
                                                              <textarea
                                                                value={
                                                                  testcase.output
                                                                }
                                                                readOnly
                                                                style={{
                                                                  resize:
                                                                    "none",
                                                                  height:
                                                                    "auto",
                                                                  maxHeight:
                                                                    "75px",
                                                                  width: "100%",
                                                                  color:
                                                                    "black",
                                                                  padding:
                                                                    "2px 5px",
                                                                }}
                                                              />
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
                                                                        width:
                                                                          "1%",
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
                                                                    padding:
                                                                      "10px",
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
                                                                    padding:
                                                                      "10px",
                                                                  }}
                                                                >
                                                                  <div
                                                                    className="preserve-newline"
                                                                    style={{
                                                                      color:
                                                                        "red",
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
                                                                    padding:
                                                                      "10px",
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
                                    <hr />
                                    <div className="row align-middle">
                                      <div className="col-sm-8">
                                        <h5>Teacher Evaluation</h5>
                                      </div>
                                      <div className="col-sm-4 d-flex flex-row-reverse align-items-center">
                                        <input
                                          type="number"
                                          className="border-0"
                                          style={{
                                            backgroundColor: "#c4c4c4",
                                            width: "50px",
                                          }}
                                          name="obtain_marks"
                                          defaultValue={question.evaluatedMarks}
                                          max={question.actualMarks}
                                          placeholder="Enter Marks"
                                          required
                                          aria-disabled="true"
                                        />
                                        <h5 className="d-inline px-2">
                                          Marks Awarded
                                        </h5>
                                      </div>
                                    </div>
                                    <div className="row">
                                      <div className="col-sm-12">
                                        <CKEditorCustomized
                                          defaultValue={
                                            question.teacherEvaluation
                                          }
                                          onChangeCon={(data: any) => {
                                            setQuestions((prev: any) => {
                                              const newArray = { ...prev };
                                              newArray[
                                                index
                                              ].teacherEvaluation = data;
                                              return newArray;
                                            });
                                          }}
                                          className="form-control ml-2"
                                          config={ckeOptions}
                                        />
                                      </div>
                                    </div>
                                    <div className="row check">
                                      <div className="col-sm-12 text-right mt-2">
                                        <span
                                          className="btn btn-primary assign-next-remove"
                                          aria-disabled={question.status != 4}
                                          onClick={() =>
                                            submitQuestionMarks(question, index)
                                          }
                                        >
                                          Assign Marks and Next
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionCollapse>
                              </div>
                            ))}
                          </Accordion>
                        )}
                        {!questions && !initialized && (
                          <>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                            <div className="area mb-3">
                              <SkeletonLoaderComponent
                                Cwidth={100}
                                Cheight={30}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!questions && initialized && sections.length === 0 && (
              <div className="row">
                <div className="col-sm-12 text-center">
                  <div className="error-analysis-area w-100">
                    <div className="container">
                      <div className="empty-data">
                        <figure className="mx-auto">
                          <img src="/assets/images/bro.png" alt="" />
                        </figure>
                        <br />
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
                        <h3>Hurray !</h3>
                        <p>Everything is completed, nothing pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluationComponent;
