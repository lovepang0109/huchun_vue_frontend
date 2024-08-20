"use client";
import CodeMirror from "@uiw/react-codemirror";
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
import {
  getCourseSectionsByStatus,
  getCourseSectionsReport,
} from "@/services/courseService";
import { questionEvaluation } from "@/services/evaluationService";
import { success } from "alertifyjs";

const ErrorComponent = ({
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
  const [activeSection, setActiveSection] = useState<any>([]);
  const [initialized, setInitialized] = useState(false);

  const [sections, setSections] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState(null);
  const [line, setLine] = useState(1);
  const [col, setCol] = useState(1);
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
  const [params, setParams] = useState<any>({
    status: 2,
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
        setEvaluationSections(res);

        setLoading(false);
        setInitialized(true);
      })
      .catch((err: any) => {
        setInitialized(true);
      });
  };

  const setEvaluationSections = (data: any) => {
    const updatedSections = data.map((pendingSec: any) => {
      const sec = course.sections.find((s: any) => s._id === pendingSec._id);
      return { ...pendingSec, title: sec.title };
    });
    setSections(updatedSections);
    setActiveSection(updatedSections[0]);
    if (updatedSections[0] && updatedSections[0].contents) {
      selectContent(updatedSections[0], updatedSections[0].contents[0]);
    }
  };

  const selectContent = (
    section: any,
    content: any,
    updatedSectionsData?: any
  ) => {
    let activeContentData = content;

    if (!content.source) {
      activeContentData.source = content.content;
    }
    setActiveContent({ ...activeContentData });
    onContentChange({ section: section, content: { ...activeContentData } });

    if (!section.report) {
      getCourseSectionsReport(id, studentId, {
        ...params,
        section: section._id,
      }).then((res: any) => {
        setSections((prev: any) => {
          const prevData = updatedSectionsData || prev;
          const newArray = prevData.map((s: any) => {
            if (s._id === section._id) {
              setActiveSection({ ...s, report: res });
              return { ...s, report: res };
            } else {
              return s;
            }
          });
          return newArray;
        });
      });
    } else {
      setActiveSection(section);
    }
  };

  const onLanguageChanged = (lang: any, index: any) => {
    const questionsData = questions;
    questionsData[index].selectedLang = lang;
    setQuestions(questionsData);
  };

  return (
    <div className="over-view" id="solutions">
      <div className="error-analysis error-analysis_new clearfix mx-auto mw-100">
        <div className="row">
          <div className="col-lg-2">
            <div className="accordion" id="accordion">
              {sections?.map((section: any, i: any) => (
                <div className="item mb-1" key={i}>
                  <div
                    id={`section${i}`}
                    className="row no-gutters section-chart-wrapper align-items-center"
                  >
                    <div className="col my-2">
                      <button
                        className="text-left border-0 p-0 bg-transparent"
                        type="button"
                        data-toggle="collapse"
                        data-target={`#collapse${i}`}
                        aria-expanded={activeContent === section}
                        aria-controls={`collapse${i}`}
                      >
                        {section.title + "(" + section?.contents?.length + ")"}
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
                      <div className="row" key={j}>
                        <div className="col-12">
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
                                  style={{ display: "inline-flex" }}
                                >
                                  {content.title}
                                </span>
                              </span>
                            )}
                            {content.type === "assessment" && (
                              <span className="iconc-assesment d-flex my-1 ml-3">
                                <span
                                  className={`font-karla ml-1 ${
                                    activeContent === content ? "active" : ""
                                  }`}
                                  style={{ display: "inline-flex" }}
                                >
                                  {content.title}
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
            <div className="error-analysis-area w-100">
              {initialized && sections.length !== 0 && (
                <div className="row">
                  <div className="col-lg-3">
                    <div className="item mb-3 mx-0">
                      <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                        <div className="d-flex flex-row align-items-center">
                          <figure>
                            <img
                              src="/assets/images/emojione_sad-but-relieved-face.png"
                              alt=""
                            />
                          </figure>

                          <div className="title px-2">
                            <h4>Incorrect</h4>
                          </div>
                        </div>
                      </div>

                      <div className="content">
                        <span className="text-center">
                          {activeSection?.report?.incorrect}/
                          {activeSection?.report?.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3">
                    <div className="item mb-3 mx-0">
                      <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                        <div className="d-flex flex-row align-items-center">
                          <figure>
                            <img
                              src="/assets/images/emojione_beaming-face-with-smiling-eyes.png"
                              alt=""
                            />
                          </figure>

                          <div className="title px-2">
                            <h4>Correct</h4>
                          </div>
                        </div>
                      </div>

                      <div className="content">
                        <span className="text-center">
                          {activeSection?.report?.correct}/
                          {activeSection?.report?.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 ">
                    <div className="item mb-3 mx-0">
                      <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                        <div className="d-flex flex-row align-items-center">
                          <figure>
                            <img src="/assets/images/smile.png" alt="" />
                          </figure>

                          <div className="title px-2">
                            <h4>Partial</h4>
                          </div>
                        </div>
                      </div>

                      <div className="content">
                        <span className="text-center">
                          {activeSection?.report?.partial}/
                          {activeSection?.report?.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3">
                    <div className="item mb-3 mx-0">
                      <div className="item-wrap clearfix d-flex align-items-center justify-content-center">
                        <div className="d-flex flex-row align-items-center">
                          <figure>
                            <img src="/assets/images/emoji.png" alt="" />
                          </figure>

                          <div className="title px-2">
                            <h4>Skipped</h4>
                          </div>
                        </div>
                      </div>

                      <div className="content">
                        <span className="text-center">
                          {activeSection?.report?.skipped}/
                          {activeSection?.report?.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {initialized && sections.length === 0 && (
                <div className="container">
                  <div className="row">
                    <div className="col-sm-12 text-center">
                      <div className="empty-data">
                        <figure className="mx-auto">
                          <img src="/assets/images/rafiki1.png" alt="" />
                        </figure>
                        <br />
                        <svg
                          id="bac3cfc7-b61b-48ce-8441-8100e40ddaa6"
                          data-name="Layer 1"
                          xmlns="http://www.w3.org/2000/svg"
                          width="797.5"
                          height="834.5"
                          viewBox="0 0 797.5 834.5"
                        >
                          <title>void</title>
                          <ellipse
                            cx="308.5"
                            cy="780"
                            rx="308.5"
                            ry="54.5"
                            fill="#3f3d56"
                          />
                          <circle
                            cx="496"
                            cy="301.5"
                            r="301.5"
                            fill="#3f3d56"
                          />
                          <circle
                            cx="496"
                            cy="301.5"
                            r="248.89787"
                            opacity="0.05"
                          />
                          <circle
                            cx="496"
                            cy="301.5"
                            r="203.99362"
                            opacity="0.05"
                          />
                          <circle
                            cx="496"
                            cy="301.5"
                            r="146.25957"
                            opacity="0.05"
                          />
                          <path
                            d="M398.42029,361.23224s-23.70394,66.72221-13.16886,90.42615,27.21564,46.52995,27.21564,46.52995S406.3216,365.62186,398.42029,361.23224Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#d0cde1"
                          />
                          <path
                            d="M398.42029,361.23224s-23.70394,66.72221-13.16886,90.42615,27.21564,46.52995,27.21564,46.52995S406.3216,365.62186,398.42029,361.23224Z"
                            transform="translate(-201.25 -32.75)"
                            opacity="0.1"
                          />
                          <path
                            d="M415.10084,515.74682s-1.75585,16.68055-2.63377,17.55847.87792,2.63377,0,5.26754-1.75585,6.14547,0,7.02339-9.65716,78.13521-9.65716,78.13521-28.09356,36.8728-16.68055,94.81576l3.51169,58.82089s27.21564,1.75585,27.21564-7.90132c0,0-1.75585-11.413-1.75585-16.68055s4.38962-5.26754,1.75585-7.90131-2.63377-4.38962-2.63377-4.38962,4.38961-3.51169,3.51169-4.38962,7.90131-63.2105,7.90131-63.2105,9.65716-9.65716,9.65716-14.92471v-5.26754s4.38962-11.413,4.38962-12.29093,23.70394-54.43127,23.70394-54.43127l9.65716,38.62864,10.53509,55.3092s5.26754,50.04165,15.80262,69.356c0,0,18.4364,63.21051,18.4364,61.45466s30.72733-6.14547,29.84941-14.04678-18.4364-118.5197-18.4364-118.5197L533.62054,513.991Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M391.3969,772.97846s-23.70394,46.53-7.90131,48.2858,21.94809,1.75585,28.97148-5.26754c3.83968-3.83968,11.61528-8.99134,17.87566-12.87285a23.117,23.117,0,0,0,10.96893-21.98175c-.463-4.29531-2.06792-7.83444-6.01858-8.16366-10.53508-.87792-22.826-10.53508-22.826-10.53508Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M522.20753,807.21748s-23.70394,46.53-7.90131,48.28581,21.94809,1.75584,28.97148-5.26754c3.83968-3.83969,11.61528-8.99134,17.87566-12.87285a23.117,23.117,0,0,0,10.96893-21.98175c-.463-4.29531-2.06792-7.83444-6.01857-8.16367-10.53509-.87792-22.826-10.53508-22.826-10.53508Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#2f2e41"
                          />
                          <circle
                            cx="295.90488"
                            cy="215.43252"
                            r="36.90462"
                            fill="#ffb8b8"
                          />
                          <path
                            d="M473.43048,260.30832S447.07,308.81154,444.9612,308.81154,492.41,324.62781,492.41,324.62781s13.70743-46.39439,15.81626-50.61206Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#ffb8b8"
                          />
                          <path
                            d="M513.86726,313.3854s-52.67543-28.97148-57.943-28.09356-61.45466,50.04166-60.57673,70.2339,7.90131,53.55335,7.90131,53.55335,2.63377,93.05991,7.90131,93.93783-.87792,16.68055.87793,16.68055,122.90931,0,123.78724-2.63377S513.86726,313.3854,513.86726,313.3854Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#d0cde1"
                          />
                          <path
                            d="M543.2777,521.89228s16.68055,50.91958,2.63377,49.16373-20.19224-43.89619-20.19224-43.89619Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#ffb8b8"
                          />
                          <path
                            d="M498.50359,310.31267s-32.48318,7.02339-27.21563,50.91957,14.9247,87.79237,14.9247,87.79237l32.48318,71.11182,3.51169,13.16886,23.70394-6.14547L528.353,425.32067s-6.14547-108.86253-14.04678-112.37423A33.99966,33.99966,0,0,0,498.50359,310.31267Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#d0cde1"
                          />
                          <polygon
                            points="277.5 414.958 317.885 486.947 283.86 411.09 277.5 414.958"
                            opacity="0.1"
                          />
                          <path
                            d="M533.896,237.31585l.122-2.82012,5.6101,1.39632a6.26971,6.26971,0,0,0-2.5138-4.61513l5.97581-.33413a64.47667,64.47667,0,0,0-43.1245-26.65136c-12.92583-1.87346-27.31837.83756-36.182,10.43045-4.29926,4.653-7.00067,10.57018-8.92232,16.60685-3.53926,11.11821-4.26038,24.3719,3.11964,33.40938,7.5006,9.18513,20.602,10.98439,32.40592,12.12114,4.15328.4,8.50581.77216,12.35457-.83928a29.721,29.721,0,0,0-1.6539-13.03688,8.68665,8.68665,0,0,1-.87879-4.15246c.5247-3.51164,5.20884-4.39635,8.72762-3.9219s7.74984,1.20031,10.062-1.49432c1.59261-1.85609,1.49867-4.559,1.70967-6.99575C521.28248,239.785,533.83587,238.70653,533.896,237.31585Z"
                            transform="translate(-201.25 -32.75)"
                            fill="#2f2e41"
                          />
                          <circle cx="559" cy="744.5" r="43" fill="#6c63ff" />
                          <circle cx="54" cy="729.5" r="43" fill="#6c63ff" />
                          <circle cx="54" cy="672.5" r="31" fill="#6c63ff" />
                          <circle cx="54" cy="624.5" r="22" fill="#6c63ff" />
                        </svg>
                        <h3 className="text-center">Nothing For Analysis</h3>
                        <p className="text-center">
                          The student has not started the section
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="accordation-area pt-3 ">
                <div className="accordion">
                  {!loading && questions && (
                    <>
                      <div className="title-remove">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            Questions where user made mistake
                          </h3>
                        </div>
                      </div>
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
                              onClick={() => {
                                if (idx.includes(index))
                                  setIdx(idx.filter((i: any) => i !== index));
                                else setIdx([...idx, index]);
                              }}
                            >
                              <h2 className="heading heading_new">
                                <button
                                  className="btn-accordion-header border-0 text-left p-0 bg-white"
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
                                          Marks: {question.obtainMarks}
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
                                        <div
                                          key={index}
                                          className="selection my-1"
                                        >
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
                                            <div className="p-0 pl-2">
                                              <Mathjax
                                                value={item.answerText}
                                              />
                                            </div>
                                          </div>

                                          <div className="row">
                                            {item.audioFiles?.length > 0 &&
                                              item.audioFiles?.map(
                                                (
                                                  audio: any,
                                                  audioIndex: any
                                                ) => (
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
                                                <Mathjax
                                                  value={ans.answerText}
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                        <div className="line-wrap">
                                          {question.answers?.map(
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
                                                          objectFit:
                                                            "scale-down",
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
                                          <div className="heading heading_new">
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
                                          <div className="heading heading_new">
                                            <div className="row">
                                              <div className="col">
                                                <h4>Correct Answer</h4>
                                              </div>

                                              <div className="col-auto ml-auto">
                                                <div className="dropdown ml-auto">
                                                  <a
                                                    className="dropdown-toggle caret-on-dropdown bg-white text-capitalize text-black p-1"
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
                                                    witnessed a successful
                                                    compile
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
                                          {question.testcases?.map(
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
                                                              resize: "none",
                                                              height: "auto",
                                                              width: "100%",
                                                              color: "black",
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
                                                            textAlign: "right",
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
                                                              resize: "none",
                                                              height: "auto",
                                                              maxHeight: "75px",
                                                              width: "100%",
                                                              color: "black",
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
                                    <h6>Explanation:</h6>
                                    <p>
                                      <Mathjax value={question.answerExplain} />
                                    </p>
                                    {question.answerExplainAudioFiles
                                      ?.length !== 0 && (
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
                    </>
                  )}
                  {loading ||
                    (!questions && !initialized && (
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
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
