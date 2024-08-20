"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { upcomingTestByClass } from "@/services/practiceService";

interface Test {
  _id: string;
  title: string;
  startDate: string;
  startTime: string;
  endTime: string;
  totalTime: number;
  subjects: { name: string }[];
}

interface Student {
  studentId: string;
  name: string;
  studentUserId: string;
}

interface UpcomingProps {
  classroom: {
    _id: string;
    students: Student[];
  };
}

const Upcoming: React.FC<UpcomingProps> = ({ classroom }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [txtTestSearch, setTxtTestSearch] = useState("");
  const [txtStudentSearch, setTxtStudentSearch] = useState("");
  const [view, setView] = useState("test");
  const [studentPaging, setStudentPaging] = useState({ page: 1, limit: 15 });
  const [testPaging, setTestPaging] = useState({ page: 1, limit: 15 });

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    upcomingTestByClass(id).then((da: any) => {
      const formattedTests = da.tests.map((element: any) => {
        const startDate = new Date(element.startDate);
        const formattedStartDate = format(startDate, "yyyy-MM-dd");
        const formattedStartTime = format(startDate, "hh:mm a");
        const formattedEndTime = format(
          startDate.getTime() + element.totalTime * 60000,
          "hh:mm a"
        );
        return {
          ...element,
          startDate: formattedStartDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
        };
      });
      setTests(formattedTests);
      setFilteredTests(formattedTests);
    });

    setFilteredStudents(classroom.students);
  }, [id, classroom.students]);

  const searchTest = () => {
    setTimeout(() => {
      if (txtTestSearch) {
        const toCompare = txtTestSearch.toLowerCase();
        const filtered = tests.filter((s) =>
          s.title.toLowerCase().includes(toCompare)
        );
        setFilteredTests(filtered);
      } else {
        setFilteredTests(tests);
      }
    }, 300);
    setTestPaging((prev) => ({ ...prev, page: 1 }));
  };

  const searchStudent = () => {
    if (txtStudentSearch) {
      const toCompare = txtStudentSearch.toLowerCase();
      const filtered = classroom.students.filter(
        (s) =>
          s.name.toLowerCase().includes(toCompare) ||
          s.studentUserId.toLowerCase().includes(toCompare)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(classroom.students);
    }
    setStudentPaging((prev) => ({ ...prev, page: 1 }));
  };

  const studentTrack = (index: number, item: Student) => item.studentId;
  const testTrack = (index: number, item: Test) => item._id;

  return (
    <div className="add-view-window">
      <section className="analytics py-0">
        <div className="container p-0">
          <div className="analytics-area arc mx-auto">
            <div className="d-sm-flex justify-content-between mb-3">
              <div>
                <ul className="nav nav-pills mb-2" id="analytics-tab">
                  <li className="nav-item w-50">
                    <a
                      className={`nav-link ${view === "test" ? "active" : ""}`}
                      id="pills-test-tab"
                      onClick={() => setView("test")}
                      data-toggle="pill"
                      href="#pills-test"
                    >
                      Test
                    </a>
                  </li>
                  <li className="nav-item w-50">
                    <a
                      className={`nav-link ${
                        view === "student" ? "active" : ""
                      }`}
                      id="pills-students-tab"
                      onClick={() => setView("student")}
                      data-toggle="pill"
                      href="#pills-students"
                    >
                      Students
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <form className="common_search-type-1 ml-auto">
                  <span>
                    <figure>
                      <img src="assets/images/search-icon-2.png" alt="" />
                    </figure>
                  </span>
                  {view === "test" ? (
                    <input
                      name="searchInput"
                      type="text"
                      className="form-control border-0 m-0 py-1"
                      placeholder="Search for Assessments"
                      value={txtTestSearch}
                      onChange={(e) => setTxtTestSearch(e.target.value)}
                      onBlur={searchTest}
                    />
                  ) : (
                    <input
                      name="searchInput"
                      type="text"
                      className="form-control border-0 m-0 py-1"
                      placeholder="Search for students"
                      value={txtStudentSearch}
                      onChange={(e) => setTxtStudentSearch(e.target.value)}
                      onBlur={searchStudent}
                    />
                  )}
                </form>
              </div>
            </div>

            <div className="tab-content" id="pills-tabContent">
              <div
                className={`tab-pane fade ${
                  view === "test" ? "show active" : ""
                }`}
                id="pills-test"
                role="tabpanel"
                aria-labelledby="pills-test-tab"
              >
                {filteredTests ? (
                  <>
                    {filteredTests.length ? (
                      <div className="rounded-boxes folder-area clearfix bg-white">
                        <div className="table-wrap table-responsive">
                          <table className="table vertical-middle mb-0">
                            <thead>
                              <tr>
                                <th className="border-0">
                                  <span className="material-icons f-14 mr-1">
                                    receipt_long
                                  </span>
                                  Test Name
                                </th>
                                <th className="border-0">
                                  <span className="material-icons f-14 mr-1">
                                    group
                                  </span>
                                  Total Student
                                </th>
                                <th className="border-0">
                                  <span className="material-icons f-14 mr-1">
                                    assignment
                                  </span>
                                  Subject
                                </th>
                                <th className="border-0">
                                  <span className="material-icons f-14 mr-1">
                                    schedule
                                  </span>
                                  Time
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTests
                                .slice(
                                  (testPaging.page - 1) * testPaging.limit,
                                  testPaging.page * testPaging.limit
                                )
                                .map((t, index) => (
                                  <tr key={testTrack(index, t)}>
                                    <td>
                                      <div className="folder mb-0 p-0">
                                        <a className="p-0 border-0 clearfix">
                                          <div className="inner pl-0">
                                            <div className="inners">
                                              <h4>{t.title}</h4>
                                            </div>
                                          </div>
                                        </a>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="live-table ml-4">
                                        <h4 className="specLiveCount">
                                          {classroom.students?.length}
                                        </h4>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="live-table">
                                        <h4>{t.subjects[0].name}</h4>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="live-table">
                                        <h4>
                                          {t.startTime} - {t.endTime}
                                        </h4>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-data addNoDataFullpageImgs">
                        <figure>
                          <img
                            src="/assets/images/participating_sstudents.svg"
                            alt="Not Found"
                          />
                        </figure>
                        <h3>No Test yet!</h3>
                        <p>There are no upcoming tests!</p>
                      </div>
                    )}
                    {filteredTests.length > testPaging.limit && (
                      <nav className="mt-3">
                        <ul className="pagination">
                          {/* Implement pagination */}
                        </ul>
                      </nav>
                    )}
                  </>
                ) : (
                  <>
                    {/* Render loading skeleton */}
                    <div className="skeleton-loader">
                      {/* Add skeleton loader components */}
                    </div>
                  </>
                )}
              </div>

              <div
                className={`tab-pane fade ${
                  view === "student" ? "show active" : ""
                }`}
                id="pills-students"
                role="tabpanel"
                aria-labelledby="pills-students-tab"
              >
                {filteredStudents && filteredStudents.length ? (
                  <div className="rounded-boxes folder-area clearfix bg-white">
                    <div className="table-wrap table-responsive">
                      <table className="table vertical-middle mb-0">
                        <thead>
                          <tr>
                            <th className="border-0">Name</th>
                            <th className="border-0"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents
                            .slice(
                              (studentPaging.page - 1) * studentPaging.limit,
                              studentPaging.page * studentPaging.limit
                            )
                            .map((student, index) => (
                              <tr key={studentTrack(index, student)}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <figure className="user_img_circled_wrap">
                                      <img
                                        className="avatar"
                                        src={`${student.name} | avatar`}
                                        alt=""
                                      />
                                    </figure>
                                    <div className="d-inline-block ml-2">
                                      <h4 className="row-primary">
                                        {student.name}
                                      </h4>
                                      <p>{student.studentUserId}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right">
                                  <div className="progress-btn-remove">
                                    <a
                                      className="btn btn-primary btn-sm"
                                      href={`../../proctor/${student.studentId}/${classroom._id}`}
                                    >
                                      Proctor
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="empty-data addNoDataFullpageImgs">
                    <figure>
                      <img
                        src="/assets/images/participating_sstudents.svg"
                        alt="Not Found"
                      />
                    </figure>
                    <h3>No Student yet!</h3>
                    <p>There are no students in the test!</p>
                  </div>
                )}
                {filteredStudents &&
                  filteredStudents.length > studentPaging.limit && (
                    <nav className="mt-3">
                      <ul className="pagination">
                        {/* Implement pagination */}
                      </ul>
                    </nav>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Upcoming;
