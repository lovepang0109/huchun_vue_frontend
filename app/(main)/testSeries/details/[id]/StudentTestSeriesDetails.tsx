"use client";

import clientApi from "@/lib/clientApi";
import { limitTo } from "@/lib/pipe";
import { toQueryString } from "@/lib/validator";
import { ProgressBar } from "react-bootstrap";
import { getSession, useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { alert, success } from "alertifyjs";
import alertify from "alertifyjs";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import PQuestionChart from "@/components/assessment/p-question-chart";
import MathJax from "@/components/assessment/mathjax";
import ReadMore from "@/components/assessment/read-more";
import Image from "next/image";
import { slugify } from "@/lib/validator";
import CircleProgress from "@/components/CircleProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as subjectSvc from "@/services/subjectService";

import moment from "moment";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
  faViacoin,
} from "@fortawesome/free-brands-svg-icons";
import Facebook from "next-auth/providers/facebook";
import {
  faCopy,
  faHeart,
  faCirclePlay,
  faFileAlt,
} from "@fortawesome/free-regular-svg-icons";

import {
  FaUsers,
  FaSortNumericUp,
  FaClock,
  FaUserGraduate,
} from "react-icons/fa";
import {
  appendS,
  avatar,
  date,
  decimal,
  fromNow,
  militoHour,
  numberToAlpha,
} from "@/lib/pipe";
import styles from "./detail.module.css";
import ItemPrice from "@/components/ItemPrice";
import * as shoppingCartService from "@/services/shopping-cart-service";

