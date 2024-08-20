import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
interface props {
  attempt: any;
  topperAttempt: any;
  averageAttempt: any;
}
const StudentAttemptComparativeAnalysis = ({
  attempt,
  topperAttempt,
  averageAttempt,
}: props) => {
  const [reload, setReload] = useState<boolean>(false);
  const [allSubjects, setAllSubjects] = useState<boolean>(true);
  const [isSelected, setIsSelected] = useState<any[]>([]);
  const [allUnits, setAllUnits] = useState<any[]>([]);
  const [topicEsplapseTimes, setTopicEsplapseTimes] = useState<any[]>([]);
  const [topicAccuracyPercents, setTopicAccuracyPercents] = useState<any[]>([]);
  const [averageAccuracyPercents, setAverageAccuracyPercents] = useState<any[]>(
    []
  );
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
        offsetX: -3,
        style: {
          fontSize: "12px",
          colors: ["#fff"],
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
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
        offsetX: -6,
        style: {
          fontSize: "12px",
          colors: ["#fff"],
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        categories: [],
      },
      yaxis: {},
    },
  });

  useEffect(() => {
    const init = () => {
      let allUnit: any = [];
      if (attempt.subjects?.length) {
        attempt.subjects.forEach((element: any) => {
          allUnit = allUnit.concat(element.units);
        });
        setAllUnits(allUnit!);
      }
      if (topperAttempt.subjects?.length) {
        let topperUnits: any = [];
        topperAttempt.subjects.forEach((element: any) => {
          topperUnits = topperUnits.concat(element.units);
        });
        loadDataChart(allUnit, topperUnits, averageAttempt);
      }
    };
    init();
  }, []);

  const loadDataChart = (student: any, topper: any, average: any) => {
    let students = student;
    let toppers = topper;
    let averages = average;
    if (average.length > 1) {
      averages.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
    if (topper.length > 1) {
      toppers.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
    if (student.length > 1) {
      students.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
    let topicAccuracyPercent: any = [];
    let topperAccuracyPercent: any = [];
    let averageAccuracyPercent: any = [];
    let topicEsplapseTime: any = [];
    let topperEsplapseTime: any = [];
    let averageEsplapseTime: any = [];

    students.forEach((s: any) => {
      const acc = s.accuracy * 100;
      topicAccuracyPercent.push({
        y: Math.max(0, Math.round(acc)),
        name: s.name,
      });

      if (s.speed > 0) {
        const speed = s.speed / 1000;
        topicEsplapseTime.push({
          y: Math.round(speed),
          name: s.name,
        });
      }
    });
    toppers.forEach((tA: any) => {
      const acc = tA.accuracy * 100;
      topperAccuracyPercent.push({
        y: Math.max(0, Math.round(acc)),
        name: tA.name,
      });

      if (tA.speed > 0) {
        const speed = tA.speed / 1000;
        topperEsplapseTime.push({
          y: Math.round(speed),
          name: tA.name,
        });
      }
    });
    averages.forEach((aA: any) => {
      averageAccuracyPercent.push({
        y: Math.max(0, Math.round(aA.accuracy)),
        name: aA.name,
      });

      if (aA.speed > 0) {
        averageEsplapseTime.push({
          y: Math.round(aA.speed),
          name: aA.name,
        });
      }
    });
    getSpeedChart(
      topicEsplapseTime,
      topperEsplapseTime,
      averageEsplapseTime,
      averageAccuracyPercent
    );
    let accuracyData: any[] = [];
    accuracyData[0] = {
      scorer: "Topper",
      data: [],
    };
    accuracyData[1] = {
      scorer: "You",
      data: [],
    };
    accuracyData[2] = {
      scorer: "Average",
      data: [],
    };
    for (let j = 0; j < topperAccuracyPercent.length; j++) {
      accuracyData[0].data.push(topperAccuracyPercent[j].y);
    }
    for (let j = 0; j < topicAccuracyPercent.length; j++) {
      accuracyData[1].data.push(topicAccuracyPercent[j].y);
    }
    for (let j = 0; j < averageAccuracyPercent.length; j++) {
      accuracyData[2].data.push(averageAccuracyPercent[j].y);
    }

    if (reload) {
      let cat: any = [];
      averageAccuracyPercent.forEach((e: any) => {
        cat.push(e.name);
      });

      let dat: any = [];
      for (let j = 0; j < accuracyData.length; j++) {
        dat.push({ name: accuracyData[j].scorer, data: accuracyData[j].data });
      }
      setAccuracychartOptions((prev: any) => ({
        ...prev,
        series: dat,
        options: {
          ...prev.options,
          xaxis: { categories: cat },
          chart: {
            height: Math.max(300, averageAccuracyPercent.length * 60),
          },
        },
      }));
    } else {
      let accuracychartOption = accuracychartOptions;
      averageAccuracyPercent.forEach((e: any) => {
        accuracychartOption.options.xaxis.categories.push(e.name);
      });
      for (let j = 0; j < accuracyData.length; j++) {
        accuracychartOption.series.push({
          name: accuracyData[j].scorer,
          data: accuracyData[j].data,
        });
      }

      accuracychartOption.options.chart.height = Math.max(
        300,
        averageAccuracyPercent.length * 60
      );
      setAccuracychartOptions(accuracychartOption);
    }
    setTopicAccuracyPercents(topicAccuracyPercent);
    setTopicEsplapseTimes(topicEsplapseTime);
    setAverageAccuracyPercents(averageAccuracyPercent);
  };

  const getSpeedChart = (
    attempt: any,
    topper: any,
    average: any,
    averageAccuracyPercents: any
  ) => {
    let speedData: any[] = [];
    speedData[0] = {
      scorer: "Topper",
      data: [],
    };
    speedData[1] = {
      scorer: "You",
      data: [],
    };
    speedData[2] = {
      scorer: "Average",
      data: [],
    };
    for (let j = 0; j < topper.length; j++) {
      speedData[0].data.push(topper[j].y);
    }
    for (let j = 0; j < attempt.length; j++) {
      speedData[1].data.push(attempt[j].y);
    }
    for (let j = 0; j < average.length; j++) {
      speedData[2].data.push([average[j].y]);
    }

    if (reload) {
      let cat: any = [];
      averageAccuracyPercents.forEach((e: any) => {
        cat.push(e.name);
      });

      let da: any = [];
      for (let i = 0; i < speedData.length; i++) {
        da.push({
          name: speedData[i].scorer,
          data: speedData[i].data,
        });
      }
      setSpeedchartOptions((prev: any) => ({
        ...prev,
        series: da,
        options: {
          ...prev.options,
          xaxis: { categories: cat },
          chart: { height: Math.max(300, averageAccuracyPercents.length * 60) },
        },
      }));
    } else {
      let speedchartOption = speedchartOptions;
      averageAccuracyPercents.forEach((e: any) => {
        speedchartOption.options.xaxis.categories.push(e.name);
      });
      speedchartOption.options.chart.height = Math.max(
        300,
        averageAccuracyPercents.length * 60
      );

      for (let i = 0; i < speedData.length; i++) {
        speedchartOption.series.push({
          name: speedData[i].scorer,
          data: speedData[i].data,
        });
      }
      setSpeedchartOptions(speedchartOption);
    }
  };

  const getSubjectFilter = (sub: any, i: number) => {
    setAllSubjects(false);
    let isSelectedList = [];
    setReload(true);
    if (sub === "All") {
      setAllSubjects(true);
      let topperUnits: any = [];
      topperAttempt.subjects.forEach((element: any) => {
        topperUnits = topperUnits.concat(element.units);
      });
      loadDataChart(allUnits, topperUnits, averageAttempt);
      return;
    } else {
      setAllSubjects(false);
      isSelectedList[i] = true;
      let attempt: any = [];
      attempt.push(sub);
      let topper: any = [];
      let average: any = [];
      let topperUnits: any = [];
      topperAttempt.subjects.forEach((element: any) => {
        topperUnits = topperUnits.concat(element.units);
      });
      topperUnits.forEach((e: any) => {
        if (attempt[0].name === e.name) {
          topper.push(e);
        }
      });
      averageAttempt.forEach((a: any) => {
        if (attempt[0].name === a.name) {
          average.push(a);
        }
      });
      loadDataChart(attempt, topper, average);
    }
    setIsSelected(isSelectedList);
  };

  return (
    <div className="error-analysis mx-auto mw-100 pt-0">
      <div className="row">
        <div className="col-lg-2">
          <div className="sidebar">
            <ul>
              <li>
                <a
                  onClick={() => getSubjectFilter("All", 0)}
                  className={`${allSubjects ? "bold" : ""}`}
                >
                  All Units
                </a>
              </li>
              {allUnits.map((sub: any, i: number) => (
                <li key={sub.name + i}>
                  <a
                    onClick={() => getSubjectFilter(sub, i)}
                    className={`${isSelected[i] ? "bold" : ""}`}
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
                    <h5 className="admin-head">Accuracy Comparison</h5>
                    <p className="admin-head2">
                      This graph helps you see how well you answer questions in
                      different units. You can see your accuracy side-by-side
                      with the best student (&ldquo;Best&rdquo;) and the average
                      accuracy of all students. It&apos;s a great way to
                      understand where you&apos;re doing well and where you
                      might want to study more.
                    </p>
                  </div>
                  <div className="chart_area_body">
                    {topicAccuracyPercents[0] && (
                      <div>
                        <Chart
                          series={accuracychartOptions.series}
                          options={accuracychartOptions.options}
                          type="bar"
                          width="100%"
                          height="300"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="chart_boxes">
                  <div className="admin-header">
                    <h5 className="admin-head">Speed Comparison</h5>
                    <p className="admin-head2">
                      Know how fast you answer questions in different units. You
                      can see your speed next to the quickest student
                      (&ldquo;Best&rdquo;) and the average speed of everyone.
                      It&apos;s a fun way to see if you&apos;re a quick thinker
                      or if you take a little more time to consider your
                      answers.
                    </p>
                  </div>
                  <div className="chart_area_body">
                    {topicEsplapseTimes[0] && (
                      <div>
                        <Chart
                          series={speedchartOptions.series}
                          options={speedchartOptions.options}
                          type="bar"
                          width="100%"
                          height="300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttemptComparativeAnalysis;
