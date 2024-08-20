"use client";
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import clientApi from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import Chart from "react-apexcharts";
import moment from "moment-timezone";
import { TimeFormat } from "@/components/TimeFormat";
import { fromNow } from "@/lib/pipe";

const MyOutcomes = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();

  const [subjects, setSubjects]: any = useState([]);
  const [selectedRankSubject, setSelectedRankSubject]: any = useState();
  const [selectedStrengthSubject, setselectedStrengthSubject]: any = useState();
  const [selectedTimeWasteSubject, setselectedTimeWasteSubject]: any = useState();
  const [selectedAccuracySubject, setselectedAccuracySubject]: any = useState();
  const [selectedPracticeSubject, setselectedPracticeSubject]: any = useState();
  const [selRankValue, setSelRankValue] = useState<number>(0);
  const [selStrengthValue, setSelStrengthValue] = useState<number>(0);
  const [selTimeValue, setSelTimeValue] = useState<number>(0);
  const [selAccuracyValue, setSelAccuracyValue] = useState<number>(0);
  const [selPracticeValue, setSelPracticeValue] = useState<number>(0);
  const [ranking, setranking]: any = useState([]);
  const [strength, setstrength]: any = useState(null);
  const [marks, setmarks]: any = useState(null);
  const [timeWaste, settimeWaste]: any = useState(null);
  const [firstQuestions, setfirstQuestions]: any = useState({});
  const [mentalSummary, setmentalSummary]: any = useState({});
  const [practiceEffort, setpracticeEffort]: any = useState({});
  const [firstupdate, setFirstUpdate] = useState<boolean>(false);
  const [markChartOption, setmarkChartOption]: any = useState({
    series: [],
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%"
      }
    },
    xaxis: {
      categories: []
    },
    yaxis: {
      title: { text: "Scores" },
      labels: {
        formatter: function (val: any) {
          return val.toFixed(0);
        }
      }
    },
    fill: {
      opacity: 1
    },
    dataLabels: {
      enabled: false
    }
  });

  const [strengthChart, setstrengthChart]: any = useState({
    series: [],
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%"
      }
    },
    xaxis: {
      categories: []
    },
    yaxis: {
      labels: {
        formatter: function (val: any) {
          return val.toFixed(1) + '%';
        }
      }
    },
    fill: {
      opacity: 1
    },
    dataLabels: {
      enabled: false
    },
    title: {
      text: 'Strength'
    }
  })

  const [weaknessChart, setweaknessChart]: any = useState({
    series: [],
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%"
      }
    },
    xaxis: {
      categories: []
    },
    yaxis: {
      labels: {
        formatter: function (val: any) {
          return val.toFixed(1) + '%';
        }
      }
    },
    fill: {
      opacity: 1
    },
    dataLabels: {
      enabled: false
    },
    title: {
      text: 'Weakness'
    }
  })

  const [timeWastedAnalysis, settimeWastedAnalysis]: any = useState({
    totalTime: 0,
    wastedTime: 0,
    wastedPercentage: 0
  })
  const [timeWasteChart, settimeWasteChart]: any = useState({
    series: [1, 1, 1],
    chart: {
      type: "donut"
    },
    labels: ["Total Question Attempt", "Total Question Exceed Time (mins)", "Incorrect & Avg Time Exceeded"],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
            value: {
              fontSize: '16px',
              fontWeight: 400,
              formatter: (val: any, opts: any) => {
                if (opts.globals.series.indexOf(opts.globals.series[1]) == 1) {
                  if (opts.globals.series[1] == 0) {
                    return '< 1 min'
                  }
                  const hours = Math.floor(opts.globals.series[1] / 60);
                  const min = opts.globals.series[1] % 60;

                  if (hours == 0) {
                    return min + ' mins'
                  }

                  if (min == 0) {
                    return hours + ' hours'
                  }

                  return hours + 'hrs ' + min + 'm'
                } else {
                  return
                }
              }
            }
          }
        }
      }
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: 'left',
      fontSize: '12px',
      itemMargin: {
        horizontal: 0,
        vertical: 0
      },
      formatter: function (seriesName: any, opts: any) {
        const val = Number(opts.w.globals.series[opts.seriesIndex].toFixed(0))
        return ['<div className="apexcharts-legend-custom-text">' + seriesName + '</div>', '<div className="apexcharts-legend-custom-value" style="margin-left: auto;">' + val + '</div>']
      }
    }
  })
  const [avoidTopicsChart, setavoidTopicsChart]: any = useState({
    series: [
      {
        name: "basic",
        data: []
      }
    ],
    chart: {
      type: "bar",
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff']
      },
      formatter: function (val: any, opt: any) {
        return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
      },
      offsetX: 0,
      dropShadow: {
        enabled: true
      }
    },
    xaxis: {
      categories: [],
      title: {
        text: "Accuracy(%)",
      },
    },
    yaxis: {
      labels: {
        show: false
      },
      title: {
        text: "Topics",
      },
    }
  })

  const [practiceTopicsChart, setpracticeTopicsChart]: any = useState({
    series: [
      {
        name: "basic",
        data: []
      }
    ],
    chart: {
      type: "bar",
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: {
      enabled: false
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
    }
  })

  const [progressItems, setprogressItems]: any = useState([]);
  const [firstQuestionDetails, setfirstQuestionDetails]: any = useState({});
  const [mentalSummaryLoaded, setmentalSummaryLoaded]: any = useState(false);
  const [firstQuestionsLoaded, setfirstQuestionsLoaded]: any = useState(false);

  const onRankSubjectChange = async (param: any) => {
    if (!param) {
      return;
    }

    setSelRankValue(param?.eventPhase ? param.eventPhase : 0);

    clientApi.get(`/api/student/subjectwiseRanking/${param.target?.value ? param.target?.value : param._id}`).then(data => {
      let res = data.data;
      if (res.me.score && !res.top.find((t: { _id: any; }) => t._id == res.me._id)) {
        res.top.splice(res.top.length - 1, 1)
        res.top.push(res.me)
      }
      for (let i = 0; i < res.top.length; i++) {
        if (!res.top[i].ranking) {
          res.top[i].ranking = i;
        }
        res.top[i].speed = Math.round(res.top[i].speed / 1000)
      }
      setranking(res.top);
    });
  }

  const onStrengthSubjectChange = (param: any) => {
    if (!param) {
      return;
    }

    setSelStrengthValue(param?.eventPhase ? param.eventPhase : 0);

    clientApi.get(`/api/analysis/strengthAndWeekness/${param.target?.value ? param.target?.value : param._id}`).then(res => {
      const data = res.data;
      setstrength(data)
      data.student.sort((u1: { accuracy: number; }, u2: { accuracy: number; }) => {
        if (u1.accuracy > u2.accuracy) {
          return 1
        } else if (u1.accuracy < u2.accuracy) {
          return -1
        } else {
          return 0
        }
      })

      const strengthSeries: any = {
        You: [],
        Topper: [],
        Average: []
      }

      const weaknessSeries: any = {
        You: [],
        Topper: [],
        Average: []
      }

      const strengthLabels: any = []
      const weaknessLabels = []

      for (const unit of data.student) {
        const avg = data.average.find((u: any) => u._id == unit._id)
        const top = data.top.find((u: any) => u._id == unit._id)
        if (avg.accuracy > unit.accuracy) {
          weaknessLabels.push(unit.unitName)
          weaknessSeries.You.push(unit.accuracy * 100)
          weaknessSeries.Topper.push(top.accuracy * 100)
          weaknessSeries.Average.push(avg.accuracy * 100)
        } else {
          strengthLabels.push(unit.unitName)

          strengthSeries.You.push(unit.accuracy * 100)
          strengthSeries.Topper.push(top.accuracy * 100)
          strengthSeries.Average.push(avg.accuracy * 100)
        }
      }
      setstrengthChart({
        ...strengthChart,
        series: []
      });

      let temp = [];
      for (const seri in strengthSeries) {
        temp.push({
          name: seri,
          data: strengthSeries[seri]
        })
      }
      setstrengthChart({
        ...strengthChart,
        series: temp,
        axis: { categories: strengthLabels }
      });
      setweaknessChart({
        ...strengthChart,
        series: []
      });
      let temp1 = [];
      for (const seri in weaknessSeries) {
        temp1.push({
          name: seri,
          data: weaknessSeries[seri]
        })
      }
      setweaknessChart({
        ...weaknessChart,
        series: temp1,
        xaxis: { categories: weaknessLabels }
      });
    });
  }

  const onTimeWasteSubjectChange = (param: any, option?: string) => {
    setSelTimeValue(param?.eventPhase ? param.eventPhase : 0);
    let id = ''
    if (option) {
      id = param.target.value
      setselectedTimeWasteSubject(param)
    } else {
      id = param?._id
    }
    if (!param) {
      return;
    }



    clientApi.get(`/api/analysis/timeWasted/${id}`).then(res => {
      let data = res.data;
      settimeWaste(data);
      settimeWasteChart({
        ...timeWasteChart,
        series: [
          data.totalQuestion,
          data.questionExceedTime,
          data.questionIncorrectAndExceedTime
        ]
      })
      settimeWastedAnalysis({
        ...timeWastedAnalysis,
        totalTime: Math.floor(data.totalTime / 60) > 0 ?
          Math.floor(data.totalTime / 60) + ' hrs ' + Math.floor(data.totalTime % 60)
          : Math.floor(data.totalTime),
        wastedTime: Math.floor(data.timewasted / 60) > 0 ?
          Math.floor(data.timewasted / 60) + ' hrs ' + Math.floor(data.timewasted % 60) :
          Math.floor(data.timewasted),
        wastedPercentage: data.totalTime ? Math.round(data.timewasted / data.totalTime * 100) : 0
      })

    });
  }

  const onAccuracySubjectChange = async (param: any) => {

    if (!param) {
      return;
    }

    setSelAccuracyValue(param?.eventPhase ? param.eventPhase : 0);

    let query = toQueryString({ subject: param?.target?.value ? param?.target?.value : param._id })
    const res = await clientApi.get(`/api/analysis/getAvoidTopicsOfUser${query}`);
    const d = res.data;
    const series: any[] = []
    const categories: any[] = []
    if (d && d.length > 0) {
      d.forEach((element: { count: any; topicName: any; }) => {
        series.push(element.count);
        categories.push(element.topicName)
      });
    }
    setavoidTopicsChart({
      ...avoidTopicsChart,
      series: [{ name: "basic", data: series }],
      xaxis: { categories: categories, title: { text: 'Accuracy %' } }
    })
  }

  const onPracticeSubjectChange = async (param: any) => {
    if (!param) return;
    let query = toQueryString({ subject: param?.target?.value ? param?.target?.value : param._id, user: '' })
    const res = await clientApi.get(`/api/analysis/getAvoidTopicsOfUser${query}`);
    let d = res.data;
    const days = (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24)
    d.overAllEffort = Math.round(d.overAllEffort / days)
    setpracticeEffort(d)
    setSelPracticeValue(param.eventPhase);

    const res2 = await clientApi.get(`/api/analysis/getTopicsUserExceedAvgTime${query}`);
    let d2 = res2.data;
    const series: any[] = []
    const categories: any[] = []
    if (d2 && d2.length > 0) {
      d2.forEach((element: { count: any; topic: { name: any; }; }) => {
        series.push(element.count);
        categories.push(element.topic.name)
      });
    }
    setpracticeTopicsChart({
      ...practiceTopicsChart,
      series: [{ name: "basic", data: series }],
      xaxis: { categories: categories, title: { text: 'Count' } }
    })
  }

  const getAllFirstQuestionsDetail = async () => {
    const { data } = await clientApi.get(`/api/analysis/getAllFirstQuestionsDetail`);
    setfirstQuestions(data);
    setfirstQuestionsLoaded(true);
  }

  const getAveragePeakTime = async () => {
    let { data } = await clientApi.get(`/api/analysis/getAveragePeakTime`);
    data.avgPeakStart = Math.round(data.avgPeakStart / 60)
    data.avgPeakDuration = Math.round(data.avgPeakDuration / 60)
    setmentalSummary(data);
    setmentalSummaryLoaded(true);
  }

  const getCourseProgress = async () => {
    let data = await clientApi.get(`/api/analysis/courseProgress`);
    let res = data.data;
    if (res.studentCourses) {
      let temp = [];
      for (const c of res.studentCourses) {
        const ca = res.analysis.find((o: { _id: any; }) => o._id == c.course)
        c.top = ca.top
        c.avg = ca.avg
        c.progress = Math.round(c.doContents / c.totalContents * 100)
        c.progressTop = Math.round(c.top / c.totalContents * 100)
        c.progressAvg = Math.round(c.avg / c.totalContents * 100)
        c.isCourse = true
        c.isCompleted = c.progress == 100
        temp.push(c);
      }
      temp.sort((a: any, b: any) => {
        if (a.isCompleted && b.isCompleted || !a.isCompleted && !b.isCompleted) {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }

        return a.isCompleted && !b.isCompleted ? 1 : -1
      })
      setprogressItems(temp);
    }
  }

  const getAllProgress = async () => {
    let data1 = await clientApi.get(`/api/analysis/testseriesProgress`);
    let testseries = data1.data;
    let temp = [];
    for (const c of testseries) {
      c.isCourse = false;
      c.progress = Math.round(c.doContents / c.totalContents * 100)
      c.progressTop = Math.round(c.top / c.totalContents * 100)
      c.progressAvg = Math.round(c.avg / c.totalContents * 100)
      c.isCompleted = c.progress == 100
      temp.push(c);
      // this.progressItems.push(c)
    }
    let data2 = await clientApi.get(`/api/analysis/courseProgress`);
    let res = data2.data;
    if (res.studentCourses) {
      for (const c of res.studentCourses) {
        const ca = res.analysis.find((o: { _id: any; }) => o._id == c.course)
        c.top = ca.top
        c.avg = ca.avg
        c.progress = Math.round(c.doContents / c.totalContents * 100)
        c.progressTop = Math.round(c.top / c.totalContents * 100)
        c.progressAvg = Math.round(c.avg / c.totalContents * 100)
        c.isCourse = true
        c.isCompleted = c.progress == 100
        temp.push(c);
      }
      temp.sort((a: any, b: any) => {
        if (a.isCompleted && b.isCompleted || !a.isCompleted && !b.isCompleted) {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }

        return a.isCompleted && !b.isCompleted ? 1 : -1
      })
    }
    setprogressItems(temp);
  }

  const getTestseriesProgress = async () => {
    let data = await clientApi.get(`/api/analysis/testseriesProgress`);
    let testseries = data.data;
    let temp = [];
    for (const c of testseries) {
      c.isCourse = false;
      c.progress = Math.round(c.doContents / c.totalContents * 100)
      c.progressTop = Math.round(c.top / c.totalContents * 100)
      c.progressAvg = Math.round(c.avg / c.totalContents * 100)
      c.isCompleted = c.progress == 100
      temp.push(c);
      // this.progressItems.push(c)
    }
    temp.sort((a: any, b: any) => {
      if (a.isCompleted && b.isCompleted || !a.isCompleted && !b.isCompleted) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }

      return a.isCompleted && !b.isCompleted ? 1 : -1
    })
    setprogressItems(temp);
  }

  const getMarkRanking = async () => {
    let data = await clientApi.get(`/api/student/markRanking`);
    let res = data.data;

    setmarks(data);
    const series: any = {
      You: [],
      Topper: [],
      Average: []
    }
    const labels = []
    for (const subject of res.subjects) {
      labels.push(subject.subject)
      const studentData = res.student.find((s: { _id: any; }) => s._id == subject._id)
      if (studentData) {
        series.You.push(studentData.score)
      } else {
        series.You.push(0)
      }
      series.Topper.push(subject.top)
      series.Average.push(subject.avg)
    }

    setmarkChartOption({
      ...markChartOption,
      series: []
    });

    const temp = [];
    for (const seri in series) {
      temp.push({
        name: seri,
        data: series[seri]
      })
    }
    setmarkChartOption({
      ...markChartOption,
      series: temp,
      xaxis: { categories: labels }
    });
  }

  useEffect(() => {
    if (!firstupdate) {
      clientApi.get(`/api/subjects/mine`).then(res => {
        setSubjects(res.data);
        if (res.data.length) {
          setSelectedRankSubject(res.data[selRankValue])
          setselectedAccuracySubject(res.data[selAccuracyValue])
          setselectedTimeWasteSubject(res.data[selTimeValue])
          setselectedStrengthSubject(res.data[selStrengthValue])
          setselectedPracticeSubject(res.data[selPracticeValue])
          onRankSubjectChange(res.data[selRankValue]);
          onStrengthSubjectChange(res.data[selAccuracyValue]);
          onTimeWasteSubjectChange(res.data[selTimeValue]);
          onAccuracySubjectChange(res.data[selStrengthValue]);
          onPracticeSubjectChange(res.data[selPracticeValue]);
        }
        getAllFirstQuestionsDetail();
        getAveragePeakTime();
        getMarkRanking();
        getAllProgress();
        // getCourseProgress();
        // getTestseriesProgress();
      });
      setFirstUpdate(true)
    }

  }, [user]);
  return (
    <main className="p-0">
      <div className="container">
        <div className="mx-auto">
          <div className="container5 bg-white">
            <div className="overall-analytics">
              <section className="details details_top_area_common">
                <div className="container">
                  <div className="asses-info">
                    <div className="title-wrap clearfix">
                      <div className="title">
                        <h3 className="main_title over-head1 text-white pl-0">My Outcomes</h3>
                      </div>
                    </div>

                    <span className="bottom_title text-white">A reasonable effort results in a good outcomes. Measure your outcome as you measure your effort.</span>
                  </div>
                </div>
              </section>
            </div>
            <div className="overall-main">
              <div className="row">
                <div className="col-lg-5">
                  <div className="chart_boxes admin-box3 overflow-auto">
                    <div className="admin-header">
                      <h1 className="admin-head">Overall Rank</h1>
                      <p className="admin-head2">Check out where you stand! This table displays your rank, score, and answering speed. Use the dropdown to view rankings for specific subjects and see how you compare. Keep pushing to climb higher! </p>
                    </div>
                    <div className="chart_area_body filter-via-select">
                      <div className="filter-area clearfix">
                        <div className="filter-item">
                          <select className="form-control  mb-0" name="subject" defaultValue={selectedRankSubject?._id} required onChange={onRankSubjectChange}>
                            <option value="null" disabled={true}>Select</option>
                            {
                              subjects.map((subject: any, index: any) => {
                                return <option value={subject._id} key={subject._id}>
                                  {subject.name}
                                </option>
                              })
                            }
                          </select>
                        </div>
                      </div>
                      {
                        ranking && ranking.length > 0 &&
                        <div className="table-responsive">
                          <table className="table vertical-middle border-top-none border-bottom_yes">
                            <thead>
                              <tr style={{ cursor: "default" }}>
                                <th className="pt-0"></th>
                                <th className="pt-0"></th>
                                <th className="pt-0">Score</th>
                                <th className="pt-0 text-center" data-toggle="tooltip" data-placement="top" title="Time spent per question">Speed </th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                ranking.map((r: any, i: any) => {
                                  return <tr style={{ cursor: "default" }} className={r._id == user._id ? 'over-active' : ''} key={i}>
                                    <td>
                                      <h6>{r.ranking + 1}</h6>
                                    </td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <figure>
                                          <div className="avatar" style={{ backgroundImage: r.avatar.fileUrl ? 'url(' + r.avatar?.fileUrl + ')' : 'url("/assets/images/defaultProfile.png")' }}>
                                          </div>
                                        </figure>
                                        <div className="admin-info2-dir ml-2 student-item">
                                          <h6 className="text-truncate">{r.studentName}</h6>
                                          <p className="text-truncate"></p>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <h6>{r.score}</h6>
                                    </td>
                                    <td>
                                      <h6 className="text-center" data-toggle="tooltip" data-placement="top" title="Time spent per question">{r.speed}</h6>
                                    </td>
                                  </tr>
                                })
                              }
                            </tbody>
                          </table>
                        </div>
                      }
                    </div>
                    {
                      !ranking || (ranking && ranking.length == 0) &&
                      <div className="chart_area_body text-center">
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M66.6682 89.6623H61.8348C55.239 89.4239 48.6646 90.5436 42.5196 92.9519C36.3746 95.3603 30.7901 99.0058 26.1126 103.662L24.7793 105.218V151.218H47.446V125.107L50.5015 121.662L51.8904 120.051C59.1233 112.621 68.1281 107.153 78.0571 104.162C73.0859 100.38 69.1653 95.3881 66.6682 89.6623Z"
                            fill="#D4D4EA" />
                          <path
                            d="M174.111 103.505C169.433 98.8485 163.849 95.203 157.704 92.7947C151.559 90.3864 144.984 89.2667 138.388 89.5051C136.365 89.5108 134.344 89.6221 132.333 89.8384C129.789 95.2101 125.975 99.8817 121.222 103.45C131.822 106.382 141.424 112.143 148.999 120.116L150.388 121.672L153.388 125.116V151.283H175.277V105.061L174.111 103.505Z"
                            fill="#D4D4EA" />
                          <path
                            d="M61.6682 78.8365H63.3905C62.5903 71.9656 63.7959 65.01 66.8617 58.8092C69.9276 52.6084 74.7227 47.4276 80.6682 43.892C78.513 40.5995 75.5397 37.9232 72.0394 36.1251C68.5391 34.327 64.6318 33.4687 60.7001 33.6344C56.7684 33.8001 52.9472 34.984 49.6106 37.0702C46.2739 39.1565 43.5363 42.0735 41.6658 45.5356C39.7952 48.9978 38.8559 52.8864 38.9397 56.8207C39.0236 60.7549 40.1277 64.6 42.1441 67.9793C44.1605 71.3586 47.0199 74.1563 50.4424 76.0985C53.8649 78.0407 57.7331 79.0607 61.6682 79.0587V78.8365Z"
                            fill="#D4D4EA" />
                          <path
                            d="M135.721 74.6615C135.788 75.9383 135.788 77.2179 135.721 78.4948C136.787 78.6638 137.864 78.7566 138.943 78.7726H139.999C143.916 78.5637 147.713 77.3438 151.02 75.2319C154.326 73.1199 157.03 70.1878 158.867 66.721C160.704 63.2542 161.612 59.3707 161.502 55.4489C161.393 51.527 160.27 47.7002 158.242 44.3412C156.215 40.9822 153.352 38.2054 149.933 36.2811C146.514 34.3567 142.655 33.3506 138.732 33.3604C134.808 33.3703 130.954 34.3959 127.545 36.3374C124.135 38.2789 121.287 41.0701 119.276 44.4392C124.305 47.7222 128.439 52.202 131.309 57.4768C134.179 62.7516 135.695 68.6564 135.721 74.6615Z"
                            fill="#D4D4EA" />
                          <path
                            d="M99.2728 99.5592C112.988 99.5592 124.106 88.441 124.106 74.7259C124.106 61.0108 112.988 49.8926 99.2728 49.8926C85.5577 49.8926 74.4395 61.0108 74.4395 74.7259C74.4395 88.441 85.5577 99.5592 99.2728 99.5592Z"
                            fill="#D4D4EA" />
                          <path
                            d="M100.612 112.783C93.3562 112.49 86.1167 113.668 79.3284 116.246C72.5402 118.824 66.3436 122.748 61.1115 127.783L59.7227 129.339V164.505C59.7443 165.651 59.9915 166.781 60.45 167.831C60.9084 168.881 61.5693 169.83 62.3947 170.625C63.2202 171.419 64.1941 172.043 65.2608 172.461C66.3275 172.879 67.4661 173.083 68.6115 173.061H132.445C133.59 173.083 134.729 172.879 135.796 172.461C136.862 172.043 137.836 171.419 138.662 170.625C139.487 169.83 140.148 168.881 140.606 167.831C141.065 166.781 141.312 165.651 141.334 164.505V129.45L140 127.783C134.802 122.733 128.627 118.797 121.854 116.218C115.081 113.639 107.852 112.47 100.612 112.783Z"
                            fill="#D4D4EA" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    }
                  </div>
                </div>
                <div className="col-lg-7">
                  <div className="chart_boxes admin-box3 overflow-auto">
                    <div className="admin-header">
                      <h1 className="admin-head"> Course/Test Series Progress</h1>
                      <p className="admin-head2">Track how you&apos;re doing! This graph compares your progress in test series and courses with top performers and the average. Where do you stand? Keep learning and improving!</p>
                    </div>
                    {
                      progressItems && progressItems.length > 0 &&
                      <div className="">
                        {
                          progressItems.map((item: any, index: any) => {
                            return <div className="over-out" key={item._id}>
                              <div className="row">
                                <div className="col-lg-6">
                                  <div className="d-flex align-items-center">
                                    <span className="material-icons">
                                      assignments
                                    </span>
                                    <div className="over-out-mat">{item.isCourse ? 'Course' : 'Test Series'}
                                    </div>
                                  </div>
                                  <h1 className="title_heading text-truncate">{item.title}</h1>
                                  <p className="mb-3 mt-3">Last Activity
                                    <TimeFormat date={item.updatedAt} />
                                  </p>
                                </div>
                                <div className="col-lg-6">
                                  <div className="row">
                                    <div className="col-4 text-center">
                                      <h1 className="circle-head">You</h1>
                                      <div className="out-circle">
                                        <div className={item.progress > 50 ? `over50 progress-circle p${item.progress}` : `progress-circle p${item.progress}`}>
                                          <span>{item.progress}%</span>
                                          <div className="left-half-clipper">
                                            <div className="first50-bar" style={item.progress > 60 ? { background: '#008ffb' } : (item.progress > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                            </div>
                                            <div className="value-bar" style={item.progress > 60 ? { borderColor: '#008ffb' } : (item.progress > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                            </div>
                                            {/* <div className="value-bar" [style.border-color]="item.progress > 60 ? '#008ffb' : (item.progress > 30 ? '#008ffb' : '#008ffb')">
                                                                    </div> */}
                                          </div>
                                        </div>
                                      </div>
                                      <p className="over-out1">{item.doContents}/{item.totalContents}</p>
                                    </div>
                                    <div className="col-4 text-center">
                                      <h1 className="circle-head">Best</h1>
                                      <div className="out-circle1">
                                        <div className={item.progressTop > 50 ? `over50 progress-circle p${item.progressTop}` : `progress-circle p${item.progressTop}`}>
                                          <span>{item.progressTop}%</span>
                                          <div className="left-half-clipper">
                                            <div className="first50-bar" style={item.progressTop > 60 ? { background: '#00e396' } : (item.progressTop > 30 ? { background: '#00e396' } : { background: '#00e396' })}>
                                            </div>
                                            <div className="value-bar" style={item.progressTop > 30 ? { borderColor: '#00e396' } : (item.progressTop > 30 ? { borderColor: '#00e396' } : { borderColor: '#00e396' })}>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <p className="over-out2">{item.top}/{item.totalContents}</p>
                                    </div>
                                    <div className="col-4 text-center">
                                      <h1 className="circle-head">Avg</h1>
                                      <div className="out-circle2">
                                        <div className={item.progressAvg > 50 ? `over50 progress-circle p${item.progressAvg}` : `progress-circle p${item.progressAvg}`}>
                                          <span>{item.progressAvg}%</span>
                                          <div className="left-half-clipper">
                                            <div className="first50-bar" style={item.progressAvg > 60 ? { background: '#feb019' } : (item.progressAvg > 30 ? { background: '#feb019' } : { background: '#feb019' })}>
                                            </div>
                                            <div className="value-bar" style={item.progressAvg > 60 ? { borderColor: '#feb019' } : (item.progressAvg > 30 ? { borderColor: '#feb019' } : { borderColor: '#feb019' })}>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <p className="over-out2">{Math.round(item.avg)}/{item.totalContents}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          })
                        }
                      </div>
                    }
                    {
                      !progressItems || (progressItems && progressItems.length == 0) &&
                      <div className="text-center pt-5">
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M150 187.5H50C46.6858 187.497 43.5083 186.179 41.1648 183.835C38.8213 181.492 37.5033 178.314 37.5 175V25C37.5033 21.6858 38.8213 18.5083 41.1648 16.1648C43.5083 13.8213 46.6858 12.5033 50 12.5H150C153.314 12.5033 156.492 13.8213 158.835 16.1648C161.179 18.5083 162.497 21.6858 162.5 25V128.863L131.25 113.238L100 128.863V25H50V175H150V150H162.5V175C162.495 178.314 161.176 181.49 158.833 183.833C156.49 186.176 153.314 187.495 150 187.5ZM131.25 99.2625L150 108.637V25H112.5V108.637L131.25 99.2625Z"
                            fill="#D4D4EA" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-5">
                  <div className="chart_boxes overflow-auto">
                    <div className="admin-header">
                      <h1 className="admin-head"> Mental Activity Summary</h1>
                      <p className="admin-head2">Find the average time your brain takes to solve the first question correctly.</p>
                    </div>
                    {
                      mentalSummaryLoaded &&
                      <div className="">
                        <div className="over-out">
                          <div className="row">
                            <div className="col-6 text-center">
                              <div className="out-circle">
                                <div className={mentalSummary.avgPeakStart > 50 ? `over50 p-circle progress-circle p${mentalSummary.avgPeakStart}` : `p-circle progress-circle p${mentalSummary.avgPeakStart}`}>
                                  <span>{(mentalSummary.avgPeakStart)} <br />mins</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={mentalSummary.avgPeakStart > 60 ? { background: '#008ffb' } : (mentalSummary.avgPeakStart > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={mentalSummary.avgPeakStart > 60 ? { borderColor: '#008ffb' } : (mentalSummary.avgPeakStart > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">Average Time to reach peak</h1>
                              </div>
                            </div>
                            <div className="col-6 text-center">
                              <div className="out-circle">
                                <div className={mentalSummary.avgPeakDuration > 50 ? `over50 p-circle progress-circle p${mentalSummary.avgPeakDuration}` : `p-circle progress-circle p${mentalSummary.avgPeakStart}`}>
                                  <span>{mentalSummary.avgPeakDuration} %</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={mentalSummary.avgPeakDuration > 60 ? { background: '#008ffb' } : (mentalSummary.avgPeakDuration > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={mentalSummary.avgPeakDuration > 60 ? { borderColor: '#008ffb' } : (mentalSummary.avgPeakDuration > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">Strength Topic</h1>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    {
                      !mentalSummaryLoaded &&
                      <div className="text-center pt-5">
                        <svg width="100" height="100" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M150 187.5H50C46.6858 187.497 43.5083 186.179 41.1648 183.835C38.8213 181.492 37.5033 178.314 37.5 175V25C37.5033 21.6858 38.8213 18.5083 41.1648 16.1648C43.5083 13.8213 46.6858 12.5033 50 12.5H150C153.314 12.5033 156.492 13.8213 158.835 16.1648C161.179 18.5083 162.497 21.6858 162.5 25V128.863L131.25 113.238L100 128.863V25H50V175H150V150H162.5V175C162.495 178.314 161.176 181.49 158.833 183.833C156.49 186.176 153.314 187.495 150 187.5ZM131.25 99.2625L150 108.637V25H112.5V108.637L131.25 99.2625Z"
                            fill="#D4D4EA" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    }
                  </div>
                </div>
                <div className="col-lg-7">
                  <div className="chart_boxes overflow-auto">
                    <div className="admin-header">
                      <h1 className="admin-head"> First Question Matters</h1>
                      <p className="admin-head2">Picking the right question when you start the assessment is very important. Rather than fighting to solve a question, you may flag and skip to the question you are more comfortable with. Did you pick your first question from the area of your strength? How much time you took to solve and did you solve accurately?</p>
                    </div>
                    {
                      firstQuestionsLoaded &&
                      <div className="">
                        <div className="over-out">
                          <div className="row">
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div className={firstQuestions.areaOfStrength > 50 ? `over50 progress-circle p${firstQuestions.areaOfStrength}` : `p-circle progress-circle p${firstQuestions.areaOfStrength}`}>
                                  <span>{firstQuestions.areaOfStrength} %</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={firstQuestions.areaOfStrength > 60 ? { background: '#008ffb' } : (firstQuestions.areaOfStrength > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={firstQuestions.areaOfStrength > 60 ? { borderColor: '#008ffb' } : (firstQuestions.areaOfStrength > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">Strength Topic</h1>
                              </div>
                            </div>
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div className={firstQuestions.avgTimeToPickUp > 50 ? `p-circle over50 progress-circle p${firstQuestions.avgTimeToPickUp}` : `p-circle progress-circle p${firstQuestions.avgTimeToPickUp}`}>
                                  <span>{Math.round(firstQuestions.avgTimeToPickUp)} <br />sec</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={firstQuestions.avgTimeToPickUp > 60 ? { background: '#008ffb' } : (firstQuestions.avgTimeToPickUp > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={firstQuestions.avgTimeToPickUp > 60 ? { borderColor: '#008ffb' } : (firstQuestions.avgTimeToPickUp > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">Average Time </h1>
                              </div>
                            </div>
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div className={firstQuestions.correctAnswer > 50 ? `p-circle over50 progress-circle p${firstQuestions.correctAnswer}` : `p-circle progress-circle p${firstQuestions.correctAnswer}`}>
                                  <span>{firstQuestions.correctAnswer} %</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={firstQuestions.correctAnswer > 60 ? { background: '#008ffb' } : (firstQuestions.correctAnswer > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={firstQuestions.correctAnswer > 60 ? { borderColor: '#008ffb' } : (firstQuestions.correctAnswer > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">Correct Answer </h1>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    {
                      !firstQuestionsLoaded &&
                      <div className="text-center pt-5">
                        <svg width="100" height="100" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M150 187.5H50C46.6858 187.497 43.5083 186.179 41.1648 183.835C38.8213 181.492 37.5033 178.314 37.5 175V25C37.5033 21.6858 38.8213 18.5083 41.1648 16.1648C43.5083 13.8213 46.6858 12.5033 50 12.5H150C153.314 12.5033 156.492 13.8213 158.835 16.1648C161.179 18.5083 162.497 21.6858 162.5 25V128.863L131.25 113.238L100 128.863V25H50V175H150V150H162.5V175C162.495 178.314 161.176 181.49 158.833 183.833C156.49 186.176 153.314 187.495 150 187.5ZM131.25 99.2625L150 108.637V25H112.5V108.637L131.25 99.2625Z"
                            fill="#D4D4EA" />
                        </svg>
                        <h2 className="text-muted">No data yet</h2>
                        <p className="text-muted">Spend sometime to see your progress</p>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div className="over-out-1">
                <div className="chart_boxes admin-box2">
                  <div className="admin-header">
                    <h1 className="admin-head">Accuracy Level</h1>
                    <p className="admin-head2">Know your weakness not only in terms of accuracy but also speed</p>
                  </div>
                  <div className="chart_area_body filter-via-select">
                    <div className="filter-area clearfix">

                      <div className="filter-item">
                        <select className="form-control" name="subject" defaultValue={selectedAccuracySubject} required onChange={onAccuracySubjectChange}>
                          <option value={''} disabled>Select</option>
                          {
                            subjects.map((subject: any, index: any) => {
                              return <option value={subject._id} key={subject._id}>
                                {subject.name}
                              </option>
                            })
                          }
                        </select>
                      </div>

                      {
                        avoidTopicsChart.series[0].data.length ?
                          <div className="">
                            <Chart
                              options={avoidTopicsChart}
                              series={avoidTopicsChart.series}
                              height={350}
                              type="bar"
                            />
                          </div> : <></>
                      }
                      {
                        !avoidTopicsChart.series[0].data.length &&
                        <div className="text-center">
                          <svg width="211" height="210" viewBox="0 0 211 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M31.6594 104.81C31.6594 95.0645 33.5789 85.4142 37.3084 76.4103C41.038 67.4065 46.5044 59.2254 53.3956 52.3341L74.6149 73.5533C70.5102 77.658 67.2541 82.531 65.0327 87.8941C62.8112 93.2571 61.6679 99.0052 61.6679 104.81L31.6594 104.81Z"
                              fill="#DBDBE8" />
                            <path
                              d="M31.6594 104.81C31.6594 121.98 37.6126 138.618 48.5048 151.89C59.3969 165.162 74.5541 174.247 91.3936 177.596C108.233 180.946 125.713 178.353 140.855 170.26C155.997 162.166 167.864 149.072 174.435 133.21C181.005 117.348 181.872 99.6976 176.888 83.2675C171.904 66.8374 161.378 52.6437 147.102 43.1049C132.826 33.5661 115.684 29.2723 98.5976 30.9552C81.5109 32.6381 65.5363 40.1935 53.3956 52.3341L74.9787 73.9172C82.126 66.7699 91.5303 62.322 101.589 61.3313C111.648 60.3406 121.74 62.8683 130.144 68.4839C138.548 74.0994 144.746 82.4553 147.68 92.1278C150.614 101.8 150.103 112.191 146.235 121.529C142.367 130.868 135.381 138.576 126.467 143.341C117.552 148.105 107.262 149.632 97.3483 147.66C87.4348 145.688 78.5117 140.34 72.0994 132.526C65.6871 124.713 62.1824 114.918 62.1824 104.81L31.6594 104.81Z"
                              fill="#D4D4EA" />
                            <path
                              d="M52.7724 156.929C45.9479 149.972 40.5606 141.738 36.9181 132.699C33.2756 123.66 31.4492 113.991 31.5432 104.246L62.0624 104.54C62.0071 110.278 63.0824 115.97 65.2269 121.292C67.3713 126.613 70.5431 131.461 74.5609 135.557L52.7724 156.929Z"
                              fill="#DEDEE7" />
                            <path
                              d="M105.625 178.956C95.8791 178.982 86.2237 177.088 77.21 173.383C68.1963 169.677 60.0007 164.232 53.0911 157.359L74.8124 135.522C78.8543 139.543 83.6484 142.728 88.9212 144.896C94.1939 147.063 99.842 148.171 105.543 148.156L105.625 178.956Z"
                              fill="#E1E1E6" />
                            <path
                              d="M157.882 158.062C150.907 164.869 142.66 170.236 133.612 173.855C124.563 177.475 114.89 179.277 105.145 179.158L105.518 148.537C111.242 148.607 116.923 147.549 122.238 145.423C127.553 143.297 132.397 140.145 136.494 136.146L157.882 158.062Z"
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

              <div className="over-out-1">
                <div className="chart_boxes admin-box2">
                  <div className="admin-header">
                    <h1 className="admin-head">Strength & Weakness</h1>
                    <p className="admin-head2">Know your leading and lagging indicators</p>
                  </div>
                  <div className="chart_area_body filter-via-select">
                    <div className="filter-area clearfix">

                      <div className="filter-item">
                        <select className="form-control" name="subject" defaultValue={selectedStrengthSubject} required onChange={onStrengthSubjectChange}>
                          <option value={''} disabled>Select</option>
                          {
                            subjects.map((subject: any, index: any) => {
                              return <option value={subject._id} key={subject._id}>
                                {subject.name}
                              </option>
                            })
                          }
                        </select>
                      </div>

                      <div className="row">
                        {
                          strength && strength.student && strength.student.length > 0 &&
                          <div className="col-md-6">
                            <Chart
                              options={strengthChart}
                              series={strengthChart.series}
                              height={350}
                              type="bar"
                            />
                          </div>
                        }
                        {
                          !strength || (strength && strength.student && strength.student.length == 0) &&
                          <div className="col-md-6 text-center">
                            <svg width="211" height="210" viewBox="0 0 211 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M31.6594 104.81C31.6594 95.0645 33.5789 85.4142 37.3084 76.4103C41.038 67.4065 46.5044 59.2254 53.3956 52.3341L74.6149 73.5533C70.5102 77.658 67.2541 82.531 65.0327 87.8941C62.8112 93.2571 61.6679 99.0052 61.6679 104.81L31.6594 104.81Z"
                                fill="#DBDBE8" />
                              <path
                                d="M31.6594 104.81C31.6594 121.98 37.6126 138.618 48.5048 151.89C59.3969 165.162 74.5541 174.247 91.3936 177.596C108.233 180.946 125.713 178.353 140.855 170.26C155.997 162.166 167.864 149.072 174.435 133.21C181.005 117.348 181.872 99.6976 176.888 83.2675C171.904 66.8374 161.378 52.6437 147.102 43.1049C132.826 33.5661 115.684 29.2723 98.5976 30.9552C81.5109 32.6381 65.5363 40.1935 53.3956 52.3341L74.9787 73.9172C82.126 66.7699 91.5303 62.322 101.589 61.3313C111.648 60.3406 121.74 62.8683 130.144 68.4839C138.548 74.0994 144.746 82.4553 147.68 92.1278C150.614 101.8 150.103 112.191 146.235 121.529C142.367 130.868 135.381 138.576 126.467 143.341C117.552 148.105 107.262 149.632 97.3483 147.66C87.4348 145.688 78.5117 140.34 72.0994 132.526C65.6871 124.713 62.1824 114.918 62.1824 104.81L31.6594 104.81Z"
                                fill="#D4D4EA" />
                              <path
                                d="M52.7724 156.929C45.9479 149.972 40.5606 141.738 36.9181 132.699C33.2756 123.66 31.4492 113.991 31.5432 104.246L62.0624 104.54C62.0071 110.278 63.0824 115.97 65.2269 121.292C67.3713 126.613 70.5431 131.461 74.5609 135.557L52.7724 156.929Z"
                                fill="#DEDEE7" />
                              <path
                                d="M105.625 178.956C95.8791 178.982 86.2237 177.088 77.21 173.383C68.1963 169.677 60.0007 164.232 53.0911 157.359L74.8124 135.522C78.8543 139.543 83.6484 142.728 88.9212 144.896C94.1939 147.063 99.842 148.171 105.543 148.156L105.625 178.956Z"
                                fill="#E1E1E6" />
                              <path
                                d="M157.882 158.062C150.907 164.869 142.66 170.236 133.612 173.855C124.563 177.475 114.89 179.277 105.145 179.158L105.518 148.537C111.242 148.607 116.923 147.549 122.238 145.423C127.553 143.297 132.397 140.145 136.494 136.146L157.882 158.062Z"
                                fill="#D8D8E9" />
                            </svg>
                            <h2 className="text-muted">No data yet</h2>
                            <p className="text-muted">Spend sometime to see your progress</p>
                          </div>
                        }
                        {
                          strength && strength.student && strength.student.length > 0 &&
                          <div className="col-md-6">
                            <Chart
                              options={weaknessChart}
                              series={weaknessChart.series}
                              height={350}
                              type="bar"
                            />
                          </div>
                        }
                        {
                          !strength || (strength && strength.student && strength.student.length == 0) &&
                          <div className="col-md-6 text-center">
                            <svg width="211" height="210" viewBox="0 0 211 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M31.6594 104.81C31.6594 95.0645 33.5789 85.4142 37.3084 76.4103C41.038 67.4065 46.5044 59.2254 53.3956 52.3341L74.6149 73.5533C70.5102 77.658 67.2541 82.531 65.0327 87.8941C62.8112 93.2571 61.6679 99.0052 61.6679 104.81L31.6594 104.81Z"
                                fill="#DBDBE8" />
                              <path
                                d="M31.6594 104.81C31.6594 121.98 37.6126 138.618 48.5048 151.89C59.3969 165.162 74.5541 174.247 91.3936 177.596C108.233 180.946 125.713 178.353 140.855 170.26C155.997 162.166 167.864 149.072 174.435 133.21C181.005 117.348 181.872 99.6976 176.888 83.2675C171.904 66.8374 161.378 52.6437 147.102 43.1049C132.826 33.5661 115.684 29.2723 98.5976 30.9552C81.5109 32.6381 65.5363 40.1935 53.3956 52.3341L74.9787 73.9172C82.126 66.7699 91.5303 62.322 101.589 61.3313C111.648 60.3406 121.74 62.8683 130.144 68.4839C138.548 74.0994 144.746 82.4553 147.68 92.1278C150.614 101.8 150.103 112.191 146.235 121.529C142.367 130.868 135.381 138.576 126.467 143.341C117.552 148.105 107.262 149.632 97.3483 147.66C87.4348 145.688 78.5117 140.34 72.0994 132.526C65.6871 124.713 62.1824 114.918 62.1824 104.81L31.6594 104.81Z"
                                fill="#D4D4EA" />
                              <path
                                d="M52.7724 156.929C45.9479 149.972 40.5606 141.738 36.9181 132.699C33.2756 123.66 31.4492 113.991 31.5432 104.246L62.0624 104.54C62.0071 110.278 63.0824 115.97 65.2269 121.292C67.3713 126.613 70.5431 131.461 74.5609 135.557L52.7724 156.929Z"
                                fill="#DEDEE7" />
                              <path
                                d="M105.625 178.956C95.8791 178.982 86.2237 177.088 77.21 173.383C68.1963 169.677 60.0007 164.232 53.0911 157.359L74.8124 135.522C78.8543 139.543 83.6484 142.728 88.9212 144.896C94.1939 147.063 99.842 148.171 105.543 148.156L105.625 178.956Z"
                                fill="#E1E1E6" />
                              <path
                                d="M157.882 158.062C150.907 164.869 142.66 170.236 133.612 173.855C124.563 177.475 114.89 179.277 105.145 179.158L105.518 148.537C111.242 148.607 116.923 147.549 122.238 145.423C127.553 143.297 132.397 140.145 136.494 136.146L157.882 158.062Z"
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

              <div className="over-out-2">
                <div className="row">
                  <div className="col-lg-7">
                    <div className="chart_boxes admin-box4 h-lg-100">
                      <div className="admin-header">
                        <h1 className="admin-head">Scores</h1>
                        <p className="admin-head2">Graphical Representation of your Scores</p>
                      </div>
                      {
                        marks &&
                        <div className="chart_area_body">
                          <div>
                            <Chart
                              options={markChartOption}
                              series={markChartOption.series}
                              type="bar"
                              height={350}
                            />
                          </div>
                        </div>
                      }
                      {
                        !marks || (marks && marks.student && marks.student.length == 0) &&
                        <div className="chart_area_body text-center">
                          <svg width="242" height="216" viewBox="0 0 242 216" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M93.0312 52.1057L93.0312 208.939C93.0312 210.745 94.6696 212.207 96.6927 212.207L133.3 212.207C135.323 212.207 136.962 210.745 136.962 208.939L136.962 52.1057C136.962 50.3 135.323 48.8376 133.3 48.8376L96.6903 48.8376C94.6696 48.8376 93.0312 50.3 93.0312 52.1057Z"
                              fill="#D4D4EA" />
                            <path
                              d="M37.0394 116.999L36.9111 116.999L36.9111 208.939C36.9111 210.745 38.5495 212.207 40.5726 212.207L77.1799 212.207C79.203 212.207 80.8414 210.745 80.8414 208.939L80.8414 116.999L80.7131 116.999C80.5124 116.298 80.0567 115.678 79.4175 115.234C78.7784 114.79 77.9921 114.548 77.1823 114.547L40.5702 114.547C38.8665 114.547 37.4484 115.59 37.0394 116.999Z"
                              fill="#D4D4EA" />
                            <path
                              d="M148.856 96.215L148.856 208.939C148.856 210.745 150.495 212.207 152.518 212.207L189.125 212.207C191.148 212.207 192.787 210.745 192.787 208.939L192.787 96.215C192.787 94.4093 191.148 92.947 189.125 92.947L152.518 92.947C150.495 92.947 148.856 94.4093 148.856 96.215Z"
                              fill="#D4D4EA" />
                          </svg>
                          <h2 className="text-muted">No data yet</h2>
                          <p className="text-muted">Spend sometime to see your progress</p>
                        </div>
                      }
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="chart_boxes admin-box4 h-lg-100">
                      <div className="admin-header">
                        <h1 className="admin-head"> Time Waste Analysis</h1>
                        <p className="admin-head2">To Know about your unitwise strength and weakness</p>
                      </div>
                      {
                        timeWaste &&
                        <div className="chart_area_body custom-legend filter-via-select">

                          <div className="filter-area clearfix">
                            <div className="filter-item">
                              <select className="form-control" name="subject" value={selectedTimeWasteSubject} required onChange={(e) => onTimeWasteSubjectChange(e, 'option')}>
                                <option value={''} disabled>Select</option>
                                {
                                  subjects.map((subject: any, index: any) => {
                                    return <option value={subject._id} key={index}>
                                      {subject.name}
                                    </option>
                                  })
                                }
                              </select>
                            </div>
                            {
                              !!timeWastedAnalysis?.totalTime &&
                              <div className="text-center mx-auto my-4">
                                <div className="out-circle">
                                  <div className={timeWastedAnalysis.wastedPercentage > 50 ? `over50 progress-circle p${timeWastedAnalysis.wastedPercentage}` : `progress-circle p${timeWastedAnalysis.wastedPercentage}`}>
                                    <span>{timeWastedAnalysis.wastedPercentage} %</span>
                                    <div className="left-half-clipper">
                                      <div className="first50-bar" style={timeWastedAnalysis.wastedPercentage > 60 ? { background: '#008ffb' } : (timeWastedAnalysis.wastedPercentage > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                      </div>
                                      <div className="value-bar" style={timeWastedAnalysis.wastedPercentage > 60 ? { borderColor: '#008ffb' } : (timeWastedAnalysis.wastedPercentage > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="circle-head">Total Time Wasted out of {timeWastedAnalysis.totalTime} mins</p>
                                </div>
                              </div>
                            }
                            {
                              !!timeWaste?.totalQuestion &&
                              <div className="legends-left">
                                <Chart
                                  options={timeWasteChart}
                                  series={timeWasteChart.series}
                                  type="donut"
                                />
                              </div>
                            }
                          </div>
                        </div>
                      }
                      {
                        !timeWaste || timeWaste.totalQuestion == 0 &&
                        <div className="chart_area_body text-center">
                          <svg width="211" height="210" viewBox="0 0 211 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M31.6598 104.81C31.6598 95.0645 33.5794 85.4142 37.3089 76.4103C41.0384 67.4065 46.5049 59.2254 53.3961 52.3341L74.6153 73.5533C70.5106 77.658 67.2546 82.531 65.0332 87.8941C62.8117 93.2571 61.6684 99.0052 61.6684 104.81L31.6598 104.81Z"
                              fill="#DBDBE8" />
                            <path
                              d="M31.6598 104.81C31.6598 121.98 37.6131 138.618 48.5053 151.89C59.3974 165.162 74.5545 174.247 91.3941 177.596C108.234 180.946 125.714 178.353 140.856 170.26C155.998 162.166 167.865 149.072 174.435 133.21C181.006 117.348 181.873 99.6976 176.889 83.2675C171.905 66.8374 161.378 52.6437 147.102 43.1049C132.826 33.5661 115.685 29.2723 98.5981 30.9552C81.5113 32.6381 65.5367 40.1935 53.3961 52.3341L74.9792 73.9172C82.1264 66.7699 91.5308 62.322 101.59 61.3313C111.649 60.3406 121.74 62.8683 130.145 68.4839C138.549 74.0994 144.746 82.4553 147.68 92.1278C150.614 101.8 150.104 112.191 146.236 121.529C142.368 130.868 135.381 138.576 126.467 143.341C117.553 148.105 107.262 149.632 97.3488 147.66C87.4353 145.688 78.5122 140.34 72.0999 132.526C65.6876 124.713 62.1829 114.918 62.1829 104.81L31.6598 104.81Z"
                              fill="#D4D4EA" />
                            <path
                              d="M52.7724 156.929C45.9479 149.972 40.5606 141.738 36.9181 132.699C33.2756 123.66 31.4492 113.991 31.5432 104.246L62.0624 104.54C62.0071 110.278 63.0824 115.97 65.2269 121.292C67.3713 126.613 70.5431 131.461 74.5609 135.557L52.7724 156.929Z"
                              fill="#DEDEE7" />
                            <path
                              d="M105.625 178.956C95.8796 178.982 86.2242 177.088 77.2105 173.383C68.1968 169.677 60.0012 164.232 53.0916 157.359L74.8129 135.522C78.8548 139.543 83.6489 142.728 88.9217 144.896C94.1944 147.063 99.8425 148.171 105.543 148.156L105.625 178.956Z"
                              fill="#E1E1E6" />
                            <path
                              d="M157.882 158.062C150.907 164.869 142.66 170.236 133.612 173.855C124.563 177.475 114.89 179.277 105.145 179.158L105.518 148.537C111.242 148.607 116.923 147.549 122.238 145.423C127.553 143.297 132.397 140.145 136.494 136.146L157.882 158.062Z"
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
              <div className="over-out-1 mt-2">
                <div className="chart_boxes admin-box2">
                  <div className="admin-header">
                    <h1 className="admin-head"> Measure Your Practice</h1>
                    <p className="admin-head2">Learn by Practice – It sticks in your mind and get your concepts clear</p>
                  </div>
                  <div className="chart_area_body filter-via-select">
                    <div className="filter-area clearfix">
                      <div className="filter-item">
                        <select className="form-control" name="subject" defaultValue={selectedPracticeSubject} required onChange={onPracticeSubjectChange}>
                          <option value={''} disabled>Select</option>
                          {
                            subjects.map((subject: any, index: any) => {
                              return <option value={subject._id} key={subject._id}>
                                {subject.name}
                              </option>
                            })
                          }
                        </select>
                      </div>
                      <div className="mx-auto">
                        {
                          practiceEffort &&
                          <div className="row mx-auto">
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div className={practiceEffort.todayEffort > 50 ? `p-circle over50 progress-circle p${practiceEffort.todayEffort}` : `p-circle progress-circle p${practiceEffort.todayEffort}`}>
                                  <span>{practiceEffort?.todayEffort ? practiceEffort?.todayEffort : 0} <br /> ques</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={practiceEffort.todayEffort > 60 ? { background: '#008ffb' } : (practiceEffort.todayEffort > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={practiceEffort.todayEffort > 60 ? { borderColor: '#008ffb' } : (practiceEffort.todayEffort > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">Today</h1>
                              </div>
                            </div>
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div className={practiceEffort.monthEffort > 50 ? `p-circle over50 progress-circle p${practiceEffort.monthEffort}` : `p-circle progress-circle p${practiceEffort.monthEffort}`}>
                                  <span>{practiceEffort?.monthEffort ? practiceEffort.monthEffort : 0} <br /> ques</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={practiceEffort.monthEffort > 60 ? { background: '#008ffb' } : (practiceEffort.monthEffort > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={practiceEffort.monthEffort > 60 ? { borderColor: '#008ffb' } : (practiceEffort.monthEffort > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">This Month </h1>
                              </div>
                            </div>
                            <div className="col-4 text-center">
                              <div className="out-circle">
                                <div className={practiceEffort.overAllEffort > 50 ? `p-circle over50 progress-circle p${practiceEffort.overAllEffort}` : `p-circle progress-circle p${practiceEffort.overAllEffort}`}>
                                  <span>{practiceEffort?.overAllEffort ? practiceEffort.overAllEffort : 0} <br /> ques</span>
                                  <div className="left-half-clipper">
                                    <div className="first50-bar" style={practiceEffort.overAllEffort > 60 ? { background: '#008ffb' } : (practiceEffort.overAllEffort > 30 ? { background: '#008ffb' } : { background: '#008ffb' })}>
                                    </div>
                                    <div className="value-bar" style={practiceEffort.overAllEffort > 60 ? { borderColor: '#008ffb' } : (practiceEffort.overAllEffort > 30 ? { borderColor: '#008ffb' } : { borderColor: '#008ffb' })}>
                                    </div>
                                  </div>
                                </div>
                                <h1 className="circle-head">Avg/Day</h1>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      <div>
                        {
                          practiceTopicsChart.series[0].data.length ?
                            <div>
                              <Chart
                                options={practiceTopicsChart}
                                series={practiceTopicsChart.series}
                                height={350}
                                type="bar"
                              />
                            </div> : <></>
                        }
                        {
                          !practiceTopicsChart.series[0].data.length &&
                          <div className="text-center">
                            <svg width="211" height="210" viewBox="0 0 211 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M31.6594 104.81C31.6594 95.0645 33.5789 85.4142 37.3084 76.4103C41.038 67.4065 46.5044 59.2254 53.3956 52.3341L74.6149 73.5533C70.5102 77.658 67.2541 82.531 65.0327 87.8941C62.8112 93.2571 61.6679 99.0052 61.6679 104.81L31.6594 104.81Z"
                                fill="#DBDBE8" />
                              <path
                                d="M31.6594 104.81C31.6594 121.98 37.6126 138.618 48.5048 151.89C59.3969 165.162 74.5541 174.247 91.3936 177.596C108.233 180.946 125.713 178.353 140.855 170.26C155.997 162.166 167.864 149.072 174.435 133.21C181.005 117.348 181.872 99.6976 176.888 83.2675C171.904 66.8374 161.378 52.6437 147.102 43.1049C132.826 33.5661 115.684 29.2723 98.5976 30.9552C81.5109 32.6381 65.5363 40.1935 53.3956 52.3341L74.9787 73.9172C82.126 66.7699 91.5303 62.322 101.589 61.3313C111.648 60.3406 121.74 62.8683 130.144 68.4839C138.548 74.0994 144.746 82.4553 147.68 92.1278C150.614 101.8 150.103 112.191 146.235 121.529C142.367 130.868 135.381 138.576 126.467 143.341C117.552 148.105 107.262 149.632 97.3483 147.66C87.4348 145.688 78.5117 140.34 72.0994 132.526C65.6871 124.713 62.1824 114.918 62.1824 104.81L31.6594 104.81Z"
                                fill="#D4D4EA" />
                              <path
                                d="M52.7724 156.929C45.9479 149.972 40.5606 141.738 36.9181 132.699C33.2756 123.66 31.4492 113.991 31.5432 104.246L62.0624 104.54C62.0071 110.278 63.0824 115.97 65.2269 121.292C67.3713 126.613 70.5431 131.461 74.5609 135.557L52.7724 156.929Z"
                                fill="#DEDEE7" />
                              <path
                                d="M105.625 178.956C95.8791 178.982 86.2237 177.088 77.21 173.383C68.1963 169.677 60.0007 164.232 53.0911 157.359L74.8124 135.522C78.8543 139.543 83.6484 142.728 88.9212 144.896C94.1939 147.063 99.842 148.171 105.543 148.156L105.625 178.956Z"
                                fill="#E1E1E6" />
                              <path
                                d="M157.882 158.062C150.907 164.869 142.66 170.236 133.612 173.855C124.563 177.475 114.89 179.277 105.145 179.158L105.518 148.537C111.242 148.607 116.923 147.549 122.238 145.423C127.553 143.297 132.397 140.145 136.494 136.146L157.882 158.062Z"
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
            </div>
          </div>
        </div>
      </div>
    </main >
  );
};
export default MyOutcomes;
