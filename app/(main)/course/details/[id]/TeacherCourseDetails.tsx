"use client";
import { useState, useEffect } from "react";
import {
  LinkedinShareButton,
  FacebookShareButton,
  TwitterShareButton,
} from "react-share";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import {
  base64UrlEncode,
  embedVideo,
  isExpired,
  refreshCurrentUserData,
} from "@/lib/helpers";
import {
  appendS,
  avatar,
  date,
  decimal,
  fromNow,
  militoHour,
  numberToAlpha,
  elipsis,
} from "@/lib/pipe";
import { elipsisText, slugify, toQueryString } from "@/lib/validator";
import { useTakeTestStore } from "@/stores/take-test-store";
import { useSession } from "next-auth/react";
import { contentSummeryProps } from "@/interfaces/interface";
import { useParams, useRouter } from "next/navigation";
import LoadingOverlay from "react-loading-overlay-ts";
import clientApi from "@/lib/clientApi";

import MathJax from "@/components/assessment/mathjax";
import ReadMore from "@/components/ReadMore";
import ItemPrice from "@/components/ItemPrice";
import * as shoppingCartService from "@/services/shopping-cart-service";
import alertify from "alertifyjs";
import { success } from "alertifyjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faGraduationCap,
  faPlay,
  faQuestion,
  faSpinner,
  faStar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookSquare,
  faLinkedin,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCopy,
  faHeart,
  faPlayCircle,
  faQuestionCircle,
} from "@fortawesome/free-regular-svg-icons";
import CircleProgress from "@/components/CircleProgress";
import { ProgressBar } from "react-bootstrap";
import Rating from "react-rating";
import RatingComponent from "@/components/rating";
import SummaryComponent from "./Summary";
import SettingsComponent from "./Setting";
import CourseReviewComponent from "./CourseReview";
import CourseStuduentComponent from "./CourseStudent";
import CourseChaptterComponent from "./CourseChaptter";
import CourseAnalyticsComponent from "./CourseAnalytics";
import ReportIssueComponent from "@/components/ReportIssue";
import CourseDiscussionComponent from "./CourseDiscusstion";

interface SideMenuEntry {
  name: string;
  _id: string;
}

