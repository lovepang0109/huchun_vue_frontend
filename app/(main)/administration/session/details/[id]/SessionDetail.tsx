"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as sessionService from "@/services/SessionService";
import alertify from "alertifyjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useRouter } from "next/navigation";
import { TagsInput } from "react-tag-input-component";
import Multiselect from "multiselect-react-dropdown";
import { Accordion, Card, Button } from "react-bootstrap";
import Link from "next/link";
import moment from "moment";
import { fromNow } from "@/lib/pipe";

export default function SessionDetailComponent() {
  const { id } = useParams();
  const { push } = useRouter();
  const [sessions, setSessions] = useState<any>([]);
  const [sessionDetails, setSessionDetails] = useState<any>({});
  const [sessionId, setSessionId] = useState<string>("");
  const [isOpen, setIsOpen] = useState<booelean>(false);

  useEffect(() => {
    setSessionId(id);
    sessionService.getPracticesBySession(id).then((data) => {
      setSessions(data);
    });
    sessionService.getSessionDetails(id).then((data) => {
      setSessionDetails(data[0]);
    });
  }, []);

  const updateStatus = (c: any, status: any) => {
    sessionService
      .updateStudentStatus(sessionId, {
        classroom: c.classroomId,
        active: status,
      })
      .then((data) => {
        if (status) {
          const value = { val: c.studentInactive };
          const v = { ...value };
          c.studentActive = v.val;
          c.studentInactive = 0;
          c.classroomActive = true;
        } else {
          const value = { val: c.studentActive };
          const v = { ...value };
          c.studentActive = 0;
          c.studentInactive = v.val;
          c.classroomActive = false;
        }

        alertify.success("Successfully Updated");
        push(`/administration/session/details/${id}`);
      });
  };
  return (
    <main className="pt-lg-3 Admininistration-admin_new admiN-location-new">
      <div className="container">
        <div className="dashboard-area classroom mx-auto">
          <div className="row">
            <div className="col-lg-12">
              <section className="rounded-boxes details mt-0 text-white">
                <div>
                  <div className="details-area course mx-auto px-0">
                    <div className="row mx-0">
                      <div className="col-md-8">
                        <div className="asses-info1">
                          <div className="title-wrap clearfix">
                            <div className="title">
                              <h3 className="f-18 admin-head1 text-capitalize text-white">
                                {sessionDetails.title}
                              </h3>
                            </div>
                          </div>

                          <div className="asses-user pt-0">
                            <div className="inner">
                              <p className="f-14 font-weight-normal">
                                {moment(
                                  new Date(sessionDetails.createdAt)
                                ).format("MMMM D, YYYY h:mm A")}
                                ({fromNow(new Date(sessionDetails.createdAt))})
                                <span className="font-weight-light">
                                  {" "}
                                  allowance time
                                </span>
                                {sessionDetails.loginAllowanceTime} mins
                              </p>
                            </div>
                          </div>

                          <span>
                            <div className="assess-demo-head">
                              <div>
                                <div className="asses-right overview clearfix border-0">
                                  <div className="asses-item border-0 pl-0">
                                    <h4 className="text-center">
                                      {sessionDetails.classroomCount}
                                    </h4>
                                    <span>Classrooms</span>
                                  </div>

                                  <div className="asses-item border-0">
                                    <h4 className="text-center">
                                      {sessionDetails?.totalStudents || "No"}
                                    </h4>
                                    <span>Students</span>
                                  </div>

                                  <div className="asses-item border-0 pr-3">
                                    <h4 className="text-center">
                                      {sessionDetails.totalQuestion}
                                    </h4>
                                    <span>Questions</span>
                                  </div>
                                  <div className="asses-item border-white pr-4">
                                    <h4 className="text-center">
                                      {sessionDetails.published}
                                    </h4>
                                    <span>Published Tests</span>
                                  </div>
                                  <div className="asses-item border-0 pr-4">
                                    <h4 className="text-center">
                                      {sessionDetails.draft}
                                    </h4>
                                    <span>Draft Tests</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </span>
                        </div>
                      </div>

                      <div className="col-md-4 text-right">
                        <span className="save-ch-btn-remove-text-NewEdit_new3">
                          {sessionDetails._id &&
                            sessionDetails._id.sessionId && (
                              <Link
                                className="btn btn-primary btn-sm"
                                href={`/administration/session/create?id=${sessionDetails._id.sessionId}`}
                              >
                                Edit
                              </Link>
                            )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div>
                <div className="rounded-boxes bg-white">
                  <div className="UserCardAdmiN-AlL1">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="info">
                          <Accordion>
                            {sessions.map((p, i) => (
                              <Card
                                key={i}
                                className="rounded-boxes course-content newCourse_newContent bg-white"
                              >
                                <Accordion.Toggle
                                  as={Card.Header}
                                  eventKey={String(i)}
                                  className="panel-heading card-header panel-enabled"
                                  onClick={() => setIsOpen(!isOpen)}
                                >
                                  <div className="course-content bg-white">
                                    <div className="content mb-2 pl-0 mt-0">
                                      <div className="row">
                                        <div className="col-md">
                                          <h4 className="f-16 d-inline-block">
                                            {p.title}
                                          </h4>
                                          <span className="admin-draft-tag ml-2 p-1">
                                            {p.status}
                                          </span>
                                          <p className="f-12 admin-info1 mt-0 ml-0">
                                            {p.subjects[0].name}
                                          </p>
                                          <div className="admin-wrap mx-0 mt-0 pb-0">
                                            <div className="bottom clearfix mt-2">
                                              <div className="row">
                                                <div className="col-lg-3 d-flex align-items-center">
                                                  <span className="material-icons m-0 float-none">
                                                    groups
                                                  </span>
                                                  <span className="ml-1">
                                                    {p.classroomCount}{" "}
                                                    Classrooms
                                                  </span>
                                                </div>
                                                <div className="col-lg-3 d-flex align-items-center">
                                                  <span className="material-icons m-0 float-none">
                                                    people
                                                  </span>
                                                  <span className="ml-1">
                                                    {p.totalStudents} Students
                                                  </span>
                                                </div>
                                                <div className="col-lg-3 d-flex align-items-center">
                                                  <span className="material-icons m-0 float-none">
                                                    assignment
                                                  </span>
                                                  <span className="ml-1">
                                                    {p.totalQuestion} Questions
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="col-md-auto text-right">
                                          <span className="admin-manage-btn-remove-admin-mange-btn1_new">
                                            {p._id &&
                                              p._id.practiceId &&
                                              sessionDetails._id &&
                                              sessionDetails._id.sessionId && (
                                                <Link
                                                  className="btn btn-outline btn-sm"
                                                  href={`/administration/session/manageStudents/${sessionDetails._id.sessionId}/${p._id.practiceId}`}
                                                >
                                                  Manage Students
                                                </Link>
                                              )}
                                          </span>
                                          <span className="material-icons ml-2 mr-0 mt-0 f-26">
                                            {isOpen
                                              ? "expand_less"
                                              : "expand_more"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Accordion.Toggle>
                                <hr />
                                <Accordion.Collapse eventKey={String(i)}>
                                  <Card.Body className="content mb-2 pl-0">
                                    <div className="asses-rights clearfix border-0 py-0">
                                      {p.classroom.map((c, index) => (
                                        <div className="row mt-2" key={index}>
                                          <div className="admin-wrap1 col-lg-3 d-flex align-items-center newAdmin-wrap_new">
                                            <span className="material-icons m-0 float-none">
                                              groups
                                            </span>
                                            <span className="ml-1">
                                              {c.classroomName}
                                            </span>
                                          </div>
                                          <div className="admin-wrap1 col-lg-3 d-flex align-items-center">
                                            <span className="material-icons m-0 float-none">
                                              people
                                            </span>
                                            <span className="mcq-status1 ml-1">
                                              <strong className="student mr-1">
                                                {c.studentActive}
                                              </strong>
                                              Active
                                            </span>
                                          </div>
                                          <div className="admin-wrap1 col-lg-3 d-flex align-items-center">
                                            <span>
                                              <strong className="student mr-1">
                                                {c.studentInactive}
                                              </strong>
                                              Inactive
                                            </span>
                                          </div>
                                          <div className="col-lg-3 text-right">
                                            <span className="mt-1">
                                              {!c.classroomActive ? (
                                                <a
                                                  className="btn btn-sm btn-primary"
                                                  variant="primary"
                                                  size="sm"
                                                  onClick={() =>
                                                    updateStatus(c, true)
                                                  }
                                                >
                                                  Activate
                                                </a>
                                              ) : (
                                                <a
                                                  className="btn btn-sm btn-deactivate"
                                                  variant="outline-secondary"
                                                  size="sm"
                                                  onClick={() =>
                                                    updateStatus(c, false)
                                                  }
                                                >
                                                  Deactivate
                                                </a>
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </Card.Body>
                                </Accordion.Collapse>
                              </Card>
                            ))}
                          </Accordion>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
