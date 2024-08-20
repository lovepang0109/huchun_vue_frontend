import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { accuracyCategory, questionStatus } from "@/lib/common";
import { decimal } from "@/lib/pipe";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

interface props {
  attempt: any;
  topperAttempt: any;
  averageAttempt: any;
  questions: any[];
}

const AttemptPerformanceAnalysis = ({
  attempt,
  topperAttempt,
  averageAttempt,
  questions,
}: props) => {
  const allUnits = useMemo(() => {
    let arr: any = [];
    attempt.subjects.forEach((e: any) => (arr = arr.concat(e.units)));
    return arr;
  }, [attempt]);
  const [selectAllUnits, setSelectAllUnits] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<any[]>([]);
  const [negativeMarking, setNegativeMarking] = useState<any>({});
  const [speedCategory, setSpeedCategory] = useState<any[]>([]);
  const [timeAnalysisDataQues, setTimeAnalysisDataQues] = useState<any>();
  const [firstQuestionDetail, setFirstQuestionDetail] = useState<any>({});
  const [timeAnalysisQuestions, setTimeAnalysisQuestions] = useState<any>({});
  const [paceAnalysisChartOptions, setPaceAnalysisChartOptions] = useState<any>(
    {
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
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          tickAmount: 20,
          categories: [],
          title: {
            text: "Question Number",
            offsetY: 85,
          },
        },
        yaxis: {
          title: {
            text: "Time (in minutes)",
          },
        },
        legend: {
          horizontalAlign: "center",
        },
        responsive: [
          {
            breakpoint: 600,
            options: {
              chart: {
                type: "line",
                height: 250,
              },
            },
          },
          {
            breakpoint: 400,
            options: {
              chart: {
                type: "line",
                height: 225,
              },
            },
          },
          {
            breakpoint: 300,
            options: {
              chart: {
                type: "line",
                height: 200,
              },
            },
          },
        ],
      },
    }
  );
  const [chartOptions, setChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 350,
        type: "bubble",
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 0.8,
      },
      title: {
        text: "",
      },
      xaxis: {
        type: "category",
        title: {
          text: "Average Accuracy (%)",
          offsetY: 85,
        },
      },
      yaxis: {
        title: {
          text: "Average Speed (in secs)",
        },
      },
      legend: {
        horizontalAlign: "center",
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: {
              type: "bubble",
              height: 250,
            },
          },
        },
        {
          breakpoint: 400,
          options: {
            chart: {
              type: "bubble",
              height: 225,
            },
          },
        },
        {
          breakpoint: 300,
          options: {
            chart: {
              type: "bubble",
              height: 200,
            },
          },
        },
      ],
    },
  });
  const [mentalChartOptions, setMentalChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 350,
        type: "line",
      },
      fill: {
        type: "solid",
      },
      markers: {
        size: [7, 7],
      },
      legend: {
        show: true,

        horizontalAlign: "center",
      },
      xaxis: {
        type: "numeric",
        // min: 0,
        labels: {
          formatter: function (val: any) {
            return parseFloat(val).toFixed(0);
          },
        },
      },
      yaxis: {},
    },
  });
  const [complexityChartOptions, setComplexityChartOptions] = useState<any>({
    series: [],
    options: {
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
      fill: {
        opacity: 1,
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        offsetX: 40,
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
          // distribute color to all bars
          distributed: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -18,
        style: {
          fontSize: "12px",
          colors: ["#333"],
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        title: {
          text: "Unit",
        },
        categories: [],
        labels: {
          show: true,
          hideOverlappingLabels: false,
          trim: true,
        },
      },
      yaxis: {
        title: {
          text: "Accuracy (%)",
        },
        max: 100,
      },
      fill: {},
      legend: {
        show: false,
      },
    },
  });
  const [speedChartOptions, setSpeedChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 300,
      },
      plotOptions: {
        bar: {
          // distribute color to all bars
          distributed: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -18,
        style: {
          fontSize: "12px",
          colors: ["#333"],
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        title: {
          text: "Subject",
        },
        categories: [],
        labels: {
          show: true,
          hideOverlappingLabels: false,
          trim: true,
        },
      },
      yaxis: {
        title: {
          text: "Time (seconds)",
        },
      },
      fill: {},
      legend: {
        show: false,
      },
    },
  });

  const [timeAnalysisChartOptions, setTimeAnalysisChartOptions] = useState<any>(
    {
      series: [],
      options: {
        chart: {
          height: 350,
          type: "line",
        },
        stroke: {
          width: [0, 4],
        },
        title: {},
        dataLabels: {
          enabled: false,
          enabledOnSeries: [0],
        },
        labels: [],
        xaxis: {
          tickAmount: 20,
          title: {
            text: "Questions",
            offsetY: 85,
          },
        },
        yaxis: [
          {
            title: {
              text: "Time (in Secs)",
            },
          },
        ],
        responsive: [
          {
            breakpoint: 600,
            options: {
              chart: {
                type: "line",
                height: 250,
              },
            },
          },
          {
            breakpoint: 400,
            options: {
              chart: {
                type: "line",
                height: 225,
              },
            },
          },
          {
            breakpoint: 300,
            options: {
              chart: {
                type: "line",
                height: 200,
              },
            },
          },
        ],
        fill: {
          colors: [
            ({ dataPointIndex, w }: { dataPointIndex: any; w: any }) => {
              const status =
                timeAnalysisQuestions[Number(w.globals.labels[dataPointIndex])];

              if (status == questionStatus.CORRECT) {
                return "#08db62";
              }

              if (status == questionStatus.INCORRECT) {
                return "#f15454";
              }
              return "#107ebd";
            },
          ],
        },
      },
    }
  );

  useEffect(() => {
    const init = async () => {
      let topperUnits: any[] = [];
      topperAttempt.subjects.forEach((element: any) => {
        topperUnits = topperUnits.concat(element.units);
      });
      loadDataChart(allUnits, topperUnits, averageAttempt);
      getPaceAnalysisGraph(attempt.QA, false);
      const { data } = await clientApi.get(
        `/api/analysis/getQuestionsWithExceedTimeFlag${toQueryString({
          attemptId: attempt._id,
        })}`
      );
      setTimeAnalysisDataQues(data);
      getTimeAnalysis(data);
      getPeakTime();

      loadAccuracyChart(allUnits);
      loadSpeedChart(allUnits);
      loadComplexityAnalysisChart();
    };

    const getFirstQuestionDetail = async () => {
      const { data } = await clientApi.get(
        `/api/analysis/getFirstQuestionAttempted${toQueryString({
          attemptId: attempt._id,
        })}`
      );
      setFirstQuestionDetail(data);
    };
    const getPeakTime = async () => {
      const { data } = await clientApi.get(
        `/api/analysis/getPeakTime${toQueryString({ attemptId: attempt._id })}`
      );

      const chartData = [];
      const correctAnswer = [];
      const wrongAnswer = [];
      for (let i = 0; i < data.cumulativeTimeAndStatus.length; i++) {
        if (data.cumulativeTimeAndStatus[i].status == 1) {
          correctAnswer.push({
            x: i + 1,
            y: data.cumulativeTimeAndStatus[i].cumulativeTime,
          });
        } else if (data.cumulativeTimeAndStatus[i].status == 2) {
          wrongAnswer.push({
            x: i + 1,
            y: data.cumulativeTimeAndStatus[i].cumulativeTime,
          });
        } else {
          chartData.push({
            x: i + 1,
            y: data.cumulativeTimeAndStatus[i].cumulativeTime,
          });
        }
      }
      const d = [
        {
          name: "Wrong Answer",
          type: "scatter",
          data: wrongAnswer,
        },
        {
          name: "Correct Answer",
          type: "scatter",
          data: correctAnswer,
        },
        {
          name: "Peak Duration",
          type: "line",
          data: [
            { x: data.max_start + 1, y: data.peakStart },
            { x: data.max_start + 1, y: data.peakStart + data.peakDuration },
            { x: data.max_end + 1, y: data.peakStart + data.peakDuration },
            { x: data.max_end + 1, y: data.peakStart },
            { x: data.max_start + 1, y: data.peakStart },
          ],
        },
      ];
      setMentalChartOptions((prev: any) => ({ ...prev, series: d }));
    };

    const getNegativeMarkingAnalysis = async () => {
      const { data } = await clientApi.get(
        `/api/analysis/getMissedQuesAndPossibleMarks${toQueryString({
          attemptId: attempt._id,
        })}`
      );
      setNegativeMarking(data);
    };

    init();
    getFirstQuestionDetail();
    attempt.practiceSetInfo.minusMark && getNegativeMarkingAnalysis();
  }, []);

  const loadComplexityAnalysisChart = () => {
    const correct = [];
    const wrong = [];
    const missed = [];
    const partial = [];
    const categories: any = {};

    for (const q of questions) {
      if (!categories[q.complexity]) {
        categories[q.complexity] = {
          correct: 0,
          wrong: 0,
          missed: 0,
          partial: 0,
        };
      }
      if (q.status == questionStatus.CORRECT) {
        categories[q.complexity].correct++;
      } else if (q.status == questionStatus.INCORRECT) {
        categories[q.complexity].wrong++;
      } else if (q.status == questionStatus.MISSED) {
        categories[q.complexity].missed++;
      } else if (q.status == questionStatus.PARTIAL) {
        categories[q.complexity].partial++;
      }
    }

    for (const cat in categories) {
      correct.push(categories[cat].correct);
      wrong.push(categories[cat].wrong);
      missed.push(categories[cat].missed);
      partial.push(categories[cat].partial);
    }

    setComplexityChartOptions({
      ...complexityChartOptions,
      series: [
        {
          name: "Missed",
          data: missed,
        },
        {
          name: "Correct",
          data: correct,
        },
        {
          name: "Partial",
          data: partial,
        },
        {
          name: "Incorrect",
          data: wrong,
        },
      ],
      options: {
        ...complexityChartOptions.options,
        xaxis: {
          ...complexityChartOptions.options.xaxis,
          categories: Object.keys(categories),
        },
      },
    });
  };

  const loadSpeedChart = (items: any) => {
    const max = Math.max(...items.map((u) => u.speed));
    const min = Math.min(...items.map((u) => u.speed));

    const quantile = (max - min) / 4;

    if (quantile > 0) {
      setSpeedCategory([
        {
          label: `>=${((min + quantile * 3) / 1000).toFixed(2)}`,

          color: "#f15454",
        },
        {
          label: `${((min + quantile * 2) / 1000).toFixed(2)}-${(
            (min + quantile * 3) /
            1000
          ).toFixed(2)}`,
          color: "#ff8000",
        },
        {
          label: `${((min + quantile) / 1000).toFixed(2)}-${(
            (min + quantile * 2) /
            1000
          ).toFixed(2)}`,
          color: "#107ebd",
        },
        {
          label: "<" + ((min + quantile) / 1000).toFixed(2),

          color: "#08db62",
        },
      ]);
    }

    const getSpeedColor = (sp) => {
      if (sp < min + quantile) {
        return "#08db62";
      }
      if (sp < min + quantile * 2) {
        return "#107ebd";
      }
      if (sp < min + quantile * 3) {
        return "#ff8000";
      }

      return "#f15454";
    };

    let category = [];
    let series = [];
    let colors = [];
    const sorted = items.filter((i) => i.speed / 1000 != 0);
    sorted.sort((a, b) => {
      if (a.speed > b.speed) {
        return -1;
      } else if (a.speed < b.speed) {
        return 1;
      }

      return 0;
    });
    for (const item of sorted) {
      if (Math.round(item.speed / 1000) != 0) {
        category.push(item.name);
        series.push(Math.round(item.speed / 1000));

        colors.push(getSpeedColor(item.speed));
      }
    }

    setSpeedChartOptions({
      ...speedChartOptions,
      series: [{ data: series, name: "Time" }],
      options: {
        ...speedChartOptions.options,
        xaxis: {
          ...speedChartOptions.options.xaxis,
          categories: category,
          title: {
            text: selectAllUnits ? "Unit" : "Topic",
          },
        },
        fill: {
          colors: colors,
        },
      },
    });
  };

  const loadAccuracyChart = (items: any) => {
    const getAccuracyColor = (acc: number) => {
      if (acc < 50) {
        return "#f15454";
      }
      if (acc < 75) {
        return "#FF8000";
      }
      if (acc < 90) {
        return "#08db62";
      }

      return "#107ebd";
    };

    const category = [];
    const series = [];
    const colors = [];
    const sorted = items.filter((i) => i.accuracy != 0);
    sorted.sort((a, b) => {
      if (a.accuracy < b.accuracy) {
        return -1;
      } else if (a.accuracy > b.accuracy) {
        return 1;
      }

      return 0;
    });
    for (const item of sorted) {
      if (Math.round(item.accuracy * 100) != 0) {
        category.push(item.name);
        series.push(Math.round(item.accuracy * 100));
        colors.push(getAccuracyColor(item.accuracy * 100));
      }
    }
    setAccuracyChartOptions({
      ...accuracyChartOptions,
      series: [{ data: series, name: "Accuracy" }],
      options: {
        ...accuracyChartOptions.options,
        xaxis: {
          ...accuracyChartOptions.options.xaxis,
          categories: category,
          title: {
            text: selectAllUnits ? "Unit" : "Topic",
          },
        },
        fill: {
          colors: colors,
        },
      },
    });
  };

  const getTimeAnalysis = (questions: any) => {
    const seriesData1 = [];
    const seriesData2 = [];
    const categories = [];
    let timeAnalysisQuestion = timeAnalysisQuestions;
    for (let i = 0; i < questions.length; i++) {
      timeAnalysisQuestion[questions[i].index] = questions[i].status;
      if (questions[i].exceededAvgTime) {
        categories.push(questions[i].index);
        seriesData1.push(questions[i].timeElapse.toFixed(0));
        seriesData2.push(questions[i].avgTime.toFixed(0));
      }
    }
    setTimeAnalysisQuestions(timeAnalysisQuestion);
    let timeAnalysisChartOption = timeAnalysisChartOptions;
    timeAnalysisChartOption.options.labels = categories;

    timeAnalysisChartOption.series = [
      {
        name: "Time Taken",
        type: "column",
        data: seriesData1,
      },
      {
        name: "Mean Time",
        type: "line",
        data: seriesData2,
      },
    ];
    setTimeAnalysisChartOptions(timeAnalysisChartOption);
  };

  const loadDataChart = (sub: any, topper: any, average: any) => {
    if (average.length > 1) {
      average.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    if (topper.length > 1) {
      topper.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    if (sub.length > 1) {
      sub.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    let topicAccuracyPercents: any = [];
    let topperAccuracyPercents: any = [];
    let averageAccuracyPercents: any = [];
    let topicEsplapseTimes: any = [];
    let topperEsplapseTimes: any = [];
    let averageEsplapseTimes: any = [];
    let bubbleChartData: any = [];

    let maxTime = 0;
    sub.forEach((s: any, i: number) => {
      bubbleChartData[i] = { sub: "", data: [] };
      const acc = s.accuracy * 100;
      topicAccuracyPercents.push({
        y: Math.max(0, Math.round(acc)),
        name: s.name,
      });

      if (s.speed > 0) {
        const speed = s.speed / 1000;
        topicEsplapseTimes.push({
          y: Math.round(speed),
          name: s.name,
        });
      } else {
        topicEsplapseTimes.push({
          y: 0,
          name: s.name,
        });
      }

      if (
        !!(
          topicEsplapseTimes[i] &&
          topicAccuracyPercents[i] &&
          topicAccuracyPercents[i] &&
          topicEsplapseTimes[i]
        )
      ) {
        bubbleChartData[i].data.push(
          topicAccuracyPercents[i].y,
          topicEsplapseTimes[i].y,
          // s.mark
          15
        );
        if (maxTime < topicEsplapseTimes[i].y) {
          maxTime = topicEsplapseTimes[i].y;
        }
        bubbleChartData[i].sub = topicAccuracyPercents[i].name;
      }
    });
    topper.forEach((tA: any) => {
      const acc = tA.accuracy * 100;
      topperAccuracyPercents.push({
        y: Math.max(0, Math.round(acc)),
        name: tA.name,
      });

      if (tA.speed > 0) {
        const speed = tA.speed / 1000;
        topperEsplapseTimes.push({
          y: Math.round(speed),
          name: tA.name,
        });
      }
    });
    average.forEach((aA: any, i: number) => {
      averageAccuracyPercents.push({
        y: Math.max(0, Math.round(aA.accuracy)),
        name: aA.name,
      });

      if (aA.speed > 0) {
        averageEsplapseTimes.push({
          y: Math.round(aA.speed),
          name: aA.name,
        });
      }
      if (averageAccuracyPercents[i] && averageEsplapseTimes[i]) {
        const val =
          (averageAccuracyPercents[i].y + averageEsplapseTimes[i].y) / 2;
        // averagePerform.push({ sub: averageAccuracyPercents[i].name, data: val })
      }
    });

    // for bubble graph
    const bdata = [];
    for (let j = 0; j < sub.length; j++) {
      bdata.push({
        name: bubbleChartData[j].sub,
        data: [bubbleChartData[j].data],
      });
    }
    setChartOptions({
      ...chartOptions,
      series: bdata,
      options: {
        ...chartOptions.options,
        yaxis: { ...chartOptions.options.yaxis, max: maxTime + 1 },
      },
    });
  };

  const getPaceAnalysisGraph = (QA: any, reload?: any) => {
    let questionTimes: any = [];
    let sdtQuestions: any = [];
    let categories: any = [];
    QA.forEach((q: any) => {
      categories.push(q.index);
      questionTimes.push(q.timeLeft.toFixed(0));
      sdtQuestions.push(q.stdTime.toFixed(0));
    });
    let paceAnalysisChartOption = paceAnalysisChartOptions;
    paceAnalysisChartOption.options.xaxis.categories = categories;

    paceAnalysisChartOption.series = [
      {
        name: "You",
        data: questionTimes,
      },
      {
        name: "Average",
        data: sdtQuestions,
      },
    ];
    setPaceAnalysisChartOptions(paceAnalysisChartOption);
  };

  const filterUnit = (unit: any, i: number) => {
    setSelectAllUnits(false);
    let isSelectedArray = [];
    setReload(true);
    if (unit === "All") {
      setSelectAllUnits(true);
      let topperUnits: any = [];
      topperAttempt.subjects.forEach((element: any) => {
        topperUnits = topperUnits.concat(element.units);
      });
      loadDataChart(allUnits, topperUnits, averageAttempt);
      getPaceAnalysisGraph(attempt.QA, true);
      getTimeAnalysis(timeAnalysisDataQues);
      loadAccuracyChart(allUnits);
      loadSpeedChart(allUnits);
    } else {
      setSelectAllUnits(false);
      setIsSelected((prevSelected) => {
        const newSelected = [...prevSelected];
        newSelected[i] = true;
        return newSelected;
      });

      isSelectedArray[i] = true;
      let topper: any = [];
      let average: any = [];
      let topperUnits: any = [];
      topperAttempt.subjects.forEach((element: any) => {
        topperUnits = topperUnits.concat(element.units);
      });
      topperUnits.forEach((e: any) => {
        if (unit.name === e.name) {
          topper.push(e);
        }
      });
      averageAttempt.forEach((a: any) => {
        if (unit.name === a.name) {
          average.push(a);
        }
      });
      loadDataChart([unit], topper, average);
      loadAccuracyChart(unit.topics);
      loadSpeedChart(unit.topics);
      if (attempt && attempt.QA && attempt.QA.length > 0) {
        const filterQA = attempt.QA.filter(
          (a: any) => a.unit._id.toString() == unit._id.toString()
        );
        getPaceAnalysisGraph(filterQA, true);
      }
      if (timeAnalysisDataQues && timeAnalysisDataQues.length > 0) {
        const filterQA = timeAnalysisDataQues.filter(
          (a: any) => a.unit._id.toString() == unit._id.toString()
        );
        getTimeAnalysis(filterQA);
      }
    }
  };

  return (
    <div className="" id="performance">
      <div className="error-analysis clearfix mx-auto mw-100 pt-0">
        <div className="row">
          <div className="col-lg-2">
            <div className="sidebar">
              <ul>
                <li>
                  <a
                    onClick={() => filterUnit("All", 0)}
                    className={selectAllUnits ? "bold" : ""}
                  >
                    All Units
                  </a>
                </li>
                {allUnits.map((unit: any, i: number) => (
                  <li key={i}>
                    <a
                      onClick={() => filterUnit(unit, i)}
                      className={isSelected[i] ? "bold" : ""}
                    >
                      {unit.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-10">
            <div className="error-analysis-area w-100">
              <div className="accordation-area pt-0">
                <div className="accordion">
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <h5 className="admin-head">Accuracy Analysis</h5>
                      <p className="admin-head2">
                        Accuracy is based on whether a question is answered
                        correctly. Review and understand individual
                        student&apos;s knowledge on a given subject matter. Deep
                        dive into unit and topic to pinpoint areas of
                        improvement.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {accuracyChartOptions &&
                        accuracyChartOptions.series &&
                        accuracyChartOptions.series.length > 0 && (
                          <div>
                            <Chart
                              series={accuracyChartOptions.series}
                              options={accuracyChartOptions.options}
                              type="bar"
                              width="100%"
                              height="300"
                            />
                          </div>
                        )}

                      <div className="d-flex justify-content-center gap-sm">
                        {accuracyCategory.map((cat, index) => (
                          <div key={index}>
                            <span style={{ color: cat.color }}>
                              {cat.label}
                            </span>
                            &nbsp;
                            <span style={{ background: cat.color }}>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <h5 className="admin-head">Speed Analysis</h5>
                      <p className="admin-head2">
                        Speed is the time taken to solve a question. Review and
                        understand individual student&apos;s efficiency on a
                        given subject matter. Deep dive into unit and topic to
                        pinpoint areas of improvement.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {speedChartOptions &&
                        speedChartOptions.series &&
                        speedChartOptions.series.length > 0 && (
                          <Chart
                            series={speedChartOptions.series}
                            options={speedChartOptions.options}
                            type="bar"
                            width="100%"
                            height="300"
                          />
                        )}

                      <div className="d-flex justify-content-center gap-sm">
                        {speedCategory.map((cat, index) => (
                          <div key={index}>
                            <span style={{ color: cat.color }}>
                              {cat.label}
                            </span>
                            &nbsp;
                            <span style={{ background: cat.color }}>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {timeAnalysisChartOptions.series[0] &&
                    timeAnalysisChartOptions.series[0].data.length > 0 && (
                      <div className="chart_boxes">
                        <div className="admin-header">
                          <h5 className="admin-head">Time Wastage Analysis</h5>
                          <p className="admin-head2">
                            Questions exceeded average time
                          </p>
                        </div>
                        <div className="chart_area_body">
                          {timeAnalysisChartOptions &&
                            timeAnalysisChartOptions.series &&
                            timeAnalysisChartOptions.series.length > 0 && (
                              <div>
                                <Chart
                                  series={timeAnalysisChartOptions.series}
                                  options={timeAnalysisChartOptions.options}
                                  type="line"
                                  width="100%"
                                  height="300"
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  {/* <div className="chart_boxes">
                    <div className="admin-header">
                      <h5 className="admin-head">Pace Analysis</h5>
                      <p className="admin-head2">
                        See how quickly you answered each question compared to
                        the expected average time. The burn-down graph (first
                        question & total time and later last question and no
                        time left) tracks the time in seconds you took for every
                        question, letting you know your pace (whether
                        you&apos;re faster or slower than average).
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {paceAnalysisChartOptions &&
                        paceAnalysisChartOptions.series &&
                        paceAnalysisChartOptions.series.length > 0 && (
                          <div>
                            <Chart
                              series={paceAnalysisChartOptions.series}
                              options={paceAnalysisChartOptions.options}
                              type="line"
                              width="100%"
                              height="300"
                            />
                          </div>
                        )}
                    </div>
                  </div> */}
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <h5 className="admin-head">Streak Analysis</h5>
                      <p className="admin-head2">
                        How long does it take to reach the peak performance? A
                        sequence of correct answers is considered one streak.
                        The sooner you reach peak performance, the better
                        outcome and result you will get. Also, the
                        length/duration of the streak is equally essential.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {mentalChartOptions &&
                        mentalChartOptions.series.length && (
                          <div>
                            <Chart
                              series={mentalChartOptions.series}
                              options={mentalChartOptions.options}
                              type="line"
                              width="100%"
                              height="300"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <h5 className="admin-head">Proficiency Measurement</h5>
                      <p className="admin-head2">
                        You should strive for higher accuracy and low speed for
                        each area. Higher speed and higher accuracy mean that
                        you need to learn new tricks. It would be best if you
                        learned new tips and tricks. Higher speed and lower
                        accuracy mean that spending more time doesn&apos;t mean
                        better results, and you need to gain more knowledge. The
                        lower speed and lower accuracy possibly mean that you
                        didn&apos;t know the area well, made a guess and moved
                        on. Higher accuracy and low speed mean that you have
                        mastered the area.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {chartOptions && chartOptions.series.length && (
                        <div>
                          <Chart
                            series={chartOptions.series}
                            options={chartOptions.options}
                            type="bubble"
                            width="100%"
                            height="300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <h5 className="admin-head">Difficulty Analysis</h5>
                      <p className="admin-head2">
                        This graph shows how many easy, moderate, or complex
                        questions you attempted and how many you got right,
                        wrong, or missed. Get a quick look at where you shine or
                        might need more practice.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      <Chart
                        series={complexityChartOptions.series}
                        options={complexityChartOptions.options}
                        type="bar"
                        width="100%"
                        height="300"
                      />
                    </div>
                  </div>

                  {/* {attempt.practiceSetInfo.minusMark !== undefined && (
                    <div className="chart_boxes">
                      <div className="admin-header">
                        <h5 className="admin-head">
                          Negative Marking Analysis
                        </h5>
                        <p className="admin-head2">
                          Negative marking can be scary but you should
                          understand the true earning from the attempt.
                        </p>
                      </div>
                      <div className="chart_area_body">
                        <div className="row">
                          {negativeMarking.missed !== undefined && (
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div
                                  className={`progress-circle p ${
                                    negativeMarking.missed
                                  } ${
                                    negativeMarking.missed > 50 ? "over50" : ""
                                  }`}
                                >
                                  <span>
                                    {decimal(negativeMarking.missed, 0)}{" "}
                                  </span>
                                  <div className="left-half-clipper">
                                    <div
                                      className="first50-bar"
                                      style={{
                                        backgroundColor:
                                          negativeMarking.missed > 60
                                            ? "#008ffb"
                                            : negativeMarking.missed > 30
                                            ? "#008ffb"
                                            : "#008ffb",
                                      }}
                                    ></div>
                                    <div
                                      className="value-bar"
                                      style={{
                                        borderColor:
                                          negativeMarking.missed > 60
                                            ? "#008ffb"
                                            : negativeMarking.missed > 30
                                            ? "#008ffb"
                                            : "#008ffb",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <h4 className="circle-head">
                                  Missed Questions
                                </h4>
                              </div>
                            </div>
                          )}

                          {negativeMarking.percentMissed !== undefined && (
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div
                                  className={`progress-circle p ${
                                    negativeMarking.percentMissed
                                  } ${
                                    negativeMarking.percentMissed > 50
                                      ? "over50"
                                      : ""
                                  }`}
                                >
                                  <span>
                                    {decimal(negativeMarking.percentMissed, 0)}{" "}
                                    %
                                  </span>
                                  <div className="left-half-clipper">
                                    <div
                                      className="first50-bar"
                                      style={{
                                        backgroundColor:
                                          negativeMarking.percentMissed > 60
                                            ? "#008ffb"
                                            : negativeMarking.percentMissed > 30
                                            ? "#008ffb"
                                            : "#008ffb",
                                      }}
                                    ></div>
                                    <div
                                      className="value-bar"
                                      style={{
                                        borderColor:
                                          negativeMarking.percentMissed > 60
                                            ? "#008ffb"
                                            : negativeMarking.percentMissed > 30
                                            ? "#008ffb"
                                            : "#008ffb",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <h5 className="circle-head">
                                  Missed Questions{" "}
                                </h5>
                              </div>
                            </div>
                          )}

                          {negativeMarking.possibleGain !== undefined && (
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div
                                  className={`progress-circle p ${
                                    negativeMarking.possibleGain
                                  } ${
                                    negativeMarking.possibleGain > 50
                                      ? "over50"
                                      : ""
                                  }`}
                                >
                                  <span>
                                    {decimal(negativeMarking.possibleGain, 0)} %
                                  </span>
                                  <div className="left-half-clipper">
                                    <div
                                      className="first50-bar"
                                      style={{
                                        backgroundColor:
                                          negativeMarking.possibleGain > 60
                                            ? "#008ffb"
                                            : negativeMarking.possibleGain > 30
                                            ? "#008ffb"
                                            : "#008ffb",
                                      }}
                                    ></div>
                                    <div
                                      className="value-bar"
                                      style={{
                                        borderColor:
                                          negativeMarking.possibleGain > 60
                                            ? "#008ffb"
                                            : negativeMarking.possibleGain > 30
                                            ? "#008ffb"
                                            : "#008ffb",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <h4 className="circle-head">
                                  Possible Gain of Marks
                                </h4>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptPerformanceAnalysis;
