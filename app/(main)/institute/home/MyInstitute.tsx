"use client";
import { useState, useEffect, useRef } from "react";
import * as eventSvc from "@/services/eventBusService";
import * as authService from "@/services/auth";
import * as userService from "@/services/userService";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import InstituteBasic from "./InstituteBasic";
import InstituteSummary from "./InstituteSummary";
import InstituteAppearance from "./InstituteAppearance";
import InstituteSubject from "./InstituteSubject";
import InstituteInvite from "./InstituteInvite";
import InstitutePreferences from "./InstitutePreferences";
import InstituteSettings from "./InstituteSettings";
import InstituteLicenses from "./InstituteLicenses";

const MyInstitute = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const queryParams = useSearchParams();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [sideMenus, setSideMenus] = useState<any>([
    {
      name: "Basic Information",
      _id: "basic",
    },
    {
      name: "Appearance",
      _id: "appearance",
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedSideMenu, setSelectedSideMenu] = useState<string>("basic");
  const [institute, setIinstitute] = useState<any>({
    preferences: {
      general: {
        editProfileSubject: true,
        resume: true,
        chat: true,
        notification: true,
        signup: true,
        sessionMangement: true,
      },
    },
  });
  useEffect(() => {
    userService.get().then((user) => {
      authService
        .getInstitute(user.activeLocation, {
          programs: true,
          subjects: true,
          teachers: true,
        })
        .then((res) => {
          setIinstitute(res);
        });
    });
  }, []);

  useEffect(() => {
    authService
      .getInstitute(user.activeLocation, {
        programs: true,
        subjects: true,
        teachers: true,
      })
      .then((res) => {
        const menus: any = [
          {
            name: "Basic Information",
            _id: "basic",
          },
          {
            name: "Appearance",
            _id: "appearance",
          },
        ];
        if (res?.preferences?.general?.editProfileSubject) {
          menus.push({
            name: "Programs",
            _id: "programs",
          });
        }
        if (user._id == res.user || user.role == "admin") {
          menus.push(
            {
              name: "Preferences",
              _id: "preferences",
            },
            {
              name: "Settings",
              _id: "settings",
            }
          );
        }
        menus.push(
          {
            name: "Profile Summary",
            _id: "summary",
          },
          {
            name: "Invite Teachers",
            _id: "invite",
          },
          {
            name: "Licenses",
            _id: "licenses",
          }
        );
        if (queryParams.get("menu")) {
          if (menus.find((m) => m._id == queryParams.get("menu"))) {
            setSelectedSideMenu(queryParams.get("menu"));
          }
        }
        setSideMenus(menus);
        setInitialized(true);
      })
      .catch((err) => {
        console.error(err);
        setInitialized(true);
      });
    setIsLoading(true);
  }, [user]);

  const updatePreferences = (newPreferences: any) => {
    setIinstitute({
      ...institute,
      preferences: newPreferences,
    });
    let menus = sideMenus;
    if (newPreferences?.general?.editProfileSubject) {
      if (menus.findIndex((r) => r._id == "programs") == -1) {
        menus.push({
          name: "Programs",
          _id: "programs",
        });
      }
    } else {
      menus = menus.filter((e) => e._id !== "programs");
    }
    setSideMenus(menus);
  };

  const onMenuChange = (menu: any): void => {
    setSelectedSideMenu(menu._id);
  };

  const updateInstituteDetails = (value: any) => {
    setIinstitute(value);
  };

  const updateInstituteProgram = (data: any) => {
    setIinstitute({
      ...institute,
      programs: [...institute.programs, { _id: data._id, name: data.name }],
    });
    eventSvc.emit("new.institute.program", { _id: data._id, name: data.name });
  };

  return (
    <main className="mentor-homepage-profile Stu_profile pt-3">
      <div className="container">
        <div className="row">
          <div className="col-lg-2">
            <div className="dashboard-area classroom mx-auto">
              <div className="sidebar">
                <div className="all-classes-btn">
                  <a className="text-center text-white px-2">My Institute</a>
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
          </div>
          <div className="col-lg-10">
            {initialized && institute && (
              <>
                {selectedSideMenu === "summary" && (
                  <InstituteSummary
                    institute={institute}
                    onEdit={onMenuChange}
                    user={user}
                  />
                )}
                {selectedSideMenu === "basic" && isLoading && (
                  <InstituteBasic
                    institute={institute}
                    setIinstitute={setIinstitute}
                  />
                )}
                {selectedSideMenu === "appearance" && (
                  <InstituteAppearance
                    institute={institute}
                    setIinstitute={setIinstitute}
                  />
                )}
                {selectedSideMenu === "programs" && (
                  <InstituteSubject
                    institute={institute}
                    setIinstitute={setIinstitute}
                    user={user}
                  />
                )}
                {selectedSideMenu === "invite" && (
                  <InstituteInvite institute={institute} user={user} />
                )}
                {selectedSideMenu === "preferences" && (
                  <InstitutePreferences
                    updatePreferences={updatePreferences}
                    user={user}
                  />
                )}
                {selectedSideMenu === "settings" && (
                  <InstituteSettings
                    institute={institute}
                    setIinstitute={setIinstitute}
                    user={user}
                  />
                )}
                {selectedSideMenu === "licenses" && (
                  <InstituteLicenses institute={institute} user={user} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MyInstitute;
