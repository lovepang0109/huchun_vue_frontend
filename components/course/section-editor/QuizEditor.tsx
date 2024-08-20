import React, { useEffect, useState } from "react";
import * as authService from "@/services/auth";
import { useRouter } from "next/navigation";
import {
  findTeacherTests,
  checkQuestions,
  updatePractice,
} from "@/services/practiceService";
import { confirm, alert, success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import { date, fromNow } from "@/lib/pipe";

const QuizEditorComponent = ({
  course,
  section,
  content,
  Save,
  Cancel,
}: any) => {
  const router = useRouter();
  const [edit, setEdit] = useState<boolean>(false);
  const [teacherAssessment, setTeacherAssessment] = useState<any>([]);
  const [isDraftMode, setIsDraftMode] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 15,
    sort: "updatedAt,-1",
    includeFields: "questionCategories",
    status: "published",
    testMode: "learning",
    accessMode: "internal",
  });
  const [editingContent, setEditingContent] = useState<any>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>([]);

  useEffect(() => {
    setEdit(!content.isNew);
    setEditingContent(content);
    findTeacherTestsFunction();
  }, []);

  const findTeacherTestsFunction = () => {
    findTeacherTests({
      ...params,
      subjects: course.subjects?.map((e: any) => e._id),
    }).then(({ tests }: any) => {
      if (section.contents && section.contents.length) {
        const sourceIds = section.contents
          .filter((el: any) => el.type == "quiz")
          .map((el: any) => el.source);

        setTeacherAssessment(
          tests.filter((item: any) => sourceIds.indexOf(item._id) === -1)
        );
      } else {
        setTeacherAssessment(tests);
      }
    });
  };

  const searchQuiz = (isDraftMode: boolean) => {
    const paramsData = params;
    paramsData.keyword = searchText;
    setSelectedQuiz(null);
    if (isDraftMode) {
      paramsData.status = "draft";
      setParams({
        ...params,
        keyword: searchText,
        status: "draft",
      });
      findTeacherTests({
        ...paramsData,
        subjects: course.subjects?.map((e: any) => e._id),
      }).then(({ tests }: any) => {
        setTeacherAssessment(tests);
      });
    } else {
      paramsData.status = "published";
      setParams({
        ...params,
        keyword: searchText,
        status: "published",
      });
      findTeacherTests({
        ...paramsData,
        subjects: course.subjects?.map((e: any) => e._id),
      }).then(({ tests }: any) => {
        setTeacherAssessment(tests);
      });
    }
  };

  const searchQuizText = (text: string) => {
    const paramsData = params;
    paramsData.keyword = searchText;
    setParams({
      ...params,
      keyword: searchText,
    });
    findTeacherTests({
      paramsData,
      subjects: course.subjects?.map((e: any) => e._id),
    }).then(({ tests }: any) => {
      setTeacherAssessment(tests);
    });
  };

  const publish = (practice: any) => {
    checkQuestions(practice._id)
      .then((res: any) => {
        confirm("Are you sure you want to publish this Assessment?", () => {
          updatePractice(
            practice._id,
            { ...practice, status: "published", statusChangedAt: new Date() },
            { isQuiz: true }
          )
            .then((res: any) => {
              setTeacherAssessment((prev: any) =>
                prev.map((css: any, index: any) =>
                  css._id === practice._id
                    ? {
                        ...css,
                        status: "published",
                        statusChangedAt: new Date(),
                      }
                    : css
                )
              );

              // practice = res;

              success("Practice test published successfully.");
            })
            .catch((err) => {
              if (err.params) {
                if (err) {
                  alert("Message", err.message);
                }
              } else {
                alert("Message", err);
              }
            });
        });
      })
      .catch((err) => {
        alert("Message", err);
      });
  };

  const viewTest = (id: any) => {
    if (!section._id) {
      alert("Message", "You may lose the data please save the section first!!");
      return;
    }
    if (section.contents) {
      const d = section.contents.find((t: any) => !t._id);
      if (d) {
        alert(
          "Message",
          "You may lose the data please save the section first!!"
        );
        return;
      }
    }
    router.push(
      `/assessment/details/${id}?${toQueryString({
        isCourse: true,
        course: course._id,
        section: section._id,
      })}`
    );
  };

  const saveContent = () => {
    const contentData = content;
    let editingContentData = editingContent;

    editingContentData.title = selectedQuiz.title;
    editingContentData.summary = selectedQuiz.description;
    editingContentData.practiceStatus = selectedQuiz.status;
    editingContentData.questions = selectedQuiz.questions;
    editingContentData.source = selectedQuiz._id;

    for (const k in editingContentData) {
      contentData[k] = editingContentData[k];
    }

    setEditingContent(editingContentData);
    Save(contentData);
  };

  const onDataChange = (quiz: any) => {
    setSelectedQuiz(quiz);

    setEditingContent({
      ...content,
      hasChanges: true,
    });
  };
  return (
    <div className="rounded-boxes bg-white">
      <div className="title mb-2">
        <div className="section_heading_wrapper">
          <h3 className="section_top_heading">Quiz:</h3>
        </div>
      </div>
      <div className="search-bar">
        <div className="row">
          <div className="col-md-4 mb-2">
            <ul className="nav">
              <li className="ml-0">Published</li>
              <li>
                <div className="toggle-switch">
                  <label className="switches m-0">
                    <input
                      type="checkbox"
                      defaultChecked={isDraftMode}
                      onChange={(e) => {
                        searchQuiz(e.target.checked);
                      }}
                    />
                    <span className="sliders round"></span>
                  </label>
                </div>
              </li>
              <li>Draft</li>
            </ul>
          </div>
          <div className="col-md-8 mb-2">
            <div className="common_search-type-1 form-half mb-3 ml-auto">
              <span>
                <figure>
                  <img src="/assets/images/search-icon-2.png" alt="" />
                </figure>
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search for Quiz"
                name="textTestSearch"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  searchQuizText(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {teacherAssessment && teacherAssessment.length && (
        <div style={{ maxHeight: "500px", overflow: "auto" }}>
          {teacherAssessment?.map((ass: any, i: number) => (
            <div key={i} className="assess-box overflowx-hidden">
              <div className="row">
                <div className="col-md">
                  <div className="radio">
                    <div className="custom-radio form-check">
                      <input
                        type="radio"
                        value={ass}
                        name="enums"
                        id={`enum_answer_${ass.title}`}
                        defaultChecked={selectedQuiz === ass}
                        onChange={() => onDataChange(ass)}
                        className="custom-control-input"
                      />
                      <label
                        className="custom-control-label"
                        htmlFor={`enum_answer_${ass.title}`}
                      ></label>
                    </div>
                  </div>
                  <h4>{ass.title}</h4>

                  <div className="d-flex">
                    <div className="item border-0">
                      <span className="text-center">{ass.totalQuestion}</span>
                      <p className="text-center">Questions</p>
                    </div>

                    <div className="item">
                      <span className="text-center">{ass.totalTime}</span>
                      <p className="text-center">Minutes</p>
                    </div>
                  </div>
                </div>

                <div className="col-md">
                  <h5>
                    {date(ass.statusChangedAt, "medium")}
                    {fromNow(ass.statusChangedAt)}
                  </h5>

                  <ul>
                    <li>
                      <i className="material-icons">person</i>{" "}
                      {ass?.userInfo?.name}
                    </li>

                    <li>
                      <i className="far fa-edit ml-1"></i>
                      <p>
                        {ass.subjects &&
                          ass.subjects.length > 0 &&
                          `${ass.subjects[0]?.name} ${
                            ass.subjects.length > 1
                              ? `+ ${ass.subjects.length - 1} more`
                              : ""
                          }`}
                      </p>
                    </li>

                    <li>
                      <i className="fas fa-book ml-1"></i>
                      <span>
                        {ass.units &&
                          ass.units.length > 0 &&
                          `${ass.units[0].name} ${
                            ass.units.length > 1
                              ? `+ ${ass.units.length - 1} more`
                              : ""
                          }`}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="col-md ml-auto align-self-center">
                  <div className="d-flex justify-content-md-center justify-content-end">
                    <button
                      className="btn btn-outline btn-sm"
                      type="button"
                      onClick={() => viewTest(ass._id)}
                    >
                      View
                    </button>
                    {ass.status === "draft" && (
                      <button
                        className="btn btn-primary btn-sm ml-1"
                        type="button"
                        onClick={() => publish(ass)}
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {teacherAssessment && !teacherAssessment.length && (
        <div className="empty-data course-search-empty">
          <figure className="mx-auto">
            <img src="/assets/images/Search-rafiki.png" alt="" />
          </figure>

          <h3 className="text-center">
            No quizzes Found in this course subjects
          </h3>
        </div>
      )}
      <div className="title my-2">
        <div className="d-flex align-items-center justify-content-end">
          <button className="btn btn-light btn-sm" onClick={Cancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm ml-1"
            disabled={!selectedQuiz || selectedQuiz.length === 0}
            onClick={saveContent}
          >
            Add Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizEditorComponent;
