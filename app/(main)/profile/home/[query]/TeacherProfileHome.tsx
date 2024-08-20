"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import clientApi from "@/lib/clientApi";
import * as userService from "@/services/userService";
import Link from "next/link";
import ProfileBasic from "./teacher/ProfileBasic";
import ChangePassword from "./teacher/ChangePassword";
import SubjectsProfile from "./teacher/Subjects";

import ProfileYourPosts from "./teacher/ProfileYourPosts";
import ProfileSavedPosts from "./teacher/ProfileSavedPosts";
import ProfileAmbassador from "./teacher/ProfileAmbassador";
import ProfileManageAccount from "./teacher/ProfileManageAccount";
import ProfileExperience from "./teacher/ProfileExpereience";
import ProfileInvite from "./teacher/ProfileInvite";
import ProfileSummary from "./teacher/ProfileSummary";
import ProfilePreferences from "./teacher/ProfilePreferences";
import ProfileReferral from "./teacher/ProfileReferral";
const TeacherProfileHome = ({ user,settings }: any) => {
  const [sideMenus, setSideMenus] = useState<any>([
    {
      name: "Basic Information",
      _id: "basic",
    },
    {
      name: "Experiences",
      _id: "experiences",
    },
    {
      name: "Change Password",
      _id: "changepassword",
    },
  ]);

  const [selectedSideMenu, setSelectedSideMenu] = useState<string>("basic");

  const [resumeSideMenus, setResumeSideMenus] = useState<any>([
    {
      name: "Education",
      _id: "education",
    },
    {
      name: "Entrance Exam",
      _id: "entranceexam",
    },
    {
      name: "Industry Certification",
      _id: "industrycertification",
    },

    {
      name: "Training & Internship",
      _id: "trainingandinternship",
    },
    {
      name: "Academic Projects",
      _id: "academicprojects",
    },
    {
      name: "Extra Curricular Activities",
      _id: "extracurricularactivities",
    },
    {
      name: "Awards & Recognations",
      _id: "awardsandrecognations",
    },
    {
      name: "Technical Skills",
      _id: "technicalskills",
    },
    {
      name: "External Assessments",
      _id: "externalsssessments",
    },
    {
      name: "Revision History",
      _id: "revisionhistory",
    },
  ]);

  const [resumeSelectedSideMenu, setResumeSelectedSideMenu] =
    useState<string>("education");

  useEffect(() => {
    userService.get().then((usr) => {
      clientApi.get(`/api/settings`).then((res) => {
        const side = [...sideMenus];
        if (
          !usr.primaryInstitute ||
          usr.primaryInstitute.preferences.general.editProfileSubject
        ) {
          side.push({
            name: "Programs",
            _id: "programs",
          });
        }

        if (usr.role == "teacher" || usr.role == "director") {
          if (
            res.data.features.ambassadorProgram &&
            usr.primaryInstitute?.preferences?.ambassadorProgram
          ) {
            side.push({
              name: "Referrals",
              _id: "ambassadorProgram",
            });
          }
        }

        if (usr.role !== "operator") {
          side.push({
            name: "Invite",
            _id: "invite",
          });
        }

        if (
          usr.role !== "operator" &&
          usr.role !== "support" &&
          usr.role !== "publisher" &&
          usr.role !== "director"
        ) {
          side.push(
            {
              name: "Your Posts",
              _id: "youposts",
            },
            {
              name: "Saved Posts",
              _id: "savedposts",
            }
          );
        }

        side.push({
          name: "Manage Account",
          _id: "closeAccount",
        });
        setSideMenus(side);
      });
    });
  }, []);

  const onMenuChange = (menu: any): void => {
    setSelectedSideMenu(menu._id);
  };
  const onResumeMenuChange = (menu: any): void => {
    setResumeSelectedSideMenu(menu._id);
  };

  return (
    <>
      <div className="d-block d-lg-none">
        <div className="container">
          <div className="dashboard-area classroom">
            <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mt-2">
              <button
                id="teacher_profile_navbar"
                aria-label="teacher_profile_navbar mobile view"
                className="navbar-toggler ml-auto"
                type="button"
                data-toggle="collapse"
                data-target="#navbarContentMobile"
                aria-controls="navbarContentMobile"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div
                className="collapse navbar-collapse"
                id="navbarContentMobile"
              >
                <ul className="navbar-nav mr-auto">
                  {sideMenus.map((item, index) => (
                    <li
                      className="mb-1"
                      key={index}
                      onClick={() => onMenuChange(item)}
                    >
                      <a
                        className={
                          item._id === selectedSideMenu ? "active" : ""
                        }
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <main className="pt-lg-3">
        <div className="container">
          <div className="dashboard-area classroom mx-auto">
            <div className="row">
              <div className="d-none d-lg-block col-lg-2">
                <div className="sidebar">
                  <div className="all-classes-btn">
                    <a className="text-center text-white px-2">My Profile</a>
                  </div>
                  <br />
                  <ul className="mt-0">
                    {sideMenus.map((item, index) => (
                      <li key={index} onClick={() => onMenuChange(item)}>
                        <a
                          className={
                            item._id === selectedSideMenu ? "active" : ""
                          }
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                    {selectedSideMenu === "resume" && (
                      <div className="sidebar">
                        <ul
                          className="mt-0"
                          style={{ padding: "5px 0 19px 28px" }}
                        >
                          {resumeSideMenus.map((item, index) => (
                            <li
                              key={index}
                              onClick={() => onResumeMenuChange(item)}
                            >
                              <a
                                className={
                                  item._id === resumeSelectedSideMenu
                                    ? "active"
                                    : ""
                                }
                              >
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </ul>
                </div>
              </div>

              <div className="col-lg-10">
                {/* Main content */}
                {selectedSideMenu === "summary" && (
                  <ProfileSummary onEdit={onMenuChange} user={user} />
                )}
                {selectedSideMenu === "basic" && <ProfileBasic />}
                {selectedSideMenu === "changepassword" && <ChangePassword />}
                {selectedSideMenu === "programs" && (
                  <SubjectsProfile user={user} />
                )}
                {selectedSideMenu === "preferences" && <ProfilePreferences />}
                {selectedSideMenu === "youposts" && <ProfileYourPosts />}
                {selectedSideMenu === "savedposts" && <ProfileSavedPosts />}
                {selectedSideMenu === "invite" && <ProfileInvite />}
                {selectedSideMenu === "experiences" && <ProfileExperience />}
                {selectedSideMenu === "ambassadorProgram" && <ProfileReferral settings={settings}/>}
                {selectedSideMenu === "closeAccount" && (
                  <ProfileManageAccount />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default TeacherProfileHome;
