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
import moment from "moment";

interface ParamsInterfeceEntry {
  limit: number;
  page: number;
  searchText: string;
  classroom: string;
  sortBy: string;
  dateRange: string;
}

const CourseStuduentComponent = ({ course, setCourse, user }: any) => {
  const { id } = useParams();
  const router = useRouter();
  const [members, setMembers] = useState<any>([]);
  const [membersLoaded, setMembersLoaded] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [params, setParams] = useState<ParamsInterfeceEntry>({
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
    setHasTests(
      course.sections.find(
        (s: any) =>
          !!s.contents.find(
            (c: any) => c.type == "quiz" || c.type == "assessment"
          )
      )
    );
    if (
      course.accessMode == "invitation" &&
      course.classrooms &&
      course.classrooms[0]
    ) {
      paramsData.classroom = course.classrooms[0]._id;
      setParams(paramsData);
    }

    let totalContentsData = totalContents;
    for (const sec of course.sections) {
      if (sec.status == "published") {
        for (const c of sec.contents) {
          if (c.active) {
            totalContentsData++;
          }
        }
      }
    }
    setTotalContents(totalContentsData);

    search(paramsData);
  }, []);

  const clearSearch = () => {
    setSearchText("");
  };

  const search = async (data: any, text?: string) => {
    if (text) setParams({ ...data, searchText: text, page: 1 });
    else setParams({ ...data, page: 1 });
    setMembersLoaded(false);

    getStudentPerformance(id, { ...data, count: true }).then((res: any) => {
      setMembers(res.students);
      setTotalCount(res.count);

      getServices(res.students);
    });

    setMembersLoaded(true);
  };

  const searchTextFun = async (text: string) => {
    if (text) setParams({ ...params, searchText: text, page: 1 });
    setMembersLoaded(false);

    getStudentPerformance(id, { ...params, count: true }).then((res: any) => {
      setMembers(res.students);
      setTotalCount(res.count);

      getServices(res.students);
    });

    setMembersLoaded(true);
  };

  const getServices = (members: any) => {
    if (members.length) {
      getTaggingServicesForStudents(members.map((r: any) => r.user)).then(
        (serviceMap: any[]) => {
          const updatedMembers = members.map((member: any) => {
            if (serviceMap[member.user]) {
              member.services = serviceMap[member.user].services;
            }
            return member;
          });
        }
      );
    }
  };

  const openStudentChat = (studentId: string, name: string) => {
    // TODO: implement open student chat feature
  };

  const createCertificate = async (member: any) => {
    confirm(
      "This will allow student to download course certificate. Are you sure?",
      async (ok: any) => {
        const data = {
          course: id,
          issuedBy: user._id,
          issuedTo: member.user,
          title: course.title,
          imageUrl: course.imageUrl || "",
        };
        await clientApi
          .post(`/api/certificates`, data)
          .then((res: any) => {
            success(
              "Student has completed this course and certificate is successfully generated"
            );
            setMembers((prevArray: any) => {
              const index = prevArray.findIndex(
                (mem: any) => mem.user === member.user
              );
              if (index !== -1) {
                const newArray = [...prevArray];
                newArray[index] = { ...newArray[index], isCerti: true };
                return newArray;
              }
              return prevArray;
            });
          })
          .catch((err: any) => {
            console.log(err);
            alert("Message", "Request was failed");
          });
      }
    );
  };

  const loadMore = async () => {
    const paramsData = params;
    paramsData.page++;
    setParams(paramsData);
    setLoading(true);
    getStudentPerformance(id, paramsData).then((res: any) => {
      setTotalCount(res.count);
      setMembers(members.concat(res.students));

      getServices(res.students);
    });
    setLoading(false);
  };

  const viewProgress = (student: any) => {
    router.push(`../student-progress/${course._id}/${student}`);
  };

  const download = async () => {
    setDownloading(true);
    getStudentPerformance(course._id, { ...params, nopaging: true }).then(
      ({ students }: any) => {
        const csvFileName = slugify((course.title = "students")) + ".csv";

        const dataPush = [
          [
            "UserID",
            "Name",
            "Accuracy",
            "Practice Time",
            "Learning Time",
            "Attempted Questions",
            "Course Completion",
            "Last Active",
          ],
        ];

        for (const student of students) {
          dataPush.push([
            '"=""' + student.userId + '"""',
            student.userName,
            round(student.accuracy * 100, 1),
            transform(student.practiceTime, "short"),
            transform(student.learningTime, "short"),
            student.attemptedQuestions,
            round((student.completedContents / totalContents) * 100, 0),
            moment(student.lastActive).format("MMMM Do YYYY h:mm a"),
          ]);
        }

        jsonToCsv(dataPush, csvFileName);
      }
    );
    setDownloading(false);
  };

  const dateRangeHandle = (e: any) => {
    const paramsData = params;
    paramsData.dateRange = e.target.value;
    setParams(paramsData);
    search(paramsData);
  };

  const dateSortHandle = (e: any) => {
    const paramsData = params;
    paramsData.sortBy = e.target.value;
    setParams(paramsData);
    search(paramsData);
  };

  const classroomHandle = (e: any) => {
    const paramsData = params;
    paramsData.classroom = e.target.value;
    setParams(paramsData);
    search(paramsData);
  };

  return (
    <>
      <div className="dashboard-area classroom mx-auto">
        <div className="rounded-boxes bg-white">
          <div className="d-flex justify-content-between">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">Students ({totalCount})</h3>
            </div>

            <div className="d-flex gap-xs">
              <div>
                <div className="form-boxes mb-1">
                  <h4 className="form-box_subtitle">Date Range</h4>
                </div>
                <select
                  className="form-control"
                  name="perDate"
                  defaultValue={params.dateRange}
                  onChange={(e) => dateRangeHandle(e)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="15">Last 15 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="All">All</option>
                </select>
              </div>
              <div>
                <div className="form-boxes mb-1">
                  <h4 className="form-box_subtitle">Arrange By</h4>
                </div>
                <select
                  className="form-control"
                  name="perArrange"
                  defaultValue={params.sortBy}
                  onChange={(e) => dateSortHandle(e)}
                >
                  <option value="accuracy">Accuracy %</option>
                  <option value="practiceTime">Practise hours</option>
                  <option value="learningTime">Learning hours</option>
                  <option value="attemptedQuestions">
                    Attempted Questions
                  </option>
                  <option value="completedContents">Content</option>
                </select>
              </div>
              {course.accessMode === "invitation" &&
              course.classrooms.length ? (
                <div>
                  <div className="form-boxes">
                    <h4 className="form-box_subtitle">Classroom</h4>
                  </div>
                  <select
                    className="form-control"
                    name="cbClass"
                    defaultValue={params.classroom}
                    onChange={(e: any) => classroomHandle(e)}
                  >
                    <option value="" disabled={true}>
                      Select Classroom
                    </option>
                    {course.classrooms &&
                      course.classrooms.map((item: any, index: number) => (
                        <option key={index} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                ""
              )}
              <div>
                <div className="form-boxes">
                  <h4 className="form-box_subtitle">Search</h4>
                </div>
                <div className="member-search">
                  <div className="form-group search-box common_search-type-1">
                    <span>
                      <figure>
                        <img
                          className="search-icon"
                          src="/assets/images/search-icon-2.png"
                          alt="search icon"
                        />
                      </figure>
                    </span>

                    <input
                      type="text"
                      className="form-control border-0 flex-grow-1 flex-basic-0"
                      placeholder="Search By User ID/Name."
                      name="txtSearch"
                      defaultValue={searchText}
                      onChange={(e) => searchTextFun(e.target.value)}
                      // disabled={disabled}
                    />

                    {searchText && (
                      <div onClick={clearSearch} className="result-close-icon">
                        <figure>
                          <img
                            src="/assets/images/close3.png"
                            alt="clear icon"
                            className="clear-icon"
                          />
                        </figure>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {members && members.length ? (
            <div className="folder-area clearfix">
              <div className="table-responsive table-wrap">
                <table className="table vertical-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0">Name</th>
                      <th className="border-0 text-center">Accuracy</th>
                      <th className="border-0 text-center">
                        Practice/Learning Time
                      </th>
                      <th className="border-0 text-center">
                        Attempted Questions
                      </th>
                      <th className="border-0">Overall Completion</th>
                      <th className="border-0">
                        <a
                          onClick={() => download()}
                          className={downloading ? "disabled" : ""}
                        >
                          <i className="fas fa-download"></i>
                          &nbsp;Download&nbsp;
                          {downloading && (
                            <i className="fa fa-spinner fa-pulse"></i>
                          )}
                        </a>
                      </th>
                    </tr>
                  </thead>
                  {!membersLoaded ? (
                    <tbody>
                      <tr>
                        <td colSpan={6}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6}>
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {members &&
                        members.map((mem: any, index: number) => (
                          <tr key={index}>
                            <td className="px-0 name-col">
                              <div className="folder mb-0 p-0">
                                <a
                                  className="d-flex align-items-center border-0 p-0"
                                  href={`/public/profile/${mem.user}`}
                                >
                                  <figure className="user_img_circled_wrap">
                                    <img
                                      className="avatar"
                                      src={avatar(mem)}
                                      alt=""
                                    />
                                  </figure>

                                  <div className="inner ml-2 pl-0">
                                    <div className="inners">
                                      <div className="d-flex align-items-center">
                                        <h4>{mem.userName}</h4>
                                        {mem.services && (
                                          <div className="d-flex align-items-center">
                                            {mem.services.map(
                                              (service: any, index: number) => (
                                                <span
                                                  key={index}
                                                  className={`${service.type}_${service.duration}_${service.durationUnit} ml-1`}
                                                  title={`Service: ${
                                                    service.title
                                                  } (${service.duration} ${
                                                    service.durationUnit
                                                  } ${
                                                    service.duration > 1
                                                      ? "s"
                                                      : ""
                                                  })`}
                                                ></span>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p>{mem.userId}</p>
                                    </div>
                                  </div>
                                </a>
                              </div>
                            </td>

                            <td>
                              <h6 className="text-center">
                                {Math.round(mem.accuracy * 100)}%
                              </h6>
                            </td>
                            <td>
                              <h6 className="text-center">
                                {millisecondsToTime(mem.practiceTime, "short")}
                              </h6>
                              <h6 className="text-center">
                                {millisecondsToTime(mem.learningTime, "short")}
                              </h6>
                            </td>
                            <td>
                              <h6 className="text-center">
                                {mem.attemptedQuestions}
                              </h6>
                            </td>

                            <td>
                              <div className="progresss">
                                {mem.completedContents ? (
                                  <h4>
                                    <strong>
                                      {mem.completedContents}/{totalContents}(
                                      {Math.round(
                                        (mem.completedContents /
                                          totalContents) *
                                          100
                                      ) + "%"}
                                      )
                                    </strong>
                                  </h4>
                                ) : (
                                  <h4>
                                    <strong>No Progress yet</strong>
                                  </h4>
                                )}
                                <p>Last active {fromNow(mem.lastActive)}</p>
                              </div>
                            </td>

                            <td>
                              <div className="d-flex gap-xs">
                                {user._id !== mem.user && (
                                  <div>
                                    <a
                                      className="btn"
                                      title="chat"
                                      onClick={() =>
                                        openStudentChat(mem.user, mem.userName)
                                      }
                                    >
                                      <i className="fas fa-comment"></i>
                                    </a>
                                  </div>
                                )}
                                {hasTests && (
                                  <>
                                    <div>
                                      <Link
                                        href={`../student-review/${id}/${mem.user}`}
                                        className="btn"
                                        title="Review Practice"
                                      >
                                        <i className="fas fa-file-alt"></i>
                                      </Link>
                                    </div>
                                    <div>
                                      <a
                                        className="btn"
                                        title="View Progress"
                                        onClick={() => viewProgress(mem.user)}
                                      >
                                        <i className="fas fa-tasks"></i>
                                      </a>
                                    </div>
                                  </>
                                )}
                              </div>
                              {user._id !== mem.user &&
                                course.certificate &&
                                !mem.isCerti && (
                                  <div>
                                    <a
                                      className="btn btn-outline btn-sm"
                                      onClick={() => createCertificate(mem)}
                                    >
                                      Mark as Complete
                                    </a>
                                  </div>
                                )}
                              {user._id !== mem.user &&
                                course.certificate &&
                                mem.isCerti && (
                                  <div>
                                    <a className="btn btn-sm text-success">
                                      {" "}
                                      Completed
                                    </a>
                                  </div>
                                )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  )}
                </table>
              </div>
              {totalCount > members.length && (
                <div className="text-center">
                  <button
                    className="btn btn-light"
                    disabled={loading}
                    onClick={() => loadMore()}
                  >
                    Load More{" "}
                    {loading && <i className="fa fa-spinner fa-pulse ml-1"></i>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            (!members || !members.length) && (
              <div className=" folder-area clearfix mx-auto mt-5">
                <img
                  className="mx-auto"
                  src="/assets/images/NoMember.svg"
                  alt="image"
                />
                <p className="text-center">No students yet</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default CourseStuduentComponent;
