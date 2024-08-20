import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {} from "@/services/auth";
import {
  editContentInSection,
  addSection,
  deleteContent,
  updateCourseContent,
  deleteSection,
} from "@/services/courseService";
import { getContentById } from "@/services/contentService";
import { alert, success, confirm } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import {
  Button,
  Card,
  Form,
  Row,
  Col,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import {
  embedVideo,
  getElearningFullPath,
  bypassSecurityTrustHtml,
} from "@/lib/helpers";
import VideoPlayer from "../video-player";
import ContentRenderer from "../content-renderer";
import Mathjax from "@/components/assessment/mathjax";
import SectionReviewComponent from "@/components/course/section-review/SectionReview";
import ElearningEditorComponent from "./ElearingEditor";
import NoteEditorComponent from "./NoteEditor";
import AssessmentEditorComponent from "./AssessmentEditor";
import QuizEditorComponent from "./QuizEditor";

const SectionEditorComponent = ({
  user,
  settings,
  section,
  setSection,
  course,
  setCourse,
  Update,
  Cancel,
}: any) => {
  const isDraftMode = false;
  const router = useRouter();

  const [view, setView] = useState({
    note: false,
    quiz: false,
    assessment: false,
    attachments: false,
  });

  const newContent: {
    summary: string;
    title: string;
    type: string;
    // this points to the source of content (either practicesetId or contentId)
    source: string;
    duration: string;
    note: any[];
    link: string;
    active: boolean;
  }[] = [
    {
      summary: "",
      title: "",
      type: "",
      // this points to the source of content (either practicesetId or contentId)
      source: "",
      duration: "",
      note: [],
      link: "",
      active: true,
    },
  ];

  const [editingSection, setEditingSection] = useState<any>([]);
  const [editMode, setEditMode] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [editingContent, setEditingContent] = useState<any>([]);
  const [sectionReview, setSectionReview] = useState(false);

  useEffect(() => {
    const editingSectionData = { ...section };
    setEditingSection(editingSectionData);
    setEditMode(!!section._id);
    if (!!section._id) {
      if (section.contents) {
        const updatedContents = countQuestionByCategory(section.contents);
        setSection({
          ...section,
          contents: updatedContents,
        });
      }
    }
  }, []);

  const openNewContent = (type: any) => {
    setEditingContent({
      summary: "",
      title: "",
      type: type == "attachments" ? "video" : type,
      // this points to the source of content (either practicesetId or contentId)
      source: null,
      duration: "",
      note: [],
      url: "",
      active: true,
      isNew: true,
    });
  };

  const updateData = async () => {
    if (!editingSection.title) {
      alert("Message", "Please add Chapter Name");
      return;
    }

    setSavingSection(true);
    let editingSectionData = editingSection;
    if (editMode) {
      editContentInSection(course._id, section._id, editingSectionData).then(
        (d: any) => {
          const currSection = d.sections.filter(
            (t: any) => t._id === section._id
          );
          const updateContents = countQuestionByCategory(
            currSection[0].contents
          );
          editingSectionData.contents = [...updateContents];
          setSection({ ...section, contents: updateContents });
          setView({
            ...view,
            note: false,
            quiz: false,
            attachments: false,
            assessment: false,
          });

          Update();

          success("Content Updated");
          setTimeout(() => {
            setSavingSection(false);
          }, 500);
        },
        (err) => {
          alert("Message", "Please Add Again");
          setSavingSection(false);
          console.log(err);
        }
      );
    } else {
      addSection(course._id, editingSection)
        .then((data: any) => {
          setView({
            ...view,
            note: false,
            quiz: false,
            attachments: false,
            assessment: false,
          });
          setSection(data);
          setEditingSection(data);

          const sectionData = course.sections || [];
          sectionData.push(data);

          setCourse({
            ...course,
            sections: [...sectionData],
          });
          setEditMode(true);

          Update();

          success("Added");
          setTimeout(() => {
            setSavingSection(false);
          }, 500);
        })
        .catch((err) => {
          setSavingSection(false);
          alert("Message", "Please try again");
        });
    }
  };

  const drop = (event: any) => {
    // moveItemInArray(editingSection.contents, event.previousIndex, event.currentIndex);
  };

  const deleteContentFunction = (i: any) => {
    if (
      editingSection.contents.length == 1 &&
      editingSection.status == "published"
    ) {
      alert("Message", "This is last content, you can not delete it.");
      return;
    }
    confirm("Are you sure to delete this content?", () => {
      const contentId = editingSection.contents[i]._id;
      if (contentId) {
        deleteContent(course._id, contentId)
          .then((d: any) => {
            setSection({
              ...editingSection,
              contents: editingSection.contents.splice(i, 1),
            });
            success("Successfully deleted");
          })
          .catch((err: any) => {
            alert("Message", "Unable to delete it. Please try again later!!");
          });
      } else {
        setSection({
          ...editingSection,
          contents: editingSection.contents.splice(i, 1),
        });
      }
    });
  };

  const deleteSectionFunction = () => {
    confirm("Are you sure to delete this Chapter?", () => {
      deleteSection(course._id, section._id).then((d: any) => {
        const idx = course.sections.findIndex(
          (sec: any) => sec._id == section._id
        );
        if (idx > -1) {
          setCourse({
            ...course,
            sections: course.sections.splice(idx, 1),
          });
        }
        Update();
        onCancel();
      });
    });
  };

  const onCancel = () => {
    Cancel();
  };

  const viewTest = (id: any) => {
    if (!editMode && !section._id) {
      alert("Message", "You may lose the data please save the Chapter first!!");
      return;
    }
    if (
      editingSection &&
      editingSection.contents &&
      editingSection.contents.length > 0
    ) {
      const d = editingSection.contents.filter((t: any) => !t._id);
      if (d && d.length > 0) {
        alert(
          "Message",
          "You may lose the data please save the Chapter first!!"
        );
        return;
      }
    }
    router.push(
      `/assessment/details/${id}${toQueryString({
        isCourse: true,
        course: course._id,
        section: section._id,
      })}`
    );
  };

  const byPassSecurity = (arr: any) => {
    let results = [];
    if (arr.length > 0) {
      results = arr.map((d: any) => {
        const data = d;
        if (data.contentType == "video") {
          if (data.url) {
            data.url = embedVideo(data.url);
          } else {
            data.local = true;
            data.url = embedVideo(
              getElearningFullPath(settings.baseUrl, data.filePath)
            );
          }
        } else if (data.contentType == "ebook") {
          let url = data.url;
          if (data.filePath) {
            url = getElearningFullPath(settings.baseUrl, data.filePath);
          }
          data.url = url;
        }

        return data;
      });
    }
    return results;
  };

  const saveNewContent = (data?: any) => {
    const editingContentData = data;
    editingContentData.isNew = false;
    let sectionContentData = editingSection.contents || [];
    sectionContentData.push(editingContentData);
    const updatedContent = countQuestionByCategory(sectionContentData);

    setEditingContent({
      ...editingContent,
      isNew: false,
    });
    setEditingSection({
      ...editingSection,
      contents: updatedContent,
    });
    cancelNewContent();
  };

  const cancelNewContent = () => {
    setEditingContent([]);
  };

  const viewContent = (i: any) => {
    setEditingSection((prevEditingSection: any) => ({
      ...prevEditingSection,
      contents: prevEditingSection.contents.map((content: any, index: any) =>
        index === i ? { ...content, viewing: true } : content
      ),
    }));
  };

  const cancelViewContent = (i: any) => {
    setEditingSection((prevEditingSection: any) => ({
      ...prevEditingSection,
      contents: prevEditingSection.contents.map((content: any, index: any) =>
        index === i ? { ...content, viewing: false } : content
      ),
    }));
  };

  const optionalChange = (i: any, value: boolean) => {
    setEditingSection((prevEditingSection: any) => ({
      ...prevEditingSection,
      contents: prevEditingSection.contents.map((content: any, index: any) =>
        index === i ? { ...content, optional: value } : content
      ),
    }));
  };

  const viewVideoContent = (item: any, i: any) => {
    if (item.url) {
      setEditingSection((prevEditingSection: any) => ({
        ...prevEditingSection,
        contents: prevEditingSection.contents.map((content: any, index: any) =>
          index === i
            ? { ...content, embedUrl: embedVideo(item.url), viewing: true }
            : { ...content }
        ),
      }));
    } else if (item.source) {
      getContentById(item.source).then(
        (video: any) => {
          if (video.filePath) {
            video.url = getElearningFullPath(settings.baseUrl, video.filePath);
            item.local = true;
          }

          setEditingSection((prevEditingSection: any) => ({
            ...prevEditingSection,
            contents: prevEditingSection.contents.map(
              (content: any, index: any) =>
                index === i
                  ? {
                      ...content,
                      embedUr: embedVideo(item.url),
                      url: video.url,
                      viewing: true,
                    }
                  : content
            ),
          }));
        },
        (err) => {
          alert("Message", "Not Found");
        }
      );
    }
  };

  const editContent = (i: any) => {
    console.log(i, editingSection.contents);
    setEditingSection((prevEditingSection: any) => ({
      ...prevEditingSection,
      contents: prevEditingSection.contents.map((content: any, index: any) =>
        index === i ? { ...content, editing: true } : { ...content }
      ),
    }));
  };

  const cancelEditingContent = (i: any) => {
    setEditingSection((prevEditingSection: any) => ({
      ...prevEditingSection,
      contents: prevEditingSection.contents.map((content: any, index: any) =>
        index === i ? { ...content, editing: false } : content
      ),
    }));
  };

  const updateContent = async (data?: any) => {
    let contentsData = editingSection.contents;
    try {
      if (data._id) {
        await updateCourseContent(course._id, data);
      }

      success("Successfully updated");

      contentsData = contentsData.map((content: any) =>
        content._id === data._id
          ? { ...content, editing: false, viewing: false }
          : content
      );

      if (data.type == "quiz" || data.type == "assessment") {
        contentsData = countQuestionByCategory(contentsData);
      }

      setEditingSection({
        ...editingSection,
        contents: contentsData,
      });

      setCourse((prev: any) => {
        let newArray = { ...prev };
        newArray.sections = newArray.sections.map((section: any) => {
          if (section._id === editingSection._id) {
            return {
              ...section,
              contents: contentsData,
            };
          }
          return section;
        });
        return newArray;
      });
    } catch (ex) {
      console.log(ex);
      alert("Message", "Fail to update content");
    }
  };

  const viewEbookContent = (item: any, i: any) => {
    if (item.source) {
      getContentById(item.source).then(
        (pdf: any) => {
          const p = byPassSecurity([pdf]);
          setEditingSection((prevEditingSection: any) => ({
            ...prevEditingSection,
            contents: prevEditingSection.contents.map(
              (content: any, index: any) =>
                index === i
                  ? {
                      ...content,
                      viewing: true,
                      url: p[0].url,
                      embedUrl: bypassSecurityTrustHtml(
                        "<object data='" +
                          item.url +
                          "' type='application/pdf' class='embed-responsive-item' style='min-height:600px; width: 100%;'>" +
                          "Object " +
                          item.url +
                          " failed" +
                          "</object>"
                      ),
                    }
                  : content
            ),
          }));
        },
        (err) => {
          alert("Message", "Not Found");
        }
      );
    } else {
      setEditingSection((prevEditingSection: any) => ({
        ...prevEditingSection,
        contents: prevEditingSection.contents.map((content: any, index: any) =>
          index === i
            ? {
                ...content,
                viewing: true,
                embedUrl: bypassSecurityTrustHtml(
                  "<object data='" +
                    item.url +
                    "' type='application/pdf' class='embed-responsive-item' style='min-height:600px; width: 100%;'>" +
                    "Object " +
                    item.url +
                    " failed" +
                    "</object>"
                ),
              }
            : content
        ),
      }));
    }
  };

  const countQuestionByCategory = (contents: any) => {
    contents.forEach((e: any) => {
      if (e.type == "quiz" || e.type == "assessment") {
        e.mcq = 0;
        e.mixmatch = 0;
        e.code = 0;
        e.des = 0;
        e.totalQuestion = 0;
        e.fib = 0;

        if (e.questions) {
          for (let i = 0; i < e.questions.length; i++) {
            if (!e.questions[i]) {
              continue;
            }
            if (e.questions[i].category == "mcq") {
              e.mcq++;
            }
            if (e.questions[i].category == "mixmatch") {
              e.mixmatch++;
            }
            if (e.questions[i].category == "fib") {
              e.fib++;
            }
            if (e.questions[i].category == "descriptive") {
              e.des++;
            }
            if (e.questions[i].category == "code") {
              e.code++;
            }
            e.totalQuestion++;
          }
        }
      }
    });
    return contents;
  };

  const onReview = () => {
    setSectionReview(true);
  };

  const cancelSectionReview = () => {
    setSectionReview(false);
  };

  return (
    <>
      {!sectionReview ? (
        <div className="course-curriculum-area ml-auto">
          <div className="row align-items-center mb-3">
            <div className="col">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">
                  {editMode ? "Edit" : "Add"} Chapter
                </h3>
              </div>
            </div>

            <div className="col-auto ml-auto">
              <div className="d-flex justify-content-end gap-xs">
                <button className="btn btn-outline" onClick={onReview}>
                  <i className="fas fa-scroll mr-1"></i>Review
                </button>
                <button className="btn btn-outline" onClick={onCancel}>
                  Cancel
                </button>
                {editingSection &&
                  editingSection.status === "draft" &&
                  editingSection._id && (
                    <button
                      className="btn btn-danger"
                      onClick={deleteSectionFunction}
                    >
                      Delete
                    </button>
                  )}
                <button
                  className={`btn btn-primary ${
                    savingSection ? "disabled" : ""
                  }`}
                  onClick={updateData}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-boxes form-boxes course-setting-box bg-white">
            <form>
              <h4 className="form-box_subtitle">Name</h4>
              <input
                type="text"
                name="title"
                placeholder="Enter Chapter name"
                defaultValue={editingSection.title}
                onChange={(e: any) => {
                  setEditingSection({
                    ...editingSection,
                    title: e.target.value,
                  });
                }}
                className="form-control border-bottom rounded-0"
              />
            </form>
          </div>

          <div className="rounded-boxes form-boxes course-setting-box bg-white">
            <form>
              <h4 className="form-box_subtitle">Add Label</h4>
              <input
                type="text"
                name="name"
                placeholder="Enter Label"
                defaultValue={editingSection.name}
                onChange={(e: any) => {
                  setEditingSection({
                    ...editingSection,
                    name: e.target.value,
                  });
                }}
                className="form-control border-bottom rounded-0"
              />
            </form>
          </div>

          <div className="rounded-boxes form-boxes course-setting-box bg-white">
            <form>
              <h4 className="form-box_subtitle">Description</h4>
              <input
                type="text"
                name="summary"
                placeholder="Write Description"
                defaultValue={editingSection.summary}
                onChange={(e: any) => {
                  setEditingSection({
                    ...editingSection,
                    summary: e.target.value,
                  });
                }}
                className="form-control border-bottom rounded-0"
              />
            </form>
          </div>

          {editingSection.status === "draft" && (
            <div className="rounded-boxes form-boxes course-setting-box bg-white">
              <div>
                <div className="d-flex">
                  <h4 className="form-box_subtitle">Sections</h4>
                  &nbsp;&nbsp;
                  {editingContent && editingContent.hasChanges && (
                    <em>(*save your changes to continue)</em>
                  )}
                </div>
                <ul
                  className="nav nav-pills content-type-header"
                  role="tablist"
                >
                  <li className="tab-item nav-item">
                    <a
                      className={`nav-link ${
                        editingContent && editingContent.type === "note"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => openNewContent("note")}
                      role="tab"
                      aria-selected={
                        editingContent && editingContent.type === "note"
                      }
                    >
                      <img
                        src={`/assets/images/${
                          view.note ? "note-icon-blue.png" : "note-icon.svg"
                        }`}
                        alt="icon"
                      />
                      <h5 className="ques-type-click">Notes</h5>
                    </a>
                  </li>

                  <li className="tab-item nav-item">
                    <a
                      className={`nav-link ${
                        editingContent && editingContent.type === "quiz"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => openNewContent("quiz")}
                      role="tab"
                      aria-selected={
                        editingContent && editingContent.type === "quiz"
                      }
                    >
                      <img
                        src={`/assets/images/${
                          view.quiz ? "quiz-icon-blue.png" : "quiz-icon.svg"
                        }`}
                        alt="icon"
                      />
                      <h5 className="ques-type-click">Quiz</h5>
                    </a>
                  </li>

                  <li className="tab-item nav-item">
                    <a
                      className={`nav-link ${
                        editingContent && editingContent.type === "assessment"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => openNewContent("assessment")}
                      role="tab"
                      aria-selected={
                        editingContent && editingContent.type === "assessment"
                      }
                    >
                      <img
                        src={`/assets/images/${
                          view.assessment
                            ? "assessment-icon-blue.png"
                            : "assessment-icon.svg"
                        }`}
                        alt="icon"
                      />
                      <h5 className="ques-type-click">Assessment</h5>
                    </a>
                  </li>

                  <li className="tab-item nav-item">
                    <a
                      className={`nav-link ${
                        editingContent &&
                        (editingContent.type === "video" ||
                          editingContent.type === "ebook")
                          ? "active"
                          : ""
                      }`}
                      onClick={() => openNewContent("attachments")}
                      role="tab"
                      aria-selected={
                        editingContent &&
                        (editingContent.type === "video" ||
                          editingContent.type === "ebook")
                      }
                    >
                      <img
                        src={`/assets/images/${
                          view.attachments
                            ? "pdf-icon-blue.png"
                            : "bx_bx-library.svg"
                        }`}
                        alt="icon"
                      />
                      <h5 className="ques-type-click">Video / eBook</h5>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {editingContent && editingContent?.type === "note" && (
            <NoteEditorComponent
              user={user}
              settings={settings}
              course={course}
              section={editingSection}
              setSection={setEditingSection}
              content={editingContent}
              setContent={setEditingContent}
              Save={saveNewContent}
              Cancel={cancelNewContent}
            />
          )}
          {editingContent &&
            (editingContent?.type == "video" ||
              editingContent?.type == "ebook") && (
              <ElearningEditorComponent
                settings={settings}
                content={editingContent}
                setContent={setEditingContent}
                course={course}
                Save={saveNewContent}
                Cancel={cancelNewContent}
              />
            )}
          {editingContent && editingContent?.type === "quiz" && (
            <QuizEditorComponent
              section={editingSection}
              content={editingContent}
              course={course}
              Save={saveNewContent}
              Cancel={cancelNewContent}
            />
          )}
          {editingContent && editingContent?.type === "assessment" && (
            <AssessmentEditorComponent
              section={editingSection}
              content={editingContent}
              course={course}
              Save={saveNewContent}
              Cancel={cancelNewContent}
            />
          )}

          <div>
            {editingSection?.contents?.map((item: any, i: number) => (
              <div key={i}>
                {item.editing ? (
                  <div>
                    {item.type === "note" && (
                      <NoteEditorComponent
                        user={user}
                        settings={settings}
                        course={course}
                        section={editingSection}
                        setSection={setEditingSection}
                        content={item}
                        Save={updateContent}
                        Cancel={() => cancelEditingContent(i)}
                      />
                    )}

                    {(item.type === "video" || item.type === "ebook") && (
                      <ElearningEditorComponent
                        settings={settings}
                        content={item}
                        setContent={setEditingContent}
                        course={course}
                        Save={updateContent}
                        Cancel={() => cancelEditingContent(i)}
                      />
                    )}

                    {item.type === "quiz" && (
                      <QuizEditorComponent
                        section={editingSection}
                        content={editingContent}
                        course={course}
                        Save={updateContent}
                        Cancel={() => cancelEditingContent(i)}
                      />
                    )}

                    {item.type === "assessment" && (
                      <AssessmentEditorComponent
                        section={editingSection}
                        content={editingContent}
                        course={course}
                        Save={updateContent}
                        Cancel={() => cancelEditingContent(i)}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    {item.type === "note" && (
                      <div className="rounded-boxes bg-white">
                        <div className="form-row justify-content-between">
                          <div className="col-md col-12 d-flex align-items-center">
                            <div className="d-flex align-items-center">
                              <span className="material-icons cursor-pointer">
                                drag_indicator
                              </span>
                              <h6 className="text-capitalize text-dark">
                                {item.type}:{" "}
                              </h6>
                              <span className="iconc-content ml-4"></span>
                              <span>{item.title}</span>
                            </div>
                          </div>
                          <div className="col-md-auto ml-auto col-12 text-right mt-md-0 mt-2">
                            {item.viewing ? (
                              <>
                                <button
                                  onClick={() => cancelViewContent(i)}
                                  className="btn btn-light btn-sm ml-2"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => editContent(i)}
                                  className="btn btn-primary btn-sm ml-2"
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <>
                                {editingSection.status === "draft" && (
                                  <button
                                    onClick={() => deleteContentFunction(i)}
                                    className="btn btn-danger btn-sm ml-2"
                                  >
                                    Delete
                                  </button>
                                )}
                                <button
                                  onClick={() => viewContent(i)}
                                  className="btn btn-primary btn-sm ml-2"
                                >
                                  View
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {!item.viewing && (
                          <div className="d-flex align-items-center justify-content-end mt-2">
                            Optional&nbsp;&nbsp;
                            <label className="switches m-0">
                              <input
                                type="checkbox"
                                defaultChecked={item.optional}
                                onChange={(e) =>
                                  optionalChange(i, e.target.checked)
                                }
                                name={`chkOptional${i}`}
                              />
                              <span className="sliders round"></span>
                            </label>
                          </div>
                        )}
                        {item.viewing && (
                          <>
                            <div className="border rounded p-2 m-2 mx-3 bg-white box-height">
                              <ContentRenderer _content={item.note} />
                            </div>
                            <div className="border rounded p-2 m-2 mx-3 bg-white box-height">
                              <h2 className="text-dark">Summary</h2>
                              <Mathjax value={item.summary} />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {item.type === "video" && (
                      <div className="rounded-boxes bg-white">
                        <div className="form-row justify-content-between align-items-center">
                          <span className="material-icons cursor-pointer">
                            drag_indicator
                          </span>
                          <div className="col d-flex align-items-center">
                            <div className="form-row align-items-center">
                              <div className="col-auto d-flex align-items-center">
                                <h6 className="text-capitalize text-dark">
                                  {item.type}:{" "}
                                </h6>
                                <span className="iconc-video ml-4"></span>
                              </div>
                              <div className="col">
                                <span>{item.title}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-auto ml-auto col-12 text-right mt-md-0 mt-2">
                            {item.viewing ? (
                              <>
                                <button
                                  onClick={() => cancelViewContent(i)}
                                  className="btn btn-light btn-sm ml-1"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => editContent(i)}
                                  className="btn btn-primary btn-sm ml-1"
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <>
                                {editingSection.status === "draft" && (
                                  <button
                                    onClick={() => deleteContentFunction(i)}
                                    className="btn btn-danger btn-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                                <button
                                  onClick={() => viewVideoContent(item, i)}
                                  className="btn btn-primary btn-sm ml-1"
                                >
                                  View
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {!item.viewing && (
                          <div className="d-flex align-items-center justify-content-end mt-2">
                            Optional&nbsp;&nbsp;
                            <label className="switches m-0">
                              <input
                                type="checkbox"
                                checked={item.optional}
                                onChange={(e) =>
                                  optionalChange(i, e.target.checked)
                                }
                                name={`chkOptional${i}`}
                              />
                              <span className="sliders round"></span>
                            </label>
                          </div>
                        )}
                        {item.viewing && (
                          <div className="bg-white">
                            <div className="border rounded m-3 p-3">
                              <div className="content-item-top">
                                {item.embedUrl ? (
                                  !item.local ? (
                                    <iframe
                                      className="w-100"
                                      height="400"
                                      src={item.embedUrl}
                                      allowFullScreen
                                    ></iframe>
                                  ) : (
                                    <VideoPlayer
                                      _link={item.embededUrl}
                                      _height={400}
                                    />
                                  )
                                ) : (
                                  <figure>
                                    <img
                                      src="/assets/images/emptycontent.jpeg"
                                      alt=""
                                    />
                                  </figure>
                                )}
                              </div>
                            </div>
                            {item.summary && (
                              <div className="border rounded mx-3 p-3 box-height">
                                <h2 className="text-dark mb-2">Summary</h2>
                                <Mathjax value={item.summary} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {item.type === "ebook" && (
                      <div className="rounded-boxes bg-white">
                        <div className="form-row justify-content-between">
                          <div className="col-md col-12 d-flex align-items-center">
                            <div className="form-row align-items-center">
                              <span className="material-icons cursor-pointer">
                                drag_indicator
                              </span>
                              <div className="col-auto d-flex align-items-center">
                                <h6 className="text-capitalize text-dark">
                                  {item.type}:{" "}
                                </h6>
                                <span className="icon3-ebook ml-4"></span>
                              </div>
                              <div className="col">
                                <div>{item.title}</div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-auto ml-auto col-12 text-right mt-md-0 mt-2">
                            {item.viewing ? (
                              <>
                                <button
                                  onClick={() => cancelViewContent(i)}
                                  className="btn btn-light btn-sm ml-1"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => editContent(i)}
                                  className="btn btn-primary btn-sm ml-1"
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <>
                                {editingSection.status === "draft" && (
                                  <button
                                    onClick={() => deleteContentFunction(i)}
                                    className="btn btn-danger btn-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                                <button
                                  onClick={() => viewEbookContent(item, i)}
                                  className="btn btn-primary btn-sm ml-1"
                                >
                                  View
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-end mt-2">
                          Optional&nbsp;&nbsp;
                          <label className="switches m-0">
                            <input
                              type="checkbox"
                              checked={item.optional}
                              onChange={(e) =>
                                optionalChange(i, e.target.checked)
                              }
                              name={`chkOptional${i}`}
                            />
                            <span className="sliders round"></span>
                          </label>
                        </div>
                        {item.viewing && (
                          <div className="bg-white">
                            <div className="border rounded m-3 p-3">
                              <div className="content-item-top">
                                {item.url ? (
                                  <div
                                    className="w-100 pdf-panel"
                                    dangerouslySetInnerHTML={{
                                      __html: item.embedUrl,
                                    }}
                                  ></div>
                                ) : (
                                  <figure>
                                    <img
                                      src="/assets/images/emptycontent.jpeg"
                                      alt=""
                                    />
                                  </figure>
                                )}
                              </div>
                            </div>
                            {item.summary && (
                              <div className="border rounded mx-3 p-3 box-height">
                                <h2 className="text-dark mb-2">Summary</h2>
                                <Mathjax value={item.summary} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {(item.type === "quiz" || item.type === "assessment") && (
                      <div className="rounded-boxes bg-white">
                        <div className="form-row justify-content-between">
                          <div className="col-md col-12 d-flex align-items-center">
                            <div className="form-row align-items-center">
                              <span className="material-icons cursor-pointer">
                                drag_indicator
                              </span>
                              <div className="col-auto d-flex align-items-center">
                                <h6 className="text-capitalize text-dark">
                                  {item.type}:{" "}
                                </h6>
                                <span className="iconc-quiz ml-4"></span>
                              </div>
                            </div>
                            <div className="col d-flex align-items-center">
                              <div className="row col-auto">
                                <div>{item.title}</div>
                                {item.practiceStatus === "draft" && (
                                  <div className="publishedDet1Tag mx-2">
                                    <span className="statusDetailsAssesP1 tag-type status_draft text-black">
                                      {item.practiceStatus}
                                    </span>
                                  </div>
                                )}
                                {item.practiceStatus === "published" && (
                                  <div className="publishedDet2Tag mx-2">
                                    <span className="statusDetailsAssesP1 tag-type status_published text-black">
                                      {item.practiceStatus}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-auto ml-auto col-12 text-right mt-md-0 mt-2">
                            {editingSection.status === "draft" && (
                              <button
                                onClick={() => deleteContentFunction(i)}
                                className="btn btn-danger btn-sm"
                              >
                                Delete
                              </button>
                            )}
                            <button
                              onClick={() => viewTest(item.source)}
                              className="second btn btn-primary btn-sm ml-1"
                            >
                              View
                            </button>
                          </div>
                        </div>
                        <div className="form-row d-flex align-items-center mt-2">
                          {item.totalQuestion ? (
                            <p className="col-xs-6 p-0 mt-0">
                              Total Questions - <b>{item.totalQuestion}</b>
                            </p>
                          ) : (
                            ""
                          )}
                          {item.totalQuestion ? (
                            <p className="p-0 px-1 mt-0"> | </p>
                          ) : (
                            ""
                          )}
                          {item.mcq ? (
                            <p className="col-xs-6 p-0 mt-0">
                              Multiple Choice - <b>{item.mcq}</b>
                              {item.fib ||
                              item.mixmatch ||
                              item.code ||
                              item.des ? (
                                <span className="p-0 px-1 mt-0">|</span>
                              ) : (
                                ""
                              )}
                            </p>
                          ) : (
                            ""
                          )}
                          {item.mixmatch ? (
                            <p className="col-xs-6 p-0 mt-0">
                              Mixmatch - <b>{item.mixmatch}</b>
                              {item.fib || item.code || item.des ? (
                                <span className="p-0 px-1 mt-0">|</span>
                              ) : (
                                ""
                              )}
                            </p>
                          ) : (
                            ""
                          )}
                          {item.fib ? (
                            <p className="col-xs-6 p-0 mt-0">
                              Fill in the Blanks - <b>{item.fib}</b>
                              {item.code || item.des ? (
                                <span className="p-0 px-1 mt-0">|</span>
                              ) : (
                                ""
                              )}
                            </p>
                          ) : (
                            ""
                          )}
                          {item.code ? (
                            <p className="col-xs-6 p-0 mt-0">
                              Coding - <b>{item.code}</b>
                              {item.des ? (
                                <span className="p-0 px-1 mt-0">|</span>
                              ) : (
                                ""
                              )}
                            </p>
                          ) : (
                            ""
                          )}
                          {item.des ? (
                            <p className="col-xs-6 p-0 mt-0">
                              Descriptive - <b>{item.des}</b>
                            </p>
                          ) : (
                            ""
                          )}
                          <div className="col d-flex align-items-center justify-content-end">
                            Optional&nbsp;&nbsp;
                            <label className="switches m-0">
                              <input
                                type="checkbox"
                                checked={item.optional}
                                onChange={(e) =>
                                  optionalChange(i, e.target.checked)
                                }
                                name={`chkOptional${i}`}
                              />
                              <span className="sliders round"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <SectionReviewComponent
          settings={settings}
          Cancel={cancelSectionReview}
          section={editingSection}
        />
      )}
    </>
  );
};

export default SectionEditorComponent;
