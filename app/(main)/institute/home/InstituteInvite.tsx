"use client";
import { useState, useEffect, useRef } from "react";
import * as instituteService from "@/services/instituteService";
import * as authSvc from "@/services/auth";
import * as alertify from "alertifyjs";
import { date } from "@/lib/pipe";

const InstituteInvite = ({ institute, user }: any) => {
  const [emails, setEmails] = useState<string>("");
  const [invites, setInvites] = useState<any>([]);

  useEffect(() => {
    getInvitees();
  }, []);

  const getInvitees = () => {
    instituteService
      .getInstituteInvitees(user.activeLocation)
      .then((d: any) => {
        setInvites(d.invitees);
      });
  };

  const save = (em?: any) => {
    if (!em) {
      em = emails;
    }
    // validate email
    if (!em) {
      alertify.alert("Message", "Email is empty!");
      return;
    }

    const emailValidate =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/;
    const items = em.split("\n");
    for (const item of items) {
      if (!emailValidate.test(item.trim())) {
        alertify.alert("Message", "Invalid email: " + item);
        return;
      }
    }

    authSvc
      .inviteTeachers(institute._id, items)
      .then(() => {
        getInvitees();
        alertify.success("Invitation is sent!");
        setEmails("");
      })
      .catch((err) => {
        console.log(err);
        alertify.alert("Message", "Fail to send inviation!");
      });
  };

  const resend = (resend: any) => {
    setEmails(resend.email);
    save(resend.email);
  };

  return (
    <div className="institute-onboarding">
      <div className="container6 rounded-boxes bg-white m-0">
        <div className="section_heading_wrapper mb-0">
          <h3 className="section_top_heading">Invite Colleagues</h3>
          <p className="section_sub_heading">
            Invite your colleagues to help you in your new journey
          </p>
        </div>
      </div>

      <div className="container6 rounded-boxes bg-white m-0">
        <div className="section_heading_wrapper">
          <h3 className="section_top_heading">Email</h3>
          <p className="section_sub_heading">
            Enter each email in a separate line
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <textarea
            className="form-control my-2 txt-email"
            type="text"
            name="email"
            placeholder="..."
            rows="5"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            required
          />

          <div className="text-right">
            <button
              className="btn btn-primary"
              disabled={!emails.trim() || !user.activeLocation}
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {invites && invites.length > 0 && (
        <div className="folder-area clearfix bg-white">
          <div className="table-wrap table-responsive">
            <table className="table response-result mb-0 vertical-middle">
              <thead>
                <tr>
                  <th className="border-0 ml-66px">Email</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-center">Invitation Date</th>
                  <th className="border-0 text-center">Joined Date</th>
                  <th className="border-0 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {invites.map((result, index) => (
                  <tr key={index}>
                    <td className="pr-0">
                      <div className="folder mb-0 p-0">
                        <div className="p-0 border-0 clearfix">
                          <div className="d-flex inner pl-0">
                            <div className="d-flex align-items-center">
                              <h4>{result.email}</h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="progresss text-center">
                        <h4 className="f-14">
                          {result.joined ? "Joined" : "Pending"}
                        </h4>
                      </div>
                    </td>
                    <td>
                      <div className="progresss text-center">
                        <h4 className="f-14">
                          {new Date(result.invitationAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </h4>
                      </div>
                    </td>
                    <td>
                      <div className="progresss text-center">
                        <h4 className="f-14">
                          {result.joinedAt
                            ? new Date(result.joinedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : ""}
                        </h4>
                      </div>
                    </td>
                    <td>
                      <div className="progresss text-center">
                        <div className="admin-draft-btn-remove">
                          <button
                            className="btn btn-success btn-sm text-capitalize"
                            onClick={() => resend(result)}
                          >
                            Resend
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteInvite;
