"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import clientApi from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import Chart from "react-apexcharts";

const MyEffort = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();

  const [studentData, setStudentData]: any = useState({});
  const [intervalStudentData, setIntervalStudentData]: any = useState({});
  const [topperData, setTopperData]: any = useState({});
  const [intervalTopperData, setIntervalTopperData]: any = useState({});
  const [averageData, setAverageData]: any = useState({});
  const [intervalAverageData, setIntervalAverageData]: any = useState({});
  const [uniqQuesData, setUniqQuesData]: any = useState({});
  const [intervalUniqQuesData, setIntervalUniqQuesData]: any = useState({});

  const [groupParticipation, setGroupParticipation]: any = useState({
    comments: 0,
    posts: 0,
  });
  const [intervalGroupParticipation, setIntervalGroupParticipation]: any = useState({
    comments: 0,
    posts: 0,
  });
  const [persistanceData, setPersistanceData]: any = useState({
    label: '',
    count: 0,
    totalAttempts: 0,
  });
  const donutChartResponsive = [
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
  ];

  const [learningEffortDistributionChartOptions, setlearningEffortDistributionChartOptions]: any = useState({
    series: [],
    chart: {
      height: 400,
      type: "donut",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              fontSize: "16px",
              fontWeight: 400,
              formatter: (val: any, opts: any) => {
                const total = opts.globals.series.reduce((p: any, c: any) => p + c, 0);
                return Math.round((val * 100) / total) + "%";
              },
            },
            total: {
              show: true,
              label: "Learning",
              fontSize: "18px",
              fontWeight: 600,
              formatter: (w: any) => {
                const total = Math.round(
                  w.globals.seriesTotals.reduce((a: any, b: any) => {
                    return a + b;
                  }, 0)
                );
                if (total == 0) {
                  return "< 1 min";
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
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "left",
      fontSize: "12px",
      itemMargin: {
        horizontal: 0,
        vertical: 0,
      },
      formatter: function (seriesName: any, opts: any) {
        const val = Number(opts.w.globals.series[opts.seriesIndex].toFixed(2));
        return [
          '<div class="apexcharts-legend-custom-text">' + seriesName + "</div>",
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
  });

  const [assessmentEffortDistributionChartOptions, setassessmentEffortDistributionChartOptions]: any = useState({
    series: [],
    chart: {
      height: 400,
      type: "donut",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              fontSize: "16px",
              fontWeight: 400,
              formatter: (val: any, opts: any) => {
                const total = opts.globals.series.reduce((p: any, c: any) => p + c, 0);
                return Math.round((val * 100) / total) + "%";
              },
            },
            total: {
              show: true,
              label: "Practice",
              fontSize: "18px",
              fontWeight: 600,
              formatter: (w: any) => {
                const total = Math.round(
                  w.globals.seriesTotals.reduce((a: any, b: any) => {
                    return a + b;
                  }, 0)
                );
                if (total == 0) {
                  return "< 1 min";
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
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "left",
      fontSize: "12px",
      floating: false,
      itemMargin: {
        horizontal: 0,
        vertical: 0,
      },
      formatter: function (seriesName: any, opts: any) {
        const val = Number(opts.w.globals.series[opts.seriesIndex].toFixed(2));
        return [
          '<div class="apexcharts-legend-custom-text">' + seriesName + "</div>",
          '<div class="apexcharts-legend-custom-value text-right">' +
          (val > 1 ? val + " mins" : "< 1 mins") +
          "</div>",
        ];
      },
    },
    tooltip: {
      enabled: false,
    },
    labels: [],
    responsive: donutChartResponsive,
  });
  const [learningSubjectData, setLearningSubjectData]: any = useState([]);
  const [assessmentSubjectData, setAssessmentSubjectData]: any = useState([]);
  const [selectEffortTrendFilter, setSelectEffortTrendFilter]: any = useState("Attempt Count");
  const [subjectComplexityArr, setsubjectComplexityArr]: any = useState([]);
  const [selectedSubjectComplexity, setselectedSubjectComplexity]: any = useState("");
  const [allSubjectComplexity, setallSubjectComplexity]: any = useState([]);
  const [selectedQuestionDistribution, setselectedQuestionDistribution]: any = useState("");
  const [questionSubjectDistributionArr, setquestionSubjectDistributionArr]: any = useState([]);
  const [allQuestionDistribution, setallQuestionDistribution]: any = useState([]);
  const [averagePlatformTime, setaveragePlatformTime]: any = useState(null);
  const [effortTrend, seteffortTrend]: any = useState(null);
  const [effortDistributionLearning, seteffortDistributionLearning]: any = useState(null);
  const [effortDistributionPractice, seteffortDistributionPractice]: any = useState(null);
  const [persistance, setPersistance]: any = useState(null);

  const [effortTrendChartOptions, setEffortTrendChartOptions]: any = useState({
    series: [],
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
    tooltip: {
      //   y: {
      //   formatter: function(val) {
      //         return val + " hrs";
      //     }
      // }
    },
    // title: {
    //   text: "Product Trends by Month",
    //   align: "left"
    // },

    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      title: {
        text: "Date",
        offsetY: 294
      },
      categories: [],

    },
    yaxis: {
      title: { text: "Attempt Counts" },
    },
  });
  const [averagePlatformTimeChartOptions, setaveragePlatformTimeChartOptions]: any = useState({
    series: [],
    chart: {
      type: "bar",
      height: 180,
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
      formatter: function (val: number) {
        if (val == 0) {
          return "< 1 min";
        }
        const hours: number = Math.floor(val / 60);
        const min: number = Math.floor(val % 60);

        if (hours == 0) {
          return min + " mins";
        }

        if (min == 0) {
          return hours + " hours";
        }

        return hours + "hrs " + min + "m";
      },
    },
    tooltip: {
      y: {
        formatter: function (val: any) {
          if (val == 0) {
            return "< 1 min";
          }
          const hours = Math.floor(val / 60);
          const min = Math.floor(val % 60);

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
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: [,],
    },
  });
  const [subjectQuestionComplexityChartOptions, setsubjectQuestionComplexityChartOptions]: any = useState({
    series: [],
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    title: {
      text: "",
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      // title: {
      //   text: undefined
      // }
    },
    tooltip: {},
    fill: {
      opacity: 1,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetX: 40,
    },
  });
  const [questionCategoryDistributionChartOptions, setquestionCategoryDistributionChartOptions]: any = useState({
    series: [],
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    title: {
      text: "",
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetX: 40,
    },
  });
  const [persistanceChartOptions, setpersistanceChartOptions]: any = useState({
    series: [],
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
              formatter: (val: any, opts: any) => {
                const total = opts.globals.series.reduce((p: any, c: any) => p + c, 0);
                return ((val * 100) / total).toFixed(1) + "%";
              },
            },
            total: {
              show: false,
              label: "Total",
              fontSize: "16px",
              fontWeight: 500,
              formatter: (w: any) => {
                const total = Math.round(
                  w.globals.seriesTotals.reduce((a: any, b: any) => {
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
      formatter: function (seriesName: any, opts: any) {
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
  });

  const getSummaryData = async (query: any) => {
    const { data } = await clientApi.get(`/api/student/summaryByNumber${toQueryString(query)}`);
    if (!query) {
      setStudentData(data[0]);
    }
    else {
      setIntervalStudentData(data[0]);
    }
  }

  const getAveragePlatformTimeChart = (attempt: any, topper: any, average: any) => {
    const speedData: any[] = [];
    speedData[0] = {
      scorer: "Topper",
      data: topper,
    };
    speedData[1] = {
      scorer: "You",
      data: attempt,
    };
    speedData[2] = {
      scorer: "Average",
      data: average,
    };
    let temp = [];
    for (let i = 0; i < speedData.length; i++) {
      //@ts-ignore
      temp.push({
        name: speedData[i].scorer,
        data: [speedData[i].data],
      });
      // }
    }
    setaveragePlatformTimeChartOptions({
      ...averagePlatformTimeChartOptions,
      series: temp,
    })
  }
  const drawEffortTrendAttemptCount = (user: any, average: any, topper: any, reload?: any) => {
    const attemptAverageCount: any = [];
    const attemptCount: any = [];
    const topperAttemptCount: any = [];
    user.forEach((e: any) => {
      average.forEach((a: any) => {
        if (e._id.day === a._id.day) {
          attemptAverageCount.push(Math.round(a.averageAttemptCount));
        }
      });
    });
    user.forEach((e: any) => {
      topper.forEach((a: any) => {
        if (e._id.day === a._id.day) {
          topperAttemptCount.push(a.topperAttemptCount);
        }
      });
    });
    user.forEach((element: any) => {
      attemptCount.push(element.attemptCount);
    });
    if (reload) {
      const dates: any = [];
      user.forEach((element: any) => {
        const date = element._id.day + "/" + element._id.month;
        dates.push(date);
      });
      // effortTrendChart.updateOptions({
      //   xaxis: { categories: dates },
      //   yaxis: {
      //     show: true,
      //     title: { text: "Attempt Counts" },
      //     forceNiceScale: true,
      //   },
      // });
      // effortTrendChart.updateSeries([
      //   {
      //     name: "Topper",
      //     data: topperAttemptCount,
      //   },
      //   {
      //     name: "You",
      //     data: attemptCount,
      //   },
      //   {
      //     name: "Average",
      //     data: attemptAverageCount,
      //   },
      // ]);
    } else {
      let temp: any = [];
      user.forEach((element: any) => {
        const date = element._id.day + "/" + element._id.month;
        temp.push(date);
      });
      setEffortTrendChartOptions({
        ...effortTrendChartOptions,
        xaxis: {
          title: {
            text: "Date",
            offsetY: 80,
          },
          categories: temp,
        },
        series: [
          {
            name: "Topper",
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
        ]
      })
    }
  }
  const drawEffortTrendTimeSpent = (user: any, average: any, topper: any) => {
    const averageTime: any = [];
    const attemptTime: any = [];
    const topperTime: any = [];
    if (user.length > 1) {
      user.sort((a: any, b: any) => {
        return parseFloat(a._id.day) - parseFloat(b._id.day);
      });
    }
    user.forEach((e: any) => {
      average.forEach((a: any) => {
        if (e._id.day === a._id.day) {
          if (Number(a.averageTimeSpent) >= Number(0.6)) {
            if (Number(a.averageTimeSpent) >= Number(0.6)) {
              const n = Number(a.averageTimeSpent);
              a.averageTimeSpent = Number(
                Math.floor(Number(a.averageTimeSpent) / 0.6)
              );
              const add = Number((n / 0.6) % 1);
              a.averageTimeSpent = Number(a.averageTimeSpent) + Number(add);
            }
            a.averageTimeSpent = a.averageTimeSpent;
          }
          averageTime.push(Number(a.averageTimeSpent).toFixed(1));
        }
      });
    });
    user.forEach((e: any) => {
      topper.forEach((a: any) => {
        if (e._id.day === a._id.day) {
          if (Number(a.topperTimeSpent) >= Number(0.6)) {
            const n = Number(a.topperTimeSpent);
            a.topperTimeSpent = Number(
              Math.floor(Number(a.topperTimeSpent) / 0.6)
            );
            const add = Number((n / 0.6) % 1);
            a.topperTimeSpent = Number(a.topperTimeSpent) + Number(add);
          }
          topperTime.push(Number(a.topperTimeSpent).toFixed(1));
        }
      });
    });
    const dates: any = [];
    user.forEach((element: any) => {
      const date = element._id.day + "/" + element._id.month;
      dates.push(date);
    });
    // effortTrendChart.updateOptions({
    //   xaxis: { categories: dates },
    //   yaxis: { show: true, title: { text: "Time Spent (hrs)" } },
    // });

    user.forEach((element: any) => {
      if (Number(element.timeSpent) >= Number(0.6)) {
        const n = Number(element.timeSpent);
        element.timeSpent = Number(Math.floor(Number(element.timeSpent) / 0.6));
        const add = Number((n / 0.6) % 1);
        element.timeSpent = Number(element.timeSpent) + Number(add);
      }
      attemptTime.push(Number(element.timeSpent).toFixed(1));
    });
    //     this.effortTrendChartOptions.tooltip = {y:{formatter: function(val) {
    //       return val + " hrs";
    //   }
    // }
    // }
    // effortTrendChart.updateSeries([
    //   {
    //     name: "Topper",
    //     data: topperTime,
    //   },
    //   {
    //     name: "You",
    //     data: attemptTime,
    //   },
    //   {
    //     name: "Average",
    //     data: averageTime,
    //   },
    // ]);
  }
  const drawLearningEffortDistribution = (data: any) => {
    let totalTimeSpent = 0;
    data.forEach((element: any) => {
      totalTimeSpent = totalTimeSpent + element.timeSpent;
    });
    const timeSpents: any = [];
    const labels: any = [];
    data.forEach((element: any) => {
      if (element.subjectName) {
        timeSpents.push(element.timeSpent);
        labels.push(element.subjectName);
      }
    });
    setlearningEffortDistributionChartOptions({
      ...learningEffortDistributionChartOptions,
      series: timeSpents,
      labels,
    });
    learningEffortDistributionChartOptions.series = timeSpents;
    learningEffortDistributionChartOptions.labels = labels;
  }
  const drawAssessmentEffortDistribution = (data: any) => {
    let totalSubjectsCount = 0;
    const dataCount: any = [];
    const labels: any = [];
    data.forEach((element: any) => {
      totalSubjectsCount = element.total + totalSubjectsCount;
    });
    data.forEach((element: any) => {
      dataCount.push(element.total);
      labels.push(element.name);
    });
    setassessmentEffortDistributionChartOptions({
      ...assessmentEffortDistributionChartOptions,
      series: dataCount,
      labels,
    })
  }
  const drawSubjectQuestionComplexity = (data: any) => {
    const correct: any = [];
    const wrong: any = [];
    const missed: any = [];
    const skipped: any = [];
    const partial: any = [];
    const temp: any = [];
    data.forEach((element: any) => {
      correct.push(element.correct);
      wrong.push(element.incorrect);
      missed.push(element.missed);
      skipped.push(element.skipped);
      partial.push(element.partial);
      temp.push(element._id.complexity);
    });
    setsubjectQuestionComplexityChartOptions({
      ...subjectQuestionComplexityChartOptions,
      xaxis: { categories: temp },
      series: [
        {
          name: "Correct",
          data: correct,
        },
        {
          name: "Wrong",
          data: wrong,
        },
        {
          name: "Missed",
          data: missed,
        },
        {
          name: "Skipped",
          data: skipped,
        },
        {
          name: "Partial",
          data: partial,
        },
      ]
    })
  }
  const drawQuestionCategoryDistribution = (data: any, reload?: any) => {
    const correct: any = [];
    const wrong: any = [];
    const missed: any = [];
    const skipped: any = [];
    const partial: any = [];
    const categories: any = [];
    data.forEach((element: any) => {
      correct.push(element.correct);
      wrong.push(element.incorrect);
      missed.push(element.missed);
      skipped.push(element.skipped);
      partial.push(element.partial);
      categories.push(element._id.category);
    });
    setquestionCategoryDistributionChartOptions({
      ...questionCategoryDistributionChartOptions,
      xaxis: { categories: categories },
      series: [
        {
          name: "Correct",
          data: correct,
        },
        {
          name: "Wrong",
          data: wrong,
        },
        {
          name: "Missed",
          data: missed,
        },
        {
          name: "Skipped",
          data: skipped,
        },
        {
          name: "Partial",
          data: partial,
        },
      ]
    })

  }

  const drawPersistanceGraph = (data: any) => {
    const totalAttempts = data.totalAttempt;
    const statusCount = [];
    const labels = ["Abandoned", "Finished"];
    let temp = [];
    temp.push({
      label: "Abandoned",
      count: data.abandoned,
      totalAttempts: data.totalAttempt,
    });
    temp.push({
      label: "Finished",
      count: data.success,
      totalAttempts: data.totalAttempt,
    });
    setPersistanceData(temp);
    statusCount[0] = Number(
      ((data.abandoned / totalAttempts) * 100, 1)
    );
    statusCount[1] = Number(((data.success / totalAttempts) * 100, 1));
    setpersistanceChartOptions({
      ...persistanceChartOptions,
      series: statusCount,
      labels,
    })
  }

  const filterEffortTrend = async (filter: any) => {
    if (filter === "time_spent") {
      let userSpentTime: any = [];
      let averageSpentTime: any = [];
      let topperSpentTime: any = [];

      const dtemp = await clientApi.get(`/api/student/getEffortTrendAttemptTotalTime`);
      const ctemp = await clientApi.get(`/api/student/getEffortTrendCourseTimeSpent`);
      const d = dtemp.data;
      const c = ctemp.data;

      if (d.user && d.user.length > 0 && c.user && c.user.length > 0) {
        d.user.forEach((at: any) => {
          c.user.forEach((ct: any) => {
            if (at._id.day === ct._id.day) {
              const totalTime = at.timeSpent + ct.totalTimeSpent;
              const date = at._id;
              userSpentTime.push({
                _id: date,
                timeSpent: totalTime.toFixed(2),
              });
            }
          });
        });
        let resultUserAttempt = d.user.filter((o1: any) => {
          // filter out (!) items in result2
          return !userSpentTime.some((o2: any) => {
            return o1._id.day === o2._id.day; // assumes unique id
          });
        });
        resultUserAttempt = resultUserAttempt.concat(userSpentTime);
        let resultUserCourse = c.user.filter((o1: any) => {
          // filter out (!) items in result2
          return !resultUserAttempt.some((o2: any) => {
            return o1._id.day === o2._id.day; // assumes unique id
          });
        });
        resultUserCourse = resultUserCourse.concat(resultUserAttempt);
        userSpentTime = resultUserCourse;
      }
      if (
        d.user &&
        d.user.length > 0 &&
        c.user &&
        c.user.length === 0
      ) {
        d.user.forEach((element: any) => {
          userSpentTime.push({
            _id: element._id,
            timeSpent: element.timeSpent.toFixed(2),
          });
        });
      }
      if (
        d.user &&
        d.user.length === 0 &&
        c.user &&
        c.user.length > 0
      ) {
        c.user.forEach((element: any) => {
          userSpentTime.push({
            _id: element._id,
            timeSpent: element.timeSpent.toFixed(2),
          });
        });
        // userSpentTime = c.user
      }

      //for average
      if (
        d.average &&
        d.average.length > 0 &&
        c.average &&
        c.average.length > 0
      ) {
        d.average.forEach((at: any) => {
          c.average.forEach((ct: any) => {
            if (at._id.day === ct._id.day) {
              const totalTime =
                at.averageTimeSpent + ct.averageTimeSpent;
              const date = at._id;
              averageSpentTime.push({
                _id: date,
                averageTimeSpent: totalTime.toFixed(2),
              });
            }
          });
        });
        let resultAttempt = d.average.filter((o1: any) => {
          // filter out (!) items in result2
          return !averageSpentTime.some((o2: any) => {
            return o1._id.day === o2._id.day; // assumes unique id
          });
        });
        resultAttempt = resultAttempt.concat(averageSpentTime);
        let resultCourse = c.average.filter((o1: any) => {
          // filter out (!) items in result2
          return !resultAttempt.some((o2: any) => {
            return o1._id.day === o2._id.day; // assumes unique id
          });
        });
        resultCourse = resultCourse.concat(resultAttempt);
        averageSpentTime = resultCourse;
      }
      if (
        d.average &&
        d.average.length > 0 &&
        c.average &&
        c.average.length === 0
      ) {
        d.average.forEach((element: any) => {
          averageSpentTime.push({
            _id: element._id,
            averageTimeSpent: element.averageTimeSpent.toFixed(2),
          });
        });
        // averageSpentTime = d.average
      }
      if (
        d.average &&
        d.average.length === 0 &&
        c.average &&
        c.average.length > 0
      ) {
        c.average.forEach((element: any) => {
          averageSpentTime.push({
            _id: element._id,
            averageTimeSpent: element.averageTimeSpent.toFixed(2),
          });
        });

        // averageSpentTime = c.average
      }

      // for topper
      if (
        d.topper &&
        d.topper.length > 0 &&
        c.topper &&
        c.topper.length > 0
      ) {
        d.topper.forEach((at: any) => {
          c.topper.forEach((ct: any) => {
            if (at._id.day === ct._id.day) {
              const totalTime = at.topperTimeSpent + ct.topperTimeSpent;
              const date = at._id;
              topperSpentTime.push({
                _id: date,
                topperTimeSpent: totalTime.toFixed(2),
              });
            }
          });
        });
        let resultTopperAttempt = d.topper.filter((o1: any) => {
          // filter out (!) items in result2
          return !topperSpentTime.some((o2: any) => {
            return o1._id.day === o2._id.day; // assumes unique id
          });
        });
        resultTopperAttempt =
          resultTopperAttempt.concat(topperSpentTime);
        let resultTopperCourse = c.topper.filter((o1: any) => {
          // filter out (!) items in result2
          return !resultTopperAttempt.some((o2: any) => {
            return o1._id.day === o2._id.day; // assumes unique id
          });
        });
        resultTopperCourse =
          resultTopperCourse.concat(resultTopperAttempt);
        topperSpentTime = resultTopperCourse;
      }
      if (
        d.topper &&
        d.topper.length > 0 &&
        c.topper &&
        c.topper.length === 0
      ) {
        d.topper.forEach((element: any) => {
          topperSpentTime.push({
            _id: element._id,
            topperTimeSpent: element.topperTimeSpent.toFixed(2),
          });
        });
        // topperSpentTime = d.topper
      }
      if (
        d.topper &&
        d.topper.length === 0 &&
        c.topper &&
        c.topper.length > 0
      ) {
        d.topper.forEach((element: any) => {
          topperSpentTime.push({
            _id: element._id,
            topperTimeSpent: element.topperTimeSpent.toFixed(2),
          });
        });
      }
      drawEffortTrendTimeSpent(
        userSpentTime,
        averageSpentTime,
        topperSpentTime
      );
      setSelectEffortTrendFilter('Time Spent')
    }
    if (filter === "attempt_count") {
      const { data }: any = await clientApi.get(`/api/student/getEffortTrendAttemptCount`);
      drawEffortTrendAttemptCount(data.user, data.average, data.topper, true);
      setSelectEffortTrendFilter("Attempt Count");
    }
  }
  const filterSubjectComplexity = (filter: any) => {
    setselectedSubjectComplexity(filter);
    const filterData = allSubjectComplexity.filter(
      (sub: any) => sub.subjectName.toLowerCase() === filter.toLowerCase()
    );
    const data = filterData;
    drawSubjectQuestionComplexity(data);
  }
  const filterQuestionDistribution = (filter: any) => {
    setselectedQuestionDistribution(filter);
    const filterData = allQuestionDistribution.filter(
      (sub: any) => sub.subjectName.toLowerCase() === filter.toLowerCase()
    );
    const data = filterData;
    drawQuestionCategoryDistribution(data, true);
  }

  const getUniqueQuestionsCount = async (query: any) => {
    const { data } = await clientApi.get(`/api/student/getUniqueQuestionsCount${toQueryString(query)}`);
    if (!query) {
      setUniqQuesData(data);
    }
    else {
      setIntervalUniqQuesData(data)
    }
  }
  const getTopperSummaryByNumber = async (query: any) => {
    const { data } = await clientApi.get(`/api/student/topperSummaryByNumber${toQueryString(query)}`);
    if (!query) {
      setTopperData(data.topper);
      setAverageData(data.average);
    } else {
      setIntervalTopperData(data.topper);
      setIntervalAverageData(data.average);
    }
  }

  const getTextualAnalysis = async (query: any) => {
    const { data } = await clientApi.get(`/api/student/textualAnalysis${toQueryString(query)}`);
    drawAssessmentEffortDistribution(data.subjects);
    setAssessmentSubjectData(data.subjects);
  }

  const getEffortTrendAttemptCount = async (query: any) => {
    const { data }: any = await clientApi.get(`/api/student/getEffortTrendAttemptCount${toQueryString(query)}`);
    seteffortTrend(data);
    drawEffortTrendAttemptCount(data.user, data.average, data.topper);
  }
  const getLearningEffortDistribution = async (query: any) => {
    const { data }: any = await clientApi.get(`/api/student/getLearningEffortDistribution${toQueryString(query)}`);
    setLearningSubjectData(data);
    drawLearningEffortDistribution(data);
  }
  const getAverageTimeOnPlatform = async (query: any) => {
    const { data }: any = await clientApi.get(`/api/student/getAverageTimeOnPlatform${toQueryString(query)}`);
    setaveragePlatformTime(data);
    getAveragePlatformTimeChart(
      data.user.toFixed(2),
      data.topper.toFixed(2),
      data.average.toFixed(2)
    );
  }
  const getGroupParticipation = async (query: any) => {
    const { data }: any = await clientApi.get(`/api/student/getGroupParticipation${toQueryString(query)}`);
    if (query) {
      if (data.length > 0) {
        setIntervalGroupParticipation({
          ...intervalGroupParticipation,
          comments: data[0].comments,
          posts: data[0].posts
        })
      } else {
        setIntervalGroupParticipation({
          ...intervalGroupParticipation,
          comments: 0,
          posts: 0
        })
      }
    }
    else {
      if (data.length > 0) {
        setGroupParticipation({
          ...groupParticipation,
          comments: data[0].comments,
          posts: data[0].posts
        })
      } else {
        setGroupParticipation({
          ...groupParticipation,
          comments: 0,
          posts: 0
        })
      }
    }
  }
  const getPersistanceData = async (query: any) => {
    const { data }: any = await clientApi.get(`/api/student/getPersistanceData${toQueryString(query)}`);
    setPersistance(data);
    if (data && data.length > 0) {
      drawPersistanceGraph(data[0]);
    }
  }

  const getQuestionCategoryDistribution = async () => {
    const { data } = await clientApi.get(`/api/student/questionCategoryDistribution`);
    setallQuestionDistribution(data);
    if (data && data.length > 0) {
      data.forEach((element: any) => {
        if (
          !questionSubjectDistributionArr.some(
            (sub: any) => sub._id === element._id.subject
          )
        ) {
          questionSubjectDistributionArr.push({
            _id: element._id.subject,
            name: element.subjectName,
          });
        }

        // if(element._id)
      });
      setselectedQuestionDistribution(questionSubjectDistributionArr[0].name)
      const filterData = data.filter(
        (sub: any) => sub.subjectName.toLowerCase() === selectedQuestionDistribution.toLowerCase()
      );
      const temp = filterData;
      drawQuestionCategoryDistribution(temp);
    }
  }

  const getSubjectQuestionComplexity = async () => {
    const { data } = await clientApi.get(`/api/student/getSubjectQuestionComplexity`);
    if (data && data.length > 0) {
      setallSubjectComplexity(data);
      data.forEach((element: any) => {
        if (
          !subjectComplexityArr.some(
            (sub: any) => sub._id === element._id.subject
          )
        ) {
          let temp = subjectComplexityArr;
          temp.push({
            _id: element._id.subject,
            name: element.subjectName,
          });
          setsubjectComplexityArr(temp)
        }
      });
      setselectedSubjectComplexity(subjectComplexityArr[0].name)
      const filterData = data.filter(
        (sub: any) =>
          sub.subjectName.toLowerCase() ===
          selectedSubjectComplexity.toLowerCase()
      );
      const temp = filterData;
      // calling chart component too soon, it will not be available
      setTimeout(() => {
        drawSubjectQuestionComplexity(temp);
      }, 1000);
    }
  }



  useEffect(() => {
    getSummaryData('');
    getSummaryData({ limit: "15days" });
    getUniqueQuestionsCount('');
    getUniqueQuestionsCount({ limit: "15days" })
    getTopperSummaryByNumber('')
    getTopperSummaryByNumber({ limit: "15days" })
    getSubjectQuestionComplexity();
    getQuestionCategoryDistribution();
    getTextualAnalysis('');
    getEffortTrendAttemptCount('');
    getLearningEffortDistribution('');
    getAverageTimeOnPlatform('');
    getGroupParticipation('');
    getGroupParticipation({ limit: "15days" });
    getPersistanceData('');
  }, []);
  return (
    <main className="p-0 my-effort-container">
      <div className="container">
        <div className="mx-auto">
          <div className="container5 bg-white">
            <div className="overall-analytics">
              <section className="details details_top_area_common">
                <div className="container">
                  <div className="asses-info">
                    <div className="title-wrap clearfix">
                      <div className="title">
                        <h3 className="main_title over-head1 text-white pl-0">My Efforts</h3>
                      </div>
                    </div>
                    <span className="bottom_title text-white">Analytics Overview</span>
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
                        <p className="over1">You</p>
                        <div className="over2">
                          {
                            studentData && studentData.totalAttempt &&
                            <h4 className="big_num">
                              {Math.round((studentData.totalAttempt ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !studentData || !studentData.totalAttempt &&
                            <h4 className="big_num">0</h4>
                          }
                          {
                            intervalStudentData && intervalStudentData.totalAttempt &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              <span className="persist-arrow">{Math.round((intervalStudentData.totalAttempt ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Average</p>
                        <div className="over2">
                          {
                            averageData?.totalAttempt &&
                            <h4 className="big_num">
                              {Math.round((averageData?.totalAttempt ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !averageData || !averageData.totalAttempt &&
                            <h4 className="big_num">0</h4>
                          }
                          {
                            intervalAverageData && intervalAverageData.totalAttempt &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow">{Math.round((intervalAverageData?.totalAttempt ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Best</p>
                        <div className="over2">
                          {
                            topperData && topperData.totalAttempt &&
                            <h4 className="big_num">
                              {Math.round((topperData?.totalAttempt ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !topperData || !topperData.totalAttempt && <h4 className="big_num">0</h4>
                          }
                          {
                            intervalTopperData && intervalTopperData.totalAttempt &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow">{Math.round((intervalTopperData?.totalAttempt ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                    <p className="over-0 text-left">*Attempts in last 15 days</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="admin-box new-admin-box data_ana_box">
                    <div className="overall-head">Assessments</div>
                    <div className="form-row mx-0 my-2">
                      <div className="col-4">
                        <p className="over1">You</p>
                        <div className="over2">
                          {
                            studentData && studentData.totalTest &&
                            <h4 className="big_num">
                              {Math.round((studentData.totalTest ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !studentData || !studentData.totalTest &&
                            <h4 className="big_num">0</h4>
                          }
                          {
                            intervalStudentData && intervalStudentData.totalTest &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow">{Math.round((intervalStudentData.totalTest ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Average</p>
                        <div className="over2">
                          {
                            averageData && averageData.totalTest &&
                            <h4 className="big_num">{Math.round((averageData?.totalTest ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !averageData || !averageData.totalTest &&
                            <h4 className="big_num">0</h4>
                          }
                          {
                            intervalAverageData && intervalAverageData.totalTest &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow">{Math.round((intervalAverageData?.totalTest ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Best</p>
                        <div className="over2">
                          {
                            topperData && topperData.totalTest &&
                            <h4 className="big_num">{Math.round((topperData?.totalTest ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !topperData || !topperData.totalTest &&
                            <h4 className="big_num">0</h4>
                          }
                          {
                            intervalTopperData && intervalTopperData.totalTest &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow">{Math.round((intervalTopperData?.totalTest ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                    <p className="over-0 text-left">*Assessments taken in last 15 days</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="admin-box new-admin-box data_ana_box">
                    <div className="overall-head">Questions</div>
                    <div className="form-row mx-0 my-2">
                      <div className="col-4">
                        <p className="over1">You</p>
                        <div className="over-2">
                          {
                            uniqQuesData && uniqQuesData.user &&
                            <h4 className="big_num">
                              {Math.round((uniqQuesData?.user[0]?.doQuestion ?? 0) * 10) / 10}</h4>
                          }
                          {
                            intervalUniqQuesData && intervalUniqQuesData.user && intervalUniqQuesData.user[0] &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              <span className="persist-arrow">
                                {Math.round((intervalUniqQuesData?.user[0]?.doQuestion ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Average</p>
                        <div className="over2">
                          {
                            uniqQuesData && uniqQuesData.user &&
                            <h4 className="big_num">{((Math.round(uniqQuesData?.average[0]?.average) ?? 0) * 10) / 10}</h4>
                          }
                          {
                            intervalUniqQuesData && intervalUniqQuesData.average && intervalUniqQuesData.average[0] &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span
                                className="persist-arrow">{Math.round((intervalUniqQuesData?.average[0]?.average ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Best</p>
                        <div className="over2">
                          {
                            uniqQuesData && uniqQuesData.user &&
                            <h4 className="big_num">{Math.round((uniqQuesData?.topper[0]?.doQuestion ?? 0) * 10) / 10}</h4>
                          }
                          {
                            intervalUniqQuesData && intervalUniqQuesData.topper && intervalUniqQuesData.topper[0] &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span
                                className="persist-arrow">{Math.round((intervalUniqQuesData?.topper[0]?.doQuestion ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                    <p className="over-0 text-left">*Questions attempted in last 15 days</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="admin-box new-admin-box data_ana_box">
                    <div className="overall-head">Average Marks</div>
                    <div className="form-row mx-0 my-2">
                      <div className="col-4">
                        <p className="over1">You</p>
                        <div className="over2">
                          {
                            studentData && studentData.totalMark &&
                            <h4 className="big_num">
                              {Math.round((studentData.totalMark ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !studentData || !studentData.totalMark && <h4 className="big_num">0</h4>
                          }
                          {
                            intervalStudentData && intervalStudentData.totalMark &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow">{Math.round((intervalStudentData.totalMark ?? 0) * 10) / 10}</span>
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Average</p>
                        <div className="over2">
                          {
                            averageData && averageData.totalMark &&
                            <h4 className="big_num">{Math.round((averageData?.totalMark ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !averageData || !averageData.totalMark &&
                            <h4 className="big_num" >0</h4>
                          }
                          {
                            intervalAverageData && intervalAverageData.totalMark &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span>
                              {
                                intervalUniqQuesData?.average && <span className="persist-arrow">{Math.round((intervalAverageData?.totalMark ?? 0) * 10) / 10}</span>
                              }
                            </p>
                          }
                        </div>
                      </div>
                      <div className="col-4">
                        <p className="over1">Best</p>
                        <div className="over2">
                          {
                            topperData && topperData.totalMark &&
                            <h4 className="big_num">{Math.round((topperData?.totalMark ?? 0) * 10) / 10}</h4>
                          }
                          {
                            !topperData || !topperData.totalMark && <h4 className="big_num">0</h4>
                          }
                          {
                            intervalTopperData && intervalTopperData.totalMark &&
                            <p className="over3 d-flex align-items-center justify-content-center mr-1">
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span>
                              {
                                intervalUniqQuesData?.topper &&
                                <span className="persist-arrow">{Math.round((intervalTopperData?.totalMark ?? 0) * 10) / 10}</span>
                              }
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                    <p className="over-0 text-left">*Marks obtained in last 15 days</p>
                  </div>
                </div>

              </div>
              <div className="chart_boxes admin-box2">
                <div className="admin-header">
                  <h4 className="admin-head">Average Time Spent</h4>
                  <p className="admin-head2">Total Time spent on the platform in the last 30 Days.</p>
                </div>
                {
                  averagePlatformTime && averagePlatformTime.user &&
                  <div className="chart_area_body new-body-chart_area_body" style={{ minHeight: "unset" }}>
                    <Chart
                      options={averagePlatformTimeChartOptions}
                      series={averagePlatformTimeChartOptions.series}
                      height={180}
                      type="bar"
                    />
                    {/* <apx-chart #average_platform_time_chart
                                    *ngIf="averagePlatformTimeChartOptions
                                    && averagePlatformTimeChartOptions.series && averagePlatformTimeChartOptions.series.length>0 "
                                    [series]="averagePlatformTimeChartOptions.series" [chart]="averagePlatformTimeChartOptions.chart"
                                    [tooltip]="averagePlatformTimeChartOptions.tooltip"
                                    [dataLabels]="averagePlatformTimeChartOptions.dataLabels"
                                    [xaxis]="averagePlatformTimeChartOptions.xaxis"
                                    [plotOptions]="averagePlatformTimeChartOptions.plotOptions"
                                    [stroke]="averagePlatformTimeChartOptions.stroke" [isDisabled]="true">
                                </apx-chart> */}
                  </div>
                }
                {
                  !averagePlatformTime || (averagePlatformTime && !averagePlatformTime.user) &&
                  <div className="chart_area_body new-body-chart_area_body text-center">
                    <svg width="120" height="62" viewBox="0 0 132 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M113.922 25.4102H18.0792C16.9757 25.4102 16.082 25.8299 16.082 26.3482V35.727C16.082 36.2453 16.9757 36.665 18.0792 36.665H113.922C115.025 36.665 115.919 36.2453 115.919 35.727V26.3476C115.919 25.8299 115.025 25.4102 113.922 25.4102Z"
                        fill="#AAAAD5" fillOpacity="0.5" />
                      <path
                        d="M74.265 11.0661V11.0332H18.0792C16.9757 11.0332 16.082 11.4529 16.082 11.9713V21.35C16.082 21.8683 16.9757 22.2881 18.0792 22.2881H74.265V22.2552C74.6929 22.2038 75.0723 22.087 75.3435 21.9233C75.6147 21.7595 75.7623 21.5581 75.7632 21.3506V11.9706C75.7632 11.5342 75.1256 11.1708 74.265 11.0661Z"
                        fill="#AAAAD5" fillOpacity="0.5" />
                      <path
                        d="M86.966 39.7129H18.0792C16.9757 39.7129 16.082 40.1326 16.082 40.651V50.0297C16.082 50.548 16.9757 50.9678 18.0792 50.9678H86.966C88.0696 50.9678 88.9632 50.548 88.9632 50.0297V40.651C88.9632 40.1326 88.0696 39.7129 86.966 39.7129Z"
                        fill="#AAAAD5" fillOpacity="0.5" />
                    </svg>
                    <h2 className="text-muted">No data yet</h2>
                    <p className="text-muted">Spend sometime to see your progress</p>
                  </div>
                }
              </div>
              <div className="chart_boxes over-box1">
                <div className="admin-header">
                  <h4 className="admin-head">Effort Trend</h4>
                  <p className="admin-head2">Total Attempts and Time Spent in the last 15 Days
                  </p>
                </div>
                {
                  effortTrend && effortTrend.user && effortTrend.user.length > 0 &&
                  <div className="chart_area_body new-body-chart_area_body">
                    <Chart
                      id="trend-effect"
                      options={effortTrendChartOptions}
                      series={effortTrendChartOptions.series}
                      height={effortTrendChartOptions.chart.height}
                      type={effortTrendChartOptions.chart.type}
                    />
                    {/* <apx-chart #effortTrendChart
                                    *ngIf="effortTrendChartOptions.series && effortTrendChartOptions.series.length>0"
                                    [series]="effortTrendChartOptions.series" [chart]="effortTrendChartOptions.chart"
                                    [xaxis]="effortTrendChartOptions.xaxis" [dataLabels]="effortTrendChartOptions.dataLabels"
                                    [yaxis]="effortTrendChartOptions.yaxis"
                                    [grid]="effortTrendChartOptions.grid" [stroke]="effortTrendChartOptions.stroke"
                                    [title]="effortTrendChartOptions.title">
                                </apx-chart> */}
                    <div className="filter-area clearfix">

                      <div className="filter-item">

                        <div className="dropdown">
                          <a className="btn dropdown-toggle border-0" href="#" role="button" id="Effort_Trend_filterLavel"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span>{selectEffortTrendFilter}</span>
                          </a>

                          <div className="dropdown-menu border-0 py-0" aria-labelledby="filterLavel">
                            <a className="dropdown-item" onClick={() => filterEffortTrend('attempt_count')}>Attempt Count</a>
                            <a className="dropdown-item" onClick={() => filterEffortTrend('time_spent')}>Time Spent</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {
                  !effortTrend || (effortTrend && effortTrend.user && effortTrend.user.length == 0) &&
                  <div className="chart_boxes over-box-1 text-center">
                    <svg width="244" height="244" viewBox="0 0 244 244" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M30.5 193.167H213.5V213.5H30.5V193.167ZM61 162.667C72.1833 162.667 81.3333 153.517 81.3333 142.333C81.3333 137.25 79.3 132.167 76.25 129.117L89.4667 101.667H91.5C96.5833 101.667 101.667 99.6333 104.717 96.5833L132.167 110.817V111.833C132.167 123.017 141.317 132.167 152.5 132.167C163.683 132.167 172.833 123.017 172.833 111.833C172.833 106.75 170.8 102.683 167.75 98.6167L180.967 71.1667H183C194.183 71.1667 203.333 62.0167 203.333 50.8333C203.333 39.65 194.183 30.5 183 30.5C171.817 30.5 162.667 39.65 162.667 50.8333C162.667 55.9167 164.7 61 167.75 64.05L154.533 91.5H152.5C147.417 91.5 142.333 93.5333 139.283 96.5833L111.833 83.3667V81.3333C111.833 70.15 102.683 61 91.5 61C80.3167 61 71.1667 70.15 71.1667 81.3333C71.1667 86.4167 73.2 91.5 76.25 94.55L63.0333 122H61C49.8167 122 40.6667 131.15 40.6667 142.333C40.6667 153.517 49.8167 162.667 61 162.667Z"
                        fill="#D4D4EA" />
                    </svg>
                    <h2 className="text-muted">No data yet</h2>
                    <p className="text-muted">Spend sometime to see your progress</p>
                  </div>
                }
              </div>
              <br />
              <div className="row">
                <div className="col-lg-12">
                  <div className="chart_boxes over-box2 h-lg-100">
                    <div className="admin-header">
                      <h4 className="admin-head">Effort Distribution</h4>
                      <p className="admin-head2">Learning and Practice hours for various subjects.</p>
                    </div>
                    <div className="chart_area_body custom-legend">
                      <div className="card-deck">
                        {
                          learningSubjectData && learningSubjectData.length > 0 &&
                          <div className="card">
                            <div className="card-body">
                              <Chart
                                options={learningEffortDistributionChartOptions}
                                series={learningEffortDistributionChartOptions.series}
                                height={learningEffortDistributionChartOptions.chart.height}
                                type={learningEffortDistributionChartOptions.chart.type}
                              />
                              {/* <apx-chart [series]="learningEffortDistributionChartOptions.series"
                                                        [chart]="learningEffortDistributionChartOptions.chart"
                                                        [plotOptions]="learningEffortDistributionChartOptions.plotOptions"
                                                        [labels]="learningEffortDistributionChartOptions.labels"
                                                        [responsive]="learningEffortDistributionChartOptions.responsive"
                                                        [dataLabels]="learningEffortDistributionChartOptions.dataLabels"
                                                        [tooltip]="learningEffortDistributionChartOptions.tooltip"
                                                        [legend]="learningEffortDistributionChartOptions.legend" [isDisabled]="true">
                                                    </apx-chart> */}
                            </div>
                          </div>
                        }
                        {
                          !learningSubjectData || !learningSubjectData.length &&
                          <div className="card text-center">
                            <svg width="450" height="300" viewBox="0 0 520 520" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
                                fill="#DBDBE8" />
                              <path
                                d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
                                fill="#D4D4EA" />
                              <path
                                d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
                                fill="#DEDEE7" />
                              <path
                                d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
                                fill="#E1E1E6" />
                              <path
                                d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
                                fill="#D8D8E9" />
                            </svg>
                            <h2 className="text-muted">No data yet</h2>
                            <p className="text-muted">Spend sometime to see your progress</p>
                          </div>
                        }
                        {
                          assessmentSubjectData && assessmentSubjectData.length > 0 &&
                          <div className="card">
                            <div className="card-body">
                              <Chart
                                options={assessmentEffortDistributionChartOptions}
                                series={assessmentEffortDistributionChartOptions.series}
                                height={assessmentEffortDistributionChartOptions.chart.height}
                                type={assessmentEffortDistributionChartOptions.chart.type}
                              />
                              {/* <apx-chart [series]="assessmentEffortDistributionChartOptions.series"
                                                        [chart]="assessmentEffortDistributionChartOptions.chart"
                                                        [labels]="assessmentEffortDistributionChartOptions.labels"
                                                        [plotOptions]="assessmentEffortDistributionChartOptions.plotOptions"
                                                        [responsive]="assessmentEffortDistributionChartOptions.responsive"
                                                        [dataLabels]="assessmentEffortDistributionChartOptions.dataLabels"
                                                        [tooltip]="assessmentEffortDistributionChartOptions.tooltip"
                                                        [legend]="assessmentEffortDistributionChartOptions.legend" [isDisabled]="true">
                                                    </apx-chart> */}
                            </div>
                          </div>
                        }
                        {
                          !assessmentSubjectData || (assessmentSubjectData && assessmentSubjectData.length == 0) &&
                          <div className="card text-center">
                            <svg width="450" height="300" viewBox="0 0 520 520" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
                                fill="#DBDBE8" />
                              <path
                                d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
                                fill="#D4D4EA" />
                              <path
                                d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
                                fill="#DEDEE7" />
                              <path
                                d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
                                fill="#E1E1E6" />
                              <path
                                d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
                                fill="#D8D8E9" />
                            </svg>
                            <h2 className="text-muted">No data yet</h2>
                            <p className="text-muted">Spend sometime to see your progress</p>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-lg-4">
                <div className="over-input1 col-lg-9">
                  <div className="chart_boxes admin-box4">
                    <div className="admin-header">
                      <h4 className="admin-head">Question Complexity of subjects</h4>
                      <p className="admin-head2">To know about question complexity in various subjects.
                      </p>
                    </div>
                    {
                      allSubjectComplexity && allSubjectComplexity.length > 0 &&
                      <div className="chart_area_body new-body-chart_area_body">
                        <div className="row">
                          <div className="col-lg-12">
                            <Chart
                              options={subjectQuestionComplexityChartOptions}
                              series={subjectQuestionComplexityChartOptions.series}
                              height={subjectQuestionComplexityChartOptions.chart.height}
                              type={subjectQuestionComplexityChartOptions.chart.type}
                            />
                            {/* <apx-chart #subjectQuestionComplexityChart
                                                    [series]="subjectQuestionComplexityChartOptions.series"
                                                    [chart]="subjectQuestionComplexityChartOptions.chart"
                                                    [dataLabels]="subjectQuestionComplexityChartOptions.dataLabels"
                                                    [plotOptions]="subjectQuestionComplexityChartOptions.plotOptions"
                                                    [xaxis]="subjectQuestionComplexityChartOptions.xaxis"
                                                    [stroke]="subjectQuestionComplexityChartOptions.stroke"
                                                    [fill]="subjectQuestionComplexityChartOptions.fill"
                                                    [yaxis]="subjectQuestionComplexityChartOptions.yaxis"
                                                    [title]="subjectQuestionComplexityChartOptions.title"
                                                    [tooltip]="subjectQuestionComplexityChartOptions.tooltip"
                                                    [legend]="subjectQuestionComplexityChartOptions.legend" [isDisabled]="true">
                                                </apx-chart> */}
                          </div>
                        </div>
                        <div className="filter-area clearfix">
                          <div className="filter-item">
                            <div className="dropdown">
                              <a className="btn dropdown-toggle border-0" href="#" role="button" id="QuestionComplexity_filterLavel"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span>{selectedSubjectComplexity}</span>
                              </a>
                              <div className="dropdown-menu border-0 py-0" aria-labelledby="filterLavel">
                                {
                                  subjectComplexityArr.map((s: any, index: any) => {
                                    return <a className="dropdown-item" onClick={() => filterSubjectComplexity(s.name)} key={index}>{s.name}</a>
                                  })
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    {
                      !allSubjectComplexity || (allSubjectComplexity && allSubjectComplexity.length == 0) &&
                      <div className="chart_area_body  new-body-chart_area_body text-center">
                        <svg width="120" height="62" viewBox="0 0 120 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M113.922 25.4102H18.0792C16.9757 25.4102 16.082 25.8299 16.082 26.3482V35.727C16.082 36.2453 16.9757 36.665 18.0792 36.665H113.922C115.025 36.665 115.919 36.2453 115.919 35.727V26.3476C115.919 25.8299 115.025 25.4102 113.922 25.4102Z"
                            fill="#AAAAD5" fillOpacity="0.5" />
                          <path
                            d="M74.265 11.0661V11.0332H18.0792C16.9757 11.0332 16.082 11.4529 16.082 11.9713V21.35C16.082 21.8683 16.9757 22.2881 18.0792 22.2881H74.265V22.2552C74.6929 22.2038 75.0723 22.087 75.3435 21.9233C75.6147 21.7595 75.7623 21.5581 75.7632 21.3506V11.9706C75.7632 11.5342 75.1256 11.1708 74.265 11.0661Z"
                            fill="#AAAAD5" fillOpacity="0.5" />
                          <path
                            d="M86.966 39.7129H18.0792C16.9757 39.7129 16.082 40.1326 16.082 40.651V50.0297C16.082 50.548 16.9757 50.9678 18.0792 50.9678H86.966C88.0696 50.9678 88.9632 50.548 88.9632 50.0297V40.651C88.9632 40.1326 88.0696 39.7129 86.966 39.7129Z"
                            fill="#AAAAD5" fillOpacity="0.5" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    }
                  </div>
                  <div className="chart_boxes over-box1">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="admin-header">
                          <h4 className="admin-head">Question Category Distribution</h4>
                          <p className="admin-head2">Question Category Distribution in various
                            subjects.</p>

                        </div>
                        {
                          allQuestionDistribution && allQuestionDistribution.length > 0 &&
                          <div className="chart_area_body new-body-chart_area_body">
                            <Chart
                              options={questionCategoryDistributionChartOptions}
                              series={questionCategoryDistributionChartOptions.series}
                              height={questionCategoryDistributionChartOptions.chart.height}
                              type={questionCategoryDistributionChartOptions.chart.type}
                            />
                            {/* <apx-chart #questionDistributionChart [series]="questionCategoryDistributionChartOptions.series"
                                                    [chart]="questionCategoryDistributionChartOptions.chart"
                                                    [dataLabels]="questionCategoryDistributionChartOptions.dataLabels"
                                                    [plotOptions]="questionCategoryDistributionChartOptions.plotOptions"
                                                    [responsive]="questionCategoryDistributionChartOptions.responsive"
                                                    [xaxis]="questionCategoryDistributionChartOptions.xaxis"
                                                    [legend]="questionCategoryDistributionChartOptions.legend"
                                                    [fill]="questionCategoryDistributionChartOptions.fill">
                                                </apx-chart> */}
                            <div className="filter-area clearfix">

                              <div className="filter-item">

                                <div className="dropdown">
                                  <a className="btn dropdown-toggle border-0" href="#" role="button" id="QuestionCategory_filterLavel"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <span>{selectedQuestionDistribution}</span>
                                  </a>

                                  <div className="dropdown-menu border-0 py-0" aria-labelledby="filterLavel">
                                    {
                                      questionSubjectDistributionArr.map((q: any, index: any) => {
                                        return <a key={index} className="dropdown-item" onClick={() => filterQuestionDistribution(q.name)}>{q.name}</a>
                                      })
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                        {
                          !allQuestionDistribution || (allQuestionDistribution && allQuestionDistribution.length == 0) &&
                          <div className="chart_area_body text-center">
                            <svg width="344" height="308" viewBox="0 0 344 308" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M140.989 42.1839L140.989 265.817C140.989 268.391 143.318 270.477 146.194 270.477L198.231 270.477C201.107 270.477 203.436 268.391 203.436 265.817L203.436 42.1839C203.436 39.609 201.107 37.5239 198.231 37.5239L146.191 37.5239C143.318 37.5239 140.989 39.609 140.989 42.1839Z"
                                fill="#D4D4EA" />
                              <path
                                d="M61.3981 134.716L61.2158 134.716L61.2158 265.817C61.2158 268.391 63.5447 270.477 66.4205 270.477L118.457 270.477C121.333 270.477 123.662 268.391 123.662 265.817L123.662 134.716L123.48 134.716C123.195 133.718 122.547 132.833 121.638 132.2C120.73 131.567 119.612 131.222 118.461 131.22L66.4171 131.22C63.9953 131.22 61.9795 132.708 61.3981 134.716Z"
                                fill="#D4D4EA" />
                              <path
                                d="M220.342 105.081L220.342 265.817C220.342 268.391 222.671 270.477 225.547 270.477L277.583 270.477C280.459 270.477 282.788 268.391 282.788 265.817L282.788 105.081C282.788 102.506 280.459 100.421 277.583 100.421L225.547 100.421C222.671 100.421 220.342 102.506 220.342 105.081Z"
                                fill="#D4D4EA" />
                            </svg>
                            <h2 className="text-muted">No data yet</h2>
                            <p className="text-muted">Spend sometime to see your progress</p>
                          </div>
                        }
                      </div>
                    </div>

                  </div>
                </div>
                <div className="col-lg-3">
                  {
                    false && <div className="chart_boxes admin-box2">
                      <div className="admin-header">
                        <h4 className="admin-head">Online Session</h4>
                        <p className="admin-head2">Number of session and time spent on Online Session </p>
                      </div>
                      <div className="row mx-0">
                        <div className="col-lg-6">
                          <h4 className="out-online">Sessions</h4>
                        </div>
                        <div className="col-lg-6">
                          <h3 className="out-online-1"> 31/52</h3>
                        </div>
                      </div>
                      <div className="row mx-0">
                        <div className="col-lg-6">
                          <h4 className="out-online">Mins Spent</h4>
                        </div>
                        <div className="col-lg-6">
                          <h3 className="out-online-1"> 48/150</h3>
                        </div>
                      </div>
                    </div>
                  }
                  {
                    true && <div className="chart_boxes admin-box2">
                      <div className="admin-header">
                        <h4 className="admin-head">Online Session</h4>
                        <p className="admin-head2">Number of session and time spent on Online Session </p>
                      </div>
                      <div className="chart_area_body text-center">
                        <svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M48.5625 53.1875C51.1168 53.1875 53.1875 51.1168 53.1875 48.5625C53.1875 46.0082 51.1168 43.9375 48.5625 43.9375C46.0082 43.9375 43.9375 46.0082 43.9375 48.5625C43.9375 51.1168 46.0082 53.1875 48.5625 53.1875Z"
                            fill="#D4D4EA" />
                          <path
                            d="M16.1875 20.8125C18.7418 20.8125 20.8125 18.7418 20.8125 16.1875C20.8125 13.6332 18.7418 11.5625 16.1875 11.5625C13.6332 11.5625 11.5625 13.6332 11.5625 16.1875C11.5625 18.7418 13.6332 20.8125 16.1875 20.8125Z"
                            fill="#D4D4EA" />
                          <path
                            d="M62.4375 71.6875C60.608 71.6875 58.8196 71.145 57.2985 70.1286C55.7773 69.1122 54.5917 67.6675 53.8916 65.9773C53.1915 64.2871 53.0083 62.4272 53.3652 60.6329C53.7222 58.8386 54.6031 57.1904 55.8968 55.8968C57.1904 54.6031 58.8386 53.7222 60.6329 53.3652C62.4272 53.0083 64.2871 53.1915 65.9773 53.8916C67.6675 54.5917 69.1122 55.7773 70.1286 57.2985C71.145 58.8196 71.6875 60.608 71.6875 62.4375C71.6802 64.8885 70.7033 67.237 68.9702 68.9702C67.237 70.7033 64.8885 71.6802 62.4375 71.6875ZM62.4375 57.8125C61.5228 57.8125 60.6286 58.0838 59.868 58.592C59.1074 59.1002 58.5146 59.8225 58.1646 60.6676C57.8145 61.5127 57.7229 62.4426 57.9014 63.3398C58.0798 64.237 58.5203 65.0611 59.1671 65.7079C59.814 66.3547 60.6381 66.7952 61.5352 66.9736C62.4324 67.1521 63.3623 67.0605 64.2074 66.7105C65.0525 66.3604 65.7749 65.7676 66.2831 65.007C66.7913 64.2464 67.0625 63.3522 67.0625 62.4375C67.0588 61.212 66.5704 60.0377 65.7038 59.1712C64.8373 58.3046 63.663 57.8162 62.4375 57.8125Z"
                            fill="#D4D4EA" />
                          <path
                            d="M69.375 37.0021C69.35 28.4234 65.931 20.2032 59.865 14.1371C53.7989 8.07107 45.5787 4.65211 37 4.62709C31.476 4.5483 26.0365 5.98816 21.275 8.78959L23.8188 12.7208C25.6264 11.852 27.479 11.0801 29.3687 10.4083C25.5459 17.9515 23.4151 26.238 23.125 34.6896H9.25C9.50911 30.8713 10.615 27.1586 12.4875 23.8208L9.01875 20.8146C6.14135 25.724 4.62469 31.3116 4.625 37.0021C4.62439 41.2538 5.46138 45.464 7.08816 49.3922C8.71494 53.3204 11.0996 56.8896 14.1061 59.896C17.1125 62.9025 20.6817 65.2872 24.6099 66.9139C28.5381 68.5407 32.7483 69.3777 37 69.3771C41.1224 69.4159 45.211 68.6297 49.025 67.0646L47.6375 62.6708C43.8461 64.2921 39.7282 65.0048 35.6125 64.7521C30.681 57.1673 27.9585 48.3593 27.75 39.3146H69.1437C69.3349 38.5595 69.4128 37.7801 69.375 37.0021ZM29.6 63.8271C25.0015 62.4488 20.7992 59.9908 17.3438 56.6583C12.7554 51.9634 9.90108 45.8469 9.25 39.3146H23.125C23.4432 47.8638 25.6547 56.2359 29.6 63.8271ZM27.75 34.6896C27.9339 25.6743 30.5723 16.8798 35.3813 9.25209H38.6188C43.4277 16.8798 46.0661 25.6743 46.25 34.6896H27.75ZM50.875 34.6896C50.6991 26.1198 48.4792 17.7159 44.4 10.1771C49.841 11.7454 54.6777 14.9286 58.2702 19.3056C61.8626 23.6827 64.0416 29.0472 64.5187 34.6896H50.875Z"
                            fill="#D4D4EA" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    </div>
                  }
                  <div className="chart_boxes admin-box2">
                    <div className="admin-header">
                      <h1 className="admin-head">Group Participation</h1>
                      <p className="admin-head2">Number of Post and Comments</p>
                    </div>
                    {
                      groupParticipation &&
                      <div className="chart_area_body" style={{ minHeight: "unset" }}>
                        <div className="form-row">
                          <div className="out-group col-6 text-center">
                            <h1 className="out-online-1"> {groupParticipation?.posts}</h1>
                            <p>POSTS</p>
                            <p className="over-group-active d-none align-items-center justify-content-end">
                              Last 15 days
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow1 f-12">{intervalGroupParticipation?.posts}</span>
                            </p>
                          </div>
                          <div className="out-group col-6 text-center">
                            <h1 className="out-online-1"> {groupParticipation?.comments}</h1>
                            <p>COMMENTS</p>
                            <p className="over-group-active d-none align-items-center justify-content-end">
                              Last 15 days
                              <span className="material-icons">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 14l5-5 5 5z" /></svg>
                              </span><span className="persist-arrow2 f-12">{intervalGroupParticipation?.comments}</span>
                            </p>
                          </div>
                        </div>
                        <p className="bottom_info_tex mt-1">*Attempts in last 15 days</p>
                      </div>
                    }
                    {
                      !groupParticipation &&
                      <div className="chart_area_body text-center">
                        <svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M24.6678 33.1747H22.8795C20.4391 33.0865 18.0065 33.5008 15.7329 34.3919C13.4592 35.283 11.3929 36.6318 9.66228 38.3547L9.16895 38.9303V55.9503H17.5556V46.2892L18.6862 45.0147L19.2001 44.4186C21.8762 41.6693 25.208 39.6462 28.8817 38.5397C27.0424 37.1402 25.5918 35.2933 24.6678 33.1747Z"
                            fill="#D4D4EA" />
                          <path
                            d="M64.4214 38.2961C62.6908 36.5732 60.6245 35.2244 58.3508 34.3333C56.0772 33.4422 53.6447 33.0279 51.2042 33.1161C50.4557 33.1182 49.7078 33.1594 48.9636 33.2395C48.0224 35.227 46.6114 36.9555 44.8525 38.2756C48.7745 39.3606 52.3273 41.4923 55.1303 44.4422L55.6442 45.0178L56.7542 46.2922V55.9739H64.8531V38.8717L64.4214 38.2961Z"
                            fill="#D4D4EA" />
                          <path
                            d="M22.8167 29.1697H23.454C23.1579 26.6275 23.6039 24.0539 24.7383 21.7596C25.8727 19.4653 27.6469 17.5484 29.8467 16.2403C29.0493 15.0221 27.9492 14.0318 26.6541 13.3665C25.3589 12.7012 23.9132 12.3837 22.4585 12.445C21.0038 12.5063 19.5899 12.9443 18.3554 13.7162C17.1208 14.4881 16.1079 15.5674 15.4158 16.8484C14.7237 18.1294 14.3762 19.5682 14.4072 21.0239C14.4382 22.4795 14.8467 23.9022 15.5928 25.1526C16.3389 26.4029 17.3968 27.4381 18.6632 28.1567C19.9295 28.8753 21.3607 29.2527 22.8167 29.2519V29.1697Z"
                            fill="#D4D4EA" />
                          <path
                            d="M50.2153 27.6242C50.2403 28.0966 50.2403 28.5701 50.2153 29.0425C50.6098 29.105 51.0082 29.1394 51.4075 29.1453H51.7981C53.2477 29.068 54.6526 28.6167 55.876 27.8352C57.0994 27.0538 58.0996 25.9689 58.7793 24.6862C59.4589 23.4035 59.7949 21.9666 59.7544 20.5155C59.7139 19.0644 59.2984 17.6485 58.5482 16.4057C57.7981 15.1629 56.7389 14.1354 55.4739 13.4234C54.2088 12.7114 52.7809 12.3391 51.3293 12.3428C49.8776 12.3465 48.4516 12.7259 47.1902 13.4443C45.9287 14.1626 44.8747 15.1954 44.1309 16.442C45.9913 17.6567 47.5211 19.3142 48.5831 21.2659C49.645 23.2175 50.2059 25.4023 50.2153 27.6242Z"
                            fill="#D4D4EA" />
                          <path
                            d="M36.7313 36.8357C41.8059 36.8357 45.9196 32.7219 45.9196 27.6473C45.9196 22.5727 41.8059 18.459 36.7313 18.459C31.6567 18.459 27.543 22.5727 27.543 27.6473C27.543 32.7219 31.6567 36.8357 36.7313 36.8357Z"
                            fill="#D4D4EA" />
                          <path
                            d="M37.2265 41.7303C34.5421 41.622 31.8634 42.0578 29.3518 43.0116C26.8401 43.9654 24.5474 45.4174 22.6115 47.2803L22.0977 47.8559V60.8676C22.1057 61.2914 22.1971 61.7095 22.3668 62.098C22.5364 62.4864 22.7809 62.8377 23.0863 63.1317C23.3917 63.4256 23.7521 63.6565 24.1468 63.8112C24.5414 63.9659 24.9627 64.0413 25.3865 64.0331H49.0049C49.4287 64.0413 49.85 63.9659 50.2447 63.8112C50.6393 63.6565 50.9997 63.4256 51.3051 63.1317C51.6105 62.8377 51.855 62.4864 52.0247 62.098C52.1943 61.7095 52.2858 61.2914 52.2938 60.8676V47.897L51.8004 47.2803C49.8771 45.4117 47.5924 43.9555 45.0863 43.0012C42.5802 42.0468 39.9057 41.6144 37.2265 41.7303Z"
                            fill="#D4D4EA" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    }
                  </div>
                  <div className="chart_boxes admin-box4">
                    <div className="admin-header">
                      <h1 className="admin-head">Persistence</h1>
                      <p className="admin-head2">Overall Ability to sit and finish the exam</p>
                    </div>
                    {
                      persistance && persistance.length > 0 &&
                      <div className="chart_area_body">
                        <Chart
                          options={persistanceChartOptions}
                          series={persistanceChartOptions.series}
                          height={persistanceChartOptions.chart.height}
                          type={persistanceChartOptions.chart.type}
                        />
                        {/* <apx-chart
                                            [series]="persistanceChartOptions.series"
                                            [chart]="persistanceChartOptions.chart"
                                            [plotOptions]="persistanceChartOptions.plotOptions"
                                            [labels]="persistanceChartOptions.labels"
                                            [responsive]="persistanceChartOptions.responsive"
                                            [dataLabels]="persistanceChartOptions.dataLabels"
                                            [tooltip]="persistanceChartOptions.tooltip"
                                            [legend]="persistanceChartOptions.legend" [isDisabled]="true">
                                        </apx-chart> */}
                        {
                          persistanceData.map((ls: any, index: any) => {
                            return <div key={index}>
                              <div className="row mx-0">
                                <div className="col">
                                  <span className="purple text-left">{ls?.label}</span>
                                </div>

                                <div className="col-auto ml-auto">
                                  <div className="marks">
                                    <span>{ls?.count} / {ls.totalAttempts}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          })
                        }
                      </div>
                    }
                    {
                      persistance === null || (persistance && persistance.length == 0) &&
                      <div className="chart_area_body text-center">
                        <svg width="86" height="98" viewBox="0 0 86 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M38.7977 0.953124C38.4979 0.642716 38.1393 0.395124 37.7428 0.224795C37.3463 0.0544654 36.9198 -0.0351899 36.4883 -0.0389398C36.0568 -0.0426897 35.6288 0.0395409 35.2294 0.202954C34.83 0.366367 34.4671 0.607689 34.162 0.91284C33.8568 1.21799 33.6155 1.58086 33.4521 1.98027C33.2887 2.37969 33.2064 2.80765 33.2102 3.23918C33.2139 3.67071 33.3036 4.09718 33.4739 4.49369C33.6442 4.8902 33.8918 5.24882 34.2023 5.54862L41.6772 13.0236C18.95 13.7191 0.75 32.3579 0.75 55.2509C0.75 78.5859 19.665 97.5009 43 97.5009C66.335 97.5009 85.25 78.5859 85.25 55.2509V54.9909C85.2402 53.3009 83.8232 52.0009 82.1365 52.0009H81.857C80.1117 52.0009 78.75 53.5024 78.75 55.2509C78.75 74.9946 62.7437 91.0009 43 91.0009C23.2563 91.0009 7.25 74.9946 7.25 55.2509C7.25 35.9654 22.5185 20.2484 41.6285 19.5269L34.2023 26.9531C33.6102 27.5661 33.2827 28.387 33.2901 29.2392C33.2975 30.0913 33.6393 30.9065 34.2418 31.509C34.8444 32.1116 35.6596 32.4534 36.5117 32.4608C37.3638 32.4682 38.1848 32.1406 38.7977 31.5486L51.7978 18.5486C52.407 17.9392 52.7493 17.1127 52.7493 16.2509C52.7493 15.3891 52.407 14.5626 51.7978 13.9531L38.7977 0.953124ZM64.7978 39.9531C65.407 40.5626 65.7493 41.3891 65.7493 42.2509C65.7493 43.1127 65.407 43.9392 64.7978 44.5486L45.2978 64.0486C44.6883 64.6579 43.8618 65.0002 43 65.0002C42.1382 65.0002 41.3117 64.6579 40.7023 64.0486L30.9523 54.2986C30.3602 53.6857 30.0327 52.8647 30.0401 52.0126C30.0475 51.1604 30.3893 50.3453 30.9918 49.7427C31.5944 49.1401 32.4096 48.7983 33.2617 48.7909C34.1138 48.7835 34.9348 49.1111 35.5477 49.7031L43 57.1554L60.2022 39.9531C60.8117 39.3438 61.6382 39.0016 62.5 39.0016C63.3618 39.0016 64.1883 39.3438 64.7978 39.9531Z"
                            fill="#D4D4EA" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
            <br />
          </div>
        </div>
      </div>
    </main>
  );
};
export default MyEffort;
