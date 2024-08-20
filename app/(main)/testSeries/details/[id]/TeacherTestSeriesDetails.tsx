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
import { addTest, getTeacherSummary } from "@/services/testseriesService";
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
import StudentComponent from "./Student";
import AnalyticsComponent from "./Analytics";
import AssessmentComponent from "./Assessment";
import CouponComponent from "./Coupon";
import ReportIssueComponent from "@/components/ReportIssue";

interface SideMenuEntry {
  name: string;
  _id: string;
}

const TeacherTestSeriesDetails = ({ settings, user }: any) => {
  const { id, tab } = useParams();
  const router = useRouter();

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
  const [series, setSeries] = useState<any>([]);
  const [activeMenu, setActiveMenu] = useState<any>("summary");

  useEffect(() => {
    getTeacherSummaryFunction();
  }, []);

  const getTeacherSummaryFunction = async () => {
    getTeacherSummary(id)
      .then((res: any) => {
        res["slug"] = slugify(res["title"]);
        if (!res.instructors) {
          res.instructors = [];
        }
        res.instructors.push(res.user);
        res.isExpired = isExpired(res);

        // res.canEdit = ['teacher', 'mentor', 'support'].indexOf(this.user.role) == -1 || res.user._id == this.user._id || res.instructors.find(i => i._id == this.user._id)
        res.canEdit =
          user.role == "admin" ||
          user.role == "publisher" ||
          (res.instructors &&
            res.instructors.findIndex((e: any) => e._id == user._id) > -1) ||
          (res.origin == "institute" &&
            (user.role == "director" || res.user._id == user._id)) ||
          (res.origin == "publisher" && res.owner == user._id);

        setSeries(res);
        setPageLoaded(true);
      })
      .catch((err) => {
        console.log(err);
        if (err.status == 404) {
          router.push("/not-found");
        }
        alertify.error("Fail to get testseries details!");
        setPageLoaded(true);
      });

    const savedMenu = sessionStorage.getItem(
      "teacher_testseries_detail_current_page_" + id
    );
    if (savedMenu) {
      sessionStorage.removeItem("teacher_testseries_detail_current_page_" + id);
      setActiveMenu(savedMenu);
    }
  };

  const onMenuChanged = (menu: any) => {
    setActiveMenu(menu);
  };

  const getUtmLink = (src: string, med: string) => {
    const utmData = `source=${src}&medium=${med}&campaign=${user.userId}`;

    return `${settings.baseUrl}public/testseries/${series._id}/${
      series.slug
    }?utm=${base64UrlEncode(utmData)}}&loc=${user.activeLocation}`;
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
            <div className="details-area mx-auto">
              {/* Checking if series is loaded */}
              {series ? (
                <div className="row">
                  <div className="col-lg-7">
                    <div className="asses-info">
                      <div className="title-wrap clearfix">
                        <div className="title">
                          <h3 className="main_title text-white">
                            {series.title}
                          </h3>
                        </div>
                      </div>
                      <div className="asses-user">
                        <div className="inner">
                          <p
                            className="text-white"
                            data-toggle="tooltip"
                            data-placement="top"
                            title={series?.summary}
                          >
                            {elipsis(series.summary, 460, true)}
                          </p>
                        </div>
                      </div>
                      <span className="f-12 text-white">
                        {!series.startDate &&
                          series.expiresOn &&
                          `Expires on ${date(series?.expiresOn, "dd/MM/yy")}`}
                      </span>
                      <span className="f-12 text-white">
                        {series.startDate &&
                          series.expiresOn &&
                          `${date(series.startDate, "dd/MM/yy")} - ${date(
                            series?.expiresOn,
                            "dd/MM/yy"
                          )}`}
                      </span>
                      <div
                        className={`form-row mt-2 ${
                          !series.primaryInstitute ||
                          (series.primaryInstitute.preferences.general
                            .socialSharing &&
                            series.status === "published" &&
                            !series.isExpired)
                            ? ""
                            : "d-none"
                        }`}
                      >
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
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="d-none d-lg-block">
                      <div className="row justify-content-end">
                        <div className="col-auto">
                          <div className="asses-right asses-right_new clearfix border-0 py-0">
                            <ul>
                              <li className="assessment">
                                {series.totalTests > 0
                                  ? `${series.totalTests} Assessment(s)`
                                  : "No Assessment(s)"}
                              </li>
                              <li className="quizze">
                                {series.totalQuestions > 0
                                  ? `${series.totalQuestions} Question(s)`
                                  : "No Question(s)"}
                              </li>
                              <li className="resource">
                                {series.totalStudents > 0
                                  ? `${series.totalStudents} Student(s)`
                                  : "No Student(s)"}
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-auto">
                          {series &&
                            series.instructors &&
                            series.instructors.length > 0 && (
                              <div className="profile-area clearfix ml-auto p-1">
                                <ul className="nav">
                                  {series.instructors
                                    .slice(0, 2)
                                    .map((inst: any, index: number) => (
                                      <li key={index}>
                                        <figure className="user_img_circled_wrap">
                                          <img
                                            src={avatar(inst)}
                                            alt="image"
                                            className="user_img_circled"
                                          />
                                        </figure>
                                      </li>
                                    ))}
                                </ul>
                                <div className="info ml-auto pt-2">
                                  {series.instructors.length !== 0 && (
                                    <strong className="text-white">
                                      {series.instructors.length > 1
                                        ? `${series.instructors[0].name} + ${
                                            series.instructors.length - 1
                                          } Owners`
                                        : series.instructors[0].name}
                                    </strong>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <SkeletonLoaderComponent Cwidth="100" Cheight="110" />
              )}
            </div>
          </div>
        </section>
        <main className="pt-lg-3">
          <div className="container">
            <div className="dashboard-area classroom mx-auto">
              <div className="row">
                <div className="col-lg-2">
                  <nav className="navbar navbar-expand-lg navbar-light sidebar">
                    <button
                      className="navbar-toggler ml-auto pr-0"
                      type="button"
                      aria-label="mobileview_navbarTeacher Testseries"
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
                      {series ? (
                        <ul>
                          <li onClick={() => onMenuChanged("summary")}>
                            <a
                              className={
                                activeMenu === "summary" ? "active" : ""
                              }
                            >
                              Summary
                            </a>
                          </li>
                          {series.canEdit && (
                            <li onClick={() => onMenuChanged("settings")}>
                              <a
                                className={
                                  activeMenu === "settings" ? "active" : ""
                                }
                              >
                                Settings
                              </a>
                            </li>
                          )}
                          <li onClick={() => onMenuChanged("assessments")}>
                            <a
                              className={
                                activeMenu === "assessments" ? "active" : ""
                              }
                            >
                              Assessments
                            </a>
                          </li>
                          {series.status === "published" &&
                            series.accessMode === "buy" && (
                              <li
                                onClick={() => onMenuChanged("couponGenerator")}
                              >
                                <a
                                  className={
                                    activeMenu === "couponGenerator"
                                      ? "active"
                                      : ""
                                  }
                                >
                                  Coupons
                                </a>
                              </li>
                            )}
                          {series.status === "published" &&
                            user.role !== "publisher" && (
                              <>
                                <li onClick={() => onMenuChanged("students")}>
                                  <a
                                    className={
                                      activeMenu === "students" ? "active" : ""
                                    }
                                  >
                                    Students
                                  </a>
                                </li>
                                <li onClick={() => onMenuChanged("analytics")}>
                                  <a
                                    className={
                                      activeMenu === "analytics" ? "active" : ""
                                    }
                                  >
                                    Analytics
                                  </a>
                                </li>
                              </>
                            )}
                          {series.status === "published" && (
                            <li onClick={() => onMenuChanged("reportedIssues")}>
                              <a
                                className={
                                  activeMenu === "reportedIssues"
                                    ? "active"
                                    : ""
                                }
                              >
                                Reported Issues
                              </a>
                            </li>
                          )}
                        </ul>
                      ) : (
                        <ul>
                          <li>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="30"
                            />
                          </li>
                          <li>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="30"
                            />
                          </li>
                          <li>
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="30"
                            />
                          </li>
                        </ul>
                      )}
                    </div>
                  </nav>
                </div>
                <div className="col-lg-10">
                  {series ? (
                    <>
                      {activeMenu === "summary" && (
                        <SummaryComponent
                          series={series}
                          setSeries={setSeries}
                          user={user}
                          settings={settings}
                        />
                      )}
                      {activeMenu === "settings" && (
                        <SettingsComponent
                          settings={settings}
                          user={user}
                          series={series}
                          setSeries={setSeries}
                        />
                      )}
                      {activeMenu === "assessments" && (
                        <AssessmentComponent
                          user={user}
                          series={series}
                          setSeries={setSeries}
                        />
                      )}
                      {activeMenu === "couponGenerator" && (
                        <CouponComponent
                          user={user}
                          settings={settings}
                          testseries={series}
                        />
                      )}
                      {activeMenu === "reportedIssues" && (
                        <ReportIssueComponent user={user} testseries={series} />
                      )}
                      {activeMenu === "students" && (
                        <StudentComponent
                          settings={settings}
                          testseries={series}
                        />
                      )}
                      {activeMenu === "analytics" && (
                        <AnalyticsComponent user={user} series={series} />
                      )}
                    </>
                  ) : (
                    <div className="col-lg-10">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="300" />
                    </div>
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

export default TeacherTestSeriesDetails;
