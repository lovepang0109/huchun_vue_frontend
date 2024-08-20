"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as sessionService from "@/services/SessionService";
import * as userService from "@/services/userService";
import alertify from "alertifyjs";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function SessionManagement() {
  const user: any = useSession()?.data?.user?.info || {};
  const [sessions, setSessions] = useState<any>([]);
  const [minDate, setMinDate] = useState<any>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(new Date());
  const datePickerRef = useRef(null);
  const { push } = useRouter();

  useEffect(() => {
    userService.get().then((us) => {
      if (us.role === "director" || us.role === "admin") {
        console.log(us.role, "kkk");
        if (selectedSlot) {
          const d = {
            selectedSlot: selectedSlot,
          };
          sessionService.getSessions(d).then((da) => {
            setSessions(da);
          });
        }
      } else {
        push(`/home`);
      }
    });
  }, []);

  const filterSession = (date: any) => {
    setSelectedSlot(date);
    if (date) {
      const d = {
        selectedSlot: date,
      };
      sessionService.getSessions(d).then((da) => {
        setSessions(da);
      });
    } else {
      alertify.alert("Message", "Select the Date");
    }
  };

  return (
    <main className="pt-lg-3 Admininistration-admin_new session-manangmnt_new">
      <div className="container">
        <div className="dashboard-area classroom mx-auto">
          <div className="Admin-Cur_ricuLam">
            <div className="rounded-boxes bg-white">
              <div className="UserCardAdmiN-AlL1">
                <div className="row">
                  <div className="col">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">Manage</h3>
                    </div>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="upload-btn1-remove subject-card">
                      <Link className="btn btn-primary" href="./session/create">
                        Create Session
                      </Link>
                    </div>
                  </div>
                </div>
                <p className="input-group datepicker-box session-mngmt_new ah-cursor mt-3">
                  <span
                    className="material-icons mt-2 ml-3"
                    style={{ position: "relative", color: "black" }}
                  >
                    date_range
                  </span>
                  <div style={{ width: "60%" }}>
                    <DatePicker
                      className="form-control session-date"
                      selected={selectedSlot}
                      onChange={(date) => filterSession(date)}
                      placeholderText="Enter date"
                      popperPlacement="bottom-start"
                      dateFormat="dd-MM-yyyy"
                      minDate={minDate}
                      popperModifiers={{
                        preventOverflow: {
                          enabled: true,
                          escapeWithReference: false,
                          boundariesElement: "viewport",
                        },
                      }}
                    />
                  </div>

                  <span className="input-group-btn">
                    <span
                      type="button"
                      className="btn  btn-date"
                      onClick={() => {
                        // Toggle date picker by focusing on the input field
                        if (datePickerRef.current) {
                          datePickerRef.current.input.focus();
                        }
                      }}
                    >
                      <i className="glyphicon glyphicon-calendar"></i>
                    </span>
                  </span>
                </p>
                <div className="row mt-3">
                  {sessions &&
                    sessions.length > 0 &&
                    sessions.map((s) => (
                      <div className="col-lg-5" key={s._id}>
                        <div className="admin-head">
                          <h4 className="f-16">{s.title}</h4>
                          <div className="row">
                            <div className="admin-left col-lg-5 d-flex align-items-center">
                              <span className="material-icons">schedule</span>
                              <span className="admin-label ml-1 mt-0">
                                {moment(s.startDate).format("h:mm A")}
                              </span>
                            </div>
                            <div className="admin-right col-lg-7 d-flex align-items-center">
                              <span className="material-icons">timelapse</span>
                              <span className="admin-label ml-1 mt-0">
                                {s.totalTime} mins
                              </span>
                            </div>
                          </div>
                          <div className="row">
                            <div className="admin-left col-lg-5 d-flex align-items-center">
                              <span className="material-icons">groups</span>
                              <span className="admin-label ml-1 mt-0">
                                {s.classroomCount} Classroom
                              </span>
                            </div>
                            <div className="admin-right col-lg-7 d-flex align-items-center">
                              <span className="material-icons">task</span>
                              <span className="admin-label ml-1 mt-0">
                                {s.practiceCount} Tests
                              </span>
                            </div>
                          </div>
                          <div className="row">
                            <div className="admin-left col-lg-5 d-flex align-items-center">
                              <span className="material-icons">people</span>
                              <span className="admin-label ml-1 mt-0">
                                {s.totalStudents} Students
                              </span>
                            </div>
                            <div className="admin-right col-lg-7 d-flex align-items-center">
                              <span
                                className="admin-label"
                                style={{
                                  visibility: s.deactivateRemainingStudents
                                    ? "visible"
                                    : "hidden",
                                }}
                              >
                                Remaining Students:
                                <strong
                                  className={
                                    s.deactivateRemainingStudents
                                      ? "actvE1_new"
                                      : "actvE2_new"
                                  }
                                >
                                  {s.deactivateRemainingStudents
                                    ? " Deactivated"
                                    : " In Action"}
                                </strong>
                              </span>
                            </div>
                          </div>
                          <div className="admin-left d-flex align-items-center">
                            <span className="material-icons">add_alarm</span>
                            <span className="admin-label ml-1 mt-0">
                              Login Allowance Time:{s.loginAllowanceTime} mins
                            </span>
                          </div>
                          <div className="admin-view-btn-remove text-right mt-2">
                            <Link
                              className="btn btn-success"
                              href={`./session/details/${s._id.sessionId}`}
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              {sessions && sessions.length === 0 && (
                <div className="empty-data addNoDataFullpageImgs">
                  <figure>
                    <img src="/assets/images/noClass_yet.svg" alt="Not Found" />
                  </figure>
                  <h6>No Sessions Yet !</h6>
                  <p>Create your first session now</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
