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
    <div className="institute-onboarding">
      <div className="container">
        <div className="container6 bg-white py-4 px-5">
          <h3
            className="admin-head"
            style={{ marginLeft: 0, fontSize: "unset" }}
          >
            Invite Colleagues{" "}
          </h3>
          <p className="admin-head2">
            Invite your colleagues to help you in your new journey
          </p>
        </div>

        <div className="container6 bg-white mt-2 py-4 px-5">
          <h3 className="admin-head2">Email</h3>
          <form name="fmEmail" onSubmit={save}>
            <textarea
              className="form-control my-3 txt-email"
              name="email"
              placeholder="Enter each email line by line"
              rows={5}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              required={true}
            ></textarea>
            <div className="text-right">
              <button className="btn btn-primary px-5 bold" disabled={!emails}>
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
