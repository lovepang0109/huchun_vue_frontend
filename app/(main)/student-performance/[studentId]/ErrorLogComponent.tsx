"use client";
import { update } from "lodash";
import React, { useState, useEffect, useRef } from "react";
import * as questionSvc from "@/services/questionService";
import { useSession } from "next-auth/react";
import { questionStatus, reArrangeAnswers, serialize } from "@/lib/common";
import * as alertify from "alertifyjs";
import CustomPagination from "@/components/CustomPagenation";
import MathJax from "@/components/assessment/mathjax";
import { replaceQuestionText, formatQuestion, numberToAlpha } from "@/lib/pipe";
import { Tab, Tabs, Modal, ProgressBar } from "react-bootstrap";
import CodeRenderer from "@/components/assessment/code-renderer";
import { fromNow } from "@/lib/pipe";

const ErrorLogComponent = ({ student, subjects }: any) => {
  const user: any = useSession()?.data?.user?.info || {};
  const [questions, setQuestions] = useState<any>([]);
  const [total, setTotal] = useState<any>(null);
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
  });
  const [codingLanguages, setCodingLanguages] = useState<any>([]);
  const [feedbackError, setFeedbackError] = useState<string>("");
  const [feedbackOptions, setFeedbackOptions] = useState<any>([
    {
      text: "I failed to use all the information provided to me in the system.",
      checked: false,
    },
    {
      text: "I did not understand the concept tested.",
      checked: false,
    },
    {
      text: "I understood the concept tested but failed to properly apply it.",
      checked: false,
    },
    {
      text: "My written work was unorganized and difficult to follow.",
      checked: false,
    },
    {
      text: "I fell for a trap answer.",
      checked: false,
    },
  ]);

  const [qfeedbackForm, setQfeedbackForm] = useState<any>({
    notes: "",
  });
  const [mdref, setMdref] = useState<boolean>(false);
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [selectAllSub, setSelectAllSub] = useState<boolean>(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [stats, setStats] = useState<any>([]);
  const [sumStats, setSumStats] = useState<number>(0);
  const [openIndex, setOpenIndex] = useState(null);
  const [isToggled, setIsToggled] = useState<boolean[]>(
    Array(questions.length).fill(false)
  );

  const toggleContent = (index: number) => {
    const updatedToggles = [...isToggled];
    updatedToggles[index] = !updatedToggles[index];
    setIsToggled(updatedToggles);
  };

  const toggleAccordion = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    setParams({
      ...params,
      user: student._id,
    });

    filterSubject("All");
  }, []);

  const onPageChanged = (ev: any) => {
    const para = params;
    para.page = ev;
    setParams({
      ...params,
      page: ev,
    });
    questionSvc
      .getErrorLogQuestions({ ...para })
      .then(({ questions }: any) => {
        setQuestions(processQuestions(questions));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const processQuestions = (questions: any) => {
    for (const question of questions) {
      question.stats = {};
      // Need to rearrange answers array to make it consistent with take-test screen
      question.answers = reArrangeAnswers(question.answers);

      const questionAnswers = question.answers;
      const userAnswers = question.userAnswer;
      // console.log(this.attempt.userAnswers[0].testcases);
      let tmp_codingLang = codingLanguages;
      if (question.category == "descriptive") {
        question.answers = userAnswers;
      } else if (question.category === "code") {
        tmp_codingLang = [];
        // Load list of language
        question.coding.forEach((c) => {
          if (c.language === "python") {
            tmp_codingLang.push({
              display: "Python",
              language: "python",
            });
            c["display"] = "Python";
          } else if (c.language === "c") {
            tmp_codingLang.push({
              display: "C",
              language: "c",
            });
            c["display"] = "C";
          } else if (c.language === "cpp") {
            tmp_codingLang.push({
              display: "C++",
              language: "cpp",
            });
            c["display"] = "C++";
          } else if (c.language === "java") {
            tmp_codingLang.push({
              display: "Java",
              language: "java",
            });
            c["display"] = "Java";
          } else if (c.language == "ruby") {
            tmp_codingLang.push({
              display: "Ruby",
              language: "ruby",
            });
            c["display"] = "Ruby";
          }
          setCodingLanguages(tmp_codingLang);

          question.stats[c.language] = {
            compileTime: 0,
            runTime: 0,
            testcasesPassed: 0,
            totalTestcases: 0,
          };
        });

        question.hasNoAnswer = true;

        if (userAnswers.length > 0) {
          question.answers[0].isCorrectAnswerOfUser = question.status === 2;

          const idx = question.coding.findIndex(
            (q) => q.language == userAnswers[0].codeLanguage
          );

          question.hasNoAnswer = false;

          question.selectedLang = question.coding[idx];
          // Check testcase status of student code
          if (userAnswers[0].testcases) {
            let runTime = 0;
            let testPassed = 0;
            question.testcases.forEach((t: any) => {
              const tInput = question.hasUserInput ? t.input : "";
              const tArgs = question.hasArgs ? t.args : "";
              const idx = userAnswers[0].testcases.findIndex((tc) => {
                return tc.input == tInput && tc.args == tArgs;
              });
              if (idx > -1) {
                t.status = userAnswers[0].testcases[idx].status;
                t.studentCodeOutput = userAnswers[0].testcases[idx].output;
                // t.studentCodeOutput = t.studentCodeOuptut + userAnswers[0].testcases[idx].error;

                runTime += userAnswers[0].testcases[idx].runTime;
                testPassed += t.status ? 1 : 0;
              }
            });
            question.stats[question.selectedLang.language].compileTime =
              userAnswers[0].compileTime;
            question.stats[question.selectedLang.language].runTime = runTime;
            question.stats[question.selectedLang.language].testcasesPassed =
              testPassed;
            question.stats[question.selectedLang.language].totalTestcases =
              question.testcases.length;
          }
          question.stats[question.selectedLang.language].attempts =
            userAnswers.length;
          question.stats[question.selectedLang.language].timeToSubmit =
            question.timeEslapse;
          question.stats[question.selectedLang.language].successAttempts = 0;
          question.stats[question.selectedLang.language].timeoutAttempts = 0;
          question.stats[question.selectedLang.language].errorAttempts = 0;
          question.stats[question.selectedLang.language].avgCasesPassed = 0;
          question.stats[
            question.selectedLang.language
          ].avgTimeBetweenAttempts = 0;
          const answersCasesPassed = [];
          const times = [];
          for (let j = userAnswers.length - 1; j >= 0; j--) {
            const ans = userAnswers[j];
            times.push(ans.timeElapse);
            let hasTimeout = false;
            let hasError = false;
            if (
              ans.compileMessage === "done" ||
              ans.compileMessage === "Compiled Successfully"
            ) {
              question.stats[question.selectedLang.language].successAttempts++;
              let testPassed = 0;
              question.testcases.forEach((t) => {
                t.Input = question.hasUserInput ? t.input : "";
                t.Args = question.hasArgs ? t.args : "";
                const idx = ans.testcases.findIndex((tc) => {
                  return tc.input == t.Input && tc.args == t.Args;
                });
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

              answersCasesPassed.push(testPassed / question.testcases.length);
            }

            if (hasTimeout) {
              question.stats[question.selectedLang.language].timeoutAttempts++;
            } else if (hasError) {
              question.stats[question.selectedLang.language].errorAttempts++;
            }
          }

          // round to 1 decimal place
          question.stats[question.selectedLang.language].avgCasesPassed =
            !answersCasesPassed.length
              ? 0
              : Math.round(
                  (answersCasesPassed.reduce((a1, a2) => {
                    return a1 + a2;
                  }, 0) /
                    answersCasesPassed.length) *
                    1000
                ) / 10;

          question.stats[
            question.selectedLang.language
          ].avgTimeBetweenAttempts = !times.length
            ? 0
            : Math.round(
                times.reduce((t1, t2) => {
                  return t1 + t2;
                }) / times.length
              );
        } else {
          question.selectedLang = question.coding[0];
        }
      } else {
        for (const k in questionAnswers) {
          for (const j in userAnswers) {
            if (userAnswers[j].answerId) {
              if (userAnswers[j].answerId === questionAnswers[k]._id) {
                if (question.category == "fib") {
                  question.answers[k].isCorrectAnswerOfUser = false;
                  question.isUserAnsweredCorrect = false;
                  question.answers[k]["answeredText"] =
                    userAnswers[j].answerText;
                } else {
                  questionAnswers[k].isCheckedByUser = true;
                  if (!questionAnswers[k].isCorrectAnswer) {
                    question.answers[k].isCorrectAnswerOfUser = false;
                  }
                }
              }
            } else {
              if (userAnswers[j] === questionAnswers[k]._id) {
                questionAnswers[k].isCheckedByUser = true;
                if (!questionAnswers[k].isCorrectAnswer) {
                  question.answers[k].isCorrectAnswerOfUser = false;
                }
              }
            }
          }
        }
      }
    }

    return questions;
  };

  const onLanguageChanged = (lang: any, index: number) => {
    let question = questions;
    question[index].selectedLang = lang;
    setQuestions(question);
  };

  const transform = (text: any) => {
    if (!text) {
      return "";
    }

    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text;
  };

  const getReason = (question: any) => {
    setFeedbackError("");
    setQfeedbackForm({ notes: "" });
    const tmo_feedbaackOp = feedbackOptions;
    tmo_feedbaackOp.forEach((f) => (f.checked = false));
    setMdref(true);

    setCurrentQ(question);
    if (question.logs) {
      setQfeedbackForm({
        ...qfeedbackForm,
        notes: question.logs.note,
      });
      for (const opt of tmo_feedbaackOp) {
        if (opt.text == question.logs.reason) {
          opt.checked = true;
          break;
        }
      }
    }
    setFeedbackOptions(tmo_feedbaackOp);
  };

  const feedbackClose = () => {
    setMdref(false);
  };

  const feedbackSubmit = () => {
    if (!feedbackOptions.find((o) => o.checked)) {
      setFeedbackError("Please select one option.");
      return;
    }
    setFeedbackError("");

    questionSvc
      .addErrorLog({
        question: currentQ._id,
        subject: currentQ.subject,
        status: currentQ.status,
        reason: feedbackOptions.find((o) => o.checked).text,
        note: qfeedbackForm.notes,
      })
      .then((res) => {
        alertify.success("Error log is saved.");
        setMdref(false);

        setCurrentQ({
          ...currentQ,
          reason: feedbackOptions.find((o) => o.checked).text,
          note: qfeedbackForm.notes,
        });

        questionSvc
          .getErrorLogStats({ ...params })
          .then((stats) => {
            setStats(stats);
            let tmp_sunStats = 0;
            stats.forEach((s) => {
              tmp_sunStats += s.total;
            });
            stats.forEach((s) => {
              s.percent =
                tmp_sunStats > 0
                  ? Math.round((s.total / tmp_sunStats) * 100)
                  : 0;
            });
            setSumStats(tmp_sunStats);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        alertify.alert(
          "Message",
          "Failed to create error log for this question."
        );
      });
  };

  const onFeedbackCheck = (checkedIndex) => {
    const updatedOptions = feedbackOptions.map((option, index) => ({
      ...option,
      checked: index === checkedIndex,
    }));
    setFeedbackOptions(updatedOptions);
  };
  const filterSubject = (sub: any) => {
    setSelectAllSub(false);
    const para = params;
    if (sub === "All") {
      setSelectAllSub(true);
      setSelectedSub(null);

      delete para.subject;
    } else {
      setSelectAllSub(false);
      setSelectedSub(sub._id);
      para.subject = sub._id;
    }

    para.page = 1;
    setParams(para);
    questionSvc
      .getErrorLogQuestions(para)
      .then(({ questions, total }: { questions: any[]; total: number }) => {
        setQuestions(processQuestions(questions));
        setTotal(total);
      })
      .catch((err) => {
        console.log(err);
      });

    questionSvc
      .getErrorLogStats({ ...para })
      .then((stats: any[]) => {
        setSumStats(0);
        let tmp_sumStats = sumStats;
        stats.forEach((s) => {
          tmp_sumStats += s.total;
        });
        stats.forEach((s) => {
          s.percent =
            tmp_sumStats > 0 ? Math.round((s.total / tmp_sumStats) * 100) : 0;
        });
        setSumStats(tmp_sumStats);
        setStats(stats);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const CustomAccordion = ({ children, isOpen, toggle }: any) => {
    return (
      <div className="area mb-3 bg-white shadow ng-star-inserted">
        <div className="accordion-header" onClick={toggle}>
          {children[0]}
        </div>
        {isOpen && <div className="accordion-body">{children[1]}</div>}
      </div>
    );
  };

  return (
    <>
      <div className="over-out-1 mt-2 clearfix">
        {subjects.length > 0 ? (
          <div className="row">
            <div className="col-lg-2 error-analysis pt-0">
              <div className="sidebar">
                <ul>
                  <li>
                    <a
                      onClick={() => filterSubject("All")}
                      className={selectAllSub ? "bold" : ""}
                    >
                      All Subjects
                    </a>
                  </li>
                  {subjects.map((sub, i) => (
                    <li key={i}>
                      <a
                        onClick={() => filterSubject(sub)}
                        className={selectedSub === sub._id ? "bold" : ""}
                      >
                        {sub.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-lg-10">
              <div className="error-analysis-area w-100">
                <div className="accordation-area pt-0">
                  <div className="accordion" id="accordion_solution">
                    {stats.length > 0 && (
                      <div className="mb-3">
                        <div className="row bold">
                          <div className="col-8">Your most common mistakes</div>
                          <div className="col-4">Frequency</div>
                        </div>

                        {stats.map((st) => (
                          <div className="row mt-2" key={st._id}>
                            <div className="col-8 d-flex align-items-center">
                              {st._id}
                            </div>
                            <div className="col-4">
                              <div className="d-flex justify-content-between">
                                <span>
                                  {st.total}/{sumStats} questions
                                </span>
                                <span>{st.percent}%</span>
                              </div>
                              <ProgressBar
                                now={st.percent}
                                variant="primary"
                                aria-label="progress-bar"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {total > 0 ? (
                      <>
                        <div>
                          {questions.map((question, i) => (
                            <CustomAccordion
                              key={i}
                              isOpen={openIndex === i}
                              toggle={() => toggleAccordion(i)}
                            >
                              <div>
                                <button className="btn btn-block outline-0">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex gap-xs align-items-center">
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
                                      <div>
                                        ({fromNow(question.lastAttemptDate)})
                                      </div>
                                      {question.status === 2 &&
                                        user.role === "student" && (
                                          <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              getReason(question);
                                            }}
                                          >
                                            What went wrong?
                                          </button>
                                        )}
                                    </div>
                                    <div className="col-auto">
                                      {isToggled[i] ? (
                                        <i
                                          className="fas fa-angle-up fa-2x "
                                          onClick={() => toggleContent(i)}
                                        ></i>
                                      ) : (
                                        <i
                                          className="fas fa-angle-down fa-2x "
                                          onClick={() => toggleContent(i)}
                                        ></i>
                                      )}
                                    </div>
                                  </div>
                                </button>
                                {!question.isOpen && (
                                  <div className="px-3">
                                    <MathJax
                                      value={replaceQuestionText(
                                        question,
                                        "",
                                        true
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="selection-wrap">
                                {question.isOpen && (
                                  <>
                                    {question.questionHeader && (
                                      <div className="exp border-bottom pt-0 pb-2 mb-2">
                                        <h6>Instruction</h6>
                                        <span className="text-dark">
                                          {question.annotation
                                            ?.questionHeader ? (
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  question.annotation
                                                    .questionHeader,
                                              }}
                                            ></div>
                                          ) : (
                                            <MathJax
                                              value={formatQuestion(
                                                question?.questionHeader
                                              )}
                                            />
                                          )}
                                        </span>
                                      </div>
                                    )}

                                    <span>
                                      {question.annotation?.questionText ? (
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              question.annotation.questionText,
                                          }}
                                        ></div>
                                      ) : (
                                        <MathJax
                                          value={replaceQuestionText(
                                            question,
                                            "",
                                            true
                                          )}
                                        />
                                      )}
                                    </span>
                                  </>
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

                                {question.category === "mcq" &&
                                  question.answers.map((item, i) => (
                                    <div key={i} className="selection my-2">
                                      <div className="d-flex align-items-center position-relative">
                                        <form>
                                          <div className="checkbox-group h-auto">
                                            <label className="m-0">
                                              <input type="checkbox" />
                                              <span
                                                className={`checkmark text-center mt-0 ${
                                                  item.isCheckedByUser
                                                    ? item.isCorrectAnswer
                                                      ? "green"
                                                      : "red"
                                                    : item.isCorrectAnswer
                                                    ? "green"
                                                    : ""
                                                }`}
                                              >
                                                {numberToAlpha(i)}
                                              </span>
                                              {item.isCheckedByUser && (
                                                <span
                                                  className="material-icons"
                                                  style={{
                                                    fontSize: "22px",
                                                    fontWeight: 700,
                                                    position: "absolute",
                                                    left: "15px",
                                                    top: "10px",
                                                  }}
                                                >
                                                  checkmark
                                                </span>
                                              )}
                                            </label>
                                          </div>
                                        </form>
                                        <span className="p-0 pl-2">
                                          <MathJax value={item.answerText} />
                                        </span>
                                        {item.crossedOut && (
                                          <div className="solution-answer-crossedOut"></div>
                                        )}
                                      </div>
                                      {item.audioFiles?.length > 0 && (
                                        <div className="row">
                                          {item.audioFiles.map(
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
                                                ></audio>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                {question.category === "mixmatch" && (
                                  <div className="adaptive-question-box adaptive-question-ans overflow-hidden">
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
                                          {question.answers.map(
                                            (ans, index) => (
                                              <div
                                                key={index}
                                                className="mix-match-dragd"
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
                                    </div>
                                  </div>
                                )}
                                {question.category === "fib" && (
                                  <>
                                    {question.answers.map((item, i) => (
                                      <div key={i}>
                                        {item.answeredText && (
                                          <div className="given-answer-teacher p-0 mb-3">
                                            <h6>Your Answer</h6>
                                            <span>{item.answeredText}</span>
                                          </div>
                                        )}

                                        <div className="correct-answer-teacher p-0 mb-3">
                                          <h6>Correct Answer</h6>
                                          <span>
                                            {transform(item.answerText)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                )}
                                {question.category === "descriptive" && (
                                  <>
                                    {question.answers.map((item, i) => (
                                      <div
                                        key={i}
                                        className="given-answer-teacher p-0 mb-3"
                                      >
                                        <h6>Your Answer</h6>

                                        {item?.answerText && (
                                          <MathJax
                                            value={formatQuestion(
                                              item?.answerText
                                            )}
                                          />
                                        )}

                                        {item?.attachments &&
                                          item.attachments.map((att, index) => (
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
                                                  alt="attachment"
                                                />
                                              )}
                                              {att.type === "file" && (
                                                <a
                                                  href={att.url}
                                                  target="_blank"
                                                  className="col"
                                                  rel="noopener noreferrer"
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
                                          ))}
                                      </div>
                                    ))}
                                  </>
                                )}
                                {question.category == "code" && (
                                  <div>
                                    {question.answers.length > 0 && (
                                      <CodeRenderer
                                        code={question.answers[0].code}
                                        language={
                                          question.answers[0].codeLanguage
                                        }
                                      />
                                    )}
                                    {question.selectedLang && (
                                      <Tabs>
                                        <Tab title="Output" key="output">
                                          <div className="code-wrap">
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
                                                className="form-control bg-white border-0 min-h-0"
                                                name="compiler_msg"
                                              ></textarea>
                                            </form>

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
                                                    <label>Your Input</label>
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
                                                    <button
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
                                                    </button>
                                                    <div
                                                      className="dropdown-menu dropdown-menu-right"
                                                      aria-labelledby="dropdownMenuButton"
                                                    >
                                                      {question.coding.map(
                                                        (lang, i) => (
                                                          <button
                                                            className="dropdown-item"
                                                            key={i}
                                                            onClick={() =>
                                                              onLanguageChanged(
                                                                lang,
                                                                i
                                                              )
                                                            }
                                                          >
                                                            {lang.display}
                                                          </button>
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
                                        <Tab title="Stats" key="stats">
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
                                                      {stats.compileTime}
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
                                                    <span>{stats.runTime}</span>
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
                                                    <span>{`${stats.testcasesPassed}/${stats.totalTestcases}`}</span>
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
                                                      {stats.timeToSubmit}
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
                                                      {stats.attempts}
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
                                                      {stats.successAttempts}
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
                                                      {stats.timeoutAttempts}
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
                                                      {stats.errorAttempts}
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
                                                    <span>{`${stats.avgCasesPassed}%`}</span>
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
                                                      {
                                                        stats.avgTimeBetweenAttempts
                                                      }
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </Tab>
                                        <Tab title="Test Cases" key="testcase">
                                          <div>
                                            {question.testcases.map(
                                              (testcase, index) => (
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
                                                          readOnly
                                                          style={{
                                                            resize: "none",
                                                            height: "auto",
                                                            maxWidth: "100%",
                                                            color: "black",
                                                            padding: "2px 5px",
                                                          }}
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
                                                            <div
                                                              style={{
                                                                display:
                                                                  "table-cell",
                                                                width: "1%",
                                                              }}
                                                            ></div>
                                                          )}
                                                          {question.hasUserInput && (
                                                            <div
                                                              style={{
                                                                display:
                                                                  "table-cell",
                                                              }}
                                                            ></div>
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
                                                            }}
                                                          ></div>
                                                        </div>
                                                      )}
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </Tab>
                                      </Tabs>
                                    )}
                                  </div>
                                )}
                                <div className="exp">
                                  {question?.answerExplain && (
                                    <>
                                      <h6>Explanation</h6>
                                      <p>
                                        <MathJax
                                          value={question.answerExplain}
                                        />
                                      </p>
                                    </>
                                  )}

                                  {question.answerExplainAudioFiles?.length >
                                    0 && (
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
                                            ></audio>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CustomAccordion>
                          ))}
                        </div>

                        {total > params.limit && (
                          <div className="text-center mt-2">
                            <div className="d-inline-block">
                              <CustomPagination
                                totalItems={total}
                                limit={params.limit}
                                currentPage={params.page}
                                onPageChange={(e) => onPageChanged(e)}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center mt-2">
                        <img
                          src="/assets/images/no-question.svg"
                          className="m-auto mw-300"
                          alt="No questions"
                        />
                        <div className="text-center mt-2 h6">
                          No incorrect or missed question
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <img
              src="/assets/images/no-question.svg"
              className="m-auto mw-300"
              alt="No questions"
            />
            <div className="text-center mt-2 h6">
              No incorrect or missed question
            </div>
          </div>
        )}
      </div>
      <Modal
        show={mdref}
        onHide={() => setMdref(false)}
        backdrop="static"
        keyboard={false}
      >
        <div>
          <div className="modal-header border-0">
            <h5>Why did you choose the incorrect answer?</h5>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              feedbackSubmit();
            }}
          >
            <div className="modal-body pb-0">
              <h5
                className="error mb-2 text-danger"
                style={{ display: feedbackError ? "block" : "none" }}
              >
                {feedbackError}
              </h5>
              <div className="answer-box p-0">
                <ul>
                  {feedbackOptions.map((opt, i) => (
                    <li key={i}>
                      <div className="answer d-flex align-items-center">
                        <div className="checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              name={`ckFrame_${i}`}
                              checked={opt.checked}
                              onChange={(e) => onFeedbackCheck(i)}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                        <span>{opt.text}</span>
                      </div>
                    </li>
                  ))}
                  <li>
                    <div className="form-group mb-0">
                      <textarea
                        className="form-control"
                        name="txtAnother"
                        value={qfeedbackForm.notes}
                        onChange={(e) =>
                          setQfeedbackForm({
                            ...qfeedbackForm,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Write your notes"
                      ></textarea>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-light mr-2"
                onClick={() => feedbackClose()}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default ErrorLogComponent;
