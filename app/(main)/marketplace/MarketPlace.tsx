"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { Button, Carousel } from "react-bootstrap";
import styles from "@/components/assessment/carousel/MyCarousel.module.css";
import "@/components/assessment/carousel/MyCarousel.css";
import ItemPrice from "@/components/ItemPrice";
import PImageComponent from "@/components/AppImage";
import {
  addItem,
  saveItems,
  getItems,
  getTotalPrice,
  clearItems,
  reloadItems,
} from "@/services/shopping-cart-service";
import { CourseDataEntry } from "@/interfaces/interface";

const MarketPlace = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const { push } = useRouter();

  const [params, setParams]: any = useState({ limit: 4, mode: "buy" });
  const [initialized, setinitialized]: any = useState(false);
  const [bestSellers, setbestSellers]: any = useState([]);
  const [mostPopularCourses, setmostPopularCourses]: any = useState([]);
  const [highestPaidCourse, sethighestPaidCourse]: any = useState([]);
  const [bestSellersTestseries, setbestSellersTestseries]: any = useState([]);
  const [highestPaidTestSeries, sethighestPaidTestSeries]: any = useState([]);
  const [mostPopulartestSeries, setmostPopulartestSeries]: any = useState([]);
  const [buyAssessment, setbuyAssessment]: any = useState([]);
  const [allBestSellers, setallBestSellers]: any = useState([]);
  const [allMostPopular, setallMostPopular]: any = useState([]);
  const [searchText, setsearchText]: any = useState("");
  const [isSearch, setisSearch]: any = useState(false);
  const [searchData, setsearchData]: any = useState();
  const [adImgs, setadImgs]: any = useState([]);
  const [totalCount, settotalCount]: any = useState(0);
  const [cartItems, setCartItems] = useState<any>();

  const buyNow = (course: CourseDataEntry, type: string, dataType?: string) => {
    if (user.role != "student") {
      course.price = course.marketPlacePrice;
    }
    if (course.gocart) {
      push("/cart");
    } else {
      const newItem = {
        ...course,
        gocart: true,
      };
      addItem(course, 1, type);
      if (dataType === "bestSeller") {
        setbestSellers(
          bestSellers.map((item: CourseDataEntry) =>
            item._id === newItem._id ? newItem : item
          )
        );
      } else if (dataType === "buyAssessment") {
        setbuyAssessment(
          buyAssessment.map((item: CourseDataEntry) =>
            item._id === newItem._id ? newItem : item
          )
        );
      } else {
        setbestSellersTestseries(
          bestSellersTestseries.map((item: CourseDataEntry) =>
            item._id === newItem._id ? newItem : item
          )
        );
      }
    }
  };

  const search = async (ev: any) => {
    setsearchText(ev.target.value);
    if (ev.target.value && ev.target.value.trim().length) {
      setisSearch(true);
      setsearchData("");

      let { data } = await clientApi.get(
        `/api/testSeries/searchForMarketPlace${toQueryString({
          title: ev.target.value,
          limit: 20,
        })}`
      );
      settotalCount(data.length);
      setsearchData(data);
    } else {
      setisSearch(false);
    }
  };

  const viewTestSeries = (item: any) => {
    // if (user.role !== "student") {
    //   push(`/${user.role}/view-testseries/${item._id}`);
    // } else {
    //   push(`/student/testSeries/details/${item._id}`);
    // }
    push(`/testSeries/details/${item._id}`);
  };

  const viewCourse = (item: any) => {
    // if (user.role !== "student") {
    //   push(`/${user.role}/view-course/${item._id}`);
    // } else {
    //   push(`/student/course/details/${item._id}`);
    // }
    push(`/course/details/${item._id}`);
  };

  const viewTest = (item: any) => {
    // if (user.role !== "student") {
    //   push(`/${user.role}/view-assessment/${item._id}`);
    // } else {
    //   push(`/student/assessments/${item.title}?id=${item._id}`);
    // }
    push(`/assessment/home/${item.title}?id=${item._id}`);
  };

  const reset = () => {
    setisSearch(false);
    setsearchText("");
  };

  const startupFunc = async () => {
    getClientDataFunc().then((data) => {
      if (data.features.showBanner) {
        setadImgs(data.bannerImages.filter((b: any) => b.type == "testseries"));
      }
    });
    let citems = getItems();
    setCartItems(citems);
    clientApi
      .get(`/api/testSeries/getPublisherTestseries${toQueryString(params)}`)
      .then(({ data }) => {
        let coursedata = data.map((d: any) => {
          let f = citems.find((element: any) => element._id == d._id);
          if (f) {
            return {
              ...d,
              gocart: true,
            };
          } else {
            return {
              ...d,
              gocart: false,
            };
          }
        });
        setbestSellersTestseries(
          coursedata.sort((a: any, b: any) => a.enrolled - b.enrolled)
        );
      });
    clientApi
      .get(`/api/course/getPublisherCourse${toQueryString(params)}`)
      .then(({ data }) => {
        let coursedata = data.map((d: any) => {
          let f = citems.find((element: any) => element._id == d._id);
          if (f) {
            return {
              ...d,
              gocart: true,
            };
          } else {
            return {
              ...d,
              gocart: false,
            };
          }
        });
        setbestSellers(
          coursedata.sort((a: any, b: any) => a.enrolled - b.enrolled)
        );
      });
    clientApi
      .get(`/api/tests/getPublisherAssessments${toQueryString(params)}`)
      .then(({ data }) => {
        let assessmentedata = data.map((d: any) => {
          let f = citems.find((element: any) => element._id == d._id);
          if (f) {
            return {
              ...d,
              gocart: true,
            };
          } else {
            return {
              ...d,
              gocart: false,
            };
          }
        });
        setbuyAssessment(
          assessmentedata.sort((a: any, b: any) => a.enrolled - b.enrolled)
        );
      });
  };

  useEffect(() => {
    startupFunc().then(() => {
      setinitialized(true);
    });
  }, []);

  return (
    <div>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto">
            <div className="banner-info mx-auto">
              <h1 className="banner_title">
                What content are you looking for ?
              </h1>
              <form>
                {initialized && (
                  <div className="form-group mb-0">
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search "
                      value={searchText}
                      onChange={search}
                    />
                    <span>
                      <figure className="img-search">
                        <img src="/assets/images/search-icon-2.png" alt="" />
                      </figure>
                    </span>
                    {isSearch && (
                      <button type="button" className="btn p-0" onClick={reset}>
                        <figure>
                          <img src="/assets/images/close3.png" alt="" />
                        </figure>
                      </button>
                    )}
                  </div>
                )}
                {!initialized && (
                  <div className="form-group mb-0">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <main className="market-place pt-4">
        <div className="main-area course mx-auto mw-100">
          <div className="container">
            <div className="section_heading_wrapper">
              <h1 className="section_top_heading">
                Marketplace
                {isSearch && <span>({totalCount})</span>}
              </h1>
            </div>
            {adImgs.length && !isSearch ? (
              <div className="carousel-area mb-3 d-none d-lg-block">
                <div
                  className={`${styles["hide-carousel-arrows"]} ${styles["hide-arrow-area"]}`}
                >
                  <Carousel
                    className="banner_testSeries"
                    prevIcon={null}
                    nextIcon={null}
                    indicators={false}
                  >
                    {adImgs.map((item: any, i: any) => (
                      <Carousel.Item key={i}>
                        <img
                          src={item.url}
                          className="d-block w-100"
                          alt="..."
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>
              </div>
            ) : (
              <></>
            )}
            {!isSearch ? (
              <div>
                {bestSellersTestseries && bestSellersTestseries.length > 0 && (
                  <div className="box-area box-area_new">
                    <div className="card-common products_withoutslider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">
                                Most Popular Test Series
                              </h1>
                              <p className="section_sub_heading">
                                Test Series in which you might be interested
                              </p>
                            </div>
                          </div>
                          {bestSellersTestseries &&
                          bestSellersTestseries.length > 3 ? (
                            <div className="col-auto ml-auto">
                              <div className="d-lg-block d-none">
                                <a
                                  className="btn btn-outline btn-sm"
                                  href="/marketplace/viewall?type=testseries"
                                >
                                  View All
                                </a>
                              </div>
                              <div className="arrow ml-auto d-lg-none d-block">
                                <a
                                  className="btn btn-outline btn-sm"
                                  href="/marketplace/viewall?type=testseries"
                                >
                                  <figure>
                                    <img
                                      src="/assets/images/arrow-right.png"
                                      alt=""
                                    />
                                  </figure>
                                </a>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="row">
                          {bestSellersTestseries.map(
                            (item: any, index: any) => {
                              return (
                                <div
                                  className="col-lg-3 col-md-4 col-6 box-item-remove"
                                  key={index}
                                >
                                  <div className="box box_new bg-white pt-0">
                                    <div
                                      className="image-wrap cursor-pointer"
                                      onClick={() => viewTestSeries(item)}
                                    >
                                      <PImageComponent
                                        height={118}
                                        fullWidth
                                        imageUrl={item.imageUrl}
                                        backgroundColor={item.colorCode}
                                        text={item.title}
                                        radius={9}
                                        fontSize={15}
                                        type="testseries"
                                        testMode={item.testMode}
                                      />
                                    </div>

                                    <div className="box-inner box-inner_new">
                                      <div className="info p-0 m-0">
                                        <h5
                                          className="cursor-pointer text-ellipsis"
                                          data-toggle="tooltip"
                                          data-placement="top"
                                          title={item.title}
                                          onClick={() => viewTestSeries(item)}
                                        >
                                          {item.title}
                                        </h5>
                                        <div className="form-row">
                                          {item.subjects &&
                                            item.subjects.length > 1 && (
                                              <div className="col sub1_new text-truncate">
                                                <a>{item.subjects[0].name}</a>
                                              </div>
                                            )}
                                          {item.subjects &&
                                            item.subjects.length == 1 && (
                                              <div className="col sub1_new1 text-truncate">
                                                <a>{item.subjects[0].name}</a>
                                              </div>
                                            )}
                                          {item.subjects &&
                                            item.subjects.length > 1 && (
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
                                            <span>{item?.userName}</span>
                                          </p>
                                        </div>
                                      </div>
                                      {!item.enrolled && (
                                        <>
                                          {item.accessMode == "buy" &&
                                            user.role !== "student" && (
                                              <div className="selling-price-info selling-price-info_new d-flex">
                                                <ItemPrice
                                                  {...item}
                                                  field="marketPlacePrice"
                                                />
                                              </div>
                                            )}
                                          {item.accessMode == "buy" &&
                                            user.role == "student" && (
                                              <div className="selling-price-info selling-price-info_new d-flex">
                                                <ItemPrice
                                                  {...item}
                                                  field="price"
                                                />
                                              </div>
                                            )}
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="view-detail view-detail_new bg-white rounded-bottom px-2 pb-2">
                                    {!item.enrolled ? (
                                      <div className="row px-3 align-items-center gap-1">
                                        <div className="col-6 px-0 pr-1">
                                          <Button
                                            variant="outline-primary"
                                            className="w-100"
                                            onClick={() => viewTestSeries(item)}
                                          >
                                            View
                                          </Button>{" "}
                                        </div>
                                        <div className="col-6 p-0 pl-1">
                                          <Button
                                            variant="light"
                                            className="w-100"
                                            onClick={() =>
                                              buyNow(item, "testseries")
                                            }
                                          >
                                            {item?.gocart == true ? (
                                              <>Go To Cart</>
                                            ) : (
                                              <>Add To Cart</>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <h5 className="">Already Purchased</h5>
                                        <Button
                                          variant="outline-primary"
                                          className="w-100 mt-2"
                                          onClick={() => viewTestSeries(item)}
                                        >
                                          View
                                        </Button>{" "}
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {bestSellers && bestSellers.length ? (
                  <div className="box-area box-area_new">
                    <div className="card-common products_withoutslider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">Courses</h1>
                              <p className="section_sub_heading">
                                Courses in which you are intrested
                              </p>
                            </div>
                          </div>
                          {bestSellers && bestSellers.length > 3 && (
                            <div className="col-auto ml-auto">
                              <div>
                                <a
                                  className="btn btn-outline btn-sm"
                                  href="/marketplace/viewall?type=course"
                                >
                                  View All
                                </a>
                              </div>
                              <div className="arrow ml-auto">
                                <a
                                  href="/marketplace/viewall?type=course"
                                  aria-label="marketplace_courses view all"
                                >
                                  <figure>
                                    <img
                                      src="/assets/images/arrow-right.png"
                                      alt=""
                                    />
                                  </figure>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="row">
                          {bestSellers.map((item: any, index: any) => {
                            return (
                              <div
                                className="col-lg-3 col-md-4 col-6 box-item-remove"
                                key={index}
                              >
                                <div className="box box_new bg-white pt-0">
                                  <div
                                    className="image-wrap cursor-pointer"
                                    onClick={() => viewCourse(item)}
                                  >
                                    <PImageComponent
                                      height={118}
                                      fullWidth
                                      imageUrl={item.imageUrl}
                                      backgroundColor={item.colorCode}
                                      text={item.title}
                                      radius={9}
                                      fontSize={15}
                                      type="course"
                                      testMode={item.testMode}
                                    />
                                  </div>

                                  <div className="box-inner box-inner_new">
                                    <div className="info p-0 m-0">
                                      <h5
                                        className="cursor-pointer text-ellipsis"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title={item.title}
                                        onClick={() => viewCourse(item)}
                                      >
                                        {item.title}
                                      </h5>
                                      <div className="form-row">
                                        {item.subjects &&
                                          item.subjects.length > 1 && (
                                            <div className="col sub1_new text-truncate">
                                              <a>{item.subjects[0].name}</a>
                                            </div>
                                          )}
                                        {item.subjects &&
                                          item.subjects.length == 1 && (
                                            <div className="col sub1_new1 text-truncate">
                                              <a>{item.subjects[0].name}</a>
                                            </div>
                                          )}
                                        {item.subjects &&
                                          item.subjects.length > 1 && (
                                            <div className="col-auto num1_new text-truncate">
                                              <a>
                                                + {item.subjects.length - 1}{" "}
                                                more
                                              </a>
                                            </div>
                                          )}
                                      </div>

                                      <div className="author-name">
                                        <p>
                                          <span>{item.user.name}</span>
                                        </p>
                                      </div>
                                    </div>
                                    {!item.enrolled && (
                                      <>
                                        {item.accessMode == "buy" &&
                                          user.role !== "student" && (
                                            <div className="selling-price-info selling-price-info_new d-flex">
                                              <ItemPrice
                                                {...item}
                                                field="marketPlacePrice"
                                              />
                                            </div>
                                          )}
                                        {item.accessMode == "buy" &&
                                          user.role == "student" && (
                                            <div className="selling-price-info selling-price-info_new d-flex">
                                              <ItemPrice
                                                {...item}
                                                field="price"
                                              />
                                            </div>
                                          )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="view-detail view-detail_new bg-white rounded-bottom pb-2">
                                  {!item.enrolled ? (
                                    <div className="row px-2 align-items-center gap-1">
                                      <div className="col-6 pr-1">
                                        <Button
                                          variant="outline-primary"
                                          className="w-100"
                                          onClick={() => viewCourse(item)}
                                        >
                                          View
                                        </Button>{" "}
                                      </div>
                                      <div className="col-6 pl-1">
                                        <Button
                                          variant="light"
                                          className="w-100"
                                          onClick={() =>
                                            buyNow(
                                              item,
                                              "testseries",
                                              "bestSeller"
                                            )
                                          }
                                        >
                                          {item?.gocart == true ? (
                                            <>Go To Cart</>
                                          ) : (
                                            <>Add To Cart</>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="px-2">
                                      <h5 className="">Already Purchased</h5>
                                      <Button
                                        variant="outline-primary"
                                        className="w-100 mt-2"
                                        onClick={() => viewCourse(item)}
                                      >
                                        View
                                      </Button>{" "}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {buyAssessment && buyAssessment.length ? (
                  <div className="box-area box-area_new">
                    <div className="card-common products_withoutslider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">
                                {" "}
                                Bestseller Assessments
                              </h1>
                              <p className="section_sub_heading">
                                Assessments in which you might be interested
                              </p>
                            </div>
                          </div>
                          {buyAssessment && buyAssessment.length > 3 && (
                            <div className="col-auto ml-auto">
                              <div className="d-lg-block d-none">
                                <a
                                  className="btn btn-outline btn-sm"
                                  href="/marketplace/viewall?type=assessment"
                                >
                                  View All
                                </a>
                              </div>
                              <div className="arrow ml-auto d-lg-none d-block">
                                <a
                                  href="/marketplace/viewall?type=assessment"
                                  aria-label="Bestseller Assessments"
                                >
                                  <figure>
                                    <img
                                      src="/assets/images/arrow-right.png"
                                      alt=""
                                    />
                                  </figure>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="row">
                          {buyAssessment.map((item: any, index: any) => {
                            return (
                              <div
                                className="col-lg-3 col-md-4 col-6 box-item-remove"
                                key={index}
                              >
                                <div className="box box_new bg-white pt-0">
                                  <div
                                    className="image-wrap cursor-pointer"
                                    onClick={() => viewTest(item)}
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
                                    />
                                  </div>

                                  <div className="box-inner box-inner_new">
                                    <div className="info p-0 m-0">
                                      <h5
                                        className="cursor-pointer text-ellipsis"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title={item.title}
                                        onClick={() => viewTest(item)}
                                      >
                                        {item.title}
                                      </h5>
                                      <div className="form-row">
                                        {item.subjects &&
                                          item.subjects.length > 1 && (
                                            <div className="col sub1_new text-truncate">
                                              <a>{item.subjects[0].name}</a>
                                            </div>
                                          )}
                                        {item.subjects &&
                                          item.subjects.length == 1 && (
                                            <div className="col sub1_new1 text-truncate">
                                              <a>{item.subjects[0].name}</a>
                                            </div>
                                          )}
                                        {item.subjects &&
                                          item.subjects.length > 1 && (
                                            <div className="col-auto num1_new text-truncate">
                                              <a>
                                                +{item.subjects.length - 1} more
                                              </a>
                                            </div>
                                          )}
                                      </div>
                                      <div className="author-name">
                                        <p>
                                          <span>{item?.userName}</span>
                                        </p>
                                      </div>
                                    </div>
                                    {!item.enrolled && (
                                      <>
                                        {item.accessMode == "buy" &&
                                          user.role !== "student" && (
                                            <div className="selling-price-info selling-price-info_new d-flex">
                                              <ItemPrice
                                                {...item}
                                                field="marketPlacePrice"
                                              />
                                            </div>
                                          )}
                                        {item.accessMode == "buy" &&
                                          user.role == "student" && (
                                            <div className="selling-price-info selling-price-info_new d-flex">
                                              <ItemPrice
                                                {...item}
                                                field="price"
                                              />
                                            </div>
                                          )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="view-detail view-detail_new bg-white rounded-bottom pb-2">
                                  {!item.enrolled ? (
                                    <div className="row px-2 align-items-center gap-1">
                                      <div className="col-6 pr-1">
                                        <Button
                                          variant="outline-primary"
                                          className="w-100"
                                          onClick={() => viewTest(item)}
                                        >
                                          View
                                        </Button>{" "}
                                      </div>
                                      <div className="col-6 pl-1">
                                        <Button
                                          variant="light"
                                          className="w-100"
                                          onClick={() =>
                                            buyNow(
                                              item,
                                              "testseries",
                                              "buyAssessment"
                                            )
                                          }
                                        >
                                          {item?.gocart == true ? (
                                            <>Go To Cart</>
                                          ) : (
                                            <>Add To Cart</>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="px-2">
                                      <h5 className="">Already Purchased</h5>
                                      <Button
                                        variant="outline-primary"
                                        className="w-100 mt-2"
                                        onClick={() => viewTest(item)}
                                      >
                                        View
                                      </Button>{" "}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {!bestSellersTestseries.length &&
                  !bestSellers.length &&
                  !buyAssessment.length && (
                    <div className="course-search-empty text-center empty-data">
                      <figure className="mx-auto">
                        <img
                          src="/assets/images/Search-rafiki.png"
                          alt=""
                          className="img-fluid d-block mx-auto mb-4"
                        />
                      </figure>

                      <h3>No Results Found</h3>
                      <p>
                        We couldn&apos;t find any results based on your search
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div>
                <div className="box-area-wrap box-area-wrap_new position-relative">
                  {searchData && (
                    <div>
                      {searchData.length && (
                        <div>
                          <div className="row">
                            {searchData.map((test: any, index: any) => {
                              return (
                                <div
                                  className="col-lg-3 col-md-4 col-6 box-item-remove"
                                  key={index}
                                >
                                  {test.type == "course" && (
                                    <div
                                      className="box box_new bg-white pt-0 cursor-pointer"
                                      onClick={() => viewCourse(test)}
                                    >
                                      <img
                                        src={test.imageUrl}
                                        style={{ width: "100%", height: 118 }}
                                      />
                                      {/* <p-image [height]="118" [width]="100" [imageUrl]="test.imageUrl" [type]="'course'"
                                  [backgroundColor]="test.colorCode" [text]="test.title" [radius]="9" [fontSize]="15">
                              </p-image> */}
                                    </div>
                                  )}
                                  {test.type == "testseries" && (
                                    <div
                                      className="box box_new bg-white pt-0 cursor-pointer"
                                      onClick={() => viewTestSeries(test)}
                                    >
                                      <img
                                        src={test.imageUrl}
                                        style={{ width: "100%", height: 118 }}
                                      />
                                      {/* <p-image [height]="118" [width]="100" [imageUrl]="test.imageUrl" [type]="'testseries'"
                                  [backgroundColor]="test.colorCode" [text]="test.title" [radius]="9" [fontSize]="15">
                              </p-image> */}
                                    </div>
                                  )}
                                  {test.type == "assessment" && (
                                    <div
                                      className="box box_new bg-white pt-0 cursor-pointer"
                                      onClick={() => viewTest(test)}
                                    >
                                      <img
                                        src={test.imageUrl}
                                        style={{ width: "100%", height: 118 }}
                                      />
                                      {/* <p-image [height]="118" [width]="100" [imageUrl]="test.imageUrl" [backgroundColor]="test.colorCode"
                                [text]="test.title" [radius]="9" [fontSize]="15" [type]="'assessment'" [testMode]="test.testMode">
                            </p-image> */}
                                    </div>
                                  )}
                                  <div className="box-inner box-inner_new">
                                    <div className="info p-0 m-0">
                                      {test.type == "course" && (
                                        <h5
                                          className="cursor-pointer"
                                          data-toggle="tooltip"
                                          data-placement="top"
                                          title={test.title}
                                          onClick={() => viewCourse(test)}
                                        >
                                          {test.title}
                                        </h5>
                                      )}
                                      {test.type == "testseries" && (
                                        <h4
                                          className="cursor-pointer"
                                          data-toggle="tooltip"
                                          data-placement="top"
                                          title={test.title}
                                          onClick={() => viewTestSeries(test)}
                                        >
                                          {test.title}
                                        </h4>
                                      )}
                                      {test.type == "course" && (
                                        <h4
                                          className="cursor-pointer"
                                          data-toggle="tooltip"
                                          data-placement="top"
                                          title={test.title}
                                          onClick={() => viewCourse(test)}
                                        >
                                          {test.title}
                                        </h4>
                                      )}

                                      <div className="form-row">
                                        {test.subjects &&
                                          test.subjects.length > 0 && (
                                            <div className="col sub1_new text-truncate">
                                              {test.subjects.length > 1 && (
                                                <a>
                                                  {test.subjects[0].name}{" "}
                                                  <span>
                                                    +{test.subjects.length - 1}{" "}
                                                    more
                                                  </span>
                                                </a>
                                              )}
                                            </div>
                                          )}
                                      </div>
                                      <div className="author-name">
                                        <p>
                                          <span>{test.userName}</span>
                                        </p>
                                      </div>
                                      {!test.enrolled && (
                                        <>
                                          {test.accessMode == "buy" &&
                                            user.role !== "student" && (
                                              <div className="selling-price-info selling-price-info_new d-flex">
                                                <ItemPrice
                                                  {...test}
                                                  field="marketPlacePrice"
                                                />
                                              </div>
                                            )}
                                          {test.accessMode == "buy" &&
                                            user.role == "student" && (
                                              <div className="selling-price-info selling-price-info_new d-flex">
                                                <ItemPrice
                                                  {...test}
                                                  field="marketPlacePrice"
                                                />
                                              </div>
                                            )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {test.type == "assessment" && (
                                    <div className="view-detail view-detail_new bg-white rounded-bottom pb-2">
                                      {!test.enrolled ? (
                                        <div className="row px-2 align-items-center gap-1">
                                          <div className="col-6 pr-1">
                                            <Button
                                              variant="outline-primary"
                                              className="w-100"
                                              onClick={() => viewTest(test)}
                                            >
                                              View
                                            </Button>{" "}
                                          </div>
                                          <div className="col-6 pl-1">
                                            <Button
                                              variant="light"
                                              className="w-100"
                                              onClick={() =>
                                                buyNow(test, "practice")
                                              }
                                            >
                                              Buy
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="px-2">
                                          <h5 className="">
                                            Already Purchased
                                          </h5>
                                          <Button
                                            variant="outline-primary"
                                            className="w-100 mt-2"
                                            onClick={() => viewTest(test)}
                                          >
                                            View
                                          </Button>{" "}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {test.type == "course" && (
                                    <div className="view-detail view-detail_new bg-white rounded-bottom pb-2">
                                      {!test.enrolled ? (
                                        <div className="row px-2 align-items-center gap-1">
                                          <div className="col-6 pr-1">
                                            <Button
                                              variant="outline-primary"
                                              className="w-100"
                                              onClick={() => viewCourse(test)}
                                            >
                                              View
                                            </Button>{" "}
                                          </div>
                                          <div className="col-6 pl-1">
                                            <Button
                                              variant="light"
                                              className="w-100"
                                              onClick={() =>
                                                buyNow(test, "course")
                                              }
                                            >
                                              Buy
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="px-2">
                                          <h5 className="">
                                            Already Purchased
                                          </h5>
                                          <Button
                                            variant="outline-primary"
                                            className="w-100 mt-2"
                                            onClick={() => viewCourse(test)}
                                          >
                                            View
                                          </Button>{" "}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {test.type == "testseries" && (
                                    <div className="view-detail view-detail_new bg-white rounded-bottom pb-2">
                                      {!test.enrolled ? (
                                        <div className="row px-2 align-items-center gap-1">
                                          <div className="col-6 pr-1">
                                            <Button
                                              variant="outline-primary"
                                              className="w-100 "
                                              onClick={() =>
                                                viewTestSeries(test)
                                              }
                                            >
                                              View
                                            </Button>{" "}
                                          </div>
                                          <div className="col-6 pl-1">
                                            <Button
                                              variant="light"
                                              className="w-100"
                                              onClick={() =>
                                                buyNow(test, "testseries")
                                              }
                                            >
                                              Buy
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <h5 className="">
                                            Already Purchased
                                          </h5>
                                          <Button
                                            variant="outline-primary"
                                            className="w-100 mt-2"
                                            onClick={() => viewTestSeries(test)}
                                          >
                                            View
                                          </Button>{" "}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {!searchData.length && (
                        <div className="course-search-empty text-center empty-data">
                          <figure className="mx-auto">
                            <img
                              src="/assets/images/Search-rafiki.png"
                              alt=""
                              className="img-fluid d-block mx-auto mb-4"
                            />
                          </figure>

                          <h3>No Results Found</h3>
                          <p>
                            We couldn&apos;t find any results based on your
                            search
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {!searchData && (
                    <div>
                      <SkeletonLoaderComponent
                        Cwidth="100"
                        Cheight="260"
                        className="mb-1"
                      />
                      <SkeletonLoaderComponent
                        Cwidth="100"
                        Cheight="260"
                        className="mb-1"
                      />
                      <SkeletonLoaderComponent
                        Cwidth="100"
                        Cheight="260"
                        className="mb-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default MarketPlace;
