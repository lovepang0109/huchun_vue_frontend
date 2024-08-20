"use client";
import React, { useState, useEffect, useRef } from "react";
import * as studentSvc from "@/services/student-service";
import Chart from "react-apexcharts";

const EffortAnalysisComponent = ({ student, subjects }: any) => {
  const [persistanceData, setPersistanceData] = useState([
    {
      label: "",
      count: 0,
      totalAttempts: 0,
    },
  ]);
  const [loadedSubData, setLoadedSubData] = useState<any>({});
  const [selectedPracticeSubject, setSelectedPracticeSubject] =
    useState<any>(null);
  const [practiceEffort, setPracticeEffort] = useState<any>(null);

  const [practiceTopicsChart, setPracticeTopicsChart] = useState<any>({
    series: [
      {
        name: "Question Count",
        data: [],
      },
    ],
    options: {
      title: {
        text: "Exceeded Time Topic",
      },
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [],
        title: {
          text: "Count",
        },
      },
      yaxis: {
        title: {
          text: "Topics",
        },
      },
    },
  });
  const [donutChartResponsive, setDonutChartResponsive] = useState<any>([
    {
      breakpoint: 1200,
      options: {
        chart: {
          width: 400,
          height: 350,
        },
        legend: {
          position: "bottom",
        },
      },
    },
    {
      breakpoint: 992,
      options: {
        chart: {
          width: 260,
          height: 350,
        },
        legend: {
          position: "bottom",
        },
      },
    },
    {
      breakpoint: 768,
      options: {
        chart: {
          width: 172,
          height: 300,
        },
        legend: {
          position: "bottom",
        },
      },
    },
    {
      breakpoint: 576,
      options: {
        chart: {
          width: 350,
          height: 300,
        },
        legend: {
          position: "bottom",
        },
      },
    },
    {
      breakpoint: 476,
      options: {
        chart: {
          width: 300,
          height: 300,
        },
        legend: {
          position: "bottom",
        },
      },
    },
    {
      breakpoint: 394,
      options: {
        chart: {
          width: 269,
          height: 300,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ]);
  const [persistanceChartOptions, setPersistanceChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 200,
        type: "donut",
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              value: {
                fontSize: "14px",
                fontWeight: 400,
                formatter: (val, opts) => {
                  const total = opts.globals.series.reduce((p, c) => p + c, 0);
                  return ((val * 100) / total).toFixed(1) + "%";
                },
              },
              total: {
                show: false,
                label: "Total",
                fontSize: "16px",
                fontWeight: 500,
                formatter: (w) => {
                  const total = Math.round(
                    w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0)
                  );

                  return total;
                },
              },
            },
          },
        },
      },
      legend: {
        show: false,
        position: "bottom",
        horizontalAlign: "left",
        fontSize: "12px",
        itemMargin: {
          horizontal: 0,
          vertical: 0,
        },
        formatter: function (seriesName, opts) {
          const val = Number(
            opts.w.globals.series[opts.seriesIndex].toFixed(2)
          );
          return [
            '<div class="apexcharts-legend-custom-text">' +
              seriesName +
              "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
              (val > 1 ? val + " mins" : "< 1 min") +
              "</div>",
          ];
        },
      },
      tooltip: {
        enabled: false,
      },
      labels: [],
      responsive: donutChartResponsive,
    },
  });
  const [effortTrendChartOptions, setEffortTrendChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      tooltip: {},
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        title: {
          text: "Date",
        },
        categories: [],
      },
      yaxis: {
        title: { text: "Attempt Counts" },
      },
    },
  });

  const [persistance, setPersistance] = useState<any>(null);
  const [effortTrend, setEffortTrend] = useState<any>(null);

  useEffect(() => {
    if (subjects.length) {
      setSelectedPracticeSubject(subjects[0]);
      onPracticeSubjectChange();
    }

    studentSvc
      .getPersistanceData({ studentId: student._id })
      .then((d: any[]) => {
        setPersistance(d);
        if (d && d.length > 0) {
          drawPersistanceGraph(d[0]);
        }
      });

    studentSvc
      .getEffortTrendAttemptCount({ studentId: student._id })
      .then((g: any) => {
        setEffortTrend(g);
        drawEffortTrendAttemptCount(g.user, g.average, g.topper);
      });
  }, []);

  const onPracticeSubjectChange = (sub: any) => {
    setSelectedPracticeSubject(sub);
    if (!sub) {
      sub = subjects[0]._id;
    }
    if (!loadedSubData[sub]) {
      const update_loadedSubData: any = {};
      update_loadedSubData[sub] = {};

      setLoadedSubData(update_loadedSubData);
    }

    if (loadedSubData[sub]?.effort) {
      setPracticeEffort(loadedSubData[sub]?.effort);
    } else {
      studentSvc.getPracticeEffort(sub, student._id).then((d: any) => {
        const days = Math.ceil(
          (new Date().getTime() - new Date(student.createdAt).getTime()) /
            (1000 * 3600 * 24)
        );
        d.overAllEffort = Math.round(d.overAllEffort / days);
        setPracticeEffort(d);
        setLoadedSubData({
          ...loadedSubData,
          [sub]: {
            effort: d,
          },
        });
      });
    }

    if (loadedSubData[sub]?.topicExceed) {
      const d = loadedSubData[sub]?.topicExceed;
      const series = [];
      const categories = [];
      if (d && d.length > 0) {
        d.forEach((element) => {
          series.push(element.count);
          categories.push(element.topic.name);
        });
      }
      setPracticeTopicsChart({
        ...practiceTopicsChart,
        series: [{ name: "Question Count", data: series }],
        options: {
          ...practiceTopicsChart.options,
          xaxis: {
            ...practiceTopicsChart.options.xasis,
            categories: categories,
            title: { text: "Count" },
          },
        },
      });
    } else {
      studentSvc
        .getTopicsUserExceedAvgTime(sub, student._id)
        .then((d: any[]) => {
          setLoadedSubData({
            ...loadedSubData,
            [sub]: {
              topicExceed: d,
            },
          });
          const series = [];
          const categories = [];
          if (d && d.length > 0) {
            d.forEach((element) => {
              series.push(element.count);
              categories.push(element.topic.name);
            });
          }
          setPracticeTopicsChart({
            ...practiceTopicsChart,
            series: [{ name: "Question Count", data: series }],
            options: {
              ...practiceTopicsChart.options,
              xaxis: {
                ...practiceTopicsChart.options.xasis,
                categories: categories,
                title: { text: "Count" },
              },
            },
          });
        });
    }
  };

  const drawPersistanceGraph = (data: any) => {
    const totalAttempts = data.totalAttempt;
    const statusCount = [];
    const labels = ["Abandoned", "Finished"];
    const update_persistanceData = [];
    update_persistanceData.push({
      label: "Abandoned",
      count: data.abandoned,
      totalAttempts: data.totalAttempt,
    });
    update_persistanceData.push({
      label: "Finished",
      count: data.success,
      totalAttempts: data.totalAttempt,
    });
    setPersistanceData(update_persistanceData);
    statusCount[0] = Number(
      ((data.abandoned / totalAttempts) * 100).toFixed(2)
    );
    statusCount[1] = Number(((data.success / totalAttempts) * 100).toFixed(2));
    setPersistanceChartOptions({
      ...persistanceChartOptions,
      series: statusCount,
      options: {
        ...persistanceChartOptions.options,
        labels: labels,
      },
    });
  };

  const drawEffortTrendAttemptCount = (
    user: any,
    average: any,
    topper: any,
    reload?: any
  ) => {
    const attemptAverageCount = [];
    const attemptCount = [];
    const topperAttemptCount = [];
    user.forEach((e) => {
      average.forEach((a) => {
        if (e._id.day === a._id.day) {
          attemptAverageCount.push(Math.round(a.averageAttemptCount));
        }
      });
    });
    user.forEach((e) => {
      topper.forEach((a) => {
        if (e._id.day === a._id.day) {
          topperAttemptCount.push(a.topperAttemptCount);
        }
      });
    });
    user.forEach((element) => {
      attemptCount.push(element.attemptCount);
    });
    if (reload) {
      const dates = [];
      user.forEach((element) => {
        const date = element._id.day + "/" + element._id.month;
        dates.push(date);
      });
      setEffortTrendChartOptions({
        ...effortTrendChartOptions,
        series: [
          {
            name: "Best",
            data: topperAttemptCount,
          },
          {
            name: "You",
            data: attemptCount,
          },
          {
            name: "Average",
            data: attemptAverageCount,
          },
        ],
        options: {
          ...effortTrendChartOptions.options,
          xaxis: {
            ...effortTrendChartOptions.options.xaxis,
            categories: dates,
          },
          yaxis: {
            ...effortTrendChartOptions.options.yaxis,
            show: true,
            title: { text: "Attempt Counts" },
            forceNiceScale: true,
          },
        },
      });
    } else {
      user.forEach((element) => {
        const date = element._id.day + "/" + element._id.month;
        const cat = effortTrendChartOptions.options.xaxis.categories;
        cat.push(date);
        setEffortTrendChartOptions({
          ...effortTrendChartOptions,
          options: {
            ...effortTrendChartOptions.options,
            xaxis: {
              ...effortTrendChartOptions.options.xaxis,
              categories: cat,
            },
          },
        });
      });
      setEffortTrendChartOptions({
        ...effortTrendChartOptions,
        series: [
          {
            name: "Best",
            data: topperAttemptCount,
          },
          {
            name: "You",
            data: attemptCount,
          },
          {
            name: "Average",
            data: attemptAverageCount,
          },
        ],
      });
    }
  };

  return (
    <>
      <div className="over-out-1 mt-2">
        <div className="chart_boxes admin-box2">
          <div className="admin-header">
            <h1 className="admin-head"> Measure Your Practice</h1>
            <p className="admin-head2">
              Check out how many questions you&apos;ve tackled today and this
              month compared to your daily average. Each bar represents a topic,
              helping you see where you&apos;ve practiced the most. Remember,
              practice makes perfect!{" "}
            </p>
          </div>
          <div className="chart_area_body filter-via-select pb-0">
            <div className="filter-area clearfix">
              <div className="filter-item m-1">
                <select
                  className="form-control"
                  name="subject"
                  value={selectedPracticeSubject}
                  onChange={(e) => onPracticeSubjectChange(e.target.value)}
                  required
                >
                  <option value={null} disabled>
                    Select
                  </option>
                  {subjects.map((subject) => (
                    <option key={subject.name} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mx-auto">
                <div className="row mx-auto">
                  {practiceEffort && (
                    <>
                      <div className="col-4 text-center">
                        <div className="out-circle">
                          <div
                            className={`p-circle progress-circle p${
                              practiceEffort?.todayEffort
                            } ${
                              practiceEffort?.todayEffort > 50 ? "over50" : ""
                            }`}
                          >
                            <span>
                              {practiceEffort.todayEffort.toFixed(0)} <br />{" "}
                              ques
                            </span>
                            <div className="left-half-clipper">
                              <div
                                className="first50-bar"
                                style={{
                                  background:
                                    practiceEffort?.todayEffort > 60
                                      ? "#008ffb"
                                      : practiceEffort?.todayEffort > 30
                                      ? "#008ffb"
                                      : "#008ffb",
                                }}
                              ></div>
                              <div
                                className="value-bar"
                                style={{
                                  borderColor:
                                    practiceEffort?.todayEffort > 60
                                      ? "#008ffb"
                                      : practiceEffort?.todayEffort > 30
                                      ? "#008ffb"
                                      : "#008ffb",
                                }}
                              ></div>
                            </div>
                          </div>
                          <h6 className="circle-head">Today</h6>
                        </div>
                      </div>
                      <div className="col-4 text-center">
                        <div className="out-circle">
                          <div
                            className={`p-circle progress-circle p${
                              practiceEffort.monthEffort
                            } ${
                              practiceEffort.monthEffort > 50 ? "over50" : ""
                            }`}
                          >
                            <span>
                              {practiceEffort.monthEffort.toFixed(0)} <br />{" "}
                              ques
                            </span>
                            <div className="left-half-clipper">
                              <div
                                className="first50-bar"
                                style={{
                                  background:
                                    practiceEffort.monthEffort > 60
                                      ? "#008ffb"
                                      : practiceEffort.monthEffort > 30
                                      ? "#008ffb"
                                      : "#008ffb",
                                }}
                              ></div>
                              <div
                                className="value-bar"
                                style={{
                                  borderColor:
                                    practiceEffort.monthEffort > 60
                                      ? "#008ffb"
                                      : practiceEffort.monthEffort > 30
                                      ? "#008ffb"
                                      : "#008ffb",
                                }}
                              ></div>
                            </div>
                          </div>
                          <h6 className="circle-head">This Month</h6>
                        </div>
                      </div>
                      <div className="col-4 text-center">
                        <div className="out-circle">
                          <div
                            className={`p-circle progress-circle p${
                              practiceEffort.overAllEffort
                            } ${
                              practiceEffort.overAllEffort > 50 ? "over50" : ""
                            }`}
                          >
                            <span>
                              {practiceEffort.overAllEffort.toFixed(0)} <br />{" "}
                              ques
                            </span>
                            <div className="left-half-clipper">
                              <div
                                className="first50-bar"
                                style={{
                                  background:
                                    practiceEffort.overAllEffort > 60
                                      ? "#008ffb"
                                      : practiceEffort.overAllEffort > 30
                                      ? "#008ffb"
                                      : "#008ffb",
                                }}
                              ></div>
                              <div
                                className="value-bar"
                                style={{
                                  borderColor:
                                    practiceEffort.overAllEffort > 60
                                      ? "#008ffb"
                                      : practiceEffort.overAllEffort > 30
                                      ? "#008ffb"
                                      : "#008ffb",
                                }}
                              ></div>
                            </div>
                          </div>
                          <h6 className="circle-head">Avg/Day</h6>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                {practiceTopicsChart.series[0].data.length ? (
                  <div className="mt-3">
                    <Chart
                      series={practiceTopicsChart.series}
                      options={practiceTopicsChart.options}
                      type="bar"
                      width="100%"
                      height="300"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <svg
                      width="211"
                      height="210"
                      viewBox="0 0 211 210"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M31.6594 104.81C31.6594 95.0645 33.5789 85.4142 37.3084 76.4103C41.038 67.4065 46.5044 59.2254 53.3956 52.3341L74.6149 73.5533C70.5102 77.658 67.2541 82.531 65.0327 87.8941C62.8112 93.2571 61.6679 99.0052 61.6679 104.81L31.6594 104.81Z"
                        fill="#DBDBE8"
                      />
                      <path
                        d="M31.6594 104.81C31.6594 121.98 37.6126 138.618 48.5048 151.89C59.3969 165.162 74.5541 174.247 91.3936 177.596C108.233 180.946 125.713 178.353 140.855 170.26C155.997 162.166 167.864 149.072 174.435 133.21C181.005 117.348 181.872 99.6976 176.888 83.2675C171.904 66.8374 161.378 52.6437 147.102 43.1049C132.826 33.5661 115.684 29.2723 98.5976 30.9552C81.5109 32.6381 65.5363 40.1935 53.3956 52.3341L74.9787 73.9172C82.126 66.7699 91.5303 62.322 101.589 61.3313C111.648 60.3406 121.74 62.8683 130.144 68.4839C138.548 74.0994 144.746 82.4553 147.68 92.1278C150.614 101.8 150.103 112.191 146.235 121.529C142.367 130.868 135.381 138.576 126.467 143.341C117.552 148.105 107.262 149.632 97.3483 147.66C87.4348 145.688 78.5117 140.34 72.0994 132.526C65.6871 124.713 62.1824 114.918 62.1824 104.81L31.6594 104.81Z"
                        fill="#D4D4EA"
                      />
                      <path
                        d="M52.7724 156.929C45.9479 149.972 40.5606 141.738 36.9181 132.699C33.2756 123.66 31.4492 113.991 31.5432 104.246L62.0624 104.54C62.0071 110.278 63.0824 115.97 65.2269 121.292C67.3713 126.613 70.5431 131.461 74.5609 135.557L52.7724 156.929Z"
                        fill="#DEDEE7"
                      />
                      <path
                        d="M105.625 178.956C95.8791 178.982 86.2237 177.088 77.21 173.383C68.1963 169.677 60.0007 164.232 53.0911 157.359L74.8124 135.522C78.8543 139.543 83.6484 142.728 88.9212 144.896C94.1939 147.063 99.842 148.171 105.543 148.156L105.625 178.956Z"
                        fill="#E1E1E6"
                      />
                      <path
                        d="M157.882 158.062C150.907 164.869 142.66 170.236 133.612 173.855C124.563 177.475 114.89 179.277 105.145 179.158L105.518 148.537C111.242 148.607 116.923 147.549 122.238 145.423C127.553 143.297 132.397 140.145 136.494 136.146L157.882 158.062Z"
                        fill="#D8D8E9"
                      />
                    </svg>
                    <h6 className="text-muted">No data yet</h6>
                    <p className="text-muted">
                      Spend sometime to see your progress
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-8">
          <div className="chart_boxes over-box1">
            <div className="admin-header">
              <h4 className="admin-head">Effort Trend</h4>
              <p className="admin-head2">
                Track your daily efforts and understand your study habits
                better! This graph reveals the number of questions you&apos;ve
                attempted and the total hours you&apos;ve put in over the past
                month.
              </p>
            </div>
            <div className="chart_area_body new-body-chart_area_body">
              {effortTrend &&
                effortTrend.user &&
                effortTrend.user.length > 0 && (
                  <Chart
                    series={effortTrendChartOptions.series}
                    options={effortTrendChartOptions.options}
                    type="line"
                    width="100%"
                    height="300"
                  />
                )}
              <div className="filter-area clearfix">
                <div className="filter-item">
                  <div className="dropdown">
                    <a
                      className="btn dropdown-toggle border-0"
                      href="#"
                      role="button"
                      id="Effort_Trend_filterLavel"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      {/* <span>{selectEffortTrendFilter}</span> */}
                    </a>
                    <div
                      className="dropdown-menu border-0 py-0"
                      aria-labelledby="filterLavel"
                    >
                      {/* <a className="dropdown-item" onClick={() => filterEffortTrend('attempt_count')}>Attempt Count</a>
                      <a className="dropdown-item" onClick={() => filterEffortTrend('time_spent')}>Time Spent</a> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {!effortTrend ||
              (effortTrend.user && !effortTrend.user.length && (
                <div className="chart_boxes over-box-1 text-center">
                  <svg
                    width="244"
                    height="244"
                    viewBox="0 0 244 244"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M30.5 193.167H213.5V213.5H30.5V193.167ZM61 162.667C72.1833 162.667 81.3333 153.517 81.3333 142.333C81.3333 137.25 79.3 132.167 76.25 129.117L89.4667 101.667H91.5C96.5833 101.667 101.667 99.6333 104.717 96.5833L132.167 110.817V111.833C132.167 123.017 141.317 132.167 152.5 132.167C163.683 132.167 172.833 123.017 172.833 111.833C172.833 106.75 170.8 102.683 167.75 98.6167L180.967 71.1667H183C194.183 71.1667 203.333 62.0167 203.333 50.8333C203.333 39.65 194.183 30.5 183 30.5C171.817 30.5 162.667 39.65 162.667 50.8333C162.667 55.9167 164.7 61 167.75 64.05L154.533 91.5H152.5C147.417 91.5 142.333 93.5333 139.283 96.5833L111.833 83.3667V81.3333C111.833 70.15 102.683 61 91.5 61C80.3167 61 71.1667 70.15 71.1667 81.3333C71.1667 86.4167 73.2 91.5 76.25 94.55L63.0333 122H61C49.8167 122 40.6667 131.15 40.6667 142.333C40.6667 153.517 49.8167 162.667 61 162.667Z"
                      fill="#D4D4EA"
                    />
                  </svg>
                  <h6 className="text-muted">No data yet</h6>
                  <p className="text-muted">
                    Spend sometime to see your progress
                  </p>
                </div>
              ))}
          </div>
        </div>
        <div className="col-4">
          <div className="chart_boxes admin-box4">
            <div className="admin-header">
              <h1 className="admin-head">Persistence analysis</h1>
              <p className="admin-head2">
                See how often you complete your assessments versus leaving them
                abandoned. Building the capability to finish the assessment with
                good performance is essential.
              </p>
            </div>
            <div className="chart_area_body">
              {persistance && persistance.length > 0 && (
                <Chart
                  series={persistanceChartOptions.series}
                  options={persistanceChartOptions.options}
                  type="donut"
                  width="100%"
                  height="300"
                />
              )}
              <div>
                {persistanceData.map((ls, index) => (
                  <div className="row mx-0" key={index}>
                    <div className="col">
                      <span className="purple text-left">{ls?.label}</span>
                    </div>
                    <div className="col-auto ml-auto">
                      <div className="marks">
                        <span>
                          {ls?.count} / {ls.totalAttempts}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!persistance ||
              (!persistance.length && (
                <div className="chart_area_body text-center">
                  <svg
                    width="86"
                    height="98"
                    viewBox="0 0 86 98"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M38.7977 0.953124C38.4979 0.642716 38.1393 0.395124 37.7428 0.224795C37.3463 0.0544654 36.9198 -0.0351899 36.4883 -0.0389398C36.0568 -0.0426897 35.6288 0.0395409 35.2294 0.202954C34.83 0.366367 34.4671 0.607689 34.162 0.91284C33.8568 1.21799 33.6155 1.58086 33.4521 1.98027C33.2887 2.37969 33.2064 2.80765 33.2102 3.23918C33.2139 3.67071 33.3036 4.09718 33.4739 4.49369C33.6442 4.8902 33.8918 5.24882 34.2023 5.54862L41.6772 13.0236C18.95 13.7191 0.75 32.3579 0.75 55.2509C0.75 78.5859 19.665 97.5009 43 97.5009C66.335 97.5009 85.25 78.5859 85.25 55.2509V54.9909C85.2402 53.3009 83.8232 52.0009 82.1365 52.0009H81.857C80.1117 52.0009 78.75 53.5024 78.75 55.2509C78.75 74.9946 62.7437 91.0009 43 91.0009C23.2563 91.0009 7.25 74.9946 7.25 55.2509C7.25 35.9654 22.5185 20.2484 41.6285 19.5269L34.2023 26.9531C33.6102 27.5661 33.2827 28.387 33.2901 29.2392C33.2975 30.0913 33.6393 30.9065 34.2418 31.509C34.8444 32.1116 35.6596 32.4534 36.5117 32.4608C37.3638 32.4682 38.1848 32.1406 38.7977 31.5486L51.7978 18.5486C52.407 17.9392 52.7493 17.1127 52.7493 16.2509C52.7493 15.3891 52.407 14.5626 51.7978 13.9531L38.7977 0.953124ZM64.7978 39.9531C65.407 40.5626 65.7493 41.3891 65.7493 42.2509C65.7493 43.1127 65.407 43.9392 64.7978 44.5486L45.2978 64.0486C44.6883 64.6579 43.8618 65.0002 43 65.0002C42.1382 65.0002 41.3117 64.6579 40.7023 64.0486L30.9523 54.2986C30.3602 53.6857 30.0327 52.8647 30.0401 52.0126C30.0475 51.1604 30.3893 50.3453 30.9918 49.7427C31.5944 49.1401 32.4096 48.7983 33.2617 48.7909C34.1138 48.7835 34.9348 49.1111 35.5477 49.7031L43 57.1554L60.2022 39.9531C60.8117 39.3438 61.6382 39.0016 62.5 39.0016C63.3618 39.0016 64.1883 39.3438 64.7978 39.9531Z"
                      fill="#D4D4EA"
                    />
                  </svg>
                  <h6 className="text-muted">No data yet</h6>
                  <p className="text-muted">
                    Spend sometime to see your progress
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EffortAnalysisComponent;
