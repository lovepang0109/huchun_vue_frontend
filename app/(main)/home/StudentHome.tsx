"use client";

import { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import moment from "moment";
import * as _ from "lodash";
import alertify, { alert, success } from "alertifyjs";
import AppImage from "@/components/AppImage";
import Link from "next/link";
import Svg from "@/components/svg";
import clientApi, { uploadFile } from "@/lib/clientApi";
import Posts from "./Posts";
import { Modal } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { toQueryString } from "@/lib/validator";

export default function StudentHome({ settings }: any) {
  const [news, setNews] = useState([]);
  const [week, setWeek] = useState([]);
  const [user, setUser] = useState<any>(useSession()?.data || null);
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
  const { update } = useSession();
  const [showRibbon, setShowRibbon] = useState(true);
  const [toEnroll, setToEnroll] = useState(null);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
    if (data.features.course) {
      // this.courseService.userWithoutEnroll(this.user._id).subscribe(d => {
      //   this.toEnroll = d[0]
      // })
      const session = (await clientApi.get("/api/me")).data;
      clientApi
        .get(`/api/course/userWithoutEnroll/${session?._id}`)
        .then((d: any) => {
          setToEnroll(d[0]);
        });
    }
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
      const session = (await clientApi.get("/api/users/me")).data;
      setUser(session);

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
      setUserInfo(session);

      const news = (await clientApi.get("/api/news")).data;
      setNews(news);
      const classrooms = (await clientApi.get("/api/classrooms")).data
        .classrooms;
      setClasses(classrooms);
      const temp = (
        await clientApi.get(
          `/api/course/ongoingCourse/me${toQueryString({ limit: 15 })}`
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
      {/* {getClientData && getClientData.features && getClientData.features.courseReminder && toEnroll && showRibbon && (
        <div className="top-hading-close">
          <p>
            You are not enrolled in any course. Enroll in the courses of your
            interest.
            <Link href="/course/home">
              <b> Explore More</b>
            </Link>
          </p>
          <span className="close-hading" onClick={() => setShowRibbon(false)}>
            <img src="/assets/images/close-1.png" alt="" />
          </span>
        </div>
      )} */}
      <main
        className="pt-lg-3 dashboardNo-shadow_new"
        style={{
          backgroundColor: "#f4f4f7",
        }}
      >
        <div className="container">
          <div className="dashboard-area mx-auto mw-100" aria-label="d1">
            <div className="row">
              <div
                className="col-xl-auto col-lg-auto d-none d-lg-block"
                style={{ position: "sticky", top: 0, height: "100vh" }}
              >
                <div
                  className="dashboard-leftsidebar new-dashboard-leftsidebar"
                  sticky-menu={"true"}
                >
                  {userInfo?.profileCompleted < 100 && (
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
                        <div className="mr-0 mt-2 p-0 text-center">
                          {userInfo?.profileCompleted !== 100 && (
                            <Link
                              className="btn btn-primary btn-sm"
                              href="/profile/home/basic"
                            >
                              Complete Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
                    <div className="box-card-item dashboard-card-items has-rounded-img class bg-white clearfix card-common shadow border-0">
                      <div className="card-header-common">
                        <h4 className="widget_title">My Classess</h4>
                        <p className="widget_bottom_info">
                          Class(es) in which you are added
                        </p>
                      </div>
                      <div className="p-2 mb-2 text-center">
                        <img src="/assets/images/undraw_predictive_analytics_kf9n.svg" />
                        <p>You have not joined any classes</p>
                      </div>
                    </div>
                  )}

                  {courses.length > 0 ? (
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
                                    href={`/course/stage/${item?.course?._id}`}
                                    title={item?.title}
                                  >
                                    <div className="form-row">
                                      <div className="col-auto">
                                        <figure className="product_img_wrap">
                                          <AppImage
                                            height={60}
                                            width={100}
                                            tBoxWidth={50}
                                            imageUrl={item?.course?.imageUrl}
                                            type="classroom"
                                            text={item?.name}
                                            radius={5}
                                            fontSize={10}
                                          ></AppImage>
                                        </figure>
                                      </div>
                                      <div className="col">
                                        <div className="product_wrapper_inner">
                                          <h5
                                            className="product_top_title line-truncate f-12"
                                            style={{ lineHeight: "100%" }}
                                          >
                                            {item?.course.title}
                                          </h5>
                                          <p className="product_bottom_info">
                                            {item?.course?.user?.name}
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
                    <div className="box-card-item dashboard-card-items has-rounded-img class bg-white clearfix card-common shadow border-0">
                      <div className="card-header-common">
                        <h4 className="widget_title">My Courses</h4>
                        <p className="widget_bottom_info">
                          Course(s) in which you enrolled
                        </p>
                      </div>
                      <div className="p-2 mb-2">
                        <img src="/assets/images/undraw_Online_learning_re_qw08.svg" />
                        <p>
                          You are not enrolled in any course. Enroll in the
                          courses of your interest.
                        </p>
                        <Link href="/course/home">
                          <p className="text-center">
                            <b> Explore More</b>
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/*myLibraries.length ? (
                    <div className="box-card-item dashboard-card-items has-rounded-img class bg-white clearfix card-common shadow border-0">
                      <div className="card-header-common">
                        <h4 className="widget_title">My Courses</h4>
                        <p className="widget_bottom_info">
                          Course(s) in which you enrolled
                        </p>
                      </div>
                      {!myLibraries.length ? (
                        <div className="p-2">
                          <img src="/assets/images/undraw_Online_learning_re_qw08.svg" />
                          <p>
                            You are not enrolled in any course. Enroll in the
                            courses of your interest.
                          </p>
                          <Link href="/course/home">
                            <p className="text-center">
                              <b> Explore More</b>
                            </p>
                          </Link>
                        </div>
                      ) : (
                        <div className="card-body-common custom_scrollbar">
                          <div className="form-row">
                            {courses.map((item: any) => (
                              <div className="col-12" key={item.course._id}>
                                <div className="product_wrapper">
                                  <Link
                                    href={`/course/stage/${item.course._id}`}
                                    title={item.course.title}
                                  >
                                    <div className="form-row">
                                      <div className="col-auto">
                                        <figure className="product_img_wrap">
                                          <AppImage
                                            height={60}
                                            width={100}
                                            tBoxWidth={50}
                                            imageUrl={item?.course?.imageUrl}
                                            type="course"
                                            text={item?.name}
                                            radius={5}
                                            fontSize={10}
                                          ></AppImage>
                                        </figure>
                                      </div>
                                      <div className="col">
                                        <div className="product_wrapper_inner">
                                          <h5 className="product_top_title f-12">
                                            {item.course.title}
                                          </h5>
                                          <p className="product_bottom_info">
                                            {item?.course?.user?.name}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <></>
                  )}*/}
                </div>
              </div>
              <div className="col-xl col-lg dashboard-extraBorder-New">
                <div className="dashboard-area-wrap mx-auto mw-100">
                  <div className="carousel-area d-none d-lg-block mb-3">
                    <Carousel
                      indicators={true}
                      controls={false}
                      style={{ height: 350 }}
                    >
                      {
                        //@ts-ignore
                        settings.bannerImages &&
                        //@ts-ignore
                        settings.bannerImages
                          .slice(0, 3)
                          .map((banner: any, index: number) => {
                            return (
                              <Carousel.Item key={index}>
                                <Link href={banner.redirect ?? "/"}>
                                  <img
                                    src={banner.url}
                                    className="d-block"
                                    style={{ height: 350 }}
                                    alt="..."
                                  ></img>
                                </Link>
                              </Carousel.Item>
                            );
                          })
                      }
                    </Carousel>
                  </div>
                  {/* Post */}
                  <Posts settings={settings} />
                </div>
              </div>
              <div
                className="col-xl-auto col-lg-auto d-none d-lg-block "
                style={{ position: "sticky", top: 0, height: "100vh" }}
              >
                <div className="dashboard-rightsidebar" sticky-menu={"true"}>
                  {/* Coding test */}
                  {news.length > 0 && (
                    <div className="box-card-item dashboard-card-items watch-video bg-white clearfix card-common shadow border-0">
                      <div className="card-body-common bg-light new-whats-new">
                        <Carousel indicators={false} controls={false}>
                          {news.map((temp: any, index) => {
                            return (
                              <Carousel.Item key={index}>
                                <div className="card-header-common">
                                  <h4 className="widget_title">{temp.title}</h4>
                                </div>
                                <div className="continue-box mx-auto mw-100 p-0 course-item_new has-border">
                                  <div className="image">
                                    <img
                                      src={temp.imageUrl}
                                      alt="this dashboard_tip image"
                                    />
                                  </div>
                                  <div className="box-inner_new">
                                    <div
                                      className=" contnt-a"
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={temp.description}
                                    >
                                      <span className="titel-name">
                                        {temp.description}
                                      </span>
                                      <span>
                                        <Link
                                          href={temp.link ?? "/home"}
                                          target="_blank"
                                          className="btn btn-link btn-sm"
                                        >
                                          Learn More
                                        </Link>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Carousel.Item>
                            );
                          })}
                        </Carousel>
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
                                      {moment(item.startDate).format("hh:mm A")}{" "}
                                      -{" "}
                                      {moment(item.endDate).format("hh:mm A ")}{" "}
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

                  {/* Resume your course */}
                  {settings.features?.course &&
                    ongoingCourse &&
                    ongoingCourse.course &&
                    ongoingCourse.course.title && (
                      <div className="box-card-item dashboard-card-items watch-video bg-white clearfix card-common shadow border-0">
                        <div className="card-header-common">
                          <h4 className="widget_title">Resume your course</h4>
                        </div>

                        {ongoingCourse &&
                          ongoingCourse.course &&
                          ongoingCourse.course.title &&
                          ongoingCourse?.contents && (
                            <div className="card-body-common bg-light">
                              <div className="continue-box mx-auto mw-200 p-0 course-item_new has-border">
                                <Link
                                  href={`/course/stage/${ongoingCourse?.course?._id}`}
                                >
                                  <img
                                    src={ongoingCourse?.course?.imageUrl}
                                    alt=""
                                  />

                                  {/* <p-image [height]="100" [width]="100" [backgroundColor]="ongoingCourse?.course?.colorCode" [tBoxHeight]="35" [tBoxWidth]="35" [imageUrl]="ongoingCourse?.course?.imageUrl" [type]="'course'" [text]="ongoingCourse?.contents[0]?.title" [radius]="8" [fontSize]="13"></p-image> */}
                                  <div className="box-inner_new">
                                    <h4 className="text-truncate">
                                      {ongoingCourse?.contents[0]?.title}
                                    </h4>
                                  </div>
                                </Link>
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          show={modalShow}
          onHide={() => { }}
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
                    className="form-control border-bottom"
                    style={{ border: "none" }}
                    required
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                  />
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
                    className="form-control border-bottom"
                    style={{ border: "none" }}
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
                  {!phoneNumber && (
                    <div>
                      <p className="label label-danger text-danger">
                        Phone Number is required
                      </p>
                    </div>
                  )}
                </div>
              )}
              {additionalCodeExp && (
                <div className="col-lg-12 pl-0 mb-3">
                  <h4 className="form-box_subtitle mb-0">
                    Experience in coding?
                  </h4>
                  <div className="">
                    <select
                      className="form-control dropdown-toggle border-bottom"
                      style={{ border: "none" }}
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
