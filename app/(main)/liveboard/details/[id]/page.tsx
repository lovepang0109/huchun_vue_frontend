"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import Ongoing from "./Ongoing";
import Watchlist from "./Watchlist";
import Upcoming from "./Upcoming";
import Completed from "./Completed";
import Attendance from "./Attendance";
import { useSession } from "next-auth/react";
import { toQueryString } from "@/lib/validator";
import { useRouter } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import CustomCarousel from "@/components/assessment/carousel";
import PImageComponent from "@/components/AppImage";
import clientApi from "@/lib/clientApi";
import alertify from "alertifyjs";

const DetailsComponent = () => {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [selectedSideMenu, setSelectedSideMenu] = useState("ongoing");

  const sideMenus = [
    {
      name: "Ongoing",
      _id: "ongoing",
      initialized: false,
    },
    {
      name: "Watchlists",
      _id: "watchlist",
      initialized: false,
    },
    {
      name: "Upcoming",
      _id: "upcoming",
      initialized: false,
    },
    {
      name: "Completed",
      _id: "completed",
      initialized: false,
    },
    {
      name: "Attendance",
      _id: "attendance",
      initialized: false,
    },
  ];

  useEffect(() => {
    // Fetch classroom data
    const fetchClassroom = async () => {
      try {
        const classroom = await classroomService.findById(id, {
          includeUser: true,
          includeStudentInfo: true,
        });
        setCls(classroom);

        const savedMenu = sessionStorage.getItem(
          `teacher_liveboard_current_page_${classroom._id}`
        );
        if (savedMenu) {
          sessionStorage.removeItem(
            `teacher_liveboard_current_page_${classroom._id}`
          );
          const toOpenMenu = sideMenus.find((m) => m._id === savedMenu);
          if (toOpenMenu) {
            setSelectedSideMenu(toOpenMenu._id);
          }
        }
      } catch (error) {
        console.error("Error fetching classroom data:", error);
      }
    };

    fetchClassroom();
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      sessionStorage.setItem(
        `teacher_liveboard_current_page_${cls?._id}`,
        selectedSideMenu
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cls, selectedSideMenu]);

  const onMenuChange = (menu) => {
    setSelectedSideMenu(menu._id);
  };

  const copyCode = (classroom) => {
    helper.copyText(classroom.seqCode);
    alertify.success("Successfully Copied");
  };

  return (
    <>
      <div className="container">
        <div className="search-bar">
          <div id="wrap">
            <form>
              <div className="form-group">
                <div className="arrow">
                  <a id="arrow">
                    <figure>
                      <img src="assets/images/arrow-left.png" alt="" />
                    </figure>
                  </a>
                </div>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="What're we looking for ?"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-block d-lg-none">
        <div className="container">
          <div className="dashboard-area classroom">
            <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mt-2">
              <button
                className="navbar-toggler px-0"
                type="button"
                data-toggle="collapse"
                aria-label="proctor_mobilenavbar"
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
                  {sideMenus.map((item) => (
                    <li
                      key={item._id}
                      className="mb-1"
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
                <div className="sidebar" sticky-menu>
                  <div className="all-classes-btn">
                    <a className="text-center text-white px-2" href="./../../">
                      All Classes
                    </a>
                  </div>
                  <br />
                  <ul className="mt-0">
                    {sideMenus.map((item) => (
                      <li key={item._id} onClick={() => onMenuChange(item)}>
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
              </div>

              <div className="col-lg-10">
                {cls && (
                  <>
                    {selectedSideMenu !== "ongoing" && (
                      <div className="topHeader-Liveboard">
                        <div className="rounded-boxes class-board assignment bg-white">
                          <div className="square_profile_info d-flex align-items-center liveTop-img">
                            <div className="squared-rounded_wrap_80 liveTop-imgInner">
                              <PImageComponent
                                height={80}
                                width={100}
                                imageUrl={cls.imageUrl}
                                text={cls.name}
                                radius={9}
                                fontSize={15}
                                type="classroom"
                              />
                            </div>
                            <div className="ml-2 class-board-info">
                              <h3 className="top-title text-truncate">
                                {cls.name?.toUpperCase()}
                              </h3>
                              <p className="bottom-title">
                                {cls.user?.name?.toUpperCase()}
                              </p>
                              <h4 className="d-inline-block mr-1">
                                {cls.seqCode}
                              </h4>
                              <button
                                className="btn btn-secondary btn-sm"
                                aria-label="Procotr_copy class code"
                                onClick={() => copyCode(cls)}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <Ongoing
                      hidden={selectedSideMenu !== "ongoing"}
                      sideMenu={selectedSideMenu}
                      cls={cls}
                    />
                    <Watchlist
                      hidden={selectedSideMenu !== "watchlist"}
                      sideMenu={selectedSideMenu}
                    />
                    <Upcoming
                      classroom={cls}
                      hidden={selectedSideMenu !== "upcoming"}
                    />
                    <Completed
                      classroom={cls}
                      hidden={selectedSideMenu !== "completed"}
                    />
                    <Attendance
                      classroom={cls}
                      hidden={selectedSideMenu !== "attendance"}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DetailsComponent;
