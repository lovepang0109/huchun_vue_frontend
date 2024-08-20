import React, { useEffect, useState, useRef } from "react";
import * as classroomService from "@/services/classroomService";
import alertify from "alertifyjs";
import { useRouter } from "next/navigation";
import { copyText as commonCopyText } from "@/lib/helpers";
import PImageComponent from "@/components/AppImage";
import CircleProgress from "@/components/CircleProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import CreateAssignmentComponent from "./CreateAssignmentComponent";
import DetailAssignmentComponent from "./DetailAssignmentComponent";
import CustomCarousel from "@/components/assessment/carousel";
import moment from "moment";
import { Carousel, ProgressBar } from "react-bootstrap";

const ClassroomAssignment = ({
  classroom,
  setClassrom,
  user,
  getClientData,
}: any) => {
  const { push } = useRouter();
  const [editingAssign, setEditingAssign] = useState<any>(null);
  const [view, setView] = useState<string>("listing");
  const [assignments, setAssignments] = useState<any>(null);
  const [userAssignment, setUserAssignment] = useState<any>(null);
  const [draftAssign, setDraftAssign] = useState<any>([]);
  const [publishAssign, setPublishAssign] = useState<any>([]);
  const [owlOptions, setOwlOptions] = useState<any>({
    loop: false,
    autoplay: false,
    margin: 10,
    nav: true,
    dots: false,
    autoWidth: true,
    autoHeight: false,
    smartSpeed: 900,
    autoplayTimeout: 5000,
    navText: ["", ""],
    autoplayHoverPause: true,
    animateOut: "fadeOut",
    responsive: {
      0: {
        items: 2,
      },
    },
  });

  const [limitParams, setLimitParams] = useState<any>({
    page: 1,
    limit: 8,
    sort: "statusChangedAt,-1",
    status: "",
  });
  const [recentEv, setRecentEv] = useState<any>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLimitParams({
      ...limitParams,
      page: 1,
    });

    const param = {
      ...limitParams,
      page: 1,
    };
    classroomService
      .getTeacherAssignments(classroom._id, { ...param, status: "draft" })
      .then((draft: any[]) => {
        draft.forEach((element) => {
          element.dueDate = new Date(element.dueDate);
        });
        setDraftAssign(draft);
      });

    classroomService
      .getTeacherAssignments(classroom._id, { ...param, status: "published" })
      .then((p: any[]) => {
        p.forEach((element) => {
          element.dueDate = new Date(element.dueDate);
        });
        setPublishAssign(p);
      });
  };

  const update = (status: any, id: string) => {
    const params = { classroom: classroom._id, assignment: id, status: status };
    alertify.confirm(
      `Are you sure you want to ${
        status == "revoked" ? "withdraw" : status
      } this assignment?`,
      () => {
        classroomService.updateTeacherAssignmentsStatus(params).then((data) => {
          alertify.success("Successfully " + status);

          loadData();
        });
      }
    );
  };

  const deleteFunc = (assignment: any) => {
    alertify
      .confirm("Are you sure you want to delete this assignment?", (data) => {
        classroomService
          .deleteTeacherAssignment(classroom._id, assignment)
          .then((d) => {
            classroomService
              .getTeacherAssignments(classroom._id, {
                ...limitParams,
                status: "published",
              })
              .then((draft) => {
                setDraftAssign(draft);
              });
          });
      })
      .catch((err) => {
        alertify.alert("Message", "Unable to Delete");
      });
  };

  const viewAll = () => {
    push(`/classroom/assignments/${classroom._id}?type=evaluation`);
  };

  const viewAllEvaluations = () => {
    push(`/classroom/assignments/${classroom._id}?type=recentEvaluation`);
  };

  const viewAllDraftLists = () => {
    push(`/classroom/assignments/${classroom._id}?type=draft`);
  };

  const viewAllPublishedLists = () => {
    push(`/classroom/assignments/${classroom._id}?type=published`);
  };

  const reviewAssignment = (assignment: any) => {
    setEditingAssign(assignment);
    setView("details");
  };

  const edit = (assign: any) => {
    setEditingAssign(assign);
    setView("create");
  };

  const createAssignment = () => {
    setEditingAssign(null);
    setView("create");
  };

  const copyText = () => {
    commonCopyText(classroom.seqCode);
    alertify.success("Successfully Copied");
  };

  const onDataSubmit = () => {
    setView("listing");
    setEditingAssign(null);
    loadData();
  };

  return (
    <>
      {view == "listing" && (
        <div id="wrapper" className="px-3">
          <div className="rounded-boxes class-board bg-white">
            <div className="row align-items-center">
              <div className="col-md">
                <div className="square_profile_info d-flex align-items-center">
                  <div className="squared-rounded_wrap_80">
                    {/* Assuming p-image is a custom component */}
                    <PImageComponent
                      height={80}
                      width={80}
                      imageUrl={classroom.imageUrl}
                      backgroundColor={classroom.colorCode}
                      text={classroom.name}
                      radius={9}
                      fontSize={15}
                      type="classroom"
                    />
                  </div>

                  <div className="class-board-info assignment-top-detail ml-2">
                    <h3 className="top-title text-truncate">
                      {classroom.name}
                    </h3>
                    <div className="d-flex align-items-center">
                      {classroom.joinByCode && (
                        <>
                          <h6 className="text-truncate mr-1">
                            {classroom.seqCode}
                          </h6>
                          <button
                            aria-label="copy class code"
                            className="btn btn-secondary btn-sm"
                            onClick={copyText}
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </>
                      )}
                    </div>
                    {classroom.user && (
                      <p className="bottom-title mt-1 d-flex">
                        <span
                          className="material-icons-two-tone"
                          style={{
                            fontFamily: "Material Icons",
                            fontSize: "14px",
                          }}
                        >
                          portrait
                        </span>
                        <Link
                          href={`/public/profile/${classroom.user._id}`}
                          className="mr-2"
                        >
                          {classroom.user.name}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {user.role != "support" && user.role != "mentor" && (
                <div className="col-auto ml-auto">
                  <div className="ml-auto">
                    <a className="btn btn-primary" onClick={createAssignment}>
                      Create Assignment
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="assignment-area tittle">
            <br />
            {draftAssign && draftAssign.length > 0 && (
              <div className="box-area box-area_new assignment">
                <div className="heading assignment mx-0 px-0 mb-2">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          Draft Assignments
                        </h3>
                      </div>
                    </div>
                    {draftAssign.length > 4 && (
                      <div className="col-auto ml-auto">
                        <div className="view-all view-all_new d-block">
                          <a onClick={viewAllDraftLists}>View All</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <CustomCarousel
                  items={draftAssign.map((assign, index) => (
                    <div
                      key={index}
                      className="box-item mb-2"
                      style={{
                        width: "225px",
                        padding: "0 25px 0 0",
                      }}
                    >
                      <div className="box bg-white pt-0 assignment-box-area">
                        <div
                          className="box-inner"
                          style={{
                            padding: "0 5px 0 0 !important",
                          }}
                        >
                          <div
                            className="info p-0 m-0 assignment-info-top"
                            onClick={() => reviewAssignment(assign.assignments)}
                          >
                            <h4>{assign.assignments.title}</h4>
                          </div>
                          <div className="form-row assign-data fit-bar my-2 mx-0">
                            <div className="col student-time">
                              <div className="form-row align-items-center">
                                <span className="material-icons course assign">
                                  date_range
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {new Date(
                                    assign.assignments.dueDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="form-row align-items-center">
                                <span className="material-icons course assign">
                                  assessment
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {assign.assignments.maximumMarks}
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  Marks
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="edit-button">
                            <a
                              className="text-center px-2"
                              onClick={() => edit(assign.assignments)}
                            >
                              Edit
                            </a>
                          </div>
                          <div
                            className="btn btn-success float-none w-100"
                            onClick={() =>
                              update("published", assign.assignments._id)
                            }
                          >
                            <a className="text-center text-dark">Publish</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                />
                {/* <Carousel
                  indicators={true}
                  controls={true}
                  style={{ height: 350 }}
                >
                  {draftAssign.map((assign, index) => (
                    <div
                      key={index}
                      className="box-item mb-2"
                      style={{
                        width: "225px",
                        padding: "0 25px 0 0",
                      }}
                    >
                      <div className="box bg-white pt-0 assignment-box-area">
                        <div
                          className="box-inner"
                          style={{
                            padding: "0 5px 0 0 !important",
                          }}
                        >
                          <div
                            className="info p-0 m-0 assignment-info-top"
                            onClick={() => reviewAssignment(assign.assignments)}
                          >
                            <h4>{assign.assignments.title}</h4>
                          </div>
                          <div className="form-row assign-data fit-bar my-2 mx-0">
                            <div className="col student-time">
                              <div className="form-row align-items-center">
                                <span className="material-icons course assign">
                                  date_range
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {new Date(
                                    assign.assignments.dueDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="form-row align-items-center">
                                <span className="material-icons course assign">
                                  assessment
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {assign.assignments.maximumMarks}
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  Marks
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="edit-button">
                            <a
                              className="text-center px-2"
                              onClick={() => edit(assign.assignments)}
                            >
                              Edit
                            </a>
                          </div>
                          <div className="btn btn-success float-none w-100">
                            <a
                              className="text-center text-dark"
                              onClick={() =>
                                update("published", assign.assignments._id)
                              }
                            >
                              Publish
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel> */}
              </div>
            )}
            {publishAssign && publishAssign.length > 0 && (
              <div className="box-area box-area_new assignment">
                <div className="heading assignment mx-0 px-0 mb-2">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          Published Assignments
                        </h3>
                      </div>
                    </div>
                    {publishAssign.length > 4 && (
                      <div className="col-auto ml-auto">
                        <div className="view-all view-all_new d-block">
                          <a onClick={viewAllPublishedLists}>View All</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="box-area-wrap box-area-wrap_new classroom-carousel">
                  <CustomCarousel
                    isClassroom={true}
                    items={publishAssign.map((assign, index) => (
                      <div
                        key={index}
                        className="box-item mb-2"
                        style={{ width: "455px", padding: "0 25px 0 0" }}
                      >
                        <div className="box bg-white pt-0">
                          <div className="box-inner">
                            <div
                              className="info p-0 m-0 assignment-info-top"
                              onClick={() =>
                                reviewAssignment(assign.assignments)
                              }
                            >
                              <h4>{assign.assignments.title}</h4>
                            </div>
                            <div className="form-row assign-data fit-bar my-2 mx-0">
                              <div className="col student-time">
                                <div className="form-row align-items-center">
                                  <span className="material-icons course assign">
                                    date_range
                                  </span>
                                  <span className="icon-text assign-date-marks mt-0 ml-1">
                                    {moment(
                                      new Date(assign.assignments.dueDate)
                                    ).format("MMMM D, YYYY ")}
                                  </span>
                                </div>
                              </div>
                              <div className="col-auto">
                                <div className="form-row align-items-center">
                                  <span className="material-icons course assign">
                                    assessment
                                  </span>
                                  <span className="icon-text assign-date-marks mt-0 ml-1">
                                    {assign.assignments.maximumMarks}
                                  </span>
                                  <span className="icon-text assign-date-marks mt-0 ml-1">
                                    Marks
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center">
                              <div className="item-wrap assignment-circle ml-0 evaluated svg-wrapper-width-120">
                                <CircleProgress
                                  value={assign.evaluated}
                                  text={`${assign.evaluated + "%"}`}
                                  innerStrokeColor="#78C000"
                                  outerStrokeColor="#78C000"
                                />
                              </div>
                              <div className="tile mt-0 circle-progress-label ml-0">
                                <h6>Evaluated</h6>
                              </div>
                              <div className="item-wrap assignment-circle ml-0 svg-wrapper-width-120">
                                <CircleProgress
                                  value={assign.notEvaluated}
                                  text={`${assign.notEvaluated + "%"}`}
                                  innerStrokeColor="#ffe2b7"
                                  outerStrokeColor="#FFA24A"
                                />
                              </div>
                              <div className="tile mt-0 circle-progress-label ml-0">
                                <h6>Not Evaluated</h6>
                              </div>
                            </div>
                            <div className="d-flex gap-xs justify-content-between">
                              <div className="d-flex gap-xs flex-grow-1">
                                <div className="flex-grow-1">
                                  <a
                                    className="btn btn-outline btn-sm btn-block"
                                    onClick={() => edit(assign.assignments)}
                                  >
                                    Edit
                                  </a>
                                </div>
                                <div className="flex-grow-1">
                                  <a
                                    className="btn btn-danger btn-sm btn-block"
                                    onClick={() =>
                                      update("revoked", assign.assignments._id)
                                    }
                                  >
                                    Withdraw
                                  </a>
                                </div>
                              </div>
                              <a
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  reviewAssignment(assign.assignments)
                                }
                              >
                                Review Submissions
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  />
                </div>

                {/* <Carousel indicators={false} prevIcon={true} nextIcon={true}>
                  {publishAssign.map((assign, index) => (
                    <div
                      key={index}
                      className="box-item mb-2"
                      style={{ width: "455px", padding: "0 25px 0 0" }}
                    >
                      <div className="box bg-white pt-0">
                        <div className="box-inner">
                          <div
                            className="info p-0 m-0 assignment-info-top"
                            onClick={() => reviewAssignment(assign.assignments)}
                          >
                            <h4>{assign.assignments.title}</h4>
                          </div>
                          <div className="form-row assign-data fit-bar my-2 mx-0">
                            <div className="col student-time">
                              <div className="form-row align-items-center">
                                <span className="material-icons course assign">
                                  date_range
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {moment(
                                    new Date(assign.assignments.dueDate)
                                  ).format("MMMM D, YYYY ")}
                                </span>
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="form-row align-items-center">
                                <span className="material-icons course assign">
                                  assessment
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {assign.assignments.maximumMarks}
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  Marks
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="item-wrap assignment-circle ml-0 evaluated svg-wrapper-width-120">
                              <CircleProgress
                                value={assign.evaluated}
                                text={`${assign.evaluated + "%"}`}
                                innerStrokeColor="#ffe2b7"
                                outerStrokeColor="#FFA24A"
                              />
                            </div>
                            <div className="tile mt-0 circle-progress-label ml-0">
                              <h6>Evaluated</h6>
                            </div>
                            <div className="item-wrap assignment-circle ml-0 svg-wrapper-width-120">
                              <CircleProgress
                                value={assign.notEvaluated}
                                text={`${assign.notEvaluated + "%"}`}
                                innerStrokeColor="#ffe2b7"
                                outerStrokeColor="#FFA24A"
                              />
                            </div>
                            <div className="tile mt-0 circle-progress-label ml-0">
                              <h6>Not Evaluated</h6>
                            </div>
                          </div>
                          <div className="d-flex gap-xs justify-content-between">
                            <div className="d-flex gap-xs flex-grow-1">
                              <div className="flex-grow-1">
                                <a
                                  className="btn btn-outline btn-sm btn-block"
                                  onClick={() => edit(assign.assignments)}
                                >
                                  Edit
                                </a>
                              </div>
                              <div className="flex-grow-1">
                                <a
                                  className="btn btn-danger btn-sm btn-block"
                                  onClick={() =>
                                    update("revoked", assign.assignments._id)
                                  }
                                >
                                  Withdraw
                                </a>
                              </div>
                            </div>
                            <a
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                reviewAssignment(assign.assignments)
                              }
                            >
                              Review Submissions
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel> */}
              </div>
            )}
          </div>
          {recentEv && recentEv.length > 0 && (
            <div className="assignment-area">
              {recentEv.length > 0 && (
                <div className="heading assignment mx-0 px-0 mb-2">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          Recent Evaluations
                        </h3>
                      </div>
                    </div>
                    {recentEv.length > 4 && (
                      <div className="col-auto ml-auto">
                        <div className="view-all view-all_new d-block">
                          <a onClick={viewAllEvaluations}>View All</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {recentEv.map((rec, index) => (
                <div key={index} className="assignment-item bg-white">
                  <div className="row align-items-md-center">
                    <div className="col-md">
                      <div className="assignment-info recent-assign">
                        <h3 className="text-capitalize text-black f-16 text-truncate">
                          {rec.assignment.title}
                        </h3>
                        <div className="row pending-assign-dat recent-assign mt-2">
                          <div className="col-auto student-time">
                            <div className="form-row align-items-center">
                              <span className="material-icons course assign">
                                date_range
                              </span>
                              <span className="icon-text assign-date-marks mt-0 ml-1">
                                {rec.assignment.dueDate}
                              </span>
                            </div>
                          </div>
                          <div className="col-auto recent">
                            <div className="form-row align-items-center">
                              <span className="material-icons course assign">
                                assessment
                              </span>
                              <span className="icon-text assign-date-marks mt-0 ml-1">
                                {rec.assignment.maximumMarks}
                              </span>
                              <span className="icon-text assign-date-marks mt-0 ml-1">
                                Marks
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-auto">
                      <div className="ml-md-auto mt-4 mt-md-0">
                        <a
                          className="btn btn-outline btn-sm"
                          onClick={() => reviewAssignment(rec.assignment)}
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {draftAssign.length === 0 &&
            publishAssign.length === 0 &&
            !assignments?.length &&
            recentEv.length === 0 && (
              <div className="empty-data addNoDataFullpageImgs">
                <figure>
                  <img src="/assets/images/NoAssignment.svg" alt="Not Found" />
                </figure>
                <h3>No Assignment Yet</h3>
                <p>Add assignments to start!</p>
              </div>
            )}
        </div>
      )}
      {view == "create" && (
        <CreateAssignmentComponent
          classroom={classroom}
          setClassrom={setClassrom}
          user={user}
          assignment={editingAssign}
          getClientData={getClientData}
          save={onDataSubmit}
        />
      )}
      {view == "details" && (
        <DetailAssignmentComponent
          classroom={classroom}
          setClassrom={setClassrom}
          user={user}
          editingAssign={editingAssign}
          settings={getClientData}
          save={onDataSubmit}
        />
      )}
    </>
  );
};

export default ClassroomAssignment;
