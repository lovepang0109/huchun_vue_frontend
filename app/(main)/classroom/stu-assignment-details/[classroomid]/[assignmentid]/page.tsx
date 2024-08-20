"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { error } from "alertifyjs";
import Link from "next/link";
import { toQueryString } from "@/lib/validator";
import { useRouter } from "next/navigation";
import MathJax from "@/components/assessment/mathjax";
import * as classroomService from "@/services/classroomService";
import * as userService from "@/services/userService";
import moment from "moment";
import { avatar } from "@/lib/pipe";
import Mathjax from "@/components/assessment/mathjax";

const StudentAssignmentDetail = () => {
  const { classroomid, assignmentid } = useParams();
  const { user }: any = useSession()?.data || {};
  const { push } = useRouter();

  const [data, setData]: any = useState();
  const [assignment, setAssignment]: any = useState();
  const [params, setParams] = useState<any>({
    classroom: "",
    assignment: "",
    student: "",
  });

  useEffect(() => {
    userService.get().then((usr) => {
      const para = params;
      para.student = usr._id;
      para.classroom = classroomid;
      para.assignment = assignmentid;
      setParams(para);
      classroomService.getAssignmentById(para).then((da) => {
        setData(da);
      });
      classroomService.getUserAssignment(para).then((data) => {
        setAssignment(data);
      });
    });
  }, []);

  return (
    <div id="wrapper">
      {data && (
        <div className="container">
          <div className="search-bar">
            <div id="wrap">
              <form>
                <div className="form-group">
                  <div className="arrow">
                    <a id="arrow" href="#">
                      <figure>
                        <img
                          src={"/assets/images/arrow-left.png"}
                          alt="Arrow Left"
                        />
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
          <main className="pt-0">
            {!assignment?.assignment.evaluated ? (
              <div className="container">
                <div className="assignment-content mx-auto">
                  <div className="heading">
                    <div className="row">
                      <div className="col-lg-9">
                        <div className="heading-info">
                          <h3 className="text-truncate">
                            {data.assignment.title}
                          </h3>
                          <div className="name-info">
                            <h5>{data.createdBy.name}</h5>
                            <p>
                              {moment(data.assignment.createdAt).format("LL")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-auto ml-auto">
                        <div className="item-wrap clearfix ml-auto">
                          <div
                            className="item border-0"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Marks"
                          >
                            <figure>
                              <img
                                src={"/assets/images/zondicons_education.png"}
                                alt="Education"
                              />
                            </figure>
                            <span>{data.assignment.maximumMarks}</span>
                            <p>Marks</p>
                          </div>
                          <div
                            className="item pr-0"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Submissions"
                          >
                            <figure>
                              <img
                                src={
                                  "/assets/images/carbon_document-export.png"
                                }
                                alt="Document Export"
                              />
                            </figure>
                            <span>
                              {data.submitted}/{data.total}
                            </span>
                            <p>Submissions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="assignment-content-area">
                    <div className="rounded-boxes less-padding-x class-board assignment assignFolder-display bg-white">
                      <MathJax value={data.assignment.description} />
                    </div>
                    {data.assignment.attachments &&
                      data.assignment.attachments.length > 0 && (
                        <div className="document-area">
                          {data.assignment.attachments.map((att, index) => (
                            <div className="document" key={index}>
                              <Link
                                href={`https://www.practiz.xyz/${att.url}`}
                                target="_blank"
                              >
                                <span>{att.name}</span>
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    {!assignment && (
                      <div className="submit-response-btn ml-auto mt-2">
                        <Link
                          className="px-2 text-center"
                          href={`/classroom/assignment-submit/${params.classroom}/${params.assignment}`}
                        >
                          Submit Response
                        </Link>
                      </div>
                    )}
                  </div>
                  {assignment && (
                    <div
                      className="submission"
                      onClick={() => {
                        push(
                          `/classroom/user-assignment/${params.classroom}/${params.assignment}`
                        );
                      }}
                    >
                      <div className="d-none d-lg-block">
                        <h4>Submission</h4>
                      </div>
                      <div className="submission-wrap">
                        <div className="row">
                          <div className="col-lg-9">
                            <h5>{assignment.assignment.ansTitle}</h5>
                          </div>
                          <div className="col-lg-3">
                            <div className="status ml-auto">
                              <p>
                                {assignment.assignment.evaluated
                                  ? "Returned"
                                  : "Submitted"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="container">
                <div className="assignment-container mx-auto mw-100">
                  <div className="row">
                    <div className="col-lg-9">
                      <div className="rounded-boxes bg-white assignment-content mw-100">
                        <div className="heading">
                          <div className="heading-info">
                            <h3>{data.assignment.title}</h3>
                            <div className="name-info">
                              <h5>{data.createdBy.name}</h5>
                              <div className="row">
                                <div className="col-lg-6">
                                  <p>
                                    {moment(data.assignment.createdAt).format(
                                      "LL"
                                    )}
                                  </p>
                                </div>
                                <div className="col-lg-6">
                                  <div className="time ml-auto">
                                    <span>
                                      Submitted On{" "}
                                      {moment(
                                        assignment.assignment.submittedOn
                                      ).format("LLL")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="assignment-content-area">
                          <MathJax value={data.assignment.description} />
                          {data.assignment.attachments &&
                            data.assignment.attachments.length > 0 && (
                              <div className="document-area">
                                {data.assignment.attachments.map(
                                  (att, index) => (
                                    <div className="document" key={index}>
                                      <Link href={att.url} target="_blank">
                                        <span>{att.name}</span>
                                      </Link>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          {!assignment && (
                            <div className="submit-response-btn ml-auto mt-2">
                              <Link
                                className="px-2 text-center"
                                href={`/classroom/assignment-submit/${params.classroom}/${params.assignment}`}
                              >
                                Submit Response
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                      {assignment && (
                        <div className="rounded-boxes bg-white assignment-content mw-100">
                          <div className="submission">
                            <div className="d-none d-lg-block">
                              <h4>Submission</h4>
                            </div>
                            <Link
                              className="submission-wrap"
                              href={`/classroom/user-assignment/${params.classroom}/${params.assignment}`}
                            >
                              <div className="row">
                                <div className="col-lg-9">
                                  <h5>{assignment.assignment.ansTitle}</h5>
                                </div>
                                <div className="col-lg-3">
                                  <div className="status ml-auto">
                                    <p>
                                      {assignment.assignment.evaluated
                                        ? "Returned"
                                        : "Submitted"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                    {assignment && assignment.assignment.evaluated && (
                      <div className="col-lg-3">
                        <div className="score-wrap">
                          <div className="rounded-boxes bg-white score">
                            <h4>SCORE</h4>
                            <span className="text-center">
                              {assignment.assignment.totalMark}/
                              {data.assignment.maximumMarks}
                            </span>
                          </div>
                          {assignment.assignment.feedback && (
                            <div className="rounded-boxes bg-white score">
                              <h4>Instructor</h4>
                              <div className="profile-img clearfix">
                                <div className="user_img_circled_wrap mr-2">
                                  <img
                                    src={avatar(data.createdBy)}
                                    className="user_img_circled"
                                    alt=""
                                  />
                                </div>
                                <div className="inner">
                                  <h6>{data.createdBy.name}</h6>
                                </div>
                              </div>
                              <Mathjax
                                value={assignment.assignment.feedback.text}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
export default StudentAssignmentDetail;
