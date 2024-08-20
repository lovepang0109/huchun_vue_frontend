"use client";

import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

import alertify, { alert } from "alertifyjs";

import { useState, useEffect } from "react";
import validator from "validator";

export default function InviteMentor() {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    alertify.set("confirm", "title", "Message");
  });

  const inviteMentorFun = (e: any) => {
    if (!validator.isEmail(userId) && userId != "") {
      alertify.alert("Message", "Please add correct Email");
    }

    if (userId && phoneNumber && phoneNumber.length !== 10) {
      alertify.alert("Message", "Please add correct phone number");
      return;
    }

    setSubmitted(true);

    const condition = {
      mentorId: "",
    };

    if (userId) {
      condition.mentorId = userId;
    } else {
      condition.mentorId = phoneNumber;
    }
    if (!condition.mentorId) {
      alertify.alert("Message", "Please add Email or Phone number");
    } else {
      clientApi
        .get(`/api/student/mentors/findOne${toQueryString(condition)}`)
        .then((data) => {
          alertify.confirm("Are you sure you want to send invitation", () => {
            clientApi
              .get(
                `/api/student/sendInvitation${toQueryString(
                  condition.mentorId
                )}`
              )
              .then(() => {
                alertify.success("Invitation has sent successfully.");
                setUserId("");
                setPhoneNumber("");
                setSubmitted(false);
              });
          });
        })
        .catch((err) => {
          alertify.success("Invite Failed");
        });
    }
  };

  return (
    <div className="mentor-homepage pt-lg-0">
      <div>
        <div className="dashboard-area classroom mx-auto">
          <div className="row">
            <div className="col-md-auto">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Invite Mentor</h3>
                <p className="section_sub_heading">
                  Invite your favourite mentor to Perfectice
                </p>
              </div>
            </div>
            <div className="col-md"></div>
          </div>
          <div className="mentor-invite">
            <div className="login-area">
              <div className="rounded-boxes bg-white mw-100 shadow-none m-0">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="mt-0">Mentor&apos;s Email</label>

                      <input
                        className="form-control"
                        value={userId}
                        name="userId"
                        onChange={(event) => setUserId(event?.target.value)}
                        placeholder="Enter Mentor Email Id"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="mt-0">Mentor&apos;s Phone Number</label>
                      <input
                        className="form-control border-bottom rounded-0"
                        value={phoneNumber}
                        minLength={10}
                        maxLength={10}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        name="phoneNumber"
                        placeholder="Enter Mentor's Phone Number"
                      />
                    </div>
                  </div>
                </div>
                <div className="mentor-invite" style={{ height: "50px" }}>
                  <div
                    className="text-right mt-2"
                    style={{ width: "100px", float: "right" }}
                  >
                    <button
                      className="btn btn-primary"
                      onClick={inviteMentorFun}
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
