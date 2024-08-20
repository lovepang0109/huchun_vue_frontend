import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getTeacherCourseDetails,
  updateSectionsOrder,
  publishSection,
} from "@/services/courseService";
import { success, alert, confirm } from "alertifyjs";
import {
  Accordion,
  AccordionCollapse,
  AccordionToggle,
  Card,
} from "react-bootstrap";
import { addSeconds } from "date-fns";
import { appendS } from "@/lib/pipe";
import SectionEditorComponent from "@/components/course/section-editor/SectionEditor";
import SectionReviewComponent from "@/components/course/section-review/SectionReview";
import Link from "next/link";

interface EditSectionEntry {
  status: string;
  contents: string[];
  title: string;
  summary: string;
  name: string;
  optional: boolean;
}

const CourseChaptterComponent = ({
  user,
  settings,
  course,
  setCourse,
  updateCourse,
  isAddSectionOpn,
}: any) => {
  const { id } = useParams();
  const paramsData = useParams();
  const [editSection, setEditSection] = useState<EditSectionEntry>({
    status: "draft",
    contents: [],
    title: "",
    summary: "",
    name: "",
    optional: false,
  });
  const [publishSections, setPublishSections] = useState<any[]>([]);
  const [draftSections, setDraftSections] = useState<any[]>([]);
  const [addSection, setAddSection] = useState<boolean>(false);
  const [sectionStats, setSectionStats] = useState<any>({});
  const [sectionReview, setSectionReview] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = () => {
    console.log("-------------------------+++++++++++++++++++++++++++++++");
    console.log(paramsData);
    if (paramsData.addSection === "true") {
      setAddSection(true);
      getTeacherCourseDetails(paramsData.course).then((res: any) => {
        const course = res;
        if (course.sections && course.sections.length > 0) {
          const item = course.sections.filter(
            (x: any) => x._id.toString() === paramsData.section.toString()
          );
          editSec(item[0]);
        }
      });
    } else {
      setAddSection(false);
    }
    updateSummary();
  };

  const drop = (event: any) => {
    // moveItemInArray(draftSections, event.previousIndex, event.currentIndex);
  };

  const updateSummary = () => {
    let sectionStatsData = sectionStats;
    if (course.sections && course.sections.length) {
      for (const sec of course.sections) {
        sectionStatsData[sec._id] = {
          onlineSession: 0,
          note: 0,
          assessment: 0,
          video: 0,
          quiz: 0,
        };
        for (const content of sec.contents) {
          if (content.type == "onlineSession") {
            sectionStatsData[sec._id].onlineSession++;
          } else if (content.type == "note" || content.type == "ebook") {
            sectionStatsData[sec._id].note++;
          } else if (content.type == "assessment") {
            sectionStatsData[sec._id].assessment++;
          } else if (content.type == "video") {
            sectionStatsData[sec._id].video++;
          } else if (content.type == "quiz") {
            sectionStatsData[sec._id].quiz++;
          }
        }
      }
      setSectionStats(sectionStatsData);
      const draftSectionsData =
        course.sections.filter((e: any) => e.status == "draft") || [];
      const publishSectionsData =
        course.sections.filter((e: any) => e.status == "published") || [];
      setDraftSections(draftSectionsData);
      setPublishSections(publishSectionsData);
    }
  };

  const afterSectionUpdate = () => {
    updateSummary();
  };

  const addSec = () => {
    setAddSection(true);
    isAddSectionOpn(true);
  };

  const editSec = (item: EditSectionEntry) => {
    setEditSection(item);
    setAddSection(true);
    isAddSectionOpn(true);
  };

  const saveChanges = () => {
    let secs: any = [];
    if (publishSections && publishSections.length) {
      secs = publishSections;
    }
    secs = secs.concat(draftSections);
    course.sections = secs;
    updateSectionsOrder(id, { sections: secs }).then((res: any) => {
      success("Updated");
    });
  };

  const saveChangesPublished = (ev: any, i: any, elem: any) => {
    const courseData = course;
    if (elem == "unlocked") {
      courseData.sections[i].locked = !ev;
    } else if (elem == "optional") {
      courseData.sections[i].optional = ev;
    } else if (elem == "isDemo") {
      courseData.sections[i].isDemo = ev;
    }

    updateSectionsOrder(id, { sections: courseData.sections }).then(
      (d: any) => {
        setCourse(courseData);
        success("Updated");
      }
    );
  };

  const cancel = () => {
    setEditSection({
      status: "draft",
      contents: [],
      title: "",
      summary: "",
      name: "",
      optional: false,
    });
    setAddSection(false);
    isAddSectionOpn(false);
    fetchData();
  };

  const publishSectionFunc = async (item: any) => {
    if (!item.contents.length) {
      alert("Message", "Please add at least one content to this chapter.");
      return;
    }
    confirm(
      "Are you sure you want to publish the chapter?",
      async (msg: any) => {
        const data = { ...item, status: "published" };

        publishSection(course._id, data)
          .then((d: any) => {
            item.status = "published";
            const deletedSec = draftSections.findIndex(
              (e: any) => e._id.toString() == item._id.toString()
            );
            setPublishSections(publishSections.push(data));
            setDraftSections(draftSections.splice(deletedSec, 1));
            draftSections.splice(deletedSec, 1);
            afterSectionUpdate();
            success("Successfully Published");
          })
          .catch((err: any) => {
            alert("Message", err.error);
          });
      }
    );
  };

  const reviewSection = (section: any) => {
    setSectionReview(section);
  };

  const cancelSectionReview = () => {
    setSectionReview(null);
  };

  console.log("++++++++++++++++++++++++++++++++++++++++");

  return (
    <>
      {!sectionReview && !addSection && (
        <div className="course-curriculum-area pt-0">
          {course.canEdit &&
            course.sections &&
            course.sections.length == 0 &&
            course.status !== "revoked" && (
              <div className="row mb-3">
                <div className="col-md-6"></div>

                <div className="col-md-6">
                  <div className="btn-area d-flex justify-content-end">
                    <div className="mx-1">
                      <a
                        className="btn btn-primary ml-1"
                        onClick={() => addSec()}
                      >
                        + Add Chapter
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {course.sections && course.sections.length !== 0 && (
            <div>
              {publishSections && publishSections.length !== 0 && (
                <div className="d-flex justify-content-between my-2">
                  <div className="section_heading_wrapper">
                    <h1 className="section_top_heading">Published Chapters </h1>
                    <p className="section_sub_heading">
                      (These chapters are published and visible to student)
                    </p>
                  </div>
                  <div className="btn-area d-flex justify-content-end">
                    <div className="mx-1">
                      {course.sections && course.sections.length !== 0 && (
                        <Link
                          className="btn btn-primary ml-1 mb-1"
                          href={`/view-mode/${course._id}`}
                        >
                          Start Teaching
                        </Link>
                      )}
                      {course.canEdit &&
                        draftSections &&
                        draftSections.length == 0 &&
                        course.status !== "revoked" && (
                          <a
                            className="btn btn-primary ml-1 mb-1"
                            onClick={() => addSec()}
                          >
                            + Add Chapter
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              )}
              <Accordion defaultActiveKey="0">
                {publishSections.map((item: any, index: number) => (

                  <div
                    key={index}
                    className="rounded-boxes bg-white course-content_new"
                  >
                    <div className="content">
                      <AccordionToggle as={Card.Header} eventKey={`${index}`}>
                        <div accordion-heading>
                          <div className="course-curriculum-item-remove">
                            <div className="form-row">
                              <div className="week col-lg-auto">
                                <div className="course-curriculum-duration">
                                  {index >= 9 ? (
                                    <span className="number">{index + 1}</span>
                                  ) : (
                                    <span className="number">
                                      {"0" + (index + 1)}
                                    </span>
                                  )}
                                  <p className="item_name text-truncate ml-2 ml-lg-0 p-0">
                                    {item.name}
                                  </p>
                                </div>
                              </div>

                              <div className="col">
                                <div className="course-curriculum-info">
                                  <div className="d-flex align-items-center mb-1">
                                    <h4 className="item_title">{item.title}</h4>
                                    {course.canEdit && (
                                      <div>
                                        <a
                                          className="btn btn-sm"
                                          onClick={() => editSec(item)}
                                        >
                                          <svg
                                            width="19"
                                            height="19"
                                            viewBox="0 0 19 19"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M2.375 13.6563V16.625H5.34375L14.0996 7.86919L11.1308 4.90044L2.375 13.6563ZM16.3954 5.57336C16.7042 5.26461 16.7042 4.76586 16.3954 4.45711L14.5429 2.60461C14.2342 2.29586 13.7354 2.29586 13.4267 2.60461L11.9779 4.05336L14.9467 7.02211L16.3954 5.57336Z"
                                              fill="black"
                                            />
                                          </svg>
                                        </a>
                                      </div>
                                    )}

                                    <div>
                                      <a
                                        className="btn btn-sm"
                                        title="review"
                                        onClick={() => reviewSection(item)}
                                      >
                                        <i className="fas fa-scroll"></i>
                                      </a>
                                    </div>
                                  </div>
                                  {item &&
                                    item.summary &&
                                    item.summary.length > 450 && (
                                      <div
                                        className={
                                          isCollapsed
                                            ? "collapsed mb-4"
                                            : "mb-4"
                                        }
                                      >
                                        <p className="summary">
                                          {item.summary}
                                        </p>
                                      </div>
                                    )}
                                  {item &&
                                    item.summary &&
                                    item.summary.length < 450 && (
                                      <p className="summary">{item.summary}</p>
                                    )}

                                  <div className="expand-more cursor-pointer">
                                    <span
                                      className="pull-right my-2 material-icons"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                      onClick={() =>
                                        setIsCollapsed(!isCollapsed)
                                      }
                                    >
                                      {isCollapsed
                                        ? "expand_more"
                                        : "expand_less"}
                                    </span>
                                  </div>

                                  <div>
                                    <div className="bottom row align-items-center mt-1">
                                      <div className="wrap col-lg">
                                        {sectionStats[item._id]
                                          .onlineSession ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id]
                                                .onlineSession,
                                              "Online Session"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].note ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].note,
                                              "Resource"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].assessment ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].assessment,
                                              "Assessment"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].video ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].video,
                                              "Video"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].quiz ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].quiz,
                                              "Quiz"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}
                                      </div>
                                      {course.accessMode == "buy" &&
                                        course.status === "published" &&
                                        course.canEdit && (
                                          <div className="col-lg-auto ml-auto">
                                            <h3>Demo</h3>
                                            <label className="switches m-0">
                                              <input
                                                type="checkbox"
                                                defaultChecked={item.isDemo}
                                                onChange={(e: any) =>
                                                  saveChangesPublished(
                                                    e.target.checked,
                                                    index,
                                                    "isDemo"
                                                  )
                                                }
                                              />
                                              <span className="sliders round"></span>
                                            </label>
                                          </div>
                                        )}
                                      {course.status == "published" &&
                                        course.canEdit && (
                                          <>
                                            <div className="col-lg-auto ml-auto">
                                              <h3>Optional</h3>
                                              <label className="switches m-0">
                                                <input
                                                  type="checkbox"
                                                  defaultChecked={!item.optional}
                                                  onChange={(e: any) =>
                                                    saveChangesPublished(
                                                      e.target.checked,
                                                      index,
                                                      "optional"
                                                    )
                                                  }
                                                />
                                                <span className="sliders round"></span>
                                              </label>
                                            </div>
                                            <div className="col-lg-auto ml-auto">
                                              <h3>Unlock</h3>
                                              <label className="switches m-0">
                                                <input
                                                  type="checkbox"
                                                  defaultChecked={!item.locked}
                                                  onChange={(e: any) =>
                                                    saveChangesPublished(
                                                      e.target.checked,
                                                      index,
                                                      "unlocked"
                                                    )
                                                  }
                                                />
                                                <span className="sliders round"></span>
                                              </label>
                                            </div>
                                          </>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionToggle>
                      <AccordionCollapse eventKey={`${index}`}>
                        <div className="curriculum-content-accordion bg-white mt-2">
                          <hr className="m-0" />

                          <div className="row justify-content-end">
                            <div className="col-md-12">
                              <ul className="list-wrap">
                                {item.contents.map(
                                  (content: any, index: number) => (
                                    <React.Fragment key={index}>
                                      {content.type === "video" && (
                                        <li className="list-item iconc-video-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "ebook" && (
                                        <li className="list-item iconc-ebook-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "note" && (
                                        <li className="list-item iconc-content-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "quiz" && (
                                        <li className="list-item iconc-quiz-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "assessment" && (
                                        <li className="list-item iconc-assesment-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "onlineSession" && (
                                        <li className="list-item iconc-onlineSession-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                    </React.Fragment>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </AccordionCollapse>
                    </div>
                  </div>
                ))}
              </Accordion>

              {draftSections && draftSections.length !== 0 && (
                <div className="d-flex justify-content-between my-2">
                  <div className="section_heading_wrapper">
                    <h1 className="section_top_heading">Draft Chapters </h1>
                    <p className="section_sub_heading">
                      (These chapters are in draft mode and not visible to
                      student)
                    </p>
                  </div>
                  <div className="d-flex justify-content-evenly">
                    {course.canEdit &&
                      draftSections &&
                      draftSections.length !== 0 && (
                        <div className="mx-1" onClick={() => saveChanges()}>
                          <a className="btn btn-primary"> Save</a>
                        </div>
                      )}
                    {course.canEdit && (
                      <div className="mx-1">
                        <a
                          className="btn btn-primary ml-1"
                          onClick={() => addSec()}
                        >
                          + Add Chapter
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Accordion defaultActiveKey="0">
                {draftSections.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-boxes bg-white course-content_new"
                  >
                    <div className="content">
                      <AccordionToggle as={Card.Header} eventKey={`${index}`}>
                        <div accordion-heading>
                          <div className="course-curriculum-item-remove">
                            <div className="form-row">
                              <div className="week col-lg-auto">
                                <div className="course-curriculum-duration">
                                  {index >= 9 ? (
                                    <span className="number">{index + 1}</span>
                                  ) : (
                                    <span className="number">
                                      {"0" + (index + 1)}
                                    </span>
                                  )}
                                  <p className="item_name text-truncate ml-2 ml-lg-0 p-0">
                                    {item.name}
                                  </p>
                                </div>
                              </div>

                              <div className="col">
                                <div className="course-curriculum-info">
                                  <div className="d-flex align-items-center mb-1">
                                    <h4 className="item_title">{item.title}</h4>
                                    {course.canEdit && (
                                      <div>
                                        <a
                                          className="btn btn-sm"
                                          onClick={() => editSec(item)}
                                        >
                                          <svg
                                            width="19"
                                            height="19"
                                            viewBox="0 0 19 19"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M2.375 13.6563V16.625H5.34375L14.0996 7.86919L11.1308 4.90044L2.375 13.6563ZM16.3954 5.57336C16.7042 5.26461 16.7042 4.76586 16.3954 4.45711L14.5429 2.60461C14.2342 2.29586 13.7354 2.29586 13.4267 2.60461L11.9779 4.05336L14.9467 7.02211L16.3954 5.57336Z"
                                              fill="black"
                                            />
                                          </svg>
                                        </a>
                                      </div>
                                    )}

                                    <div>
                                      <a
                                        className="btn btn-sm"
                                        title="review"
                                        onClick={() => reviewSection(item)}
                                      >
                                        <i className="fas fa-scroll"></i>
                                      </a>
                                    </div>
                                  </div>
                                  {item &&
                                    item.summary &&
                                    item.summary.length > 450 && (
                                      <div
                                        className={
                                          isCollapsed
                                            ? "collapsed mb-4"
                                            : "mb-4"
                                        }
                                      >
                                        <p className="summary">
                                          {item.summary}
                                        </p>
                                      </div>
                                    )}
                                  {item &&
                                    item.summary &&
                                    item.summary.length < 450 && (
                                      <p className="summary">{item.summary}</p>
                                    )}

                                  <div className="expand-more cursor-pointer">
                                    <span
                                      className="pull-right my-2 material-icons"
                                      style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                      }}
                                      onClick={() =>
                                        setIsCollapsed(!isCollapsed)
                                      }
                                    >
                                      {isCollapsed
                                        ? "expand_more"
                                        : "expand_less"}
                                    </span>
                                  </div>

                                  <div>
                                    <div
                                      className="bottom align-items-center mt-1"
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <div className="wrap">
                                        {sectionStats[item._id]
                                          .onlineSession ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id]
                                                .onlineSession,
                                              "Online Session"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].note ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].note,
                                              "Resource"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].assessment ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].assessment,
                                              "Assessment"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].video ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].video,
                                              "Video"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}

                                        {sectionStats[item._id].quiz ? (
                                          <a>
                                            {appendS(
                                              sectionStats[item._id].quiz,
                                              "Quiz"
                                            )}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                          </a>
                                        ) : (
                                          " "
                                        )}
                                      </div>
                                      {course.canEdit ? (
                                        <a
                                          className="btn btn-success"
                                          onClick={() =>
                                            publishSectionFunc(item)
                                          }
                                        >
                                          Publish
                                        </a>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionToggle>
                      <AccordionCollapse eventKey={`${index}`}>
                        <div className="curriculum-content-accordion bg-white mt-2">
                          <hr className="m-0" />

                          <div className="row justify-content-end">
                            <div className="col-md-12">
                              <ul className="list-wrap">
                                {item.contents.map(
                                  (content: any, index: number) => (
                                    <React.Fragment key={index}>
                                      {content.type === "video" && (
                                        <li className="list-item iconc-video-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "ebook" && (
                                        <li className="list-item iconc-ebook-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "note" && (
                                        <li className="list-item iconc-content-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "quiz" && (
                                        <li className="list-item iconc-quiz-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "assessment" && (
                                        <li className="list-item iconc-assesment-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                      {content.type === "onlineSession" && (
                                        <li className="list-item iconc-onlineSession-lock">
                                          <span>{content.title}</span>
                                        </li>
                                      )}
                                    </React.Fragment>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </AccordionCollapse>
                    </div>
                  </div>
                ))}
              </Accordion>
            </div>
          )}
          {(!course.sections ||
            (course.sections && course.sections.length === 0)) && (
              <div className="empty-data">
                <img
                  className="mx-auto"
                  src="/assets/images/curriculum.svg"
                  alt="No-Sections-yet"
                />
                <h3>No Chapters yet</h3>
              </div>
            )}
        </div>
      )}
      {addSection && (
        <SectionEditorComponent
          user={user}
          settings={settings}
          course={course}
          setCourse={setCourse}
          section={editSection}
          setSection={setEditSection}
          Update={afterSectionUpdate}
          Cancel={cancel}
        />
      )}
      {sectionReview && (
        <SectionReviewComponent
          settings={settings}
          Cancel={cancelSectionReview}
          section={sectionReview}
        />
      )}
    </>
  );
};

export default CourseChaptterComponent;
