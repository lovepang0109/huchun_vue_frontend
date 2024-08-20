"use client";

import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import clientApi from "@/lib/clientApi";
import * as courseService from "@/services/courseService";
import * as settingSvc from "@/services/settingService";
import * as paymentService from "@/services/paymentService";
import * as shoppingCartService from "@/services/shopping-cart-service";
import { success, error, alert } from "alertifyjs";
import { elipsisText, toQueryString } from "@/lib/validator";
import { useTakeTestStore } from "@/stores/take-test-store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import AliceCarousel from "react-alice-carousel";
import PImageComponent from "@/components/AppImage";
import ItemPrice from "@/components/ItemPrice";
import CustomCarousel from "@/components/assessment/carousel";
import { Carousel, ProgressBar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import "./MyCarousel.css";
import FavoriteButton from "@/components/FavoriteButton";
import * as alertify from "alertifyjs";
import { every } from "rxjs";

const StudentCourseHome = ({ user }: any) => {
  const { push } = useRouter();
  const { update } = useSession();
  const [clientData, setClientData] = useState<any>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [adImgs, setAdImgs] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<any>({
    popularCourses: false,
    ongoingCourses: false,
    buyCourses: false,
    subjects: false,
    favorites: false,
    bestSellers: false,
    myLibraries: false,
    allCoursesCount: false,
  });
  const [params, setParams] = useState<any>({
    limit: 8,
    page: 1,
  });
  const [selectedFilter, setSelectedFilter] = useState<any>({
    level: "Select a Level",
    duration: "Select a Duration",
    author: "Select an Author",
    price: "Select a price",
  });
  const [currencySymbol, setCurrencySymbol] = useState<any>("₹");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [searchInit, setSearchInit] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchedCourses, setSearchedCourses] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<any>(0);
  const [activeSearchSubject, setActiveSearchSubject] = useState<any>();
  const [authors, setAuthors] = useState<any[]>([]);
  const [ongoingCourses, setOngoingCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [buyCourses, setBuyCourses] = useState<any[]>([]);
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [myLibraries, setMyLibraries] = useState<any[]>([]);
  const [selectedTabSubject, setSelectedTabSubject] = useState<any>();
  const [courseBySubject, setCourseBySubject] = useState<any>({});

  const [allCoursesCount, setAllCoursesCount] = useState<number>(0);
  const [marketplaceCourses, setMarketplaceCourses] = useState<any>([]);
  const [sections, setSections] = useState<any>([]);

  useEffect(() => {
    clientApi.get(`/api/settings`).then((res) => {
      setClientData(res.data);
      if (
        res.data.features?.marketplace &&
        res.data.features?.marketplaceForStudent
      ) {
        courseService
          .getPublisherCourse({
            page: 1,
            limit: 8,
            sort: "updatedAt,-1",
            excludeUser: true,
          })
          .then((courses: any[]) => {
            courses.sort((a, b) => b.enrolled - a.enrolled);
            courses.forEach((item) => {
              item.addedToCart = shoppingCartService.isItemAdded(item);
            });
            setMarketplaceCourses(courses);
          });
      }
      setAdImgs(res.data.bannerImages.filter((b) => b.type == "course"));
    });
    settingSvc.findOne("contentOrganizer").then((conf: any) => {
      if (conf?.course?.length) {
        const updatedSections = [...sections];
        for (const sec of conf.course) {
          if (sec.visible) {
            updatedSections.push(sec);
            courseService
              .getCourses({
                ...params,
                tags: sec.tags.join(","),
                sort: "title,1",
              })
              .then((secResult: any) => {
                sec.courses = secResult.courses;
              });
          }
        }
        setSections(updatedSections);
      }
    });

    loadData();
  }, []);

  const loadData = async () => {
    const updatedInitialized = initialized;

    const s = await courseService.getCourseSubject({ excludeEnrolled: true });
    updatedInitialized.subjects = true;
    let subject = s.sort((prev: any, next: any) =>
      prev.name.localeCompare(next.name)
    );
    setSubjects(subject);

    if (subject.length) {
      changeTabs(subject[0], false);
    }

    const fv = await courseService.getMyFavorite({
      includeCourses: true,
      checkEnroll: true,
    });
    for (const f of fv) {
      f.isFavorite = true;
    }
    setFavorites(fv);
    updatedInitialized.favorites = true;

    const en: any = await courseService.getEnrolledCourses(user._id);
    setMyLibraries(en.courses);
    updatedInitialized.myLibraries = true;

    setAllCoursesCount(fv.length + en.courses.length + subject.length);

    updatedInitialized.allCoursesCount = true;
    setInitialized(updatedInitialized);
  };

  const changeTabs = (subject: any, reload: boolean) => {
    setSelectedTabSubject(subject);
    if (!courseBySubject[subject._id] || reload) {
      const params = {
        subject: subject._id,
        isCheckEnroll: true,
        excludeEnrolled: true,
      };
      courseService
        .getCourses(params)
        .then((res: any) => {
          setCourseBySubject({
            ...courseBySubject,
            [subject._id]: res.courses,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const viewDetails = (id: any) => {
    push(`/course/details/${id}`);
  };

  const buyNow = (course: any) => {
    shoppingCartService.addItem(course, 1, "course");
    push("/cart");
  };

  const viewContentDetails = (item: any) => {
    if (item.type == "course") {
      push(`course/details/${item.itemId}`);
      return;
    }
    push(`/course/stage/${item.course._id}?content=${item.itemId}`);
  };

  const reset = (ev: any) => {
    setSearchText("");
    setIsSearching(false);
  };

  const search = (ev: any) => {
    setSearchText(ev);
    if (ev === "") {
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
    const para = params;
    para.page = 1;
    setIsSearching(true);
    setSearchInit(true);

    if (ev === "") {
      setIsSearching(false);

      setSearchInit(false);
      setSearchedCourses([]);
    } else {
      para.keywords = ev;
      courseService
        .getCourses({ ...para, count: true })
        .then((res: any) => {
          setSearchedCourses(res.courses);
          setTotalItems(res.total);
          setSearchInit(false);
        })
        .catch((err) => {
          setSearchedCourses([]);
          setSearchInit(false);
          setTotalItems(0);
        });
    }
  };

  const enroll = (item: any) => {
    if (item.enrolled) {
      alert("Message", "You have already enrolled to this course");
      return;
    }
    if (!enrolling) {
      setEnrolling(true);
      const params = {
        course: item._id,
        type: "course",
      };
      paymentService.enrollItems(params).then((data) => {
        setEnrolling(false);

        changeTabs(selectedTabSubject, true);
        success("Successfully Enrolled to this course");
        push(`/course/stage/${item?._id}`);
      });
    }
  };

  const removeFavorite = (item: any, i: any) => {
    if (item.type == "course") {
      courseService.removeFavorite(item.itemId).then((da) => {
        const updatedFv = favorites;
        updatedFv.splice(i, 1);
        setFavorites(updatedFv);
        success("Successfully removed from favorites");
        return;
      });
    } else {
      courseService
        .removeFavoriteContent(item.course._id, item.itemId)
        .then((a) => {
          const updatedFv = favorites;
          updatedFv.splice(i, 1);
          setFavorites(updatedFv);
          success("Successfully removed from favorites");
        });
    }
  };

  const viewMarketplaceCourse = (item: any) => {
    push(`/course/details/${item._id}`);
  };

  const addToCart = (item: any, index: number) => {
    item.price = item.marketPlacePrice;
    item.addedToCart = true;

    shoppingCartService.addItem(item, 1, "testseries");

    const updatedMarketplaceCourses = [...marketplaceCourses];

    updatedMarketplaceCourses[index] = item;

    setMarketplaceCourses(updatedMarketplaceCourses);
  };

  const goToCart = () => {
    push("/cart");
  };

  const getResult = async (params: any) => {
    try {
      const { data } = await clientApi.get(
        `/api/course${toQueryString({ ...params, count: true })}`
      );
      setSearchedCourses(data.courses);
      setTotalItems(data.total);
    } catch (error) {
      setSearchedCourses([]);
      setTotalItems(0);
    }
  };

  const loadMoreSearchResult = async () => {
    let param = params;
    param = { ...param, page: param.page + 1 };
    setParams(param);
    try {
      const { data } = await clientApi.get(
        `/api/course${toQueryString(param)}`
      );
      setSearchedCourses(searchedCourses.concat(data.courses));
    } catch (error) {
      console.error(error);
      setSearchedCourses([]);
    }
  };

  const filter = (type: any, value: any, displayText: any) => {
    let param = params;
    param = { ...param, page: 1 };
    param[type] = value;
    selectedFilter[type] = displayText;
    setParams(param);
    getResult(param);
  };

  const allSubject = () => {
    setActiveSearchSubject(null);
    let param = { ...params, page: 1, subject: "" };
    setParams(param);
    getResult(param);
  };

  const onSubjectChange = (subject: any) => {
    setActiveSearchSubject(subject);
    let param = { ...params, page: 1, subject: subject._id };
    setParams(param);
    setActiveSearchSubject(subject);
    getResult(param);
  };

  const onFavoriteChanged = async (e: any) => {
    const tmp_favorites = await courseService.getMyFavorite({
      includeCourses: true,
      checkEnroll: true,
    });
    setFavorites(tmp_favorites);

    for (const f of tmp_favorites) {
      f.isFavorite = true;
    }

    if (!e.favorite) {
      for (const k in courseBySubject) {
        for (const c of courseBySubject[k]) {
          if (c._id == e._id) {
            c.isFavorite = false;
            break;
          }
        }
      }

      for (const c of myLibraries) {
        if (c._id == e._id) {
          c.isFavorite = false;
          break;
        }
      }
    }
  };

  const resumeCourse = (id: any) => {
    const params = { courseStage: true };
    courseService
      .getUserCourseData(id, params)
      .then((res) => {
        push(`/course/stage/${id}`);
      })
      .catch((err) => {
        alertify.alert("Message", err?.response.data.message);
      });
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
    if (!showFilter) {
      setSelectedFilter({
        level: "Select a Level",
        duration: "Select a Duration",
        author: "Select an Author",
        price: "Select a price",
      });
      setParams({
        ...{},
        page: params.page,
        limit: params.limit,
        keywords: params.keywords,
      });

      getResult();
    }
  };

  return (
    <>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto text-center text-white">
            <div className="banner-info mx-auto">
              <h1>What do you want to learn today?</h1>
              <form>
                <div className="form-group mb-0">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for courses"
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
                  {isSearching && (
                    <button type="button" className="btn p-0" onClick={reset}>
                      <figure>
                        <img src="/assets/images/close3.png" alt="" />
                      </figure>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      {!isSearching ? (
        <main className="course course_home_wrap">
          <div className="main-area-remove course-remove mx-auto">
            <div className="container">
              {adImgs &&
                !!adImgs.length &&
                clientData?.features?.showBanner && (
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
                              src={item.url}
                              alt={`Slide ${index}`}
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    </div>
                  </>
                )}

              {marketplaceCourses?.length > 0 && (
                <div className="box-area box-area_new home-all mb-2">
                  <div className="card-common products_slider">
                    <div className="card-header-common">
                      <div className="row align-items-center">
                        <div className="col">
                          <div className="section_heading_wrapper">
                            <h1 className="section_top_heading">
                              Marketplace Courses
                            </h1>
                            <p className="section_sub_heading">
                              The marketplace is a central location of all
                              published courses for your use. These courses are
                              not yet added to your institute.
                            </p>
                          </div>
                        </div>
                        {marketplaceCourses.length > 5 && (
                          <div className="col-auto ml-auto">
                            <div className="view-all ml-auto">
                              <Link
                                href={`/market-place/view-all?type=course`}
                                className="btn btn-outline btn-sm"
                              >
                                View All
                              </Link>
                            </div>
                            <div className="arrow ml-auto p-0">
                              <Link href={`/market-place/view-all?type=course`}>
                                <i className="fas fa-arrow-right"></i>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-body-common">
                      <div
                        className="box-area-wrap box-area-wrap_new"
                        style={{ width: "250px" }}
                      >
                        <CustomCarousel
                          items={marketplaceCourses.map((item, index) => (
                            <div
                              key={item._id}
                              className="box-item p-0"
                              style={{ width: "250px" }}
                            >
                              <div
                                className="box box_new bg-white pt-0"
                                style={{ width: "250px" }}
                              >
                                <div
                                  className="image-wrap cursor-pointer"
                                  onClick={() => viewDetails(item._id)}
                                >
                                  <PImageComponent
                                    height={102}
                                    fullWidth
                                    type="course"
                                    imageUrl={item.imageUrl}
                                    backgroundColor={item.colorCode}
                                    text={item.title}
                                    radius={9}
                                    fontSize={15}
                                  />
                                </div>
                                <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
                                  <div className="info pubCourseS p-0 m-0">
                                    <h4
                                      title={item.title}
                                      onClick={() => viewDetails(item._id)}
                                      className="cursor-pointer"
                                    >
                                      {item.title}
                                    </h4>
                                    {item.subjects &&
                                      item.subjects.length > 0 && (
                                        <p className="text-capitalize mb-1">
                                          {item.subjects[0].name}
                                          {item.subjects.length > 1 && (
                                            <span className="mb-1">
                                              {" "}
                                              + {item.subjects.length -
                                                1} more{" "}
                                            </span>
                                          )}
                                        </p>
                                      )}
                                    <div className="author-name">
                                      <p>
                                        <span>
                                          {item.brandName || item.user.name}
                                        </span>
                                      </p>
                                    </div>
                                    {item.accessMode === "buy" && (
                                      <div
                                        className="selling-price-info selling-price-info_new d-flex"
                                        style={{ minHeight: 29 }}
                                      >
                                        <ItemPrice
                                          content={item}
                                          field={"marketPlacePrice"}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="d-flex justify-items-between bg-white pb-2 gap-xs">
                                    <div className="flex-grow-1 flex-basic-0">
                                      <button
                                        className="btn btn-buy btn-sm btn-block"
                                        onClick={() => viewDetails(item._id)}
                                      >
                                        View Details
                                      </button>
                                    </div>
                                    {!item.enrolled && !item.addedToCart && (
                                      <div className="flex-grow-1 flex-basic-0">
                                        <button
                                          className="btn btn-outline btn-sm btn-block"
                                          onClick={() => addToCart(item, index)}
                                        >
                                          Add To Cart
                                        </button>
                                      </div>
                                    )}
                                    {!item.enrolled && item.addedToCart && (
                                      <div className="flex-grow-1 flex-basic-0">
                                        <button
                                          className="btn btn-outline btn-sm btn-block"
                                          onClick={goToCart}
                                        >
                                          Go To Cart
                                        </button>
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
              )}

              {initialized.myLibraries ? (
                <>
                  {myLibraries.length > 0 && (
                    <div className="box-area_new favorites">
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h1 className="section_top_heading">
                                  My Enrolled Courses
                                </h1>
                                <p className="section_sub_heading">
                                  If you don&apos;t see a course in which you
                                  had previously enrolled, check with your
                                  teacher or administrator. It is possible that
                                  course was withdrawn.
                                </p>
                              </div>
                            </div>
                            {myLibraries.length > 10 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    aria-label="view all my courses"
                                    href="../mycourses"
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link
                                    aria-label="view all my courses"
                                    href="../mylibrary"
                                  >
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common">
                          <div
                            className="box-area-wrap box-area-wrap_new"
                            style={{ width: "285px" }}
                          >
                            <CustomCarousel
                              items={myLibraries.map((item, i) => (
                                <div
                                  key={i}
                                  className="box-item p-0"
                                  style={{ width: "285px" }}
                                >
                                  <div
                                    className="box box_new bg-white pt-0"
                                    style={{ width: "285px" }}
                                  >
                                    <div
                                      className="image-wrap cursor-pointer"
                                      onClick={() => viewDetails(item._id)}
                                    >
                                      <PImageComponent
                                        height={102}
                                        fullWidth
                                        type="course"
                                        imageUrl={item.imageUrl}
                                        backgroundColor={item.colorCode}
                                        text={item.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                    </div>
                                    <div className="course-inner course-inner_new">
                                      <div className="course-info">
                                        <h4
                                          onClick={() => viewDetails(item._id)}
                                          className="m-0 text-truncate cursor-pointer"
                                          title={item.title}
                                        >
                                          {item.title}
                                        </h4>
                                        {item.subjects &&
                                          item.subjects.length > 0 && (
                                            <p className="text-capitalize mb-1">
                                              {item.subjects[0].name}
                                              {item.subjects.length > 1 && (
                                                <span className="mb-1">
                                                  {" "}
                                                  + {item.subjects.length -
                                                    1}{" "}
                                                  more{" "}
                                                </span>
                                              )}
                                            </p>
                                          )}
                                      </div>
                                      <div className="bottom-info">
                                        <ProgressBar
                                          now={item.progress}
                                          variant="success"
                                          aria-label="progress-bar"
                                        />
                                        <p>{item.progress + "%"}</p>
                                      </div>
                                    </div>
                                    <div className="form-row my-2 mx-2 py-2">
                                      <div className="col-7">
                                        {item.progress === 100 && (
                                          <Link
                                            className="btn btn-success btn-sm d-block"
                                            href="/profile/home/certificates?tab=certificates"
                                          >
                                            Get Certificate
                                          </Link>
                                        )}
                                      </div>
                                      <div className="col-5">
                                        <a
                                          className="btn btn-outline btn-sm d-block"
                                          onClick={() => resumeCourse(item._id)}
                                        >
                                          {item.progress === 100
                                            ? "Review"
                                            : "Resume"}
                                        </a>
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
                  )}
                </>
              ) : (
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />

                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}

              {initialized.subjects ? (
                <>
                  {subjects && !!subjects.length && (
                    <div className="box-area_new explore ">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">
                                Explore more Courses
                              </h1>
                              <p className="section_sub_heading">
                                Choose from courses provided by your institution
                              </p>
                            </div>
                          </div>
                          {selectedTabSubject &&
                            courseBySubject[selectedTabSubject._id] &&
                            courseBySubject[selectedTabSubject._id].length >
                            6 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <a
                                    className="btn btn-outline btn-sm"
                                    aria-label="view all my courses"
                                    href={`/course/view-all/subject${toQueryString(
                                      { id: selectedTabSubject._id }
                                    )}`}
                                  >
                                    View All
                                  </a>
                                </div>
                                <div className="arrow ml-auto">
                                  <a
                                    aria-label="view all my courses"
                                    href={`/course/view-all/subject${toQueryString(
                                      { id: selectedTabSubject._id }
                                    )}`}
                                  >
                                    <i className="fas fa-arrow-right"></i>
                                  </a>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="tabs tabs_new mx-auto owl-width_auto">
                          <AliceCarousel
                            autoWidth
                            disableDotsControls
                            disableButtonsControls
                            items={subjects.map((item: any, i: number) => (
                              <span
                                key={`subject_cat${i}`}
                                className="cursor-pointer"
                                onClick={() => changeTabs(item, false)}
                              >
                                <a
                                  className={`${item._id == selectedTabSubject?._id
                                    ? "active"
                                    : ""
                                    }`}
                                >
                                  {item?.name}
                                </a>
                              </span>
                            ))}
                          />
                        </div>
                        <div className="tab-pane show active fade">
                          <CustomCarousel
                            items={courseBySubject[
                              selectedTabSubject?._id
                            ]?.map((item: any, i: number) => (
                              <div
                                className="course-item  course-item_new"
                                key={"subject_cat_" + i}
                                style={{ width: "285px" }}
                              >
                                <div className="box box_new pt-0">
                                  <div
                                    className="image-wrap cursor-pointer"
                                    onClick={() => viewDetails(item._id)}
                                  >
                                    <PImageComponent
                                      height={141}
                                      fullWidth
                                      type="course"
                                      imageUrl={item.imageUrl}
                                      backgroundColor={item.colorCode}
                                      text={item.title}
                                      radius={9}
                                      fontSize={15}
                                    />
                                  </div>
                                  <div
                                    className="course-inner course-inner_new"
                                    style={{ height: "75px" }}
                                  >
                                    <div className="course-info">
                                      <h4
                                        className="text-truncate cursor-pointer"
                                        onClick={() => viewDetails(item._id)}
                                      >
                                        {item?.title}
                                      </h4>
                                      {item.subjects &&
                                        item.subjects.length !== 0 && (
                                          <p className="text-capitalize mb-1">
                                            {item?.subjects[0]?.name}
                                            {item.subjects &&
                                              item.subjects.length > 1 && (
                                                <span className="mb-1">
                                                  {" "}
                                                  + {item.subjects.length -
                                                    1}{" "}
                                                  more{" "}
                                                </span>
                                              )}
                                          </p>
                                        )}
                                      {item?.accessMode == "buy" && (
                                        <ItemPrice
                                          {...item}
                                          showDiscount={true}
                                          newPriceClassName="new-price discounted-price"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="form-row">
                                  <div className="col">
                                    <a
                                      className="btn btn-buy btn-sm d-block btn-sm"
                                      onClick={() => viewDetails(item._id)}
                                    >
                                      View Details
                                    </a>
                                  </div>

                                  {!item.enrolled && (
                                    <div className="col">
                                      {item.accessMode === "buy" ? (
                                        <AddToCartButton
                                          item={item}
                                          type="course"
                                        />
                                      ) : (
                                        <a
                                          className="btn btn-success btn-sm d-block"
                                          onClick={() => enroll(item)}
                                        >
                                          Enroll
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />

                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}
              {initialized.favorites ? (
                <>
                  {!!favorites.length && (
                    <div className="box-area_new favorites">
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h1 className="section_top_heading">
                                  My Favourites
                                </h1>
                                <p className="section_sub_heading">
                                  Course content which you marked as favourites
                                </p>
                              </div>
                            </div>
                            {favorites.length > 4 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <a
                                    className="btn btn-outline btn-sm"
                                    aria-label="My favourite course"
                                    href="/course/favorites"
                                  >
                                    View All
                                  </a>
                                </div>
                                <div className="arrow ml-auto">
                                  <a
                                    aria-label="My favourite course"
                                    href="/course/favorites"
                                  >
                                    <i className="fas fa-arrow-right"></i>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common">
                          <div
                            className="box-area-wrap box-area-wrap_new"
                            style={{ width: "250px" }}
                          >
                            <CustomCarousel
                              items={favorites.map((item: any, i: number) => (
                                <div
                                  key={i}
                                  className="box-item p-0"
                                  style={{ width: "285px" }}
                                >
                                  <div
                                    className="box box_new bg-white pt-0"
                                    style={{ width: "285px" }}
                                  >
                                    <div className="image-wrap">
                                      {item.type != "course" && (
                                        <>
                                          <figure>
                                            {item.contentType === "note" && (
                                              <img
                                                src="/assets/images/3.png"
                                                alt="this image for notes"
                                              />
                                            )}
                                            {item.contentType ===
                                              "assesment" && (
                                                <img
                                                  src="/assets/images/4.png"
                                                  alt="this is image for assesment"
                                                />
                                              )}
                                            {item.contentType === "video" && (
                                              <img
                                                src="/assets/images/6.png"
                                                alt="this is image for video"
                                              />
                                            )}
                                            {item.contentType === "ebook" && (
                                              <img
                                                src="/assets/images/5.png"
                                                alt="this is image for ebook"
                                              />
                                            )}
                                            {item.contentType === "quiz" && (
                                              <img
                                                src="/assets/images/2.png"
                                                alt="this is image for quiz"
                                              />
                                            )}
                                          </figure>
                                          <div className="favorite-icon">
                                            <a
                                              onClick={() =>
                                                removeFavorite(item, i)
                                              }
                                              aria-label="faviroute course"
                                            >
                                              <i className="fas fa-bookmark text-red"></i>
                                            </a>
                                          </div>
                                        </>
                                      )}
                                      {item.type == "course" && (
                                        <>
                                          <PImageComponent
                                            height={180}
                                            fullWidth
                                            type="course"
                                            imageUrl={item.imageUrl}
                                            backgroundColor={item.colorCode}
                                            text={item.title}
                                            radius={9}
                                            fontSize={15}
                                          />
                                          <FavoriteButton
                                            item={item}
                                            type={"course"}
                                            checked={(e) =>
                                              onFavoriteChanged(e)
                                            }
                                          />
                                        </>
                                      )}
                                    </div>
                                    <div className="course-inner course-inner_new">
                                      <div
                                        className="course-info cursor-pointer"
                                        onClick={() => viewContentDetails(item)}
                                      >
                                        <h6 className="m-0 text-truncate">
                                          {elipsisText(item.title, 22, true)}
                                        </h6>
                                        {item.type != "course" && (
                                          <p className="text-capitalize">
                                            {item.course?.title}
                                          </p>
                                        )}
                                        {item.subjects &&
                                          item.subjects.length > 0 && (
                                            <p className="text-capitalize mb-1">
                                              {item.subjects[0].name}
                                              {item.subjects.length > 1 && (
                                                <span className="mb-1">
                                                  {" "}
                                                  + {item.subjects.length -
                                                    1}{" "}
                                                  more{" "}
                                                </span>
                                              )}
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                    {item.type === "course" && (
                                      <div className="form-row">
                                        {!item.enrolled && (
                                          <div className="col">
                                            <a
                                              className="btn btn-buy btn-sm d-block btn-sm"
                                              onClick={() =>
                                                viewDetails(item.itemId)
                                              }
                                            >
                                              View Details
                                            </a>
                                          </div>
                                        )}
                                        {!item.enrolled && (
                                          <div className="col">
                                            {item.crs.accessMode === "buy" ? (
                                              <AddToCartButton
                                                item={item.crs}
                                                type="course"
                                              />
                                            ) : (
                                              <a
                                                className="btn btn-success btn-sm d-block"
                                                onClick={() => enroll(item.crs)}
                                              >
                                                Enroll
                                              </a>
                                            )}
                                          </div>
                                        )}
                                        {item.enrolled && (
                                          <div className="col">
                                            <Link
                                              className="btn btn-outline btn-sm d-block"
                                              href={`/course/stage/${item.itemId}`}
                                            >
                                              Resume
                                            </Link>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {item.type !== "course" && (
                                      <a
                                        className="btn btn-buy btn-block btn-sm round-bottom py-2"
                                        onClick={() => viewContentDetails(item)}
                                      >
                                        Resume
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />

                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}
              {sections.map(
                (section, sectionIndex) =>
                  section.courses?.length > 0 && (
                    <div className="box-area_new favorites" key={sectionIndex}>
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h1 className="section_top_heading">
                                  {section.title}
                                </h1>
                                <p className="section_sub_heading">
                                  {section.description}
                                </p>
                              </div>
                            </div>
                            {section.courses.length > 10 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    aria-label="view all my courses"
                                    href={`/view-all/tags=${section.tags.join(
                                      ","
                                    )}&title=${section.title}`}
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link
                                    aria-label="view all my courses"
                                    href={`/view-all/tags=${section.tags.join(
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
                        <div className="card-body-common">
                          <div
                            className="box-area-wrap box-area-wrap_new"
                            style={{ width: "285px" }}
                          >
                            <CustomCarousel
                              items={section.courses.map((item, i) => (
                                <div
                                  key={i}
                                  className="box-item p-0"
                                  style={{ width: "285px" }}
                                >
                                  <div
                                    className="box box_new bg-white pt-0"
                                    style={{ width: "285px" }}
                                  >
                                    <div
                                      className="image-wrap cursor-pointer"
                                      onClick={() => viewDetails(item._id)}
                                    >
                                      <PImageComponent
                                        height={102}
                                        fullWidth
                                        type="course"
                                        imageUrl={item.imageUrl}
                                        backgroundColor={item.colorCode}
                                        text={item.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                    </div>
                                    <div className="course-inner course-inner_new">
                                      <div className="course-info">
                                        <h4
                                          onClick={() => viewDetails(item._id)}
                                          className="m-0 text-truncate cursor-pointer"
                                          title={item.title}
                                        >
                                          {item.title}
                                        </h4>
                                        {item.subjects &&
                                          item.subjects.length > 0 && (
                                            <p className="text-capitalize mb-1">
                                              {item.subjects[0]?.name}
                                              {item.subjects.length > 1 && (
                                                <span className="mb-1">
                                                  {" "}
                                                  + {item.subjects.length -
                                                    1}{" "}
                                                  more
                                                </span>
                                              )}
                                            </p>
                                          )}
                                        {item.accessMode === "buy" && (
                                          <div className="new-price discounted-price">
                                            <ItemPrice content={item.price} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="form-row">
                                      <div className="col">
                                        <a
                                          className="btn btn-buy btn-sm d-block btn-sm"
                                          onClick={() => viewDetails(item._id)}
                                        >
                                          View Details
                                        </a>
                                      </div>
                                      {!item.enrolled && (
                                        <div className="col">
                                          {item.accessMode === "buy" ? (
                                            <AddToCartButton
                                              item={item}
                                              type={`course`}
                                            />
                                          ) : (
                                            <a
                                              className="btn btn-success btn-sm d-block"
                                              onClick={() => enroll(item)}
                                            >
                                              Enroll
                                            </a>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
              {initialized.allCoursesCount && !allCoursesCount && (
                <div className="container">
                  <div className="course addNoDataFullpageImgs">
                    <figure>
                      <img
                        src="/assets/images/undraw_Online_learning_re_qw08.svg"
                        alt="Not Found"
                      />
                    </figure>
                    <h4 className="text-center">No course found!</h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="course course_search_wrap">
          <div className="main-area-remove course-remove course-search-result mx-auto">
            <div className="container main-area mx-auto">
              <div className="tab-header tab-header_new mx-auto">
                <div className="row align-items-center">
                  <div className="col">
                    <div className="tabs mx-auto ">
                      <ul
                        className="nav nav-tabs border-0"
                        id="searchResultTab"
                      >
                        <li className="nav-item">
                          <a
                            className={`${!activeSearchSubject ? "active" : ""
                              }`}
                            onClick={allSubject}
                          >
                            All
                          </a>
                        </li>
                        {subjects.map((item: any, i: number) => (
                          <li className="nav-item" key={"sub" + i}>
                            <a
                              onClick={() => onSubjectChange(item)}
                              className={`${item._id == activeSearchSubject?._id
                                ? "active"
                                : ""
                                }`}
                            >
                              {item?.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="filter filter_btn_new ml-auto">
                      <a className="text-center" onClick={toggleFilter}>
                        <span>Filters</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-content">
                <div className="tab-pane show active">
                  {showFilter && (
                    <div className="filter-area filter-area_new clearfix row">
                      <div className="filter-item col-lg-3">
                        <div className="title">
                          <h4>Level</h4>
                        </div>
                        <div className="dropdown">
                          <a
                            className="btn dropdown-toggle text-left"
                            role="button"
                            id="filterLavel"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span>{selectedFilter.level}</span>
                          </a>
                          <div
                            className="dropdown-menu border-0 py-0"
                            aria-labelledby="filterLavel"
                          >
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter("level", "school", "School")
                              }
                            >
                              School
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter("level", "bachelors", "Bachelors")
                              }
                            >
                              Bachelors
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter("level", "masters", "Masters")
                              }
                            >
                              Masters
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() => filter("level", "open", "Open")}
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="filter-item col-lg-3">
                        <div className="title">
                          <h4>Duration</h4>
                        </div>
                        <div className="dropdown">
                          <a
                            className="btn dropdown-toggle text-left"
                            role="button"
                            id="filterDurations"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span>{selectedFilter.duration}</span>
                          </a>
                          <div
                            className="dropdown-menu border-0 py-0"
                            aria-labelledby="filterDurations"
                          >
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter("duration", "14", "< 2 weeks")
                              }
                            >
                              &lt; 2 weeks
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter("duration", "14-35", "2 - 5 weeks")
                              }
                            >
                              2 - 5 weeks
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter("duration", "35", "> 5 weeks")
                              }
                            >
                              {" "}
                              5 weeks
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="filter-item col-lg-3">
                        <div className="title">
                          <h4>Author</h4>
                        </div>
                        <div className="dropdown">
                          <a
                            className="btn dropdown-toggle text-left"
                            role="button"
                            id="filterAuthor"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span>{selectedFilter.author}</span>
                          </a>
                          <div
                            className="dropdown-menu border-0 py-0"
                            aria-labelledby="filterAuthor"
                          >
                            {authors.map((item: any, i: number) => (
                              <a
                                className="dropdown-item"
                                key={item?._id}
                                onClick={() =>
                                  filter("author", item?._id, item?.name)
                                }
                              >
                                {item?.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="filter-item col-lg-3">
                        <div className="title">
                          <h4>Cost</h4>
                        </div>
                        <div className="dropdown">
                          <a
                            className="btn dropdown-toggle text-left"
                            role="button"
                            id="filterPrice"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span>{selectedFilter.price}</span>
                          </a>
                          <div
                            className="dropdown-menu border-0 py-0"
                            aria-labelledby="filterPrice"
                          >
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter(
                                  "price",
                                  "500",
                                  "< " + currencySymbol + "500"
                                )
                              }
                            >
                              {" "}
                              &lt; {currencySymbol}500
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter(
                                  "price",
                                  "500-2000",
                                  currencySymbol +
                                  "500 - " +
                                  currencySymbol +
                                  "2000"
                                )
                              }
                            >
                              {currencySymbol}500 - {currencySymbol}2000
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter(
                                  "price",
                                  "2000-5000",
                                  currencySymbol +
                                  "2000 - " +
                                  currencySymbol +
                                  "5000"
                                )
                              }
                            >
                              {currencySymbol}2000 - {currencySymbol}5000
                            </a>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                filter(
                                  "price",
                                  ">5000",
                                  "> " + currencySymbol + "5000"
                                )
                              }
                            >
                              {" "}
                              {currencySymbol}5000
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {isSearching &&
                    (searchInit || searchedCourses.length > 0) && (
                      <div className="course-search course-search_new clearfix">
                        {totalItems > 0 && (
                          <div className="heading heading_new">
                            <div className="row align-items-center">
                              <div className="col-8">
                                <h3>{totalItems} Courses</h3>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="form-row">
                          {searchedCourses.map((item: any, i: number) => (
                            <div
                              className="col-lg-3 py-1"
                              key={"search_course" + i}
                              onClick={() => viewDetails(item._id)}
                            >
                              <div
                                className="box-item p-0-search  border-rounded"
                                style={{ border: "none", width: "100%" }}
                              >
                                <PImageComponent
                                  height={150}
                                  fullWidth={true}
                                  type="course"
                                  imageUrl={item.imageUrl}
                                  backgroundColor={item.colorCode}
                                  text={item.title}
                                  radius={9}
                                  fontSize={15}
                                />
                                <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
                                  <div
                                    className="info p-0 m-0"
                                    style={{ minHeight: "100px" }}
                                  >
                                    <div className="course-search-info pl-0 cursor-pointer">
                                      <h4 className="product_title">
                                        {item?.title}
                                      </h4>
                                      {item.subjects &&
                                        item.subjects.length > 0 && (
                                          <p className="text-capitalize mb-1">
                                            {item?.subjects[0]?.name}
                                            {item.subjects &&
                                              item.subjects.length > 1 && (
                                                <span className="mb-1">
                                                  {" "}
                                                  + {item.subjects.length -
                                                    1}{" "}
                                                  more{" "}
                                                </span>
                                              )}
                                          </p>
                                        )}
                                      <p className="author-name">
                                        {item?.user?.name}
                                      </p>
                                      {item.accessMode == "buy" && (
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice {...item} field="price" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
              {!searchInit && searchedCourses.length == 0 && (
                <div className="course-search-empty text-center empty-data">
                  <figure className="mx-auto">
                    <img
                      className="img-fluid d-block mx-auto mb-4"
                      src="/assets/images/Search-rafiki.png"
                      alt=""
                    />
                  </figure>
                  <h3>No Results Found</h3>
                  <p>We couldnt find any results based on your search</p>
                </div>
              )}
              {totalItems > searchedCourses.length &&
                searchedCourses.length > 0 &&
                totalItems > params.limit && (
                  <div className="text-center mx-auto">
                    <button
                      className="btn btn-light"
                      onClick={loadMoreSearchResult}
                    >
                      Load more
                    </button>
                  </div>
                )}
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default StudentCourseHome;
