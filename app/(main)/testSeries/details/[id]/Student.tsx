import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getStudentPerformance } from "@/services/courseService";
import { getTaggingServicesForStudents } from "@/services/suportService";
import { confirm, success, alert } from "alertifyjs";
import clientApi from "@/lib/clientApi";
import { slugify } from "@/lib/validator";
import { transform, millisecondsToTime, fromNow, avatar } from "@/lib/pipe";
import { round, jsonToCsv } from "@/lib/common";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { getStudents } from "@/services/testseriesService";
import moment from "moment";

const StudentComponent = ({ testseries, settings }: any) => {
  const { id } = useParams();
  const router = useRouter();
  const [students, setStudents] = useState<any>([]);
  const [membersLoaded, setMembersLoaded] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    searchText: "",
    classroom: "",
    sortBy: "accuracy",
    dateRange: "All",
  });
  const [hasTests, setHasTests] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalContents, setTotalContents] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    const paramsData = params;
    if (
      testseries.accessMode == "invitation" &&
      testseries.classrooms &&
      testseries.classrooms[0]
    ) {
      paramsData.classroom = testseries.classrooms[0]._id;
      setParams({
        ...params,
        classroom: testseries.classrooms[0]._id,
      });
    }

    search(paramsData);
  }, []);

  const clearSearch = () => {
    setSearchText("");
  };

  const search = async (data: any, text?: string) => {
    if (text) setParams({ ...data, searchText: text, page: 1 });
    else setParams({ ...data, page: 1 });
    setMembersLoaded(false);

    getStudents(id, { ...data, count: true }).then((res: any) => {
      setStudents(res.students);
      setTotalCount(res.count);
    });

    setMembersLoaded(true);
  };

  const openStudentChat = (studentId: string) => {
    // TODO: implement open student chat feature
  };

  const loadMore = async () => {
    const paramsData = params;
    paramsData.page++;
    setParams(paramsData);
    setLoading(true);
    getStudents(id, paramsData).then((res: any) => {
      setTotalCount(res.count);
      setStudents(students.concat(calculateLevel(res.students)));
    });
    setLoading(false);
  };

  const calculateLevel = (students: any) => {
    if (settings.features.studentLevel && testseries.testLevel) {
      for (const user of students) {
        let minLevel = 0;
        for (const s of testseries.subjects) {
          // only consider subjects having levels
          if (s.levels && s.levels.length) {
            const subLevel = user.info.levelHistory.find(
              (l: any) => l.subjectId == s._id
            );
            if (subLevel && (minLevel == 0 || subLevel.level < minLevel)) {
              minLevel = subLevel.level;
            }
          }
        }
        user.level = !minLevel ? 1 : minLevel;
      }
    }

    return students;
  };

  const viewProgress = (student: any) => {
    // router.push(`../student-progress/${course._id}/${student}`);
  };

  return (
    <div className="dashboard-area classroom mx-auto">
      <div className="rounded-boxes bg-white">
        <div className="d-flex justify-content-between">
          <div className="section_heading_wrapper">
            <h3 className="section_top_heading">Students ({totalCount})</h3>
          </div>
          <div className="d-flex gap-xs">
            {testseries.accessMode === "invitation" &&
              testseries.classrooms.length > 0 && (
                <div>
                  <div className="form-boxes">
                    <h4 className="form-box_subtitle">Classroom</h4>
                  </div>
                  <select
                    className="form-control mt-0"
                    name="cbClass"
                    value={params.classroom}
                    onChange={(e: any) => {
                      const paramsData = params;
                      paramsData.classroom = e.target.value;
                      search(paramsData);
                    }}
                  >
                    <option value="" disabled>
                      Select Classroom
                    </option>
                    {testseries?.classrooms?.map((cls: any) => (
                      <option key={cls._id} value={cls}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            <div>
              <div className="form-boxes">
                <h4 className="form-box_subtitle">Search</h4>
              </div>
              <div className="member-search">
                <input
                  type="text"
                  placeholder="Search..."
                  defaultValue={params.searchText}
                  onChange={(e) => search(params, e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        {students && students.length && (
          <>
            <div className="folder-area clearfix">
              <div className="table-responsive table-wrap">
                <table className="table vertical-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0">Name</th>
                      <th className="border-0">Progress</th>
                      <th className="border-0 text-center">
                        Attempted Questions
                      </th>
                      <th className="border-0 text-center">Accuracy</th>
                      <th className="border-0 text-center">Time Spent</th>
                      <th className="border-0 text-center">
                        {settings.features.studentLevel && testseries.testLevel
                          ? "Current Level"
                          : ""}
                      </th>
                      <th className="border-0"></th>
                    </tr>
                  </thead>
                  {membersLoaded ? (
                    <tbody>
                      {students.map((student: any) => (
                        <tr key={student._id}>
                          <td className="px-0 name-col">
                            <div className="folder mb-0 p-0">
                              <a
                                className="d-flex align-items-center border-0 p-0"
                                href={`/public/profile/${student._id}`}
                              >
                                <figure className="user_img_circled_wrap">
                                  <img
                                    className="avatar"
                                    src={`${avatar(student.info)}`}
                                    alt=""
                                  />
                                </figure>
                                <div className="inner ml-2 pl-0">
                                  <div className="inners">
                                    <div className="d-flex align-items-center">
                                      <h4>{student.info.name}</h4>
                                    </div>
                                    <p>{student.info.userId}</p>
                                  </div>
                                </div>
                              </a>
                            </div>
                          </td>
                          <td>
                            <p className="text-black">
                              {student.doTests}/{testseries.practiceIds.length}
                              &nbsp;(
                              {(
                                (student.doTests /
                                  testseries.practiceIds.length) *
                                100
                              ).toFixed(2)}
                              %)
                            </p>
                            <span>
                              Last active{" "}
                              {moment(student.info.lastLogin).fromNow()}
                            </span>
                          </td>
                          <td>
                            <p className="text-black text-center">
                              {student.doQuestions}/{testseries.totalQuestions}
                            </p>
                          </td>
                          <td>
                            <p className="text-black text-center">
                              {(student.accuracy * 100).toFixed(2)}%
                            </p>
                          </td>
                          <td>
                            <p className="text-black text-center">
                              {(student.timeSpent / 1000 / 60).toFixed(2)} min
                            </p>
                          </td>
                          <td>
                            {settings.features.studentLevel &&
                              testseries.testLevel && (
                                <p className="text-black text-center">
                                  {student.level}
                                </p>
                              )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm ml-2"
                              title="Chat"
                              onClick={() => openStudentChat(student.info)}
                            >
                              <i className="fas fa-comment"></i>
                            </button>
                            <a
                              className="btn btn-outline btn-sm ml-2"
                              href={`../../student-analytics/${testseries._id}/${student._id}`}
                            >
                              Analytics
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr>
                        <td colSpan={7}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
            </div>
            {totalCount > students.length && (
              <div className="text-center">
                <button
                  className="btn btn-light"
                  disabled={loading}
                  onClick={() => loadMore()}
                >
                  Load More{" "}
                  <i
                    className={`fa fa-spinner fa-pulse ml-1 ${
                      loading ? "visible" : "invisible"
                    }`}
                  ></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {(!students || !students.length) && (
        <div className=" folder-area clearfix mx-auto mt-5">
          <img
            className="mx-auto"
            src="/assets/images/NoMember.svg"
            alt="image"
          />
          <p className="text-center">No students yet</p>
        </div>
      )}
    </div>
  );
};

export default StudentComponent;
