"use client";
import { useEffect, useState } from "react";
import * as directorService from "@/services/directorService";
import * as settingService from "@/services/settingService";
import * as classroomSvc from "@/services/classroomService";
import * as userSvc from "@/services/userService";
import * as authSvc from "@/services/auth";
import * as subjectService from "@/services/subjectService";
import { useSession } from "next-auth/react";
import _ from "lodash";
import Chart from "react-apexcharts";
import moment from "moment";
import { firstValueFrom, forkJoin } from "rxjs";
import * as alertify from "alertifyjs";
import { Modal } from "react-bootstrap";
import Multiselect from "multiselect-react-dropdown";

export default function DirectorHome({ settings }: any) {
  const [calenderModal, setCalenderModal] = useState<boolean>(false);
  const [loginTrendchartOptions, setLoginTrendchartOptions] = useState<any>({
    series: [
      {
        data: [],
      },
    ],
    options: {
      chart: {
        type: "line",
        height: 300,
      },
      dataLabels: {
        enabled: false,

        formatter: (val, opt) => {
          return val;
        },
      },
      xaxis: {
        type: "category",
        categories: [],
        labels: {
          show: true,
        },
        title: {
          text: "Days",
        },
      },
      yaxis: {
        title: {
          text: "Student Count",
        },
        labels: {
          formatter: function (val) {
            return val.toFixed(0);
          },
        },
      },
      fill: {
        opacity: 1,
      },
    },
  });

  const [postTrendchartOptions, setPpostTrendchartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "line",
        height: 300,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
          dataLabels: {
            orientation: "vertical",
            position: "center",
          },
        },
      },
      dataLabels: {
        enabled: false,

        formatter: (val, opt) => {
          return val;
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        type: "datetime",
        labels: {
          show: true,
        },
        title: {
          text: "Days",
        },
      },
      yaxis: {
        title: {
          text: "Posts",
        },
        labels: {
          formatter: function (val) {
            return val.toFixed(0);
          },
        },
      },
      fill: {
        opacity: 1,
      },
    },
  });

  const [courseUltilizationChartOptions, setCourseUltilizationChartOptions] =
    useState<any>({
      series: [],
      options: {
        chart: {
          type: "bar",
          height: 300,
          stacked: true,
        },
        legend: {
          show: true,
          position: "top",
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "40%",
            dataLabels: {
              orientation: "vertical",
              position: "center", // bottom/center/top
            },
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
          type: "category",
          categories: [],
          labels: {
            show: true,
            hideOverlappingLabels: false,
            trim: true,
          },
          title: {
            text: "Courses",
          },
        },
        yaxis: {
          title: {
            text: "Students",
          },
        },
        fill: {
          opacity: 1,
        },
      },
    });

  const [questionTrendchartOptions, setQuestionTrendchartOptions] =
    useState<any>({
      series: [],
      options: {
        chart: {
          type: "area",
          height: 300,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "50%",
            dataLabels: {
              orientation: "vertical",
              position: "center",
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val, opt) => {
            return val;
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          type: "category",
          categories: [],
          labels: {
            show: true,
          },
          title: {
            text: "Months",
          },
        },
        yaxis: {
          title: {
            text: "Questions",
          },
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            },
          },
        },
        fill: {
          opacity: 1,
        },
      },
    });

  const [attemptTrendchartOptions, setAttemptTrendchartOptions] = useState<any>(
    {
      series: [],
      options: {
        chart: {
          type: "line",
          height: 300,
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          type: "datetime",
          title: {
            text: "Days",
          },
        },
        yaxis: {
          title: {
            text: "Count",
          },
        },
        fill: {
          opacity: 1,
        },
      },
    }
  );

  const [abandonedTrendchartOptions, setAbandonedTrendchartOptions] =
    useState<any>({
      series: [],
      options: {
        chart: {
          type: "bar",
          height: 300,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "50%",
            dataLabels: {
              orientation: "vertical",
              position: "center",
            },
          },
        },
        dataLabels: {
          enabled: true,

          formatter: (val, opt) => {
            return val;
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          type: "category",
          categories: [],
          labels: {
            show: true,
          },
          title: {
            text: "Assessments",
          },
        },
        yaxis: {
          title: {
            text: "Abandoned Attempts",
          },
          min: 0,
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            },
          },
        },
        fill: {
          opacity: 1,
        },
      },
    });

  const [onboardingTrendchartOptions, setOnboardingTrendchartOptions] =
    useState<any>({
      series: [],
      options: {
        chart: {
          type: "donut",
          height: 300,
        },
        legend: {
          show: true,
          position: "bottom",
        },
        labels: ["Added", "Logged In"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    });

  const [
    onboardingTrendClassroomChartOptions,
    setOnboardingTrendClassroomChartOptions,
  ] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "donut",
        height: 300,
      },
      legend: {
        show: true,
        position: "bottom",
      },
      labels: ["Invited", "Joined"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  const [
    testseriesUltilizationChartOptions,
    setTestseriesUltilizationChartOptions,
  ] = useState<any>({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 300,
        stacked: true,
      },
      legend: {
        show: true,
        position: "top",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
          dataLabels: {
            orientation: "vertical",
            position: "center", // bottom/center/top
          },
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
        type: "category",
        categories: [],
        labels: {
          show: true,
          hideOverlappingLabels: false,
          trim: true,
        },
        title: {
          text: "Test Series",
        },
      },
      yaxis: {
        title: {
          text: "Students",
        },
        labels: {
          formatter: function (val) {
            return val.toFixed(0);
          },
        },
      },
      fill: {
        opacity: 1,
      },
    },
  });

  const [testSeriesSubject, setTestSeriesSubject] = useState<string>("");
  const [courseSubject, setCourseSubject] = useState<string>("");
  const [locationList, setLocationList] = useState<any>([]);
  const [week, setWeek] = useState<any>([]);
  const [currentDay, setCurrentDay] = useState<any>(new Date());
  const [eventsByDay, setEventsByDay] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [activeDate, setActiveDate] = useState<any>(null);
  const [eventLimit, setEventLimit] = useState<number>(3);
  const [summary, setSummary] = useState<any>({
    student: {
      count: 0,
      diff: 0,
    },
    teacher: {
      count: 0,
      diff: 0,
    },
    course: {
      count: 0,
      diff: 0,
    },
    attempt: {
      count: 0,
      diff: 0,
    },
    test: {
      count: 0,
      diff: 0,
    },
  });
  const [passingYears, setPassingYears] = useState<any>([]);
  const [selectedYear, setSelectedYear] = useState<any>("");
  const [loginTrends, setLoginTrends] = useState<any>({
    data: [],
    labels: [],
  });
  const [testSeriesTrends, setTestSeriesTrends] = useState<any>({
    students: [],
    avgTimes: [],
    labels: [],
  });

  const [questionAddedTrend, setQuestionAddedTrend] = useState<any>({
    data: [],
    labels: [],
  });

  const [attemptTrend, setAttemptTrend] = useState<any>({
    data: [],
    labels: [],
  });
  const [onboardingTrend, setOnboardingTrend] = useState<any>({
    data: [],
    labels: ["Attempted", "Login", "Never Login"],
  });
  const [courseUltilization, setCourseUltilization] = useState<any>({
    data: [],
    labels: [],
  });

  const [mostAttemptedStudents, setMostAttemptedStudents] = useState<any>([]);
  const [subjectList, setSubjectList] = useState<any>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const user: any = useSession()?.data?.user?.info || {};
  const [isEditEvent, setIsEditEvent] = useState<boolean>(false);
  const [event, setEvent] = useState<any>({
    title: "",
    startDate: "",
    endDate: "",
    summary: "",
    active: true,
    type: "",
    allDays: false,
    notifyDuration: 1,
    classroom: [],
    students: [],
    allStudents: true,
    schedule: {
      active: false,
      repeatEvery: "day",
      repeatOn: {
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thrusday: false,
        friday: false,
        saturday: false,
      },
      endDate: "",
    },
  });
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>(new Date());
  const [allCls, setAllCls] = useState<any>([]);
  const [locationDropdownSettings, setLocationDropdownSettings] = useState<any>(
    {
      singleSelection: false,
      textField: "name",
      idField: "_id",
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false,
    }
  );

  useEffect(() => {
    const getPassingYearUrl = settingService.findOne("masterdata");
    const getSubjectURL = subjectService.findAll();
    // this.getWeekDays()
    // settingService.findOne("masterdata").then((getPassingYearUrl) => {});

    forkJoin([getPassingYearUrl, getSubjectURL]).subscribe(
      ([master, subjects]) => {
        setSubjectList(subjects);
        setTestSeriesSubject(subjects[0]._id);
        setCourseSubject(subjects[0]._id);
        let passing_tmp: any = [];
        master["passingYear"].forEach((s) => {
          passing_tmp.push(s.name);
        });
        setPassingYears(passing_tmp);
        const tmp_selectedYear = new Date().getFullYear();
        setSelectedYear(tmp_selectedYear);
        console.log(tmp_selectedYear, "master");

        loadGraphsData(tmp_selectedYear);
      }
    );
  }, []);

  const loadGraphsData = (year?: any) => {
    if (!year) {
      year = selectedYear;
    }
    directorService
      .getDashboardSummary(user?.activeLocation, { passingYear: year })
      .then((res) => {
        setSummary(res);
      });
    directorService.getLoginTrend({ passingYear: year }).then((res: any[]) => {
      setTimeout(() => {
        if (!res) {
          setLoginTrends([]);
          setLoginTrendchartOptions({
            ...loginTrendchartOptions,
            series: [],
            options: {
              ...loginTrendchartOptions.options,
              xaxis: {
                ...loginTrendchartOptions.options.xaxis,
                categories: [],
              },
            },
          });
        } else {
          setLoginTrends(res);

          const cat = [];
          const data = [];
          for (const d of res) {
            cat.push(d.day);
            data.push({ x: d.day, y: d.count });
          }
          setLoginTrendchartOptions({
            ...loginTrendchartOptions,
            series: [{ data: data }],
          });
        }
      }, 1000);
    });

    directorService
      .getTestseriesUltilization({ passingYear: year, days: 90 })
      .then((res) => {
        setTestSeriesTrends(res);

        const cat = [];
        const s1 = [];
        const s2 = [];
        for (const ts of res) {
          cat.push(ts.title);
          s1.push(ts.attemptedStudents);
          s2.push(ts.totalStudents - ts.attemptedStudents);
        }

        setTimeout(() => {
          setTestseriesUltilizationChartOptions({
            ...testseriesUltilizationChartOptions,
            series: [
              {
                name: "Attempted Students",
                data: s1,
              },
              {
                name: "Inactive Students",
                data: s2,
              },
            ],
            options: {
              ...testseriesUltilizationChartOptions.options,
              xaxis: {
                ...testseriesUltilizationChartOptions.options.xaxis,
                categories: cat,
              },
            },
          });
        }, 300);
      });

    directorService
      .getCourseUltilization({ passingYear: year, days: 90 })
      .then((coursesUlti: any[]) => {
        setCourseUltilization(coursesUlti);
        const cat = [];
        const s1 = [];
        const s2 = [];

        for (const course of coursesUlti) {
          cat.push(course.title);
          s1.push(course.attemptedStudents);
          s2.push(course.totalStudents - course.attemptedStudents);
        }
        setCourseUltilizationChartOptions({
          ...courseUltilizationChartOptions,
          series: [
            {
              name: "Attempted Students",
              data: s1,
            },
            {
              name: "Inactive Students",
              data: s2,
            },
          ],
          options: {
            ...courseUltilizationChartOptions.options,
            xaxis: {
              ...courseUltilizationChartOptions.options.xaxis,
              categories: cat,
            },
          },
        });
      });
    directorService
      .getAttemptTrend({ passingYear: year, days: 90 })
      .then((res: any[]) => {
        setAttemptTrend(res);
        if (res) {
          const studentData = [];
          const attemptData = [];
          for (const d of res) {
            studentData.push({
              x: d.date,
              y: d.students,
            });
            attemptData.push({
              x: d.date,
              y: d.attempts,
            });
          }
          setAttemptTrendchartOptions({
            ...attemptTrendchartOptions,
            series: [
              {
                name: "Students Count",
                data: studentData,
              },
              {
                name: "Attempts Count",
                data: attemptData,
              },
            ],
          });
        }
      });

    directorService
      .getAbandondAttemptTrend({ passingYear: year, days: 90 })
      .then((tests: any[]) => {
        const cat = [];
        const data = [];
        if (tests) {
          for (const t of tests) {
            data.push(t.count);
            cat.push(t.title);
          }
        }

        setAbandonedTrendchartOptions({
          ...abandonedTrendchartOptions,
          series: [{ data: data }],
          options: {
            ...abandonedTrendchartOptions.options,
            xaxis: {
              ...abandonedTrendchartOptions.options.xaxis,
              categories: cat,
            },
          },
        });
      });

    directorService
      .getStudentOnboardingDistribution({ passingYear: year })
      .then((res: any) => {
        if (res) {
          setOnboardingTrendchartOptions({
            ...onboardingTrendchartOptions,
            series: [res.location.added, res.location.loggedIn],
          });
          setOnboardingTrendClassroomChartOptions({
            ...onboardingTrendClassroomChartOptions,
            series: [res.classrooms.invited, res.classrooms.joined],
          });
        } else {
          setOnboardingTrendchartOptions({
            ...onboardingTrendchartOptions,
            series: [0, 0],
          });
          setOnboardingTrendClassroomChartOptions({
            ...onboardingTrendClassroomChartOptions,
            series: [0, 0],
          });
        }
      });
    directorService
      .getMostAttemptedStudent({ passingYear: year })
      .then((res) => {
        setMostAttemptedStudents(res);
      });

    //issue

    directorService.getPostTrend({ passingYear: year }).then((res: any) => {
      if (res) {
        const studentData = [];
        const teacherData = [];
        for (const d of res) {
          studentData.push({
            x: d.date,
            y: d.students,
          });
          teacherData.push({
            x: d.date,
            y: d.teachers,
          });
        }
        setPpostTrendchartOptions({
          ...postTrendchartOptions,
          series: [
            {
              name: "Students",
              data: studentData,
            },
            {
              name: "Teachers",
              data: teacherData,
            },
          ],
        });
      }
    });
    directorService
      .getQuestionAddedTrend(user?.activeLocation, {
        passingYear: year,
      })
      .then((res) => {
        if (res) {
          setQuestionAddedTrend(res);
          setTotalQuestions(_.sum(res["data"]));
          const series = [{ data: res["data"] }];
          const xaxis = {
            type: "category",
            categories: res["labels"].map((e) => e.date),
            labels: {
              show: true,
            },
            title: {
              text: "Months",
            },
          };

          setQuestionTrendchartOptions({
            ...questionTrendchartOptions,
            series: series,
            options: {
              ...questionTrendchartOptions.options,
              xaxis: xaxis,
            },
          });
        }
      });
  };

  const getWeekDays = () => {
    const current = new Date();
    setWeek([]);
    // Starting Monday not Sunday
    current.setDate(current.getDate() - current.getDay() + 1);
    const tmp_week = week;
    for (let i = 0; i < 7; i++) {
      tmp_week.push(new Date(current));
      setWeek(tmp_week);
      current.setDate(current.getDate() + 1);
    }
    userSvc
      .getEvents({
        timezoneOffset: new Date().getTimezoneOffset(),
        startDate: moment(tmp_week[0]).startOf("day").toISOString(),
        endDate: moment(tmp_week[6]).endOf("day").toISOString(),
        excludeCourse: true,
      })
      .subscribe((res: any) => {
        const unique = res.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t._id === value._id &&
                new Date(t.startDate).getDate() ===
                  new Date(value.startDate).getDate()
            )
        );

        setTimeout(() => {
          setEvents(unique);
          getDayEvents(new Date());
        });
      });
  };

  const getDayEvents = (item) => {
    setActiveDate(item);
    const tmp_eventsByDay = events.filter(
      (d) =>
        new Date(d.startDate).getDate() <= item.getDate() &&
        new Date(d.endDate).getDate() >= item.getDate()
    );
    setEventsByDay(tmp_eventsByDay);
  };

  const checkType = (type, day) => {
    const result = events.find(
      (d) =>
        d.type == type &&
        new Date(d.startDate).getDate() <= day.getDate() &&
        new Date(d.endDate).getDate() >= day.getDate()
    );
    return !!result;
  };

  const newEvent = async (template: any) => {
    if (!allCls.length) {
      const tmp_allCls = await classroomSvc.getClassRoomByLocation([
        user?.activeLocation,
      ]);
      setAllCls(tmp_allCls);
    }
    // this.modalClsRef = this.modalService.show(template, { class: 'modal-md' });
  };

  const addEvents = (tab) => {
    if (!event.title) {
      alertify.alert("Message", "Please add the title to the event");
      return;
    }
    if (!event.type) {
      alertify.alert("Message", "Please add the type to the event");
      return;
    }
    if (!event.startDate) {
      alertify.alert("Message", "Please add the start date to the event");
      return;
    }
    if (!event.endDate) {
      alertify.alert("Message", "Please add the end date to the event");
      return;
    }
    if (
      new Date(event.startDate).getTime() > new Date(event.endDate).getTime()
    ) {
      alertify.alert("Message", "End Date should be greater than Start Date");
      return;
    }
    if (event.schedule && event.schedule.active && !event.schedule.endDate) {
      alertify.alert("Message", "Please add the end date for the schedule");
      return;
    }
    const d = event.students.map((e) => e.value);
    const data = { ...event, students: d };
    userSvc
      .addEvents(data)
      .then((d) => {
        getWeekDays();
        alertify.success("Added successfully");
        cancel();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const changeExpireDate = () => {
    setMaxDate(new Date(event.startDate));
  };

  const updateEvents = () => {
    if (!event.title) {
      alertify.alert("Message", "Please add the title to the event");
      return;
    }
    if (!event.type) {
      alertify.alert("Message", "Please add the type to the event");
      return;
    }
    if (!event.startDate) {
      alertify.alert("Message", "Please add the start date to the event");
      return;
    }
    if (!event.endDate) {
      alertify.alert("Message", "Please add the end date to the event");
      return;
    }
    if (
      new Date(event.startDate).getTime() > new Date(event.endDate).getTime()
    ) {
      alertify.alert(
        "Message",
        "Start Date should be greater than End Date !!"
      );
      return;
    }
    if (event.schedule && event.schedule.active && !event.schedule.endDate) {
      alertify.alert("Message", "Please add the end date for the schedule");
      return;
    }

    const d = event.students.map((e) => e.value);
    const data = { ...event, students: d };
    userSvc
      .updateEvent(event["_id"], data)
      .then((d) => {
        getWeekDays();
        alertify.success("Successfully updated");
        cancel();
      })
      .catch((err) => {
        alertify.alert("Message", err.error);
        cancel();
      });
  };

  const cancel = () => {
    setEvent({
      title: "",
      startDate: "",
      endDate: "",
      summary: "",
      active: true,
      type: "",
      allDays: false,
      allStudents: false,
      notifyDuration: 1,
      classroom: [],
      students: [],
      schedule: {
        active: false,
        repeatEvery: "month",
        repeatOn: {
          sunday: false,
          monday: false,
          tuesday: false,
          wednesday: false,
          thrusday: false,
          friday: false,
          saturday: false,
        },
        endDate: "",
      },
    });
    setIsEditEvent(false);
    // this.modalClsRef.hide()
  };

  const clearStartDate = () => {
    setEvent({
      startDate: "",
    });
  };

  const clearEndDate = () => {
    setEvent({
      endDate: "",
    });
  };

  const editEvent = async (ev, template: any) => {
    setIsEditEvent(true);

    if (!allCls.length) {
      const tmp_allCls = await classroomSvc.getClassRoomByLocation([
        user?.activeLocation,
      ]);
      setAllCls(tmp_allCls);
    }

    if (ev.classroom && ev.classroom.length) {
      ev.classroom.forEach((e, j) => {
        const index = allCls.findIndex((c) => c._id == e);
        ev.classroom[j] = allCls[index];
      });
    }
    setEvent(ev);

    // this.modalClsRef = this.modalService.show(template, { class: 'modal-md' });
  };

  const deleteEvent = (id) => {
    alertify.confirm("Are you sure you want to delete this event?", (msg) => {
      userSvc
        .deleteEvent(id)
        .then((d) => {
          getWeekDays();
          alertify.success("Successfully deleted");
        })
        .catch((err) => {
          alertify.alert("Message", "Unable to delete. Please try again later");
        });
    });
  };

  const onRepeatChang = () => {
    setEvent((prevEvent) => {
      const updatedRepeatOn = { ...prevEvent.schedule.repeatOn };

      for (const k in updatedRepeatOn) {
        if (Object.prototype.hasOwnProperty.call(updatedRepeatOn, k)) {
          updatedRepeatOn[k] = false;
        }
      }

      return {
        ...prevEvent,
        schedule: {
          ...prevEvent.schedule,
          repeatOn: updatedRepeatOn,
        },
      };
    });
  };

  const onRepeatDayChange = (day, $event) => {
    // only allow single select if repeatEvery not 'day'
    if (
      event.schedule.repeatEvery &&
      event.schedule.repeatEvery != "day" &&
      $event
    ) {
      setTimeout(() => {
        setEvent((prevEvent) => {
          const updatedRepeatOn = { ...prevEvent.schedule.repeatOn };

          for (const k in updatedRepeatOn) {
            if (Object.prototype.hasOwnProperty.call(updatedRepeatOn, k)) {
              updatedRepeatOn[k] = day;
            }
          }

          return {
            ...prevEvent,
            schedule: {
              ...prevEvent.schedule,
              repeatOn: updatedRepeatOn,
            },
          };
        });
      }, 100);
    }
  };

  console.log(attemptTrendchartOptions, "attemptTrendchartOptions");

  return (
    <>
      <main className="p-0">
        <div className="container">
          <section className="admin-top-area-common">
            <div className="container d-flex justify-content-between">
              <div>
                <h6 className="title">Dashboard</h6>
                <span className="subtitle">Welcome back, {user?.name}</span>
              </div>

              <div className="filter-area clearfix mb-3 mw-100">
                <div className="filter-item ml-2" style={{ color: "black" }}>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      loadGraphsData(e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Select Year
                    </option>
                    {passingYears?.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
          <div className="bg-white overall-main">
            <div className="row">
              <div className="col-lg col-6">
                <div className="data_ana_box">
                  <p className="admin-head-dir1 overall-head">TOTAL STUDENTS</p>
                  <div className="mid_contents">
                    <div className="admin-head-dir big_num">
                      {summary?.student?.count}
                    </div>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small>{summary?.student?.diff}</small>
                    </div>
                  </div>
                  <p className="bottom_info_text">* in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-6">
                <div className="data_ana_box">
                  <p className="admin-head-dir1 overall-head">TOTAL TEACHERS</p>
                  <div className="mid_contents">
                    <div className="admin-head-dir big_num">
                      {summary?.teacher?.count}
                    </div>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small>{summary?.teacher?.diff}</small>
                    </div>
                  </div>
                  <p className="bottom_info_text">* in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-6">
                <div className="data_ana_box">
                  <p className="admin-head-dir1 overall-head">TOTAL COURSES</p>
                  <div className="mid_contents">
                    <div className="admin-head-dir big_num">
                      {summary?.course?.count}
                    </div>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small>{summary?.course?.diff}</small>
                    </div>
                  </div>
                  <p className="bottom_info_text">* in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-6">
                <div className="data_ana_box">
                  <p className="admin-head-dir1 overall-head">TOTAL ATTEMPTS</p>
                  <div className="mid_contents">
                    <div className="admin-head-dir big_num">
                      {summary?.attempt?.count}
                    </div>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small>{summary?.attempt?.diff}</small>
                    </div>
                  </div>
                  <p className="bottom_info_text">* in last 15 days</p>
                </div>
              </div>
              <div className="col-lg col-12">
                <div className="data_ana_box">
                  <p className="admin-head-dir1 overall-head">LIVE TEST</p>
                  <div className="mid_contents">
                    <div className="admin-head-dir big_num">
                      {summary?.test?.count}
                    </div>
                    <div className="over3 d-flex justify-content-center">
                      <span className="material-icons">arrow_drop_up</span>
                      <small>{summary?.test?.diff}</small>
                    </div>
                  </div>
                  <p className="bottom_info_text">* in last 15 days</p>
                </div>
              </div>
            </div>
            <div className="row mb-lg-4">
              {/* Login Trend Chart Section */}
              <div className="col-lg-6">
                <div className="chart_boxes admin-box2 h-lg-100">
                  <div className="admin-header">
                    <span className="admin-head">Login Trend</span>
                    <p className="admin-head2">
                      Daily count of student logins over the past 30 days to
                      track engagement and participation.
                    </p>
                  </div>
                  <div className="chart_area_body">
                    {loginTrends && loginTrends.length ? (
                      <Chart
                        options={loginTrendchartOptions.options}
                        series={loginTrendchartOptions.series}
                        type={loginTrendchartOptions.options.chart.type}
                        height={loginTrendchartOptions.options.chart.height}
                      />
                    ) : (
                      <div className="text-center">
                        <img
                          className="mx-auto"
                          src="/assets/images/empty-chart.svg"
                          alt="No data"
                        />
                        <h6 className="text-muted">No data yet</h6>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Onboarding Status Chart Section */}
              <div className="col-lg-6">
                <div className="chart_boxes admin-box2 h-lg-100">
                  <div className="admin-header">
                    <span className="admin-head">
                      Student Onboarding Status
                    </span>
                    <p className="admin-head2">
                      Breakdown of students who were invited or added on the
                      platform (Classroom or via User Management) - shows
                      whether they joined and are active.
                    </p>
                  </div>

                  <div className="chart_area_body">
                    {onboardingTrendchartOptions.series &&
                    onboardingTrendchartOptions.series.length ? (
                      <div className="row">
                        <div className="col">
                          <Chart
                            options={
                              onboardingTrendClassroomChartOptions.options
                            }
                            series={onboardingTrendClassroomChartOptions.series}
                            type={
                              onboardingTrendClassroomChartOptions.options.chart
                                .type
                            }
                            height={
                              onboardingTrendClassroomChartOptions.options.chart
                                .height
                            }
                          />
                        </div>
                        <div className="col">
                          <Chart
                            options={onboardingTrendchartOptions.options}
                            series={onboardingTrendchartOptions.series}
                            type={
                              onboardingTrendchartOptions.options.chart.type
                            }
                            height={
                              onboardingTrendchartOptions.options.chart.height
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <figure>
                          <img
                            src="/assets/images/no-data-board.svg"
                            className="m-auto"
                            alt="No data"
                          />
                        </figure>
                        <p className="text-center">No data yet!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-lg-3">
              <div className="col-lg-6">
                <div className="chart_boxes admin-box4 h-lg-100">
                  <div className="admin-header">
                    <span className="admin-head">Student Attempt Trend</span>
                    <p className="admin-head2">
                      Track the number of unique attempts with respect to the
                      number of active students in the last 90 days to
                      understand assessments in use.
                    </p>
                  </div>
                  <div className="chart_area_body">
                    {attemptTrend && attemptTrend.length ? (
                      <Chart
                        options={attemptTrendchartOptions.options}
                        series={attemptTrendchartOptions.series}
                        type="line"
                        height={300}
                      />
                    ) : (
                      <div className="chart_area_body text-center">
                        <img
                          className="mx-auto mt-4"
                          src="/assets/images/empty-chart.svg"
                          style={{ width: "200px" }}
                          alt="No data"
                        />
                        <h6 className="text-muted">No data yet</h6>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="chart_boxes admin-box4 h-lg-100">
                  <div className="admin-header">
                    <span className="admin-head">
                      Top 10 Most Abandoned Assessments
                    </span>
                    <p className="admin-head2">
                      Assessment with the highest number of abandoned attempts
                      in the past 90 days.
                    </p>
                  </div>
                  <div className="chart_area_body">
                    {abandonedTrendchartOptions.series[0]?.data.length ? (
                      <Chart
                        options={abandonedTrendchartOptions.options}
                        series={abandonedTrendchartOptions.series}
                        type={abandonedTrendchartOptions.options.chart.type}
                        height={300}
                      />
                    ) : (
                      <div className="chart_area_body text-center">
                        <img
                          className="mx-auto mt-4"
                          src="/assets/images/empty-chart.svg"
                          style={{ width: "200px" }}
                          alt="No data"
                        />
                        <h6 className="text-muted">No data yet</h6>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <br></br>
            <div className="row mb-lg-3">
              {settings?.features?.testseries &&
                user?.primaryInstitute?.preferences?.testSeries.isShow && (
                  <div className="col-lg-6">
                    <div className="chart_boxes admin-box4">
                      <div className="admin-header">
                        <span className="admin-head">
                          Student Engagement in Test Series
                        </span>
                        <p className="admin-head2">
                          The ratio of number of student attempts and number of
                          students in each test series over the past 90 days.
                          This will give the count of students who are actually
                          attempting the test series.
                        </p>
                      </div>
                      <div className="chart_area_body filter-via-select">
                        {testseriesUltilizationChartOptions.series?.[0]?.data
                          .length > 0 ? (
                          <Chart
                            options={testseriesUltilizationChartOptions.options}
                            series={testseriesUltilizationChartOptions.series}
                            type={
                              testseriesUltilizationChartOptions.options.chart
                                .type
                            }
                            height={300}
                          />
                        ) : (
                          <div className="chart_area_body text-center">
                            <img
                              className="mx-auto mt-4"
                              src="/assets/images/empty-chart.svg"
                              style={{ width: "200px" }}
                              alt="No data"
                            />
                            <h6 className="text-muted">No data yet</h6>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {settings?.features?.course &&
                user?.primaryInstitute?.preferences?.course.isShow && (
                  <div className="col-lg-6">
                    <div className="chart_boxes admin-box2">
                      <div className="admin-header">
                        <span className="admin-head">Course Utilization</span>
                        <p className="admin-head2">
                          Number of student attempts vs number of students in
                          each course over the past 90 days.
                        </p>
                      </div>
                      <div className="chart_area_body filter-via-select">
                        {courseUltilization?.length ? (
                          <Chart
                            options={courseUltilizationChartOptions.options}
                            series={courseUltilizationChartOptions.series}
                            type={
                              courseUltilizationChartOptions.options.chart.type
                            }
                            height={300}
                          />
                        ) : (
                          <div className="chart_area_body text-center">
                            <img
                              className="mx-auto"
                              src="/assets/images/empty-chart.svg"
                              alt="No data"
                            />
                            <h6 className="text-muted">No data yet</h6>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <br></br>
            <div className="row mb-lg-3">
              <div className="col-lg-6">
                <div className="chart_boxes admin-box4 h-lg-100">
                  <div className="admin-header">
                    <span className="admin-head">
                      Question Content Development &#40;{totalQuestions}{" "}
                      questions&#41;
                    </span>
                    <p className="admin-head2">
                      Track the number of questions added each month, visually
                      representing your content contribution in your
                      institute/center.
                    </p>
                  </div>
                  <div className="chart_area_body">
                    {questionTrendchartOptions.series?.[0]?.data?.length > 0 ? (
                      <Chart
                        options={questionTrendchartOptions.options}
                        series={questionTrendchartOptions.series}
                        type={questionTrendchartOptions.options.chart.type}
                        height={300}
                      />
                    ) : (
                      <div className="chart_area_body text-center">
                        <img
                          className="mx-auto mt-4"
                          src="/assets/images/empty-chart.svg"
                          style={{ width: "200px" }}
                          alt="No data"
                        />
                        <h6 className="text-muted">No data yet</h6>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="chart_boxes admin-box4 h-lg-100">
                  <div className="admin-header">
                    <span className="admin-head">
                      Know your brand ambassadors
                    </span>
                    <p className="admin-head2">
                      Top 10 Most Active Students have made the most attempts
                      and used the most assessments in one year.
                    </p>
                  </div>

                  <div>
                    {mostAttemptedStudents?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table vertical-middle border-top-none border-bottom_yes mb-0">
                          {mostAttemptedStudents.map((item, index) => (
                            <tr key={index}>
                              <td className="pl-0">
                                <div className="d-flex align-items-center">
                                  <figure className="avatar_wrapper">
                                    {item?.user?.avatar?.length > 0 ? (
                                      <img
                                        className="avatar"
                                        src={item?.user?.avatar}
                                        alt=""
                                      />
                                    ) : (
                                      <img
                                        src="/assets/images/defaultProfile.png"
                                        alt="user-img"
                                      />
                                    )}
                                  </figure>
                                  <div className="admin-info2-dir ml-2">
                                    <h6
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "700",
                                      }}
                                    >
                                      {item?.name}
                                    </h6>
                                    <p>{item?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="admin-info3-dir">
                                  <h6
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {item?.attempts}
                                  </h6>
                                  <p>Attempts</p>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="admin-info3-dir">
                                  <h6
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {item?.tests}
                                  </h6>
                                  <p>Assessments</p>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </table>
                      </div>
                    ) : (
                      <div className="chart_area_body text-center">
                        <img
                          className="mx-auto mt-4"
                          src="/assets/images/empty-chart.svg"
                          style={{ width: "200px" }}
                          alt="No data"
                        />
                        <h6 className="text-muted">No data yet</h6>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <br></br>
            <div className="row">
              <div className="col-lg-6">
                <div className="chart_boxes admin-box4">
                  <div className="admin-header">
                    <span className="admin-head">
                      Communication &amp; Engagement
                    </span>
                    <p className="admin-head2">
                      Visualize the daily trends of posts by two groups of roles
                      (student and non-student) in the last 30 days. This graph
                      helps identify student and teacher engagement.
                    </p>
                  </div>
                  <div className="chart_area_body">
                    {postTrendchartOptions.series?.[0]?.data?.length > 0 ? (
                      <Chart
                        options={postTrendchartOptions.options}
                        series={postTrendchartOptions.series}
                        type={postTrendchartOptions.options.chart.type}
                        height={300}
                      />
                    ) : (
                      <div className="chart_area_body text-center">
                        <img
                          className="mx-auto mt-4"
                          src="/assets/images/empty-chart.svg"
                          style={{ width: "200px" }}
                          alt="No data"
                        />
                        <h6 className="text-muted">No data yet</h6>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        show={calenderModal}
        onHide={() => {
          setCalenderModal(false);
        }}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div className="modal-content form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            {!isEditEvent ? (
              <h4 className="form-box_title">Add Event</h4>
            ) : (
              <h4 className="form-box_title">Update Event</h4>
            )}
          </div>
          <div className="modal-body">
            <form
              className="form-with-icons"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="form-group">
                <input
                  type="text"
                  className="form-control border-bottom rounded-0"
                  placeholder="Title of your event"
                  value={event.title}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-row my-2">
                <div className="col-auto d-flex align-items-center">
                  <div className="container1 my-0">
                    <div className="radio my-0">
                      <input
                        type="radio"
                        value="holiday"
                        name="type"
                        id="holiday"
                        checked={event.type === "holiday"}
                        onChange={(e) => {
                          setEvent({
                            ...event,
                            type: e.target.value,
                          });
                        }}
                      />
                      <label
                        htmlFor="holiday"
                        className="my-0 translate-middle-y"
                      ></label>
                    </div>
                  </div>
                  <div className="rights my-0">Holiday</div>
                </div>
                <div className="col-auto d-flex align-items-center">
                  <div className="container1 my-0">
                    <div className="radio my-0">
                      <input
                        type="radio"
                        value="event"
                        name="type"
                        id="event"
                        checked={event.type === "event"}
                        onChange={(e) =>
                          setEvent({
                            ...event,
                            type: e.target.value,
                          })
                        }
                      />
                      <label
                        htmlFor="event"
                        className="my-0 translate-middle-y"
                      ></label>
                    </div>
                  </div>
                  <div className="rights my-0">Event</div>
                </div>
              </div>
              <div className="form-group mt-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="input-group datepicker-box border-bottom rounded-0">
                      <input
                        type="text"
                        name="startDate"
                        className="form-control"
                        placeholder="Enter start date"
                        value={event.startDate}
                        onChange={(e) => {
                          setEvent({
                            ...event,
                            startDate: e.target.value,
                          });
                        }}
                        readOnly
                      />
                      <span className="input-group-btn">
                        <span
                          className="btn btn-date"
                          onClick={() => {
                            /* Add toggle function here */
                          }}
                        >
                          <i className="far fa-calendar-alt"></i>
                        </span>
                      </span>
                    </p>
                  </div>
                  {event.startDate && (
                    <>
                      {/* Add your timepicker JSX here */}
                      <button className="btn" onClick={clearStartDate}>
                        <b>X</b>
                      </button>
                    </>
                  )}
                </div>

                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="input-group datepicker-box border-bottom rounded-0">
                      <input
                        type="text"
                        name="endDate"
                        className="form-control"
                        placeholder="Enter end date"
                        value={event.endDate}
                        onChange={(e) => {
                          setEvent({
                            ...event,
                            endDate: e.target.value,
                          });
                        }}
                        readOnly
                      />
                      <span className="input-group-btn">
                        <span
                          className="btn btn-date"
                          onClick={() => {
                            /* Add toggle function here */
                          }}
                        >
                          <i className="far fa-calendar-alt"></i>
                        </span>
                      </span>
                    </p>
                  </div>
                  {event.endDate && (
                    <>
                      {/* Add your timepicker JSX here */}
                      <button className="btn" onClick={clearEndDate}>
                        <b>X</b>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
