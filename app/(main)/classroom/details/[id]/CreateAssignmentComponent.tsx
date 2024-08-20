import React, { useEffect, useState, useRef } from "react";
import * as classroomService from "@/services/classroomService";
import * as authService from "@/services/auth";
import alertify from "alertifyjs";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateAssignmentComponent = ({
  classroom,
  setClassrom,
  user,
  assignment,
  getClientData,
  save,
}: any) => {
  const { id } = useParams();

  const docUploader = useRef(null);
  const datePickerRef = useRef(null);
  const [ckeOptionswithToolbar, setCkeOptionswithToolbar] = useState<any>({
    placeholder: "Share somethings...",
    simpleUpload: {
      // The URL that the images are uploaded to.
      uploadUrl: "/api/v1/files/discussionUpload?method=drop",

      // Enable the XMLHttpRequest.withCredentials property.
      withCredentials: true,

      // Headers sent along with the XMLHttpRequest to the upload server.
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(),
      },
    },
  });
  const [params, setParams] = useState<any>({
    classroom: "",
    assignment: "",
    student: "",
  });
  const [updateData, setUpdateData] = useState<any>({
    title: "",
    maximumMarks: 0,
    description: "",
    dueDate: null,
    status: "",
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<any>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [assignmentId, setAssignmentId] = useState<string>("");
  const [maxDate, setMaxDate] = useState<any>(new Date());

  useEffect(() => {
    const tmp = {
      ...params,
      classroom: classroom._id,
    };

    if (assignment) {
      tmp.assignment = assignment._id;
      setEditMode(true);
      classroomService.getAssignmentById(tmp).then((data: any) => {
        setUpdateData({
          ...data.assignment,
          dueDate: new Date(data.assignment.dueDate),
        });
        setAttachments(data.assignment.attachments);
      });
    } else {
      setEditMode(false);
    }
    setParams(tmp);
  }, [assignment]);

  const onSubmit = (status: any) => {
    if (
      !updateData.title ||
      !updateData.maximumMarks ||
      !updateData.dueDate ||
      !updateData.description
    ) {
      alertify.alert("Message", "Please fill the required field (*)");
      return;
    }
    if (attachments?.length > 0) {
      setUpdateData({
        ...updateData,
        attachments: attachments,
      });
    } else {
      setUpdateData({
        ...updateData,
        attachments: [],
      });
    }
    const ep: any = {};
    // ep['answerText'] = this.updateData.answerText;
    ep["title"] = updateData.title;
    ep["description"] = updateData.description;
    ep["maximumMarks"] = updateData.maximumMarks;
    ep["user"] = user._id;
    ep["status"] = status;
    ep["dueDate"] = updateData.dueDate;
    ep["attachments"] = attachments;
    const dataObj = { assignment: ep };

    if (status == "published") {
      alertify.confirm(
        "Are you sure you want to publish this assignment?",
        () => {
          classroomService
            .createAssignment(classroom._id, dataObj)
            .then((da) => {
              alertify.success("Created successfully");
              save();
            })
            .catch((err) => {
              console.log("Fetch error:", err);
            });
        }
      );
    } else {
      classroomService
        .createAssignment(params.classroom, dataObj)
        .then((da) => {
          alertify.success("Created successfully");
          save();
        })
        .catch((err) => {
          console.log("Fetch error:", err);
        });
    }
  };

  const cancel = () => {
    save();
  };

  const uploadDocument = async ($event: any) => {
    const session = await getSession();
    const apiVersion = "/api/v1";
    setUploading(true);
    const file = $event.target.files[0];
    const fileName = file.name;

    const formData: FormData = new FormData();
    formData.append("file", file, fileName);
    formData.append("uploadType", "assignment");
    clientApi
      .post(
        `${process.env.NEXT_PUBLIC_API}${apiVersion}/files/upload`,
        formData,
        {
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      )
      .then((res: any) => {
        setUploading(false);
        let tmp_attch;
        if (!attachments) {
          setAttachments([]);
          tmp_attch = [];
        } else {
          tmp_attch = attachments;
        }
        tmp_attch.push({
          type: "file",
          name: res.data.originalname,
          url: res.data.fileUrl,
        });
        setAttachments(tmp_attch);
        alertify.success("Uploaded successfully");
        // this.bsModalRef.hide();
      })
      .catch((error) => {
        // if (error.status === "200") {
        //   alertify.success("Uploaded successfully");
        // }
        console.log(error);
        alertify.success("upload failed");
      });
  };
  const removeDoc = (i: any) => {
    const newAttachments = [...attachments];
    newAttachments.splice(i, 1);
    setAttachments(newAttachments);
  };
  const update = () => {
    if (
      !updateData.title ||
      !updateData.maximumMarks ||
      !updateData.dueDate ||
      !updateData.description
    ) {
      alertify.alert("Message", "Please fill the required field (*)");
      return;
    }
    if (attachments?.length > 0) {
      setUpdateData({
        ...updateData,
        attachments: attachments,
      });
    } else {
      setUpdateData({
        ...updateData,
        attachments: [],
      });
    }

    const ep: any = {};
    // ep['answerText'] = this.updateData.answerText;
    ep["title"] = updateData.title;
    ep["description"] = updateData.description;
    ep["maximumMarks"] = updateData.maximumMarks;
    ep["user"] = user._id;
    ep["dueDate"] = updateData.dueDate;
    ep["attachments"] = attachments;
    if (editMode) {
      ep["status"] = updateData["status"];
    } else {
      ep["status"] = "draft";
    }

    classroomService.editTeacherAssignment(params, ep).then((da) => {
      save();
      alertify.success("Updated Successfully");
    });
  };

  const publish = (status: any) => {
    if (
      !updateData.title ||
      !updateData.maximumMarks ||
      !updateData.dueDate ||
      !updateData.description
    ) {
      alertify.alert("Message", "Please fill the required field (*)");
      return;
    }
    if (attachments?.length > 0) {
      setUpdateData({
        ...updateData,
        attachments: attachments,
      });
    } else {
      setUpdateData({
        ...updateData,
        attachments: [],
      });
    }
    const ep: any = {};
    ep["title"] = updateData.title;
    ep["description"] = updateData.description;
    ep["maximumMarks"] = updateData.maximumMarks;
    ep["user"] = user._id;
    ep["status"] = status;
    ep["dueDate"] = updateData.dueDate;
    ep["attachments"] = attachments;

    if (status == "published") {
      alertify.confirm(
        "Are you sure you want to publish this assignment?",
        () => {
          classroomService.editTeacherAssignment(params, ep).then((da) => {
            alertify.success("Updated Successfully");
            save();
          });
        }
      );
    } else {
      classroomService.editTeacherAssignment(params, ep).then((da) => {
        alertify.success("Updated Successfully");
        save();
      });
    }
  };
  return (
    <main className="pt-lg-3">
      <div className="container">
        <div className="dashboard-area classroom mx-auto">
          <div className="assignment-area">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">
                {editMode ? "Edit Assignment" : "Create Assignment"}
              </h3>
            </div>

            <div className="row">
              <div className="col-lg-6">
                <div className="rounded-boxes form-boxes class-board-remove bg-white pb-2">
                  <div className="class-board-info">
                    <div className="assign-marks">
                      <form>
                        <h3 className="form-box_subtitle pb-1">
                          Title <sup>*</sup>
                        </h3>
                        <input
                          type="text"
                          name="title"
                          placeholder="Title"
                          value={updateData.title}
                          onChange={(e) => {
                            setUpdateData({
                              ...updateData,
                              title: e.target.value,
                            });
                          }}
                        />
                      </form>
                      <hr />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="rounded-boxes form-boxes class-board-remove bg-white">
                  <div className="class-board-info">
                    <div className="date-pick">
                      <form>
                        <h3 className="form-box_subtitle">
                          Due Date <sup>*</sup>
                        </h3>
                        <div className="input-group align-items-center">
                          {/* <DatePicker
                            selected={updateData.dueDate}
                            onChange={(date) =>
                              setUpdateData({
                                ...updateData,
                                dueDate: date,
                              })
                            }
                            dateFormat="dd-MM-yyyy"
                            minDate={maxDate}
                            className="form-control"
                            placeholderText="Due Date"
                          /> */}
                          <DatePicker
                            ref={datePickerRef}
                            className="form-control date-picker"
                            selected={updateData.dueDate}
                            onChange={(date) =>
                              setUpdateData({
                                ...updateData,
                                dueDate: date,
                              })
                            }
                            minDate={maxDate}
                            dateFormat="dd-MM-yyyy "
                            placeholderText="Due Date"
                            popperPlacement="bottom-start"
                            popperModifiers={{
                              preventOverflow: {
                                enabled: true,
                                escapeWithReference: false,
                                boundariesElement: "viewport",
                              },
                            }}
                          />
                          <div className="input-group-append ml-0">
                            <i
                              className="far fa-calendar-alt text-black"
                              onClick={() => {
                                if (datePickerRef.current) {
                                  datePickerRef.current.input.focus();
                                }
                              }}
                            ></i>
                          </div>
                        </div>
                      </form>
                      <hr />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="rounded-boxes form-boxes class-board-remove bg-white">
                  <div className="class-board-info">
                    <div className="assign-marks">
                      <form>
                        <h3 className="form-box_subtitle pb-1">
                          Total Marks <sup>*</sup>
                        </h3>
                        <input
                          type="text"
                          name="maximumMarks"
                          placeholder="Marks"
                          value={updateData.maximumMarks}
                          onChange={(e) => {
                            setUpdateData({
                              ...updateData,
                              maximumMarks: e.target.value,
                            });
                          }}
                        />
                      </form>
                      <hr />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="assignment mx-auto">
              <div className="assignment-content-area py-0">
                <div className="rounded-boxes form-boxes box1-remove bg-white class-ck">
                  <sup className="text-right d-block">
                    <b>*</b>
                  </sup>
                  {editMode ? (
                    <CKEditorCustomized
                      defaultValue={updateData.description}
                      onChangeCon={(data) => {
                        if (updateData.title) {
                          setUpdateData({
                            ...updateData,
                            description: data,
                          });
                        }
                      }}
                      config={{
                        placeholder: "Share something...",
                        mediaEmbed: {
                          previewsInData: true,
                        },
                      }}
                    />
                  ) : (
                    <CKEditorCustomized
                      defaultValue={updateData.description}
                      onChangeCon={(data) => {
                        setUpdateData({
                          ...updateData,
                          description: data,
                        });
                      }}
                      config={{
                        placeholder: "Share something...",
                        mediaEmbed: {
                          previewsInData: true,
                        },
                      }}
                    />
                  )}
                </div>

                <input
                  hidden
                  type="file"
                  accept=".txt, .pdf, .doc, .docx, .jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff"
                  ref={docUploader}
                  onChange={(e) => uploadDocument(e)}
                />

                <div className="document-area">
                  {attachments &&
                    attachments?.length > 0 &&
                    attachments.map((att, i) => (
                      <div className="document" key={i}>
                        <a
                          href={`https://www.practiz.xyz${att.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>{att.name}</span>
                        </a>
                        {!isEvaluated && (
                          <a className="close" onClick={() => removeDoc(i)}>
                            <figure>
                              <img src="/assets/images/close3.png" alt="" />
                            </figure>
                          </a>
                        )}
                      </div>
                    ))}
                </div>

                <div className="row">
                  <div className="col">
                    <span className="submit-response-btn edit mt-0">
                      <a
                        className="px-2 text-center"
                        onClick={() => docUploader.current.click()}
                      >
                        <span>Attach</span>
                      </a>
                    </span>
                  </div>
                  <div className="col-auto ml-auto">
                    <a className="btn btn-light" onClick={cancel}>
                      Cancel
                    </a>

                    {updateData.status !== "published" && editMode && (
                      <a
                        className="btn btn-success ml-1"
                        onClick={() => publish("published")}
                        // onClick={() => onSubmit("published")}
                      >
                        Publish
                      </a>
                    )}
                    {updateData.status !== "published" && !editMode && (
                      <a
                        className="btn btn-success ml-1"
                        onClick={() => onSubmit("published")}
                      >
                        Publish
                      </a>
                    )}

                    {editMode && (
                      <a className="btn btn-primary ml-1" onClick={update}>
                        Update
                      </a>
                    )}
                    {!editMode && (
                      <a
                        className="btn btn-primary ml-1"
                        onClick={() => onSubmit("draft")}
                      >
                        Save
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateAssignmentComponent;
