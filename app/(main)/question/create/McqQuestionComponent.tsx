import React, { useEffect, useState, useRef } from "react";

import { QuestionType } from "@/interfaces/interface";

import { alert, success, error, confirm } from "alertifyjs";

import * as adminSvc from "@/services/adminService";

import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { TagsInput } from "react-tag-input-component";
import AudioRecordComponent from "./AudioRecordComponent";

const McqQuestionComponent = ({
  question,
  setQuestion,
  settings,
  presave,
  currentStep,
  setCurrentStep,
  onCkeditorReady,
  canNavigate,
  cancel,
  save,
  processing,
  setProcessing,
  saveAndNext,
  user,
  onQuestionChanged,
  addAnswer,
  reset,
  removeAnswer,
  instructionFileUploadClick,
  questionFileUploadClick,
  next,
}: any) => {
  const [editorAnswerMap, setEditorAnswerMap] = useState<any>({});
  const [isSaveAndAdd, setIsSaveAndAdd] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const getStepperID = () => {
    return "#mcq-stepper";
  };

  useEffect(() => {
    onQuestionChanged();
    setEditorAnswerMap({});
    setCurrentStep(0);

    if (question?.answers?.length > 0) {
      question.answers.forEach((an) => {
        if (!an.audioFiles) {
          setQuestion((prevQuestion) => {
            const updatedAnswers = prevQuestion?.answers?.map((answer) => ({
              ...answer,
              audioFiles: answer.audioFiles || [],
            }));

            return {
              ...prevQuestion,
              answers: updatedAnswers,
            };
          });
        }
      });
    } else {
      for (let i = 0; i < 4; i++) {
        addAnswer();
      }
    }
  }, []);

  const onQuestionChangedFunc = () => {
    onQuestionChanged();
    setEditorAnswerMap({});

    if (question.answers.length) {
      question.answers.forEach((an) => {
        if (!an.audioFiles) {
          setQuestion((prevQuestion) => {
            const updatedAnswers = prevQuestion?.answers?.map((answer) => ({
              ...answer,
              audioFiles: answer.audioFiles || [], // Initialize audioFiles if not present
            }));

            return {
              ...prevQuestion,
              answers: updatedAnswers,
            };
          });
        }
      });
    } else {
      for (let i = 0; i < 4; i++) {
        addAnswer();
      }
    }
  };

  const onAnswerCkeditorReady = (editor, index) => {
    setEditorAnswerMap((prevEditorAnswerMap) => {
      return { ...prevEditorAnswerMap, [index]: editor };
    });
  };

  const validateStep = (currentPage?: any) => {
    if (currentPage == 3) {
      if (question.answers.length < 2) {
        alert(
          "Message",
          "Multiple Choice Questions (MCQ) need at least 2 options as answers."
        );
        return false;
      }

      let correctAnswer = null;
      for (let i = 0; i < question.answers.length; i++) {
        if (!question.answers[i].answerText) {
          alert("Message", "Option " + (i + 1) + " is empty!");
          return false;
        }
        if (question.answers[i].isCorrectAnswer) {
          correctAnswer = question.answers[i];
        }
      }

      if (!correctAnswer) {
        alert("Message", "MCQ question need at least one correct answer!");
        return false;
      }

      if (question.questionType == QuestionType.SINGLE) {
        if (question.answers.filter((a) => a.isCorrectAnswer).length > 1) {
          alert("Message", "Please select only one correct answer.");
          return false;
        }
      }
    }

    return true;
  };
  const presaveFunc = () => {
    presave();

    for (const idx in editorAnswerMap) {
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        answers: prevQuestion.answers.map((answer, index) =>
          index === idx
            ? { ...answer, answerText: getData(editorAnswerMap[idx]) }
            : answer
        ),
      }));
    }

    // do mcq own validation
    if (question.answers.length < 2) {
      alert(
        "Message",
        "Multiple Choice Questions (MCQ) need at least 2 options as answers."
      );
      return false;
    }

    let correctAnswer = null;
    for (let i = 0; i < question.answers.length; i++) {
      if (!question.answers[i].answerText) {
        alert("Message", "Option " + (i + 1) + " is empty!");
        return false;
      }
      if (question.answers[i].isCorrectAnswer) {
        correctAnswer = question.answers[i];
      }
    }

    if (!correctAnswer) {
      alert("Message", "MCQ question need at least one correct answer!");
      return false;
    }

    if (question.questionType == QuestionType.SINGLE) {
      if (question.answers.filter((a) => a.isCorrectAnswer).length > 1) {
        alert("Message", "Please select only one correct answer.");
        return false;
      }
    }

    return true;
  };

  const correctAnswerChanged = (index) => {
    if (question.questionType == QuestionType.SINGLE) {
      setQuestion((prevQuestion) => {
        const updatedAnswers = prevQuestion.answers.map((answer, i) => {
          if (i === index) {
            return { ...answer, isCorrectAnswer: !answer.isCorrectAnswer };
          } else {
            if (prevQuestion.questionType === QuestionType.SINGLE) {
              return { ...answer, isCorrectAnswer: false };
            } else {
              return answer;
            }
          }
        });

        return {
          ...prevQuestion,
          answers: updatedAnswers,
        };
      });
    } else {
      setQuestion((prevQuestion) => {
        const updatedAnswers = prevQuestion.answers.map((answer, i) => {
          if (i === index) {
            return { ...answer, isCorrectAnswer: !answer.isCorrectAnswer };
          } else {
            return answer;
          }
        });

        return {
          ...prevQuestion,
          answers: updatedAnswers,
        };
      });
    }
  };

  const resetFunc = () => {
    reset();
    setEditorAnswerMap({});
  };

  const removeAnswerFunc = (idx) => {
    const answerMap = { ...thi.editorAnswerMap };
    const result = Object.keys(answerMap).map((key) => [
      Number(key),
      answerMap[key],
    ]);
    result.splice(idx, 1);
    setEditorAnswerMap({});
    result.forEach((data, i) => {
      setEditorAnswerMap((prevEditorAnswerMap) => {
        return { ...prevEditorAnswerMap, [i]: data[1] };
      });
    });
    removeAnswer(idx);
  };

  const aiReviewQuestion = () => {
    confirm(
      "This will update (& overwrite) existing content. Do you want to proceed?",
      (msg) => {
        setProcessing(true);
        adminSvc
          .getReportData("openai_review_questions", {
            question: question._id,
            location: user.activeLocation,
          })
          .then((res: any) => {
            if (res.msg) {
              alert("Message", res.msg);
            } else {
              success("Question is reviewed and updated.");
              window.location.reload();
            }
            setProcessing(false);
          })
          .catch((err) => {
            setProcessing(false);
            alert("Message", "Fail to review question:");
            console.log(err);
          });
      }
    );
  };

  const isValidUrl = (url) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-zA-Z0-9$-_@.&+!*'(),]|%[0-9a-fA-F]{2})+)(:[0-9]+)?(@[a-zA-Z0-9.-]+)?)" + // credentials
        "((([a-zA-Z0-9.-]{2,256})\\.[a-zA-Z]{2,6})" + // domain
        "|((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$" // port and path
    );
    return pattern.test(url);
  };

  return (
    <>
      <div className="bg-white rounded-boxes form-boxes">
        <div className="assess-create-align ques-num">
          <div className="profile-box-remove clearfix">
            <div className="profile-info1">
              <div className="row align-items-center">
                <div className="col-lg-3">
                  <h4 className="form-box_subtitle d-inline-block mr-3">
                    Positive Marks
                  </h4>
                  <input
                    type="number"
                    aria-label="input postive marks"
                    name="pos_mark"
                    id="mcq_pos_mark"
                    className="form-control all border-bottom rounded-0"
                    min="0"
                    readOnly={settings.testStatus === "published"}
                    value={question.plusMark}
                    onChange={(e) => {
                      setQuestion({
                        ...question,
                        plusMark: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="col-lg-3">
                  <h4 className="form-box_subtitle d-inline-block mr-3">
                    Negative Marks
                  </h4>
                  <input
                    type="number"
                    aria-label="Enter negavtive marks"
                    name="minus_mark"
                    id="mcq_minus_mark"
                    className="form-control all border-bottom rounded-0"
                    max="0"
                    readOnly={settings.testStatus === "published"}
                    value={question.minusMark}
                    onChange={(e) => {
                      setQuestion({
                        ...question,
                        minusMark: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="col-lg-6">
                  <h4 className="form-box_subtitle d-inline-block mr-3">
                    Correct Answer Type
                  </h4>
                  <select
                    className="form-control selected border-bottom rounded-0"
                    name="questionType"
                    value={question.questionType}
                    onChange={(e) => {
                      setQuestion({
                        ...question,
                        questionType: e.target.value,
                      });
                    }}
                    required
                  >
                    <option value="single">Single</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul
        id="mcq-stepper"
        className="stepper nav nav-pills nav-justified text-center"
      >
        <li
          className={`nav-item ${currentStep >= 0 && "active"}`}
          onClick={() => setCurrentStep(0)}
        >
          <strong className={`text-dark ${currentStep >= 0 && "text-dark"}`}>
            Instruction
          </strong>
        </li>
        <li
          className={`nav-item ${currentStep >= 1 && "active"}`}
          onClick={() => setCurrentStep(1)}
        >
          <strong className={`text-dark ${currentStep >= 1 && "text-dark"}`}>
            Question
          </strong>
        </li>
        <li
          className={`nav-item ${currentStep >= 2 && "active"}`}
          onClick={() => setCurrentStep(2)}
        >
          <strong className={`text-dark ${currentStep >= 2 && "text-dark"}`}>
            Options
          </strong>
        </li>
        <li
          className={`nav-item ${currentStep >= 3 && "active"}`}
          onClick={() => setCurrentStep(3)}
        >
          <strong className={`text-dark ${currentStep >= 3 && "text-dark"}`}>
            Explanation
          </strong>
        </li>
      </ul>
      <div>
        {currentStep == "0" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-box-remove clearfix">
                  <h4 className="form-box_subtitle">
                    Instruction{" "}
                    <a
                      className="mx-2"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    >
                      <input
                        type="file"
                        id="fileInput"
                        name="fileupload"
                        hidden
                        className="mx-2"
                        multiple
                        onChange={(e) =>
                          instructionFileUploadClick(e.target.files)
                        }
                      />
                      <i className="fas fa-paperclip"></i>
                    </a>
                  </h4>
                  <div className="mt-2">
                    <CKEditorCustomized
                      defaultValue={question.questionHeader}
                      onChangeCon={(event) => {
                        onCkeditorReady(event, "questionHeader");
                        setQuestion({
                          ...question,
                          questionHeader: event,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="cancel-ques-btn-remove mr-2 mt-2">
                <button className="btn btn-light" onClick={cancel}>
                  Cancel
                </button>
              </span>
              <button className="btn btn-primary" onClick={next}>
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep == "1" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-box-remove clearfix">
                  <h4 className="form-box_subtitle">
                    Question{" "}
                    <a
                      className="mx-2"
                      onClick={() =>
                        document.getElementById("fileInput2").click()
                      }
                    >
                      <input
                        type="file"
                        id="fileInput2"
                        name="fileupload"
                        hidden
                        className="mx-2"
                        multiple
                        onChange={(e) =>
                          questionFileUploadClick(e.target.files)
                        }
                      />
                      <i className="fas fa-paperclip"></i>
                    </a>
                  </h4>
                  <div className="mt-2">
                    <CKEditorCustomized
                      defaultValue={question.questionText}
                      onChangeCon={(event) => {
                        onCkeditorReady(event, "questionText");
                        setQuestion({
                          ...question,
                          questionText: event,
                        });
                      }}
                    />
                  </div>
                  <AudioRecordComponent
                    question={question}
                    setQuestion={setQuestion}
                    audioFiles={question.audioFiles}
                    type={"ques"}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <a className="btn btn-light mr-2" onClick={cancel}>
                Cancel
              </a>
              <a className="btn btn-primary" onClick={next}>
                Continue
              </a>
            </div>
          </div>
        )}
        {currentStep == "2" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              {question.answers?.map((ans, i) => (
                <div key={i} className="assess-create-align ques-num mcq">
                  <div className="profile-box-remove clearfix">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="checkbox-group">
                          <label className="container2">
                            <h4 className="form-box_subtitle ml-0">
                              <strong>Answer Option {i + 1}</strong>
                              <em> (Select if it&apos;s the correct answer)</em>
                            </h4>
                            <input
                              type="checkbox"
                              name={`chk_${i}`}
                              checked={ans.isCorrectAnswer}
                              onChange={() => correctAnswerChanged(i)}
                            />
                            <span className="checkmark1 translate-middle-y ml-0"></span>
                          </label>
                        </div>
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-link text-danger"
                          onClick={() => removeAnswer(i)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    <div className="boxForMcqCKCedit-opt">
                      <CKEditorCustomized
                        defaultValue={ans.answerText}
                        onChangeCon={(event) => {
                          onAnswerCkeditorReady(event, i);
                          const updatedAnswers = question.answers.map(
                            (answer, index) => {
                              if (index === i) {
                                return { ...answer, answerText: event };
                              } else {
                                return answer;
                              }
                            }
                          );
                          setQuestion((prevQuestion) => ({
                            ...prevQuestion,
                            answers: updatedAnswers,
                          }));
                        }}
                      />
                    </div>
                    <AudioRecordComponent
                      question={question}
                      setQuestion={setQuestion}
                      audioFiles={ans.audioFiles}
                      index={i}
                      type={"answer"}
                    />
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-boxes form-boxes">
                <div className="assess-create-align ques-num">
                  <div className="profile-box-remove clearfix">
                    <button
                      className="btn btn-link mcq add_more"
                      onClick={() => addAnswer()}
                    >
                      + Add Another Option
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="cancel-ques-btn-remove mr-2">
                <button className="btn btn-light" onClick={cancel}>
                  Cancel
                </button>
              </span>
              <button
                className="btn btn-primary mcq"
                onClick={() => {
                  if (validateStep(3)) {
                    next();
                  }
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {currentStep == "3" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-box-remove clearfix">
                  <h4 className="form-box_subtitle">Answer Explanation</h4>
                  <div className="mt-2">
                    <CKEditorCustomized
                      defaultValue={question.answerExplain}
                      onChangeCon={(event) => {
                        onCkeditorReady(event, "answerExplain");
                        setQuestion((prevQ) => ({
                          ...prevQ,
                          answerExplain: event,
                        }));
                      }}
                    />
                  </div>
                  <AudioRecordComponent
                    question={question}
                    setQuestion={setQuestion}
                    audioFiles={question.answerExplainAudioFiles}
                    type={"explain"}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-box-remove clearfix">
                  <h4 className="form-box_subtitle">Video Explanation</h4>
                  <form className="mt-2">
                    <input
                      type="text"
                      name="txt_videoExp"
                      className="form-control border-bottom"
                      value={question.answerExplainVideo}
                      onChange={(e) => {
                        setQuestion({
                          ...question,
                          answerExplainVideo: e.target.value,
                        });
                      }}
                      onBlur={() => setIsTouched(true)}
                      placeholder="Provide a valid video url"
                    />
                    {isTouched && !isValidUrl(question.answerExplainVideo) && (
                      <p className="label label-danger text-danger">
                        Invalid URL
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
            {(question.userRole !== "publisher" ||
              user.role === "publisher" ||
              user.primaryInstitute.type === "publisher") && (
              <div className="bg-white rounded-boxes form-boxes">
                <div className="assess-create-align">
                  <div className="profile-box-remove clearfix">
                    <h4 className="form-box_subtitle">Question Tag</h4>
                    <TagsInput
                      //@ts-ignore
                      value={question.tags}
                      //@ts-ignore
                      onChange={(e) => {
                        setQuestion({
                          ...question,
                          tags: e,
                        });
                      }}
                      name=" tags "
                      placeHolder="+ Add Tag"
                      separators={[" "]}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="d-flex justify-content-end gap-xs">
              {question._id && user.primaryInstitute?.canUseAI && (
                <button
                  className="btn btn-primary"
                  onClick={aiReviewQuestion}
                  disabled={processing}
                >
                  Review Question &nbsp;
                  {processing && <i className="fa fa-spinner fa-pulse"></i>}
                </button>
              )}
              <button
                className="btn btn-light"
                onClick={cancel}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (presaveFunc()) {
                    save(false);
                  }
                }}
                disabled={processing}
              >
                Save and Exit
              </button>
              {canNavigate &&
                settings.testStatus !== "published" &&
                !settings.questioId && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (presaveFunc()) {
                        save(true);
                        setIsSaveAndAdd(!isSaveAndAdd);
                      }
                    }}
                    disabled={processing}
                  >
                    Save and Add More
                  </button>
                )}
              {canNavigate &&
                (settings.testStatus === "published" ||
                  settings.testStatus === "draft") &&
                !settings.last && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (presaveFunc()) {
                        saveAndNext();
                      }
                    }}
                    disabled={processing}
                  >
                    Save and Next
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default McqQuestionComponent;
