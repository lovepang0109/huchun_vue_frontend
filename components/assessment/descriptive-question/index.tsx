import { useEffect, useState } from "react";
import { useTakeTestStore } from "@/stores/take-test-store";
import clientApi from "@/lib/clientApi";
import Editor from "@/public/assets/ckeditor/build/ckeditor";
import { formatQuestion } from "@/lib/pipe";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useSession } from "next-auth/react";
import alertify from "alertifyjs";
import { Modal } from "react-bootstrap";
import Camera from "@/components/camera";
import MathJax from "../mathjax";

interface Props {
  question: any;
  practice: any;
  answerChanged: any;
  setDescriptiveAnswer: (state: any) => void;
}
const Descriptive = ({
  question,
  practice,
  answerChanged,
  setDescriptiveAnswer,
}: Props) => {
  const { data } = useSession();
  const { clientData } = useTakeTestStore();
  const [quest, setQuest] = useState<any>(question);
  const [activeEditor, setActiveEditor] = useState<any>();
  const [editorChanged, setEditorChanged] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [takingSnapshot, setTakingSnapshot] = useState<boolean>(false);
  const [ckoptions, setCkOptions] = useState<any>();
  const [reload, setReload] = useState<boolean>(false);
  const [camErrors, setCamErrors] = useState<any[]>([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [showCamModal, setShowCamModal] = useState<boolean>(false);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>();

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    if (activeEditor) {
      activeEditor?.model.document.off("change:data", ckeditorChangeData);
      activeEditor.ui.focusTracker.off("change:data", ckeditorChangeData);
      activeEditor.plugins
        .get("ClipboardPipeline")
        .off("inputTransformation", ckeditorPreventPaste);
    }
    if (!quest?.answerText) {
      setQuest((prev: any) => ({ ...prev, answerText: "" }));
    }
    const cktemp = {
      wordCount: {
        displayWords: true,
        displayCharacters: true,
        // maxWordCount: this.question.wordLimit ? this.question.wordLimit : 0,
        onUpdate: (stats: any) => {
          const word = stats.characters;
          document.getElementById("word").innerHTML = word;
          if (word > question.wordLimit) {
            alertify.alert("Message", "Word limit exceeded.");
            practice.error = true;
          } else {
            practice.error = false;
          }
        },
      },
      simpleUpload: {
        uploadUrl: "/api/ckeditor/image-upload",
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": "CSRF-Token",
          Authorization: "Bearer " + data?.accessToken,
        },
      },
    };
    setCkOptions(cktemp);
    setReload(true);
    setTimeout(() => {
      setReload(false);
    }, 500);
  }, [question]);

  const ckeditorPreventPaste = (evt: any, data: any) => {
    evt.preventDefault();
  };

  const ckeditorChangeData = (ev: any) => {
    setEditorChanged(true);
  };

  const onReady = (editor: any) => {
    setActiveEditor(editor);
    editor.ui
      .getEditableElement()
      ?.parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.model.document.on("change:data", ckeditorChangeData);
    editor.ui.focusTracker.on("change:isFocused", ckeditorIsFocused);
    editor.plugins
      .get("ClipboardPipeline")
      .on("inputTransformation", ckeditorPreventPaste);
  };

  const ckeditorIsFocused = (evt: any, name: string, isFocused: boolean) => {
    if (!isFocused && editorChanged) {
      setEditorChanged(false);
      const isAnswered = !!activeEditor.getData();
      const questData = quest;
      questData.answerText = activeEditor.getData();
      questData.isAnswered = isAnswered;
      setDescriptiveAnswer(questData);
    }
  };

  const onChange = (data: any) => {
    const isAnswered = !!data;
    const questData = quest;
    questData.answerText = data;
    questData.isAnswered = isAnswered;
    setDescriptiveAnswer(questData);
  };

  const removeDoc = (index: number) => {
    const questData = quest;
    questData.attachments = quest.attachments.splice(index, 1);
    setDescriptiveAnswer(questData);
  };

  const handleTakePicture = () => {};

  const takePicture = () => {
    if (takingSnapshot) {
      return;
    }
    setTakingSnapshot(true);
    // this.camera.triggerSnapshot()
  };

  const handleInitError = (error: any) => {
    let list = camErrors;
    list.push(error);
    setCamErrors(list);
  };
  const handlePictureTaken = (camInfo: any) => {
    setUploading(true);
    const fileName = Date.now() + ".jpg";
    const questData = quest;
    uploadFile(fileName, camInfo.blob)
      .then(
        (fileUrl) => {
          if (!question.attachments) {
            questData.attachments = [];
          }
          // save user data
          questData.attachments.push({
            url: fileUrl,
            name: fileName,
            type: "image",
          });
          setDescriptiveAnswer(questData);
          alert("File is uploaded.");
          // camera.toggleWebcam();
          // camModal.hide();
        },
        () => {
          alert(
            "File upload failed. Please check your internet connection and try again."
          );
        }
      )
      .finally(() => {
        setUploading(false);
        setTakingSnapshot(false);
      });
  };

  const uploadFile = async (fileName: string, file: any) => {
    // return new Promise((resolve, reject) => {
    //   this.studentService.getAssetSignedUrl(practice.attemptId, fileName).subscribe((res: any) => {
    //     jQuery.ajax({
    //       type: 'PUT',
    //       url: res.signedUrl,
    //       // Content type must much with the parameter you signed your URL with
    //       contentType: 'binary/octet-stream',
    //       // contentType: false,
    //       // this flag is important, if not set, it will try to send data as a form
    //       processData: false,
    //       // the actual file is sent raw
    //       data: file
    //     }).done((data) => {
    //       resolve(res.fileUrl)
    //     }).fail(f => {
    //       reject(f)
    //     });
    //   }, (err) => {
    //     reject(err)
    //   })
    // })
  };
  const uploadDoc = () => {};
  const uploadAudio = () => {};
  const recordAudio = () => {};

  const uploadPicture = (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const fileName = file.name;
    const toCheck = fileName.toLowerCase();
    if (
      !toCheck.endsWith(".png") &&
      !toCheck.endsWith(".jpeg") &&
      !toCheck.endsWith(".jpg") &&
      !toCheck.endsWith(".bmp") &&
      !toCheck.endsWith(".gif")
    ) {
      alert("Please choose only image.");
      return;
    }
    // this.imgInput.nativeElement.value = ''
    // this.uploading = true;
    // this.uploadFile(fileName, file).then((fileUrl) => {
    //   this.uploading = false;
    //   console.log('fine')
    //   if (!question.attachments) {
    //     question.attachments = []
    //   }
    //   question.attachments.push({
    //     url: fileUrl,
    //     name: fileName,
    //     type: 'image'
    //   })
    //   this.onChange();
    //   alertify.success('File is uploaded.')
    // }, () => {
    //   this.uploading = false;
    //   alertify.alert("Message",'Warning', 'File upload failed. Please check your internet connection and try again.')
    // })
  };

  const uploadDocument = (event: any) => {
    const file = event.target.files[0];
    const fileName = file.name;
    const toCheck = fileName.toLowerCase();
    if (
      !toCheck.endsWith(".text") &&
      !toCheck.endsWith(".txt") &&
      !toCheck.endsWith(".pdf") &&
      !toCheck.endsWith(".doc") &&
      !toCheck.endsWith(".docx")
    ) {
      alert("Please choose only text, pdf and word file.");
      return;
    }
    // this.docInput.nativeElement.value = ''
    // this.uploading = true;
    // this.uploadFile(fileName, file).then((fileUrl) => {
    //   this.uploading = false;
    //   if (!question.attachments) {
    //     question.attachments = []
    //   }
    //   question.attachments.push({
    //     url: fileUrl,
    //     name: fileName,
    //     type: 'file'
    //   })
    //   this.onChange();
    //   alertify.success('File is uploaded.')
    // }, () => {
    //   this.uploading = false;
    //   alertify.alert("Message",'Warning', 'File upload failed. Please check your internet connection and try again.')
    // })
  };

  const uploadAudioFile = (event: any) => {
    const file = event.target.files[0];
    const fileName = file.name;
    const toCheck = fileName.toLowerCase();
    if (
      !toCheck.endsWith(".aac") &&
      !toCheck.endsWith(".m4a") &&
      !toCheck.endsWith(".mp3") &&
      !toCheck.endsWith(".mp4") &&
      !toCheck.endsWith(".ogg")
    ) {
      alert("Please choose only audio file in this format: AAC M4A MP3.");
      return;
    }
    // this.audioInput.nativeElement.value = ''
    // this.uploading = true;
    // this.uploadFile(fileName, file).then((fileUrl) => {
    //   this.uploading = false;
    //   if (!question.attachments) {
    //     question.attachments = []
    //   }
    //   question.attachments.push({
    //     url: fileUrl,
    //     name: fileName,
    //     type: 'audio'
    //   })
    //   this.onChange();
    //   alertify.success('File is uploaded.')
    // }, () => {
    //   this.uploading = false;
    //   alertify.alert("Message",'Warning', 'File upload failed. Please check your internet connection and try again.')
    // })
  };

  const closeRecordModal = async (ok: boolean) => {
    if (ok) {
      const fileName = new Date().toISOString() + ".webm";
      const file = new File([selectedRecord.blob], fileName);
      try {
        const fileUrl = await uploadFile(fileName, file);
        setUploading(false);
        const questData = quest;
        questData.attachments = [
          { url: fileUrl, name: fileName, type: "audio" },
        ];
        setDescriptiveAnswer(questData);
        setAudioFiles([]);
        setSelectedRecord(null);
      } catch (error) {
        setUploading(false);
        alert(
          "File upload failed. Please check your internet connection and try again."
        );
      }
    } else {
      setAudioFiles([]);
      setSelectedRecord(null);
    }
  };

  return (
    <div className="question-box bg-white p-0">
      <div className="question-item">
        <span>
          <MathJax
            value={formatQuestion(clientData?.baseUrl, question?.questionText)}
          />
        </span>

        <div className="row">
          {question?.audioFiles?.length ? (
            <>
              {question?.audioFiles.map((audio: any, index: number) => (
                <div
                  className="position-relative my-2 col-lg-6 col-12"
                  key={audio.name + index}
                >
                  <label>{audio.name}</label>
                  <audio controls src={audio.url} className="w-100"></audio>
                </div>
              ))}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      {!reload && (
        <div>
          <CKEditor
            editor={Editor}
            config={ckoptions}
            data={question?.answerText}
            onReady={onReady}
            onChange={(event, editor) => {
              const data = editor?.getData();
              onChange(data);
            }}
          />
          <div className="float-right">
            <span id="word"></span>
            <span>/{question?.wordLimit}</span>
          </div>
        </div>
      )}

      {question?.attachements?.map((att: any, index: number) => (
        <div className="mt-3 row w-100" key={att.name + index}>
          <a
            className="col-auto remove-attachment"
            onClick={() => removeDoc(index)}
            aria-label="Close"
            role="button"
          >
            <span aria-hidden="true">&#10006;</span>
          </a>
          <div className="col">
            {att?.type === "image" && (
              <img
                src={att.url}
                className="mw-100 mh-100 img-thumbnail rounded obj-f-scale-down"
                alt=""
              />
            )}
            {att?.type === "file" && <span>{att.name}</span>}
            {att?.type === "audio" && (
              <audio controls className="w-100" src={att?.url}></audio>
            )}
          </div>
        </div>
      ))}
      {uploading && (
        <div>
          Uploading...
          <i className="fa fa-pulse fa-spinner"></i>
        </div>
      )}

      <div className="button-group mt-3">
        <button className="btn btn-primary btn-sm" onClick={handleTakePicture}>
          Take Picture
        </button>

        <button className="btn btn-primary btn-sm ml-3" onClick={uploadDoc}>
          Upload Document
        </button>

        <button className="btn btn-primary btn-sm ml-3" onClick={uploadAudio}>
          Upload Audio
        </button>

        <button className="btn btn-primary btn-sm ml-3" onClick={recordAudio}>
          Audio Record
        </button>
      </div>

      <input
        hidden
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/bmp,image/gif"
        id="#imageUploader"
        onChange={(e) => uploadPicture(e)}
      />

      <input
        hidden
        type="file"
        accept="text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        id="#docUploader"
        onChange={(e) => uploadDocument(e)}
      />

      <input
        hidden
        type="file"
        accept="audio/aac,audio/ogg,audio/mp3,audio/mp4"
        id="#audioUploader"
        onChange={(e) => uploadAudioFile(e)}
      />
      <Modal
        show={showCamModal}
        onHide={() => setShowCamModal(false)}
        size="lg"
        aria-labelledby="dialog-sizes-name1"
      >
        <Modal.Header closeButton>
          <Modal.Title id="dialog-sizes-name1">Camera</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3
            className="text-center"
            style={{ display: camErrors.length ? "block" : "none" }}
          >
            <span>We couldn’t access your Camera</span>
          </h3>
          <Camera
            onPictureTaken={handlePictureTaken}
            permissionErrors={handleInitError}
            resizeQuality={1}
            width={500}
            height={500}
          />
        </Modal.Body>
        <Modal.Footer>
          <a className="btn btn-light" onClick={takePicture}>
            Take Picture
          </a>
        </Modal.Footer>
      </Modal>
      <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)}>
        <Modal.Header
          className="modal-header-bg justify-content-center"
          closeButton
        >
          <Modal.Title className="form-box_title mt-0">Recording</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* <audio-recorder onRecordSelected={newRecord}></audio-recorder> */}
        </Modal.Body>

        <Modal.Footer>
          <button disabled={uploading} onClick={() => closeRecordModal(false)}>
            Cancel
          </button>
          <button
            disabled={!selectedRecord || uploading}
            onClick={() => closeRecordModal(true)}
          >
            Done {uploading && <i className="fa fa-spinner fa-pulse"></i>}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Descriptive;
