import { Modal } from "react-bootstrap";
import { FileDrop } from "react-file-drop";
import { WithContext as ReactTags } from "react-tag-input";
import "./style.css";

interface props {
  show: any;
  onClose: any;
  dropped: any;
  uploadFile: any;
  filePicker: any;
  fileBrowseRef: any;
  tags: any;
  setTags: any;
  addToQB: any;
  setAddToQB: any;
  cancel: any;
  upload: any;
}
const UploadAssessmentModal = ({
  show,
  onClose,
  dropped,
  uploadFile,
  filePicker,
  fileBrowseRef,
  tags,
  setTags,
  addToQB,
  setAddToQB,
  cancel,
  upload,
}: props) => {
  return (
    <Modal show={show} onHide={onClose}>
      <div className="modal-header modal-header-bg justify-content-center">
        <h6 className="form-box_title mb-0 text-center">
          Upload question file to create assessment
        </h6>
      </div>
      <Modal.Body>
        <div className="classroom-create-modal">
          <div className="class-board-info form-boxes">
            <form>
              <div className="camera-sec-box">
                <h4 className="form-box_subtitle mb-0">Browse question file</h4>

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
                    </span>
                    <input
                      accept=".xls,.xlsx,.gzip,.zip,.docx"
                      value=""
                      style={{ display: "none", opacity: 0 }}
                      ref={fileBrowseRef}
                      type="file"
                      onChange={(e) => dropped(e.target.files)}
                    />
                  </FileDrop>
                </div>
              </div>

              <div className="mt-2">
                <h4 className="form-box_subtitle mb-0">Question Tags</h4>
                <ReactTags
                  tags={tags}
                  handleDelete={(i: number) =>
                    setTags(tags.filter((t: any, index: number) => i !== index))
                  }
                  handleAddition={(tag: any) => setTags([...tags, tag])}
                />
              </div>

              <div className="mt-2">
                <div>
                  <h4 className="form-box_subtitle mb-0">Question Bank</h4>
                  <h6 className="f-12 sub-info custom ml-0">
                    Add questions in question bank
                  </h6>
                  <div className="row align-items-center container1 m-0 mr-2 float-none">
                    <div className="radio mt-1">
                      <input
                        type="radio"
                        value="global"
                        defaultChecked={addToQB.value === "global"}
                        onChange={(e) =>
                          setAddToQB((p: any) => ({
                            ...p,
                            value: e.currentTarget.value,
                          }))
                        }
                        name="qbank"
                        id="global"
                      />
                      <label htmlFor="global" className="my-0"></label>
                    </div>
                    <div
                      className="upload-right radio-all ml-1"
                      style={{ marginTop: "9px", fontSize: "14px" }}
                    >
                      Global
                    </div>
                  </div>
                  <p className="assess-help mt-1">
                    (Everyone can view these questions after upload)
                  </p>
                  <div className="row align-items-center container1 m-0 mr-2 float-none">
                    <div className="radio mt-1">
                      <input
                        type="radio"
                        value="self"
                        defaultChecked={addToQB.value === "self"}
                        name="qbank"
                        id="self"
                        onChange={(e) =>
                          setAddToQB((p: any) => ({
                            ...p,
                            value: e.currentTarget.value,
                          }))
                        }
                      />
                      <label htmlFor="self" className="my-0"></label>
                    </div>
                    <div
                      className="upload-right radio-all ml-1"
                      style={{ marginTop: "9px", fontSize: "14px" }}
                    >
                      Self
                    </div>
                  </div>
                  <p className="assess-help mt-1">
                    (Only you can view these questions after upload)
                  </p>
                  <div className="row container1 m-0 mr-1 float-none">
                    <div className="radio mt-2">
                      <input
                        type="radio"
                        value="none"
                        defaultChecked={addToQB.value === "none"}
                        name="qbank"
                        id="none"
                        onChange={(e) =>
                          setAddToQB((p: any) => ({
                            ...p,
                            value: e.currentTarget.value,
                          }))
                        }
                      />
                      <label htmlFor="none" className="my-0"></label>
                    </div>
                    <div
                      className="upload-right radio-all ml-1 float-none"
                      style={{ marginTop: "9px", fontSize: "14px" }}
                    >
                      None
                    </div>
                  </div>
                  <p className="assess-help mt-1">
                    (No one will be able to view these questions after upload)
                  </p>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-2">
                <a
                  className="btn btn-light"
                  onClick={() => {
                    cancel(1);
                    onClose();
                  }}
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  className="btn btn-primary ml-2"
                  onClick={(e) => {
                    e.preventDefault();
                    upload(uploadFile);
                  }}
                  disabled={!(tags.length && !!uploadFile)}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UploadAssessmentModal;