export default function StudentTestSeriesDetails() {
  const [params, setParams] = useState<any>({ id: "" });
  const [testSeries, setTestSeries] = useState<any>();
  const [userDoAttempts, setUserDoAttempts] = useState<number>(0);
  const { user } = useSession().data || {};
  const [totalTestmarks, setTotalTestmarks] = useState<string>();
  const [filterattempt, setFilterAttempt] = useState<string>("All");
  const [totalMarks, setTotalMarks] = useState<string[]>([]);
  const [summarySubject, setSummarySubject] = useState<object[]>([]);
  const [showfilter, setShowFilter] = useState<boolean>(false);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [practices, setPractices] = useState<any>();
  const [config, setConfig] = useState<any>();
  const [accuracyData, setAccuracyData] = useState<any>({});
  const [hoursData, setHoursData] = useState<any>({});
  const [ongoingTest, setOngoingTest] = useState<any>({});
  const [studentLevel, setStudentLevel] = useState<number>(1);
  const [paging, setPaging] = useState<any>({ limit: 15 });
  const router = useRouter();
  const [common, setCommon] = useState<any>();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [levelSubjects, setLevelSubjects] = useState<any[]>([]);

  const getUtmLink = (src: any, med: any) => {
    // const utmData = `source=${src}&medium=${med}&campaign=${user?.info.userId}`
    // if (this.testSeries.accessMode == 'invitation') {
    //   return `${this.config.baseUrl}student/testSeries/details/${this.testSeries._id}?utm=${this.common.base64UrlEncode(utmData)}`
    // } else {
    // }
    // console.log(config);
    // return `${config?.baseUrl}public/testseries/${testSeries._id}/${testSeries.slug}?utm=${base64UrlEncode(utmData)}&loc=${user?.info.activeLocation}`
  };

  const notifyCopied = () => {
    alertify.set("notifier", "position", "top-right");
    success("Public link is copied to clipboard!");
  };

  const addToCart = (testseries: any) => {
    if (searchParams.get("loc")) {
      testseries.note = { enrollingLocation: searchParams.get("loc") };
    }
    shoppingCartService.addItem(testseries, 1, "testseries");
  };

  const buyNow = (testseries: any) => {
    addToCart(testseries);
    router.push("/cart");
  };

  const isNotExpired = () => {
    if (testSeries.expiresOn) {
      if (new Date(testSeries.expiresOn).getTime() < new Date().getTime()) {
        return false;
      }
    }
    return true;
  };

  const track = (index: any, item: any) => {
    return item._id;
  };

  const enroll = () => {
    setEnrolling(true);
    const params: any = {
      testseries: testSeries._id,
      type: "testseries",
    };
    if (searchParams.get("loc")) {
      params.enrollingLocation = searchParams.get("loc");
    }

    clientApi.post(`/api/payments/enrollItems`, params).then((data) => {
      if (data) {
        clientApi
          .get(`/api/testSeries/summary/${params.testseries}`)
          .then((res: any) => {
            success("Sucessfully Enrolled to this test series");
            const practice: any = [];
            res.data.practiceIds.forEach((element: any) => {
              if (element.status === "published") {
                practice.push(element);
              }
            });
            res.data.practiceIds = practice;
            setTestSeries(res.data);
            setEnrolling(false);
          });
      }
    });
  };

  const removeFavorite = (id: any) => {
    clientApi.delete(`/api/testSeries/removefavorite/${id}`).then((da) => {
      setTestSeries((prev: any) => ({
        ...prev,
        favorite: false,
      }));
      success("Successfully removed from favorites");
    });
  };

  const getLastAttempt = (test: any, alltest: any) => {
    // if (alltest?.enrolled) {
    //   return null;
    // }

    const atm = alltest?.attemptedTests.find((e: any) => e._id == test._id);
    if (atm) setShowFilter(true);
    return atm ? atm : null;
  };

  const filterchanged = (fil: any) => {
    setFilterAttempt(fil.target.value);
  };

  const isPreviousTestAttempted = (test: any, index: any) => {
    if (index == 0) {
      return true;
    }

    for (let i = 0; i < practices?.length; i++) {
      if (practices[i]._id == test._id) {
        return !!practices[i - 1].lastAttempt;
      }
    }

    return true;
  };

  useEffect(() => {
    clientApi
      .get(`/api/settings`)
      .then((res) => {
        setConfig(res.data);
        setParams({ id: id });
        const data: any = {};
        if (searchParams.get("enroll")) {
          data.enroll = true;
        }

        if (searchParams.get("loc")) {
          data.loc = searchParams.get("loc");
        }
        clientApi
          .get(`/api/testSeries/summary/${id}${toQueryString(data)}`)
          .then(async (res: any) => {
            if (data.enroll) {
            }
            if (res.data.videoUrl) {
            }
            res.data.instructors = [...res.data.instructors, res.data.user];
            res.data.slug = slugify(res.data.title);
            // res.data.videoUrl = embedVideo(res.data.videoUrl)
            setTestSeries(res.data);

            if (config?.features.studentLevel && testSeries.testLevel) {
              let minLevel = 0;
              for (const s of res.data?.subjects) {
                const subLevel = await user?.info?.levelHistory?.find(
                  (l: any) => l.subjectId == s._id
                );
                if (subLevel && (minLevel == 0 || subLevel.level < minLevel)) {
                  minLevel = subLevel.level;
                }
              }
              setStudentLevel(minLevel == 0 ? 1 : minLevel);
            }
            clientApi
              .get(`/api/subjects/getLevelInfoForTestSeries/${id}${toQueryString({ level: studentLevel })}`)
              .then((competency: any) => {
                setLevelSubjects([]);
                for (const sub of competency.data.subjects) {
                  if (!sub.totalQuestion && !sub.quality) {
                    continue;
                  }

                  sub.toSolve = sub.totalQuestion - sub.attemptedQuestion;
                  sub.toSolve = sub.toSolve > 0 ? sub.toSolve : 0;

                  if (sub.attemptedQuestion == 0) {
                    sub.toCorrect = ((sub.totalQuestion / 100) * sub.quality).toFixed(0);
                    if (sub.toCorrect < 1) {
                      sub.toCorrect = 1;
                    }
                    sub.accuracyMassage = sub.accuracy.toFixed(0) + "%" + '<br/>' + "Goal: " + sub.quality.toFixed(0) + "% "
                  } else {
                    if (sub.accuracy >= sub.quality) {
                      sub.toCorrect = 0;
                      sub.accuracyMassage = "Accuracy Meets";
                    } else {
                      if (sub.totalQuestion > sub.totalAvailableQuestion) {
                        sub.accuracyMassage = "Insufficient questions";
                      } else {
                        if (sub.totalAvailableQuestion - sub.totalAttemptedQuestion <= 0) {
                          sub.accuracyMassage = "Limit Exhausted";
                        } else {
                          sub.accuracy = sub.accuracy.toString()
                          sub.accuracyMassage = sub.accuracy.slice(0, (sub.accuracy.indexOf(".")) + 3) + "%" + '<br/>' + "Goal: " + sub.quality.toFixed(0) + "% "
                        }
                      }
                    }
                  }

                  sub.color = '#' + Math.floor(Math.random() * 16777215).toString(16);

                  setLevelSubjects((prevLevelSubjects) => ([...prevLevelSubjects, sub]));
                }
              }).catch((err) => {
                console.log(err);
              });

            clientApi
              .get(`/api/tests/getByTestSeries/${toQueryString({ id: id })}`)
              .then((data: any) => {
                setPractices(data.data.practiceSetByExam);
                const fetchData = async (data: any) => {
                  try {
                    data.data.practiceSetByExam =
                      data.data.practiceSetByExam.map((t: any) => {
                        t.lastAttempt = getLastAttempt(t, res.data);
                        return t;
                      });

                    // data.data.practiceSetByExam.map(
                    //   (practice: any, i: number) => {
                    //     if (isPreviousTestAttempted(practice, i)) {
                    //       const updatedOngoingTest =
                    //         data.data.practiceSetByExam[i];
                    //       updatedOngoingTest.index = i + 1;
                    //       setOngoingTest(updatedOngoingTest);
                    //       console.log(updatedOngoingTest, "update>>>>>>")
                    //     }
                    //     return practice;
                    //   }
                    // );
                    const updatedOngoingTest =
                      data.data.practiceSetByExam[
                      res.data?.attemptedTests.length
                      ];
                    updatedOngoingTest.index =
                      res.data?.attemptedTests.length + 1;
                    setOngoingTest(updatedOngoingTest);
                  } catch (error) {
                    console.error("Error fetching data:", error);
                  }
                };

                fetchData(data);

                const p = {
                  practice: data.data.practiceSetByExam.map((w: any) => w._id),
                };

                const getTestSummary = async () => {
                  const { data } = await clientApi.get(
                    `/api/questions/testSeriesSummaryBySubject${toQueryString(
                      p
                    )}`
                  );
                  setSummarySubject(limitTo(data, 6));
                };
                getTestSummary();
              })
              .catch((err) => {
                setPractices([]);
              });

            if (searchParams.get("enroll") && !testSeries?.enrolled) {
              enroll();
            }

            getAnalytics();
          })
          .catch((err) => {
            console.log(err);
          });

        if (searchParams.get("savedUtm")) {
          updateUtmData(searchParams.get("savedUtm"));
        }

        if (searchParams.get("utm")) {
          savePrivateUtm(searchParams.get("utm"));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);



  const updateUtmData = (data: any) => {
    try {
      clientApi
        .put(`/api/users/marketingUtm/status`, data)
        .then((res: any) => { });
    } catch (err) {
      console.log(err);
    }
  };

  const savePrivateUtm = (code: any) => { };

  const getAnalytics = () => {
    clientApi
      .get(
        `/api/testSeries/percentAccuracyTestseries/${id}${toQueryString({
          userOnly: true,
        })}`
      )
      .then((data) => {
        setAccuracyData(data.data);
      });
    clientApi
      .get(
        `/api/testSeries/practiceHoursTestSeries/${id}${toQueryString({
          userOnly: true,
        })}`
      )
      .then((data) => {
        setHoursData(data.data);
      });
  };

  const canTakeTest = (test: any, index: any) => {
    // if (config.features.studentLevel) {
    if (testSeries?.practiceIds?.length == testSeries?.attemptedTests?.length)
      return true;

    if (test?.level <= studentLevel || test?.level == undefined) {
      if (testSeries.enableOrdering) {
        return isPreviousTestAttempted(test, index);
      } else {
        return true;
      }
    } else {
      return false;
    }
    // }
    // else {
    //   if (testSeries.enableOrdering) {
    //     return isPreviousTestAttempted(test, index);
    //   } else {
    //     return true
    //   }
    // }
  };

  const startTest = (practice: any) => {
    if (!testSeries?.enrolled) {
      alert("Message", "You need to Enroll the Test Series first");
      return;
    } else {
      localStorage.setItem(
        `${user?.info?._id}_${practice._id}_reference`,
        JSON.stringify({
          referenceType: "testseries",
          referenceId: testSeries._id,
        })
      );

      router.push(
        `/assessment/home/${practice.title}${toQueryString({
          id: practice._id,
        })}`
      );
    }
  };

  const addFavorite = (id: any) => {
    clientApi.put(`/api/testSeries/addfavorite/${id}`).then((da: any) => {
      setTestSeries((prev: any) => ({
        ...prev,
        favorite: true,
      }));
      success("Successfully added to favorites");
    });
  };

  const getTitle = (arr: any) => {
    arr = arr.map((e: any) => e.name);
    return arr.slice(1).join(",");
  };

  const ImageComponent = ({
    height,
    width,
    imageUrl,
    backgroundColor,
    text,
    testMode,
    fontSize,
    type,
  }: any) => {
    return (
      <div>
        <img
          style={{ height, width, backgroundColor }}
          src={imageUrl}
          alt={text}
        />
        <p style={{ fontSize }}>{text}</p>
      </div>
    );
  };

  console.log('testSeries.enrolled:', testSeries?.enrolled);
  console.log('testSeries.testLevel:', testSeries?.testLevel);
  console.log('levelSubjects.length:', levelSubjects.length);
  return (
    <div>
      <section className="details_top_area_common">
        <div className="container">
          <div className="row">
            <div className="col-lg-auto left_area">
              <h2
                className="main_title"
                data-toggle="tooltip"
                data-placement="top"
                title={testSeries?.title}
              >
                {testSeries?.title}
              </h2>
              <p
                className="bottom_title"
                data-toggle="tooltip"
                data-placement="top"
                title={testSeries?.summary}
              >
                {testSeries?.summary}{" "}
              </p>

              {testSeries && (
                <div className="details_below_summary">
                  <div className="d-flex justify-content-between mt-2">
                    <div className="mb-2 mb-md-0">
                      <h4 className="main_sub_title">Instructor</h4>
                      <div className="form-row align-items-center">
                        {testSeries.instructors.slice(0, 2).map((item: any) => (
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
                        {testSeries?.instructors?.length > 2 && (
                          <div className="col-auto mb-2">
                            + {testSeries.instructors.length - 2}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="main_sub_title">Enrolled Student(s)</h4>
                      <div className="d-flex align-items-center height_match_user_profile ">
                        <strong className="num_big mr-2">
                          {testSeries.enrolledCount}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <h4 className="main_sub_title">Subject</h4>
                      <div className="d-flex align-items-center height_match_user_profile">
                        <p>
                          {testSeries.subjects[0].name}
                          {testSeries.subjects?.length > 1 && (
                            <span
                              data-toggle="tooltip"
                              data-placement="right"
                              title={getTitle(testSeries?.subjects)}
                            >
                              + {testSeries.subjects?.length - 1} more
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {isNotExpired() && (
                      <div>
                        <h4 className="main_sub_title">Share</h4>
                        <div className="d-flex align-items-center height_match_user_profile">
                          <div className="socials_icons_wrap cursor-pointer">
                            <a
                              aria-label="linkedin"
                              shareButton="linkedin"
                              href={getUtmLink("linkedin", "post")}
                            >
                              <FontAwesomeIcon
                                icon={faLinkedin}
                                className="fa-2x"
                              />
                            </a>
                            <a
                              aria-label="facebook"
                              shareButton="facebook"
                              href={getUtmLink("facebook", "post")}
                            >
                              <FontAwesomeIcon
                                icon={faFacebook}
                                className="fa-2x"
                              />
                            </a>
                            <a
                              aria-label="twitter"
                              shareButton="twitter"
                              href={getUtmLink("twitter", "post")}
                            >
                              <FontAwesomeIcon
                                icon={faTwitter}
                                className="fa-2x"
                              />
                            </a>
                            <a
                              aria-label="CopyButton"
                              shareButton="copy"
                              href={getUtmLink("platform", "individual")}
                              onClick={notifyCopied}
                            >
                              <FontAwesomeIcon
                                icon={faCopy}
                                className="fa-2x"
                              />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="my-gap-common details_page_new__bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-auto order-lg-1 order-2 left_area">
              <div className="id_sections" id="course-content">
                {testSeries?.description && (
                  <div>
                    <h2 className="border_below_heading">What you’ll learn</h2>
                    <div className="right_tick_list two-column-list-md clearfix">
                      {testSeries?.description &&
                        testSeries?.description?.length > 1000 && (
                          <ReadMore>
                            <MathJax value={testSeries?.description} />
                          </ReadMore>
                        )}
                      {testSeries?.description &&
                        testSeries?.description?.length < 1000 && (
                          <MathJax value={testSeries?.description} />
                        )}
                    </div>
                  </div>
                )}
              </div>
              <div className="id_sections" id="syllabus">
                <h2 className="border_below_heading">Test Series Content</h2>
                {showfilter && (
                  <div className="filter-item float-right">
                    <select
                      className="form-control"
                      aria-label="Default select example"
                      onChange={filterchanged}
                    >
                      <option selected value="All">
                        All
                      </option>
                      <option value="Attempted">Attempted</option>
                      <option value="UnAttempted">UnAttempted</option>
                    </select>
                  </div>
                )}

                {practices && (
                  <div>
                    {practices?.length > 0 && (
                      <div>
                        {practices.map((test: any, i: any) => {
                          if (i > paging?.limit) return;
                          if (
                            filterattempt != "All" &&
                            ((filterattempt == "UnAttempted" &&
                              test.lastAttempt) ||
                              (filterattempt == "Attempted" &&
                                !test.lastAttempt))
                          )
                            return;
                          else
                            return (
                              <div
                                className="product_type_row type-1"
                                style={{ height: "115px" }}
                              >
                                <div className="d-flex">
                                  <div className="col-auto px-0">
                                    <figure className="product_img">
                                      <div
                                        className={styles["image-container"]}
                                      >
                                        {/* <img src='/assets/images/shape-1.png' /> */}
                                        <ImageComponent
                                          height={115}
                                          width={100}
                                          imageUrl={`/assets/images/shape-1.png`}
                                          backgroundColor={test.colorCode}
                                          testMode={test.testMode}
                                          fontSize={15}
                                          type={"assessment"}
                                        />
                                        <img src="/assets/images/18.png" />
                                      </div>
                                    </figure>
                                  </div>
                                  <div className="col text-truncate">
                                    <div className="product_inner">
                                      <div>
                                        <h2
                                          className="product_title text-truncate"
                                          title="{test.title}"
                                        >
                                          {test.title}
                                        </h2>
                                        <div className="form-row">
                                          <div className="col-auto text-truncate">
                                            <p className="subject_name">
                                              {test.subjects[0].name}
                                            </p>
                                          </div>
                                          <div className="col-auto">
                                            {test.subjects[1] &&
                                              test.subjects[1].name && (
                                                <span>
                                                  +{test.subjects?.length - 1}{" "}
                                                  more
                                                </span>
                                              )}
                                          </div>
                                        </div>
                                        <div className="form-row my-2">
                                          <div className="col-auto questions_number">
                                            <FaSortNumericUp className="fas mr-1" />
                                            {test.totalQuestion} questions
                                          </div>
                                          <div className="col-auto minutes_number">
                                            <FaClock className="fas mr-1" />
                                            {test.totalTime} minutes
                                          </div>
                                          {test.level ? (
                                            <div className="col-auto minutes_number">
                                              <FaUserGraduate className="fas mr-1" />
                                              level {test.level}
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </div>
                                      <div className="d-flex justify-content-between gap-sm">
                                        <div className="form-row my-1">
                                          {test.lastAttempt && (
                                            <i className="col-auto minutes_number">
                                              {/* Attempt Date: &nbsp; */}
                                              {moment(
                                                test.lastAttempt
                                                  ? test.lastAttempt.createdAt
                                                  : test.updatedAt
                                              ).format(
                                                "MMM D, YYYY h:mm:s:A"
                                              )}{" "}
                                              &nbsp; (
                                              {moment(new Date()).diff(
                                                moment(
                                                  test.lastAttempt
                                                    ? test.lastAttempt.createdAt
                                                    : test.updatedAt
                                                ),
                                                "h"
                                              ) < 24 ? (
                                                <>
                                                  {moment(new Date()).diff(
                                                    moment(
                                                      test.lastAttempt
                                                        ? test.lastAttempt
                                                          .createdAt
                                                        : test.updatedAt
                                                    ),
                                                    "h"
                                                  ) == 0
                                                    ? 1
                                                    : moment(new Date()).diff(
                                                      moment(
                                                        test.lastAttempt
                                                          ? test.lastAttempt
                                                            .createdAt
                                                          : test.updatedAt
                                                      ),
                                                      "h"
                                                    )}{" "}
                                                  {moment(new Date()).diff(
                                                    moment(
                                                      test.lastAttempt
                                                        ? test.lastAttempt
                                                          .createdAt
                                                        : test.updatedAt
                                                    ),
                                                    "h"
                                                  ) > 0
                                                    ? "hours ago"
                                                    : "day ago"}
                                                </>
                                              ) : (
                                                <>
                                                  {moment(new Date()).diff(
                                                    moment(
                                                      test.lastAttempt
                                                        ? test.lastAttempt
                                                          .createdAt
                                                        : test.updatedAt
                                                    ),
                                                    "d"
                                                  ) < 30 ? (
                                                    <>
                                                      {moment(new Date()).diff(
                                                        moment(
                                                          test.lastAttempt
                                                            ? test.lastAttempt
                                                              .createdAt
                                                            : test.updatedAt
                                                        ),
                                                        "d"
                                                      ) == 0
                                                        ? 1
                                                        : moment(
                                                          new Date()
                                                        ).diff(
                                                          moment(
                                                            test.lastAttempt
                                                              ? test
                                                                .lastAttempt
                                                                .createdAt
                                                              : test.updatedAt
                                                          ),
                                                          "d"
                                                        )}{" "}
                                                      {moment(new Date()).diff(
                                                        moment(
                                                          test.lastAttempt
                                                            ? test.lastAttempt
                                                              .createdAt
                                                            : test.updatedAt
                                                        ),
                                                        "d"
                                                      ) > 0
                                                        ? "days ago"
                                                        : "day ago"}
                                                    </>
                                                  ) : (
                                                    <>
                                                      {moment(new Date()).diff(
                                                        moment(
                                                          test.lastAttempt
                                                            ? test.lastAttempt
                                                              .createdAt
                                                            : test.updatedAt
                                                        ),
                                                        "M"
                                                      ) < 12 ? (
                                                        <>
                                                          {moment(
                                                            new Date()
                                                          ).diff(
                                                            moment(
                                                              test.lastAttempt
                                                                ? test
                                                                  .lastAttempt
                                                                  .createdAt
                                                                : test.updatedAt
                                                            ),
                                                            "M"
                                                          ) == 0
                                                            ? 1
                                                            : moment(
                                                              new Date()
                                                            ).diff(
                                                              moment(
                                                                test.lastAttempt
                                                                  ? test
                                                                    .lastAttempt
                                                                    .createdAt
                                                                  : test.updatedAt
                                                              ),
                                                              "M"
                                                            )}{" "}
                                                          {moment(
                                                            new Date()
                                                          ).diff(
                                                            moment(
                                                              test.lastAttempt
                                                                ? test
                                                                  .lastAttempt
                                                                  .createdAt
                                                                : test.updatedAt
                                                            ),
                                                            "M"
                                                          ) > 0
                                                            ? "months ago"
                                                            : "month ago"}
                                                        </>
                                                      ) : (
                                                        <>
                                                          {moment(
                                                            new Date()
                                                          ).diff(
                                                            moment(
                                                              test.lastAttempt
                                                                ? test
                                                                  .lastAttempt
                                                                  .createdAt
                                                                : test.updatedAt
                                                            ),
                                                            "y"
                                                          ) == 0
                                                            ? 1
                                                            : moment(
                                                              new Date()
                                                            ).diff(
                                                              moment(
                                                                test.lastAttempt
                                                                  ? test
                                                                    .lastAttempt
                                                                    .createdAt
                                                                  : test.updatedAt
                                                              ),
                                                              "y"
                                                            )}{" "}
                                                          {moment(
                                                            new Date()
                                                          ).diff(
                                                            moment(
                                                              test.lastAttempt
                                                                ? test
                                                                  .lastAttempt
                                                                  .createdAt
                                                                : test.updatedAt
                                                            ),
                                                            "M"
                                                          ) > 1
                                                            ? "years ago"
                                                            : "year ago"}
                                                        </>
                                                      )}
                                                    </>
                                                  )}
                                                </>
                                              )}
                                              )
                                            </i>
                                          )}
                                        </div>
                                        <div className="d-flex gap-sm">
                                          {test.lastAttempt && (
                                            <div>
                                              <a
                                                className="btn btn-outline btn-sm"
                                                href={`/attempt-summary/${test.lastAttempt.lastAttempt}`}
                                              >
                                                Last Attempt
                                              </a>
                                            </div>
                                          )}
                                          {(canTakeTest(test, i) ||
                                            test.lastAttempt) && (
                                              <div>
                                                <a
                                                  className="btn btn-outline btn-sm"
                                                  onClick={() => startTest(test)}
                                                >
                                                  {" "}
                                                  View
                                                </a>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {test.lastAttempt && (
                                    <div className="marked-remove">
                                      <span className="product_badge text-white">
                                        Attempted
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-auto order-lg-2 order-1 right_area">
              <div className="sidebar_new_d sidebar_up">
                {!testSeries?.enrolled && (
                  <div className="widget">
                    {testSeries?.videoUrl && (
                      <div className="embed-responsive embed-responsive-16by9 mb-2">
                        <iframe
                          className="embed-responsive-item"
                          src={testSeries?.videoUrl}
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    {testSeries?.accessMode === "buy" && (
                      <ItemPrice
                        {...testSeries}
                        showDiscount={true}
                        priceclassName="price_big"
                      ></ItemPrice>
                    )}
                    {testSeries?.includes && (
                      <div className="mb-2">
                        <h3 className="widget_title">Test Series includes</h3>

                        <ul className="list-style-disc pl-3 mt-2 mb-4">
                          <li>
                            {testSeries.includes &&
                              testSeries.includes?.length > 1000 && (
                                <ReadMore>
                                  <MathJax value={testSeries?.includes} />
                                </ReadMore>
                              )}
                            {testSeries.includes &&
                              testSeries.includes?.length < 1000 && (
                                <MathJax value={testSeries?.includes} />
                              )}
                          </li>
                        </ul>
                      </div>
                    )}
                    {testSeries?.accessMode === "buy" && (
                      <div>
                        <a
                          className="btn btn-primary btn-block mt-2"
                          onClick={() => buyNow(testSeries)}
                        >
                          {" "}
                          Buy Now
                        </a>
                        <div className="form-row mt-2">
                          <div className="col-auto">
                            <a className="btn btn-outline btn-block">
                              {!testSeries?.favorite && (
                                <i
                                  onClick={() => addFavorite(testSeries?.id)}
                                  className="far fa-heart"
                                ></i>
                              )}
                              {testSeries?.favorite && (
                                <i
                                  onClick={() => removeFavorite(testSeries?.id)}
                                  className="fas fa-heart"
                                ></i>
                              )}
                            </a>
                          </div>
                          <div className="col">
                            <a
                              className="btn btn-outline btn-block"
                              onClick={() => addToCart(testSeries)}
                            >
                              Add To Cart
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    {(testSeries?.accessMode === "public" ||
                      testSeries?.accessMode === "invitation") && (
                        <div>
                          {enrolling && (
                            <div>
                              Enrolling...
                              <i className="fa fa-pulse fa-spinner"></i>
                            </div>
                          )}
                          <div className="form-row mt-2">
                            <div className="col-auto">
                              <a className="btn btn-outline btn-block">
                                {!testSeries?.favorite && (
                                  <i
                                    onClick={() => addFavorite(testSeries?._id)}
                                    className="far fa-heart"
                                  ></i>
                                )}
                                {testSeries?.favorite && (
                                  <i
                                    onClick={() =>
                                      removeFavorite(testSeries?._id)
                                    }
                                    className="fas fa-heart"
                                  ></i>
                                )}
                              </a>
                            </div>
                            {!enrolling && (
                              <div className="col">
                                {" "}
                                <a
                                  className="btn btn-primary btn-block"
                                  onClick={enroll}
                                >
                                  {" "}
                                  Enroll Now
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {testSeries?.enrolled &&
                  (ongoingTest || config?.features?.studentLevel) && (
                    <div className="widget">
                      <div className="d-flex justify-content-between">
                        <u>Latest Activity</u>
                        {config?.features?.studentLevel && (
                          <div className="bold">
                            Current Level {studentLevel}
                          </div>
                        )}
                      </div>
                      {ongoingTest && ongoingTest?._id && (
                        <div>
                          <h2 className="chapter_number lh-16">
                            Test-{ongoingTest?.index}
                          </h2>
                          <h3 className="widget_title">
                            {ongoingTest?.title}
                          </h3>
                          <p>{ongoingTest?.description}</p>
                        </div>
                      )}

                      <div className="progressbar_wrap mt-2">
                        <h4 className="text-right">
                          {(
                            (testSeries?.attemptedTests.length /
                              testSeries?.practiceIds.length) *
                            100
                          ).toFixed(2)}{" "}
                          %
                        </h4>
                        <ProgressBar
                          className="mb-2"
                          min={0}
                          max={100}
                          now={
                            (testSeries?.attemptedTests.length /
                              testSeries?.practiceIds.length) *
                            100
                          }
                          variant="success"
                          style={{ height: "8.5px" }}
                        ></ProgressBar>
                        Completed {testSeries?.attemptedTests.length} out of{" "}
                        {testSeries?.practiceIds.length}
                      </div>
                      {ongoingTest && ongoingTest._id && (
                        <a
                          className="btn btn-primary btn-block mt-2"
                          onClick={() => startTest(ongoingTest)}
                        >
                          {" "}
                          Resume
                        </a>
                      )}
                    </div>
                  )}
                <div className="order-lg-2 order-1">
                  {testSeries?.enrolled &&
                    hoursData?.user &&
                    accuracyData?.user && (
                      <div className="widget text-center">
                        <h4 className="widget_title">Analytics Overview</h4>
                        <div className="form-row mt-2">
                          <div className="col-6">
                            <p className="mb-4">Effort(hrs)</p>
                            <CircleProgress
                              value={
                                militoHour(hoursData?.user.totalTime, true) ==
                                  " < 1 "
                                  ? 1
                                  : parseInt(
                                    militoHour(
                                      hoursData?.user.totalTime,
                                      true
                                    )
                                  )
                              }
                              text={militoHour(hoursData?.user.totalTime, true)}
                              innerStrokeColor="#ada5ff"
                              outerStrokeColor="#475dff"
                            />
                          </div>
                          <div className="col-6">
                            <p className="mb-4">Accuracy (%)</p>
                            <CircleProgress
                              value={accuracyData?.user.accuracy}
                              text={`${accuracyData?.user.accuracy.toFixed(0)}`}
                              innerStrokeColor="#ffe2b7"
                              outerStrokeColor="#FFA24A"
                            />
                          </div>
                        </div>
                        <a
                          className="btn btn-primary mt-5"
                          href={`../analytics/${testSeries?._id}`}
                        >
                          {" "}
                          Analytics
                        </a>
                      </div>
                    )}
                </div>

                {testSeries?.enrolled && testSeries?.testLevel && levelSubjects.length && (
                  <div className="widget text-center">
                    <h4 className="widget_title">Proficiency</h4>
                    {levelSubjects.map((subject) => (
                      <div className="text-center mt-3" key={subject._id}>
                        <div className="d-flex justify-content-around align-items-center">
                          <div
                            style={{
                              width: '120px',
                              height: '120px',
                              borderRadius: '50%',
                              border: `solid 2px ${subject.color}`,
                            }}
                            className="d-flex justify-content-center align-items-center"
                          >
                            {subject.totalQuestion ? (
                              <div>
                                <span>{!subject.toSolve && 'Volume Meets'}</span>
                                <span>{subject.toSolve && `${subject.toSolve} + to solve`}</span>
                              </div>
                            ) : (
                              <div>
                                <span>Volume Meets</span>
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              width: '120px',
                              height: '120px',
                              borderRadius: '50%',
                              border: `solid 2px ${subject.color}`,
                            }}
                            className="d-flex justify-content-center align-items-center"
                            dangerouslySetInnerHTML={{ __html: subject.accuracyMassage }}
                          />
                        </div>
                        <div className="text-center mt-3">
                          <span style={{ padding: '10px 10px', background: subject.color }}>
                            {subject.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="widget text-center px-0 py-0">
                  <div className="form-row">
                    <div className="col-6">
                      <div className="stage-3-data">
                        <h4 className="stage_3_t_head">Questions</h4>
                        <div className="icon_wrapper my-0">
                          <FontAwesomeIcon icon={faCirclePlay} />
                        </div>
                        <h4 className="stage_3_b_info">
                          {testSeries?.totalQuestions}
                        </h4>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stage-3-data">
                        <h4 className="stage_3_t_head">Assessments</h4>
                        <div className="icon_wrapper my-0">
                          <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <h4 className="stage_3_b_info">
                          {testSeries?.totalTests}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="widget text-center">
                  <div className="form-row">
                    <div className="col-4">
                      <div className="stage-3-data">
                        <h5 className="stage_3_t_head">Target Audience</h5>
                        <div className="icon_wrapper">
                          <FaUsers className="fas" />
                        </div>
                        <h6 className="stage_3_b_info">ALL</h6>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stage-3-data">
                        <h5 className="stage_3_t_head">Duration</h5>
                        <div className="icon_wrapper">
                          {testSeries?.totalHours}
                        </div>
                        <h6 className="stage_3_b_info">hours</h6>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stage-3-data">
                        <h5 className="stage_3_t_head">Starts date</h5>
                        {testSeries?.startDate && (
                          <div className="icon_wrapper">
                            {" "}
                            {`${testSeries?.startDate?.slice(
                              5,
                              7
                            )}/${testSeries?.startDate?.slice(8, 10)}`}
                          </div>
                        )}
                        {testSeries?.startDate && (
                          <h6 className="stage_3_b_info">
                            {testSeries?.startDate?.slice(0, 4)}
                          </h6>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="widget">
                  <h2 className="border_below_heading">Subject Distribution</h2>
                  <PQuestionChart
                    summarySubject={summarySubject}
                    practice={null}
                    pieChartTitle="Description goes here"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div>
              <div style={{ width: "100%", height: "100px" }}></div>
              <div style={{ width: "100%", height: "100px" }}></div>
              <div style={{ width: "100%", height: "100px" }}></div>
              <div style={{ width: "100%", height: "100px" }}></div>
              <div style={{ width: "100%", height: "100px" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
