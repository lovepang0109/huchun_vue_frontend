"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { militoHour, date, fromNow, avatar } from "@/lib/pipe";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { questionStatus } from "@/lib/common";
import { useSession } from "next-auth/react";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

const CourseAnalytics = () => {
  const { id: courseId } = useParams();
  const { user } = useSession().data || {};
  const [course, setCourse] = useState<any>();
  const [sections, setSections] = useState<any>();
  const [completion, setCompletion] = useState<any>();
  const [accuracy, setAccuracy] = useState<any>();
  const [learningTime, setLearningTime] = useState<any>();
  const [practiceTime, setPracticeTime] = useState<any>();
  const [ranking, setRanking] = useState<any>();

  const donutChartResponsive = [
    {
      breakpoint: 1200,
      options: {
        chart: {
          width: 300,
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
          width: 286,
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
          width: 440,
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
          width: 400,
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
  const [learningChartOptions, setLearningChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 500,
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
        height: 150,
        position: "bottom",
        horizontalAlign: "left",
        formatter: (seriesName: any, opts: any) => {
          const val = Math.round(
            opts.w.globals.series[opts.seriesIndex] / 60000
          );
          return [
            '<div class="apexcharts-legend-custom-text">' +
            seriesName +
            "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
            (val > 1 ? val + " mins " : "< 1 min") +
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
                fontSize: "14px",
                fontWeight: 400,
                formatter: (val: any, opts: any) => {
                  const total = opts.globals.series.reduce(
                    (p: any, c: any) => p + c,
                    0
                  );
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
                    }, 0) / 60000
                  );

                  if (total < 1) {
                    return "< 1 mins";
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
      responsive: donutChartResponsive,
    },
  });
  const [practiceChartOptions, setPracticeChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 500,
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
        height: 150,
        position: "bottom",
        horizontalAlign: "left",
        formatter: (seriesName: any, opts: any) => {
          const val = Math.round(
            opts.w.globals.series[opts.seriesIndex] / 60000
          );
          return [
            '<div class="apexcharts-legend-custom-text">' +
            seriesName +
            "</div>",
            '<div class="apexcharts-legend-custom-value text-right">' +
            (val > 1 ? val + " mins " : "< 1 min") +
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
                formatter: (val: any, opts: any) => {
                  const total = opts.globals.series.reduce(
                    (p: any, c: any) => p + c,
                    0
                  );
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
                    }, 0) / 60000
                  );
                  if (total == 0) {
                    return "< 1 mins";
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
      responsive: donutChartResponsive,
    },
  });
  const [
    questionDistributionChartOptions,
    setQuestionDistributionChartOptions,
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

  useEffect(() => {
    const onUserCourseLoaded = (data: any) => {
      const { course, userCourse } = data;
      setCourse(course);
      let sectionCompletion: any = [];
      let learning: any = [];
      let practice: any = [];
      for (const section of userCourse.sections) {
        const completedContents: any[] = userCourse.contents
          .filter((c: any) => c.section == section._id && c.completed)
          .sort((c1: any, c2: any) => c1.end - c2.end);
        const totalContents = course.sections.find(
          (s: any) => s._id == section._id
        ).contents.length;
        const effort = completedContents.reduce(
          (acc, current: any) => acc + current.timeSpent,
          0
        );

        sectionCompletion.push({
          title: section.title,
          completedContents: completedContents.length,
          totalContents: totalContents,
          completion: Math.round(
            (completedContents.length / totalContents) * 100
          ),
          mark: section.analytics.mark,
          maxMark: section.analytics.maxMark,
          accuracy: section.analytics.maxMark
            ? Math.round(
              (section.analytics.mark / section.analytics.maxMark) * 100
            )
            : 0,
          effort: Math.round(effort / 60000),
          lastTime: completedContents.length ? completedContents[0].end : null,
        });

        // get learning and practice effort
        learning.push({
          title: section.title,
          effort: userCourse.contents
            .filter(
              (c: any) =>
                c.section == section._id &&
                ["video", "ebook", "note", "onlineSession"].indexOf(c.type) > -1
            )
            .reduce((time: any, c: any) => time + c.timeSpent, 0),
        });
        practice.push({
          title: section.title,
          effort: userCourse.contents
            .filter(
              (c: any) =>
                c.section == section._id &&
                ["quiz", "assessment"].indexOf(c.type) > -1
            )
            .reduce((time: any, c: any) => time + c.timeSpent, 0),
        });
      }
      setSections(sectionCompletion);
      setLearningChartOptions((prev: any) => ({
        series: learning.map((l: any) => l.effort),
        options: { ...prev.options, labels: learning.map((l: any) => l.title) },
      }));
      setPracticeChartOptions((prev: any) => ({
        series: practice.map((p: any) => p.effort),
        options: { ...prev.options, labels: practice.map((p: any) => p.title) },
      }));
    };

    const getContentAnlytics = async () => {
      const { data } = await clientApi.get(
        `/api/course/analytics/content/${courseId}`
      );
      onUserCourseLoaded(data);
    };

    const getCompletionAnalytics = async () => {
      const { data } = await clientApi.get(
        `/api/course/analytics/completion/${courseId}${toQueryString({
          lastDays: 15,
        })}`
      );
      setCompletion(
        data.totalContents
          ? {
            pStudent: Math.round((data.student / data.totalContents) * 100),
            studentImprove: data.lastDaysData.student >= 0,
            pStudentDiff: Math.round(
              (Math.abs(data.lastDaysData.student) / data.totalContents) * 100
            ),
            pTop: Math.round((data.top / data.totalContents) * 100),
            topImprove: data.lastDaysData.top >= 0,
            pTopDiff: Math.round(
              (Math.abs(data.lastDaysData.top) / data.totalContents) * 100
            ),
            pAvg: Math.round((data.average / data.totalContents) * 100),
            avgImprove: data.lastDaysData.average >= 0,
            pAvgDiff: Math.round(
              (Math.abs(data.lastDaysData.average) / data.totalContents) * 100
            ),
          }
          : {
            pStudent: 0,
            pStudentDiff: 0,
            pTop: 0,
            pTopDiff: 0,
            pAvg: 0,
            pAvgDiff: 0,
          }
      );
    };

    const getAccuracyAnalytics = async () => {
      const { data } = await clientApi.get(
        `/api/course/analytics/accuracy/${courseId}${toQueryString({
          lastDays: 15,
        })}`
      );
      setAccuracy({
        pStudent: Math.round(data.student * 100),
        studentImprove: data.lastDaysData.student >= 0,
        pStudentDiff: Math.round(Math.abs(data.lastDaysData.student) * 100),

        pTop: Math.round(data.top * 100),
        topImprove: data.lastDaysData.top >= 0,
        pTopDiff: Math.round(Math.abs(data.lastDaysData.top) * 100),

        pAvg: Math.round(data.average * 100),
        avgImprove: data.lastDaysData.average >= 0,
        pAvgDiff: Math.round(Math.abs(data.lastDaysData.average) * 100),
      });
    };

    const getLearningTimeAnalytics = async () => {
      const { data } = await clientApi.get(
        `/api/course/analytics/learningTime/${courseId}${toQueryString({
          lastDays: 15,
        })}`
      );
      setLearningTime({
        hStudent: data.student,
        studentImprove: data.lastDaysData.student >= 0,
        hStudentDiff: Math.abs(data.lastDaysData.student),

        hTop: data.top,
        topImprove: data.lastDaysData.top >= 0,
        hTopDiff: Math.abs(data.lastDaysData.top),

        hAvg: data.average,
        avgImprove: data.lastDaysData.average >= 0,
        hAvgDiff: Math.abs(data.lastDaysData.average),
      });
    };

    const getPracticeTimeAnalytics = async () => {
      const { data } = await clientApi.get(
        `/api/course/analytics/practiceTime/${courseId}${toQueryString({
          lastDays: 15,
        })}`
      );
      setPracticeTime({
        hStudent: data.student,
        studentImprove: data.lastDaysData.student >= 0,
        hStudentDiff: Math.abs(data.lastDaysData.student),

        hTop: data.top,
        topImprove: data.lastDaysData.top >= 0,
        hTopDiff: Math.abs(data.lastDaysData.top),

        hAvg: data.average,
        avgImprove: data.lastDaysData.average >= 0,
        hAvgDiff: Math.abs(data.lastDaysData.average),
      });
    };

    const getRanking = async () => {
      try {
        let { data } = await clientApi.get(
          `/api/course/analytics/ranking/${courseId}`
        );
        if (
          data.student.score &&
          !data.top.find((t: any) => t._id == data.student._id)
        ) {
          data.top.splice(data.top.length - 1, 1);
          data.top.push(data.student);
        }
        for (let i = 0; i < data.top.length; i++) {
          if (!data.top[i].ranking) {
            data.top[i].ranking = i;
          }
          data.top[i].speed = Math.round(data.top[i].speed / 1000);
        }
        setRanking(data.top);
        // calculate height of chart
        setTimeout(() => {
          const chartParent = document.getElementById(
            "questionDistributionChartParent"
          );
          if (chartParent) {
            let height = chartParent.clientHeight;
            height = height > 350 ? height : 350;
            height = height > 800 ? 800 : height;
            setQuestionDistributionChartOptions((prev: any) => ({
              ...prev,
              options: {
                ...prev.options,
                chart: { ...prev.options.chart, height },
              },
            }));
          }
        }, 1000);
      } catch (error) {
        console.error(error);
        setRanking([]);
      }
    };

    const getQuestionDistribution = async () => {
      const { data } = await clientApi.get(
        `/api/course/analytics/questionDistribution/${courseId}`
      );
      let correct: any = {};
      let wrong: any = {};
      let missed: any = {};
      let partial: any = {};
      let pending: any = {};
      let categories: any = [];

      for (const cat of data) {
        categories.push(cat._id);

        correct[cat._id] = 0;
        wrong[cat._id] = 0;
        missed[cat._id] = 0;
        partial[cat._id] = 0;
        pending[cat._id] = 0;

        for (const s of cat.distribution) {
          if (s.status == questionStatus.CORRECT) {
            correct[cat._id] = s.count;
          } else if (s.status == questionStatus.INCORRECT) {
            wrong[cat._id] = s.count;
          } else if (s.status == questionStatus.MISSED) {
            missed[cat._id] = s.count;
          } else if (s.status == questionStatus.PARTIAL) {
            partial[cat._id] = s.count;
          } else if (s.status == questionStatus.PENDING) {
            pending[cat._id] = s.count;
          }
        }
      }
      setQuestionDistributionChartOptions((prev: any) => ({
        series: [
          {
            name: "Correct",
            data: Object.values(correct),
          },
          {
            name: "Wrong",
            data: Object.values(wrong),
          },
          {
            name: "Missed",
            data: Object.values(missed),
          },
          {
            name: "Pending",
            data: Object.values(pending),
          },
          {
            name: "Partial",
            data: Object.values(partial),
          },
        ],
        options: { ...prev.options, xaxis: { categories: categories } },
      }));
    };
    getContentAnlytics();
    getCompletionAnalytics();
    getAccuracyAnalytics();
    getLearningTimeAnalytics();
    getPracticeTimeAnalytics();
    getRanking();
    getQuestionDistribution();
  }, []);

  return (
    <main className="p-0">
      <div className="container">
        <div className="row">
          <div className="col-xl-12 mx-auto">
            <div className="container5 bg-white">
              <div className="overall-analytics">
                <section className="details details_top_area_common">
                  <div className="container">
                    <div className="asses-info">
                      <div className="title-wrap clearfix">
                        <div className="title">
                          <h3 className="main_title over-head1 text-white pl-0">
                            {course?.subject?.name
                              ? course.subject.name
                              : " Course Analytics"}
                          </h3>
                        </div>
                      </div>
                      <span className="bottom_title text-white">
                        Analytics Overview
                      </span>
                    </div>
                  </div>
                </section>
              </div>
              <div className="overall-main">
                <div className="row">
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box data_ana_box">
                      <div className="overall-head text-center">
                        Course Completion
                      </div>
                      {completion ? (
                        <div className="form-row mx-0 my-2">
                          <div className="col-4">
                            <p className="over1">You</p>
                            <div className="mid_contents">
                              <h4
                                className={`${completion.pStudent > completion.pAvg
                                  ? "over2"
                                  : "over2-inactive"
                                  }`}
                              >
                                {completion.pStudent}%
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${completion.studentImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {completion.studentImprove > 0 ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {" "}
                                  {completion.pStudentDiff}%
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Average</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {completion.pAvg}%
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${completion.avgImprove ? "over3" : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {completion.avgImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {completion.pAvgDiff}%
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Best</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {completion.pTop}%
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${completion.topImprove ? "over3" : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {completion.topImprove > 0 ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {completion.pTopDiff}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <SkeletonLoaderComponent Cheight="82" Cwidth="100" />
                      )}
                      <p className="over-0 text-left">
                        *Course completion in last 15 days
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box data_ana_box">
                      <div className="overall-head text-center">Accuracy</div>
                      {accuracy ? (
                        <div className="form-row mx-0 my-2">
                          <div className="col-4">
                            <p className="over1">You</p>
                            <div className="mid_contents">
                              <h4
                                className={`${accuracy.pStudent > accuracy.pAvg
                                  ? "over2"
                                  : "over2-inactive"
                                  }`}
                              >
                                {accuracy.pStudent}%
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${accuracy.studentImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {accuracy.studentImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {accuracy.pStudentDiff}%
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Average</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {accuracy.pAvg}%
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${accuracy.avgImprove ? "over3" : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {accuracy.avgImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {accuracy.pAvgDiff}%
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Best</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {accuracy.pTop}%
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${accuracy.topImprove ? "over3" : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {accuracy.topImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {accuracy.pTopDiff}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <SkeletonLoaderComponent Cheight="82" Cwidth="100" />
                      )}
                      <p className="over-0 text-left">
                        *Accuracy in last 15 days
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box data_ana_box">
                      <div className="overall-head text-center">
                        Learning Hour(s)
                      </div>
                      {learningTime ? (
                        <div className="form-row mx-0 my-2">
                          <div className="col-4">
                            <p className="over1">You</p>
                            <div className="mid_contents">
                              <h4
                                className={`${learningTime.hStudent > learningTime.hAvg
                                  ? "over2"
                                  : "over2-inactive"
                                  }`}
                              >
                                {militoHour(learningTime.hStudent, true)}
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${learningTime.studentImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {learningTime.studentImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {militoHour(learningTime.hStudentDiff, true)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Average</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {militoHour(learningTime.hAvg, true)}
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${learningTime.avgImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {learningTime.avgImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {militoHour(learningTime.hAvgDiff, true)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Best</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {militoHour(learningTime.hTop, true)}
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${learningTime.topImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {learningTime.topImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {militoHour(learningTime.hTopDiff, true)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <SkeletonLoaderComponent Cheight="82" Cwidth="100" />
                      )}
                      <p className="over-0 text-left">
                        *Hours spent in last 15 days
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="admin-box data_ana_box">
                      <div className="overall-head text-center">
                        Practice Hour(s)
                      </div>
                      {practiceTime ? (
                        <div className="form-row mx-0 my-2">
                          <div className="col-4">
                            <p className="over1">You</p>
                            <div className="mid_contents">
                              <h4
                                className={`${practiceTime.hStudent > practiceTime.hAvg
                                  ? "over2"
                                  : "over2-inactive"
                                  }`}
                              >
                                {militoHour(practiceTime.hStudent, true)}
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${practiceTime.studentImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {practiceTime.studentImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {militoHour(practiceTime.hStudentDiff, true)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Average</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {militoHour(practiceTime.hAvg, true)}
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${practiceTime.avgImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {practiceTime.avgImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {militoHour(practiceTime.hAvgDiff, true)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <p className="over1">Best</p>
                            <div className="mid_contents">
                              <h4 className="over2-inactive">
                                {militoHour(practiceTime.hTop, true)}
                              </h4>
                              <div
                                className={`d-flex align-items-center justify-content-center ${practiceTime.topImprove
                                  ? "over3"
                                  : "over3-down"
                                  }`}
                              >
                                <span className="material-icons">
                                  {practiceTime.topImprove ? (
                                    <FontAwesomeIcon
                                      icon={faCaretUp}
                                      color="#066516"
                                      size="2xs"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faCaretDown}
                                      color="#e56666"
                                      size="2xs"
                                    />
                                  )}
                                </span>
                                <div className="persist-arrow ml-1">
                                  {militoHour(practiceTime.hTopDiff, true)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <SkeletonLoaderComponent Cheight="82" Cwidth="100" />
                      )}
                      <p className="over-0 text-left">
                        *Hours spent in last 15 days
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-5">
                    <div className="chart_boxes admin-box3-remove">
                      <div className="admin-header">
                        <h4 className="admin-head">Overall Rank</h4>
                        <p className="admin-head2">
                          To know about your subjectwise rank{" "}
                        </p>
                      </div>
                      {ranking ? (
                        <div className="chart_area_body h-lg-550 overflow-auto">
                          {ranking.length ? (
                            <div className="table-responsive">
                              <table className="table vertical-middle border-top-none border-bottom_yes">
                                <tr style={{ cursor: "default" }}>
                                  <th></th>
                                  <th></th>
                                  <th>Score</th>
                                  <th
                                    className="text-center"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="Time spent per question"
                                  >
                                    Speed
                                  </th>
                                </tr>
                                {ranking.map((r: any, i: number) => (
                                  <tr key={r._id}
                                    style={{ cursor: "default" }}
                                    className={`${r._id == user?.info._id
                                      ? "over-active"
                                      : ""
                                      }`}
                                  >
                                    <td>
                                      <h1>{r.ranking + 1}</h1>
                                    </td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <figure>
                                          <div
                                            className="avatar"
                                            style={{
                                              backgroundImage: `url(${avatar(
                                                r
                                              )})`,
                                            }}
                                          ></div>
                                        </figure>
                                        <div className="admin-info2-dir ml-2 student-item">
                                          <h1 className="text-truncate">
                                            {r.studentName}
                                          </h1>
                                          <p
                                            className={`text-truncate ${r._id == user?.info._id
                                              ? "text-white"
                                              : ""
                                              }`}
                                          >
                                            {r.userId}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <h1>{r.score}</h1>
                                    </td>
                                    <td>
                                      <h1
                                        className="text-center"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="Time spent per question"
                                      >
                                        {r.speed}
                                      </h1>
                                    </td>
                                  </tr>
                                ))}
                              </table>
                            </div>
                          ) : (
                            <div className="text-center">
                              <svg
                                width="74"
                                height="74"
                                viewBox="0 0 74 74"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M24.6678 33.1747H22.8795C20.4391 33.0865 18.0065 33.5008 15.7329 34.3919C13.4592 35.283 11.3929 36.6318 9.66228 38.3547L9.16895 38.9303V55.9503H17.5556V46.2892L18.6862 45.0147L19.2001 44.4186C21.8762 41.6693 25.208 39.6462 28.8817 38.5397C27.0424 37.1402 25.5918 35.2933 24.6678 33.1747Z"
                                  fill="#D4D4EA"
                                />
                                <path
                                  d="M64.4214 38.2961C62.6908 36.5732 60.6245 35.2244 58.3508 34.3333C56.0772 33.4422 53.6447 33.0279 51.2042 33.1161C50.4557 33.1182 49.7078 33.1594 48.9636 33.2395C48.0224 35.227 46.6114 36.9555 44.8525 38.2756C48.7745 39.3606 52.3273 41.4923 55.1303 44.4422L55.6442 45.0178L56.7542 46.2922V55.9739H64.8531V38.8717L64.4214 38.2961Z"
                                  fill="#D4D4EA"
                                />
                                <path
                                  d="M22.8167 29.1697H23.454C23.1579 26.6275 23.6039 24.0539 24.7383 21.7596C25.8727 19.4653 27.6469 17.5484 29.8467 16.2403C29.0493 15.0221 27.9492 14.0318 26.6541 13.3665C25.3589 12.7012 23.9132 12.3837 22.4585 12.445C21.0038 12.5063 19.5899 12.9443 18.3554 13.7162C17.1208 14.4881 16.1079 15.5674 15.4158 16.8484C14.7237 18.1294 14.3762 19.5682 14.4072 21.0239C14.4382 22.4795 14.8467 23.9022 15.5928 25.1526C16.3389 26.4029 17.3968 27.4381 18.6632 28.1567C19.9295 28.8753 21.3607 29.2527 22.8167 29.2519V29.1697Z"
                                  fill="#D4D4EA"
                                />
                                <path
                                  d="M50.2153 27.6242C50.2403 28.0966 50.2403 28.5701 50.2153 29.0425C50.6098 29.105 51.0082 29.1394 51.4075 29.1453H51.7981C53.2477 29.068 54.6526 28.6167 55.876 27.8352C57.0994 27.0538 58.0996 25.9689 58.7793 24.6862C59.4589 23.4035 59.7949 21.9666 59.7544 20.5155C59.7139 19.0644 59.2984 17.6485 58.5482 16.4057C57.7981 15.1629 56.7389 14.1354 55.4739 13.4234C54.2088 12.7114 52.7809 12.3391 51.3293 12.3428C49.8776 12.3465 48.4516 12.7259 47.1902 13.4443C45.9287 14.1626 44.8747 15.1954 44.1309 16.442C45.9913 17.6567 47.5211 19.3142 48.5831 21.2659C49.645 23.2175 50.2059 25.4023 50.2153 27.6242Z"
                                  fill="#D4D4EA"
                                />
                                <path
                                  d="M36.7313 36.8357C41.8059 36.8357 45.9196 32.7219 45.9196 27.6473C45.9196 22.5727 41.8059 18.459 36.7313 18.459C31.6567 18.459 27.543 22.5727 27.543 27.6473C27.543 32.7219 31.6567 36.8357 36.7313 36.8357Z"
                                  fill="#D4D4EA"
                                />
                                <path
                                  d="M37.2265 41.7303C34.5421 41.622 31.8634 42.0578 29.3518 43.0116C26.8401 43.9654 24.5474 45.4174 22.6115 47.2803L22.0977 47.8559V60.8676C22.1057 61.2914 22.1971 61.7095 22.3668 62.098C22.5364 62.4864 22.7809 62.8377 23.0863 63.1317C23.3917 63.4256 23.7521 63.6565 24.1468 63.8112C24.5414 63.9659 24.9627 64.0413 25.3865 64.0331H49.0049C49.4287 64.0413 49.85 63.9659 50.2447 63.8112C50.6393 63.6565 50.9997 63.4256 51.3051 63.1317C51.6105 62.8377 51.855 62.4864 52.0247 62.098C52.1943 61.7095 52.2858 61.2914 52.2938 60.8676V47.897L51.8004 47.2803C49.8771 45.4117 47.5924 43.9555 45.0863 43.0012C42.5802 42.0468 39.9057 41.6144 37.2265 41.7303Z"
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
                      ) : (
                        <div className="admin-box-info">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                          <hr />
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                          <hr />
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                          <hr />
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                          <hr />
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                          <hr />
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                          <hr />
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                          <hr />
                          <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-7">
                    <div className="chart_boxes admin-box3-remove">
                      <div className="admin-header">
                        <h1 className="admin-head">
                          Question Category Distribution
                        </h1>
                        <p className="admin-head2">
                          To know about unit type distribution in various
                          subjects.
                        </p>
                      </div>
                      {questionDistributionChartOptions.series.length > 0 && (
                        <div
                          className="chart_area_body h-lg-550 overflow-auto"
                          id="questionDistributionChartParent"
                        >
                          <Chart
                            {...questionDistributionChartOptions}
                            type="bar"
                            width="100%"
                          />
                        </div>
                      )}
                      {(!questionDistributionChartOptions ||
                        questionDistributionChartOptions.series.length ==
                        0) && (
                          <div className="chart_area_body h-100 text-center">
                            <svg
                              width="160"
                              height="144"
                              viewBox="0 0 160 144"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M65.5762 19.7228L65.5762 124.278C65.5762 125.482 66.6594 126.457 67.997 126.457L92.2001 126.457C93.5377 126.457 94.6209 125.482 94.6209 124.278L94.6209 19.7228C94.6209 18.519 93.5377 17.5441 92.2001 17.5441L67.9954 17.5441C66.6594 17.5441 65.5762 18.519 65.5762 19.7228Z"
                                fill="#D4D4EA"
                              />
                              <path
                                d="M28.5584 62.9847L28.4736 62.9847L28.4736 124.278C28.4736 125.482 29.5568 126.457 30.8944 126.457L55.0976 126.457C56.4352 126.457 57.5184 125.482 57.5184 124.278L57.5184 62.9847L57.4336 62.9847C57.3009 62.5179 56.9996 62.104 56.577 61.8081C56.1545 61.5123 55.6346 61.3512 55.0992 61.3503L30.8928 61.3503C29.7664 61.3503 28.8288 62.0458 28.5584 62.9847Z"
                                fill="#D4D4EA"
                              />
                              <path
                                d="M102.484 49.129L102.484 124.278C102.484 125.482 103.568 126.457 104.905 126.457L129.108 126.457C130.446 126.457 131.529 125.482 131.529 124.278L131.529 49.129C131.529 47.9252 130.446 46.9503 129.108 46.9503L104.905 46.9503C103.568 46.9503 102.484 47.9252 102.484 49.129Z"
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
                </div>
                <br />
                <div className="row mb-3">
                  <div className="col-lg-5">
                    <div className="chart_boxes new-chart_boxes admin-box4">
                      <div className="admin-header">
                        <h1 className="admin-head">Content Completion</h1>
                        <p className="admin-head2">
                          Description for content completion - To know about the
                          status of course completion
                        </p>
                      </div>
                      {sections && sections.length > 0 && (
                        <div className="chart_area_body content-completion h-lg-550 overflow-auto">
                          {sections ? (
                            <div>
                              {sections.map((section: any, i: number) => (
                                <div className="over-out" key={"section" + i}>
                                  <h1 className="mb-2">{section.title}</h1>
                                  <table className="table vertical-middle table-border-none text-center mb-0">
                                    <tr>
                                      <th className="p-1">
                                        <h1>Completion</h1>
                                      </th>
                                      <th className="p-1">
                                        <h1>Marks</h1>
                                      </th>
                                      <th className="p-1">
                                        <h1>Efforts</h1>
                                      </th>
                                    </tr>
                                    <tr>
                                      <td className="p-1">
                                        <div className="out-circle1">
                                          <div
                                            className={`progress-circle p${section.completion
                                              } ${section.completion > 50
                                                ? "over50"
                                                : ""
                                              }`}
                                          >
                                            <span>{section.completion}%</span>
                                            <div className="left-half-clipper">
                                              <div
                                                className="first50-bar"
                                                style={{
                                                  background:
                                                    section.completion > 60
                                                      ? "#66E57B"
                                                      : section.completion > 30
                                                        ? "#E5AB66"
                                                        : "#E5E066",
                                                }}
                                              ></div>
                                              <div
                                                className="value-bar"
                                                style={{
                                                  borderColor:
                                                    section.completion > 60
                                                      ? "#66E57B"
                                                      : section.completion > 30
                                                        ? "#E5AB66"
                                                        : "#E5E066",
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="over-out1">
                                          {section.completedContents}/
                                          {section.totalContents}
                                        </p>
                                      </td>
                                      <td className="p-1">
                                        <div className="out-circle1">
                                          <div
                                            className={`progress-circle p${section.accuracy
                                              } ${section.accuracy > 50
                                                ? "over50"
                                                : ""
                                              }`}
                                          >
                                            <span>{section.accuracy}%</span>
                                            <div className="left-half-clipper">
                                              <div
                                                className="first50-bar"
                                                style={{
                                                  background:
                                                    section.accuracy > 60
                                                      ? "#66E57B"
                                                      : section.accuracy > 30
                                                        ? "#E5AB66"
                                                        : "#E5E066",
                                                }}
                                              ></div>
                                              <div
                                                className="value-bar"
                                                style={{
                                                  borderColor:
                                                    section.accuracy > 60
                                                      ? "#66E57B"
                                                      : section.accuracy > 30
                                                        ? "#E5AB66"
                                                        : "#E5E066",
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="over-out2">
                                          {section.mark ? section.mark : 0}/
                                          {section.maxMark
                                            ? section.maxMark
                                            : 0}
                                        </p>
                                      </td>
                                      <td className="p-1">
                                        <p className="over-out-effort">
                                          {section.effort
                                            ? section.effort
                                            : " < 1 "}{" "}
                                          mins
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                  {section.lastTime && (
                                    <p className="mt-3">
                                      {" "}
                                      Last Activity
                                      {date(section.lastTime, "dd/MM/yy")}
                                      {fromNow(section.lastTime)}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <SkeletonLoaderComponent
                                Cwidth="100"
                                Cheight="175"
                              />
                              <SkeletonLoaderComponent
                                Cwidth="100"
                                Cheight="175"
                              />
                              <SkeletonLoaderComponent
                                Cwidth="100"
                                Cheight="175"
                              />
                            </>
                          )}
                        </div>
                      )}
                      {(!sections || (sections && sections.length == 0)) && (
                        <div className="chart_area_body text-center">
                          <svg
                            width="140"
                            height="140"
                            viewBox="0 0 140 140"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.667 29.167V105H64.167V93.3337H23.3337V40.8337H99.167V64.167H110.834V29.167H11.667ZM52.5003 52.5003V81.667L72.917 67.0837L52.5003 52.5003ZM122.734 68.0753L93.8587 96.9503L81.4337 84.5837L73.2087 92.8087L93.8587 113.459L130.959 76.3587L122.734 68.0753Z"
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
                  <div className="col-lg-7">
                    <div className="chart_boxes new-chart_boxes">
                      <div className="admin-header">
                        <h1 className="admin-head">Effort Distribution</h1>
                        <p className="admin-head2">
                          Hours of time spent in unitwise.
                        </p>
                      </div>
                      <div className="chart_area_body h-lg-550 overflow-auto chart_area_body custom-legend course-effort-distribution">
                        <div className="row">
                          {learningChartOptions.series.length > 0 && (
                            <div className="col-md-6">
                              <div className="border p-2 ">
                                <Chart {...learningChartOptions} type="donut" width='100%' height="500" />
                              </div>
                            </div>
                          )}
                          {learningChartOptions.series.length == 0 && (
                            <div className="col-md-6">
                              <svg
                                width="500"
                                height="500"
                                viewBox="0 0 520 520"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
                                  fill="#DBDBE8"
                                />
                                <path
                                  d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
                                  fill="#D4D4EA"
                                />
                                <path
                                  d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
                                  fill="#DEDEE7"
                                />
                                <path
                                  d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
                                  fill="#E1E1E6"
                                />
                                <path
                                  d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
                                  fill="#D8D8E9"
                                />
                              </svg>
                              <h2 className="text-muted align-1">
                                No data yet
                              </h2>
                              <p className="text-muted align-2">
                                Spend sometime to see your progress
                              </p>
                            </div>
                          )}
                          {practiceChartOptions.series.length > 0 && (
                            <div className="col-md-6 ">
                              <div className="border p-2">
                                <Chart {...practiceChartOptions} type="donut" width="100%" height="500" />
                              </div>
                            </div>
                          )}
                          {practiceChartOptions.series.length == 0 && (
                            <div className="col-md-6 text-center">
                              <svg
                                width="500"
                                height="500"
                                viewBox="0 0 520 520"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M108.45 227.878C112.667 207.989 120.76 189.124 132.268 172.362C143.775 155.6 158.472 141.269 175.518 130.187L209.642 182.674C199.488 189.275 190.735 197.812 183.88 207.796C177.026 217.78 172.205 229.016 169.693 240.863L108.45 227.878Z"
                                  fill="#DBDBE8"
                                />
                                <path
                                  d="M108.45 227.878C101.021 262.919 105.971 299.451 122.457 331.251C138.944 363.051 165.947 388.151 198.864 402.273C231.782 416.396 268.579 418.668 302.984 408.702C337.389 398.736 367.274 377.149 387.547 347.619C407.821 318.089 417.227 282.443 414.165 246.754C411.103 211.066 395.761 177.544 370.753 151.899C345.746 126.254 312.62 110.074 277.02 106.115C241.42 102.156 205.548 110.663 175.518 130.187L210.227 183.574C227.906 172.081 249.024 167.072 269.982 169.403C290.94 171.734 310.441 181.259 325.163 196.356C339.885 211.454 348.917 231.188 350.72 252.198C352.523 273.208 346.985 294.193 335.05 311.578C323.115 328.962 305.521 341.671 285.267 347.538C265.012 353.405 243.35 352.067 223.971 343.753C204.592 335.439 188.695 320.663 178.99 301.942C169.284 283.221 166.37 261.714 170.744 241.086L108.45 227.878Z"
                                  fill="#D4D4EA"
                                />
                                <path
                                  d="M128.984 343.376C118.067 326.224 110.634 307.089 107.112 287.065C103.589 267.041 104.046 246.519 108.454 226.67L170.613 240.477C168.017 252.162 167.749 264.245 169.822 276.034C171.896 287.823 176.272 299.088 182.699 309.186L128.984 343.376Z"
                                  fill="#DEDEE7"
                                />
                                <path
                                  d="M227.316 411.211C207.416 407.047 188.53 399.004 171.737 387.541C154.945 376.078 140.575 361.42 129.447 344.403L183.227 309.236C189.736 319.19 198.142 327.764 207.965 334.47C217.788 341.175 228.836 345.88 240.477 348.316L227.316 411.211Z"
                                  fill="#E1E1E6"
                                />
                                <path
                                  d="M343.005 391.175C325.825 402.048 306.672 409.432 286.639 412.904C266.605 416.375 246.084 415.867 226.247 411.408L240.259 349.077C251.91 351.696 263.963 351.994 275.73 349.955C287.497 347.916 298.746 343.579 308.837 337.192L343.005 391.175Z"
                                  fill="#D8D8E9"
                                />
                              </svg>
                              <h2 className="text-muted align-3">
                                No data yet
                              </h2>
                              <p className="text-muted align-2">
                                Spend sometime to see your progress
                              </p>
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
        </div>
      </div>
    </main>
  );
};

export default CourseAnalytics;
