"use client";

import { signOut } from "next-auth/react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBullseye,
  faChartLine,
  faCoins,
  faDisplay,
  faFile,
  faStore,
  faChalkboard,
  faPowerOff,
  faCode,
  faFileSignature,
  faUniversity,
  facog,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import { success, confirm } from "alertifyjs";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const clientApi = axios.create();
import * as userSevice from "@/services/userService";
import * as serviceSvc from "@/services/suportService";
import * as instituteSvc from "@/services/instituteService";
import Link from "next/link";
import styles from "react-loading-overlay-ts/dist/styles";
import { useState, useEffect } from "react";
import { avatar } from "@/lib/pipe";
import { useStyleRegistry } from "styled-jsx";

export function DropDownMenu() {
  const [module, setModule]: any = useState({});
  // const userInfo: any = useSession()?.data?.user?.info || {};
  const userInfo: any = useSession()?.data?.user?.info || {};
  const [user, setUser] = useState<any>(null);
  const router = usePathname();
  const [hasMembership, setHasMembership] = useState<boolean>(false);
  const [canSetupInstitute, setCanSetupInstitute] = useState<boolean>(false);
  const [institutes, setInstitutes] = useState<any>(null);
  const [activeInstitute, setActiveInstitute] = useState<any>(null);
  const [myInstitute, setMyInstitute] = useState<any>(null);
  const { push } = useRouter();
  const { update } = useSession();

  useEffect(() => {
    clientApi
      .get(`/api/settings`)
      .then((res) => {
        setModule(res.data.features);

        if (userInfo.role != "admin" && res.data.features.services) {
          serviceSvc.checkAvailable().then((res: any) => {
            setHasMembership(res.isAvailable);
          });
        }
        instituteSvc.getMyInstitutes().then((inst) => {
          const tmp_inst = inst;
          userSevice.get().then((us) => {
            if (us.activeLocation) {
              const tmp_active = tmp_inst.find(
                (i) => i._id == us.activeLocation
              );
              if (tmp_active) {
                tmp_active.selected = true;
                let user_tmp = us;
                if (us.primaryInstitute) {
                  user_tmp.primaryInstitute.logo = tmp_active.imageUrl;

                  if (tmp_active.preferences) {
                    user_tmp.primaryInstitute.preferences =
                      tmp_active.preferences;
                  }
                  setUser(user_tmp);
                  // this.authSvc.updateCurrentUser(this.user)
                }
              }
              // one institute can have many directors but only one owner
              let tmp_myIn = tmp_inst.find((i) => i.user == us._id);
              if (!tmp_myIn && us.role == "director") {
                tmp_myIn = tmp_active;
              }
              setMyInstitute(tmp_myIn);
              setActiveInstitute(tmp_active);
            }
            setInstitutes(tmp_inst);
            if (userInfo.role === "teacher" && res.data.features.newInstitute) {
              const activeInstitute = userInfo.activeLocation
                ? inst.find((i) => i._id === userInfo.activeLocation)
                : null;

              if (userInfo.activeLocation) {
                setCanSetupInstitute(
                  inst.length === 0 ||
                    (activeInstitute?.isDefault && inst.length === 1)
                );
              } else {
                setCanSetupInstitute(true);
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const openMyInstitute = async () => {
    if (!myInstitute) {
      if (userInfo.role == "publisher") {
        push(`/institute/wizard`);
      }
      return;
    }
    if (userInfo.activeInstitute != myInstitute._id) {
      await instituteSvc.changeActiveInstitute(myInstitute._id);

      setUser({
        ...user,
        activeLocation: myInstitute._id,
      });
      await update();
    }
    setActiveInstitute(myInstitute);
    push("/institute/home");
  };

  useEffect(() => {
    userSevice.get().then((us) => {
      setUser(us);
    });
  }, [userInfo]);

  const logoutFuction = async () => {
    confirm("Are you sure you want to log out?")
      .setHeader("Message")
      .setting({
        onok: async function () {
          signOut({ callbackUrl: "/" });
        },
      });
  };

  return (
    <ul className="nav user-area ml-auto" style={{ right: -15 }}>
      <li className="nav-item user mr-0">
        <div className="dropdown-logout-mob">
          <div className="dropdown">
            <a
              role="button"
              id="dropdown-profile-box-btn"
              aria-label="pro1"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <figure>
                <div className="profile-user">
                  <img
                    src={"/assets/images/defaultProfile.png"}
                    alt="this is student profile photo"
                  />
                </div>
              </figure>
            </a>
            <div
              className="dropdown-menu dropdown-menu-right vertical-Expand py-1 border-0"
              aria-label="pro2"
              aria-labelledby="dropdown-profile-box-btn1"
              style={{ fontSize: "16px" }}
            >
              {router !== "/onboarding" && (
                <>
                  <div className="dp_bg">
                    <img src="/assets/images/wall.png" alt="" />
                    {/* <img src="user?.coverImageUrl" alt="" /> */}
                  </div>
                  <div className="profile_img_dropdown_wrapper">
                    <img
                      className="profile_img_dropdown"
                      src={avatar(user)}
                      alt=""
                    />
                    <div className="side_infor">
                      <strong className="user_name">{user?.name}</strong>
                      <p className="user_id">{user?.email}</p>
                      <strong className="user_id">
                        <strong>{typeof userInfo?.role === 'string' ? userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1) : ''}</strong>
                      </strong>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    className="dropdown-item px-3"
                    href="/profile/home/basic"
                  >
                    <FontAwesomeIcon icon={faUser} /> My Profile
                  </Link>
                  {module.marketplace &&
                    (user?.role == "director" ||
                      user?.role == "operator" ||
                      user?.role == "admin") && (
                      <Link className="dropdown-item px-3" href="/marketplace">
                        <FontAwesomeIcon icon={faStore} /> Marketplace
                      </Link>
                    )}
                  {user?.role == "operator" && (
                    <Link className="dropdown-item px-3" href="/administration">
                      <i className="fas fa-cog"></i>Administration
                    </Link>
                  )}
                  {user?.role == "director" && (
                    <>
                      <Link
                        className="dropdown-item px-3"
                        href="/institute/home"
                      >
                        <FontAwesomeIcon icon={faUniversity} /> My Institute
                      </Link>
                      {user.canCreateMultiLocations && (
                        <Link
                          className="dropdown-item px-3"
                          href="/institute/wizard"
                        >
                          <i className="fas fa-university"></i>Create a new
                          Institute
                        </Link>
                      )}
                      {user?.primaryInstitute.preferences?.reports && (
                        <Link
                          className="dropdown-item px-3"
                          href="/administration/report"
                        >
                          <FontAwesomeIcon icon={faFile} /> Report
                        </Link>
                      )}
                      <Link
                        className="dropdown-item px-3"
                        href="/administration"
                      >
                        <i className="fas fa-cog"></i>Administration
                      </Link>
                      {module.services && hasMembership && (
                        <Link className="dropdown-item px-3" href="/membership">
                          <i className="fas fa-server"></i> Membership
                        </Link>
                      )}
                      {user?.primaryInstitute.preferences.eCommerce
                        ?.showRevenue && (
                        <Link className="dropdown-item px-3" href="/revenue">
                          <i className="fa fa-wallet"></i> Revenue
                        </Link>
                      )}
                      {module.content && (
                        <Link className="dropdown-item px-3" href="/content">
                          <i className="fa fa-book"></i> Content Library
                        </Link>
                      )}
                    </>
                  )}

                  {user?.role == "teacher" && (
                    <>
                      {canSetupInstitute && (
                        <Link
                          className="dropdown-item px-3"
                          href="/institute/wizard"
                        >
                          <i className="fas fa-university"></i>Setup Institute
                        </Link>
                      )}
                      {module.evaluation &&
                        (!user?.primaryInstitute ||
                          user?.primaryInstitute.preferences?.assessment
                            .evaluation) && (
                          <Link
                            className="dropdown-item px-3"
                            href="/evaluation"
                          >
                            <FontAwesomeIcon icon={faFileSignature} />{" "}
                            Evaluation
                          </Link>
                        )}
                      {module.codeEditor &&
                        (!user?.primaryInstitute ||
                          user?.primaryInstitute.preferences?.codeEditor) && (
                          <Link
                            className="dropdown-item px-3"
                            href="/code-editor"
                          >
                            <FontAwesomeIcon icon={faCode} /> Code Editor
                          </Link>
                        )}
                      {module.services && hasMembership && (
                        <Link className="dropdown-item px-3" href="/membership">
                          <i className="fa fa-server"></i> Membership
                        </Link>
                      )}
                      {!user?.primaryInstitute ||
                        (user?.primaryInstitute.preferences?.reports && (
                          <Link
                            className="dropdown-item px-3"
                            href="/administration/report"
                          >
                            <FontAwesomeIcon icon={faFile} /> Report
                          </Link>
                        ))}
                    </>
                  )}

                  {user?.role === "publisher" && (
                    <>
                      <Link
                        className="dropdown-item px-3"
                        href="/administration/curriculum"
                      >
                        <FontAwesomeIcon icon={faBook} /> Curriculum
                      </Link>

                      <Link
                        className="dropdown-item px-3"
                        href="/administration/program"
                      >
                        <i className="fas fa-layer-group"></i> Programs
                      </Link>
                      <a
                        className="dropdown-item px-3"
                        onClick={openMyInstitute}
                      >
                        <i className="fas fa-university"></i> My Institute
                      </a>
                      {user?.primaryInstitute?.owned && (
                        <Link
                          className="dropdown-item px-3"
                          href="/administration/user"
                        >
                          <FontAwesomeIcon icon={faUser} /> User Management
                        </Link>
                      )}
                      {module.codeEditor && (
                        <Link
                          className="dropdown-item px-3"
                          href="/code-editor"
                        >
                          <FontAwesomeIcon icon={faCode} /> Code Editor
                        </Link>
                      )}
                      {module.content && (
                        <Link className="dropdown-item px-3" href="/content">
                          <i className="far fa-book"></i> Content Library
                        </Link>
                      )}
                    </>
                  )}
                  {user?.role === "student" && user?.primaryInstitute && (
                    <>
                      {module.myPerformance && (
                        <Link
                          className="dropdown-item px-3"
                          href={`/student-performance/${userInfo._id}`}
                        >
                          <i className="fas fa-chart-line"></i>My Performance
                        </Link>
                      )}

                      {module.myEducoins && (
                        <Link
                          className="dropdown-item px-3"
                          href="/my-edu-coins"
                        >
                          <FontAwesomeIcon icon={faCoins} /> My Educoins
                        </Link>
                      )}

                      {module.resume && (
                        <Link className="dropdown-item px-3" href="/resume">
                          <i className="fa-regular fa-file"></i> Resume
                        </Link>
                      )}

                      {module.marketplace && module.marketplaceForStudent && (
                        <Link
                          className="dropdown-item px-3"
                          href="/marketplace"
                        >
                          <FontAwesomeIcon icon={faStore} /> Marketplace
                        </Link>
                      )}

                      {module.classboard &&
                        user?.primaryInstitute?.preferences?.classboard && (
                          <Link
                            className="dropdown-item px-3"
                            href="/classboard"
                          >
                            <i
                              className="fas fa-chalkboard"
                              aria-hidden="true"
                            ></i>
                            Class Quiz
                          </Link>
                        )}
                    </>
                  )}
                </>
              )}

              <div className="dropdown-divider"></div>
              <a
                className="dropdown-item px-3"
                onClick={() => {
                  logoutFuction();
                }}
              >
                <FontAwesomeIcon icon={faPowerOff} /> Log Out
              </a>
            </div>
          </div>
        </div>
      </li>
    </ul>
  );
}
