import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import * as authService from "@/services/auth";
import { alert, success, error, confirm } from "alertifyjs";
import { getAudioDuration } from "@/lib/helpers";
import AudioRecorder from "@/components/AudioRecorder";
import { FileDrop } from "react-file-drop";

const AudioRecordComponent = ({
  audioFiles,
  question,
  setQuestion,
  type,
  index,
}: any) => {
  const fileBrowseRef = useRef(null);

  const [show, setShow] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [recordUploading, setRecordUploading] = useState<boolean>(false);
  const [openAudioPanel, setOpenAudioPanel] = useState<boolean>(false);
  const [audioFile, setAudioFile] = useState<any>(null);
  useEffect(() => {
    if (!audioFiles) {
      setQuestion({
        ...question,
        audioFiles: [],
      });
    }

    setOpenAudioPanel(audioFiles?.length > 0);
  }, []);

  const openRecordModal = () => {
    // this.recordModalRef = this.modalSvc.show(template, {
    //   ignoreBackdropClick: true, keyboard: false
    // })
    setShow(true);
  };
  const closeRecordModal = (ok) => {
    if (ok) {
      // upload this.selectedRecord to server
      const formData: FormData = new FormData();
      formData.append(
        "file",
        new File([selectedRecord.blob], new Date().toISOString() + ".webm")
      );
      formData.append("uploadType", "audio");

      setRecordUploading(true);
      authService
        .uploadFile(formData)
        .then((data: any) => {
          const temp_audioFiles = audioFiles ? audioFiles : [];

          temp_audioFiles.push({
            url: data.fileUrl,
            name: "",
            duration: selectedRecord.duration,
          });
          if (type === "ques") {
            setQuestion({
              ...question,
              audioFiles: temp_audioFiles,
            });
          } else if (type === "answer") {
            console.log("answer");

            setQuestion((prevQuestion) => {
              // Create a new array with the updated answer
              const updatedAnswers = prevQuestion.answers.map((answer, i) => {
                if (i === index) {
                  // Return a new object with the updated audioFiles
                  return { ...answer, audioFiles: temp_audioFiles };
                }
                return answer;
              });

              // Return the updated question object
              return {
                ...prevQuestion,
                answers: updatedAnswers,
              };
            });
          } else if (type === "explain") {
            setQuestion({
              ...question,
              answerExplainAudioFiles: temp_audioFiles,
            });
          }
          success("Audio uploaded successfully.");

          setShow(false);
          setSelectedRecord(null);
        })
        .catch((err) => {
          console.log(err);
          alert("Message", "Fail to upload your record.");
          setRecordUploading(false);
        });
    } else {
      setShow(false);
      setSelectedRecord(null);
    }
  };

  const fileDropped = (files: any) => {
    // setUploading(true);

    setAudioFile(files[0]);
  };

  const uploadAudioFile = (file: any) => {
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);
    formData.append("uploadType", "audio");

    setUploading(true);
    authService
      .uploadFile(formData)
      .then((data: any) => {
        if (data) {
          setAudioFile(null);
          const temp_audioFiles = audioFiles ? [...audioFiles] : [];

          temp_audioFiles.push({
            url: data.fileUrl,
            name: file.name,
            // duration: d,
          });
          if (type === "ques") {
            setQuestion({
              ...question,
              audioFiles: temp_audioFiles,
            });
          } else if (type === "answer") {
            setQuestion((prevQuestion) => {
              // Create a new array with the updated answer
              const updatedAnswers = prevQuestion.answers.map((answer, i) => {
                if (i === index) {
                  // Return a new object with the updated audioFiles
                  return { ...answer, audioFiles: temp_audioFiles };
                }
                return answer;
              });

              // Return the updated question object
              return {
                ...prevQuestion,
                answers: updatedAnswers,
              };
            });
          } else if (type === "explain") {
            setQuestion({
              ...question,
              answerExplainAudioFiles: temp_audioFiles,
            });
          }

          // getAudioDuration(data.fileUrl, (d) => {
          //   const temp_audioFiles = [...audioFiles];
          //   temp_audioFiles.push({
          //     url: data.fileUrl,
          //     name: file.name,
          //     duration: d,
          //   });

          //   setQuestion({
          //     ...question,
          //     audioFiles: temp_audioFiles,
          //   });
          // });
          success("Audio uploaded successfully.");
          setUploading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        alert(
          "Message",
          "Uploaded file type not supported. Supported file types are mp3, m4a, aac."
        );
        setUploading(false);
      });
  };

  const removeAudio = (fileIdx: any) => {
    confirm("Are you sure you want to remove this audio?", () => {
      const newAudioFiles = [...audioFiles];
      newAudioFiles.splice(fileIdx, 1);
      setQuestion({
        ...question,
        audioFiles: newAudioFiles,
      });
    });
  };
  const removeExAnsAudio = (fileIdx: any) => {
    confirm("Are you sure you want to remove this audio?", () => {
      const newAudioFiles = [...audioFiles];
      newAudioFiles.splice(fileIdx, 1);
      setQuestion({
        ...question,
        answerExplainAudioFiles: newAudioFiles,
      });
    });
  };

  const newRecord = (ev: any) => {
    setSelectedRecord(ev);
  };
  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  const removeAnswerAudio = (answerIndex, audioIndex) => {
    setQuestion((prevQuestion) => {
      const updatedAnswers = prevQuestion.answers.map((answer, idx) => {
        if (idx === answerIndex) {
          const updatedAudioFiles = answer.audioFiles.filter(
            (_, i) => i !== audioIndex
          );
          return { ...answer, audioFiles: updatedAudioFiles };
        }
        return answer;
      });
      return { ...prevQuestion, answers: updatedAnswers };
    });
  };
  return (
    <>
      <div className="mt-2 bold text-dark">
        <a onClick={() => setOpenAudioPanel(!openAudioPanel)}>
          Audio{" "}
          <i
            className={`fas ${
              openAudioPanel ? "fa-angle-up" : "fa-angle-down"
            }`}
          ></i>
        </a>
      </div>
      <div>
        {openAudioPanel && (
          <div className="mt-2">
            <div className="row">
              <div className="col-6">
                <div
                  className="standard-upload-box my-0 text-center position-relative"
                  style={{ height: "170px" }}
                >
                  <FileDrop onDrop={(f: any) => fileDropped(f)}>
                    <h2 className="upload_icon mb-0">
                      <span className="material-icons">file_copy</span>
                    </h2>
                    <p className="pro-text-drug text-center d-block active text-primary">
                      {audioFile?.name}
                    </p>
                    <span className="title">
                      Drag and Drop or{" "}
                      <a onClick={openFileSelector} className="text-primary">
                        {" "}
                        browse{" "}
                      </a>{" "}
                      your audio files
                    </span>
                    <p className="text-dark">
                      Supported format:{" "}
                      <span className="text-danger">MP3, M4A, AAC</span>
                    </p>
                    <div className="d-flex justify-content-center gap-xs mb-2">
                      {!audioFile?.name && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={openFileSelector}
                        >
                          Browse
                        </button>
                      )}
                      {audioFile?.name && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => uploadAudioFile(audioFile)}
                          disabled={!audioFile || uploading}
                        >
                          Upload{" "}
                          {uploading && (
                            <i className="fa fa-spinner fa-pulse"></i>
                          )}
                        </button>
                      )}
                    </div>
                    <input
                      accept=".mp3,.m4a,.aac"
                      value=""
                      style={{ display: "none", opacity: 0 }}
                      ref={fileBrowseRef}
                      type="file"
                      onChange={(e) => fileDropped(e.target.files)}
                    />
                  </FileDrop>
                </div>
              </div>
              <div className="col-6">
                <div
                  className="standard-upload-box my-0 text-center position-relative"
                  style={{ height: "170px" }}
                >
                  <button
                    className="mx-auto mt-2 mb-1 btn rounded-circle border"
                    style={{ width: "100px", height: "100px" }}
                    onClick={() => openRecordModal()}
                  >
                    <i className="fas fa-microphone-alt fa-4x"></i>
                  </button>
                  <p>Voice Recorder</p>
                </div>
              </div>
            </div>
            {type === "ques" && (
              <div className="row">
                {question.audioFiles?.map((audio, i) => (
                  <div key={i} className="position-relative my-2 col-6">
                    <div className="d-flex align-items-center gap-xs">
                      <label>Name</label>
                      <input
                        className="form-controls border-bottom flex-grow-1"
                        name={`txtAudioFile_${i}`}
                        value={audio.name}
                        onChange={(e) => {
                          const updatedAudioFiles = [...audioFiles];
                          updatedAudioFiles[i].name = e.target.value;
                          setQuestion({
                            ...question,
                            audioFiles: updatedAudioFiles,
                          });
                        }}
                        placeholder="audio name"
                      />
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1 mr-2">
                        <audio
                          controls
                          src={audio.url}
                          className="w-100"
                        ></audio>
                      </div>
                      <a onClick={() => removeAudio(i)}>
                        <figure>
                          <img src="/assets/images/close.png" alt="" />
                        </figure>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {type === "answer" && (
              <div className="row">
                {question.answers?.map((ans, index) =>
                  ans.audioFiles.map((audio, i) => (
                    <div key={i} className="position-relative my-2 col-6">
                      <div className="d-flex align-items-center gap-xs">
                        <label>Name</label>
                        <input
                          className="form-controls border-bottom flex-grow-1"
                          name={`txtAudioFile_${i}`}
                          value={audio.name}
                          onChange={(e) => {
                            const updatedAudioFiles = [...audioFiles];
                            updatedAudioFiles[i].name = e.target.value;

                            setQuestion((prevQuestion) => {
                              // Create a new array with the updated answer
                              const updatedAnswers = prevQuestion.answers.map(
                                (answer, ix) => {
                                  if (ix === index) {
                                    // Return a new object with the updated audioFiles
                                    return {
                                      ...answer,
                                      audioFiles: updatedAudioFiles,
                                    };
                                  }
                                  return answer;
                                }
                              );

                              // Return the updated question object
                              return {
                                ...prevQuestion,
                                answers: updatedAnswers,
                              };
                            });
                          }}
                          placeholder="audio name"
                        />
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 mr-2">
                          <audio
                            controls
                            src={audio.url}
                            className="w-100"
                          ></audio>
                        </div>
                        <a onClick={() => removeAnswerAudio(index, i)}>
                          <figure>
                            <img src="/assets/images/close.png" alt="" />
                          </figure>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {type === "explain" && (
              <div className="row">
                {question.answerExplainAudioFiles?.map((audio, i) => (
                  <div key={i} className="position-relative my-2 col-6">
                    <div className="d-flex align-items-center gap-xs">
                      <label>Name</label>
                      <input
                        className="form-controls border-bottom flex-grow-1"
                        name={`txtAudioFile_${i}`}
                        value={audio.name}
                        onChange={(e) => {
                          const updatedAudioFiles = [...audioFiles];
                          updatedAudioFiles[i].name = e.target.value;
                          setQuestion({
                            ...question,
                            answerExplainAudioFiles: updatedAudioFiles,
                          });
                        }}
                        placeholder="audio name"
                      />
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1 mr-2">
                        <audio
                          controls
                          src={audio.url}
                          className="w-100"
                        ></audio>
                      </div>
                      <a onClick={() => removeExAnsAudio(i)}>
                        <figure>
                          <img src="/assets/images/close.png" alt="" />
                        </figure>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="modal-content assess-modal-all modal-createAss-1 form-boxes">
        <Modal show={show} onHide={() => setShow(false)}>
          <div>
            <div className="modal-header modal-header-bg justify-content-center">
              <h6 className="form-box_title mt-0">Recording</h6>
            </div>

            <div className="modal-body">
              <AudioRecorder recordSelected={newRecord} />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-light"
                onClick={() => closeRecordModal(false)}
                disabled={recordUploading}
              >
                Cancel
              </button>
              <button
                disabled={!selectedRecord || recordUploading}
                className="btn btn-primary"
                onClick={() => closeRecordModal(true)}
              >
                Done{" "}
                {recordUploading && <i className="fa fa-spinner fa-pulse"></i>}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default AudioRecordComponent;
