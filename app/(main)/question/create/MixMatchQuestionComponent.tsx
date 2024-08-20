import React, { useEffect, useState } from "react";
import { alert } from "alertifyjs";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { TagsInput } from "react-tag-input-component";
import AudioRecordComponent from "./AudioRecordComponent";

const MixMatchQuestionComponent = ({
  question,
  setQuestion,
  submitted,
  settings,
  cancelQuestion,
  saveQuestion,
  presave,
  currentStep,
  setCurrentStep,
  onCkeditorReady,
  canNavigate,
  cancel,
  save,
  next,
  processing,
  saveAndNext,
  user,
  onQuestionChanged,
  reset,
  instructionFileUploadClick,
  questionFileUploadClick,
  removeAnswer,
  addAnswer,
}: any) => {
  const [editorAnswerMap, setEditorAnswerMap] = useState<any>({});
  const [isTouched, setIsTouched] = useState(false);
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
  const getStepperID = () => {
    return "#mm-stepper";
  };

  const onQuestionChangedFunc = () => {
    onQuestionChanged();
    setEditorAnswerMap({});
  };
  useEffect(() => {
    setCurrentStep(0);
  }, []);
  const onAnswerCkeditorReady = (editor: any, index: any, field: any) => {
    setEditorAnswerMap((prevEditorAnswerMap) => ({
      ...prevEditorAnswerMap,
      [index]: {
        field: field,
        editor: editor,
      },
    }));
  };

  const presaveFunc = () => {
    presave();

    for (const idx in editorAnswerMap) {
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        answers: prevQuestion.answers.map((answer, index) => {
          if (index === idx) {
            return {
              ...answer,
              [editorAnswerMap[idx].field]:
                editorAnswerMap[idx].editor.getData(),
            };
          }
          return answer;
        }),
      }));
    }

    // do mcq own validation
    if (question.answers.length < 3) {
      alert("Message", "Mixmatch question need at least 3 options!");
      return false;
    }

    for (let i = 0; i < question.answers.length; i++) {
      if (!question.answers[i].answerText) {
        alert("Message", "Option " + (i + 1) + " is empty!");
        return false;
      }
      if (!question.answers[i].correctMatch) {
        alert("Messate", "Answer Option " + (i + 1) + " is empty!");
        return false;
      }
    }

    return true;
  };

  const resetFunc = () => {
    reset();
    setEditorAnswerMap({});
  };

  return (
    <>
      <div className="bg-white rounded-boxes form-boxes">
        <div className="assess-create-align ques-num">
          <div className="profile-box-remove clearfix">
            <div className="profile-info1">
              <div className="row align-items-center">
                <div className="col-lg-4">
                  <h4 className="form-box_subtitle d-inline-block mr-3">
                    Positive Marks
                  </h4>
                  <input
                    type="number"
                    aria-label="input postive marks"
                    name="pos_mark"
                    id="mixmatch_pos_mark"
                    className="form-control all border-bottom rounded-0"
                    min="0"
                    readOnly={settings.testStatus === "published" ? true : null}
                    value={question.plusMark}
                  />
                </div>
                <div className="col-lg-4">
                  <h4 className="form-box_subtitle d-inline-block mr-3">
                    Negative Marks
                  </h4>
                  <input
                    type="number"
                    aria-label="Enter negavtive marks"
                    name="minus_mark"
                    id="mixmatch_minus_mark"
                    className="form-control all border-bottom rounded-0"
                    max="0"
                    readOnly={settings.testStatus === "published" ? true : null}
                    value={question.minusMark}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul
        id="mm-stepper"
        className="stepper nav nav-pills nav-justified text-center"
      >
        <li
          className={"nav-item" + (currentStep >= 0 ? " active" : "")}
          onClick={() => setCurrentStep(0)}
        >
          <strong>Instruction</strong>
        </li>
        <li
          className={"nav-item" + (currentStep >= 1 ? " active" : "")}
          onClick={() => setCurrentStep(1)}
        >
          <strong>Question</strong>
        </li>
        <li
          className={"nav-item" + (currentStep >= 2 ? " active" : "")}
          onClick={() => setCurrentStep(2)}
        >
          <strong>Options</strong>
        </li>
        <li
          className={"nav-item" + (currentStep >= 3 ? " active" : "")}
          onClick={() => setCurrentStep(3)}
        >
          <strong>Explanation</strong>
        </li>
      </ul>
      <div className="mt-3 p-0">
        {currentStep == "0" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-box-remove clearfix">
                  <h4 className="form-box_subtitle">
                    Instruction
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
              <span className="cancel-ques-btn-remove mr-2">
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
                    Question
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
              <span className="cancel-ques-btn-remove mr-2">
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
        {currentStep == "2" && (
          <div>
            {question.answers.map((ans, i) => (
              <div key={i} className="bg-white rounded-boxes form-boxes">
                <div className="assess-create-align ques-num mcq">
                  <div className="profile-box-remove clearfix">
                    <div className="row align-items-center">
                      <div className="col pl-0">
                        <h4 className="form-box_subtitle">Option {i + 1}</h4>
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
                    <div className="mt-2">
                      <CKEditorCustomized
                        defaultValue={ans.answerText}
                        onChangeCon={(event) => {
                          onAnswerCkeditorReady(event, i, ans.answerText);
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
                    <div className="mt-2">
                      <h4 className="form-box_subtitle ml-0">
                        Answer Option {i + 1}
                      </h4>
                      <div className="mt-2">
                        <CKEditorCustomized
                          defaultValue={ans.correctMatch}
                          onChangeCon={(event) => {
                            onAnswerCkeditorReady(event, i, "correctMatch");
                            const updatedAnswers = question.answers.map(
                              (answer, index) => {
                                if (index === i) {
                                  return { ...answer, correctMatch: event };
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
                    </div>
                  </div>
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

            <div className="text-right">
              <span className="cancel-ques-btn-remove mr-2">
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
                    <AudioRecordComponent
                      question={question}
                      setQuestion={setQuestion}
                      audioFiles={question.answerExplainAudioFiles}
                      type={"explain"}
                    />
                  </div>
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
            <div className="text-right">
              <button
                className="btn btn-light mb-1"
                disabled={processing}
                onClick={cancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline ml-2 mb-1"
                disabled={processing}
                onClick={() => {
                  if (presaveFunc()) {
                    save(false);
                  }
                }}
              >
                Save and Exit
              </button>
              {canNavigate &&
                (settings.testStatus === "published" ||
                  settings.testStatus === "draft") &&
                !settings.last && (
                  <button
                    className="btn btn-primary ml-2 mb-1"
                    disabled={processing}
                    onClick={() => {
                      if (presaveFunc()) {
                        saveAndNext();
                      }
                    }}
                  >
                    Save and Next
                  </button>
                )}
              {canNavigate &&
                settings.testStatus !== "published" &&
                !settings.questioId && (
                  <button
                    className="btn btn-primary ml-2 mb-1"
                    disabled={processing}
                    onClick={() => {
                      if (presaveFunc()) {
                        save(true);
                      }
                    }}
                  >
                    Save and Add More
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MixMatchQuestionComponent;
