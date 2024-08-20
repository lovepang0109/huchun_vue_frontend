import React, { useEffect, useState, useRef } from "react";
import * as classroomService from "@/services/classroomService";
import * as authService from "@/services/auth";
import alertify from "alertifyjs";
import { useRouter, useParams } from "next/navigation";
import { copyText as commonCopyText } from "@/lib/helpers";
import Multiselect from "multiselect-react-dropdown";
import ToggleComponent from "@/components/ToggleComponent";
import { FileDrop } from "react-file-drop";
import { Modal } from "react-bootstrap";
import clientApi, { uploadFile as uploaddFileFunc } from "@/lib/clientApi";

const ClassroomSettings = ({
  classroom,
  setClassrom,
  user,
  getClientData,
}: any) => {
  const { push } = useRouter();
  const fileBrowseRef = useRef(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const { id } = useParams();
  const [allInstructors, setAllInstructors] = useState<any>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [saveAsModal, setSaveAsModal] = useState<boolean>(false);
  const [searchInst, setSearchInst] = useState<string>("");
  const [modalInstructor, setModalInstructor] = useState<any>([]);
  const [classInstructors, setClassInstructors] = useState<any>([]);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [classroomName, setClassroomName] = useState<any>(null);
  const [isNewUpload, setIsNewUpload] = useState<boolean>(false);
  const [showAssignment, setShowAssignment] = useState<boolean>(
    classroom.showAssignment
  );
  const [showFolder, setShowFolder] = useState<boolean>(classroom.showFolder);
  const [showCollab, setShowCollab] = useState<boolean>(classroom.showCollab);
  const [showMembers, setShowMembers] = useState<boolean>(
    classroom.showMembers
  );
  useEffect(() => {
    if (!classroom.imageUrl) {
      setClassrom({
        ...classroom,
        imageUrl: "/assets/images/classroomjpgimg.jpg",
      });
    }
    authService
      .findUsers({
        teacherOnly: true,
        isVerified: true,
        location: classroom.location,
      })
      .then(({ users }: { users: [] }) => {
        setAllInstructors(users);
        setClassInstructors([...classroom.owners]);
        const tmp = [...classroom.owners];
        const indCls = tmp.findIndex((e) => e._id == classroom.user._id);
        if (indCls < 0) {
          tmp.push(classroom.user);
          setClassInstructors(tmp);
        }
      })
      .catch((err) => {
        setAllInstructors([]);
      });
  }, []);

  const openModal = (template: any, id: number) => {
    setSaveAsModal(true);
    // this.modalRef = this.modalService.show(template, {
    //   id: id,
    //   ignoreBackdropClick: false,
    //   keyboard: false
    // });
  };

  // console.log(classroom, "classroomuserid");

  const save = (form: any) => {
    setClassrom({
      ...classroom,
      showAssignment: showAssignment,
      showFolder: showFolder,
      showCollab: showCollab,
      showMembers: showMembers,
    });
    const tmp_class = {
      ...classroom,
      showAssignment: showAssignment,
      showFolder: showFolder,
      showCollab: showCollab,
      showMembers: showMembers,
    };
    const updateData = { ...tmp_class };

    updateData.owners = [];
    const filterInst = classInstructors.filter(
      (ins) => ins._id != classroom.user._id
    );
    if (filterInst && filterInst.length > 0) {
      updateData.owners = filterInst.map((i) => i._id);
    }
    setSubmitted(true);
    classroomService
      .update(classroom._id, updateData)
      .then((data) => {
        alertify.success("Classroom updated successfully.");
        setSubmitted(false);
        setClassrom({
          ...tmp_class,
          owners: filterInst,
        });
        // this.classroomChange.emit(this.classroom)
        cancel(1);
        push(`/classroom/details/${id}`);
      })
      .catch((err) => {
        if (err) {
          if (err.response.data.msg) {
            alertify.alert("Message", err.response.data.msg);
          } else {
            alertify.alert(
              "Message",
              "Something went wrong. Please try again after some time."
            );
          }
        }
      });
    // if (form.valid) {

    // }
  };

  const saveAs = (name: any, id: number) => {
    if (classroom._id) {
      classroomService
        .saveAs(classroom._id, { name })
        .then((data: any) => {
          alertify.success("Classroom created successfully.");

          setSubmitted(false);
          cancel(id);

          push(
            `/classroom/details/${data._id}?refresh=${new Date().getTime()}`
          );
        })
        .catch((err) => {
          if (err.response.data.msg) {
            alertify.alert("Message", err.response.data.msg);
          } else if (err.response.data.error == "name_exists") {
            alertify.alert(
              "Warning",
              "Classroom already exists. It may be inactive."
            );
          } else {
            alertify.alert(
              "Message",
              "Something went wrong. Please try again after some time."
            );
          }
        });
    } else {
      alertify.alert(
        "Message",
        "Something went wrong. Please try again after some time."
      );
    }
  };

  const cancel = (modalId: any) => {
    // this.modalService.hide(modalId);
    setSaveAsModal(false);
  };

  const remove = () => {
    alertify.confirm(
      "Are you sure you want to delete this classroom?",
      (isOk) => {
        if (isOk)
          classroomService
            .destroy(classroom._id)
            .then(() => {
              alertify.success("Classroom deleted successfully.");
              push(`/classroom`);
            })
            .catch((err) => {
              if (err.error.msg) {
                alertify.alert("Message", err.error.msg);
              } else {
                alertify.alert(
                  "Message",
                  "Something went wrong. Please try again after some time."
                );
              }
            });
      }
    );
  };

  const copyCode = () => {
    commonCopyText(classroom.seqCode);
    alertify.success("Successfully Copied");
  };

  const removeInstructor = (ev: any) => {
    const removedItem = classInstructors.filter(
      (obj) => !ev.some((e) => e._id === obj._id)
    );
    if (removedItem[0]._id == classroom.user._id) {
      alertify.alert(
        "Message",
        "You can not remove the creator of the classroom"
      );
      ev.push(classroom.user);
    }
    setClassInstructors(ev);
  };

  const regenerateCode = () => {
    alertify.confirm(
      "The existing classroom code will become inactive, and students cannot join with this code. Do not forget to let students know the new code. Do you want to continue?",
      (isOk) => {
        if (isOk) {
          classroomService
            .regenerateCode(classroom._id)
            .then((newCode) => {
              alertify.success("New code is generated");
              setClassrom({
                ...classroom,
                seqCode: newCode,
              });
            })
            .catch((err) => {
              if (err.error.msg) {
                alertify.alert("Message", err.error.msg);
              } else {
                alertify.alert(
                  "Message",
                  "Something went wrong. Please try again after some time."
                );
              }
            });
        }
      }
    );
  };
  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  const fileUpload = async () => {
    const formData: FormData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    //   formData.append('uploadType', this.uploadType)
    try {
      const res = await uploaddFileFunc(uploadFile, uploadFile.name, "file");
      setUploadedUrl(res.data.fileUrl);
      setClassrom({
        ...classroom,
        imageUrl: res.data.fileUrl,
      });
      setIsNewUpload(false);
    } catch (err) {
      alert("message", err);
    }
  };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mx-auto">
          <div className="row">
            <div className="col-lg-6 cls-lft-remove">
              <div className="dashboard-area-wrap mx-auto pt-0">
                <div className="rounded-boxes form-boxes bg-white clearfix">
                  <div className="clearfix top-fill-1">
                    <div className="profile-info">
                      <h5 className="form-box_subtitle">Classroom Name</h5>
                      <input
                        className="form-control form-control-sm cls-input-fld mb-0"
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={classroom.name}
                        onChange={(e) => {
                          setClassrom({
                            ...classroom,
                            name: e.target.value,
                          });
                        }}
                      />
                      {/* <div>{name.invalid && (name.dirty || name.touched || submitted) && (
                        <div>
                            {name.errors.pattern && <p className="label label-danger text-danger">Name contains invalid characters.</p>}
                            {name.errors.required && <p className="label label-danger text-danger">Name is required</p>}
                            {name.errors.maxlength && <p className="label label-danger text-danger">Name must be smaller than 50 characters.</p>}
                            {name.errors.minlength && <p className="label label-danger text-danger">Name must be greater than 2 characters.</p>}
                        </div>
                    )}</div> */}
                      <hr />
                    </div>
                  </div>
                </div>

                <div className="rounded-boxes form-boxes bg-white clearfix">
                  <div className="clearfix default-height bottom-fill-1 h-auto color-tags">
                    <div className="weight">
                      <h5 className="form-box_subtitle">Instructor</h5>

                      <Multiselect
                        options={allInstructors}
                        displayValue="name"
                        onSelect={(e) => {
                          setClassInstructors(e);
                        }}
                        onRemove={removeInstructor}
                        selectedValues={classInstructors}
                        placeholder="+ Instructor Name"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="rounded-boxes form-boxes bg-white"
                style={{ position: "relative", zIndex: "1" }}
              >
                <div className="d-flex justify-content-between align-items-center ">
                  <b className="">Allow Student to join by code?</b>

                  <div className="form-group switch-item">
                    <div className="d-flex align-items-center">
                      <div className="align-self-center">
                        <label className="switch col-auto ml-auto my-0 align-middle">
                          <input
                            type="checkbox"
                            checked={classroom.joinByCode}
                            onChange={(e) =>
                              setClassrom({
                                ...classroom,
                                joinByCode: e.target.checked,
                              })
                            }
                          />
                          <span
                            className="slider round translate-middle-y"
                            style={{ top: 0 }}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {classroom.joinByCode && (
                  <div>
                    <strong>Clasroom Code : </strong>
                    <div className="mt-2">
                      {classroom.seqCode}
                      <button
                        onClick={copyCode}
                        className="btn btn-secondary btn-sm ml-2"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                      {user.role == "director" ||
                        user.role == "admin" ||
                        (classroom.user._id == user._id && (
                          <button
                            onClick={regenerateCode}
                            className="btn btn-warning btn-sm ml-2"
                          >
                            Regenerate <i className="fas fa-retweet"></i>
                          </button>
                        ))}
                    </div>
                    <p className="mt-2">
                      Share code with students to join this classroom. If code
                      is misused, you may regenerate a new code. Students can no
                      longer use old code.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="dashboard-area-wrap mx-auto pt-0">
                <div className="rounded-boxes form-boxes bg-white">
                  <div className="bottom-fill-1 h-auto">
                    <div className="profile-info">
                      <h5 className="form-box_subtitle">Classroom Photo</h5>

                      {/* <file-upload
                        source={classroom.imageUrl}
                        recommendImageSize="'190px * 200px'"
                      /> */}
                      {!isNewUpload ? (
                        <div className="standard-upload-box mt-2 bg-white ng-star-inserted">
                          <button
                            type="reset"
                            aria-label="cross-button"
                            className="close btn p-0 mb-2"
                            onClick={() => setIsNewUpload(true)}
                          >
                            <img
                              src="/assets/images/close.png"
                              alt="user_uploaded image"
                            />
                          </button>
                          <figure style={{ margin: "5px" }}>
                            <img
                              className="actual-uploaded-image"
                              src={classroom.imageUrl}
                              alt="classroom Image"
                            />
                          </figure>
                        </div>
                      ) : (
                        <div
                          className={`standard-upload-box mt-2`}
                          style={{ height: 177 }}
                        >
                          <FileDrop
                            className="mt-2"
                            onDrop={(f: any) => dropped(f)}
                          >
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
                              your files<br></br> For optimal view, we recommend
                              size 190px * 200px
                            </span>
                            <div className="d-flex justify-content-center gap-xs">
                              {!uploadFile?.name ? (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={filePicker}
                                >
                                  Browse
                                </button>
                              ) : (
                                <>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    type="button"
                                    onClick={() => {
                                      setUploadFile({
                                        ...uploadFile,
                                        name: "",
                                      });
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
                                  </button>
                                </>
                              )}
                            </div>
                            <input
                              value=""
                              style={{ display: "none", opacity: 0 }}
                              ref={fileBrowseRef}
                              type="file"
                              onChange={(e) => dropped(e.target.files)}
                            />
                          </FileDrop>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-boxes form-boxes bg-white">
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ marginBottom: "5px" }}
                  >
                    <h5 className="form-box_subtitle">Enable Assignments</h5>

                    <div className="d-flex align-items-center">
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={showAssignment}
                            onChange={(e) => {
                              setShowAssignment(e.target.checked);
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ marginBottom: "5px" }}
                  >
                    <h5 className="form-box_subtitle">Enable Folders</h5>

                    <div className="d-flex align-items-center">
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={showFolder}
                            onChange={(e) => {
                              setShowFolder(e.target.checked);
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ marginBottom: "5px" }}
                  >
                    <h5 className="form-box_subtitle">Enable Collaboration</h5>

                    <div className="d-flex align-items-center">
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={showCollab}
                            onChange={(e) => {
                              setShowCollab(e.target.checked);
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="form-box_subtitle">Enable member page</h5>

                    <div className="d-flex align-items-center">
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={showMembers}
                            onChange={(e) => {
                              setShowMembers(e.target.checked);
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {(user.role == "director" ||
            user.role == "admin" ||
            user.role == "support" ||
            classroom.user._id == user._id) && (
            <div className="d-flex justify-content-end gap-xs">
              <button className="btn btn-danger" onClick={remove}>
                Delete
              </button>
              <button
                className="btn btn-outline"
                onClick={() => openModal("saveAsTemplate", 3)}
              >
                Save As
              </button>
              <button
                className="btn btn-primary"
                onClick={() => save(classroom)}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </form>
      <Modal
        show={saveAsModal}
        onHide={() => setSaveAsModal(false)}
        backdrop="static"
        keyboard={false}
        // className="forgot-pass-modal"
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h1 className="form-box_title">Save As</h1>
          </div>
          <div className="modal-body">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                className="form-control border-bottom my-0"
                maxLength="50"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
                placeholder="Enter Classroom name"
                name="classroom_name"
                required
              />
              {/* {name.invalid && (name.dirty || name.touched || submitted) && (
                <div>
                    {name.errors.pattern && <p className="label label-danger text-danger">Name contains invalid characters.</p>}
                    {name.errors.required && <p className="label label-danger text-danger">Name is required</p>}
                    {name.errors.maxlength && <p className="label label-danger text-danger">Name must be smaller than 50 characters.</p>}
                    {name.errors.minlength && <p className="label label-danger text-danger">Name must be greater than 2 characters.</p>}
                </div>
            )} */}
              <div className="mt-2 pt-2 text-right">
                <button
                  className="btn btn-light mr-1"
                  onClick={() => cancel(3)}
                >
                  cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => saveAs(classroomName, 3)}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClassroomSettings;
