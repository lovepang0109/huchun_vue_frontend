"use client";

import { useState, useEffect } from "react";
import PImageComponent from "@/components/AppImage";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { Carousel, CarouselItem } from "react-bootstrap";
import AliceCarousel from "react-alice-carousel";
// import CustomCarousel from "@/components/assessment/carousel";
import AddToCartButton from "@/components/AddToCartButton";
import "react-alice-carousel/lib/alice-carousel.css";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toQueryString } from "@/lib/validator";
import clientApi from "@/lib/clientApi";
import * as testseriesSvc from "@/services/testseriesService";
import * as settingSvc from "@/services/settingService";
import * as shoppingCartService from "@/services/shopping-cart-service";
import * as paymentService from "@/services/paymentService";
import * as UserSvc from "@/services/userService";
import Image from "next/image";
import { alert, success } from "alertifyjs";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.min.css";
import "alertifyjs/build/css/themes/default.min.css";
import { useRouter } from "next/navigation";
//import "./MyCarousel.css";
import styles from "components/assessment/carousel/MyCarousel.module.css";
import { ProgressBar } from "react-bootstrap";
import ItemPrice from "@/components/ItemPrice";
import { test } from "node:test";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { update } from "lodash";
import { forkJoin } from "rxjs";
import CustomCarousel from "@/components/assessment/carousel";

