import React, { useEffect, useState } from "react";
import * as classSvc from "@/services/classroomService";
import * as subjectSvc from "@/services/subjectService";
import { millisecondsToTime, fromNow } from "@/lib/pipe";
import moment from "moment";
import { slugify } from "@/lib/validator";
import { jsonToCsv } from "@/lib/common";
import PImageComponent from "@/components/AppImage";
import { useParams } from "next/navigation";
import Chart from "react-apexcharts";

const ClassroomAnalytics = ({ classroom, settings, user }: any) => {
  const [averageData, setAaverageData] = useState<any>({});
  const [studentActivity, setStudentActivity] = useState<any[]>([]);
  const [students, setStudents] = useState<any>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [allStudents, setAllStudents] = useState<any>([]);
  const [intervalAverageData, setIntervalAverageData] = useState<any>({});
  const [subjects, setSubjects] = useState<any>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [attemptTrendChartOptions, setAttemptTrendChartOptions] = useState<any>(
    {
      series: [],
      options: {
        chart: {
          type: "line",
          height: 300,
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: [],
          title: {
            text: "Weeks",
          },
        },
        yaxis: {
          title: {
            text: "Count",
          },
        },
      },
    }
  );

  const [speedChartOptions, setSpeedChartOptions] = useState<any>({
    series: [],
    options: {
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
      dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
          fontSize: "12px",
          colors: ["#fff"],
        },
        formater(val, opt) {
          return opt.w.globals.series[opt.seriesIndex].data[opt.dataPointIndex];
        },
      },
      colors: [
        function ({ value, seriesIndex, dataPointIndex, w }) {
          if (w.config.series[seriesIndex].subMark[dataPointIndex]) {
            return "#0071EB";
          } else {
            return "#6C757D";
          }
        },
      ],
      yaxis: {
        title: {
          text: "Subjects and Units",
        },
      },
      xaxis: {
        categories: [],
        title: {
          text: "Avg. Time in seconds",
        },
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          return (
            '<div class="p-2">' +
            '<div class="bold">' +
            (w.config.series[seriesIndex].subMark[dataPointIndex]
              ? "Subject: "
              : "Unit: ") +
            w.config.xaxis.categories[dataPointIndex] +
            "</div>" +
            "<span>Avg. Time: " +
            series[seriesIndex][dataPointIndex] +
            " seconds</span>" +
            "</div>"
          );
        },
      },
    },
  });

  const [accuracyChartOptions, setAccuracyChartOptions] = useState<any>({
    series: [],
    options: {
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
      dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
          fontSize: "12px",
          colors: ["#fff"],
        },
        formater(val, opt) {
          return opt.w.globals.series[opt.seriesIndex].data[opt.dataPointIndex];
        },
      },
      colors: [
        function ({ value, seriesIndex, dataPointIndex, w }) {
          if (w.config.series[seriesIndex].subMark[dataPointIndex]) {
            return "#0071EB";
          } else {
            return "#6C757D";
          }
        },
      ],
      yaxis: {
        title: {
          text: "Subjects and Units",
        },
      },
      xaxis: {
        categories: [],
        title: {
          text: "Accuracy(%)",
        },
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          return (
            '<div class="p-2">' +
            '<div class="bold">' +
            (w.config.series[seriesIndex].subMark[dataPointIndex]
              ? "Subject: "
              : "Unit: ") +
            w.config.xaxis.categories[dataPointIndex] +
            "</div>" +
            "<span>Accuracy: " +
            series[seriesIndex][dataPointIndex] +
            "%</span>" +
            "</div>"
          );
        },
      },
    },
  });

  const [testseries, setTestseries] = useState<any>([]);
  const [loadingTs, setLoadingTs] = useState<any>(null);
  const [totalTsStudents, setTotalTsStudents] = useState<number>(0);
  const [tsStudents, setTsStudents] = useState<any>([]);
  const [selectedTs, setSelectedTs] = useState<any>(null);
  const [tsParams, setTsParams] = useState<any>({
    id: "",
    sort: "accuracy",
    searchText: "",
    limit: 20,
    page: 1,
  });

  const [stats, setStats] = useState<any>(null);
  const { id } = useParams();

  useEffect(() => {
    console.log(classroom, "classroom");
    subjectSvc.getMine().then((subs: []) => {
      setSubjects(subs);
    });

    classSvc.studentStats(classroom._id).then((res) => setStats(res));
    const data = {
      limit: 15,
      classroom: id,
      mymentee: false,
    };
    classSvc.summaryAttemptedAllClassrooms(data).then((d: any) => {
      if (!d) {
        d = {
          totalCorrects: 0,
          totalQuestions: 0,
          accuracy: 0,
          totalAttempt: 0,
          totalPractices: 0,
        };
        setAaverageData(d);
        return;
      }
      d.accuracy =
        ((d.totalCorrects / d.totalQuestionDo) * 100).toFixed(2) || 0;
      if (isNaN(d.accuracy)) {
        d.accuracy = 0;
      }
      setAaverageData(d);
    });
    classSvc
      .summaryAttemptedAllClassrooms({ ...data, interval: 15 })
      .then((d: any) => {
        if (!d) {
          d = {
            totalCorrects: 0,
            totalQuestions: 0,
            accuracy: 0,
            totalAttempt: 0,
            totalPractices: 0,
          };
          setIntervalAverageData(d);
          return;
        }

        if (!d.totalCorrects) {
          d.totalCorrects = 0;
        }
        d.accuracy = ((d.totalCorrects / d.totalQuestionDo) * 100).toFixed(2);
        if (isNaN(d.accuracy)) {
          d.accuracy = 0;
        }
        setIntervalAverageData(d);
      });
    const userActivityParams = {
      limit: 15,
      page: 1,
      classroom: id,
      chatSupport: false,
      inactive: true,
    };
    classSvc.findAllClassroomsMe(userActivityParams).then((ud: []) => {
      setStudentActivity(ud);
    });
    classSvc
      .summaryCorrectClassroom(data)
      .then((st: any) => {
        for (const s of st) {
          s.timeSpend = ((s.practiceTime || 0) + (s.Learningtime || 0)) * 60000;
        }

        const compareFunction = (a, b) => {
          if (a["percentage"] < b["percentage"]) return 1;
          if (a["percentage"] > b["percentage"]) return -1;
          return 0;
        };

        // Sort tmp_students array
        st.sort(compareFunction);
        setStudents(st);
        setAllStudents(st);
      })
      .catch((err) => {
        console.log("Fail to get leader board data");
      });

    classSvc.attemptTrend(id, {}).then((res: any) => {
      if (res.length) {
        const studentData = [];
        const attemptData = [];
        const labels = [];
        for (const d of res) {
          labels.push(
            moment().year(d.year).week(d.week).weekday(0).format("DD/MM")
          );
          studentData.push(d.students);
          attemptData.push(d.attempts);
        }
        setAttemptTrendChartOptions({
          ...attemptTrendChartOptions,
          series: [
            {
              name: "Students Count",
              data: studentData,
            },
            {
              name: "Attempts Count",
              data: attemptData,
            },
          ],
          options: {
            ...attemptTrendChartOptions.options,
            xaxis: {
              ...attemptTrendChartOptions.options.xaxis,
              categories: labels,
            },
          },
        });
      } else {
        setAttemptTrendChartOptions({
          ...attemptTrendChartOptions,
          series: [],
          options: {
            ...attemptTrendChartOptions.options,
            xaxis: {
              ...attemptTrendChartOptions.options.xaxis,
              categories: [],
            },
          },
        });
      }

      // setTimeout(() => {
      //   this.attemptTrendChartRef?.updateOptions(this.attemptTrendChartOptions);
      // }, 500);
    });

    classSvc.subjectAccuracyAndSpeed(id).then((subjects: any[]) => {
      const acc = [];
      const speed = [];
      const cat = [];
      const subMark = [];
      for (const sub of subjects) {
        acc.push(Math.round(sub.accuracy * 100));
        speed.push(Math.round(sub.speed / 1000));
        cat.push(sub.name);
        subMark.push(true);
        for (const unit of sub.units) {
          acc.push(Math.round(unit.accuracy * 100));
          speed.push(Math.round(unit.speed / 1000));
          cat.push(unit.name);
          subMark.push(false);
        }
        acc.push(0);
        speed.push(0);
        cat.push("");
        subMark.push(false);
      }
      setTimeout(() => {
        setAccuracyChartOptions({
          ...accuracyChartOptions,
          series: [...accuracyChartOptions.series, { data: acc, subMark }],
          options: {
            ...accuracyChartOptions.options,
            xaxis: {
              ...accuracyChartOptions.options.xaxis,
              categories: cat,
            },
            chart: {
              ...accuracyChartOptions.options.chart,
              height: 150 + cat.length * 20,
            },
          },
        });

        setSpeedChartOptions({
          ...speedChartOptions,
          series: [...speedChartOptions.series, { data: speed, subMark }],
          options: {
            ...speedChartOptions.options,
            xaxis: {
              ...speedChartOptions.options.xaxis,
              categories: cat,
            },
            chart: {
              ...speedChartOptions.options.chart,
              height: 150 + cat.length * 20,
            },
          },
        });
      }, 500);
    });
  }, []);

  const search = (text: string) => {
    setSearchText(text);
    if (text) {
      setStudents(
        allStudents.filter(
          (d) =>
            d.name.toLowerCase().toString().indexOf(text.toLowerCase()) != -1
        )
      );
    } else {
      setStudents(allStudents);
    }
  };

  const sortFunc = (filter: any) => {
    const tmp_students = [...students]; // Create a shallow copy of students array

    // Define comparison function based on filter
    const compareFunction = (a, b) => {
      if (a[filter] < b[filter]) return 1;
      if (a[filter] > b[filter]) return -1;
      return 0;
    };

    // Sort tmp_students array
    tmp_students.sort(compareFunction);
    setStudents(tmp_students);
  };

  const filterBySubject = (filter: string) => {
    const param: any = {
      classroom: id,
    };
    setSelectedSubject(filter);
    if (filter) {
      param.subjects = filter;
    }
    classSvc.summaryCorrectClassroom(param).then((st: any) => {
      for (const s of st) {
        s.timeSpend = ((s.practiceTime || 0) + (s.Learningtime || 0)) * 60000;
      }
      setStudents(st);
      setAllStudents(st);
      // sortFunc("percentage");
    });
  };

  const filterAttemptTrend = (val: any) => {
    const params: any = {};
    if (val == "last15Days") {
      params.days = 15;
    }

    classSvc.attemptTrend(id, params).then((res: any) => {
      if (res.length) {
        const studentData = [];
        const attemptData = [];
        const labels = [];
        for (const d of res) {
          if (val == "last15Days") {
            labels.push(`${d.day}/${d.month}`);
          } else {
            labels.push(
              moment().year(d.year).week(d.week).weekday(0).format("DD/MM")
            );
          }
          studentData.push(d.students);
          attemptData.push(d.attempts);
        }

        setAttemptTrendChartOptions({
          ...attemptTrendChartOptions,
          series: [
            {
              name: "Students Count",
              data: studentData,
            },
            {
              name: "Attempts Count",
              data: attemptData,
            },
          ],
          options: {
            ...attemptTrendChartOptions.options,
            xaxis: {
              ...attemptTrendChartOptions.options.xaxis,
              categories: labels,
            },
          },
        });
      } else {
        setAttemptTrendChartOptions({
          ...attemptTrendChartOptions,
          series: [],
          options: {
            ...attemptTrendChartOptions.options,
            xaxis: {
              ...attemptTrendChartOptions.options.xaxis,
              categories: [],
            },
          },
        });
      }

      setAttemptTrendChartOptions({
        ...attemptTrendChartOptions,
        options: {
          ...attemptTrendChartOptions.options,
          xaxis: {
            ...attemptTrendChartOptions.options.xaxis,
            title: {
              text: val == "last15Days" ? "Days" : "Weeks",
            },
          },
        },
      });

      // setTimeout(() => {
      //   this.attemptTrendChartRef?.updateOptions(this.attemptTrendChartOptions)
      // }, 500);
    });
  };

  const downloadLeaderboard = () => {
    const csvFileName = slugify(`leaderboard of ${classroom.name}`) + ".csv";

    const dataPush = [
      [
        "Rank",
        "UserID",
        "Name",
        "Avg Accuracy",
        "Time Spend",
        "Attempted Questions",
        "Attempted Assessments",
        "Last Attempt",
      ],
    ];

    for (let i = 0; i < students.length; i++) {
      const d = students[i];
      dataPush.push([
        i + 1,
        '"=""' + d.userId + '"""',
        d.name,
        Math.round(d.percentage, 2),
        millisecondsToTime(d.timeSpend, "short"),
        '"=""' + d.totalAttemptedQuestions + "/" + d.totalQuestions + '"""',
        '"=""' + d.practicesetId + "/" + d.totalTests + '"""',
        moment(d.lastAttempt).format("MMMM Do YYYY h:mm a"),
      ]);
    }

    jsonToCsv(dataPush, csvFileName);
  };

  return (
    <>
      <div className="rounded-boxes class-board bg-white">
        <div className="row align-items-center">
          <div className="col-md">
            <div className="square_profile_info d-flex align-items-center">
              <div className="squared-rounded_wrap_80">
                <PImageComponent
                  height={80}
                  width={80}
                  imageUrl={classroom.imageUrl}
                  backgroundColor={classroom.colorCode}
                  text={classroom.name}
                  radius={9}
                  fontSize={15}
                  type="classroom"
                />
              </div>

              <div className="class-board-info assignment-top-detail ml-2">
                <h3 className="top-title text-truncate">{classroom.name}</h3>
                {stats && (
                  <div className="my-1">
                    <span>{stats.active} Active</span> |
                    <span>{stats.deactive} Deleted</span> |
                    <span>{stats.pending} Pending</span>
                  </div>
                )}
                <p className="bottom-title mt-1 d-flex">
                  <span
                    className="material-icons-two-tone"
                    style={{ fontFamily: "Material Icons", fontSize: "14px" }}
                  >
                    portrait
                  </span>
                  {classroom.user && (
                    <>
                      <a
                        href={`/public/profile/${classroom.user._id}`}
                        className="mr-2"
                      >
                        {classroom.user.name}
                      </a>
                      {classroom.user._id !== user._id && (
                        <a
                          href="#"
                          className="mr-3"
                          onClick={() => {
                            // openChat(classroom.user._id, classroom.user.name)
                          }}
                        >
                          <i className="fas fa-comments"></i>
                        </a>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overall-main bg-white">
        <div className="row">
          <div className="col-lg-3 col-md-6">
            <div className="data_ana_box">
              <div className="overall-head">Total Attempts</div>
              <div className="mid_contents">
                <h1 className="big_num">{averageData?.totalAttempt}</h1>
                <div className="over3 d-flex justify-content-center">
                  <span className="material-icons">arrow_drop_up</span>
                  <small className="f-12 align-self-center">
                    {averageData?.totalAttempt}
                  </small>
                </div>
              </div>
              <p className="bottom_info_text">*Attempts in last 15 days</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="data_ana_box">
              <div className="overall-head">Assessments</div>
              <div className="mid_contents">
                <h1 className="big_num">{averageData?.totalPractices}</h1>
                <div className="over3 d-flex justify-content-center">
                  <span className="material-icons">arrow_drop_up</span>
                  <small className="f-12 align-self-center">
                    {averageData?.totalPractices}
                  </small>
                </div>
              </div>
              <p className="bottom_info_text">*Assessments in last 15 days</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="data_ana_box">
              <div className="overall-head">Questions</div>
              <div className="mid_contents">
                <h1 className="big_num">{averageData?.totalQuestions}</h1>
                <div className="over3 d-flex justify-content-center">
                  <span className="material-icons">arrow_drop_up</span>
                  <small className="f-12 align-self-center">
                    {intervalAverageData?.totalQuestions}
                  </small>
                </div>
              </div>
              <p className="bottom_info_text">*Questions in last 15 days</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="data_ana_box">
              <div className="overall-head">Average Accuracy %</div>
              <div className="mid_contents">
                <h1 className="big_num">{averageData?.accuracy}</h1>
                <div className="over3 d-flex justify-content-center">
                  <span className="material-icons">arrow_drop_up</span>
                  <small className="f-12 align-self-center">
                    {intervalAverageData?.accuracy}
                  </small>
                </div>
              </div>
              <p className="bottom_info_text">*Accuracy in last 15 days</p>
            </div>
          </div>
        </div>
        <div className="chart_boxes">
          <div className="admin-header">
            <span className="admin-head">Student Attempts</span>
            <p className="admin-head2">To know about attempt trend</p>
          </div>

          <div className="chart_area_body">
            {attemptTrendChartOptions.series.length > 0 ? (
              <Chart
                series={attemptTrendChartOptions.series}
                options={attemptTrendChartOptions.options}
                type="line"
                width="100%"
                height="300"
              />
            ) : (
              <div className="text-center mx-auto">
                <img
                  className="mx-auto"
                  src="/assets/images/empty-chart.svg"
                  alt="Empty chart"
                />
                <h6 className="text-muted">No data yet</h6>
              </div>
            )}
          </div>
        </div>
        <div className="chart_boxes">
          <div className="admin-header">
            <span className="admin-head">Accuracy Analysis</span>
            <p className="admin-head2">
              This shows % accuracy by subjects & units of the content published
              in the classroom. Based on the weak areas, you can infer the need
              for additional teaching or lessons.
            </p>
          </div>

          <div className="chart_area_body">
            {accuracyChartOptions.series.length > 0 ? (
              <div className="hide-tooltip">
                <Chart
                  series={accuracyChartOptions.series}
                  options={accuracyChartOptions.options}
                  type="bar"
                  width="100%"
                />
              </div>
            ) : (
              <div className="text-center mx-auto">
                <img
                  className="mx-auto"
                  src="/assets/images/empty-chart.svg"
                  alt="Empty chart"
                />
                <h6 className="text-muted">No data yet</h6>
              </div>
            )}
          </div>
        </div>
        <div className="chart_boxes">
          <div className="admin-header">
            <span className="admin-head">Speed Analysis</span>
            <p className="admin-head2">
              This shows the average time taken to solve questions by subjects &
              units of the content published in the classroom. You can help
              students improve their speed by providing tips & tricks, shorter
              ways to solve questions, formulae, etc., based on the weak areas.
            </p>
          </div>

          <div className="chart_area_body">
            {speedChartOptions.series.length > 0 ? (
              <div className="hide-tooltip">
                <Chart
                  series={speedChartOptions.series}
                  options={speedChartOptions.options}
                  type="bar"
                  width="100%"
                />
              </div>
            ) : (
              <div className="text-center mx-auto">
                <img
                  className="mx-auto"
                  src="/assets/images/empty-chart.svg"
                  alt="Empty chart"
                />
                <h6 className="text-muted">No data yet</h6>
              </div>
            )}
          </div>
        </div>

        <div className="chart_boxes">
          <div className="admin-header">
            <div className="d-flex justify-content-between">
              <div>
                <span className="admin-head">Leaderboard (by Subject)</span>
                <p className="admin-head2">
                  Know the performers of the classroom in each subject. This
                  data is only based on the content (course, test series, and
                  assessment) published in this classroom.
                </p>
              </div>
              <div>
                <button
                  onClick={downloadLeaderboard}
                  className="btn btn-outline"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
          <div className="chart_area_body">
            <div className="row">
              <div className="col-lg-3 col-12 mb-2">
                <div className="form-boxes mb-1">
                  <h2 className="form-box_subtitle">Arrange By</h2>
                </div>
                <select
                  className="form-control"
                  onChange={(e) => sortFunc(e.target.value)}
                >
                  <option value="percentage">Accuracy %</option>
                  <option value="timeSpend">Time Spend</option>
                  <option value="totalAttemptedQuestions">
                    Attempted Questions
                  </option>
                  <option value="practicesetId">Attempted Assessments</option>
                </select>
              </div>
              <div className="col-lg-3 col-12 mb-2">
                <div className="form-boxes mb-1">
                  <h2 className="form-box_subtitle">Filter by Subject</h2>
                </div>
                <select
                  className="form-control"
                  value={selectedSubject}
                  onChange={(e) => filterBySubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col align-self-end mb-3">
                <div className="common_search-type-1 form-half ml-auto">
                  <div className="form-group mb-0">
                    <span>
                      <figure>
                        <img src="/assets/images/search-icon-2.png" alt="" />
                      </figure>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search for Students"
                      value={searchText}
                      onChange={(e) => search(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              {students.length > 0 ? (
                <table className="table vertical-middle border-top-none border-bottom_yes mb-0">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th className="text-center">Avg Accuracy</th>
                      <th className="text-center">Time Spend</th>
                      <th className="text-center">Attempted Questions</th>
                      <th className="text-center">Attempted Assessments</th>
                      <th className="text-center">Last Attempt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((std, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <figure className="avatar_wrapper">
                              {std.avatar.length > 0 ? (
                                <img
                                  className="avatar"
                                  alt="Student Avatar"
                                  src={std.avatar}
                                />
                              ) : (
                                <img
                                  className="avatar"
                                  alt="User Profile"
                                  src="/assets/images/defaultProfile.png"
                                />
                              )}
                            </figure>
                            <div className="ml-2">
                              <h6>{std.name}</h6>
                              <p>{std.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <h6>{std.percentage.toFixed(2)}%</h6>
                        </td>
                        <td className="text-center">
                          <h6>{millisecondsToTime(std.timeSpend, "short")}</h6>
                        </td>
                        <td className="text-center">
                          <h6>
                            {std.totalAttemptedQuestions}/{std.totalQuestions}
                          </h6>
                        </td>
                        <td className="text-center">
                          <h6>
                            {std.practicesetId}/{std.totalTests}
                          </h6>
                        </td>
                        <td className="text-center">
                          <h6>{fromNow(std.lastAttempt)}</h6>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="course-search-empty text-center empty-data">
                  <figure className="mx-auto">
                    <img
                      src="/assets/images/Search-rafiki.png"
                      alt=""
                      className="img-fluid d-block mx-auto mb-4"
                    />
                  </figure>
                  <h6>No Data Available</h6>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="chart_boxes">
          <div className="admin-header">
            <span className="admin-head">Inactive Students</span>
            <p className="admin-head2">
              Students who haven&apos;t shown any activity in the past ten days,
              detailing their name, last active date, last login, and email
              address for follow-up.
            </p>
          </div>
          <div className="chart_area_body">
            {studentActivity && studentActivity.length > 0 ? (
              <div className="table-responsive">
                <table className="table vertical-middle border-top-none border-bottom_yes mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Last Active</th>
                      <th className="text-center">Last Attempt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentActivity.map((student, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <figure className="avatar_wrapper">
                              <img
                                className="avatar"
                                alt="User Profile"
                                src="/assets/images/defaultProfile.png"
                              />
                            </figure>
                            <div className="ml-2">
                              <h6>{student.name}</h6>
                              <p>{student.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <h6>{fromNow(student.lastLogin)}</h6>
                        </td>
                        <td className="text-center">
                          <h6>{fromNow(student.lastAttempted)}</h6>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="course-search-empty text-center empty-data">
                <figure className="mx-auto">
                  <img
                    src="/assets/images/Search-rafiki.png"
                    alt=""
                    className="img-fluid d-block mx-auto mb-4"
                  />
                </figure>
                <h6>No Data Available</h6>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassroomAnalytics;
