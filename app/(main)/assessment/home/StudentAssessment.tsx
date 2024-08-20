"use client";

import { useState, useEffect } from "react";
import "react-alice-carousel/lib/alice-carousel.css";
import LoadingOverlay from "react-loading-overlay-ts";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PImageComponent from "@/components/AppImage";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { toQueryString } from "@/lib/validator";
import TestSkeleton from "@/components/skeleton/TestSkeleton";
import TestCardContainerWithCarousel from "@/components/assessment/test-card/ContainerWithCarousel";
import TestCardContainer from "@/components/assessment/test-card/Container";
import svg from "@/components/svg";
import CustomCarousel from "@/components/assessment/carousel";
import clientApi from "@/lib/clientApi";
import * as testSvc from "@/services/practiceService";
import * as favoriteService from "@/services/favaorite-service";
import * as settingSvc from "@/services/settingService";
import * as subjectSvc from "@/services/subjectService";
import * as serviceSvc from "@/services/suportService";
import * as questionSvc from "@/services/questionService";
import * as userSvc from "@/services/userService";
import * as shoppingCartService from "@/services/shopping-cart-service";
import { alert, success } from "alertifyjs";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.min.css";
import "alertifyjs/build/css/themes/default.min.css";
//import "./MyCarousel.css";
//import "./MyCarousel.module.css";
import { limitTo } from "@/lib/pipe";
import moment from "moment";
import { useRouter } from "next/navigation";
import AliceCarousel from "react-alice-carousel";
import { Carousel, ProgressBar } from "react-bootstrap";
import FavoriteButton from "@/components/FavoriteButton";
import ItemPrice from "@/components/ItemPrice";
import AddToCartButton from "@/components/AddToCartButton";

