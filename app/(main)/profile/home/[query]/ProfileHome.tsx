"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

import Link from "next/link";
import ProfileBasic from "./ProfileBasic";
import ChangePassword from "./ChangePassword";
import SubjectsProfile from "./teacher/Subjects";
import CertificatesProfile from "./Certificates";
import ProfileHistory from "./ProfileHistory";
import ProfileYourPosts from "./ProfileYourPosts";
import ProfileSavedPosts from "./ProfileSavedPosts";
import ProfileAmbassador from "./ProfileAmbassador";
import ProfileTransactions from "./ProfileTransactions";
import ProfileManageAccount from "./ProfileManageAccount";
import ProfileExperience from "./ProfileExpereience";
import ProfileInvite from "./ProfileInvite";
import ProfileReferral from "./ProfileReferral";

const ProfileHome = ({ user, settings }: any) => {
  const [menus, setmenus]: any = useState([]);
  const { query } = useParams();
  const { push } = useRouter();
  let sideMenus: Array<{
    _id: string;
    name: string;
    initialized: boolean;
    link: string;
  }> = [
      {
        name: "About you",
        _id: "basic",
        initialized: false,
        link: "/profile/home/basic",
      },
      {
        name: "Change Password",
        _id: "password",
        initialized: false,
        link: "/profile/home/password",
      },
      {
        name: "Subject",
        _id: "subject",
        initialized: false,
        link: "/profile/home/subject",
      },
      {
        name: "My Certificates",
        _id: "certificates",
        initialized: false,
        link: "/profile/home/certificates",
      },
      {
        name: "History",
        _id: "history",
        initialized: false,
        link: "/profile/home/history",
      },
      {
        name: "Your Posts",
        _id: "my_post",
        initialized: false,
        link: "/profile/home/my_post",
      },
      {
        name: "Saved Posts",
        _id: "saved_post",
        initialized: false,
        link: "/profile/home/saved_post",
      },
      {
        name: "Ambassador Program",
        _id: "ambassador",
        initialized: false,
        link: "/profile/home/ambassador",
      },
      {
        name: "Transactions",
        _id: "transactions",
        initialized: false,
        link: "/profile/home/transactions"
      }, {
        name: "Referrals",
        _id: "referrals",
        initialized: false,
        link: "/profile/home/referrals"
      },
      {
        name: "Manage Account",
        _id: "account",
        initialized: false,
        link: "/profile/home/account",
      },
    ];
  let teacherSideMenus: Array<{
    _id: string;
    name: string;
    initialized: boolean;
    link: string;
  }> = [
      {
        name: "Basic Information",
        _id: "basic",
        initialized: false,
        link: "/profile/home/basic",
      },
      {
        name: "Experiences",
        _id: "experiences",
        initialized: false,
        link: "/profile/home/experiences",
      },
      {
        name: "Change Password",
        _id: "password",
        initialized: false,
        link: "/profile/home/password",
      },
      {
        name: "Subjects",
        _id: "subject",
        initialized: false,
        link: "/profile/home/subject",
      },
      {
        name: "Invite",
        _id: "invite",
        initialized: false,
        link: "/profile/home/invite",
      },
      {
        name: "Your Posts",
        _id: "my_post",
        initialized: false,
        link: "/profile/home/my_post",
      },
      {
        name: "Saved Posts",
        _id: "saved_post",
        initialized: false,
        link: "/profile/home/saved_post",
      },
      {
        name: "Manage Account",
        _id: "account",
        initialized: false,
        link: "/profile/home/account",
      },
    ];
  const [selectedSideMenu, setSelectedSideMenu] = useState(query);

  const onMenuChange = (menu: any) => {
    setSelectedSideMenu(menu._id);
    push(menu.link);
  };

  return (
    <div>
      <div className="container">
        <div className="search-bar">
          <div id="wrap">
            <form>
              <div className="form-group">
                <div className="arrow">
                  <a id="arrow">
                    <figure>
                      <img src="/assets/images/arrow-left.png" alt="" />
                    </figure>
                  </a>
                </div>

                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="What're we looking for?"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-block d-lg-none">
        <div className="container">
          <div className="dashboard-area classroom">
            <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mt-2 mw-100">
              <div className="navbar-brand p-0"></div>

              <button
                id="menuhover"
                aria-label="classroom menubar"
                className="navbar-toggler px-0"
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
                  {user?.role === "student" &&
                    sideMenus.map((item, index) => {
                      return (
                        <li
                          className="mb-1"
                          key={index}
                          onClick={() => onMenuChange(item)}
                        >
                          <a
                            className={
                              item._id == selectedSideMenu ? "active" : ""
                            }
                          >
                            {item?.name}
                          </a>
                        </li>
                      );
                    })}
                  {user?.role !== "student" &&
                    teacherSideMenus.map((item, index) => {
                      return (
                        <li
                          className="mb-1"
                          key={index}
                          onClick={() => onMenuChange(item)}
                        >
                          <a
                            className={
                              item._id == selectedSideMenu ? "active" : ""
                            }
                          >
                            {item?.name}
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <main className="pt-lg-3 pt-0">
        <div className="container">
          <div className="dashboard-area classroom mx-auto mw-100">
            <div className="row">
              <div className="d-none d-lg-block col-lg-2">
                <div className="sidebar w-auto" sticky-menu={"true"}>
                  <div className="all-classes-btn">
                    <Link
                      href={"/profile/home/basic"}
                      className="text-center text-white px-2"
                    >
                      My Profile
                    </Link>
                  </div>
                  <br />
                  <ul className="mt-0">
                    {user?.role === "student" &&
                      sideMenus.map((item, index) => {
                        return (
                          <li
                            className="mb-1"
                            key={index}
                            onClick={() => onMenuChange(item)}
                          >
                            <a
                              className={
                                item._id == selectedSideMenu ? "active" : ""
                              }
                            >
                              {item?.name}
                            </a>
                          </li>
                        );
                      })}
                    {user?.role !== "student" &&
                      teacherSideMenus.map((item, index) => {
                        return (
                          <li
                            className="mb-1"
                            key={index}
                            onClick={() => onMenuChange(item)}
                          >
                            <a
                              className={
                                item._id == selectedSideMenu ? "active" : ""
                              }
                            >
                              {item?.name}
                            </a>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>

              <div className="col-lg-10">
                {selectedSideMenu === "basic" && <ProfileBasic />}
                {selectedSideMenu === "password" && <ChangePassword />}
                {selectedSideMenu === "experiences" && <ProfileExperience />}
                {selectedSideMenu === "subject" && (
                  <SubjectsProfile user={user} />
                )}
                {selectedSideMenu === "certificates" && <CertificatesProfile />}
                {selectedSideMenu === "history" && <ProfileHistory />}
                {selectedSideMenu === "invite" && <ProfileInvite />}
                {selectedSideMenu === "my_post" && <ProfileYourPosts />}
                {selectedSideMenu === "saved_post" && <ProfileSavedPosts />}
                {selectedSideMenu === "ambassador" && <ProfileAmbassador />}
                {selectedSideMenu === "transactions" && <ProfileTransactions />}
                {selectedSideMenu === "referrals" && <ProfileReferral settings={settings} />}
                {selectedSideMenu === "account" && <ProfileManageAccount />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ProfileHome;
