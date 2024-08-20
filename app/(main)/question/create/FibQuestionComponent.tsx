import React, { useEffect, useState, useRef } from "react";

import { QuestionType } from "@/interfaces/interface";

import { alert, success, error, confirm } from "alertifyjs";

import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { TagsInput } from "react-tag-input-component";
import AudioRecordComponent from "./AudioRecordComponent";

const FibQuestionComponent = ({
  question,
  setQuestion,
  settings,
  presave,
  currentStep,
  setCurrentStep,
  onCkeditorReady,
  canNavigate,
  cancel,
  next,
  save,
  processing,
  saveAndNext,
  user,
  instructionFileUploadClick,
  questionFileUploadClick,
}: any) => {
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
    return "#fib-stepper";
  };

  useEffect(() => {
    setCurrentStep(0);
  }, []);

  const presaveFunc = () => {
    presave();
    const answers = getAnswers(question.questionText);
    if (!answers.length) {
      alert("Message", "Answer is missing!");
      return false;
    }

    setQuestion({
      ...question,
      answerNumber: answers.length,
      questionType: QuestionType.SINGLE,
      answers: [],
    });
    if (answers.length > 0) {
      answers.forEach((ans) => {
        const answer_temp = question.answers.push(ans);
        setQuestion({
          ...question,
          answers: answer_temp,
        });
      });
    }

    return true;
  };

  const getAnswers = (questionText: any) => {
    const answerList = [];
    const regex = /\{{([^}]+)\}}/gm;
    let m;

    while ((m = regex.exec(questionText)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      const answerText = m[1].replace(/&nbsp;/g, " ").trim();
      const answer: any = {
        answerText: answerText,
        answerTextArray: answerText,
        isCorrectAnswer: true,
      };
      answerList.push(answer);
    }
    return answerList;
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
                    id="fib_pos_mark"
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
                    id="fib_minus_mark"
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
          <strong>Explanation</strong>
        </li>
      </ul>
      <div className="mt-3 p-0">
        {currentStep === 0 && (
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

        {currentStep === 1 && (
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

        {currentStep === 2 && (
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
                      onChange={(e) =>
                        setQuestion({
                          ...question,
                          tags: e,
                        })
                      }
                      name=" tags "
                      placeHolder="+ Add Tag"
                      separators={[" "]}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="d-flex justify-content-end gap-xs">
              {/* {question._id && user.primaryInstitute?.canUseAI && (
                <button
                  className="btn btn-primary"
                  onClick={aiReviewQuestion}
                  disabled={processing}
                >
                  Review Question &nbsp;
                  {processing && <i className="fa fa-spinner fa-pulse"></i>}
                </button>
              )} */}
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

export default FibQuestionComponent;
