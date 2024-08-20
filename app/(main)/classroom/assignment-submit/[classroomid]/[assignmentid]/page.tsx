"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { error, success } from "alertifyjs";
import Link from "next/link";
import { toQueryString } from "@/lib/validator";
import { useRouter } from "next/navigation";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";

const ClassroomDetail = () => {
  const { classroomid, assignmentid } = useParams();
  const { user }: any = useSession()?.data || {};
  const { push } = useRouter();
  const fileBtn = useRef<any>(null);

  const [data, setData]: any = useState();
  const [assignment, setAssignment]: any = useState();
  const [editMode, setEditMode]: any = useState(false);
  const [isEvaluated, setIsEvaluated]: any = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments]: any = useState([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [ckeditorContent, onChangeContent] = useState("");

  let updateData: any = {
    answerText: "",
    title: "",
  };

  const getAssignmentDetail = async () => {
    if (!user) {
      return;
    }
    const params = {
      classroom: classroomid,
      assignment: assignmentid,
      student: user.info._id,
    };
    try {
      const data = (
        await clientApi.get(
          `/api/classrooms/getAssignmentById${toQueryString(params)}`
        )
      ).data;
      setData(data);

      const res = (
        await clientApi.get(
          `/api/classrooms/getUserAssignment${toQueryString(params)}`
        )
      ).data;
      if (res) {
        setEditMode(true);
        updateData.title = res.assignment.ansTitle;
        setAssignmentTitle(updateData.title);
        updateData.answerText = res.assignment.answerText;
        onChangeContent(updateData.answerText);
        setAttachments(res.assignment.attachments);
        setIsEvaluated(res.assignment.evaluated);
      }
      setAssignment(res);
    } catch (e) {
      // error("assignment fetching error!");
    }
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    const params = {
      classroom: classroomid,
      assignment: assignmentid,
      student: user.info._id,
    };
    if (editMode) {
      if (attachments.length > 0) {
        updateData["attachments"] = attachments;
      }
      let ep: any = { ...params };
      ep["answerText"] = ckeditorContent;
      ep["title"] = assignmentTitle;
      ep["attachments"] = attachments;
      try {
        const res = (
          await clientApi.put(`/api/classrooms/editStudentAssignment`, ep)
        ).data;
        alertify.success("Successfully Submitted");
        // push(
        //   `/classroom/user-assignment/${params.classroom}/${params.assignment}`
        // );
        push(`/classroom/details/${params.classroom}`);
      } catch (e) {
        console.log(e);
      }
      return;
    }
    if (attachments.length > 0) {
      updateData["attachments"] = attachments;
    }
    let p: any = { ...params };
    p["answerText"] = ckeditorContent;
    p["title"] = assignmentTitle;
    p["attachments"] = attachments;
    p["dueDate"] = data.assignment.dueDate;
    const res = (
      await clientApi.post(`/api/classrooms/updateStudentAssignment`, p)
    ).data;
    alertify.success("Successfully Submitted");
    push(
      // `/classroom/user-assignment/${params.classroom}/${params.assignment}?tab=assignments`
      `/classroom/details/${params.classroom}`
    );
  };
  const uploadDocument = async (e: any) => {
    setUploading(true);
    const file = fileBtn.current.files[0];
    const fileName = file.name;
    const toCheck = fileName.toLowerCase();
    if (
      !toCheck.endsWith(".text") &&
      !toCheck.endsWith(".txt") &&
      !toCheck.endsWith(".pdf") &&
      !toCheck.endsWith(".doc") &&
      !toCheck.endsWith(".docx")
    ) {
      alertify.alert("Message", "Please choose only text, pdf and word file.");
      setUploading(false);
      return;
    }

    try {
      const res = (await uploadFile(file, fileName, "assignment")).data;
      setAttachments([
        { type: "file", name: res.originalname, url: res.fileUrl },
      ]);
      setUploading(false);
      success("Uploaded Successfully");
    } catch (e) {
      setUploading(false);
      alertify.alert("Message", "upload failed");
    }
  };
  const removeDoc = (i: any) => {
    setAttachments(attachments.splice(i, 1));
  };
  const cancel = () => {
    push(`/classroom/details/${classroomid}?tab=assignments`);
  };

  useEffect(() => {
    getAssignmentDetail();
  }, [user]);

  return (
    <div>
      <div id="wrapper" className="bg-white">
        <div className="container">
          <div className="search-bar">
            <div id="wrap">
              <form>
                <div className="form-group">
                  <div className="arrow">
                    <a id="arrow" href="#">
                      <figure>
                        <img src="/assets/images/arrow-left.png" alt="" />
                      </figure>
                    </a>
                  </div>

                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="What're we looking for ?"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        <main className="pt-lg-3">
          <div className="container">
            <div className="assignment-content-wrap mx-auto">
              <div className="d-none d-lg-block">
                <div className="search m-0 pt-1">
                  <form>
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <div className="form-group mb-0 d-flex align-items-center w-auto float-none">
                          <button
                            type="reset"
                            className="close btn p-0"
                            onClick={() =>
                              push(
                                `/classroom/details/${classroomid}?tab=assignments`
                              )
                            }
                          >
                            <figure>
                              <img src="/assets/images/close.png" alt="" />
                            </figure>
                          </button>
                          <input
                            type="text"
                            disabled={true}
                            className="form-control border-0 bg-white"
                            value={data?.assignment.title}
                          />
                        </div>
                      </div>
                      <div className="col-auto ml-auto">
                        <div className="form-btn w-auto float-none">
                          <button
                            type="submit"
                            className="btn submit-response-btn mt-0 p-0 ml-auto"
                            onClick={(e) => onSubmit(e)}
                          >
                            Submit Response
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="assignment-content mx-auto">
                <div className="assignment-content-area pt-0">
                  <div className="title">
                    <input
                      type="text"
                      className="form-control border-0"
                      style={{ backgroundColor: "#F4F4F7" }}
                      placeholder="title"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                    />

                    <div className="box-btn">
                      <a>
                        <figure>
                          <img src="/assets/images/bx_bx-notepad.png" alt="" />
                        </figure>
                      </a>
                    </div>
                  </div>
                  <CKEditorCustomized
                    defaultValue={ckeditorContent}
                    onChangeCon={onChangeContent}
                  />
                  {uploading && (
                    <div>
                      Uploading...<i className="fa fa-pulse fa-spinner"></i>
                    </div>
                  )}

                  <div className="d-flex justify-content-between">
                    <div className="submit-response-btn edit">
                      <a className="px-2 text-center">
                        <span onClick={() => fileBtn?.current?.click()}>
                          Attach
                        </span>
                      </a>
                    </div>
                    <div className="d-block d-lg-none">
                      <div className="submit-response-btn">
                        <a
                          className="px-2 text-center"
                          onClick={(e) => onSubmit(e)}
                        >
                          Submit Response
                        </a>
                      </div>
                    </div>
                  </div>
                  <input
                    hidden
                    type="file"
                    ref={fileBtn}
                    accept="text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                            .jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
                    onChange={(e) => uploadDocument(e)}
                  />
                  {attachments.length > 0 && (
                    <div className="document-area">
                      {attachments.map((att: any, i: any) => {
                        return (
                          <div className="document border" key={i}>
                            <a href={att.url} target="_blank">
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
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ClassroomDetail;
