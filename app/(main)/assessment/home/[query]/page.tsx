"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { alert } from "alertifyjs";
import Chart from "react-apexcharts";
import clientApi from "@/lib/clientApi";
import * as shoppingCartService from "@/services/shopping-cart-service";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import {
  faFacebookSquare,
  faLinkedin,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import alertify from "alertifyjs";
import { success } from "alertifyjs";
import {
  randomColor,
  slugify,
  toQueryString,
  handleExpired,
  toPascalCase,
  convertToMiliseconds,
} from "@/lib/validator";
import {
  getTestAttemptMap,
  getCachedAttemptTime,
  getCacheTestOfAttempt,
  getCacheAttemptQuestionPosition,
} from "@/lib/attemptHelper";
import { refreshCurrentUserData } from "@/lib/helpers";
import ImageFallback from "@/components/assessment/image-fallback";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import Price from "@/components/assessment/price";
import { isRequiredDemographic } from "@/services/auth";
import PQuestionChart from "@/components/assessment/p-question-chart";

const AssessmentDetail = () => {
  const param = useParams();
  const router = useRouter();
  const queryParams = useSearchParams();
  const { user }: any = useSession()?.data || {};
  const [currentName, setCurrentName] = useState("practiceDetail");
  const [clientData, setClientData] = useState<any>({});
  const [id, setId] = useState<any>("");
  const [practice, setPractice] = useState<any>({});
  const [chapters, setChapters] = useState([]);
  const [showDetailChapter, setShowDetailChapter] = useState(false);
  const [maximumMarks, setMaximumMarks] = useState<any>();
  const [
    questionDistributionByMarksLoaded,
    setQuestionDistributionByMarksLoaded,
  ] = useState<boolean>(false);
  const [questionDistributionByMarks, setQuestionDistributionByMarks] =
    useState<any>();
  const [totalAttempts, setTotalAttempts] = useState<any>();
  const [totalJoindedStudent, setTotalJoinedStudent] = useState<number>();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptsLoaded, setAttemptsLoaded] = useState<boolean>(false);
  const [ranking, setRanking] = useState<any[]>();
  const [rankingLoaded, setRankingLoaded] = useState<boolean>(false);
  const [summarySubject, setSummarySubject] = useState();
  const [questionDistributionLoaded, setQuestionDistributionLoaded] =
    useState<boolean>(false);
  const [questionDistributionByCategory, setQuestionDistributionByCategory] =
    useState<any>();
  const [chartOptions, setChartOptions] = useState<any>({
    series: [],
    options: {
      chart: {
        height: 300,
        type: "donut",
      },
      fill: {
        colors: [],
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: false,
            },
          },
        },
      },
      legend: {
        show: false,
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });
  const [psychoAttempted, setPsychoAttempted] = useState();
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [hasSavedAttempt, setHasSavedAttempt] = useState<boolean>(false);
  const [timedout, setTimedout] = useState<boolean>(false);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const delay = (time: any) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      setClientData(data);
    };
    getClientData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const testId: any =
        user.provider == "prodapt" ? param : queryParams.get("id");
      setId(testId);
      try {
        const { data } = await clientApi.get(
          `/api/tests/details/${testId}${toQueryString({
            hasAcessMode: true,
            withdraw: !!queryParams.get("withdraw"),
          })}`
        );
        setPractice({ ...data, slug: slugify(data.title) });
        const { data: attempt } = await clientApi.get(
          `/api/attempts${toQueryString({ practice: testId, home: true })}`
        );
        setAttemptsLoaded(true);
        setAttempts(
          attempt.map((e: any) => ({
            ...e,
            totalMark:
              Math.round((Number(e.totalMark) + Number.EPSILON) * 100) / 100,
          }))
        );
        if (!!attempt.length) {
          setPractice((prev: any) => ({
            ...prev,
            partiallyAttempted:
              practice.testType == "adaptive"
                ? attempt[0].totalQuestions !== practice.questionsToDisplay
                : attempt[0].totalQuestions !== practice.totalQuestion,
          }));
        }

        if (!!data?.subjects.length) {
          setChapters(
            data.subjects.map((e: any) => ({
              _id: e._id,
              name: e.name,
              slugfly: e.name.replace(/\ /g, "-"),
            }))
          );
        }
        let mark;
        if (data.testType === "adaptive") {
          mark = data.questionsToDisplay * data.plusMark;
        } else if (data.isMarksLevel) {
          mark = data.totalQuestion * data.plusMark;
        } else {
          const { data: result } = await clientApi.get(
            `/api/tests/getMaximumMark/${data._id}`
          );
          mark = result;
        }
        setMaximumMarks(mark);
        setShowDetailChapter(true);
        // setTotalAttempts(data.totalAttempt);
        setTotalAttempts(attempt.length);
        setTotalJoinedStudent(data.totalJoindedStudent);
      } catch (error: any) {
        const message = error?.message;
        console.log(error, "error>>>");
        alert("Message", message);
        // router.push('/assessment/home')
      }
      // await delay(1000)
      const cachedAttemptId = getTestAttemptMap(
        user._id,
        queryParams.get("id")
      );
      if (!!cachedAttemptId) {
        const { data: attendanceStatus } = await clientApi.get(
          `/api/attendanceStatus/${queryParams.get("id")}?${user._id}`
        );
        const hasSavedAtt = attendanceStatus.status !== "terminated";
        setHasSavedAttempt(hasSavedAtt);
        if (hasSavedAtt) {
          try {
            const savedTime: any = getCachedAttemptTime(cachedAttemptId);

            if (savedTime) {
              let testTimeCountDown = savedTime.testTimeCountDown;

              if (practice?.enableSection) {
                const questionPos =
                  getCacheAttemptQuestionPosition(cachedAttemptId);

                if (questionPos) {
                  let sectionNo = questionPos.sectionNo;

                  const timepassed =
                    (new Date().getTime() -
                      new Date(savedTime.savePoint).getTime()) /
                    1000;
                  let countdown = testTimeCountDown;

                  const cachedTest =
                    getCacheTestOfAttempt(cachedAttemptId) || practice;
                  // bypass section if they are also timeout
                  while (
                    cachedTest.sections[sectionNo + 1] &&
                    countdown - timepassed < 0
                  ) {
                    sectionNo++;
                    countdown += cachedTest.sections[sectionNo].time * 60;
                  }
                  testTimeCountDown = countdown - timepassed;
                }
              } else {
                // recalculate test time count down
                testTimeCountDown -=
                  (new Date().getTime() -
                    new Date(savedTime.savePoint).getTime()) /
                  1000;
              }

              // if user resume time over total test time, give it 1 second minimum
              if (testTimeCountDown < 1) {
                setTimedout(true);
              }
            }
          } catch (error) {}
        }
      }
    };
    !!user && fetchData();
  }, [user]);

  useEffect(() => {
    const getDistributionByMarks = async () => {
      const { data } = await clientApi.get(
        `/api/questions/distributionByMarks/${practice._id}`
      );
      setQuestionDistributionByMarks(data);
      setQuestionDistributionByMarksLoaded(true);
    };

    const getRanking = async () => {
      if (practice.isShowAttempt) {
        const { data } = await clientApi.get(
          `/api/attempts/summaryPractice/${practice._id}${toQueryString({
            limit: 5,
            page: 1,
            sort: "pecentCorrects,-1",
            topPerformers: true,
          })}`
        );
        setRanking(
          data.attempts.map((e: any) => ({
            ...e,
            totalMark:
              Math.round((Number(e.totalMark) + Number.EPSILON) * 100) / 100,
          }))
        );
      }
      setRankingLoaded(true);
    };

    const getSummarySubject = async () => {
      if (currentName === "practiceDetail") {
        const { data } = await clientApi.get(
          `/api/questions/practiceSummaryBySubject/${id}`
        );
        setSummarySubject(!!data ? data : practice.questionsPerSubject);
      } else {
        setSummarySubject(practice.questionsPerSubject);
      }
      setQuestionDistributionLoaded(true);
    };

    const getDistributionByCategory = async () => {
      const { data } = await clientApi.get(
        `/api/questions/distributionByCategory/${practice._id}`
      );
      let series: any = [];
      let label: any = [];
      let colors: any = [];
      setQuestionDistributionByCategory(
        data.map((e: any) => {
          const c = randomColor();
          series.push(parseInt(e?.count));
          label.push(e?.category);
          colors.push(c);
          return { ...e, color: c };
        })
      );
      setChartOptions((prev: any) => ({
        ...prev,
        series: series,
        options: {
          ...prev.options,
          labels: label,
          fill: {
            ...prev.options.fill,
            colors: colors,
          },
        },
      }));
    };

    const getPsychometry = async () => {
      if (practice.testType === "psychometry") {
        const { data: psychometry } = await clientApi.get(
          `/api/attempts/psychoResultByTest/${practice._id}`
        );
        setPsychoAttempted(psychometry);
      }
      setIsExpired(handleExpired(practice));
    };

    if (!!Object.keys(practice).length && !!id) {
      getDistributionByMarks();
      getRanking();
      getSummarySubject();
      getDistributionByCategory();
      getPsychometry();
    }
  }, [practice, id]);

  const handleShareClick = (type: string) => {
    const url = `${clientData.baseUrl}public/assessments/${practice._id}/${practice.slug}?loc=${user.activeLocation}`;

    switch (type) {
      case "linkedin":
        window.open(
          `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            url
          )}`
        );
        break;

      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`
        );
        break;

      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`
        );
        break;

      case "copy":
        navigator.clipboard.writeText(url);
        notifyCopied();
        break;

      default:
        break;
    }

    alertify.set("notifier", "position", "top-right");
    success("Public link is copied to clipboard!");
  };

  const notifyCopied = () => {
    // replace with your notification logic
  };

  const addToCart = (practice: any) => {
    // if (this.activatedRoute.snapshot.queryParams['loc']) {
    //   course.note = { enrollingLocation: this.activatedRoute.snapshot.queryParams['loc'] }
    // }
    shoppingCartService.addItem(practice, 1, "practice");
  };

  const buyNow = (practice: any) => {
    addToCart(practice);
    router.push("/cart");
  };

  const enroll = async (ts: any) => {
    const params: any = {};
    if (queryParams.get("loc")) {
      params["location"] = queryParams.get("loc");
    }

    await clientApi
      .get(`/api/tests/enroll/${ts._id}${toQueryString(params)}`)
      .then(() => {
        success("Successfully enrolled to this subjects");
        setEnrolling(true);
        refreshCurrentUserData();
      })
      .catch(() => {
        alert("Error", "Please check your network status.");
      });
  };

  const resumeAttempt = () => {
    if (practice.testMode === "learning") {
      // if (practice.testType == "adaptive") {
      //   router.push(
      //     `student/adaptive/learning/${practice._id}${toQueryString({
      //       resume: true,
      //     })}`
      //   );
      // } else {
      //   router.push(
      //     `student/learning-test/${practice._id}${toQueryString({
      //       resume: true,
      //     })}`
      //   );
      router.push(
        `student/adaptive/learning/${practice._id}${toQueryString({
          resume: true,
        })}`
      );
    } else {
      if (practice.testType == "adaptive") {
        router.push(
          `student/adaptive/test/${practice._id}${toQueryString({
            resume: true,
          })}`
        );
      } else {
        router.push(
          `student/take-test/${practice._id}${toQueryString({
            resume: true,
          })}`
        );
      }
    }
  };

  const submitPendingAttempt = () => {
    // if (submitting) return
    // setSubmitting(true)
    // let isFeedback = false
    // let questionPage = 0
    // // restore user data
    // try {
    //   const cachedAttemptId = getTestAttemptMap(user._id, practice._id)
    //   const questionPos: any = getCacheAttemptQuestionPosition(cachedAttemptId)
    //   const questionIndex = questionPos.questionIndex + questionPos.lastLength
    //   const savedTime: any = getCachedAttemptTime(cachedAttemptId)
    //   const lastCheckpointTime = savedTime.lastCheckpointTime
    //   const cachedTest = getCacheTestOfAttempt(cachedAttemptId)
    //   // appInit.answersOfUser = attemptHelper.getCacheUserAnswers(cachedAttemptId)
    //   const answerData: any = attemptHelper.getUserAnswers(
    //     cachedTest,
    //     questionIndex,
    //     lastCheckpointTime,
    //   )
    //   answerData.attemptId = cachedAttemptId
    //   // Adjust time in case of timeout
    //   answerData.createdAt = savedTime.serverStartTime
    //   answerData.try = 0
    //   const savedOrder = attemptHelper.getCacheQuestionOrder(cachedAttemptId)
    //   if (savedOrder) {
    //     answerData.questionOrder = savedOrder.questions
    //   }
    //   attemptService
    //     .finish(answerData)
    //     .subscribe(
    //       (data: any) => {
    //         attemptHelper.clearCachedAttempt(
    //           user._id,
    //           practice._id,
    //           cachedAttemptId,
    //         )
    //         appInit.answersOfUser.QA = []
    //         if (appInit.totalMarkeds) {
    //           delete appInit.totalMarkeds
    //         }
    //         if (data.isPartnerExam) {
    //           router.push(['/student/result-submission'])
    //           return
    //         }
    //         if (!('showFeedback' in practice) || practice.showFeedback) {
    //           router.push(['/student/test-feedbacks', practice._id, data._id], {
    //             replaceUrl: true,
    //           })
    //         } else {
    //           isFeedback = false
    //           questionPage = 0
    //           if (data.QA && data.QA.length > 0) {
    //             data.QA.forEach((question, index) => {
    //               if (question.feedback && questionPage < 1) {
    //                 isFeedback = true
    //                 questionPage = index + 1
    //                 return
    //               }
    //             })
    //           }
    //           if (isFeedback) {
    //             alertify.confirm(
    //               'You have marked one or more question for feedback. Do you want to give feedback now?',
    //               (closeEvent) => {
    //                 router.push(
    //                   [
    //                     '/student/question-review',
    //                     'feedback',
    //                     data._id,
    //                     questionPage,
    //                   ],
    //                   { replaceUrl: true },
    //                 )
    //               },
    //               (closeEvent) => {
    //                 router.push(['/student/attemptSummary', data._id], {
    //                   replaceUrl: true,
    //                 })
    //               },
    //             )
    //           } else {
    //             router.push(['/student/attemptSummary', data._id], {
    //               replaceUrl: true,
    //             })
    //           }
    //         }
    //       },
    //       (err) => {
    //         console.log(err)
    //         alertify.alert("Message",'Fail to submit attempt.')
    //       },
    //     )
    //     .add(() => {
    //       submitting = false
    //       spinner.hide('appLoader')
    //     })
    // } catch (ex) {
    //   console.log(ex)
    //   alertify.alert("Message",'Fail to restore attempt.')
    //   submitting = false
    //   spinner.hide('appLoader')
    // }
  };

  const checkBeforeStartTest = () => {
    if (!practice.attemptAllowed || practice.attemptAllowed > 0) {
      window.scrollTo(0, 0);
      return true;
    } else {
      return false;
    }
  };
  const startTest = () => {
    const validate = checkBeforeStartTest();
    if (validate) {
      gotToNextRoute();
    } else {
      alert(
        "Message",
        "You have reached maximum number of permitted attempts on this test. Please contact Perfectice or publisher of this test."
      );
    }
  };

  const gotToNextRoute = () => {
    if (practice.testMode == "proctored" || practice.camera) {
      router.push(`/assessment/instruction-camera/${practice._id}`);
    } else if (isRequiredDemographic(practice.demographicData, user)) {
      router.push(`/assessment/demographic-data/${practice._id}`);
    } else {
      router.push(`/assessment/instruction/${practice._id}`);
    }
  };

  return (
    <div className="bg-white test_details">
      <section className="details test_details-top-banner mt-0 text-white">
        <div className="container">
          <div className="details-area mx-auto mw-100">
            <div className="row align-items-center">
              <div className="col">
                {showDetailChapter ? (
                  <div className="asses-info">
                    <div className="title-wrap clearfix position-relative d-lg-flex align-items-center">
                      <div className="title">
                        <h3
                          data-toggle="tooltip"
                          data-placement="top"
                          title={practice?.title}
                          className="mr-2"
                        >
                          {practice?.title}
                        </h3>
                      </div>

                      <div className="info-text">
                        <span>{toPascalCase(practice?.testMode)}</span>
                      </div>

                      {practice?.lastAttempt &&
                        practice?.lastAttempt.isAbandoned &&
                        practice?.lastAttempt.ongoing && (
                          <div className="info-text ml-2">
                            <span>Ongoing</span>
                          </div>
                        )}
                    </div>

                    <div className="position-relative">
                      <div className="asses-user clearfix d-flex align-items-center pt-2 pb-0">
                        <figure className="user_img_circled_wrap">
                          <div className="profile-user">
                            <figure>
                              <div className="user_img_circled">
                                <img
                                  src={"/assets/images/defaultProfile.png"}
                                  alt="User"
                                />
                              </div>
                            </figure>
                          </div>
                        </figure>

                        <div className="position-relative">
                          <div className="name ml-2 pl-0">
                            <h4 className="py-0">{practice?.userInfo?.name}</h4>
                            <small className="f-12 text-white">
                              Published (
                              {moment(new Date()).diff(
                                moment(practice?.statusChangedAt),
                                "d"
                              )}{" "}
                              {moment(new Date()).diff(
                                moment(practice?.statusChangedAt),
                                "d"
                              ) > 1
                                ? "days"
                                : "day"}{" "}
                              ago)
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {practice?.status === "published" &&
                      practice?.accessMode !== "invitation" &&
                      !isExpired && (
                        <div className="mt-2">
                          <div className="socials_icons_wrap">
                            <a
                              aria-label="linkedin link"
                              onClick={() => handleShareClick("linkedin")}
                              className="text-white mr-3"
                            >
                              <FontAwesomeIcon
                                icon={faLinkedin}
                                fontSize={29}
                              />
                            </a>
                            <a
                              aria-label="facebook link"
                              onClick={() => handleShareClick("facebook")}
                              className="text-white mr-3"
                            >
                              <FontAwesomeIcon
                                icon={faFacebookSquare}
                                fontSize={29}
                              />
                            </a>
                            <a
                              aria-label="Twitter link"
                              onClick={() => handleShareClick("twitter")}
                              className="text-white mr-3"
                            >
                              <FontAwesomeIcon
                                icon={faTwitterSquare}
                                fontSize={29}
                              />
                            </a>
                            <a
                              aria-label="Copy link"
                              onClick={() => handleShareClick("copy")}
                              className="text-white"
                            >
                              <FontAwesomeIcon icon={faCopy} fontSize={29} />
                            </a>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <SkeletonLoaderComponent Cwidth="100" Cheight="112" />
                )}
              </div>
              <div className="col-auto ml-auto">
                <div className="d-none d-lg-block">
                  <div className="asses-right clearfix border-0 ml-auto">
                    <div className="asses-item border-0 position-relative">
                      <figure>
                        <img src="/assets/images/clock.png" alt="clock" />
                      </figure>
                      {showDetailChapter ? (
                        <h4 className="text-white">{practice?.totalTime}</h4>
                      ) : (
                        <SkeletonLoaderComponent Cwidth={100} Cheight={50} />
                      )}
                      <span className="text-white">Minutes</span>
                    </div>

                    <div className="asses-item position-relative">
                      <figure>
                        <img src="/assets/images/question.png" alt="Question" />
                      </figure>
                      {showDetailChapter ? (
                        <h4 className="text-white">
                          {practice?.testType !== "standard"
                            ? practice?.questionsToDisplay
                            : practice?.totalQuestion}
                        </h4>
                      ) : (
                        <SkeletonLoaderComponent Cwidth={100} Cheight={50} />
                      )}
                      <span className="text-white">Questions</span>
                    </div>

                    <div className="asses-item pr-3 position-relative">
                      <figure>
                        <img src="/assets/images/pen.png" alt="Question" />
                      </figure>
                      {showDetailChapter ? (
                        <h4 className="text-white">{totalAttempts}</h4>
                      ) : (
                        <SkeletonLoaderComponent Cwidth={100} Cheight={50} />
                      )}
                      <span className="text-white">
                        {totalAttempts > 1 ? "Attempts" : "Attempt"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="asses-box bg-white d-block d-lg-none">
        <div className="container">
          <div className="asses-box-area">
            <div className="row asses-box-area-wrap">
              <div className="col-3 px-1">
                <div className="asses-box-item">
                  <figure>
                    <img src="/assets/images/clock-gray.png" alt="" />
                  </figure>
                  <h4>{practice?.totalTime}</h4>
                  <span>Minutes</span>
                </div>
              </div>

              <div className="col-3 px-1">
                <div className="asses-box-item">
                  <figure>
                    <img src="/assets/images/question-gray.png" alt="" />
                  </figure>
                  <h4>
                    {practice?.testType !== "standard"
                      ? practice?.questionsToDisplay
                      : practice?.totalQuestion}
                  </h4>
                  <span>Questions</span>
                </div>
              </div>

              <div className="col-3 px-1">
                <div className="asses-box-item">
                  <figure>
                    <img src="/assets/images/pen-gray.png" alt="" />
                  </figure>
                  <h4>{totalAttempts}</h4>
                  <span>{totalAttempts > 1 ? "Attempts" : "Attempt"}</span>
                </div>
              </div>

              <div className="col-3 px-1">
                <div className="asses-box-item">
                  <figure className="mx-auto">
                    <img src="/assets/images/protected.png" alt="" />
                  </figure>
                  <span className="text-center">
                    {toPascalCase(practice?.testMode)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="asses-about bg-white pt-3">
        <div className="container">
          <div className="asses-about-area asses-about-area_new mx-auto mw-100">
            <div className="row">
              <div className="col-xl-9 col-lg-8">
                {!!practice?.description && (
                  <div className="info">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        What is this Assessment all about?
                      </h3>
                      <p className="section_sub_heading">
                        {practice.description}
                      </p>
                    </div>
                  </div>
                )}
                <div className="info">
                  <div className="section_heading_wrapper position-relative">
                    {questionDistributionByMarksLoaded ? (
                      <h3 className="section_top_heading">Markings Scheme</h3>
                    ) : (
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    )}
                  </div>

                  <div className="pt-0 marking-scheme">
                    {!practice.isMarksLevel ? (
                      <>
                        {questionDistributionByMarksLoaded && (
                          <div className="row">
                            {questionDistributionByMarks.map(
                              (qd: any, i: number) => (
                                <div className="col-md-6" key={i}>
                                  <div className="item">
                                    <h4>
                                      <h4>
                                        {qd.category === "mcq"
                                          ? "Multiple Choice Question"
                                          : qd.category === "fib"
                                          ? "Fill in the blanks Question"
                                          : qd.category}
                                      </h4>
                                    </h4>

                                    <div className="row">
                                      <div className="col-6">
                                        <div className="item-inner">
                                          <span className="text-center">
                                            +{qd.plusMark}
                                          </span>
                                          <p className="text-center">
                                            For Correct answer
                                          </p>
                                        </div>
                                      </div>

                                      <div className="col-6">
                                        <div className="item-inner">
                                          <span className="text-center">
                                            {qd.minusMark}
                                          </span>
                                          <p className="text-center">
                                            For Wrong answer
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {!questionDistributionByMarksLoaded && (
                          <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                        )}
                      </>
                    ) : (
                      <div className="row">
                        <div className="col-auto">
                          {questionDistributionByMarksLoaded ? (
                            <div className="item text-center">
                              <h4>Total Marks</h4>

                              <div className="item-inner">
                                <span>{maximumMarks}</span>
                              </div>
                            </div>
                          ) : (
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="100"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="info">
                  <div className="section_heading_wrapper position-relative">
                    {showDetailChapter ? (
                      <h3 className="section_top_heading">Subjects Included</h3>
                    ) : (
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    )}
                  </div>

                  <div className="d-flex flex-wrap">
                    {chapters.map((chapter: any) => (
                      <div
                        className="col-lg-4 mb-0 d-flex px-2"
                        key={chapter._id}
                      >
                        <Link
                          href={`/assessment/subjects/${chapter.slugfly}?id=${chapter._id}`}
                          className="btn btn-sm w-100 d-flex flex-column"
                          style={{ height: "90px" }}
                        >
                          <div className="chapter-box flex-grow-1">
                            <div className="row align-items-center">
                              <div className="col-lg">
                                <h1
                                  className="f-16 my-0 text-truncate"
                                  style={{ textAlign: "left" }}
                                >
                                  {chapter.name}
                                </h1>
                              </div>{" "}
                              <div className="col-12 col-lg-auto ml-auto">
                                <div className="d-none d-lg-block">
                                  <div className="practice-btn-remove mt-2"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {!showDetailChapter && (
                    <>
                      <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                      <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                    </>
                  )}
                </div>

                <div className="info">
                  <div className="position-relative">
                    {attemptsLoaded ? (
                      <h3 className="mb-0">Attempt History</h3>
                    ) : (
                      <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                    )}
                  </div>
                  <div className="pt-4 position-relative">
                    {attemptsLoaded ? (
                      <>
                        {attempts?.length > 0 ? (
                          <>
                            {attempts.map((attempt: any) => (
                              <div className="chapter-box" key={attempt._id}>
                                <div className="row">
                                  <div className="col-12 col-lg mb-2">
                                    <div className="date-time mb-2 mt-3">
                                      <span>
                                        {format(
                                          new Date(attempt.createdAt),
                                          "MMM d, y, h:MM:SS b"
                                        )}
                                      </span>
                                      <span>
                                        {" "}
                                        (
                                        {formatDistanceToNow(
                                          new Date(attempt.createdAt)
                                        )}{" "}
                                        ago)
                                      </span>
                                    </div>

                                    <div className="row">
                                      <div className="col-auto">
                                        <div className="attempt-info clearfix d-flex align-items-center">
                                          <figure
                                            title="Marks"
                                            hidden={
                                              !attempt.isShowAttempt ||
                                              !attempt.isEvaluated
                                            }
                                          >
                                            <img
                                              src="/assets/images/calender.png"
                                              alt=""
                                            />
                                          </figure>
                                          <figure
                                            title="Question"
                                            hidden={
                                              attempt.isShowAttempt &&
                                              attempt.isEvaluated
                                            }
                                          >
                                            <img
                                              src="/assets/images/questionAttempt.png"
                                              alt=""
                                            />
                                          </figure>
                                          <span
                                            title="Marks"
                                            hidden={
                                              !attempt.isShowAttempt ||
                                              !attempt.isEvaluated
                                            }
                                          >
                                            {attempt.totalMark}/
                                            {attempt.maximumMarks}
                                          </span>
                                          <span
                                            title="Question"
                                            hidden={
                                              attempt.isShowAttempt &&
                                              attempt.isEvaluated
                                            }
                                          >
                                            {attempt.totalQuestions -
                                              attempt.totalMissed}
                                            /{attempt.totalQuestions}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="col-auto">
                                        <div className="attempt-time-info clearfix d-flex align-items-center">
                                          <figure>
                                            <img
                                              src="/assets/images/stopwatch.png"
                                              alt=""
                                            />
                                          </figure>
                                          <span title="Total Time">
                                            {convertToMiliseconds(
                                              attempt.totalTime
                                            )}
                                          </span>
                                        </div>
                                      </div>

                                      <div
                                        className="col-auto"
                                        hidden={
                                          !attempt.isShowAttempt ||
                                          !attempt.isEvaluated
                                        }
                                      >
                                        <div className="attempt-result clearfix d-flex align-items-center">
                                          <figure>
                                            <img
                                              src="/assets/images/user-profile-img.png"
                                              alt=""
                                            />
                                          </figure>
                                          <span>
                                            {(
                                              (attempt.totalCorrects /
                                                attempt.totalQuestions) *
                                              100
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* {
                                      user.userRole !== "student" && */}
                                  <div className="col-12 col-lg-auto">
                                    <div className="ml-auto">
                                      <div className="float-right view-report ml-lg-auto mt-4">
                                        <a
                                          href={`/attempt-summary/${attempt._id}`}
                                          className="btn btn-outline btn-sm"
                                        >
                                          Review
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                  {/* } */}
                                </div>
                                {attempt.isAbandoned && (
                                  <div className="marked">
                                    <span className="text-white">
                                      ABANDONED
                                    </span>
                                  </div>
                                )}
                                {attempt.partiallyAttempted &&
                                  practice?.testMode === "learning" && (
                                    <div className="marked">
                                      <span className="text-white">
                                        {attempt.partiallyAttempted
                                          ? "Partially Attempted"
                                          : "Attempted"}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="chapter-box" style={{ padding: 15 }}>
                            <p className="mb-0">
                              You haven&apos;t attempted this assessment yet
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                        <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                        <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4">
                <div className="sidebar">
                  <div className="item-wrap ml-auto">
                    {!Object.keys(practice).length ? (
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    ) : (
                      <>
                        {!!practice._id && practice.status !== "revoked" && (
                          <>
                            {practice.testMode !== "learning" ? (
                              <div className="item-widget border p-3 rounded mb-3">
                                {!practice?.enrolled && (
                                  <>
                                    {practice.accessMode === "buy" ? (
                                      <>
                                        <div className="d-flex align-items-center">
                                          <Price
                                            {...practice}
                                            showDiscount
                                            currencyCode={practice.currency}
                                            priceClass="price_big text-dark"
                                          />
                                        </div>
                                        <a
                                          className="btn btn-primary btn-block mt-2"
                                          onClick={() => buyNow(practice)}
                                        >
                                          Buy Now
                                        </a>
                                        <div className="form-row my-2">
                                          <div className="col">
                                            <a
                                              className="btn btn-outline btn-block"
                                              onClick={() =>
                                                addToCart(practice)
                                              }
                                            >
                                              Add To Cart
                                            </a>
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="item widget">
                                        {enrolling ? (
                                          <>
                                            <div className="ml-auto position-relative mb-2">
                                              <a
                                                className="btn btn-primary btn-block"
                                                onClick={() => startTest()}
                                              >
                                                Take Assessment
                                              </a>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="take-asses-btn">
                                            <a
                                              className="text-center text-white px-3"
                                              onClick={() => enroll(practice)}
                                            >
                                              Enroll Now
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}

                                {!isExpired &&
                                  !timedout &&
                                  hasSavedAttempt &&
                                  practice.accessMode !== "buy" &&
                                  (!practice.isAdaptive ||
                                    practice.user != user._id) &&
                                  practice.enrolled && (
                                    <div className="ml-auto position-relative mb-2">
                                      <a
                                        className="btn btn-primary btn-block"
                                        onClick={() => resumeAttempt()}
                                      >
                                        Resume
                                      </a>
                                    </div>
                                  )}

                                {(isExpired || timedout) && hasSavedAttempt && (
                                  <div className="resume-btn-remove ml-auto text-center mb-2">
                                    <a
                                      className="btn btn-primary btn-block"
                                      onClick={() => submitPendingAttempt()}
                                    >
                                      Submit Pending Attempt
                                    </a>
                                  </div>
                                )}

                                {practice &&
                                  (!practice.isAdaptive ||
                                    practice.user != user._id) &&
                                  practice.enrolled && (
                                    <div className="ml-auto position-relative mb-2">
                                      <a
                                        className="btn btn-primary btn-block"
                                        onClick={() => startTest()}
                                      >
                                        Take Assessment
                                      </a>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div>
                                {practice.accessMode === "buy" &&
                                  !practice.enrolled && (
                                    <div className="item widget">
                                      <>
                                        <div className="d-flex align-items-center">
                                          <Price
                                            {...practice}
                                            showDiscount
                                            priceClass="price_big text-dark"
                                          />
                                        </div>
                                        <a
                                          className="btn btn-primary btn-block mt-2"
                                          onClick={() => buyNow(practice)}
                                        >
                                          Buy Now
                                        </a>
                                        <div className="form-row my-2">
                                          <div className="col">
                                            <a
                                              className="btn btn-outline btn-block"
                                              onClick={() =>
                                                addToCart(practice)
                                              }
                                            >
                                              Add To Cart
                                            </a>
                                          </div>
                                        </div>
                                      </>
                                    </div>
                                  )}
                                {(!practice.isAdaptive ||
                                  practice.user != user._id) &&
                                  (practice.accessMode !== "buy" ||
                                    practice.enrolled) && (
                                    <div className="ml-auto position-relative mb-2">
                                      <a
                                        className="btn btn-primary btn-block"
                                        onClick={() => startTest()}
                                      >
                                        {!practice.partiallyAttempted
                                          ? "Take Assessment"
                                          : "Resume"}
                                      </a>
                                    </div>
                                  )}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <div className="position-relative">
                      {practice &&
                        (!practice.isAdaptive ||
                          practice.user !== user?._id) && (
                          <div className="item widget toppers">
                            <h5>Top Performer</h5>
                            {ranking?.map((item: any) => (
                              <div
                                className="profile-item d-flex align-items-center"
                                key={item.studentName}
                              >
                                <figure>
                                  <div className="user_img_circled">
                                    <img
                                      src={
                                        item?.student
                                          ? item?.student
                                          : "/assets/images/defaultProfile.png"
                                      }
                                      alt={item.studentName}
                                    />
                                  </div>
                                </figure>

                                <div className="profile-name">
                                  <h5 className="w-auto">{item.studentName}</h5>
                                </div>
                                <span className="ml-auto out-of-marks">
                                  {item.totalMark}/{maximumMarks}
                                </span>
                              </div>
                            ))}
                            {!ranking?.length && (
                              <div className="profile-item">
                                <p>No Data Available</p>
                              </div>
                            )}
                          </div>
                        )}
                      {!rankingLoaded && (
                        <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                      )}
                    </div>
                    <div className="position-relative">
                      {practice.testType !== "random" && (
                        <>
                          {questionDistributionLoaded ? (
                            (!practice.isAdaptive ||
                              practice.user === user?._id) && (
                              <div className="item widget pt-1">
                                <PQuestionChart
                                  practice={practice}
                                  summarySubject={summarySubject}
                                  pieChartTitle="Distribution by Subject & Unit"
                                />
                              </div>
                            )
                          ) : (
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="400"
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className="position-relative">
                      {practice.testType !== "random" && (
                        <div className="item widget pt-1">
                          {questionDistributionLoaded ? (
                            (!practice.isAdaptive ||
                              practice.user == user._id) && (
                              <>
                                <h2 className="mb-0 describe-chart">
                                  Distribution by Question Type
                                </h2>
                                <div
                                  id="chart_by_category"
                                  className="content-chart-overflow"
                                >
                                  <Chart
                                    series={chartOptions.series}
                                    options={chartOptions.options}
                                    type="donut"
                                    height={300}
                                    width={250}
                                  />
                                </div>
                                {questionDistributionByCategory?.map(
                                  (data: any, i: number) => (
                                    <div
                                      className="accordion"
                                      id="accordion"
                                      key={i}
                                    >
                                      <div
                                        id={`dataOne_distributionbycategory_${i}`}
                                      >
                                        {data.questions.length > 1 ? (
                                          <>
                                            <button
                                              className="btn border-0 p-0 dropdown-toggle w-100"
                                              onClick={() =>
                                                setExpanded(!expanded)
                                              }
                                              aria-expanded={expanded}
                                              aria-controls={`collapsedata_distributionbycategory_${i}`}
                                            >
                                              <div className="form-row">
                                                <div className="col">
                                                  <p
                                                    className="dot_circle"
                                                    style={{
                                                      background: data.color,
                                                    }}
                                                  >
                                                    <span className="text-left"></span>
                                                    <small className="pl-4">
                                                      {data.category}
                                                    </small>
                                                  </p>
                                                </div>

                                                <div className="col-auto ml-auto">
                                                  <div className="marks ml-auto">
                                                    <span>{data.count}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </button>
                                            <div
                                              id={`collapsedata_distributionbycategory_${i}`}
                                              className="collapse py-2"
                                              aria-labelledby="dataOne"
                                              data-parent="#accordion"
                                            >
                                              {data.questions.map(
                                                (q: any, index: number) => (
                                                  <div
                                                    className="row"
                                                    key={index}
                                                  >
                                                    <div className="col">
                                                      <div className="name">
                                                        <span className="purple">
                                                          {q.category} (
                                                          {q.marks}m)
                                                        </span>
                                                      </div>
                                                    </div>

                                                    <div className="col-auto">
                                                      <div className="number ml-auto">
                                                        <span className="pl-0">
                                                          {q.count}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </>
                                        ) : (
                                          <button className="btn border-0 p-0 w-100">
                                            <div className="form-row">
                                              <div className="col">
                                                <p
                                                  className="dot_circle"
                                                  style={{
                                                    background: data.color,
                                                  }}
                                                >
                                                  <span className="text-left"></span>
                                                  <small className="pl-4">
                                                    {data.category}
                                                  </small>
                                                </p>
                                              </div>

                                              <div className="col-auto ml-auto">
                                                <div className="marks ml-auto">
                                                  <span>{data.count}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </>
                            )
                          ) : (
                            <SkeletonLoaderComponent
                              Cwidth="100"
                              Cheight="400"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {practice && practice.testMode !== "learning" && (
        <div className="d-block d-lg-none">
          {practice.accessMode === "buy" && !practice.enrolled && (
            <div className="mb-5">
              <div className="take-asses-btn">
                <a
                  className="text-center text-white px-3"
                  onClick={() => addToCart(practice)}
                >
                  Add to cart
                </a>
              </div>

              <div className="take-asses-btn">
                <a
                  className="text-center text-white px-3"
                  onClick={() => buyNow(practice)}
                >
                  Buy now
                </a>
              </div>
            </div>
          )}

          {(practice.accessMode === "public" ||
            practice.accessMode === "invitation") &&
            !practice.enrolled && (
              <div className="take-asses-btn mb-5">
                <a
                  className="text-center text-white px-3"
                  onClick={() => enroll(practice)}
                >
                  Enroll Now
                </a>
              </div>
            )}

          {!practice.isAdaptive ||
            (practice.user !== user._id && practice.enrolled && (
              <div className="take-asses-btn mb-5">
                <a className="text-center text-white px-3" onClick={startTest}>
                  Take Assessment
                </a>
              </div>
            ))}

          {hasSavedAttempt && isExpired === false && !timedout && (
            <div className="take-asses-btn mb-5">
              <a
                className="text-center text-white px-3"
                onClick={resumeAttempt}
              >
                Resume
              </a>
            </div>
          )}

          {hasSavedAttempt && (isExpired || timedout) && (
            <div className="take-asses-btn mb-5">
              <a
                className="text-center text-white px-3"
                onClick={submitPendingAttempt}
              >
                Submit Pending Attempt
              </a>
            </div>
          )}
        </div>
      )}

      {practice && practice.testMode === "learning" && (
        <div className="d-block d-lg-none">
          {practice.accessMode === "buy" && !practice.enrolled && (
            <div className="mb-5">
              <div className="take-asses-btn">
                <a
                  className="text-center text-white px-3"
                  onClick={() => addToCart(practice)}
                >
                  Add to cart
                </a>
              </div>

              <div className="take-asses-btn">
                <a
                  className="text-center text-white px-3"
                  onClick={() => buyNow(practice)}
                >
                  Buy now
                </a>
              </div>
            </div>
          )}

          {!practice.isAdaptive ||
            (practice.user !== user._id &&
              (practice.accessMode !== "buy" || practice.enrolled) && (
                <div className="take-asses-btn mb-5">
                  <a
                    className="text-center text-white px-3"
                    onClick={startTest}
                  >
                    {practice.partiallyAttempted ? "Resume" : "Take Assessment"}
                  </a>
                </div>
              ))}
        </div>
      )}
    </div>
  );
};
export default AssessmentDetail;
