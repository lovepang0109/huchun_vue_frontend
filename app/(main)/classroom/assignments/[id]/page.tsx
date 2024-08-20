"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import alertify from "alertifyjs";
import { decimal } from "@/lib/pipe";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as classroomService from "@/services/classroomService";
import CircleProgress from "@/components/CircleProgress";

const ViewAllAssignment = () => {
  const { id } = useParams();
  const queryParams = useSearchParams();

  const user: any = useSession()?.data?.user?.info || {};
  const { push } = useRouter();

  const [limitParams, setLimitParams] = useState<any>({
    page: 1,
    limit: 50,
    sort: "statusChangedAt,-1",
    status: "",
  });

  const [params, setParams] = useState<any>({
    classroom: "",
    teacher: true,
  });

  const [assignments, setAassignments] = useState<any>([]);
  const [publishAssign, setPublishAssign] = useState<any>([]);
  const [draftAssign, setDraftAssign] = useState<any>([]);
  const [recentEv, setRecentEv] = useState<any>([]);

  const [type, setType] = useState<string>("");

  useEffect(() => {
    if (queryParams.get("type") === "draft") {
      setType("draft");
      setLimitParams({
        ...limitParams,
        status: "draft",
      });
      const tmp_limitPara = {
        ...limitParams,
        status: "draft",
      };
      classroomService
        .getTeacherAssignments(id, tmp_limitPara)
        .then((draft: any[]) => {
          draft.forEach((element) => {
            element.dueDate = new Date(element.dueDate);
          });
          setDraftAssign(draft);
        });
    }
    if (queryParams.get("type") === "published") {
      setType("published");

      setLimitParams({
        ...limitParams,
        status: "published",
      });
      const tmp_limitPara = {
        ...limitParams,
        status: "published",
      };
      classroomService
        .getTeacherAssignments(id, tmp_limitPara)
        .then((p: any[]) => {
          p.forEach((element) => {
            element.dueDate = new Date(element.dueDate);
          });
          setPublishAssign(p);
        });
    }
    if (queryParams.get("type") === "recentEvaluation") {
      setType("recentEvaluation");

      setParams({
        ...params,
        classroom: id,
      });
      const tmp_para = {
        ...params,
        classroom: id,
      };

      classroomService.getAllAssignmentByCount(tmp_para).then((d: any[]) => {
        d.forEach((e) => {
          e.notEvaluated = decimal(e.notEvaluated, 0);
          e.evaluated = decimal(e.evaluated, 0);
          if (e.evaluated === "100") {
            const tmp = recentEv;
            tmp.push(e);
            setRecentEv(tmp);
          }
        });
      });
    }
    if (queryParams.get("type") === "evaluation") {
      setType("evaluation");
      setParams({
        ...params,
        classroom: id,
      });
      const tmp_para = {
        ...params,
        classroom: id,
      };

      classroomService.getAllAssignmentByCount(tmp_para).then((d: any[]) => {
        d.forEach((e) => {
          e.notEvaluated = decimal(e.notEvaluated, 0);
          e.evaluated = decimal(e.evaluated, 0);
          if (e.evaluated === "100") {
            const tmp = recentEv;
            tmp.push(e);
            setRecentEv(tmp);
          }
        });
      });
    }
  }, []);

  const edit = (clsId: any, assign: any) => {
    push(
      `/classroom/create-assignment/${clsId}?assignment=${assign}&editMode=${true}`
    );
  };

  const update = (status: any, id: any) => {
    const params = { classroom: id, assignment: id, status: status };
    classroomService.updateTeacherAssignmentsStatus(params).then((data) => {
      classroomService
        .getTeacherAssignments(id, { status: "draft" })
        .then((draft) => {
          setDraftAssign(draft);
        });
      classroomService
        .getTeacherAssignments(id, { status: "published" })
        .then((p) => {
          setPublishAssign(p);
        });
      alertify.success("Successfully" + " " + status);
    });
  };

  return (
    <main className="pt-3">
      <div className="container">
        {type == "published" && (
          <div className="assignment-area">
            <div className="heading assignment mx-0 px-0 mb-2">
              <div className="title">
                <h3>Published Assignments</h3>
              </div>
            </div>
            <div className="row">
              {publishAssign.map((assgin) => (
                <div
                  key={assgin.assignments._id}
                  className="col-lg-3 col-md-4 col-6 mb-3"
                >
                  <div className="box bg-white pt-0">
                    <div className="box-inner box-inner_new">
                      <Link
                        href={`/assignment-details/${id}/${assgin.assignments._id}`}
                        className="info p-0 m-0 assignment-info-top"
                      >
                        <h4>{assgin.assignments.title}</h4>
                      </Link>
                      <div className="form-row assign-data fit-bar my-2 mx-0">
                        <div className="col student-time">
                          <div className="form-row align-items-center">
                            <span className="material-icons course assign">
                              date_range
                            </span>
                            <span className="icon-text assign-date-marks mt-0 ml-1">
                              {new Date(
                                assgin.assignments.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="form-row align-items-center">
                            <span className="material-icons course assign">
                              assessment
                            </span>
                            <span className="icon-text assign-date-marks mt-0 ml-1">
                              {assgin.assignments.maximumMarks}
                            </span>
                            <span className="icon-text assign-date-marks mt-0 ml-1">
                              Marks
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <a
                          className="btn btn-outline btn-sm btn-block"
                          onClick={() => edit(id, assgin.assignments._id)}
                        >
                          Edit
                        </a>
                      </div>
                      <div className="mt-2">
                        <a
                          className="btn btn-danger btn-sm btn-block"
                          onClick={() =>
                            update("revoked", assgin.assignments._id)
                          }
                        >
                          Withdraw
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {type == "draft" && (
          <div className="assignment-area">
            <div className="heading assignment mx-0 px-0 mb-2">
              <div className="row">
                <div className="title col">
                  <h3>Draft Assignments</h3>
                </div>
              </div>
            </div>
            <div className="row">
              {draftAssign.map((assgin) => (
                <div
                  key={assgin.assignments._id}
                  className="col-lg-3 col-md-4 col-6 mb-3"
                >
                  <div className="box bg-white pt-0 assignment-box-area">
                    <div className="box-inner box-inner_new">
                      <Link
                        href={`/assignment-details/${id}/${assgin.assignments._id}`}
                        className="info p-0 m-0 assignment-info-top"
                      >
                        <h4>{assgin.assignments.title}</h4>
                      </Link>
                      <div className="form-row assign-data fit-bar my-2 mx-0">
                        <div className="col student-time">
                          <div className="form-row align-items-center">
                            <span className="material-icons course assign">
                              date_range
                            </span>
                            <span className="icon-text assign-date-marks mt-0 ml-1">
                              {new Date(
                                assgin.assignments.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="form-row align-items-center">
                            <span className="material-icons course assign">
                              assessment
                            </span>
                            <span className="icon-text assign-date-marks mt-0 ml-1">
                              {assgin.assignments.maximumMarks}
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
                          onClick={() => edit(id, assgin.assignments._id)}
                        >
                          Edit
                        </a>
                      </div>
                      <div className="publish assign-btn">
                        <a
                          className="text-center"
                          onClick={() =>
                            update("published", assgin.assignments._id)
                          }
                        >
                          Publish
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {type == "recentEvaluation" && (
          <div className="assignment-area">
            <div className="heading">
              <div className="title">
                <h3>Recent Evaluations</h3>
              </div>
            </div>

            {recentEv && recentEv.length > 0 && (
              <div className="assignment-item-remove bg-white-remove">
                {recentEv.map((ev) => (
                  <div
                    key={ev.assignment._id}
                    className="assignment-item bg-white"
                  >
                    <div className="row">
                      <div className="col-md">
                        <div className="assignment-info">
                          <h3 className="text-capitalize text-black f-16 text-truncate">
                            {ev?.assignment.title}
                          </h3>
                          <div className="row pending-assign-dat recent-assign mt-2">
                            <div className="col-auto">
                              <div className="form-row align-items-center">
                                <span className="material-icons material-icons course assign">
                                  date_range
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {new Date(
                                    ev?.assignment.dueDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="form-row align-items-center">
                                <span className="material-icons course assign">
                                  assessment
                                </span>
                                <span className="icon-text assign-date-marks mt-0 ml-1">
                                  {ev?.assignment.maximumMarks} marks
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-auto">
                        <div className="ml-md-auto mt-4 mt-md-0">
                          <Link
                            href={`/assignment-details/${id}/${ev.assignment._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {type == "evaluation" && (
          <div className="assignment-area">
            <div className="heading assignment mx-0 px-0 mb-2">
              <div className="title">
                <h3>Pending Evaluations</h3>
              </div>
            </div>

            {assignments.map((a) => (
              <div
                key={a.assignment._id}
                className="assignment-item bg-white py-lg-0"
              >
                <div className="row align-items-lg-center">
                  <div className="col-lg-4">
                    <div className="assignment-info">
                      <h3 className="text-capitalize text-black f-16 text-truncate">
                        {a.assignment.title}
                      </h3>
                      <div className="row mt-2">
                        <div className="col-auto">
                          <div className="form-row align-items-center">
                            <span className="material-icons material-icons course assign">
                              date_range
                            </span>
                            {a.assignment.dueDate && (
                              <span className="mat-icons-remove icon-text assign-date-marks mt-0 ml-1">
                                {new Date(
                                  a.assignment.dueDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="form-row align-items-center">
                            <span className="material-icons course assign">
                              assessment
                            </span>
                            <span className="icon-text assign-date-marks mt-0 ml-1">
                              {a.assignment.maximumMarks} marks
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-8">
                    <div className="row align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="item-wrap clearfix svg-wrapper-120">
                          <CircleProgress
                            value={a.evaluated}
                            innerStrokeColor="#3FC7FA"
                            outerStrokeColor="#D9D9D9"
                            text=""
                          />
                          <h4>
                            <strong>Evaluated</strong>
                          </h4>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="item-wrap clearfix svg-wrapper-120">
                          <CircleProgress
                            value={a.notEvaluated}
                            innerStrokeColor="#FF6347"
                            outerStrokeColor="#D9D9D9"
                            text=""
                          />
                          <h4>
                            <strong>Not Evaluated</strong>
                          </h4>
                        </div>
                      </div>
                      <div className="col-auto ml-md-auto mt-4 mt-md-0">
                        <div className="view-details-btn-remove common-assign-btn-remove">
                          <Link
                            href={`/assignment-details/${id}/${a.assignment._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
export default ViewAllAssignment;