const TeacherCourseDetails = ({ settings, user }: any) => {
  const { id, tab } = useParams();
  const router = useRouter();
  const { clientData } = useTakeTestStore();

  const [course, setCourse] = useState<any>();
  const [contentSummary, setContentSummary] = useState<contentSummeryProps>({
    assessments: 0,
    onlineSessions: 0,
    totalItems: 0,
    resources: 0,
    quiz: 0,
    video: 0,
  });
  const [ongoingClasses, setOngoingClasses] = useState<any>([]);
  const [checkSectionPage, setCheckSectionPage] = useState<boolean>(false);
  const [sideMenus, setSideMenus] = useState<SideMenuEntry[]>([
    {
      name: "Summary",
      _id: "summary",
    },
  ]);
  const [selectedSideMenu, setSelectedSideMenu] = useState<string | undefined>(
    undefined
  );
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [loadedMenu, setLoadedMenu] = useState<any>({});

  useEffect(() => {
    getCourse();
  }, []);

  const getCourse = async () => {
    let { data } = await clientApi.get(
      `/api/course/getTeacherCourseDetails/${id}`
    );
    setPageLoaded(true);
    data = {
      ...data,
      slug: slugify(data.title),
    };
    let courseData = data;
    courseData.canEdit =
      ["teacher", "mentor", "support"].indexOf(user.userRole) == -1 ||
      courseData.user._id == user._id ||
      courseData.instructors.find((i: any) => i._id == user._id);
    if (courseData.startDate) {
      courseData.startDate = new Date(courseData.startDate);
    }
    if (courseData.expiresOn) {
      courseData.expiresOn = new Date(courseData.expiresOn);
    }
    courseData.isExpired = isExpired(data);

    // side menu bar update
    let sideMenuData = sideMenus;

    if (courseData.canEdit) {
      if (!sideMenuData.find((x) => x._id == "courseSetting")) {
        sideMenuData.push({
          name: "Settings",
          _id: "courseSetting",
        });
      }

      if (!sideMenuData.find((x) => x._id == "curriculum")) {
        sideMenuData.push({
          name: "Chapters",
          _id: "curriculum",
        });
      }

      if (courseData.accessMode == "buy") {
        if (!sideMenuData.find((x: any) => x._id == "couponGenerator")) {
          sideMenuData.push({
            name: "Coupons",
            _id: "couponGenerator",
          });
        }
      }
    } else {
      if (!sideMenuData.find((x) => x._id == "curriculum")) {
        sideMenuData.push({
          name: "Chapters",
          _id: "curriculum",
        });
      }
    }

    if (courseData.status !== "draft") {
      if (!sideMenuData.find((x) => x._id == "courseReviews")) {
        sideMenuData.push({
          name: "Reviews",
          _id: "courseReviews",
        });
      }

      if (
        user &&
        user.userRole != "publisher" &&
        !sideMenuData.find((x) => x._id == "members")
      ) {
        sideMenuData.push({
          name: "Students",
          _id: "members",
        });
      }

      if (
        user &&
        user.userRole != "publisher" &&
        !sideMenuData.find((x) => x._id == "analytics")
      ) {
        sideMenuData.push({
          name: "Analytics",
          _id: "analytics",
        });
      }

      if (
        user &&
        user.userRole != "publisher" &&
        !sideMenuData.find((x) => x._id == "discussions")
      ) {
        sideMenuData.push({
          name: "Discussions",
          _id: "discussions",
        });
      }

      if (!sideMenuData.find((x) => x._id == "reportedIssues")) {
        sideMenuData.push({
          name: "Reported Issues",
          _id: "reportedIssues",
        });
      }

      const onGoingClassesData = await getOngoingClasses(courseData._id);
      const classesTimeSpent = await getClassesTimeSpent(courseData._id);

      if (classesTimeSpent && classesTimeSpent.length > 0) {
        onGoingClassesData.forEach((element: any) => {
          classesTimeSpent.forEach((c: any) => {
            if (c.classroomId === element.classroomId) {
              element.timeSpent = c.time;
            } else {
              element.timeSpent = 0;
            }
          });
        });
      } else if (classesTimeSpent.length === 0 || !classesTimeSpent) {
        onGoingClassesData.forEach((element: any) => {
          element.timeSpent = 0;
        });
      }
      setOngoingClasses(onGoingClassesData);
    }

    setSideMenus(sideMenuData);
    updateSummary(courseData);

    let toOpen = tab;
    const menuItem: any = sideMenuData.find((m: any) => m._id == toOpen);
    if (menuItem) {
      setSelectedSideMenu(menuItem._id);
    }

    setCourse(courseData);

    if (data.enroll) {
      if (data.accessMode == "buy") {
        shoppingCartService.addItem(course, 1, "course");
        router.push("/cart");
      }
    }
    if (sideMenuData.length) {
      let toOpen =
        sideMenuData.find((m: any) => m._id === tab) || sideMenuData[0];
      onMenuChange(toOpen);
    }
  };

  const getOngoingClasses = async (courseId: string) => {
    const { data } = await clientApi.get(
      `/api/course/getOngoingClasses/${courseId}`
    );
    return data;
  };

  const getClassesTimeSpent = async (courseId: string) => {
    const { data } = await clientApi.get(
      `/api/course/getClassesTimeSpent/${courseId}`
    );
    return data;
  };

  const onMenuChange = (menu: SideMenuEntry) => {
    if (checkSectionPage) {
      alertify.alert(
        "Alert",
        "First please close the section by clicking on cancel button!!"
      );
      return;
    }
    const loadedMenuData: any = {};
    loadedMenuData[menu._id] = true;
    setLoadedMenu(loadedMenuData);
    setSelectedSideMenu(menu._id);
  };

  const updateSummary = (courseData: any) => {
    let contentSummaryData = contentSummary;
    if (courseData && courseData.sections.length) {
      courseData.sections.forEach((d: any) => {
        contentSummaryData.totalItems += d.contents.length;
        d.contents.forEach((content: any) => {
          if (content.type === "assessment") {
            contentSummaryData.assessments++;
          } else if (content.type === "onlineSession") {
            contentSummaryData.onlineSessions++;
          } else if (content.type === "quiz") {
            contentSummaryData.quiz++;
          } else if (content.type === "video") {
            contentSummaryData.video++;
          } else {
            contentSummaryData.resources++;
          }
        });
      });
    }
    setContentSummary(contentSummaryData);
  };

  const updateCourseSettingData = async (status: any) => {
    course.slug = slugify(course.title);
    const sideMenuData = sideMenus;
    course.canEdit =
      ["teacher", "mentor", "support"].indexOf(user.userRole) == -1 ||
      course.user._id == user._id ||
      course.instructors.find((i: any) => i._id == user._id);

    if (course.status !== "draft") {
      if (!sideMenuData.find((x: any) => x._id == "courseReviews")) {
        sideMenuData.push({
          name: "Reviews",
          _id: "courseReviews",
        });
      }

      if (
        user &&
        user.userRole != "publisher" &&
        !sideMenuData.find((x: any) => x._id == "members")
      ) {
        sideMenuData.push({
          name: "Students",
          _id: "members",
        });
      }

      if (
        user &&
        user.userRole != "publisher" &&
        !sideMenuData.find((x: any) => x._id == "analytics")
      ) {
        sideMenuData.push({
          name: "Analytics",
          _id: "analytics",
        });
      }

      if (
        user &&
        user.userRole != "publisher" &&
        !sideMenuData.find((x: any) => x._id == "discussions")
      ) {
        sideMenuData.push({
          name: "Discussions",
          _id: "discussions",
        });
      }

      if (!sideMenuData.find((x: any) => x._id == "reportedIssues")) {
        sideMenuData.push({
          name: "Reported Issues",
          _id: "reportedIssues",
        });
      }

      if (course.status === "published") {
        const onGoingClassesData = await getOngoingClasses(course._id);
        const classesTimeSpent = await getClassesTimeSpent(course._id);
        if (classesTimeSpent && classesTimeSpent.length > 0) {
          onGoingClassesData.forEach((element: any) => {
            classesTimeSpent.forEach((c: any) => {
              if (c.classroomId === element.classroomId) {
                element.timeSpent = c.time;
              } else {
                element.timeSpent = 0;
              }
            });
          });
        } else if (classesTimeSpent.length === 0 || !classesTimeSpent) {
          onGoingClassesData.forEach((element: any) => {
            element.timeSpent = 0;
          });
        }
        setOngoingClasses(onGoingClassesData);
      }
    }

    if (course.canEdit && course.accessMode == "buy") {
      if (!sideMenuData.find((x) => x._id == "couponGenerator")) {
        sideMenuData.push({
          name: "Coupons",
          _id: "couponGenerator",
        });
      }
    }
    setSideMenus(sideMenuData);
  };

  const checkIsAddSecOpen = (ev: any) => {
    setCheckSectionPage(ev);
  };

  const getUtmLink = (src: string, med: string) => {
    const utmData = `source=${src}&medium=${med}&campaign=${user.userId}`;

    return `${settings.baseUrl}public/courses/${course._id}/${course.slug
      }?utm=${base64UrlEncode(utmData)}&loc=${user.activeLocation}`;
  };

  const notifyCopied = () => {
    alertify.success("Public link is copied to clipboard!");
  };

  return (
    <LoadingOverlay
      active={!pageLoaded}
      spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
      styles={{
        overlay: (base: any) => ({
          ...base,
          height: "100vh",
        }),
      }}
    >
      <div id="wrapper">
        <section className="details details_top_area_common mt-0">
          <div className="container">
            <div className="details-area mx-auto p-0">
              <div className="row">
                <div className="col-lg-7">
                  <div className="asses-info">
                    <div className="title-wrap clearfix">
                      <div className="title">
                        <h3 className="main_title text-white">
                          {course?.title}
                        </h3>
                      </div>
                    </div>

                    <div className="asses-user">
                      <div className="inner">
                        <p
                          className="text-white"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="{{course?.summary}}"
                        >
                          {elipsis(course?.summary, 460, true)}
                        </p>
                      </div>
                    </div>

                    <span className="text-white">
                      {course?.startDate
                        ? date(course?.startDate, "dd/MM/yy")
                        : " "}
                      {course?.expiresOn ? (
                        <span className="d-inline-block"> - </span>
                      ) : (
                        " "
                      )}
                      {course?.expiresOn
                        ? date(course?.expiresOn, "dd/MM/yy")
                        : " "}
                    </span>
                  </div>
                  {user &&
                    (!user.primaryInstitute ||
                      user.primaryInstitute.preferences.general
                        .socialSharing) &&
                    course &&
                    course.status == "published" &&
                    !course.isExpired && (
                      <div className="from-row mt-2">
                        <LinkedinShareButton
                          url={getUtmLink("linkedin", "post")}
                          className="mx-1"
                        >
                          <FontAwesomeIcon icon={faLinkedin} size="2x" />
                        </LinkedinShareButton>
                        <FacebookShareButton
                          url={getUtmLink("facebook", "post")}
                          className="mx-1"
                        >
                          <FontAwesomeIcon icon={faFacebookSquare} size="2x" />
                        </FacebookShareButton>
                        <TwitterShareButton
                          url={getUtmLink("twitter", "post")}
                          className="mx-1"
                        >
                          <FontAwesomeIcon icon={faTwitterSquare} size="2x" />
                        </TwitterShareButton>
                        <a
                          className="mx-1"
                          aria-label="Copy link"
                          onClick={notifyCopied}
                        >
                          <FontAwesomeIcon icon={faCopy} size="2x" />
                        </a>
                      </div>
                    )}
                </div>

                <div className="col-lg-5">
                  <div className="d-none d-lg-block">
                    <div className="row justify-content-end">
                      <div className="col-auto">
                        <div className="asses-right asses-right_new clearfix border-0 py-0">
                          <ul style={{ marginLeft: "unset" }}>
                            {course?.duration && (
                              <li className="calender">
                                {course?.duration &&
                                  decimal(course?.duration, 0)}
                                {course?.duration != 1 ? "days" : "day"}
                              </li>
                            )}
                            {contentSummary?.onlineSessions ? (
                              <li className="session">
                                {contentSummary?.onlineSessions}{" "}
                                {contentSummary?.onlineSessions != 1
                                  ? "Online Sessions"
                                  : "Online Session"}
                              </li>
                            ) : (
                              ""
                            )}
                            {contentSummary?.assessments ? (
                              <li className="assessment">
                                {contentSummary?.assessments + " "}{" "}
                                {contentSummary?.assessments != 1
                                  ? "Assessments"
                                  : "Assessment"}
                              </li>
                            ) : (
                              ""
                            )}
                            {contentSummary?.resources ? (
                              <li className="resource">
                                {contentSummary?.resources}{" "}
                                {contentSummary?.resources != 1
                                  ? "Note _ E-Book"
                                  : "Notes _ E-Books"}
                              </li>
                            ) : (
                              ""
                            )}
                            {contentSummary?.video ? (
                              <li className="resource">
                                {contentSummary?.video}{" "}
                                {contentSummary?.video != 1
                                  ? "Videos"
                                  : "Video"}{" "}
                              </li>
                            ) : (
                              ""
                            )}
                            {contentSummary?.quiz ? (
                              <li className="quizze">
                                {contentSummary?.quiz}{" "}
                                {contentSummary?.quiz != 1 ? "Quizzes" : "Quiz"}{" "}
                              </li>
                            ) : (
                              ""
                            )}
                          </ul>
                        </div>
                      </div>

                      {course?.instructors && course.instructors.length > 0 && (
                        <div className="col-auto">
                          <div className="profile-area clearfix ml-auto p-1">
                            <ul className="nav">
                              {course.instructors
                                .slice(0.2)
                                .map((element: any, index: number) => (
                                  <li key={index}>
                                    <figure className="user_img_circled_wrap">
                                      <img
                                        src={avatar(element)}
                                        alt="image"
                                        className="user_img_circled"
                                      />
                                    </figure>
                                  </li>
                                ))}
                            </ul>
                            <div className="info ml-auto pt-2">
                              {course?.instructors.length > 1 && (
                                <h2
                                  className="text-white"
                                  style={{ fontSize: "100%" }}
                                >
                                  {course?.instructors[0]?.name +
                                    " +" +
                                    (course?.instructors?.length - 1) +
                                    " Instructors"}
                                </h2>
                              )}

                              {course?.instructors.length === 1 && (
                                <h2
                                  className="text-white"
                                  style={{ fontSize: "100%" }}
                                >
                                  {course?.instructors[0]?.name}
                                </h2>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="d-block d-lg-none">
          <div className="container">
            <div className="dashboard-area">
              <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mt-2">
                <button
                  className="navbar-toggler px-0 ml-auto"
                  aria-label="navbarForCourse mobile"
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
                    {sideMenus.map((item: any, index: number) => (
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
              </nav>
            </div>
          </div>
        </div>
        <main className="py-3 pb-0">
          <div className="container">
            <div className="course-summery dashboard-area mx-auto new-course-summery">
              {/* start .course-summery */}
              <div className="row">
                <div className="d-none d-lg-block col-lg-2">
                  <div className="sidebar mt-0">
                    <ul>
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
                  {course && loadedMenu.summary && (
                    <SummaryComponent
                      course={course}
                      setCourse={setCourse}
                      ongoingClasses={ongoingClasses}
                      setOngoingClasses={setOngoingClasses}
                      user={user}
                      clientData={clientData}
                      selectedSideMenu={selectedSideMenu}
                    />
                  )}
                  {course && loadedMenu.courseSetting && (
                    <SettingsComponent
                      pageLoaded={pageLoaded}
                      setPageLoaded={setPageLoaded}
                      course={course}
                      setCourse={setCourse}
                      settings={settings}
                      user={user}
                      updatedCourse={updateCourseSettingData}
                    />
                  )}
                  {course && loadedMenu.members && (
                    <CourseStuduentComponent
                      course={course}
                      setCourse={setCourse}
                      user={user}
                      settings={settings}
                    />
                  )}
                  {course && loadedMenu.curriculum && (
                    <CourseChaptterComponent
                      course={course}
                      setCourse={setCourse}
                      user={user}
                      settings={settings}
                      isAddSectionOpn={checkIsAddSecOpen}
                      updateCourse={updateSummary}
                    />
                  )}
                  {course && loadedMenu.courseReviews && (
                    <CourseReviewComponent
                      course={course}
                      setCourse={setCourse}
                      user={user}
                      settings={settings}
                    />
                  )}
                  {course && loadedMenu.analytics && (
                    <CourseAnalyticsComponent
                      course={course}
                      setCourse={setCourse}
                      user={user}
                    />
                  )}
                  {/* {course &&
                  loadedMenu
                    .couponGenerator && (
                    <CourseGeneratorComponent
                      course={course}
                      setCourse={setCourse}
                      user={user}
                    />
                    )} */}
                  {course && loadedMenu.discussions && (
                    <CourseDiscussionComponent
                      settings={settings}
                      course={course}
                      setCourse={setCourse}
                      user={user}
                    />
                  )}
                  {course && loadedMenu.reportedIssues && (
                    <ReportIssueComponent course={course} user={user} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </LoadingOverlay>
  );
};

export default TeacherCourseDetails;