const StudentTestSeriesHome = () => {
  const { user } = useSession()?.data?.user?.info || {};
  const router = useRouter();
  const { update } = useSession();

  const [testSeries, setTestSeries] = useState<any>([]);
  const [recommendedTestSeries, setRecommendedTestSeries] = useState<any>([]);
  const [boughtTestSeries, setBoughtTestSeries] = useState<any>([]);
  const [favorites, setFavorites] = useState<any>([]);
  const [peersBuy, setPeersBuy] = useState<any>([]);
  const [owlOptions, setOwlOptions] = useState<any>({
    // showSlideInfo: true,
    infinite: false,
    autoPlay: false,
    margin: 10,
    dots: false,
    // buttonsDisable: false,
    keyboardNavigation: true,
    disableDotsControls: true,
    autoHeight: false,
    autoWidth: true,
    animationDuration: 900,
    autoPlayInterval: 5000,
    navText: ["", ""],
    autoPlayStrategy: "default",
    animationType: "fadeOut",
    controlsStrategy: "responsive",
    responsive: {
      0: {
        items: 4,
      },
    },
  });
  const [searchText, setSearchText] = useState<string>("");
  const [params, setParams] = useState<any>({
    limit: 8,
    page: 1,
    // home: true,
  });
  const [marketplaceSeries, setMarketplaceSeries] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchedTestSeries, setSearchedTestSeries] = useState<any>([]);
  const [totalItems, setTotalItems] = useState<any>(0);
  const [subjects, setSubjects] = useState<any>([]);
  const [searchInit, setSearchInit] = useState<boolean>(false);
  const [activeSearchSubject, setActiveSearchSubject] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<any>({
    level: "Select a Level",
    testNumber: "select Number of Tests",
    author: "Select an Author",
    price: "Select a price",
  });
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [adImgs, setAdImgs] = useState<any>([]);
  const [authors, setAuthors] = useState<any>([]);
  const [getClientData, setGetClientData] = useState<any>({});
  const [currencySymbol, setCurrencySymbol] = useState<any>([]);
  const [currentIndex, setCurrentIndex] = useState<any>({
    item: 0,
  });
  const [favoriteIndex, setFavoriteIndex] = useState<any>({
    item: 0,
  });
  const [leagueIndex, setLeagueIndex] = useState<any>({
    item: 0,
  });
  const [recommendIndex, setRecommendIndex] = useState<any>({
    item: 0,
  });
  const [friendIndex, setFriendIndex] = useState<any>({
    item: 0,
  });

  const [sections, setSections] = useState<any>([]);

  const getCurrencySymbol = (currencyCode: any) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      }).formatToParts()[0].value;
    } catch (error) {
      console.error("Error getting currency symbol:", error);
      return "";
    }
  };
  useEffect(() => {
    UserSvc.get().then((us) => {
      setCurrencySymbol(getCurrencySymbol(us.country.currency, "narrow"));
      clientApi.get(`/api/settings`).then((settings) => {
        setGetClientData(settings.data);
        if (
          settings.data.features?.marketplace &&
          settings.data.features?.marketplaceForStudent
        ) {
          testseriesSvc
            .getPublisherTestseries({
              page: 1,
              limit: 8,
            })
            .then((res) => {
              res.forEach((item) => {
                item.addedToCart = shoppingCartService.isItemAdded(item);
              });
              setMarketplaceSeries(res);
            });
        }
        setAdImgs(
          settings.data.bannerImages.filter((b) => b.type == "testseries")
        );
      });
      settingSvc.findOne("contentOrganizer").then((conf: any) => {
        if (conf?.testseries?.length) {
          const updatedSections = [...sections];
          for (const sec of conf.testseries) {
            if (sec.visible) {
              updatedSections.push(sec);
              setSections(updatedSections);

              testseriesSvc
                .findAllSummaryByStudent({
                  ...params,
                  tags: sec.tags.join(","),
                  sort: "title,1",
                })
                .then((secResult: any) => {
                  sec.series = secResult.series;
                });
            }
          }
        }
      });

      testseriesSvc
        .findAllSummaryByStudent({ limit: 10, home: true })
        .then((testSeriesResult) => {
          setTestSeries(testSeriesResult.series);
          checkCompletion();
        })
        .catch((err) => {
          console.log(err, "Fail");
        });
      testseriesSvc
        .myTestSeries({ attemptCount: true })
        .then((bResult) => {
          bResult.series.forEach((p) => {
            p.progress = Math.round(
              (p.attemptCount / p.practiceIds.length) * 100
            );
          });
          setBoughtTestSeries(bResult.series);
          checkCompletion();
        })
        .catch((err) => {
          console.log(err);
        });

      const checkCompletion = () => {
        if (testSeries.length > 0 && boughtTestSeries.length > 0) {
          refreshFavorite();
        }
      };
    });
  }, []);

  const reset = () => {
    setSearchedTestSeries([]);
    setSearchText("");
    setParams({ ...{}, page: params.page, limit: params.limit });
    setIsSearching(false);
  };

  const search = (event: any) => {
    setParams({ ...params, page: 1 });
    let param = { ...params, page: 1 };
    setSearchText(event.target.value);
    setSearchInit(true);
    if (event.target.value === "") {
      setIsSearching(false);
      setSearchedTestSeries([]);
      setSearchInit(false);
    } else {
      setParams({ ...param, name: event.target.value });
      param = { ...param, name: event.target.value };
      getResult(param);
      setSearchInit(false);
    }
  };

  const getResult = (param?: any) => {
    if (!param) {
      param = params;
    }
    testseriesSvc.getSubjects({ title: param.name }).then((da) => {
      setSubjects(da);
    });
    testseriesSvc
      .findAllSummaryByStudent({ ...params, count: true })
      .then((res: any) => {
        setSearchedTestSeries(res.series);
        setTotalItems(res.total);
        setIsSearching(true);
      });

    testseriesSvc.getAuthors().then((da: any[]) => {
      setAuthors(da);
    });
  };

  const onSubjectChange = (subject: any) => {
    setActiveSearchSubject(subject);
    setParams((prev: any) => ({
      ...prev,
      page: 1,
      subject: subject._id,
    }));

    getResult();
  };

  const filter = (type: any, value: any, displyText: any) => {
    setParams((prev: any) => ({
      ...prev,
      page: 1,
      type: value,
    }));
    setSelectedFilter((prev: any) => ({
      ...prev,
      type: displyText,
    }));
    getResult();
  };

  const viewDetails = (id: any) => {
    router.push(`/testSeries/details/${id}`);
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
    if (!showFilter) {
      setSelectedFilter((prev: any) => ({
        ...prev,
        level: "Select a Level",
        testNumber: "Select Number of Tests",
        author: "Select an Author",
        price: "Select a price",
      }));
      setParams((prev: any) => ({
        page: 1,
        limit: 8,
        name: searchText,
      }));
      getResult();
    }
  };

  const allSubject = () => {
    setActiveSearchSubject(null);

    setParams((prev: any) => ({
      ...prev,
      page: 1,
      subject: "",
    }));
    getResult();
  };

  const loardMoreSearchResult = () => {
    setParams((prev: any) => ({
      ...prev,
      page: params.page + 1,
    }));
    testseriesSvc
      .findAllSummaryByStudent(params)
      .then((res: any) => {
        setSearchedTestSeries([...searchedTestSeries, ...res.series]);
      })
      .catch((err) => {
        console.log(err);
        setSearchedTestSeries([]);
      });
  };

  const addFavorite = (test: any, favCat?: boolean) => {
    let id = "";
    if (favCat) {
      id = test.itemId;
    } else {
      id = test._id;
    }
    testseriesSvc.addFavorite(id).then((da) => {
      test.isFavorite = true;
      alertify.success("Successfully added to favourites");
      refreshFavorite();
    });
  };

  const removeFavorite = (test: any, favCat?: boolean) => {
    let id = "";
    if (favCat) {
      id = test.itemId;
    } else {
      id = test._id;
    }
    testseriesSvc.removeFavorite(id).then((da) => {
      test.isFavorite = false;
      alertify.success("Successfully removed from favourites");
      refreshFavorite();
    });
  };

  const refreshFavorite = () => {
    testseriesSvc.getFavorites().then((data: any[]) => {
      const updateFavorites = data.map((item: any) => ({
        ...item,
        isFavorite: true,
      }));
      setFavorites(updateFavorites);

      if (recommendedTestSeries) {
        const updateRecommendedTestSeries = recommendedTestSeries.map(
          (r: any) => {
            let updatedR = { ...r, isFavorite: false };
            updateFavorites.forEach((item: any) => {
              if (item.itemId === r._id) {
                updatedR.isFavorite = true;
                ({ ...item, isFavorite: true });
              }
            });
            return updatedR;
          }
        );
        setRecommendedTestSeries(updateRecommendedTestSeries);
      }
      if (peersBuy) {
        const updatePeersBuy = peersBuy.map((r: any) => {
          let updatedR = { ...r, isFavorite: false };
          updateFavorites.map((e: any) => {
            if (e.itemId === r._id) {
              updatedR.isFavorite = true;
            }
          });
          return updatedR;
        });
        setPeersBuy(updatePeersBuy);
      }

      if (testSeries) {
        const updateTestSeries = testSeries.map((r: any) => {
          let updatedR = { ...r, isFavorite: false };
          updateFavorites.map((e: any) => {
            if (e.itemId === r._id) {
              updatedR.isFavorite = true;
            }
          });
          return updatedR;
        });
        setTestSeries(updateTestSeries);
      }
      if (boughtTestSeries) {
        const updateBoughtTestSeries = boughtTestSeries.map((r: any) => {
          let updatedR = { ...r, isFavorite: false };
          updateFavorites.map((e: any) => {
            if (e.itemId === r._id) {
              updatedR.isFavorite = true;
            }
          });
          return updatedR;
        });
        setBoughtTestSeries(updateBoughtTestSeries);
      }
    });
  };

  const enroll = async (series: any) => {
    series.enrolling = true;
    const params: any = {
      testseries: series._id,
      type: "testseries",
    };

    const data = await paymentService.enrollItems(params);
    await update();
    UserSvc.get().then((us) => {
      const test = series.praticeinfo.find((t) => t.order == 1);
      if (test) {
        localStorage.setItem(
          `${us._id}_${test.practicesetId}_reference`,
          JSON.stringify({
            referenceType: "testseries",
            referenceId: series._id,
          })
        );
        router.push(`/assessment/${series.title}?id=${test.practicesetId}`);
      } else {
        router.push(`/testSeries/details/${series.id}`);
      }
    });
    series.enrolling = false;
  };

  const viewMarketplaceSeries = (item: any) => {
    router.push(`/testseries/details/${item._id}`);
  };

  const addToCart = (item: any, index: number) => {
    item.price = item.marketPlacePrice;
    item.addedToCart = true;

    shoppingCartService.addItem(item, 1, "testseries");

    const updatedMarketplaceSeries = [...marketplaceSeries];

    updatedMarketplaceSeries[index] = item;

    setMarketplaceSeries(updatedMarketplaceSeries);
  };

  const goToCart = () => {
    router.push(`/cart`);
  };

  return (
    <>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto text-center text-white">
            <div className="banner-info mx-auto">
              <h1 className="mb-4">Are you ready to test yourself?</h1>

              <form>
                <div className="form-group mb-0">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for Test Series"
                    value={searchText}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    onChange={search}
                  />
                  <span>
                    <figure>
                      <img
                        src="/assets/images/search-icon-2.png"
                        alt="This is search icon"
                      />
                    </figure>
                  </span>
                  {isSearching && (
                    <button
                      type="button"
                      className="btn p-0"
                      onClick={() => reset()}
                    >
                      <figure>
                        <img
                          src="/assets/images/close3.png"
                          alt="this closebutton icon"
                        />
                      </figure>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      {!isSearching && (
        <main className="course pt-4">
          <div className="main-area course mx-auto mw-100">
            <div className="container">
              {adImgs?.length > 0 && getClientData?.features?.showBanner && (
                <>
                  <div
                    className={`${styles["hide-carousel-arrows"]} ${styles["hide-arrow-area"]}`}
                  >
                    <Carousel
                      className="banner_testSeries"
                      prevIcon={null}
                      nextIcon={null}
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
                  <div className="carousel-area px-2 d-block d-lg-none mb-3">
                    <Carousel
                      className="banner_testSeries"
                      prevIcon={null}
                      nextIcon={null}
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
                </>
              )}
              <div className="box-area_new d-none d-lg-block">
                {recommendedTestSeries[2]?.title && (
                  <div className="row">
                    <div className="col-12">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          Popular Test Series
                        </h3>
                        <p className="section_sub_heading">
                          These Test series are sold by your institute and are
                          available to purchase and use.
                        </p>
                      </div>
                    </div>
                    {recommendedTestSeries[2]?.title && (
                      <div className="col-md-6">
                        <div className="course-box-wrap course-box-wrap_new has_circle">
                          <div
                            className="course-box bg-color3_new"
                            style={{
                              background: recommendedTestSeries[2]?.colorCode,
                            }}
                          >
                            <div className="inner">
                              <h3 className="course_title">
                                {recommendedTestSeries[2]?.title}
                              </h3>
                              <p className="course_summary">
                                description goes here
                              </p>
                            </div>
                            <div className="enroll-btn bg-white">
                              <Link
                                className="text-center px-3"
                                href={`/testSeries/details/${recommendedTestSeries[2]?._id}`}
                              >
                                Enroll
                              </Link>
                            </div>
                            <div className="course-box-img">
                              <figure>
                                <img
                                  src="/assets/images/Subtract.png"
                                  alt="Subtract image"
                                />
                              </figure>
                              <div className="clearfix">
                                <div className="circle bg-white"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {recommendedTestSeries[4]?.title && (
                      <div className="col-md-6">
                        <div className="course-box-wrap course-box-wrap_new has_circle">
                          <div
                            className="course-box bg-color3_new"
                            style={{
                              background: recommendedTestSeries[4]?.colorCode,
                            }}
                          >
                            <div className="inner">
                              <h3 className="course_title">
                                {recommendedTestSeries[4]?.title}
                              </h3>
                              <p className="course_summary">
                                description goes here
                              </p>
                            </div>
                            <div className="learn-more-btn bg-white">
                              <Link
                                className="text-center px-3"
                                href={`/testSeries/details/${recommendedTestSeries[4]?._id}`}
                              >
                                Learn More
                              </Link>
                            </div>
                            <div className="course-box-img">
                              <figure>
                                <img
                                  src="/assets/images/Subtract.png"
                                  alt="course_subtract"
                                />
                              </figure>
                              <div className="clearfix">
                                <div className="circle bg-white"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {marketplaceSeries?.length && (
                <div className="box-area box-area_new">
                  <div className="card-common products_slider">
                    <div className="card-header-common">
                      <div className="row align-items-center">
                        <div className="col">
                          <div className="section_heading_wrapper">
                            <h2 className="section_top_heading">
                              Marketplace Test Series
                            </h2>
                            <p className="section_sub_heading">
                              The marketplace is a central location of all
                              published test series for your use. These test
                              series are not yet added to your institute.
                            </p>
                          </div>
                        </div>
                        {marketplaceSeries.length > 5 && (
                          <div className="col-auto ml-auto">
                            <div>
                              <Link
                                className="btn btn-outline btn-sm"
                                href={`/market-place/view-all?type=testseries`}
                              >
                                View All
                              </Link>
                            </div>
                            <div className="arrow ml-auto">
                              <Link
                                href={`/market-place/view-all?type=testseries`}
                              >
                                <i className="fas fa-arrow-right"></i>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-body-common">
                      <CustomCarousel
                        items={marketplaceSeries.map((item, index) => (
                          <div
                            key={item._id}
                            className="box-item p-0"
                            style={{ width: 250 }}
                          >
                            <div
                              className="box box_new bg-white pt-0"
                              style={{ width: "120%" }}
                            >
                              <div className="image-wrap cursor-pointer">
                                <Link href={`/testSeries/details/${item._id}`}>
                                  <PImageComponent
                                    height={118}
                                    fullWidth
                                    imageUrl={item.imageUrl}
                                    type="testSeries"
                                    backgroundColor={item.colorCode}
                                    text={item.title}
                                    radius={9}
                                    fontSize={15}
                                  />
                                </Link>
                              </div>
                              <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                                <div className="info pubCourseS1 p-0 m-0">
                                  <h4
                                    className="cursor-pointer"
                                    title={item.title}
                                  >
                                    <Link
                                      href={`/testSeries/details/${item._id}`}
                                    >
                                      {item.title}
                                    </Link>
                                  </h4>
                                  <div className="form-row small">
                                    <div className="col-auto text-truncate">
                                      <a>{item.subjects[0].name}</a>
                                    </div>
                                    {item.subjects.length > 1 && (
                                      <div className="col-auto">
                                        <a>+{item.subjects.length - 1} more</a>
                                      </div>
                                    )}
                                  </div>
                                  <div className="author-name">
                                    <p>
                                      <span>
                                        {item.brandName ||
                                          item.userName ||
                                          item.user.name}
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
                                        field="marketPlacePrice"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="d-flex justify-items-between bg-white pb-2 gap-xs">
                                  <div className="flex-grow-1 flex-basic-0">
                                    <Link
                                      className="btn btn-buy btn-sm btn-block"
                                      href={`/testSeries/details/${item._id}`}
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                  {!item.enrolled && !item.addedToCart && (
                                    <div className="flex-grow-1 flex-basic-0">
                                      <a
                                        className="btn btn-outline btn-sm btn-block"
                                        onClick={() => addToCart(item, index)}
                                      >
                                        Add To Cart
                                      </a>
                                    </div>
                                  )}
                                  {!item.enrolled && item.addedToCart && (
                                    <div className="flex-grow-1 flex-basic-0">
                                      <a
                                        className="btn btn-outline btn-sm btn-block"
                                        onClick={goToCart}
                                      >
                                        Go To Cart
                                      </a>
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
              )}
              {boughtTestSeries ? (
                <div className="box-area_new">
                  {boughtTestSeries.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h2 className="section_top_heading">
                                My Enrolled Test Series
                              </h2>
                              <p className="section_sub_heading">
                                Access &apos;My Enrolled Test Series&apos; to
                                view and manage your enrolled test series
                                conveniently. Stay organised and track your
                                progress effortlessly.
                              </p>
                            </div>
                          </div>
                          {boughtTestSeries.length > 4 && (
                            <div className="col-auto ml-auto">
                              <div>
                                <Link
                                  className="btn btn-outline btn-sm"
                                  href="/testSeries/viewAll/myseries"
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto">
                                <Link href="/testSeries/viewAll/myseries">
                                  <i className="fas fa-arrow-right"></i>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="box-area-wrap box-area-wrap_new clearfix mx-0 d-none d-lg-block">
                          <CustomCarousel
                            items={boughtTestSeries.map((test, index) => (
                              <div
                                key={test._id}
                                className="course-item course-item_new"
                                style={{ width: 220 }}
                              >
                                <div className="box box_new p t-0">
                                  <div className="image-wrap cursor-pointer">
                                    <Link
                                      href={`/testSeries/details/${test._id}`}
                                    >
                                      <PImageComponent
                                        alt="This alternate text"
                                        height={141}
                                        fullWidth
                                        imageUrl={test.imageUrl}
                                        type="testSeries"
                                        text={test.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                    </Link>
                                    <div className="favorite-icon">
                                      {!test.isFavorite ? (
                                        <a onClick={() => addFavorite(test)}>
                                          <figure>
                                            <img
                                              className="addfavrouite"
                                              src="/assets/images/like-white-bg.png"
                                              alt="add favourite"
                                            />
                                          </figure>
                                        </a>
                                      ) : (
                                        <a onClick={() => removeFavorite(test)}>
                                          <figure>
                                            <img
                                              className="removeFavorite"
                                              src="/assets/images/like-red-bg.png"
                                              alt="remove from favourite"
                                            />
                                          </figure>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="box-inner box-inner_new">
                                    <div className="info info_new">
                                      <h4
                                        className="cursor-pointer"
                                        title={test.title}
                                      >
                                        <Link
                                          href={`/testSeries/details/${test._id}`}
                                        >
                                          {test.title}
                                        </Link>
                                      </h4>
                                    </div>
                                    <div className="bottom-info">
                                      <ProgressBar
                                        now={test.progress}
                                        variant="success"
                                        id="test-progress"
                                        className={
                                          styles["custom-progress-bar"]
                                        }
                                      />
                                      <p>{`${test.progress}%`}</p>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <Link
                                        className="btn btn-outline btn-sm d-block mobile_sett"
                                        href={`/testSeries/details/${test._id}`}
                                      >
                                        {test.progress === 100
                                          ? "Review"
                                          : "Resume"}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          />
                        </div>
                        <div className="box-area-wrap clearfix d-block d-lg-none">
                          <CustomCarousel
                            items={boughtTestSeries.map((test, index) => (
                              <div
                                key={test._id}
                                className="course-item course-item_new"
                                style={{ width: 220 }}
                              >
                                <div className="box box_new pt-0">
                                  <div className="image-wrap">
                                    <PImageComponent
                                      alt="This alternate text"
                                      height={102}
                                      fullWidth
                                      imageUrl={test.imageUrl}
                                      type="testSeries"
                                      text={test.title}
                                      radius={9}
                                      fontSize={15}
                                    />
                                    <div className="favorite-icon">
                                      {!test.isFavorite ? (
                                        <a onClick={() => addFavorite(test)}>
                                          <figure>
                                            <img
                                              className="addfavrouite"
                                              src="/assets/images/like-white-bg.png"
                                              alt="like favourite"
                                            />
                                          </figure>
                                        </a>
                                      ) : (
                                        <a onClick={() => removeFavorite(test)}>
                                          <figure>
                                            <img
                                              className="removeFavorite"
                                              src="/assets/images/like-red-bg.png"
                                              alt="remove from favourite"
                                            />
                                          </figure>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="box-inner box-inner_new cursor-pointer">
                                    <Link
                                      href={`/testSeries/details/${test._id}`}
                                    >
                                      <div className="info p-0 m-0">
                                        <h4 title={test.title}>{test.title}</h4>
                                        <div className="author-name">
                                          <p>{test.user?.name}</p>
                                        </div>
                                        <div className="form-row small">
                                          <div className="col text-truncate">
                                            <a>{test.subjects[0].name}</a>
                                          </div>
                                          {test.subjects.length > 1 && (
                                            <div className="col-auto">
                                              <a>{`+ ${test.subjects.length - 1
                                                } more`}</a>
                                            </div>
                                          )}
                                        </div>
                                      </div>
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
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />
                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}
              {testSeries ? (
                <>
                  {testSeries.length > 0 && (
                    <div className="box-area_new">
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  Your Institute Test Series
                                </h3>
                                <p className="section_sub_heading d-none d-lg-block">
                                  These test series are provided by your
                                  institute and are ready to use.
                                </p>
                              </div>
                            </div>
                            {testSeries.length > 5 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href="/testSeries/viewAll/testseries"
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link
                                    aria-label="viewAll Test series"
                                    href="/testSeries/viewAll/testseries"
                                  >
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common">
                          <div className="box-area-wrap box-area-wrap_new clearfix mx-0 d-none d-lg-block">
                            <CustomCarousel
                              items={testSeries.map((test, index) => (
                                <div
                                  key={test._id}
                                  className="course-item course-item_new"
                                  style={{ width: 220 }}
                                >
                                  <div className="box box_new p t-0">
                                    <div className="image-wrap cursor-pointer">
                                      <Link
                                        href={`/testSeries/details/${test._id}`}
                                      >
                                        <PImageComponent
                                          alt="This alternate text"
                                          height={141}
                                          fullWidth
                                          imageUrl={test.imageUrl}
                                          type="testSeries"
                                          text={test.title}
                                          radius={9}
                                          fontSize={15}
                                        />
                                      </Link>
                                      <div className="favorite-icon">
                                        {!test.isFavorite ? (
                                          <a onClick={() => addFavorite(test)}>
                                            <figure>
                                              <img
                                                className="addfavrouite"
                                                src="/assets/images/like-white-bg.png"
                                                alt="Build your league add to favourite"
                                              />
                                            </figure>
                                          </a>
                                        ) : (
                                          <a
                                            onClick={() => removeFavorite(test)}
                                          >
                                            <figure>
                                              <img
                                                className="removeFavorite"
                                                src="/assets/images/like-red-bg.png"
                                                alt="Build your league remove from favourite"
                                              />
                                            </figure>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <div className="box-inner box-inner_new">
                                      <div className="info info_new">
                                        <h4
                                          className="cursor-pointer"
                                          title={test.title}
                                        >
                                          <Link
                                            href={`/student/testSeries/details/${test._id}`}
                                          >
                                            {test.title.length > 30
                                              ? test.title.substring(0, 30) +
                                              "..."
                                              : test.title}
                                          </Link>
                                        </h4>
                                        <div className="author-name">
                                          <p>
                                            {test.brandName || test.user?.name}
                                          </p>
                                        </div>
                                        <div className="form-row small">
                                          <div className="col text-truncate">
                                            <a>{test.subjects[0].name}</a>
                                          </div>
                                          {test.subjects.length > 1 && (
                                            <div className="col-auto">
                                              <a>
                                                + {test.subjects.length - 1}{" "}
                                                more
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          {test.accessMode === "buy" && (
                                            <ItemPrice content={test} />
                                          )}
                                          {test.accessMode === "public" && (
                                            <span>
                                              <strong>Free</strong>
                                            </span>
                                          )}
                                          {test.accessMode === "invitation" && (
                                            <span>
                                              <strong>Private</strong>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="form-row">
                                      <div className="col-6">
                                        <Link
                                          className="btn btn-buy btn-sm d-block btn-sm"
                                          href={`/testSeries/details/${test._id}`}
                                        >
                                          View Details
                                        </Link>
                                      </div>
                                      <div className="col-6">
                                        {test.accessMode !== "buy" ? (
                                          <>
                                            {!test.enrolled ? (
                                              <a
                                                className="btn btn-success btn-sm d-block"
                                                onClick={() => enroll(test)}
                                              >
                                                Enroll
                                              </a>
                                            ) : (
                                              <Link
                                                className="btn btn-outline btn-sm d-block"
                                                href={`/testSeries/details/${test._id}`}
                                              >
                                                Resume
                                              </Link>
                                            )}
                                          </>
                                        ) : (
                                          <AddToCartButton
                                            item={test}
                                            type={"testseries"}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            />
                          </div>
                          <div className="box-area-wrap clearfix d-block d-lg-none">
                            <CustomCarousel
                              items={testSeries.map((test, index) => (
                                <div
                                  key={test._id}
                                  className="course-item course-item_new"
                                  style={{ width: 220 }}
                                >
                                  <div className="box box_new pt-0">
                                    <div className="image-wrap">
                                      <PImageComponent
                                        alt="This alternate text"
                                        height={102}
                                        fullWidth
                                        imageUrl={test.imageUrl}
                                        type="testSeries"
                                        text={test.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                      <div className="favorite-icon">
                                        {!test.isFavorite ? (
                                          <a onClick={() => addFavorite(test)}>
                                            <figure>
                                              <img
                                                className="addfavrouite"
                                                src="/assets/images/like-white-bg.png"
                                                alt="Build your league add to favourite"
                                              />
                                            </figure>
                                          </a>
                                        ) : (
                                          <a
                                            onClick={() => removeFavorite(test)}
                                          >
                                            <figure>
                                              <img
                                                className="removeFavorite"
                                                src="/assets/images/like-red-bg.png"
                                                alt="Build your league remove from favourite"
                                              />
                                            </figure>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <div className="box-inner box-inner_new cursor-pointer">
                                      <Link
                                        href={`/testSeries/details/${test._id}`}
                                      >
                                        <div className="info p-0 m-0">
                                          <h4 title={test.title}>
                                            {test.title.length > 30
                                              ? test.title.substring(0, 30) +
                                              "..."
                                              : test.title}
                                          </h4>
                                          <div className="author-name">
                                            <p>
                                              {test.brandName ||
                                                test.user?.name}
                                            </p>
                                          </div>
                                          <div className="form-row small">
                                            <div className="col text-truncate">
                                              <a>{test.subjects[0].name}</a>
                                            </div>
                                            {test.subjects.length > 1 && (
                                              <div className="col-auto">
                                                <a>
                                                  + {test.subjects.length - 1}{" "}
                                                  more
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                          <div className="selling-price-info d-flex">
                                            {test.accessMode === "buy" && (
                                              <ItemPrice content={test} />
                                            )}
                                            {test.accessMode === "public" && (
                                              <span>
                                                <strong>Free</strong>
                                              </span>
                                            )}
                                            {test.accessMode ===
                                              "invitation" && (
                                                <span>
                                                  <strong>Private</strong>
                                                </span>
                                              )}
                                          </div>
                                        </div>
                                      </Link>
                                    </div>
                                    <div className="form-row">
                                      <div className="col-6">
                                        <Link
                                          className="btn btn-buy btn-sm d-block btn-sm"
                                          href={`/testSeries/details/${test._id}`}
                                        >
                                          View Details
                                        </Link>
                                      </div>
                                      <div className="col-6">
                                        {test.accessMode !== "buy" ? (
                                          <>
                                            {!test.enrolled ? (
                                              <a
                                                className="btn btn-success btn-sm d-block"
                                                onClick={() => enroll(test)}
                                              >
                                                Enroll
                                              </a>
                                            ) : (
                                              <Link
                                                className="btn btn-outline btn-sm d-block"
                                                href={`/testSeries/details/${test._id}`}
                                              >
                                                Resume
                                              </Link>
                                            )}
                                          </>
                                        ) : (
                                          <AddToCartButton
                                            item={test}
                                            type={"testseries"}
                                          />
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
                </>
              ) : (
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />
                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}
              {favorites ? (
                <div className="box-area_new">
                  {favorites.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                My Favorites
                              </h3>
                              <p className="section_sub_heading">
                                Choose from your favorite content
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="box-area-wrap box-area-wrap_new clearfix mx-0 d-none d-lg-block">
                          <CustomCarousel
                            items={favorites.map((test, index) => (
                              <div
                                key={test._id}
                                className="course-item course-item_new"
                                style={{ width: 220 }}
                              >
                                <div className="box box_new p t-0">
                                  <div className="image-wrap cursor-pointer">
                                    <Link
                                      href={`/testSeries/details/${test.itemId}`}
                                    >
                                      <PImageComponent
                                        alt="This alternate text"
                                        height={141}
                                        fullWidth
                                        imageUrl={test.imageUrl}
                                        type="testSeries"
                                        text={test.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                    </Link>
                                    <div className="favorite-icon">
                                      {!test.isFavorite ? (
                                        <a
                                          onClick={() =>
                                            addFavorite(test, true)
                                          }
                                        >
                                          <figure>
                                            <img
                                              className="addfavrouite"
                                              src="/assets/images/like-white-bg.png"
                                              alt="Add to my favourite"
                                            />
                                          </figure>
                                        </a>
                                      ) : (
                                        <a
                                          onClick={() =>
                                            removeFavorite(test, true)
                                          }
                                        >
                                          <figure>
                                            <img
                                              className="removeFavorite"
                                              src="/assets/images/like-red-bg.png"
                                              alt="Remove from my favourite"
                                            />
                                          </figure>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="box-inner box-inner_new">
                                    <div className="info info_new">
                                      <h4
                                        className="cursor-pointer"
                                        title={test.title}
                                      >
                                        <Link
                                          href={`/student/testSeries/details/${test.itemId}`}
                                        >
                                          {test.title}
                                        </Link>
                                      </h4>
                                      <div className="author-name">
                                        <p>
                                          {test.brandName || test.authorName}
                                        </p>
                                      </div>
                                      <div className="form-row small">
                                        <div className="col text-truncate">
                                          <a>{test.subjects?.[0]?.name}</a>
                                        </div>
                                        {test.subjects?.length > 1 && (
                                          <div className="col-auto">
                                            <a>
                                              + {test.subjects.length - 1} more
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Link
                                      className="btn btn-buy btn-block btn-sm round-bottom py-2"
                                      href={`/testSeries/details/${test.itemId}`}
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          />
                        </div>
                        <div className="box-area-wrap clearfix d-block d-lg-none">
                          <CustomCarousel
                            items={favorites.map((test, index) => (
                              <div
                                key={test._id}
                                className="course-item course-item_new"
                                style={{ width: 220 }}
                              >
                                <div className="box box_new pt-0">
                                  <div className="image-wrap">
                                    <PImageComponent
                                      alt="This alternate text"
                                      height={102}
                                      fullWidth
                                      imageUrl={test.imageUrl}
                                      type="testSeries"
                                      text={test.title}
                                      radius={9}
                                      fontSize={15}
                                    />
                                    <div className="favorite-icon">
                                      {!test.isFavorite ? (
                                        <a
                                          onClick={() =>
                                            addFavorite(test, true)
                                          }
                                        >
                                          <figure>
                                            <img
                                              className="addfavrouite"
                                              src="/assets/images/like-white-bg.png"
                                              alt="Add to my favourite"
                                            />
                                          </figure>
                                        </a>
                                      ) : (
                                        <a
                                          onClick={() =>
                                            removeFavorite(test, true)
                                          }
                                        >
                                          <figure>
                                            <img
                                              className="removeFavorite"
                                              src="/assets/images/like-red-bg.png"
                                              alt="Remove from my favourite"
                                            />
                                          </figure>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="box-inner box-inner_new cursor-pointer">
                                    <Link
                                      href={`/testSeries/details/${test.itemId}`}
                                    >
                                      <div className="info p-0 m-0">
                                        <h4 title={test.title}>{test.title}</h4>
                                        <div className="author-name">
                                          <p>
                                            {test.brandName || test.authorName}
                                          </p>
                                        </div>
                                        <div className="form-row small">
                                          <div className="col text-truncate">
                                            <a>{test.subjects?.[0]?.name}</a>
                                          </div>
                                          {test.subjects?.length > 1 && (
                                            <div className="col-auto">
                                              <a>
                                                + {test.subjects.length - 1}{" "}
                                                more
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                        <div className="selling-price-info d-flex">
                                          {test.accessMode === "buy" && (
                                            <ItemPrice content={test} />
                                          )}
                                          {test.accessMode === "public" && (
                                            <span>
                                              <strong>Free</strong>
                                            </span>
                                          )}
                                          {test.accessMode === "invitation" && (
                                            <span>
                                              <strong>Private</strong>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                  <div>
                                    <Link
                                      className="btn btn-buy btn-block btn-sm round-bottom py-2"
                                      href={`/testSeries/details/${test.itemId}`}
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
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />
                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}
              {sections.map((section, index) => (
                <div key={section._id} className="box-area_new">
                  {section.series?.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                {section.title}
                              </h3>
                              <p className="section_sub_heading d-none d-lg-block">
                                {section.description}
                              </p>
                            </div>
                          </div>
                          {section.series.length > 10 && (
                            <div className="col-auto ml-auto">
                              <div>
                                <Link
                                  className="btn btn-outline btn-sm"
                                  href={`testSeries/viewAll?tags=${section.tags.join(
                                    ","
                                  )}&title=${section.title}`}
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto">
                                <Link
                                  aria-label="viewAll Test series"
                                  href={`testSeries/viewAll?tags=${section.tags.join(
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
                        <div className="box-area-wrap box-area-wrap_new clearfix mx-0 d-none d-lg-block">
                          <CustomCarousel
                            items={section.series.map((test, i) => (
                              <div
                                key={test._id}
                                className="course-item course-item_new"
                                style={{ width: 220 }}
                              >
                                <div className="box box_new p t-0">
                                  <div className="image-wrap cursor-pointer">
                                    <Link
                                      href={`/testSeries/details/${test._id}`}
                                    >
                                      <PImageComponent
                                        alt="This alternate text"
                                        height={141}
                                        fullWidth
                                        imageUrl={test.imageUrl}
                                        type="testSeries"
                                        text={test.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                    </Link>
                                    <div className="favorite-icon">
                                      {!test.isFavorite ? (
                                        <a onClick={() => addFavorite(test)}>
                                          <figure>
                                            <img
                                              className="addfavrouite"
                                              src="/assets/images/like-white-bg.png"
                                              alt="Build your league add to favourite"
                                            />
                                          </figure>
                                        </a>
                                      ) : (
                                        <a onClick={() => removeFavorite(test)}>
                                          <figure>
                                            <img
                                              className="removeFavorite"
                                              src="/assets/images/like-red-bg.png"
                                              alt="Build your league remove from favourite"
                                            />
                                          </figure>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="box-inner box-inner_new">
                                    <div className="info info_new">
                                      <div className="status seller-info seller-info_new">
                                        <span>Bestseller</span>
                                      </div>
                                      <h4
                                        className="cursor-pointer"
                                        title={test.title}
                                      >
                                        <Link
                                          href={`/testSeries/details/${test._id}`}
                                        >
                                          {test.title.length > 30
                                            ? `${test.title.substring(
                                              0,
                                              30
                                            )}...`
                                            : test.title}
                                        </Link>
                                      </h4>
                                      <div className="author-name">
                                        <p>
                                          {test.brandName || test.user?.name}
                                        </p>
                                      </div>
                                      <div className="form-row small">
                                        <div className="col text-truncate">
                                          <a>{test.subjects[0]?.name}</a>
                                        </div>
                                        {test.subjects.length > 1 && (
                                          <div className="col-auto">
                                            <a>
                                              + {test.subjects.length - 1} more
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                      <div className="selling-price-info selling-price-info_new d-flex">
                                        {test.accessMode === "buy" && (
                                          <ItemPrice content={test} />
                                        )}
                                        {test.accessMode === "public" && (
                                          <span>
                                            <strong>Free</strong>
                                          </span>
                                        )}
                                        {test.accessMode === "invitation" && (
                                          <span>
                                            <strong>Private</strong>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="form-row">
                                    <div className="col-6">
                                      <Link
                                        className="btn btn-buy btn-sm d-block btn-sm"
                                        href={`/student/testSeries/details/${test._id}`}
                                      >
                                        View Details
                                      </Link>
                                    </div>
                                    <div className="col-6">
                                      {test.accessMode !== "buy" ? (
                                        !test.enrolled ? (
                                          <a
                                            className="btn btn-success btn-sm d-block"
                                            onClick={() => enroll(test)}
                                          >
                                            Enroll
                                          </a>
                                        ) : (
                                          <Link
                                            className="btn btn-outline btn-sm d-block"
                                            href={`/testSeries/details/${test._id}`}
                                          >
                                            Resume
                                          </Link>
                                        )
                                      ) : (
                                        <AddToCartButton
                                          item={test}
                                          type={`testseries`}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          />
                        </div>
                        <div className="box-area-wrap clearfix d-block d-lg-none">
                          <CustomCarousel
                            items={section.series.map((test, i) => (
                              <div
                                key={test._id}
                                className="course-item course-item_new"
                                style={{ width: 220 }}
                              >
                                <div className="box box_new pt-0">
                                  <div className="image-wrap">
                                    <PImageComponent
                                      alt="This alternate text"
                                      height={102}
                                      fullWidth
                                      imageUrl={test.imageUrl}
                                      type="testSeries"
                                      text={test.title}
                                      radius={9}
                                      fontSize={15}
                                    />
                                    <div className="favorite-icon">
                                      {!test.isFavorite ? (
                                        <a onClick={() => addFavorite(test)}>
                                          <figure>
                                            <img
                                              className="addfavrouite"
                                              src="/assets/images/like-white-bg.png"
                                              alt="Build your own league add to favourite"
                                            />
                                          </figure>
                                        </a>
                                      ) : (
                                        <a onClick={() => removeFavorite(test)}>
                                          <figure>
                                            <img
                                              className="removeFavorite"
                                              src="/assets/images/like-red-bg.png"
                                              alt="Build your own league remove from favourite"
                                            />
                                          </figure>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="box-inner box-inner_new cursor-pointer">
                                    <Link
                                      href={`/testSeries/details/${test._id}`}
                                    >
                                      <div className="info p-0 m-0">
                                        <div className="status seller-info seller-info_new">
                                          <span>Bestseller</span>
                                        </div>
                                        <h4 title={test.title}>{test.title}</h4>
                                        <div className="author-name">
                                          <p>
                                            {test.brandName || test.user?.name}
                                          </p>
                                        </div>
                                        <div className="form-row small">
                                          <div className="col text-truncate">
                                            <a>{test.subjects[0]?.name}</a>
                                          </div>
                                          {test.subjects.length > 1 && (
                                            <div className="col-auto">
                                              <a>
                                                + {test.subjects.length - 1}{" "}
                                                more
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                        <div className="selling-price-info d-flex">
                                          {test.accessMode === "buy" && (
                                            <ItemPrice content={test} />
                                          )}
                                          {test.accessMode === "public" && (
                                            <span>
                                              <strong>Free</strong>
                                            </span>
                                          )}
                                          {test.accessMode === "invitation" && (
                                            <span>
                                              <strong>Private</strong>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="form-row">
                                    <div className="col-6">
                                      <Link
                                        className="btn btn-buy btn-sm d-block btn-sm"
                                        href={`/testSeries/details/${test._id}`}
                                      >
                                        View Details
                                      </Link>
                                    </div>
                                    <div className="col-6">
                                      {test.accessMode !== "buy" ? (
                                        !test.enrolled ? (
                                          <a
                                            className="btn btn-success btn-sm d-block"
                                            onClick={() => enroll(test)}
                                          >
                                            Enroll
                                          </a>
                                        ) : (
                                          <Link
                                            className="btn btn-outline btn-sm d-block"
                                            href={`/testSeries/details/${test._id}`}
                                          >
                                            Resume
                                          </Link>
                                        )
                                      ) : (
                                        <AddToCartButton
                                          item={test}
                                          type={`testseries`}
                                        />
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
                  )}
                </div>
              ))}
              {!boughtTestSeries?.length &&
                !favorites?.length &&
                !testSeries?.length && (
                  <div className="course-search-empty text-center empty-data">
                    <figure className="mx-auto">
                      <img
                        src="/assets/images/Search-rafiki.png"
                        alt="This image for search"
                        className="img-fluid d-block mx-auto mb-4"
                      />
                    </figure>
                    <h3>No Results Found</h3>
                    <p>We couldn&apos;t find any results.</p>
                  </div>
                )}
            </div>
          </div>
        </main>
      )}
      {isSearching && (
        <main className="course course_search_wrap">
          <div className="main-area-remove course-remove course-search-result mx-auto">
            <div className="container main-area mx-auto">
              <div className="tab-header tab-header_new mx-auto">
                <div className="row align-items-center">
                  <div className="col">
                    <div className="tabs mx-auto mb-0">
                      <ul
                        className="nav nav-tabs border-0"
                        id="searchResultTab"
                      >
                        <li className="nav-item">
                          <a
                            className={activeSearchSubject ? "" : "active"}
                            onClick={allSubject}
                          >
                            All
                          </a>
                        </li>

                        {subjects.map((item) => (
                          <li key={item._id} className="nav-item">
                            <a
                              className={
                                item._id ===
                                  (activeSearchSubject && activeSearchSubject._id)
                                  ? "active"
                                  : ""
                              }
                              onClick={() => onSubjectChange(item)}
                            >
                              {item.name}
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
              <div>
                <div className="tab-content">
                  <div className="tab-pane show active">
                    <div className="filter-area filter-area_new clearfix row">
                      {showFilter && (
                        <>
                          <div className="filter-item col-lg-3">
                            <div className="title">
                              <h4>Level</h4>
                            </div>
                            <div className="dropdown new-icone-dropdown">
                              <a
                                href="#"
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
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("level", "school", "School")
                                  }
                                >
                                  School
                                </a>
                                <a
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("level", "bachelors", "Bachelors")
                                  }
                                >
                                  Bachelors
                                </a>
                                <a
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("level", "masters", "Masters")
                                  }
                                >
                                  Masters
                                </a>
                                <a
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("level", "open", "Open")
                                  }
                                >
                                  Open
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="filter-item col-lg-3">
                            <div className="title">
                              <h4>Number of Assessment</h4>
                            </div>
                            <div className="dropdown new-icone-dropdown">
                              <a
                                href="#"
                                className="btn dropdown-toggle text-left"
                                role="button"
                                id="filterDurations"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <span>{selectedFilter.testNumber}</span>
                              </a>
                              <div
                                className="dropdown-menu border-0 py-0"
                                aria-labelledby="filterDurations"
                              >
                                <a
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("testNumber", "0-10", " 10")
                                  }
                                >
                                  &lt; 10
                                </a>
                                <a
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("testNumber", "10-20", "10 - 20")
                                  }
                                >
                                  10 - 20
                                </a>
                                <a
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("testNumber", "20-100", "> 20")
                                  }
                                >
                                  &gt; 20
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="filter-item col-lg-3">
                            <div className="title">
                              <h4>Instructor</h4>
                            </div>
                            <div className="dropdown new-icone-dropdown">
                              <a
                                href="#"
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
                                {authors.map((item) => (
                                  <a
                                    key={item._id}
                                    href="#"
                                    className="dropdown-item"
                                    onClick={() =>
                                      filter("author", item._id, item.name)
                                    }
                                  >
                                    {item.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="filter-item col-lg-3">
                            <div className="title">
                              <h4>Price</h4>
                            </div>
                            <div className="dropdown new-icone-dropdown">
                              <a
                                href="#"
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
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter(
                                      "price",
                                      "0-500",
                                      "< " + currencySymbol + "500"
                                    )
                                  }
                                >
                                  &lt; {currencySymbol}500
                                </a>
                                <a
                                  href="#"
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
                                  href="#"
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
                                  href="#"
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter(
                                      "price",
                                      ">5000",
                                      "> " + currencySymbol + "5000"
                                    )
                                  }
                                >
                                  &gt; {currencySymbol}5000
                                </a>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <div>
                        {searchedTestSeries.length > 0 && (
                          <div
                            className="course-search course-search_new clearfix"
                            style={{ width: "1110px" }}
                          >
                            {totalItems > 0 && (
                              <div className="heading heading_new">
                                <div className="row align-items-center">
                                  <div className="col-8">
                                    <h3>{totalItems} Test Series</h3>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="form-row">
                              {searchedTestSeries.map((item, index) => (
                                <div className="col-lg-3" key={index}>
                                  <div
                                    className="box-item-search  border-rounded pr-2"
                                    style={{ width: "280px" }}
                                  >
                                    <div
                                      className="cursor-pointer"
                                      onClick={() => viewDetails(item._id)}
                                    >
                                      <PImageComponent
                                        alt="This alternate text"
                                        height={150}
                                        fullWidth
                                        imageUrl={item.imageUrl}
                                        type="testSeries"
                                        text={item.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                    </div>
                                    <div className="box-inner box-inner_new has-shadow no-bottom-info cardFontAll-imp1">
                                      <div className="info p-0 m-0">
                                        <h4
                                          className="product_title"
                                          title={item.title}
                                          onClick={() => viewDetails(item._id)}
                                        >
                                          {item.title}
                                        </h4>
                                        <div className="author-name">
                                          <p>
                                            {item.brandName || item.user?.name}
                                          </p>
                                        </div>
                                        <div className="form-row small">
                                          <div className="col-auto text-truncate">
                                            <a>{item.subjects[0].name}</a>
                                          </div>
                                          {item.subjects.length > 1 && (
                                            <div className="col-auto">
                                              <a>
                                                + {item.subjects.length - 1}{" "}
                                                more
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                        {item.accessMode === "buy" && (
                                          <div className="selling-price-info_new d-flex">
                                            {/* Assuming you have a component <ItemPrice /> */}
                                            <ItemPrice content={item} />
                                          </div>
                                        )}
                                        {item.accessMode === "public" && (
                                          <div className="selling-price-info_new d-flex">
                                            <span>
                                              <strong>Free</strong>
                                            </span>
                                          </div>
                                        )}
                                        {item.accessMode === "invitation" && (
                                          <div className="selling-price-info_new d-flex">
                                            <span>
                                              <strong>Private</strong>
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {item.accessMode !== "buy" && (
                                      <div className="form-row">
                                        <div className="col-6">
                                          <a
                                            className="btn btn-buy btn-sm d-block"
                                            href={`/student/testSeries/details/${item._id}`}
                                          >
                                            View Details
                                          </a>
                                        </div>
                                        <div className="col-6">
                                          <a
                                            className="btn btn-success btn-sm d-block"
                                            onClick={() => enroll(item)}
                                          >
                                            Enroll
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                    {item.accessMode === "buy" && (
                                      <div className="form-row">
                                        <div className="col-6">
                                          <a
                                            className="btn btn-buy btn-sm d-block"
                                            href={`/student/testSeries/details/${item._id}`}
                                          >
                                            View Details
                                          </a>
                                        </div>
                                        <div className="col-6">
                                          {/* Assuming you have a component <AddToCartButton /> */}
                                          <AddToCartButton
                                            item={item}
                                            type="testseries"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {totalItems > searchedTestSeries.length &&
                          searchedTestSeries.length > 0 &&
                          totalItems > params.limit && (
                            <div className="text-center">
                              <button
                                className="btn btn-light"
                              // onClick={loadMoreSearchResult}
                              >
                                Load more
                              </button>
                            </div>
                          )}
                      </div>
                      {searchedTestSeries.length === 0 && (
                        <div className="container">
                          <div className="empty-data course-search-empty text-center">
                            <figure className="mx-auto">
                              <img
                                src="assets/images/Search-rafiki.png"
                                alt="No Results Found"
                              />
                            </figure>
                            <h3>No Results Found</h3>
                            <p>
                              We couldn&apos;t find any results based on your search
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default StudentTestSeriesHome;
