"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  completedTestByClass,
  completedTestStudentsByClass,
} from "@/services/practiceService";
import { format } from "date-fns";

interface Test {
  _id: string;
  title: string;
  startDate: string;
  startTime: string;
  endTime: string;
  totalTime: number;
  attemptStat: {
    finished: number;
    abandoned: number;
    totalAttempts: number;
  };
}

interface StudentAttempt {
  _id: string;
  name: string;
  userId: string;
  attempt: {
    doQuestions: number;
    totalQuestions: number;
    ongoing: boolean;
    isAbandoned: boolean;
  };
}

interface AttemptPaging {
  page: number;
  limit: number;
  includeCount: boolean;
  studentName?: string;
}

interface CompletedProps {
  classroom: any;
}

const Completed: React.FC<CompletedProps> = ({ classroom }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<StudentAttempt[]>([]);
  const [totalStudentAttempts, setTotalStudentAttempts] = useState(0);
  const [txtTestSearch, setTxtTestSearch] = useState("");
  const [txtStudentSearch, setTxtStudentSearch] = useState("");
  const [view, setView] = useState("test");
  const [attemptPaging, setAttemptPaging] = useState<AttemptPaging>({
    page: 1,
    limit: 15,
    includeCount: true,
  });
  const [testPaging, setTestPaging] = useState({ page: 1, limit: 15 });
  const [searching, setSearching] = useState(false);
  const [loggedInCount, setLoggedInCount] = useState(0);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    completedTestByClass(id).then((res: any) => {
      const formattedTests = res.tests.map((element: any) => {
        const startDate = new Date(element.test.startDate);
        const formattedStartDate = format(startDate, "yyyy-MM-dd");
        const formattedStartTime = format(startDate, "hh:mm a");
        const formattedEndTime = format(
          startDate.getTime() + element.test.totalTime * 60000,
          "hh:mm a"
        );
        return {
          ...element.test,
          startDate: formattedStartDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
        };
      });
      setLoggedInCount(res.loggedIn);
      setTests(formattedTests);
      setFilteredTests(formattedTests);

      if (formattedTests.length) {
        searchStudent();
      } else {
        setStudentAttempts([]);
        setTotalStudentAttempts(0);
      }
    });
  }, [id]);

  const searchTest = () => {
    setTimeout(() => {
      if (txtTestSearch) {
        const toCompare = txtTestSearch.toLowerCase();
        const filtered = tests.filter(
          (s) => s.title.toLowerCase().indexOf(toCompare) !== -1
        );
        setFilteredTests(filtered);
      } else {
        setFilteredTests(tests);
      }
    }, 300);
    setTestPaging((prev) => ({ ...prev, page: 1 }));
  };

  const searchStudent = () => {
    if (searching) {
      return;
    }
    setSearching(true);
    setAttemptPaging((prev) => ({ ...prev, page: 1 }));
    const query: AttemptPaging = { ...attemptPaging, includeCount: true };

    if (txtStudentSearch) {
      query.studentName = txtStudentSearch;
    }

    setStudentAttempts([]);
    completedTestStudentsByClass(classroom._id, query).then((res: any) => {
      setStudentAttempts(res.studentAttempts);
      setTotalStudentAttempts(res.total);
      setSearching(false);
    });
  };

  const onPageChanged = (pageNum: number) => {
    if (searching) {
      return;
    }
    setSearching(true);
    const query: AttemptPaging = { ...attemptPaging, page: pageNum };
    if (txtStudentSearch) {
      query.studentName = txtStudentSearch;
    }

    setStudentAttempts([]);
    completedTestStudentsByClass(classroom._id, query).then((res: any) => {
      setStudentAttempts(res.studentAttempts);
      setSearching(false);
    });
  };

  const track = (index: number, item: any) => {
    return item._id;
  };

  return (
    <div className="add-view-window">
      <section className="analytics py-0">
        <div className="container p-0">
          <div className="analytics-area arc mx-auto">
            <div className="d-sm-flex justify-content-between mb-3">
              <div>
                <ul
                  className="nav nav-pills mb-2 new-accordion-a-chang"
                  id="completed-tab"
                >
                  <li className="nav-item w-50">
                    <a
                      className={`nav-link ${view === "test" ? "active" : ""}`}
                      id="pills-completed-test-tab"
                      onClick={() => setView("test")}
                      data-toggle="pill"
                      href="#pills-completed-test"
                      aria-controls="pills-completed-test"
                    >
                      Assessment
                    </a>
                  </li>
                  <li className="nav-item w-50">
                    <a
                      className={`nav-link ${view === "student" ? "active" : ""
                        }`}
                      id="pills-completed-student-tab"
                      onClick={() => setView("student")}
                      data-toggle="pill"
                      href="#pills-completed-students"
                      aria-controls="pills-completed-students"
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
                      placeholder="Search for assessment"
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

            <div className="tab-content mt-4" id="pills-tabContent">
              <div
                className={`tab-pane fade ${view === "test" ? "show active" : ""
                  }`}
                id="pills-completed-test"
                role="tabpanel"
                aria-labelledby="pills-completed-test-tab"
              >
                {filteredTests ? (
                  <>
                    {filteredTests.length ? (
                      <div className="rounded-boxes bg-white completedLive-Main clearfix">
                        <div className="liveMainInnner1">
                          {filteredTests
                            .slice(
                              (testPaging.page - 1) * testPaging.limit,
                              testPaging.page * testPaging.limit
                            )
                            .map((t, index) => (
                              <div
                                key={track(index, t)}
                                className="liveMainInnner2"
                              >
                                <div className="row liveMainInnner3 mb-2">
                                  <div className="col-lg-6">
                                    <h4>{t.title}</h4>
                                  </div>
                                  <div className="col-lg-6">
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        date_range
                                      </span>
                                      <h4 className="liveCom-date">
                                        {t.startDate} {t.startTime} -{" "}
                                        {t.endTime}
                                      </h4>
                                    </div>
                                  </div>
                                </div>
                                <div className="row liveMainInnner4">
                                  <div className="col-lg-3 border-0">
                                    <span className="material-icons">
                                      people
                                    </span>
                                    <a>
                                      <strong>
                                        {t.attemptStat?.finished ?? 0}
                                      </strong>{" "}
                                      Completed
                                    </a>
                                  </div>
                                  <div className="col-lg-3 border-0">
                                    <span className="material-icons">
                                      people
                                    </span>
                                    <a>
                                      <strong>
                                        {t.attemptStat?.abandoned ?? 0}
                                      </strong>{" "}
                                      Abandoned
                                    </a>
                                  </div>
                                  <div className="col-lg-3 border-0">
                                    <span className="material-icons">
                                      people
                                    </span>
                                    <a>
                                      <strong>
                                        {classroom.students.length -
                                          loggedInCount}
                                      </strong>{" "}
                                      Not Logged In
                                    </a>
                                  </div>
                                  <div className="col-lg-3 border-0">
                                    <span className="material-icons">
                                      people
                                    </span>
                                    <a>
                                      <strong>
                                        {loggedInCount -
                                          (t.attemptStat?.totalAttempts ?? 0)}
                                      </strong>{" "}
                                      Not Started
                                    </a>
                                  </div>
                                </div>
                                <hr />
                              </div>
                            ))}
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
                    {filteredTests &&
                      filteredTests.length > testPaging.limit && (
                        <nav className="mt-3">
                          <ul className="pagination">
                            {/* Implement pagination */}
                          </ul>
                        </nav>
                      )}
                  </>
                ) : (
                  <>
                    <div className="skeleton-loader">
                      {/* Render skeleton loaders */}
                    </div>
                  </>
                )}
              </div>

              <div
                className={`tab-pane fade ${view === "student" ? "show active" : ""
                  }`}
                id="pills-completed-students"
                role="tabpanel"
                aria-labelledby="pills-completed-student-tab"
              >
                {studentAttempts ? (
                  <>
                    {studentAttempts.length ? (
                      <div className="rounded-boxes folder-area clearfix bg-white">
                        <div className="table-wrap table-responsive">
                          <table className="table vertical-middle mb-0">
                            <thead>
                              <tr>
                                <th className="border-0">Name</th>
                                <th className="border-0">Question Attempted</th>
                                <th className="border-0">Status</th>
                                <th className="border-0"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentAttempts.map((student, index) => (
                                <tr key={track(index, student)}>
                                  <td>
                                    <div className="d-flex">
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
                                        <p>{student.userId}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    {student.attempt && (
                                      <h4>
                                        <strong>
                                          {student.attempt.doQuestions}/
                                          {student.attempt.totalQuestions}
                                        </strong>
                                      </h4>
                                    )}
                                  </td>
                                  <td>
                                    {student.attempt ? (
                                      <>
                                        {!student.attempt.ongoing &&
                                          student.attempt.isAbandoned && (
                                            <h4>
                                              <strong className="text-danger">
                                                Abandoned
                                              </strong>
                                            </h4>
                                          )}
                                        {!student.attempt.ongoing &&
                                          !student.attempt.isAbandoned && (
                                            <h4>
                                              <strong className="text-success">
                                                Successful
                                              </strong>
                                            </h4>
                                          )}
                                        {student.attempt.ongoing && (
                                          <h4>
                                            <strong className="text-primary">
                                              Ongoing
                                            </strong>
                                          </h4>
                                        )}
                                      </>
                                    ) : (
                                      <h4>
                                        <strong>Not Started</strong>
                                      </h4>
                                    )}
                                  </td>
                                  <td className="text-right">
                                    <div className="progress-btn-remove">
                                      <a
                                        className="btn btn-primary btn-sm"
                                        href={`../../proctor/${student._id}/${classroom._id}`}
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
                    {studentAttempts &&
                      totalStudentAttempts > attemptPaging.limit && (
                        <nav className="mt-3">
                          <ul className="pagination">
                            {/* Implement pagination */}
                          </ul>
                        </nav>
                      )}
                  </>
                ) : (
                  <>
                    <div className="skeleton-loader">
                      {/* Render skeleton loaders */}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Completed;
