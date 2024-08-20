"use client";
import React, { useState, useEffect } from "react";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import * as authService from "@/services/auth";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUp } from "@fortawesome/free-solid-svg-icons";
import te from "date-fns/esm/locale/te/index.js";
import { militoHour, date, fromNow, avatar } from "@/lib/pipe";
import { getSummary } from "@/services/testseriesService";
import { getUser } from "@/services/userService";

const StudentAnalyticsComponent = ({ user }: any) => {
  const [completionData, setCompletionData] = useState<any>({});
  const [intervalCompletionData, setIntervalCompletionData] = useState<any>({});
  const [accuracyData, setAccuracyData] = useState<any>({});
  const [intervalAccuracyData, setIntervalAccuracyData] = useState<any>({});
  const [testSeriesId, setTestSeriesId] = useState<any>("");
  const [studentsRanks, setStudentsRanks] = useState<any>([]);
  const [hoursData, setHoursData] = useState<any>({});
  const [intervalHoursData, setIntervalHoursData] = useState<any>({});
  const [questionSubjectDistributionArr, setQuestionSubjectDistributionArr] =
    useState<any[]>([]);
  const [allQuestionDistribution, setAllQuestionDistribution] = useState<any>(
    []
  );
  const [selectedQuestionDistribution, setSelectedQuestionDistribution] =
    useState<string>("");
  const [assssmentSubArr, setAssssmentSubArr] = useState<any>([]);
  const [allAssessmentData, setAllAssessmentData] = useState<any>([]);
  const [selectedAssessmentSubject, setSelectedAssessmentSubject] =
    useState<any>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>([]);
  const [allSubjectData, setAllSubjectData] = useState<any>();
  const [subjectArr, setSubjectArr] = useState<any>([]);
  const [testseries, setTestSeries] = useState<any>([]);
  const [student, setStudent] = useState<any>([]);
  const { id, studentId } = useParams();

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
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + "K";
          },
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

  const [assessmentWiseChartOptions, setAssessmentWiseChartOptions] =
    useState<any>({
      series: [],
      options: {
        chart: {
          // type: "bar",
          height: 250,
        },
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          categories: [],
        },
        yaxis: {
          title: {
            text: "Marks",
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val: any) {
              return val + " Marks";
            },
          },
        },
      },
    });
  const [subjectWiseChartOptions, setSubjectWiseChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 250,
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        title: {
          text: "Marks",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + " Marks";
          },
        },
      },
    },
  });

  useEffect(() => {
    setTestSeriesId(id);
    getSummary(testSeriesId, { titleOnly: true }).then((data: any) => {
      setTestSeries(data);
    });
    getUser(studentId, { nameOnly: true }).then((st: any) => {
      setStudent(st);
    });
    clientApi.get(`/api/testSeries/getStudentRank/${id}`).then((data: any) => {
      setStudentsRanks(data.data);
    });
    clientApi
      .get(`/api/testSeries/percentCompleteTestseries/${id}`)
      .then((data) => {
        setCompletionData(data.data);
      });
    clientApi
      .get(`/api/testSeries/percentAccuracyTestseries/${id}`)
      .then((data) => {
        console.log(data, "accuracy>>>>>>><<<<<<<<<<<<");
        setAccuracyData(data.data);
      });
    clientApi
      .get(`/api/testSeries/practiceHoursTestSeries/${id}`)
      .then((data) => {
        setHoursData(data.data);
      });
    clientApi
      .get(
        `/api/testSeries/percentCompleteTestseries/${id}${toQueryString({
          limit: "15days",
        })}`
      )
      .then((data) => {
        setIntervalCompletionData(data.data);
      });
    clientApi
      .get(
        `/api/testSeries/percentCompleteTestseries/${id}${toQueryString({
          daysLimit: 15,
        })}`
      )
      .then((data) => {
        console.log(data.data, "accuracy>>>>>>>>>>>>>>>>>");
        setIntervalAccuracyData(data.data);
      });
    clientApi
      .get(
        `/api/testSeries/practiceHoursTestSeries/${id}${toQueryString({
          limit: "15days",
        })}`
      )
      .then((data) => {
        setIntervalHoursData(data.data);
      });
    clientApi
      .get(`/api/testSeries/questionCategoryTestSeries/${id}`)
      .then(async (d: any) => {
        setAllQuestionDistribution(d.data);
        let temp = questionSubjectDistributionArr;
        7;
        if (d.data && d.data.length) {
          d.data.forEach((element: any) => {
            if (!temp.some((sub) => sub._id === element.subjectId)) {
              setQuestionSubjectDistributionArr([
                ...questionSubjectDistributionArr,
                { _id: element.subjectId, name: element.subjectName },
              ]);
              temp = [
                ...questionSubjectDistributionArr,
                { _id: element.subjectId, name: element.subjectName },
              ];
            }
          });
          await setSelectedQuestionDistribution(temp[0]?.name);
          const filterData = d.data.filter(
            (sub: any) =>
              sub.subjectName.toLowerCase() === temp[0]?.name.toLowerCase()
          );
          const data = filterData;
          drawQuestionCategoryDistribution(data, false);
        }
      });
    clientApi
      .get(`/api/testSeries/assesmentWiseMarksTestSeries/${id}`)
      .then((d: any) => {
        setAllAssessmentData(d.data);
        console.log(d.data, "====");
        //current User
        let temp = assssmentSubArr;
        d.data.user.forEach((element: any) => {
          if (!temp.some((sub: any) => sub._id === element.subjectId)) {
            setAssssmentSubArr([
              ...assssmentSubArr,
              { _id: element.subjectId, name: element.subjectName },
            ]);
            temp = [
              ...assssmentSubArr,
              { _id: element.subjectId, name: element.subjectName },
            ];
          }
        });
        if (temp && temp.length > 0) {
          setSelectedAssessmentSubject(temp[0].name);
          const userData = d.data.user.filter(
            (sub: any) =>
              sub.subjectName.toLowerCase() === temp[0].name.toLowerCase()
          );
          const averageData = d.data.average.filter(
            (sub: any) =>
              sub.subjectName.toLowerCase() === temp[0].name.toLowerCase()
          );
          const topperData = d.data.topper.filter(
            (sub: any) =>
              sub.subjectName.toLowerCase() === temp[0].name.toLowerCase()
          );

          drawAssessmetWiseGraph(userData, averageData, topperData, false);
        }
      });
    clientApi
      .get(`/api/testSeries/subjectWiseMarksTestSeries/${id}`)
      .then((data: any) => {
        setAllSubjectData(data.data);
        let temp = subjectArr;
        data.data.user.forEach((element: any) => {
          if (!temp.some((sub: any) => sub._id === element?.subjectId)) {
            setSubjectArr([
              ...subjectArr,
              { _id: element?.subjectId, name: element?.subjectName },
            ]);
            temp = [
              ...subjectArr,
              { _id: element?.subjectId, name: element?.subjectName },
            ];
          }
        });
        if (temp && temp.length > 0) {
          setSelectedSubject(temp[0].name);
          const userData = data.data.user.filter(
            (sub: any) =>
              sub?.subjectName.toLowerCase() === temp[0].name.toLowerCase()
          );
          const averageData = data.data.average.filter(
            (sub: any) =>
              sub?.subjectName.toLowerCase() === temp[0].name.toLowerCase()
          );
          const topperData = data.data.topper.filter(
            (sub: any) =>
              sub?.subjectName.toLowerCase() === temp[0].name.toLowerCase()
          );
          drawSubjectWiseGraph(userData, averageData, topperData, false);
        }
      });
  }, []);

  const drawAssessmetWiseGraph = (
    user: any,
    average: any,
    topper: any,
    reload: any
  ) => {
    const averageMarks: any = [];
    const userMarks: any = [];
    const topperMarks: any = [];

    const categories: any = [];
    user.forEach((element: any) => {
      userMarks.push(element.marks);
      categories.push(element.testName);

      average.forEach((a: any) => {
        if (element.testId === a.testId && element.subjectId === a.subjectId) {
          averageMarks.push(Math.round(a.marks));
        }
      });

      topper.forEach((a: any) => {
        if (element.testId === a.testId && element.subjectId === a.subjectId) {
          topperMarks.push(a.marks);
        }
      });
    });

    if (reload) {
      const arr = [
        {
          name: "Student",
          data: userMarks,
        },
        {
          name: "Topper",
          data: topperMarks,
        },
        {
          name: "Average",
          data: averageMarks,
        },
      ];
      setAssessmentWiseChartOptions((prev: any) => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: { categories },
        },
      }));

      setAssessmentWiseChartOptions((prev: any) => ({
        ...prev,
        series: arr,
      }));
    } else {
      setAssessmentWiseChartOptions((prev: any) => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: { categories: categories },
        },
      }));
      setAssessmentWiseChartOptions((prev: any) => ({
        ...prev,
        series: [
          {
            name: "Student",
            data: userMarks,
          },
          {
            name: "Topper",
            data: topperMarks,
          },
          {
            name: "Average",
            data: averageMarks,
          },
        ],
      }));
    }
  };

  const drawQuestionCategoryDistribution = (data: any, reload: any) => {
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
      categories.push(element.category);
    });
    if (reload) {
      setQuestionCategoryDistributionChartOptions((prev: any) => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: { categories: categories },
        },
      }));
      setQuestionCategoryDistributionChartOptions(
        (prev: any) => (
          console.log(prev, "distribu>>>>>>>>>>>>>"),
          {
            ...prev,
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
            ],
          }
        )
      );
    } else {
      setQuestionCategoryDistributionChartOptions((prev: any) => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: { categories: categories },
        },
      }));
      setQuestionCategoryDistributionChartOptions((prev: any) => ({
        ...prev,
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
        ],
      }));
    }
  };

  const filterQuestionDistribution = (filter: any) => {
    setSelectedQuestionDistribution(filter);
    const filterData = allQuestionDistribution.filter(
      (sub: any) => sub.subjectName.toLowerCase() === filter.toLowerCase()
    );
    const data = filterData;
    drawQuestionCategoryDistribution(data, true);
  };

  const drawSubjectWiseGraph = (
    user: any,
    average: any,
    topper: any,
    reload: any
  ) => {
    const averageMarks: any = [];
    const userMarks: any = [];
    const topperMarks: any = [];

    const categories: any = [];
    user.forEach((e: any) => {
      userMarks.push(e.marks);
      categories.push(e.unitName);

      average.forEach((a: any) => {
        if (e.unitId === a.unitId && e.subjectId === a.subjectId) {
          averageMarks.push(Math.round(a.marks));
        }
      });

      topper.forEach((a: any) => {
        if (e.unitId === a.unitId && e.subjectId === a.subjectId) {
          topperMarks.push(a.marks);
        }
      });
    });
    if (reload) {
      const data = [
        {
          name: "Student",
          data: userMarks,
        },
        {
          name: "Topper",
          data: topperMarks,
        },
        {
          name: "Average",
          data: averageMarks,
        },
      ];
      console.log(data, "-------->data");
      setSubjectWiseChartOptions((prev: any) => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: { categories },
        },
      }));
      setSubjectWiseChartOptions((prev: any) => ({
        ...prev,
        series: data,
      }));
    }
    {
      setSubjectWiseChartOptions((prev: any) => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: { categories: categories },
        },
      }));
      setSubjectWiseChartOptions((prev: any) => ({
        ...prev,
        series: [
          {
            name: "Student",
            data: userMarks,
          },
          {
            name: "Topper",
            data: topperMarks,
          },
          {
            name: "Average",
            data: averageMarks,
          },
        ],
      }));
    }
  };

  const filterSubjectWise = (name: any) => {
    console.log(name);
    setSelectedSubject(name);
    const userData = allSubjectData.user.filter(
      (sub: any) => sub.subjectName.toLowerCase() === name.toLowerCase()
    );
    const averageData = allSubjectData.average.filter(
      (sub: any) => sub.subjectName.toLowerCase() === name.toLowerCase()
    );
    const topperData = allSubjectData.topper.filter(
      (sub: any) => sub.subjectName.toLowerCase() === name.toLowerCase()
    );
    drawSubjectWiseGraph(userData, averageData, topperData, true);
  };

  const filterAssessmentWise = (name: any) => {
    setSelectedAssessmentSubject(name);
    const userData = allAssessmentData.user?.filter(
      (sub: any) => sub.subjectName.toLowerCase() === name.toLowerCase()
    );
    const averageData = allAssessmentData.average?.filter(
      (sub: any) => sub.subjectName.toLowerCase() === name.toLowerCase()
    );
    const topperData = allAssessmentData.topper?.filter(
      (sub: any) => sub.subjectName.toLowerCase() === name.toLowerCase()
    );
    drawAssessmetWiseGraph(userData, averageData, topperData, true);
  };

  return (
    <div>
      <main className="test-series-analytics p-0">
        <div className="container">
          <div className="mx-auto">
            <div className="container5 bg-white">
              <div className="overall-analytics">
                <section className="details details_top_area_common">
                  <div className="container">
                    <div className="asses-info">
                      <div className="title-wrap clearfix">
                        <div className="title">
                          <h3 className="main_title over-head1 text-white pl-0">
                            Test Series Analytics: {testseries?.title}
                          </h3>
                        </div>
                      </div>

                      {student && (
                        <div className="d-flex align-items-center mt-2">
                          <div>
                            <figure className="user_img_circled_wrap">
                              <img
                                className="avatar"
                                src="{{student | avatar}}"
                                alt=""
                              />
                            </figure>
                          </div>

                          <div className="inner ml-2 pl-0">
                            <div className="inners">
                              <div className="d-flex align-items-center">
                                <h4>{student.name}</h4>
                              </div>
                              <p>{student.userId}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="overall-main">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="admin-box data_ana_box">
                      <div className="overall-head text-center">
                        Test Series completion
                      </div>
                      <div className="form-row">
                        <div className="col-4">
                          <p className="over1">Student</p>
                          <h4 className="over2">
                            {Math.round(completionData?.user?.percentComplete)}%
                          </h4>
                          <p className="over3 d-flex align-items-center justify-content-center">
                            {/* <FontAwesomeIcon icon={faSortUp} className="pt-1">arrow_drop_up </FontAwesomeIcon><span className="persist-arrow ml-1"
                            >{
                                Math.round(intervalCompletionData?.user?.percentComplete)}%</span> */}
                          </p>
                        </div>
                        <div className="col-4">
                          <p className="over1">Average</p>
                          <h4 className="over2-inactive">
                            {Math.round(
                              completionData?.average?.percentComplete
                            )}
                            %
                          </h4>
                          <p className="over3 d-flex align-items-center justify-content-center">
                            {/* <FontAwesomeIcon icon={faSortUp} className="pt-1"> arrow_drop_up </FontAwesomeIcon><span className="persist-arrow ml-1"
                            >{
                                Math.round(intervalCompletionData?.average?.percentComplete)}%</span
                            > */}
                          </p>
                        </div>
                        <div className="col-4">
                          <p className="over1">Topper</p>
                          <h4 className="over2-inactive">
                            {Math.round(
                              completionData?.topper?.percentComplete
                            )}
                            %
                          </h4>
                          <p className="over3 d-flex align-items-center justify-content-center">
                            {/* <FontAwesomeIcon icon={faSortUp} className="pt-1"> arrow_drop_up </FontAwesomeIcon>
                            <span className="persist-arrow ml-1"
                            >{
                                Math.round(intervalCompletionData?.topper?.percentComplete)}%</span> */}
                          </p>
                        </div>
                      </div>
                      <p className="over-0 text-left">
                        *Test Series completion in last 15 days
                      </p>
                    </div>
                  </div>
                  {accuracyData && accuracyData.user && (
                    <div className="col-lg-4">
                      <div className="admin-box data_ana_box">
                        <div className="overall-head text-center">Accuracy</div>
                        <div className="form-row">
                          <div className="col-4">
                            <p className="over1">Student</p>
                            <h4 className="over2">
                              {Math.round(accuracyData.user.accuracy)}%
                            </h4>
                            {intervalAccuracyData &&
                              intervalAccuracyData.user && (
                                <p className="over3 d-flex align-items-center justify-content-center">
                                  {/* <FontAwesomeIcon icon={faSortUp} className="pt-1"> arrow_drop_up </FontAwesomeIcon>
                            <span className="persist-arrow ml-1"
                            >{
                                Math.ceil(intervalAccuracyData.user.percentComplete ? intervalCompletionData.user.percentComplete + intervalAccuracyData.user.percentComplete : 0)
                              }%</span> */}
                                </p>
                              )}
                          </div>
                          <div className="col-4">
                            <p className="over1">Average</p>
                            <h4 className="over2-inactive">
                              {Math.round(
                                accuracyData.average.accuracy
                                  ? accuracyData.average.accuracy
                                  : 0
                              )}{" "}
                              %
                            </h4>
                            {intervalAccuracyData &&
                              intervalAccuracyData.average && (
                                <p className="over3 d-flex align-items-center justify-content-center">
                                  {/* <FontAwesomeIcon icon={faSortUp} className="pt-1"> arrow_drop_up </FontAwesomeIcon> */}
                                  <span className="persist-arrow ml-1">
                                    {Math.ceil(
                                      intervalAccuracyData.average
                                        .percentComplete
                                        ? intervalCompletionData.average
                                            .percentComplete +
                                            intervalAccuracyData.average
                                              .percentComplete
                                        : 0
                                    )}
                                    %
                                  </span>
                                </p>
                              )}
                          </div>
                          <div className="col-4">
                            <p className="over1">Topper</p>
                            <h4 className="over2-inactive">
                              {Math.round(accuracyData.topper.accuracy)}%
                            </h4>
                            {intervalAccuracyData &&
                              intervalAccuracyData.topper && (
                                <p className="over3 d-flex align-items-center justify-content-center">
                                  {/* <FontAwesomeIcon icon={faSortUp} className="pt-1"> arrow_drop_up </FontAwesomeIcon>
                            <span className="persist-arrow ml-1"
                            >{
                                Math.ceil(intervalAccuracyData.topper.percentComplete ? intervalCompletionData.topper.percentComplete + intervalAccuracyData.topper.percentComplete : 0)}%</span> */}
                                </p>
                              )}
                          </div>
                        </div>
                        <p className="over-0 text-left">
                          *Accuracy in last 15 days
                        </p>
                      </div>
                    </div>
                  )}

                  {hoursData && hoursData.user && (
                    <div className="col-lg-4">
                      <div className="admin-box data_ana_box">
                        <div className="overall-head text-center">
                          Practice Hour(s)
                        </div>
                        <div className="form-row">
                          <div className="col-4">
                            <p className="over1">Student</p>
                            <h4 className="over2">
                              {/* {Math.round(hoursData.user.totalTime)} */}
                              {militoHour(hoursData.user.totalTime, true)}
                            </h4>

                            {intervalHoursData && intervalHoursData.user && (
                              <p className="over3 d-flex align-items-center justify-content-center">
                                {/* <FontAwesomeIcon icon={faSortUp} className="pt-1"> arrow_drop_up </FontAwesomeIcon>
                            <span className="persist-arrow ml-1"
                            >{
                                militoHour(intervalHoursData.user.totalTime, true)}hrs</span> */}
                              </p>
                            )}
                          </div>
                          <div className="col-4">
                            <p className="over1">Average</p>
                            <h4 className="over2-inactive">
                              {militoHour(hoursData.average.totalTime, true)}
                            </h4>
                            {intervalHoursData && intervalHoursData.average && (
                              <p className="over3 d-flex align-items-center justify-content-center">
                                {/* <FontAwesomeIcon icon={faSortUp} className="pt-1">arrow_drop_up </FontAwesomeIcon>
                            <span className="persist-arrow ml-1"
                            >{
                                militoHour(intervalHoursData.average.totalTime, true)}hrs</span> */}
                              </p>
                            )}
                          </div>
                          <div className="col-4">
                            <p className="over1">Topper</p>
                            <h4 className="over2-inactive">
                              {militoHour(hoursData.topper.totalTime, true)}
                            </h4>
                            {intervalHoursData && intervalHoursData.topper && (
                              <p className="over3 d-flex align-items-center justify-content-center">
                                {/* <FontAwesomeIcon icon={faSortUp} className="pt-1">arrow_drop_up</FontAwesomeIcon>
                            <span className="persist-arrow ml-1"
                            >{
                                militoHour(intervalHoursData.topper.totalTime, true)}hrs</span> */}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="over-0 text-left">
                          *Time Spend in last 15 days
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="chart_boxes admin-box2">
                  <div className="test-series-analytics">
                    <div className="admin-header p-8">
                      <h4 className="admin-head line-height-initial">
                        Subject Wise Result
                      </h4>
                      <p className="admin-head2">
                        Know how the student performed in different subjects
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {subjectArr && subjectArr.length > 0 && (
                        <div className="filter-area clearfix mb-5">
                          <div className="filter-item">
                            <select
                              className="form-control"
                              name="subject"
                              value={selectedSubject.name}
                              required
                              onChange={(e) =>
                                filterSubjectWise(e.target.value)
                              }
                            >
                              <option value={""} disabled>
                                Select
                              </option>
                              {subjectArr.map((s: any, index: any) => {
                                return (
                                  <option value={s.name} key={index}>
                                    {s.name}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      )}
                      {subjectWiseChartOptions.series &&
                        subjectWiseChartOptions.series.length > 0 && (
                          <Chart
                            type="bar"
                            height={300}
                            series={subjectWiseChartOptions.series}
                            options={subjectWiseChartOptions.options}
                          ></Chart>
                        )}
                      {subjectArr && subjectArr.length == 0 && (
                        <div className="row">
                          <div className="col-5"></div>
                          <div className="col-2 NoGrapghData addNoDataFullpageImgs1">
                            <figure
                              className="ml-5"
                              style={{ height: "80px", width: "60px" }}
                            >
                              <img
                                src="/assets/images/noSubject.svg"
                                alt="Picture for No Subject"
                              />
                            </figure>
                            <h4 className="mt-2" style={{ marginLeft: "20%" }}>
                              No data yet!
                            </h4>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="chart_boxes admin-box2">
                  <div className="test-series-analytics">
                    <div className="admin-header">
                      <h4 className="admin-head line-height-initial">
                        Assesment Wise Result
                      </h4>
                      <p className="admin-head2">
                        You will know about student performance in Assesment
                      </p>
                    </div>
                    <div className="chart_area_body">
                      {assssmentSubArr && assssmentSubArr.length > 0 && (
                        <div className="filter-area clearfix mb-5">
                          <div className="filter-item">
                            <select
                              className="form-control"
                              name="subject"
                              value={selectedAssessmentSubject.name}
                              required
                              onChange={(e) =>
                                filterAssessmentWise(e.target.value)
                              }
                            >
                              <option value={""} disabled>
                                Select
                              </option>
                              {assssmentSubArr.map((s: any, index: any) => {
                                return (
                                  <option value={s.name} key={index}>
                                    {s.name}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      )}
                      {assessmentWiseChartOptions.series &&
                        assessmentWiseChartOptions.series.length > 0 && (
                          <Chart
                            type="bar"
                            height={300}
                            series={assessmentWiseChartOptions.series}
                            options={assessmentWiseChartOptions.options}
                          ></Chart>
                        )}
                      {/* {assssmentSubArr && assssmentSubArr.length > 0 && <div
                        className="filter-area clearfix">
                        <div className="filter-item">
                          <div className="dropdown">
                            <a
                              className="btn dropdown-toggle text-left"
                              href="#"
                              role="button"
                              id="AssesmentfilterLavel"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <span>{selectedAssessmentSubject}</span>
                            </a>

                            <div
                              className="dropdown-menu border-0 py-0"
                              aria-labelledby="AssesmentfilterLavel"
                            >
                              {assssmentSubArr.map((s: any, i: any) => <a key={i}
                                className="dropdown-item"
                                onClick={() => filterAssessmentWise(s.name)}
                              > {s.name}</a>)}
                            </div>
                          </div>
                        </div>
                      </div>} */}

                      {assssmentSubArr && assssmentSubArr.length == 0 && (
                        <div className="row">
                          <div className="col-5"></div>
                          <div className="col-2 NoGrapghData addNoDataFullpageImgs1">
                            <figure
                              className="ml-5"
                              style={{ height: "65px", width: "60px" }}
                            >
                              <img
                                src="/assets/images/errorSymbol.svg"
                                alt="Picture for Error Sysmbol"
                              />
                            </figure>
                            <h4 style={{ marginLeft: "20%" }}>No data yet!</h4>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-5">
                    <div className="chart_boxes admin-box3-remove h-lg-100">
                      <div className="admin-header">
                        <h4 className="admin-head line-height-initial">
                          Overall Rank
                        </h4>
                        <p className="admin-head2">
                          Know how student performed in the test series
                        </p>
                      </div>
                      <div className="chart_area_body">
                        {studentsRanks && studentsRanks.length > 0 && (
                          <div className="admin-box-info">
                            {studentsRanks.map((s: any, i: any) => (
                              <div key={i}>
                                <div className="form-row align-items-center py-2">
                                  <div className="col-auto">
                                    <div className="admin-info3-dir number-increment-box">
                                      <h5>{i + 1}</h5>
                                    </div>
                                  </div>
                                  <div className="col">
                                    <div className="d-flex align-items-center">
                                      <figure>
                                        <img
                                          src={s?.avatar.fileUrl}
                                          alt=""
                                          className="avatar"
                                        />
                                      </figure>
                                      <div className="admin-info2-dir ml-3">
                                        <h6>{s.name}</h6>
                                        <p>{s.email}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-auto">
                                    <div className="admin-info2-dir score_wrap">
                                      {i == 0 && (
                                        <p className="over-table-head">Score</p>
                                      )}
                                      <h6>{s.marks}</h6>
                                    </div>
                                  </div>
                                </div>
                                <hr />
                              </div>
                            ))}
                          </div>
                        )}
                        {studentsRanks.length == 0 && (
                          <div className="row">
                            <div className="col-3"></div>
                            <div className="col-8 pl-0 NoGrapghData addNoDataFullpageImgs1">
                              <figure
                                className="mt-4"
                                style={{ height: "225px", width: "260px" }}
                              >
                                <img
                                  src="/assets/images/noRankk.svg"
                                  alt="Picture for noRank"
                                />
                              </figure>
                              <h4
                                className="mt-2"
                                style={{ marginLeft: "30%" }}
                              >
                                No data yet!
                              </h4>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-7">
                    <div className="chart_boxes admin-box3-remove h-lg-100">
                      <div className="test-series-analytics-1">
                        <div className="admin-header">
                          <h4 className="admin-head line-height-initial">
                            Question Category Distribution
                          </h4>
                          <p className="admin-head2">
                            Know about the types of questions attempted by the
                            student.
                          </p>
                        </div>
                        {selectedQuestionDistribution && (
                          <div className="chart_area_body">
                            {questionCategoryDistributionChartOptions &&
                              questionCategoryDistributionChartOptions.series && (
                                <Chart
                                  type="bar"
                                  series={
                                    questionCategoryDistributionChartOptions.series
                                  }
                                  options={
                                    questionCategoryDistributionChartOptions.options
                                  }
                                ></Chart>
                              )}
                            <div className="filter-area clearfix">
                              <div className="filter-item">
                                <div className="dropdown">
                                  <a
                                    className="btn dropdown-toggle text-left"
                                    href="#"
                                    role="button"
                                    id="QuestionfilterLavel"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                  >
                                    <span>{selectedQuestionDistribution}</span>
                                  </a>

                                  <div
                                    className="dropdown-menu border-0 py-0"
                                    aria-labelledby="QuestionfilterLavel"
                                  >
                                    {questionSubjectDistributionArr.map(
                                      (q: any, i: any) => (
                                        <a
                                          key={i}
                                          className="dropdown-item"
                                          onClick={() =>
                                            filterQuestionDistribution(q.name)
                                          }
                                        >
                                          {" "}
                                          {q.name}
                                        </a>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {!selectedQuestionDistribution && (
                          <div className="chart_area_body text-center">
                            <svg
                              width="344"
                              height="308"
                              viewBox="0 0 344 308"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M140.989 42.1839L140.989 265.817C140.989 268.391 143.318 270.477 146.194 270.477L198.231 270.477C201.106 270.477 203.435 268.391 203.435 265.817L203.435 42.1839C203.435 39.609 201.106 37.5239 198.231 37.5239L146.19 37.5239C143.318 37.5239 140.989 39.609 140.989 42.1839Z"
                                fill="#D4D4EA"
                              />
                              <path
                                d="M61.3984 134.716L61.2161 134.716L61.2161 265.817C61.2161 268.391 63.5449 270.477 66.4208 270.477L118.458 270.477C121.333 270.477 123.662 268.391 123.662 265.817L123.662 134.716L123.48 134.716C123.195 133.718 122.547 132.833 121.638 132.2C120.73 131.567 119.612 131.222 118.461 131.22L66.4173 131.22C63.9956 131.22 61.9797 132.708 61.3984 134.716Z"
                                fill="#D4D4EA"
                              />
                              <path
                                d="M220.342 105.081L220.342 265.817C220.342 268.391 222.671 270.477 225.547 270.477L277.584 270.477C280.46 270.477 282.789 268.391 282.789 265.817L282.789 105.081C282.789 102.506 280.46 100.421 277.584 100.421L225.547 100.421C222.671 100.421 220.342 102.506 220.342 105.081Z"
                                fill="#D4D4EA"
                              />
                            </svg>
                            <h1>No Data yet</h1>
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
      </main>
    </div>
  );
};

export default StudentAnalyticsComponent;
