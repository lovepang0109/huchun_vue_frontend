"use client";
import { useEffect, useState } from "react";
import * as publisherService from "@/services/publisherService";
import { useSession } from "next-auth/react";
import _ from "lodash";
import Chart from "react-apexcharts";

export default function PublisherHome({ settings }: any) {
  const userInfo: any = useSession()?.data?.user?.info || {};
  const [sold, setSold] = useState<any>({});
  const [intervalSoldData, setIntervalSoldData] = useState<any>({});
  const [assessmentSubjectDistribution, setAssessmentSubjectDistribution] =
    useState<any>({});
  const [testseriesSubjectDistribution, setTestseriesSubjectDistribution] =
    useState<any>({});
  const [courseSubjectDistribution, setCourseSubjectDistribution] =
    useState<any>({});
  const [questionSubjectDistribution, setQuestionSubjectDistribution] =
    useState<any>({});
  const [testseriesTrend, setTestseriesTrend] = useState<any>([]);
  const [courseTrend, setCourseTrend] = useState<any>([]);
  const [assessmentTrend, setAssessmentTrend] = useState<any>([]);
  const [tab, setTab] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [chartOptions, setChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 400,
      },
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
                fontSize: "16px",
                fontWeight: 400,
                formatter: (val, opts) => {
                  return Math.round(val);
                },
              },
              total: {
                show: true,
                label: "Courses",
                fontSize: "18px",
                fontWeight: 600,
                formatter: (val, opts) => {
                  const total = val.globals.series.reduce((p, c) => p + c, 0);
                  return total;
                },
              },
            },
          },
        },
      },
      legend: {
        show: true,
        // height: 150,
        minHeight: 50,
        maxHeight: 150,
        height: 110,
        horizontalAlign: "left",
        position: "bottom",
        fontSize: "12px",
        itemMargin: {
          horizontal: 0,
          vertical: 0,
        },
        formatter: function (seriesName, opts) {
          const val = Number(
            opts.w.globals.series[opts.seriesIndex]?.toFixed(2)
          );
          return [
            '<div class="apexcharts-legend-custom-text ">' +
              seriesName +
              "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
              (val > 0.99 ? val : "< 1") +
              "</div>",
          ];
        },
      },
      responsive: [
        {
          breakpoint: 1440,
          options: {
            chart: {
              height: 450,
            },
          },
        },
        {
          breakpoint: 1366,
          options: {
            chart: {
              height: 400,
            },
          },
        },
        {
          breakpoint: 1280,
          options: {
            chart: {
              height: 350,
            },
          },
        },
      ],
    },
  });
  const [courseChartOptions, setCourseChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 400,
      },
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
                fontSize: "16px",
                fontWeight: 400,
                formatter: (val, opts) => {
                  return Math.round(val);
                },
              },
              total: {
                show: true,
                label: "Courses",
                fontSize: "18px",
                fontWeight: 600,
                formatter: (val, opts) => {
                  const total = val.globals.series.reduce((p, c) => p + c, 0);
                  return total;
                },
              },
            },
          },
        },
      },
      legend: {
        show: true,
        // height: 150,
        minHeight: 50,
        maxHeight: 150,
        height: 110,
        horizontalAlign: "left",
        position: "bottom",
        fontSize: "12px",
        itemMargin: {
          horizontal: 0,
          vertical: 0,
        },
        formatter: function (seriesName, opts) {
          const val = Number(
            opts.w.globals.series[opts.seriesIndex]?.toFixed(2)
          );
          return [
            '<div class="apexcharts-legend-custom-text ">' +
              seriesName +
              "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
              (val > 0.99 ? val : "< 1") +
              "</div>",
          ];
        },
      },
      responsive: [
        {
          breakpoint: 1440,
          options: {
            chart: {
              height: 450,
            },
          },
        },
        {
          breakpoint: 1366,
          options: {
            chart: {
              height: 400,
            },
          },
        },
        {
          breakpoint: 1280,
          options: {
            chart: {
              height: 350,
            },
          },
        },
      ],
    },
  });
  const [testseriesChartOptions, setTestseriesChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 400,
        // width:300
      },
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
        // height: 150,
        minHeight: 50,
        maxHeight: 150,
        height: 110,
        horizontalAlign: "left",
        position: "bottom",
        fontSize: "12px",
        itemMargin: {
          horizontal: 0,
          vertical: 0,
        },
        formatter: function (seriesName, opts) {
          const val = Number(
            opts.w.globals.series[opts.seriesIndex]?.toFixed(2)
          );
          return [
            '<div class="apexcharts-legend-custom-text ">' +
              seriesName +
              "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
              (val > 0.99 ? val : "< 1") +
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
                fontSize: "16px",
                fontWeight: 400,
                formatter: (val, opts) => {
                  return Math.round(val);
                },
              },
              total: {
                show: true,
                label: "Test Series",
                fontSize: "18px",
                fontWeight: 600,
                formatter: (val, opts) => {
                  const total = val.globals.series.reduce((p, c) => p + c, 0);
                  return total;
                },
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 1440,
          options: {
            chart: {
              height: 450,
            },
          },
        },
        {
          breakpoint: 1366,
          options: {
            chart: {
              height: 400,
            },
          },
        },
        {
          breakpoint: 1280,
          options: {
            chart: {
              height: 350,
            },
          },
        },
      ],
    },
  });
  const [assessmentChartOptions, setAssessmentChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 400,
        // width:300
      },
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
        // height: 150,
        minHeight: 50,
        maxHeight: 150,
        height: 110,
        horizontalAlign: "left",
        position: "bottom",
        fontSize: "12px",
        itemMargin: {
          horizontal: 0,
          vertical: 0,
        },
        formatter: function (seriesName, opts) {
          const val = Number(
            opts.w.globals.series[opts.seriesIndex]?.toFixed(2)
          );
          return [
            '<div class="apexcharts-legend-custom-text ">' +
              seriesName +
              "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
              (val > 0.99 ? val : "< 1") +
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
                fontSize: "16px",
                fontWeight: 400,
                formatter: (val, opts) => {
                  return Math.round(val);
                },
              },
              total: {
                show: true,
                label: "Assessment",
                fontSize: "18px",
                fontWeight: 600,
                formatter: (val, opts) => {
                  const total = val.globals.series.reduce((p, c) => p + c, 0);
                  return total;
                },
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 1440,
          options: {
            chart: {
              height: 450,
            },
          },
        },
        {
          breakpoint: 1366,
          options: {
            chart: {
              height: 400,
            },
          },
        },
        {
          breakpoint: 1280,
          options: {
            chart: {
              height: 350,
            },
          },
        },
      ],
    },
  });

  const [questionsChartOptions, setQuestionsChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 400,
        // width:300
      },
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
        minHeight: 50,
        maxHeight: 150,
        height: 110,
        horizontalAlign: "left",
        position: "bottom",
        fontSize: "12px",
        itemMargin: {
          horizontal: 0,
          vertical: 0,
        },
        formatter: function (seriesName, opts) {
          const val = Number(
            opts.w.globals.series[opts.seriesIndex]?.toFixed(2)
          );
          return [
            '<div class="apexcharts-legend-custom-text ">' +
              seriesName +
              "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
              (val > 0.99 ? val : "< 1") +
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
                fontSize: "16px",
                fontWeight: 400,
                formatter: (val, opts) => {
                  return Math.round(val);
                },
              },
              total: {
                show: true,
                label: "Questions",
                fontSize: "18px",
                fontWeight: 600,
                formatter: (val, opts) => {
                  const total = val.globals.series.reduce((p, c) => p + c, 0);
                  return total;
                },
              },
            },
          },
        },
      },

      responsive: [
        {
          breakpoint: 1440,
          options: {
            chart: {
              height: 450,
            },
          },
        },
        {
          breakpoint: 1366,
          options: {
            chart: {
              height: 400,
            },
          },
        },
        {
          breakpoint: 1280,
          options: {
            chart: {
              height: 350,
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    getSoldData();
    getIntervalSoldData();

    if (settings?.features?.course) {
      getCourseTrend(false);
      getCourseSubjectDistribution();
    }
    if (settings?.features?.testseries) {
      getTestseriesTrend(false);
      getTestseriesSubjectDistribution();
    }
    if (settings?.features?.assessment) {
      getAssessmentTrend(false);
      getAssessmetSubjectDistribution();
    }
    getQuestionSubjectDistribution();
  }, []);

  const getSoldData = () => {
    publisherService.getSoldData().then((data) => {
      setSold(data);
    });
  };

  const getIntervalSoldData = () => {
    publisherService.getSoldData({ interval: 15 }).then((data) => {
      setIntervalSoldData(data);
    });
  };

  const getAssessmetSubjectDistribution = () => {
    publisherService.getAssessmetSubjectDistribution().then((data: any[]) => {
      setAssessmentSubjectDistribution(data);
      const labels = data.map((d) => d.subject.name);
      setAssessmentChartOptions({
        ...assessmentChartOptions,
        series: data.map((d) => d.count),
        options: {
          ...assessmentChartOptions.options,
          labels: labels,
        },
      });
    });
  };

  const getCourseSubjectDistribution = () => {
    publisherService.getCourseSubjectDistribution().then((data: any[]) => {
      setCourseSubjectDistribution(data);
      const labels = data.map((d) => d.subject.name);
      setCourseChartOptions({
        ...courseChartOptions,
        series: data.map((d) => d.count),
        options: {
          ...courseChartOptions.options,
          labels: labels,
        },
      });
    });
  };

  const getTestseriesSubjectDistribution = () => {
    publisherService.getTestseriesSubjectDistribution().then((data: any[]) => {
      setTestseriesSubjectDistribution(data);
      const labels = data.map((d) => d.subject.name);
      setTestseriesChartOptions({
        ...testseriesChartOptions,
        series: data.map((d) => d.count),
        options: {
          ...testseriesChartOptions.options,
          labels: labels,
        },
      });
    });
  };

  const getQuestionSubjectDistribution = () => {
    publisherService.getQuestionSubjectDistribution().then((data: any[]) => {
      setQuestionSubjectDistribution(data);
      const labels = data.map((d) => d.subject.name);
      setQuestionsChartOptions({
        ...questionsChartOptions,
        series: data.map((d) => d.count),
        options: {
          ...questionsChartOptions.options,
          labels: labels,
        },
      });
    });
  };

  const getTestseriesTrend = (reload: any, dateFilter = "weekly") => {
    publisherService
      .testseriesTrend({ dateFilter: dateFilter })
      .then((data: any[]) => {
        const dates: any = {};
        const testseries: any = [];
        let day: any = [];
        data.forEach((e) => {
          day.indexOf(e._id.day + "/" + e._id.month) === -1
            ? day.push(e._id.day + "/" + e._id.month)
            : "";
          if (dates[e._id.day]) {
            dates[e._id.day].testseriess.push({
              testseries: e.testseries,
              count: e.count,
            });
            dates[e._id.day].testseriesIds.push(e.testseriesId);
          } else {
            dates[e._id.day] = {
              testseriess: [{ testseries: e.testseries, count: e.count }],
              testseriesIds: [e.testseriesId],
            };
          }
          testseries.indexOf(e.testseriesId) === -1
            ? testseries.push(e.testseriesId)
            : "";
        });

        const dS: any = {};
        const unique = _.uniqBy(data, "testseriesId");

        unique.forEach((u) => {
          for (const d in dates) {
            const uI = dates[d].testseriesIds.indexOf(u.testseriesId);
            if (!dS[u.testseriesId]) {
              dS[u.testseriesId] = {
                name: dates[d].testseriess[uI]
                  ? dates[d].testseriess[uI].testseries
                  : u.testseries,
                data: [],
              };
            }
            if (uI > -1) {
              dS[u.testseriesId].data.push(dates[d].testseriess[uI].count);
            } else {
              dS[u.testseriesId].data.push(0);
            }
          }
        });
        day = _.sortBy(day);
        const series = [];
        for (const a in dS) {
          series.push({ name: dS[a].name, data: dS[a].data });
        }
        if (reload && series.length > 0) {
          setTestseriesChartOptions({
            ...testseriesChartOptions,
            series: series,
            options: {
              ...testseriesChartOptions.options,
              xaxis: {
                ...testseriesChartOptions.options.xaxis,
                categories: day,
              },
            },
          });
        } else {
          setChartOptions({
            ...chartOptions,
            series: series,
            options: {
              ...chartOptions.options,
              xaxis: {
                ...chartOptions.options.xaxis,
                categories: day,
              },
            },
          });
        }
        setTestseriesTrend(data);
      });
  };

  const getCourseTrend = (reload: any, dateFilter = "weekly") => {
    publisherService
      .courseTrend({ dateFilter: dateFilter })
      .then((data: any[]) => {
        const dates: any = {};
        const courses: any = [];
        const day: any = [];
        data.forEach((e) => {
          day.indexOf(e._id.day + "/" + e._id.month) === -1
            ? day.push(e._id.day + "/" + e._id.month)
            : "";
          if (dates[e._id.day]) {
            dates[e._id.day].courses.push({ course: e.course, count: e.count });
            dates[e._id.day].courseIds.push(e.courseId);
          } else {
            dates[e._id.day] = {
              courses: [{ course: e.course, count: e.count }],
              courseIds: [e.courseId],
            };
          }
          courses.indexOf(e.courseId) === -1 ? courses.push(e.courseId) : "";
        });
        const unique = _.uniqBy(data, "courseId");
        const dS: any = {};
        unique.forEach((u) => {
          for (const d in dates) {
            const uI = dates[d].courseIds.indexOf(u.courseId);
            if (!dS[u.courseId]) {
              dS[u.courseId] = {
                name: dates[d].courses[uI]
                  ? dates[d].courses[uI].course
                  : u.course,
                data: [],
              };
            }
            if (uI > -1) {
              dS[u.courseId].data.push(dates[d].courses[uI].count);
            } else {
              dS[u.courseId].data.push(0);
            }
          }
        });
        // day = _.sortBy(day)

        const series = [];
        for (const a in dS) {
          series.push({ name: dS[a].name, data: dS[a].data });
        }

        if (reload && series.length) {
          setChartOptions({
            ...chartOptions,
            series: series,
            options: {
              ...chartOptions.options,
              xaxis: {
                ...chartOptions.options.xaxis,
                categories: day,
              },
            },
          });
        } else {
          setChartOptions({
            ...chartOptions,
            series: series,
            options: {
              ...chartOptions.options,
              xaxis: {
                ...chartOptions.options.xaxis,
                categories: day,
              },
            },
          });
        }
        setCourseTrend(data);
      });
  };

  const getAssessmentTrend = (reload: any, dateFilter = "weekly") => {
    publisherService
      .assessmentTrend({ dateFilter: dateFilter })
      .then((data: any[]) => {
        const dates: any = {};
        const tests: any = [];
        const day: any = [];
        data.forEach((e) => {
          day.indexOf(e._id.day + "/" + e._id.month) === -1
            ? day.push(e._id.day + "/" + e._id.month)
            : "";
          if (dates[e._id.day]) {
            dates[e._id.day].tests.push({
              test: e.practiceset,
              count: e.count,
            });
            dates[e._id.day].testIds.push(e.testId);
          } else {
            dates[e._id.day] = {
              tests: [{ test: e.practiceset, count: e.count }],
              testIds: [e.testId],
            };
          }
          tests.indexOf(e.testId) === -1 ? tests.push(e.testId) : "";
        });
        const unique = _.uniqBy(data, "testId");

        const dS: any = {};
        unique.forEach((u) => {
          for (const d in dates) {
            const uI = dates[d].testIds.indexOf(u.testId);
            if (!dS[u.testId]) {
              dS[u.testId] = {
                name: dates[d].tests[uI]
                  ? dates[d].tests[uI].test
                  : unique.practiceset,
                data: [],
              };
            }
            if (uI > -1) {
              dS[u.testId].data.push(dates[d].tests[uI].count);
            } else {
              dS[u.testId].data.push(0);
            }
          }
        });
        const series = [];
        for (const a in dS) {
          series.push({ name: dS[a].name, data: dS[a].data });
        }
        if (reload && series.length) {
          setChartOptions({
            ...chartOptions,
            series: series,
            options: {
              ...chartOptions.options,
              xaxis: {
                ...chartOptions.options.xaxis,
                categories: day,
              },
            },
          });
        } else {
          setChartOptions({
            ...chartOptions,
            series: series,
            options: {
              ...chartOptions.options,
              xaxis: {
                ...chartOptions.options.xaxis,
                categories: day,
              },
            },
          });
        }
        setAssessmentTrend(data);
      });
  };

  const changeTab = (tab: string) => {
    if (tab === "course") {
      setTab("course");
      setFilter("weekly");
      getCourseTrend(true);
    }
    if (tab === "assessment") {
      setTab("assessment");
      setFilter("weekly");
      getAssessmentTrend(true);
    }
    if (tab === "testseries") {
      setTab("testseries");
      setFilter("weekly");
      getTestseriesTrend(true);
    }
  };

  const filterData = (f?: string) => {
    if (!f) {
      f = filter;
    }
    if (tab == "course") {
      getCourseTrend(true, f);
    }
    if (tab == "assessment") {
      getAssessmentTrend(true, f);
    }
    if (tab == "testseries") {
      getTestseriesTrend(true, f);
    }
  };

  const DataAnaBox = ({ title, total, sold, intervalSold }) => (
    <div className="data_ana_box">
      <div className="overall-head">{title}</div>
      <div className="form-row my-2">
        <div className="col-6">
          <p>Total</p>
          <h1 className="big_num">{total}</h1>
        </div>
        <div className="col-6">
          <p>Sold</p>
          <div className="over3 d-flex justify-content-center">
            <h1 className="big_num over2-inactive">{sold}</h1>
            <span className="material-icons">arrow_drop_up</span>
            <small className="f-12 align-self-center">{intervalSold}</small>
          </div>
        </div>
      </div>
      <p className="bottom_info_text">*Sold in last 15 days</p>
    </div>
  );

  return (
    <main className="my-gap-common">
      <div className="container">
        <section className="admin-top-area-common">
          <div className="container">
            <h2 className="title">My Publications</h2>
            <span className="subtitle">Analysis of your publications </span>
          </div>
        </section>
        <div className="bg-white overall-main">
          <div className="row">
            {settings?.features?.course && (
              <div className="col">
                <DataAnaBox
                  title="Courses"
                  total={sold?.course?.total}
                  sold={sold?.course?.sold}
                  intervalSold={intervalSoldData?.course?.sold}
                />
              </div>
            )}
            {settings?.features?.testseries && (
              <div className="col">
                <DataAnaBox
                  title="Test Series"
                  total={sold?.testseries?.total}
                  sold={sold?.testseries?.sold}
                  intervalSold={intervalSoldData?.testseries?.sold}
                />
              </div>
            )}
            {settings?.features?.assessment && (
              <div className="col">
                <DataAnaBox
                  title="Assessments"
                  total={sold?.assessment?.total}
                  sold={sold?.assessment?.sold}
                  intervalSold={intervalSoldData?.assessment?.sold}
                />
              </div>
            )}
          </div>
          <div className="chart_boxes">
            <div className="admin-header">
              <span className="admin-head">Your Subject Distribution</span>
              <p className="admin-head2">
                To know about the kind of subjects you are covering in your
                publications
              </p>
            </div>
            <div className="chart_area_body custom-legend">
              <div className="row">
                {settings.features.course &&
                  courseSubjectDistribution.length > 0 && (
                    <div className="col-lg col-md-6 mt-md-0 mt-3">
                      <Chart
                        series={courseChartOptions.series}
                        options={courseChartOptions.options}
                        type="donut"
                        width="100%"
                        height="400"
                      />
                    </div>
                  )}
                {settings.features.course &&
                  !courseSubjectDistribution.length && (
                    <div className="col-lg col-md-6 mt-md-0 mt-3">
                      <svg
                        width="200"
                        height="200"
                        viewBox="0 0 508 378"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M507.301 332.18H0V332.434H507.301V332.18Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M456.469 348.505H422.866V348.759H456.469V348.505Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M336.056 351.265H327.24V351.519H336.056V351.265Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M421.851 339.09H402.381V339.344H421.851V339.09Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M97.0466 340.794H53.226V341.048H97.0466V340.794Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M112.509 340.794H106.087V341.048H112.509V340.794Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M228.438 345.076H133.39V345.33H228.438V345.076Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M240.461 286.929H44.5511C43.0163 286.927 41.5454 286.315 40.4611 285.229C39.3768 284.143 38.7678 282.671 38.7678 281.136V5.74264C38.7812 4.21671 39.3961 2.75767 40.4789 1.68243C41.5617 0.607197 43.0251 0.00261401 44.5511 0H240.461C241.997 0 243.471 0.610372 244.557 1.69684C245.644 2.78331 246.254 4.25688 246.254 5.79337V281.136C246.254 282.672 245.644 284.146 244.557 285.233C243.471 286.319 241.997 286.929 240.461 286.929ZM44.5511 0.202921C43.0836 0.205609 41.6771 0.790441 40.6404 1.82905C39.6037 2.86766 39.0215 4.27517 39.0215 5.74264V281.136C39.0215 282.603 39.6037 284.011 40.6404 285.05C41.6771 286.088 43.0836 286.673 44.5511 286.676H240.461C241.929 286.673 243.336 286.088 244.375 285.05C245.413 284.012 245.998 282.604 246 281.136V5.74264C245.998 4.27424 245.413 2.86675 244.375 1.82843C243.336 0.790111 241.929 0.205603 240.461 0.202921H44.5511Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M459.929 286.929H264.009C262.474 286.927 261.002 286.315 259.916 285.23C258.83 284.144 258.219 282.672 258.216 281.136V5.74264C258.232 4.21578 258.849 2.75675 259.934 1.6818C261.018 0.606842 262.482 0.0025855 264.009 0H459.929C461.453 0.00528049 462.914 0.611043 463.995 1.68599C465.075 2.76094 465.689 4.21846 465.702 5.74264V281.136C465.702 282.669 465.095 284.139 464.012 285.225C462.93 286.311 461.462 286.924 459.929 286.929ZM264.009 0.202921C262.541 0.205603 261.134 0.790111 260.095 1.82843C259.057 2.86675 258.472 4.27424 258.47 5.74264V281.136C258.472 282.604 259.057 284.012 260.095 285.05C261.134 286.088 262.541 286.673 264.009 286.676H459.929C461.397 286.673 462.805 286.088 463.843 285.05C464.882 284.012 465.466 282.604 465.469 281.136V5.74264C465.466 4.27424 464.882 2.86675 463.843 1.82843C462.805 0.790111 461.397 0.205603 459.929 0.202921H264.009Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M293.92 120.798L433.712 120.798V29.251L293.92 29.251V120.798Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M289.648 120.798L431.713 120.798V29.251L289.648 29.251V120.798Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M293.92 138.757L433.712 138.757V120.788L293.92 120.788V138.757Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M282.556 138.757L424.621 138.757V120.788L282.556 120.788V138.757Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M425.747 114.833V35.2271L295.625 35.2271V114.833L425.747 114.833Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M396.405 114.823L379.786 35.2271H353.853L370.472 114.823H396.405Z"
                          fill="white"
                        />
                        <path
                          d="M422.988 108.887C423.044 108.887 423.101 108.876 423.153 108.854C423.205 108.832 423.253 108.799 423.293 108.759C423.332 108.718 423.363 108.67 423.384 108.617C423.405 108.564 423.415 108.508 423.414 108.451V39.1129C423.414 38.9999 423.369 38.8915 423.289 38.8116C423.209 38.7317 423.101 38.6868 422.988 38.6868C422.931 38.6854 422.875 38.6955 422.823 38.7164C422.77 38.7373 422.723 38.7686 422.683 38.8085C422.643 38.8483 422.612 38.8959 422.591 38.9482C422.57 39.0005 422.56 39.0566 422.561 39.1129V108.451C422.56 108.508 422.57 108.564 422.591 108.617C422.612 108.67 422.643 108.718 422.683 108.759C422.722 108.799 422.77 108.832 422.822 108.854C422.874 108.876 422.931 108.887 422.988 108.887Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M364.902 114.823L348.282 35.2271H338.167L354.796 114.823H364.902Z"
                          fill="white"
                        />
                        <path
                          d="M296.385 114.833V35.2271H295.624V114.833H296.385Z"
                          fill="#E6E6E6"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 44.2264H428.04L428.588 37.5402H288.796L288.248 44.2264Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 55.1843H428.04L428.588 48.5082H288.796L288.248 55.1843Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 66.1419H428.04L428.588 59.4658H288.796L288.248 66.1419Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 77.1098H428.04L428.588 70.4236H288.796L288.248 77.1098Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 88.0674H428.04L428.588 81.3812H288.796L288.248 88.0674Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 99.0251H428.04L428.588 92.3389H288.796L288.248 99.0251Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M413.643 265.602H384.331V271.386H413.643V265.602Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M329.045 332.18H334.453V199.197H329.045V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 271.386H384.321V265.602H310.296V271.386Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 297.228H384.331V303.011H413.643V297.228Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 303.001H384.321V297.218H310.296V303.001Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 202.362H384.331V208.146H413.643V202.362Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 208.135H384.321V202.352H310.296V208.135Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 233.977H384.331V239.761H413.643V233.977Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 239.76H384.321V233.977H310.296V239.76Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M403.081 332.18H408.489V199.197H403.081V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M378.913 332.18H384.321V199.197H378.913V332.18Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M310.296 332.18H315.703V199.197H310.296V332.18Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M66.3348 332.18H121.712L121.712 224.744H66.3348L66.3348 332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M81.1175 332.181H66.3246V317.347H96.6206L81.1175 332.181Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M217.307 332.18H272.684V224.744H217.307V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M66.3347 327.067H230.223V224.734H66.3347V327.067Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M215.43 332.181H230.213V317.347H199.927L215.43 332.181Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M77.7996 288.482H218.748V262.873H77.7996V288.482Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M77.7996 319.559H218.748V293.95H77.7996V319.559Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M191.963 265.613H104.595C103.363 265.613 102.181 265.123 101.309 264.252C100.438 263.38 99.9483 262.198 99.9483 260.966V260.651H196.599V260.966C196.599 262.196 196.111 263.377 195.242 264.248C194.373 265.119 193.193 265.61 191.963 265.613Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M77.7996 257.394H218.748V231.786L77.7996 231.786V257.394Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M191.963 234.525H104.595C103.363 234.525 102.181 234.036 101.309 233.164C100.438 232.293 99.9483 231.111 99.9483 229.878V229.564H196.599V229.878C196.599 231.109 196.111 232.289 195.242 233.161C194.373 234.032 193.193 234.522 191.963 234.525Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M191.963 296.7H104.595C103.363 296.7 102.181 296.211 101.309 295.339C100.438 294.468 99.9483 293.286 99.9483 292.053V291.739H196.599V292.053C196.599 293.284 196.111 294.464 195.242 295.335C194.373 296.207 193.193 296.697 191.963 296.7Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M75.1516 120.798L214.943 120.798V29.251L75.1516 29.251V120.798Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M70.8903 120.798L212.955 120.798V29.251L70.8903 29.251V120.798Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M75.1516 138.757L214.943 138.757V120.788L75.1516 120.788V138.757Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M63.7778 138.757L205.842 138.757V120.788L63.7778 120.788V138.757Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M206.979 114.833V35.2271L76.8561 35.2271V114.833L206.979 114.833Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M177.637 114.823L161.017 35.2271H135.084L151.703 114.823H177.637Z"
                          fill="white"
                        />
                        <path
                          d="M204.209 108.887C204.266 108.887 204.322 108.876 204.374 108.854C204.427 108.832 204.474 108.799 204.514 108.759C204.553 108.718 204.585 108.67 204.605 108.617C204.626 108.564 204.636 108.508 204.635 108.451V39.1129C204.636 39.0566 204.626 39.0005 204.605 38.9482C204.584 38.8959 204.553 38.8483 204.513 38.8085C204.473 38.7686 204.426 38.7373 204.373 38.7164C204.321 38.6955 204.265 38.6854 204.209 38.6868C204.096 38.6868 203.987 38.7317 203.907 38.8116C203.827 38.8915 203.783 38.9999 203.783 39.1129V108.451C203.781 108.508 203.791 108.564 203.812 108.617C203.833 108.67 203.864 108.718 203.904 108.759C203.943 108.799 203.991 108.832 204.043 108.854C204.096 108.876 204.152 108.887 204.209 108.887Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M146.133 114.823L129.514 35.2271H119.398L136.017 114.823H146.133Z"
                          fill="white"
                        />
                        <path
                          d="M77.6171 114.833V35.2271H76.8561V114.833H77.6171Z"
                          fill="#E6E6E6"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 44.2264H209.262L209.809 37.5402H70.0176L69.4697 44.2264Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 48.0008H209.262L209.809 41.3146H70.0176L69.4697 48.0008Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 51.7649H209.262L209.809 45.0889H70.0176L69.4697 51.7649Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 55.5394H209.262L209.809 48.8531H70.0176L69.4697 55.5394Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 59.3034H209.262L209.809 52.6273H70.0176L69.4697 59.3034Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 63.0777H209.262L209.809 56.3915H70.0176L69.4697 63.0777Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M97.4221 221.457H102.252V167.592H97.4221V221.457Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M98.0308 221.427H99.4005V167.561H98.0308V221.427Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M99.9687 221.427H100.506V167.561H99.9687V221.427Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M117.724 224.745H81.9697C81.9697 223.55 82.4443 222.404 83.2891 221.559C84.1339 220.714 85.2798 220.24 86.4745 220.24H113.209C114.404 220.24 115.55 220.714 116.395 221.559C117.239 222.404 117.714 223.55 117.714 224.745H117.724Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M91.1517 201.033C91.5196 201.031 91.8716 200.883 92.1317 200.623C92.3918 200.363 92.5391 200.011 92.5417 199.643V164.366C92.5417 163.997 92.3953 163.643 92.1346 163.383C91.8739 163.122 91.5204 162.976 91.1517 162.976C90.9683 162.974 90.7865 163.009 90.6167 163.078C90.4469 163.148 90.2924 163.25 90.1623 163.379C90.0321 163.508 89.9288 163.662 89.8584 163.831C89.7879 164.001 89.7516 164.182 89.7516 164.366V199.684C89.7647 200.046 89.918 200.39 90.1792 200.641C90.4404 200.893 90.789 201.034 91.1517 201.033Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M78.1953 180.396H121.468L116.486 150.161H83.177L78.1953 180.396Z"
                          fill="#E0E0E0"
                        />
                        <path
                          d="M253.65 378C362.297 378 450.372 372.858 450.372 366.515C450.372 360.172 362.297 355.03 253.65 355.03C145.004 355.03 56.9293 360.172 56.9293 366.515C56.9293 372.858 145.004 378 253.65 378Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M105.639 149.511L104.627 149.584L105.975 168.295L106.987 168.222L105.639 149.511Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M107.674 177.882L106.662 177.955L107.17 184.998L108.182 184.925L107.674 177.882Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M342.641 263.959H125.354C122.935 263.915 120.618 262.978 118.85 261.327C117.081 259.677 115.986 257.43 115.776 255.02L105.103 106.756C105.003 105.613 105.145 104.461 105.517 103.376C105.89 102.29 106.486 101.295 107.267 100.454C108.048 99.6128 108.997 98.9446 110.051 98.4923C111.106 98.04 112.244 97.8137 113.392 97.8279H330.679C333.096 97.8711 335.412 98.8071 337.18 100.456C338.948 102.104 340.044 104.348 340.257 106.756L350.93 255.02C351.03 256.164 350.888 257.316 350.516 258.402C350.143 259.488 349.547 260.484 348.766 261.326C347.985 262.168 347.037 262.837 345.982 263.29C344.927 263.744 343.789 263.972 342.641 263.959Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.5"
                          d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                          fill="white"
                        />
                        <path
                          d="M331.835 102.292H114.548H113.818C108.268 102.749 109.404 111.2 115.005 111.2H332.657C338.268 111.2 338.187 102.749 332.566 102.292H331.835Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M120.21 106.756C120.231 107.018 120.198 107.281 120.111 107.529C120.024 107.776 119.887 108.003 119.707 108.194C119.527 108.386 119.309 108.537 119.068 108.639C118.826 108.741 118.565 108.791 118.303 108.786C117.751 108.778 117.222 108.566 116.818 108.191C116.413 107.817 116.161 107.306 116.111 106.756C116.09 106.496 116.123 106.233 116.209 105.986C116.296 105.739 116.432 105.513 116.611 105.322C116.79 105.131 117.006 104.979 117.247 104.877C117.488 104.774 117.747 104.723 118.008 104.727C118.562 104.732 119.093 104.943 119.5 105.318C119.907 105.693 120.16 106.205 120.21 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M127.18 106.756C127.202 107.018 127.168 107.281 127.081 107.529C126.995 107.776 126.857 108.003 126.677 108.194C126.497 108.386 126.28 108.537 126.038 108.639C125.796 108.741 125.535 108.791 125.273 108.786C124.721 108.778 124.192 108.566 123.788 108.191C123.383 107.817 123.131 107.306 123.081 106.756C123.06 106.496 123.094 106.233 123.18 105.986C123.266 105.739 123.403 105.513 123.581 105.322C123.76 105.131 123.976 104.979 124.217 104.877C124.458 104.774 124.717 104.723 124.979 104.727C125.532 104.732 126.063 104.943 126.47 105.318C126.877 105.693 127.13 106.205 127.18 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M134.141 106.756C134.162 107.017 134.128 107.279 134.042 107.526C133.956 107.773 133.819 108 133.641 108.191C133.462 108.382 133.246 108.533 133.005 108.636C132.764 108.738 132.505 108.789 132.243 108.786C131.691 108.78 131.161 108.569 130.756 108.194C130.351 107.819 130.1 107.306 130.052 106.756C130.029 106.495 130.061 106.232 130.147 105.985C130.232 105.737 130.369 105.51 130.548 105.319C130.727 105.127 130.944 104.976 131.185 104.874C131.427 104.772 131.687 104.722 131.949 104.727C132.5 104.735 133.029 104.947 133.434 105.321C133.839 105.696 134.09 106.207 134.141 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M337.71 249.166H129.869C128.991 249.151 128.15 248.811 127.509 248.211C126.867 247.611 126.472 246.794 126.399 245.919L117.623 123.994C117.584 123.576 117.634 123.154 117.771 122.757C117.907 122.359 118.127 121.995 118.414 121.689C118.702 121.383 119.052 121.142 119.44 120.981C119.829 120.821 120.247 120.745 120.667 120.758H328.558C329.436 120.77 330.277 121.108 330.918 121.706C331.56 122.305 331.955 123.12 332.028 123.994L340.815 245.919C340.853 246.343 340.8 246.77 340.659 247.171C340.519 247.573 340.294 247.94 340 248.247C339.706 248.555 339.349 248.796 338.954 248.954C338.559 249.113 338.135 249.185 337.71 249.166Z"
                          fill="white"
                        />
                        <path
                          d="M250.13 202.718L246.741 155.721L236.493 149.552H208.277L212.113 202.718H250.13Z"
                          fill="white"
                        />
                        <path
                          d="M250.13 203.204H212.113C211.987 203.207 211.865 203.161 211.772 203.076C211.679 202.991 211.623 202.873 211.615 202.748L207.79 149.583C207.785 149.516 207.795 149.449 207.817 149.386C207.84 149.323 207.876 149.266 207.922 149.218C207.967 149.167 208.022 149.127 208.083 149.099C208.144 149.071 208.21 149.056 208.277 149.055H236.493C236.582 149.058 236.669 149.083 236.747 149.126L246.995 155.295C247.064 155.334 247.122 155.39 247.164 155.457C247.207 155.525 247.232 155.601 247.238 155.681L250.607 202.677C250.614 202.745 250.605 202.814 250.583 202.879C250.56 202.944 250.523 203.003 250.475 203.052C250.43 203.1 250.377 203.138 250.318 203.164C250.259 203.19 250.194 203.204 250.13 203.204ZM212.589 202.19H249.592L246.264 155.975L236.402 150.039H208.805L212.589 202.19Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M246.741 155.721L236.493 149.552L240.258 157.73L246.741 155.721Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M240.258 158.217C240.164 158.216 240.073 158.19 239.994 158.139C239.915 158.089 239.851 158.017 239.811 157.933L236.047 149.755C236.003 149.659 235.99 149.552 236.01 149.448C236.03 149.345 236.082 149.25 236.159 149.177C236.239 149.108 236.339 149.066 236.445 149.057C236.55 149.048 236.656 149.072 236.747 149.126L246.995 155.295C247.077 155.345 247.144 155.417 247.187 155.503C247.23 155.589 247.248 155.686 247.238 155.782C247.225 155.875 247.186 155.963 247.125 156.035C247.064 156.107 246.983 156.16 246.893 156.188L240.4 158.217H240.258ZM237.61 150.79L240.522 157.131L245.595 155.579L237.61 150.79Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M224.227 173.497C224.242 173.773 224.201 174.049 224.106 174.308C224.011 174.567 223.863 174.804 223.674 175.004C223.484 175.205 223.255 175.364 223.001 175.473C222.747 175.582 222.474 175.638 222.198 175.638C221.619 175.627 221.064 175.403 220.64 175.008C220.217 174.612 219.955 174.074 219.905 173.497C219.879 173.218 219.912 172.937 220.003 172.673C220.094 172.408 220.241 172.166 220.433 171.962C220.625 171.759 220.858 171.599 221.117 171.492C221.376 171.386 221.654 171.336 221.934 171.346C222.514 171.359 223.069 171.585 223.492 171.982C223.915 172.379 224.177 172.919 224.227 173.497Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M238.127 173.497C238.152 173.775 238.117 174.054 238.025 174.318C237.933 174.581 237.787 174.822 237.595 175.025C237.403 175.227 237.17 175.386 236.912 175.492C236.654 175.598 236.377 175.647 236.098 175.638C235.518 175.627 234.961 175.403 234.536 175.008C234.111 174.613 233.847 174.075 233.795 173.497C233.778 173.22 233.818 172.943 233.913 172.683C234.007 172.422 234.154 172.184 234.344 171.983C234.534 171.781 234.764 171.621 235.018 171.511C235.273 171.402 235.547 171.345 235.824 171.346C236.406 171.354 236.965 171.579 237.391 171.976C237.817 172.374 238.079 172.916 238.127 173.497Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M242.064 187.437C241.94 187.435 241.822 187.387 241.732 187.303C241.642 187.219 241.587 187.104 241.577 186.981C241.323 183.521 235.905 180.711 229.503 180.711C225.252 180.711 221.437 181.979 219.55 184.008C219.162 184.382 218.858 184.834 218.659 185.334C218.459 185.835 218.369 186.372 218.393 186.91C218.398 186.976 218.389 187.043 218.368 187.107C218.347 187.17 218.313 187.229 218.27 187.279C218.181 187.381 218.056 187.443 217.921 187.453C217.787 187.462 217.654 187.418 217.552 187.329C217.45 187.241 217.388 187.115 217.378 186.981C217.348 186.308 217.459 185.637 217.704 185.009C217.948 184.382 218.321 183.813 218.799 183.338C220.828 181.116 224.957 179.726 229.472 179.726C236.504 179.726 242.236 182.882 242.52 186.91C242.524 186.974 242.516 187.038 242.495 187.099C242.474 187.159 242.442 187.215 242.399 187.263C242.357 187.311 242.305 187.351 242.248 187.379C242.19 187.407 242.128 187.423 242.064 187.427V187.437Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M216.283 169.154C216.159 169.152 216.04 169.105 215.948 169.023C215.856 168.929 215.804 168.804 215.804 168.672C215.804 168.541 215.856 168.416 215.948 168.322L218.109 165.999C218.202 165.91 218.325 165.86 218.454 165.86C218.583 165.86 218.706 165.91 218.799 165.999C218.844 166.044 218.88 166.098 218.905 166.157C218.929 166.216 218.942 166.28 218.942 166.344C218.942 166.408 218.929 166.472 218.905 166.531C218.88 166.59 218.844 166.644 218.799 166.689L216.638 169.012C216.591 169.059 216.536 169.095 216.475 169.12C216.414 169.144 216.348 169.156 216.283 169.154Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M241.049 169.154C240.926 169.149 240.808 169.102 240.714 169.023L238.228 166.699C238.181 166.654 238.144 166.599 238.119 166.539C238.093 166.479 238.08 166.414 238.08 166.349C238.08 166.284 238.093 166.219 238.119 166.159C238.144 166.099 238.181 166.044 238.228 165.999C238.321 165.91 238.445 165.86 238.573 165.86C238.702 165.86 238.826 165.91 238.918 165.999L241.404 168.322C241.449 168.368 241.485 168.421 241.51 168.481C241.535 168.54 241.547 168.603 241.547 168.667C241.547 168.732 241.535 168.795 241.51 168.854C241.485 168.913 241.449 168.967 241.404 169.012C241.308 169.102 241.181 169.153 241.049 169.154Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M205.213 213.219H207.506L210.814 217.622L210.499 213.219H212.813L213.381 221.173H211.037L207.75 216.8L208.064 221.173H205.751L205.213 213.219Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M214.416 217.196C214.338 216.655 214.375 216.105 214.525 215.58C214.676 215.055 214.936 214.569 215.288 214.152C215.674 213.773 216.136 213.48 216.643 213.293C217.15 213.106 217.691 213.028 218.231 213.066C219.374 213.004 220.497 213.386 221.366 214.132C222.162 214.924 222.623 215.992 222.654 217.115C222.738 217.889 222.634 218.672 222.35 219.397C222.087 219.982 221.647 220.468 221.092 220.787C220.426 221.145 219.676 221.316 218.921 221.285C218.144 221.309 217.372 221.164 216.658 220.858C216.033 220.558 215.505 220.087 215.136 219.499C214.701 218.806 214.453 218.013 214.416 217.196ZM216.881 217.196C216.872 217.818 217.072 218.426 217.45 218.921C217.608 219.095 217.803 219.233 218.02 219.324C218.237 219.415 218.472 219.457 218.708 219.448C218.933 219.464 219.158 219.425 219.365 219.335C219.571 219.245 219.753 219.106 219.895 218.931C220.186 218.376 220.283 217.74 220.169 217.125C220.173 216.528 219.972 215.948 219.6 215.481C219.438 215.31 219.241 215.175 219.022 215.086C218.803 214.997 218.568 214.955 218.332 214.964C218.111 214.954 217.892 214.997 217.691 215.089C217.49 215.18 217.313 215.318 217.176 215.491C216.879 216.014 216.774 216.624 216.881 217.216V217.196Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M227.423 213.219H231.076C231.678 213.2 232.278 213.3 232.841 213.513C233.287 213.7 233.683 213.988 233.998 214.355C234.317 214.727 234.562 215.158 234.718 215.623C234.882 216.123 234.985 216.641 235.022 217.165C235.1 217.829 235.049 218.5 234.87 219.144C234.73 219.589 234.483 219.994 234.15 220.321C233.872 220.615 233.522 220.832 233.135 220.95C232.663 221.087 232.176 221.162 231.684 221.173H228.042L227.423 213.219ZM230.01 215.025L230.325 219.367H230.923C231.294 219.391 231.665 219.332 232.009 219.195C232.236 219.063 232.403 218.848 232.476 218.596C232.592 218.146 232.619 217.677 232.557 217.216C232.576 216.597 232.387 215.99 232.019 215.491C231.831 215.321 231.609 215.191 231.368 215.111C231.127 215.031 230.872 215.001 230.619 215.025H230.01Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M240.917 219.854H238.127L237.833 221.173H235.327L237.741 213.219H240.461L244.022 221.173H241.445L240.917 219.854ZM240.278 218.139L239.202 215.278L238.533 218.139H240.278Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M242.865 213.219H250.333L250.475 215.187H247.969L248.395 221.173H245.939L245.513 215.187H243.007L242.865 213.219Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M256.055 219.854H253.265L252.971 221.173H250.464L252.879 213.219H255.558L259.109 221.173H256.542L256.055 219.854ZM255.416 218.139L254.33 215.278L253.65 218.139H255.416Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M358.855 119.804C359.758 119.348 360.884 118.79 361.838 118.211C362.791 117.633 363.867 117.075 364.881 116.466C366.86 115.239 368.869 114.031 370.766 112.692C374.577 110.085 378.149 107.144 381.44 103.905C381.856 103.52 382.221 103.094 382.617 102.678L383.195 102.059L383.479 101.754L383.621 101.592C383.479 101.866 383.621 101.785 383.621 101.521C383.71 101.159 383.761 100.788 383.773 100.415C383.75 98.2579 383.502 96.1088 383.033 94.0029C382.13 89.4575 380.76 84.77 379.411 80.184L383.347 78.4592C385.832 82.8592 387.907 87.4781 389.546 92.2578C390.467 94.8408 391.054 97.5311 391.292 100.263C391.354 101.112 391.326 101.966 391.21 102.81C391.06 104.003 390.636 105.145 389.973 106.148L389.8 106.381L389.668 106.543L389.516 106.736L389.201 107.122L388.572 107.883C388.156 108.38 387.751 108.897 387.304 109.374C383.834 113.224 379.964 116.694 375.758 119.723C373.729 121.225 371.578 122.665 369.376 123.974C368.291 124.634 367.185 125.263 366.058 125.882C364.932 126.501 363.836 127.069 362.538 127.678L358.855 119.804Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M349.825 358.337C350.584 358.318 351.34 358.216 352.077 358.033C352.115 358.021 352.148 358 352.175 357.972C352.202 357.943 352.22 357.908 352.229 357.87C352.234 357.831 352.228 357.792 352.212 357.756C352.196 357.72 352.17 357.69 352.138 357.667C351.844 357.475 349.267 355.811 348.272 356.257C348.162 356.309 348.068 356.388 347.998 356.488C347.929 356.588 347.887 356.704 347.877 356.825C347.837 357.017 347.847 357.215 347.906 357.402C347.964 357.588 348.07 357.756 348.212 357.891C348.678 358.23 349.251 358.388 349.825 358.337ZM351.499 357.749C350.028 358.043 348.912 357.992 348.455 357.596C348.364 357.503 348.297 357.388 348.262 357.262C348.226 357.136 348.223 357.004 348.252 356.876C348.256 356.822 348.274 356.77 348.304 356.726C348.334 356.681 348.376 356.646 348.425 356.622C348.962 356.389 350.454 357.14 351.499 357.749Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M352.067 358.033H352.168C352.198 358.014 352.223 357.989 352.241 357.959C352.258 357.929 352.268 357.895 352.27 357.86C352.27 357.748 352.27 355.303 351.336 354.492C351.225 354.384 351.09 354.303 350.942 354.256C350.794 354.208 350.638 354.195 350.484 354.218C350.324 354.219 350.169 354.275 350.046 354.377C349.922 354.478 349.837 354.619 349.804 354.776C349.612 355.79 351.154 357.566 351.965 358.033C351.999 358.042 352.034 358.042 352.067 358.033ZM350.616 354.593C350.781 354.594 350.94 354.655 351.062 354.766C351.598 355.555 351.874 356.491 351.854 357.444C351.042 356.795 350.078 355.415 350.2 354.837C350.2 354.745 350.271 354.624 350.525 354.593H350.616Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M351.275 94.429C350.261 99.502 348.232 109.648 351.732 113.047C351.732 113.047 350.352 118.12 340.987 118.12C330.679 118.12 336.067 113.047 336.067 113.047C341.688 111.708 341.535 107.538 340.561 103.611L351.275 94.429Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M334.088 115.076C332.475 115.299 333.855 111.109 334.504 110.673C336.026 109.658 355.669 108.248 355.537 110.673C355.456 111.687 354.969 113.716 354.117 114.386C353.264 115.056 348.212 112.966 334.088 115.076Z"
                          fill="#263238"
                        />
                        <path
                          d="M337.294 113.635C336.006 114.072 336.128 109.851 336.564 109.344C337.579 108.167 353.477 104.088 353.944 106.391C354.127 107.406 354.218 109.435 353.67 110.155C353.122 110.876 348.455 109.689 337.294 113.635Z"
                          fill="#263238"
                        />
                        <path
                          d="M331.379 85.3382C331.315 85.341 331.252 85.3286 331.194 85.3022C331.135 85.2757 331.084 85.2359 331.044 85.186C330.735 84.7867 330.336 84.4658 329.879 84.249C329.423 84.0323 328.922 83.9257 328.417 83.938C328.364 83.9451 328.31 83.9414 328.259 83.9272C328.207 83.9131 328.159 83.8887 328.118 83.8555C328.076 83.8223 328.042 83.7811 328.016 83.7343C327.991 83.6874 327.975 83.636 327.97 83.5829C327.961 83.4784 327.994 83.3746 328.06 83.2933C328.126 83.2119 328.221 83.1594 328.325 83.1466C328.964 83.114 329.601 83.2363 330.182 83.5031C330.763 83.7699 331.272 84.1732 331.663 84.6787C331.731 84.761 331.764 84.8668 331.755 84.9732C331.745 85.0795 331.694 85.1779 331.613 85.2469C331.544 85.2963 331.463 85.3277 331.379 85.3382Z"
                          fill="#263238"
                        />
                        <path
                          d="M329.411 90.2994C328.95 91.9181 328.268 93.4649 327.382 94.8956C327.754 95.1095 328.168 95.2395 328.596 95.2763C329.023 95.3131 329.454 95.2559 329.857 95.1087L329.411 90.2994Z"
                          fill="#FF5652"
                        />
                        <path
                          d="M329.908 89.0719C329.979 89.7517 329.665 90.3401 329.218 90.3807C328.772 90.4213 328.356 89.914 328.295 89.2241C328.234 88.5342 328.538 87.9558 328.975 87.9152C329.411 87.8747 329.837 88.382 329.908 89.0719Z"
                          fill="#263238"
                        />
                        <path
                          d="M329.178 87.9355L327.493 87.621C327.493 87.621 328.457 88.8182 329.178 87.9355Z"
                          fill="#263238"
                        />
                        <path
                          d="M361.909 357.84H353.406L354.076 338.157H362.578L361.909 357.84Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M352.737 356.856H362.284C362.449 356.852 362.609 356.908 362.734 357.015C362.86 357.122 362.941 357.271 362.964 357.434L364.049 364.983C364.071 365.174 364.052 365.367 363.993 365.55C363.934 365.733 363.838 365.901 363.709 366.044C363.581 366.187 363.424 366.301 363.248 366.378C363.072 366.456 362.882 366.496 362.69 366.494C359.362 366.444 357.759 366.241 353.558 366.241C350.971 366.241 347.197 366.515 343.636 366.515C340.074 366.515 339.871 362.984 341.363 362.669C348.019 361.229 349.074 359.26 351.316 357.373C351.715 357.041 352.217 356.859 352.737 356.856Z"
                          fill="#263238"
                        />
                        <g opacity="0.2">
                          <path
                            opacity="0.2"
                            d="M362.578 338.157H354.076L353.731 348.303H362.233L362.578 338.157Z"
                            fill="black"
                          />
                        </g>
                        <path
                          d="M328.092 124.796C322.889 122.773 317.793 120.487 312.822 117.947C307.688 115.439 302.797 112.46 298.212 109.049C296.987 108.09 295.828 107.049 294.742 105.935C294.458 105.63 294.174 105.346 293.9 104.991C293.578 104.628 293.28 104.245 293.007 103.844C292.259 102.754 291.792 101.496 291.648 100.182C291.536 98.9357 291.706 97.6804 292.145 96.5089C292.496 95.5673 292.978 94.6794 293.575 93.871C294.555 92.5307 295.712 91.3293 297.015 90.2996C299.314 88.469 301.796 86.8812 304.421 85.5614C305.679 84.8917 306.958 84.2931 308.257 83.7351C309.555 83.1771 310.834 82.6495 312.224 82.1726L314.019 86.0788C309.596 88.869 305.01 91.9432 301.641 95.3726C300.888 96.1364 300.224 96.9841 299.663 97.8989C299.176 98.7005 299.186 99.2991 299.267 99.2484C299.348 99.1976 299.267 99.2483 299.409 99.3498L299.815 99.7861C299.967 99.9687 300.18 100.151 300.373 100.344C301.233 101.135 302.144 101.867 303.102 102.536C305.197 104.019 307.379 105.374 309.636 106.594C311.919 107.872 314.273 109.08 316.668 110.236C321.457 112.529 326.408 114.731 331.268 116.74L328.092 124.796Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M316.556 83.3495L317.956 80.3057L311.544 78.1243C311.544 78.1243 309.515 84.1206 311.919 86.8803C312.924 86.7221 313.874 86.3166 314.683 85.7002C315.493 85.0839 316.136 84.2761 316.556 83.3495Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M317.926 73.7209L312.822 72.2396L311.544 78.0837L317.926 80.3057V73.7209Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M383.875 80.5999L384.615 73.4977L378.041 75.0805C378.041 75.0805 377.939 81.7565 381.419 82.8117L383.875 80.5999Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M381.45 68.4956L377.158 70.4944L378.041 75.0296L384.615 73.4773L381.45 68.4956Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M352.615 84.4656C352.93 92.897 353.234 96.4582 349.429 101.176C343.697 108.278 333.277 106.807 330.456 98.6396C327.92 91.2939 327.838 78.7433 335.712 74.6037C337.443 73.6833 339.38 73.2205 341.34 73.2592C343.3 73.2979 345.218 73.8368 346.911 74.8247C348.605 75.8126 350.017 77.2169 351.016 78.9042C352.014 80.5914 352.564 82.5058 352.615 84.4656Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M348.942 101.166C357.221 97.5844 362.659 90.0054 360.366 78.2563C358.165 66.984 350.555 65.868 347.41 68.2016C344.265 70.5351 336.422 67.0551 331.714 71.012C323.597 77.8809 331.268 85.2164 335.285 89.6502C337.68 94.5812 340.825 104.666 348.942 101.166Z"
                          fill="#263238"
                        />
                        <path
                          d="M345.503 76.2372C346.513 77.5328 347.88 78.5043 349.436 79.0317C350.991 79.5592 352.667 79.6196 354.257 79.2054C355.847 78.7911 357.28 77.9205 358.381 76.7009C359.481 75.4813 360.201 73.9661 360.45 72.3424C360.699 70.7187 360.468 69.0576 359.784 67.564C359.1 66.0704 357.993 64.8098 356.601 63.9379C355.209 63.0659 353.592 62.6206 351.949 62.6571C350.307 62.6936 348.711 63.2102 347.359 64.1432C345.51 65.5011 344.275 67.5379 343.927 69.8058C343.579 72.0737 344.146 74.387 345.503 76.2372Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M347.654 68.9929C346.466 62.195 352.889 56.9597 361.493 59.4861C370.097 62.0124 365.551 69.6321 363.776 75.7197C362 81.8073 366.647 87.6108 368.575 82.9741C370.502 78.3374 367.256 76.8865 367.256 76.8865C367.256 76.8865 376.387 79.2505 367.905 89.5487C359.423 99.8469 351.742 88.4732 353.822 81.7667C355.507 76.3792 348.78 75.4153 347.654 68.9929Z"
                          fill="#263238"
                        />
                        <path
                          d="M339.06 71.5599C335.133 69.5307 328.488 67.8566 324.703 74.2283C322.917 77.2721 323.607 81.3305 323.607 81.3305L335.164 82.0915L339.06 71.5599Z"
                          fill="#263238"
                        />
                        <path
                          d="M322.248 79.3215C322.18 79.3163 322.116 79.2849 322.071 79.2338C322.025 79.1827 322.001 79.1159 322.004 79.0476C322.004 78.8751 322.299 74.7964 324.764 72.2396C330.72 66.0506 337.7 71.225 339.689 72.8991C339.732 72.9444 339.756 73.0038 339.758 73.0661C339.76 73.1284 339.739 73.1891 339.699 73.2368C339.658 73.2845 339.602 73.3157 339.541 73.3245C339.479 73.3333 339.416 73.3192 339.364 73.2847C337.447 71.641 330.77 66.7202 325.16 72.5846C322.826 75.0095 322.542 79.0375 322.542 79.078C322.541 79.1142 322.532 79.1497 322.517 79.1823C322.501 79.2148 322.478 79.2435 322.45 79.2666C322.422 79.2897 322.39 79.3065 322.355 79.316C322.32 79.3254 322.284 79.3273 322.248 79.3215Z"
                          fill="#263238"
                        />
                        <path
                          d="M336.696 89.2849C336.65 90.8812 336.059 92.4136 335.022 93.6274C333.621 95.2711 331.978 94.4594 331.643 92.6128C331.308 90.9793 331.643 88.1486 333.408 87.1644C335.174 86.1803 336.716 87.4384 336.696 89.2849Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                          fill="#263238"
                        />
                        <path
                          opacity="0.1"
                          d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                          fill="white"
                        />
                        <path
                          opacity="0.3"
                          d="M340.967 193.282C345.026 211.088 341.789 239.132 339.567 251.479C337.213 232.729 336.026 208.43 335.438 190.603C337.538 187.214 339.526 186.991 340.967 193.282Z"
                          fill="black"
                        />
                        <path
                          d="M350.728 346.568H365.49L366.261 341.393L350.646 340.865L350.728 346.568Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                          fill="black"
                        />
                        <path
                          d="M346.334 343.25C346.351 343.221 346.36 343.187 346.36 343.153C346.36 343.12 346.351 343.086 346.334 343.057C346.315 343.018 346.284 342.986 346.246 342.966C346.208 342.946 346.164 342.939 346.121 342.945C345.695 343.016 341.941 343.605 341.434 344.68C341.38 344.778 341.351 344.888 341.351 345C341.351 345.112 341.38 345.222 341.434 345.32C341.521 345.48 341.646 345.617 341.798 345.717C341.95 345.818 342.125 345.88 342.306 345.898C343.534 346.02 345.35 344.315 346.263 343.28L346.334 343.25ZM341.83 344.812C342.174 344.244 344.123 343.717 345.604 343.443C344.265 344.802 343.088 345.563 342.398 345.472C342.278 345.46 342.164 345.418 342.065 345.351C341.965 345.284 341.885 345.193 341.83 345.086C341.807 345.048 341.796 345.004 341.796 344.959C341.796 344.915 341.807 344.871 341.83 344.833C341.83 344.833 341.819 344.822 341.83 344.812Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M355.192 339.648L347.42 343.108L343.96 335.894L339.435 326.458L338.898 325.362L346.669 321.903L347.268 323.14L351.651 332.282L355.192 339.648Z"
                          fill="#FFB573"
                        />
                        <path
                          opacity="0.2"
                          d="M351.651 332.282L343.96 335.894L339.435 326.458L347.268 323.141L351.651 332.282Z"
                          fill="black"
                        />
                        <path
                          d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                          fill="#263238"
                        />
                        <path
                          opacity="0.1"
                          d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                          fill="white"
                        />
                        <path
                          d="M346.04 342.022L353.751 336.411C353.881 336.31 354.044 336.26 354.209 336.271C354.374 336.282 354.529 336.354 354.644 336.472L359.971 341.941C360.1 342.084 360.198 342.252 360.257 342.435C360.317 342.618 360.338 342.812 360.317 343.003C360.297 343.195 360.237 343.38 360.141 343.546C360.044 343.713 359.914 343.857 359.758 343.97C357.028 345.878 355.618 346.669 352.229 349.135C350.139 350.656 345.979 354.015 343.098 356.115C340.216 358.215 338.025 355.476 339.039 354.35C343.585 349.277 344.539 346.131 345.249 343.28C345.359 342.782 345.639 342.337 346.04 342.022Z"
                          fill="#263238"
                        />
                        <path
                          d="M339.963 335.519L353.386 329.38L351.671 323.912L337.294 330.466L339.963 335.519Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                          fill="black"
                        />
                        <path
                          d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                          fill="black"
                        />
                        <path
                          d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.3"
                          d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                          fill="white"
                        />
                        <path
                          d="M356.125 168.424H357.059C357.252 168.424 357.394 168.323 357.373 168.211L356.937 164.153C356.937 164.031 356.765 163.939 356.582 163.939H355.638C355.456 163.939 355.314 164.031 355.324 164.153L355.76 168.211C355.75 168.302 355.912 168.424 356.125 168.424Z"
                          fill="#263238"
                        />
                        <path
                          d="M333.408 168.424H334.342C334.524 168.424 334.667 168.323 334.656 168.211L334.22 164.153C334.22 164.031 334.048 163.939 333.855 163.939H332.921C332.729 163.939 332.597 164.031 332.607 164.153L333.043 168.211C333.053 168.302 333.216 168.424 333.408 168.424Z"
                          fill="#263238"
                        />
                      </svg>
                      <p className="text-center">No Data Available</p>
                    </div>
                  )}
                {settings.features.testseries &&
                  testseriesSubjectDistribution.length > 0 && (
                    <div className="col-lg col-md-6 mt-md-0 mt-3">
                      <Chart
                        series={testseriesChartOptions.series}
                        options={testseriesChartOptions.options}
                        type="donut"
                        width="100%"
                        height="400"
                      />
                    </div>
                  )}
                {settings.features.testseries &&
                  !testseriesSubjectDistribution.length && (
                    <div className="col-lg col-md-6 mt-md-0 mt-3">
                      <svg
                        width="200"
                        height="200"
                        viewBox="0 0 508 378"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M507.301 332.18H0V332.434H507.301V332.18Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M456.469 348.505H422.866V348.759H456.469V348.505Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M336.056 351.265H327.24V351.519H336.056V351.265Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M421.851 339.09H402.381V339.344H421.851V339.09Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M97.0466 340.794H53.226V341.048H97.0466V340.794Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M112.509 340.794H106.087V341.048H112.509V340.794Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M228.438 345.076H133.39V345.33H228.438V345.076Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M240.461 286.929H44.5511C43.0163 286.927 41.5454 286.315 40.4611 285.229C39.3768 284.143 38.7678 282.671 38.7678 281.136V5.74264C38.7812 4.21671 39.3961 2.75767 40.4789 1.68243C41.5617 0.607197 43.0251 0.00261401 44.5511 0H240.461C241.997 0 243.471 0.610372 244.557 1.69684C245.644 2.78331 246.254 4.25688 246.254 5.79337V281.136C246.254 282.672 245.644 284.146 244.557 285.233C243.471 286.319 241.997 286.929 240.461 286.929ZM44.5511 0.202921C43.0836 0.205609 41.6771 0.790441 40.6404 1.82905C39.6037 2.86766 39.0215 4.27517 39.0215 5.74264V281.136C39.0215 282.603 39.6037 284.011 40.6404 285.05C41.6771 286.088 43.0836 286.673 44.5511 286.676H240.461C241.929 286.673 243.336 286.088 244.375 285.05C245.413 284.012 245.998 282.604 246 281.136V5.74264C245.998 4.27424 245.413 2.86675 244.375 1.82843C243.336 0.790111 241.929 0.205603 240.461 0.202921H44.5511Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M459.929 286.929H264.009C262.474 286.927 261.002 286.315 259.916 285.23C258.83 284.144 258.219 282.672 258.216 281.136V5.74264C258.232 4.21578 258.849 2.75675 259.934 1.6818C261.018 0.606842 262.482 0.0025855 264.009 0H459.929C461.453 0.00528049 462.914 0.611043 463.995 1.68599C465.075 2.76094 465.689 4.21846 465.702 5.74264V281.136C465.702 282.669 465.095 284.139 464.012 285.225C462.93 286.311 461.462 286.924 459.929 286.929ZM264.009 0.202921C262.541 0.205603 261.134 0.790111 260.095 1.82843C259.057 2.86675 258.472 4.27424 258.47 5.74264V281.136C258.472 282.604 259.057 284.012 260.095 285.05C261.134 286.088 262.541 286.673 264.009 286.676H459.929C461.397 286.673 462.805 286.088 463.843 285.05C464.882 284.012 465.466 282.604 465.469 281.136V5.74264C465.466 4.27424 464.882 2.86675 463.843 1.82843C462.805 0.790111 461.397 0.205603 459.929 0.202921H264.009Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M293.92 120.798L433.712 120.798V29.251L293.92 29.251V120.798Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M289.648 120.798L431.713 120.798V29.251L289.648 29.251V120.798Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M293.92 138.757L433.712 138.757V120.788L293.92 120.788V138.757Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M282.556 138.757L424.621 138.757V120.788L282.556 120.788V138.757Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M425.747 114.833V35.2271L295.625 35.2271V114.833L425.747 114.833Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M396.405 114.823L379.786 35.2271H353.853L370.472 114.823H396.405Z"
                          fill="white"
                        />
                        <path
                          d="M422.988 108.887C423.044 108.887 423.101 108.876 423.153 108.854C423.205 108.832 423.253 108.799 423.293 108.759C423.332 108.718 423.363 108.67 423.384 108.617C423.405 108.564 423.415 108.508 423.414 108.451V39.1129C423.414 38.9999 423.369 38.8915 423.289 38.8116C423.209 38.7317 423.101 38.6868 422.988 38.6868C422.931 38.6854 422.875 38.6955 422.823 38.7164C422.77 38.7373 422.723 38.7686 422.683 38.8085C422.643 38.8483 422.612 38.8959 422.591 38.9482C422.57 39.0005 422.56 39.0566 422.561 39.1129V108.451C422.56 108.508 422.57 108.564 422.591 108.617C422.612 108.67 422.643 108.718 422.683 108.759C422.722 108.799 422.77 108.832 422.822 108.854C422.874 108.876 422.931 108.887 422.988 108.887Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M364.902 114.823L348.282 35.2271H338.167L354.796 114.823H364.902Z"
                          fill="white"
                        />
                        <path
                          d="M296.385 114.833V35.2271H295.624V114.833H296.385Z"
                          fill="#E6E6E6"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 44.2264H428.04L428.588 37.5402H288.796L288.248 44.2264Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 55.1843H428.04L428.588 48.5082H288.796L288.248 55.1843Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 66.1419H428.04L428.588 59.4658H288.796L288.248 66.1419Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 77.1098H428.04L428.588 70.4236H288.796L288.248 77.1098Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 88.0674H428.04L428.588 81.3812H288.796L288.248 88.0674Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 99.0251H428.04L428.588 92.3389H288.796L288.248 99.0251Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M413.643 265.602H384.331V271.386H413.643V265.602Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M329.045 332.18H334.453V199.197H329.045V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 271.386H384.321V265.602H310.296V271.386Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 297.228H384.331V303.011H413.643V297.228Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 303.001H384.321V297.218H310.296V303.001Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 202.362H384.331V208.146H413.643V202.362Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 208.135H384.321V202.352H310.296V208.135Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 233.977H384.331V239.761H413.643V233.977Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 239.76H384.321V233.977H310.296V239.76Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M403.081 332.18H408.489V199.197H403.081V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M378.913 332.18H384.321V199.197H378.913V332.18Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M310.296 332.18H315.703V199.197H310.296V332.18Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M66.3348 332.18H121.712L121.712 224.744H66.3348L66.3348 332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M81.1175 332.181H66.3246V317.347H96.6206L81.1175 332.181Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M217.307 332.18H272.684V224.744H217.307V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M66.3347 327.067H230.223V224.734H66.3347V327.067Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M215.43 332.181H230.213V317.347H199.927L215.43 332.181Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M77.7996 288.482H218.748V262.873H77.7996V288.482Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M77.7996 319.559H218.748V293.95H77.7996V319.559Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M191.963 265.613H104.595C103.363 265.613 102.181 265.123 101.309 264.252C100.438 263.38 99.9483 262.198 99.9483 260.966V260.651H196.599V260.966C196.599 262.196 196.111 263.377 195.242 264.248C194.373 265.119 193.193 265.61 191.963 265.613Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M77.7996 257.394H218.748V231.786L77.7996 231.786V257.394Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M191.963 234.525H104.595C103.363 234.525 102.181 234.036 101.309 233.164C100.438 232.293 99.9483 231.111 99.9483 229.878V229.564H196.599V229.878C196.599 231.109 196.111 232.289 195.242 233.161C194.373 234.032 193.193 234.522 191.963 234.525Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M191.963 296.7H104.595C103.363 296.7 102.181 296.211 101.309 295.339C100.438 294.468 99.9483 293.286 99.9483 292.053V291.739H196.599V292.053C196.599 293.284 196.111 294.464 195.242 295.335C194.373 296.207 193.193 296.697 191.963 296.7Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M75.1516 120.798L214.943 120.798V29.251L75.1516 29.251V120.798Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M70.8903 120.798L212.955 120.798V29.251L70.8903 29.251V120.798Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M75.1516 138.757L214.943 138.757V120.788L75.1516 120.788V138.757Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M63.7778 138.757L205.842 138.757V120.788L63.7778 120.788V138.757Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M206.979 114.833V35.2271L76.8561 35.2271V114.833L206.979 114.833Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M177.637 114.823L161.017 35.2271H135.084L151.703 114.823H177.637Z"
                          fill="white"
                        />
                        <path
                          d="M204.209 108.887C204.266 108.887 204.322 108.876 204.374 108.854C204.427 108.832 204.474 108.799 204.514 108.759C204.553 108.718 204.585 108.67 204.605 108.617C204.626 108.564 204.636 108.508 204.635 108.451V39.1129C204.636 39.0566 204.626 39.0005 204.605 38.9482C204.584 38.8959 204.553 38.8483 204.513 38.8085C204.473 38.7686 204.426 38.7373 204.373 38.7164C204.321 38.6955 204.265 38.6854 204.209 38.6868C204.096 38.6868 203.987 38.7317 203.907 38.8116C203.827 38.8915 203.783 38.9999 203.783 39.1129V108.451C203.781 108.508 203.791 108.564 203.812 108.617C203.833 108.67 203.864 108.718 203.904 108.759C203.943 108.799 203.991 108.832 204.043 108.854C204.096 108.876 204.152 108.887 204.209 108.887Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M146.133 114.823L129.514 35.2271H119.398L136.017 114.823H146.133Z"
                          fill="white"
                        />
                        <path
                          d="M77.6171 114.833V35.2271H76.8561V114.833H77.6171Z"
                          fill="#E6E6E6"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 44.2264H209.262L209.809 37.5402H70.0176L69.4697 44.2264Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 48.0008H209.262L209.809 41.3146H70.0176L69.4697 48.0008Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 51.7649H209.262L209.809 45.0889H70.0176L69.4697 51.7649Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 55.5394H209.262L209.809 48.8531H70.0176L69.4697 55.5394Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 59.3034H209.262L209.809 52.6273H70.0176L69.4697 59.3034Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 63.0777H209.262L209.809 56.3915H70.0176L69.4697 63.0777Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M97.4221 221.457H102.252V167.592H97.4221V221.457Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M98.0308 221.427H99.4005V167.561H98.0308V221.427Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M99.9687 221.427H100.506V167.561H99.9687V221.427Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M117.724 224.745H81.9697C81.9697 223.55 82.4443 222.404 83.2891 221.559C84.1339 220.714 85.2798 220.24 86.4745 220.24H113.209C114.404 220.24 115.55 220.714 116.395 221.559C117.239 222.404 117.714 223.55 117.714 224.745H117.724Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M91.1517 201.033C91.5196 201.031 91.8716 200.883 92.1317 200.623C92.3918 200.363 92.5391 200.011 92.5417 199.643V164.366C92.5417 163.997 92.3953 163.643 92.1346 163.383C91.8739 163.122 91.5204 162.976 91.1517 162.976C90.9683 162.974 90.7865 163.009 90.6167 163.078C90.4469 163.148 90.2924 163.25 90.1623 163.379C90.0321 163.508 89.9288 163.662 89.8584 163.831C89.7879 164.001 89.7516 164.182 89.7516 164.366V199.684C89.7647 200.046 89.918 200.39 90.1792 200.641C90.4404 200.893 90.789 201.034 91.1517 201.033Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M78.1953 180.396H121.468L116.486 150.161H83.177L78.1953 180.396Z"
                          fill="#E0E0E0"
                        />
                        <path
                          d="M253.65 378C362.297 378 450.372 372.858 450.372 366.515C450.372 360.172 362.297 355.03 253.65 355.03C145.004 355.03 56.9293 360.172 56.9293 366.515C56.9293 372.858 145.004 378 253.65 378Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M105.639 149.511L104.627 149.584L105.975 168.295L106.987 168.222L105.639 149.511Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M107.674 177.882L106.662 177.955L107.17 184.998L108.182 184.925L107.674 177.882Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M342.641 263.959H125.354C122.935 263.915 120.618 262.978 118.85 261.327C117.081 259.677 115.986 257.43 115.776 255.02L105.103 106.756C105.003 105.613 105.145 104.461 105.517 103.376C105.89 102.29 106.486 101.295 107.267 100.454C108.048 99.6128 108.997 98.9446 110.051 98.4923C111.106 98.04 112.244 97.8137 113.392 97.8279H330.679C333.096 97.8711 335.412 98.8071 337.18 100.456C338.948 102.104 340.044 104.348 340.257 106.756L350.93 255.02C351.03 256.164 350.888 257.316 350.516 258.402C350.143 259.488 349.547 260.484 348.766 261.326C347.985 262.168 347.037 262.837 345.982 263.29C344.927 263.744 343.789 263.972 342.641 263.959Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.5"
                          d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                          fill="white"
                        />
                        <path
                          d="M331.835 102.292H114.548H113.818C108.268 102.749 109.404 111.2 115.005 111.2H332.657C338.268 111.2 338.187 102.749 332.566 102.292H331.835Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M120.21 106.756C120.231 107.018 120.198 107.281 120.111 107.529C120.024 107.776 119.887 108.003 119.707 108.194C119.527 108.386 119.309 108.537 119.068 108.639C118.826 108.741 118.565 108.791 118.303 108.786C117.751 108.778 117.222 108.566 116.818 108.191C116.413 107.817 116.161 107.306 116.111 106.756C116.09 106.496 116.123 106.233 116.209 105.986C116.296 105.739 116.432 105.513 116.611 105.322C116.79 105.131 117.006 104.979 117.247 104.877C117.488 104.774 117.747 104.723 118.008 104.727C118.562 104.732 119.093 104.943 119.5 105.318C119.907 105.693 120.16 106.205 120.21 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M127.18 106.756C127.202 107.018 127.168 107.281 127.081 107.529C126.995 107.776 126.857 108.003 126.677 108.194C126.497 108.386 126.28 108.537 126.038 108.639C125.796 108.741 125.535 108.791 125.273 108.786C124.721 108.778 124.192 108.566 123.788 108.191C123.383 107.817 123.131 107.306 123.081 106.756C123.06 106.496 123.094 106.233 123.18 105.986C123.266 105.739 123.403 105.513 123.581 105.322C123.76 105.131 123.976 104.979 124.217 104.877C124.458 104.774 124.717 104.723 124.979 104.727C125.532 104.732 126.063 104.943 126.47 105.318C126.877 105.693 127.13 106.205 127.18 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M134.141 106.756C134.162 107.017 134.128 107.279 134.042 107.526C133.956 107.773 133.819 108 133.641 108.191C133.462 108.382 133.246 108.533 133.005 108.636C132.764 108.738 132.505 108.789 132.243 108.786C131.691 108.78 131.161 108.569 130.756 108.194C130.351 107.819 130.1 107.306 130.052 106.756C130.029 106.495 130.061 106.232 130.147 105.985C130.232 105.737 130.369 105.51 130.548 105.319C130.727 105.127 130.944 104.976 131.185 104.874C131.427 104.772 131.687 104.722 131.949 104.727C132.5 104.735 133.029 104.947 133.434 105.321C133.839 105.696 134.09 106.207 134.141 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M337.71 249.166H129.869C128.991 249.151 128.15 248.811 127.509 248.211C126.867 247.611 126.472 246.794 126.399 245.919L117.623 123.994C117.584 123.576 117.634 123.154 117.771 122.757C117.907 122.359 118.127 121.995 118.414 121.689C118.702 121.383 119.052 121.142 119.44 120.981C119.829 120.821 120.247 120.745 120.667 120.758H328.558C329.436 120.77 330.277 121.108 330.918 121.706C331.56 122.305 331.955 123.12 332.028 123.994L340.815 245.919C340.853 246.343 340.8 246.77 340.659 247.171C340.519 247.573 340.294 247.94 340 248.247C339.706 248.555 339.349 248.796 338.954 248.954C338.559 249.113 338.135 249.185 337.71 249.166Z"
                          fill="white"
                        />
                        <path
                          d="M250.13 202.718L246.741 155.721L236.493 149.552H208.277L212.113 202.718H250.13Z"
                          fill="white"
                        />
                        <path
                          d="M250.13 203.204H212.113C211.987 203.207 211.865 203.161 211.772 203.076C211.679 202.991 211.623 202.873 211.615 202.748L207.79 149.583C207.785 149.516 207.795 149.449 207.817 149.386C207.84 149.323 207.876 149.266 207.922 149.218C207.967 149.167 208.022 149.127 208.083 149.099C208.144 149.071 208.21 149.056 208.277 149.055H236.493C236.582 149.058 236.669 149.083 236.747 149.126L246.995 155.295C247.064 155.334 247.122 155.39 247.164 155.457C247.207 155.525 247.232 155.601 247.238 155.681L250.607 202.677C250.614 202.745 250.605 202.814 250.583 202.879C250.56 202.944 250.523 203.003 250.475 203.052C250.43 203.1 250.377 203.138 250.318 203.164C250.259 203.19 250.194 203.204 250.13 203.204ZM212.589 202.19H249.592L246.264 155.975L236.402 150.039H208.805L212.589 202.19Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M246.741 155.721L236.493 149.552L240.258 157.73L246.741 155.721Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M240.258 158.217C240.164 158.216 240.073 158.19 239.994 158.139C239.915 158.089 239.851 158.017 239.811 157.933L236.047 149.755C236.003 149.659 235.99 149.552 236.01 149.448C236.03 149.345 236.082 149.25 236.159 149.177C236.239 149.108 236.339 149.066 236.445 149.057C236.55 149.048 236.656 149.072 236.747 149.126L246.995 155.295C247.077 155.345 247.144 155.417 247.187 155.503C247.23 155.589 247.248 155.686 247.238 155.782C247.225 155.875 247.186 155.963 247.125 156.035C247.064 156.107 246.983 156.16 246.893 156.188L240.4 158.217H240.258ZM237.61 150.79L240.522 157.131L245.595 155.579L237.61 150.79Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M224.227 173.497C224.242 173.773 224.201 174.049 224.106 174.308C224.011 174.567 223.863 174.804 223.674 175.004C223.484 175.205 223.255 175.364 223.001 175.473C222.747 175.582 222.474 175.638 222.198 175.638C221.619 175.627 221.064 175.403 220.64 175.008C220.217 174.612 219.955 174.074 219.905 173.497C219.879 173.218 219.912 172.937 220.003 172.673C220.094 172.408 220.241 172.166 220.433 171.962C220.625 171.759 220.858 171.599 221.117 171.492C221.376 171.386 221.654 171.336 221.934 171.346C222.514 171.359 223.069 171.585 223.492 171.982C223.915 172.379 224.177 172.919 224.227 173.497Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M238.127 173.497C238.152 173.775 238.117 174.054 238.025 174.318C237.933 174.581 237.787 174.822 237.595 175.025C237.403 175.227 237.17 175.386 236.912 175.492C236.654 175.598 236.377 175.647 236.098 175.638C235.518 175.627 234.961 175.403 234.536 175.008C234.111 174.613 233.847 174.075 233.795 173.497C233.778 173.22 233.818 172.943 233.913 172.683C234.007 172.422 234.154 172.184 234.344 171.983C234.534 171.781 234.764 171.621 235.018 171.511C235.273 171.402 235.547 171.345 235.824 171.346C236.406 171.354 236.965 171.579 237.391 171.976C237.817 172.374 238.079 172.916 238.127 173.497Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M242.064 187.437C241.94 187.435 241.822 187.387 241.732 187.303C241.642 187.219 241.587 187.104 241.577 186.981C241.323 183.521 235.905 180.711 229.503 180.711C225.252 180.711 221.437 181.979 219.55 184.008C219.162 184.382 218.858 184.834 218.659 185.334C218.459 185.835 218.369 186.372 218.393 186.91C218.398 186.976 218.389 187.043 218.368 187.107C218.347 187.17 218.313 187.229 218.27 187.279C218.181 187.381 218.056 187.443 217.921 187.453C217.787 187.462 217.654 187.418 217.552 187.329C217.45 187.241 217.388 187.115 217.378 186.981C217.348 186.308 217.459 185.637 217.704 185.009C217.948 184.382 218.321 183.813 218.799 183.338C220.828 181.116 224.957 179.726 229.472 179.726C236.504 179.726 242.236 182.882 242.52 186.91C242.524 186.974 242.516 187.038 242.495 187.099C242.474 187.159 242.442 187.215 242.399 187.263C242.357 187.311 242.305 187.351 242.248 187.379C242.19 187.407 242.128 187.423 242.064 187.427V187.437Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M216.283 169.154C216.159 169.152 216.04 169.105 215.948 169.023C215.856 168.929 215.804 168.804 215.804 168.672C215.804 168.541 215.856 168.416 215.948 168.322L218.109 165.999C218.202 165.91 218.325 165.86 218.454 165.86C218.583 165.86 218.706 165.91 218.799 165.999C218.844 166.044 218.88 166.098 218.905 166.157C218.929 166.216 218.942 166.28 218.942 166.344C218.942 166.408 218.929 166.472 218.905 166.531C218.88 166.59 218.844 166.644 218.799 166.689L216.638 169.012C216.591 169.059 216.536 169.095 216.475 169.12C216.414 169.144 216.348 169.156 216.283 169.154Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M241.049 169.154C240.926 169.149 240.808 169.102 240.714 169.023L238.228 166.699C238.181 166.654 238.144 166.599 238.119 166.539C238.093 166.479 238.08 166.414 238.08 166.349C238.08 166.284 238.093 166.219 238.119 166.159C238.144 166.099 238.181 166.044 238.228 165.999C238.321 165.91 238.445 165.86 238.573 165.86C238.702 165.86 238.826 165.91 238.918 165.999L241.404 168.322C241.449 168.368 241.485 168.421 241.51 168.481C241.535 168.54 241.547 168.603 241.547 168.667C241.547 168.732 241.535 168.795 241.51 168.854C241.485 168.913 241.449 168.967 241.404 169.012C241.308 169.102 241.181 169.153 241.049 169.154Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M205.213 213.219H207.506L210.814 217.622L210.499 213.219H212.813L213.381 221.173H211.037L207.75 216.8L208.064 221.173H205.751L205.213 213.219Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M214.416 217.196C214.338 216.655 214.375 216.105 214.525 215.58C214.676 215.055 214.936 214.569 215.288 214.152C215.674 213.773 216.136 213.48 216.643 213.293C217.15 213.106 217.691 213.028 218.231 213.066C219.374 213.004 220.497 213.386 221.366 214.132C222.162 214.924 222.623 215.992 222.654 217.115C222.738 217.889 222.634 218.672 222.35 219.397C222.087 219.982 221.647 220.468 221.092 220.787C220.426 221.145 219.676 221.316 218.921 221.285C218.144 221.309 217.372 221.164 216.658 220.858C216.033 220.558 215.505 220.087 215.136 219.499C214.701 218.806 214.453 218.013 214.416 217.196ZM216.881 217.196C216.872 217.818 217.072 218.426 217.45 218.921C217.608 219.095 217.803 219.233 218.02 219.324C218.237 219.415 218.472 219.457 218.708 219.448C218.933 219.464 219.158 219.425 219.365 219.335C219.571 219.245 219.753 219.106 219.895 218.931C220.186 218.376 220.283 217.74 220.169 217.125C220.173 216.528 219.972 215.948 219.6 215.481C219.438 215.31 219.241 215.175 219.022 215.086C218.803 214.997 218.568 214.955 218.332 214.964C218.111 214.954 217.892 214.997 217.691 215.089C217.49 215.18 217.313 215.318 217.176 215.491C216.879 216.014 216.774 216.624 216.881 217.216V217.196Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M227.423 213.219H231.076C231.678 213.2 232.278 213.3 232.841 213.513C233.287 213.7 233.683 213.988 233.998 214.355C234.317 214.727 234.562 215.158 234.718 215.623C234.882 216.123 234.985 216.641 235.022 217.165C235.1 217.829 235.049 218.5 234.87 219.144C234.73 219.589 234.483 219.994 234.15 220.321C233.872 220.615 233.522 220.832 233.135 220.95C232.663 221.087 232.176 221.162 231.684 221.173H228.042L227.423 213.219ZM230.01 215.025L230.325 219.367H230.923C231.294 219.391 231.665 219.332 232.009 219.195C232.236 219.063 232.403 218.848 232.476 218.596C232.592 218.146 232.619 217.677 232.557 217.216C232.576 216.597 232.387 215.99 232.019 215.491C231.831 215.321 231.609 215.191 231.368 215.111C231.127 215.031 230.872 215.001 230.619 215.025H230.01Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M240.917 219.854H238.127L237.833 221.173H235.327L237.741 213.219H240.461L244.022 221.173H241.445L240.917 219.854ZM240.278 218.139L239.202 215.278L238.533 218.139H240.278Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M242.865 213.219H250.333L250.475 215.187H247.969L248.395 221.173H245.939L245.513 215.187H243.007L242.865 213.219Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M256.055 219.854H253.265L252.971 221.173H250.464L252.879 213.219H255.558L259.109 221.173H256.542L256.055 219.854ZM255.416 218.139L254.33 215.278L253.65 218.139H255.416Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M358.855 119.804C359.758 119.348 360.884 118.79 361.838 118.211C362.791 117.633 363.867 117.075 364.881 116.466C366.86 115.239 368.869 114.031 370.766 112.692C374.577 110.085 378.149 107.144 381.44 103.905C381.856 103.52 382.221 103.094 382.617 102.678L383.195 102.059L383.479 101.754L383.621 101.592C383.479 101.866 383.621 101.785 383.621 101.521C383.71 101.159 383.761 100.788 383.773 100.415C383.75 98.2579 383.502 96.1088 383.033 94.0029C382.13 89.4575 380.76 84.77 379.411 80.184L383.347 78.4592C385.832 82.8592 387.907 87.4781 389.546 92.2578C390.467 94.8408 391.054 97.5311 391.292 100.263C391.354 101.112 391.326 101.966 391.21 102.81C391.06 104.003 390.636 105.145 389.973 106.148L389.8 106.381L389.668 106.543L389.516 106.736L389.201 107.122L388.572 107.883C388.156 108.38 387.751 108.897 387.304 109.374C383.834 113.224 379.964 116.694 375.758 119.723C373.729 121.225 371.578 122.665 369.376 123.974C368.291 124.634 367.185 125.263 366.058 125.882C364.932 126.501 363.836 127.069 362.538 127.678L358.855 119.804Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M349.825 358.337C350.584 358.318 351.34 358.216 352.077 358.033C352.115 358.021 352.148 358 352.175 357.972C352.202 357.943 352.22 357.908 352.229 357.87C352.234 357.831 352.228 357.792 352.212 357.756C352.196 357.72 352.17 357.69 352.138 357.667C351.844 357.475 349.267 355.811 348.272 356.257C348.162 356.309 348.068 356.388 347.998 356.488C347.929 356.588 347.887 356.704 347.877 356.825C347.837 357.017 347.847 357.215 347.906 357.402C347.964 357.588 348.07 357.756 348.212 357.891C348.678 358.23 349.251 358.388 349.825 358.337ZM351.499 357.749C350.028 358.043 348.912 357.992 348.455 357.596C348.364 357.503 348.297 357.388 348.262 357.262C348.226 357.136 348.223 357.004 348.252 356.876C348.256 356.822 348.274 356.77 348.304 356.726C348.334 356.681 348.376 356.646 348.425 356.622C348.962 356.389 350.454 357.14 351.499 357.749Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M352.067 358.033H352.168C352.198 358.014 352.223 357.989 352.241 357.959C352.258 357.929 352.268 357.895 352.27 357.86C352.27 357.748 352.27 355.303 351.336 354.492C351.225 354.384 351.09 354.303 350.942 354.256C350.794 354.208 350.638 354.195 350.484 354.218C350.324 354.219 350.169 354.275 350.046 354.377C349.922 354.478 349.837 354.619 349.804 354.776C349.612 355.79 351.154 357.566 351.965 358.033C351.999 358.042 352.034 358.042 352.067 358.033ZM350.616 354.593C350.781 354.594 350.94 354.655 351.062 354.766C351.598 355.555 351.874 356.491 351.854 357.444C351.042 356.795 350.078 355.415 350.2 354.837C350.2 354.745 350.271 354.624 350.525 354.593H350.616Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M351.275 94.429C350.261 99.502 348.232 109.648 351.732 113.047C351.732 113.047 350.352 118.12 340.987 118.12C330.679 118.12 336.067 113.047 336.067 113.047C341.688 111.708 341.535 107.538 340.561 103.611L351.275 94.429Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M334.088 115.076C332.475 115.299 333.855 111.109 334.504 110.673C336.026 109.658 355.669 108.248 355.537 110.673C355.456 111.687 354.969 113.716 354.117 114.386C353.264 115.056 348.212 112.966 334.088 115.076Z"
                          fill="#263238"
                        />
                        <path
                          d="M337.294 113.635C336.006 114.072 336.128 109.851 336.564 109.344C337.579 108.167 353.477 104.088 353.944 106.391C354.127 107.406 354.218 109.435 353.67 110.155C353.122 110.876 348.455 109.689 337.294 113.635Z"
                          fill="#263238"
                        />
                        <path
                          d="M331.379 85.3382C331.315 85.341 331.252 85.3286 331.194 85.3022C331.135 85.2757 331.084 85.2359 331.044 85.186C330.735 84.7867 330.336 84.4658 329.879 84.249C329.423 84.0323 328.922 83.9257 328.417 83.938C328.364 83.9451 328.31 83.9414 328.259 83.9272C328.207 83.9131 328.159 83.8887 328.118 83.8555C328.076 83.8223 328.042 83.7811 328.016 83.7343C327.991 83.6874 327.975 83.636 327.97 83.5829C327.961 83.4784 327.994 83.3746 328.06 83.2933C328.126 83.2119 328.221 83.1594 328.325 83.1466C328.964 83.114 329.601 83.2363 330.182 83.5031C330.763 83.7699 331.272 84.1732 331.663 84.6787C331.731 84.761 331.764 84.8668 331.755 84.9732C331.745 85.0795 331.694 85.1779 331.613 85.2469C331.544 85.2963 331.463 85.3277 331.379 85.3382Z"
                          fill="#263238"
                        />
                        <path
                          d="M329.411 90.2994C328.95 91.9181 328.268 93.4649 327.382 94.8956C327.754 95.1095 328.168 95.2395 328.596 95.2763C329.023 95.3131 329.454 95.2559 329.857 95.1087L329.411 90.2994Z"
                          fill="#FF5652"
                        />
                        <path
                          d="M329.908 89.0719C329.979 89.7517 329.665 90.3401 329.218 90.3807C328.772 90.4213 328.356 89.914 328.295 89.2241C328.234 88.5342 328.538 87.9558 328.975 87.9152C329.411 87.8747 329.837 88.382 329.908 89.0719Z"
                          fill="#263238"
                        />
                        <path
                          d="M329.178 87.9355L327.493 87.621C327.493 87.621 328.457 88.8182 329.178 87.9355Z"
                          fill="#263238"
                        />
                        <path
                          d="M361.909 357.84H353.406L354.076 338.157H362.578L361.909 357.84Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M352.737 356.856H362.284C362.449 356.852 362.609 356.908 362.734 357.015C362.86 357.122 362.941 357.271 362.964 357.434L364.049 364.983C364.071 365.174 364.052 365.367 363.993 365.55C363.934 365.733 363.838 365.901 363.709 366.044C363.581 366.187 363.424 366.301 363.248 366.378C363.072 366.456 362.882 366.496 362.69 366.494C359.362 366.444 357.759 366.241 353.558 366.241C350.971 366.241 347.197 366.515 343.636 366.515C340.074 366.515 339.871 362.984 341.363 362.669C348.019 361.229 349.074 359.26 351.316 357.373C351.715 357.041 352.217 356.859 352.737 356.856Z"
                          fill="#263238"
                        />
                        <g opacity="0.2">
                          <path
                            opacity="0.2"
                            d="M362.578 338.157H354.076L353.731 348.303H362.233L362.578 338.157Z"
                            fill="black"
                          />
                        </g>
                        <path
                          d="M328.092 124.796C322.889 122.773 317.793 120.487 312.822 117.947C307.688 115.439 302.797 112.46 298.212 109.049C296.987 108.09 295.828 107.049 294.742 105.935C294.458 105.63 294.174 105.346 293.9 104.991C293.578 104.628 293.28 104.245 293.007 103.844C292.259 102.754 291.792 101.496 291.648 100.182C291.536 98.9357 291.706 97.6804 292.145 96.5089C292.496 95.5673 292.978 94.6794 293.575 93.871C294.555 92.5307 295.712 91.3293 297.015 90.2996C299.314 88.469 301.796 86.8812 304.421 85.5614C305.679 84.8917 306.958 84.2931 308.257 83.7351C309.555 83.1771 310.834 82.6495 312.224 82.1726L314.019 86.0788C309.596 88.869 305.01 91.9432 301.641 95.3726C300.888 96.1364 300.224 96.9841 299.663 97.8989C299.176 98.7005 299.186 99.2991 299.267 99.2484C299.348 99.1976 299.267 99.2483 299.409 99.3498L299.815 99.7861C299.967 99.9687 300.18 100.151 300.373 100.344C301.233 101.135 302.144 101.867 303.102 102.536C305.197 104.019 307.379 105.374 309.636 106.594C311.919 107.872 314.273 109.08 316.668 110.236C321.457 112.529 326.408 114.731 331.268 116.74L328.092 124.796Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M316.556 83.3495L317.956 80.3057L311.544 78.1243C311.544 78.1243 309.515 84.1206 311.919 86.8803C312.924 86.7221 313.874 86.3166 314.683 85.7002C315.493 85.0839 316.136 84.2761 316.556 83.3495Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M317.926 73.7209L312.822 72.2396L311.544 78.0837L317.926 80.3057V73.7209Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M383.875 80.5999L384.615 73.4977L378.041 75.0805C378.041 75.0805 377.939 81.7565 381.419 82.8117L383.875 80.5999Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M381.45 68.4956L377.158 70.4944L378.041 75.0296L384.615 73.4773L381.45 68.4956Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M352.615 84.4656C352.93 92.897 353.234 96.4582 349.429 101.176C343.697 108.278 333.277 106.807 330.456 98.6396C327.92 91.2939 327.838 78.7433 335.712 74.6037C337.443 73.6833 339.38 73.2205 341.34 73.2592C343.3 73.2979 345.218 73.8368 346.911 74.8247C348.605 75.8126 350.017 77.2169 351.016 78.9042C352.014 80.5914 352.564 82.5058 352.615 84.4656Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M348.942 101.166C357.221 97.5844 362.659 90.0054 360.366 78.2563C358.165 66.984 350.555 65.868 347.41 68.2016C344.265 70.5351 336.422 67.0551 331.714 71.012C323.597 77.8809 331.268 85.2164 335.285 89.6502C337.68 94.5812 340.825 104.666 348.942 101.166Z"
                          fill="#263238"
                        />
                        <path
                          d="M345.503 76.2372C346.513 77.5328 347.88 78.5043 349.436 79.0317C350.991 79.5592 352.667 79.6196 354.257 79.2054C355.847 78.7911 357.28 77.9205 358.381 76.7009C359.481 75.4813 360.201 73.9661 360.45 72.3424C360.699 70.7187 360.468 69.0576 359.784 67.564C359.1 66.0704 357.993 64.8098 356.601 63.9379C355.209 63.0659 353.592 62.6206 351.949 62.6571C350.307 62.6936 348.711 63.2102 347.359 64.1432C345.51 65.5011 344.275 67.5379 343.927 69.8058C343.579 72.0737 344.146 74.387 345.503 76.2372Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M347.654 68.9929C346.466 62.195 352.889 56.9597 361.493 59.4861C370.097 62.0124 365.551 69.6321 363.776 75.7197C362 81.8073 366.647 87.6108 368.575 82.9741C370.502 78.3374 367.256 76.8865 367.256 76.8865C367.256 76.8865 376.387 79.2505 367.905 89.5487C359.423 99.8469 351.742 88.4732 353.822 81.7667C355.507 76.3792 348.78 75.4153 347.654 68.9929Z"
                          fill="#263238"
                        />
                        <path
                          d="M339.06 71.5599C335.133 69.5307 328.488 67.8566 324.703 74.2283C322.917 77.2721 323.607 81.3305 323.607 81.3305L335.164 82.0915L339.06 71.5599Z"
                          fill="#263238"
                        />
                        <path
                          d="M322.248 79.3215C322.18 79.3163 322.116 79.2849 322.071 79.2338C322.025 79.1827 322.001 79.1159 322.004 79.0476C322.004 78.8751 322.299 74.7964 324.764 72.2396C330.72 66.0506 337.7 71.225 339.689 72.8991C339.732 72.9444 339.756 73.0038 339.758 73.0661C339.76 73.1284 339.739 73.1891 339.699 73.2368C339.658 73.2845 339.602 73.3157 339.541 73.3245C339.479 73.3333 339.416 73.3192 339.364 73.2847C337.447 71.641 330.77 66.7202 325.16 72.5846C322.826 75.0095 322.542 79.0375 322.542 79.078C322.541 79.1142 322.532 79.1497 322.517 79.1823C322.501 79.2148 322.478 79.2435 322.45 79.2666C322.422 79.2897 322.39 79.3065 322.355 79.316C322.32 79.3254 322.284 79.3273 322.248 79.3215Z"
                          fill="#263238"
                        />
                        <path
                          d="M336.696 89.2849C336.65 90.8812 336.059 92.4136 335.022 93.6274C333.621 95.2711 331.978 94.4594 331.643 92.6128C331.308 90.9793 331.643 88.1486 333.408 87.1644C335.174 86.1803 336.716 87.4384 336.696 89.2849Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                          fill="#263238"
                        />
                        <path
                          opacity="0.1"
                          d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                          fill="white"
                        />
                        <path
                          opacity="0.3"
                          d="M340.967 193.282C345.026 211.088 341.789 239.132 339.567 251.479C337.213 232.729 336.026 208.43 335.438 190.603C337.538 187.214 339.526 186.991 340.967 193.282Z"
                          fill="black"
                        />
                        <path
                          d="M350.728 346.568H365.49L366.261 341.393L350.646 340.865L350.728 346.568Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                          fill="black"
                        />
                        <path
                          d="M346.334 343.25C346.351 343.221 346.36 343.187 346.36 343.153C346.36 343.12 346.351 343.086 346.334 343.057C346.315 343.018 346.284 342.986 346.246 342.966C346.208 342.946 346.164 342.939 346.121 342.945C345.695 343.016 341.941 343.605 341.434 344.68C341.38 344.778 341.351 344.888 341.351 345C341.351 345.112 341.38 345.222 341.434 345.32C341.521 345.48 341.646 345.617 341.798 345.717C341.95 345.818 342.125 345.88 342.306 345.898C343.534 346.02 345.35 344.315 346.263 343.28L346.334 343.25ZM341.83 344.812C342.174 344.244 344.123 343.717 345.604 343.443C344.265 344.802 343.088 345.563 342.398 345.472C342.278 345.46 342.164 345.418 342.065 345.351C341.965 345.284 341.885 345.193 341.83 345.086C341.807 345.048 341.796 345.004 341.796 344.959C341.796 344.915 341.807 344.871 341.83 344.833C341.83 344.833 341.819 344.822 341.83 344.812Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M355.192 339.648L347.42 343.108L343.96 335.894L339.435 326.458L338.898 325.362L346.669 321.903L347.268 323.14L351.651 332.282L355.192 339.648Z"
                          fill="#FFB573"
                        />
                        <path
                          opacity="0.2"
                          d="M351.651 332.282L343.96 335.894L339.435 326.458L347.268 323.141L351.651 332.282Z"
                          fill="black"
                        />
                        <path
                          d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                          fill="#263238"
                        />
                        <path
                          opacity="0.1"
                          d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                          fill="white"
                        />
                        <path
                          d="M346.04 342.022L353.751 336.411C353.881 336.31 354.044 336.26 354.209 336.271C354.374 336.282 354.529 336.354 354.644 336.472L359.971 341.941C360.1 342.084 360.198 342.252 360.257 342.435C360.317 342.618 360.338 342.812 360.317 343.003C360.297 343.195 360.237 343.38 360.141 343.546C360.044 343.713 359.914 343.857 359.758 343.97C357.028 345.878 355.618 346.669 352.229 349.135C350.139 350.656 345.979 354.015 343.098 356.115C340.216 358.215 338.025 355.476 339.039 354.35C343.585 349.277 344.539 346.131 345.249 343.28C345.359 342.782 345.639 342.337 346.04 342.022Z"
                          fill="#263238"
                        />
                        <path
                          d="M339.963 335.519L353.386 329.38L351.671 323.912L337.294 330.466L339.963 335.519Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                          fill="black"
                        />
                        <path
                          d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                          fill="black"
                        />
                        <path
                          d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.3"
                          d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                          fill="white"
                        />
                        <path
                          d="M356.125 168.424H357.059C357.252 168.424 357.394 168.323 357.373 168.211L356.937 164.153C356.937 164.031 356.765 163.939 356.582 163.939H355.638C355.456 163.939 355.314 164.031 355.324 164.153L355.76 168.211C355.75 168.302 355.912 168.424 356.125 168.424Z"
                          fill="#263238"
                        />
                        <path
                          d="M333.408 168.424H334.342C334.524 168.424 334.667 168.323 334.656 168.211L334.22 164.153C334.22 164.031 334.048 163.939 333.855 163.939H332.921C332.729 163.939 332.597 164.031 332.607 164.153L333.043 168.211C333.053 168.302 333.216 168.424 333.408 168.424Z"
                          fill="#263238"
                        />
                      </svg>
                      <p className="text-center">No Data Available</p>
                    </div>
                  )}
                {questionSubjectDistribution.length > 0 && (
                  <div className="col-lg col-md-6 mt-md-0 mt-3">
                    <Chart
                      series={questionsChartOptions.series}
                      options={questionsChartOptions.options}
                      type="donut"
                      width="100%"
                      height="400"
                    />
                  </div>
                )}
                {!questionSubjectDistribution.length && (
                  <div className="col-lg col-md-6 mt-md-0 mt-3">
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 508 378"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M507.301 332.18H0V332.434H507.301V332.18Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M456.469 348.505H422.866V348.759H456.469V348.505Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M336.056 351.265H327.24V351.519H336.056V351.265Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M421.851 339.09H402.381V339.344H421.851V339.09Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M97.0466 340.794H53.226V341.048H97.0466V340.794Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M112.509 340.794H106.087V341.048H112.509V340.794Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M228.438 345.076H133.39V345.33H228.438V345.076Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M240.461 286.929H44.5511C43.0163 286.927 41.5454 286.315 40.4611 285.229C39.3768 284.143 38.7678 282.671 38.7678 281.136V5.74264C38.7812 4.21671 39.3961 2.75767 40.4789 1.68243C41.5617 0.607197 43.0251 0.00261401 44.5511 0H240.461C241.997 0 243.471 0.610372 244.557 1.69684C245.644 2.78331 246.254 4.25688 246.254 5.79337V281.136C246.254 282.672 245.644 284.146 244.557 285.233C243.471 286.319 241.997 286.929 240.461 286.929ZM44.5511 0.202921C43.0836 0.205609 41.6771 0.790441 40.6404 1.82905C39.6037 2.86766 39.0215 4.27517 39.0215 5.74264V281.136C39.0215 282.603 39.6037 284.011 40.6404 285.05C41.6771 286.088 43.0836 286.673 44.5511 286.676H240.461C241.929 286.673 243.336 286.088 244.375 285.05C245.413 284.012 245.998 282.604 246 281.136V5.74264C245.998 4.27424 245.413 2.86675 244.375 1.82843C243.336 0.790111 241.929 0.205603 240.461 0.202921H44.5511Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M459.929 286.929H264.009C262.474 286.927 261.002 286.315 259.916 285.23C258.83 284.144 258.219 282.672 258.216 281.136V5.74264C258.232 4.21578 258.849 2.75675 259.934 1.6818C261.018 0.606842 262.482 0.0025855 264.009 0H459.929C461.453 0.00528049 462.914 0.611043 463.995 1.68599C465.075 2.76094 465.689 4.21846 465.702 5.74264V281.136C465.702 282.669 465.095 284.139 464.012 285.225C462.93 286.311 461.462 286.924 459.929 286.929ZM264.009 0.202921C262.541 0.205603 261.134 0.790111 260.095 1.82843C259.057 2.86675 258.472 4.27424 258.47 5.74264V281.136C258.472 282.604 259.057 284.012 260.095 285.05C261.134 286.088 262.541 286.673 264.009 286.676H459.929C461.397 286.673 462.805 286.088 463.843 285.05C464.882 284.012 465.466 282.604 465.469 281.136V5.74264C465.466 4.27424 464.882 2.86675 463.843 1.82843C462.805 0.790111 461.397 0.205603 459.929 0.202921H264.009Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M293.92 120.798L433.712 120.798V29.251L293.92 29.251V120.798Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M289.648 120.798L431.713 120.798V29.251L289.648 29.251V120.798Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M293.92 138.757L433.712 138.757V120.788L293.92 120.788V138.757Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M282.556 138.757L424.621 138.757V120.788L282.556 120.788V138.757Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M425.747 114.833V35.2271L295.625 35.2271V114.833L425.747 114.833Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M396.405 114.823L379.786 35.2271H353.853L370.472 114.823H396.405Z"
                        fill="white"
                      />
                      <path
                        d="M422.988 108.887C423.044 108.887 423.101 108.876 423.153 108.854C423.205 108.832 423.253 108.799 423.293 108.759C423.332 108.718 423.363 108.67 423.384 108.617C423.405 108.564 423.415 108.508 423.414 108.451V39.1129C423.414 38.9999 423.369 38.8915 423.289 38.8116C423.209 38.7317 423.101 38.6868 422.988 38.6868C422.931 38.6854 422.875 38.6955 422.823 38.7164C422.77 38.7373 422.723 38.7686 422.683 38.8085C422.643 38.8483 422.612 38.8959 422.591 38.9482C422.57 39.0005 422.56 39.0566 422.561 39.1129V108.451C422.56 108.508 422.57 108.564 422.591 108.617C422.612 108.67 422.643 108.718 422.683 108.759C422.722 108.799 422.77 108.832 422.822 108.854C422.874 108.876 422.931 108.887 422.988 108.887Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M364.902 114.823L348.282 35.2271H338.167L354.796 114.823H364.902Z"
                        fill="white"
                      />
                      <path
                        d="M296.385 114.833V35.2271H295.624V114.833H296.385Z"
                        fill="#E6E6E6"
                      />
                      <path
                        opacity="0.6"
                        d="M288.248 44.2264H428.04L428.588 37.5402H288.796L288.248 44.2264Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M288.248 55.1843H428.04L428.588 48.5082H288.796L288.248 55.1843Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M288.248 66.1419H428.04L428.588 59.4658H288.796L288.248 66.1419Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M288.248 77.1098H428.04L428.588 70.4236H288.796L288.248 77.1098Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M288.248 88.0674H428.04L428.588 81.3812H288.796L288.248 88.0674Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M288.248 99.0251H428.04L428.588 92.3389H288.796L288.248 99.0251Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M413.643 265.602H384.331V271.386H413.643V265.602Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M329.045 332.18H334.453V199.197H329.045V332.18Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M310.296 271.386H384.321V265.602H310.296V271.386Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M413.643 297.228H384.331V303.011H413.643V297.228Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M310.296 303.001H384.321V297.218H310.296V303.001Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M413.643 202.362H384.331V208.146H413.643V202.362Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M310.296 208.135H384.321V202.352H310.296V208.135Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M413.643 233.977H384.331V239.761H413.643V233.977Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M310.296 239.76H384.321V233.977H310.296V239.76Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M403.081 332.18H408.489V199.197H403.081V332.18Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M378.913 332.18H384.321V199.197H378.913V332.18Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M310.296 332.18H315.703V199.197H310.296V332.18Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M66.3348 332.18H121.712L121.712 224.744H66.3348L66.3348 332.18Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M81.1175 332.181H66.3246V317.347H96.6206L81.1175 332.181Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M217.307 332.18H272.684V224.744H217.307V332.18Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M66.3347 327.067H230.223V224.734H66.3347V327.067Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M215.43 332.181H230.213V317.347H199.927L215.43 332.181Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M77.7996 288.482H218.748V262.873H77.7996V288.482Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M77.7996 319.559H218.748V293.95H77.7996V319.559Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M191.963 265.613H104.595C103.363 265.613 102.181 265.123 101.309 264.252C100.438 263.38 99.9483 262.198 99.9483 260.966V260.651H196.599V260.966C196.599 262.196 196.111 263.377 195.242 264.248C194.373 265.119 193.193 265.61 191.963 265.613Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M77.7996 257.394H218.748V231.786L77.7996 231.786V257.394Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M191.963 234.525H104.595C103.363 234.525 102.181 234.036 101.309 233.164C100.438 232.293 99.9483 231.111 99.9483 229.878V229.564H196.599V229.878C196.599 231.109 196.111 232.289 195.242 233.161C194.373 234.032 193.193 234.522 191.963 234.525Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M191.963 296.7H104.595C103.363 296.7 102.181 296.211 101.309 295.339C100.438 294.468 99.9483 293.286 99.9483 292.053V291.739H196.599V292.053C196.599 293.284 196.111 294.464 195.242 295.335C194.373 296.207 193.193 296.697 191.963 296.7Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M75.1516 120.798L214.943 120.798V29.251L75.1516 29.251V120.798Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M70.8903 120.798L212.955 120.798V29.251L70.8903 29.251V120.798Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M75.1516 138.757L214.943 138.757V120.788L75.1516 120.788V138.757Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M63.7778 138.757L205.842 138.757V120.788L63.7778 120.788V138.757Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M206.979 114.833V35.2271L76.8561 35.2271V114.833L206.979 114.833Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M177.637 114.823L161.017 35.2271H135.084L151.703 114.823H177.637Z"
                        fill="white"
                      />
                      <path
                        d="M204.209 108.887C204.266 108.887 204.322 108.876 204.374 108.854C204.427 108.832 204.474 108.799 204.514 108.759C204.553 108.718 204.585 108.67 204.605 108.617C204.626 108.564 204.636 108.508 204.635 108.451V39.1129C204.636 39.0566 204.626 39.0005 204.605 38.9482C204.584 38.8959 204.553 38.8483 204.513 38.8085C204.473 38.7686 204.426 38.7373 204.373 38.7164C204.321 38.6955 204.265 38.6854 204.209 38.6868C204.096 38.6868 203.987 38.7317 203.907 38.8116C203.827 38.8915 203.783 38.9999 203.783 39.1129V108.451C203.781 108.508 203.791 108.564 203.812 108.617C203.833 108.67 203.864 108.718 203.904 108.759C203.943 108.799 203.991 108.832 204.043 108.854C204.096 108.876 204.152 108.887 204.209 108.887Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M146.133 114.823L129.514 35.2271H119.398L136.017 114.823H146.133Z"
                        fill="white"
                      />
                      <path
                        d="M77.6171 114.833V35.2271H76.8561V114.833H77.6171Z"
                        fill="#E6E6E6"
                      />
                      <path
                        opacity="0.6"
                        d="M69.4697 44.2264H209.262L209.809 37.5402H70.0176L69.4697 44.2264Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M69.4697 48.0008H209.262L209.809 41.3146H70.0176L69.4697 48.0008Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M69.4697 51.7649H209.262L209.809 45.0889H70.0176L69.4697 51.7649Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M69.4697 55.5394H209.262L209.809 48.8531H70.0176L69.4697 55.5394Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M69.4697 59.3034H209.262L209.809 52.6273H70.0176L69.4697 59.3034Z"
                        fill="#EBEBEB"
                      />
                      <path
                        opacity="0.6"
                        d="M69.4697 63.0777H209.262L209.809 56.3915H70.0176L69.4697 63.0777Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M97.4221 221.457H102.252V167.592H97.4221V221.457Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M98.0308 221.427H99.4005V167.561H98.0308V221.427Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M99.9687 221.427H100.506V167.561H99.9687V221.427Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M117.724 224.745H81.9697C81.9697 223.55 82.4443 222.404 83.2891 221.559C84.1339 220.714 85.2798 220.24 86.4745 220.24H113.209C114.404 220.24 115.55 220.714 116.395 221.559C117.239 222.404 117.714 223.55 117.714 224.745H117.724Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M91.1517 201.033C91.5196 201.031 91.8716 200.883 92.1317 200.623C92.3918 200.363 92.5391 200.011 92.5417 199.643V164.366C92.5417 163.997 92.3953 163.643 92.1346 163.383C91.8739 163.122 91.5204 162.976 91.1517 162.976C90.9683 162.974 90.7865 163.009 90.6167 163.078C90.4469 163.148 90.2924 163.25 90.1623 163.379C90.0321 163.508 89.9288 163.662 89.8584 163.831C89.7879 164.001 89.7516 164.182 89.7516 164.366V199.684C89.7647 200.046 89.918 200.39 90.1792 200.641C90.4404 200.893 90.789 201.034 91.1517 201.033Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M78.1953 180.396H121.468L116.486 150.161H83.177L78.1953 180.396Z"
                        fill="#E0E0E0"
                      />
                      <path
                        d="M253.65 378C362.297 378 450.372 372.858 450.372 366.515C450.372 360.172 362.297 355.03 253.65 355.03C145.004 355.03 56.9293 360.172 56.9293 366.515C56.9293 372.858 145.004 378 253.65 378Z"
                        fill="#F5F5F5"
                      />
                      <path
                        d="M105.639 149.511L104.627 149.584L105.975 168.295L106.987 168.222L105.639 149.511Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M107.674 177.882L106.662 177.955L107.17 184.998L108.182 184.925L107.674 177.882Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M342.641 263.959H125.354C122.935 263.915 120.618 262.978 118.85 261.327C117.081 259.677 115.986 257.43 115.776 255.02L105.103 106.756C105.003 105.613 105.145 104.461 105.517 103.376C105.89 102.29 106.486 101.295 107.267 100.454C108.048 99.6128 108.997 98.9446 110.051 98.4923C111.106 98.04 112.244 97.8137 113.392 97.8279H330.679C333.096 97.8711 335.412 98.8071 337.18 100.456C338.948 102.104 340.044 104.348 340.257 106.756L350.93 255.02C351.03 256.164 350.888 257.316 350.516 258.402C350.143 259.488 349.547 260.484 348.766 261.326C347.985 262.168 347.037 262.837 345.982 263.29C344.927 263.744 343.789 263.972 342.641 263.959Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                        fill="#407BFF"
                      />
                      <path
                        opacity="0.5"
                        d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                        fill="white"
                      />
                      <path
                        d="M331.835 102.292H114.548H113.818C108.268 102.749 109.404 111.2 115.005 111.2H332.657C338.268 111.2 338.187 102.749 332.566 102.292H331.835Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M120.21 106.756C120.231 107.018 120.198 107.281 120.111 107.529C120.024 107.776 119.887 108.003 119.707 108.194C119.527 108.386 119.309 108.537 119.068 108.639C118.826 108.741 118.565 108.791 118.303 108.786C117.751 108.778 117.222 108.566 116.818 108.191C116.413 107.817 116.161 107.306 116.111 106.756C116.09 106.496 116.123 106.233 116.209 105.986C116.296 105.739 116.432 105.513 116.611 105.322C116.79 105.131 117.006 104.979 117.247 104.877C117.488 104.774 117.747 104.723 118.008 104.727C118.562 104.732 119.093 104.943 119.5 105.318C119.907 105.693 120.16 106.205 120.21 106.756Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M127.18 106.756C127.202 107.018 127.168 107.281 127.081 107.529C126.995 107.776 126.857 108.003 126.677 108.194C126.497 108.386 126.28 108.537 126.038 108.639C125.796 108.741 125.535 108.791 125.273 108.786C124.721 108.778 124.192 108.566 123.788 108.191C123.383 107.817 123.131 107.306 123.081 106.756C123.06 106.496 123.094 106.233 123.18 105.986C123.266 105.739 123.403 105.513 123.581 105.322C123.76 105.131 123.976 104.979 124.217 104.877C124.458 104.774 124.717 104.723 124.979 104.727C125.532 104.732 126.063 104.943 126.47 105.318C126.877 105.693 127.13 106.205 127.18 106.756Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M134.141 106.756C134.162 107.017 134.128 107.279 134.042 107.526C133.956 107.773 133.819 108 133.641 108.191C133.462 108.382 133.246 108.533 133.005 108.636C132.764 108.738 132.505 108.789 132.243 108.786C131.691 108.78 131.161 108.569 130.756 108.194C130.351 107.819 130.1 107.306 130.052 106.756C130.029 106.495 130.061 106.232 130.147 105.985C130.232 105.737 130.369 105.51 130.548 105.319C130.727 105.127 130.944 104.976 131.185 104.874C131.427 104.772 131.687 104.722 131.949 104.727C132.5 104.735 133.029 104.947 133.434 105.321C133.839 105.696 134.09 106.207 134.141 106.756Z"
                        fill="#FAFAFA"
                      />
                      <path
                        d="M337.71 249.166H129.869C128.991 249.151 128.15 248.811 127.509 248.211C126.867 247.611 126.472 246.794 126.399 245.919L117.623 123.994C117.584 123.576 117.634 123.154 117.771 122.757C117.907 122.359 118.127 121.995 118.414 121.689C118.702 121.383 119.052 121.142 119.44 120.981C119.829 120.821 120.247 120.745 120.667 120.758H328.558C329.436 120.77 330.277 121.108 330.918 121.706C331.56 122.305 331.955 123.12 332.028 123.994L340.815 245.919C340.853 246.343 340.8 246.77 340.659 247.171C340.519 247.573 340.294 247.94 340 248.247C339.706 248.555 339.349 248.796 338.954 248.954C338.559 249.113 338.135 249.185 337.71 249.166Z"
                        fill="white"
                      />
                      <path
                        d="M250.13 202.718L246.741 155.721L236.493 149.552H208.277L212.113 202.718H250.13Z"
                        fill="white"
                      />
                      <path
                        d="M250.13 203.204H212.113C211.987 203.207 211.865 203.161 211.772 203.076C211.679 202.991 211.623 202.873 211.615 202.748L207.79 149.583C207.785 149.516 207.795 149.449 207.817 149.386C207.84 149.323 207.876 149.266 207.922 149.218C207.967 149.167 208.022 149.127 208.083 149.099C208.144 149.071 208.21 149.056 208.277 149.055H236.493C236.582 149.058 236.669 149.083 236.747 149.126L246.995 155.295C247.064 155.334 247.122 155.39 247.164 155.457C247.207 155.525 247.232 155.601 247.238 155.681L250.607 202.677C250.614 202.745 250.605 202.814 250.583 202.879C250.56 202.944 250.523 203.003 250.475 203.052C250.43 203.1 250.377 203.138 250.318 203.164C250.259 203.19 250.194 203.204 250.13 203.204ZM212.589 202.19H249.592L246.264 155.975L236.402 150.039H208.805L212.589 202.19Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M246.741 155.721L236.493 149.552L240.258 157.73L246.741 155.721Z"
                        fill="#EBEBEB"
                      />
                      <path
                        d="M240.258 158.217C240.164 158.216 240.073 158.19 239.994 158.139C239.915 158.089 239.851 158.017 239.811 157.933L236.047 149.755C236.003 149.659 235.99 149.552 236.01 149.448C236.03 149.345 236.082 149.25 236.159 149.177C236.239 149.108 236.339 149.066 236.445 149.057C236.55 149.048 236.656 149.072 236.747 149.126L246.995 155.295C247.077 155.345 247.144 155.417 247.187 155.503C247.23 155.589 247.248 155.686 247.238 155.782C247.225 155.875 247.186 155.963 247.125 156.035C247.064 156.107 246.983 156.16 246.893 156.188L240.4 158.217H240.258ZM237.61 150.79L240.522 157.131L245.595 155.579L237.61 150.79Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M224.227 173.497C224.242 173.773 224.201 174.049 224.106 174.308C224.011 174.567 223.863 174.804 223.674 175.004C223.484 175.205 223.255 175.364 223.001 175.473C222.747 175.582 222.474 175.638 222.198 175.638C221.619 175.627 221.064 175.403 220.64 175.008C220.217 174.612 219.955 174.074 219.905 173.497C219.879 173.218 219.912 172.937 220.003 172.673C220.094 172.408 220.241 172.166 220.433 171.962C220.625 171.759 220.858 171.599 221.117 171.492C221.376 171.386 221.654 171.336 221.934 171.346C222.514 171.359 223.069 171.585 223.492 171.982C223.915 172.379 224.177 172.919 224.227 173.497Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M238.127 173.497C238.152 173.775 238.117 174.054 238.025 174.318C237.933 174.581 237.787 174.822 237.595 175.025C237.403 175.227 237.17 175.386 236.912 175.492C236.654 175.598 236.377 175.647 236.098 175.638C235.518 175.627 234.961 175.403 234.536 175.008C234.111 174.613 233.847 174.075 233.795 173.497C233.778 173.22 233.818 172.943 233.913 172.683C234.007 172.422 234.154 172.184 234.344 171.983C234.534 171.781 234.764 171.621 235.018 171.511C235.273 171.402 235.547 171.345 235.824 171.346C236.406 171.354 236.965 171.579 237.391 171.976C237.817 172.374 238.079 172.916 238.127 173.497Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M242.064 187.437C241.94 187.435 241.822 187.387 241.732 187.303C241.642 187.219 241.587 187.104 241.577 186.981C241.323 183.521 235.905 180.711 229.503 180.711C225.252 180.711 221.437 181.979 219.55 184.008C219.162 184.382 218.858 184.834 218.659 185.334C218.459 185.835 218.369 186.372 218.393 186.91C218.398 186.976 218.389 187.043 218.368 187.107C218.347 187.17 218.313 187.229 218.27 187.279C218.181 187.381 218.056 187.443 217.921 187.453C217.787 187.462 217.654 187.418 217.552 187.329C217.45 187.241 217.388 187.115 217.378 186.981C217.348 186.308 217.459 185.637 217.704 185.009C217.948 184.382 218.321 183.813 218.799 183.338C220.828 181.116 224.957 179.726 229.472 179.726C236.504 179.726 242.236 182.882 242.52 186.91C242.524 186.974 242.516 187.038 242.495 187.099C242.474 187.159 242.442 187.215 242.399 187.263C242.357 187.311 242.305 187.351 242.248 187.379C242.19 187.407 242.128 187.423 242.064 187.427V187.437Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M216.283 169.154C216.159 169.152 216.04 169.105 215.948 169.023C215.856 168.929 215.804 168.804 215.804 168.672C215.804 168.541 215.856 168.416 215.948 168.322L218.109 165.999C218.202 165.91 218.325 165.86 218.454 165.86C218.583 165.86 218.706 165.91 218.799 165.999C218.844 166.044 218.88 166.098 218.905 166.157C218.929 166.216 218.942 166.28 218.942 166.344C218.942 166.408 218.929 166.472 218.905 166.531C218.88 166.59 218.844 166.644 218.799 166.689L216.638 169.012C216.591 169.059 216.536 169.095 216.475 169.12C216.414 169.144 216.348 169.156 216.283 169.154Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M241.049 169.154C240.926 169.149 240.808 169.102 240.714 169.023L238.228 166.699C238.181 166.654 238.144 166.599 238.119 166.539C238.093 166.479 238.08 166.414 238.08 166.349C238.08 166.284 238.093 166.219 238.119 166.159C238.144 166.099 238.181 166.044 238.228 165.999C238.321 165.91 238.445 165.86 238.573 165.86C238.702 165.86 238.826 165.91 238.918 165.999L241.404 168.322C241.449 168.368 241.485 168.421 241.51 168.481C241.535 168.54 241.547 168.603 241.547 168.667C241.547 168.732 241.535 168.795 241.51 168.854C241.485 168.913 241.449 168.967 241.404 169.012C241.308 169.102 241.181 169.153 241.049 169.154Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M205.213 213.219H207.506L210.814 217.622L210.499 213.219H212.813L213.381 221.173H211.037L207.75 216.8L208.064 221.173H205.751L205.213 213.219Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M214.416 217.196C214.338 216.655 214.375 216.105 214.525 215.58C214.676 215.055 214.936 214.569 215.288 214.152C215.674 213.773 216.136 213.48 216.643 213.293C217.15 213.106 217.691 213.028 218.231 213.066C219.374 213.004 220.497 213.386 221.366 214.132C222.162 214.924 222.623 215.992 222.654 217.115C222.738 217.889 222.634 218.672 222.35 219.397C222.087 219.982 221.647 220.468 221.092 220.787C220.426 221.145 219.676 221.316 218.921 221.285C218.144 221.309 217.372 221.164 216.658 220.858C216.033 220.558 215.505 220.087 215.136 219.499C214.701 218.806 214.453 218.013 214.416 217.196ZM216.881 217.196C216.872 217.818 217.072 218.426 217.45 218.921C217.608 219.095 217.803 219.233 218.02 219.324C218.237 219.415 218.472 219.457 218.708 219.448C218.933 219.464 219.158 219.425 219.365 219.335C219.571 219.245 219.753 219.106 219.895 218.931C220.186 218.376 220.283 217.74 220.169 217.125C220.173 216.528 219.972 215.948 219.6 215.481C219.438 215.31 219.241 215.175 219.022 215.086C218.803 214.997 218.568 214.955 218.332 214.964C218.111 214.954 217.892 214.997 217.691 215.089C217.49 215.18 217.313 215.318 217.176 215.491C216.879 216.014 216.774 216.624 216.881 217.216V217.196Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M227.423 213.219H231.076C231.678 213.2 232.278 213.3 232.841 213.513C233.287 213.7 233.683 213.988 233.998 214.355C234.317 214.727 234.562 215.158 234.718 215.623C234.882 216.123 234.985 216.641 235.022 217.165C235.1 217.829 235.049 218.5 234.87 219.144C234.73 219.589 234.483 219.994 234.15 220.321C233.872 220.615 233.522 220.832 233.135 220.95C232.663 221.087 232.176 221.162 231.684 221.173H228.042L227.423 213.219ZM230.01 215.025L230.325 219.367H230.923C231.294 219.391 231.665 219.332 232.009 219.195C232.236 219.063 232.403 218.848 232.476 218.596C232.592 218.146 232.619 217.677 232.557 217.216C232.576 216.597 232.387 215.99 232.019 215.491C231.831 215.321 231.609 215.191 231.368 215.111C231.127 215.031 230.872 215.001 230.619 215.025H230.01Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M240.917 219.854H238.127L237.833 221.173H235.327L237.741 213.219H240.461L244.022 221.173H241.445L240.917 219.854ZM240.278 218.139L239.202 215.278L238.533 218.139H240.278Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M242.865 213.219H250.333L250.475 215.187H247.969L248.395 221.173H245.939L245.513 215.187H243.007L242.865 213.219Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M256.055 219.854H253.265L252.971 221.173H250.464L252.879 213.219H255.558L259.109 221.173H256.542L256.055 219.854ZM255.416 218.139L254.33 215.278L253.65 218.139H255.416Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M358.855 119.804C359.758 119.348 360.884 118.79 361.838 118.211C362.791 117.633 363.867 117.075 364.881 116.466C366.86 115.239 368.869 114.031 370.766 112.692C374.577 110.085 378.149 107.144 381.44 103.905C381.856 103.52 382.221 103.094 382.617 102.678L383.195 102.059L383.479 101.754L383.621 101.592C383.479 101.866 383.621 101.785 383.621 101.521C383.71 101.159 383.761 100.788 383.773 100.415C383.75 98.2579 383.502 96.1088 383.033 94.0029C382.13 89.4575 380.76 84.77 379.411 80.184L383.347 78.4592C385.832 82.8592 387.907 87.4781 389.546 92.2578C390.467 94.8408 391.054 97.5311 391.292 100.263C391.354 101.112 391.326 101.966 391.21 102.81C391.06 104.003 390.636 105.145 389.973 106.148L389.8 106.381L389.668 106.543L389.516 106.736L389.201 107.122L388.572 107.883C388.156 108.38 387.751 108.897 387.304 109.374C383.834 113.224 379.964 116.694 375.758 119.723C373.729 121.225 371.578 122.665 369.376 123.974C368.291 124.634 367.185 125.263 366.058 125.882C364.932 126.501 363.836 127.069 362.538 127.678L358.855 119.804Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M349.825 358.337C350.584 358.318 351.34 358.216 352.077 358.033C352.115 358.021 352.148 358 352.175 357.972C352.202 357.943 352.22 357.908 352.229 357.87C352.234 357.831 352.228 357.792 352.212 357.756C352.196 357.72 352.17 357.69 352.138 357.667C351.844 357.475 349.267 355.811 348.272 356.257C348.162 356.309 348.068 356.388 347.998 356.488C347.929 356.588 347.887 356.704 347.877 356.825C347.837 357.017 347.847 357.215 347.906 357.402C347.964 357.588 348.07 357.756 348.212 357.891C348.678 358.23 349.251 358.388 349.825 358.337ZM351.499 357.749C350.028 358.043 348.912 357.992 348.455 357.596C348.364 357.503 348.297 357.388 348.262 357.262C348.226 357.136 348.223 357.004 348.252 356.876C348.256 356.822 348.274 356.77 348.304 356.726C348.334 356.681 348.376 356.646 348.425 356.622C348.962 356.389 350.454 357.14 351.499 357.749Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M352.067 358.033H352.168C352.198 358.014 352.223 357.989 352.241 357.959C352.258 357.929 352.268 357.895 352.27 357.86C352.27 357.748 352.27 355.303 351.336 354.492C351.225 354.384 351.09 354.303 350.942 354.256C350.794 354.208 350.638 354.195 350.484 354.218C350.324 354.219 350.169 354.275 350.046 354.377C349.922 354.478 349.837 354.619 349.804 354.776C349.612 355.79 351.154 357.566 351.965 358.033C351.999 358.042 352.034 358.042 352.067 358.033ZM350.616 354.593C350.781 354.594 350.94 354.655 351.062 354.766C351.598 355.555 351.874 356.491 351.854 357.444C351.042 356.795 350.078 355.415 350.2 354.837C350.2 354.745 350.271 354.624 350.525 354.593H350.616Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M351.275 94.429C350.261 99.502 348.232 109.648 351.732 113.047C351.732 113.047 350.352 118.12 340.987 118.12C330.679 118.12 336.067 113.047 336.067 113.047C341.688 111.708 341.535 107.538 340.561 103.611L351.275 94.429Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M334.088 115.076C332.475 115.299 333.855 111.109 334.504 110.673C336.026 109.658 355.669 108.248 355.537 110.673C355.456 111.687 354.969 113.716 354.117 114.386C353.264 115.056 348.212 112.966 334.088 115.076Z"
                        fill="#263238"
                      />
                      <path
                        d="M337.294 113.635C336.006 114.072 336.128 109.851 336.564 109.344C337.579 108.167 353.477 104.088 353.944 106.391C354.127 107.406 354.218 109.435 353.67 110.155C353.122 110.876 348.455 109.689 337.294 113.635Z"
                        fill="#263238"
                      />
                      <path
                        d="M331.379 85.3382C331.315 85.341 331.252 85.3286 331.194 85.3022C331.135 85.2757 331.084 85.2359 331.044 85.186C330.735 84.7867 330.336 84.4658 329.879 84.249C329.423 84.0323 328.922 83.9257 328.417 83.938C328.364 83.9451 328.31 83.9414 328.259 83.9272C328.207 83.9131 328.159 83.8887 328.118 83.8555C328.076 83.8223 328.042 83.7811 328.016 83.7343C327.991 83.6874 327.975 83.636 327.97 83.5829C327.961 83.4784 327.994 83.3746 328.06 83.2933C328.126 83.2119 328.221 83.1594 328.325 83.1466C328.964 83.114 329.601 83.2363 330.182 83.5031C330.763 83.7699 331.272 84.1732 331.663 84.6787C331.731 84.761 331.764 84.8668 331.755 84.9732C331.745 85.0795 331.694 85.1779 331.613 85.2469C331.544 85.2963 331.463 85.3277 331.379 85.3382Z"
                        fill="#263238"
                      />
                      <path
                        d="M329.411 90.2994C328.95 91.9181 328.268 93.4649 327.382 94.8956C327.754 95.1095 328.168 95.2395 328.596 95.2763C329.023 95.3131 329.454 95.2559 329.857 95.1087L329.411 90.2994Z"
                        fill="#FF5652"
                      />
                      <path
                        d="M329.908 89.0719C329.979 89.7517 329.665 90.3401 329.218 90.3807C328.772 90.4213 328.356 89.914 328.295 89.2241C328.234 88.5342 328.538 87.9558 328.975 87.9152C329.411 87.8747 329.837 88.382 329.908 89.0719Z"
                        fill="#263238"
                      />
                      <path
                        d="M329.178 87.9355L327.493 87.621C327.493 87.621 328.457 88.8182 329.178 87.9355Z"
                        fill="#263238"
                      />
                      <path
                        d="M361.909 357.84H353.406L354.076 338.157H362.578L361.909 357.84Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M352.737 356.856H362.284C362.449 356.852 362.609 356.908 362.734 357.015C362.86 357.122 362.941 357.271 362.964 357.434L364.049 364.983C364.071 365.174 364.052 365.367 363.993 365.55C363.934 365.733 363.838 365.901 363.709 366.044C363.581 366.187 363.424 366.301 363.248 366.378C363.072 366.456 362.882 366.496 362.69 366.494C359.362 366.444 357.759 366.241 353.558 366.241C350.971 366.241 347.197 366.515 343.636 366.515C340.074 366.515 339.871 362.984 341.363 362.669C348.019 361.229 349.074 359.26 351.316 357.373C351.715 357.041 352.217 356.859 352.737 356.856Z"
                        fill="#263238"
                      />
                      <g opacity="0.2">
                        <path
                          opacity="0.2"
                          d="M362.578 338.157H354.076L353.731 348.303H362.233L362.578 338.157Z"
                          fill="black"
                        />
                      </g>
                      <path
                        d="M328.092 124.796C322.889 122.773 317.793 120.487 312.822 117.947C307.688 115.439 302.797 112.46 298.212 109.049C296.987 108.09 295.828 107.049 294.742 105.935C294.458 105.63 294.174 105.346 293.9 104.991C293.578 104.628 293.28 104.245 293.007 103.844C292.259 102.754 291.792 101.496 291.648 100.182C291.536 98.9357 291.706 97.6804 292.145 96.5089C292.496 95.5673 292.978 94.6794 293.575 93.871C294.555 92.5307 295.712 91.3293 297.015 90.2996C299.314 88.469 301.796 86.8812 304.421 85.5614C305.679 84.8917 306.958 84.2931 308.257 83.7351C309.555 83.1771 310.834 82.6495 312.224 82.1726L314.019 86.0788C309.596 88.869 305.01 91.9432 301.641 95.3726C300.888 96.1364 300.224 96.9841 299.663 97.8989C299.176 98.7005 299.186 99.2991 299.267 99.2484C299.348 99.1976 299.267 99.2483 299.409 99.3498L299.815 99.7861C299.967 99.9687 300.18 100.151 300.373 100.344C301.233 101.135 302.144 101.867 303.102 102.536C305.197 104.019 307.379 105.374 309.636 106.594C311.919 107.872 314.273 109.08 316.668 110.236C321.457 112.529 326.408 114.731 331.268 116.74L328.092 124.796Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M316.556 83.3495L317.956 80.3057L311.544 78.1243C311.544 78.1243 309.515 84.1206 311.919 86.8803C312.924 86.7221 313.874 86.3166 314.683 85.7002C315.493 85.0839 316.136 84.2761 316.556 83.3495Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M317.926 73.7209L312.822 72.2396L311.544 78.0837L317.926 80.3057V73.7209Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M383.875 80.5999L384.615 73.4977L378.041 75.0805C378.041 75.0805 377.939 81.7565 381.419 82.8117L383.875 80.5999Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M381.45 68.4956L377.158 70.4944L378.041 75.0296L384.615 73.4773L381.45 68.4956Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M352.615 84.4656C352.93 92.897 353.234 96.4582 349.429 101.176C343.697 108.278 333.277 106.807 330.456 98.6396C327.92 91.2939 327.838 78.7433 335.712 74.6037C337.443 73.6833 339.38 73.2205 341.34 73.2592C343.3 73.2979 345.218 73.8368 346.911 74.8247C348.605 75.8126 350.017 77.2169 351.016 78.9042C352.014 80.5914 352.564 82.5058 352.615 84.4656Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M348.942 101.166C357.221 97.5844 362.659 90.0054 360.366 78.2563C358.165 66.984 350.555 65.868 347.41 68.2016C344.265 70.5351 336.422 67.0551 331.714 71.012C323.597 77.8809 331.268 85.2164 335.285 89.6502C337.68 94.5812 340.825 104.666 348.942 101.166Z"
                        fill="#263238"
                      />
                      <path
                        d="M345.503 76.2372C346.513 77.5328 347.88 78.5043 349.436 79.0317C350.991 79.5592 352.667 79.6196 354.257 79.2054C355.847 78.7911 357.28 77.9205 358.381 76.7009C359.481 75.4813 360.201 73.9661 360.45 72.3424C360.699 70.7187 360.468 69.0576 359.784 67.564C359.1 66.0704 357.993 64.8098 356.601 63.9379C355.209 63.0659 353.592 62.6206 351.949 62.6571C350.307 62.6936 348.711 63.2102 347.359 64.1432C345.51 65.5011 344.275 67.5379 343.927 69.8058C343.579 72.0737 344.146 74.387 345.503 76.2372Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M347.654 68.9929C346.466 62.195 352.889 56.9597 361.493 59.4861C370.097 62.0124 365.551 69.6321 363.776 75.7197C362 81.8073 366.647 87.6108 368.575 82.9741C370.502 78.3374 367.256 76.8865 367.256 76.8865C367.256 76.8865 376.387 79.2505 367.905 89.5487C359.423 99.8469 351.742 88.4732 353.822 81.7667C355.507 76.3792 348.78 75.4153 347.654 68.9929Z"
                        fill="#263238"
                      />
                      <path
                        d="M339.06 71.5599C335.133 69.5307 328.488 67.8566 324.703 74.2283C322.917 77.2721 323.607 81.3305 323.607 81.3305L335.164 82.0915L339.06 71.5599Z"
                        fill="#263238"
                      />
                      <path
                        d="M322.248 79.3215C322.18 79.3163 322.116 79.2849 322.071 79.2338C322.025 79.1827 322.001 79.1159 322.004 79.0476C322.004 78.8751 322.299 74.7964 324.764 72.2396C330.72 66.0506 337.7 71.225 339.689 72.8991C339.732 72.9444 339.756 73.0038 339.758 73.0661C339.76 73.1284 339.739 73.1891 339.699 73.2368C339.658 73.2845 339.602 73.3157 339.541 73.3245C339.479 73.3333 339.416 73.3192 339.364 73.2847C337.447 71.641 330.77 66.7202 325.16 72.5846C322.826 75.0095 322.542 79.0375 322.542 79.078C322.541 79.1142 322.532 79.1497 322.517 79.1823C322.501 79.2148 322.478 79.2435 322.45 79.2666C322.422 79.2897 322.39 79.3065 322.355 79.316C322.32 79.3254 322.284 79.3273 322.248 79.3215Z"
                        fill="#263238"
                      />
                      <path
                        d="M336.696 89.2849C336.65 90.8812 336.059 92.4136 335.022 93.6274C333.621 95.2711 331.978 94.4594 331.643 92.6128C331.308 90.9793 331.643 88.1486 333.408 87.1644C335.174 86.1803 336.716 87.4384 336.696 89.2849Z"
                        fill="#FFB573"
                      />
                      <path
                        d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                        fill="#263238"
                      />
                      <path
                        opacity="0.1"
                        d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                        fill="white"
                      />
                      <path
                        opacity="0.3"
                        d="M340.967 193.282C345.026 211.088 341.789 239.132 339.567 251.479C337.213 232.729 336.026 208.43 335.438 190.603C337.538 187.214 339.526 186.991 340.967 193.282Z"
                        fill="black"
                      />
                      <path
                        d="M350.728 346.568H365.49L366.261 341.393L350.646 340.865L350.728 346.568Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                        fill="#407BFF"
                      />
                      <path
                        opacity="0.4"
                        d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                        fill="black"
                      />
                      <path
                        d="M346.334 343.25C346.351 343.221 346.36 343.187 346.36 343.153C346.36 343.12 346.351 343.086 346.334 343.057C346.315 343.018 346.284 342.986 346.246 342.966C346.208 342.946 346.164 342.939 346.121 342.945C345.695 343.016 341.941 343.605 341.434 344.68C341.38 344.778 341.351 344.888 341.351 345C341.351 345.112 341.38 345.222 341.434 345.32C341.521 345.48 341.646 345.617 341.798 345.717C341.95 345.818 342.125 345.88 342.306 345.898C343.534 346.02 345.35 344.315 346.263 343.28L346.334 343.25ZM341.83 344.812C342.174 344.244 344.123 343.717 345.604 343.443C344.265 344.802 343.088 345.563 342.398 345.472C342.278 345.46 342.164 345.418 342.065 345.351C341.965 345.284 341.885 345.193 341.83 345.086C341.807 345.048 341.796 345.004 341.796 344.959C341.796 344.915 341.807 344.871 341.83 344.833C341.83 344.833 341.819 344.822 341.83 344.812Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M355.192 339.648L347.42 343.108L343.96 335.894L339.435 326.458L338.898 325.362L346.669 321.903L347.268 323.14L351.651 332.282L355.192 339.648Z"
                        fill="#FFB573"
                      />
                      <path
                        opacity="0.2"
                        d="M351.651 332.282L343.96 335.894L339.435 326.458L347.268 323.141L351.651 332.282Z"
                        fill="black"
                      />
                      <path
                        d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                        fill="#263238"
                      />
                      <path
                        opacity="0.1"
                        d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                        fill="white"
                      />
                      <path
                        d="M346.04 342.022L353.751 336.411C353.881 336.31 354.044 336.26 354.209 336.271C354.374 336.282 354.529 336.354 354.644 336.472L359.971 341.941C360.1 342.084 360.198 342.252 360.257 342.435C360.317 342.618 360.338 342.812 360.317 343.003C360.297 343.195 360.237 343.38 360.141 343.546C360.044 343.713 359.914 343.857 359.758 343.97C357.028 345.878 355.618 346.669 352.229 349.135C350.139 350.656 345.979 354.015 343.098 356.115C340.216 358.215 338.025 355.476 339.039 354.35C343.585 349.277 344.539 346.131 345.249 343.28C345.359 342.782 345.639 342.337 346.04 342.022Z"
                        fill="#263238"
                      />
                      <path
                        d="M339.963 335.519L353.386 329.38L351.671 323.912L337.294 330.466L339.963 335.519Z"
                        fill="#407BFF"
                      />
                      <path
                        d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                        fill="#407BFF"
                      />
                      <path
                        opacity="0.4"
                        d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                        fill="black"
                      />
                      <path
                        d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                        fill="#407BFF"
                      />
                      <path
                        opacity="0.4"
                        d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                        fill="black"
                      />
                      <path
                        d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                        fill="#407BFF"
                      />
                      <path
                        opacity="0.3"
                        d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                        fill="white"
                      />
                      <path
                        d="M356.125 168.424H357.059C357.252 168.424 357.394 168.323 357.373 168.211L356.937 164.153C356.937 164.031 356.765 163.939 356.582 163.939H355.638C355.456 163.939 355.314 164.031 355.324 164.153L355.76 168.211C355.75 168.302 355.912 168.424 356.125 168.424Z"
                        fill="#263238"
                      />
                      <path
                        d="M333.408 168.424H334.342C334.524 168.424 334.667 168.323 334.656 168.211L334.22 164.153C334.22 164.031 334.048 163.939 333.855 163.939H332.921C332.729 163.939 332.597 164.031 332.607 164.153L333.043 168.211C333.053 168.302 333.216 168.424 333.408 168.424Z"
                        fill="#263238"
                      />
                    </svg>
                    <p className="text-center">No Data Available</p>
                  </div>
                )}
                {settings.features.assessment &&
                  assessmentSubjectDistribution.length > 0 && (
                    <div className="col-lg col-md-6 mt-md-0 mt-3 ">
                      <Chart
                        series={assessmentChartOptions.series}
                        options={assessmentChartOptions.options}
                        type="donut"
                        width="100%"
                        height="400"
                      />
                    </div>
                  )}
                {settings.features.assessment &&
                  !assessmentSubjectDistribution.length && (
                    <div className="col-lg col-md-6 mt-md-0 mt-3 ">
                      <svg
                        width="200"
                        height="200"
                        viewBox="0 0 508 378"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M507.301 332.18H0V332.434H507.301V332.18Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M456.469 348.505H422.866V348.759H456.469V348.505Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M336.056 351.265H327.24V351.519H336.056V351.265Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M421.851 339.09H402.381V339.344H421.851V339.09Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M97.0466 340.794H53.226V341.048H97.0466V340.794Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M112.509 340.794H106.087V341.048H112.509V340.794Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M228.438 345.076H133.39V345.33H228.438V345.076Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M240.461 286.929H44.5511C43.0163 286.927 41.5454 286.315 40.4611 285.229C39.3768 284.143 38.7678 282.671 38.7678 281.136V5.74264C38.7812 4.21671 39.3961 2.75767 40.4789 1.68243C41.5617 0.607197 43.0251 0.00261401 44.5511 0H240.461C241.997 0 243.471 0.610372 244.557 1.69684C245.644 2.78331 246.254 4.25688 246.254 5.79337V281.136C246.254 282.672 245.644 284.146 244.557 285.233C243.471 286.319 241.997 286.929 240.461 286.929ZM44.5511 0.202921C43.0836 0.205609 41.6771 0.790441 40.6404 1.82905C39.6037 2.86766 39.0215 4.27517 39.0215 5.74264V281.136C39.0215 282.603 39.6037 284.011 40.6404 285.05C41.6771 286.088 43.0836 286.673 44.5511 286.676H240.461C241.929 286.673 243.336 286.088 244.375 285.05C245.413 284.012 245.998 282.604 246 281.136V5.74264C245.998 4.27424 245.413 2.86675 244.375 1.82843C243.336 0.790111 241.929 0.205603 240.461 0.202921H44.5511Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M459.929 286.929H264.009C262.474 286.927 261.002 286.315 259.916 285.23C258.83 284.144 258.219 282.672 258.216 281.136V5.74264C258.232 4.21578 258.849 2.75675 259.934 1.6818C261.018 0.606842 262.482 0.0025855 264.009 0H459.929C461.453 0.00528049 462.914 0.611043 463.995 1.68599C465.075 2.76094 465.689 4.21846 465.702 5.74264V281.136C465.702 282.669 465.095 284.139 464.012 285.225C462.93 286.311 461.462 286.924 459.929 286.929ZM264.009 0.202921C262.541 0.205603 261.134 0.790111 260.095 1.82843C259.057 2.86675 258.472 4.27424 258.47 5.74264V281.136C258.472 282.604 259.057 284.012 260.095 285.05C261.134 286.088 262.541 286.673 264.009 286.676H459.929C461.397 286.673 462.805 286.088 463.843 285.05C464.882 284.012 465.466 282.604 465.469 281.136V5.74264C465.466 4.27424 464.882 2.86675 463.843 1.82843C462.805 0.790111 461.397 0.205603 459.929 0.202921H264.009Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M293.92 120.798L433.712 120.798V29.251L293.92 29.251V120.798Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M289.648 120.798L431.713 120.798V29.251L289.648 29.251V120.798Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M293.92 138.757L433.712 138.757V120.788L293.92 120.788V138.757Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M282.556 138.757L424.621 138.757V120.788L282.556 120.788V138.757Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M425.747 114.833V35.2271L295.625 35.2271V114.833L425.747 114.833Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M396.405 114.823L379.786 35.2271H353.853L370.472 114.823H396.405Z"
                          fill="white"
                        />
                        <path
                          d="M422.988 108.887C423.044 108.887 423.101 108.876 423.153 108.854C423.205 108.832 423.253 108.799 423.293 108.759C423.332 108.718 423.363 108.67 423.384 108.617C423.405 108.564 423.415 108.508 423.414 108.451V39.1129C423.414 38.9999 423.369 38.8915 423.289 38.8116C423.209 38.7317 423.101 38.6868 422.988 38.6868C422.931 38.6854 422.875 38.6955 422.823 38.7164C422.77 38.7373 422.723 38.7686 422.683 38.8085C422.643 38.8483 422.612 38.8959 422.591 38.9482C422.57 39.0005 422.56 39.0566 422.561 39.1129V108.451C422.56 108.508 422.57 108.564 422.591 108.617C422.612 108.67 422.643 108.718 422.683 108.759C422.722 108.799 422.77 108.832 422.822 108.854C422.874 108.876 422.931 108.887 422.988 108.887Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M364.902 114.823L348.282 35.2271H338.167L354.796 114.823H364.902Z"
                          fill="white"
                        />
                        <path
                          d="M296.385 114.833V35.2271H295.624V114.833H296.385Z"
                          fill="#E6E6E6"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 44.2264H428.04L428.588 37.5402H288.796L288.248 44.2264Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 55.1843H428.04L428.588 48.5082H288.796L288.248 55.1843Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 66.1419H428.04L428.588 59.4658H288.796L288.248 66.1419Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 77.1098H428.04L428.588 70.4236H288.796L288.248 77.1098Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 88.0674H428.04L428.588 81.3812H288.796L288.248 88.0674Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M288.248 99.0251H428.04L428.588 92.3389H288.796L288.248 99.0251Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M413.643 265.602H384.331V271.386H413.643V265.602Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M329.045 332.18H334.453V199.197H329.045V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 271.386H384.321V265.602H310.296V271.386Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 297.228H384.331V303.011H413.643V297.228Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 303.001H384.321V297.218H310.296V303.001Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 202.362H384.331V208.146H413.643V202.362Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 208.135H384.321V202.352H310.296V208.135Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M413.643 233.977H384.331V239.761H413.643V233.977Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M310.296 239.76H384.321V233.977H310.296V239.76Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M403.081 332.18H408.489V199.197H403.081V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M378.913 332.18H384.321V199.197H378.913V332.18Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M310.296 332.18H315.703V199.197H310.296V332.18Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M66.3348 332.18H121.712L121.712 224.744H66.3348L66.3348 332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M81.1175 332.181H66.3246V317.347H96.6206L81.1175 332.181Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M217.307 332.18H272.684V224.744H217.307V332.18Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M66.3347 327.067H230.223V224.734H66.3347V327.067Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M215.43 332.181H230.213V317.347H199.927L215.43 332.181Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M77.7996 288.482H218.748V262.873H77.7996V288.482Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M77.7996 319.559H218.748V293.95H77.7996V319.559Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M191.963 265.613H104.595C103.363 265.613 102.181 265.123 101.309 264.252C100.438 263.38 99.9483 262.198 99.9483 260.966V260.651H196.599V260.966C196.599 262.196 196.111 263.377 195.242 264.248C194.373 265.119 193.193 265.61 191.963 265.613Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M77.7996 257.394H218.748V231.786L77.7996 231.786V257.394Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M191.963 234.525H104.595C103.363 234.525 102.181 234.036 101.309 233.164C100.438 232.293 99.9483 231.111 99.9483 229.878V229.564H196.599V229.878C196.599 231.109 196.111 232.289 195.242 233.161C194.373 234.032 193.193 234.522 191.963 234.525Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M191.963 296.7H104.595C103.363 296.7 102.181 296.211 101.309 295.339C100.438 294.468 99.9483 293.286 99.9483 292.053V291.739H196.599V292.053C196.599 293.284 196.111 294.464 195.242 295.335C194.373 296.207 193.193 296.697 191.963 296.7Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M75.1516 120.798L214.943 120.798V29.251L75.1516 29.251V120.798Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M70.8903 120.798L212.955 120.798V29.251L70.8903 29.251V120.798Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M75.1516 138.757L214.943 138.757V120.788L75.1516 120.788V138.757Z"
                          fill="#E6E6E6"
                        />
                        <path
                          d="M63.7778 138.757L205.842 138.757V120.788L63.7778 120.788V138.757Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M206.979 114.833V35.2271L76.8561 35.2271V114.833L206.979 114.833Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M177.637 114.823L161.017 35.2271H135.084L151.703 114.823H177.637Z"
                          fill="white"
                        />
                        <path
                          d="M204.209 108.887C204.266 108.887 204.322 108.876 204.374 108.854C204.427 108.832 204.474 108.799 204.514 108.759C204.553 108.718 204.585 108.67 204.605 108.617C204.626 108.564 204.636 108.508 204.635 108.451V39.1129C204.636 39.0566 204.626 39.0005 204.605 38.9482C204.584 38.8959 204.553 38.8483 204.513 38.8085C204.473 38.7686 204.426 38.7373 204.373 38.7164C204.321 38.6955 204.265 38.6854 204.209 38.6868C204.096 38.6868 203.987 38.7317 203.907 38.8116C203.827 38.8915 203.783 38.9999 203.783 39.1129V108.451C203.781 108.508 203.791 108.564 203.812 108.617C203.833 108.67 203.864 108.718 203.904 108.759C203.943 108.799 203.991 108.832 204.043 108.854C204.096 108.876 204.152 108.887 204.209 108.887Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M146.133 114.823L129.514 35.2271H119.398L136.017 114.823H146.133Z"
                          fill="white"
                        />
                        <path
                          d="M77.6171 114.833V35.2271H76.8561V114.833H77.6171Z"
                          fill="#E6E6E6"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 44.2264H209.262L209.809 37.5402H70.0176L69.4697 44.2264Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 48.0008H209.262L209.809 41.3146H70.0176L69.4697 48.0008Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 51.7649H209.262L209.809 45.0889H70.0176L69.4697 51.7649Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 55.5394H209.262L209.809 48.8531H70.0176L69.4697 55.5394Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 59.3034H209.262L209.809 52.6273H70.0176L69.4697 59.3034Z"
                          fill="#EBEBEB"
                        />
                        <path
                          opacity="0.6"
                          d="M69.4697 63.0777H209.262L209.809 56.3915H70.0176L69.4697 63.0777Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M97.4221 221.457H102.252V167.592H97.4221V221.457Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M98.0308 221.427H99.4005V167.561H98.0308V221.427Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M99.9687 221.427H100.506V167.561H99.9687V221.427Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M117.724 224.745H81.9697C81.9697 223.55 82.4443 222.404 83.2891 221.559C84.1339 220.714 85.2798 220.24 86.4745 220.24H113.209C114.404 220.24 115.55 220.714 116.395 221.559C117.239 222.404 117.714 223.55 117.714 224.745H117.724Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M91.1517 201.033C91.5196 201.031 91.8716 200.883 92.1317 200.623C92.3918 200.363 92.5391 200.011 92.5417 199.643V164.366C92.5417 163.997 92.3953 163.643 92.1346 163.383C91.8739 163.122 91.5204 162.976 91.1517 162.976C90.9683 162.974 90.7865 163.009 90.6167 163.078C90.4469 163.148 90.2924 163.25 90.1623 163.379C90.0321 163.508 89.9288 163.662 89.8584 163.831C89.7879 164.001 89.7516 164.182 89.7516 164.366V199.684C89.7647 200.046 89.918 200.39 90.1792 200.641C90.4404 200.893 90.789 201.034 91.1517 201.033Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M78.1953 180.396H121.468L116.486 150.161H83.177L78.1953 180.396Z"
                          fill="#E0E0E0"
                        />
                        <path
                          d="M253.65 378C362.297 378 450.372 372.858 450.372 366.515C450.372 360.172 362.297 355.03 253.65 355.03C145.004 355.03 56.9293 360.172 56.9293 366.515C56.9293 372.858 145.004 378 253.65 378Z"
                          fill="#F5F5F5"
                        />
                        <path
                          d="M105.639 149.511L104.627 149.584L105.975 168.295L106.987 168.222L105.639 149.511Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M107.674 177.882L106.662 177.955L107.17 184.998L108.182 184.925L107.674 177.882Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M342.641 263.959H125.354C122.935 263.915 120.618 262.978 118.85 261.327C117.081 259.677 115.986 257.43 115.776 255.02L105.103 106.756C105.003 105.613 105.145 104.461 105.517 103.376C105.89 102.29 106.486 101.295 107.267 100.454C108.048 99.6128 108.997 98.9446 110.051 98.4923C111.106 98.04 112.244 97.8137 113.392 97.8279H330.679C333.096 97.8711 335.412 98.8071 337.18 100.456C338.948 102.104 340.044 104.348 340.257 106.756L350.93 255.02C351.03 256.164 350.888 257.316 350.516 258.402C350.143 259.488 349.547 260.484 348.766 261.326C347.985 262.168 347.037 262.837 345.982 263.29C344.927 263.744 343.789 263.972 342.641 263.959Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.5"
                          d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                          fill="white"
                        />
                        <path
                          d="M331.835 102.292H114.548H113.818C108.268 102.749 109.404 111.2 115.005 111.2H332.657C338.268 111.2 338.187 102.749 332.566 102.292H331.835Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M120.21 106.756C120.231 107.018 120.198 107.281 120.111 107.529C120.024 107.776 119.887 108.003 119.707 108.194C119.527 108.386 119.309 108.537 119.068 108.639C118.826 108.741 118.565 108.791 118.303 108.786C117.751 108.778 117.222 108.566 116.818 108.191C116.413 107.817 116.161 107.306 116.111 106.756C116.09 106.496 116.123 106.233 116.209 105.986C116.296 105.739 116.432 105.513 116.611 105.322C116.79 105.131 117.006 104.979 117.247 104.877C117.488 104.774 117.747 104.723 118.008 104.727C118.562 104.732 119.093 104.943 119.5 105.318C119.907 105.693 120.16 106.205 120.21 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M127.18 106.756C127.202 107.018 127.168 107.281 127.081 107.529C126.995 107.776 126.857 108.003 126.677 108.194C126.497 108.386 126.28 108.537 126.038 108.639C125.796 108.741 125.535 108.791 125.273 108.786C124.721 108.778 124.192 108.566 123.788 108.191C123.383 107.817 123.131 107.306 123.081 106.756C123.06 106.496 123.094 106.233 123.18 105.986C123.266 105.739 123.403 105.513 123.581 105.322C123.76 105.131 123.976 104.979 124.217 104.877C124.458 104.774 124.717 104.723 124.979 104.727C125.532 104.732 126.063 104.943 126.47 105.318C126.877 105.693 127.13 106.205 127.18 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M134.141 106.756C134.162 107.017 134.128 107.279 134.042 107.526C133.956 107.773 133.819 108 133.641 108.191C133.462 108.382 133.246 108.533 133.005 108.636C132.764 108.738 132.505 108.789 132.243 108.786C131.691 108.78 131.161 108.569 130.756 108.194C130.351 107.819 130.1 107.306 130.052 106.756C130.029 106.495 130.061 106.232 130.147 105.985C130.232 105.737 130.369 105.51 130.548 105.319C130.727 105.127 130.944 104.976 131.185 104.874C131.427 104.772 131.687 104.722 131.949 104.727C132.5 104.735 133.029 104.947 133.434 105.321C133.839 105.696 134.09 106.207 134.141 106.756Z"
                          fill="#FAFAFA"
                        />
                        <path
                          d="M337.71 249.166H129.869C128.991 249.151 128.15 248.811 127.509 248.211C126.867 247.611 126.472 246.794 126.399 245.919L117.623 123.994C117.584 123.576 117.634 123.154 117.771 122.757C117.907 122.359 118.127 121.995 118.414 121.689C118.702 121.383 119.052 121.142 119.44 120.981C119.829 120.821 120.247 120.745 120.667 120.758H328.558C329.436 120.77 330.277 121.108 330.918 121.706C331.56 122.305 331.955 123.12 332.028 123.994L340.815 245.919C340.853 246.343 340.8 246.77 340.659 247.171C340.519 247.573 340.294 247.94 340 248.247C339.706 248.555 339.349 248.796 338.954 248.954C338.559 249.113 338.135 249.185 337.71 249.166Z"
                          fill="white"
                        />
                        <path
                          d="M250.13 202.718L246.741 155.721L236.493 149.552H208.277L212.113 202.718H250.13Z"
                          fill="white"
                        />
                        <path
                          d="M250.13 203.204H212.113C211.987 203.207 211.865 203.161 211.772 203.076C211.679 202.991 211.623 202.873 211.615 202.748L207.79 149.583C207.785 149.516 207.795 149.449 207.817 149.386C207.84 149.323 207.876 149.266 207.922 149.218C207.967 149.167 208.022 149.127 208.083 149.099C208.144 149.071 208.21 149.056 208.277 149.055H236.493C236.582 149.058 236.669 149.083 236.747 149.126L246.995 155.295C247.064 155.334 247.122 155.39 247.164 155.457C247.207 155.525 247.232 155.601 247.238 155.681L250.607 202.677C250.614 202.745 250.605 202.814 250.583 202.879C250.56 202.944 250.523 203.003 250.475 203.052C250.43 203.1 250.377 203.138 250.318 203.164C250.259 203.19 250.194 203.204 250.13 203.204ZM212.589 202.19H249.592L246.264 155.975L236.402 150.039H208.805L212.589 202.19Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M246.741 155.721L236.493 149.552L240.258 157.73L246.741 155.721Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M240.258 158.217C240.164 158.216 240.073 158.19 239.994 158.139C239.915 158.089 239.851 158.017 239.811 157.933L236.047 149.755C236.003 149.659 235.99 149.552 236.01 149.448C236.03 149.345 236.082 149.25 236.159 149.177C236.239 149.108 236.339 149.066 236.445 149.057C236.55 149.048 236.656 149.072 236.747 149.126L246.995 155.295C247.077 155.345 247.144 155.417 247.187 155.503C247.23 155.589 247.248 155.686 247.238 155.782C247.225 155.875 247.186 155.963 247.125 156.035C247.064 156.107 246.983 156.16 246.893 156.188L240.4 158.217H240.258ZM237.61 150.79L240.522 157.131L245.595 155.579L237.61 150.79Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M224.227 173.497C224.242 173.773 224.201 174.049 224.106 174.308C224.011 174.567 223.863 174.804 223.674 175.004C223.484 175.205 223.255 175.364 223.001 175.473C222.747 175.582 222.474 175.638 222.198 175.638C221.619 175.627 221.064 175.403 220.64 175.008C220.217 174.612 219.955 174.074 219.905 173.497C219.879 173.218 219.912 172.937 220.003 172.673C220.094 172.408 220.241 172.166 220.433 171.962C220.625 171.759 220.858 171.599 221.117 171.492C221.376 171.386 221.654 171.336 221.934 171.346C222.514 171.359 223.069 171.585 223.492 171.982C223.915 172.379 224.177 172.919 224.227 173.497Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M238.127 173.497C238.152 173.775 238.117 174.054 238.025 174.318C237.933 174.581 237.787 174.822 237.595 175.025C237.403 175.227 237.17 175.386 236.912 175.492C236.654 175.598 236.377 175.647 236.098 175.638C235.518 175.627 234.961 175.403 234.536 175.008C234.111 174.613 233.847 174.075 233.795 173.497C233.778 173.22 233.818 172.943 233.913 172.683C234.007 172.422 234.154 172.184 234.344 171.983C234.534 171.781 234.764 171.621 235.018 171.511C235.273 171.402 235.547 171.345 235.824 171.346C236.406 171.354 236.965 171.579 237.391 171.976C237.817 172.374 238.079 172.916 238.127 173.497Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M242.064 187.437C241.94 187.435 241.822 187.387 241.732 187.303C241.642 187.219 241.587 187.104 241.577 186.981C241.323 183.521 235.905 180.711 229.503 180.711C225.252 180.711 221.437 181.979 219.55 184.008C219.162 184.382 218.858 184.834 218.659 185.334C218.459 185.835 218.369 186.372 218.393 186.91C218.398 186.976 218.389 187.043 218.368 187.107C218.347 187.17 218.313 187.229 218.27 187.279C218.181 187.381 218.056 187.443 217.921 187.453C217.787 187.462 217.654 187.418 217.552 187.329C217.45 187.241 217.388 187.115 217.378 186.981C217.348 186.308 217.459 185.637 217.704 185.009C217.948 184.382 218.321 183.813 218.799 183.338C220.828 181.116 224.957 179.726 229.472 179.726C236.504 179.726 242.236 182.882 242.52 186.91C242.524 186.974 242.516 187.038 242.495 187.099C242.474 187.159 242.442 187.215 242.399 187.263C242.357 187.311 242.305 187.351 242.248 187.379C242.19 187.407 242.128 187.423 242.064 187.427V187.437Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M216.283 169.154C216.159 169.152 216.04 169.105 215.948 169.023C215.856 168.929 215.804 168.804 215.804 168.672C215.804 168.541 215.856 168.416 215.948 168.322L218.109 165.999C218.202 165.91 218.325 165.86 218.454 165.86C218.583 165.86 218.706 165.91 218.799 165.999C218.844 166.044 218.88 166.098 218.905 166.157C218.929 166.216 218.942 166.28 218.942 166.344C218.942 166.408 218.929 166.472 218.905 166.531C218.88 166.59 218.844 166.644 218.799 166.689L216.638 169.012C216.591 169.059 216.536 169.095 216.475 169.12C216.414 169.144 216.348 169.156 216.283 169.154Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M241.049 169.154C240.926 169.149 240.808 169.102 240.714 169.023L238.228 166.699C238.181 166.654 238.144 166.599 238.119 166.539C238.093 166.479 238.08 166.414 238.08 166.349C238.08 166.284 238.093 166.219 238.119 166.159C238.144 166.099 238.181 166.044 238.228 165.999C238.321 165.91 238.445 165.86 238.573 165.86C238.702 165.86 238.826 165.91 238.918 165.999L241.404 168.322C241.449 168.368 241.485 168.421 241.51 168.481C241.535 168.54 241.547 168.603 241.547 168.667C241.547 168.732 241.535 168.795 241.51 168.854C241.485 168.913 241.449 168.967 241.404 169.012C241.308 169.102 241.181 169.153 241.049 169.154Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M205.213 213.219H207.506L210.814 217.622L210.499 213.219H212.813L213.381 221.173H211.037L207.75 216.8L208.064 221.173H205.751L205.213 213.219Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M214.416 217.196C214.338 216.655 214.375 216.105 214.525 215.58C214.676 215.055 214.936 214.569 215.288 214.152C215.674 213.773 216.136 213.48 216.643 213.293C217.15 213.106 217.691 213.028 218.231 213.066C219.374 213.004 220.497 213.386 221.366 214.132C222.162 214.924 222.623 215.992 222.654 217.115C222.738 217.889 222.634 218.672 222.35 219.397C222.087 219.982 221.647 220.468 221.092 220.787C220.426 221.145 219.676 221.316 218.921 221.285C218.144 221.309 217.372 221.164 216.658 220.858C216.033 220.558 215.505 220.087 215.136 219.499C214.701 218.806 214.453 218.013 214.416 217.196ZM216.881 217.196C216.872 217.818 217.072 218.426 217.45 218.921C217.608 219.095 217.803 219.233 218.02 219.324C218.237 219.415 218.472 219.457 218.708 219.448C218.933 219.464 219.158 219.425 219.365 219.335C219.571 219.245 219.753 219.106 219.895 218.931C220.186 218.376 220.283 217.74 220.169 217.125C220.173 216.528 219.972 215.948 219.6 215.481C219.438 215.31 219.241 215.175 219.022 215.086C218.803 214.997 218.568 214.955 218.332 214.964C218.111 214.954 217.892 214.997 217.691 215.089C217.49 215.18 217.313 215.318 217.176 215.491C216.879 216.014 216.774 216.624 216.881 217.216V217.196Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M227.423 213.219H231.076C231.678 213.2 232.278 213.3 232.841 213.513C233.287 213.7 233.683 213.988 233.998 214.355C234.317 214.727 234.562 215.158 234.718 215.623C234.882 216.123 234.985 216.641 235.022 217.165C235.1 217.829 235.049 218.5 234.87 219.144C234.73 219.589 234.483 219.994 234.15 220.321C233.872 220.615 233.522 220.832 233.135 220.95C232.663 221.087 232.176 221.162 231.684 221.173H228.042L227.423 213.219ZM230.01 215.025L230.325 219.367H230.923C231.294 219.391 231.665 219.332 232.009 219.195C232.236 219.063 232.403 218.848 232.476 218.596C232.592 218.146 232.619 217.677 232.557 217.216C232.576 216.597 232.387 215.99 232.019 215.491C231.831 215.321 231.609 215.191 231.368 215.111C231.127 215.031 230.872 215.001 230.619 215.025H230.01Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M240.917 219.854H238.127L237.833 221.173H235.327L237.741 213.219H240.461L244.022 221.173H241.445L240.917 219.854ZM240.278 218.139L239.202 215.278L238.533 218.139H240.278Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M242.865 213.219H250.333L250.475 215.187H247.969L248.395 221.173H245.939L245.513 215.187H243.007L242.865 213.219Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M256.055 219.854H253.265L252.971 221.173H250.464L252.879 213.219H255.558L259.109 221.173H256.542L256.055 219.854ZM255.416 218.139L254.33 215.278L253.65 218.139H255.416Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M358.855 119.804C359.758 119.348 360.884 118.79 361.838 118.211C362.791 117.633 363.867 117.075 364.881 116.466C366.86 115.239 368.869 114.031 370.766 112.692C374.577 110.085 378.149 107.144 381.44 103.905C381.856 103.52 382.221 103.094 382.617 102.678L383.195 102.059L383.479 101.754L383.621 101.592C383.479 101.866 383.621 101.785 383.621 101.521C383.71 101.159 383.761 100.788 383.773 100.415C383.75 98.2579 383.502 96.1088 383.033 94.0029C382.13 89.4575 380.76 84.77 379.411 80.184L383.347 78.4592C385.832 82.8592 387.907 87.4781 389.546 92.2578C390.467 94.8408 391.054 97.5311 391.292 100.263C391.354 101.112 391.326 101.966 391.21 102.81C391.06 104.003 390.636 105.145 389.973 106.148L389.8 106.381L389.668 106.543L389.516 106.736L389.201 107.122L388.572 107.883C388.156 108.38 387.751 108.897 387.304 109.374C383.834 113.224 379.964 116.694 375.758 119.723C373.729 121.225 371.578 122.665 369.376 123.974C368.291 124.634 367.185 125.263 366.058 125.882C364.932 126.501 363.836 127.069 362.538 127.678L358.855 119.804Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M349.825 358.337C350.584 358.318 351.34 358.216 352.077 358.033C352.115 358.021 352.148 358 352.175 357.972C352.202 357.943 352.22 357.908 352.229 357.87C352.234 357.831 352.228 357.792 352.212 357.756C352.196 357.72 352.17 357.69 352.138 357.667C351.844 357.475 349.267 355.811 348.272 356.257C348.162 356.309 348.068 356.388 347.998 356.488C347.929 356.588 347.887 356.704 347.877 356.825C347.837 357.017 347.847 357.215 347.906 357.402C347.964 357.588 348.07 357.756 348.212 357.891C348.678 358.23 349.251 358.388 349.825 358.337ZM351.499 357.749C350.028 358.043 348.912 357.992 348.455 357.596C348.364 357.503 348.297 357.388 348.262 357.262C348.226 357.136 348.223 357.004 348.252 356.876C348.256 356.822 348.274 356.77 348.304 356.726C348.334 356.681 348.376 356.646 348.425 356.622C348.962 356.389 350.454 357.14 351.499 357.749Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M352.067 358.033H352.168C352.198 358.014 352.223 357.989 352.241 357.959C352.258 357.929 352.268 357.895 352.27 357.86C352.27 357.748 352.27 355.303 351.336 354.492C351.225 354.384 351.09 354.303 350.942 354.256C350.794 354.208 350.638 354.195 350.484 354.218C350.324 354.219 350.169 354.275 350.046 354.377C349.922 354.478 349.837 354.619 349.804 354.776C349.612 355.79 351.154 357.566 351.965 358.033C351.999 358.042 352.034 358.042 352.067 358.033ZM350.616 354.593C350.781 354.594 350.94 354.655 351.062 354.766C351.598 355.555 351.874 356.491 351.854 357.444C351.042 356.795 350.078 355.415 350.2 354.837C350.2 354.745 350.271 354.624 350.525 354.593H350.616Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M351.275 94.429C350.261 99.502 348.232 109.648 351.732 113.047C351.732 113.047 350.352 118.12 340.987 118.12C330.679 118.12 336.067 113.047 336.067 113.047C341.688 111.708 341.535 107.538 340.561 103.611L351.275 94.429Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M334.088 115.076C332.475 115.299 333.855 111.109 334.504 110.673C336.026 109.658 355.669 108.248 355.537 110.673C355.456 111.687 354.969 113.716 354.117 114.386C353.264 115.056 348.212 112.966 334.088 115.076Z"
                          fill="#263238"
                        />
                        <path
                          d="M337.294 113.635C336.006 114.072 336.128 109.851 336.564 109.344C337.579 108.167 353.477 104.088 353.944 106.391C354.127 107.406 354.218 109.435 353.67 110.155C353.122 110.876 348.455 109.689 337.294 113.635Z"
                          fill="#263238"
                        />
                        <path
                          d="M331.379 85.3382C331.315 85.341 331.252 85.3286 331.194 85.3022C331.135 85.2757 331.084 85.2359 331.044 85.186C330.735 84.7867 330.336 84.4658 329.879 84.249C329.423 84.0323 328.922 83.9257 328.417 83.938C328.364 83.9451 328.31 83.9414 328.259 83.9272C328.207 83.9131 328.159 83.8887 328.118 83.8555C328.076 83.8223 328.042 83.7811 328.016 83.7343C327.991 83.6874 327.975 83.636 327.97 83.5829C327.961 83.4784 327.994 83.3746 328.06 83.2933C328.126 83.2119 328.221 83.1594 328.325 83.1466C328.964 83.114 329.601 83.2363 330.182 83.5031C330.763 83.7699 331.272 84.1732 331.663 84.6787C331.731 84.761 331.764 84.8668 331.755 84.9732C331.745 85.0795 331.694 85.1779 331.613 85.2469C331.544 85.2963 331.463 85.3277 331.379 85.3382Z"
                          fill="#263238"
                        />
                        <path
                          d="M329.411 90.2994C328.95 91.9181 328.268 93.4649 327.382 94.8956C327.754 95.1095 328.168 95.2395 328.596 95.2763C329.023 95.3131 329.454 95.2559 329.857 95.1087L329.411 90.2994Z"
                          fill="#FF5652"
                        />
                        <path
                          d="M329.908 89.0719C329.979 89.7517 329.665 90.3401 329.218 90.3807C328.772 90.4213 328.356 89.914 328.295 89.2241C328.234 88.5342 328.538 87.9558 328.975 87.9152C329.411 87.8747 329.837 88.382 329.908 89.0719Z"
                          fill="#263238"
                        />
                        <path
                          d="M329.178 87.9355L327.493 87.621C327.493 87.621 328.457 88.8182 329.178 87.9355Z"
                          fill="#263238"
                        />
                        <path
                          d="M361.909 357.84H353.406L354.076 338.157H362.578L361.909 357.84Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M352.737 356.856H362.284C362.449 356.852 362.609 356.908 362.734 357.015C362.86 357.122 362.941 357.271 362.964 357.434L364.049 364.983C364.071 365.174 364.052 365.367 363.993 365.55C363.934 365.733 363.838 365.901 363.709 366.044C363.581 366.187 363.424 366.301 363.248 366.378C363.072 366.456 362.882 366.496 362.69 366.494C359.362 366.444 357.759 366.241 353.558 366.241C350.971 366.241 347.197 366.515 343.636 366.515C340.074 366.515 339.871 362.984 341.363 362.669C348.019 361.229 349.074 359.26 351.316 357.373C351.715 357.041 352.217 356.859 352.737 356.856Z"
                          fill="#263238"
                        />
                        <g opacity="0.2">
                          <path
                            opacity="0.2"
                            d="M362.578 338.157H354.076L353.731 348.303H362.233L362.578 338.157Z"
                            fill="black"
                          />
                        </g>
                        <path
                          d="M328.092 124.796C322.889 122.773 317.793 120.487 312.822 117.947C307.688 115.439 302.797 112.46 298.212 109.049C296.987 108.09 295.828 107.049 294.742 105.935C294.458 105.63 294.174 105.346 293.9 104.991C293.578 104.628 293.28 104.245 293.007 103.844C292.259 102.754 291.792 101.496 291.648 100.182C291.536 98.9357 291.706 97.6804 292.145 96.5089C292.496 95.5673 292.978 94.6794 293.575 93.871C294.555 92.5307 295.712 91.3293 297.015 90.2996C299.314 88.469 301.796 86.8812 304.421 85.5614C305.679 84.8917 306.958 84.2931 308.257 83.7351C309.555 83.1771 310.834 82.6495 312.224 82.1726L314.019 86.0788C309.596 88.869 305.01 91.9432 301.641 95.3726C300.888 96.1364 300.224 96.9841 299.663 97.8989C299.176 98.7005 299.186 99.2991 299.267 99.2484C299.348 99.1976 299.267 99.2483 299.409 99.3498L299.815 99.7861C299.967 99.9687 300.18 100.151 300.373 100.344C301.233 101.135 302.144 101.867 303.102 102.536C305.197 104.019 307.379 105.374 309.636 106.594C311.919 107.872 314.273 109.08 316.668 110.236C321.457 112.529 326.408 114.731 331.268 116.74L328.092 124.796Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M316.556 83.3495L317.956 80.3057L311.544 78.1243C311.544 78.1243 309.515 84.1206 311.919 86.8803C312.924 86.7221 313.874 86.3166 314.683 85.7002C315.493 85.0839 316.136 84.2761 316.556 83.3495Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M317.926 73.7209L312.822 72.2396L311.544 78.0837L317.926 80.3057V73.7209Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M383.875 80.5999L384.615 73.4977L378.041 75.0805C378.041 75.0805 377.939 81.7565 381.419 82.8117L383.875 80.5999Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M381.45 68.4956L377.158 70.4944L378.041 75.0296L384.615 73.4773L381.45 68.4956Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M352.615 84.4656C352.93 92.897 353.234 96.4582 349.429 101.176C343.697 108.278 333.277 106.807 330.456 98.6396C327.92 91.2939 327.838 78.7433 335.712 74.6037C337.443 73.6833 339.38 73.2205 341.34 73.2592C343.3 73.2979 345.218 73.8368 346.911 74.8247C348.605 75.8126 350.017 77.2169 351.016 78.9042C352.014 80.5914 352.564 82.5058 352.615 84.4656Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M348.942 101.166C357.221 97.5844 362.659 90.0054 360.366 78.2563C358.165 66.984 350.555 65.868 347.41 68.2016C344.265 70.5351 336.422 67.0551 331.714 71.012C323.597 77.8809 331.268 85.2164 335.285 89.6502C337.68 94.5812 340.825 104.666 348.942 101.166Z"
                          fill="#263238"
                        />
                        <path
                          d="M345.503 76.2372C346.513 77.5328 347.88 78.5043 349.436 79.0317C350.991 79.5592 352.667 79.6196 354.257 79.2054C355.847 78.7911 357.28 77.9205 358.381 76.7009C359.481 75.4813 360.201 73.9661 360.45 72.3424C360.699 70.7187 360.468 69.0576 359.784 67.564C359.1 66.0704 357.993 64.8098 356.601 63.9379C355.209 63.0659 353.592 62.6206 351.949 62.6571C350.307 62.6936 348.711 63.2102 347.359 64.1432C345.51 65.5011 344.275 67.5379 343.927 69.8058C343.579 72.0737 344.146 74.387 345.503 76.2372Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M347.654 68.9929C346.466 62.195 352.889 56.9597 361.493 59.4861C370.097 62.0124 365.551 69.6321 363.776 75.7197C362 81.8073 366.647 87.6108 368.575 82.9741C370.502 78.3374 367.256 76.8865 367.256 76.8865C367.256 76.8865 376.387 79.2505 367.905 89.5487C359.423 99.8469 351.742 88.4732 353.822 81.7667C355.507 76.3792 348.78 75.4153 347.654 68.9929Z"
                          fill="#263238"
                        />
                        <path
                          d="M339.06 71.5599C335.133 69.5307 328.488 67.8566 324.703 74.2283C322.917 77.2721 323.607 81.3305 323.607 81.3305L335.164 82.0915L339.06 71.5599Z"
                          fill="#263238"
                        />
                        <path
                          d="M322.248 79.3215C322.18 79.3163 322.116 79.2849 322.071 79.2338C322.025 79.1827 322.001 79.1159 322.004 79.0476C322.004 78.8751 322.299 74.7964 324.764 72.2396C330.72 66.0506 337.7 71.225 339.689 72.8991C339.732 72.9444 339.756 73.0038 339.758 73.0661C339.76 73.1284 339.739 73.1891 339.699 73.2368C339.658 73.2845 339.602 73.3157 339.541 73.3245C339.479 73.3333 339.416 73.3192 339.364 73.2847C337.447 71.641 330.77 66.7202 325.16 72.5846C322.826 75.0095 322.542 79.0375 322.542 79.078C322.541 79.1142 322.532 79.1497 322.517 79.1823C322.501 79.2148 322.478 79.2435 322.45 79.2666C322.422 79.2897 322.39 79.3065 322.355 79.316C322.32 79.3254 322.284 79.3273 322.248 79.3215Z"
                          fill="#263238"
                        />
                        <path
                          d="M336.696 89.2849C336.65 90.8812 336.059 92.4136 335.022 93.6274C333.621 95.2711 331.978 94.4594 331.643 92.6128C331.308 90.9793 331.643 88.1486 333.408 87.1644C335.174 86.1803 336.716 87.4384 336.696 89.2849Z"
                          fill="#FFB573"
                        />
                        <path
                          d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                          fill="#263238"
                        />
                        <path
                          opacity="0.1"
                          d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                          fill="white"
                        />
                        <path
                          opacity="0.3"
                          d="M340.967 193.282C345.026 211.088 341.789 239.132 339.567 251.479C337.213 232.729 336.026 208.43 335.438 190.603C337.538 187.214 339.526 186.991 340.967 193.282Z"
                          fill="black"
                        />
                        <path
                          d="M350.728 346.568H365.49L366.261 341.393L350.646 340.865L350.728 346.568Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                          fill="black"
                        />
                        <path
                          d="M346.334 343.25C346.351 343.221 346.36 343.187 346.36 343.153C346.36 343.12 346.351 343.086 346.334 343.057C346.315 343.018 346.284 342.986 346.246 342.966C346.208 342.946 346.164 342.939 346.121 342.945C345.695 343.016 341.941 343.605 341.434 344.68C341.38 344.778 341.351 344.888 341.351 345C341.351 345.112 341.38 345.222 341.434 345.32C341.521 345.48 341.646 345.617 341.798 345.717C341.95 345.818 342.125 345.88 342.306 345.898C343.534 346.02 345.35 344.315 346.263 343.28L346.334 343.25ZM341.83 344.812C342.174 344.244 344.123 343.717 345.604 343.443C344.265 344.802 343.088 345.563 342.398 345.472C342.278 345.46 342.164 345.418 342.065 345.351C341.965 345.284 341.885 345.193 341.83 345.086C341.807 345.048 341.796 345.004 341.796 344.959C341.796 344.915 341.807 344.871 341.83 344.833C341.83 344.833 341.819 344.822 341.83 344.812Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M355.192 339.648L347.42 343.108L343.96 335.894L339.435 326.458L338.898 325.362L346.669 321.903L347.268 323.14L351.651 332.282L355.192 339.648Z"
                          fill="#FFB573"
                        />
                        <path
                          opacity="0.2"
                          d="M351.651 332.282L343.96 335.894L339.435 326.458L347.268 323.141L351.651 332.282Z"
                          fill="black"
                        />
                        <path
                          d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                          fill="#263238"
                        />
                        <path
                          opacity="0.1"
                          d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                          fill="white"
                        />
                        <path
                          d="M346.04 342.022L353.751 336.411C353.881 336.31 354.044 336.26 354.209 336.271C354.374 336.282 354.529 336.354 354.644 336.472L359.971 341.941C360.1 342.084 360.198 342.252 360.257 342.435C360.317 342.618 360.338 342.812 360.317 343.003C360.297 343.195 360.237 343.38 360.141 343.546C360.044 343.713 359.914 343.857 359.758 343.97C357.028 345.878 355.618 346.669 352.229 349.135C350.139 350.656 345.979 354.015 343.098 356.115C340.216 358.215 338.025 355.476 339.039 354.35C343.585 349.277 344.539 346.131 345.249 343.28C345.359 342.782 345.639 342.337 346.04 342.022Z"
                          fill="#263238"
                        />
                        <path
                          d="M339.963 335.519L353.386 329.38L351.671 323.912L337.294 330.466L339.963 335.519Z"
                          fill="#407BFF"
                        />
                        <path
                          d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                          fill="black"
                        />
                        <path
                          d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.4"
                          d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                          fill="black"
                        />
                        <path
                          d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                          fill="#407BFF"
                        />
                        <path
                          opacity="0.3"
                          d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                          fill="white"
                        />
                        <path
                          d="M356.125 168.424H357.059C357.252 168.424 357.394 168.323 357.373 168.211L356.937 164.153C356.937 164.031 356.765 163.939 356.582 163.939H355.638C355.456 163.939 355.314 164.031 355.324 164.153L355.76 168.211C355.75 168.302 355.912 168.424 356.125 168.424Z"
                          fill="#263238"
                        />
                        <path
                          d="M333.408 168.424H334.342C334.524 168.424 334.667 168.323 334.656 168.211L334.22 164.153C334.22 164.031 334.048 163.939 333.855 163.939H332.921C332.729 163.939 332.597 164.031 332.607 164.153L333.043 168.211C333.053 168.302 333.216 168.424 333.408 168.424Z"
                          fill="#263238"
                        />
                      </svg>
                      <p className="text-center">No Data Available</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
          <div className="chart_boxes">
            <div className="admin-header">
              <span className="admin-head">Trends And Patterns</span>
              <p className="admin-head2">
                Number of student enrolling in module
              </p>
            </div>
            <div className="chart_area_body">
              <div className="row justify-content-end align-items-center">
                <div className="col-auto">
                  {/* <NavPills change={changeTab} settings={settings} /> */}
                  <ul className="nav nav-pills" role="tablist">
                    {settings.features.course && (
                      <li
                        className="nav-item"
                        role="tab"
                        onClick={() => changeTab("course")}
                      >
                        <a
                          className="nav-link active"
                          data-toggle="pill"
                          href="#course"
                        >
                          Course
                        </a>
                      </li>
                    )}
                    {settings.features.assessment && (
                      <li
                        className="nav-item"
                        role="tab"
                        onClick={() => changeTab("assessment")}
                      >
                        <a
                          className={`nav-link ${
                            !settings.features.course ? "active" : ""
                          }`}
                          data-toggle="pill"
                          href="#assessment"
                        >
                          Assessment
                        </a>
                      </li>
                    )}
                    {settings.features.testseries && (
                      <li
                        className="nav-item"
                        role="tab"
                        onClick={() => changeTab("testseries")}
                      >
                        <a
                          className="nav-link"
                          data-toggle="pill"
                          href="#test-series"
                        >
                          Test Series
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="col-auto">
                  <select
                    className="form-control"
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      filterData(e.target.value);
                    }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="tab-content mt-3">
                {settings.features.course && (
                  <div id="course" className="tab-pane active">
                    {courseTrend.length ? (
                      <Chart
                        series={chartOptions.series}
                        options={chartOptions.options}
                        type="donut"
                        width="100%"
                        height="400"
                      />
                    ) : (
                      <div className="text-center">
                        <svg
                          width="508"
                          height="378"
                          viewBox="0 0 508 378"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M507.301 332.18H0V332.434H507.301V332.18Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M456.469 348.505H422.866V348.759H456.469V348.505Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M336.056 351.265H327.24V351.519H336.056V351.265Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M421.851 339.09H402.381V339.344H421.851V339.09Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M97.0466 340.794H53.226V341.048H97.0466V340.794Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M112.509 340.794H106.087V341.048H112.509V340.794Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M228.438 345.076H133.39V345.33H228.438V345.076Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M240.461 286.929H44.5511C43.0163 286.927 41.5454 286.315 40.4611 285.229C39.3768 284.143 38.7678 282.671 38.7678 281.136V5.74264C38.7812 4.21671 39.3961 2.75767 40.4789 1.68243C41.5617 0.607197 43.0251 0.00261401 44.5511 0H240.461C241.997 0 243.471 0.610372 244.557 1.69684C245.644 2.78331 246.254 4.25688 246.254 5.79337V281.136C246.254 282.672 245.644 284.146 244.557 285.233C243.471 286.319 241.997 286.929 240.461 286.929ZM44.5511 0.202921C43.0836 0.205609 41.6771 0.790441 40.6404 1.82905C39.6037 2.86766 39.0215 4.27517 39.0215 5.74264V281.136C39.0215 282.603 39.6037 284.011 40.6404 285.05C41.6771 286.088 43.0836 286.673 44.5511 286.676H240.461C241.929 286.673 243.336 286.088 244.375 285.05C245.413 284.012 245.998 282.604 246 281.136V5.74264C245.998 4.27424 245.413 2.86675 244.375 1.82843C243.336 0.790111 241.929 0.205603 240.461 0.202921H44.5511Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M459.929 286.929H264.009C262.474 286.927 261.002 286.315 259.916 285.23C258.83 284.144 258.219 282.672 258.216 281.136V5.74264C258.232 4.21578 258.849 2.75675 259.934 1.6818C261.018 0.606842 262.482 0.0025855 264.009 0H459.929C461.453 0.00528049 462.914 0.611043 463.995 1.68599C465.075 2.76094 465.689 4.21846 465.702 5.74264V281.136C465.702 282.669 465.095 284.139 464.012 285.225C462.93 286.311 461.462 286.924 459.929 286.929ZM264.009 0.202921C262.541 0.205603 261.134 0.790111 260.095 1.82843C259.057 2.86675 258.472 4.27424 258.47 5.74264V281.136C258.472 282.604 259.057 284.012 260.095 285.05C261.134 286.088 262.541 286.673 264.009 286.676H459.929C461.397 286.673 462.805 286.088 463.843 285.05C464.882 284.012 465.466 282.604 465.469 281.136V5.74264C465.466 4.27424 464.882 2.86675 463.843 1.82843C462.805 0.790111 461.397 0.205603 459.929 0.202921H264.009Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M293.92 120.798L433.712 120.798V29.251L293.92 29.251V120.798Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M289.648 120.798L431.713 120.798V29.251L289.648 29.251V120.798Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M293.92 138.757L433.712 138.757V120.788L293.92 120.788V138.757Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M282.556 138.757L424.621 138.757V120.788L282.556 120.788V138.757Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M425.747 114.833V35.2271L295.625 35.2271V114.833L425.747 114.833Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M396.405 114.823L379.786 35.2271H353.853L370.472 114.823H396.405Z"
                            fill="white"
                          />
                          <path
                            d="M422.988 108.887C423.044 108.887 423.101 108.876 423.153 108.854C423.205 108.832 423.253 108.799 423.293 108.759C423.332 108.718 423.363 108.67 423.384 108.617C423.405 108.564 423.415 108.508 423.414 108.451V39.1129C423.414 38.9999 423.369 38.8915 423.289 38.8116C423.209 38.7317 423.101 38.6868 422.988 38.6868C422.931 38.6854 422.875 38.6955 422.823 38.7164C422.77 38.7373 422.723 38.7686 422.683 38.8085C422.643 38.8483 422.612 38.8959 422.591 38.9482C422.57 39.0005 422.56 39.0566 422.561 39.1129V108.451C422.56 108.508 422.57 108.564 422.591 108.617C422.612 108.67 422.643 108.718 422.683 108.759C422.722 108.799 422.77 108.832 422.822 108.854C422.874 108.876 422.931 108.887 422.988 108.887Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M364.902 114.823L348.282 35.2271H338.167L354.796 114.823H364.902Z"
                            fill="white"
                          />
                          <path
                            d="M296.385 114.833V35.2271H295.624V114.833H296.385Z"
                            fill="#E6E6E6"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 44.2264H428.04L428.588 37.5402H288.796L288.248 44.2264Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 55.1843H428.04L428.588 48.5082H288.796L288.248 55.1843Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 66.1419H428.04L428.588 59.4658H288.796L288.248 66.1419Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 77.1098H428.04L428.588 70.4236H288.796L288.248 77.1098Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 88.0674H428.04L428.588 81.3812H288.796L288.248 88.0674Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 99.0251H428.04L428.588 92.3389H288.796L288.248 99.0251Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M413.643 265.602H384.331V271.386H413.643V265.602Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M329.045 332.18H334.453V199.197H329.045V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 271.386H384.321V265.602H310.296V271.386Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 297.228H384.331V303.011H413.643V297.228Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 303.001H384.321V297.218H310.296V303.001Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 202.362H384.331V208.146H413.643V202.362Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 208.135H384.321V202.352H310.296V208.135Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 233.977H384.331V239.761H413.643V233.977Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 239.76H384.321V233.977H310.296V239.76Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M403.081 332.18H408.489V199.197H403.081V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M378.913 332.18H384.321V199.197H378.913V332.18Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M310.296 332.18H315.703V199.197H310.296V332.18Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M66.3348 332.18H121.712L121.712 224.744H66.3348L66.3348 332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M81.1175 332.181H66.3246V317.347H96.6206L81.1175 332.181Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M217.307 332.18H272.684V224.744H217.307V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M66.3347 327.067H230.223V224.734H66.3347V327.067Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M215.43 332.181H230.213V317.347H199.927L215.43 332.181Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M77.7996 288.482H218.748V262.873H77.7996V288.482Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M77.7996 319.559H218.748V293.95H77.7996V319.559Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M191.963 265.613H104.595C103.363 265.613 102.181 265.123 101.309 264.252C100.438 263.38 99.9483 262.198 99.9483 260.966V260.651H196.599V260.966C196.599 262.196 196.111 263.377 195.242 264.248C194.373 265.119 193.193 265.61 191.963 265.613Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M77.7996 257.394H218.748V231.786L77.7996 231.786V257.394Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M191.963 234.525H104.595C103.363 234.525 102.181 234.036 101.309 233.164C100.438 232.293 99.9483 231.111 99.9483 229.878V229.564H196.599V229.878C196.599 231.109 196.111 232.289 195.242 233.161C194.373 234.032 193.193 234.522 191.963 234.525Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M191.963 296.7H104.595C103.363 296.7 102.181 296.211 101.309 295.339C100.438 294.468 99.9483 293.286 99.9483 292.053V291.739H196.599V292.053C196.599 293.284 196.111 294.464 195.242 295.335C194.373 296.207 193.193 296.697 191.963 296.7Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M75.1516 120.798L214.943 120.798V29.251L75.1516 29.251V120.798Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M70.8903 120.798L212.955 120.798V29.251L70.8903 29.251V120.798Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M75.1516 138.757L214.943 138.757V120.788L75.1516 120.788V138.757Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M63.7778 138.757L205.842 138.757V120.788L63.7778 120.788V138.757Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M206.979 114.833V35.2271L76.8561 35.2271V114.833L206.979 114.833Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M177.637 114.823L161.017 35.2271H135.084L151.703 114.823H177.637Z"
                            fill="white"
                          />
                          <path
                            d="M204.209 108.887C204.266 108.887 204.322 108.876 204.374 108.854C204.427 108.832 204.474 108.799 204.514 108.759C204.553 108.718 204.585 108.67 204.605 108.617C204.626 108.564 204.636 108.508 204.635 108.451V39.1129C204.636 39.0566 204.626 39.0005 204.605 38.9482C204.584 38.8959 204.553 38.8483 204.513 38.8085C204.473 38.7686 204.426 38.7373 204.373 38.7164C204.321 38.6955 204.265 38.6854 204.209 38.6868C204.096 38.6868 203.987 38.7317 203.907 38.8116C203.827 38.8915 203.783 38.9999 203.783 39.1129V108.451C203.781 108.508 203.791 108.564 203.812 108.617C203.833 108.67 203.864 108.718 203.904 108.759C203.943 108.799 203.991 108.832 204.043 108.854C204.096 108.876 204.152 108.887 204.209 108.887Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M146.133 114.823L129.514 35.2271H119.398L136.017 114.823H146.133Z"
                            fill="white"
                          />
                          <path
                            d="M77.6171 114.833V35.2271H76.8561V114.833H77.6171Z"
                            fill="#E6E6E6"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 44.2264H209.262L209.809 37.5402H70.0176L69.4697 44.2264Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 48.0008H209.262L209.809 41.3146H70.0176L69.4697 48.0008Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 51.7649H209.262L209.809 45.0889H70.0176L69.4697 51.7649Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 55.5394H209.262L209.809 48.8531H70.0176L69.4697 55.5394Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 59.3034H209.262L209.809 52.6273H70.0176L69.4697 59.3034Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 63.0777H209.262L209.809 56.3915H70.0176L69.4697 63.0777Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M97.4221 221.457H102.252V167.592H97.4221V221.457Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M98.0308 221.427H99.4005V167.561H98.0308V221.427Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M99.9687 221.427H100.506V167.561H99.9687V221.427Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M117.724 224.745H81.9697C81.9697 223.55 82.4443 222.404 83.2891 221.559C84.1339 220.714 85.2798 220.24 86.4745 220.24H113.209C114.404 220.24 115.55 220.714 116.395 221.559C117.239 222.404 117.714 223.55 117.714 224.745H117.724Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M91.1517 201.033C91.5196 201.031 91.8716 200.883 92.1317 200.623C92.3918 200.363 92.5391 200.011 92.5417 199.643V164.366C92.5417 163.997 92.3953 163.643 92.1346 163.383C91.8739 163.122 91.5204 162.976 91.1517 162.976C90.9683 162.974 90.7865 163.009 90.6167 163.078C90.4469 163.148 90.2924 163.25 90.1623 163.379C90.0321 163.508 89.9288 163.662 89.8584 163.831C89.7879 164.001 89.7516 164.182 89.7516 164.366V199.684C89.7647 200.046 89.918 200.39 90.1792 200.641C90.4404 200.893 90.789 201.034 91.1517 201.033Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M78.1953 180.396H121.468L116.486 150.161H83.177L78.1953 180.396Z"
                            fill="#E0E0E0"
                          />
                          <path
                            d="M253.65 378C362.297 378 450.372 372.858 450.372 366.515C450.372 360.172 362.297 355.03 253.65 355.03C145.004 355.03 56.9293 360.172 56.9293 366.515C56.9293 372.858 145.004 378 253.65 378Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M105.639 149.511L104.627 149.584L105.975 168.295L106.987 168.222L105.639 149.511Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M107.674 177.882L106.662 177.955L107.17 184.998L108.182 184.925L107.674 177.882Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M342.641 263.959H125.354C122.935 263.915 120.618 262.978 118.85 261.327C117.081 259.677 115.986 257.43 115.776 255.02L105.103 106.756C105.003 105.613 105.145 104.461 105.517 103.376C105.89 102.29 106.486 101.295 107.267 100.454C108.048 99.6128 108.997 98.9446 110.051 98.4923C111.106 98.04 112.244 97.8137 113.392 97.8279H330.679C333.096 97.8711 335.412 98.8071 337.18 100.456C338.948 102.104 340.044 104.348 340.257 106.756L350.93 255.02C351.03 256.164 350.888 257.316 350.516 258.402C350.143 259.488 349.547 260.484 348.766 261.326C347.985 262.168 347.037 262.837 345.982 263.29C344.927 263.744 343.789 263.972 342.641 263.959Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.5"
                            d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                            fill="white"
                          />
                          <path
                            d="M331.835 102.292H114.548H113.818C108.268 102.749 109.404 111.2 115.005 111.2H332.657C338.268 111.2 338.187 102.749 332.566 102.292H331.835Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M120.21 106.756C120.231 107.018 120.198 107.281 120.111 107.529C120.024 107.776 119.887 108.003 119.707 108.194C119.527 108.386 119.309 108.537 119.068 108.639C118.826 108.741 118.565 108.791 118.303 108.786C117.751 108.778 117.222 108.566 116.818 108.191C116.413 107.817 116.161 107.306 116.111 106.756C116.09 106.496 116.123 106.233 116.209 105.986C116.296 105.739 116.432 105.513 116.611 105.322C116.79 105.131 117.006 104.979 117.247 104.877C117.488 104.774 117.747 104.723 118.008 104.727C118.562 104.732 119.093 104.943 119.5 105.318C119.907 105.693 120.16 106.205 120.21 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M127.18 106.756C127.202 107.018 127.168 107.281 127.081 107.529C126.995 107.776 126.857 108.003 126.677 108.194C126.497 108.386 126.28 108.537 126.038 108.639C125.796 108.741 125.535 108.791 125.273 108.786C124.721 108.778 124.192 108.566 123.788 108.191C123.383 107.817 123.131 107.306 123.081 106.756C123.06 106.496 123.094 106.233 123.18 105.986C123.266 105.739 123.403 105.513 123.581 105.322C123.76 105.131 123.976 104.979 124.217 104.877C124.458 104.774 124.717 104.723 124.979 104.727C125.532 104.732 126.063 104.943 126.47 105.318C126.877 105.693 127.13 106.205 127.18 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M134.141 106.756C134.162 107.017 134.128 107.279 134.042 107.526C133.956 107.773 133.819 108 133.641 108.191C133.462 108.382 133.246 108.533 133.005 108.636C132.764 108.738 132.505 108.789 132.243 108.786C131.691 108.78 131.161 108.569 130.756 108.194C130.351 107.819 130.1 107.306 130.052 106.756C130.029 106.495 130.061 106.232 130.147 105.985C130.232 105.737 130.369 105.51 130.548 105.319C130.727 105.127 130.944 104.976 131.185 104.874C131.427 104.772 131.687 104.722 131.949 104.727C132.5 104.735 133.029 104.947 133.434 105.321C133.839 105.696 134.09 106.207 134.141 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M337.71 249.166H129.869C128.991 249.151 128.15 248.811 127.509 248.211C126.867 247.611 126.472 246.794 126.399 245.919L117.623 123.994C117.584 123.576 117.634 123.154 117.771 122.757C117.907 122.359 118.127 121.995 118.414 121.689C118.702 121.383 119.052 121.142 119.44 120.981C119.829 120.821 120.247 120.745 120.667 120.758H328.558C329.436 120.77 330.277 121.108 330.918 121.706C331.56 122.305 331.955 123.12 332.028 123.994L340.815 245.919C340.853 246.343 340.8 246.77 340.659 247.171C340.519 247.573 340.294 247.94 340 248.247C339.706 248.555 339.349 248.796 338.954 248.954C338.559 249.113 338.135 249.185 337.71 249.166Z"
                            fill="white"
                          />
                          <path
                            d="M250.13 202.718L246.741 155.721L236.493 149.552H208.277L212.113 202.718H250.13Z"
                            fill="white"
                          />
                          <path
                            d="M250.13 203.204H212.113C211.987 203.207 211.865 203.161 211.772 203.076C211.679 202.991 211.623 202.873 211.615 202.748L207.79 149.583C207.785 149.516 207.795 149.449 207.817 149.386C207.84 149.323 207.876 149.266 207.922 149.218C207.967 149.167 208.022 149.127 208.083 149.099C208.144 149.071 208.21 149.056 208.277 149.055H236.493C236.582 149.058 236.669 149.083 236.747 149.126L246.995 155.295C247.064 155.334 247.122 155.39 247.164 155.457C247.207 155.525 247.232 155.601 247.238 155.681L250.607 202.677C250.614 202.745 250.605 202.814 250.583 202.879C250.56 202.944 250.523 203.003 250.475 203.052C250.43 203.1 250.377 203.138 250.318 203.164C250.259 203.19 250.194 203.204 250.13 203.204ZM212.589 202.19H249.592L246.264 155.975L236.402 150.039H208.805L212.589 202.19Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M246.741 155.721L236.493 149.552L240.258 157.73L246.741 155.721Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M240.258 158.217C240.164 158.216 240.073 158.19 239.994 158.139C239.915 158.089 239.851 158.017 239.811 157.933L236.047 149.755C236.003 149.659 235.99 149.552 236.01 149.448C236.03 149.345 236.082 149.25 236.159 149.177C236.239 149.108 236.339 149.066 236.445 149.057C236.55 149.048 236.656 149.072 236.747 149.126L246.995 155.295C247.077 155.345 247.144 155.417 247.187 155.503C247.23 155.589 247.248 155.686 247.238 155.782C247.225 155.875 247.186 155.963 247.125 156.035C247.064 156.107 246.983 156.16 246.893 156.188L240.4 158.217H240.258ZM237.61 150.79L240.522 157.131L245.595 155.579L237.61 150.79Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M224.227 173.497C224.242 173.773 224.201 174.049 224.106 174.308C224.011 174.567 223.863 174.804 223.674 175.004C223.484 175.205 223.255 175.364 223.001 175.473C222.747 175.582 222.474 175.638 222.198 175.638C221.619 175.627 221.064 175.403 220.64 175.008C220.217 174.612 219.955 174.074 219.905 173.497C219.879 173.218 219.912 172.937 220.003 172.673C220.094 172.408 220.241 172.166 220.433 171.962C220.625 171.759 220.858 171.599 221.117 171.492C221.376 171.386 221.654 171.336 221.934 171.346C222.514 171.359 223.069 171.585 223.492 171.982C223.915 172.379 224.177 172.919 224.227 173.497Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M238.127 173.497C238.152 173.775 238.117 174.054 238.025 174.318C237.933 174.581 237.787 174.822 237.595 175.025C237.403 175.227 237.17 175.386 236.912 175.492C236.654 175.598 236.377 175.647 236.098 175.638C235.518 175.627 234.961 175.403 234.536 175.008C234.111 174.613 233.847 174.075 233.795 173.497C233.778 173.22 233.818 172.943 233.913 172.683C234.007 172.422 234.154 172.184 234.344 171.983C234.534 171.781 234.764 171.621 235.018 171.511C235.273 171.402 235.547 171.345 235.824 171.346C236.406 171.354 236.965 171.579 237.391 171.976C237.817 172.374 238.079 172.916 238.127 173.497Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M242.064 187.437C241.94 187.435 241.822 187.387 241.732 187.303C241.642 187.219 241.587 187.104 241.577 186.981C241.323 183.521 235.905 180.711 229.503 180.711C225.252 180.711 221.437 181.979 219.55 184.008C219.162 184.382 218.858 184.834 218.659 185.334C218.459 185.835 218.369 186.372 218.393 186.91C218.398 186.976 218.389 187.043 218.368 187.107C218.347 187.17 218.313 187.229 218.27 187.279C218.181 187.381 218.056 187.443 217.921 187.453C217.787 187.462 217.654 187.418 217.552 187.329C217.45 187.241 217.388 187.115 217.378 186.981C217.348 186.308 217.459 185.637 217.704 185.009C217.948 184.382 218.321 183.813 218.799 183.338C220.828 181.116 224.957 179.726 229.472 179.726C236.504 179.726 242.236 182.882 242.52 186.91C242.524 186.974 242.516 187.038 242.495 187.099C242.474 187.159 242.442 187.215 242.399 187.263C242.357 187.311 242.305 187.351 242.248 187.379C242.19 187.407 242.128 187.423 242.064 187.427V187.437Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M216.283 169.154C216.159 169.152 216.04 169.105 215.948 169.023C215.856 168.929 215.804 168.804 215.804 168.672C215.804 168.541 215.856 168.416 215.948 168.322L218.109 165.999C218.202 165.91 218.325 165.86 218.454 165.86C218.583 165.86 218.706 165.91 218.799 165.999C218.844 166.044 218.88 166.098 218.905 166.157C218.929 166.216 218.942 166.28 218.942 166.344C218.942 166.408 218.929 166.472 218.905 166.531C218.88 166.59 218.844 166.644 218.799 166.689L216.638 169.012C216.591 169.059 216.536 169.095 216.475 169.12C216.414 169.144 216.348 169.156 216.283 169.154Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M241.049 169.154C240.926 169.149 240.808 169.102 240.714 169.023L238.228 166.699C238.181 166.654 238.144 166.599 238.119 166.539C238.093 166.479 238.08 166.414 238.08 166.349C238.08 166.284 238.093 166.219 238.119 166.159C238.144 166.099 238.181 166.044 238.228 165.999C238.321 165.91 238.445 165.86 238.573 165.86C238.702 165.86 238.826 165.91 238.918 165.999L241.404 168.322C241.449 168.368 241.485 168.421 241.51 168.481C241.535 168.54 241.547 168.603 241.547 168.667C241.547 168.732 241.535 168.795 241.51 168.854C241.485 168.913 241.449 168.967 241.404 169.012C241.308 169.102 241.181 169.153 241.049 169.154Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M205.213 213.219H207.506L210.814 217.622L210.499 213.219H212.813L213.381 221.173H211.037L207.75 216.8L208.064 221.173H205.751L205.213 213.219Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M214.416 217.196C214.338 216.655 214.375 216.105 214.525 215.58C214.676 215.055 214.936 214.569 215.288 214.152C215.674 213.773 216.136 213.48 216.643 213.293C217.15 213.106 217.691 213.028 218.231 213.066C219.374 213.004 220.497 213.386 221.366 214.132C222.162 214.924 222.623 215.992 222.654 217.115C222.738 217.889 222.634 218.672 222.35 219.397C222.087 219.982 221.647 220.468 221.092 220.787C220.426 221.145 219.676 221.316 218.921 221.285C218.144 221.309 217.372 221.164 216.658 220.858C216.033 220.558 215.505 220.087 215.136 219.499C214.701 218.806 214.453 218.013 214.416 217.196ZM216.881 217.196C216.872 217.818 217.072 218.426 217.45 218.921C217.608 219.095 217.803 219.233 218.02 219.324C218.237 219.415 218.472 219.457 218.708 219.448C218.933 219.464 219.158 219.425 219.365 219.335C219.571 219.245 219.753 219.106 219.895 218.931C220.186 218.376 220.283 217.74 220.169 217.125C220.173 216.528 219.972 215.948 219.6 215.481C219.438 215.31 219.241 215.175 219.022 215.086C218.803 214.997 218.568 214.955 218.332 214.964C218.111 214.954 217.892 214.997 217.691 215.089C217.49 215.18 217.313 215.318 217.176 215.491C216.879 216.014 216.774 216.624 216.881 217.216V217.196Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M227.423 213.219H231.076C231.678 213.2 232.278 213.3 232.841 213.513C233.287 213.7 233.683 213.988 233.998 214.355C234.317 214.727 234.562 215.158 234.718 215.623C234.882 216.123 234.985 216.641 235.022 217.165C235.1 217.829 235.049 218.5 234.87 219.144C234.73 219.589 234.483 219.994 234.15 220.321C233.872 220.615 233.522 220.832 233.135 220.95C232.663 221.087 232.176 221.162 231.684 221.173H228.042L227.423 213.219ZM230.01 215.025L230.325 219.367H230.923C231.294 219.391 231.665 219.332 232.009 219.195C232.236 219.063 232.403 218.848 232.476 218.596C232.592 218.146 232.619 217.677 232.557 217.216C232.576 216.597 232.387 215.99 232.019 215.491C231.831 215.321 231.609 215.191 231.368 215.111C231.127 215.031 230.872 215.001 230.619 215.025H230.01Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M240.917 219.854H238.127L237.833 221.173H235.327L237.741 213.219H240.461L244.022 221.173H241.445L240.917 219.854ZM240.278 218.139L239.202 215.278L238.533 218.139H240.278Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M242.865 213.219H250.333L250.475 215.187H247.969L248.395 221.173H245.939L245.513 215.187H243.007L242.865 213.219Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M256.055 219.854H253.265L252.971 221.173H250.464L252.879 213.219H255.558L259.109 221.173H256.542L256.055 219.854ZM255.416 218.139L254.33 215.278L253.65 218.139H255.416Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M358.855 119.804C359.758 119.348 360.884 118.79 361.838 118.211C362.791 117.633 363.867 117.075 364.881 116.466C366.86 115.239 368.869 114.031 370.766 112.692C374.577 110.085 378.149 107.144 381.44 103.905C381.856 103.52 382.221 103.094 382.617 102.678L383.195 102.059L383.479 101.754L383.621 101.592C383.479 101.866 383.621 101.785 383.621 101.521C383.71 101.159 383.761 100.788 383.773 100.415C383.75 98.2579 383.502 96.1088 383.033 94.0029C382.13 89.4575 380.76 84.77 379.411 80.184L383.347 78.4592C385.832 82.8592 387.907 87.4781 389.546 92.2578C390.467 94.8408 391.054 97.5311 391.292 100.263C391.354 101.112 391.326 101.966 391.21 102.81C391.06 104.003 390.636 105.145 389.973 106.148L389.8 106.381L389.668 106.543L389.516 106.736L389.201 107.122L388.572 107.883C388.156 108.38 387.751 108.897 387.304 109.374C383.834 113.224 379.964 116.694 375.758 119.723C373.729 121.225 371.578 122.665 369.376 123.974C368.291 124.634 367.185 125.263 366.058 125.882C364.932 126.501 363.836 127.069 362.538 127.678L358.855 119.804Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M349.825 358.337C350.584 358.318 351.34 358.216 352.077 358.033C352.115 358.021 352.148 358 352.175 357.972C352.202 357.943 352.22 357.908 352.229 357.87C352.234 357.831 352.228 357.792 352.212 357.756C352.196 357.72 352.17 357.69 352.138 357.667C351.844 357.475 349.267 355.811 348.272 356.257C348.162 356.309 348.068 356.388 347.998 356.488C347.929 356.588 347.887 356.704 347.877 356.825C347.837 357.017 347.847 357.215 347.906 357.402C347.964 357.588 348.07 357.756 348.212 357.891C348.678 358.23 349.251 358.388 349.825 358.337ZM351.499 357.749C350.028 358.043 348.912 357.992 348.455 357.596C348.364 357.503 348.297 357.388 348.262 357.262C348.226 357.136 348.223 357.004 348.252 356.876C348.256 356.822 348.274 356.77 348.304 356.726C348.334 356.681 348.376 356.646 348.425 356.622C348.962 356.389 350.454 357.14 351.499 357.749Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M352.067 358.033H352.168C352.198 358.014 352.223 357.989 352.241 357.959C352.258 357.929 352.268 357.895 352.27 357.86C352.27 357.748 352.27 355.303 351.336 354.492C351.225 354.384 351.09 354.303 350.942 354.256C350.794 354.208 350.638 354.195 350.484 354.218C350.324 354.219 350.169 354.275 350.046 354.377C349.922 354.478 349.837 354.619 349.804 354.776C349.612 355.79 351.154 357.566 351.965 358.033C351.999 358.042 352.034 358.042 352.067 358.033ZM350.616 354.593C350.781 354.594 350.94 354.655 351.062 354.766C351.598 355.555 351.874 356.491 351.854 357.444C351.042 356.795 350.078 355.415 350.2 354.837C350.2 354.745 350.271 354.624 350.525 354.593H350.616Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M351.275 94.429C350.261 99.502 348.232 109.648 351.732 113.047C351.732 113.047 350.352 118.12 340.987 118.12C330.679 118.12 336.067 113.047 336.067 113.047C341.688 111.708 341.535 107.538 340.561 103.611L351.275 94.429Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M334.088 115.076C332.475 115.299 333.855 111.109 334.504 110.673C336.026 109.658 355.669 108.248 355.537 110.673C355.456 111.687 354.969 113.716 354.117 114.386C353.264 115.056 348.212 112.966 334.088 115.076Z"
                            fill="#263238"
                          />
                          <path
                            d="M337.294 113.635C336.006 114.072 336.128 109.851 336.564 109.344C337.579 108.167 353.477 104.088 353.944 106.391C354.127 107.406 354.218 109.435 353.67 110.155C353.122 110.876 348.455 109.689 337.294 113.635Z"
                            fill="#263238"
                          />
                          <path
                            d="M331.379 85.3382C331.315 85.341 331.252 85.3286 331.194 85.3022C331.135 85.2757 331.084 85.2359 331.044 85.186C330.735 84.7867 330.336 84.4658 329.879 84.249C329.423 84.0323 328.922 83.9257 328.417 83.938C328.364 83.9451 328.31 83.9414 328.259 83.9272C328.207 83.9131 328.159 83.8887 328.118 83.8555C328.076 83.8223 328.042 83.7811 328.016 83.7343C327.991 83.6874 327.975 83.636 327.97 83.5829C327.961 83.4784 327.994 83.3746 328.06 83.2933C328.126 83.2119 328.221 83.1594 328.325 83.1466C328.964 83.114 329.601 83.2363 330.182 83.5031C330.763 83.7699 331.272 84.1732 331.663 84.6787C331.731 84.761 331.764 84.8668 331.755 84.9732C331.745 85.0795 331.694 85.1779 331.613 85.2469C331.544 85.2963 331.463 85.3277 331.379 85.3382Z"
                            fill="#263238"
                          />
                          <path
                            d="M329.411 90.2994C328.95 91.9181 328.268 93.4649 327.382 94.8956C327.754 95.1095 328.168 95.2395 328.596 95.2763C329.023 95.3131 329.454 95.2559 329.857 95.1087L329.411 90.2994Z"
                            fill="#FF5652"
                          />
                          <path
                            d="M329.908 89.0719C329.979 89.7517 329.665 90.3401 329.218 90.3807C328.772 90.4213 328.356 89.914 328.295 89.2241C328.234 88.5342 328.538 87.9558 328.975 87.9152C329.411 87.8747 329.837 88.382 329.908 89.0719Z"
                            fill="#263238"
                          />
                          <path
                            d="M329.178 87.9355L327.493 87.621C327.493 87.621 328.457 88.8182 329.178 87.9355Z"
                            fill="#263238"
                          />
                          <path
                            d="M361.909 357.84H353.406L354.076 338.157H362.578L361.909 357.84Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M352.737 356.856H362.284C362.449 356.852 362.609 356.908 362.734 357.015C362.86 357.122 362.941 357.271 362.964 357.434L364.049 364.983C364.071 365.174 364.052 365.367 363.993 365.55C363.934 365.733 363.838 365.901 363.709 366.044C363.581 366.187 363.424 366.301 363.248 366.378C363.072 366.456 362.882 366.496 362.69 366.494C359.362 366.444 357.759 366.241 353.558 366.241C350.971 366.241 347.197 366.515 343.636 366.515C340.074 366.515 339.871 362.984 341.363 362.669C348.019 361.229 349.074 359.26 351.316 357.373C351.715 357.041 352.217 356.859 352.737 356.856Z"
                            fill="#263238"
                          />
                          <g opacity="0.2">
                            <path
                              opacity="0.2"
                              d="M362.578 338.157H354.076L353.731 348.303H362.233L362.578 338.157Z"
                              fill="black"
                            />
                          </g>
                          <path
                            d="M328.092 124.796C322.889 122.773 317.793 120.487 312.822 117.947C307.688 115.439 302.797 112.46 298.212 109.049C296.987 108.09 295.828 107.049 294.742 105.935C294.458 105.63 294.174 105.346 293.9 104.991C293.578 104.628 293.28 104.245 293.007 103.844C292.259 102.754 291.792 101.496 291.648 100.182C291.536 98.9357 291.706 97.6804 292.145 96.5089C292.496 95.5673 292.978 94.6794 293.575 93.871C294.555 92.5307 295.712 91.3293 297.015 90.2996C299.314 88.469 301.796 86.8812 304.421 85.5614C305.679 84.8917 306.958 84.2931 308.257 83.7351C309.555 83.1771 310.834 82.6495 312.224 82.1726L314.019 86.0788C309.596 88.869 305.01 91.9432 301.641 95.3726C300.888 96.1364 300.224 96.9841 299.663 97.8989C299.176 98.7005 299.186 99.2991 299.267 99.2484C299.348 99.1976 299.267 99.2483 299.409 99.3498L299.815 99.7861C299.967 99.9687 300.18 100.151 300.373 100.344C301.233 101.135 302.144 101.867 303.102 102.536C305.197 104.019 307.379 105.374 309.636 106.594C311.919 107.872 314.273 109.08 316.668 110.236C321.457 112.529 326.408 114.731 331.268 116.74L328.092 124.796Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M316.556 83.3495L317.956 80.3057L311.544 78.1243C311.544 78.1243 309.515 84.1206 311.919 86.8803C312.924 86.7221 313.874 86.3166 314.683 85.7002C315.493 85.0839 316.136 84.2761 316.556 83.3495Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M317.926 73.7209L312.822 72.2396L311.544 78.0837L317.926 80.3057V73.7209Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M383.875 80.5999L384.615 73.4977L378.041 75.0805C378.041 75.0805 377.939 81.7565 381.419 82.8117L383.875 80.5999Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M381.45 68.4956L377.158 70.4944L378.041 75.0296L384.615 73.4773L381.45 68.4956Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M352.615 84.4656C352.93 92.897 353.234 96.4582 349.429 101.176C343.697 108.278 333.277 106.807 330.456 98.6396C327.92 91.2939 327.838 78.7433 335.712 74.6037C337.443 73.6833 339.38 73.2205 341.34 73.2592C343.3 73.2979 345.218 73.8368 346.911 74.8247C348.605 75.8126 350.017 77.2169 351.016 78.9042C352.014 80.5914 352.564 82.5058 352.615 84.4656Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M348.942 101.166C357.221 97.5844 362.659 90.0054 360.366 78.2563C358.165 66.984 350.555 65.868 347.41 68.2016C344.265 70.5351 336.422 67.0551 331.714 71.012C323.597 77.8809 331.268 85.2164 335.285 89.6502C337.68 94.5812 340.825 104.666 348.942 101.166Z"
                            fill="#263238"
                          />
                          <path
                            d="M345.503 76.2372C346.513 77.5328 347.88 78.5043 349.436 79.0317C350.991 79.5592 352.667 79.6196 354.257 79.2054C355.847 78.7911 357.28 77.9205 358.381 76.7009C359.481 75.4813 360.201 73.9661 360.45 72.3424C360.699 70.7187 360.468 69.0576 359.784 67.564C359.1 66.0704 357.993 64.8098 356.601 63.9379C355.209 63.0659 353.592 62.6206 351.949 62.6571C350.307 62.6936 348.711 63.2102 347.359 64.1432C345.51 65.5011 344.275 67.5379 343.927 69.8058C343.579 72.0737 344.146 74.387 345.503 76.2372Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M347.654 68.9929C346.466 62.195 352.889 56.9597 361.493 59.4861C370.097 62.0124 365.551 69.6321 363.776 75.7197C362 81.8073 366.647 87.6108 368.575 82.9741C370.502 78.3374 367.256 76.8865 367.256 76.8865C367.256 76.8865 376.387 79.2505 367.905 89.5487C359.423 99.8469 351.742 88.4732 353.822 81.7667C355.507 76.3792 348.78 75.4153 347.654 68.9929Z"
                            fill="#263238"
                          />
                          <path
                            d="M339.06 71.5599C335.133 69.5307 328.488 67.8566 324.703 74.2283C322.917 77.2721 323.607 81.3305 323.607 81.3305L335.164 82.0915L339.06 71.5599Z"
                            fill="#263238"
                          />
                          <path
                            d="M322.248 79.3215C322.18 79.3163 322.116 79.2849 322.071 79.2338C322.025 79.1827 322.001 79.1159 322.004 79.0476C322.004 78.8751 322.299 74.7964 324.764 72.2396C330.72 66.0506 337.7 71.225 339.689 72.8991C339.732 72.9444 339.756 73.0038 339.758 73.0661C339.76 73.1284 339.739 73.1891 339.699 73.2368C339.658 73.2845 339.602 73.3157 339.541 73.3245C339.479 73.3333 339.416 73.3192 339.364 73.2847C337.447 71.641 330.77 66.7202 325.16 72.5846C322.826 75.0095 322.542 79.0375 322.542 79.078C322.541 79.1142 322.532 79.1497 322.517 79.1823C322.501 79.2148 322.478 79.2435 322.45 79.2666C322.422 79.2897 322.39 79.3065 322.355 79.316C322.32 79.3254 322.284 79.3273 322.248 79.3215Z"
                            fill="#263238"
                          />
                          <path
                            d="M336.696 89.2849C336.65 90.8812 336.059 92.4136 335.022 93.6274C333.621 95.2711 331.978 94.4594 331.643 92.6128C331.308 90.9793 331.643 88.1486 333.408 87.1644C335.174 86.1803 336.716 87.4384 336.696 89.2849Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                            fill="#263238"
                          />
                          <path
                            opacity="0.1"
                            d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                            fill="white"
                          />
                          <path
                            opacity="0.3"
                            d="M340.967 193.282C345.026 211.088 341.789 239.132 339.567 251.479C337.213 232.729 336.026 208.43 335.438 190.603C337.538 187.214 339.526 186.991 340.967 193.282Z"
                            fill="black"
                          />
                          <path
                            d="M350.728 346.568H365.49L366.261 341.393L350.646 340.865L350.728 346.568Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                            fill="black"
                          />
                          <path
                            d="M346.334 343.25C346.351 343.221 346.36 343.187 346.36 343.153C346.36 343.12 346.351 343.086 346.334 343.057C346.315 343.018 346.284 342.986 346.246 342.966C346.208 342.946 346.164 342.939 346.121 342.945C345.695 343.016 341.941 343.605 341.434 344.68C341.38 344.778 341.351 344.888 341.351 345C341.351 345.112 341.38 345.222 341.434 345.32C341.521 345.48 341.646 345.617 341.798 345.717C341.95 345.818 342.125 345.88 342.306 345.898C343.534 346.02 345.35 344.315 346.263 343.28L346.334 343.25ZM341.83 344.812C342.174 344.244 344.123 343.717 345.604 343.443C344.265 344.802 343.088 345.563 342.398 345.472C342.278 345.46 342.164 345.418 342.065 345.351C341.965 345.284 341.885 345.193 341.83 345.086C341.807 345.048 341.796 345.004 341.796 344.959C341.796 344.915 341.807 344.871 341.83 344.833C341.83 344.833 341.819 344.822 341.83 344.812Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M355.192 339.648L347.42 343.108L343.96 335.894L339.435 326.458L338.898 325.362L346.669 321.903L347.268 323.14L351.651 332.282L355.192 339.648Z"
                            fill="#FFB573"
                          />
                          <path
                            opacity="0.2"
                            d="M351.651 332.282L343.96 335.894L339.435 326.458L347.268 323.141L351.651 332.282Z"
                            fill="black"
                          />
                          <path
                            d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                            fill="#263238"
                          />
                          <path
                            opacity="0.1"
                            d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                            fill="white"
                          />
                          <path
                            d="M346.04 342.022L353.751 336.411C353.881 336.31 354.044 336.26 354.209 336.271C354.374 336.282 354.529 336.354 354.644 336.472L359.971 341.941C360.1 342.084 360.198 342.252 360.257 342.435C360.317 342.618 360.338 342.812 360.317 343.003C360.297 343.195 360.237 343.38 360.141 343.546C360.044 343.713 359.914 343.857 359.758 343.97C357.028 345.878 355.618 346.669 352.229 349.135C350.139 350.656 345.979 354.015 343.098 356.115C340.216 358.215 338.025 355.476 339.039 354.35C343.585 349.277 344.539 346.131 345.249 343.28C345.359 342.782 345.639 342.337 346.04 342.022Z"
                            fill="#263238"
                          />
                          <path
                            d="M339.963 335.519L353.386 329.38L351.671 323.912L337.294 330.466L339.963 335.519Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                            fill="black"
                          />
                          <path
                            d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                            fill="black"
                          />
                          <path
                            d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.3"
                            d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                            fill="white"
                          />
                          <path
                            d="M356.125 168.424H357.059C357.252 168.424 357.394 168.323 357.373 168.211L356.937 164.153C356.937 164.031 356.765 163.939 356.582 163.939H355.638C355.456 163.939 355.314 164.031 355.324 164.153L355.76 168.211C355.75 168.302 355.912 168.424 356.125 168.424Z"
                            fill="#263238"
                          />
                          <path
                            d="M333.408 168.424H334.342C334.524 168.424 334.667 168.323 334.656 168.211L334.22 164.153C334.22 164.031 334.048 163.939 333.855 163.939H332.921C332.729 163.939 332.597 164.031 332.607 164.153L333.043 168.211C333.053 168.302 333.216 168.424 333.408 168.424Z"
                            fill="#263238"
                          />
                        </svg>
                        <p className="text-center">No Data Available</p>
                      </div>
                    )}
                  </div>
                )}
                {settings.features.assessment && (
                  <div
                    id="assessment"
                    className={`tab-pane ${
                      !settings.features.course ? "active" : "fade"
                    }`}
                  >
                    {assessmentTrend.length ? (
                      <Chart
                        series={chartOptions.series}
                        options={chartOptions.options}
                        type="donut"
                        width="100%"
                        height="400"
                      />
                    ) : (
                      <div className="text-center">
                        <svg
                          width="508"
                          height="378"
                          viewBox="0 0 508 378"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M507.301 332.18H0V332.434H507.301V332.18Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M456.469 348.505H422.866V348.759H456.469V348.505Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M336.056 351.265H327.24V351.519H336.056V351.265Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M421.851 339.09H402.381V339.344H421.851V339.09Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M97.0466 340.794H53.226V341.048H97.0466V340.794Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M112.509 340.794H106.087V341.048H112.509V340.794Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M228.438 345.076H133.39V345.33H228.438V345.076Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M240.461 286.929H44.5511C43.0163 286.927 41.5454 286.315 40.4611 285.229C39.3768 284.143 38.7678 282.671 38.7678 281.136V5.74264C38.7812 4.21671 39.3961 2.75767 40.4789 1.68243C41.5617 0.607197 43.0251 0.00261401 44.5511 0H240.461C241.997 0 243.471 0.610372 244.557 1.69684C245.644 2.78331 246.254 4.25688 246.254 5.79337V281.136C246.254 282.672 245.644 284.146 244.557 285.233C243.471 286.319 241.997 286.929 240.461 286.929ZM44.5511 0.202921C43.0836 0.205609 41.6771 0.790441 40.6404 1.82905C39.6037 2.86766 39.0215 4.27517 39.0215 5.74264V281.136C39.0215 282.603 39.6037 284.011 40.6404 285.05C41.6771 286.088 43.0836 286.673 44.5511 286.676H240.461C241.929 286.673 243.336 286.088 244.375 285.05C245.413 284.012 245.998 282.604 246 281.136V5.74264C245.998 4.27424 245.413 2.86675 244.375 1.82843C243.336 0.790111 241.929 0.205603 240.461 0.202921H44.5511Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M459.929 286.929H264.009C262.474 286.927 261.002 286.315 259.916 285.23C258.83 284.144 258.219 282.672 258.216 281.136V5.74264C258.232 4.21578 258.849 2.75675 259.934 1.6818C261.018 0.606842 262.482 0.0025855 264.009 0H459.929C461.453 0.00528049 462.914 0.611043 463.995 1.68599C465.075 2.76094 465.689 4.21846 465.702 5.74264V281.136C465.702 282.669 465.095 284.139 464.012 285.225C462.93 286.311 461.462 286.924 459.929 286.929ZM264.009 0.202921C262.541 0.205603 261.134 0.790111 260.095 1.82843C259.057 2.86675 258.472 4.27424 258.47 5.74264V281.136C258.472 282.604 259.057 284.012 260.095 285.05C261.134 286.088 262.541 286.673 264.009 286.676H459.929C461.397 286.673 462.805 286.088 463.843 285.05C464.882 284.012 465.466 282.604 465.469 281.136V5.74264C465.466 4.27424 464.882 2.86675 463.843 1.82843C462.805 0.790111 461.397 0.205603 459.929 0.202921H264.009Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M293.92 120.798L433.712 120.798V29.251L293.92 29.251V120.798Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M289.648 120.798L431.713 120.798V29.251L289.648 29.251V120.798Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M293.92 138.757L433.712 138.757V120.788L293.92 120.788V138.757Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M282.556 138.757L424.621 138.757V120.788L282.556 120.788V138.757Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M425.747 114.833V35.2271L295.625 35.2271V114.833L425.747 114.833Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M396.405 114.823L379.786 35.2271H353.853L370.472 114.823H396.405Z"
                            fill="white"
                          />
                          <path
                            d="M422.988 108.887C423.044 108.887 423.101 108.876 423.153 108.854C423.205 108.832 423.253 108.799 423.293 108.759C423.332 108.718 423.363 108.67 423.384 108.617C423.405 108.564 423.415 108.508 423.414 108.451V39.1129C423.414 38.9999 423.369 38.8915 423.289 38.8116C423.209 38.7317 423.101 38.6868 422.988 38.6868C422.931 38.6854 422.875 38.6955 422.823 38.7164C422.77 38.7373 422.723 38.7686 422.683 38.8085C422.643 38.8483 422.612 38.8959 422.591 38.9482C422.57 39.0005 422.56 39.0566 422.561 39.1129V108.451C422.56 108.508 422.57 108.564 422.591 108.617C422.612 108.67 422.643 108.718 422.683 108.759C422.722 108.799 422.77 108.832 422.822 108.854C422.874 108.876 422.931 108.887 422.988 108.887Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M364.902 114.823L348.282 35.2271H338.167L354.796 114.823H364.902Z"
                            fill="white"
                          />
                          <path
                            d="M296.385 114.833V35.2271H295.624V114.833H296.385Z"
                            fill="#E6E6E6"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 44.2264H428.04L428.588 37.5402H288.796L288.248 44.2264Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 55.1843H428.04L428.588 48.5082H288.796L288.248 55.1843Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 66.1419H428.04L428.588 59.4658H288.796L288.248 66.1419Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 77.1098H428.04L428.588 70.4236H288.796L288.248 77.1098Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 88.0674H428.04L428.588 81.3812H288.796L288.248 88.0674Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 99.0251H428.04L428.588 92.3389H288.796L288.248 99.0251Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M413.643 265.602H384.331V271.386H413.643V265.602Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M329.045 332.18H334.453V199.197H329.045V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 271.386H384.321V265.602H310.296V271.386Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 297.228H384.331V303.011H413.643V297.228Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 303.001H384.321V297.218H310.296V303.001Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 202.362H384.331V208.146H413.643V202.362Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 208.135H384.321V202.352H310.296V208.135Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 233.977H384.331V239.761H413.643V233.977Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 239.76H384.321V233.977H310.296V239.76Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M403.081 332.18H408.489V199.197H403.081V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M378.913 332.18H384.321V199.197H378.913V332.18Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M310.296 332.18H315.703V199.197H310.296V332.18Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M66.3348 332.18H121.712L121.712 224.744H66.3348L66.3348 332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M81.1175 332.181H66.3246V317.347H96.6206L81.1175 332.181Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M217.307 332.18H272.684V224.744H217.307V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M66.3347 327.067H230.223V224.734H66.3347V327.067Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M215.43 332.181H230.213V317.347H199.927L215.43 332.181Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M77.7996 288.482H218.748V262.873H77.7996V288.482Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M77.7996 319.559H218.748V293.95H77.7996V319.559Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M191.963 265.613H104.595C103.363 265.613 102.181 265.123 101.309 264.252C100.438 263.38 99.9483 262.198 99.9483 260.966V260.651H196.599V260.966C196.599 262.196 196.111 263.377 195.242 264.248C194.373 265.119 193.193 265.61 191.963 265.613Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M77.7996 257.394H218.748V231.786L77.7996 231.786V257.394Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M191.963 234.525H104.595C103.363 234.525 102.181 234.036 101.309 233.164C100.438 232.293 99.9483 231.111 99.9483 229.878V229.564H196.599V229.878C196.599 231.109 196.111 232.289 195.242 233.161C194.373 234.032 193.193 234.522 191.963 234.525Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M191.963 296.7H104.595C103.363 296.7 102.181 296.211 101.309 295.339C100.438 294.468 99.9483 293.286 99.9483 292.053V291.739H196.599V292.053C196.599 293.284 196.111 294.464 195.242 295.335C194.373 296.207 193.193 296.697 191.963 296.7Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M75.1516 120.798L214.943 120.798V29.251L75.1516 29.251V120.798Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M70.8903 120.798L212.955 120.798V29.251L70.8903 29.251V120.798Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M75.1516 138.757L214.943 138.757V120.788L75.1516 120.788V138.757Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M63.7778 138.757L205.842 138.757V120.788L63.7778 120.788V138.757Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M206.979 114.833V35.2271L76.8561 35.2271V114.833L206.979 114.833Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M177.637 114.823L161.017 35.2271H135.084L151.703 114.823H177.637Z"
                            fill="white"
                          />
                          <path
                            d="M204.209 108.887C204.266 108.887 204.322 108.876 204.374 108.854C204.427 108.832 204.474 108.799 204.514 108.759C204.553 108.718 204.585 108.67 204.605 108.617C204.626 108.564 204.636 108.508 204.635 108.451V39.1129C204.636 39.0566 204.626 39.0005 204.605 38.9482C204.584 38.8959 204.553 38.8483 204.513 38.8085C204.473 38.7686 204.426 38.7373 204.373 38.7164C204.321 38.6955 204.265 38.6854 204.209 38.6868C204.096 38.6868 203.987 38.7317 203.907 38.8116C203.827 38.8915 203.783 38.9999 203.783 39.1129V108.451C203.781 108.508 203.791 108.564 203.812 108.617C203.833 108.67 203.864 108.718 203.904 108.759C203.943 108.799 203.991 108.832 204.043 108.854C204.096 108.876 204.152 108.887 204.209 108.887Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M146.133 114.823L129.514 35.2271H119.398L136.017 114.823H146.133Z"
                            fill="white"
                          />
                          <path
                            d="M77.6171 114.833V35.2271H76.8561V114.833H77.6171Z"
                            fill="#E6E6E6"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 44.2264H209.262L209.809 37.5402H70.0176L69.4697 44.2264Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 48.0008H209.262L209.809 41.3146H70.0176L69.4697 48.0008Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 51.7649H209.262L209.809 45.0889H70.0176L69.4697 51.7649Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 55.5394H209.262L209.809 48.8531H70.0176L69.4697 55.5394Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 59.3034H209.262L209.809 52.6273H70.0176L69.4697 59.3034Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 63.0777H209.262L209.809 56.3915H70.0176L69.4697 63.0777Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M97.4221 221.457H102.252V167.592H97.4221V221.457Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M98.0308 221.427H99.4005V167.561H98.0308V221.427Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M99.9687 221.427H100.506V167.561H99.9687V221.427Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M117.724 224.745H81.9697C81.9697 223.55 82.4443 222.404 83.2891 221.559C84.1339 220.714 85.2798 220.24 86.4745 220.24H113.209C114.404 220.24 115.55 220.714 116.395 221.559C117.239 222.404 117.714 223.55 117.714 224.745H117.724Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M91.1517 201.033C91.5196 201.031 91.8716 200.883 92.1317 200.623C92.3918 200.363 92.5391 200.011 92.5417 199.643V164.366C92.5417 163.997 92.3953 163.643 92.1346 163.383C91.8739 163.122 91.5204 162.976 91.1517 162.976C90.9683 162.974 90.7865 163.009 90.6167 163.078C90.4469 163.148 90.2924 163.25 90.1623 163.379C90.0321 163.508 89.9288 163.662 89.8584 163.831C89.7879 164.001 89.7516 164.182 89.7516 164.366V199.684C89.7647 200.046 89.918 200.39 90.1792 200.641C90.4404 200.893 90.789 201.034 91.1517 201.033Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M78.1953 180.396H121.468L116.486 150.161H83.177L78.1953 180.396Z"
                            fill="#E0E0E0"
                          />
                          <path
                            d="M253.65 378C362.297 378 450.372 372.858 450.372 366.515C450.372 360.172 362.297 355.03 253.65 355.03C145.004 355.03 56.9293 360.172 56.9293 366.515C56.9293 372.858 145.004 378 253.65 378Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M105.639 149.511L104.627 149.584L105.975 168.295L106.987 168.222L105.639 149.511Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M107.674 177.882L106.662 177.955L107.17 184.998L108.182 184.925L107.674 177.882Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M342.641 263.959H125.354C122.935 263.915 120.618 262.978 118.85 261.327C117.081 259.677 115.986 257.43 115.776 255.02L105.103 106.756C105.003 105.613 105.145 104.461 105.517 103.376C105.89 102.29 106.486 101.295 107.267 100.454C108.048 99.6128 108.997 98.9446 110.051 98.4923C111.106 98.04 112.244 97.8137 113.392 97.8279H330.679C333.096 97.8711 335.412 98.8071 337.18 100.456C338.948 102.104 340.044 104.348 340.257 106.756L350.93 255.02C351.03 256.164 350.888 257.316 350.516 258.402C350.143 259.488 349.547 260.484 348.766 261.326C347.985 262.168 347.037 262.837 345.982 263.29C344.927 263.744 343.789 263.972 342.641 263.959Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.5"
                            d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                            fill="white"
                          />
                          <path
                            d="M331.835 102.292H114.548H113.818C108.268 102.749 109.404 111.2 115.005 111.2H332.657C338.268 111.2 338.187 102.749 332.566 102.292H331.835Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M120.21 106.756C120.231 107.018 120.198 107.281 120.111 107.529C120.024 107.776 119.887 108.003 119.707 108.194C119.527 108.386 119.309 108.537 119.068 108.639C118.826 108.741 118.565 108.791 118.303 108.786C117.751 108.778 117.222 108.566 116.818 108.191C116.413 107.817 116.161 107.306 116.111 106.756C116.09 106.496 116.123 106.233 116.209 105.986C116.296 105.739 116.432 105.513 116.611 105.322C116.79 105.131 117.006 104.979 117.247 104.877C117.488 104.774 117.747 104.723 118.008 104.727C118.562 104.732 119.093 104.943 119.5 105.318C119.907 105.693 120.16 106.205 120.21 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M127.18 106.756C127.202 107.018 127.168 107.281 127.081 107.529C126.995 107.776 126.857 108.003 126.677 108.194C126.497 108.386 126.28 108.537 126.038 108.639C125.796 108.741 125.535 108.791 125.273 108.786C124.721 108.778 124.192 108.566 123.788 108.191C123.383 107.817 123.131 107.306 123.081 106.756C123.06 106.496 123.094 106.233 123.18 105.986C123.266 105.739 123.403 105.513 123.581 105.322C123.76 105.131 123.976 104.979 124.217 104.877C124.458 104.774 124.717 104.723 124.979 104.727C125.532 104.732 126.063 104.943 126.47 105.318C126.877 105.693 127.13 106.205 127.18 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M134.141 106.756C134.162 107.017 134.128 107.279 134.042 107.526C133.956 107.773 133.819 108 133.641 108.191C133.462 108.382 133.246 108.533 133.005 108.636C132.764 108.738 132.505 108.789 132.243 108.786C131.691 108.78 131.161 108.569 130.756 108.194C130.351 107.819 130.1 107.306 130.052 106.756C130.029 106.495 130.061 106.232 130.147 105.985C130.232 105.737 130.369 105.51 130.548 105.319C130.727 105.127 130.944 104.976 131.185 104.874C131.427 104.772 131.687 104.722 131.949 104.727C132.5 104.735 133.029 104.947 133.434 105.321C133.839 105.696 134.09 106.207 134.141 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M337.71 249.166H129.869C128.991 249.151 128.15 248.811 127.509 248.211C126.867 247.611 126.472 246.794 126.399 245.919L117.623 123.994C117.584 123.576 117.634 123.154 117.771 122.757C117.907 122.359 118.127 121.995 118.414 121.689C118.702 121.383 119.052 121.142 119.44 120.981C119.829 120.821 120.247 120.745 120.667 120.758H328.558C329.436 120.77 330.277 121.108 330.918 121.706C331.56 122.305 331.955 123.12 332.028 123.994L340.815 245.919C340.853 246.343 340.8 246.77 340.659 247.171C340.519 247.573 340.294 247.94 340 248.247C339.706 248.555 339.349 248.796 338.954 248.954C338.559 249.113 338.135 249.185 337.71 249.166Z"
                            fill="white"
                          />
                          <path
                            d="M250.13 202.718L246.741 155.721L236.493 149.552H208.277L212.113 202.718H250.13Z"
                            fill="white"
                          />
                          <path
                            d="M250.13 203.204H212.113C211.987 203.207 211.865 203.161 211.772 203.076C211.679 202.991 211.623 202.873 211.615 202.748L207.79 149.583C207.785 149.516 207.795 149.449 207.817 149.386C207.84 149.323 207.876 149.266 207.922 149.218C207.967 149.167 208.022 149.127 208.083 149.099C208.144 149.071 208.21 149.056 208.277 149.055H236.493C236.582 149.058 236.669 149.083 236.747 149.126L246.995 155.295C247.064 155.334 247.122 155.39 247.164 155.457C247.207 155.525 247.232 155.601 247.238 155.681L250.607 202.677C250.614 202.745 250.605 202.814 250.583 202.879C250.56 202.944 250.523 203.003 250.475 203.052C250.43 203.1 250.377 203.138 250.318 203.164C250.259 203.19 250.194 203.204 250.13 203.204ZM212.589 202.19H249.592L246.264 155.975L236.402 150.039H208.805L212.589 202.19Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M246.741 155.721L236.493 149.552L240.258 157.73L246.741 155.721Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M240.258 158.217C240.164 158.216 240.073 158.19 239.994 158.139C239.915 158.089 239.851 158.017 239.811 157.933L236.047 149.755C236.003 149.659 235.99 149.552 236.01 149.448C236.03 149.345 236.082 149.25 236.159 149.177C236.239 149.108 236.339 149.066 236.445 149.057C236.55 149.048 236.656 149.072 236.747 149.126L246.995 155.295C247.077 155.345 247.144 155.417 247.187 155.503C247.23 155.589 247.248 155.686 247.238 155.782C247.225 155.875 247.186 155.963 247.125 156.035C247.064 156.107 246.983 156.16 246.893 156.188L240.4 158.217H240.258ZM237.61 150.79L240.522 157.131L245.595 155.579L237.61 150.79Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M224.227 173.497C224.242 173.773 224.201 174.049 224.106 174.308C224.011 174.567 223.863 174.804 223.674 175.004C223.484 175.205 223.255 175.364 223.001 175.473C222.747 175.582 222.474 175.638 222.198 175.638C221.619 175.627 221.064 175.403 220.64 175.008C220.217 174.612 219.955 174.074 219.905 173.497C219.879 173.218 219.912 172.937 220.003 172.673C220.094 172.408 220.241 172.166 220.433 171.962C220.625 171.759 220.858 171.599 221.117 171.492C221.376 171.386 221.654 171.336 221.934 171.346C222.514 171.359 223.069 171.585 223.492 171.982C223.915 172.379 224.177 172.919 224.227 173.497Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M238.127 173.497C238.152 173.775 238.117 174.054 238.025 174.318C237.933 174.581 237.787 174.822 237.595 175.025C237.403 175.227 237.17 175.386 236.912 175.492C236.654 175.598 236.377 175.647 236.098 175.638C235.518 175.627 234.961 175.403 234.536 175.008C234.111 174.613 233.847 174.075 233.795 173.497C233.778 173.22 233.818 172.943 233.913 172.683C234.007 172.422 234.154 172.184 234.344 171.983C234.534 171.781 234.764 171.621 235.018 171.511C235.273 171.402 235.547 171.345 235.824 171.346C236.406 171.354 236.965 171.579 237.391 171.976C237.817 172.374 238.079 172.916 238.127 173.497Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M242.064 187.437C241.94 187.435 241.822 187.387 241.732 187.303C241.642 187.219 241.587 187.104 241.577 186.981C241.323 183.521 235.905 180.711 229.503 180.711C225.252 180.711 221.437 181.979 219.55 184.008C219.162 184.382 218.858 184.834 218.659 185.334C218.459 185.835 218.369 186.372 218.393 186.91C218.398 186.976 218.389 187.043 218.368 187.107C218.347 187.17 218.313 187.229 218.27 187.279C218.181 187.381 218.056 187.443 217.921 187.453C217.787 187.462 217.654 187.418 217.552 187.329C217.45 187.241 217.388 187.115 217.378 186.981C217.348 186.308 217.459 185.637 217.704 185.009C217.948 184.382 218.321 183.813 218.799 183.338C220.828 181.116 224.957 179.726 229.472 179.726C236.504 179.726 242.236 182.882 242.52 186.91C242.524 186.974 242.516 187.038 242.495 187.099C242.474 187.159 242.442 187.215 242.399 187.263C242.357 187.311 242.305 187.351 242.248 187.379C242.19 187.407 242.128 187.423 242.064 187.427V187.437Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M216.283 169.154C216.159 169.152 216.04 169.105 215.948 169.023C215.856 168.929 215.804 168.804 215.804 168.672C215.804 168.541 215.856 168.416 215.948 168.322L218.109 165.999C218.202 165.91 218.325 165.86 218.454 165.86C218.583 165.86 218.706 165.91 218.799 165.999C218.844 166.044 218.88 166.098 218.905 166.157C218.929 166.216 218.942 166.28 218.942 166.344C218.942 166.408 218.929 166.472 218.905 166.531C218.88 166.59 218.844 166.644 218.799 166.689L216.638 169.012C216.591 169.059 216.536 169.095 216.475 169.12C216.414 169.144 216.348 169.156 216.283 169.154Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M241.049 169.154C240.926 169.149 240.808 169.102 240.714 169.023L238.228 166.699C238.181 166.654 238.144 166.599 238.119 166.539C238.093 166.479 238.08 166.414 238.08 166.349C238.08 166.284 238.093 166.219 238.119 166.159C238.144 166.099 238.181 166.044 238.228 165.999C238.321 165.91 238.445 165.86 238.573 165.86C238.702 165.86 238.826 165.91 238.918 165.999L241.404 168.322C241.449 168.368 241.485 168.421 241.51 168.481C241.535 168.54 241.547 168.603 241.547 168.667C241.547 168.732 241.535 168.795 241.51 168.854C241.485 168.913 241.449 168.967 241.404 169.012C241.308 169.102 241.181 169.153 241.049 169.154Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M205.213 213.219H207.506L210.814 217.622L210.499 213.219H212.813L213.381 221.173H211.037L207.75 216.8L208.064 221.173H205.751L205.213 213.219Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M214.416 217.196C214.338 216.655 214.375 216.105 214.525 215.58C214.676 215.055 214.936 214.569 215.288 214.152C215.674 213.773 216.136 213.48 216.643 213.293C217.15 213.106 217.691 213.028 218.231 213.066C219.374 213.004 220.497 213.386 221.366 214.132C222.162 214.924 222.623 215.992 222.654 217.115C222.738 217.889 222.634 218.672 222.35 219.397C222.087 219.982 221.647 220.468 221.092 220.787C220.426 221.145 219.676 221.316 218.921 221.285C218.144 221.309 217.372 221.164 216.658 220.858C216.033 220.558 215.505 220.087 215.136 219.499C214.701 218.806 214.453 218.013 214.416 217.196ZM216.881 217.196C216.872 217.818 217.072 218.426 217.45 218.921C217.608 219.095 217.803 219.233 218.02 219.324C218.237 219.415 218.472 219.457 218.708 219.448C218.933 219.464 219.158 219.425 219.365 219.335C219.571 219.245 219.753 219.106 219.895 218.931C220.186 218.376 220.283 217.74 220.169 217.125C220.173 216.528 219.972 215.948 219.6 215.481C219.438 215.31 219.241 215.175 219.022 215.086C218.803 214.997 218.568 214.955 218.332 214.964C218.111 214.954 217.892 214.997 217.691 215.089C217.49 215.18 217.313 215.318 217.176 215.491C216.879 216.014 216.774 216.624 216.881 217.216V217.196Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M227.423 213.219H231.076C231.678 213.2 232.278 213.3 232.841 213.513C233.287 213.7 233.683 213.988 233.998 214.355C234.317 214.727 234.562 215.158 234.718 215.623C234.882 216.123 234.985 216.641 235.022 217.165C235.1 217.829 235.049 218.5 234.87 219.144C234.73 219.589 234.483 219.994 234.15 220.321C233.872 220.615 233.522 220.832 233.135 220.95C232.663 221.087 232.176 221.162 231.684 221.173H228.042L227.423 213.219ZM230.01 215.025L230.325 219.367H230.923C231.294 219.391 231.665 219.332 232.009 219.195C232.236 219.063 232.403 218.848 232.476 218.596C232.592 218.146 232.619 217.677 232.557 217.216C232.576 216.597 232.387 215.99 232.019 215.491C231.831 215.321 231.609 215.191 231.368 215.111C231.127 215.031 230.872 215.001 230.619 215.025H230.01Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M240.917 219.854H238.127L237.833 221.173H235.327L237.741 213.219H240.461L244.022 221.173H241.445L240.917 219.854ZM240.278 218.139L239.202 215.278L238.533 218.139H240.278Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M242.865 213.219H250.333L250.475 215.187H247.969L248.395 221.173H245.939L245.513 215.187H243.007L242.865 213.219Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M256.055 219.854H253.265L252.971 221.173H250.464L252.879 213.219H255.558L259.109 221.173H256.542L256.055 219.854ZM255.416 218.139L254.33 215.278L253.65 218.139H255.416Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M358.855 119.804C359.758 119.348 360.884 118.79 361.838 118.211C362.791 117.633 363.867 117.075 364.881 116.466C366.86 115.239 368.869 114.031 370.766 112.692C374.577 110.085 378.149 107.144 381.44 103.905C381.856 103.52 382.221 103.094 382.617 102.678L383.195 102.059L383.479 101.754L383.621 101.592C383.479 101.866 383.621 101.785 383.621 101.521C383.71 101.159 383.761 100.788 383.773 100.415C383.75 98.2579 383.502 96.1088 383.033 94.0029C382.13 89.4575 380.76 84.77 379.411 80.184L383.347 78.4592C385.832 82.8592 387.907 87.4781 389.546 92.2578C390.467 94.8408 391.054 97.5311 391.292 100.263C391.354 101.112 391.326 101.966 391.21 102.81C391.06 104.003 390.636 105.145 389.973 106.148L389.8 106.381L389.668 106.543L389.516 106.736L389.201 107.122L388.572 107.883C388.156 108.38 387.751 108.897 387.304 109.374C383.834 113.224 379.964 116.694 375.758 119.723C373.729 121.225 371.578 122.665 369.376 123.974C368.291 124.634 367.185 125.263 366.058 125.882C364.932 126.501 363.836 127.069 362.538 127.678L358.855 119.804Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M349.825 358.337C350.584 358.318 351.34 358.216 352.077 358.033C352.115 358.021 352.148 358 352.175 357.972C352.202 357.943 352.22 357.908 352.229 357.87C352.234 357.831 352.228 357.792 352.212 357.756C352.196 357.72 352.17 357.69 352.138 357.667C351.844 357.475 349.267 355.811 348.272 356.257C348.162 356.309 348.068 356.388 347.998 356.488C347.929 356.588 347.887 356.704 347.877 356.825C347.837 357.017 347.847 357.215 347.906 357.402C347.964 357.588 348.07 357.756 348.212 357.891C348.678 358.23 349.251 358.388 349.825 358.337ZM351.499 357.749C350.028 358.043 348.912 357.992 348.455 357.596C348.364 357.503 348.297 357.388 348.262 357.262C348.226 357.136 348.223 357.004 348.252 356.876C348.256 356.822 348.274 356.77 348.304 356.726C348.334 356.681 348.376 356.646 348.425 356.622C348.962 356.389 350.454 357.14 351.499 357.749Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M352.067 358.033H352.168C352.198 358.014 352.223 357.989 352.241 357.959C352.258 357.929 352.268 357.895 352.27 357.86C352.27 357.748 352.27 355.303 351.336 354.492C351.225 354.384 351.09 354.303 350.942 354.256C350.794 354.208 350.638 354.195 350.484 354.218C350.324 354.219 350.169 354.275 350.046 354.377C349.922 354.478 349.837 354.619 349.804 354.776C349.612 355.79 351.154 357.566 351.965 358.033C351.999 358.042 352.034 358.042 352.067 358.033ZM350.616 354.593C350.781 354.594 350.94 354.655 351.062 354.766C351.598 355.555 351.874 356.491 351.854 357.444C351.042 356.795 350.078 355.415 350.2 354.837C350.2 354.745 350.271 354.624 350.525 354.593H350.616Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M351.275 94.429C350.261 99.502 348.232 109.648 351.732 113.047C351.732 113.047 350.352 118.12 340.987 118.12C330.679 118.12 336.067 113.047 336.067 113.047C341.688 111.708 341.535 107.538 340.561 103.611L351.275 94.429Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M334.088 115.076C332.475 115.299 333.855 111.109 334.504 110.673C336.026 109.658 355.669 108.248 355.537 110.673C355.456 111.687 354.969 113.716 354.117 114.386C353.264 115.056 348.212 112.966 334.088 115.076Z"
                            fill="#263238"
                          />
                          <path
                            d="M337.294 113.635C336.006 114.072 336.128 109.851 336.564 109.344C337.579 108.167 353.477 104.088 353.944 106.391C354.127 107.406 354.218 109.435 353.67 110.155C353.122 110.876 348.455 109.689 337.294 113.635Z"
                            fill="#263238"
                          />
                          <path
                            d="M331.379 85.3382C331.315 85.341 331.252 85.3286 331.194 85.3022C331.135 85.2757 331.084 85.2359 331.044 85.186C330.735 84.7867 330.336 84.4658 329.879 84.249C329.423 84.0323 328.922 83.9257 328.417 83.938C328.364 83.9451 328.31 83.9414 328.259 83.9272C328.207 83.9131 328.159 83.8887 328.118 83.8555C328.076 83.8223 328.042 83.7811 328.016 83.7343C327.991 83.6874 327.975 83.636 327.97 83.5829C327.961 83.4784 327.994 83.3746 328.06 83.2933C328.126 83.2119 328.221 83.1594 328.325 83.1466C328.964 83.114 329.601 83.2363 330.182 83.5031C330.763 83.7699 331.272 84.1732 331.663 84.6787C331.731 84.761 331.764 84.8668 331.755 84.9732C331.745 85.0795 331.694 85.1779 331.613 85.2469C331.544 85.2963 331.463 85.3277 331.379 85.3382Z"
                            fill="#263238"
                          />
                          <path
                            d="M329.411 90.2994C328.95 91.9181 328.268 93.4649 327.382 94.8956C327.754 95.1095 328.168 95.2395 328.596 95.2763C329.023 95.3131 329.454 95.2559 329.857 95.1087L329.411 90.2994Z"
                            fill="#FF5652"
                          />
                          <path
                            d="M329.908 89.0719C329.979 89.7517 329.665 90.3401 329.218 90.3807C328.772 90.4213 328.356 89.914 328.295 89.2241C328.234 88.5342 328.538 87.9558 328.975 87.9152C329.411 87.8747 329.837 88.382 329.908 89.0719Z"
                            fill="#263238"
                          />
                          <path
                            d="M329.178 87.9355L327.493 87.621C327.493 87.621 328.457 88.8182 329.178 87.9355Z"
                            fill="#263238"
                          />
                          <path
                            d="M361.909 357.84H353.406L354.076 338.157H362.578L361.909 357.84Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M352.737 356.856H362.284C362.449 356.852 362.609 356.908 362.734 357.015C362.86 357.122 362.941 357.271 362.964 357.434L364.049 364.983C364.071 365.174 364.052 365.367 363.993 365.55C363.934 365.733 363.838 365.901 363.709 366.044C363.581 366.187 363.424 366.301 363.248 366.378C363.072 366.456 362.882 366.496 362.69 366.494C359.362 366.444 357.759 366.241 353.558 366.241C350.971 366.241 347.197 366.515 343.636 366.515C340.074 366.515 339.871 362.984 341.363 362.669C348.019 361.229 349.074 359.26 351.316 357.373C351.715 357.041 352.217 356.859 352.737 356.856Z"
                            fill="#263238"
                          />
                          <g opacity="0.2">
                            <path
                              opacity="0.2"
                              d="M362.578 338.157H354.076L353.731 348.303H362.233L362.578 338.157Z"
                              fill="black"
                            />
                          </g>
                          <path
                            d="M328.092 124.796C322.889 122.773 317.793 120.487 312.822 117.947C307.688 115.439 302.797 112.46 298.212 109.049C296.987 108.09 295.828 107.049 294.742 105.935C294.458 105.63 294.174 105.346 293.9 104.991C293.578 104.628 293.28 104.245 293.007 103.844C292.259 102.754 291.792 101.496 291.648 100.182C291.536 98.9357 291.706 97.6804 292.145 96.5089C292.496 95.5673 292.978 94.6794 293.575 93.871C294.555 92.5307 295.712 91.3293 297.015 90.2996C299.314 88.469 301.796 86.8812 304.421 85.5614C305.679 84.8917 306.958 84.2931 308.257 83.7351C309.555 83.1771 310.834 82.6495 312.224 82.1726L314.019 86.0788C309.596 88.869 305.01 91.9432 301.641 95.3726C300.888 96.1364 300.224 96.9841 299.663 97.8989C299.176 98.7005 299.186 99.2991 299.267 99.2484C299.348 99.1976 299.267 99.2483 299.409 99.3498L299.815 99.7861C299.967 99.9687 300.18 100.151 300.373 100.344C301.233 101.135 302.144 101.867 303.102 102.536C305.197 104.019 307.379 105.374 309.636 106.594C311.919 107.872 314.273 109.08 316.668 110.236C321.457 112.529 326.408 114.731 331.268 116.74L328.092 124.796Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M316.556 83.3495L317.956 80.3057L311.544 78.1243C311.544 78.1243 309.515 84.1206 311.919 86.8803C312.924 86.7221 313.874 86.3166 314.683 85.7002C315.493 85.0839 316.136 84.2761 316.556 83.3495Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M317.926 73.7209L312.822 72.2396L311.544 78.0837L317.926 80.3057V73.7209Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M383.875 80.5999L384.615 73.4977L378.041 75.0805C378.041 75.0805 377.939 81.7565 381.419 82.8117L383.875 80.5999Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M381.45 68.4956L377.158 70.4944L378.041 75.0296L384.615 73.4773L381.45 68.4956Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M352.615 84.4656C352.93 92.897 353.234 96.4582 349.429 101.176C343.697 108.278 333.277 106.807 330.456 98.6396C327.92 91.2939 327.838 78.7433 335.712 74.6037C337.443 73.6833 339.38 73.2205 341.34 73.2592C343.3 73.2979 345.218 73.8368 346.911 74.8247C348.605 75.8126 350.017 77.2169 351.016 78.9042C352.014 80.5914 352.564 82.5058 352.615 84.4656Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M348.942 101.166C357.221 97.5844 362.659 90.0054 360.366 78.2563C358.165 66.984 350.555 65.868 347.41 68.2016C344.265 70.5351 336.422 67.0551 331.714 71.012C323.597 77.8809 331.268 85.2164 335.285 89.6502C337.68 94.5812 340.825 104.666 348.942 101.166Z"
                            fill="#263238"
                          />
                          <path
                            d="M345.503 76.2372C346.513 77.5328 347.88 78.5043 349.436 79.0317C350.991 79.5592 352.667 79.6196 354.257 79.2054C355.847 78.7911 357.28 77.9205 358.381 76.7009C359.481 75.4813 360.201 73.9661 360.45 72.3424C360.699 70.7187 360.468 69.0576 359.784 67.564C359.1 66.0704 357.993 64.8098 356.601 63.9379C355.209 63.0659 353.592 62.6206 351.949 62.6571C350.307 62.6936 348.711 63.2102 347.359 64.1432C345.51 65.5011 344.275 67.5379 343.927 69.8058C343.579 72.0737 344.146 74.387 345.503 76.2372Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M347.654 68.9929C346.466 62.195 352.889 56.9597 361.493 59.4861C370.097 62.0124 365.551 69.6321 363.776 75.7197C362 81.8073 366.647 87.6108 368.575 82.9741C370.502 78.3374 367.256 76.8865 367.256 76.8865C367.256 76.8865 376.387 79.2505 367.905 89.5487C359.423 99.8469 351.742 88.4732 353.822 81.7667C355.507 76.3792 348.78 75.4153 347.654 68.9929Z"
                            fill="#263238"
                          />
                          <path
                            d="M339.06 71.5599C335.133 69.5307 328.488 67.8566 324.703 74.2283C322.917 77.2721 323.607 81.3305 323.607 81.3305L335.164 82.0915L339.06 71.5599Z"
                            fill="#263238"
                          />
                          <path
                            d="M322.248 79.3215C322.18 79.3163 322.116 79.2849 322.071 79.2338C322.025 79.1827 322.001 79.1159 322.004 79.0476C322.004 78.8751 322.299 74.7964 324.764 72.2396C330.72 66.0506 337.7 71.225 339.689 72.8991C339.732 72.9444 339.756 73.0038 339.758 73.0661C339.76 73.1284 339.739 73.1891 339.699 73.2368C339.658 73.2845 339.602 73.3157 339.541 73.3245C339.479 73.3333 339.416 73.3192 339.364 73.2847C337.447 71.641 330.77 66.7202 325.16 72.5846C322.826 75.0095 322.542 79.0375 322.542 79.078C322.541 79.1142 322.532 79.1497 322.517 79.1823C322.501 79.2148 322.478 79.2435 322.45 79.2666C322.422 79.2897 322.39 79.3065 322.355 79.316C322.32 79.3254 322.284 79.3273 322.248 79.3215Z"
                            fill="#263238"
                          />
                          <path
                            d="M336.696 89.2849C336.65 90.8812 336.059 92.4136 335.022 93.6274C333.621 95.2711 331.978 94.4594 331.643 92.6128C331.308 90.9793 331.643 88.1486 333.408 87.1644C335.174 86.1803 336.716 87.4384 336.696 89.2849Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                            fill="#263238"
                          />
                          <path
                            opacity="0.1"
                            d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                            fill="white"
                          />
                          <path
                            opacity="0.3"
                            d="M340.967 193.282C345.026 211.088 341.789 239.132 339.567 251.479C337.213 232.729 336.026 208.43 335.438 190.603C337.538 187.214 339.526 186.991 340.967 193.282Z"
                            fill="black"
                          />
                          <path
                            d="M350.728 346.568H365.49L366.261 341.393L350.646 340.865L350.728 346.568Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                            fill="black"
                          />
                          <path
                            d="M346.334 343.25C346.351 343.221 346.36 343.187 346.36 343.153C346.36 343.12 346.351 343.086 346.334 343.057C346.315 343.018 346.284 342.986 346.246 342.966C346.208 342.946 346.164 342.939 346.121 342.945C345.695 343.016 341.941 343.605 341.434 344.68C341.38 344.778 341.351 344.888 341.351 345C341.351 345.112 341.38 345.222 341.434 345.32C341.521 345.48 341.646 345.617 341.798 345.717C341.95 345.818 342.125 345.88 342.306 345.898C343.534 346.02 345.35 344.315 346.263 343.28L346.334 343.25ZM341.83 344.812C342.174 344.244 344.123 343.717 345.604 343.443C344.265 344.802 343.088 345.563 342.398 345.472C342.278 345.46 342.164 345.418 342.065 345.351C341.965 345.284 341.885 345.193 341.83 345.086C341.807 345.048 341.796 345.004 341.796 344.959C341.796 344.915 341.807 344.871 341.83 344.833C341.83 344.833 341.819 344.822 341.83 344.812Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M355.192 339.648L347.42 343.108L343.96 335.894L339.435 326.458L338.898 325.362L346.669 321.903L347.268 323.14L351.651 332.282L355.192 339.648Z"
                            fill="#FFB573"
                          />
                          <path
                            opacity="0.2"
                            d="M351.651 332.282L343.96 335.894L339.435 326.458L347.268 323.141L351.651 332.282Z"
                            fill="black"
                          />
                          <path
                            d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                            fill="#263238"
                          />
                          <path
                            opacity="0.1"
                            d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                            fill="white"
                          />
                          <path
                            d="M346.04 342.022L353.751 336.411C353.881 336.31 354.044 336.26 354.209 336.271C354.374 336.282 354.529 336.354 354.644 336.472L359.971 341.941C360.1 342.084 360.198 342.252 360.257 342.435C360.317 342.618 360.338 342.812 360.317 343.003C360.297 343.195 360.237 343.38 360.141 343.546C360.044 343.713 359.914 343.857 359.758 343.97C357.028 345.878 355.618 346.669 352.229 349.135C350.139 350.656 345.979 354.015 343.098 356.115C340.216 358.215 338.025 355.476 339.039 354.35C343.585 349.277 344.539 346.131 345.249 343.28C345.359 342.782 345.639 342.337 346.04 342.022Z"
                            fill="#263238"
                          />
                          <path
                            d="M339.963 335.519L353.386 329.38L351.671 323.912L337.294 330.466L339.963 335.519Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                            fill="black"
                          />
                          <path
                            d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                            fill="black"
                          />
                          <path
                            d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.3"
                            d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                            fill="white"
                          />
                          <path
                            d="M356.125 168.424H357.059C357.252 168.424 357.394 168.323 357.373 168.211L356.937 164.153C356.937 164.031 356.765 163.939 356.582 163.939H355.638C355.456 163.939 355.314 164.031 355.324 164.153L355.76 168.211C355.75 168.302 355.912 168.424 356.125 168.424Z"
                            fill="#263238"
                          />
                          <path
                            d="M333.408 168.424H334.342C334.524 168.424 334.667 168.323 334.656 168.211L334.22 164.153C334.22 164.031 334.048 163.939 333.855 163.939H332.921C332.729 163.939 332.597 164.031 332.607 164.153L333.043 168.211C333.053 168.302 333.216 168.424 333.408 168.424Z"
                            fill="#263238"
                          />
                        </svg>
                        <p className="text-center">No Data Available</p>
                      </div>
                    )}
                  </div>
                )}
                {settings.features.testseries && (
                  <div id="test-series" className="tab-pane fade">
                    {testseriesTrend.length ? (
                      <Chart
                        series={chartOptions.series}
                        options={chartOptions.options}
                        type="donut"
                        width="100%"
                        height="400"
                      />
                    ) : (
                      <div className="text-center">
                        <svg
                          width="508"
                          height="378"
                          viewBox="0 0 508 378"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M507.301 332.18H0V332.434H507.301V332.18Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M456.469 348.505H422.866V348.759H456.469V348.505Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M336.056 351.265H327.24V351.519H336.056V351.265Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M421.851 339.09H402.381V339.344H421.851V339.09Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M97.0466 340.794H53.226V341.048H97.0466V340.794Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M112.509 340.794H106.087V341.048H112.509V340.794Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M228.438 345.076H133.39V345.33H228.438V345.076Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M240.461 286.929H44.5511C43.0163 286.927 41.5454 286.315 40.4611 285.229C39.3768 284.143 38.7678 282.671 38.7678 281.136V5.74264C38.7812 4.21671 39.3961 2.75767 40.4789 1.68243C41.5617 0.607197 43.0251 0.00261401 44.5511 0H240.461C241.997 0 243.471 0.610372 244.557 1.69684C245.644 2.78331 246.254 4.25688 246.254 5.79337V281.136C246.254 282.672 245.644 284.146 244.557 285.233C243.471 286.319 241.997 286.929 240.461 286.929ZM44.5511 0.202921C43.0836 0.205609 41.6771 0.790441 40.6404 1.82905C39.6037 2.86766 39.0215 4.27517 39.0215 5.74264V281.136C39.0215 282.603 39.6037 284.011 40.6404 285.05C41.6771 286.088 43.0836 286.673 44.5511 286.676H240.461C241.929 286.673 243.336 286.088 244.375 285.05C245.413 284.012 245.998 282.604 246 281.136V5.74264C245.998 4.27424 245.413 2.86675 244.375 1.82843C243.336 0.790111 241.929 0.205603 240.461 0.202921H44.5511Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M459.929 286.929H264.009C262.474 286.927 261.002 286.315 259.916 285.23C258.83 284.144 258.219 282.672 258.216 281.136V5.74264C258.232 4.21578 258.849 2.75675 259.934 1.6818C261.018 0.606842 262.482 0.0025855 264.009 0H459.929C461.453 0.00528049 462.914 0.611043 463.995 1.68599C465.075 2.76094 465.689 4.21846 465.702 5.74264V281.136C465.702 282.669 465.095 284.139 464.012 285.225C462.93 286.311 461.462 286.924 459.929 286.929ZM264.009 0.202921C262.541 0.205603 261.134 0.790111 260.095 1.82843C259.057 2.86675 258.472 4.27424 258.47 5.74264V281.136C258.472 282.604 259.057 284.012 260.095 285.05C261.134 286.088 262.541 286.673 264.009 286.676H459.929C461.397 286.673 462.805 286.088 463.843 285.05C464.882 284.012 465.466 282.604 465.469 281.136V5.74264C465.466 4.27424 464.882 2.86675 463.843 1.82843C462.805 0.790111 461.397 0.205603 459.929 0.202921H264.009Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M293.92 120.798L433.712 120.798V29.251L293.92 29.251V120.798Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M289.648 120.798L431.713 120.798V29.251L289.648 29.251V120.798Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M293.92 138.757L433.712 138.757V120.788L293.92 120.788V138.757Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M282.556 138.757L424.621 138.757V120.788L282.556 120.788V138.757Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M425.747 114.833V35.2271L295.625 35.2271V114.833L425.747 114.833Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M396.405 114.823L379.786 35.2271H353.853L370.472 114.823H396.405Z"
                            fill="white"
                          />
                          <path
                            d="M422.988 108.887C423.044 108.887 423.101 108.876 423.153 108.854C423.205 108.832 423.253 108.799 423.293 108.759C423.332 108.718 423.363 108.67 423.384 108.617C423.405 108.564 423.415 108.508 423.414 108.451V39.1129C423.414 38.9999 423.369 38.8915 423.289 38.8116C423.209 38.7317 423.101 38.6868 422.988 38.6868C422.931 38.6854 422.875 38.6955 422.823 38.7164C422.77 38.7373 422.723 38.7686 422.683 38.8085C422.643 38.8483 422.612 38.8959 422.591 38.9482C422.57 39.0005 422.56 39.0566 422.561 39.1129V108.451C422.56 108.508 422.57 108.564 422.591 108.617C422.612 108.67 422.643 108.718 422.683 108.759C422.722 108.799 422.77 108.832 422.822 108.854C422.874 108.876 422.931 108.887 422.988 108.887Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M364.902 114.823L348.282 35.2271H338.167L354.796 114.823H364.902Z"
                            fill="white"
                          />
                          <path
                            d="M296.385 114.833V35.2271H295.624V114.833H296.385Z"
                            fill="#E6E6E6"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 44.2264H428.04L428.588 37.5402H288.796L288.248 44.2264Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 55.1843H428.04L428.588 48.5082H288.796L288.248 55.1843Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 66.1419H428.04L428.588 59.4658H288.796L288.248 66.1419Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 77.1098H428.04L428.588 70.4236H288.796L288.248 77.1098Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 88.0674H428.04L428.588 81.3812H288.796L288.248 88.0674Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M288.248 99.0251H428.04L428.588 92.3389H288.796L288.248 99.0251Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M413.643 265.602H384.331V271.386H413.643V265.602Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M329.045 332.18H334.453V199.197H329.045V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 271.386H384.321V265.602H310.296V271.386Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 297.228H384.331V303.011H413.643V297.228Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 303.001H384.321V297.218H310.296V303.001Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 202.362H384.331V208.146H413.643V202.362Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 208.135H384.321V202.352H310.296V208.135Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M413.643 233.977H384.331V239.761H413.643V233.977Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M310.296 239.76H384.321V233.977H310.296V239.76Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M403.081 332.18H408.489V199.197H403.081V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M378.913 332.18H384.321V199.197H378.913V332.18Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M310.296 332.18H315.703V199.197H310.296V332.18Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M66.3348 332.18H121.712L121.712 224.744H66.3348L66.3348 332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M81.1175 332.181H66.3246V317.347H96.6206L81.1175 332.181Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M217.307 332.18H272.684V224.744H217.307V332.18Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M66.3347 327.067H230.223V224.734H66.3347V327.067Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M215.43 332.181H230.213V317.347H199.927L215.43 332.181Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M77.7996 288.482H218.748V262.873H77.7996V288.482Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M77.7996 319.559H218.748V293.95H77.7996V319.559Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M191.963 265.613H104.595C103.363 265.613 102.181 265.123 101.309 264.252C100.438 263.38 99.9483 262.198 99.9483 260.966V260.651H196.599V260.966C196.599 262.196 196.111 263.377 195.242 264.248C194.373 265.119 193.193 265.61 191.963 265.613Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M77.7996 257.394H218.748V231.786L77.7996 231.786V257.394Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M191.963 234.525H104.595C103.363 234.525 102.181 234.036 101.309 233.164C100.438 232.293 99.9483 231.111 99.9483 229.878V229.564H196.599V229.878C196.599 231.109 196.111 232.289 195.242 233.161C194.373 234.032 193.193 234.522 191.963 234.525Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M191.963 296.7H104.595C103.363 296.7 102.181 296.211 101.309 295.339C100.438 294.468 99.9483 293.286 99.9483 292.053V291.739H196.599V292.053C196.599 293.284 196.111 294.464 195.242 295.335C194.373 296.207 193.193 296.697 191.963 296.7Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M75.1516 120.798L214.943 120.798V29.251L75.1516 29.251V120.798Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M70.8903 120.798L212.955 120.798V29.251L70.8903 29.251V120.798Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M75.1516 138.757L214.943 138.757V120.788L75.1516 120.788V138.757Z"
                            fill="#E6E6E6"
                          />
                          <path
                            d="M63.7778 138.757L205.842 138.757V120.788L63.7778 120.788V138.757Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M206.979 114.833V35.2271L76.8561 35.2271V114.833L206.979 114.833Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M177.637 114.823L161.017 35.2271H135.084L151.703 114.823H177.637Z"
                            fill="white"
                          />
                          <path
                            d="M204.209 108.887C204.266 108.887 204.322 108.876 204.374 108.854C204.427 108.832 204.474 108.799 204.514 108.759C204.553 108.718 204.585 108.67 204.605 108.617C204.626 108.564 204.636 108.508 204.635 108.451V39.1129C204.636 39.0566 204.626 39.0005 204.605 38.9482C204.584 38.8959 204.553 38.8483 204.513 38.8085C204.473 38.7686 204.426 38.7373 204.373 38.7164C204.321 38.6955 204.265 38.6854 204.209 38.6868C204.096 38.6868 203.987 38.7317 203.907 38.8116C203.827 38.8915 203.783 38.9999 203.783 39.1129V108.451C203.781 108.508 203.791 108.564 203.812 108.617C203.833 108.67 203.864 108.718 203.904 108.759C203.943 108.799 203.991 108.832 204.043 108.854C204.096 108.876 204.152 108.887 204.209 108.887Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M146.133 114.823L129.514 35.2271H119.398L136.017 114.823H146.133Z"
                            fill="white"
                          />
                          <path
                            d="M77.6171 114.833V35.2271H76.8561V114.833H77.6171Z"
                            fill="#E6E6E6"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 44.2264H209.262L209.809 37.5402H70.0176L69.4697 44.2264Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 48.0008H209.262L209.809 41.3146H70.0176L69.4697 48.0008Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 51.7649H209.262L209.809 45.0889H70.0176L69.4697 51.7649Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 55.5394H209.262L209.809 48.8531H70.0176L69.4697 55.5394Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 59.3034H209.262L209.809 52.6273H70.0176L69.4697 59.3034Z"
                            fill="#EBEBEB"
                          />
                          <path
                            opacity="0.6"
                            d="M69.4697 63.0777H209.262L209.809 56.3915H70.0176L69.4697 63.0777Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M97.4221 221.457H102.252V167.592H97.4221V221.457Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M98.0308 221.427H99.4005V167.561H98.0308V221.427Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M99.9687 221.427H100.506V167.561H99.9687V221.427Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M117.724 224.745H81.9697C81.9697 223.55 82.4443 222.404 83.2891 221.559C84.1339 220.714 85.2798 220.24 86.4745 220.24H113.209C114.404 220.24 115.55 220.714 116.395 221.559C117.239 222.404 117.714 223.55 117.714 224.745H117.724Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M91.1517 201.033C91.5196 201.031 91.8716 200.883 92.1317 200.623C92.3918 200.363 92.5391 200.011 92.5417 199.643V164.366C92.5417 163.997 92.3953 163.643 92.1346 163.383C91.8739 163.122 91.5204 162.976 91.1517 162.976C90.9683 162.974 90.7865 163.009 90.6167 163.078C90.4469 163.148 90.2924 163.25 90.1623 163.379C90.0321 163.508 89.9288 163.662 89.8584 163.831C89.7879 164.001 89.7516 164.182 89.7516 164.366V199.684C89.7647 200.046 89.918 200.39 90.1792 200.641C90.4404 200.893 90.789 201.034 91.1517 201.033Z"
                            fill="#F0F0F0"
                          />
                          <path
                            d="M78.1953 180.396H121.468L116.486 150.161H83.177L78.1953 180.396Z"
                            fill="#E0E0E0"
                          />
                          <path
                            d="M253.65 378C362.297 378 450.372 372.858 450.372 366.515C450.372 360.172 362.297 355.03 253.65 355.03C145.004 355.03 56.9293 360.172 56.9293 366.515C56.9293 372.858 145.004 378 253.65 378Z"
                            fill="#F5F5F5"
                          />
                          <path
                            d="M105.639 149.511L104.627 149.584L105.975 168.295L106.987 168.222L105.639 149.511Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M107.674 177.882L106.662 177.955L107.17 184.998L108.182 184.925L107.674 177.882Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M342.641 263.959H125.354C122.935 263.915 120.618 262.978 118.85 261.327C117.081 259.677 115.986 257.43 115.776 255.02L105.103 106.756C105.003 105.613 105.145 104.461 105.517 103.376C105.89 102.29 106.486 101.295 107.267 100.454C108.048 99.6128 108.997 98.9446 110.051 98.4923C111.106 98.04 112.244 97.8137 113.392 97.8279H330.679C333.096 97.8711 335.412 98.8071 337.18 100.456C338.948 102.104 340.044 104.348 340.257 106.756L350.93 255.02C351.03 256.164 350.888 257.316 350.516 258.402C350.143 259.488 349.547 260.484 348.766 261.326C347.985 262.168 347.037 262.837 345.982 263.29C344.927 263.744 343.789 263.972 342.641 263.959Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.5"
                            d="M343.473 263.959H126.186C123.767 263.915 121.45 262.978 119.682 261.327C117.913 259.677 116.818 257.43 116.608 255.02L105.934 106.756C105.835 105.613 105.977 104.461 106.349 103.376C106.722 102.29 107.318 101.295 108.099 100.454C108.88 99.6128 109.829 98.9446 110.883 98.4923C111.938 98.04 113.076 97.8137 114.224 97.8279H331.511C333.928 97.8711 336.244 98.8071 338.012 100.456C339.78 102.104 340.876 104.348 341.089 106.756L351.762 255.02C351.863 256.164 351.723 257.317 351.351 258.404C350.979 259.49 350.383 260.487 349.602 261.329C348.821 262.172 347.872 262.841 346.816 263.294C345.76 263.747 344.622 263.973 343.473 263.959Z"
                            fill="white"
                          />
                          <path
                            d="M331.835 102.292H114.548H113.818C108.268 102.749 109.404 111.2 115.005 111.2H332.657C338.268 111.2 338.187 102.749 332.566 102.292H331.835Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M120.21 106.756C120.231 107.018 120.198 107.281 120.111 107.529C120.024 107.776 119.887 108.003 119.707 108.194C119.527 108.386 119.309 108.537 119.068 108.639C118.826 108.741 118.565 108.791 118.303 108.786C117.751 108.778 117.222 108.566 116.818 108.191C116.413 107.817 116.161 107.306 116.111 106.756C116.09 106.496 116.123 106.233 116.209 105.986C116.296 105.739 116.432 105.513 116.611 105.322C116.79 105.131 117.006 104.979 117.247 104.877C117.488 104.774 117.747 104.723 118.008 104.727C118.562 104.732 119.093 104.943 119.5 105.318C119.907 105.693 120.16 106.205 120.21 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M127.18 106.756C127.202 107.018 127.168 107.281 127.081 107.529C126.995 107.776 126.857 108.003 126.677 108.194C126.497 108.386 126.28 108.537 126.038 108.639C125.796 108.741 125.535 108.791 125.273 108.786C124.721 108.778 124.192 108.566 123.788 108.191C123.383 107.817 123.131 107.306 123.081 106.756C123.06 106.496 123.094 106.233 123.18 105.986C123.266 105.739 123.403 105.513 123.581 105.322C123.76 105.131 123.976 104.979 124.217 104.877C124.458 104.774 124.717 104.723 124.979 104.727C125.532 104.732 126.063 104.943 126.47 105.318C126.877 105.693 127.13 106.205 127.18 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M134.141 106.756C134.162 107.017 134.128 107.279 134.042 107.526C133.956 107.773 133.819 108 133.641 108.191C133.462 108.382 133.246 108.533 133.005 108.636C132.764 108.738 132.505 108.789 132.243 108.786C131.691 108.78 131.161 108.569 130.756 108.194C130.351 107.819 130.1 107.306 130.052 106.756C130.029 106.495 130.061 106.232 130.147 105.985C130.232 105.737 130.369 105.51 130.548 105.319C130.727 105.127 130.944 104.976 131.185 104.874C131.427 104.772 131.687 104.722 131.949 104.727C132.5 104.735 133.029 104.947 133.434 105.321C133.839 105.696 134.09 106.207 134.141 106.756Z"
                            fill="#FAFAFA"
                          />
                          <path
                            d="M337.71 249.166H129.869C128.991 249.151 128.15 248.811 127.509 248.211C126.867 247.611 126.472 246.794 126.399 245.919L117.623 123.994C117.584 123.576 117.634 123.154 117.771 122.757C117.907 122.359 118.127 121.995 118.414 121.689C118.702 121.383 119.052 121.142 119.44 120.981C119.829 120.821 120.247 120.745 120.667 120.758H328.558C329.436 120.77 330.277 121.108 330.918 121.706C331.56 122.305 331.955 123.12 332.028 123.994L340.815 245.919C340.853 246.343 340.8 246.77 340.659 247.171C340.519 247.573 340.294 247.94 340 248.247C339.706 248.555 339.349 248.796 338.954 248.954C338.559 249.113 338.135 249.185 337.71 249.166Z"
                            fill="white"
                          />
                          <path
                            d="M250.13 202.718L246.741 155.721L236.493 149.552H208.277L212.113 202.718H250.13Z"
                            fill="white"
                          />
                          <path
                            d="M250.13 203.204H212.113C211.987 203.207 211.865 203.161 211.772 203.076C211.679 202.991 211.623 202.873 211.615 202.748L207.79 149.583C207.785 149.516 207.795 149.449 207.817 149.386C207.84 149.323 207.876 149.266 207.922 149.218C207.967 149.167 208.022 149.127 208.083 149.099C208.144 149.071 208.21 149.056 208.277 149.055H236.493C236.582 149.058 236.669 149.083 236.747 149.126L246.995 155.295C247.064 155.334 247.122 155.39 247.164 155.457C247.207 155.525 247.232 155.601 247.238 155.681L250.607 202.677C250.614 202.745 250.605 202.814 250.583 202.879C250.56 202.944 250.523 203.003 250.475 203.052C250.43 203.1 250.377 203.138 250.318 203.164C250.259 203.19 250.194 203.204 250.13 203.204ZM212.589 202.19H249.592L246.264 155.975L236.402 150.039H208.805L212.589 202.19Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M246.741 155.721L236.493 149.552L240.258 157.73L246.741 155.721Z"
                            fill="#EBEBEB"
                          />
                          <path
                            d="M240.258 158.217C240.164 158.216 240.073 158.19 239.994 158.139C239.915 158.089 239.851 158.017 239.811 157.933L236.047 149.755C236.003 149.659 235.99 149.552 236.01 149.448C236.03 149.345 236.082 149.25 236.159 149.177C236.239 149.108 236.339 149.066 236.445 149.057C236.55 149.048 236.656 149.072 236.747 149.126L246.995 155.295C247.077 155.345 247.144 155.417 247.187 155.503C247.23 155.589 247.248 155.686 247.238 155.782C247.225 155.875 247.186 155.963 247.125 156.035C247.064 156.107 246.983 156.16 246.893 156.188L240.4 158.217H240.258ZM237.61 150.79L240.522 157.131L245.595 155.579L237.61 150.79Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M224.227 173.497C224.242 173.773 224.201 174.049 224.106 174.308C224.011 174.567 223.863 174.804 223.674 175.004C223.484 175.205 223.255 175.364 223.001 175.473C222.747 175.582 222.474 175.638 222.198 175.638C221.619 175.627 221.064 175.403 220.64 175.008C220.217 174.612 219.955 174.074 219.905 173.497C219.879 173.218 219.912 172.937 220.003 172.673C220.094 172.408 220.241 172.166 220.433 171.962C220.625 171.759 220.858 171.599 221.117 171.492C221.376 171.386 221.654 171.336 221.934 171.346C222.514 171.359 223.069 171.585 223.492 171.982C223.915 172.379 224.177 172.919 224.227 173.497Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M238.127 173.497C238.152 173.775 238.117 174.054 238.025 174.318C237.933 174.581 237.787 174.822 237.595 175.025C237.403 175.227 237.17 175.386 236.912 175.492C236.654 175.598 236.377 175.647 236.098 175.638C235.518 175.627 234.961 175.403 234.536 175.008C234.111 174.613 233.847 174.075 233.795 173.497C233.778 173.22 233.818 172.943 233.913 172.683C234.007 172.422 234.154 172.184 234.344 171.983C234.534 171.781 234.764 171.621 235.018 171.511C235.273 171.402 235.547 171.345 235.824 171.346C236.406 171.354 236.965 171.579 237.391 171.976C237.817 172.374 238.079 172.916 238.127 173.497Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M242.064 187.437C241.94 187.435 241.822 187.387 241.732 187.303C241.642 187.219 241.587 187.104 241.577 186.981C241.323 183.521 235.905 180.711 229.503 180.711C225.252 180.711 221.437 181.979 219.55 184.008C219.162 184.382 218.858 184.834 218.659 185.334C218.459 185.835 218.369 186.372 218.393 186.91C218.398 186.976 218.389 187.043 218.368 187.107C218.347 187.17 218.313 187.229 218.27 187.279C218.181 187.381 218.056 187.443 217.921 187.453C217.787 187.462 217.654 187.418 217.552 187.329C217.45 187.241 217.388 187.115 217.378 186.981C217.348 186.308 217.459 185.637 217.704 185.009C217.948 184.382 218.321 183.813 218.799 183.338C220.828 181.116 224.957 179.726 229.472 179.726C236.504 179.726 242.236 182.882 242.52 186.91C242.524 186.974 242.516 187.038 242.495 187.099C242.474 187.159 242.442 187.215 242.399 187.263C242.357 187.311 242.305 187.351 242.248 187.379C242.19 187.407 242.128 187.423 242.064 187.427V187.437Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M216.283 169.154C216.159 169.152 216.04 169.105 215.948 169.023C215.856 168.929 215.804 168.804 215.804 168.672C215.804 168.541 215.856 168.416 215.948 168.322L218.109 165.999C218.202 165.91 218.325 165.86 218.454 165.86C218.583 165.86 218.706 165.91 218.799 165.999C218.844 166.044 218.88 166.098 218.905 166.157C218.929 166.216 218.942 166.28 218.942 166.344C218.942 166.408 218.929 166.472 218.905 166.531C218.88 166.59 218.844 166.644 218.799 166.689L216.638 169.012C216.591 169.059 216.536 169.095 216.475 169.12C216.414 169.144 216.348 169.156 216.283 169.154Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M241.049 169.154C240.926 169.149 240.808 169.102 240.714 169.023L238.228 166.699C238.181 166.654 238.144 166.599 238.119 166.539C238.093 166.479 238.08 166.414 238.08 166.349C238.08 166.284 238.093 166.219 238.119 166.159C238.144 166.099 238.181 166.044 238.228 165.999C238.321 165.91 238.445 165.86 238.573 165.86C238.702 165.86 238.826 165.91 238.918 165.999L241.404 168.322C241.449 168.368 241.485 168.421 241.51 168.481C241.535 168.54 241.547 168.603 241.547 168.667C241.547 168.732 241.535 168.795 241.51 168.854C241.485 168.913 241.449 168.967 241.404 169.012C241.308 169.102 241.181 169.153 241.049 169.154Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M205.213 213.219H207.506L210.814 217.622L210.499 213.219H212.813L213.381 221.173H211.037L207.75 216.8L208.064 221.173H205.751L205.213 213.219Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M214.416 217.196C214.338 216.655 214.375 216.105 214.525 215.58C214.676 215.055 214.936 214.569 215.288 214.152C215.674 213.773 216.136 213.48 216.643 213.293C217.15 213.106 217.691 213.028 218.231 213.066C219.374 213.004 220.497 213.386 221.366 214.132C222.162 214.924 222.623 215.992 222.654 217.115C222.738 217.889 222.634 218.672 222.35 219.397C222.087 219.982 221.647 220.468 221.092 220.787C220.426 221.145 219.676 221.316 218.921 221.285C218.144 221.309 217.372 221.164 216.658 220.858C216.033 220.558 215.505 220.087 215.136 219.499C214.701 218.806 214.453 218.013 214.416 217.196ZM216.881 217.196C216.872 217.818 217.072 218.426 217.45 218.921C217.608 219.095 217.803 219.233 218.02 219.324C218.237 219.415 218.472 219.457 218.708 219.448C218.933 219.464 219.158 219.425 219.365 219.335C219.571 219.245 219.753 219.106 219.895 218.931C220.186 218.376 220.283 217.74 220.169 217.125C220.173 216.528 219.972 215.948 219.6 215.481C219.438 215.31 219.241 215.175 219.022 215.086C218.803 214.997 218.568 214.955 218.332 214.964C218.111 214.954 217.892 214.997 217.691 215.089C217.49 215.18 217.313 215.318 217.176 215.491C216.879 216.014 216.774 216.624 216.881 217.216V217.196Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M227.423 213.219H231.076C231.678 213.2 232.278 213.3 232.841 213.513C233.287 213.7 233.683 213.988 233.998 214.355C234.317 214.727 234.562 215.158 234.718 215.623C234.882 216.123 234.985 216.641 235.022 217.165C235.1 217.829 235.049 218.5 234.87 219.144C234.73 219.589 234.483 219.994 234.15 220.321C233.872 220.615 233.522 220.832 233.135 220.95C232.663 221.087 232.176 221.162 231.684 221.173H228.042L227.423 213.219ZM230.01 215.025L230.325 219.367H230.923C231.294 219.391 231.665 219.332 232.009 219.195C232.236 219.063 232.403 218.848 232.476 218.596C232.592 218.146 232.619 217.677 232.557 217.216C232.576 216.597 232.387 215.99 232.019 215.491C231.831 215.321 231.609 215.191 231.368 215.111C231.127 215.031 230.872 215.001 230.619 215.025H230.01Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M240.917 219.854H238.127L237.833 221.173H235.327L237.741 213.219H240.461L244.022 221.173H241.445L240.917 219.854ZM240.278 218.139L239.202 215.278L238.533 218.139H240.278Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M242.865 213.219H250.333L250.475 215.187H247.969L248.395 221.173H245.939L245.513 215.187H243.007L242.865 213.219Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M256.055 219.854H253.265L252.971 221.173H250.464L252.879 213.219H255.558L259.109 221.173H256.542L256.055 219.854ZM255.416 218.139L254.33 215.278L253.65 218.139H255.416Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M358.855 119.804C359.758 119.348 360.884 118.79 361.838 118.211C362.791 117.633 363.867 117.075 364.881 116.466C366.86 115.239 368.869 114.031 370.766 112.692C374.577 110.085 378.149 107.144 381.44 103.905C381.856 103.52 382.221 103.094 382.617 102.678L383.195 102.059L383.479 101.754L383.621 101.592C383.479 101.866 383.621 101.785 383.621 101.521C383.71 101.159 383.761 100.788 383.773 100.415C383.75 98.2579 383.502 96.1088 383.033 94.0029C382.13 89.4575 380.76 84.77 379.411 80.184L383.347 78.4592C385.832 82.8592 387.907 87.4781 389.546 92.2578C390.467 94.8408 391.054 97.5311 391.292 100.263C391.354 101.112 391.326 101.966 391.21 102.81C391.06 104.003 390.636 105.145 389.973 106.148L389.8 106.381L389.668 106.543L389.516 106.736L389.201 107.122L388.572 107.883C388.156 108.38 387.751 108.897 387.304 109.374C383.834 113.224 379.964 116.694 375.758 119.723C373.729 121.225 371.578 122.665 369.376 123.974C368.291 124.634 367.185 125.263 366.058 125.882C364.932 126.501 363.836 127.069 362.538 127.678L358.855 119.804Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M349.825 358.337C350.584 358.318 351.34 358.216 352.077 358.033C352.115 358.021 352.148 358 352.175 357.972C352.202 357.943 352.22 357.908 352.229 357.87C352.234 357.831 352.228 357.792 352.212 357.756C352.196 357.72 352.17 357.69 352.138 357.667C351.844 357.475 349.267 355.811 348.272 356.257C348.162 356.309 348.068 356.388 347.998 356.488C347.929 356.588 347.887 356.704 347.877 356.825C347.837 357.017 347.847 357.215 347.906 357.402C347.964 357.588 348.07 357.756 348.212 357.891C348.678 358.23 349.251 358.388 349.825 358.337ZM351.499 357.749C350.028 358.043 348.912 357.992 348.455 357.596C348.364 357.503 348.297 357.388 348.262 357.262C348.226 357.136 348.223 357.004 348.252 356.876C348.256 356.822 348.274 356.77 348.304 356.726C348.334 356.681 348.376 356.646 348.425 356.622C348.962 356.389 350.454 357.14 351.499 357.749Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M352.067 358.033H352.168C352.198 358.014 352.223 357.989 352.241 357.959C352.258 357.929 352.268 357.895 352.27 357.86C352.27 357.748 352.27 355.303 351.336 354.492C351.225 354.384 351.09 354.303 350.942 354.256C350.794 354.208 350.638 354.195 350.484 354.218C350.324 354.219 350.169 354.275 350.046 354.377C349.922 354.478 349.837 354.619 349.804 354.776C349.612 355.79 351.154 357.566 351.965 358.033C351.999 358.042 352.034 358.042 352.067 358.033ZM350.616 354.593C350.781 354.594 350.94 354.655 351.062 354.766C351.598 355.555 351.874 356.491 351.854 357.444C351.042 356.795 350.078 355.415 350.2 354.837C350.2 354.745 350.271 354.624 350.525 354.593H350.616Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M351.275 94.429C350.261 99.502 348.232 109.648 351.732 113.047C351.732 113.047 350.352 118.12 340.987 118.12C330.679 118.12 336.067 113.047 336.067 113.047C341.688 111.708 341.535 107.538 340.561 103.611L351.275 94.429Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M334.088 115.076C332.475 115.299 333.855 111.109 334.504 110.673C336.026 109.658 355.669 108.248 355.537 110.673C355.456 111.687 354.969 113.716 354.117 114.386C353.264 115.056 348.212 112.966 334.088 115.076Z"
                            fill="#263238"
                          />
                          <path
                            d="M337.294 113.635C336.006 114.072 336.128 109.851 336.564 109.344C337.579 108.167 353.477 104.088 353.944 106.391C354.127 107.406 354.218 109.435 353.67 110.155C353.122 110.876 348.455 109.689 337.294 113.635Z"
                            fill="#263238"
                          />
                          <path
                            d="M331.379 85.3382C331.315 85.341 331.252 85.3286 331.194 85.3022C331.135 85.2757 331.084 85.2359 331.044 85.186C330.735 84.7867 330.336 84.4658 329.879 84.249C329.423 84.0323 328.922 83.9257 328.417 83.938C328.364 83.9451 328.31 83.9414 328.259 83.9272C328.207 83.9131 328.159 83.8887 328.118 83.8555C328.076 83.8223 328.042 83.7811 328.016 83.7343C327.991 83.6874 327.975 83.636 327.97 83.5829C327.961 83.4784 327.994 83.3746 328.06 83.2933C328.126 83.2119 328.221 83.1594 328.325 83.1466C328.964 83.114 329.601 83.2363 330.182 83.5031C330.763 83.7699 331.272 84.1732 331.663 84.6787C331.731 84.761 331.764 84.8668 331.755 84.9732C331.745 85.0795 331.694 85.1779 331.613 85.2469C331.544 85.2963 331.463 85.3277 331.379 85.3382Z"
                            fill="#263238"
                          />
                          <path
                            d="M329.411 90.2994C328.95 91.9181 328.268 93.4649 327.382 94.8956C327.754 95.1095 328.168 95.2395 328.596 95.2763C329.023 95.3131 329.454 95.2559 329.857 95.1087L329.411 90.2994Z"
                            fill="#FF5652"
                          />
                          <path
                            d="M329.908 89.0719C329.979 89.7517 329.665 90.3401 329.218 90.3807C328.772 90.4213 328.356 89.914 328.295 89.2241C328.234 88.5342 328.538 87.9558 328.975 87.9152C329.411 87.8747 329.837 88.382 329.908 89.0719Z"
                            fill="#263238"
                          />
                          <path
                            d="M329.178 87.9355L327.493 87.621C327.493 87.621 328.457 88.8182 329.178 87.9355Z"
                            fill="#263238"
                          />
                          <path
                            d="M361.909 357.84H353.406L354.076 338.157H362.578L361.909 357.84Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M352.737 356.856H362.284C362.449 356.852 362.609 356.908 362.734 357.015C362.86 357.122 362.941 357.271 362.964 357.434L364.049 364.983C364.071 365.174 364.052 365.367 363.993 365.55C363.934 365.733 363.838 365.901 363.709 366.044C363.581 366.187 363.424 366.301 363.248 366.378C363.072 366.456 362.882 366.496 362.69 366.494C359.362 366.444 357.759 366.241 353.558 366.241C350.971 366.241 347.197 366.515 343.636 366.515C340.074 366.515 339.871 362.984 341.363 362.669C348.019 361.229 349.074 359.26 351.316 357.373C351.715 357.041 352.217 356.859 352.737 356.856Z"
                            fill="#263238"
                          />
                          <g opacity="0.2">
                            <path
                              opacity="0.2"
                              d="M362.578 338.157H354.076L353.731 348.303H362.233L362.578 338.157Z"
                              fill="black"
                            />
                          </g>
                          <path
                            d="M328.092 124.796C322.889 122.773 317.793 120.487 312.822 117.947C307.688 115.439 302.797 112.46 298.212 109.049C296.987 108.09 295.828 107.049 294.742 105.935C294.458 105.63 294.174 105.346 293.9 104.991C293.578 104.628 293.28 104.245 293.007 103.844C292.259 102.754 291.792 101.496 291.648 100.182C291.536 98.9357 291.706 97.6804 292.145 96.5089C292.496 95.5673 292.978 94.6794 293.575 93.871C294.555 92.5307 295.712 91.3293 297.015 90.2996C299.314 88.469 301.796 86.8812 304.421 85.5614C305.679 84.8917 306.958 84.2931 308.257 83.7351C309.555 83.1771 310.834 82.6495 312.224 82.1726L314.019 86.0788C309.596 88.869 305.01 91.9432 301.641 95.3726C300.888 96.1364 300.224 96.9841 299.663 97.8989C299.176 98.7005 299.186 99.2991 299.267 99.2484C299.348 99.1976 299.267 99.2483 299.409 99.3498L299.815 99.7861C299.967 99.9687 300.18 100.151 300.373 100.344C301.233 101.135 302.144 101.867 303.102 102.536C305.197 104.019 307.379 105.374 309.636 106.594C311.919 107.872 314.273 109.08 316.668 110.236C321.457 112.529 326.408 114.731 331.268 116.74L328.092 124.796Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M316.556 83.3495L317.956 80.3057L311.544 78.1243C311.544 78.1243 309.515 84.1206 311.919 86.8803C312.924 86.7221 313.874 86.3166 314.683 85.7002C315.493 85.0839 316.136 84.2761 316.556 83.3495Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M317.926 73.7209L312.822 72.2396L311.544 78.0837L317.926 80.3057V73.7209Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M383.875 80.5999L384.615 73.4977L378.041 75.0805C378.041 75.0805 377.939 81.7565 381.419 82.8117L383.875 80.5999Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M381.45 68.4956L377.158 70.4944L378.041 75.0296L384.615 73.4773L381.45 68.4956Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M352.615 84.4656C352.93 92.897 353.234 96.4582 349.429 101.176C343.697 108.278 333.277 106.807 330.456 98.6396C327.92 91.2939 327.838 78.7433 335.712 74.6037C337.443 73.6833 339.38 73.2205 341.34 73.2592C343.3 73.2979 345.218 73.8368 346.911 74.8247C348.605 75.8126 350.017 77.2169 351.016 78.9042C352.014 80.5914 352.564 82.5058 352.615 84.4656Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M348.942 101.166C357.221 97.5844 362.659 90.0054 360.366 78.2563C358.165 66.984 350.555 65.868 347.41 68.2016C344.265 70.5351 336.422 67.0551 331.714 71.012C323.597 77.8809 331.268 85.2164 335.285 89.6502C337.68 94.5812 340.825 104.666 348.942 101.166Z"
                            fill="#263238"
                          />
                          <path
                            d="M345.503 76.2372C346.513 77.5328 347.88 78.5043 349.436 79.0317C350.991 79.5592 352.667 79.6196 354.257 79.2054C355.847 78.7911 357.28 77.9205 358.381 76.7009C359.481 75.4813 360.201 73.9661 360.45 72.3424C360.699 70.7187 360.468 69.0576 359.784 67.564C359.1 66.0704 357.993 64.8098 356.601 63.9379C355.209 63.0659 353.592 62.6206 351.949 62.6571C350.307 62.6936 348.711 63.2102 347.359 64.1432C345.51 65.5011 344.275 67.5379 343.927 69.8058C343.579 72.0737 344.146 74.387 345.503 76.2372Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M347.654 68.9929C346.466 62.195 352.889 56.9597 361.493 59.4861C370.097 62.0124 365.551 69.6321 363.776 75.7197C362 81.8073 366.647 87.6108 368.575 82.9741C370.502 78.3374 367.256 76.8865 367.256 76.8865C367.256 76.8865 376.387 79.2505 367.905 89.5487C359.423 99.8469 351.742 88.4732 353.822 81.7667C355.507 76.3792 348.78 75.4153 347.654 68.9929Z"
                            fill="#263238"
                          />
                          <path
                            d="M339.06 71.5599C335.133 69.5307 328.488 67.8566 324.703 74.2283C322.917 77.2721 323.607 81.3305 323.607 81.3305L335.164 82.0915L339.06 71.5599Z"
                            fill="#263238"
                          />
                          <path
                            d="M322.248 79.3215C322.18 79.3163 322.116 79.2849 322.071 79.2338C322.025 79.1827 322.001 79.1159 322.004 79.0476C322.004 78.8751 322.299 74.7964 324.764 72.2396C330.72 66.0506 337.7 71.225 339.689 72.8991C339.732 72.9444 339.756 73.0038 339.758 73.0661C339.76 73.1284 339.739 73.1891 339.699 73.2368C339.658 73.2845 339.602 73.3157 339.541 73.3245C339.479 73.3333 339.416 73.3192 339.364 73.2847C337.447 71.641 330.77 66.7202 325.16 72.5846C322.826 75.0095 322.542 79.0375 322.542 79.078C322.541 79.1142 322.532 79.1497 322.517 79.1823C322.501 79.2148 322.478 79.2435 322.45 79.2666C322.422 79.2897 322.39 79.3065 322.355 79.316C322.32 79.3254 322.284 79.3273 322.248 79.3215Z"
                            fill="#263238"
                          />
                          <path
                            d="M336.696 89.2849C336.65 90.8812 336.059 92.4136 335.022 93.6274C333.621 95.2711 331.978 94.4594 331.643 92.6128C331.308 90.9793 331.643 88.1486 333.408 87.1644C335.174 86.1803 336.716 87.4384 336.696 89.2849Z"
                            fill="#FFB573"
                          />
                          <path
                            d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                            fill="#263238"
                          />
                          <path
                            opacity="0.1"
                            d="M334.87 166.516C334.87 166.516 335.417 225.516 340.531 258.389C344.671 284.941 352.311 346.344 352.311 346.344H363.907C363.907 346.344 365.034 287.061 362.893 260.803C357.586 194.347 371.294 181.918 360.235 166.516H334.87Z"
                            fill="white"
                          />
                          <path
                            opacity="0.3"
                            d="M340.967 193.282C345.026 211.088 341.789 239.132 339.567 251.479C337.213 232.729 336.026 208.43 335.438 190.603C337.538 187.214 339.526 186.991 340.967 193.282Z"
                            fill="black"
                          />
                          <path
                            d="M350.728 346.568H365.49L366.261 341.393L350.646 340.865L350.728 346.568Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M354.938 116.679C356.328 113.919 363.796 112.184 367.874 112.195L370.918 125.75C370.918 125.75 362.801 137.813 359.413 136.535C355.425 135.064 351.965 122.635 354.938 116.679Z"
                            fill="black"
                          />
                          <path
                            d="M346.334 343.25C346.351 343.221 346.36 343.187 346.36 343.153C346.36 343.12 346.351 343.086 346.334 343.057C346.315 343.018 346.284 342.986 346.246 342.966C346.208 342.946 346.164 342.939 346.121 342.945C345.695 343.016 341.941 343.605 341.434 344.68C341.38 344.778 341.351 344.888 341.351 345C341.351 345.112 341.38 345.222 341.434 345.32C341.521 345.48 341.646 345.617 341.798 345.717C341.95 345.818 342.125 345.88 342.306 345.898C343.534 346.02 345.35 344.315 346.263 343.28L346.334 343.25ZM341.83 344.812C342.174 344.244 344.123 343.717 345.604 343.443C344.265 344.802 343.088 345.563 342.398 345.472C342.278 345.46 342.164 345.418 342.065 345.351C341.965 345.284 341.885 345.193 341.83 345.086C341.807 345.048 341.796 345.004 341.796 344.959C341.796 344.915 341.807 344.871 341.83 344.833C341.83 344.833 341.819 344.822 341.83 344.812Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M355.192 339.648L347.42 343.108L343.96 335.894L339.435 326.458L338.898 325.362L346.669 321.903L347.268 323.14L351.651 332.282L355.192 339.648Z"
                            fill="#FFB573"
                          />
                          <path
                            opacity="0.2"
                            d="M351.651 332.282L343.96 335.894L339.435 326.458L347.268 323.141L351.651 332.282Z"
                            fill="black"
                          />
                          <path
                            d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                            fill="#263238"
                          />
                          <path
                            opacity="0.1"
                            d="M325.758 166.516C325.758 166.516 300.931 228.285 307.658 257.303C313.745 283.571 340.632 333.317 340.632 333.317L351.052 328.102C351.052 328.102 334.423 268.048 332.627 255C329.117 229.635 351.671 193.789 351.671 166.516H325.758Z"
                            fill="white"
                          />
                          <path
                            d="M346.04 342.022L353.751 336.411C353.881 336.31 354.044 336.26 354.209 336.271C354.374 336.282 354.529 336.354 354.644 336.472L359.971 341.941C360.1 342.084 360.198 342.252 360.257 342.435C360.317 342.618 360.338 342.812 360.317 343.003C360.297 343.195 360.237 343.38 360.141 343.546C360.044 343.713 359.914 343.857 359.758 343.97C357.028 345.878 355.618 346.669 352.229 349.135C350.139 350.656 345.979 354.015 343.098 356.115C340.216 358.215 338.025 355.476 339.039 354.35C343.585 349.277 344.539 346.131 345.249 343.28C345.359 342.782 345.639 342.337 346.04 342.022Z"
                            fill="#263238"
                          />
                          <path
                            d="M339.963 335.519L353.386 329.38L351.671 323.912L337.294 330.466L339.963 335.519Z"
                            fill="#407BFF"
                          />
                          <path
                            d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M332.343 116.03C331.237 113.148 321.538 109.942 316.667 108.928L314.527 124.877C314.527 124.877 322.481 136.302 325.961 135.358C330.081 134.242 334.738 122.209 332.343 116.03Z"
                            fill="black"
                          />
                          <path
                            d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.4"
                            d="M321.7 115.228C321.7 115.228 317.641 116.649 325.758 166.516H360.255C359.676 152.474 359.656 143.809 366.342 114.975C361.509 113.977 356.609 113.333 351.681 113.047C346.466 112.671 341.231 112.671 336.016 113.047C329.33 113.635 321.7 115.228 321.7 115.228Z"
                            fill="black"
                          />
                          <path
                            d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                            fill="#407BFF"
                          />
                          <path
                            opacity="0.3"
                            d="M360.793 164.497L362.345 167.541C362.467 167.785 362.183 168.028 361.787 168.028H325.586C325.271 168.028 325.018 167.876 324.997 167.673L324.683 164.629C324.683 164.416 324.936 164.233 325.271 164.233H360.184C360.3 164.215 360.419 164.23 360.526 164.277C360.634 164.324 360.727 164.4 360.793 164.497Z"
                            fill="white"
                          />
                          <path
                            d="M356.125 168.424H357.059C357.252 168.424 357.394 168.323 357.373 168.211L356.937 164.153C356.937 164.031 356.765 163.939 356.582 163.939H355.638C355.456 163.939 355.314 164.031 355.324 164.153L355.76 168.211C355.75 168.302 355.912 168.424 356.125 168.424Z"
                            fill="#263238"
                          />
                          <path
                            d="M333.408 168.424H334.342C334.524 168.424 334.667 168.323 334.656 168.211L334.22 164.153C334.22 164.031 334.048 163.939 333.855 163.939H332.921C332.729 163.939 332.597 164.031 332.607 164.153L333.043 168.211C333.053 168.302 333.216 168.424 333.408 168.424Z"
                            fill="#263238"
                          />
                        </svg>
                        <p className="text-center">No Data Available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
