"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import * as authSvc from "@/services/auth";
import * as studentSvc from "@/services/student-service";
import { Tab, Tabs } from "react-bootstrap";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import EffortAnalysisComponent from "./EffortAnalysisComponent";
import AcademicAnalysisComponent from "./AcademicAnalysisComponent";
import ComparativeAnalysisComponent from "./ComparativeAnalysisComponent";
import ErrorLogComponent from "./ErrorLogComponent";
import ScoreTrendComponent from "./ScoreTrendComponent";
import { sub } from "date-fns";

const StudentPerformance = () => {
  const { studentId } = useParams();
  const { push } = useRouter();

  const [studentData, setStudentData] = useState<any>([]);
  const [intervalAverageData, setIntervalAverageData] = useState<any>([]);
  const [averageData, setAverageData] = useState<any>([]);
  const [intervalStudentData, setIntervalStudentData] = useState<any>([]);
  const [topperData, setTopperData] = useState<any>([]);
  const [intervalTopperData, setIntervalTopperData] = useState<any>([]);
  const [uniqQuesData, setUniqQuesData] = useState<any>([]);
  const [intervalUniqQuesData, setIntervalUniqQuesData] = useState<any>([]);
  const [tabs, setTabs] = useState<any>({
    effort: true,
    academic: false,
    comparative: false,
  });
  const [selectedTabs, setSelectedTabs] = useState<string>("effort");
  const user: any = useSession()?.data?.user?.info || {};

  const [subjects, setSubjects] = useState<any>(null);
  const [speedAndAccuracy, setSpeedAndAccuracy] = useState<any>(null);
  const [settings, setSettings] = useState<any>([]);
  const [student, setStudent] = useState<any>(null);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    getClientDataFunc();
    authSvc
      .getUserById({ id: studentId, nameOnly: true })
      .then((user) => {
        setStudent(user);
      })
      .catch((err) => {
        console.error(err);
      });

    studentSvc
      .summaryByNumber({ studentId: studentId })
      .then((data) => {
        setStudentData(data);
      })
      .catch((err) => {
        console.error(err);
      });

    studentSvc
      .topperSummaryByNumber({ studentId: studentId })
      .then((e: any) => {
        setTopperData(e.topper);
        setAverageData(e.average);
      })
      .catch((err) => {
        console.error(err);
      });

    studentSvc
      .getUniqueQuestionsCount({ studentId: studentId })
      .then((data) => {
        setUniqQuesData(data);
      });

    studentSvc
      .getUniqueQuestionsCount({ limit: "15days", studentId: studentId })
      .then((data) => {
        setIntervalUniqQuesData(data);
      });

    studentSvc
      .summaryByNumber({ limit: "15days", studentId: studentId })
      .then((data) => {
        setIntervalStudentData(data);
      });

    studentSvc
      .topperSummaryByNumber({ limit: "15days", studentId: studentId })
      .then((e: any) => {
        setIntervalTopperData(e.topper);
        setIntervalAverageData(e.average);
      });

    studentSvc
      .getSubjectWiseSpeedAndAccuracy({ studentId: studentId })
      .then((data: any) => {
        data.user.sort((a, b) => a.name.localeCompare(b.name));
        setSpeedAndAccuracy(data);
        const updated_subjects = data.user.map((s) => {
          return {
            _id: s._id,
            name: s.name,
            units: s.units,
          };
        });
        setSubjects(updated_subjects);
      });
  }, []);

  const changeTabs = (tab: any) => {
    for (const key in tabs) {
      setTabs((prevTabs) => {
        return {
          ...prevTabs,
          [key]: key === tab,
        };
      });
    }
  };
  const LoadingComponent = () => (
    <div className="error-analysis mx-auto mw-100 pt-0">
      <div className="row">
        <div className="col-lg-2">
          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
        </div>
        <div className="col-lg-10">
          <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
          <p>&nbsp;</p>
          <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <main className="p-0">
        <div className="container">
          <div className="mx-auto">
            <div className="container5 bg-white">
              <div className="overall-analytics">
                <section className="details details_top_area_common">
                  <div className="container">
                    <div className="asses-info">
                      <div className="title-wrap clearfix">
                        <div className="title">
                          <h3 className="main_title over-head1 text-white pl-0">
                            Performance of {student?.name}
                          </h3>
                        </div>
                      </div>

                      <span className="bottom_title text-white">
                        This is a comprehensive review of your effort regarding
                        the number of attempts, assessments, and questions
                        solved. Rather than looking at an individual entity
                        (assessment, course, etc.), you see the overall
                        performance (strength, weakness, average time to solve a
                        question, time spent on units and topics, etc.){" "}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
              <div className="overall-main">
                <div className="row">
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box new-admin-box data_ana_box">
                      <div className="overall-head">Total Attempts</div>
                      <div className="form-row mx-0 my-2">
                        <div className="col-4">
                          <p className="over1">Student</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {studentData && studentData.totalAttempt
                                ? studentData.totalAttempt.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalStudentData &&
                                intervalStudentData.totalAttempt && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalStudentData.totalAttempt.toFixed(
                                        0
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Average</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {averageData && averageData.totalAttempt
                                ? averageData.totalAttempt.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalAverageData &&
                                intervalAverageData.totalAttempt && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalAverageData.totalAttempt.toFixed(
                                        0
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Best</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {topperData && topperData.totalAttempt
                                ? topperData.totalAttempt.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalTopperData &&
                                intervalTopperData.totalAttempt && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalTopperData.totalAttempt.toFixed(
                                        0
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="over-0 text-left">
                        *Attempts in last 15 days
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box new-admin-box data_ana_box">
                      <div className="overall-head">Assessments</div>
                      <div className="form-row mx-0 my-2">
                        <div className="col-4">
                          <p className="over1">Student</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {studentData && studentData.totalTest
                                ? studentData.totalTest.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalStudentData &&
                                intervalStudentData.totalTest && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalStudentData.totalTest.toFixed(0)}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Average</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {averageData && averageData.totalTest
                                ? averageData.totalTest.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalAverageData &&
                                intervalAverageData.totalTest && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalAverageData.totalTest.toFixed(0)}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Best</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {topperData && topperData.totalTest
                                ? topperData.totalTest.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalTopperData &&
                                intervalTopperData.totalTest && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalTopperData.totalTest.toFixed(0)}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="over-0 text-left">
                        *Assessments taken in last 15 days
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box new-admin-box data_ana_box">
                      <div className="overall-head">Questions</div>
                      <div className="form-row mx-0 my-2">
                        <div className="col-4">
                          <p className="over1">Student</p>
                          <div className="over-2">
                            <h4 className="big_num">
                              {uniqQuesData && uniqQuesData.user
                                ? uniqQuesData.user[0].doQuestion.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalUniqQuesData &&
                                intervalUniqQuesData.user &&
                                intervalUniqQuesData.user[0] && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalUniqQuesData.user[0].doQuestion.toFixed(
                                        0
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Average</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {uniqQuesData && uniqQuesData.average
                                ? uniqQuesData.average[0].average.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalUniqQuesData &&
                                intervalUniqQuesData.average &&
                                intervalUniqQuesData.average[0] && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalUniqQuesData.average[0].average.toFixed(
                                        0
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Best</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {uniqQuesData && uniqQuesData.topper
                                ? uniqQuesData.topper[0].doQuestion.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalUniqQuesData &&
                                intervalUniqQuesData.topper &&
                                intervalUniqQuesData.topper[0] && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalUniqQuesData.topper[0].doQuestion.toFixed(
                                        0
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="over-0 text-left">
                        *Questions attempted in last 15 days
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box new-admin-box data_ana_box">
                      <div className="overall-head">Average Marks</div>
                      <div className="form-row mx-0 my-2">
                        <div className="col-4">
                          <p className="over1">You</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {studentData && studentData.totalMark
                                ? studentData.totalMark.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalStudentData &&
                                intervalStudentData.totalMark && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalStudentData.totalMark.toFixed(0)}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Average</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {averageData && averageData.totalMark
                                ? averageData.totalMark.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalAverageData &&
                                intervalAverageData.totalMark && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalAverageData.totalMark.toFixed(0)}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="col-4">
                          <p className="over1">Best</p>
                          <div className="over2">
                            <h4 className="big_num">
                              {topperData && topperData.totalMark
                                ? topperData.totalMark.toFixed(0)
                                : "0"}
                            </h4>
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              {intervalTopperData &&
                                intervalTopperData.totalMark && (
                                  <>
                                    <span className="material-icons">
                                      arrow_drop_up
                                    </span>
                                    <span className="persist-arrow">
                                      {intervalTopperData.totalMark.toFixed(0)}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="over-0 text-left">
                        *Marks obtained in last 15 days
                      </p>
                    </div>
                  </div>
                </div>
                <section className="overview-board">
                  <div className="container">
                    <div className="overview-board-area">
                      <div className="tabs mx-auto nav-justified tabs-bottom-content-gap">
                        <Tabs
                          activeKey={selectedTabs}
                          onSelect={(k: any) => setSelectedTabs(k)}
                          style={{ borderBottom: "0px" }}
                        >
                          <Tab
                            eventKey="effort"
                            title={
                              <span className="mx-auto">
                                <figure>
                                  <img
                                    src="/assets/images/Overview_icon.png"
                                    alt=""
                                    className="mx-auto"
                                  />
                                </figure>
                                <h6 className="text-center mx-auto">
                                  {" "}
                                  Effort Analysis{" "}
                                </h6>
                              </span>
                            }
                            tabClassName="coloredTab"
                          >
                            <div>
                              {student && subjects ? (
                                <EffortAnalysisComponent
                                  student={student}
                                  subjects={subjects}
                                />
                              ) : (
                                <LoadingComponent />
                              )}
                            </div>
                          </Tab>

                          <Tab
                            eventKey="academic"
                            title={
                              <span className="mx-auto">
                                <figure>
                                  <img
                                    src="/assets/images/bow-arrow.png"
                                    className="mx-auto"
                                    alt=""
                                  />
                                </figure>

                                <h6 className="text-center mx-auto">
                                  Academic Analysis
                                </h6>
                              </span>
                            }
                            tabClassName="coloredTab"
                          >
                            <div>
                              {student && subjects && speedAndAccuracy ? (
                                <AcademicAnalysisComponent
                                  student={student}
                                  subjects={subjects}
                                  speedAndAccuracy={speedAndAccuracy}
                                />
                              ) : (
                                <LoadingComponent />
                              )}
                            </div>
                          </Tab>

                          <Tab
                            eventKey={"comparative"}
                            title={
                              <span className="mx-auto">
                                <figure>
                                  <img
                                    src="/assets/images/performance_analysis_chart_icon.png"
                                    alt=""
                                    className="mx-auto"
                                  />
                                </figure>

                                <h6 className="text-center mx-auto">
                                  Comparative Analysis
                                </h6>
                              </span>
                            }
                            tabClassName="coloredTab"
                          >
                            <div>
                              {student && subjects ? (
                                <ComparativeAnalysisComponent
                                  student={student}
                                  subjects={subjects}
                                  speedAndAccuracy={speedAndAccuracy}
                                />
                              ) : (
                                <LoadingComponent />
                              )}
                            </div>
                          </Tab>
                          <Tab
                            eventKey={"errorLog"}
                            title={
                              <span className="mx-auto">
                                <figure>
                                  <img
                                    src="/assets/images/Overview_icon.png"
                                    alt=""
                                    className="mx-auto"
                                  />
                                </figure>

                                <h6 className="text-center mx-auto">
                                  Error Log
                                </h6>
                              </span>
                            }
                            tabClassName="coloredTab"
                          >
                            <div>
                              {student && subjects ? (
                                <ErrorLogComponent
                                  student={student}
                                  subjects={subjects}
                                />
                              ) : (
                                <LoadingComponent />
                              )}
                            </div>
                          </Tab>
                          {settings.features?.scoreTrend && (
                            <Tab
                              eventKey={"score"}
                              title={
                                <span className="mx-auto">
                                  <figure>
                                    <img
                                      src="/assets/images/performance_analysis_chart_icon.png"
                                      alt=""
                                      className="mx-auto"
                                    />
                                  </figure>

                                  <h6 className="text-center mx-auto">
                                    Score Trend
                                  </h6>
                                </span>
                              }
                              tabClassName="coloredTab"
                            >
                              <div>
                                {student && subjects ? (
                                  <ScoreTrendComponent student={student} />
                                ) : (
                                  <LoadingComponent />
                                )}
                              </div>
                            </Tab>
                          )}
                        </Tabs>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default StudentPerformance;
