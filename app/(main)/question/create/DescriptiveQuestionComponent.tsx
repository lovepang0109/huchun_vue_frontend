import React, { useEffect, useState } from "react";
import { alert } from "alertifyjs";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { TagsInput } from "react-tag-input-component";
import AudioRecordComponent from "./AudioRecordComponent";

const DescriptiveQuestionComponent = ({
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
  const [wordLimit, setWordLimit] = useState<any>(1000);
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
  useEffect(() => {
    setCurrentStep(0);
  }, []);
  const getStepperID = () => {
    return "#descriptive-stepper";
  };

  const onQuestionChangedFunc = () => {
    onQuestionChanged();
    setWordLimit(question.wordLimit);
  };

  const presaveFunc = () => {
    presave();

    setQuestion({
      ...question,
      wordLimit: wordLimit,
    });

    if (question.wordLimit < 1) {
      alert("Message", "WOrkd limit cannot be less than 1.");
    }

    return true;
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
                    aria-label="input positive marks"
                    name="pos_mark"
                    id="descrptive_pos_mark"
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
                    Word limit
                  </h4>
                  <input
                    type="number"
                    name="word_limit"
                    id="word_limit"
                    className="form-control all border-bottom rounded-0"
                    min="1"
                    step="1"
                    value={wordLimit}
                    onChange={(e) => {
                      setWordLimit(e.target.value);
                      setQuestion({
                        ...question,
                        wordLimit: e.target.value,
                      });
                    }}
                    pattern="^\d+$"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul
        id="description-stepper"
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

export default DescriptiveQuestionComponent;
