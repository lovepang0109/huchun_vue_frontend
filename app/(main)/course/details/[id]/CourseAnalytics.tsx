import React, { useState, useEffect } from "react";
import {
  getStudentEffortAnalytics,
  getLearningAndPracticeAnalytics,
  getStudentProgressByChapter,
  getInactiveStudents,
  ignoreInactive,
  remindInactive,
} from "@/services/courseService";
import { getClassRoomByLocation } from "@/services/classroomService";
import {
  donutChartResponsive,
  initEfforts,
  initPastEfforts,
} from "./chartOptionsModal";
import { confirm, success } from "alertifyjs";
import { avatar, millisecondsToTime } from "@/lib/pipe";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import PaginationComponent from "@/components/Pagination";
import Chart from "react-apexcharts";

interface PerformanceParamsEntry {
  classroom: string;
  sortBy: string;
  dateRange: string;
  searchText: string;
}

interface InactiveParamsEntry {
  classroom: string;
  searchText: string;
  limit: number;
  page: number;
  count: boolean;
}

const CourseAnalyticsComponent = ({
  user,
  settings,
  course,
  setCourse,
}: any) => {
  const [efforts, setEfforts] = useState<any>(initEfforts);
  const [pastEfforts, setPastEfforts] = useState<any>(initPastEfforts);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [pastStudentCount, setPastStudentCount] = useState<number>(0);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [performanceUsers, setPerformanceUsers] = useState<any>([]);
  const [performancecount, setPerformancecount] = useState<number>(0);
  const [performanceLoading, setPerformanceLoading] = useState<boolean>(false);
  const [inactiveUsers, setInactiveUsers] = useState<any>([]);
  const [inactiveCount, setInactiveCount] = useState<number>(0);
  const [inactiveLoading, setInactiveLoading] = useState<boolean>(false);
  const [totalContents, setTotalContents] = useState<number>(0);
  const [performanceParams, setPerformanceParams] =
    useState<PerformanceParamsEntry>({
      classroom: "",
      sortBy: "accuracy",
      dateRange: "7",
      searchText: "",
    });
  const [inactiveParams, setInactiveParams] = useState<InactiveParamsEntry>({
    classroom: "",
    searchText: "",
    limit: 10,
    page: 1,
    count: false,
  });
  const [chapterChartOptions, setChapterChartOptions] = useState<any>({
    series: [],
    chart: {
      type: "bar",
      height: 300,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    yaxis: {
      title: {
        text: "",
      },
    },
    xaxis: {
      type: "category",
      categories: [{}],
      title: {
        text: "Student Count",
      },
      labels: {
        formatter: function (val: any) {
          return val.toFixed(0);
        },
      },
    },
  });
  const [learningChartOptions, setLearningChartOptions] = useState<any>({
    chart: {
      type: "donut",
      height: 500,
    },
    series: [],
    labels: [],
    dataLabels: {
      enabled: false,
      name: {
        show: false,
      },
      value: {
        show: true,
      },
    },
    legend: {
      show: true,
      height: 150,
      position: "bottom",
      horizontalAlign: "left",
      formatter: function (seriesName: any, opts: any) {
        const val = Math.round(opts.w.globals.series[opts.seriesIndex] / 60000);
        return [
          '<div class="apexcharts-legend-custom-text">' + seriesName + "</div>",
          '<div class="apexcharts-legend-custom-value text-right">' +
            (val > 1 ? val + " mins " : "< 1 min") +
            "</div>",
        ];
      },
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              fontSize: "12px",
              fontWeight: 400,
              formatter: (val: any, opts: any) => {
                const total = opts.globals.series.reduce(
                  (p: any, c: any) => p + c,
                  0
                );
                return Math.round((val * 100) / total) + "%";
              },
            },
            total: {
              show: true,
              label: "Learning",
              fontSize: "14px",
              fontWeight: 600,
              formatter: (w: any) => {
                const total = Math.round(
                  w.globals.seriesTotals.reduce((a: any, b: any) => {
                    return a + b;
                  }, 0) / 60000
                );

                if (total < 1) {
                  return "< 1 mins";
                }
                const hours = Math.floor(total / 60);
                const min = total % 60;

                if (hours == 0) {
                  return min + " mins";
                }

                if (min == 0) {
                  return hours + " hours";
                }

                return hours + "hrs " + min + "m";
              },
            },
          },
        },
      },
    },
    responsive: donutChartResponsive,
  });
  const [practiceChartOptions, setPracticeChartOptions] = useState<any>({
    chart: {
      type: "donut",
      height: 500,
    },
    series: [],
    labels: [],
    dataLabels: {
      enabled: false,
      name: {
        show: false,
      },
      value: {
        show: true,
      },
    },
    legend: {
      show: true,
      height: 150,
      position: "bottom",
      horizontalAlign: "left",
      formatter: function (seriesName: any, opts: any) {
        const val = Math.round(opts.w.globals.series[opts.seriesIndex] / 60000);
        return [
          '<div class="apexcharts-legend-custom-text">' + seriesName + "</div>",
          '<div class="apexcharts-legend-custom-value text-right">' +
            (val > 1 ? val + " mins " : "< 1 min") +
            "</div>",
        ];
      },
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              show: true,
              fontSize: "12px",
              fontWeight: 400,
              formatter: (val: any, opts: any) => {
                const total = opts.globals.series.reduce(
                  (p: any, c: any) => p + c,
                  0
                );
                return Math.round((val * 100) / total) + "%";
              },
            },
            total: {
              show: true,
              label: "Practice",
              fontSize: "14px",
              fontWeight: 600,
              formatter: (w: any) => {
                const total = Math.round(
                  w.globals.seriesTotals.reduce((a: any, b: any) => {
                    return a + b;
                  }, 0) / 60000
                );
                if (total == 0) {
                  return "< 1 mins";
                }
                const hours = Math.floor(total / 60);
                const min = total % 60;

                if (hours == 0) {
                  return min + " mins";
                }

                if (min == 0) {
                  return hours + " hours";
                }

                return hours + "hrs " + min + "m";
              },
            },
          },
        },
      },
    },
    responsive: donutChartResponsive,
  });

  useEffect(() => {
    initialFunction();
  }, []);

  const initialFunction = async () => {
    if (course.section) {
      course.section.map((item: any) => {
        if (item.status === "published") {
          item.contents.map((cont: any) => {
            if (cont.active) {
              setTotalContents((prev) => prev + 1);
            }
          });
        }
      });
    }

    const efforsData = efforts;
    const pastEffortsData = pastEfforts;
    getStudentEffortAnalytics(course._id).then((data: any) => {
      for (const e of data.efforts) {
        if (e._id == "assessment" || e._id == "quiz") {
          efforsData[e._id] = e.attempts;
        } else {
          efforsData[e._id] = e.timeSpent;
        }
      }
      setStudentCount(data.students);

      getStudentEffortAnalytics(course._id, { daysAgo: 15 }).then(
        (data: any) => {
          for (const e of data.efforts) {
            if (e._id == "assessment" || e._id == "quiz") {
              pastEffortsData[e._id] = e.attempts;
            } else {
              pastEffortsData[e._id] = e.timeSpent;
            }
          }
          setPastStudentCount(data.students);
        }
      );
    });
    setPastEfforts(pastEffortsData);
    setEfforts(efforsData);

    getLearningAndPracticeAnalytics(course._id).then((data: any[]) => {
      for (const sec of data) {
        const section = course.sections.find((s: any) => s._id == sec._id);
        sec.name = section.title;
      }

      const learning = data.filter((d) => d.learning > 0);
      const practice = data.filter((d) => d.practice > 0);
      setTimeout(() => {
        setLearningChartOptions({
          ...learningChartOptions,
          series: learning.map((l) => l.learning),
          labels: learning.map((l) => l.name),
        });
        setPracticeChartOptions({
          ...practiceChartOptions,
          series: practice.map((l) => l.practice),
          labels: practice.map((l) => l.name),
        });
      }, 500);
    });

    getStudentProgressByChapter(course._id).then((data: any[]) => {
      if (data.length) {
        const students: any = [];
        const cat: any = [];
        for (const item of data) {
          cat.push("Chapter " + item.chapter);
          students.push(item.students);
        }

        let chapterChartOptionsData = chapterChartOptions;
        setTimeout(() => {
          chapterChartOptionsData.series = [
            {
              name: "Students",
              data: students,
            },
          ];
          chapterChartOptionsData.xaxis.categories = cat;
          setChapterChartOptions(chapterChartOptionsData);
        }, 500);
      }
    });

    if (course.accessMode == "invitation") {
      let classroomsData = classrooms;
      if (course.classrooms && course.classrooms.length) {
        if (user.role != "publisher") {
          await getClassRoomByLocation([user.activeLocation]).then(
            (res: any) => {
              classroomsData = res.filter((cls: any) =>
                course.classrooms.find((c: any) => c._id == cls._id)
              );
            }
          );
        } else {
          classroomsData = course.classrooms;
        }
        if (classroomsData.length) {
          setPerformanceParams({
            ...performanceParams,
            classroom: classroomsData[0]._id,
          });
          const inactiveParamsData = inactiveParams;
          inactiveParamsData.classroom = classroomsData[0]._id;
          setInactiveParams(inactiveParamsData);

          inactiveSearch(inactiveParamsData);
        }
      }
      setClassrooms(classroomsData);
    } else {
      inactiveSearch(inactiveParams);
    }
  };

  const inactiveSearch = async (data?: any) => {
    data.page = 1;
    setInactiveParams(data);
    setInactiveCount(0);
    loadInactiveStudents(true, data);
  };

  const loadInactiveStudents = async (count: boolean, data: any) => {
    if (inactiveLoading) {
      return;
    }
    const params = { ...data };
    if (count) {
      params.count = true;
    }

    setInactiveLoading(true);

    getInactiveStudents(course._id, params)
      .then((res: any) => {
        setInactiveUsers(res.students);
        if (count) {
          setInactiveCount(res.count);
        }
      })
      .catch((err) => {
        if (count) {
          setInactiveCount(0);
        }
        setInactiveUsers([]);
      });
    setInactiveLoading(false);
  };

  const ignore = async (user: any) => {
    confirm(
      "Do you want to stop tracking inactivity of this student?",
      async () => {
        ignoreInactive(course._id, user._id).then((res: any) => {
          success("Ignore inactive student " + user.userId);
          const idx = inactiveUsers.findIndex((u: any) => u._id == user._id);
          if (idx > -1) {
            inactiveUsers.splice(idx, 1);
          }
        });
      }
    );
  };

  const openChatFunction = async (user: any) => {
    remindInactive(course._id, user._id, false).then((res: any) => {
      // TODO: implement chat
      // openChat(user._id, user.name, user.avatar);
    });
  };

  const sendEmail = async (user: any) => {
    confirm("Are you sure you want to send mail?", async () => {
      remindInactive(course._id, user._id, true).then(() => {
        success("Reminder email is sent.");
      });
    });
  };

  const NoDataComponent = () => {
    return (
      <>
        <div className="text-center">
          <svg
            width="100%"
            height="300"
            viewBox="0 0 520 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
              fill="#DBDBE8"
            />
            <path
              d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
              fill="#D4D4EA"
            />
            <path
              d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
              fill="#DEDEE7"
            />
            <path
              d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
              fill="#E1E1E6"
            />
            <path
              d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
              fill="#D8D8E9"
            />
          </svg>
          <h2 className="text-muted">No data yet</h2>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="dashboard-area classroom mx-auto">
        <div className="rounded-boxes bg-white">
          <section>
            <div className="h4 bold">Analytics</div>
            <div className="h6 bold">Analytics Overview</div>
          </section>
          <div className="pt-3">
            <div className="row">
              <div className="col-lg col-md-4 col-6">
                <div className="data_ana_box">
                  <div className="overall-head">Assessments</div>
                  <div className="mid_contents flex-column">
                    <h1 className="big_num">{efforts.assessment}</h1>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small className="f-12 align-self-center">
                        {pastEfforts.assessment}
                      </small>
                    </div>
                  </div>
                  <p className="bottom_info_text">*Attempts in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-md-4 col-6">
                <div className="data_ana_box">
                  <div className="overall-head">Quiz</div>
                  <div className="mid_contents flex-column">
                    <h1 className="big_num">{efforts.quiz}</h1>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small className="f-12 align-self-center">
                        {pastEfforts.quiz}
                      </small>
                    </div>
                  </div>
                  <p className="bottom_info_text">*Attempts in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-md-4 col-6">
                <div className="data_ana_box">
                  <div className="overall-head">E-Books</div>
                  <div className="mid_contents flex-column">
                    <h1 className="big_num">
                      {millisecondsToTime(efforts.ebook, "short")}
                    </h1>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small className="f-12 align-self-center">
                        {millisecondsToTime(pastEfforts.ebook, "short")}
                      </small>
                    </div>
                  </div>
                  <p className="bottom_info_text">*Effort in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-md-4 col-6">
                <div className="data_ana_box">
                  <div className="overall-head">Video</div>
                  <div className="mid_contents flex-column">
                    <h1 className="big_num">
                      {millisecondsToTime(efforts.video, "short")}
                    </h1>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small className="f-12 align-self-center">
                        {millisecondsToTime(pastEfforts.video, "short")}
                      </small>
                    </div>
                  </div>
                  <p className="bottom_info_text">*Effort in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-md-4 col-6">
                <div className="data_ana_box">
                  <div className="overall-head">Students</div>
                  <div className="mid_contents flex-column">
                    <h1 className="big_num">{studentCount}</h1>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small className="f-12 align-self-center">
                        {pastStudentCount}
                      </small>
                    </div>
                  </div>
                  <p className="bottom_info_text">*Enrolled in last 15 days</p>
                </div>
              </div>
            </div>

            <div className="chart_boxes">
              <div className="admin-header">
                <h4 className="admin-head">
                  Course Ultilization (Learning & Practice)
                </h4>
                <p className="admin-head2">
                  Understand overall learning and practice hours students spend
                  and get chapter-wise data. A side-by-side comparison lets you
                  find the balance between learning and practice.
                </p>
              </div>
              <div className="chart_area_body custom-legend">
                <div className="row">
                  <div className="col-lg-6">
                    {learningChartOptions.series.length ? (
                      <Chart
                        options={learningChartOptions}
                        series={learningChartOptions.series}
                        type="donut"
                      />
                    ) : (
                      <NoDataComponent />
                    )}
                  </div>
                  <div className="col-lg-6">
                    {learningChartOptions.series.length ? (
                      <Chart
                        series={practiceChartOptions.series}
                        options={practiceChartOptions}
                        type="donut"
                      />
                    ) : (
                      <NoDataComponent />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="chart_boxes">
              <div className="admin-header">
                <h4 className="admin-head">Student Progress by Chapters</h4>
                <p className="admin-head2">
                  Understand where most of the students are in this course. This
                  may also give you an idea of where students are stuck or where
                  students are quitting the course.
                </p>
              </div>
              <div className="chart_area_body custom-legend">
                {chapterChartOptions.series.length !== 0 && (
                  <Chart
                    series={chapterChartOptions.series}
                    options={chapterChartOptions}
                    height={350}
                    type="bar"
                  />
                )}
                {!chapterChartOptions.series.length && (
                  <div className="text-center mx-auto">
                    <img
                      className="mx-auto"
                      src="/assets/images/empty-chart.svg"
                      alt=""
                    />
                    <h2 className="text-muted">No data yet</h2>
                  </div>
                )}
              </div>
            </div>

            <div className="chart_boxes">
              <div className="admin-header">
                <h4 className="admin-head">Inactive Students</h4>
                <p className="admin-head2">
                  Students who have not shown any activity in the past ten days,
                  detailing their name, last active date, last login, and email
                  address for follow-up.
                </p>
              </div>
              <div className="chart_area_body">
                <div className="row no-gutters">
                  {course.accessMode == "invitation" && (
                    <div className="col-lg-3 col-12 mb-2">
                      <div className="form-boxes mb-1">
                        <h4 className="form-box_subtitle">Select Classroom</h4>
                      </div>
                      <select
                        className="form-control"
                        name="inactiveClassroom"
                        defaultValue={inactiveParams.classroom}
                        onChange={() => inactiveSearch()}
                      >
                        <option value="" disabled={true}>
                          Select Classroom
                        </option>
                        {classrooms.map((cls: any, index: number) => (
                          <option key={index} value={cls._id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="col align-self-end mb-3">
                    <form
                      className="common_search-type-1 form-half ml-auto"
                      onSubmit={() => inactiveSearch()}
                    >
                      <div className="form-group mb-0">
                        <span>
                          <figure>
                            <img
                              src="/assets/images/search-icon-2.png"
                              alt=""
                            />
                          </figure>
                        </span>
                        <input
                          type="text"
                          className="form-control border-0"
                          placeholder="Search for Students"
                          name="inactiveSearchText"
                          value={inactiveParams.searchText}
                          onChange={(e: any) =>
                            setInactiveParams(e.target.value)
                          }
                        />
                      </div>
                    </form>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table vertical-middle border-top-none border-bottom_yes mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th>Name</th>
                        <th>Last Active</th>
                        <th className="text-center">Last Login</th>
                        <th className="text-center">Last Reminded</th>
                        <th className="text-center"></th>
                      </tr>
                    </thead>
                    {!inactiveLoading ? (
                      <tbody>
                        {inactiveUsers.map((user: any, index: number) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="user_img_circled_wrap mr-2">
                                  <img
                                    src={avatar(user)}
                                    className="user_img_circled"
                                    alt=""
                                  />
                                </div>
                                <div className="ml-2 user-name">
                                  <h6>{user.name}</h6>
                                  <p>{user.userId}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <h6>{user.lastAction}</h6>
                            </td>
                            <td className="text-center">
                              <h6>{user.lastLogin}</h6>
                            </td>
                            <td className="text-center">
                              <h6>{user.inactiveReminded}</h6>
                            </td>
                            <td className="text-center">
                              <a
                                className="btn btn-sm"
                                title="Send email"
                                onClick={() => sendEmail(user)}
                              >
                                <i className="fas fa-envelope-open-text"></i>
                              </a>
                              <a
                                className="btn btn-sm ml-2"
                                title="Chat"
                                onClick={() => openChatFunction(user)}
                              >
                                <i className="fas fa-comment"></i>
                              </a>
                              <a
                                className="btn btn-danger btn-sm ml-2"
                                onClick={() => ignore(user)}
                              >
                                Ignore
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ) : (
                      <tbody>
                        <tr>
                          <td colSpan={5}>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="50"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5}>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="50"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5}>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="50"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5}>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="50"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5}>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="50"
                            />
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
                {inactiveUsers && inactiveCount > inactiveParams.limit && (
                  <div className="text-center mt-5">
                    <div className="d-inline-block">
                      <PaginationComponent
                        totalItems="inactiveCount"
                        itemsPerPage={inactiveParams.limit}
                        currentPage={inactiveParams.page}
                        onPageChange={loadInactiveStudents}
                      />
                    </div>
                  </div>
                )}
                {!inactiveLoading && !inactiveCount && (
                  <div className="text-center">
                    <img
                      className="mx-auto"
                      src="/assets/images/NoMember.svg"
                      alt="image"
                    />
                    <p>No Inactive Student Found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseAnalyticsComponent;
