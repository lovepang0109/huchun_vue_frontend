"use client";
import React, { useState, useEffect, useRef, use } from "react";
import * as studentSvc from "@/services/student-service";
import Chart from "react-apexcharts";

const ComparativeAnalysisComponent = ({
  student,
  subjects,
  speedAndAccuracy,
}: any) => {
  const [accChartH, setAccChartH] = useState<any>(null);
  const [speedChartH, setSpeedChartH] = useState<any>(null);
  const [speedchartOptions, setSpeedchartOptions] = useState<any>({
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
        textAnchor: "start",
        offsetX: 10,
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
          text: "Time (seconds)",
        },
        categories: [],
      },
      yaxis: {},
    },
  });

  const [accuracychartOptions, setAccuracychartOptions] = useState<any>({
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
        textAnchor: "start",
        offsetX: 10,
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
          text: "Accuracy (%)",
        },
        categories: [],
      },
      yaxis: {},
    },
  });

  const [reload, setReload] = useState<boolean>(false);
  const [allSubjects, setAllSubjects] = useState<boolean>(true);
  const [isSelected, setIsSelected] = useState<any[]>([]);
  const [allUnits, setAllUnits] = useState<any[]>([]);

  useEffect(() => {
    loadDataChart(
      speedAndAccuracy.user,
      speedAndAccuracy.topper,
      speedAndAccuracy.average
    );
  }, []);

  const loadDataChart = (student, topper, average) => {
    getSpeedChart(student, topper, average);

    getAccuracyChart(student, topper, average);
  };

  const getSpeedChart = (student, topper, average: any[]) => {
    const avgSpeed = [];
    const topSpeed = [];
    const studentSpeed = [];
    const cat = [];
    for (const item of student) {
      cat.push(item.name);
      studentSpeed.push(Math.round(item.speed / 1000));

      const tp = topper.find((t) => t._id == item._id);
      if (tp) {
        topSpeed.push(Math.round(tp.speed / 1000));
      } else {
        topSpeed.push(0);
      }
      const sp = average.find((t) => t._id == item._id);
      if (sp) {
        avgSpeed.push(Math.round(sp.speed / 1000));
      } else {
        avgSpeed.push(0);
      }
    }

    const max = Math.max(0, ...avgSpeed, ...topSpeed, ...studentSpeed);

    const series = [
      {
        name: "Best",
        data: topSpeed,
      },
      {
        name: "You",
        data: studentSpeed,
      },
      {
        name: "Average",
        data: avgSpeed,
      },
    ];
    setSpeedChartH(150 + cat.length * 60);
    if (reload) {
      setSpeedchartOptions({
        ...speedchartOptions,
        series: series,
        options: {
          ...speedchartOptions.options,
          xaxis: {
            ...speedchartOptions.options.xaxis,
            categories: cat,
          },
          yaxis: {
            ...speedchartOptions.options.yaxis,
            max: max + 100,
          },
          chart: {
            ...speedchartOptions.options.chart,
            height: 150 + cat.length * 60,
          },
        },
      });
    } else {
      setSpeedchartOptions({
        ...speedchartOptions,
        series: series,
        options: {
          ...speedchartOptions.options,
          xaxis: {
            ...speedchartOptions.options.xaxis,
            categories: cat,
          },
          yaxis: {
            ...speedchartOptions.options.yaxis,
            max: max + 100,
          },
          chart: {
            ...speedchartOptions.options.chart,
            height: 150 + cat.length * 60,
          },
        },
      });
    }
  };

  const getAccuracyChart = (student, topper, average: any[]) => {
    const avgAcc = [];
    const topAcc = [];
    const studentAcc = [];
    const cat = [];
    for (const item of student) {
      cat.push(item.name);
      studentAcc.push(Math.max(0, Math.round(item.accuracy * 100)));

      const tp = topper.find((t) => t._id == item._id);
      if (tp) {
        topAcc.push(Math.max(0, Math.round(tp.accuracy * 100)));
      } else {
        topAcc.push(0);
      }
      const sp = average.find((t) => t._id == item._id);
      if (sp) {
        avgAcc.push(Math.max(0, Math.round(sp.accuracy * 100)));
      } else {
        avgAcc.push(0);
      }
    }

    const max = Math.max(0, ...avgAcc, ...topAcc, ...studentAcc);

    const series = [
      {
        name: "Best",
        data: topAcc,
      },
      {
        name: "You",
        data: studentAcc,
      },
      {
        name: "Average",
        data: avgAcc,
      },
    ];
    setAccChartH(150 + cat.length * 60);
    if (reload) {
      setAccuracychartOptions({
        ...accuracychartOptions,
        series: series,
        options: {
          ...accuracychartOptions.options,
          xaxis: {
            ...accuracychartOptions.options.xaxis,
            categories: cat,
          },
          yaxis: {
            ...accuracychartOptions.options.yaxis,
            max: max + 10,
          },
          chart: {
            ...accuracychartOptions.options.chart,
            height: 150 + cat.length * 60,
          },
        },
      });
    } else {
      setAccuracychartOptions({
        ...accuracychartOptions,
        series: series,
        options: {
          ...accuracychartOptions.options,
          xaxis: {
            ...accuracychartOptions.options.xaxis,
            categories: cat,
          },
          yaxis: {
            ...accuracychartOptions.options.yaxis,
            max: max + 10,
          },
          chart: {
            ...accuracychartOptions.options.chart,
            height: 150 + cat.length * 60,
          },
        },
      });
    }
  };

  const filterSubject = (sub, i) => {
    setAllSubjects(false);
    setIsSelected([]);
    setReload(true);
    if (sub === "All") {
      setAllSubjects(true);

      loadDataChart(
        speedAndAccuracy.user,
        speedAndAccuracy.topper,
        speedAndAccuracy.average
      );
    } else {
      setAllSubjects(false);
      setIsSelected((prevState) => {
        const newState = [...prevState];
        newState[i] = true;
        return newState;
      });

      loadDataChart(
        speedAndAccuracy.user.find((s) => s._id == sub._id).units,
        speedAndAccuracy.topper.find((s) => s._id == sub._id).units,
        speedAndAccuracy.average.find((s) => s._id == sub._id).units
      );
    }
  };

  return (
    <>
      <div className="error-analysis mx-auto mw-100 pt-0">
        <div className="row">
          <div className="col-lg-2">
            <div className="sidebar">
              <ul>
                <li>
                  <a
                    onClick={() => filterSubject("All", 0)}
                    className={allSubjects ? "bold" : ""}
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
                      <span className="admin-head">Accuracy Comparison</span>
                      <p className="admin-head2">
                        This graph helps you see how well you answer questions
                        in different subjects. You can see your accuracy
                        side-by-side with the best student (&quot;Best&quot;)
                        and the average accuracy of all students. It&apos;s a
                        great way to understand where you&apos;re doing well and
                        where you might want to study more.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {accuracychartOptions.series[0] && (
                        <Chart
                          series={accuracychartOptions.series}
                          options={accuracychartOptions.options}
                          type="bar"
                          width="100%"
                          height={accChartH}
                        />
                      )}
                    </div>
                  </div>
                  <div className="chart_boxes">
                    <div className="admin-header">
                      <span className="admin-head">Speed Comparison</span>
                      <p className="admin-head2">
                        Know how fast you answer questions in different
                        subjects. You can see your speed next to the quickest
                        student (&quot;Best&quot;) and the average speed of
                        everyone. It&apos;s a fun way to see if you&apos;re a
                        quick thinker or if you take a little more time to
                        consider your answers.
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {speedchartOptions.series[0] && (
                        <Chart
                          series={speedchartOptions.series}
                          options={speedchartOptions.options}
                          type="bar"
                          width="100%"
                          height={speedChartH}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComparativeAnalysisComponent;