const StudentAssessment = () => {
  const { push } = useRouter();
  const user: any = useSession()?.data?.user?.info || {};
  const [params, setParams] = useState({
    page: 1,
    limit: 15,
    sort: "statusChangedAt,desc",
    home: true,
    excludeUser: true,
    favorite: true,
    getPreference: true,
  });
  const [searchText, setSearchText] = useState("");
  const [clientData, setClientData] = useState<any>({});
  const [adImgs, setAdImgs] = useState([]);
  const [practiceTests, setPracticeTests] = useState([]);
  const [adaptiveTests, setAdaptiveTests] = useState([]);
  const [companySpecificTest, setCompanySpecificTest] = useState([]);
  const [examSpecificTest, setExamSpecificTest] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [classRoomTests, setClassRoomTests] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [takeTestsAgain, setTakeTestsAgain] = useState([]);
  const [preferences, setPreferences] = useState<any>({});
  const [favorites, setFavorites] = useState<any>({});
  //how to get ad Imgs?
  const [listSubjects, setListSubjects] = useState([]);
  const [upcomingLoaded, setUpcomingLoaded] = useState(false);
  const [adaptiveLoaded, setAdaptiveLoaded] = useState(false);
  const [practiceLoaded, setPracticeLoaded] = useState(false);
  const [recentLoaded, setRecentLoaded] = useState(false);
  const [companyLoaded, setCompanyLoaded] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState<boolean>(false);
  const [examLoaded, setExamLoaded] = useState(false);
  const [classRoomLoaded, setClassRoomLoaded] = useState(false);
  const [recommendedLoaded, setRecommendedLoaded] = useState(false);
  const [takeTestsAgainLoaded, setTakeTestsAgainLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchPractices, setSearchPractices] = useState<any>(null);
  const [practicesCount, setPracticesCount] = useState<number>(0);
  const [hasTests, setHasTests] = useState(false);
  const [searchedTests, setSearchedTests] = useState<any[]>([]);
  const [marketplaceTests, setMarketplaceTests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [attemptedTests, setAttemptedTests] = useState<any[]>([]);
  const [favoriteTests, setFavoriteTests] = useState<any[]>([]);
  const [generatedAssessments, setGeneratedAssessments] = useState<any[]>([]);
  const [searchedTestsAllCount, setSearchedTestAllCount] = useState<number>(0);
  const [loadMoreClicked, setLoadMoreClicked] = useState(false);
  const [showMemberShip, setShowMemberShip] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [generalLoaded, setGeneralLoaded] = useState(false);
  const [attemptedLoaded, setAttemptedLoaded] = useState(false);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const [favoriteLoaded, setFavoriteLoaded] = useState(false);
  const [assignedLoaded, setAssignedLoaded] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [QOD, setQOD] = useState<any>(null);
  const [adaptive, setAdaptive] = useState<any>({
    selectedSubject: null,
    selectedUnit: null,
    isSubmitted: false,
  });
  const [expiredDays, setExpiredDays] = useState<string>("");
  const [noTag, setNoTag] = useState<string>("");

  useEffect(() => {
    userSvc.get().then((us) => {
      clientApi.get(`/api/settings`).then((res) => {
        setSettings(res.data);
        setAdImgs(res.data.bannerImages.filter((b) => b.type == "assessment"));

        if (
          res.data.features?.marketplace &&
          res.data.features?.marketplaceForStudent
        ) {
          testSvc.getPublisherAssessments(params).then((tests: any[]) => {
            tests.sort((a, b) => b.enrolled - a.enrolled);
            tests.forEach((item) => {
              item.addedToCart = shoppingCartService.isItemAdded(item);
            });
            setMarketplaceTests(tests);
            setHasTests(tests?.length > 0);
          });

          testSvc
            .getStudentPurchasedTests({ ...params })
            .then(({ tests }: any) => {
              setRecentTests(tests);
              setHasTests(tests?.length > 0);
            });
        }

        if (res.data.features?.services) {
          serviceSvc.checkAvailable().then((res: any) => {
            if (res.isAvailable) {
              serviceSvc
                .getTaggingServicesForStudent(us._id)
                .then((services: any[]) => {
                  setShowMemberShip(!services.length);

                  for (const svc of services) {
                    if (moment(svc.expiresOn).diff(moment(), "d") < 15) {
                      setShowExpired(true);
                      const days = moment(svc.expiresOn).diff(moment(), "d");
                      setExpiredDays(days > 1 ? days + " days" : days + " day");
                      if (days == 0) {
                        const hours = moment(svc.expiresOn).diff(moment(), "h");
                        setExpiredDays(
                          hours > 1 ? hours + " hours" : hours + " hour"
                        );

                        if (hours == 0) {
                          const min = moment(svc.expiresOn).diff(
                            moment(),
                            "minutes"
                          );
                          setExpiredDays(
                            min > 1 ? min + " minutes" : min + " minute"
                          );

                          if (min == 0) {
                            setShowExpired(false);
                          }
                        }
                      }

                      break;
                    }
                  }
                });
            }
          });
        }

        if (
          us.primaryInstitute.preferences.assessment?.adaptive &&
          res.data?.features?.adaptive
        )
          subjectSvc.getAdaptiveSubjects().then((sub: any) => {
            setSubjects(sub);
          });
      });

      settingSvc.findOne("contentOrganizer").then((conf: any) => {
        let tags = [];
        if (conf?.assessment?.length) {
          const updatedSections = [...sections];
          for (const sec of conf.assessment) {
            if (sec.visible) {
              tags = [...tags, ...sec.tags];
              updatedSections.push(sec);
              testSvc
                .findAll({
                  ...params,
                  tags: sec.tags.join(","),
                  sort: "title,1",
                  checkEnroll: true,
                })
                .then((secResult: any) => {
                  sec.tests = secResult.results;

                  setHasTests(sec.tests?.length > 0);
                });
            }
          }
          setSections(updatedSections);
        }

        setNoTag(tags.join(","));
        testSvc
          .findAll({ ...params, noTag: tags.join(",") })
          .then((res: any) => {
            const updatedPractices = res.results.map((d) => {
              d.slugfly = d.title.replace(/\s+/g, "-");
              return d;
            });
            setPractices(updatedPractices);
            setGeneralLoaded(true);
            setHasTests(updatedPractices.length > 0);
          });
      });

      testSvc.recentTest(us._id, params).then((res: any) => {
        setAttemptedTests(res.tests);
        setAttemptedLoaded(true);
        setHasTests(res.tests.length > 0);
      });

      testSvc.assignedTests(us._id, params).then((res) => {
        setGeneratedAssessments(res);
        setAssignedLoaded(true);
        setHasTests(res.length > 0);
      });

      favoriteService.findPractices({ limit: 15 }).then((res: any[]) => {
        setFavoriteTests(res);
        setFavoriteLoaded(true);
        setHasTests(res.length > 0);
      });

      if (us.primaryInstitute.preferences.general.questionOfDay) {
        questionSvc.getQuestionOfDay({ ignoreAnswered: true }).then((qod) => {
          setQOD(qod);
        });
      }
    });
  }, []);

  const removeFavorite = (practice: any) => {
    if (practice.isFavorite === false) {
      alertify.alert(
        "Message",
        "This practice test was removed your favorite list."
      );
      return false;
    }
    favoriteService.deleteFav(practice._id).then((data) => {
      practice.isFavorite = false;

      // turn flag to false in other sections
      setFavoriteMode(practices, practice._id, false);
      setFavoriteMode(attemptedTests, practice._id, false);

      alertify.success(
        "This practice test has been removed from your favorite list successfully."
      );
      favoriteService.findPractices({ limit: 15 }).then((res: any[]) => {
        setFavoriteTests(res);
      });
    });
  };

  const setFavoriteMode = (tests: any, testId: any, mode: any) => {
    if (!tests) {
      return;
    }

    for (const t of tests) {
      if (t._id == testId) {
        t.isFavorite = mode;
        break;
      }
    }
  };

  const onFavoriteChanged = (ev: any) => {
    setFavoriteMode(practices, ev._id, ev.favorite);
    setFavoriteMode(attemptedTests, ev._id, ev.favorite);
    setFavoriteMode(marketplaceTests, ev._id, ev.favorite);

    favoriteService
      .findPractices({
        page: 1,
        limit: 6,
        excludeUser: true,
        showClassrooms: true,
        showAttempts: true,
      })
      .then((tests: any[]) => {
        setFavoriteTests(tests);
      });
  };

  const search = (text: string) => {
    setSearchText(text);
    setParams({
      ...params,
      page: 1,
    });
    const para = { ...params, page: 1 };
    if (searchText === "") {
      setIsSearch(false);
      setSearchPractices([]);
    } else {
      setIsSearch(true);
      setSearchPractices([]);
      setPracticesCount(0);

      para.title = text;
      para.limit = 12;
      setParams(para);
      testSvc.findAll(para).then((res: any) => {
        setSearchPractices(res.results);
        setPracticesCount(res.count.count);
      });
    }
  };

  const loadMore = () => {
    const para = { ...params };
    para.title = searchText;
    para.limit = 12;
    para.page += 1;
    setParams(para);

    testSvc.findAll(para).then((res: any) => {
      setSearchPractices({ ...searchPractices, ...res.results });
    });
  };

  const clearSearch = () => {
    setSearchText("");

    search("");
  };

  const reviewLastAttempt = (test: any) => {
    push(`/attempt-summary/${test.lastAttemptId}`);
  };

  const startAdaptiveTest = () => {
    setAdaptive({
      ...adaptive,
      isSubmitted: true,
    });

    if (!adaptive.selectedSubject) {
      return;
    }

    const testParams: any = {
      subject: adaptive.selectedSubject._id,
      learningMode: true,
    };

    if (adaptive.selectedUnit) {
      testParams.unit = adaptive.selectedUnit._id;
    }

    testSvc
      .generatePracticeSet(testParams)
      .then((data: any) => {
        if (data._id) {
          push(`/assessment/adaptive/learning/${data._id}`);
        }
      })
      .catch((err) => {
        console.log(err, "ddd");
        alertify.alert("Message", err.response.data.error);
      });
  };
  const handleChangeSubject = (idx: any) => {
    const selected_subject = subjects.find((sub) => sub._id === idx);
    setAdaptive({
      ...adaptive,
      selectedSubject: selected_subject,
    });
  };

  const handleChangeUnit = (idx: any) => {
    const selected_unit = adaptive.selectedSubject?.units.find(
      (unit) => unit._id === idx
    );
    setAdaptive({
      ...adaptive,
      selectedUnit: selected_unit,
    });
  };

  const TestCard = (test: any) => {
    test = test.test;
    return (
      <div className="box-item p-0" style={{ width: "260px" }}>
        <div className="box box_new bg-white pt-0" style={{ width: "260px" }}>
          <div className="image-wrap cursor-pointer">
            <Link href={`./${test.title}?id=${test._id}`}>
              <PImageComponent
                height={135}
                fullWidth
                imageUrl={test.imageUrl}
                backgroundColor={test.colorCode}
                text={test.title}
                radius={9}
                fontSize={15}
                type="assessment"
                testMode={test.testMode}
                testType={test.testType}
                isProctored={test.isProctored}
              />
            </Link>
            <FavoriteButton
              item={test}
              type="test"
              changed={onFavoriteChanged}
            />
          </div>

          <div className="box-inner box-inner_new">
            <div className="info p-0 m-0">
              <h4 className="text-truncate cursor-pointer" title={test.title}>
                <Link href={`/home/${test.title}?id=${test._id}`}>
                  {test.title}
                </Link>
              </h4>
              <div className="form-row subjectAndMore_new small">
                {test.subjects && test.subjects.length > 0 && (
                  <div className="col sub1_new text-truncate">
                    <a>
                      {test.subjects[0].name}
                      {test.subjects.length > 1 && (
                        <span className="mb-1">
                          {" "}
                          + {test.subjects.length - 1} more{" "}
                        </span>
                      )}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row small mt-1">
              <div className="col-6">
                <div className="question-count">
                  <span>
                    {test.questionsToDisplay || test.totalQuestion} questions
                  </span>
                </div>
              </div>

              <div className="col-6">
                <div className="time text-right">
                  <span>{test.totalTime} minutes</span>
                </div>
              </div>
            </div>

            {!test.enrolled && test.accessMode === "buy" && (
              <div className="selling-price-info selling-price-info_new d-flex">
                <ItemPrice content={test} />
              </div>
            )}
          </div>

          {test.accessMode !== "buy" || test.enrolled ? (
            <Link
              className="btn btn-buy btn-block btn-sm round-bottom"
              href={`/assessment/home/${test.title}?id=${test._id}`}
            >
              View Details
            </Link>
          ) : (
            <div className="form-row">
              <div className="col-6">
                <Link
                  className="btn btn-buy btn-sm d-block btn-sm"
                  href={`/assessment/home/${test.title}?id=${test._id}`}
                >
                  View Details
                </Link>
              </div>
              <div className="col-6">
                <AddToCartButton item={test} type="practice" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <LoadingOverlay
      active={isSearching}
      spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
      styles={{
        overlay: (base) => ({
          ...base,
          height: "100vh",
        }),
      }}
    >
      <section className="banner d-block banner_new bg-color1 course">
        {/* start .banner */}
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto text-center text-white">
            <div className="banner-info mx-auto">
              <h1 className="text-center text-white">
                What do you want to practice today?
              </h1>
              <form>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for Assessment"
                    value={searchText}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => search(e.target.value)}
                  />
                  <span>
                    <figure>
                      <img src="/assets/images/search-icon-2.png" alt="" />
                    </figure>
                  </span>
                  <button
                    type="button"
                    className="btn p-0"
                    style={{ display: !!searchText.length ? "block" : "none" }}
                    onClick={clearSearch}
                  >
                    <figure>
                      <img src="/assets/images/close3.png" alt="" />
                    </figure>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      {!isSearch && (
        <div className="student_assessment">
          <div className="main-area mx-auto mw-100 mt-2">
            <div className="container">
              {adImgs && !!adImgs.length && settings?.features?.showBanner && (
                <>
                  <div className="carousel-area px-2 mb-3">
                    <Carousel
                      interval={3000}
                      indicators={true}
                      controls={false}
                      pause={false}
                      fade
                      wrap
                    >
                      {adImgs.map((item, index) => (
                        <Carousel.Item key={index}>
                          <img
                            className="d-block w-100"
                            src={item?.url}
                            alt={`Slide ${index}`}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="test_home_wrap">
            <main className="pt-lg-2">
              <div className="main-area mx-auto mw-100">
                <div className="container">
                  {showMemberShip && (
                    <div
                      className="p-2 mb-3 d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: "#f6cefc" }}
                    >
                      <p className="h6 mb-0 bold">
                        You are on a free plan with limited practice tests. Get
                        unlimited practice and access to all features with our
                        premium plan.
                      </p>
                      <Link href="/membership" className="btn btn-primary">
                        Buy Now
                      </Link>
                    </div>
                  )}

                  {showExpired && (
                    <div
                      className="p-2 mb-3 d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: "#ff7f7f" }}
                    >
                      <p className="h6 mb-0 bold">
                        Your existing premium plan expires in {expiredDays}.
                        Continue your preparation with a new premium plan and
                        avoid interruption.
                      </p>
                      <Link href="/membership" className="btn btn-primary">
                        Buy Now
                      </Link>
                    </div>
                  )}

                  {attemptedLoaded ? (
                    attemptedTests && attemptedTests.length > 0 ? (
                      <div className="box-area box-area_new">
                        <div className="card-common products_slider">
                          <div className="card-header-common">
                            <div className="row align-items-center">
                              <div className="col">
                                <div className="section_heading_wrapper">
                                  <h3 className="section_top_heading">
                                    Attempted Assessments
                                  </h3>
                                  <p className="section_sub_heading">
                                    You have already attempted these
                                    assessments. You can re-attempt one or more
                                    as per the policy set by the creator or the
                                    institute.
                                  </p>
                                </div>
                              </div>
                              {attemptedTests.length > 5 && (
                                <div className="col-auto ml-auto">
                                  <div>
                                    <Link
                                      href="/assessment/viewall/recent-tests"
                                      className="btn btn-outline btn-sm"
                                    >
                                      View All
                                    </Link>
                                  </div>
                                  <div className="arrow ml-auto">
                                    <Link href="/assessment/viewall/recent-tests">
                                      <i className="fas fa-arrow-right"></i>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="card-body-common pl-1">
                            <div
                              className="box-area-wrap box-area-wrap_new "
                              style={{ width: "255px" }}
                            >
                              <CustomCarousel
                                items={attemptedTests.map((test, index) => (
                                  <div
                                    key={test._id}
                                    className="box-item p-0"
                                    style={{ width: "255px" }}
                                  >
                                    <div
                                      className="box box_new bg-white pt-0"
                                      style={{ width: "255px" }}
                                    >
                                      <div
                                        className="image-wrap cursor-pointer"
                                        onClick={() => onFavoriteChanged(test)}
                                      >
                                        <PImageComponent
                                          height={135}
                                          fullWidth
                                          imageUrl={test.imageUrl}
                                          backgroundColor={test.colorCode}
                                          text={test.title}
                                          radius={9}
                                          fontSize={15}
                                          type="assessment"
                                          testMode={test.testMode}
                                          testType={test.testType}
                                          isProctored={test.isProctored}
                                        />
                                        <FavoriteButton
                                          item={test}
                                          type="test"
                                          changed={onFavoriteChanged}
                                        />
                                      </div>
                                      <div className="box-inner box-inner_new">
                                        <div className="info p-0 m-0">
                                          <h4 className="text-truncate cursor-pointer">
                                            {test.title}
                                          </h4>
                                          <div className="form-row subjectAndMore_new small">
                                            {test.subjects &&
                                              test.subjects.length > 0 && (
                                                <div className="col sub1_new text-truncate">
                                                  <a>
                                                    {test.subjects[0].name}
                                                    {test.subjects.length >
                                                      1 && (
                                                      <span className="mb-1">
                                                        {" "}
                                                        +{" "}
                                                        {test.subjects.length -
                                                          1}{" "}
                                                        more{" "}
                                                      </span>
                                                    )}
                                                  </a>
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                        <div className="form-row small mt-1">
                                          <div className="col-6">
                                            <div className="question-count">
                                              <span>
                                                {test.questionsToDisplay ||
                                                  test.totalQuestion}{" "}
                                                questions
                                              </span>
                                            </div>
                                          </div>
                                          <div className="col-6">
                                            <div className="time text-right">
                                              <span>
                                                {test.totalTime} minutes
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="mt-1">
                                          Attempted {test.lastAttemptDate}
                                        </p>
                                      </div>
                                      <div className="form-row">
                                        <div className="col-6">
                                          <Link
                                            className="btn btn-buy btn-sm d-block"
                                            href={`/assessment/home/${test.title}?id=${test._id}`}
                                          >
                                            View Details
                                          </Link>
                                        </div>
                                        <div className="col-6">
                                          {test.partiallyAttempted ? (
                                            <Link
                                              className="btn btn-outline btn-sm d-block"
                                              href={`/assessment/home/learning/${test._id}`}
                                            >
                                              Resume
                                            </Link>
                                          ) : (
                                            <button
                                              className="btn btn-outline btn-sm d-block"
                                              onClick={() =>
                                                reviewLastAttempt(test)
                                              }
                                            >
                                              Review Result
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null
                  ) : (
                    <div
                      className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                      style={{ padding: "2%" }}
                    >
                      <div className="heading heading_new">
                        <div className="row">
                          <div className="col-3">
                            <SkeletonLoaderComponent
                              Cwidth={100}
                              Cheight={30}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                    </div>
                  )}
                  {QOD && (
                    <div className="box-area box-area_new">
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  Question of the Day
                                </h3>
                                <p className="section_sub_heading">
                                  A question a day keeps poor scores away.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body-common pl-1 px-3 pb-3">
                          {/* <QuestionOfDay question={QOD} public={false} /> */}
                        </div>
                      </div>
                    </div>
                  )}

                  {assignedLoaded ? (
                    generatedAssessments.length > 0 ? (
                      <div className="box-area box-area_new">
                        <div className="card-common products_slider">
                          <div className="card-header-common">
                            <div className="row align-items-center">
                              <div className="col">
                                <div className="section_heading_wrapper">
                                  <h3 className="section_top_heading">
                                    My Assessments
                                  </h3>
                                  <p className="section_sub_heading">
                                    These assessments are created by you or
                                    assigned by your teacher and are specific to
                                    your needs.
                                  </p>
                                </div>
                              </div>
                              {generatedAssessments.length > 5 && (
                                <div className="col-auto ml-auto">
                                  <div>
                                    <Link
                                      href="/assessment/viewall/generated"
                                      className="btn btn-outline btn-sm"
                                    >
                                      View All
                                    </Link>
                                  </div>
                                  <div className="arrow ml-auto">
                                    <Link href="/assessment/viewall/generated">
                                      <i className="fas fa-arrow-right"></i>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="card-body-common pl-1">
                            <div
                              className="box-area-wrap box-area-wrap_new"
                              style={{ width: "255px" }}
                            >
                              <CustomCarousel
                                items={generatedAssessments.map(
                                  (test, index) => (
                                    <div
                                      key={test._id}
                                      className="box-item p-0"
                                      style={{ width: "255px" }}
                                    >
                                      <div
                                        className="box box_new bg-white pt-0"
                                        style={{ width: "255px" }}
                                      >
                                        <div className="image-wrap cursor-pointer">
                                          <Link
                                            href={`./${test.title}?id=${test._id}`}
                                          >
                                            <PImageComponent
                                              height={135}
                                              fullWidth
                                              imageUrl={test.imageUrl}
                                              backgroundColor={test.colorCode}
                                              text={test.title}
                                              radius={9}
                                              fontSize={15}
                                              type="assessment"
                                              testMode={test.testMode}
                                              testType={test.testType}
                                              isProctored={test.isProctored}
                                            />
                                          </Link>
                                          <FavoriteButton
                                            item={test}
                                            type="test"
                                            changed={onFavoriteChanged}
                                          />
                                        </div>
                                        <div className="box-inner box-inner_new">
                                          <div className="info p-0 m-0">
                                            <h4
                                              className="text-truncate cursor-pointer"
                                              title={test.title}
                                            >
                                              <Link
                                                href={`./${test.title}?id=${test._id}`}
                                              >
                                                {test.title}
                                              </Link>
                                            </h4>
                                            <div className="form-row subjectAndMore_new small">
                                              {test.subjects &&
                                                test.subjects.length > 0 && (
                                                  <div className="col sub1_new text-truncate">
                                                    <span>
                                                      {test.subjects[0].name}
                                                    </span>
                                                    {test.subjects.length >
                                                      1 && (
                                                      <span className="mb-1">
                                                        {" "}
                                                        +{" "}
                                                        {test.subjects.length -
                                                          1}{" "}
                                                        more{" "}
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                          <div className="form-row small mt-1">
                                            <div className="col-6">
                                              <div className="question-count">
                                                <span>
                                                  {test.questionsToDisplay ||
                                                    test.totalQuestion}{" "}
                                                  questions
                                                </span>
                                              </div>
                                            </div>
                                            <div className="col-6">
                                              <div className="time text-right">
                                                <span>
                                                  {test.totalTime} minutes
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <Link
                                            className="btn btn-buy btn-block btn-sm round-bottom"
                                            href={`/assessment/home/${test.title}?id=${test._id}`}
                                          >
                                            View Details
                                          </Link>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null
                  ) : (
                    <div
                      className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                      style={{ padding: "2%" }}
                    >
                      <div className="heading heading_new">
                        <div className="row">
                          <div className="col-3">
                            <SkeletonLoaderComponent
                              Cwidth={100}
                              Cheight={30}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                    </div>
                  )}

                  {user?.primaryInstitute?.preferences?.assessment?.adaptive &&
                    settings?.features?.adaptive &&
                    subjects?.length > 0 && (
                      <div className="box-area box-area_new">
                        <div className="card-common products_slider">
                          <div className="card-body-common pl-1">
                            <div className="box-area-wrap box-area-wrap_new position-relative">
                              <div className="box adaptive-logo-box bg-white pb-lg-0">
                                <div className="box-inner box-inner_new pb-0">
                                  <div className="row">
                                    <div className="col-7">
                                      <h3 className="bold f-16">
                                        Self Practice: Personalized Learning &
                                        Practice
                                      </h3>
                                      <p className="f-14">
                                        Create custom assessments tailored to
                                        specific skills, subjects, and units to
                                        enhance your mastery in targeted areas.
                                        Our proprietary AI algorithm analyzes
                                        your assessment history to present
                                        questions that not only challenge you
                                        but are also calibrated to your
                                        proficiency and difficulty level. It
                                        intelligently identifies your areas of
                                        improvement, including subjects you
                                        haven&apos;t recently practiced or where
                                        your performance has declined.
                                      </p>
                                      <br />
                                      <p className="f-14">
                                        Simply select a subject, and if desired,
                                        a specific unit within that subject to
                                        begin. You have the flexibility to stop
                                        at any time and review your results.
                                      </p>
                                    </div>

                                    <div className="col-1"></div>

                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        startAdaptiveTest();
                                      }}
                                      className="col-4"
                                    >
                                      <div className="body-box">
                                        <div className="form-group">
                                          <label className="text-uppercase">
                                            Subject<sup>*</sup>
                                          </label>
                                          <div className="position-relative">
                                            <select
                                              className="form-control"
                                              name="subject"
                                              value={
                                                adaptive.selectedSubject || ""
                                              }
                                              onChange={(e) =>
                                                handleChangeSubject(
                                                  e.target.value
                                                )
                                              }
                                              required
                                            >
                                              <option value="" disabled>
                                                Select
                                              </option>
                                              {subjects
                                                .sort((a, b) =>
                                                  a.name.localeCompare(b.name)
                                                )
                                                .map((subject) => (
                                                  <option
                                                    key={subject.name}
                                                    value={subject._id}
                                                  >
                                                    {subject.name}
                                                  </option>
                                                ))}
                                            </select>
                                            {!adaptive.selectedSubject &&
                                              adaptive.isSubmitted && (
                                                <p className="label label-danger text-danger">
                                                  Subject is required
                                                </p>
                                              )}
                                          </div>
                                        </div>

                                        <div className="form-group">
                                          <label className="text-uppercase">
                                            Unit<sup></sup>
                                          </label>
                                          <div className="position-relative">
                                            <select
                                              className="form-control"
                                              name="unit"
                                              value={
                                                adaptive.selectedUnit || ""
                                              }
                                              onChange={(e) =>
                                                handleChangeUnit(e.target.value)
                                              }
                                            >
                                              <option value="" disabled>
                                                Select
                                              </option>
                                              {adaptive.selectedSubject?.units
                                                ?.sort((a, b) =>
                                                  a.name.localeCompare(b.name)
                                                )
                                                .map((unit) => (
                                                  <option
                                                    key={unit.name}
                                                    value={unit._id}
                                                  >
                                                    {unit.name}
                                                  </option>
                                                ))}
                                            </select>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <button
                                          type="submit"
                                          className="btn btn-primary px-4"
                                        >
                                          Start Now
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {favoriteLoaded ? (
                    <div className="box-area box-area_new">
                      {favoriteTests.length > 0 && (
                        <div className="card-common products_slider">
                          <div className="card-header-common">
                            <div className="row align-items-center">
                              <div className="col">
                                <div className="section_heading_wrapper">
                                  <h3 className="section_top_heading">
                                    Favorite Assessments
                                  </h3>
                                  <p className="section_sub_heading">
                                    Quickly organize and find assessments of
                                    your interest. You can add or remove by
                                    opening an assessment and clicking Heart
                                    icon next to the name.
                                  </p>
                                </div>
                              </div>
                              {favoriteTests.length > 5 && (
                                <div className="col-auto ml-auto">
                                  <div>
                                    <Link
                                      className="btn btn-outline btn-sm"
                                      aria-label="Favorite Assessments"
                                      href="/assessment/viewall/favorite-assessments"
                                    >
                                      View All
                                    </Link>
                                  </div>
                                  <div className="arrow ml-auto">
                                    <Link
                                      aria-label="Favorite Assessments"
                                      href="/assessment/viewall/favorite-assessments"
                                    >
                                      <i className="fas fa-arrow-right"></i>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="card-body-common pl-1">
                            <div
                              className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                              style={{ width: "255px" }}
                            >
                              <CustomCarousel
                                items={favoriteTests
                                  .slice(0, 50)
                                  .map((test, index) => (
                                    <div
                                      className="box-item p-0"
                                      key={index}
                                      style={{ width: "255px" }}
                                    >
                                      <div
                                        className="box box_new bg-white pt-0"
                                        style={{ width: "255px" }}
                                      >
                                        <div className="image-wrap cursor-pointer">
                                          <Link
                                            href={`/assessment/${test.title}?id=${test._id}`}
                                          >
                                            <PImageComponent
                                              height={135}
                                              fullWidth
                                              imageUrl={test.imageUrl}
                                              backgroundColor={test.colorCode}
                                              text={test.title}
                                              radius={9}
                                              fontSize={15}
                                              type="assessment"
                                              testMode={test.testMode}
                                              testType={test.testType}
                                              isProctored={test.isProctored}
                                            />
                                          </Link>
                                          <div
                                            className="favorite-icon"
                                            onClick={(e) => {
                                              removeFavorite(test);
                                            }}
                                          >
                                            <figure>
                                              <img
                                                className="removeFavorite"
                                                src="/assets/images/like-red-bg.png"
                                                alt="Remove from favorite"
                                              />
                                            </figure>
                                          </div>
                                        </div>
                                        <div className="box-inner box-inner_new">
                                          <div className="info p-0 m-0">
                                            <h4
                                              className="text-truncate cursor-pointer"
                                              data-toggle="tooltip"
                                              data-placement="top"
                                              title={test.title}
                                            >
                                              <Link
                                                href={`/assessment/${test.title}?id=${test._id}`}
                                              >
                                                {test.title}
                                              </Link>
                                            </h4>
                                            <div className="form-row subjectAndMore_new small">
                                              {test.subjects &&
                                                test.subjects.length > 0 && (
                                                  <div className="col sub1_new text-truncate">
                                                    <a>
                                                      {test.subjects[0].name}{" "}
                                                      {test.subjects.length >
                                                        1 && (
                                                        <span className="mb-1">
                                                          +{" "}
                                                          {test.subjects
                                                            .length - 1}{" "}
                                                          more
                                                        </span>
                                                      )}
                                                    </a>
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                          <div className="form-row small mt-1">
                                            <div className="col-6">
                                              <div className="question-count">
                                                <span>
                                                  {test.questions?.length}{" "}
                                                  questions
                                                </span>
                                              </div>
                                            </div>
                                            <div className="col-6">
                                              <div className="time text-right">
                                                <span>
                                                  {test.totalTime} minutes
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <Link
                                            className="btn btn-buy btn-block btn-sm round-bottom"
                                            href={`/assessment/home/${test.title}?id=${test._id}`}
                                          >
                                            View Details
                                          </Link>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              />
                            </div>
                            <div
                              className="box-area-wrap box-area-wrap_new clearfix d-block d-lg-none mx-0"
                              style={{ width: "255px" }}
                            >
                              <CustomCarousel
                                items={favoriteTests
                                  .slice(0, 50)
                                  .map((test, index) => (
                                    <div
                                      className="box-item p-0"
                                      key={index}
                                      style={{ width: "255px" }}
                                    >
                                      <div
                                        className="box box_new bg-white pt-0"
                                        style={{ width: "255px" }}
                                      >
                                        <div className="image-wrap">
                                          <img
                                            src={test.imageUrl}
                                            alt={test.title}
                                            style={{
                                              height: 135,
                                              width: 100,
                                              backgroundColor: test.colorCode,
                                            }}
                                          />
                                          <div
                                            className="favorite-icon"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeFavorite(test);
                                            }}
                                          >
                                            <figure>
                                              <img
                                                className="removeFavorite"
                                                src="assets/images/like-red-bg.png"
                                                alt="Remove from favorite"
                                              />
                                            </figure>
                                          </div>
                                        </div>
                                        <div className="box-inner box-inner_new">
                                          <div className="info p-0 m-0">
                                            <h4
                                              className="text-truncate"
                                              data-toggle="tooltip"
                                              data-placement="top"
                                              title={test.title}
                                            >
                                              {test.title}
                                            </h4>
                                            <div className="form-row subjectAndMore_new small">
                                              {test.subjects &&
                                                test.subjects.length > 0 && (
                                                  <div className="col sub1_new text-truncate">
                                                    <a>
                                                      {test.subjects[0].name}{" "}
                                                      {test.subjects.length >
                                                        1 && (
                                                        <span className="mb-1">
                                                          +{" "}
                                                          {test.subjects
                                                            .length - 1}{" "}
                                                          more
                                                        </span>
                                                      )}
                                                    </a>
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                          <div className="form-row small mt-1">
                                            <div className="col-6">
                                              <div className="question-count">
                                                <span>
                                                  {test.questions?.length}{" "}
                                                  questions
                                                </span>
                                              </div>
                                            </div>
                                            <div className="col-6">
                                              <div className="time text-right">
                                                <span>
                                                  {test.totalTime} minutes
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <Link
                                            className="btn btn-buy btn-block btn-sm round-bottom"
                                            href={`/assessment/home/${test.title}?id=${test._id}`}
                                          >
                                            View Details
                                          </Link>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                      style={{ padding: "2%" }}
                    >
                      <div className="heading heading_new">
                        <div className="row">
                          <div className="col-3">
                            <SkeletonLoaderComponent
                              Cwidth={100}
                              Cheight={30}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                    </div>
                  )}
                  {marketplaceTests?.length > 0 ? (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                Marketplace Assessments
                              </h3>
                              <p className="section_sub_heading">
                                The marketplace is a central location of all
                                ready-to-purchase assessments for your use.
                              </p>
                            </div>
                          </div>
                          {marketplaceTests.length > 5 && (
                            <div className="col-auto ml-auto">
                              <div>
                                <Link
                                  className="btn btn-outline btn-sm"
                                  href={`/marketplace`}
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto">
                                <Link href={`/marketplace`}>
                                  <i className="fas fa-arrow-right"></i>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="box-area box-area_new d-none d-lg-block">
                        <div className="box-area-wrap clearfix">
                          <div className="card-body-common pl-1">
                            <div
                              className="box-area-wrap box-area-wrap_new clearfix mx-0"
                              style={{ width: "255px" }}
                            >
                              <CustomCarousel
                                items={marketplaceTests.map((item, index) => (
                                  <div
                                    key={index}
                                    className="box-item p-0"
                                    style={{ width: "255px" }}
                                  >
                                    <div
                                      className="box box_new bg-white pt-0"
                                      style={{ width: "255px" }}
                                    >
                                      <div className="image-wrap cursor-pointer">
                                        <Link
                                          href={`/assessment/${item.title}?id=${item._id}`}
                                        >
                                          <PImageComponent
                                            height={135}
                                            fullWidth
                                            imageUrl={item.imageUrl}
                                            backgroundColor={item.colorCode}
                                            text={item.title}
                                            radius={9}
                                            fontSize={15}
                                            type="assessment"
                                            testMode={item.testMode}
                                            testType={item.testType}
                                            isProctored={item.isProctored}
                                          />
                                        </Link>
                                        <FavoriteButton
                                          item={item}
                                          type="test"
                                          changed={onFavoriteChanged}
                                        />
                                      </div>
                                      <div className="box-inner box-inner_new">
                                        <div className="info p-0 m-0">
                                          <h2
                                            className="cursor-pointer text-ellipsis"
                                            title={item.title}
                                          >
                                            <Link
                                              href={`assessments/${item.title}?id=${item._id}`}
                                            >
                                              {item.title}
                                            </Link>
                                          </h2>
                                          <div className="form-row">
                                            {item.subjects?.length > 1 && (
                                              <div className="col sub1_new text-truncate">
                                                <a>{item.subjects[0].name}</a>
                                              </div>
                                            )}
                                            {item.subjects?.length === 1 && (
                                              <div className="col sub1_new1 text-truncate">
                                                <a>{item.subjects[0].name}</a>
                                              </div>
                                            )}
                                            {item.subjects?.length > 1 && (
                                              <div className="col-auto num1_new text-truncate">
                                                <a>
                                                  +{item.subjects.length - 1}{" "}
                                                  more
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                          <div className="author-name">
                                            <p>
                                              <span>
                                                {item.brandName ||
                                                  item.userName}
                                              </span>
                                            </p>
                                          </div>
                                        </div>
                                        {!item.enrolled && (
                                          <>
                                            {!item.addedToCart &&
                                              item.accessMode === "buy" &&
                                              user.role === "student" && (
                                                <div className="selling-price-info selling-price-info_new d-flex">
                                                  <ItemPrice
                                                    content={item}
                                                    field="price"
                                                  />
                                                </div>
                                              )}
                                            {item.addedToCart && (
                                              <div className="bold h6 mt-1 mb-2">
                                                Added To Cart
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {item.enrolled && (
                                          <div className="mt-1 mb-2">
                                            <p>Already Purchased</p>
                                          </div>
                                        )}
                                        <div className="form-row">
                                          <div className="col">
                                            <Link
                                              className="btn btn-buy btn-sm d-block btn-sm"
                                              href={`/assessment/home/${item.title}?id=${item._id}`}
                                            >
                                              View Details
                                            </Link>
                                          </div>
                                          {!item.enrolled && (
                                            <div className="col">
                                              <AddToCartButton
                                                item={item}
                                                type="practice"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                      style={{ padding: "2%" }}
                    >
                      <div className="heading heading_new">
                        <div className="row">
                          <div className="col-3">
                            <SkeletonLoaderComponent
                              Cwidth={100}
                              Cheight={30}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                    </div>
                  )}
                  {recentTests?.length > 0 && (
                    <div className="box-area box-area_new">
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  Recently Purchased Assessments
                                </h3>
                                <p className="section_sub_heading">
                                  These assessments were purchased from the
                                  marketplace.
                                </p>
                              </div>
                            </div>
                            {recentTests.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href="/assessment/viewall/recently-purchased-assessments"
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href="/assessment/viewall/recently-purchased-assessments">
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common pl-1">
                          <div
                            className="box-area-wrap box-area-wrap_new"
                            style={{ width: "260px" }}
                          >
                            <CustomCarousel
                              items={recentTests.map((test, index) => (
                                <div
                                  key={index}
                                  className="slider"
                                  style={{ width: "260px" }}
                                >
                                  <TestCard test={test} />
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sections.map(
                    (section, index) =>
                      section.tests?.length > 0 && (
                        <div key={index} className="box-area box-area_new">
                          <div className="card-common products_slider">
                            <div className="card-header-common">
                              <div className="row align-items-center">
                                <div className="col">
                                  <div className="section_heading_wrapper">
                                    <h3 className="section_top_heading">
                                      {section.title}
                                    </h3>
                                    <p className="section_sub_heading">
                                      {section.description}
                                    </p>
                                  </div>
                                </div>
                                {section.tests.length > 12 && (
                                  <div className="col-auto ml-auto">
                                    <div>
                                      <Link
                                        className="btn btn-outline btn-sm"
                                        aria-label={section.title}
                                        href={`/assessment/viewall/tags?tags=${section.tags.join(
                                          ","
                                        )}&title=${section.title}`}
                                      >
                                        View All
                                      </Link>
                                    </div>
                                    <div className="arrow ml-auto">
                                      <Link
                                        aria-label={section.title}
                                        href={`/assessment/viewall/tags?tags=${section.tags.join(
                                          ","
                                        )}&title=${section.title}`}
                                      >
                                        <i className="fas fa-arrow-right"></i>
                                      </Link>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="card-body-common pl-1">
                              <div
                                className="box-area-wrap box-area-wrap_new"
                                style={{ width: "260px" }}
                              >
                                <CustomCarousel
                                  items={section.tests.map((test, i) => (
                                    <div
                                      key={i}
                                      className="slider"
                                      style={{ width: "260px" }}
                                    >
                                      <TestCard test={test} />
                                    </div>
                                  ))}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                  )}

                  {generalLoaded ? (
                    practices?.length > 0 && (
                      <div className="box-area box-area_new">
                        <div className="card-common products_slider">
                          <div className="card-header-common">
                            <div className="row align-items-center">
                              <div className="col">
                                <div className="section_heading_wrapper">
                                  <h3 className="section_top_heading">
                                    General Assessments
                                  </h3>
                                  <p className="section_sub_heading">
                                    Practice makes you perfect. Check out these
                                    assessments. These are added and made
                                    available to you for more practice and
                                    learning.
                                  </p>
                                </div>
                              </div>
                              {practices.length > 5 && (
                                <div className="col-auto ml-auto">
                                  <div>
                                    <Link
                                      className="btn btn-outline btn-sm"
                                      aria-label="General assessments"
                                      href={`/viewall/general-assessments?noTag=${noTag}`}
                                    >
                                      View All
                                    </Link>
                                  </div>
                                  <div className="arrow ml-auto">
                                    <Link
                                      aria-label="General assessments"
                                      href={`/viewall/general-assessments?noTag=${noTag}`}
                                    >
                                      <i className="fas fa-arrow-right"></i>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="card-body-common pl-1">
                            <div
                              className="box-area-wrap box-area-wrap_new"
                              style={{ width: "260px" }}
                            >
                              <CustomCarousel
                                items={practices.map((test, i) => (
                                  <div
                                    key={i}
                                    className="slider"
                                    style={{ width: "260px" }}
                                  >
                                    <TestCard test={test} />
                                  </div>
                                ))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div
                      className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                      style={{ padding: "2%" }}
                    >
                      <div className="heading heading_new">
                        <div className="row">
                          <div className="col-3">
                            <SkeletonLoaderComponent
                              Cwidth={100}
                              Cheight={30}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item p-0">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                    </div>
                  )}

                  {!hasTests && (
                    <div className="course-search-empty text-center empty-data">
                      <figure className="mx-auto">
                        <img
                          src="assets/images/Search-rafiki.png"
                          alt=""
                          className="img-fluid d-block mx-auto mb-4"
                        />
                      </figure>
                      <h6>No Assessments Found</h6>
                      <p>We couldn&apos;t find any assessment</p>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
      {isSearch && (
        <div className="student_assessment">
          <main className="pt-0">
            <div className="main-area search-result mx-auto mw-100 mt-3">
              <div className="container main-area mx-auto">
                {/* Desktop View */}
                <div className="box-area box-area_new d-none d-lg-block">
                  {practicesCount > 0 && (
                    <div className="row align-items-center">
                      <div className="col-8">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            {practicesCount} Assessments
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                    style={{ position: "relative" }}
                  >
                    <div className="row">
                      {searchPractices.map((test, index) => (
                        <div
                          key={index}
                          className="col-lg-3 col-md-4 col-6 mb-3"
                        >
                          <div className="slider">
                            <div className="box box_new bg-white pt-0">
                              <Link
                                href={`/assessment/${test.title}?id=${test._id}`}
                              >
                                <PImageComponent
                                  height={135}
                                  fullWidth
                                  imageUrl={test.imageUrl}
                                  backgroundColor={test.colorCode}
                                  text={test.title}
                                  radius={9}
                                  fontSize={15}
                                  type="assessment"
                                  testMode={test.testMode}
                                  testType={test.testType}
                                  isProctored={test.isProctored}
                                />
                              </Link>

                              <div className="box-inner box-inner_new">
                                <div className="info p-0 m-0">
                                  <h4
                                    className="text-truncate cursor-pointer"
                                    title={test.title}
                                  >
                                    <Link
                                      href={`/assessment/${test.title}?id=${test._id}`}
                                    >
                                      {test.title}
                                    </Link>
                                  </h4>
                                  <div className="form-row subjectAndMore_new small">
                                    {test.subjects?.length > 0 && (
                                      <div className="col sub1_new text-truncate">
                                        <a>
                                          {test.subjects[0].name}
                                          {test.subjects.length > 1 && (
                                            <span className="mb-1">
                                              {" "}
                                              + {test.subjects.length -
                                                1} more{" "}
                                            </span>
                                          )}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="form-row small mt-1">
                                  <div className="col-6">
                                    <div className="question-count">
                                      <span>
                                        {test.questionsToDisplay ||
                                          test.totalQuestion}{" "}
                                        questions
                                      </span>
                                    </div>
                                  </div>

                                  <div className="col-6">
                                    <div className="time text-right">
                                      <span>{test.totalTime} minutes</span>
                                    </div>
                                  </div>
                                </div>

                                {test.accessMode === "buy" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <ItemPrice content={test} />
                                  </div>
                                )}

                                {test.accessMode !== "buy" ? (
                                  <Link
                                    className="btn btn-buy btn-block btn-sm round-bottom"
                                    href={`/assessment/home/${test.title}?id=${test._id}`}
                                  >
                                    View Details
                                  </Link>
                                ) : (
                                  <div className="form-row">
                                    <div className="col-6">
                                      <Link
                                        className="btn btn-buy btn-sm d-block btn-sm"
                                        href={`/assessment/home/${test.title}?id=${test._id}`}
                                      >
                                        View Details
                                      </Link>
                                    </div>
                                    <div className="col-6">
                                      <AddToCartButton
                                        item={test}
                                        type="practice"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="box-area box-area_new d-block d-lg-none mx-0">
                  {practicesCount > 0 && (
                    <div className="row align-items-center">
                      <div className="col-8">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            {practicesCount} Assessments
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="box-area-wrap box-area-wrap_new clearfix d-block d-lg-none mx-0 position-relative">
                    <div className="row">
                      {searchPractices.map((test, index) => (
                        <div
                          key={index}
                          className="col-lg-3 col-md-4 col-6 box-item p-0-remove mb-3"
                        >
                          <div className="slider">
                            <div className="box box_new bg-white pt-0">
                              <PImageComponent
                                height={135}
                                fullWidth
                                imageUrl={test.imageUrl}
                                backgroundColor={test.colorCode}
                                text={test.title}
                                radius={9}
                                fontSize={15}
                                type="assessment"
                                testMode={test.testMode}
                                testType={test.testType}
                                isProctored={test.isProctored}
                              />

                              <div className="box-inner box-inner_new">
                                <div className="info p-0 m-0">
                                  <h4
                                    className="text-truncate"
                                    title={test.title}
                                  >
                                    {test.title}
                                  </h4>
                                  <div className="form-row subjectAndMore_new small">
                                    {test.subjects?.length > 0 && (
                                      <div className="col sub1_new text-truncate">
                                        <a>
                                          {test.subjects[0].name}
                                          {test.subjects.length > 1 && (
                                            <span className="mb-1">
                                              {" "}
                                              + {test.subjects.length -
                                                1} more{" "}
                                            </span>
                                          )}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="form-row small mt-1">
                                  <div className="col-6">
                                    <div className="question-count">
                                      <span>
                                        {test.questionsToDisplay ||
                                          test.totalQuestion}{" "}
                                        questions
                                      </span>
                                    </div>
                                  </div>

                                  <div className="col-6">
                                    <div className="time text-right">
                                      <span>{test.totalTime} minutes</span>
                                    </div>
                                  </div>
                                </div>

                                {test.accessMode === "buy" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <ItemPrice content={test} />
                                  </div>
                                )}

                                {test.accessMode !== "buy" ? (
                                  <Link
                                    className="btn btn-buy btn-block btn-sm round-bottom"
                                    href={`/assessment/home/${test.title}?id=${test._id}`}
                                  >
                                    View Details
                                  </Link>
                                ) : (
                                  <div className="form-row">
                                    <div className="col-6">
                                      <Link
                                        className="btn btn-buy btn-sm d-block btn-sm"
                                        href={`/assessment/home/${test.title}?id=${test._id}`}
                                      >
                                        View Details
                                      </Link>
                                    </div>
                                    <div className="col-6">
                                      <AddToCartButton
                                        item={test}
                                        type="practice"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Load More Button */}
                {searchPractices.length < practicesCount && (
                  <div className="text-center">
                    <button className="btn btn-light" onClick={loadMore}>
                      Load More
                    </button>
                  </div>
                )}

                {/* No Assessments Found */}
                {(!searchPractices || searchPractices.length === 0) && (
                  <div className="text-center">
                    <figure className="mx-auto">
                      <img
                        src="/assets/images/Search-rafiki.png"
                        alt=""
                        className="img-fluid d-block mx-auto mb-4"
                      />
                    </figure>
                    <h1>No Assessments Found</h1>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </LoadingOverlay>
  );
};

export default StudentAssessment;
