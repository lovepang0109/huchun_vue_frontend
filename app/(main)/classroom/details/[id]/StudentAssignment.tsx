"use client";

import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { error } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import * as classroomService from "@/services/classroomService";
import CircleProgress from "react-circular-progressbar";
import moment from "moment";

const ClassroomAssignment = ({ classroom }: any) => {
  const [assignments, setAssignments] = useState<any>([]);
  const [userAssignment, setUserAssignment] = useState([]);
  const { push } = useRouter();
  const user: any = useSession()?.data?.user?.info || {};

  useEffect(() => {
    classroomService
      .getAllAssignments(classroom._id)
      .then((data: any[]) => {
        classroomService
          .getAllUserAssignment(classroom._id)
          .then((res: any) => {
            setUserAssignment(res.assignment);
            if (res.assignment) {
              const d = data.map((o) =>
                res.assignment.some(({ _id }) => o._id === _id)
              );
              d.forEach((e, i) => {
                if (!e) {
                  setAssignments([...assignments, data[i]]);
                }
              });
            } else {
              setAssignments(data);
            }
          });
      })
      .catch((err) => {
        setAssignments([]);
        setUserAssignment([]);
      });
  }, []);

  // React useEffect to mimic Angular ngOnInit

  return (
    <div id="wrapper">
      <main className="pt-0">
        <div className="dashboard-area classroom mx-auto">
          <div className="rounded-boxes class-board assignment assignment-new_new bg-white p-3">
            <div className="square_profile_info clearfix classroom-topImage1 d-flex align-items-center">
              <figure className="squared-rounded_wrap_80">
                <img
                  src={classroom.imageUrl || classroomImg}
                  alt=""
                  className="user_squared-rounded"
                />
              </figure>
              <div className="class-board-info ml-0 pl-3">
                <h3 className="top-title text-truncate">{classroom.name}</h3>
                {classroom.user && (
                  <p className="bottom-title text-truncate">
                    {classroom.user.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {userAssignment && userAssignment.length > 0 && (
            <div className="assignment-area">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Submitted</h3>
              </div>
              {userAssignment.map((userAss, index) => (
                <div
                  key={index}
                  className="assignment-item bg-white cursor-pointer"
                >
                  <div className="row align-items-center">
                    <div className="col-lg-10">
                      <Link
                        href={`/classroom/stu-assignment-details/${classroom._id}/${userAss?._id}`}
                      >
                        <div className="assignment-info">
                          <h6 className="text-truncate">
                            {userAss?.title.length > 10
                              ? `${userAss?.title.substring(0, 10)}...`
                              : userAss?.title}
                          </h6>
                        </div>
                      </Link>
                    </div>
                    <div className="col-lg-2 ml-auto">
                      <div className="assignment-info-right ml-auto">
                        {userAss?.evaluated ? (
                          <span>
                            <strong>
                              {userAss?.totalMark}/{userAss?.maximumMarks}
                            </strong>
                          </span>
                        ) : (
                          <span>In Evaluation</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {assignments && assignments.length > 0 && (
            <div className="assignment-area">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Pending Assignments</h3>
              </div>
              {assignments.map((assgin) => (
                <div
                  key={assgin._id}
                  className="assignment-item bg-white cursor-pointer"
                >
                  <div className="row align-items-center">
                    <div className="col-lg-10">
                      <Link
                        href={`/classroom/stu-assignment-details/${classroom._id}/${assgin._id}`}
                      >
                        <div className="assignment-info">
                          <strong className="text-truncate">
                            {assgin.title}
                          </strong>
                        </div>
                      </Link>
                    </div>
                    <div className="col-lg-2 ml-auto">
                      <div className="assignment-info-right ml-auto">
                        <span>
                          {moment(assgin.dueDate).format("YYYY-MM-DD")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {userAssignment &&
            userAssignment.length === 0 &&
            assignments &&
            assignments.length === 0 && (
              <div className="rounded-boxes bg-white">
                <div className="empty-data">
                  <img
                    src={"/assets/images/broNoAssignment.svg"}
                    alt="Not Found"
                  />
                  <strong className="text-center">
                    No assignments have been added yet.
                  </strong>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};
export default ClassroomAssignment;
