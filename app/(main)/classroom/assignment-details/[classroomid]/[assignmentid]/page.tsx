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

const ClassroomDetail = () => {
  const { classroomid, assignmentid } = useParams();
  const { user }: any = useSession()?.data || {};
  const { push } = useRouter();

  const [data, setData]: any = useState();
  const [assignment, setAssignment]: any = useState();

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
      setAssignment(res);
    } catch (e) {
      // error("assignment fetching error!");
    }
  };

  useEffect(() => {
    getAssignmentDetail();
  }, [user]);

  return (
    <div>
      <div id="wrapper" className="" style={{ backgroundColor: "#f4f4f7" }}>
        {data && (
          <div>
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
            {!assignment && !assignment?.assignment.evaluated && (
              <main className="pt-0">
                <div className="container">
                  <div className="assignment-content mx-auto">
                    <div className="heading">
                      <div className="row">
                        <div className="col-lg-9">
                          <div className="heading-info">
                            <h3 className="text-truncate">
                              {data?.assignment?.title}
                            </h3>
                            <div className="name-info">
                              <h5>{data?.createdBy?.name}</h5>
                              <p>
                                {new Date(
                                  data.assignment.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!!assignment && (
                      <div
                        className="submission"
                        onClick={() =>
                          push(
                            `/classroom/assignment-submit/${classroomid}/${assignmentid}`
                          )
                        }
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
                              {!assignment?.assignment.evaluated ? (
                                <div className="status ml-auto">
                                  <p>Submitted</p>
                                </div>
                              ) : (
                                <div className="status ml-auto">
                                  <p>Returned</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </main>
            )}
            {assignment?.assignment && (
              <main className="pt-3">
                <div className="container">
                  <div className="assignment-container mx-auto mw-100">
                    <div className="row justify-content-center">
                      <div className="col-lg-9 ">
                        <div
                          className="rounded-boxes assignment-content mw-0 px-0 mx-auto"
                          style={{
                            backgroundColor: "#f4f4f7",
                            maxWidth: 700,
                          }}
                        >
                          {" "}
                          <div className="heading">
                            <div className="heading-info">
                              <div className="name-info row">
                                <div className="col-lg-6">
                                  <h3>{data?.assignment?.title}</h3>
                                  <h5>{data?.createdBy?.name}</h5>
                                  <p>
                                    {new Date(
                                      data.assignment.createdAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
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
                                          src="/assets/images/zondicons_education.png"
                                          alt=""
                                        />
                                      </figure>
                                      <span>
                                        {data?.assignment?.maximumMarks}
                                      </span>
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
                                          src="/assets/images/carbon_document-export.png"
                                          alt=""
                                        />
                                      </figure>
                                      <span>
                                        {data?.submitted}/{data?.total}
                                      </span>
                                      <p>Submissions</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*<div className="assignment-content-area">
                            {data?.assignment && (
                              <MathJax value={data?.assignment?.description} />
                            )}
                            {data?.assignment?.attachments &&
                              data?.assignment?.attachments.length > 0 && (
                                <div className="document-area">
                                  {data?.assignment?.attachments.map(
                                    (att: any, index: any) => {
                                      return (
                                        <div className="document" key={att._id}>
                                          <a href={att.url} target="_blank">
                                            <span>{att.name}</span>
                                          </a>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            {!assignment && (
                              <div className="submit-response-btn ml-auto mt-2">
                                <a
                                  className="px-2 text-center"
                                  href={`/classroom/assignment-submit/${classroomid}/${assignmentid}`}
                                >
                                  Submit Response
                                </a>
                              </div>
                            )}
                          </div>*/}
                        </div>
                        <div
                          className="assignment-content-area mx-auto"
                          style={{
                            maxWidth: 700,
                          }}
                        >
                          <div className="rounded-boxes less-padding-x class-board assignment assignFolder-display bg-white">
                            <MathJax
                              value={data?.assignment?.description}
                            ></MathJax>
                          </div>
                          {data?.assignment?.attachments &&
                            data?.assignment?.attachments.length > 0 && (
                              <div className="document-area">
                                {data?.assignment?.attachments.map(
                                  (att: any, index: any) => {
                                    return (
                                      <div className="document" key={att._id}>
                                        <a
                                          href={`https://www.practiz.xyz${att.url}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <span>{att.name}</span>
                                        </a>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          {!assignment && (
                            <div className="submit-response-btn ml-auto mt-2 mx-auto">
                              <a
                                className="px-2 text-center"
                                href={`/classroom/assignment-submit/${classroomid}/${assignmentid}`}
                              >
                                Submit Response
                              </a>
                            </div>
                          )}
                        </div>
                        <div
                          className="rounded-boxes assignment-content-area mx-auto px-0"
                          style={{
                            backgroundColor: "#f4f4f7",
                            maxWidth: 700,
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        >
                          {!!assignment && (
                            <div className="submission">
                              <div className="d-none d-lg-block ">
                                <h4>Submission</h4>
                              </div>

                              <div
                                className="submission-wrap"
                                style={{ cursor: "pointer", maxWidth: 700 }}
                                onClick={() =>
                                  push(
                                    `/classroom/user-assignment/${classroomid}/${assignmentid}`
                                  )
                                }
                              >
                                <div className="row">
                                  <div className="col-lg-9">
                                    <h5>{assignment?.assignment.ansTitle}</h5>
                                  </div>

                                  <div className="col-lg-3">
                                    {!assignment?.assignment.evaluated ? (
                                      <div className="status ml-auto">
                                        <p>Submitted</p>
                                      </div>
                                    ) : (
                                      <div className="status ml-auto">
                                        <p>Returned</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {assignment?.assignment.evaluated && (
                        <div className="col-lg-3">
                          <div className="score-wrap">
                            <div className="rounded-boxes bg-white score">
                              <h4>SCORE</h4>
                              <span className="text-center">
                                {assignment?.assignment.totalMark}/
                                {data?.assignment.maximumMarks}
                              </span>
                            </div>
                            {assignment?.assignment.feedback && (
                              <div className="rounded-boxes bg-white score">
                                <h4>Instructor</h4>

                                <div className="profile-img clearfix">
                                  <div className="user_img_circled_wrap mr-2">
                                    <img
                                      // src={data.createdBy.avatar ? ''}
                                      src="/assets/images/defaultProfile.png"
                                      className="user_img_circled"
                                      alt=""
                                    />
                                  </div>

                                  <div className="inner">
                                    <h6>{data.createdBy.name}</h6>
                                  </div>
                                </div>
                                {assignment.assignment.feedback?.text && (
                                  <MathJax
                                    value={assignment?.assignment.feedback.text}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </main>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ClassroomDetail;
