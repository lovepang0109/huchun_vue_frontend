"use client";

import { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import moment from "moment";
import * as _ from "lodash";
import { alert, success } from "alertifyjs";
import AppImage from "@/components/AppImage";
import Link from "next/link";
import Svg from "@/components/svg";
import clientApi, { uploadFile } from "@/lib/clientApi";
import Posts from "./Posts";
import { Modal } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { toQueryString } from "@/lib/validator";
import * as instituteSvc from "@/services/instituteService";

export default function StudentHome({ settings }: any) {
  const user: any = useSession()?.data?.user?.info || {};
  const [news, setNews] = useState([]);
  const [week, setWeek] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [eventLimit, setEventLimit] = useState(3);
  const [eventsByDay, setEventsByDay] = useState([]);
  const [ongoingCourse, setongoingCourse]: any = useState();
  const [getClientData, setClientData]: any = useState();
  const [userInfo, setUserInfo]: any = useState();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState([]);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber]: any = useState();
  const [codingExperience, setCodingExperience]: any = useState();
  const [modalShow, setModalShow] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [documentModal, setDocumentModal] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [additionalEmail, setAdditionalEmail] = useState(false);
  const [additionalCountryConfirm, setAdditionalCountryConfirm] =
    useState(false);
  const [additionalPhoneNumber, setAdditionalPhoneNumber] = useState(false);
  const [additionalCodeExp, setAdditionalCodeExp] = useState(false);
  const [canSetupInstitute, setCanSetupInstitute] = useState<boolean>(false);
  const { update } = useSession();

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
    return data;
  };

  const getWeekDays = async () => {
    const current = new Date();
    // Starting Monday not Sunday
    current.setDate(current.getDate() - current.getDay() + 1);
    let temp = [];
    for (let i = 0; i < 7; i++) {
      temp.push(new Date(current));
      //@ts-ignore
      setWeek(temp);
      current.setDate(current.getDate() + 1);
    }

    try {
      const res = (
        await clientApi.get(
          `/api/events?timezoneOffset=${new Date().getTimezoneOffset()}&startDate=${moment(
            week[0]
          )
            .startOf("day")
            .toISOString()}&endDate=${moment(week[6])
            .endOf("day")
            .toISOString()}&excludeCourse=true`
        )
      ).data;
      const unique = res.filter(
        //@ts-ignore
        (value, index, self) =>
          index ===
          self.findIndex(
            (t: any) =>
              t._id === value._id &&
              new Date(t.startDate).getDate() ===
                new Date(value.startDate).getDate()
          )
      );

      setEvents(unique);
      getTodayEvents(activeDate);
    } catch (e: any) {
      console.log(e);
    }
  };

  const getTodayEvents = (day: any) => {
    setEventLimit(3);
    setActiveDate(day);
    const activeDate = new Date(day);
    setEventsByDay(
      events.filter(
        (d: any) => new Date(d.startDate).getDate() == activeDate.getDate()
      )
    );
  };

  const checkType = (type: any, day: any) => {
    const activeDate = new Date(day);
    const result = events.find(
      (d: any) =>
        new Date(d.startDate).getDate() == activeDate.getDate() &&
        d.type == type
    );
    return !!result;
  };

  const showAllEvents = () => {
    setEventLimit(eventsByDay.length);
  };

  const saveProfileData = async (e: any) => {
    e.preventDefault();
    let dataUpdate = userInfo;
    dataUpdate = _.omit(dataUpdate, "avatarUrlSM");

    if (additionalCountryConfirm) {
      // check country data
      dataUpdate.country.name = getClientData.countries.find(
        (c: any) => c.code == dataUpdate.country.code
      ).name;
      dataUpdate.country.confirmed = true;
    }
    if (codingExperience) {
      dataUpdate.codingExperience = codingExperience;
    }
    if (phoneNumber) {
      dataUpdate.phoneNumber = phoneNumber;
    }

    try {
      await clientApi.put(`/api/users/${userInfo._id}`, dataUpdate);
      await update();
      setModalShow(false);
      success("Profile updated successfully.");
    } catch (e: any) {
      e.response.data[0].msg === "Phone number is already in use"
        ? alert("Message", e.response.data[0].msg)
        : alert("Message", "Fail to update your profile.");
    }
  };

  useEffect(() => {
    async function fetchData() {
      const session = (await clientApi.get("/api/me")).data;
      const setting = await getClientDataFunc();

      if (setting?.features && setting?.features.captureAdditionalInfo) {
        // ask user to confirm his country first
        if (!session.country) {
          setModalShow(true);
          setAdditionalCountryConfirm(true);
        }

        if (!session.email) {
          setModalShow(true);
          setAdditionalEmail(true);
        }
        if (!session.phoneNumber) {
          setModalShow(true);
          setAdditionalPhoneNumber(true);
        }

        if (!session.codingExperience) {
          setAdditionalCodeExp(true);
        }
      }
      if (setting?.features?.newInstitute) {
        instituteSvc.getMyInstitutes().then((ins: any[]) => {
          console.log(user.activeLocation, "ative lcat");
          if (user.activeLocation) {
            const activeInstitute = ins?.find(
              (i) => i._id == user.activeLocation
            );
            const canI =
              !ins?.length || (activeInstitute?.isDefault && ins?.length == 1);
            setCanSetupInstitute(canI);
          } else {
            setCanSetupInstitute(true);
          }
        });
      }
      setUserInfo(session);
      const news = (await clientApi.get("/api/news")).data;
      setNews(news);
      const classrooms = (await clientApi.get("/api/classrooms")).data
        .classrooms;
      setClasses(classrooms);
      const temp = (
        await clientApi.get(
          `/api/course/getAllTeacherCourses${toQueryString({ home: true })}`
        )
      ).data;
      setCourses(temp);
      setongoingCourse(temp[0]);
    }
    fetchData();
    getWeekDays();
  }, []);

  return (
    <>
      <main className="pt-lg-3 dashboardNo-shadow_new">
        <div className="container">
          <div className="dashboard-area mx-auto mw-100" aria-label="d1">
            <div className="row">
              <div className="col-xl-auto col-lg-auto d-none d-lg-block">
                <div
                  className="dashboard-leftsidebar new-dashboard-leftsidebar"
                  sticky-menu={"true"}
                >
                  <div className="box-card-item dashboard-card-items class bg-white clearfix card-common shadow border-0">
                    <div className="card-header-common">
                      <h4 className="widget_title">Profile Completion</h4>
                      <p className="widget_bottom_info">
                        Complete your profile to get enrolled in courses.
                      </p>
                    </div>
                    <div className="card-body-common bg-light">
                      <div className="title mb-2 mt-1">
                        <h3 className="widget_title_1">
                          Your profile is{" "}
                          {userInfo?.profileCompleted
                            ? Math.round(userInfo?.profileCompleted)
                            : ""}
                          % completed
                        </h3>
                      </div>
                      <div className="progress mb-2" style={{ height: 6 }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${userInfo?.profileCompleted}%`,
                            backgroundColor: "#8C89F9",
                          }}
                          aria-valuenow={50}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="progress-bar"
                        ></div>
                      </div>

                      <figure className="dash-fig">
                        <img src="/assets/images/i-welcome3.png" alt="" />
                      </figure>
                      {userInfo?.profileCompleted !== 100 && (
                        <div className="create-btn-remove mr-0 mt-2 p-0 text-center">
                          <Link
                            className="btn btn-primary btn-sm"
                            href="/profile/home/basic"
                          >
                            Complete Now
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {classes.length ? (
                    <div className="box-card-item dashboard-card-items has-rounded-img class bg-white clearfix card-common shadow border-0">
                      <div className="card-header-common">
                        <h4 className="widget_title">My Classes</h4>
                        <p className="widget_bottom_info">
                          Class(es) in which you are added
                        </p>
                      </div>
                      <div className="card-body-common custom_scrollbar">
                        <div className="form-row">
                          {classes.map((item: any) => {
                            return (
                              <div className="col-12" key={item._id}>
                                <div className="product_wrapper">
                                  <Link
                                    href={`/classroom/details/${item._id}`}
                                    title={item.name}
                                  >
                                    <div className="form-row">
                                      <div className="col-auto">
                                        <figure className="product_img_wrap">
                                          <AppImage
                                            height={60}
                                            width={100}
                                            tBoxWidth={50}
                                            imageUrl={item?.imageUrl}
                                            type="classroom"
                                            text={item?.name}
                                            radius={5}
                                            fontSize={10}
                                          ></AppImage>
                                        </figure>
                                      </div>
                                      <div className="col">
                                        <div className="product_wrapper_inner">
                                          <h5 className="product_top_title f-12">
                                            {item.name}
                                          </h5>
                                          <p className="product_bottom_info">
                                            {item?.user?.name}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {courses.length ? (
                    <div className="box-card-item dashboard-card-items has-rounded-img class bg-white clearfix card-common shadow border-0">
                      <div className="card-header-common">
                        <h4 className="widget_title">My Courses</h4>
                        <p className="widget_bottom_info">
                          Course(s) in which you enrolled
                        </p>
                      </div>
                      <div className="card-body-common custom_scrollbar">
                        <div className="form-row">
                          {courses.map((item: any) => {
                            return (
                              <div className="col-12" key={item._id}>
                                <div className="product_wrapper">
                                  <Link
                                    href={`/course/stage/${item?._id}`}
                                    title={item?.title}
                                  >
                                    <div className="form-row">
                                      <div className="col-auto">
                                        <figure className="product_img_wrap">
                                          <img
                                            height="60"
                                            width="100"
                                            style={{
                                              backgroundColor: item?.colorCode,
                                            }}
                                            src={item?.imageUrl}
                                          ></img>
                                        </figure>
                                      </div>
                                      <div className="col">
                                        <div className="product_wrapper_inner">
                                          <h5 className="product_top_title line-truncate f-12">
                                            {item?.title}
                                          </h5>
                                          <p className="product_bottom_info">
                                            {item?.user?.name}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="col-xl col-lg dashboard-extraBorder-New">
                <div className="dashboard-area-wrap mx-auto mw-100">
                  {/* Post */}
                  <Posts settings={settings} />
                </div>
              </div>
              <div className="col-xl-auto col-lg-auto d-none d-lg-block ">
                <div className="dashboard-rightsidebar" sticky-menu={"true"}>
                  {canSetupInstitute && (
                    <div className="box-card-item dashboard-card-items class bg-white clearfix">
                      <div className="title">
                        <h4 className="dash-2">White-Label Solution</h4>
                      </div>
                      <figure className="dash-fig-1">
                        <img src="/assets/images/asd1.png" alt="" />
                      </figure>
                      <figure className="dash-fig">
                        <img src="/assets/images/asd.png" alt="" />
                      </figure>
                      <p className="dash-1 mb-2">
                        Grow your institute with more students. Personalize your
                        teaching with powerful data and insight, ready to use
                        content and excellent support.
                      </p>
                      <p className="dash-1 mb-2 mt-2">
                        Setup now and start in less than 2 mins, it is 100%
                        free.
                      </p>
                      <div className="bg-white ml-0 w-100">
                        <Link
                          className="btn btn-outline btn-sm btn-block"
                          href="/institute/wizard"
                        >
                          Setup Institute
                        </Link>
                      </div>
                    </div>
                  )}
                  {/* Events calendar */}
                  <div className="dashboard-card-items event-calender bg-white">
                    <div className="title">
                      <h4>
                        <Link href="/student/calendar">
                          <strong>{moment().format("MMMM D, dddd")}</strong>
                        </Link>
                      </h4>
                    </div>

                    <div className="week">
                      <table className="table mb-2">
                        <tbody>
                          <tr>
                            <td className="border-0">
                              <span>M</span>
                            </td>
                            <td className="border-0">
                              <span>T</span>
                            </td>
                            <td className="border-0 active">
                              <span>W</span>
                            </td>
                            <td className="border-0">
                              <span>T</span>
                            </td>
                            <td className="border-0">
                              <span>F</span>
                            </td>
                            <td className="border-0">
                              <span>S</span>
                            </td>
                            <td className="border-0">
                              <span>S</span>
                            </td>
                          </tr>

                          <tr>
                            {week.map((item: any, index) => {
                              return (
                                <td
                                  className="border-0 text-center"
                                  key={index}
                                  onClick={() => getTodayEvents(item)}
                                >
                                  <span
                                    className={
                                      item.getDate() === activeDate.getDate()
                                        ? "active"
                                        : ""
                                    }
                                  >
                                    <strong
                                      className={
                                        item.getDate() === activeDate.getDate()
                                          ? "text-white"
                                          : ""
                                      }
                                    >
                                      {item.getDate()}
                                    </strong>
                                  </span>
                                  {checkType("event", item) && (
                                    <div className="dot mx-auto"></div>
                                  )}
                                  {checkType("exam", item) && (
                                    <div className="dot blue mx-auto"></div>
                                  )}
                                  {checkType("holiday", item) && (
                                    <div className="dot navyblue mx-auto"></div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {eventsByDay.length ? (
                      <div>
                        {eventsByDay.map((item: any, index) => {
                          return (
                            <div
                              className="event mb-4 pl-4 py-2 pr-0 position-relative"
                              key={index}
                            >
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={item.title}
                                className="text-truncate"
                              >
                                {item.title}
                              </h4>
                              <div className="row align-items-center">
                                <div className="col">
                                  {item.allDays ? (
                                    <span className="d-block">Full Day</span>
                                  ) : (
                                    <span className="d-block">
                                      {moment(item.startDate).format(
                                        "hh:mm A' "
                                      )}{" "}
                                      -{" "}
                                      {moment(item.endDate).format("hh:mm A' ")}{" "}
                                    </span>
                                  )}
                                </div>

                                <div className="col-auto ml-auto">
                                  <div className="date">
                                    <span>
                                      {moment(item.startDate).format(
                                        "MMM D, YYYY "
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {eventsByDay.length > 3 &&
                          eventLimit != eventsByDay.length && (
                            <div className="mt-2 text-center">
                              <a
                                className="btn btn-light"
                                onClick={() => showAllEvents()}
                              >
                                Load More
                              </a>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div>
                        <figure className="mx-auto">
                          <img
                            src="/assets/images/Womenday-rafiki1.png"
                            alt=""
                            className="mw-150px"
                          />
                        </figure>

                        <div className="load-more mx-auto mt-2 text-center">
                          <Link href="/calendar/month">No Events To Show</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          show={modalShow}
          onHide={() => {}}
          backdrop="static"
          keyboard={false}
          className="forgot-pass-modal"
        >
          <Modal.Header className="transparent-heading">
            <Modal.Title>Tell us more about yourself</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={(e) => saveProfileData(e)}>
              {additionalEmail && (
                <div className="col-lg-12 pl-0">
                  <h4 className="form-box_subtitle mb-0">Email</h4>
                  <input
                    className="form-control"
                    required
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                  />
                  <hr />
                  {!email && (
                    <div>
                      <p className="label label-danger text-danger">
                        Email is required
                      </p>
                      <p className="label label-danger text-danger">
                        Invalid email entered.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {additionalPhoneNumber && (
                <div className="col-lg-12 pl-0">
                  <h4 className="form-box_subtitle mb-0">Phone Number</h4>
                  <input
                    className="form-control"
                    type="tel"
                    placeholder="Phone Number"
                    name="phoneNumber"
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]*" // This allows only digits
                    title="Please enter only numerical characters"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    value={phoneNumber}
                    required
                  />
                  <hr />
                </div>
              )}
              {additionalCodeExp && (
                <div className="col-lg-12 pl-0">
                  <h4 className="form-box_subtitle mb-0">
                    Experience in coding?
                  </h4>
                  <div className="">
                    <select
                      className="form-control dropdown-toggle"
                      name="codingExperience"
                      value={codingExperience}
                      onChange={(e) => setCodingExperience(e.target.value)}
                      required
                    >
                      <option hidden selected></option>
                      <option value="" disabled>
                        Select coding Experience
                      </option>
                      <option value="Never tried">Never tried</option>
                      <option value="Little knowledge">Little knowledge</option>
                      <option value="Comfortable but need more practice">
                        Comfortable but need more practice
                      </option>
                      <option value="Learning another language">
                        Learning another language
                      </option>
                    </select>
                  </div>
                  <hr />
                  {!codingExperience && (
                    <div>
                      <p className="label label-danger text-danger">
                        Experience is required
                      </p>
                    </div>
                  )}
                </div>
              )}
              {errors.length > 0 && (
                <div>
                  {errors.map((error: any, index: any) => {
                    return (
                      <p key={index} className="label label-danger text-danger">
                        {error}
                      </p>
                    );
                  })}
                </div>
              )}

              <div className="d-flex justify-content-end mt-2">
                <button
                  className="btn btn-primary ml-2"
                  type="submit"
                  disabled={
                    (additionalCodeExp && !codingExperience) ||
                    (additionalPhoneNumber && !phoneNumber) ||
                    (additionalEmail && !email)
                      ? true
                      : false
                  }
                >
                  Update
                </button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </main>
    </>
  );
}
