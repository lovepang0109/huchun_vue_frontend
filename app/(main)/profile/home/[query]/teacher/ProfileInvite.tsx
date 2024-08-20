"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import alertify from "alertifyjs";

const ProfileInvite = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [emails, setEmails]: any = useState("");

  const save = async (e: any) => {
    e.preventDefault();
    // validate email
    if (!emails) {
      alertify.alert("Message", "Email is empty!");
      return;
    }

    let emailValidate =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/;
    let items = emails.split("\n");
    for (let item of items) {
      if (!emailValidate.test(item.trim())) {
        alertify.alert("Message", "Invalid email: " + item);
        return;
      }
    }

    try {
      await clientApi.post(`/api/users/inviteToJoin`, { emails });
      alertify.success("Invitation is sent!");
      setEmails("");
    } catch (error) {
      alertify.alert("Message", "Fail to send inviation!");
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="institute-onboarding Stu_profile">
      <div>
        <div className="container6 bg-white rounded-boxes m-0">
          <div className="section-heading-wrapper mb-0">
              <h3
                className="section_top_heading"
                style={{ marginLeft: 0, fontSize: "unset" }}
              >
                Invite Colleagues{" "}
              </h3>
              <p className="section_sub_heading">
                Invite your colleagues to help you in your new journey
              </p>
          </div>
          
        </div>

        <div className="container6 bg-white rounded-boxes m-0">
          <div className="section_heading_wrapper"><h3 className="section_top_heading">Email</h3></div>
          
          <form name="fmEmail" onSubmit={save}>
            <textarea
              className="form-control my-2 txt-email"
              name="email"
              placeholder="Please enter the email"
              rows={5}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              required={true}
            ></textarea>
            <div className="text-right">
              <button className="btn btn-primary" disabled={!emails}>
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProfileInvite;
