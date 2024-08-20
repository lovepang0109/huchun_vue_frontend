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
import clientApi from "@/lib/clientApi";
import Link from "next/link";

export default function AdministrationHome() {
  const datePickerRef = useRef(null);
  const [settings, setSettings] = useState<any>(null);

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

  const [fbParams, setFbParams] = useState<any>({
    page: 1,
    limit: 5,
  });

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

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    getClientDataFunc();

    getWeekDays();
    sessionSvc
      .getSessions({
        selectedSlot: new Date(),
      })
      .then((da: []) => {
        setSessions(da);
      });
  }, []);

  const getClassroom = () => {
    classroomSvc
      .getClassRoomByLocation([user.activeLocation])
      .then((data: any[]) => {
        setAllCls(data);
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

        setEvents(unique);
        getDayEvents(new Date(), unique);
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
      (d) => new Date(d.startDate).getDate() == day.getDate() && d.type == type
    );
    return !!result;
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
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
    getClassroom();
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
    if (ev && ev._id) {
      setIsEditEvent(true);
      classroomSvc
        .getClassRoomByLocation([user.activeLocation])
        .then((data: any[]) => {
          setAllCls(data);
          if (ev.classroom && ev.classroom.length > 0) {
            ev.classroom.forEach((e, j) => {
              const index = data.findIndex((c) => c._id == e);
              ev.classroom[j] = data[index];
            });
          }
          ev.startDate = new Date(ev.startDate);
          ev.endDate = new Date(ev.endDate);
          ev.schedule?.endDate &&
            (ev.schedule.endDate = new Date(ev.schedule?.endDate));
          setEvent(ev);
        });
    }
    setCalenderModal(true);
  };

  const deleteEvent = (id: any) => {
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

  const onInstituteChange = async () => {
    if (!event.location) {
      return;
    }
    if (!loadedClasses[event.location]) {
      // this.loadedClasses[this.event.location] = await firstValueFrom(this.classroomSvc.getClassRoomByLocation([this.event.location]))
      classroomSvc.getClassRoomByLocation([event.location]).then((res) => {
        setLoadedClasses({
          ...loadedClasses,
          [event.location]: res,
        });

        setAllCls(loadedClasses[event.location]);
        setEvent({
          ...event,
          classroom: [],
        });
      });
    }
  };

  // const openFileSelector = () => {
  //   fileBrowseRef?.current?.click();
  // };

  return (
    <>
      <main className="p-0 Admin_DashneW">
        <div className="container">
          <section className="admin-top-area-common">
            <div className="container">
              <h3 className="title">Administration</h3>
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
                    <span className="material-icons">settings</span>
                    <h5 className="card-title-common ml-2">My Institute</h5>
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
                    <span className="material-icons">add_shopping_cart</span>
                    <h5 className="card-title-common ml-2">Marketplace</h5>
                  </div>
                  <div className="card-body-common">
                    <p className="card-text-common">
                      Get contents from marketplace
                    </p>
                    <div className="text-right mt-2">
                      <Link
                        className="btn btn-outline btn-sm"
                        href="/marketplace"
                      >
                        Go
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
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
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="chart_boxes ">
                  <div className="admin-header">
                    <div className="row">
                      <div className="col">
                        <h4 className="admin-head">Session Management</h4>
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
                      {sessions.map((session) => (
                        <div
                          className="d-flex justify-content-between"
                          key={session.id}
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
                            {eventsByDay.slice(0, eventLimit).map((item) => (
                              <div key={item._id}>
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

              <h5 className="form-box_title mt-2">Classroom</h5>
              <div className="border-bottom LibraryChange_new mb-2">
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
