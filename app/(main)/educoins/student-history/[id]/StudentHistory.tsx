"use client";
import React, { useEffect, useState } from "react";
import * as userService from "@/services/userService";
import { useParams } from "next/navigation";
import moment from "moment";
import { avatar } from "@/lib/pipe";
import Link from "next/link";

const StudentHistory = () => {
  const { id } = useParams();
  const [userCoins, setUserCoins] = useState<any>([]);
  const [allDates, setAllDates] = useState<any>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [currYear, setCurrYear] = useState<any>(new Date().getFullYear());

  useEffect(() => {
    setCurrentMonth(new Date().getMonth());
    getUserHistory(new Date());
  }, []);

  const getAllDates = (d: any) => {
    const dates: any = [];
    d.sort((a, b) => b._id.day - a._id.day);
    d.forEach((el) => {
      let day = el._id.day;
      switch (el._id.month) {
        case 1:
          day = day + " Jan";
          break;
        case 2:
          day = day + " Feb";
          break;
        case 3:
          day = day + " Mar";
          break;
        case 4:
          day = day + " Apr";
          break;
        case 5:
          day = day + " May";
          break;
        case 6:
          day = day + " Jun";
          break;
        case 7:
          day = day + " Jul";
          break;
        case 8:
          day = day + " Aug";
          break;
        case 9:
          day = day + " Sept";
          break;
        case 10:
          day = day + " Oct";
          break;
        case 12:
          day = day + " Nov";
          break;
        case 13:
          day = day + " Dec";
          break;
      }
      const includeDate = dates.findIndex(
        (e) => e.toString() === day.toString()
      );
      if (includeDate == -1) {
        dates.push(day);
      }
    });
    return dates;
  };

  const checkDate = (uc: any, d: any) => {
    let day = uc._id.day;
    switch (uc._id.month) {
      case 1:
        day = day + " Jan";
        break;
      case 2:
        day = day + " Feb";
        break;
      case 3:
        day = day + " Mar";
        break;
      case 4:
        day = day + " Apr";
        break;
      case 5:
        day = day + " May";
        break;
      case 6:
        day = day + " Jun";
        break;
      case 7:
        day = day + " Jul";
        break;
      case 8:
        day = day + " Aug";
        break;
      case 9:
        day = day + " Sept";
        break;
      case 10:
        day = day + " Oct";
        break;
      case 12:
        day = day + " Nov";
        break;
      case 13:
        day = day + " Dec";
        break;
    }

    return day === d;
  };

  const getUserHistory = (date: any) => {
    const currentMonth = new Date(date).getMonth();
    date = new Date(date.setDate(2));
    const monthStart = moment(date).startOf("month").add(1, "days");
    const monthEnd = moment(date).endOf("month");
    setUserCoins([]);
    setAllDates([]);

    userService
      .getUserSuperCoinActivities(id, {
        timezoneOffset: new Date().getTimezoneOffset(),
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      })
      .then((d: any[]) => {
        if (d && d.length > 0) {
          setUser(d[0].userInfo[0]);
        }
        setUserCoins(
          d.filter((c) => new Date(c.createdAt).getMonth() == currentMonth)
        );
        setAllDates(
          getAllDates(
            d.filter((c) => new Date(c.createdAt).getMonth() == currentMonth)
          )
        );
      });
  };

  const changeMonth = (mon: any) => {
    switch (mon) {
      case "jan":
        const jan = new Date(new Date().setMonth(0));
        getUserHistory(jan);
        break;
      case "feb":
        const feb = new Date(new Date().setMonth(1));
        getUserHistory(feb);
        break;
      case "mar":
        const mar = new Date(new Date().setMonth(2));
        getUserHistory(mar);
        break;
      case "apr":
        const apr = new Date(new Date().setMonth(3));
        getUserHistory(apr);
        break;
      case "may":
        const may = new Date(new Date().setMonth(4));
        getUserHistory(may);
        break;
      case "jun":
        const jun = new Date(new Date().setMonth(5));
        getUserHistory(jun);
        break;
      case "jul":
        const jul = new Date(new Date().setMonth(6));
        getUserHistory(jul);
        break;
      case "aug":
        const aug = new Date(new Date().setMonth(7));
        getUserHistory(aug);
        break;
      case "sept":
        const sept = new Date(new Date().setMonth(8));
        getUserHistory(sept);
        break;
      case "oct":
        const oct = new Date(new Date().setMonth(9));
        getUserHistory(oct);
        break;
      case "nov":
        const nov = new Date(new Date().setMonth(10));
        getUserHistory(nov);
        break;
      case "dec":
        const dec = new Date(new Date().setMonth(11));
        getUserHistory(dec);
        break;
    }
  };

  return (
    <>
      <main className="pt-3">
        <div className="container">
          <div className="dashboard-area classroom mx-auto mw-100">
            <div className="row myeducoins-section">
              <div className="col-lg-2">
                <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mb-2">
                  <button
                    aria-controls="navbarContentMobile"
                    className="navbar-toggler ml-auto"
                    data-target="#navbarContentMobile"
                    data-toggle="collapse"
                    type="button"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <div
                    className="collapse navbar-collapse"
                    id="navbarContentMobile"
                  >
                    <ul className="navbar-nav ml-auto">
                      <li>
                        <Link href="/educoins?tab=educoins">EduCoins</Link>
                      </li>
                      <li>
                        <Link href="/educoins?tab=redeem">Redeem</Link>
                      </li>
                      <li>
                        <Link className="active" href="/educoins?tab=members">
                          Members
                        </Link>
                      </li>
                      <li>
                        <Link href="/educoins?tab=requests">Requests</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
              <div className="col-lg-10 Admin-Cur_ricuLam ProGrammE">
                <div className="rounded-boxes history-body mt-0">
                  <div className="row align-items-center">
                    <div className="col-lg-12">
                      <div className="section_heading_wrapper mb-4">
                        <h3 className="section_top_heading f-16 text-uppercase">
                          History
                        </h3>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-12">
                      <div className="d-flex align-items-center">
                        <figure className="user_img_circled_wrap">
                          <img alt="" className="avatar" src={avatar(user)} />
                        </figure>
                        <div className="inner ml-2">
                          <h4 className="profile_user_name">{user?.name}</h4>
                          <p className="f-14 admin-info1 mt-0 ml-0">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-12 history-select-body">
                      <div className="history-select-body">
                        <div className="history-select m-2">
                          <span className="m-2">Month:</span>
                          <select
                            name=""
                            onChange={(e) => changeMonth(e.target.value)}
                          >
                            <option selected={currentMonth === 0} value="jan">
                              January {currYear}
                            </option>
                            <option selected={currentMonth === 1} value="feb">
                              February {currYear}
                            </option>
                            <option selected={currentMonth === 2} value="mar">
                              March {currYear}
                            </option>
                            <option selected={currentMonth === 3} value="apr">
                              April {currYear}
                            </option>
                            <option selected={currentMonth === 4} value="may">
                              May {currYear}
                            </option>
                            <option selected={currentMonth === 5} value="jun">
                              June {currYear}
                            </option>
                            <option selected={currentMonth === 6} value="july">
                              July {currYear}
                            </option>
                            <option selected={currentMonth === 7} value="aug">
                              August {currYear}
                            </option>
                            <option selected={currentMonth === 8} value="sept">
                              September {currYear}
                            </option>
                            <option selected={currentMonth === 9} value="oct">
                              October {currYear}
                            </option>
                            <option selected={currentMonth === 10} value="nov">
                              November {currYear}
                            </option>
                            <option selected={currentMonth === 11} value="dec">
                              December {currYear}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  {allDates && allDates.length ? (
                    allDates.map((date) => (
                      <div key={date} className="history-cart mt-1">
                        <div className="date-box">
                          <h5>
                            <span>
                              <img src="/assets/images/calendar.png" alt="" />
                            </span>
                            {date}
                          </h5>
                        </div>
                        {userCoins.map(
                          (uc) =>
                            checkDate(uc, date) && (
                              <div key={uc.id} className="content-box">
                                <div className="left-box">
                                  {uc.activityType === "earned" && (
                                    <>
                                      <h6>
                                        {uc.supercoins.length ? (
                                          <>
                                            Completed {uc.count}
                                            {uc.supercoins[0].mode !== "code" &&
                                              uc.supercoins[0].mode !==
                                                "profile" &&
                                              ` ${uc.supercoins[0].mode}`}
                                            {uc.supercoins[0].mode === "code" &&
                                              " coding questions"}
                                            {uc.supercoins[0].mode ===
                                              "profile" && " % profile details"}
                                          </>
                                        ) : (
                                          "Rewarded by admin"
                                        )}
                                      </h6>
                                      <p>Credited {uc.coins} EduCoins</p>
                                    </>
                                  )}
                                  {uc.activityType === "redeemed" && (
                                    <>
                                      <h6>
                                        {uc.supercoins.length ? (
                                          <>
                                            Purchased
                                            {uc.supercoins[0].mode ===
                                              "phoneRecharge" &&
                                              " phone recharge"}
                                            {uc.supercoins[0].mode ===
                                              "liveClasses" && " live classes"}
                                            {uc.supercoins[0].mode !==
                                              "phoneRecharge" &&
                                              uc.supercoins[0].mode !==
                                                "liveClasses" &&
                                              ` ${uc.supercoins[0].mode}`}
                                          </>
                                        ) : (
                                          "Deducted by admin"
                                        )}
                                      </h6>
                                      <p>Debited {uc.coins} EduCoins</p>
                                    </>
                                  )}
                                </div>
                                <div className="right-box">
                                  <h5
                                    className={
                                      uc.activityType === "earned"
                                        ? "green"
                                        : "red"
                                    }
                                  >
                                    {uc.activityType === "earned"
                                      ? `+${uc.coins}`
                                      : `-${uc.coins}`}
                                  </h5>
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center">
                      <svg
                        width="74"
                        height="74"
                        viewBox="0 0 74 74"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.6678 33.1747H22.8795C20.4391 33.0865 18.0065 33.5008 15.7329 34.3919C13.4592 35.283 11.3929 36.6318 9.66228 38.3547L9.16895 38.9303V55.9503H17.5556V46.2892L18.6862 45.0147L19.2001 44.4186C21.8762 41.6693 25.208 39.6462 28.8817 38.5397C27.0424 37.1402 25.5918 35.2933 24.6678 33.1747Z"
                          fill="#D4D4EA"
                        />
                        <path
                          d="M64.4214 38.2961C62.6908 36.5732 60.6245 35.2244 58.3508 34.3333C56.0772 33.4422 53.6447 33.0279 51.2042 33.1161C50.4557 33.1182 49.7078 33.1594 48.9636 33.2395C48.0224 35.227 46.6114 36.9555 44.8525 38.2756C48.7745 39.3606 52.3273 41.4923 55.1303 44.4422L55.6442 45.0178L56.7542 46.2922V55.9739H64.8531V38.8717L64.4214 38.2961Z"
                          fill="#D4D4EA"
                        />
                        <path
                          d="M22.8167 29.1697H23.454C23.1579 26.6275 23.6039 24.0539 24.7383 21.7596C25.8727 19.4653 27.6469 17.5484 29.8467 16.2403C29.0493 15.0221 27.9492 14.0318 26.6541 13.3665C25.3589 12.7012 23.9132 12.3837 22.4585 12.445C21.0038 12.5063 19.5899 12.9443 18.3554 13.7162C17.1208 14.4881 16.1079 15.5674 15.4158 16.8484C14.7237 18.1294 14.3762 19.5682 14.4072 21.0239C14.4382 22.4795 14.8467 23.9022 15.5928 25.1526C16.3389 26.4029 17.3968 27.4381 18.6632 28.1567C19.9295 28.8753 21.3607 29.2527 22.8167 29.2519V29.1697Z"
                          fill="#D4D4EA"
                        />
                        <path
                          d="M50.2153 27.6242C50.2403 28.0966 50.2403 28.5701 50.2153 29.0425C50.6098 29.105 51.0082 29.1394 51.4075 29.1453H51.7981C53.2477 29.068 54.6526 28.6167 55.876 27.8352C57.0994 27.0538 58.0996 25.9689 58.7793 24.6862C59.4589 23.4035 59.7949 21.9666 59.7544 20.5155C59.7139 19.0644 59.2984 17.6485 58.5482 16.4057C57.7981 15.1629 56.7389 14.1354 55.4739 13.4234C54.2088 12.7114 52.7809 12.3391 51.3293 12.3428C49.8776 12.3465 48.4516 12.7259 47.1902 13.4443C45.9287 14.1626 44.8747 15.1954 44.1309 16.442C45.9913 17.6567 47.5211 19.3142 48.5831 21.2659C49.645 23.2175 50.2059 25.4023 50.2153 27.6242Z"
                          fill="#D4D4EA"
                        />
                        <path
                          d="M36.7313 36.8357C41.8059 36.8357 45.9196 32.7219 45.9196 27.6473C45.9196 22.5727 41.8059 18.459 36.7313 18.459C31.6567 18.459 27.543 22.5727 27.543 27.6473C27.543 32.7219 31.6567 36.8357 36.7313 36.8357Z"
                          fill="#D4D4EA"
                        />
                        <path
                          d="M37.2265 41.7303C34.5421 41.622 31.8634 42.0578 29.3518 43.0116C26.8401 43.9654 24.5474 45.4174 22.6115 47.2803L22.0977 47.8559V60.8676C22.1057 61.2914 22.1971 61.7095 22.3668 62.098C22.5364 62.4864 22.7809 62.8377 23.0863 63.1317C23.3917 63.4256 23.7521 63.6565 24.1468 63.8112C24.5414 63.9659 24.9627 64.0413 25.3865 64.0331H49.0049C49.4287 64.0413 49.85 63.9659 50.2447 63.8112C50.6393 63.6565 50.9997 63.4256 51.3051 63.1317C51.6105 62.8377 51.855 62.4864 52.0247 62.098C52.1943 61.7095 52.2858 61.2914 52.2938 60.8676V47.897L51.8004 47.2803C49.8771 45.4117 47.5924 43.9555 45.0863 43.0012C42.5802 42.0468 39.9057 41.6144 37.2265 41.7303Z"
                          fill="#D4D4EA"
                        />
                      </svg>
                      <p className="text-muted">No data yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default StudentHistory;
