import React, { useEffect, useState, useRef } from "react";
import * as classroomService from "@/services/classroomService";
import * as authService from "@/services/auth";
import * as userService from "@/services/userService";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import alertify from "alertifyjs";
import MathJax from "@/components/assessment/mathjax";
import { avatar } from "@/lib/pipe";
import { useSession } from "next-auth/react";
import Editor from "@/public/assets/ckeditor/build/ckeditor";
import { CKEditor } from "@ckeditor/ckeditor5-react";

const Submission = ({
  classroom,
  setClassrom,
  user,
  assignment,
  currentStudent,
  settings,
  save,
}: any) => {
  const { data } = useSession();
  const [dat, setDat] = useState<any>(null);
  const [params, setParams] = useState<any>({
    classroom: "",
    assignment: "",
    student: "",
  });
  const [activeEditor, setActiveEditor] = useState<any>();
  const [editorChanged, setEditorChanged] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<any>({
    answerText: "",
    title: "",
    totalMark: 0,
    feedback: {
      _id: "",
      text: "",
    },
  });
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<any>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [maxMarks, setMaxMarks] = useState<number>(0);
  const [token, setToken] = useState<string>("");
  const [student, setStudent] = useState<any>({});
  const [ckeOptionswithToolbar, setCkeOptionswithToolbar] = useState<any>({
    placeholder: "Feddback...",
    simpleUpload: {
      uploadUrl: "/api/ckeditor/image-upload",
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + data?.accessToken,
      },
    },
  });
  const ckeditorPreventPaste = (evt: any, data: any) => {
    evt.preventDefault();
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
  useEffect(() => {
    if (activeEditor) {
      activeEditor?.model.document.off("change:data", ckeditorChangeData);
      activeEditor.ui.focusTracker.off("change:data", ckeditorChangeData);
      activeEditor.plugins
        .get("ClipboardPipeline")
        .off("inputTransformation", ckeditorPreventPaste);
    }
    setParams({
      ...params,
      classroom: classroom._id,
      assignment: assignment._id,
      student: currentStudent._id,
    });

    const para = {
      ...params,
      classroom: classroom._id,
      assignment: assignment._id,
      student: currentStudent._id,
    };

    userService.getUser(currentStudent._id).then((a) => {
      setStudent(a);
    });

    classroomService.getUserAssignment(para).then((res: any) => {
      if (res) {
        setEditMode(true);
        setUpdateData({
          ...updateData,
          title: res.assignment.ansTitle,
          answerText: res.assignment.answerText,
          totalMark: res.assignment.totalMark,
          feedback: {
            ...updateData.feedback,
            text: res.assignment.feedback.text,
          },
        });
        setFeedbackText(res.assignment.feedback.text);
        setAttachments(res.assignment.attachments);
        setIsEvaluated(res.assignment.evaluated);
      }
    });
    classroomService.getAssignmentById(para).then((data) => {
      setDat(data);
      setMaxMarks(data.assignment.maximumMarks + 1);
    });
  }, []);

  const ckeditorChangeData = (ev: any) => {
    setEditorChanged(true);
  };

  const onSubmit = () => {
    if (editMode) {
      if (attachments.length > 0) {
        setUpdateData((prevState) => ({
          ...prevState,
          attachments: attachments,
        }));
      }
      if (updateData.totalMark > dat.assignment.maximumMarks) {
        alertify.alert(
          "Messaeg",
          "You can not assign Marks more than Total Marks"
        );
        return;
      }
      const ep = { ...params };
      ep["totalMark"] = updateData.totalMark;
      ep["feedback"] = { _id: user._id, text: feedbackText };
      classroomService.assignAssignmentMarks(ep).then((da) => {
        alertify.success("Evaluated");

        save(true);
      });
      return;
    }
  };
  return (
    <main className="pt-lg-3">
      <div className="container">
        <div className="dashboard-area classroom mx-auto">
          <div className="d-none d-lg-block">
            <div className="rounded-boxes less-padding-x class-board assignment bg-white">
              <div className="d-flex">
                {student && (
                  <figure className="squared-rounded_wrap_80">
                    <img src={avatar(student)} alt="image" />
                  </figure>
                )}
                <div className="class-board-info ml-3 mt-2">
                  <h3>{student.name}</h3>
                  <p>
                    <span>{student.email}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-boxes less-padding-x area mb-5 bg-white">
            <div id="headingFourteen">
              <div className="row">
                <h3 className="f-16 text-black col-lg-10">
                  {dat?.assignment.title}
                </h3>
                <strong className="col-lg-2">
                  Total marks <mark>{dat?.assignment.maximumMarks}</mark>
                </strong>
              </div>
              <br />
              <h6>
                <table className="table mb-0">
                  <tr>
                    <td className="border-0 p-0">
                      <div className="number">
                        <span></span>
                      </div>
                    </td>
                    <td className="border-0 p-0">
                      <div className="ques">
                        <span style={{ fontWeight: 300, fontSize: "16px" }}>
                          <MathJax value={dat?.assignment.description} />
                        </span>
                      </div>
                    </td>
                    <td className="border-0 p-0"></td>
                    <td className="border-0 p-0">
                      <div className="average-time">
                        <span></span>
                      </div>
                    </td>
                  </tr>
                </table>
              </h6>
            </div>
          </div>

          <div className="selection-wrap p-0 mt-0">
            <div className="rounded-boxes less-padding-x bg-white">
              <div className="px-0">
                <h6 className="f-16 text-black mb-2">
                  Student&apos;s Response
                </h6>
                <h6 className="text-black">{updateData.title}</h6>
                <table className="table mb-0">
                  <tr>
                    <td className="border-0 p-0">
                      <div className="number">
                        <span></span>
                      </div>
                    </td>
                    <td className="border-0 p-0">
                      <div className="ques">
                        <span style={{ fontWeight: 300 }}>
                          <MathJax value={updateData.answerText} />
                        </span>
                      </div>
                    </td>
                    <td className="border-0 p-0"></td>
                    <td className="border-0 p-0">
                      <div className="average-time">
                        <span></span>
                      </div>
                    </td>
                  </tr>
                </table>
                <div className="document-area">
                  {attachments.length > 0 &&
                    attachments.map((att, i) => (
                      <div key={i} className="document border border-rounded">
                        <a
                          href={`https://www.practiz.xyz${att.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>{att.name}</span>
                        </a>
                        {!isEvaluated && (
                          <a className="close" onClick={() => removeDoc(i)}></a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <hr />

            <div className="rounded-boxes less-padding-x class-board assignment bg-white">
              <form className="form-boxes">
                <h4 className="form-box_title">Teacher Evaluation</h4>
                <div className="col-lg-6 mt-2">
                  <div className="row align-items-center">
                    <h4 className="form-box_subtitle d-inline-block mr-3">
                      Enter marks
                    </h4>
                    <span>
                      <input
                        type="number"
                        className="border-0 p-2"
                        style={{ backgroundColor: "#F4F4F7" }}
                        placeholder="Marks"
                        max={maxMarks}
                        value={updateData.totalMark}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (value <= maxMarks) {
                            setUpdateData({
                              ...updateData,
                              totalMark: value,
                            });
                          }
                        }}
                      />
                    </span>
                  </div>
                </div>
              </form>

              <hr />
              <div className="assignment mx-auto">
                <div className="assignment-content-area py-0">
                  <div className="box1 bg-white mb-3 p-0 min-h-auto class-ck">
                    <CKEditorCustomized
                      defaultValue={feedbackText || ""}
                      onChangeCon={(e: any) => {
                        setFeedbackText(e);
                      }}
                      config={ckeOptionswithToolbar}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <div className="withdraw-evaluate">
                    <a className="text-center" onClick={() => save(false)}>
                      Cancel
                    </a>
                  </div>
                  {!isEvaluated && (
                    <a className="btn btn-primary" onClick={onSubmit}>
                      Submit
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Submission;
