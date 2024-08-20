"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import * as settingSvc from "@/services/settingService";
import * as adminSvc from "@/services/adminService";
import * as subjectSvc from "@/services/subjectService";
import * as classSvc from "@/services/classroomService";
import * as locationSvc from "@/services/LocationService";
import * as seriesSvc from "@/services/testseriesService";
import * as testSvc from "@/services/practiceService";
import * as courseService from "@/services/courseService";
import * as alertify from "alertifyjs";
import { sortByName } from "@/lib/helpers";
import moment from "moment";
import { saveBlobFromResponse } from "@/lib/common";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import Multiselect from "multiselect-react-dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Chart from "react-apexcharts";

export default function ReportDetail() {
  const { id } = useParams();
  const [dropdownSettings, setDropdownSettings] = useState<any>({});
  const [params, setParams] = useState<any>({});
  const [report, setReport] = useState<any>(null);
  const [paramMandatory, setParamMandatory] = useState<any>([]);
  const [paramOptional, setParamOptional] = useState<any>([]);
  const [subjects, setSubjects] = useState<any>([]);
  const [testseries, setTestseries] = useState<any>([]);
  const [courses, setCourses] = useState<any>([]);
  const [tests, setTests] = useState<any>([]);
  const [mentors, setMentors] = useState<any>([]);
  const [passingYears, setPassingYears] = useState<string[]>([]);
  const [locations, setLocations] = useState<any>([]);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [personality, setPersonality] = useState<any>([]);
  const [loadedRooms, setLoadedRooms] = useState<any>({});
  const [chartOptions, setChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
        stacked: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      title: {
        text: "",
      },
      xaxis: {
        categories: [],
      },
      yaxis: {},
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

  const [showChart, setShowChart] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [loadedSubjects, setLoadedSubjects] = useState<any>({});

  useEffect(() => {
    adminSvc.getReport(id).then((res) => {
      setReport(res);

      processReport(res);
    });
  }, []);

  useEffect(() => {
    const inputElements = document.querySelectorAll("#search_input");
    inputElements.forEach((inputElement) => {
      inputElement.removeAttribute("disabled");
    });
  }, [document.querySelectorAll("#search_input")]);
  const processReport = (rep?: any) => {
    if (!rep) {
      rep = report;
    }
    const newDropdownSettings: any = {};
    const tmp_paramMandatory = [];
    const tmp_paramOptional = [];
    for (const p in rep.params) {
      if (!rep.params[p].active) {
        continue;
      } else if (rep.params[p].mandatory) {
        tmp_paramMandatory.push(p);
        setParamMandatory(tmp_paramMandatory);
      } else {
        tmp_paramOptional.push(p);
        setParamOptional(tmp_paramOptional);
      }

      newDropdownSettings[p] = {
        singleSelection: !rep.params[p].multiple,
        idField: "_id",
        textField: "name",
        itemsShowLimit: 5,
        allowSearchFilter: true,
        selectAllText: "Select All",
        unSelectAllText: "UnSelect All",
      };

      switch (p) {
        case "subject":
          loadSubject();
          break;
        case "testseries":
          newDropdownSettings[p].textField = "title";
          loadTestseries();
          break;
        case "course":
          newDropdownSettings[p].textField = "title";
          loadCourse();
          break;
        case "test":
          newDropdownSettings[p].textField = "title";
          loadTests();
          break;
        case "mentor":
          loadMentor();
          break;
        case "passingYear":
          newDropdownSettings[p] = {
            singleSelection: true,
          };
          loadPassingYear();
          break;
        case "center":
          loadLocation();
          break;
        case "classroom":
          // Usualy classrooms will be loaded after user select a location
          // so we dont preload it here
          break;
        case "personality":
          loadPersonality();
          break;
      }
    }
    setDropdownSettings(newDropdownSettings);
  };

  const loadSubject = () => {
    subjectSvc.getMine().then((res: any[]) => {
      setSubjects(res);
    });
  };

  const loadTestseries = (subject?: any) => {
    const query: any = { status: "published", includeCount: true };
    if (subject) {
      query.subject = subject;
    }
    return seriesSvc.find(query).then((res: any) => {
      setTestseries(res.series);
    });
  };

  const loadCourse = (subject?: any) => {
    const query: any = { status: "published", home: true };
    return courseService.getAllTeacherCourses(query).then((res: any) => {
      setCourses(res);
    });
  };

  const loadClassroom = (item, reomved?) => {
    setParams({
      ...params,
      course: item,
    });
    if (!item || item == "") {
      if (reomved) {
        return;
      }
      alertify.alert("Message", "Please add course first");
      return;
    }
    courseService.getOngoingClasses(item[0]._id).then((da: any[]) => {
      da = da.map((d) => {
        return {
          _id: d.classroomId,
          name: d.title,
        };
      });
      setClassrooms(da);
    });
  };

  const loadTests = (subject?: any) => {
    const query: any = { titleOnly: true, status: "published", noPaging: true };
    if (subject) {
      query.subjects = subject;
    }
    return testSvc.findTeacherTests(query).then(({ res }: any) => {
      setTests(res);
    });
  };

  const loadMentor = () => {
    // TBD
  };

  const loadPassingYear = () => {
    settingSvc.findOne("masterdata").then((settings: any) => {
      const years = [];
      if (settings.passingYear) {
        for (const y of settings.passingYear) {
          if (y.active) {
            years.push(y.name);
          }
        }
      }
      setPassingYears(years);
    });
  };

  const loadLocation = () => {
    locationSvc.find({}).then((res: any[]) => {
      // sortByName(res);

      setLocations(res);

      if (res?.length === 1) {
        setParams({
          ...params,
          center: [res[0]],
        });

        selectedLocationChanged();
      }
    });
  };

  const loadPersonality = () => {
    // TBD
  };

  const selectedLocationChanged = (ev?: any) => {
    if (!ev) {
      ev = params.center;
    } else {
      setParams({
        ...params,
        center: ev,
      });
    }
    if (report.params.classrooms == "n") {
      return;
    }

    if (!ev.length) {
      // clear classroom
      setClassrooms([]);
    } else {
      // load classrooms
      if (loadedRooms[ev[0]._id]) {
        setClassrooms(loadedRooms[ev[0]._id]);
      } else {
        setClassrooms(null);
        classSvc
          .find({ location: ev[0]._id, report: true })
          .then((res: any) => {
            setClassrooms(res.classrooms);
            setLoadedRooms({
              ...loadedRooms,
              [ev[0]._id]: res.cclassroomsa,
            });
          });
      }
    }
  };

  const selectedSubjectChanged = async (ev?: any) => {
    setParams({
      ...params,
      subject: ev,
    });
    if (ev.length === 0) {
      // clear classroom
      setTests([]);
      setTestseries([]);
    } else {
      const sub = ev[0];
      if (loadedSubjects[sub._id]) {
        setTests(loadedSubjects[sub._id].tests);
        setTestseries(loadedSubjects[sub._id].testseries);
      } else {
        setLoadedSubjects({
          ...loadedSubjects,
          [sub._id]: {
            tests: [],
            testseries: [],
          },
        });
        setTests(null);
        setTestseries(null);
        if (report.params.tests != "n") {
          await loadTests(sub._id);
          const updatedSubjects = { ...loadedSubjects };

          updatedSubjects[sub._id] = {
            ...updatedSubjects[sub._id],
            tests: tests,
          };

          setLoadedSubjects(updatedSubjects);
        }
        if (report.params.testseries != "n") {
          await loadTestseries(sub._id);
          const updatedSubjects = { ...loadedSubjects };

          updatedSubjects[sub._id] = {
            ...updatedSubjects[sub._id],
            tests: tests,
          };

          setLoadedSubjects(updatedSubjects);
        }
      }
    }
  };

  const getParams = (download = false) => {
    const rParams: any = {};
    if (download) {
      rParams.directDownload = true;
    }

    for (const p in params) {
      if (params[p] && params[p].length) {
        if (report.params[p].multiple) {
          const nk = p + "s";

          rParams[nk] = params[p].map((f) => f._id);
        } else {
          // for other params are single selection so we only get the first one
          rParams[p] = params[p].map((f) => {
            if (f._id) {
              return f._id;
            }
            return f;
          })[0];
        }
      }
    }

    return rParams;
  };

  const view = () => {
    setShowChart(true);

    const invalidFields = paramMandatory.filter(
      (f) => !params[f] || !params[f].length
    );

    if (invalidFields.length) {
      alertify.alert(
        "Message",
        "These fields are required: " + invalidFields.join(",")
      );
      return;
    }

    if (loadingData) {
      return;
    }
    setLoadingData(true);

    adminSvc
      .getReportData(report.reportAPI, getParams())
      .then((res: any) => {
        // draw chart
        setTimeout(() => {
          switch (report.reportAPI) {
            case "getAttemptCountLast30Days":
              showAttemptCountLast30Days(res.data);
              break;
            case "getStudentCategoryByAttemptCount":
              getStudentCategoryByAttemptCount(res.data);
              break;
            case "getStudentCurrentTestLevelInTestseries":
              getStudentCurrentTestLevelInTestseries(res.data);
              break;
            case "gettestseriesOnboardingInfo":
              gettestseriesOnboardingInfo(res.data);
              break;
            case "getStudentPerformanceByUnitForTests":
              getStudentPerformanceByUnitForTests(res.data);
              break;
            case "getStudentPerformanceByUnitForTestseries":
              getStudentPerformanceByUnitForTestseries(res.data);
              break;
            case "getSubjectAccuracyByTestsAndCenterAndYear":
              getSubjectAccuracyByTestsAndCenterAndYear(res.data);
              break;
            case "getSubjectAccuracyByTestseriesAndCenterAndYear":
              getSubjectAccuracyByTestseriesAndCenterAndYear(res.data);
              break;
            case "getTopicAccuracyByTestseriesAndCenterAndYear":
              getTopicAccuracyByTestseriesAndCenterAndYear(res.data);
              break;
            case "getTopicAccuracyByTestsAndCenterAndYear":
              getTopicAccuracyByTestsAndCenterAndYear(res.data);
              break;
            case "getAccuracyByTopicForTestseries":
              getAccuracyByTopicForTestseries(res.data);
              break;
            case "getStudentAccuracyByTopic":
              getStudentAccuracyByTopic(res.data);
              break;
            case "getStudentAccuracyBySubject":
              getStudentAccuracyBySubject(res.data);
              break;
          }
        }, 1000);
        setLoadingData(false);
      })
      .catch((err) => {
        alertify.alert(
          "Message",
          "Report data is not available. Please change your parameters!"
        );
        setLoadingData(false);
      });
  };

  const download = () => {
    if (startDate) {
      setParams({
        ...params,
        startDate: [moment(startDate).format("DD/MM/YYYY")],
      });
    }
    if (endDate) {
      setParams({
        ...params,
        endDate: [moment(endDate).format("DD/MM/YYYY")],
      });
    }

    const invalidFields = paramMandatory.filter(
      (f) => !params[f] || (Array.isArray(params[f]) && !params[f].length)
    );

    if (invalidFields.length > 0) {
      alertify.alert(
        "Message",
        "These fields are required: " + invalidFields.join(",")
      );
      return;
    }
    if (loadingData) {
      return;
    }
    setLoadingData(true);

    adminSvc
      .downloadReportData(report.reportAPI, getParams(true))
      .then((res: any) => {
        // saveBlobFromResponse(res);
        setLoadingData(false);
      })
      .catch((err) => {
        console.log("eee");

        alertify.alert(
          "Message",
          "Report data is not available. Please change your parameters!"
        );
        setLoadingData(false);
      });
  };

  const showAttemptCountLast30Days = (data: any) => {
    setChartOptions({
      ...chartOptions,
      series: [
        {
          name: "Attempts",
          data: data.map((e) => e.user),
        },
      ],
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: data.map((e) => e.createdAt),
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getStudentCategoryByAttemptCount = (data: any) => {
    const categories = data.map((p) => p.attemptWeek);
    data.forEach((d) => {
      if (!d.Performer) {
        d.Performer = 0;
      }
      if (!d.Achiever) {
        d.Achiever = 0;
      }
      if (!d.Slacker) {
        d.Slacker = 0;
      }
    });
    setChartOptions({
      ...chartOptions,
      series: [
        {
          name: "Performer",
          data: [data[0].Performer],
        },
        {
          name: "Achiever",
          data: [data[0].Achiever],
        },
        {
          name: "Slacker",
          data: [data[0].Slacker],
        },
      ],
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: categories,
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getStudentCurrentTestLevelInTestseries = (data: any) => {
    const graphData: any = [];
    data.forEach((element) => {
      graphData.push({
        name: element.testName,
        data: [element.testId],
      });
    });
    setChartOptions({
      ...chartOptions,
      series: graphData,
    });
  };

  const gettestseriesOnboardingInfo = (data: any) => {
    const graphData: any = [];
    data.forEach((element) => {
      graphData.push({
        name: element.Header,
        data: [element.Count],
      });
    });

    setChartOptions({
      ...chartOptions,
      series: graphData,
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: [],
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getStudentPerformanceByUnitForTests = (data: any) => {
    const units = data.map((d) => d.unit);

    const graphData1: any = [];
    const graphData2: any = [];
    const graphData3: any = [];
    const graphData4: any = [];
    const graphData5: any = [];

    data.forEach((element, i) => {
      graphData1.push(element["1 (<= 30%)"]);
      graphData2.push(element["2 (> 30% & <= 50%)"]);
      graphData3.push(element["3 (> 50% & <= 70%)"]);
      graphData4.push(element["4 (> 70% & <= 90%)"]);
      graphData5.push(element["5 (> 90%)"]);
    });

    setChartOptions({
      ...chartOptions,
      series: [
        {
          name: "1 (<= 30%)",
          data: graphData1,
        },
        {
          name: "2 (> 30% & <= 50%)",
          data: graphData2,
        },
        {
          name: "3 (> 50% & <= 70%)",
          data: graphData3,
        },
        {
          name: "4 (> 70% & <= 90%)",
          data: graphData4,
        },
        {
          name: "5 (> 90%)",
          data: graphData5,
        },
      ],
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: units,
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {
            ...chartOptions.options.yaxis.labels,
            title: "Count Of Students",
          },
        },
      },
    });
  };

  const getStudentPerformanceByUnitForTestseries = (data: any) => {
    const units = data.map((d) => d.unit);

    const graphData1: any = [];
    const graphData2: any = [];
    const graphData3: any = [];
    const graphData4: any = [];
    const graphData5: any = [];

    data.forEach((element, i) => {
      graphData1.push(element["1 (<= 30%)"]);
      graphData2.push(element["2 (> 30% & <= 50%)"]);
      graphData3.push(element["3 (> 50% & <= 70%)"]);
      graphData4.push(element["4 (> 70% & <= 90%)"]);
      graphData5.push(element["5 (> 90%)"]);
    });
    setChartOptions({
      ...chartOptions,
      series: [
        {
          name: "1 (<= 30%)",
          data: graphData1,
        },
        {
          name: "2 (> 30% & <= 50%)",
          data: graphData2,
        },
        {
          name: "3 (> 50% & <= 70%)",
          data: graphData3,
        },
        {
          name: "4 (> 70% & <= 90%)",
          data: graphData4,
        },
        {
          name: "5 (> 90%)",
          data: graphData5,
        },
      ],
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: units,
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {
            ...chartOptions.options.yaxis.labels,
            title: "Count Of Students",
          },
        },
      },
    });
  };

  const getSubjectAccuracyByTestsAndCenterAndYear = (data: any) => {
    const units = data.map((d) => d.Unit);

    const graphData1: any = [];
    const graphData2: any = [];
    const graphData3: any = [];
    const graphData4: any = [];
    const graphData5: any = [];

    data.forEach((element, i) => {
      if (element.PerformanceLevel == "1 (<= 30%)") {
        graphData1.push(element.accuracy);
      }
      if (element.PerformanceLevel == "2 (> 30% & <= 50%)") {
        graphData2.push(element.accuracy);
      }
      if (element.PerformanceLevel == "3 (> 50% & <= 70%)") {
        graphData3.push(element.accuracy);
      }
      if (element.PerformanceLevel == "4 (> 70% & <= 90%)") {
        graphData4.push(element.accuracy);
      }
      if (element.PerformanceLevel == "5 (> 90%)") {
        graphData5.push(element.accuracy);
      }
    });

    setChartOptions({
      ...chartOptions,
      series: [
        {
          name: "1 (<= 30%)",
          data: graphData1,
        },
        {
          name: "2 (> 30% & <= 50%)",
          data: graphData2,
        },
        {
          name: "3 (> 50% & <= 70%)",
          data: graphData3,
        },
        {
          name: "4 (> 70% & <= 90%)",
          data: graphData4,
        },
        {
          name: "5 (> 90%)",
          data: graphData5,
        },
      ],
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: units,
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getSubjectAccuracyByTestseriesAndCenterAndYear = (data: any) => {
    const units = data.map((d) => d.Unit);

    const graphData1: any = [];
    const graphData2: any = [];
    const graphData3: any = [];
    const graphData4: any = [];
    const graphData5: any = [];

    data.forEach((element, i) => {
      if (element.PerformanceLevel == "1 (<= 30%)") {
        graphData1.push(element.accuracy);
      }
      if (element.PerformanceLevel == "2 (> 30% & <= 50%)") {
        graphData2.push(element.accuracy);
      }
      if (element.PerformanceLevel == "3 (> 50% & <= 70%)") {
        graphData3.push(element.accuracy);
      }
      if (element.PerformanceLevel == "4 (> 70% & <= 90%)") {
        graphData4.push(element.accuracy);
      }
      if (element.PerformanceLevel == "5 (> 90%)") {
        graphData5.push(element.accuracy);
      }
    });

    setChartOptions({
      ...chartOptions,
      series: [
        {
          name: "1 (<= 30%)",
          data: graphData1,
        },
        {
          name: "2 (> 30% & <= 50%)",
          data: graphData2,
        },
        {
          name: "3 (> 50% & <= 70%)",
          data: graphData3,
        },
        {
          name: "4 (> 70% & <= 90%)",
          data: graphData4,
        },
        {
          name: "5 (> 90%)",
          data: graphData5,
        },
      ],
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: units,
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getTopicAccuracyByTestseriesAndCenterAndYear = (data: any) => {
    const graphData: any = [];
    data.forEach((element) => {
      graphData.push({
        name: element.Topic,
        data: [element.Accuracy],
      });
    });
    setChartOptions({
      ...chartOptions,
      series: graphData,
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: ["Accuracy"],
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getTopicAccuracyByTestsAndCenterAndYear = (data: any) => {
    const graphData: any = [];
    data.forEach((element) => {
      graphData.push({
        name: element.Topic,
        data: [element.Accuracy],
      });
    });
    setChartOptions({
      ...chartOptions,
      series: graphData,
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: ["Accuracy"],
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getAccuracyByTopicForTestseries = (data: any) => {
    const graphData: any = [];
    data.forEach((element) => {
      graphData.push({
        name: element.Topic,
        data: [element.Accuracy],
      });
    });
    setChartOptions({
      ...chartOptions,
      series: graphData,
      options: {
        ...chartOptions.options,
        xaxis: {
          ...chartOptions.options.xaxis,
          categories: ["Accuracy"],
        },
        yaxis: {
          ...chartOptions.options.yaxis,
          labels: {},
        },
      },
    });
  };

  const getStudentAccuracyByTopic = (data: any) => {
    console.log(data);
  };

  const getStudentAccuracyBySubject = (data: any) => {
    console.log(data);
  };
  return (
    <main className="my-gap-common">
      <div className="container">
        <div className="rounded-boxes bg-white">
          {report ? (
            <>
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">{report.name}</h3>
                <p className="section_sub_heading">{report.description}</p>
              </div>
              {paramMandatory.length > 0 && (
                <div className="report-mandatory my-3">
                  <h6>Mandatory</h6>
                  <div className="row">
                    {paramMandatory.map((p, index) => (
                      <div
                        className="col-lg-3 col-md-4 col-sm-6 col-12 mt-2"
                        key={index}
                      >
                        {p === "subject" && (
                          <div>
                            <span>Subject</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {subjects ? (
                                <Multiselect
                                  options={subjects}
                                  displayValue="name"
                                  onSelect={selectedSubjectChanged}
                                  onRemove={selectedSubjectChanged}
                                  selectedValues={params.subject}
                                  placeholder="Select Subjects"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "testseries" && (
                          <div>
                            <span>Test Series</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {testseries ? (
                                <Multiselect
                                  options={testseries}
                                  displayValue="name"
                                  onSelect={(item) =>
                                    setParams({
                                      ...params,
                                      testseries: item,
                                    })
                                  }
                                  onRemove={(item) =>
                                    setParams({
                                      ...params,
                                      testseries: item,
                                    })
                                  }
                                  selectedValues={params.testseries}
                                  placeholder="Select a Test Series"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "center" && (
                          <div>
                            <span>Center</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {locations ? (
                                <Multiselect
                                  options={locations}
                                  displayValue="name"
                                  onSelect={selectedLocationChanged}
                                  onRemove={selectedLocationChanged}
                                  selectedValues={params.center}
                                  placeholder="Select a center"
                                  singleSelect={true}
                                  //className='report-multi'
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "course" && (
                          <div>
                            <span>Course</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {courses ? (
                                <Multiselect
                                  className="report-multi"
                                  options={courses}
                                  displayValue="title"
                                  onSelect={(e) => loadClassroom(e)}
                                  onRemove={(e) => loadClassroom(e, true)}
                                  selectedValues={params.course}
                                  placeholder="Select a Course"
                                  singleSelect={true}
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "test" && (
                          <div>
                            <span>Assessment</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {tests ? (
                                <Multiselect
                                  options={tests}
                                  displayValue="name"
                                  onSelect={(e) => {
                                    setParams({
                                      ...params,
                                      test: e,
                                    });
                                  }}
                                  onRemove={(e) => {
                                    setParams({
                                      ...params,
                                      test: e,
                                    });
                                  }}
                                  selectedValues={params.test}
                                  placeholder="Select a Course"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {p === "mentor" && (
                          <div>
                            <span>Mentor</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <Multiselect
                                options={mentors}
                                displayValue="name"
                                onSelect={(e) => {
                                  setParams({
                                    ...params,
                                    mentor: e,
                                  });
                                }}
                                onRemove={(e) => {
                                  setParams({
                                    ...params,
                                    mentor: e,
                                  });
                                }}
                                selectedValues={params.mentor}
                                placeholder="Select a mentor"
                                avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                              />
                            </div>
                          </div>
                        )}
                        {p === "passingYear" && (
                          <div>
                            <span>Passing Year</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {passingYears ? (
                                <Multiselect
                                  options={passingYears}
                                  displayValue="name"
                                  onSelect={(e) => {
                                    setParams({
                                      ...params,
                                      passingYear: e,
                                    });
                                  }}
                                  onRemove={(e) => {
                                    setParams({
                                      ...params,
                                      passingYear: e,
                                    });
                                  }}
                                  selectedValues={params.passingYear}
                                  placeholder="Select a year"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {p === "classroom" && (
                          <div>
                            <span>Classroom</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <Multiselect
                                options={classrooms}
                                displayValue="name"
                                onSelect={(e) => {
                                  setParams({
                                    ...params,
                                    classroom: e,
                                  });
                                }}
                                onRemove={(e) => {
                                  setParams({
                                    ...params,
                                    classroom: e,
                                  });
                                }}
                                selectedValues={params.classroom}
                                placeholder="Select a classroom"
                                avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                              />
                            </div>
                          </div>
                        )}
                        {p === "personality" && (
                          <div>
                            <span>Personality</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <Multiselect
                                options={personality}
                                displayValue="name"
                                onSelect={(e) => {
                                  setParams({
                                    ...params,
                                    personality: e,
                                  });
                                }}
                                onRemove={(e) => {
                                  setParams({
                                    ...params,
                                    personality: e,
                                  });
                                }}
                                selectedValues={params.personality}
                                placeholder="Select a personality"
                                avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                              />
                            </div>
                          </div>
                        )}
                        {p === "startDate" && (
                          <div>
                            <span>Start Date</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <p className="input-group datepicker-box border-bottom rounded-0">
                                <DatePicker
                                  className="form-control"
                                  selected={startDate || null}
                                  onChange={(date) => setStartDate(date)}
                                  dateFormat="dd-MM-yyyy "
                                  placeholderText="Enter Start date"
                                  popperPlacement="bottom-start"
                                  popperModifiers={{
                                    preventOverflow: {
                                      enabled: true,
                                      escapeWithReference: false,
                                      boundariesElement: "viewport",
                                    },
                                  }}
                                />
                              </p>
                            </div>
                          </div>
                        )}
                        {p === "endDate" && (
                          <div>
                            <span>End Date</span>
                            <div className="mt-1">
                              <p className="input-group datepicker-box border-bottom rounded-0">
                                <DatePicker
                                  className="form-control"
                                  selected={endDate || null}
                                  onChange={(date) => setEndDate(date)}
                                  dateFormat="dd-MM-yyyy "
                                  placeholderText="Enter End date"
                                  popperPlacement="bottom-start"
                                  popperModifiers={{
                                    preventOverflow: {
                                      enabled: true,
                                      escapeWithReference: false,
                                      boundariesElement: "viewport",
                                    },
                                  }}
                                />
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {paramOptional.length > 0 && (
                <div className="report-optional my-3">
                  <h6>Optional</h6>
                  <div className="row">
                    {paramOptional.map((p, index) => (
                      <div
                        className="col-lg-3 col-md-4 col-sm-6 col-12 mt-2"
                        key={index}
                      >
                        {p === "subject" && (
                          <div>
                            <span>Subject</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {subjects ? (
                                <Multiselect
                                  options={subjects}
                                  displayValue="name"
                                  onSelect={selectedSubjectChanged}
                                  onRemove={selectedSubjectChanged}
                                  selectedValues={params.subject}
                                  placeholder="Select Subjects"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "testseries" && (
                          <div>
                            <span>Test Series</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {testseries ? (
                                <Multiselect
                                  options={testseries}
                                  displayValue="name"
                                  onSelect={(item) =>
                                    setParams({
                                      ...params,
                                      testseries: item,
                                    })
                                  }
                                  onRemove={(item) =>
                                    setParams({
                                      ...params,
                                      testseries: item,
                                    })
                                  }
                                  selectedValues={params.testseries}
                                  placeholder="Select a Test Series"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "center" && (
                          <div>
                            <span>Center</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {locations ? (
                                <Multiselect
                                  options={locations}
                                  displayValue="name"
                                  onSelect={selectedLocationChanged}
                                  onRemove={selectedLocationChanged}
                                  selectedValues={params.center}
                                  placeholder="Select a center"
                                  singleSelect={true}
                                  showCheckbox={true}
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "course" && (
                          <div>
                            <span>Course</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {courses ? (
                                <Multiselect
                                  // className="multiSelectLocCls"
                                  options={courses}
                                  displayValue="title"
                                  onSelect={(e) => loadClassroom(e)}
                                  onRemove={(e) => loadClassroom(e, true)}
                                  selectedValues={params.course}
                                  placeholder="Select a Course"
                                  singleSelect={true}
                                  showCheckbox={true}
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}
                        {p === "test" && (
                          <div>
                            <span>Assessment</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {tests ? (
                                <Multiselect
                                  options={tests}
                                  displayValue="name"
                                  onSelect={(e) => {
                                    setParams({
                                      ...params,
                                      test: e,
                                    });
                                  }}
                                  onRemove={(e) => {
                                    setParams({
                                      ...params,
                                      test: e,
                                    });
                                  }}
                                  selectedValues={params.test}
                                  placeholder="Select a Course"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {p === "mentor" && (
                          <div>
                            <span>Mentor</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <Multiselect
                                options={mentors}
                                displayValue="name"
                                onSelect={(e) => {
                                  setParams({
                                    ...params,
                                    mentor: e,
                                  });
                                }}
                                onRemove={(e) => {
                                  setParams({
                                    ...params,
                                    mentor: e,
                                  });
                                }}
                                selectedValues={params.mentor}
                                placeholder="Select a mentor"
                                avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                              />
                            </div>
                          </div>
                        )}
                        {p === "passingYear" && (
                          <div>
                            <span>Passing Year</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              {passingYears ? (
                                <Multiselect
                                  options={passingYears}
                                  displayValue="name"
                                  onSelect={(e) => {
                                    setParams({
                                      ...params,
                                      passingYear: e,
                                    });
                                  }}
                                  onRemove={(e) => {
                                    setParams({
                                      ...params,
                                      passingYear: e,
                                    });
                                  }}
                                  selectedValues={params.passingYear}
                                  placeholder="Select a year"
                                  avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                                />
                              ) : (
                                <SkeletonLoaderComponent
                                  Cwidth="100"
                                  Cheight="35"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {p === "classroom" && (
                          <div>
                            <span>Classroom</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <Multiselect
                                options={classrooms}
                                displayValue="name"
                                onSelect={(e) => {
                                  setParams({
                                    ...params,
                                    classroom: e,
                                  });
                                }}
                                onRemove={(e) => {
                                  setParams({
                                    ...params,
                                    classroom: e,
                                  });
                                }}
                                selectedValues={params.classroom}
                                placeholder="Select a classroom"
                                avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                              />
                            </div>
                          </div>
                        )}
                        {p === "personality" && (
                          <div>
                            <span>Personality</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <Multiselect
                                options={personality}
                                displayValue="name"
                                onSelect={(e) => {
                                  setParams({
                                    ...params,
                                    personality: e,
                                  });
                                }}
                                onRemove={(e) => {
                                  setParams({
                                    ...params,
                                    personality: e,
                                  });
                                }}
                                selectedValues={params.personality}
                                placeholder="Select a personality"
                                avoidHighlightFirstOption
                                  style={{
                                    chips: {
                                      background: '#A7E2F2',
                                      color: 'black'
                                    },
                                  }}
                              />
                            </div>
                          </div>
                        )}
                        {p === "startDate" && (
                          <div>
                            <span>Start Date</span>
                            <div
                              className="mt-1 LibraryChange_new"
                              style={{
                                borderRadius: "7px",
                                border: "1px solid black",
                              }}
                            >
                              <p className="input-group datepicker-box border-bottom rounded-0">
                                <DatePicker
                                  className="form-control"
                                  selected={startDate || null}
                                  onChange={(date) => setStartDate(date)}
                                  dateFormat="dd-MM-yyyy "
                                  placeholderText="Enter Start date"
                                  popperPlacement="bottom-start"
                                  popperModifiers={{
                                    preventOverflow: {
                                      enabled: true,
                                      escapeWithReference: false,
                                      boundariesElement: "viewport",
                                    },
                                  }}
                                />
                              </p>
                            </div>
                          </div>
                        )}
                        {p === "endDate" && (
                          <div>
                            <span>End Date</span>
                            <div className="mt-1">
                              <p className="input-group datepicker-box border-bottom rounded-0">
                                <DatePicker
                                  className="form-control"
                                  selected={endDate || null}
                                  onChange={(date) => setEndDate(date)}
                                  dateFormat="dd-MM-yyyy "
                                  placeholderText="Enter End date"
                                  popperPlacement="bottom-start"
                                  popperModifiers={{
                                    preventOverflow: {
                                      enabled: true,
                                      escapeWithReference: false,
                                      boundariesElement: "viewport",
                                    },
                                  }}
                                />
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-right mt-4">
                {report.canView && (
                  <button className="btn btn-outline" onClick={view}>
                    View
                  </button>
                )}
                {report.canDownload && (
                  <button className="btn btn-primary ml-2" onClick={download}>
                    Download
                  </button>
                )}
              </div>
              <div>
                {showChart && (
                  <div className="mt-5 shadow">
                    <Chart
                      options={chartOptions.options}
                      series={chartOptions.series}
                      type={chartOptions.chart.type} // Specify the type of chart if needed
                      height={chartOptions.chart.height} // Specify the height of the chart if needed
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <SkeletonLoaderComponent Cwidth="100" Cheight="36" />
              <div className="mt-3">
                <SkeletonLoaderComponent Cwidth="100" Cheight="14" />
              </div>
              <div className="mt-3">
                <SkeletonLoaderComponent Cwidth="100" Cheight="80" />
              </div>
              <div className="mt-2">
                <SkeletonLoaderComponent Cwidth="100" Cheight="80" />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
