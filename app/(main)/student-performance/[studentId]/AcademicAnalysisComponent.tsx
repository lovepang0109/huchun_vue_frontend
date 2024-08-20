"use client";
import { update } from "lodash";
import React, { useState, useEffect, useRef } from "react";
import * as studentService from "@/services/student-service";
import Chart from "react-apexcharts";

const AcademicAnalysisComponent = ({
  student,
  subjects,
  speedAndAccuracy,
}: any) => {
  const [
    subjectQuestionComplexityChartOptions,
    setSubjectQuestionComplexityChartOptions,
  ] = useState<any>({
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
        categories: ["e", "b"],
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

  const [
    questionCategoryDistributionChartOptions,
    setQuestionCategoryDistributionChartOptions,
  ] = useState<any>({
    series: [],
    options: {
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
    },
  });
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
        },
      },
      yaxis: {
        title: {
          text: "Average Speed (in secs)",
        },
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
      tooltip: {
        x: {
          show: true,
          format: "dd MMM",
          formatter: function (
            value,
            { series, seriesIndex, dataPointIndex, w }
          ) {
            return w.config.series[seriesIndex].name;
          },
        },
        y: {
          formatter: function (
            value,
            { series, seriesIndex, dataPointIndex, w }
          ) {
            return (
              "Accuracy: " +
              w.config.series[seriesIndex].data[dataPointIndex][0] +
              " <br/> " +
              "Speed: " +
              w.config.series[seriesIndex].data[dataPointIndex][1]
            );
          },
          title: {
            formatter: (seriesName) => "",
          },
        },
        z: {
          title: "",
          formatter: function (number) {
            return "";
          },
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
  const [unitEsplapseTimes, setUnitEsplapseTimes] = useState<any>([]);
  const [unitAccuracyPercents, setUnitAccuracyPercents] = useState<any>([]);
  const [reload, setReload] = useState<boolean>(false);
  const [selectAllSub, setSelectAllSub] = useState<boolean>(true);
  const [isSelected, setIsSelected] = useState<any>([]);
  const [allSubjects, setAllSubjects] = useState<any>([]);
  const [speedCategory, setSpeedCategory] = useState<any>([]);
  const [showCategory, setShowCategory] = useState<boolean>(true);
  const [accuracyCategory, setAccuracyCategory] = useState<any>([
    {
      label: "<50%",
      color: "#f15454",
    },
    {
      label: "50-75%",
      color: "#FF8000",
    },
    {
      label: "75-90%",
      color: "#107ebd",
    },
    {
      label: ">=90%",
      color: "#08db62",
    },
  ]);
  const [timeAnalysisQuestions, setTimeAnalysisQuestions] = useState<any>({});
  const [allQuestionDistribution, setAllQuestionDistribution] = useState<any>(
    []
  );
  const [questionSubjectDistributionArr, setQuestionSubjectDistributionArr] =
    useState<any>([]);
  const [selectedQuestionDistribution, setSelectedQuestionDistribution] =
    useState<string>("");
  const [allSubjectComplexity, setAllSubjectComplexity] = useState<any>([]);
  const [selectedSubjectComplexity, setSelectedSubjectComplexity] =
    useState<string>("");
  const [subjectComplexityArr, setSubjectComplexityArr] = useState<any>([]);

  useEffect(() => {
    studentService
      .getSubjectQuestionComplexity({ studentId: student._id })
      .then((d: any[]) => {
        if (d && d.length > 0) {
          setAllSubjectComplexity(d);
          let updated_subjectComplexityArr = subjectComplexityArr;
          d.forEach((element) => {
            if (
              element.subjectName &&
              !subjectComplexityArr.some(
                (sub) => sub._id === element._id.subject
              )
            ) {
              updated_subjectComplexityArr.push({
                _id: element._id.subject,
                name: element.subjectName,
              });
              setSubjectComplexityArr(updated_subjectComplexityArr);
            }
          });
          updated_subjectComplexityArr.sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setSubjectComplexityArr(updated_subjectComplexityArr);

          filterSubjectComplexity(updated_subjectComplexityArr[0].name, d);
        }
      });

    studentService
      .questionCategoryDistribution({ studentId: student._id })
      .then((d: any[]) => {
        setAllQuestionDistribution(d);
        let temp_questionSubjectDistributionArr =
          questionSubjectDistributionArr;
        if (d && d.length > 0) {
          d.forEach((element) => {
            if (
              element.subjectName &&
              !questionSubjectDistributionArr.some(
                (sub) => sub._id === element._id.subject
              )
            ) {
              temp_questionSubjectDistributionArr.push({
                _id: element._id.subject,
                name: element.subjectName,
              });
              setQuestionSubjectDistributionArr(
                temp_questionSubjectDistributionArr
              );
            }
          });
          temp_questionSubjectDistributionArr.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setQuestionSubjectDistributionArr(
            temp_questionSubjectDistributionArr
          );
          filterQuestionDistribution(
            temp_questionSubjectDistributionArr[0]?.name,
            d
          );
        }
      });

    setAllSubjects(speedAndAccuracy.user);

    loadDataChart(speedAndAccuracy.user);

    loadAccuracyChart(speedAndAccuracy.user);
    loadSpeedChart(speedAndAccuracy.user);
  }, []);

  const loadAccuracyChart = (items: any, isSelectAllsub = true) => {
    const getAccuracyColor = (acc) => {
      if (acc < 50) {
        return "#f15454";
      }
      if (acc < 75) {
        return "#FF8000";
      }
      if (acc < 90) {
        return "#107ebd";
      }

      return "#08db62";
    };

    const category: any = [];
    const series: any = [];
    const colors: any = [];
    const sorted: any = items?.filter((i) => i.accuracy != 0);
    sorted?.sort((a, b) => {
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
            text: isSelectAllsub ? "Subject" : "Unit",
          },
        },
        fill: {
          colors: colors,
        },
      },
    });
  };

  const loadSpeedChart = (items: any, isSelectAllsub = true) => {
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

    const category: any = [];
    const series: any = [];
    const colors: any = [];
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
      category.push(item.name);
      series.push(Math.round(item.speed / 1000));

      colors.push(getSpeedColor(item.speed));
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
            text: isSelectAllsub ? "Subject" : "Unit",
          },
        },
        fill: {
          colors: colors,
        },
      },
    });
  };

  const loadDataChart = (sub: any) => {
    setUnitAccuracyPercents([]);
    setUnitEsplapseTimes([]);
    let unitAccuracyPercents_temp: any[] = [];
    let unitEsplapseTimes_temp: any[] = [];

    const bubbleChartData: any = [];

    let maxTime = 0;
    sub?.forEach((s, i) => {
      bubbleChartData[i] = { sub: "", data: [] };
      const acc = s.accuracy * 100;
      const temp_unitAccuracyPercents = unitAccuracyPercents_temp;
      temp_unitAccuracyPercents.push({
        y: Math.max(0, Math.round(acc)),
        name: s.name,
      });
      setUnitAccuracyPercents(temp_unitAccuracyPercents);

      const speed = s.speed > 0 ? s.speed / 1000 : 0;
      const temp_unitEsplapseTimes = unitEsplapseTimes_temp;
      temp_unitEsplapseTimes.push({
        y: Math.round(speed),
        name: s.name,
      });
      setUnitEsplapseTimes(temp_unitEsplapseTimes);

      if (temp_unitEsplapseTimes[i] && temp_unitAccuracyPercents[i]) {
        bubbleChartData[i].data.push(
          temp_unitAccuracyPercents[i].y,
          temp_unitEsplapseTimes[i].y,
          15
        );
        if (maxTime < temp_unitEsplapseTimes[i].y) {
          maxTime = temp_unitEsplapseTimes[i].y;
        }
        bubbleChartData[i].sub = temp_unitAccuracyPercents[i].name;
      }
    });

    // for bubble graph
    const bdata: any = [];
    for (let j = 0; j < sub?.length; j++) {
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

  const filterSubject = (sub: any, i: any) => {
    setSelectAllSub(false);
    setIsSelected([]);
    setReload(true);
    if (sub === "All") {
      setSelectAllSub(true);
      loadDataChart([...allSubjects]);
      loadAccuracyChart(allSubjects);
      loadSpeedChart(allSubjects);
    } else {
      setSelectAllSub(false);
      setIsSelected((prevSelected) => {
        const newSelected = [...prevSelected];
        newSelected[i] = true;
        return newSelected;
      });

      loadDataChart(sub.units);
      loadAccuracyChart(sub.units, false);
      loadSpeedChart(sub.units, false);
    }
  };

  const drawSubjectQuestionComplexity = (data: any) => {
    const correct: any = [];
    const wrong: any = [];
    const missed: any = [];
    const skipped: any = [];
    const partial: any = [];
    const categories: any = [];
    data.forEach((ques) => {
      correct.push(ques.correct);
      wrong.push(ques.incorrect);
      missed.push(ques.missed);
      skipped.push(ques.skipped);
      partial.push(ques.partial);
      categories.push(ques._id.complexity);
    });

    setSubjectQuestionComplexityChartOptions({
      ...subjectQuestionComplexityChartOptions,
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
          name: "Partially Correct",
          data: partial,
        },
        {
          name: "Incorrect",
          data: wrong,
        },
        {
          name: "Skipped",
          data: skipped,
        },
      ],
      options: {
        ...subjectQuestionComplexityChartOptions.options,
        xaxis: {
          ...subjectQuestionComplexityChartOptions.options.xaxis,
          categories: categories,
        },
      },
    });
  };

  const drawQuestionCategoryDistribution = (data: any, reload?: any) => {
    const correct: any = [];
    const wrong: any = [];
    const missed: any = [];
    const skipped: any = [];
    const partial: any = [];
    const categories: any = [];

    data.forEach((quest) => {
      correct.push(quest.correct);
      wrong.push(quest.incorrect);
      missed.push(quest.missed);
      skipped.push(quest.skipped);
      partial.push(quest.partial);
      categories.push(quest._id.category);
    });

    setQuestionCategoryDistributionChartOptions({
      ...questionCategoryDistributionChartOptions,
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
          name: "Partially Correct",
          data: partial,
        },
        {
          name: "Incorrect",
          data: wrong,
        },
        {
          name: "Skipped",
          data: skipped,
        },
      ],
      options: {
        ...questionCategoryDistributionChartOptions.options,
        xaxis: {
          ...questionCategoryDistributionChartOptions.options.xaxis,
          categories: categories,
        },
      },
    });
  };

  const filterSubjectComplexity = (filter: any, allSub: any) => {
    setSelectedSubjectComplexity(filter);
    const filterData = allSub.filter(
      (sub) => sub.subjectName?.toLowerCase() === filter.toLowerCase()
    );

    drawSubjectQuestionComplexity(filterData);

    filterQuestionDistribution(filter, allQuestionDistribution);
  };

  const filterQuestionDistribution = (filter: any, allSub: any) => {
    setSelectedQuestionDistribution(filter);
    const filterData = allSub.filter(
      (sub) => sub.subjectName?.toLowerCase() === filter.toLowerCase()
    );
    setShowCategory(filterData.length > 1);

    setTimeout(() => {
      drawQuestionCategoryDistribution(filterData);
    }, 200);
  };

  return (
    <div className="" id="performance">
      <div className="error-analysis clearfix mx-auto mw-100 pt-0">
        <div className="row">
          <div className="col-lg-2">
            {/* start .error-analysis */}
            <div className="sidebar">
              <ul>
                <li>
                  <a
                    onClick={() => filterSubject("All", 0)}
                    className={selectAllSub ? "bold" : ""}
                  >
                    All Subjects
                  </a>
                </li>

                {subjects.map((sub, i) => (
                  <li key={i}>
                    <a
                      onClick={() => filterSubject(sub, i)}
                      className={isSelected[i] ? "bold" : ""}
                    >
                      {sub.name}
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
                      <strong className="admin-head">Accuracy Analysis</strong>
                      <p className="admin-head2">
                        Accuracy is based on whether a question is answered
                        correctly. Review and understand individual student’s
                        knowledge on a given subject matter. Deep dive into unit
                        and topic to pinpoint areas of improvement.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {accuracyChartOptions &&
                        accuracyChartOptions.series &&
                        accuracyChartOptions.series.length > 0 && (
                          <Chart
                            series={accuracyChartOptions.series}
                            options={accuracyChartOptions.options}
                            type="bar"
                            width="100%"
                            height="300"
                          />
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
                      <strong className="admin-head">Speed Analysis</strong>
                      <p className="admin-head2">
                        Speed is the time taken to solve a question. Review and
                        understand individual student’s efficiency on a given
                        subject matter. Deep dive into unit and topic to
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
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <strong className="admin-head">
                        Proficiency Measurement
                      </strong>
                      <p className="admin-head2">
                        You should strive for higher accuracy and low speed for
                        each area. Higher speed and higher accuracy mean that
                        you need to learn new tricks. It would be best if you
                        learned new tips and tricks. Higher speed and lower
                        accuracy mean that spending more time doesn’t mean
                        better results, and you need to gain more knowledge. The
                        lower speed and lower accuracy possibly mean that you
                        didn’t know the area well, made a guess and moved on.
                        Higher accuracy and low speed mean that you have
                        mastered the area.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {chartOptions &&
                        chartOptions.series &&
                        chartOptions.series.length > 0 && (
                          <Chart
                            series={chartOptions.series}
                            options={chartOptions.options}
                            type="bubble"
                            width="100%"
                            height="300"
                          />
                        )}
                    </div>
                  </div>
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <strong className="admin-head">
                        Subject wise Question Complexity
                      </strong>
                      <p className="admin-head2">
                        This graph shows how many easy, moderate, or difficult
                        questions you attempted in each subject and how many you
                        got right, wrong, or missed. Get a quick look at where
                        you shine or might need more practice.
                      </p>
                    </div>
                    <div className="chart_area_body new-body-chart_area_body">
                      {allSubjectComplexity &&
                      allSubjectComplexity.length > 0 ? (
                        <>
                          <div className="row">
                            <div className="col-lg-12">
                              <Chart
                                // ref={subjectQuestionComplexityChart}
                                series={
                                  subjectQuestionComplexityChartOptions.series
                                }
                                options={
                                  subjectQuestionComplexityChartOptions.options
                                }
                                type="bar"
                                width="100%"
                                height="300"
                              />
                            </div>
                          </div>
                          <div className="filter-area clearfix">
                            <div className="filter-item">
                              <div className="dropdown">
                                <button
                                  className="btn dropdown-toggle border-0"
                                  type="button"
                                  id="QuestionComplexity_filterLavel"
                                  data-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <span>{selectedSubjectComplexity}</span>
                                </button>

                                <div
                                  className="dropdown-menu border-0 py-0"
                                  aria-labelledby="filterLavel"
                                >
                                  {subjectComplexityArr.map((s, index) => (
                                    <a
                                      key={index}
                                      className="dropdown-item"
                                      onClick={() =>
                                        filterSubjectComplexity(
                                          s.name,
                                          allSubjectComplexity
                                        )
                                      }
                                      // href="#"
                                    >
                                      {s.name}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <svg
                            width="120"
                            height="62"
                            viewBox="0 0 120 62"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M113.922 25.4102H18.0792C16.9757 25.4102 16.082 25.8299 16.082 26.3482V35.727C16.082 36.2453 16.9757 36.665 18.0792 36.665H113.922C115.025 36.665 115.919 36.2453 115.919 35.727V26.3476C115.919 25.8299 115.025 25.4102 113.922 25.4102Z"
                              fill="#AAAAD5"
                              fillOpacity="0.5"
                            />
                            <path
                              d="M74.265 11.0661V11.0332H18.0792C16.9757 11.0332 16.082 11.4529 16.082 11.9713V21.35C16.082 21.8683 16.9757 22.2881 18.0792 22.2881H74.265V22.2552C74.6929 22.2038 75.0723 22.087 75.3435 21.9233C75.6147 21.7595 75.7623 21.5581 75.7632 21.3506V11.9706C75.7632 11.5342 75.1256 11.1708 74.265 11.0661Z"
                              fill="#AAAAD5"
                              fillOpacity="0.5"
                            />
                            <path
                              d="M86.966 39.7129H18.0792C16.9757 39.7129 16.082 40.1326 16.082 40.651V50.0297C16.082 50.548 16.9757 50.9678 18.0792 50.9678H86.966C88.0696 50.9678 88.9632 50.548 88.9632 50.0297V40.651C88.9632 40.1326 88.0696 39.7129 86.966 39.7129Z"
                              fill="#AAAAD5"
                              fillOpacity="0.5"
                            />
                          </svg>
                          <h2 className="text-muted">No data yet</h2>
                          <p className="text-muted">
                            Spend sometime to see your progress
                          </p>
                        </div>
                      )}
                    </div>
                    {/* <div className="filter-area clearfix">
                      <div className="filter-item">
                        <div className="dropdown">
                          <a className="btn dropdown-toggle border-0" href="#" role="button" id="QuestionComplexity_filterLavel" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span>{selectedSubjectComplexity}</span>
                          </a>
                          <div className="dropdown-menu border-0 py-0" aria-labelledby="filterLavel">
                            {subjectComplexityArr.map((s, index) => (
                              <a key={index} className="dropdown-item" onClick={() => filterSubjectComplexity(s.name)}>{s.name}</a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                  {showCategory && (
                    <div className="chart_boxes">
                      <div className="admin-header">
                        <strong className="admin-head">
                          Subject wise Question Category Distribution
                        </strong>
                        <p className="admin-head2">
                          Discover how you&apos;re doing in different subject
                          question categories. Each bar represents the number of
                          correct, incorrect, and missed questions, giving you a
                          clear picture of areas to celebrate and where
                          there&apos;s room to improve. Get a grasp on your
                          strengths and areas for focus at a glance!
                        </p>
                      </div>
                      <div className="chart_area_body new-body-chart_area_body">
                        {allQuestionDistribution &&
                        allQuestionDistribution.length > 0 ? (
                          <Chart
                            series={
                              questionCategoryDistributionChartOptions.series
                            }
                            options={
                              questionCategoryDistributionChartOptions.options
                            }
                            type="bar"
                            width="100%"
                            height="300"
                          />
                        ) : (
                          <div className="text-center">
                            <svg
                              width="344"
                              height="308"
                              viewBox="0 0 344 308"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M140.989 42.1839L140.989 265.817C140.989 268.391 143.318 270.477 146.194 270.477L198.231 270.477C201.107 270.477 203.436 268.391 203.436 265.817L203.436 42.1839C203.436 39.609 201.107 37.5239 198.231 37.5239L146.191 37.5239C143.318 37.5239 140.989 39.609 140.989 42.1839Z"
                                fill="#D4D4EA"
                              />
                              <path
                                d="M61.3981 134.716L61.2158 134.716L61.2158 265.817C61.2158 268.391 63.5447 270.477 66.4205 270.477L118.457 270.477C121.333 270.477 123.662 268.391 123.662 265.817L123.662 134.716L123.48 134.716C123.195 133.718 122.547 132.833 121.638 132.2C120.73 131.567 119.612 131.222 118.461 131.22L66.4171 131.22C63.9953 131.22 61.9795 132.708 61.3981 134.716Z"
                                fill="#D4D4EA"
                              />
                              <path
                                d="M220.342 105.081L220.342 265.817C220.342 268.391 222.671 270.477 225.547 270.477L277.583 270.477C280.459 270.477 282.788 268.391 282.788 265.817L282.788 105.081C282.788 102.506 280.459 100.421 277.583 100.421L225.547 100.421C222.671 100.421 220.342 102.506 220.342 105.081Z"
                                fill="#D4D4EA"
                              />
                            </svg>
                            <h2 className="text-muted">No data yet</h2>
                            <p className="text-muted">
                              Spend sometime to see your progress
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicAnalysisComponent;
