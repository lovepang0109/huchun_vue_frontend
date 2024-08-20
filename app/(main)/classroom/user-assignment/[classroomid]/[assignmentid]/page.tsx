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
  const [assignment, setAssignment]: any = useState();
  const [isEvaluated, setIsEvaluated]: any = useState();

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
      const res = (
        await clientApi.get(
          `/api/classrooms/getUserAssignment${toQueryString(params)}`
        )
      ).data;
      setAssignment(res);
      setIsEvaluated(res.assignment.evaluated);
    } catch (e) {
      // error("assignment fetching error!");
    }
  };

  useEffect(() => {
    getAssignmentDetail();
  }, [user]);

  return (
    <div>
      <div id="wrapper">
        {assignment && (
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

            {!!assignment && (
              <main className="pt-lg-3">
                <div className="container">
                  <div className="assignment-content mx-auto">
                    <div className="heading">
                      <div className="heading-info">
                        <h3 className="wordwrap word-break-w">
                          {assignment?.assignment.ansTitle}
                        </h3>
                        <div className="name-info">
                          <h5>{assignment?.user}</h5>
                          <p>{assignment?.assignment.submittedOn}</p>
                        </div>
                      </div>
                    </div>

                    <div className="assignment-content-area">
                      {assignment?.assignment && (
                        <MathJax value={assignment?.assignment?.answerText} />
                      )}
                      {assignment && assignment.assignment.attachments && (
                        <div className="document-area">
                          {assignment.assignment.attachments.map(
                            (att: any, index: any) => {
                              return (
                                <div className="document bg-light" key={index}>
                                  <a href={att.url} target="_blank">
                                    <span>{att.name}</span>
                                  </a>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                      {!isEvaluated && (
                        <div className="submit-response-btn edit ml-auto">
                          <a
                            className="px-2 text-center"
                            href={`/classroom/assignment-submit/${classroomid}/${assignmentid}`}
                          >
                            Edit
                          </a>
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
