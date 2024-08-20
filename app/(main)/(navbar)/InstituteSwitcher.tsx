"use client";

import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faCheck,
  faDoorOpen,
  faPlus,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import clientApi from "@/lib/clientApi";
import { success, confirm } from "alertifyjs";
import { usePathname } from "next/navigation";
import { getSession, useSession } from "next-auth/react";
import { refreshCurrentUserData } from "@/lib/helpers";
import alertify from "alertifyjs";

export function InstituteSwitcher() {
  const [activeInstitute, setActiveInstitute]: any = useState();
  const [institute, setInstitute]: any = useState();
  const [getClientData, setClientData]: any = useState();
  const [instituteCode, setInstituteCode] = useState<string>("");
  const [institutes, setInstitutes]: any = useState([]);
  const [allInstitutes, setAllInstitutes]: any = useState([]);
  const [isAdd, setIsAdd]: any = useState(false);
  const [isCheckedPass, setIsCheckedPass]: any = useState(false);
  const [myInstitute, setMyInstitute]: any = useState();
  const user: any = useSession()?.data?.user?.info || {};
  const pathname = usePathname();
  const { update } = useSession();

  const search = (e: any) => {
    if (e.keyCode === 13) {
    }
  };

  const cancelSearch = () => {};

  const instituteChanged = async (ins: any) => {
    await clientApi.put(`/api/institute/changeActiveInstitute`, {
      instituteId: ins._id,
    });
    setActiveInstitute(ins);
    success("You have successfully joined the institue");
    // this does not updating user info since update() is builtin funtion for refreshing session token.
    await update();
    //TODO need set user after institute changed.
    location.reload();
  };

  const joinInstitute = () => {
    if (!instituteCode || instituteCode.length < 6) {
      return;
    }

    const existing = institutes.find((i: any) => i.code == instituteCode);
    if (existing) {
      instituteChanged(existing);
      return;
    }

    const code = instituteCode;
    clientApi
      .post(`/api/institute/join`, { code })
      .then(async (res: any) => {
        alertify.success("You have successfully joined new institute");
        setInstituteCode("");
        console.log(res);
        await update();
        refreshCurrentUserData().then(() => {
          window.location.reload();
        });
      })
      .catch((err: any) => {
        setIsAdd(false);
        console.log(err);
        alertify
          .alert("Message", "Invalid institute code")
          .setHeader("Message");
      });

    // this.instituteSvc.joinInstitute(instituteCode).subscribe(
    //   (res: any) => {
    //     alertify.success("You have successfully joined new institute");
    //     this.instituteCode = "";
    //     this.user.activeLocation = res.institute;
    //     this.authSvc.refreshCurrentUserData(() => {
    //       window.location.reload();
    //     });
    //   },
    //   (err) => {
    //     alertify.alert("Message","Invalid institute code");
    //   }
    // );
  };

  const leaveInstitute = (ins: any) => {
    if (ins._id) {
      confirm("Are you sure you leave this institute?", (msg: any) => {
        clientApi.post(`/api/institute/leave`, { id: ins._id }).then((da) => {
          alertify.success("You have successfully left the institute");
          refreshCurrentUserData().then(() => {
            window.location.reload();
          });
        });
      });
    }
  };
  const convertMenu = () => {
    const menu = document.querySelector(".dropdown-logout-mob .dropdown");
    console.log(menu);
    menu?.setAttribute("class", "dropdown show");

    const itemList = document.querySelector(
      ".dropdown-logout-mob .dropdown .dropdown-menu"
    );
    console.log(itemList);
    itemList?.setAttribute(
      "class",
      "dropdown-menu dropdown-menu-right vertical-Expand border-0 show"
    );
  };
  const getMyInstitutes = async () => {
    const result = (await clientApi.get(`/api/institute/mine`)).data;
    setInstitutes(result);
    setAllInstitutes(result);
    if (user?.activeLocation) {
      let temp = result.find((i: any) => i._id == user?.activeLocation);
      setActiveInstitute(temp);
      if (temp) {
        temp.selected = true;
        setActiveInstitute(temp);
        if (user?.primaryInstitute) {
          user.primaryInstitute.logo = temp.imageUrl;
          // this.authSvc.updateCurrentUser(user);
        }
      }
      // one institute can have many directors but only one owner
      let tempMyInstitute = result.find((i: any) => i.user == user?._id);
      setMyInstitute(tempMyInstitute);
      if (!tempMyInstitute && user.role == "director") {
        setMyInstitute(temp);
      }
    }
  };

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    getMyInstitutes();
    getClientDataFunc();
  }, [user]);

  return (
    <ul className="nav user-area ml-auto" style={{ right: 80 }}>
      <li className="nav-item user mr-0">
        <div className="dropdown-logout-mob">
          <div className="dropdown">
            <button
              role="button"
              id="dropdown-profile-box-btn"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              aria-label="header_insititute"
              className="btn shadow-none border-bottom pb-0 dropdown-toggle d-lg-block d-none"
            >
              {" "}
              {activeInstitute && <FontAwesomeIcon icon={faBuildingColumns} />}
              <span className="mx-2">
                {activeInstitute ? activeInstitute.name : "Join an institute"}
              </span>
              <FontAwesomeIcon icon={faCaretDown} />
            </button>
            <button
              aria-label="button-menu for mobile view"
              className="btn shadow-none p-0 pb-0 dropdown-toggle d-lg-none d-block"
            >
              {" "}
              {activeInstitute && <FontAwesomeIcon icon={faBuildingColumns} />}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-right vertical-Expand border-0"
              aria-label="pro2"
              aria-labelledby="dropdown-profile-box-btn1"
            >
              {user?.role === "admin" && (
                <div className="d-flex px-2 pt-1">
                  <input
                    type="text"
                    name="instituteName"
                    placeholder="Search Institute "
                    className="flex-grow border-bottom px-2 "
                    value={institute}
                    onKeyUp={(e) => search(e)}
                    style={{ minWidth: 100 }}
                    onChange={(e) => setInstitute(e.target.value)}
                  />
                  <i
                    onClick={(e) => {
                      cancelSearch();
                      e.stopPropagation();
                    }}
                    className="fas fa-times d-flex align-items-center"
                  ></i>
                </div>
              )}
              {institutes.map((ins: any, index: any) => {
                let tempClass = ["institute-item", "d-inline"];
                if (ins._id == activeInstitute?._id) {
                  tempClass.push(styles["purple-text"], "bold");
                }
                if (ins._id !== activeInstitute?._id) {
                  tempClass.push(styles.space);
                }
                return (
                  <li
                    role="menuitem"
                    key={index}
                    className="d-flex align-items-center mt-1 px-2"
                  >
                    <div className="flex-grow-1">
                      {ins._id == activeInstitute?._id && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                      <a
                        className={tempClass.join(" ")}
                        style={{
                          paddingTop: "1px !important",
                          paddingBottom: "1px !important",
                        }}
                        onClick={(e) => instituteChanged(ins)}
                      >
                        {ins.name}
                      </a>
                    </div>
                    {ins.user != user._id &&
                      ins._id != activeInstitute?._id && (
                        <a
                          className=""
                          onClick={(e) => leaveInstitute(ins)}
                          title="leave institute"
                        >
                          <FontAwesomeIcon icon={faDoorOpen} />
                        </a>
                      )}
                  </li>
                );
              })}
              {getClientData?.features.joinInstitute &&
                user?.role !== "director" &&
                user?.role !== "support" &&
                user?.role !== "operator" && (
                  <div>
                    <li role="menuitem">
                      {isAdd ? (
                        <div>
                          <li className="divider dropdown-divider"></li>
                          <div className="d-flex px-2 border-top pt-1">
                            <input
                              type="text"
                              name="instituteName"
                              placeholder="Institute Code . . ."
                              className="flex-grow border-bottom px-2 "
                              value={instituteCode}
                              minLength={6}
                              maxLength={24}
                              style={{ minWidth: 100, border: "none" }}
                              onChange={(e) => {
                                setInstituteCode(e.target.value);
                                setIsCheckedPass(e.target.value.length < 6);
                              }}
                            />
                            <i
                              onClick={(e) => {
                                setIsAdd(false);
                                e.stopPropagation();
                                setTimeout(convertMenu, 1);
                              }}
                              className="fas fa-times d-flex align-items-center"
                            ></i>
                            <button
                              className="btn btn-primary  ml-2"
                              aria-label="insititute"
                              onClick={joinInstitute}
                              disabled={!instituteCode}
                            >
                              Join
                            </button>
                          </div>
                          {isCheckedPass && (
                            <p
                              style={{ fontSize: 12 }}
                              className="text-danger mx-2 mt-1"
                            >
                              Institute Identifier/Code must have at least 6
                              characters.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div
                          className="flex-grow-1 mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsAdd(true);
                            setTimeout(convertMenu, 1);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            style={{ marginLeft: 16 }}
                          />
                          <a
                            className={
                              styles["institute-item"] + " d-inline" + " ml-2"
                            }
                          >
                            Add Institute
                          </a>
                        </div>
                      )}
                    </li>
                  </div>
                )}
            </ul>
          </div>
        </div>
      </li>
    </ul>
  );
}
