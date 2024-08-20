import { useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { alert } from "alertifyjs";
import clientApi, { uploadFile as uploaddFileFunc } from "@/lib/clientApi";
import { useRouter } from "next/navigation";
import Multiselect from "multiselect-react-dropdown";
import { MultiSelects } from "react-multi-select-component";
import { FileDrop } from "react-file-drop";
import "./style.css";
import { getSession } from "next-auth/react";

import * as fileSvc from "@/services/file-service";

interface props {
  show: boolean;
  onClose: () => void;
  cancel: any;
  dropped: any;
  filePicker: any;
  fileBrowseRef: any;
  uploadFile: any;
  userSubject: any;
}

interface stateProps {
  _id: number;
  name: string;
}
const CreateAssessmentModal = ({
  show,
  onClose,
  cancel,
  dropped,
  filePicker,
  fileBrowseRef,
  uploadFile,
  setUploadFile,
  userSubject,
}: props) => {
  const router = useRouter();
  const [practice, setPractice] = useState<any>({ title: "" });
  const [practiceUnits, setPracticeUnits] = useState<stateProps[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<stateProps[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<stateProps[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<any>({
    progress: 0,
    state: "pending",
  });
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [imageReview, setImageReview] = useState<boolean>(false);

  const onSubjectChange = (item: any) => {
    setSelectedUnits([]);
    let units: any[] = [];
    console.log("onSubjectChange", selectedSubjects);
    item.map((e: any) => {
      const sub: any = userSubject.find((sub: any) => sub._id === e._id);
      console.log(sub, "aaadd");
      units = [...units, ...sub.units];
    });
    units.sort((a, b) => a.name.localeCompare(b.name));
    setPracticeUnits(units);
  };

  const onSubjectSelect = (item: any) => {
    setSelectedSubjects([...item]);
    console.log(item, "item");
    onSubjectChange(item);
  };

  const onSubjectDeselect = (ev: any) => {
    const idToRemove = ev._id;
    setSelectedSubjects((prevSelectedSubjects) =>
      prevSelectedSubjects.filter((item) => item._id !== idToRemove)
    );
    onSubjectChange();
  };

  const save = async () => {
    let param = {
      ...practice,
      imageUrl: uploadedUrl ? uploadedUrl : "",
      subjects: selectedSubjects,
      units: selectedUnits,
    };
    if (
      !param.subjects ||
      param.subjects.length === 0 ||
      !param.units ||
      param.units.length === 0
    ) {
      alert("Message", "Please add subjects/units");
      return;
    }
    try {
      const session = await getSession();

      const data = await clientApi.post(
        `${process.env.NEXT_PUBLIC_API}/api/v1/tests/`,
        param,
        {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );
      onClose();
      router.push(`/assessment/details/${data.data.id}`);
    } catch (error: any) {
      console.error(error);
      alert("Message", error.response.data?.message);
    }
  };
  const fileUpload = async () => {
    const formData: FormData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    //   formData.append('uploadType', this.uploadType)
    try {
      setUploading(true);
      const res = await uploaddFileFunc(uploadFile, uploadFile.name, "file");
      setUploading(false);
      setUploadedUrl(res.data.fileUrl);
      setImageReview(true);
    } catch (err) {
      alert("message", err);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <Modal.Title
          className="col-12 text-center"
          style={{
            fontSize: "16px",
            lineHeight: "18px",
            textTransform: "capitalize",
          }}
        >
          Create Assessment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="classroom-create-modal">
          <div className="class-board-info">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <Form.Group className="form-group  border-bottom mb-2">
                {/* <Form.Label> */}
                <h4 className="form-box_subtitle upload-modal-subtitle">
                  Assessment Name
                </h4>
                {/* </Form.Label> */}
                <input
                  style={{ border: "0" }}
                  type="text"
                  name="name"
                  className="bg-transparent px-2 pb-0"
                  placeholder="Name"
                  value={practice.title}
                  onChange={(e: any) =>
                    setPractice({ ...practice, title: e.target.value })
                  }
                  required
                />
                <Form.Control.Feedback>Name is required</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="LibraryChange_new border-bottom mb-2">
                <h4 className="form-box_subtitle upload-modal-subtitle">
                  Subject
                </h4>

                <Multiselect
                  options={userSubject}
                  displayValue="name"
                  onSelect={onSubjectSelect}
                  onRemove={onSubjectDeselect}
                  selectedValues={selectedSubjects}
                  placeholder={
                    selectedSubjects.length > 0 ? "" : "Select Subjects"
                  }
                />
                {/* <ng-multiselect-dropdown [placeholder]="'Select Subjects'" [settings]="unitsDropdownSettings" [data]="userSubjects" [(ngModel)]="selectedSubjects" (onSelect)="onSubjectSelect($event)" [ngModelOptions]="{ standalone: true }"
                                (onDeSelect)="onSubjectDeselect($event)" required>
                            </ng-multiselect-dropdown> */}
              </Form.Group>
              <Form.Group className="LibraryChange_new border-bottom mb-2">
                <h4 className="form-box_subtitle upload-modal-subtitle">
                  Unit
                </h4>
                <Multiselect
                  options={practiceUnits}
                  displayValue="name"
                  selectedValues={selectedUnits}
                  onSelect={(selectedList) => setSelectedUnits(selectedList)}
                  onRemove={(selectedList) => setSelectedUnits(selectedList)}
                  placeholder={selectedUnits.length > 0 ? "" : "Select Units"}
                  closeOnSelect={false}
                />

                {/* <ng-multiselect-dropdown [placeholder]="'Select Units'" [settings]="unitsDropdownSettings" [data]="practiceUnits" [(ngModel)]="selectedUnits" [ngModelOptions]="{ standalone: true }"
                                required>
                            </ng-multiselect-dropdown> */}
              </Form.Group>

              <div className="camera-sec-box form-group ">
                <h4 className="form-box_subtitle upload-modal-subtitle">
                  Upload Assessment Picture
                </h4>

                {imageReview && uploadedUrl ? (
                  <div className="standard-upload-box mt-2 bg-white">
                    <button
                      type="reset"
                      aria-label="remove uploaded image"
                      className="close btn p-0 mb-2"
                      onClick={() => {
                        setImageReview(false);
                      }}
                    >
                      <img
                        src="/assets/images/close.png"
                        alt="user_uploaded image"
                      />
                    </button>
                    <figure>
                      <img
                        src={uploadedUrl}
                        alt="actually uploaded image"
                        className="actual-uploaded-image"
                      />
                    </figure>
                  </div>
                ) : (
                  <div className="standard-upload-box mt-2">
                    <FileDrop onDrop={(f: any) => dropped(f)}>
                      <h2 className="upload_icon mb-0">
                        <span className="material-icons">file_copy</span>
                      </h2>
                      <p className="pro-text-drug text-center d-block active text-primary">
                        {uploadFile?.name}
                      </p>
                      <span className="title">
                        Drag and Drop or{" "}
                        <a onClick={filePicker} className="text-primary">
                          {" "}
                          browse{" "}
                        </a>{" "}
                        your files
                        <br></br>
                        For optimal view, we recommend size 190px * 200px
                      </span>
                      {/* {uploading && (
                        <div className="info mx-auto mt-1 mb-2">
                          <p className="text-center text-dark">
                            Uploading(
                            <span style={{ color: "#8C89F9" }}>
                              {uploadProgress.progress.toFixed(0)}%
                            </span>{" "}
                            <i className="fa fa-spinner fa-pulse"></i>)
                          </p>
                        </div>
                      )} */}
                      {uploadProgress.state === "inprogress" && (
                        <div
                          className="progress mb-2 mx-auto"
                          style={{ height: "6px", width: "60%" }}
                        >
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${uploadProgress.progress}%`,
                              backgroundColor: "#8C89F9",
                            }}
                            aria-valuenow={uploadProgress.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="progress-bar"
                          ></div>
                        </div>
                      )}

                      <div className="d-flex justify-content-center gap-xs">
                        {!uploadFile?.name && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              filePicker();
                            }}
                          >
                            Browse
                          </button>
                        )}
                        {uploadFile?.name && (
                          <>
                            <button
                              className="btn btn-danger btn-sm"
                              type="button"
                              onClick={() => {
                                setUploadFile({ ...uploadFile, name: "" });
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-secondary btn-sm ml-2"
                              type="button"
                              onClick={fileUpload}
                            >
                              Upload
                              {uploading && (
                                <i className="fa fa-spinner fa-pulse"></i>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                      <input
                        accept=""
                        value=""
                        style={{ display: "none", opacity: 0 }}
                        ref={fileBrowseRef}
                        type="file"
                        onChange={(e) => dropped(e.target.files)}
                      />
                    </FileDrop>
                  </div>
                )}

                {/* <file-upload [(source)]="practice.imageUrl" [recommendImageSize]="'190px * 200px'"></file-upload> */}
              </div>

              <div className="d-flex justify-content-end mt-2">
                <div
                  className="btn btn-light mr-2"
                  onClick={() => {
                    setPractice({});
                    setSelectedSubjects([]);
                    setSelectedUnits([]);
                    cancel(1);
                    onClose();
                  }}
                >
                  Cancel
                </div>
                <button type="submit" className="btn btn-primary">
                  Create Assessment
                </button>
              </div>
            </Form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CreateAssessmentModal;
