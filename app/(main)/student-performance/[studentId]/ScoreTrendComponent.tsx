"use client";
import { update } from "lodash";
import React, { useState, useEffect, useRef } from "react";
import * as studentService from "@/services/student-service";
import Chart from "react-apexcharts";

const ScoreTrendComponent = ({ student }: any) => {
  const [satScores, setSatScores] = useState<any>(null);
  const [actScores, setaActScores] = useState<any>(null);
  const [satChartOptions, setSatChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 500,
        type: "line",
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [5, 7, 5],
        curve: "straight",
        dashArray: [0, 0, 5],
      },
      legend: {
        tooltipHoverFormatter: function (val, opts) {
          return (
            val +
            " - <strong>" +
            opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
            "</strong>"
          );
        },
        itemMargin: {
          vertical: 10,
        },
      },
      markers: {
        size: 2,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        categories: [],
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    },
  });

  const [actChartOptions, setActChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 500,
        type: "line",
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [5, 7, 5],
        curve: "straight",
        dashArray: [0, 0, 5],
      },
      legend: {
        tooltipHoverFormatter: function (val, opts) {
          return (
            val +
            " - <strong>" +
            opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
            "</strong>"
          );
        },
        itemMargin: {
          vertical: 10,
        },
      },
      markers: {
        size: 2,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        categories: [],
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    },
  });

  useEffect(() => {
    studentService
      .getSATandACTscores({ user: student._id })
      .then((res: any) => {
        setSatScores(res.satScores);
        setaActScores(res.actScores);

        if (res.satScores.length) {
          const math = [];
          const rw = [];
          const total = [];
          for (const atm of res.satScores) {
            if (atm.SAT.total) {
              let hasMath = false;
              let hasRW = false;
              for (const sec of atm.SAT.sections) {
                if (sec.section.indexOf("Math") > -1) {
                  math.push(sec.sat);
                  hasMath = true;
                } else {
                  rw.push(sec.sat);
                  hasRW = true;
                }
              }
              if (!hasMath) {
                math.push(null);
              }
              if (!hasRW) {
                rw.push(null);
              }
              total.push(atm.SAT.total);
            }
          }
          if (total.length) {
            setSatChartOptions({
              ...satChartOptions,
              series: [
                {
                  name: "Total",
                  data: total,
                },
                {
                  name: "Math",
                  data: math,
                },
                {
                  name: "Reading and Writing",
                  data: rw,
                },
              ],
              options: {
                ...satChartOptions.options,
                xaxis: {
                  ...satChartOptions.options.xasis,
                  categories: res.satScores.map((atm) => atm.title),
                },
              },
            });
          }
        }

        if (res.actScores.length) {
          const total = [];
          const subjects = [];
          for (const atm of res.actScores) {
            if (atm.ACT) {
              for (const sec in atm.ACT.subjects) {
                let sub = subjects.find((s) => s.name == sec);
                if (!sub) {
                  sub = {
                    name: sec,
                    data: [],
                  };
                  subjects.push(sub);
                }
                sub.data.push(atm.ACT.subjects[sec].scale);
              }

              total.push(atm.ACT.total);
            }
          }
          if (total.length) {
            setActChartOptions({
              ...actChartOptions,
              series: [
                {
                  name: "Total",
                  data: total,
                },
                ...subjects,
              ],
              options: {
                ...actChartOptions.options,
                xaxis: {
                  ...actChartOptions.options.xasis,
                  categories: res.satScores.map((atm) => atm.title),
                },
              },
            });
          }
        }
      });
  }, []);

  return (
    <div className="" id="performance">
      <div className="error-analysis clearfix mx-auto mw-100 pt-0">
        <div className="error-analysis-area w-100">
          <div className="accordation-area pt-0">
            <div className="accordion">
              <div className="row">
                {satChartOptions.series.length > 0 && (
                  <div className="col">
                    <div className="chart_boxes">
                      <div className="admin-header">
                        <h3 className="admin-head">SAT</h3>
                        <p className="admin-head2">
                          The graph displays score trends for Math, Reading and
                          Writing SAT tests over time, showing consistent
                          improvements.
                        </p>
                      </div>
                      <div className="chart_area_body">
                        <div>
                          <Chart
                            series={satChartOptions.series}
                            options={satChartOptions.options}
                            type="line"
                            width="100%"
                            height="300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {actChartOptions.series.length > 0 && (
                  <div className="col">
                    <div className="chart_boxes">
                      <div className="admin-header">
                        <h3 className="admin-head">ACT</h3>
                        <p className="admin-head2">
                          The graph displays score trends for English, Reading,
                          Math and Science ACT tests over time, showing
                          consistent improvements.
                        </p>
                      </div>
                      <div className="chart_area_body">
                        <div>
                          <Chart
                            series={actChartOptions.series}
                            options={actChartOptions.options}
                            type="line"
                            width="100%"
                            height="300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!satChartOptions.series.length &&
                !actChartOptions.series.length && (
                  <div className="mt-3">
                    <img
                      className="mx-auto"
                      src="/assets/images/empty-chart.svg"
                      alt="Empty chart"
                    />
                    <p className="text-center">
                      You have not taken any SAT or ACT assessments.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreTrendComponent;
