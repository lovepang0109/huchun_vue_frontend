import React, { useEffect, useState, useRef } from "react";
import * as classroomService from "@/services/classroomService";
import moment from "moment";
import Link from "next/link";
import { decimal } from "@/lib/pipe";
import CircleProgress from "@/components/CircleProgress";
import Submission from "./Submission";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import { avatar } from "@/lib/pipe";

const DetailAssignmentComponent = ({
  classroom,
  setClassrom,
  user,
  editingAssign,
  settings,
  save,
}: any) => {
  const [data, setData] = useState<any>(null);
  const [params, setParams] = useState<any>({
    classroom: "",
    assignment: "",
    teacher: true,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [assignment, setAssignment] = useState<any>(null);

  const [totalAssignment, setTotalAssignment] = useState<any>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [currentStudent, setCurrentStudent] = useState<any>(null);

  useEffect(() => {
    setParams({
      ...params,
      classroom: classroom._id,
      assignment: editingAssign._id,
    });
    const temp_params = {
      ...params,
      classroom: classroom._id,
      assignment: editingAssign._id,
    };
    loadData(temp_params);
  }, []);

  const loadData = (para?: any) => {
    if (!para) {
      para = params;
    }
    classroomService.getAssignmentById(para).then((data) => {
      setData(data);
      setTotalAssignment({ ...data });
    });
    classroomService.getAllAssignmentByCount(para).then((d: any[]) => {
      d.forEach((e) => {
        e.notEvaluated = decimal(e.notEvaluated, 0);
        e.evaluated = decimal(e.evaluated, 0);
        e.notEva = e.totalAttempted - e.eva;
        e.notSubmitted = e.totalStud - e.totalAttempted;
        e.notPSubmitted = Math.round(
          ((e.totalStud - e.totalAttempted) / e.totalStud) * 100
        );
      });
      setAssignment(d);
    });
  };

  const search = (text: string) => {
    setSearchText(text);
    if (text) {
      const tmp_studSub = totalAssignment.studSub.filter(
        (d) =>
          d.student.name
            .toLowerCase()
            .toString()
            .indexOf(text.toLowerCase()) !== -1
      );
      setData({
        studSub: tmp_studSub,
      });

      if (data.studSub.length > 0) {
        return;
      }

      const tmp_stud = totalAssignment.studSub.filter(
        (d) =>
          d.student.email
            .toLowerCase()
            .toString()
            .indexOf(searchText.toLowerCase()) !== -1
      );
      setData({
        studSub: tmp_stud,
      });
    } else {
      setData({
        studSub: [...totalAssignment.studSub],
      });
    }
  };

  const evaluateAssignment = (assignment: any, student: any) => {
    setCurrentAssignment(assignment);
    setCurrentStudent(student);
    setEvaluating(true);
  };

  const onEvaluated = (needReload: any) => {
    setEvaluating(false);
    setCurrentAssignment(null);
    setCurrentStudent(null);

    if (needReload) {
      loadData();
    }
  };

  const goBack = () => {
    save();
  };

  return (
    <>
      {!evaluating && (
        <div id="wrapper">
          <main className="pt-lg-3">
            <div className="container">
              <div className="dashboard-area classroom mx-auto">
                {totalAssignment && (
                  <div className="rounded-boxes padding-lg-y-0 bg-white">
                    <div className="row align-items-lg-center">
                      <div className="col-lg-3">
                        <div className="assignment-info py-3">
                          <h3 className="text-capitalize text-black f-16 text-truncate">
                            {totalAssignment.assignment?.title}
                          </h3>
                          <div className="form-row pending-assign-dat mt-2">
                            <div className="col-auto student-time">
                              <div className="d-flex align-items-center">
                                <span className="material-icons course assign">
                                  date_range
                                </span>
                                <span className="mat-icons-remove icon-text assign-date-marks mt-0 ml-1">
                                  {moment(
                                    totalAssignment.assignment?.dueDate
                                  ).format("ll")}
                                </span>
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="d-flex align-items-center">
                                <span className="material-icons course assign">
                                  assessment
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {totalAssignment.assignment?.maximumMarks}{" "}
                                  marks
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-9">
                        <div className="row align-items-center">
                          {assignment && assignment[0] && (
                            <>
                              <div className="d-flex align-items-center">
                                <div className="item-wrap svg-wrapper-80">
                                  <CircleProgress
                                    xValue={50}
                                    value={assignment[0].evaluated}
                                    text={`${assignment[0].eva}`}
                                    innerStrokeColor="#78C000"
                                    outerStrokeColor="#78C000"
                                  />
                                </div>
                                <div className="tile mt-3 ml-2">
                                  <h6>
                                    <strong>Evaluated</strong>
                                  </h6>
                                </div>
                              </div>
                              <div className="d-flex align-items-center">
                                <div className="item-wrap svg-wrapper-80">
                                  <CircleProgress
                                    xValue={50}
                                    value={assignment[0].notEvaluated}
                                    text={`${assignment[0].notEva}`}
                                    innerStrokeColor="#78C000"
                                    outerStrokeColor="#78C000"
                                  />
                                </div>
                                <div className="tile mt-3 ml-2">
                                  <h6>
                                    <strong>Not Evaluated</strong>
                                  </h6>
                                </div>
                              </div>
                              <div className="d-flex align-items-center">
                                <div className="item-wrap svg-wrapper-80">
                                  <CircleProgress
                                    xValue={50}
                                    value={assignment[0].notPSubmitted}
                                    text={`${assignment[0].notSubmitted}`}
                                    innerStrokeColor="#78C000"
                                    outerStrokeColor="#78C000"
                                  />
                                </div>
                                <div className="tile mt-3 ml-2">
                                  <h6>
                                    <strong>Not Submitted</strong>
                                  </h6>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {totalAssignment?.studSub.length > 0 && (
                  <div className="member-search my-3">
                    <form
                      className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
                      style={{ maxWidth: "100%" }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        // search();
                      }}
                    >
                      <input
                        type="text"
                        className="form-control border-0 my-0"
                        maxLength={50}
                        placeholder="Search for students"
                        name="txtSearch"
                        value={searchText}
                        onChange={(e) => search(e.target.value)}
                      />
                      {searchText !== "" && (
                        <span
                          className="search-pause"
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "3px",
                          }}
                          onClick={() => {
                            setSearchText("");

                            search("");
                          }}
                        >
                          <FontAwesomeIcon icon={faXmarkCircle} />
                        </span>
                      )}

                      <span className="m-0 w-auto h-auto">
                        <figure className="m-0 w-auto">
                          <img
                            className="m-0 h-auto mw-100"
                            src="/assets/images/search-icon-2.png"
                            alt=""
                          />
                        </figure>
                      </span>
                    </form>
                  </div>
                )}

                {data?.studSub.length > 0 && (
                  <div className="rounded-boxes bg-white">
                    <div className="folder-area">
                      <div className="table-responsive-md vertical-middle table-wrap">
                        <table className="table mb-0">
                          <thead>
                            <tr>
                              <th className="border-0 ml-50px d-block">Name</th>
                              <th className="border-0">Submission Time</th>
                              <th className="border-0">Status</th>
                              <th className="border-0"></th>
                            </tr>
                          </thead>

                          <tbody>
                            {data.studSub.map((sub) => (
                              <tr key={sub.student._id}>
                                <td className="px-0">
                                  <div className="folder mb-0 p-0">
                                    <a
                                      className="p-0 border-0 clearfix d-flex align-items-center"
                                      href="#"
                                    >
                                      <figure className="user_img_circled_wrap">
                                        <img
                                          src={avatar(sub.student)}
                                          width="40"
                                          className="user_img_circled"
                                        />
                                      </figure>
                                      <div className="inner">
                                        <div className="inners">
                                          <h4>{sub.student?.name}</h4>
                                          <p>{sub.student?.email}</p>
                                        </div>
                                      </div>
                                    </a>
                                  </div>
                                </td>
                                <td>
                                  <div className="progresss">
                                    <span>
                                      {moment(
                                        sub.assignment?.submittedOn
                                      ).fromNow()}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="status">
                                    {!sub.assignment?.evaluated ? (
                                      <span>Pending</span>
                                    ) : (
                                      <span>
                                        {sub.assignment.totalMark}/
                                        {sub.assignment.maximumMarks}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="text-right">
                                  <div className="d-inline-block mr-0">
                                    <div
                                      className="btn btn-primary btn-sm"
                                      onClick={() =>
                                        evaluateAssignment(
                                          sub.assignment,
                                          sub.student
                                        )
                                      }
                                      // href={`/assignment-submission/${params.classroom}/${params.assignment}?student=${sub.student._id}`}
                                    >
                                      <p>
                                        {!sub.assignment?.evaluated
                                          ? "Evaluate"
                                          : "Review"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {totalAssignment?.studSub.length > 0 &&
                  data.studSub.length === 0 && (
                    <div className="empty-data addNoDataFullpageImgs">
                      <figure>
                        <img
                          src="/assets/images/NoAssignment.svg"
                          alt="Not Found"
                        />
                      </figure>
                      <h3>No student found</h3>
                    </div>
                  )}

                {!totalAssignment ||
                  (!totalAssignment?.studSub.length && (
                    <div className="empty-data addNoDataFullpageImgs">
                      <figure>
                        <img
                          src="/assets/images/NoAssignment.svg"
                          alt="Not Found"
                        />
                      </figure>
                      <h3>No Submission yet</h3>
                    </div>
                  ))}

                <div className="text-right">
                  <button className="btn btn-outline" onClick={goBack}>
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
      {evaluating && (
        <Submission
          classroom={classroom}
          assignment={currentAssignment}
          user={user}
          currentStudent={currentStudent}
          save={onEvaluated}
        />
      )}
    </>
  );
};

export default DetailAssignmentComponent;
