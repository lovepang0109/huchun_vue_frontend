"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { alert, error, success } from "alertifyjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClassroomAttempt from "./ClassroomAttempt";
import ClassroomStudents from "./ClassroomStudents";
import ClassroomAssessments from "./ClassroomAssessments";
import ClassroomCourses from "./ClassroomCourses";
import ClassroomTestSeries from "./ClassroomTestseries";
import ClassroomFeed from "./ClassroomFeed";
import ClassroomAnalytics from "./ClassroomAnalytics";
import ClassroomMember from "./ClassroomMember";
import ClassroomFolder from "./ClassroomFolder";
import ClassroomAssignment from "./ClassroomAssignment";
import StudentClassroomAssignment from "./StudentAssignment";
import ClassroomSettings from "./ClassroomSettings";
import StudentAssessments from "./StudentAssessments";
import StudentCourse from "./StudentCourse";
import StudentTestSeries from "./StudentTestSeries";
import * as classroomSvc from "@/services/classroomService";
import * as courseService from "@/services/courseService";
import * as userService from "@/services/userService";
import StudentFolder from "./StudentFolder";

const ClassroomDetail = () => {
  const { id } = useParams();
  const user: any = useSession()?.data?.user?.info || {};

  const [course, setCourse]: any = useState();
  const [instructors, setInstructors] = useState<any>([]);
  const userInfo = user?.info;
  const getClientData: any = {};
  const [classroom, setClassrom] = useState<any>([]);
  const [sideMenus, setSideMenus] = useState<any>([]);
  const [selectedSideMenu, setSelectedSideMenu] = useState("");
  const [settings, setSettings]: any = useState();

  const { push } = useRouter();

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };
  useEffect(() => {
    userService.get().then((user) => {
      if (user.role === "student") {
        setSelectedSideMenu("assessments");
      } else {
        setSelectedSideMenu("attempts");
      }
    });
  }, []);

  useEffect(() => {
    getClientDataFunc();
    classroomSvc
      .findById(id, {
        includeUser: true,
        checkSession: true,
        owners: true,
        classroomSetting: true,
      })
      .then((classroom) => {
        setClassrom(classroom);
        const sidemenu = rebuildMenu();
        setSideMenus(sidemenu);
        courseService
          .getClassroomCourse(id, { status: "published", limit: 1 })
          .then((clsCourse) => {
            setCourse(clsCourse[0]);
            if (clsCourse[0]) {
              clsCourse[0].instructors?.forEach((p) => {
                const ins = instructors;
                ins.push(p.name);
                setInstructors(ins);
              });
            }
          });
      })
      .catch((err) => {
        error("Fail to load classroom data");
        push("/classroom");
      });
  }, []);

  useEffect(() => {
    const sidemenu = rebuildMenu();
    setSideMenus(sidemenu);
  }, [settings, classroom]);

  const onSettingChanged = () => {
    const sidemenu = rebuildMenu();
    setSideMenus(sidemenu);

    if (!sideMenus.find((m) => m._id == selectedSideMenu)) {
      onMenuChange(sideMenus[0]._id);
    }
  };

  const rebuildMenu = () => {
    if (user.role === "student") {
      const sidemenus = [];
      if (
        settings?.features?.assessment &&
        (!user?.primaryInstitute ||
          user?.primaryInstitute.preferences.assessment.isShow)
      ) {
        sidemenus.push({
          name: "Assessments",
          _id: "assessments",
        });
      }
      if (
        settings?.features.course &&
        (!user?.primaryInstitute ||
          user?.primaryInstitute.preferences.course.isShow)
      ) {
        sidemenus.push({
          name: "Courses",
          _id: "courses",
        });
      }
      if (
        settings?.features.testseries &&
        (!user?.primaryInstitute ||
          user?.primaryInstitute.preferences.testSeries.isShow)
      ) {
        sidemenus.push({
          name: "Test Series",
          _id: "testseries",
        });
      }
      if (user.role === "student") {
        if (classroom.showMembers) {
          sidemenus.push({
            name: "Members",
            _id: "members",
          });
        }
      } else {
        // if (classroom.showMembers) {
        sidemenus.push({
          name: "Members",
          _id: "members",
        });
        // }
      }

      if (classroom.showCollab) {
        sidemenus.push({
          name: "Discussions",
          _id: "feed",
        });
      }

      if (user?.primaryInstitute) {
        if (
          user?.primaryInstitute.preferences?.classroom.folder &&
          classroom.showFolder
        ) {
          sidemenus.push({
            name: "Folder",
            _id: "folder",
          });
        }
        if (
          user?.primaryInstitute?.preferences?.classroom.assignment &&
          classroom.showAssignment
        ) {
          sidemenus.push({
            name: "Assignments",
            _id: "assignments",
          });
        }
      } else {
        if (classroom.showFolder) {
          sidemenus.push({
            name: "Folder",
            _id: "folder",
          });
        }
        if (classroom.showAssignment) {
          sidemenus.push({
            name: "Assignments",
            _id: "assignments",
          });
        }
      }
      return sidemenus;
    } else {
      const sidemenus = [];

      sidemenus.push({
        name: "Results",
        _id: "attempts",
      });

      if (classroom.showMembers) {
        sidemenus.push({
          name: "Students",
          _id: "students",
        });
      }

      if (
        settings?.features?.assessment &&
        (!user.primaryInstitute ||
          user.primaryInstitute.preferences.assessment.isShow)
      ) {
        sidemenus.push({
          name: "Assessments",
          _id: "assessments",
        });
      }
      if (
        settings?.features?.course &&
        (!user.primaryInstitute ||
          user.primaryInstitute.preferences.course.isShow)
      ) {
        sidemenus.push({
          name: "Courses",
          _id: "courses",
        });
      }
      if (
        settings?.features?.testseries &&
        (!user.primaryInstitute ||
          user.primaryInstitute.preferences.testSeries.isShow)
      ) {
        sidemenus.push({
          name: "Test Series",
          _id: "testseries",
        });
      }

      sidemenus.push({
        name: "Analytics",
        _id: "analysis",
      });

      if (classroom.showCollab) {
        sidemenus.push({
          name: "Collaboration",
          _id: "feed",
        });
      }

      sidemenus.push({
        name: "Settings",
        _id: "settings",
      });

      if (user.primaryInstitute) {
        if (
          user.primaryInstitute.preferences?.classroom.assignment &&
          classroom.showAssignment
        ) {
          sidemenus.push({
            name: "Assignments",
            _id: "assignments",
          });
        }

        if (
          user.primaryInstitute.preferences?.classroom.folder &&
          classroom.showFolder
        ) {
          sidemenus.push({
            name: "Folder",
            _id: "folder",
          });
        }
      } else {
        if (classroom.showAssignment) {
          sidemenus.push({
            name: "Assignments",
            _id: "assignments",
          });
        }
        if (classroom.showFolder) {
          sidemenus.push({
            name: "Folder",
            _id: "folder",
          });
        }
      }

      return sidemenus;
    }
  };

  const onMenuChange = (menu: any) => {
    console.log(menu);
    setSelectedSideMenu(menu._id);
  };

  const updateSideMenuInitialState = (data: any) => {
    const index = sideMenus.findIndex((e) => e._id == data.menu);
    if (index > -1) {
      if (data.refresh) {
        sideMenus[index].initialized = false;
      } else {
        sideMenus[index].initialized = true;
      }
    }
  };
  if (userInfo) {
    if (userInfo.primaryInstitute) {
      if (
        userInfo.primaryInstitute.preferences?.classroom.folder &&
        classroom.showFolder
      ) {
        sideMenus.push({
          name: "Folder",
          _id: "folder",
          initialized: false,
        });
      }
      if (
        userInfo.primaryInstitute.preferences?.classroom.assignment &&
        classroom.showAssignment
      ) {
        sideMenus.push({
          name: "Assignments",
          _id: "assignments",
          initialized: false,
        });
      }
    } else {
      sideMenus.push(
        {
          name: "Folders",
          _id: "folder",
          initialized: false,
        },
        {
          name: "Assignments",
          _id: "assignments",
          initialized: false,
        }
      );
    }
  }

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
                  {sideMenus?.map((item, index) => {
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
                      href={"/classroom"}
                      className="text-center text-white px-2"
                    >
                      All Classes
                    </Link>
                  </div>
                  <br />

                  <ul className="mt-0">
                    {sideMenus?.map((item, index) => {
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
                {selectedSideMenu === "attempts" && (
                  <ClassroomAttempt id={id} settings={settings} user={user} />
                )}
                {selectedSideMenu === "students" && (
                  <ClassroomStudents
                    classroom={classroom}
                    settings={settings}
                    user={user}
                  />
                )}
                {selectedSideMenu === "analysis" && (
                  <ClassroomAnalytics
                    classroom={classroom}
                    settings={settings}
                    user={user}
                  />
                )}
                {selectedSideMenu === "folder" &&
                  (user.role === "student" ? (
                    <StudentFolder classroom={classroom} />
                  ) : (
                    <ClassroomFolder />
                  ))}
                {selectedSideMenu === "assessments" &&
                  (user.role === "student" ? (
                    <StudentAssessments
                      classroom={classroom}
                      settings={settings}
                    />
                  ) : (
                    <ClassroomAssessments
                      classroom={classroom}
                      settings={settings}
                      user={user}
                    />
                  ))}
                {selectedSideMenu === "courses" &&
                  (user.role === "student" ? (
                    <StudentCourse classroom={classroom} settings={settings} />
                  ) : (
                    <ClassroomCourses
                      classroom={classroom}
                      settings={settings}
                      user={user}
                    />
                  ))}
                {selectedSideMenu === "testseries" &&
                  (user.role === "student" ? (
                    <StudentTestSeries
                      classroom={classroom}
                      settings={settings}
                    />
                  ) : (
                    <ClassroomTestSeries classroom={classroom} />
                  ))}
                {selectedSideMenu === "settings" && (
                  <ClassroomSettings
                    classroom={classroom}
                    setClassrom={setClassrom}
                    user={user}
                    getClientData={settings}
                  />
                )}
                {selectedSideMenu === "feed" && (
                  <ClassroomFeed
                    course={course}
                    classroom={classroom}
                    setClassrom={setClassrom}
                    getClientData={settings}
                    user={user}
                  />
                )}
                {selectedSideMenu === "members" && <ClassroomMember />}
                {selectedSideMenu === "assignments" &&
                  (user.role === "student" ? (
                    <StudentClassroomAssignment classroom={classroom} />
                  ) : (
                    <ClassroomAssignment
                      classroom={classroom}
                      setClassrom={setClassrom}
                      getClientData={settings}
                      user={user}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ClassroomDetail;
