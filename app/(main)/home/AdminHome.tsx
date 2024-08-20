"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import * as dicussionSvc from "@/services/discussionService";
import * as feedbackSvc from "@/services/feedbackService";
import * as userSvc from "@/services/userService";
import * as sessionSvc from "@/services/SessionService";
import * as classroomSvc from "@/services/classroomService";
import * as locationSvc from "@/services/LocationService";
import * as adminSvc from "@/services/adminService";
import * as chatSvc from "@/services/chatService";
import moment from "moment";
import * as alertify from "alertifyjs";
import { useRouter } from "next/navigation";
import { firstValueFrom } from "rxjs";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { FileDrop } from "react-file-drop";
import MathJax from "@/components/assessment/mathjax";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Multiselect from "multiselect-react-dropdown";
import { TagsInput } from "react-tag-input-component";
import { avatar } from "@/lib/pipe";

import Link from "next/link";

export default function AdminHome({ settings }: any) {
  const fileBrowseRef = useRef(null);
  const datePickerRef = useRef(null);

  const user: any = useSession()?.data?.user?.info || {};
  const { push } = useRouter();
  const [eventsByDay, setEventsByDay] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [week, setWeek] = useState<any>([]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [eventLimit, setEventLimit] = useState<number>(5);
  const [sessions, setSessions] = useState<any>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [totalPendingFb, setTotalPendingFb] = useState<number>(0);
  const [pendingFeedbacks, setPendingFeedbacks] = useState<any>([]);
  const [fbParams, setFbParams] = useState<any>({
    page: 1,
    limit: 5,
  });
  const [totalFlaggedPosts, setTotalFlaggedPosts] = useState<number>(0);
  const [flaggedPosts, setFlaggedPosts] = useState<any>([]);
  const [fpParams, setFpParams] = useState<any>({
    page: 1,
    limit: 5,
  });
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
    location: null,
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
  const [calenderModal, setCalenderModal] = useState<boolean>(false);
  const [allLocs, setAllLocs] = useState<any>([]);
  const [allCls, setAllCls] = useState<any>([]);
  const dropdownSettings = {
    singleSelection: false,
    textField: "name",
    idField: "_id",
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: false,
  };
  const [loadedClasses, setLoadedClasses] = useState<any>({});

  useEffect(() => {
    getWeekDays();
    sessionSvc
      .getSessions({
        selectedSlot: new Date(),
      })
      .then((da: []) => {
        setSessions(da);
      });

    const fpp: any = { ...fpParams };
    fpp.count = true;
    dicussionSvc.getFlaggedPosts(fpp).then((res: any) => {
      setFlaggedPosts(res.posts);
      setTotalFlaggedPosts(res.count);
    });

    const fbp: any = { ...fbParams };
    fbp.count = true;
    feedbackSvc.getQuestionPendingResponses(fbp).then((res: any) => {
      setPendingFeedbacks(res.feedbacks);
      setTotalPendingFb(res.count);
    });
  }, []);

  const loadMoreFeedback = () => {
    setFbParams({
      ...fbParams,
      page: fbParams.page + 1,
    });
    const tmp_params = {
      ...fbParams,
      page: fbParams.page + 1,
    };
    feedbackSvc.getQuestionPendingResponses(tmp_params).then((res: any) => {
      setPendingFeedbacks((prevFeedbacks) =>
        prevFeedbacks.concat(res.feedbacks)
      );
    });
  };

  const loadMoreFlaggedPost = () => {
    setFpParams({
      ...fpParams,
      page: fpParams.page + 1,
    });
    const tmp_params = {
      ...fpParams,
      page: fpParams.page + 1,
    };
    dicussionSvc.getFlaggedPosts(tmp_params).then((res: any) => {
      setFlaggedPosts((prev) => prev.concat(res.posts));
    });
  };

  const getWeekDays = () => {
    const current = new Date();
    setWeek([]);
    // Starting Monday not Sunday
    current.setDate(current.getDate() - current.getDay() + 1);
    const tmp_week = [];
    for (let i = 0; i < 7; i++) {
      tmp_week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    setWeek(tmp_week);
    userSvc
      .getEvents({
        timezoneOffset: new Date().getTimezoneOffset(),
        startDate: moment(tmp_week[0]).startOf("day").toISOString(),
        endDate: moment(tmp_week[6]).endOf("day").toISOString(),
        excludeCourse: true,
      })
      .then((res: any) => {
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
          getDayEvents(new Date(), unique);
        });
      });
  };

  const getDayEvents = (item, eve?: any) => {
    if (!eve) {
      eve = events;
    }
    setActiveDate(item);
    setEventsByDay(
      eve.filter(
        (d) =>
          new Date(d.startDate).getDate() <= item.getDate() &&
          new Date(d.endDate).getDate() >= item.getDate()
      )
    );
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

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const uploadMappingFile = () => {
    if (uploadFile) {
      const formData: FormData = new FormData();
      formData.append("file", uploadFile, uploadFile.name);

      setUploading(true);
      adminSvc
        .uploadAssessmentClassroomMap(formData)
        .then((res: any) => {
          if (res.error.length > 0) {
            alertify.alert(
              "Message",
              `${res.testCount} assessments are added to ${
                res.classroomCount
              } classrooms. There are still some error:<br/>${res.error.join(
                "<br/>"
              )}`
            );
          } else {
            alertify.success(
              `${res.testCount} assessments are added to ${res.classroomCount} classrooms`
            );
          }
          setUploading(false);
          setUploadFile(null);
        })
        .catch((res) => {
          if (res.response.data.msg) {
            alertify.alert("Message", res.response.data.msg);
          } else {
            alertify.alert("Message", "Fail to map assessment and classroom.");
          }
        });
    }
  };

  const sendMessageToTeacher = (teacher) => {
    chatSvc
      .getRoom(user.activeLocation, teacher._id, teacher.name)
      .then((chatInstance: any) => {
        push(`/chat?id=${chatInstance.uid}`);
      })
      .catch((err) => {
        alertify.alert("Message", err.error);
      });
  };

  const track = (index, item) => {
    return item._id;
  };

  const showAllEvents = () => {
    setEventLimit(eventsByDay.length);
  };

  const cancelDocs = () => {
    setUploadFile(null);
  };

  const newEvent = async (template: any) => {
    if (!allLocs.length) {
      // this.allLocs = await firstValueFrom<any>(locationSvc.find())
      locationSvc.find().then((res) => {
        setAllLocs(res);
      });
    }
    // this.modalClsRef = this.modalService.show(template, { class: 'modal-md' });
    setCalenderModal(true);
  };

  const addEvents = (tab: any) => {
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
    if (event.schedule && event.schedule?.active && !event.schedule?.endDate) {
      alertify.alert("Message", "Please add the end date for the schedule");
      return;
    }
    const d = event.students.map((e) => e.value);
    const data = { ...event, students: d };
    userSvc.addEvents(data).then((d) => {
      getWeekDays();
      alertify.success("Added successfully");
      cancel();
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
    if (event.schedule && event.schedule?.active && !event.schedule?.endDate) {
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
      location: null,
    });

    setIsEditEvent(false);
    setCalenderModal(false);
  };

  const clearStartDate = () => {
    setEvent({
      ...event,
      startDate: "",
    });
  };

  const clearEndDate = () => {
    setEvent({
      ...event,
      endDate: "",
    });
  };

  const editEvent = async (ev, template: any) => {
    setIsEditEvent(true);
    if (!allLocs.length) {
      // this.allLocs = await firstValueFrom<any>(this.locationSvc.find())
      locationSvc.find().then((res) => {
        setAllLocs(res);
      });
    }

    if (ev.location) {
      if (!loadedClasses[ev.location]) {
        classroomSvc.getClassRoomByLocation([ev.location]).then((res) => {
          setLoadedClasses((prevLoadedClasses) => ({
            ...prevLoadedClasses,
            [ev.location]: res,
          }));
          setAllCls(loadedClasses[ev.location]);
        });
      }
    }
    if (ev.classroom && ev.classroom.length) {
      ev.classroom.forEach((e, j) => {
        const index = allCls.findIndex((c) => c._id == e);
        ev.classroom[j] = allCls[index];
      });
    }

    ev.startDate = new Date(ev.startDate);
    ev.endDate = new Date(ev.endDate);
    ev.schedule.endDate = new Date(ev.schedule.endDate);
    setEvent(ev);

    // this.modalClsRef = this.modalService.show(template, { class: "modal-md" });
    setCalenderModal(true);
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

  const onRepeatChange = (day) => {
    setEvent({
      ...event,
      schedule: {
        ...event.schedule,
        repeatEvery: day,
      },
    });
    for (const k in event.schedule?.repeatOn) {
      setEvent((prevEvent) => ({
        ...prevEvent,
        schedule: {
          ...prevEvent.schedule,
          repeatOn: {
            ...prevEvent.schedule.repeatOn,
            [k]: !prevEvent.schedule.repeatOn,
          },
        },
      }));
    }
  };

  const onRepeatDayChange = (day, ev) => {
    // only allow single select if repeatEvery not 'day'

    setEvent({
      ...event,
      schedule: {
        ...event.schedule,
        repeatOn: {
          ...event.schedule.repeatOn,
          day: !event.schedule.repeatOn.day,
        },
      },
    });
  };

  const onInstituteChange = (e: any) => {
    setEvent({
      ...event,
      location: e,
      classroom: [],
    });

    // if (!loadedClasses[e]) {
    // this.loadedClasses[this.event.location] = await firstValueFrom(this.classroomSvc.getClassRoomByLocation([this.event.location]))
    classroomSvc.getClassRoomByLocation([e]).then((res) => {
      setLoadedClasses({
        ...loadedClasses,
        [e]: res,
      });

      setAllCls(res);
    });
    // }
    // setEvent(updatedEvent);
  };

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  return (
    <>
      <main className="p-0 Admin_DashneW">
        <div className="container">
          <section className="admin-top-area-common">
            <div className="container">
              <h3 className="title">Dashboard</h3>
              {user && (
                <span className="subtitle">Welcome back, {user.name}</span>
              )}
            </div>
          </section>
          <div className="bg-white overall-main">
            <div className="row">
              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">people</span>
                    <h4 className="card-title-common ml-2">User</h4>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Manage all users on the platform
                    </p>
                    <div className="text-right mt-2">
                      <Link
                        className="btn btn-outline btn-sm"
                        href="/administration/user"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">article</span>
                    <h5 className="card-title-common ml-2">Program</h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Create and manage programs
                    </p>
                    <div className="text-right mt-2">
                      <Link
                        className="btn btn-outline btn-sm"
                        href="/administration/program"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">text_snippet</span>
                    <h5 className="card-title-common ml-2">Report</h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Manage all reports generated
                    </p>
                    <div className="text-right mt-2">
                      <Link
                        className="btn btn-outline btn-sm"
                        href="/administration/report"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">book</span>
                    <h5 className="card-title-common ml-2">Curriculum</h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Create and manage curriculums
                    </p>
                    <div className="text-right mt-2">
                      <Link
                        className="btn btn-outline btn-sm"
                        href="/administration/curriculum"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {settings?.features?.evaluation && (
                <div className="col-md-3">
                  <div className="card-common shadow border-0">
                    <div className="card-header-common d-flex align-items-center">
                      <span className="material-icons">text_snippet</span>
                      <h5 className="card-title-common ml-2">Evaluation</h5>
                    </div>
                    <div className="card-body-common">
                      <p className="card-text-common">
                        Populate all attempt to your evaluators
                      </p>
                      <div className="text-right mt-2">
                        <Link
                          className="btn btn-outline btn-sm"
                          href="/assign-evaluation"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">settings</span>
                    <h5 className="card-title-common ml-2">Instance Setting</h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Manage all instances settings
                    </p>
                    <div className="text-right mt-2">
                      <Link className="btn btn-outline btn-sm" href="/instance">
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">settings</span>
                    <h5 className="card-title-common ml-2">
                      Institute Setting
                    </h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Manage all institute settings
                    </p>
                    <div className="text-right mt-2">
                      <Link
                        className="btn btn-outline btn-sm"
                        href="/institute/home"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">article</span>
                    <h5 className="card-title-common ml-2">Educoins</h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Create and manage educoins
                    </p>
                    <div className="text-right mt-2">
                      <Link className="btn btn-outline btn-sm" href="/educoins">
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">article</span>
                    <h5 className="card-title-common ml-2">What&apos;s New</h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Create and manage What&apos;s New
                    </p>
                    <div className="text-right mt-2">
                      <Link className="btn btn-outline btn-sm" href="/news">
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card-common shadow border-0">
                  <div className="card-header-common d-flex align-items-center">
                    <span className="material-icons">article</span>
                    <h5 className="card-title-common ml-2">
                      Communication Template
                    </h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Manage emails and SMS sent from the system to users
                    </p>
                    <div className="text-right mt-2">
                      <Link
                        className="btn btn-outline btn-sm"
                        href="/mail-template"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="chart_boxes ">
                  <div className="admin-header">
                    <div className="row">
                      <div className="col">
                        <span className="admin-head">Session Management</span>
                        <p className="admin-head2">
                          To create or monitor a session.{" "}
                        </p>
                      </div>
                      <div className="col-auto">
                        <Link
                          className="btn btn-outline btn-sm"
                          href="/administration/session"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                  {sessions ? (
                    <div
                      className={`chart_area_body admin-box-info sessionWhiteboard1 ${
                        !sessions ? "loadingList" : ""
                      } ${
                        !settings?.features.whiteboard
                          ? "matching_height_lg"
                          : ""
                      } ${
                        !sessions || !sessions.length
                          ? "d-flex justify-content-center align-items-center"
                          : ""
                      }`}
                    >
                      {sessions.map((session, index) => (
                        <div
                          className="d-flex justify-content-between"
                          key={index}
                        >
                          <div className="sessiontitLe">{session.title}</div>
                          <div>
                            <div className="scheduleTime">
                              <div className="row">
                                <span className="material-icons">schedule</span>
                                <div className="admin-mat-head">
                                  {new Date(
                                    session.startDate
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {sessions.length === 0 && (
                        <div className="text-center">
                          <figure
                            style={{
                              transform: !settings?.features.whiteboard
                                ? "scale(1.5)"
                                : "scale(1)",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              data-name="Layer 1"
                              width="120.24724"
                              height="100.75431"
                              viewBox="0 0 699.24724 386.75431"
                              // xmlns:xlink="http://www.w3.org/1999/xlink"
                            >
                              <path
                                d="M736,678.63184H351a8.50982,8.50982,0,0,1-8.5-8.5V446a8.50951,8.50951,0,0,1,8.5-8.5H736a8.50982,8.50982,0,0,1,8.5,8.5V670.13184A8.51014,8.51014,0,0,1,736,678.63184Z"
                                transform="translate(-291 -347.24569)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M760,710H327V423.5a9.51081,9.51081,0,0,1,9.5-9.5h414a9.51081,9.51081,0,0,1,9.5,9.5Zm-431-2H758V423.5a7.5082,7.5082,0,0,0-7.5-7.5h-414a7.5082,7.5082,0,0,0-7.5,7.5Z"
                                transform="translate(-291 -347.24569)"
                                fill="#ccc"
                              />
                              <circle
                                cx="252.5"
                                cy="79.25431"
                                r="4"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M640,631.06641H447a8.50982,8.50982,0,0,1-8.5-8.5v-129a8.50981,8.50981,0,0,1,8.5-8.5H640a8.51013,8.51013,0,0,1,8.5,8.5v129A8.51014,8.51014,0,0,1,640,631.06641Z"
                                transform="translate(-291 -347.24569)"
                                fill="#fff"
                              />
                              <path
                                d="M478.75,540.06592a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,478.75,540.06592Z"
                                transform="translate(-291 -347.24569)"
                                fill="#ccc"
                              />
                              <path
                                d="M478.75,566.06592a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,478.75,566.06592Z"
                                transform="translate(-291 -347.24569)"
                                fill="#6c63ff"
                              />
                              <path
                                d="M478.75,592.06592a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,478.75,592.06592Z"
                                transform="translate(-291 -347.24569)"
                                fill="#6c63ff"
                              />
                              <path
                                d="M516.75,525.56592a6.5,6.5,0,0,0,0,13h93a6.5,6.5,0,0,0,0-13Z"
                                transform="translate(-291 -347.24569)"
                                fill="#ccc"
                              />
                              <path
                                d="M516.75,551.56592a6.5,6.5,0,0,0,0,13h93a6.5,6.5,0,0,0,0-13Z"
                                transform="translate(-291 -347.24569)"
                                fill="#6c63ff"
                              />
                              <path
                                d="M516.75,577.56592a6.5,6.5,0,0,0,0,13h93a6.5,6.5,0,0,0,0-13Z"
                                transform="translate(-291 -347.24569)"
                                fill="#6c63ff"
                              />
                              <polygon
                                points="663.288 375.328 651.03 375.122 645.991 327.743 664.083 328.047 663.288 375.328"
                                fill="#ffb8b8"
                              />
                              <path
                                d="M933.20767,718.79047h23.64388a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H918.32081a0,0,0,0,1,0,0v0A14.88685,14.88685,0,0,1,933.20767,718.79047Z"
                                transform="translate(-278.66498 -362.89709) rotate(0.96277)"
                                fill="#2f2e41"
                              />
                              <polygon
                                points="541.641 375.216 530.277 370.616 542.612 324.594 559.384 331.384 541.641 375.216"
                                fill="#ffb8b8"
                              />
                              <path
                                d="M811.361,712.42822H835.0049a0,0,0,0,1,0,0V727.3151a0,0,0,0,1,0,0H796.47418a0,0,0,0,1,0,0v0A14.88687,14.88687,0,0,1,811.361,712.42822Z"
                                transform="translate(38.7119 -600.73077) rotate(22.03793)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M873.61445,545.1712l-36,95-15,66,16,8,73-142,27,142.5h16s7.316-169.01457-3.342-182.25729Z"
                                transform="translate(-291 -347.24569)"
                                fill="#2f2e41"
                              />
                              <circle
                                cx="537.98425"
                                cy="273.76612"
                                r="28.17188"
                                fill="#6c63ff"
                              />
                              <polygon
                                points="535.636 286.223 526.695 274.726 531.895 270.682 536.128 276.125 550.43 261.028 555.213 265.559 535.636 286.223"
                                fill="#fff"
                              />
                              <circle
                                cx="600.11445"
                                cy="33.42551"
                                r="33"
                                fill="#2f2e41"
                              />
                              <path
                                d="M845.06051,605.22967a10.74264,10.74264,0,0,0,3.84155-16.01842l25.033-138.54-23.36007-.30785L833.191,587.36152a10.8009,10.8009,0,0,0,11.86954,17.86815Z"
                                transform="translate(-291 -347.24569)"
                                fill="#ffb8b8"
                              />
                              <path
                                d="M988.50931,578.17023a10.74528,10.74528,0,0,0-5.16594-15.93969l-44.701-108.58a19.7819,19.7819,0,0,0-28.73525-9.27015h0l59.20611,124.76112a10.80077,10.80077,0,0,0,19.39612,9.02868Z"
                                transform="translate(-291 -347.24569)"
                                fill="#ffb8b8"
                              />
                              <circle
                                cx="600.76799"
                                cy="45.85858"
                                r="24.56103"
                                fill="#ffb8b8"
                              />
                              <path
                                d="M861.90227,431.93849c14.16614-5.89755,38.62325-11.72619,65.78076.97762a24.87158,24.87158,0,0,1,13.31114,15.38724l11.62028,38.86785-15,15,14,31s-53.5,32.5-77.5,12.5l-14.5-51.5-19-5,6.482-38.51076A24.68767,24.68767,0,0,1,861.90227,431.93849Z"
                                transform="translate(-291 -347.24569)"
                                fill="#ccc"
                              />
                              <path
                                d="M868.79617,374.94113a73.04115,73.04115,0,0,0,31.59919,10.4119l-3.33084-3.991a24.47775,24.47775,0,0,0,7.5611,1.50143,8.2807,8.2807,0,0,0,6.74954-3.15918,7.70232,7.70232,0,0,0,.51556-7.115,14.58851,14.58851,0,0,0-4.58936-5.7385,27.32287,27.32287,0,0,0-25.43066-4.54493,16.32976,16.32976,0,0,0-7.59543,4.87221,9.23579,9.23579,0,0,0-1.86255,8.56086"
                                transform="translate(-291 -347.24569)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M864.20247,353.08668c-.39941-4.2-5.54465-6.78569-9.56833-5.517s-6.66535,5.32011-7.46387,9.4628a13.575,13.575,0,0,0,1.83057,10.24843,9.3394,9.3394,0,0,0,9.25733,4.0107c3.97942-.84823,6.73641-4.73395,7.52526-8.72557s.00565-8.10694-.77654-12.09988"
                                transform="translate(-291 -347.24569)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M932.20247,355.08668c-.39941-4.2-5.54465-6.78569-9.56833-5.517s-6.66535,5.32011-7.46387,9.4628a13.575,13.575,0,0,0,1.83057,10.24843,9.3394,9.3394,0,0,0,9.25733,4.0107c3.97942-.84823,6.73641-4.73395,7.52526-8.72557s.00565-8.10694-.77654-12.09988"
                                transform="translate(-291 -347.24569)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M767.50006,697H750v-3a4,4,0,0,0-4-4H725a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H693a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H661a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H629a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H597a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H565a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H533a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H501a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H469a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H437a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H405a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H373a4,4,0,0,0-4,4v3h-3v-3a4,4,0,0,0-4-4H341a4,4,0,0,0-4,4v3H319.49994A28.49994,28.49994,0,0,0,291,725.49994V725.5a8.5,8.5,0,0,0,8.5,8.5h488a8.5,8.5,0,0,0,8.5-8.5v-.00006A28.49994,28.49994,0,0,0,767.50006,697Z"
                                transform="translate(-291 -347.24569)"
                                fill="#3f3d56"
                              />
                            </svg>
                          </figure>
                          <p className="mt-2">No data yet!</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="admin-box-info">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="chart_boxes admin-box3-remove overflow-auto">
                  <div className="admin-header">
                    <div className="row">
                      <div className="col-lg-9">
                        <h4 className="admin-head">Calendar</h4>
                      </div>
                    </div>
                  </div>
                  <div className="chart_area_body matching_height_lg overflow-auto">
                    <div className="event-calender p-0">
                      <h6 className="text-right">
                        <a onClick={() => newEvent("calenderModal")}>
                          + Add Event
                        </a>
                      </h6>
                      <h3 className="admin-head2 calender-title_New text-center pl-0">
                        <a href="/admin/calendar" className="text-dark">
                          <strong>
                            {activeDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </strong>
                        </a>
                      </h3>
                      <div className="week mt-3">
                        <table className="table text-center">
                          <tbody>
                            <tr>
                              <td className="border-0">
                                <span>M</span>
                              </td>
                              <td className="border-0">
                                <span>T</span>
                              </td>
                              <td className="border-0">
                                <span>W</span>
                              </td>
                              <td className="border-0">
                                <span>T</span>
                              </td>
                              <td className="border-0">
                                <span>F</span>
                              </td>
                              <td className="border-0">
                                <span>S</span>
                              </td>
                              <td className="border-0">
                                <span>S</span>
                              </td>
                            </tr>
                            <tr>
                              {week.map((item, index) => (
                                <td
                                  className="border-0 text-center"
                                  key={index}
                                  onClick={() => getDayEvents(item)}
                                >
                                  <span
                                    className={
                                      item.getDate() === activeDate.getDate()
                                        ? "active"
                                        : ""
                                    }
                                  >
                                    <strong
                                      className={
                                        item.getDate() === activeDate.getDate()
                                          ? "text-white"
                                          : ""
                                      }
                                    >
                                      {item.getDate()}
                                    </strong>
                                  </span>
                                  {checkType("event", item) && (
                                    <div className="dot mx-auto"></div>
                                  )}
                                  {checkType("exam", item) && (
                                    <div className="dot blue mx-auto"></div>
                                  )}
                                  {checkType("holiday", item) && (
                                    <div className="dot navyblue mx-auto"></div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-calender">
                        <p className="text-right">
                          * You cannot update the proctored assessment, it will
                          automatically be added when created
                        </p>
                        {eventsByDay.length > 0 ? (
                          <>
                            {eventsByDay
                              .slice(0, eventLimit)
                              .map((item, id) => (
                                <div key={id}>
                                  <div className="calender-unit">
                                    <h4>{item.title}</h4>
                                    <p>
                                      {new Date(item.startDate).toLocaleString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                          hour: "numeric",
                                          minute: "numeric",
                                          hour12: true,
                                        }
                                      )}{" "}
                                      -{" "}
                                      {new Date(item.endDate).toLocaleString(
                                        "en-US",
                                        {
                                          hour: "numeric",
                                          minute: "numeric",
                                          hour12: true,
                                        }
                                      )}
                                    </p>
                                  </div>
                                  {item.type !== "exam" && (
                                    <div className="mx-3">
                                      <a
                                        onClick={() => deleteEvent(item._id)}
                                        className="btn btn-outline btn-sm"
                                      >
                                        Delete
                                      </a>
                                      <a
                                        onClick={() =>
                                          editEvent(item, "calenderModal")
                                        }
                                        className="btn btn-primary btn-sm ml-2"
                                      >
                                        Edit
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            {eventsByDay.length > eventLimit && (
                              <div className="load-more mx-auto">
                                <a onClick={showAllEvents}>Show All</a>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center">
                            <figure className="mx-auto d-inline-block">
                              <img
                                src="assets/images/Womenday-rafiki1.png"
                                alt=""
                              />
                            </figure>
                            <div className="load-more mx-auto">
                              <a href="/admin/calendar">No Events To Show</a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-lg-3">
              <div className="col-lg-6 awaitingResponse_new">
                <div className="chart_boxes admin-box4 h-lg-100">
                  <div className="admin-header">
                    <div className="row">
                      <div className="col-lg-12">
                        <span className="admin-head">
                          Awaiting Responses ({totalPendingFb})
                        </span>
                        <p className="admin-head2">
                          Response from the teacher for the following messages
                          is pending.
                        </p>
                      </div>
                    </div>
                  </div>
                  {pendingFeedbacks ? (
                    <>
                      <div className="chart_area_body admin-box-info">
                        <table className="table vertical-middle border-top-none border-bottom_yes">
                          {pendingFeedbacks.map((fb, index) => (
                            <tr key={index}>
                              <td className="pl-0">
                                <div className="d-flex">
                                  <figure>
                                    <div
                                      className="avatar"
                                      style={{
                                        backgroundImage: `url(${avatar(
                                          fb.student
                                        )})`,
                                      }}
                                    ></div>
                                  </figure>

                                  <div className="admin-info2 ml-2 mt-0">
                                    <h6>{fb.student.name}</h6>
                                    {fb.course && fb.course.length > 0 && (
                                      <p>
                                        {" "}
                                        Course -{" "}
                                        <b style={{ fontWeight: "bolder" }}>
                                          {fb.course[0].title}
                                        </b>
                                      </p>
                                    )}
                                    <p>
                                      {" "}
                                      Assessment - <b>{fb.test.title}</b>
                                    </p>
                                    <p className="admin-yellow highlight_new">
                                      <b>{fb.count}</b> Pending Responses on
                                      <b>{fb.question}</b> Questions
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-right">
                                <div className="admin-info3 text-center">
                                  <button
                                    className="btn btn-outline btn-sm practice-btnAdmin-remove"
                                    onClick={() =>
                                      sendMessageToTeacher(fb.student)
                                    }
                                  >
                                    Message
                                  </button>
                                  <p>{moment(fb.oldest).fromNow()}</p>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </table>
                        {totalPendingFb > 0 &&
                          pendingFeedbacks.length < totalPendingFb && (
                            <div className="text-center">
                              <button
                                className="btn btn-light"
                                onClick={loadMoreFeedback}
                              >
                                Load More
                              </button>
                            </div>
                          )}
                      </div>
                      {pendingFeedbacks.length === 0 && (
                        <>
                          <figure className="text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              data-name="Layer 1"
                              width="120.50899"
                              height="100.71823"
                              viewBox="0 0 718.50899 601.71823"
                              // xmlns:xlink="http://www.w3.org/1999/xlink"
                            >
                              <path
                                d="M895.34555,200.62251H263.02218a1.0156,1.0156,0,0,1,0-2.0307H895.34555a1.0156,1.0156,0,0,1,0,2.0307Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#cacaca"
                              />
                              <ellipse
                                cx="23.34831"
                                cy="11.16881"
                                rx="10.92534"
                                ry="11.16881"
                                fill="#3f3d56"
                              />
                              <ellipse
                                cx="61.09038"
                                cy="11.16881"
                                rx="10.92534"
                                ry="11.16881"
                                fill="#3f3d56"
                              />
                              <ellipse
                                cx="98.83246"
                                cy="11.16881"
                                rx="10.92534"
                                ry="11.16881"
                                fill="#3f3d56"
                              />
                              <path
                                d="M872.72853,166.83832h-26.81a2.0304,2.0304,0,0,0,0,4.06h26.81a2.0304,2.0304,0,0,0,0-4.06Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M872.72853,174.45832h-26.81a2.0304,2.0304,0,0,0,0,4.06h26.81a2.0304,2.0304,0,0,0,0-4.06Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M872.72853,182.0683h-26.81a2.0304,2.0304,0,0,0,0,4.06h26.81a2.0304,2.0304,0,0,0,0-4.06Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M862.717,234.906H286.777a12.048,12.048,0,0,0-12.03,12.03v1.94a12.048,12.048,0,0,0,12.03,12.03H862.717a12.048,12.048,0,0,0,12.03-12.03v-1.94A12.048,12.048,0,0,0,862.717,234.906Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#f0f0f0"
                              />
                              <path
                                d="M356.28234,252.70618H301.45945a4.62947,4.62947,0,0,1,0-9.25893h54.82289C362.25257,243.36392,362.31228,252.79027,356.28234,252.70618Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M520.28234,252.70618H465.45945a4.62947,4.62947,0,0,1,0-9.25893h54.82289C526.25257,243.36392,526.31228,252.79027,520.28234,252.70618Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M684.28234,252.70618H629.45945a4.62947,4.62947,0,0,1,0-9.25893h54.82289C690.25257,243.36392,690.31228,252.79027,684.28234,252.70618Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M839.78234,253.20618H784.95945a4.62946,4.62946,0,0,1,0-9.25893h54.82289C845.75257,243.86392,845.81228,253.29027,839.78234,253.20618Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#6c63ff"
                              />
                              <rect
                                x="490.21805"
                                y="70.83595"
                                width="2"
                                height="26"
                                fill="#fff"
                              />
                              <path
                                d="M547.2921,619.71843H312.239a7.90878,7.90878,0,0,1-7.89963-7.89963V577.39342a7.90879,7.90879,0,0,1,7.89963-7.89964H547.2921a7.9088,7.9088,0,0,1,7.89964,7.89964V611.8188A7.90879,7.90879,0,0,1,547.2921,619.71843Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#f0f0f0"
                              />
                              <path
                                d="M524.45379,614.39H317.56867a7.9088,7.9088,0,0,1-7.89964-7.89964v-23.7643a7.9088,7.9088,0,0,1,7.89964-7.89964h224.395a7.90879,7.90879,0,0,1,7.89964,7.89964v6.25441A25.43817,25.43817,0,0,1,524.45379,614.39Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M453.09041,592.15716H358.617a2.03732,2.03732,0,1,1,0-4.07464h94.47342a2.03732,2.03732,0,0,1,0,4.07464Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M500.91452,600.48987H358.617a2.03733,2.03733,0,1,1,0-4.07465H500.91452a2.03733,2.03733,0,0,1,0,4.07465Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M562.307,530.10611H294.29691a8.07557,8.07557,0,0,1-8.06636-8.06636V317.17217a8.07531,8.07531,0,0,1,8.06636-8.06606H562.307a8.07531,8.07531,0,0,1,8.06636,8.06606V522.03975A8.07557,8.07557,0,0,1,562.307,530.10611Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M562.30686,531.10611H294.29709a9.077,9.077,0,0,1-9.0664-9.06641V317.172a9.07652,9.07652,0,0,1,9.0664-9.06592H562.30686a9.07652,9.07652,0,0,1,9.0664,9.06592V522.0397A9.077,9.077,0,0,1,562.30686,531.10611Zm-268.00977-221a7.07423,7.07423,0,0,0-7.0664,7.06592V522.0397a7.07434,7.07434,0,0,0,7.0664,7.06641H562.30686a7.07434,7.07434,0,0,0,7.0664-7.06641V317.172a7.07423,7.07423,0,0,0-7.0664-7.06592Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#f0f0f0"
                              />
                              <path
                                d="M286.84959,491.10611V522.0399a7.45829,7.45829,0,0,0,7.44716,7.44716H562.30719a7.45829,7.45829,0,0,0,7.44717-7.44716V491.10611Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#f0f0f0"
                              />
                              <rect
                                x="428.29533"
                                y="234.39979"
                                width="1.99962"
                                height="333.55961"
                                transform="translate(-402.07292 382.34175) rotate(-57.37135)"
                                fill="#f0f0f0"
                              />
                              <rect
                                x="263.30853"
                                y="400.17978"
                                width="333.55961"
                                height="1.99962"
                                transform="translate(-410.46649 131.14319) rotate(-32.62865)"
                                fill="#f0f0f0"
                              />
                              <polygon
                                points="545.364 587.788 532.974 587.787 527.079 539.998 545.366 539.999 545.364 587.788"
                                fill="#a0616a"
                              />
                              <path
                                d="M807.06258,747.80889l-13.22-5.37-.39-.16-7.3,5.53a15.54249,15.54249,0,0,0-15.53,14.87c-.02.22-.02.45-.02.68v.51h39.95v-16.06Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#2f2e41"
                              />
                              <polygon
                                points="516.348 576.258 504.66 580.37 483.238 537.245 500.488 531.177 516.348 576.258"
                                fill="#a0616a"
                              />
                              <path
                                d="M776.72189,736.61787l-14.2529-.67773-.421-.02152-5.05069,7.63948a15.54248,15.54248,0,0,0-9.71416,19.1816c.05413.21415.13048.43115.20682.64809l.16927.4811,37.68529-13.2598L780.014,735.45951Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M811.77112,545.79972c11.33506-.43955-2.70631,89.88978-2.70631,89.88978s4.10734,79.30546,3.23671,83.46726-.10978,15.38636-.10978,15.38636c-2.22075-4.04192-25.13224-.9914-25.13224-.9914l-3.11682-80.37587-15.91342-64.39953-22.06224,43.168,21.14563,66.26061s8.56336,7.92394,7.65278,11.0553-23.341,10.19318-27.46279,10.353-2.26071-5.07241-2.46051-10.22468-19.59569-52.90457-26.41781-69.1522-1.51846-39.15745,1.964-55.80468,21.80339-47.88859,21.80339-47.88859C764.93328,510.893,800.43605,546.23928,811.77112,545.79972Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M673.63366,472.80155a9.15861,9.15861,0,0,0,13.72045,2.99545l27.25821,17.784-.083-16.91272L688.65716,462.3732a9.20824,9.20824,0,0,0-15.0235,10.42835Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#a0616a"
                              />
                              <path
                                d="M805.88412,560.28042c-28.10986.001-43.60059-5.626-51.82666-10.65039-10.05859-6.14356-11.77978-12.62207-11.84814-12.89551l-.02-.07812.979-12.32032.42822-.959a19.50463,19.50463,0,0,0,.73438-14.00684l-.03076-.09472.00781-.09864,6.57275-85.24462,23.25977-7.61915,6.7666-6.79882,30.12744-.437,4.19776,8.51025,23.751,8.94141L827.31478,495.9855l-5.59375,9.6416L823.972,516.13l-.01562.09473-7.33838,43.7998-.40381.01758Q810.78549,560.28531,805.88412,560.28042Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M733.162,507.09878l-11.02783-6.53809-.69092-.998a15.7342,15.7342,0,0,0-12.4541-6.74805l-.12842-.00391L693.67221,483.881l6.2959-18.44336,23.81,7.03418,16.59961-41.24463a13.19911,13.19911,0,0,1,23.47559-2.00635,13.62434,13.62434,0,0,1,1.96728,7.20508v26.9873l-.09961.13379Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M806.88908,544.41764a9.15863,9.15863,0,0,1,12.18666-6.97916l20.656-25.15175,5.002,16.15634-20.38215,21.40758a9.20824,9.20824,0,0,1-17.46248-5.433Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#a0616a"
                              />
                              <path
                                d="M837.77328,541.2394,824.057,527.52163l8.73145-21.27441,12.65381-17.27832c-13.48389-6.56446-23.60547-22.11524-30.93946-34.98828l-.08252-.14454,1.82618-14.30371a18.367,18.367,0,0,1,3.87353-9.14306,18.36952,18.36952,0,0,1,29.90869,1.709l24.5918,54.66846-.27686.41308-19.78027,33.71875-5.39844,3.501Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M817.60205,380.40273a25.10467,25.10467,0,0,1-49.75065-6.77109l.0485-.35635a25.10467,25.10467,0,0,1,49.69445,7.12639Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#a0616a"
                              />
                              <path
                                d="M811.21258,393.33348c1.28921-2.61883,2.61359-5.43045,2.25128-8.32684s-3.20276-5.66484-5.99192-4.80406c-1.66786.51473-2.92844,2.16171-4.67189,2.246-2.39885.116-3.77423-2.62948-4.5209-4.91211l-3.041-9.29657a25.15357,25.15357,0,0,1-20.89111,4.72079c-2.82347-.64554-5.67592-1.90416-7.33216-4.28021s-1.64627-6.0617.6254-7.85842c1.11387-.881,2.59642-1.2157,3.66088-2.15577a4.10217,4.10217,0,0,0-3.27565-7.13851l7.65693-.957-2.28138-4.12614a7.535,7.535,0,0,0,5.99172,1.0992c2.06-.37093,4.0002-1.21914,6.01549-1.78479a23.15188,23.15188,0,0,1,25.75441,10.81464,9.80176,9.80176,0,0,1,10.687,3.08588c2.04974,2.60156,2.60717,6.07331,2.68659,9.38439a40.71463,40.71463,0,0,1-4.15033,18.86012,15.45115,15.45115,0,0,1-3.48657,4.94577,6.97822,6.97822,0,0,1-5.60143,1.83184"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M404.40219,367.50327a38.99224,38.99224,0,0,0,5.03952,16.61592c6.12735,10.761,16.635,18.55205,27.952,23.183,14.13887,5.78576,29.89994,5.964,44.905,4.67391,13.93671-1.19822,27.73161-3.9757,41.71968-4.54814a290.67425,290.67425,0,0,1,32.435.77368c20.93161,1.48566,41.77624,4.2422,62.48665,7.58393q8.41338,1.34092,16.79136,2.8814a8.30457,8.30457,0,0,1,1.55945.28974c.10141.04156.26448.00913.35732.06753.16859.10618-.682-.26919-.16638.15694A15.47381,15.47381,0,0,1,639.394,421.642l7.64885,9.84331c2.19349,2.82282,4.22918,6.25235,7.064,8.4773a12.79059,12.79059,0,0,0,14.15922.98683,14.14994,14.14994,0,0,0,5.26533-5.981,51.61658,51.61658,0,0,1,6.26129-9.03759c9.09984-10.61576,21.74694-17.14527,32.32494-26.07738a57.57506,57.57506,0,0,0,12.92811-14.77806,41.79039,41.79039,0,0,0,5.34147-16.5949c1.26668-11.87124-2.37608-23.97752-8.50294-34.07663a68.07168,68.07168,0,0,0-27.63411-25.2936c-12.802-6.52219-26.968-9.69913-41.16812-11.28228-15.07643-1.68086-30.32813-1.67562-45.47815-1.50592q-25.50363.28389-50.91513,2.24306-25.44586,1.96956-50.69115,5.59916c-16.14935,2.32185-32.496,4.74188-48.30385,8.85022-13.96486,3.62937-27.89045,9.30228-38.31857,19.58089C410.10319,341.73455,403.65432,354.24087,404.40219,367.50327Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#6c63ff"
                              />
                              <path
                                d="M482.46256,371.27969a5.00673,5.00673,0,0,1-4.74267-5.62432l.35883-2.82483a3.37273,3.37273,0,0,0-1.0977-2.937l-2.12184-1.896a4.99256,4.99256,0,0,1,2.395-8.62841l2.79727-.53131a3.36716,3.36716,0,0,0,2.45306-1.94914l1.14815-2.60739a4.99375,4.99375,0,0,1,8.94657-.38788l1.3687,2.496a3.3679,3.3679,0,0,0,2.6145,1.73263l2.83185.2861a4.99272,4.99272,0,0,1,3.1339,8.38851l-1.95031,2.07351a3.36148,3.36148,0,0,0-.83849,3.01891l.60171,2.78437a4.9927,4.9927,0,0,1-7.00862,5.57168l-2.57528-1.21347a3.35983,3.35983,0,0,0-3.13216.13461l-2.46066,1.43289A4.99889,4.99889,0,0,1,482.46256,371.27969Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M522.558,370.11518a5.04346,5.04346,0,0,1-3.36337-1.50156,5.17347,5.17347,0,0,1-1.35388-4.32291l.32924-2.5919a3.43188,3.43188,0,0,0-1.11784-2.99155l-1.96831-1.7588a5.13349,5.13349,0,0,1-1.79914-4.0285,4.99124,4.99124,0,0,1,4.06492-4.71539l2.76479-.52514a3.43125,3.43125,0,0,0,2.5-1.98821l1.03031-2.33979a5.22514,5.22514,0,0,1,4.40614-3.20619,4.96762,4.96762,0,0,1,4.64379,2.58361l1.35279,2.467a3.43328,3.43328,0,0,0,2.66529,1.76515l2.62461.26516a5.13094,5.13094,0,0,1,3.82473,2.20359,4.99253,4.99253,0,0,1-.51847,6.20233l-1.92768,2.04945a3.43035,3.43035,0,0,0-.85423,3.07484l.55556,2.57084a5.15516,5.15516,0,0,1-.90576,4.31869,4.97984,4.97984,0,0,1-6.06361,1.43465l-2.54866-1.20092a3.4292,3.4292,0,0,0-3.18733.13869l-2.4321,1.41627A4.999,4.999,0,0,1,522.558,370.11518Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M562.75714,369.94527a5.00673,5.00673,0,0,1-4.74267-5.62433l.35882-2.82482a3.3727,3.3727,0,0,0-1.09769-2.937l-2.12185-1.896a4.99258,4.99258,0,0,1,2.395-8.62842l2.79727-.53131a3.36713,3.36713,0,0,0,2.45306-1.94913l1.14814-2.60739a4.99376,4.99376,0,0,1,8.94658-.38789l1.3687,2.496a3.3679,3.3679,0,0,0,2.61449,1.73263l2.83186.2861a4.99272,4.99272,0,0,1,3.1339,8.3885l-1.95031,2.07352a3.36142,3.36142,0,0,0-.83849,3.0189l.6017,2.78437a4.99269,4.99269,0,0,1-7.00862,5.57168l-2.57527-1.21346a3.35979,3.35979,0,0,0-3.13217.13461l-2.46065,1.43289A4.999,4.999,0,0,1,562.75714,369.94527Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#fff"
                              />
                              <path
                                d="M601.858,368.88446a5.00674,5.00674,0,0,1-4.74267-5.62432l.35883-2.82483a3.37275,3.37275,0,0,0-1.09769-2.937l-2.12185-1.896a4.99256,4.99256,0,0,1,2.395-8.62841l2.79728-.53131a3.36713,3.36713,0,0,0,2.453-1.94914l1.14815-2.60739a4.99376,4.99376,0,0,1,8.94658-.38788l1.3687,2.496a3.36789,3.36789,0,0,0,2.61449,1.73263l2.83186.2861a4.99272,4.99272,0,0,1,3.1339,8.38851l-1.95032,2.07351a3.36145,3.36145,0,0,0-.83848,3.01891l.6017,2.78437a4.99269,4.99269,0,0,1-7.00862,5.57168l-2.57527-1.21347a3.35985,3.35985,0,0,0-3.13217.13461l-2.46065,1.4329A4.999,4.999,0,0,1,601.858,368.88446Z"
                                transform="translate(-262.02897 -164.07002)"
                                opacity="0.2"
                              />
                              <path
                                d="M640.95879,367.82366a5.00675,5.00675,0,0,1-4.74267-5.62433l.35883-2.82482a3.37276,3.37276,0,0,0-1.09769-2.937l-2.12185-1.896a4.99256,4.99256,0,0,1,2.395-8.62841l2.79728-.53131a3.36712,3.36712,0,0,0,2.453-1.94913l1.14815-2.6074a4.99376,4.99376,0,0,1,8.94658-.38788l1.36869,2.49605a3.368,3.368,0,0,0,2.6145,1.73263l2.83186.2861a4.99272,4.99272,0,0,1,3.1339,8.3885l-1.95032,2.07352a3.36142,3.36142,0,0,0-.83848,3.0189l.6017,2.78437a4.99269,4.99269,0,0,1-7.00862,5.57168l-2.57527-1.21346a3.35979,3.35979,0,0,0-3.13217.13461l-2.46066,1.43289A4.999,4.999,0,0,1,640.95879,367.82366Z"
                                transform="translate(-262.02897 -164.07002)"
                                opacity="0.2"
                              />
                              <path
                                d="M890.07067,701.43944,891.21453,675.72a83.06565,83.06565,0,0,1,38.74475-9.8078c-18.60845,15.21374-16.283,44.54071-28.899,64.99963A49.96442,49.96442,0,0,1,864.42089,754.001l-15.5722,9.53437a83.72447,83.72447,0,0,1,17.647-67.8451,80.87424,80.87424,0,0,1,14.863-13.81018C885.08819,691.71428,890.07067,701.43944,890.07067,701.43944Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M979.34727,765.78825H561.96534a1.19068,1.19068,0,1,1,0-2.38137H979.34727a1.19068,1.19068,0,1,1,0,2.38137Z"
                                transform="translate(-262.02897 -164.07002)"
                                fill="#cacaca"
                              />
                            </svg>
                          </figure>
                          <p className="text-center">No data yet!</p>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="admin-box-info">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="chart_boxes h-lg-100">
                  <div className="admin-header">
                    <div className="row">
                      <div className="col-lg-12">
                        <span className="admin-head">
                          Assessment & classroom Mapping
                        </span>
                        <p className="admin-head2">
                          Mass Mapping of assessment and classroom.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="chart_area_body">
                    <div className="dashed-border-box">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="standard-upload-box mb-4 mt-4">
                            <FileDrop
                              className="mt-4"
                              onDrop={(f: any) => dropped(f)}
                            >
                              <h2 className="upload_icon mb-0">
                                <span className="material-icons">
                                  file_copy
                                </span>
                              </h2>
                              <p className="pro-text-drug text-center d-block active text-primary">
                                {uploadFile?.name}
                              </p>
                              <span className="title">
                                Drag and Drop or{" "}
                                <a
                                  onClick={openFileSelector}
                                  className="text-primary"
                                >
                                  {" "}
                                  browse{" "}
                                </a>{" "}
                                your files
                              </span>
                              <div className="d-flex justify-content-center gap-xs">
                                {!uploadFile?.name ? (
                                  <a
                                    className="btn btn-primary btn-sm"
                                    onClick={openFileSelector}
                                  >
                                    Browse
                                  </a>
                                ) : (
                                  <>
                                    <a
                                      className="btn btn-secondary btn-sm mx-2 set_cancel__btn"
                                      onClick={cancelDocs}
                                    >
                                      Cancel
                                    </a>
                                    <a
                                      className={`btn btn-secondary btn-sm ${
                                        !uploadFile ? "disabled" : ""
                                      }`}
                                      onClick={uploadMappingFile}
                                    >
                                      Upload
                                    </a>
                                  </>
                                )}
                              </div>
                              <input
                                accept=".xls,.xlsx"
                                value=""
                                style={{ display: "none", opacity: 0 }}
                                ref={fileBrowseRef}
                                type="file"
                                onChange={(e) => dropped(e.target.files)}
                              />
                            </FileDrop>
                          </div>
                        </div>
                        <div className="col-md-4 mt-md-0 mt-2">
                          <p className="assess-help">
                            You can download the template for uploading use
                          </p>
                          <a
                            className="btn btn-outline mt-2"
                            href="/assets/media/Assessment_Class_Mapping.xlsx"
                            target="_blank"
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <img
                                src="/assets/images/assessment-excel.svg"
                                alt="assessment-excel"
                                className="tem-svg mr-2"
                              />
                              Template
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="chart_boxes admin-box4 flaggedDiscussion_new mt-0 h-lg-100">
                  <div className="admin-header">
                    <div className="row">
                      <div className="col-lg-12">
                        <span className="admin-head">
                          Flagged Discussions ({totalFlaggedPosts})
                        </span>
                        <p className="admin-head2">
                          Remove all the flagged comments from discussion panel.
                        </p>
                      </div>
                    </div>
                  </div>
                  {flaggedPosts.length > 0 ? (
                    <div
                      className="chart_area_body admin-box-info-remove new-admin-box-info-remove"
                      style={{ height: "300px", overflowY: "scroll" }}
                    >
                      {flaggedPosts.map((post, index) => (
                        <div
                          className="d-flex border-bottom mt-3 pb-3"
                          key={index}
                        >
                          <figure>
                            <div
                              className="avatar"
                              style={{
                                backgroundImage: `url(${
                                  post.user
                                    ? post.user
                                    : "/assets/images/defaultProfile.png"
                                })`,
                              }}
                            ></div>
                          </figure>
                          <div className="mx-2 mt-0 flex-grow-1 overflow-auto break-word">
                            <h6>{post.user.name}</h6>
                            <p className="post_updatedat_date">
                              {new Date(post.updatedAt).toLocaleDateString()}
                            </p>
                            <MathJax value={post.description} />
                            {post.attachments.length > 0 && (
                              <>
                                {post.attachments.map((item, idx) => (
                                  <div
                                    className="special-info special-info_new"
                                    key={idx}
                                    style={{ marginBottom: "0" }}
                                  >
                                    {item.type === "document" && (
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <div className="d-flex align-items-center">
                                          <div className="col">
                                            <div className="inner">
                                              <h4
                                                className="m-0 text-truncate width-560"
                                                title={item.title}
                                              >
                                                {item.title}
                                              </h4>
                                            </div>
                                          </div>
                                        </div>
                                      </a>
                                    )}
                                    {item.type === "link" && (
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <div className="mt-2 align-items-center">
                                          <div className="col-auto pr-0">
                                            <figure>
                                              <img src={item.imageUrl} alt="" />
                                            </figure>
                                          </div>
                                          <div className="col">
                                            <div className="inner">
                                              <div className="wrap">
                                                <h4>{item.title}</h4>
                                                <p>{item.description}</p>
                                                <span>{item.url}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                          <div>
                            <button
                              className="btn btn-outline btn-sm practice-btnAdmin-remove"
                              onClick={() =>
                                push(`/flagged-discussion?post=${post._id}`)
                              }
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-box-info">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="32" />
                    </div>
                  )}
                  {totalFlaggedPosts > 0 &&
                    flaggedPosts.length < totalFlaggedPosts && (
                      <div className="text-center">
                        <button
                          className="btn btn-light mt-3"
                          onClick={loadMoreFlaggedPost}
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  {flaggedPosts.length === 0 && (
                    <div className="addNoDataImgs">
                      <figure className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          data-name="Layer 1"
                          width="120.78294"
                          height="100"
                          viewBox="0 0 745.78294 510"
                          // xmlns:xlink="http://www.w3.org/1999/xlink"
                        >
                          <path
                            d="M666.03421,647.67542c7.18382,12.69813,1.0921,55.58546,1.0921,55.58546s-39.89068-16.88558-47.07316-29.57842a26.41318,26.41318,0,1,1,45.98106-26.007Z"
                            transform="translate(-227.10853 -195)"
                            fill="#f1f1f1"
                          />
                          <path
                            d="M667.70473,703.20558l-.84744.17852c-8.16221-38.77834-36.66552-65.075-36.95246-65.33607l.58273-.64064C630.77656,637.67015,659.48321,664.14565,667.70473,703.20558Z"
                            transform="translate(-227.10853 -195)"
                            fill="#fff"
                          />
                          <path
                            d="M731.30564,662.13423c-9.74789,17.68309-64.70648,41.63829-64.70648,41.63829s-9.06086-59.26311.68177-76.94078a36.55622,36.55622,0,1,1,64.02471,35.30249Z"
                            transform="translate(-227.10853 -195)"
                            fill="#f1f1f1"
                          />
                          <path
                            d="M667.08422,704.414l-.82555-.869c39.76932-37.7685,50.06448-90.44509,50.16385-90.97275l1.17793.2216C717.50062,613.32511,707.1423,666.37115,667.08422,704.414Z"
                            transform="translate(-227.10853 -195)"
                            fill="#fff"
                          />
                          <rect
                            id="e53b7fd6-ae48-4231-a6bf-c74c7a6312f6"
                            data-name="Rectangle 62"
                            x="0.30072"
                            y="19.33529"
                            width="705.26456"
                            height="334.66027"
                            fill="#e6e6e6"
                          />
                          <rect
                            id="e27b5d17-8fe1-40fd-abc5-ff1fb7c5af81"
                            data-name="Rectangle 75"
                            x="20.468"
                            y="48.033"
                            width="664.93099"
                            height="279.21753"
                            fill="#fff"
                          />
                          <rect
                            id="f11de06d-5237-47a5-bdcf-7ab24c90f6f6"
                            data-name="Rectangle 80"
                            width="705.26456"
                            height="29.96173"
                            fill="#6c63ff"
                          />
                          <circle
                            id="a8620065-6204-4575-b165-05df1e96cc70"
                            data-name="Ellipse 90"
                            cx="22.26529"
                            cy="15.62776"
                            r="5.5533"
                            fill="#fff"
                          />
                          <circle
                            id="b36f18db-17cf-43fd-9307-66e7abd9e79c"
                            data-name="Ellipse 91"
                            cx="43.34377"
                            cy="15.62776"
                            r="5.5533"
                            fill="#fff"
                          />
                          <circle
                            id="f951b331-c7b3-4c65-b7ff-4fae542bffe1"
                            data-name="Ellipse 92"
                            cx="64.42323"
                            cy="15.62776"
                            r="5.5533"
                            fill="#fff"
                          />
                          <path
                            id="f1fe0bb1-d2c3-44f1-a2df-b8ed042349d0-280"
                            data-name="Path 142"
                            d="M508.3695,327.32281c-1.49465.005-2.70394,2.05262-2.701,4.57349.003,2.51383,1.21051,4.55046,2.701,4.55542H786.81178c1.49466-.005,2.70394-2.05262,2.701-4.57349-.003-2.51383-1.21052-4.55047-2.701-4.55542Z"
                            transform="translate(-227.10853 -195)"
                            fill="#e6e6e6"
                          />
                          <path
                            id="b5b576d4-2c69-432d-bba9-c1d1eb12c444-281"
                            data-name="Path 143"
                            d="M508.3695,354.71213c-1.49465.005-2.70394,2.05262-2.701,4.57349.003,2.51383,1.21051,4.55046,2.701,4.55542H714.123c1.49466-.005,2.70394-2.05262,2.701-4.57349-.003-2.51383-1.21052-4.55046-2.701-4.55542Z"
                            transform="translate(-227.10853 -195)"
                            fill="#e6e6e6"
                          />
                          <path
                            id="e1a4eb85-7f76-47c7-ae93-e7842353edb9-282"
                            data-name="Path 142"
                            d="M508.3695,381.48176c-1.49465.005-2.70394,2.05263-2.701,4.57349.003,2.51384,1.21051,4.55047,2.701,4.55543H786.81178c1.49466-.005,2.70394-2.05263,2.701-4.57349-.003-2.51383-1.21052-4.55047-2.701-4.55543Z"
                            transform="translate(-227.10853 -195)"
                            fill="#e6e6e6"
                          />
                          <path
                            id="bd9e3462-ca4d-47f6-a5ea-71b97a8587f8-283"
                            data-name="Path 143"
                            d="M508.3695,408.87108c-1.49465.005-2.70394,2.05263-2.701,4.5735.003,2.51383,1.21051,4.55046,2.701,4.55542H714.123c1.49466-.005,2.70394-2.05262,2.701-4.57349-.003-2.51383-1.21052-4.55047-2.701-4.55543Z"
                            transform="translate(-227.10853 -195)"
                            fill="#e6e6e6"
                          />
                          <path
                            id="f71eedc3-aadd-4340-a501-e921cec01e8f-284"
                            data-name="Path 142"
                            d="M292.29592,428.32281c-1.49466.005-2.704,2.05262-2.701,4.57349.003,2.51383,1.21051,4.55046,2.701,4.55542H429.73819c1.49466-.005,2.70394-2.05262,2.701-4.57349-.003-2.51383-1.21051-4.55047-2.701-4.55542Z"
                            transform="translate(-227.10853 -195)"
                            fill="#e6e6e6"
                          />
                          <path
                            id="b1fed777-acdd-4ce8-9b40-ebd2535d8bb3-285"
                            data-name="Path 143"
                            d="M292.29592,455.71213c-1.49466.005-2.704,2.05262-2.701,4.57349.003,2.51383,1.21051,4.55046,2.701,4.55542h64.75347c1.49466-.005,2.70394-2.05262,2.701-4.57349-.003-2.51383-1.21051-4.55046-2.701-4.55542Z"
                            transform="translate(-227.10853 -195)"
                            fill="#e6e6e6"
                          />
                          <path
                            d="M413.62866,312.60586a55.70922,55.70922,0,1,0-96.27,52.92c.5.63,1.02,1.26,1.54981,1.87.04.04.06982.08.10986.12a54.13689,54.13689,0,0,0,4.15039,4.28c.37988.35.77978.71,1.17969,1.05.76025.68,1.54,1.33,2.35009,1.95a54.77547,54.77547,0,0,0,4.94,3.47l.06.03c1.10987.69,2.23975,1.33,3.39014,1.94l.46973.24c1.08008.56,2.18017,1.09,3.31006,1.58.23.1.48.2.71.3.02.01.03027.01.05029.02a54.11484,54.11484,0,0,0,7.02,2.37,55.73235,55.73235,0,0,0,14.36963,1.88c1.77,0,3.52-.08,5.25-.25a55.50816,55.50816,0,0,0,11.64014-2.35c.01025,0,.02-.01.02978-.01a54.6047,54.6047,0,0,0,6.99023-2.77c.00977-.01.03028-.01.04-.02.50977-.24,1-.5,1.5-.75l.24024-.12c.3999-.21.7998-.42005,1.19971-.64,1-.55,1.98-1.13,2.95019-1.75.27-.16.52979-.33.79981-.51.87988-.58,1.75-1.2,2.58984-1.83.15039-.11.31006-.22.46045-.34a55.69207,55.69207,0,0,0,18.91992-62.68Z"
                            transform="translate(-227.10853 -195)"
                            fill="#fff"
                          />
                          <circle
                            id="b315fec5-366f-4a16-9dc9-634679b82ba4"
                            data-name="Ellipse 188"
                            cx="152.29372"
                            cy="150.53123"
                            r="8.349"
                            fill="#2f2e41"
                          />
                          <path
                            id="fd00c811-5154-4e0f-bd90-f718730f637f-286"
                            data-name="Path 969"
                            d="M381.72829,337.41224a8.35,8.35,0,0,1,7.35,12.312,8.347,8.347,0,1,0-13.868-9.172,8.32914,8.32914,0,0,1,6.519-3.14Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <circle
                            id="b073881c-6d17-4b63-9208-a633e233f752"
                            data-name="Ellipse 189"
                            cx="136.69172"
                            cy="125.98723"
                            r="24.526"
                            fill="#2f2e41"
                          />
                          <path
                            id="e068fb34-c64f-4621-9a6c-47926968fe63-287"
                            data-name="Path 970"
                            d="M344.55123,305.77027a24.522,24.522,0,0,1,33.99-2.572c-.2-.191-.4-.383-.607-.568a24.526,24.526,0,0,0-32.73016,36.5354q.06985.06253.14013.12458c.208.185.422.36.635.537a24.522,24.522,0,0,1-1.427-34.057Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <circle
                            id="baa61e83-3b6b-4f74-a8d9-0c51f3f7a212"
                            data-name="Ellipse 190"
                            cx="136.48371"
                            cy="134.50923"
                            r="15.796"
                            fill="#a0616a"
                          />
                          <path
                            d="M391.85864,370.66586v5.3c-.97021.62-1.95019,1.2-2.95019,1.75-.39991.22-.79981.43-1.19971.64l-.24024.12c-.5.25-.99023.51-1.5.75-.00976.01-.03027.01-.04.02a54.6047,54.6047,0,0,1-6.99023,2.77c-.00977,0-.01953.01-.02978.01a55.50816,55.50816,0,0,1-11.64014,2.35c-1.73.17-3.48.25-5.25.25a55.73235,55.73235,0,0,1-14.36963-1.88,54.11484,54.11484,0,0,1-7.02-2.37c-.02-.01-.03027-.01-.05029-.02-.23-.1-.48-.2-.71-.3-1.12989-.49-2.23-1.02-3.31006-1.58l-.46973-.24c-1.15039-.61-2.28027-1.25-3.39014-1.94l-.06-.03a54.77547,54.77547,0,0,1-4.94-3.47c-.81-.62-1.58984-1.27-2.35009-1.95-.39991-.34-.79981-.7-1.17969-1.05a54.13689,54.13689,0,0,1-4.15039-4.28,20.22982,20.22982,0,0,1,.76025-3.07l.00977-.01a4.48938,4.48938,0,0,1,.21-.5,3.98893,3.98893,0,0,1,.18994-.42c1.79-3.35,5.03027-4.18,9.05029-4.36,2.27-.1,4.77979.01,7.43018-.02,1.3999-.01,2.84961-.06,4.2998-.19,9.14991-.83,7.49024-6.23,7.89991-9.14.41015-2.82,2.95019-.37994,3.12011-.22l.00977.01a32.27157,32.27157,0,0,0,16.6001,2.91c.98-.12,1.96-.19,2.93994-.22,2.58008-.03,2.02.71,1.13037,1.32a11.18308,11.18308,0,0,1-1.3501.76s-.41015,2.5-.83008,6.24c-.3999,3.57995,6.46,5.26,7.02979,5.38995a.06082.06082,0,0,0,.04.01,13.77359,13.77359,0,0,1,7.61035.2h.00976A9.018,9.018,0,0,1,391.85864,370.66586Z"
                            transform="translate(-227.10853 -195)"
                            fill="#cbcbcb"
                          />
                          <path
                            d="M340.72827,377.09585c0,.74-.01953,1.45-.04981,2.12-.00976.4-.02978.79-.0498,1.16-.02-.01-.03027-.01-.05029-.02-.23-.1-.48-.2-.71-.3-1.12989-.49-2.23-1.02-3.31006-1.58l-.46973-.24c-1.15039-.61-2.28027-1.25-3.39014-1.94.02979-.35.08008-.7.12989-1.05.10986-.77.20019-1.55.26025-2.31994a32.1836,32.1836,0,0,0-2.8501-15.76v-.01c-.20019-.4-.31982-.62-.31982-.62s2.90967-2.5,7.05957,0a2.4977,2.4977,0,0,1,.69043.6C340.1687,360.08584,340.84839,370.00582,340.72827,377.09585Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M386.13843,375.73586c-.04,1.12-.1001,2.29-.16993,3.48v.01c-.00976.01-.03027.01-.04.02a54.6047,54.6047,0,0,1-6.99023,2.77c-.00977,0-.01953.01-.02978.01l-.10987-2.81-.01025-.37-.52979-13.68a2.29521,2.29521,0,0,1,2.29-2.4h5.06983c.25,0,.43017.51.55029,1.43v.01A86.66139,86.66139,0,0,1,386.13843,375.73586Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <path
                            id="b5d95f6e-bcc4-4382-8a9f-8ff393651dfe-288"
                            data-name="Path 975"
                            d="M350.08223,309.76422v15.8h3.658l4.655-4.988-.623,4.988h16.17l-1-4.988,2,4.988h2.578v-15.8Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <ellipse
                            id="a1555f60-b18f-4a81-9968-ab91697ea211"
                            data-name="Ellipse 191"
                            cx="120.47972"
                            cy="131.18423"
                            rx="1.247"
                            ry="2.286"
                            fill="#a0616a"
                          />
                          <ellipse
                            id="b9487e3b-2bf5-437d-8cc7-b19d17f64c32"
                            data-name="Ellipse 192"
                            cx="152.48872"
                            cy="131.18423"
                            rx="1.247"
                            ry="2.286"
                            fill="#a0616a"
                          />
                          <path
                            d="M413.62866,312.60586a55.70922,55.70922,0,1,0-96.27,52.92c.5.63,1.02,1.26,1.54981,1.87.04.04.06982.08.10986.12a54.13689,54.13689,0,0,0,4.15039,4.28c.37988.35.77978.71,1.17969,1.05.76025.68,1.54,1.33,2.35009,1.95a54.77547,54.77547,0,0,0,4.94,3.47l.06.03c1.10987.69,2.23975,1.33,3.39014,1.94l.46973.24c1.08008.56,2.18017,1.09,3.31006,1.58.23.1.48.2.71.3.02.01.03027.01.05029.02a54.11484,54.11484,0,0,0,7.02,2.37,55.73235,55.73235,0,0,0,14.36963,1.88c1.77,0,3.52-.08,5.25-.25a55.50816,55.50816,0,0,0,11.64014-2.35c.01025,0,.02-.01.02978-.01a54.6047,54.6047,0,0,0,6.99023-2.77c.00977-.01.03028-.01.04-.02.50977-.24,1-.5,1.5-.75l.24024-.12c.3999-.21.7998-.42005,1.19971-.64,1-.55,1.98-1.13,2.95019-1.75.27-.16.52979-.33.79981-.51.87988-.58,1.75-1.2,2.58984-1.83.15039-.11.31006-.22.46045-.34a55.69207,55.69207,0,0,0,18.91992-62.68Zm-20.76025,60.25c-.33008.26-.66993.51-1.00977.74-.33008.25-.66016.49-1,.71-.29.21-.58008.41-.88037.6-.25.17-.5.33-.75.49q-1.24439.78-2.51953,1.5c-.09033.05-.18018.1-.27051.15-.37988.21-.75977.41-1.13965.61-.05029.03-.11035.05-.16015.08l-.06006.03c-.48.25-.96973.49-1.46.72a49.02816,49.02816,0,0,1-5.83008,2.36c-.25977.09-.52.18-.77979.26a52.45729,52.45729,0,0,1-11.02,2.24c-1.64013.15-3.30029.23-4.97021.23a51.952,51.952,0,0,1-13.58985-1.78,49.3912,49.3912,0,0,1-6.66992-2.26c-.23-.09-.46-.19-.68017-.28-.11963-.05-.23-.1-.3501-.16-.93994-.41-1.86963-.86-2.77979-1.33l-.43994-.23c-1.10986-.58-2.20019-1.2-3.26025-1.86-.38965-.24006-.77979-.49006-1.15967-.75-1.20019-.79-2.37012-1.64-3.51025-2.53-.77-.58-1.50977-1.2-2.23-1.84-.37989-.32-.75-.67-1.10987-1a50.88254,50.88254,0,0,1-4.02-4.16c-.41992-.48-.83007-.96-1.22021-1.46a3.80064,3.80064,0,0,1-.25-.31,52.65906,52.65906,0,1,1,73.12012,9.23Z"
                            transform="translate(-227.10853 -195)"
                            fill="#cbcbcb"
                          />
                          <path
                            d="M756.35257,396.14592a11.628,11.628,0,0,1,1.39117,1.19072l53.754-10.60251,4.3188-12.59026,19.85283,4.03439-5.47954,23.03159a8.83824,8.83824,0,0,1-8.156,6.78152l-62.25532,3.11909a11.597,11.597,0,1,1-3.42591-14.96454Z"
                            transform="translate(-227.10853 -195)"
                            fill="#ffb7b7"
                          />
                          <path
                            d="M810.18839,384.24407a4.96616,4.96616,0,0,1-.35879-4.1241L818.22,356.621a13.8069,13.8069,0,0,1,27.10259,5.28823l-1.21492,25.00337a4.97153,4.97153,0,0,1-5.932,4.63509l-24.63-4.88074A4.96591,4.96591,0,0,1,810.18839,384.24407Z"
                            transform="translate(-227.10853 -195)"
                            fill="#6c63ff"
                          />
                          <polygon
                            points="569.599 494.016 553.795 494.015 546.277 433.059 569.601 433.06 569.599 494.016"
                            fill="#ffb7b7"
                          />
                          <path
                            d="M800.7373,704.3346l-50.95641-.00189v-.64452a19.83474,19.83474,0,0,1,19.83366-19.83334h.00126l31.12244.00126Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <polygon
                            points="719.25 477.453 704.614 483.412 674.665 429.791 696.268 420.997 719.25 477.453"
                            fill="#ffb7b7"
                          />
                          <path
                            d="M955.86824,685.12148,908.67277,704.3346l-.243-.59694a19.83471,19.83471,0,0,1,10.89067-25.84818l.00117-.00048L948.147,666.15438Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M811.08538,435.9013l-7.27131-38.47223,0,0a39.04222,39.04222,0,0,1,6.00845-33.42771l26.58221-35.54112,25.38975.74676,0,0A144.96483,144.96483,0,0,1,868.092,420.9732l-4.667,17.95339c20.93017,18.87846,34.963,71.8092,47.73613,130.95735l35.01682,77.4416-60.2437,18.29-39.03108-113.5724L812.03674,666.46047,760.98225,664.501,799.81362,487.5195Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <circle
                            cx="624.43016"
                            cy="101.50853"
                            r="24.7683"
                            fill="#ffb7b7"
                          />
                          <path
                            d="M949.30468,352.76493c-4.60149-8.98849-6.172-19.19487-9.71361-28.65132-3.54185-9.45646-9.97631-18.83868-19.732-21.44491-5.53361-1.47831-11.41387-.57586-17.09816-1.27969-4.99788-.61882-10.37885-3.17057-12.29281-7.60939a31.34819,31.34819,0,0,0-1.61262-13.00538C885.29,270.6435,876.78718,262.646,866.87464,258.5117c-8.05176-3.35848-17.32418-4.307-25.54679-1.39054s-15.12462,10.0442-16.60281,18.64246c-1.47819,8.59832,3.26167,18.1993,11.43357,21.25348,5.86746,2.19285,13.42386,1.46274,17.25524,6.4184,3.88111,5.02034,1.099,12.33682-2.42606,17.61327l.24078.24485c11.51383.135,23.95978-2.08982,31.88992-10.43806a25.26673,25.26673,0,0,0,2.36894-2.91471c.24275.38968.49733.76975.7711,1.13283,3.99338,5.30274,10.24492,8.31095,16.201,11.24166,5.95658,2.93078,12.13377,6.22,15.71107,11.8118,6.46474,10.10519,2.22122,23.71512,5.91817,35.12746a25.94909,25.94909,0,0,0,48.80269,1.58258C962.8285,369.67783,953.90618,361.75348,949.30468,352.76493Z"
                            transform="translate(-227.10853 -195)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M709.273,416.14546l1.04786-25.4511,35.9462-71.46937a10.36832,10.36832,0,0,1,4.70375-4.67666,10.49,10.49,0,0,1,8.1044-.52915,10.48613,10.48613,0,0,1,6.5397,6.6276,10.84685,10.84685,0,0,1,.45528,2.03538,10.38645,10.38645,0,0,1-1.04243,5.97871l-35.9949,71.56621Z"
                            transform="translate(-227.10853 -195)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M755.44752,313.94722l-39.01961,77.58-2.975-1.49629,37.739-75.0339A9.94472,9.94472,0,0,1,755.44752,313.94722Z"
                            transform="translate(-227.10853 -195)"
                            fill="#3f3d56"
                          />
                          <path
                            d="M765.574,322.74552l-37.53234,74.623-2.975-1.4963L764.00541,318.453a9.9978,9.9978,0,0,1,1.1347,2.35046A10.32757,10.32757,0,0,1,765.574,322.74552Z"
                            transform="translate(-227.10853 -195)"
                            fill="#3f3d56"
                          />
                          <path
                            d="M761.83755,316.0866,722.3866,394.52422l-2.975-1.49629L758.912,314.49205a9.688,9.688,0,0,1,1.2287.51721A10.19811,10.19811,0,0,1,761.83755,316.0866Z"
                            transform="translate(-227.10853 -195)"
                            fill="#3f3d56"
                          />
                          <path
                            d="M713.78577,411.86916l-3.96976,3.19722.33277-8.42931C711.51182,407.10994,712.98747,409.16176,713.78577,411.86916Z"
                            transform="translate(-227.10853 -195)"
                            fill="#3f3d56"
                          />
                          <path
                            d="M754.71661,331.74677a11.62926,11.62926,0,0,1,.26437,1.812l47.45853,27.37864,11.53546-6.64076,12.29749,16.09916-19.27879,13.74074a8.83824,8.83824,0,0,1-10.60389-.25833l-48.93791-38.60746a11.597,11.597,0,1,1,7.26474-13.524Z"
                            transform="translate(-227.10853 -195)"
                            fill="#ffb7b7"
                          />
                          <path
                            d="M803.09159,358.2007a4.96617,4.96617,0,0,1,2.44295-3.342L827.313,342.681a13.80689,13.80689,0,0,1,16.93256,21.81292l-17.36418,18.03135a4.97154,4.97154,0,0,1-7.51684-.41172l-15.33848-19.87937A4.966,4.966,0,0,1,803.09159,358.2007Z"
                            transform="translate(-227.10853 -195)"
                            fill="#6c63ff"
                          />
                          <path
                            d="M969.73631,705h-381a1,1,0,0,1,0-2h381a1,1,0,0,1,0,2Z"
                            transform="translate(-227.10853 -195)"
                            fill="#cbcbcb"
                          />
                        </svg>
                      </figure>
                      <p className="text-center">No data yet!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        show={calenderModal}
        onHide={() => setCalenderModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-content form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h4
              style={{ display: !isEditEvent ? "block" : "none" }}
              className="form-box_title"
            >
              Add Event
            </h4>
            <h4
              style={{ display: isEditEvent ? "block" : "none" }}
              className="form-box_title"
            >
              Update Event
            </h4>
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
                    setEvent({ ...event, title: e.target.value })
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
                        onChange={() => setEvent({ ...event, type: "holiday" })}
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
                        onChange={() => setEvent({ ...event, type: "event" })}
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
                      <DatePicker
                        className="form-control"
                        selected={event.startDate || null}
                        onChange={(date) =>
                          setEvent({ ...event, startDate: date })
                        }
                        dateFormat="dd-MM-yyyy "
                        placeholderText="Enter start date"
                        popperPlacement="bottom-start"
                        popperModifiers={{
                          preventOverflow: {
                            enabled: true,
                            escapeWithReference: false,
                            boundariesElement: "viewport",
                          },
                        }}
                        minDate={new Date()}
                        ref={datePickerRef}
                      />
                      <span
                        className="input-group-btn"
                        style={{ position: "absolute", right: "0" }}
                      >
                        <span
                          type="button"
                          className="btn btn-date"
                          onClick={() => {
                            if (datePickerRef.current) {
                              datePickerRef.current.input.focus();
                            }
                          }}
                        >
                          <i className="far fa-calendar-alt"></i>
                        </span>
                      </span>
                    </p>
                  </div>
                  {event.startDate && (
                    <input
                      type="time"
                      style={{ width: "50%" }}
                      value={
                        event.startDate instanceof Date
                          ? event.startDate.toTimeString().slice(0, 5)
                          : ""
                      }
                      onChange={(e) => {
                        const timeValue = e.target.value;
                        const currentTime = new Date();
                        const hours = parseInt(timeValue.split(":")[0]);
                        const minutes = parseInt(timeValue.split(":")[1]);
                        currentTime.setHours(hours, minutes);
                        setEvent({
                          ...event,
                          startDate: currentTime,
                        });
                      }}
                      className="form-control"
                    />
                  )}
                  {event.startDate && (
                    <button className="btn" onClick={clearStartDate}>
                      <b>X</b>
                    </button>
                  )}
                </div>

                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="input-group datepicker-box border-bottom rounded-0">
                      <DatePicker
                        className="form-control"
                        selected={event.endDate || null}
                        onChange={(date) =>
                          setEvent({ ...event, endDate: date })
                        }
                        dateFormat="dd-MM-yyyy "
                        placeholderText="Enter end date"
                        popperPlacement="bottom-start"
                        popperModifiers={{
                          preventOverflow: {
                            enabled: true,
                            escapeWithReference: false,
                            boundariesElement: "viewport",
                          },
                        }}
                        minDate={new Date()}
                        ref={datePickerRef}
                      />
                      <span
                        className="input-group-btn"
                        style={{ position: "absolute", right: "0" }}
                      >
                        <span
                          type="button"
                          className="btn btn-date"
                          onClick={() => {
                            if (datePickerRef.current) {
                              datePickerRef.current.input.focus();
                            }
                          }}
                        >
                          <i className="far fa-calendar-alt"></i>
                        </span>
                      </span>
                    </p>
                  </div>
                  {event.endDate && (
                    <input
                      type="time"
                      style={{ width: "50%" }}
                      value={
                        event.endDate instanceof Date
                          ? event.endDate.toTimeString().slice(0, 5)
                          : ""
                      }
                      onChange={(e) => {
                        const timeValue = e.target.value;
                        const currentTime = new Date();
                        const hours = parseInt(timeValue.split(":")[0]);
                        const minutes = parseInt(timeValue.split(":")[1]);
                        currentTime.setHours(hours, minutes);
                        setEvent({
                          ...event,
                          endDate: currentTime,
                        });
                      }}
                      className="form-control"
                    />
                  )}
                  {event.endDate && (
                    <button className="btn" onClick={clearEndDate}>
                      <b>X</b>
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group standard-form-items mb-2">
                <div className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="customCheck"
                    name="example1"
                    checked={event.allDays}
                    onChange={() =>
                      setEvent({ ...event, allDays: !event.allDays })
                    }
                  />
                  <label className="custom-control-label" htmlFor="customCheck">
                    All day
                  </label>
                </div>
              </div>

              <h5 className="form-box_title mt-2">Institute</h5>
              <select
                name="cbLocation"
                value={event.location || ""}
                onChange={(e) => onInstituteChange(e.target.value)}
                required
                className="form-control border-bottom"
              >
                <option value="" disabled>
                  Select Institute
                </option>
                {allLocs.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>

              <h5 className="form-box_title mt-2">Classroom</h5>
              <div className="border-bottom LibraryChange_new mb-2">
                {/* <NgMultiselectDropdown
                  placeholder="Select Classroom"
                  settings={dropdownSettings}
                  className="multiSelectLocCls"
                  data={allCls}
                  value={event.classroom}
                  onChange={(value) => setEvent({ ...event, classroom: value })}
                  required
                /> */}
                <Multiselect
                  options={allCls}
                  displayValue="name"
                  selectedValues={event.classroom}
                  onSelect={(data) => setEvent({ ...event, classroom: data })}
                  onRemove={(data) => setEvent({ ...event, classroom: data })}
                  placeholder="Select Classroom"
                  className="multiSelectLocCls"
                />
              </div>

              <h4 className="form-box_subtitle mt-2">
                Students{" "}
                <span className="text-muted">
                  (Enter student user id to tag the students in an event)
                </span>
              </h4>
              <TagsInput
                //@ts-ignore
                classNames={"color-tags new-class-placeholder mb-2"}
                value={event?.students}
                //@ts-ignore
                onChange={(e) => setEvent({ ...event, students: e })}
                name="locations"
                placeHolder="+ Tag Students"
                separators={[" "]}
              />
              <div
                className="form-group standard-form-items my-2"
                style={{ position: "relative", zIndex: "0" }}
              >
                <div className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="customCheck1"
                    name="example1"
                    checked={event.allStudents}
                    onChange={(e) =>
                      setEvent({ ...event, allStudents: e.target.checked })
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheck1"
                  >
                    All Students
                  </label>
                </div>
              </div>

              <div className="section-5 ">
                <div className="sms-box">
                  <h4 style={{ fontSize: "14px" }}>
                    Schedule
                    <label className="switch">
                      <input
                        name="active"
                        type="checkbox"
                        checked={event.schedule?.active}
                        onChange={(e) =>
                          setEvent({
                            ...event,
                            schedule: {
                              ...event.schedule,
                              active: e.target.checked,
                            },
                          })
                        }
                      />
                      <span className="slider"></span>
                    </label>
                  </h4>
                  <div
                    className="disc"
                    style={{
                      display: event.schedule?.active ? "block" : "none",
                    }}
                  >
                    <div className="row">
                      <div className="col-sm-12 col-md-6 col-lg-4">
                        <div className="repeat-every">
                          <h5 className="name-teb">Repeat every</h5>
                          <select
                            name="repeatEvery"
                            value={event.schedule?.repeatEvery}
                            onChange={(e) => onRepeatChange(e.target.value)}
                          >
                            <option value="day">Once in a Day</option>
                            <option value="week">Once in a Week</option>
                            <option value="month">Once in a Month</option>
                          </select>
                        </div>
                      </div>
                      {event.schedule?.repeatEvery == "day" && (
                        <div className="col-sm-12 col-md-6 col-lg-5">
                          <div className="repeat-on">
                            <h5 className="name-teb">
                              <img
                                src="assets/images/ro.png"
                                alt=""
                                width="12"
                              />{" "}
                              Repeat on
                            </h5>
                            <div className="in-flex">
                              {[
                                "sunday",
                                "monday",
                                "tuesday",
                                "wednesday",
                                "thursday",
                                "friday",
                                "saturday",
                              ].map((day, index) => (
                                <div className="input-box-a" key={day}>
                                  <span className="checkbox">
                                    <input
                                      type="checkbox"
                                      name={`day-${day[0].toUpperCase()}${index}`}
                                      id={`day-${day[0].toUpperCase()}${index}`}
                                      checked={event.schedule.repeatOn[day]}
                                      onChange={(e) =>
                                        setEvent({
                                          ...event,
                                          schedule: {
                                            ...event.schedule,
                                            repeatOn: {
                                              ...event.schedule.repeatOn,
                                              [day]: e.target.checked,
                                            },
                                          },
                                        })
                                      }
                                    />
                                    <label
                                      htmlFor={`day-${day[0].toUpperCase()}${index}`}
                                      className=""
                                    >
                                      <div className="box-main">
                                        {day[0].toUpperCase()}
                                      </div>
                                    </label>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="col-sm-12 col-md-6 col-lg-3">
                        <div className="repeat-end">
                          <h5 className="name-teb">
                            <img
                              src="/assets/images/clock2.png"
                              alt=""
                              width="16"
                            />{" "}
                            End On
                          </h5>
                        </div>
                        <div className="on-select mb-4">
                          <div className="on-select-box d-flex align-items-center border pr-1 pl-2">
                            {/* Datepicker here */}
                            <DatePicker
                              className="form-control"
                              selected={event.schedule?.endDate || null}
                              onChange={(date) =>
                                setEvent({
                                  ...event,
                                  schedule: {
                                    ...event.schedule,
                                    endDate: date,
                                  },
                                })
                              }
                              dateFormat="dd-MM-yyyy "
                              placeholderText="Enter end date"
                              popperPlacement="bottom-start"
                              popperModifiers={{
                                preventOverflow: {
                                  enabled: true,
                                  escapeWithReference: false,
                                  boundariesElement: "viewport",
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <textarea
                  className="form-control border rounded-0"
                  rows="5"
                  id="comment"
                  value={event.summary}
                  onChange={(e) =>
                    setEvent({ ...event, summary: e.target.value })
                  }
                  placeholder="Description"
                ></textarea>
              </div>

              <div className="text-right mt-2">
                <button className="btn btn-light" onClick={cancel}>
                  Cancel
                </button>
                {!isEditEvent && (
                  <button className="btn btn-primary ml-2" onClick={addEvents}>
                    Create
                  </button>
                )}
                {isEditEvent && (
                  <button
                    className="btn btn-primary ml-2"
                    onClick={updateEvents}
                  >
                    Update
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
