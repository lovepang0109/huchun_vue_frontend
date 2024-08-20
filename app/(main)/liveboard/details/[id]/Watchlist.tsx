"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { copyText } from "@/lib/helpers";
import Ongoing from "./Ongoing";
import Watchlist from "./Watchlist";
import Upcoming from "./Upcoming";
import Completed from "./Completed";
import Attendance from "./Attendance";
import * as classroomService from "@/services/classroomService";

interface SideMenu {
  _id: string;
  name: string;
  initialized: boolean;
}

const Details: React.FC = () => {
  const [sideMenus] = useState<SideMenu[]>([
    { name: "Ongoing", _id: "ongoing", initialized: false },
    { name: "Watchlists", _id: "watchlist", initialized: false },
    { name: "Upcoming", _id: "upcoming", initialized: false },
    { name: "Completed", _id: "completed", initialized: false },
    { name: "Attendance", _id: "attendance", initialized: false },
  ]);
  const [selectedSideMenu, setSelectedSideMenu] = useState("ongoing");
  const [cls, setCls] = useState<any>(null);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    classroomService
      .findById(id, { includeUser: true, includeStudentInfo: true })
      .then((cls) => {
        setCls(cls);

        const savedMenu = sessionStorage.getItem(
          "teacher_liveboard_current_page_" + cls._id
        );
        if (savedMenu) {
          sessionStorage.removeItem(
            "teacher_liveboard_current_page_" + cls._id
          );
          const toOpenMenu = sideMenus.find((m) => m._id === savedMenu);
          if (toOpenMenu) {
            setSelectedSideMenu(toOpenMenu._id);
          }
        }
      });
  }, [id, sideMenus]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(
        "teacher_liveboard_current_page_" + cls._id,
        selectedSideMenu
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cls, selectedSideMenu]);

  const onMenuChange = (menu: SideMenu) => {
    setSelectedSideMenu(menu._id);
  };

  const copyCode = (classroom: any) => {
    copyText(classroom.seqCode);
    alert("Successfully Copied");
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
                <div className="sidebar">
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
                          {item?.name}
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
                              <img
                                height="80"
                                width="100"
                                src={cls.imageUrl}
                                alt={cls?.name}
                                style={{ borderRadius: "9px" }}
                              />
                            </div>
                            <div className="ml-2 class-board-info">
                              {cls.name && (
                                <h3 className="top-title text-truncate">
                                  {cls.name.toUpperCase()}
                                </h3>
                              )}
                              {cls.user && (
                                <p className="bottom-title">
                                  {cls.user.name.toUpperCase()}
                                </p>
                              )}
                              <h4 className="d-inline-block mr-1">
                                {cls.seqCode}
                              </h4>
                              <button
                                className="btn btn-secondary btn-sm"
                                aria-label="Proctor_copy class code"
                                onClick={() => copyCode(cls)}
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedSideMenu === "ongoing" && (
                      <Ongoing sideMenu={selectedSideMenu} cls={cls} />
                    )}
                    {selectedSideMenu === "watchlist" && (
                      <Watchlist sideMenu={selectedSideMenu} />
                    )}
                    {selectedSideMenu === "upcoming" && (
                      <Upcoming classroom={cls} />
                    )}
                    {selectedSideMenu === "completed" && (
                      <Completed classroom={cls} />
                    )}
                    {selectedSideMenu === "attendance" && (
                      <Attendance classroom={cls} />
                    )}
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

export default Details;
