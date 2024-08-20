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
} from "@/lib/pipe";
import { elipsisText, slugify, toQueryString } from "@/lib/validator";
import { useTakeTestStore } from "@/stores/take-test-store";
import { useSession } from "next-auth/react";
import { contentSummeryProps } from "@/interfaces/interface";
import { useParams, useRouter } from "next/navigation";
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

const StudentCourseDetails = ({ user }: any) => {
  const { id } = useParams();
  const router = useRouter();
  const { clientData } = useTakeTestStore();

  const [selectedSection, setSelectedSection] = useState<string>("");
  const [courseProgress, setCourseProgress] = useState<any>();
  const [contentSummery, setContentSummery] = useState<contentSummeryProps>({
    assessments: 0,
    onlineSessions: 0,
    totalItems: 0,
    resources: 0,
    quiz: 0,
    video: 0,
  });
  const [assessments, setAssessments] = useState<any[]>([]);
  const [onlineSessions, setOnlineSessions] = useState<any[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [initializedFeedback, setInitializedFeedback] =
    useState<boolean>(false);
  const [learningTime, setLearningTime] = useState<any>();
  const [practiceTime, setPracticeTime] = useState<any>();
  const [totalEffort, setTotalEffort] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<any>({});
  const [ratings, setRatings] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<any>(0);
  const [ongoingContent, setOngoingContent] = useState<any>();
  const [publishedSection, setPublishedSection] = useState<any[]>([]);
  const [sectionStats, setSectionStats] = useState<any>({});
  const [contentSlice, setContentSlice] = useState<number>(3);
  const [instructorSlice, setInstructorSlice] = useState<number>(1);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [course, setCourse] = useState<any>();

  const [accuracy, setAccuracy] = useState<any>({
    pStudent: 0,
  });
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 5,
  });

  const getUtmLink = (src: any, med: any) => {
    const utmData = `source=${src}&medium=${med}&campaign=${user?.info._id}`;
    return `${clientData.baseUrl}public/courses/${course._id}/${course.slug
      }?utm=${base64UrlEncode(utmData)}}&loc=${user?.info.activeLocation}`;
  };

  const notifyCopied = () => {
    const text = getUtmLink("platform", "individual");
    navigator.clipboard.writeText(text);

    // Change the position to 'top-right'
    alertify.set("notifier", "position", "top-right");
    success("Public link is copied to clipboard!");
  };

  useEffect(() => {
    getCourse();
  }, []);

  const getCourse = async () => {
    let { data } = await clientApi.get(
      `/api/course/${id}`
    );
    data = {
      ...data,
      slug: slugify(data.title),
      instructors: [data.user, ...data.instructors],
      ...(data.videoUrl && { videoUrl: embedVideo(data.videoUrl) }),
      ...(!data.requirements && { requirements: "" }),
      ...{
        learningIncludes: !data.learningIncludes
          ? ""
          : data.learningIncludes.replace(/<p>(&nbsp;)*<\/p>/g, ""),
      },
      ...(!data.includes && { includes: "" }),
    };
    setCourse(data);

    if (data.enroll) {
      // refreshCurrentUserData((newUser: any) => setUser(newUser));

      if (data.accessMode == "buy") {
        shoppingCartService.addItem(course, 1, "course");
        router.push("/cart");
      }
    }

    getStudentFeedback();
    getCourseAnalytics();
    getOngoingCourseContent();
    setPublishedSection(
      data.sections.filter((e: any) => e.status == "published")
    );

    data = { ...data, isExpired: isExpired(data) };
    setCourse(data);
    getAllContent(data.sections.filter((e: any) => e.status == "published"));
    getCourseProgress();

    // get content stats
    let stats: any = {};
    for (const sec of data.sections) {
      stats[sec._id] = {
        onlineSession: 0,
        note: 0,
        assessment: 0,
        video: 0,
        quiz: 0,
      };
      for (const content of sec.contents) {
        if (content.type == "onlineSession") {
          stats[sec._id].onlineSession++;
        } else if (content.type == "note" || content.type == "ebook") {
          stats[sec._id].note++;
        } else if (content.type == "assessment") {
          stats[sec._id].assessment++;
        } else if (content.type == "video") {
          stats[sec._id].video++;
        } else if (content.type == "quiz") {
          stats[sec._id].quiz++;
        }
      }
    }
    setSectionStats(stats);
    setInitialized(true);
  };

  const getStudentFeedback = async () => {
    const [avgRate, rate, ratesCount] = await Promise.all([
      clientApi.get(`/api/course/avgRating/${id}${toQueryString(params)}`),
      clientApi.get(`/api/course/ratings/${id}${toQueryString(params)}`),
      clientApi.get(`/api/course/ratingsCount/${id}${toQueryString(params)}`),
    ]);
    setAvgRating(avgRate.data);
    setRatings(rate.data);
    setTotalItems(ratesCount.data);
    setInitializedFeedback(true);
  };

  const getCourseAnalytics = async () => {
    const [learningTimeStamp, practiceTimeStamp, accuarcyAnalytics] =
      await Promise.all([
        clientApi.get(
          `/api/course/analytics/learningTime/${id}${toQueryString({
            lastDays: 15,
          })}`
        ),
        clientApi.get(
          `/api/course/analytics/practiceTime/${id}${toQueryString({
            lastDays: 15,
          })}`
        ),
        clientApi.get(
          `/api/course/analytics/accuracy/${id}${toQueryString({
            lastDays: 15,
          })}`
        ),
      ]);
    await setTotalEffort(
      learningTimeStamp.data.student + practiceTimeStamp.data.student
    );
    setAccuracy({
      pStudent: Math.round(accuarcyAnalytics.data.student * 100),
    });
  };

  const getOngoingCourseContent = async () => {
    try {
      const { data } = await clientApi.get(
        `/api/course/ongoingCourseContent/${id}`
      );
      setOngoingContent(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllContent = (data: any) => {
    if (data.length > 0) {
      let summery = contentSummery;
      let assessmentList = assessments;
      let onlineSessionList = onlineSessions;
      data.forEach((d: any) => {
        summery.totalItems = summery.totalItems + d.contents.length;
        d.contents.forEach((content: any) => {
          if (content.type == "assessment") {
            if (course?.enrolled) {
              assessmentList.push(content);
            }
            summery.assessments++;
          } else if (content.type == "onlineSession") {
            if (course?.enrolled) {
              onlineSessionList.push(content);
            }
            summery.onlineSessions++;
          } else if (content.type == "quiz") {
            summery.quiz++;
          } else if (content.type == "video") {
            summery.video++;
          } else {
            summery.resources++;
          }
        });
      });
      setContentSummery(summery);
      setAssessments(assessmentList);
      setOnlineSessions(onlineSessionList);
    }
  };

  const getCourseProgress = async () => {
    try {
      const { data } = await clientApi.get(`/api/course/progress/${id}`);
      setCourseProgress(data);
    } catch (error) {
      console.error(error);
    }
  };

  const showAll = (value?: any) => {
    setSelectedSection(value ? value : null);
  };

  const addToCart = (course: any) => {
    // if (this.activatedRoute.snapshot.queryParams['loc']) {
    //   course.note = { enrollingLocation: this.activatedRoute.snapshot.queryParams['loc'] }
    // }
    shoppingCartService.addItem(course, 1, "course");
  };

  const buyNow = (course: any) => {
    addToCart(course);
    router.push("/cart");
  };

  const openChat = (user: any) => {
    // this.chatSvc.openChat(user._id, user.name)
  };

  const addFavorite = async (id: any) => {
    await clientApi.put(`/api/course/addfavorite/${id}`, {});
    setCourse((prev: any) => ({ ...prev, favorite: true }));
    alertify.set("notifier", "position", "top-right");
    success("Successfully added to favorites");
  };

  const removeFavorite = async (id: any) => {
    await clientApi.delete(`/api/course/removefavorite/${id}`, {});
    setCourse((prev: any) => ({ ...prev, favorite: false }));
    alertify.set("notifier", "position", "top-right");
    success("Successfully removed from favorites");
  };

  const seeAll = (type: any) => {
    if (type == "content") {
      setContentSlice(publishedSection.length);
    }
    if (type == "instructor") {
      setInstructorSlice(course.instructors.length);
    }
  };

  const hideAll = (type: any) => {
    if (type == "content") {
      setContentSlice(3);
      window.scrollTo({ behavior: "smooth" });
      window.scrollTo(0, 0);
    }
    if (type == "instructor") {
      setInstructorSlice(1);
    }
  };

  const scrollInto = (divId: any) => {
    const elem = document.getElementById(divId);
    if (elem) {
      elem.scrollIntoView();
    }
  };

  const enroll = async (crs: any) => {
    if (!enrolling) {
      setEnrolling(true);
      const params: any = {
        course: crs._id,
        type: "course",
      };

      // if (this.activatedRoute.snapshot.queryParams['loc']) {
      //   params.enrollingLocation = this.activatedRoute.snapshot.queryParams['loc']
      // }
      try {
        const { data } = await clientApi.post(
          "/api/payments/enrollItems",
          params
        );
        alertify.set("notifier", "position", "top-right");
        success("Sucessfully Enrolled to this course");
        refreshCurrentUserData();
        router.push(`/course/stage/${course._id}`);
      } catch (error) {
        console.error(error);
      } finally {
        setEnrolling(false);
      }
    }
  };

  const openDemoSection = (section: any) => {
    router.push(
      `/course/stage/${course._id}${toQueryString({
        demoSection: section._id,
      })}`
    );
  };

  return (
    <>
      <section className="details_top_area_common">
        <div className="container">
          <div className="row">
            {course && (
              <div className="col-lg-auto left_area">
                <h2 className="main_title">{course.title}</h2>
                <p
                  className="bottom_title"
                  data-toggle="tooltip"
                  data-placement="top"
                >
                  {elipsisText(course.summary, 460, true)}
                </p>
                <div className="details_below_summary">
                  <div className="row">
                    <div className="col-lg-5 mb-2 mb-lg-0">
                      <h5 className="main_sub_title">Instructors</h5>
                      <div className="form-row align-items-center">
                        {course.instructors.slice(0, 2).map((item: any) => (
                          <div
                            className="col-auto mb-2"
                            key={"instruct_" + item.name}
                          >
                            <div className="d-flex align-items-center">
                              <div className="user_img_circled_wrap mr-2">
                                <img
                                  src={avatar(item)}
                                  className="user_img_circled"
                                  alt=""
                                />
                              </div>
                              <p className="profile_user_name">{item.name}</p>
                            </div>
                          </div>
                        ))}
                        {course.instructors.length > 2 && (
                          <div className="col-auto mb-2">
                            + {course.instructors.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <div className="row">
                        <div className="col-sm-4">
                          <h5 className="main_sub_title">
                            Enrolled Student(s)
                          </h5>
                          <div className="d-flex align-items-center height_match_user_profile ">
                            <strong className="num_big mr-2">
                              {course.enrolledUsers}
                            </strong>
                          </div>
                        </div>
                        {avgRating && avgRating.avgRating && (
                          <div className="col-md-4 col-6">
                            <h5 className="main_sub_title">Rating</h5>
                            <div className="d-flex align-items-center height_match_user_profile">
                              <strong className="rating_num_big has-sidestars">
                                {Math.round(avgRating.avgRating)}
                              </strong>
                              <RatingComponent value={avgRating.avgRating} />
                            </div>
                          </div>
                        )}
                        {user?.info?.primaryInstitute?.preferences?.general?.socialSharing &&
                          !course.isExpired && (
                            <div className="col-md-4 col-6">
                              <h5 className="main_sub_title">Share</h5>
                              <div className="d-flex align-items-center height_match_user_profile">
                                <div className="socials_icons_wrap">
                                  <LinkedinShareButton
                                    url={getUtmLink("linkedin", "post")}
                                    className="mx-1"
                                  >
                                    <FontAwesomeIcon
                                      icon={faLinkedin}
                                      size="2x"
                                    />
                                  </LinkedinShareButton>
                                  <FacebookShareButton
                                    url={getUtmLink("facebook", "post")}
                                    className="mx-1"
                                  >
                                    <FontAwesomeIcon
                                      icon={faFacebookSquare}
                                      size="2x"
                                    />
                                  </FacebookShareButton>
                                  <TwitterShareButton
                                    url={getUtmLink("twitter", "post")}
                                    className="mx-1"
                                  >
                                    <FontAwesomeIcon
                                      icon={faTwitterSquare}
                                      size="2x"
                                    />
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
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!course && (
              <div className="col-lg-auto left_area">
                <SkeletonLoaderComponent Cwidth="100" Cheight="120" />
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="my-gap-common details_page_new__bg">
        <div className="container">
          <div className="row">
            {
              <div className="col-lg-auto order-lg-1 order-2 left_area">
                {!course ? (
                  <>
                    <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                    <div style={{ height: "32px" }}></div>
                    <SkeletonLoaderComponent Cwidth="100" Cheight="125" />
                    <div style={{ height: "16px" }}></div>
                    <SkeletonLoaderComponent Cwidth="100" Cheight="125" />
                  </>
                ) : (
                  <>
                    <div className="d-none d-lg-block">
                      <ul className="nav nav-pills sections_tabs horizonal_scroll">
                        <li className="nav-item">
                          <a
                            className="nav-link active"
                            onClick={() => scrollInto("course-content")}
                          >
                            Course Content
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            onClick={() => scrollInto("syllabus")}
                          >
                            Syllabus
                          </a>
                        </li>
                        {course?.description && (
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              onClick={() => scrollInto("requirements")}
                            >
                              Requirements
                            </a>
                          </li>
                        )}
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            onClick={() => scrollInto("instructor")}
                          >
                            Instructor
                          </a>
                        </li>
                        {avgRating && (
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              onClick={() => scrollInto("review")}
                            >
                              Review
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="id_sections" id="course-content">
                      {course?.learningIncludes && (
                        <div>
                          <h2 className="border_below_heading">
                            What you’ll learn
                          </h2>
                          <div className="right_tick_list two-column-list-md clearfix">
                            {course &&
                              course.learningIncludes &&
                              course.learningIncludes.length > 1000 && (
                                <ReadMore>
                                  <MathJax
                                    className="max-with-image word-break-w"
                                    value={course.learningIncludes}
                                  />
                                </ReadMore>
                              )}
                            {course.learningIncludes.length < 1000 && (
                              <MathJax
                                className="max-with-image word-break-w"
                                value={course.learningIncludes}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="id_sections" id="syllabus">
                      <h2 className="border_below_heading">Course Content</h2>
                      <div className="course-content_new">
                        <div className="content">
                          {course?.sections
                            .slice(0, contentSlice)
                            .map((item: any, i: number) => (
                              <div
                                className="form-row week-row"
                                key={"section" + i}
                              >
                                {item.status == "published" ? (
                                  <div className="week col-lg-auto d-lg-block d-flex align-items-center">
                                    <span className="number">
                                      {i > 9 ? "" : "0"}
                                      {i + 1}
                                    </span>
                                    <p className="item_name text-truncate ml-2 ml-lg-0 p-0">
                                      {item.name}
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {item.status == "published" ? (
                                  <div className="col-lg">
                                    <div className="row no-gutters">
                                      <div className="col">
                                        <h1 className="item_title">
                                          {item.title}
                                        </h1>
                                        {item &&
                                          item.summary &&
                                          item.summary.length > 500 ? (
                                          <ReadMore>
                                            <p className="summary">
                                              {item.name + " : " + item.summary}{" "}
                                            </p>
                                          </ReadMore>
                                        ) : (
                                          <></>
                                        )}
                                        {item &&
                                          item.summary &&
                                          item.summary.length < 500 ? (
                                          <p className="summary">
                                            {item.name + " : " + item.summary}{" "}
                                          </p>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                      {item.isDemo ? (
                                        <div className="col-auto">
                                          <button
                                            className="btn btn-secondary"
                                            onClick={() =>
                                              openDemoSection(item)
                                            }
                                          >
                                            Demo
                                          </button>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                    <div className="bottom row">
                                      <div className="wrap col-lg-auto d-flex flex-wrap">
                                        <span className="icon_fill_secondary">
                                          <FontAwesomeIcon
                                            icon={faGraduationCap}
                                          />
                                        </span>
                                        <div className="col px-0 align-self-center">
                                          {sectionStats[item._id]
                                            ?.onlineSession ? (
                                            <span>
                                              {appendS(
                                                sectionStats[item._id]
                                                  .onlineSession,
                                                "Online Session"
                                              )}
                                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            </span>
                                          ) : (
                                            <></>
                                          )}
                                          {sectionStats[item._id]?.note ? (
                                            <span>
                                              {appendS(
                                                sectionStats[item._id].note,
                                                "Resource"
                                              )}
                                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            </span>
                                          ) : (
                                            <></>
                                          )}
                                          {sectionStats[item._id]
                                            ?.assessment ? (
                                            <span>
                                              {appendS(
                                                sectionStats[item._id]
                                                  .assessment,
                                                "Assessment"
                                              )}
                                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            </span>
                                          ) : (
                                            <></>
                                          )}
                                          {sectionStats[item._id]?.video ? (
                                            <span>
                                              {" "}
                                              {appendS(
                                                sectionStats[item._id].video,
                                                "Video"
                                              )}
                                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            </span>
                                          ) : (
                                            <></>
                                          )}
                                          {sectionStats[item._id]?.quiz ? (
                                            <span>
                                              {" "}
                                              {appendS(
                                                sectionStats[item._id].quiz,
                                                "Quiz"
                                              )}{" "}
                                            </span>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </div>
                                      {(selectedSection != item._id ||
                                        !selectedSection) && (
                                          <div className="col-auto ml-auto align-self-center">
                                            <a
                                              className="see_all"
                                              onClick={() => showAll(item._id)}
                                            >
                                              {" "}
                                              See All
                                            </a>
                                          </div>
                                        )}
                                      {selectedSection == item._id ? (
                                        <>
                                          {console.log("sectedSection: ", item)}
                                          <div className="col-auto ml-auto align-self-center">
                                            <a
                                              className="see_all"
                                              onClick={() => showAll()}
                                            >
                                              {" "}
                                              Hide All
                                            </a>
                                          </div>
                                        </>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                    {selectedSection == item._id ? (
                                      <div>
                                        {item.contents.map(
                                          (content: any, i: number) => (
                                            <div key={"content" + i}>
                                              {content.type === "video" && (
                                                <div className="heading_with_icon d-flex">
                                                  <span className="icon_fill_outline">
                                                    <FontAwesomeIcon
                                                      icon={faPlay}
                                                    />
                                                  </span>
                                                  <strong className="align-self-center">
                                                    {content.title}
                                                  </strong>
                                                </div>
                                              )}
                                              {content.type === "quiz" && (
                                                <div className="heading_with_icon d-flex">
                                                  <span className="icon_fill_outline">
                                                    <FontAwesomeIcon
                                                      icon={faQuestion}
                                                    />
                                                  </span>
                                                  <span className="align-self-center">
                                                    {content.title}
                                                  </span>
                                                </div>
                                              )}
                                              {content.type === "note" && (
                                                <div className="heading_with_icon d-flex">
                                                  <span className="icon_fill_outline">
                                                    <FontAwesomeIcon
                                                      icon={faBookOpen}
                                                    />
                                                  </span>
                                                  <span className="align-self-center">
                                                    {content.title}
                                                  </span>
                                                </div>
                                              )}
                                              {content === "onlineSession" && (
                                                <div className="heading_with_icon d-flex">
                                                  <span className="icon_fill_outline">
                                                    <FontAwesomeIcon
                                                      icon={faGraduationCap}
                                                    />
                                                  </span>
                                                  <span className="align-self-center">
                                                    {" "}
                                                    {content.title}
                                                  </span>
                                                </div>
                                              )}
                                              {content.type === "ebook" && (
                                                <div className="heading_with_icon">
                                                  <span className="icon_fill_outline">
                                                    <FontAwesomeIcon
                                                      icon={faBookOpen}
                                                    />
                                                  </span>
                                                  <span>{content.title}</span>
                                                </div>
                                              )}
                                              {content.type ===
                                                "assessment" && (
                                                  <div className="heading_with_icon">
                                                    <span className="icon_fill_outline">
                                                      <FontAwesomeIcon
                                                        icon={faQuestion}
                                                      />
                                                    </span>
                                                    <span>{content.title}</span>
                                                  </div>
                                                )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            ))}
                          {contentSlice < publishedSection.length &&
                            publishedSection.length > 3 && (
                              <div className="text-center mt-3">
                                <a
                                  className="btn btn-outline btn-sm"
                                  onClick={() => seeAll("content")}
                                >
                                  See more
                                </a>
                              </div>
                            )}
                          {(contentSlice == publishedSection.length &&
                            publishedSection.length > 3) ||
                            (contentSlice > publishedSection.length &&
                              publishedSection.length > 3 && (
                                <div className="text-center mt-3">
                                  <a
                                    className="btn btn-outline btn-sm"
                                    onClick={() => hideAll("content")}
                                  >
                                    {" "}
                                    Hide All
                                  </a>
                                </div>
                              ))}
                        </div>
                      </div>
                    </div>
                    <div className="id_sections" id="requirements">
                      {course?.description && (
                        <div>
                          <h2 className="border_below_heading">About Course</h2>
                          <div className="clearfix">
                            {course &&
                              course.description &&
                              course.description.length > 1000 && (
                                <ReadMore>
                                  <MathJax
                                    className="max-with-image word-break-w"
                                    value={course.description}
                                  />
                                </ReadMore>
                              )}
                            {course &&
                              course.description &&
                              course.description.length < 1000 && (
                                <MathJax
                                  className="max-with-image word-break-w"
                                  value={course.description}
                                />
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="id_sections" id="instructor">
                      <div className="d-flex gap-sm">
                        <h2 className="border_below_heading">Instructor</h2>
                        {instructorSlice < course?.instructors.length &&
                          course?.instructors.length > 1 && (
                            <div>
                              <a
                                className="see_all"
                                onClick={() => seeAll("instructor")}
                              >
                                See All
                              </a>
                            </div>
                          )}
                        {((instructorSlice == course?.instructors.length &&
                          course?.instructors.length > 1) ||
                          instructorSlice > course?.instructors.length) &&
                          course?.instructors.length > 1 && (
                            <div>
                              <a
                                className="see_all"
                                onClick={() => hideAll("instructor")}
                              >
                                {" "}
                                Hide All
                              </a>
                            </div>
                          )}
                      </div>
                      {course?.instructors
                        ?.slice(0, instructorSlice)
                        .map((item: any) => (
                          <div
                            key={item.name}
                            className="form-row instructors_wrapper"
                          >
                            <div className="col-md-auto text-center mb-2 mb-md-0 w-mw-lg-125">
                              <div className="user_img_circled_wrap_big d-block mx-auto">
                                <img
                                  className="user_img_circled_big"
                                  src={avatar(item)}
                                  alt="user image profile"
                                />
                              </div>
                              <a
                                className="btn btn-primary btn-sm mt-2"
                                onClick={() => openChat(item)}
                              >
                                Send Message
                              </a>
                            </div>
                            <div className="col-md">
                              <div className="mb-2">
                                <h3 className="profile_name_big">
                                  {item?.name}
                                </h3>
                                <p>{item?.designation}</p>
                              </div>
                              <p>{item?.knowAboutUs}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                    {(course?.offeredBy?.name ||
                      course?.offeredBy?.imageUrl) && (
                        <div className="id_sections" id="offered-by">
                          <h2 className="border_below_heading">Offered by</h2>
                          <div className="form-row">
                            <div className="col-md-auto text-center mb-2 mb-md-0 w-mw-lg-125">
                              <div className="d-block mx-auto">
                                <img
                                  className="img-fluid"
                                  src="{{course?.offeredBy?.imageUrl}}"
                                  alt="user image profile"
                                />
                              </div>
                            </div>
                            <div className="col-md">
                              <div className="mb-2">
                                <h3 className="profile_name_big">
                                  {course?.offeredBy?.name}
                                </h3>
                              </div>
                              <p>{course?.offeredBy?.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    {Object.keys(avgRating).length > 0 &&
                      avgRating.avgRating && (
                        <div className="id_sections" id="review">
                          <h2 className="border_below_heading">
                            Feedback {totalItems} feedbacks
                          </h2>
                          <div className="rating_wrapper_with_comments">
                            <div className="form-row justify-content-left d-flex align-items-center rating_box_wrap">
                              <div className="col-md-auto d-flex flex-column">
                                <div className="rating-box">
                                  <h1 className="rating_big">
                                    {Math.round(avgRating.avgRating)}
                                  </h1>
                                  <RatingComponent
                                    value={avgRating.avgRating}
                                  />
                                  <div className="mt-2">
                                    <p className="">Course Rating</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md">
                                <div className="rating-bar justify-content-center">
                                  <table className="table vertical-middle table-borderless">
                                    {avgRating.ratings
                                      ?.sort((a: any, b: any) =>
                                        a.rating < b.rating ? -1 : 1
                                      )
                                      ?.map((item: any, index: number) => (
                                        <tr key={"star" + index}>
                                          <td>
                                            <div className="rating-label">
                                              {item.rating} stars
                                            </div>
                                          </td>
                                          <td className="rating-bar">
                                            <ProgressBar
                                              now={item.rating === 0 ? 0 : 100}
                                              style={{ height: "8.5px" }}
                                              variant="success"
                                            />
                                          </td>
                                          <td className="text-right">
                                            {decimal(
                                              item.rating === 0 ? 0 : 100,
                                              0
                                            )}
                                            %
                                          </td>
                                        </tr>
                                      ))}
                                  </table>
                                </div>
                              </div>
                            </div>
                            {ratings?.map((item: any, i: number) => (
                              <div
                                className="user_comment_box"
                                key={"comment" + i}
                              >
                                <div className="d-flex align-items-center">
                                  <div className="user_img_circled_wrap mr-2">
                                    <img
                                      src={avatar(item.user, "sm")}
                                      className="user_img_circled"
                                      alt=""
                                    />
                                  </div>
                                  <div>
                                    <h2 className="profile_user_name">
                                      {item.user?.name}
                                    </h2>
                                    <div>
                                      <span className="time_ago">
                                        {" "}
                                        {fromNow(item.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="user_comment">{item.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            }
            <div className="col-lg-auto order-lg-2 order-1 right_area">
              {course ? (
                <div className="sidebar_new_d sidebar_up">
                  {!course.enrolled ? (
                    <div className="widget">
                      {course.videoUrl && (
                        <div className="embed-responsive embed-responsive-16by9 mb-2">
                          <iframe
                            className="embed-responsive-item"
                            src={course.videoUrl}
                          ></iframe>
                        </div>
                      )}
                      {course?.accessMode == "buy" && (
                        <ItemPrice
                          {...course}
                          className="d-flex align-items-center"
                          showDiscount={true}
                          priceClassName="price_big"
                          newPriceClassName="new-price discounted-price"
                        />
                      )}
                      {course.includes && (
                        <div>
                          <h1 className="widget_title">Course included</h1>
                          <ul className="list-style-disc pl-3 mt-2 mb-4">
                            {course &&
                              course.includes &&
                              course.includes.length > 1000 && (
                                <ReadMore>
                                  <MathJax
                                    className="max-with-image word-break-w section_sub_heading"
                                    value={course.includes}
                                  />
                                </ReadMore>
                              )}
                            {course &&
                              course.includes &&
                              course.includes.length < 1000 && (
                                <MathJax
                                  className="max-with-image word-break-w section_sub_heading"
                                  value={course.includes}
                                />
                              )}
                          </ul>
                        </div>
                      )}
                      {course.accessMode == "buy" && (
                        <div>
                          <a
                            className="btn btn-primary btn-block mt-2"
                            onClick={() => buyNow(course)}
                          >
                            Buy Now
                          </a>
                          <div className="form-row mt-2">
                            <div className="col-auto">
                              <a className="btn btn-outline btn-block">
                                <FontAwesomeIcon
                                  icon={faHeart}
                                  onClick={() =>
                                    !course?.favorite
                                      ? addFavorite(course?._id)
                                      : removeFavorite(course?._id)
                                  }
                                />
                              </a>
                            </div>
                            {!course?.enrolled && (
                              <div className="col">
                                <a
                                  className="btn btn-outline btn-block"
                                  onClick={() => addToCart(course)}
                                >
                                  Add To Cart
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {(course.accessMode == "public" ||
                        course.accessMode == "invitation") && (
                          <div>
                            {enrolling && (
                              <div>
                                Enrolling...
                                <FontAwesomeIcon icon={faSpinner} />
                              </div>
                            )}
                            <div className="form-row mt-2">
                              <div className="col-auto">
                                <a className="btn btn-outline btn-block">
                                  {
                                    <FontAwesomeIcon
                                      icon={faHeart}
                                      onClick={() =>
                                        !course?.favorite
                                          ? addFavorite(course?._id)
                                          : removeFavorite(course?._id)
                                      }
                                    />
                                  }
                                </a>
                              </div>
                              {!course?.enrolled && (
                                <div className="col">
                                  <a
                                    className={`btn btn-primary btn-block ${enrolling ? "disabled" : ""
                                      }`}
                                    onClick={() => enroll(course)}
                                  >
                                    Enroll Now
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <>
                      <div className="widget">
                        <u>Latest Activity</u>
                        <h5 className="chapter_number">
                          Chapter {ongoingContent?.chapter}
                        </h5>
                        <h5 className="widget_title">
                          {ongoingContent?.title}
                        </h5>
                        <div className="progressbar_wrap mt-2">
                          <h5 className="text-right">
                            {courseProgress?.progress}%
                          </h5>
                          <ProgressBar
                            now={
                              !!courseProgress?.progress
                                ? courseProgress?.progress
                                : 0
                            }
                            style={{ height: "8.5px" }}
                            variant="success"
                          />
                          <p>
                            Completed {courseProgress?.completedContents} out of{" "}
                            {courseProgress?.totalContent}
                          </p>
                        </div>
                        <a
                          className="btn btn-primary btn-block mt-2"
                          href={`/course/stage/${course?._id}`}
                        >
                          {ongoingContent
                            ? "Resume Learning"
                            : "Start Learning"}
                        </a>
                      </div>
                      <div className="widget text-center">
                        <h1 className="widget_title">Analytics Overview</h1>
                        <div className="form-row mt-2">
                          <div className="col-6">
                            <p>Effort(hrs)</p>
                            <div className="m-3">
                              <CircleProgress
                                value={
                                  militoHour(totalEffort, true) == " < 1 "
                                    ? 1
                                    : parseInt(militoHour(totalEffort, true))
                                }
                                text={militoHour(totalEffort, true)}
                                innerStrokeColor="#ada5ff"
                                outerStrokeColor="#475dff"
                              />
                            </div>
                          </div>
                          <div className="col-6">
                            <p>Accuracy (%)</p>
                            <div className="m-3">
                              <CircleProgress
                                value={accuracy.pStudent}
                                text={`${accuracy.pStudent}`}
                                innerStrokeColor="#ffe2b7"
                                outerStrokeColor="#FFA24A"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <a
                            className="btn btn-primary mt-5"
                            href={`/course/analytics/${course._id}`}
                          >
                            Analytics
                          </a>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="widget text-center">
                    <div className="form-row">
                      {contentSummery?.video > 0 && (
                        <div className="col-3">
                          <div className="stage-3-data">
                            <h1 className="stage_3_t_head">Video</h1>
                            <div className="icon_wrapper">
                              <FontAwesomeIcon icon={faPlayCircle} />
                            </div>
                            <h2 className="stage_3_b_info">
                              {contentSummery?.video}
                            </h2>
                          </div>
                        </div>
                      )}
                      {contentSummery?.quiz > 0 && (
                        <div className="col-3">
                          <div className="stage-3-data">
                            <h1 className="stage_3_t_head">Quizzes</h1>
                            <div className="icon_wrapper">
                              <FontAwesomeIcon icon={faQuestionCircle} />
                            </div>
                            <h2 className="stage_3_b_info">
                              {contentSummery?.quiz}
                            </h2>
                          </div>
                        </div>
                      )}

                      {contentSummery?.resources > 0 && (
                        <div className="col-3">
                          <div className="stage-3-data">
                            <h1 className="stage_3_t_head">Readings </h1>
                            <div className="icon_wrapper">
                              <FontAwesomeIcon icon={faBookOpen} />
                            </div>
                            <h2 className="stage_3_b_info">
                              {contentSummery?.resources}
                            </h2>
                          </div>
                        </div>
                      )}
                      {contentSummery?.assessments ? (
                        <div className="col-3">
                          <div className="stage-3-data">
                            <h1 className="stage_3_t_head">Assessments</h1>
                            <div className="icon_wrapper">
                              <FontAwesomeIcon icon={faGraduationCap} />
                            </div>
                            <h2 className="stage_3_b_info">
                              {" "}
                              {contentSummery?.assessments}
                            </h2>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div className="widget text-center">
                    <div className="form-row">
                      <div className="col-4">
                        <div className="stage-3-data">
                          <h1 className="stage_3_t_head">Target Audience</h1>
                          <div className="icon_wrapper">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <h2 className="stage_3_b_info">ALL</h2>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="stage-3-data">
                          <h1 className="stage_3_t_head">Duration</h1>
                          <div className="icon_wrapper">
                            {decimal(course?.duration, 0)}
                          </div>
                          <h2 className="stage_3_b_info">days</h2>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="stage-3-data">
                          <h1 className="stage_3_t_head">Starts date</h1>
                          {course.startDate ? (
                            <>
                              <div className="icon_wrapper">
                                {" "}
                                {date(course?.startDate, "dd/MM")}
                              </div>
                              <h2 className="stage_3_b_info">
                                {date(course?.startDate, "yyyy")}
                              </h2>
                            </>
                          ) : (
                            " "
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {course.requirements && (
                    <div>
                      <h2 className="border_below_heading">Requirements</h2>
                      {course && (
                        <div className="right_tick_list">
                          {course &&
                            course.requirements &&
                            course.requirements.length > 1000 && (
                              <ReadMore>
                                <MathJax
                                  className="max-with-image word-break-w"
                                  value={course.requirements}
                                />
                              </ReadMore>
                            )}
                          {course &&
                            course.requirements &&
                            course.requirements.length < 1000 && (
                              <MathJax
                                className="max-with-image word-break-w"
                                value={course.requirements}
                              />
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="sidebar_new_d sidebar_up">
                  <div className="widget">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="75" />
                  </div>
                  <div className="widget">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="75" />
                  </div>
                  <div className="widget">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="75" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {course && !course.enrolled && (
            <div>
              {course.accessMode == "buy" && (
                <div>
                  <a
                    className="btn btn-primary btn-block mt-2"
                    onClick={() => buyNow(course)}
                  >
                    Buy Now
                  </a>
                </div>
              )}
              {(course.accessMode == "public" ||
                course.accessMode == "invitation") && (
                  <div>
                    {enrolling && (
                      <div>
                        Enrolling...
                        <FontAwesomeIcon icon={faSpinner} />
                      </div>
                    )}
                    <div className="form-row mt-2">
                      {!course?.enrolled && (
                        <div className="col">
                          <a
                            className={`btn btn-primary btn-block ${enrolling ? "disabled" : ""
                              }`}
                            onClick={() => enroll(course)}
                          >
                            Enroll Now
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentCourseDetails;
