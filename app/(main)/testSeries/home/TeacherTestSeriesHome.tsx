"use client";

import { useState, useEffect, useRef } from "react";
import { getSession, signOut } from "next-auth/react";
import FavoriteButton from "@/components/FavoriteButton";
import AppSubjects from "@/components/AppSubjects";
import { Carousel, CarouselItem } from "react-bootstrap";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toQueryString } from "@/lib/validator";
import clientApi, { apiVersion } from "@/lib/clientApi";
import Image from "next/image";
import alertify, { alert, success } from "alertifyjs";
import "alertifyjs/build/css/alertify.min.css";
import "alertifyjs/build/css/themes/default.min.css";
import { useRouter } from "next/navigation";
//import "./MyCarousel.css";
//import styles from "./MyCarousel.module.css";
import { ProgressBar } from "react-bootstrap";
import ItemPrice from "@/components/ItemPrice";
import { test } from "node:test";
import { AnyKindOfDictionary, set, update } from "lodash";
import moment from "moment";
import * as testseriesSvc from "@/services/testseriesService";
import * as subjectSvc from "@/services/subjectService";
import * as favoriteSvc from "@/services/favaorite-service";
import * as shoppingCartService from "@/services/shopping-cart-service";
import * as userService from "@/services/userService";
import * as settingSvc from "@/services/settingService";
import "bootstrap/dist/css/bootstrap.css";
import { Col, Form, Modal, Button } from "react-bootstrap";
import Multiselect from "multiselect-react-dropdown";
import { MultiSelect } from "react-multi-select-component";
import { FileUploader } from "react-drag-drop-files";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import CustomCarousel from "@/components/assessment/carousel";
import PImageComponent from "@/components/AppImage";
import { NodeNextRequest } from "next/dist/server/base-http/node";
import { FileDrop } from "react-file-drop";
import { uploadFile as uploaddFileFunc } from "@/lib/clientApi";

function ImageComponent(props: any) {
  const {
    height,
    width,
    type,
    imageUrl,
    backgroundColor,
    text,
    radius,
    fontSize,
  } = props;

  // const image = imageUrl ?? "/assets/images/testseriesDefault.jpg";

  return (
    <div>
      <img
        src={imageUrl}
        alt={text}
        style={{
          height: `${height}px`,
          width: `${width}`,
          backgroundColor,
          borderRadius: `${radius}px`,
        }}
      />
      {/* <p style={{ fontSize }}>{text}</p> */}
    </div>
  );
}

const styleForMultiSelect = {
  multiselectContainer: {},
  searchBox: {
    fontSize: "10px",
    minHeight: "30px",
    outline: 0,
    border: 0,
  },
  inputField: {
    margin: 5,
  },

  option: {
    color: "black",
    //height: 30,
    //padding: "3px 5px",
    //margin: 0,
    borderRadius: 5,
  },
  optionContainer: {
    display: "flex",
    flexDirection: "column",
  },
};

const fileTypes = ["JPEG", "PNG", "GIF"];

// Carousel responsive
const responsive = {
  0: { items: 1 },
  500: { items: 2 },
  820: { items: 3 },
  1284: { items: 5 },
};
const initialArchivedSeries = [];
const initialBestSellerSeries = [];

const TeacherTestSeriesHome = () => {
  // State variables ------------------------------------------
  const { push } = useRouter();
  const [initialized, setInitialized] = useState<any>({
    published: false,
    draft: false,
    archived: false,
    bestSeller: false,
    mostPopular: false,
    highestPaid: false,
  });
  const [uploadFile, setUploadFile] = useState<any>(null);
  const fileBrowseRef = useRef(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [imageReview, setImageReview] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<any>([]);
  const [authors, setAuthors] = useState<any>([]);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [foundTestseries, setFoundTestseries] = useState<any>([]);
  const [selectedObj, setSelectedObj] = useState([]);
  const [archivedSeries, setArchivedSeries] = useState<any>([]);

  const [selectedFilter, setSelectedFilter] = useState<any>({
    level: "",
    accessMode: "",
    author: "",
    price: "",
  });
  const [searchText, setSearchText] = useState<string>("");
  const [searchParams, setSearchParams] = useState<any>({
    limit: 8,
    page: 1,
    title: "",
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [modalRef, setModalRef] = useState<any>();
  const [newSeriesParams, setNewSeriesParams] = useState<AnyKindOfDictionary>({
    title: "",
    summary: "",
    subjects: [],
    imageUrl: "",
  });
  const [user, setUser] = useState<any>(useSession()?.data?.user?.info || {});
  const [createSeriesSubjects, setCreateSeriesSubjects] = useState<any>();
  const [settings, setSettings] = useState<any>();
  const [file, setFile] = useState("");
  const [mySeries, setMySeries] = useState<any>(null);
  const [marketplaceSeries, setMarketplaceSeries] = useState<any>([]);
  const [allLoadedSections, setAllLoadedSections] = useState<any>([]);
  const [recentSeries, setRecentSeries] = useState<any>(null);
  const [sections, setSections] = useState<any>([]);
  const [favorites, setFavorites] = useState<any>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    userService.get().then((us) => {
      clientApi.get(`/api/settings`).then((da) => {
        setSettings(da);
        if (
          da.data.features?.marketplace &&
          (us.role == "director" || us.role == "admin")
        ) {
          testseriesSvc
            .getPublisherTestseries({
              page: 1,
              limit: 8,
              favorite: true,
            })
            .then((res) => {
              setHasData(res.length > 0);

              res.forEach((item) => {
                item.addedToCart = shoppingCartService.isItemAdded(item);
              });
              setMarketplaceSeries(res);
            });
        }
      });
    });
    testseriesSvc.getAuthors().then((res: any) => {
      setAuthors(res);
    });

    testseriesSvc.getSubjects().then((res: any) => {
      setSubjects(res);
    });
    let updatedInitalized = initialized;

    testseriesSvc
      .find({
        limit: 15,
        favorite: true,
        countStudent: true,
        origin: "institute",
        multiStatus: "draft,published",
      })
      .then((res: any) => {
        setMySeries(res.series);
        setAllLoadedSections([...allLoadedSections, res.series]);

        setHasData(res.series?.length > 0);
        updatedInitalized.mine = true;
      });

    testseriesSvc
      .find({
        limit: 15,
        countStudent: true,
        origin: "institute",
        multiStatus: "revoked,expired",
      })
      .then((res: any) => {
        setArchivedSeries(res.series);

        setAllLoadedSections([...allLoadedSections, res.series]);

        setHasData(res.series?.length > 0);
        updatedInitalized.archived = true;
      });

    testseriesSvc
      .find({
        limit: 15,
        favorite: true,
        countStudent: true,
        origin: "publisher",
      })
      .then((res: any) => {
        setRecentSeries(res.series);

        setAllLoadedSections([...allLoadedSections, res.series]);

        setHasData(res.series?.length > 0);
        updatedInitalized.recent = true;
      });
    setInitialized(updatedInitalized);

    favoriteSvc
      .findTestSeries({
        page: 1,
        limit: 6,
        excludeUser: true,
        showClassrooms: true,
      })
      .then((res: any) => {
        setFavorites(res.series);

        setHasData(res.series?.length > 0);
      });

    settingSvc.findOne("contentOrganizer").then((conf: any) => {
      if (conf?.testseries?.length) {
        const updatedSections = [...sections];
        for (const sec of conf.testseries) {
          if (sec.visible) {
            updatedSections.push(sec);
            setSections(updatedSections);
            testseriesSvc
              .find({
                limit: 15,
                favorite: true,
                tags: sec.tags.join(","),
                sort: "title,1",
              })
              .then((secResult: any) => {
                sec.series = secResult.series;
                setAllLoadedSections([...allLoadedSections, sec.series]);

                setHasData(sec.series.length > 0);
              });
          }
        }
      }
    });
  }, []);
  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };
  const search = (para: any) => {
    setIsSearching(true);

    testseriesSvc
      .find({ ...para, includeCount: true })
      .then((res: any) => {
        setTotalItems(res.count);
        setFoundTestseries(res.series);
        setIsSearching(false);
      })
      .catch((err) => {
        setIsSearching(false);
      });
  };

  const loadMoreSearchResult = () => {
    setSearchParams({
      ...searchParams,
      page: searchParams.page + 1,
    });
    const para = {
      ...searchParams,
      page: searchParams.page + 1,
    };
    testseriesSvc.find(para).then((res: any) => {
      setFoundTestseries([...foundTestseries, res.series]);
    });
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const filter = (key: any, val: any, text: string) => {
    setSelectedFilter((prevSelectedFilter: any) => ({
      ...prevSelectedFilter,
      [key]: text,
    }));

    setSearchParams((prevSearchParams: any) => ({
      ...prevSearchParams,
      [key]: val,
    }));
    const para = {
      ...searchParams,
      [key]: val,
      includeCount: true,
    };

    setIsSearching(true);
    search(para);
  };

  const allSubjects = () => {
    setActiveSubject(null);
    const para = searchParams;
    delete searchParams.subject;
    delete para.subject;

    search(para);
  };

  const onSubjectChange = (sub: any) => {
    setActiveSubject(sub);
    setSearchParams({
      ...searchParams,
      subject: sub._id,
    });
    const para = {
      ...searchParams,
      subject: sub._id,
    };
    search(para);
  };
  const reset = () => {
    setSearchParams((prev: any) => ({
      ...prev,
      title: "",
    }));
  };

  const viewDetails = (item: any) => {
    if (item.isFromMarketPlace) {
      push(`/testSeries/view-testSeries/${item._id}`);
    }
    push(`/testSeries/details/${item._id}`);
  };

  const edit = (seri: any) => {
    push(`/testSeries/details/${seri._id}`);
  };

  const deleteFunc = (seri: any) => {
    alertify.confirm(
      "Are you sure, you want to delete this testseries?",
      (ev) => {
        testseriesSvc
          .deleteFun(seri._id)
          .then((res) => {
            alertify.success("Test Series deleted successfully.");
          })
          .catch((err) => {
            alertify.alert(
              "Message",
              "Something went wrong. Please check browser console for more details."
            );
          });
      }
    );
  };

  const validate = (seri: any) => {
    // validate data
    if (!seri.subjects[0]) {
      alertify.alert("Message", "Please select at least one subject.");
      return false;
    }

    if (seri.expiresOn && !seri.startDate) {
      alertify.alert("Message", "Please select the start date.");
      return false;
    }

    if (seri.startDate && seri.expiresOn) {
      if (
        moment(seri.startDate, "DD-MM-YYYY").isAfter(
          moment(seri.expiresOn, "DD-MM-YYYY")
        )
      ) {
        alertify.alert(
          "Message",
          "Start date cannot be greater than end date."
        );
        return false;
      }
    }

    if (seri.accessMode == "buy") {
      if (!seri.countries.length) {
        alertify.alert("Message", "Please set at least one currency.");
        return false;
      }

      if (seri.discountValue > 100) {
        alertify.alert("Message", "Discount cannot be greater than 100%.");
        return false;
      }
    }

    if (!seri.description) {
      alertify.alert(
        "Message",
        "Please fill in description before publishing."
      );
      return false;
    }

    if (
      user.role != "publisher" &&
      seri.accessMode == "invitation" &&
      !seri.classrooms.length
    ) {
      alertify.alert("Message", "Please select at least one classroom.");
      return false;
    }

    if (!seri.practiceIds || seri.practiceIds.length < 2) {
      alertify.alert("Message", "Please select at least two assessments.");
      return false;
    }

    return true;
  };

  const publish = (seri: any) => {
    if (validate(seri)) {
      alertify.confirm(
        "Are you sure you want to publish this Test Series?",
        (msg) => {
          testseriesSvc
            .publish(seri._id)
            .then((res: any) => {
              seri.status = "published";
              seri.statusChangedAt = res.statusChangedAt;

              alertify.success("Test Series published successfully.");
            })
            .catch((res) => {
              if (res.response.data && res.response.data.message) {
                alertify.alert("Message", res.response.data);
              } else {
                alertify.alert(
                  "Message",
                  "Something went wrong. Please check browser console for more details."
                );
              }
            });
        }
      );
    }
  };

  const withdraw = (seri: any) => {
    alertify.confirm(
      "Are you sure, you want to withdraw this testseries?",
      (ev) => {
        testseriesSvc
          .revoke(seri._id, {})
          .then((res) => {
            alertify.success("Test Series is withdrawn successfully.");
          })
          .catch((res) => {
            if (res.response.data && res.response.data.message) {
              alertify.alert("Message", res.response.data);
            } else {
              alertify.alert(
                "Message",
                "Something went wrong. Please check browser console for more details."
              );
            }
          });
      }
    );
  };

  const openCreateSeriesModal = async () => {
    if (!createSeriesSubjects) {
      try {
        const tmp = await subjectSvc.getMine();
        setCreateSeriesSubjects(tmp);
      } catch (ex) {
        alertify.alert("Message", "Fail to get subjects list");
        return;
      }
    }
    setShow(true);
  };

  const cancelModal = () => {
    setShow(false);

    // reset form data

    setNewSeriesParams({
      title: "",
      summary: "",
      subjects: [],
      imageUrl: "",
    });
    setSelectedObj([]);
  };

  const createTestseries = () => {
    testseriesSvc
      .create(newSeriesParams)
      .then((res: any) => {
        setShow(false);
        viewDetails(res);
      })
      .catch((err) => {
        if (err.response.data && err.response.data.msg) {
          alertify.alert("Message", err.response.data.msg);
        } else {
          alertify.alert("Message", "Fail to create test series");
        }
      });
  };
  const fileUpload = async () => {
    const formData: FormData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    //   formData.append('uploadType', this.uploadType)
    try {
      setUploading(true);
      const res = await uploaddFileFunc(uploadFile, uploadFile.name, "file");
      setNewSeriesParams({ ...newSeriesParams, imageUrl: res.data.fileUrl });
      setImageReview(true);
      setUploadedUrl(res.data.fileUrl);
      setUploading(false);
    } catch (err) {
      alert("message", err);
    }
  };
  const viewMostPopular = (item: any, cat?: any) => {
    if (cat == "mostPopular" && user.role == "teacher") {
      push(`/testSeries/view-testSeries/${item._id}`);
      return;
    }
    if (cat == "bestSeller" && user.role == "teacher") {
      push(`/testSeries/view-testSeries/${item._id}`);

      return;
    }
    viewDetails(item);
  };

  const checkOwner = (item: any) => {
    if (
      (user.role != "teacher" && user.role != "mentor") ||
      item.user._id == user._id
    ) {
      return true;
    }
    let val = false;
    if (item.instructors && item.instructors.length) {
      const index = item.instructors.findIndex((e) => e == user._id);
      if (index > -1) {
        val = true;
      }
    }
    return val;
  };

  const viewMarketplaceSeries = (item: any) => {
    // this.router.navigate(['/', this.user.role, 'view-testseries', item._id])
    push(`/testSeries/view-testSeries/${item._id}`);
  };

  const addToCart = (item: any, index: number) => {
    if (user.role != "student") {
      item.price = item.marketPlacePrice;
    }
    item.addedToCart = true;

    shoppingCartService.addItem(item, 1, "testseries");

    const updatedMarketplaceSeries = [...marketplaceSeries];

    updatedMarketplaceSeries[index] = item;

    setMarketplaceSeries(updatedMarketplaceSeries);
  };

  const goToCart = () => {
    push(`/cart`);
  };

  const onFavoriteChanged = (ev: any) => {
    favoriteSvc
      .findTestSeries({
        page: 1,
        limit: 6,
        excludeUser: true,
        showClassrooms: true,
      })
      .then((res: any) => {
        setFavorites(res.series);
      });

    const updatedAllLoadedSections = [...allLoadedSections];

    for (const course of updatedAllLoadedSections) {
      if (course._id == ev._id) {
        course.isFavorite = ev.favorite;
      }
    }

    setAllLoadedSections(updatedAllLoadedSections);
  };

  const handleFileChange = (file: File) => {
    setFile(URL.createObjectURL(file));
  };

  const multiString = (data: any, type?: any): any => {
    if (!data) {
      return "";
    }
    if (typeof data.name !== "undefined") {
      return data.name;
    }

    if (data.length > 0) {
      if (data.length === 1) {
        if (data[0] !== null) {
          if (typeof data[0].name !== "undefined") {
            return data[0].name;
          }
        }
        return "";
      } else {
        const stringName = [];
        if (type === true) {
          for (const i in data) {
            if (data[i]) {
              stringName.push(data[i].name);
            }
          }
          return stringName.join(", ");
        } else {
          if (typeof type === "undefined") {
            type = "";
          }
          return "Multiple " + type;
        }
      }
    } else {
      return "";
    }
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  return (
    <>
      <div>
        <section className="banner d-block banner_new bg-color1 course">
          <div className="container">
            <div className="banner-area-ag banner-content mx-auto">
              <div className="banner-info mx-auto">
                <h1 className="banner_title">
                  Prepare students with set of assessments
                </h1>
                <form>
                  <div className="form-group mb-0">
                    <input
                      name="searchInput"
                      type="text"
                      className="form-control border-0"
                      placeholder="Search for Test Series"
                      value={searchParams.title}
                      onChange={(e) => {
                        setSearchParams({
                          ...searchParams,
                          page: 1,
                          title: e.target.value,
                        });
                        const para = {
                          ...searchParams,
                          page: 1,
                          title: e.target.value,
                        };
                        search(para);
                      }}
                    />
                    <span>
                      <figure>
                        <img
                          src="/assets/images/search-icon-2.png"
                          alt="search-icon"
                        />
                      </figure>
                    </span>
                    {searchParams.title && (
                      <button type="button" className="btn p-0" onClick={reset}>
                        <figure>
                          <img src="/assets/images/close3.png" alt="reset" />
                        </figure>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <main className="course_search_wrap">
          {searchParams.title ? (
            <div className="main-area mx-auto mw-100">
              <div className="container main-area mx-auto">
                <div className="tab-header tab-header_new mx-auto">
                  <div className="row align-items-center">
                    <div className="col d-none d-lg-block">
                      <div className="tabs mx-auto mb-0">
                        <ul
                          className="nav nav-tabs border-0"
                          id="searchResultTab"
                        >
                          <li className="nav-item">
                            <a
                              className={!activeSubject ? "active" : ""}
                              onClick={allSubjects}
                            >
                              All
                            </a>
                          </li>
                          {subjects
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((item) => (
                              <li className="nav-item" key={item._id}>
                                <a
                                  onClick={() => onSubjectChange(item)}
                                  className={
                                    item._id === activeSubject?._id
                                      ? "active"
                                      : ""
                                  }
                                >
                                  {item.name}
                                </a>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                    <div className="col-auto ml-auto d-none d-lg-block">
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
                      {showFilter && (
                        <div className="filter-area filter-area_new clearfix row">
                          <div className="filter-item col-lg-3">
                            <div className="title">
                              <h4>Level</h4>
                            </div>

                            <div className="dropdown">
                              <button
                                className="btn dropdown-toggle text-left"
                                type="button"
                                id="filterLavel"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <span>
                                  {selectedFilter.level
                                    ? selectedFilter.level
                                    : "Select a Level"}
                                </span>
                              </button>

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
                              <h4>Mode</h4>
                            </div>

                            <div className="dropdown">
                              <a
                                className="btn dropdown-toggle text-left"
                                type="button"
                                id="filterDurations"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <span>
                                  {selectedFilter.accessMode
                                    ? selectedFilter.accessMode
                                    : "Select a Mode"}
                                </span>
                              </a>

                              <div
                                className="dropdown-menu border-0 py-0"
                                aria-labelledby="filterDurations"
                              >
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("accessMode", "public", "Free")
                                  }
                                >
                                  Free
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter(
                                      "accessMode",
                                      "invitation",
                                      "Private"
                                    )
                                  }
                                >
                                  Private
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("accessMode", "buy", "Buy")
                                  }
                                >
                                  Buy
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
                                type="button"
                                id="filterAuthor"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <span>
                                  {selectedFilter.author
                                    ? selectedFilter.author
                                    : "Select an Author"}
                                </span>
                              </a>

                              <div
                                className="dropdown-menu border-0 py-0"
                                aria-labelledby="filterAuthor"
                              >
                                {authors.map((item) => (
                                  <a
                                    key={item._id}
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

                            <div className="dropdown">
                              <a
                                className="btn dropdown-toggle text-left"
                                type="button"
                                id="filterPrice"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <span>
                                  {selectedFilter.price
                                    ? selectedFilter.price
                                    : "Select a price"}
                                </span>
                              </a>

                              <div
                                className="dropdown-menu border-0 py-0"
                                aria-labelledby="filterPrice"
                              >
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("price", "500", "<₹500")
                                  }
                                >
                                  &lt; ₹500
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("price", "500-2000", "₹500 - ₹2000")
                                  }
                                >
                                  ₹500 - ₹2000
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter(
                                      "price",
                                      "2000-5000",
                                      "₹2000 - ₹5000"
                                    )
                                  }
                                >
                                  ₹2000 - ₹5000
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("price", ">5000", "> ₹5000")
                                  }
                                >
                                  &gt; ₹5000
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {totalItems > 0 && (
                        <div className="heading heading_new">
                          <div className="row align-items-center">
                            <div className="col-8">
                              <h3>{totalItems} Test Series</h3>
                            </div>
                          </div>
                        </div>
                      )}
                      {foundTestseries.length > 0 && (
                        <div className="course-search course-search_new clearfix">
                          <div className="form-row mt-4">
                            {foundTestseries.map((item, index) => (
                              <div
                                className="col-lg-3"
                                key={index}
                                onClick={() => viewDetails(item)}
                              >
                                <div
                                  className="box-item p-0-search  border-rounded "
                                  style={{
                                    width: "285px",
                                    paddingRight: "5px",
                                    paddingLeft: "5px",
                                  }}
                                >
                                  <PImageComponent
                                    height={130}
                                    fullWidth
                                    type="testSeries"
                                    imageUrl={item.imageUrl}
                                    backgroundColor={item.colorCode}
                                    text={item.title}
                                    radius={9}
                                    fontSize={15}
                                  />
                                  <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
                                    <div
                                      className="info p-0 m-0"
                                      style={{ minHeight: 134 }}
                                    >
                                      <h4
                                        className="product_title"
                                        title={item.title}
                                      >
                                        {item.title}
                                      </h4>

                                      <p className="author-name">
                                        {multiString(item.user, true)}
                                      </p>
                                      <p className="subject_name_new">
                                        {multiString(item.subjects, "Subjects")}
                                      </p>
                                      {item.students && (
                                        <p>
                                          <span className="fas fa-user-friends"></span>{" "}
                                          {item.students}{" "}
                                          {item.students === 1
                                            ? "student"
                                            : "students"}
                                        </p>
                                      )}

                                      <p>{item.status}</p>

                                      {item.accessMode === "buy" && (
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice
                                            content={item}
                                            field="marketPlacePrice"
                                          />
                                        </div>
                                      )}
                                      {item.accessMode === "invitation" && (
                                        <div className="selling-price-info_new d-flex">
                                          <span>
                                            <strong>Private</strong>
                                          </span>
                                        </div>
                                      )}
                                      {item.accessMode === "public" && (
                                        <div className="selling-price-info_new d-flex">
                                          <span>
                                            <strong>Free</strong>
                                          </span>
                                        </div>
                                      )}

                                      <div className="d-flex">
                                        {(item.user?._id === user._id ||
                                          user.role === "admin" ||
                                          checkOwner(item)) && (
                                            <button
                                              className="btn btn-outline btn-sm mr-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                edit(item);
                                              }}
                                            >
                                              Edit
                                            </button>
                                          )}
                                        {item.status === "draft" &&
                                          checkOwner(item) && (
                                            <button
                                              className="btn btn-success btn-sm text-white"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                publish(item);
                                              }}
                                            >
                                              Publish
                                            </button>
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
                      {totalItems > foundTestseries.length &&
                        foundTestseries.length > 0 &&
                        totalItems > searchParams.limit && (
                          <div className="text-center">
                            <button
                              className="btn btn-light"
                              onClick={loadMoreSearchResult}
                            >
                              Load more
                            </button>
                          </div>
                        )}

                      {!isSearching && foundTestseries.length === 0 && (
                        <div className="course-search-empty text-center empty-data">
                          <figure className="mx-auto">
                            <img
                              className="img-fluid d-block mx-auto mb-4"
                              src="/assets/images/Search-rafiki.png"
                              alt=""
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
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="main-area course mx-auto mw-100">
              <div className="container course-home">
                {user.role != "support" &&
                  user.role != "mentor" &&
                  (!user.primaryInstitute ||
                    user.primaryInstitute.preferences?.testSeries
                      .allowToCreate) && (
                    <div className="box-area box-area_new d-flex justify-content-end">
                      <div className="ml-auto">
                        <a
                          className="btn btn-primary"
                          onClick={() => openCreateSeriesModal()}
                        >
                          Create Test Series
                        </a>
                      </div>
                    </div>
                  )}

                {marketplaceSeries?.length > 0 && (
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
                        <div
                          className="box-area-wrap box-area-wrap_new"
                          style={{ width: "235px" }}
                        >
                          <CustomCarousel
                            items={marketplaceSeries.map((item, index) => (
                              <div
                                key={index}
                                className="box-item p-0 P-0"
                                style={{ width: "235px" }}
                              >
                                <div
                                  className="box box_new bg-white pt-0"
                                  style={{ width: "235px" }}
                                >
                                  <div
                                    className="image-wrap cursor-pointer"
                                    onClick={() => viewMarketplaceSeries(item)}
                                  >
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
                                    <FavoriteButton
                                      item={item}
                                      type={`testseries`}
                                      changed={onFavoriteChanged}
                                    />
                                  </div>

                                  <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                                    <div className="info pubCourseS1 p-0 m-0">
                                      <h4
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title={item.title}
                                        className="cursor-pointer"
                                        onClick={() =>
                                          viewMarketplaceSeries(item)
                                        }
                                      >
                                        {item.title}
                                      </h4>
                                      <AppSubjects subjects={item.subjects} />

                                      <div className="author-name">
                                        <p>
                                          <span>
                                            {(
                                              item.brandName ||
                                              item.userName ||
                                              item.user.name
                                            ).toUpperCase()}
                                          </span>
                                        </p>
                                      </div>

                                      {item.accessMode === "buy" && (
                                        <div
                                          className="selling-price-info selling-price-info_new d-flex"
                                          style={{ minHeight: "29px" }}
                                        >
                                          <ItemPrice
                                            content={item}
                                            field="marketPlacePrice"
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <div className="d-flex justify-items-between bg-white gap-xs">
                                      <div className="flex-grow-1 flex-basic-0">
                                        <button
                                          className="btn btn-buy btn-sm btn-block"
                                          onClick={() =>
                                            viewMarketplaceSeries(item)
                                          }
                                        >
                                          View Details
                                        </button>
                                      </div>
                                      {!item.enrolled && !item.addedToCart && (
                                        <div className="flex-grow-1 flex-basic-0">
                                          <button
                                            className="btn btn-outline btn-sm btn-block"
                                            onClick={() =>
                                              addToCart(item, index)
                                            }
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
                {favorites ? (
                  <>
                    {favorites.length > 0 && (
                      <div className="box-area box-area_new home-all mb-2">
                        <div className="card-common products_slider">
                          <div className="card-header-common">
                            <div className="row align-items-center">
                              <div className="col">
                                <div className="section_heading_wrapper">
                                  <h1 className="section_top_heading">
                                    Favorite Test Series
                                  </h1>
                                  <p className="section_sub_heading">
                                    Quickly organize and find test series of
                                    your interest. You can add or remove by
                                    clicking the Heart icon.
                                  </p>
                                </div>
                              </div>

                              {favorites.length > 10 && (
                                <div className="col-auto ml-auto">
                                  <div>
                                    <Link
                                      className="btn btn-outline btn-sm"
                                      href={`/testSeries/viewall/favorite`}
                                    >
                                      View All
                                    </Link>
                                  </div>
                                  <div className="arrow ml-auto">
                                    <Link href={`/testSeries/viewall/favorite`}>
                                      <i className="fas fa-arrow-right"></i>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="card-body-common">
                            <div
                              className="box-area-wrap box-area-wrap_new clearfix mx-0"
                              style={{ width: "235px" }}
                            >
                              <CustomCarousel
                                items={favorites.map((item, index) => (
                                  <div
                                    key={item._id}
                                    className="slider"
                                    style={{ width: "235px" }}
                                  >
                                    {item.status === "draft" ? (
                                      <div
                                        className="box-item p-0"
                                        style={{ width: "235px" }}
                                      >
                                        <div
                                          className="box box_new bg-white pt-0"
                                          style={{ width: "235px" }}
                                        >
                                          <div
                                            className="image-wrap cursor-pointer"
                                            onClick={() => viewDetails(item)}
                                          >
                                            <PImageComponent
                                              height={118}
                                              fullWidth
                                              type="testSeries"
                                              imageUrl={item.imageUrl}
                                              backgroundColor={item.colorCode}
                                              text={item.title}
                                              radius={9}
                                              fontSize={15}
                                            />
                                            <FavoriteButton
                                              item={item}
                                              type={`testseries`}
                                              changed={onFavoriteChanged}
                                            />
                                          </div>
                                          <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                                            <div className="info pubCourseS1 p-0 m-0">
                                              <h4
                                                className="cursor-pointer"
                                                onClick={() =>
                                                  viewDetails(item)
                                                }
                                                title={item.title}
                                              >
                                                {item.title}
                                              </h4>
                                              <div className="subject-name">
                                                <AppSubjects
                                                  subjects={item.subjects}
                                                />
                                              </div>
                                              <div className="form-row small cardFontAll-imp">
                                                <div className="col-6 student-time">
                                                  <div className="d-flex align-items-center">
                                                    <span className="material-icons course">
                                                      people
                                                    </span>
                                                    <span className="icon-text">
                                                      {item.students}
                                                    </span>
                                                    <span className="icon-text">
                                                      {item.students === 1
                                                        ? "student"
                                                        : "students"}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="col-6">
                                                  <div className="d-flex align-items-center">
                                                    <span className="material-icons course">
                                                      timelapse
                                                    </span>
                                                    <span className="icon-text">
                                                      {item.totalTests}
                                                    </span>
                                                    <span className="icon-text">
                                                      Assessments
                                                    </span>
                                                  </div>
                                                </div>
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
                                              {item.accessMode !== "buy" && (
                                                <div className="border-0 mt-1 box-inner_tag">
                                                  <div className="d-flex align-items-center">
                                                    <span className="material-icons">
                                                      {item.accessMode ===
                                                        "public"
                                                        ? "lock_open"
                                                        : "lock"}
                                                    </span>
                                                    <span className="stud2 ml-1">
                                                      <strong>
                                                        {item.accessMode ===
                                                          "public"
                                                          ? "PUBLIC"
                                                          : "PRIVATE"}
                                                      </strong>
                                                    </span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <a
                                            className="btn btn-buy btn-block btn-sm round-bottom"
                                            onClick={() => viewDetails(item)}
                                          >
                                            View Details
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="box-item p-0"
                                        style={{ width: "235px" }}
                                      >
                                        <div
                                          className="box box_new bg-white pt-0"
                                          style={{ width: "235px" }}
                                        >
                                          <div
                                            className="image-wrap cursor-pointer"
                                            onClick={() => viewDetails(item)}
                                          >
                                            <PImageComponent
                                              height={118}
                                              fullWidth
                                              type="testSeries"
                                              imageUrl={item.imageUrl}
                                              backgroundColor={item.colorCode}
                                              text={item.title}
                                              radius={9}
                                              fontSize={15}
                                            />
                                            <FavoriteButton
                                              item={item}
                                              type={`testseries`}
                                              changed={onFavoriteChanged}
                                            />
                                          </div>
                                          <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                                            <div className="info pubCourseS1 p-0 m-0">
                                              <h4
                                                className="cursor-pointer"
                                                onClick={() =>
                                                  viewDetails(item)
                                                }
                                                title={item.title}
                                              >
                                                {item.title}
                                              </h4>
                                              <div className="subject-name">
                                                <AppSubjects
                                                  subjects={item.subjects}
                                                />
                                              </div>
                                              <div className="form-row small cardFontAll-imp">
                                                <div className="col-6 student-time">
                                                  <div className="d-flex align-items-center">
                                                    <span className="material-icons course">
                                                      people
                                                    </span>
                                                    <span className="icon-text">
                                                      {item.students}
                                                    </span>
                                                    <span className="icon-text">
                                                      {item.students === 1
                                                        ? "student"
                                                        : "students"}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="col-6">
                                                  <div className="d-flex align-items-center">
                                                    <span className="material-icons course">
                                                      timelapse
                                                    </span>
                                                    <span className="icon-text">
                                                      {item.totalTests}
                                                    </span>
                                                    <span className="icon-text">
                                                      Assessments
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              {item.accessMode === "buy" && (
                                                <div
                                                  className="selling-price-info selling-price-info_new d-flex"
                                                  style={{ minHeight: 29 }}
                                                >
                                                  {" "}
                                                  <ItemPrice
                                                    content={item}
                                                    field="marketPlacePrice"
                                                  />
                                                </div>
                                              )}
                                              {item.accessMode !== "buy" && (
                                                <div className="border-0 mt-1 box-inner_tag">
                                                  <div className="d-flex align-items-center">
                                                    <span className="material-icons">
                                                      {item.accessMode ===
                                                        "public"
                                                        ? "lock_open"
                                                        : "lock"}
                                                    </span>
                                                    <span className="stud2 ml-1">
                                                      <strong>
                                                        {item.accessMode ===
                                                          "public"
                                                          ? "PUBLIC"
                                                          : "PRIVATE"}
                                                      </strong>
                                                    </span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <a
                                            className="btn btn-buy btn-block btn-sm round-bottom"
                                            onClick={() => viewDetails(item)}
                                          >
                                            View Details
                                          </a>
                                        </div>
                                      </div>
                                    )}
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
                {initialized.recent ? (
                  <div className="box-area box-area_new">
                    {recentSeries.length > 0 && (
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h2 className="section_top_heading">
                                  Recently Added Test Series
                                </h2>
                                <p className="section_sub_heading">
                                  These test series are recently added to your
                                  institute.
                                </p>
                              </div>
                            </div>
                            {recentSeries.length > 10 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href={`/testSeries/viewall/recent`}
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href={`/testSeries/viewall/recent`}>
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common">
                          <div
                            className="box-area-wrap box-area-wrap_new mx-0"
                            style={{ width: "235px" }}
                          >
                            <CustomCarousel
                              items={recentSeries.map((item, index) => (
                                <div
                                  key={item._id}
                                  className="box-item p-0"
                                  style={{ width: "235px" }}
                                >
                                  <div
                                    className="box box_new bg-white pt-0"
                                    style={{ width: "235px" }}
                                  >
                                    <div
                                      className="image-wrap cursor-pointer"
                                      onClick={() => viewDetails(item)}
                                    >
                                      <PImageComponent
                                        height={118}
                                        fullWidth
                                        type="testSeries"
                                        imageUrl={item.imageUrl}
                                        backgroundColor={item.colorCode}
                                        text={item.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                      <FavoriteButton
                                        item={item}
                                        type="testseries"
                                        changed={onFavoriteChanged}
                                      />
                                    </div>
                                    <div className="box-inner box-inner_new has-shadow cardFontAll-imp1">
                                      <div className="info pubCourseS1 p-0 m-0">
                                        <h4
                                          title={item.title}
                                          className="cursor-pointer"
                                          onClick={() => viewDetails(item)}
                                        >
                                          {item.title}
                                        </h4>
                                        <div className="subject-name">
                                          <AppSubjects
                                            subjects={item.subjects}
                                          />
                                        </div>
                                        <div className="form-row small cardFontAll-imp">
                                          <div className="col-6 student-time">
                                            <div className="d-flex align-items-center">
                                              <span className="material-icons course">
                                                people
                                              </span>
                                              <span className="icon-text">
                                                {item.students}
                                              </span>
                                              <span className="icon-text">
                                                {item.students === 1
                                                  ? "student"
                                                  : "students"}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="col-6">
                                            <div className="d-flex align-items-center">
                                              <span className="material-icons course">
                                                timelapse
                                              </span>
                                              <span className="icon-text">
                                                {item.totalTests}
                                              </span>
                                              <span className="icon-text">
                                                Assessments
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {item.accessMode === "buy" && (
                                          <div
                                            className="selling-price-info selling-price-info_new d-flex"
                                            style={{ minHeight: "29px" }}
                                          >
                                            <ItemPrice
                                              content={item}
                                              field="marketPlacePrice"
                                            />
                                          </div>
                                        )}
                                        {item.accessMode !== "buy" && (
                                          <div className="border-0 mt-1 box-inner_tag">
                                            <div className="d-flex align-items-center">
                                              {item.accessMode ===
                                                "invitation" ||
                                                item.accessMode === "buy" ? (
                                                <span className="material-icons">
                                                  lock
                                                </span>
                                              ) : (
                                                <span className="material-icons">
                                                  lock_open
                                                </span>
                                              )}
                                              <span className="stud2 ml-1">
                                                <strong>
                                                  {item.accessMode === "public"
                                                    ? "PUBLIC"
                                                    : "PRIVATE"}
                                                </strong>
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      className="btn btn-buy btn-block btn-sm round-bottom"
                                      onClick={() => viewDetails(item)}
                                    >
                                      View Details
                                    </button>
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
                  // <div className="mb-3">
                  //   <SkeletonLoaderComponent Cwidth="30" Cheight="40" />
                  //   <div className="mt-2">
                  //     <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  //   </div>
                  // </div>
                  <></>
                )}
                {initialized.mine ? (
                  <div className="box-area box-area_new">
                    {mySeries.length > 0 && (
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h2 className="section_top_heading">
                                  My Test Series
                                </h2>
                                <p className="section_sub_heading">
                                  These test series are published/active and in
                                  use by students.
                                </p>
                              </div>
                            </div>
                            {mySeries.length > 10 && (
                              <div className="col-auto ml-auto">
                                <div>
                                  <Link
                                    className="btn btn-outline btn-sm"
                                    href={`/testSeries/viewall/my-series`}
                                  >
                                    View All
                                  </Link>
                                </div>
                                <div className="arrow ml-auto">
                                  <Link href={`/testSeries/viewall/my-series`}>
                                    <i className="fas fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-common">
                          <div
                            className="box-area-wrap box-area-wrap_new mx-0"
                            style={{ width: "235px" }}
                          >
                            <CustomCarousel
                              items={mySeries.map((item, index) => (
                                <div
                                  key={item._id}
                                  className="box-item p-0"
                                  style={{ width: "235px" }}
                                >
                                  <div
                                    className="box box_new bg-white pt-0"
                                    style={{ width: "235px" }}
                                  >
                                    <div
                                      className="image-wrap cursor-pointer"
                                      onClick={() => viewDetails(item)}
                                    >
                                      <PImageComponent
                                        height={118}
                                        fullWidth
                                        type="testSeries"
                                        imageUrl={item.imageUrl}
                                        backgroundColor={item.colorCode}
                                        text={item.title}
                                        radius={9}
                                        fontSize={15}
                                      />
                                      <FavoriteButton
                                        item={item}
                                        type="testseries"
                                        changed={onFavoriteChanged}
                                      />
                                    </div>
                                    <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                                      <div className="info pubCourseS1 p-0 m-0">
                                        <h4
                                          title={item.title}
                                          className="cursor-pointer"
                                          onClick={() => viewDetails(item)}
                                        >
                                          {item.title}
                                        </h4>
                                        <div className="subject-name">
                                          <AppSubjects
                                            subjects={item.subjects}
                                          />
                                        </div>
                                        <div className="form-row small cardFontAll-imp">
                                          <div className="col-6 student-time">
                                            <div className="d-flex align-items-center">
                                              <span className="material-icons course">
                                                people
                                              </span>
                                              <span className="icon-text">
                                                {item.students}
                                              </span>
                                              <span className="icon-text">
                                                {item.students === 1
                                                  ? "student"
                                                  : "students"}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="col-6">
                                            <div className="d-flex align-items-center">
                                              <span className="material-icons course">
                                                timelapse
                                              </span>
                                              <span className="icon-text">
                                                {item.totalTests}
                                              </span>
                                              <span className="icon-text">
                                                Assessments
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {item.accessMode === "buy" && (
                                          <div
                                            className="selling-price-info selling-price-info_new d-flex"
                                            style={{ minHeight: "29px" }}
                                          >
                                            <ItemPrice
                                              content={item}
                                              field="marketPlacePrice"
                                            />
                                          </div>
                                        )}
                                        {item.accessMode !== "buy" && (
                                          <div className="border-0 mt-1 box-inner_tag">
                                            <div className="d-flex align-items-center">
                                              {item.accessMode ===
                                                "invitation" ||
                                                item.accessMode === "buy" ? (
                                                <span className="material-icons">
                                                  lock
                                                </span>
                                              ) : (
                                                <span className="material-icons">
                                                  lock_open
                                                </span>
                                              )}
                                              <span className="stud2 ml-1">
                                                <strong>
                                                  {item.accessMode === "public"
                                                    ? "PUBLIC"
                                                    : "PRIVATE"}
                                                </strong>
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="form-row">
                                        <div className="col">
                                          <button
                                            className="btn btn-buy btn-sm btn-block"
                                            onClick={() => viewDetails(item)}
                                          >
                                            {item.status === "draft"
                                              ? "Edit"
                                              : "View Details"}
                                          </button>
                                        </div>
                                        {item.status === "draft" && (
                                          <div className="col">
                                            <button
                                              className="btn btn-success btn-sm btn-block text-white"
                                              onClick={() => publish(item)}
                                            >
                                              Publish
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
                    )}
                  </div>
                ) : (
                  // <div className="mb-3">
                  //   <SkeletonLoaderComponent Cwidth="30" Cheight="40" />
                  //   <div className="mt-2">
                  //     <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  //   </div>
                  // </div>
                  <></>
                )}
                {initialized.archived ? (
                  <div className="box-area box-area_new">
                    {archivedSeries.length > 0 && (
                      <div className="card-common products_slider">
                        <div className="card-header-common">
                          <div className="row align-items-center">
                            <div className="col">
                              <div className="section_heading_wrapper">
                                <h3 className="section_top_heading">
                                  Archived Test Series
                                </h3>
                                <p className="section_sub_heading">
                                  These test series are no longer in use because
                                  they are withdrawn. However, you may still
                                  review historic attempts on assessments of
                                  this test series.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-body-common">
                          <div
                            className="box-area-wrap box-area-wrap_new clearfix mx-0"
                            style={{ width: "235px" }}
                          >
                            <CustomCarousel
                              items={archivedSeries.map((item, index) => (
                                <div
                                  key={item._id}
                                  className="box-item p-0"
                                  style={{ width: "235px" }}
                                >
                                  <div
                                    className="box box_new bg-white pt-0"
                                    style={{ width: "235px" }}
                                  >
                                    <div
                                      className="image-wrap cursor-pointer"
                                      onClick={() => viewDetails(item)}
                                    >
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
                                    </div>

                                    <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                                      <div className="info pubCourseS1 p-0 m-0">
                                        <h4
                                          title={item.title}
                                          className="cursor-pointer"
                                          onClick={() => viewDetails(item)}
                                        >
                                          {item.title}
                                        </h4>
                                        <div className="subject-name">
                                          <AppSubjects
                                            subjects={item.subjects}
                                          />
                                        </div>
                                      </div>

                                      <div className="form-row small cardFontAll-imp">
                                        <div className="col-6 student-time">
                                          <div className="d-flex align-items-center">
                                            <span className="material-icons course">
                                              people
                                            </span>
                                            <span className="icon-text">
                                              {item.students}
                                            </span>
                                            <span className="icon-text">
                                              {item.students === 1
                                                ? "student"
                                                : "students"}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="col-6">
                                          <div className="d-flex align-items-center">
                                            <span className="material-icons course">
                                              timelapse
                                            </span>
                                            <span className="icon-text">
                                              {item.totalTests}
                                            </span>
                                            <span className="icon-text">
                                              Assessments
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      className="btn btn-buy btn-block btn-sm round-bottom"
                                      onClick={() => viewDetails(item)}
                                    >
                                      View Details
                                    </button>
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
                  // <div className="mb-3">
                  //   <SkeletonLoaderComponent Cwidth="30" Cheight="40" />
                  //   <div className="mt-2">
                  //     <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  //   </div>
                  // </div>
                  <></>
                )}
                {sections.map((section, index) => (
                  <div key={index} className="ng-container">
                    {section.series && section.series.length > 0 && (
                      <div className="box-area box-area_new">
                        <div className="card-common products_slider">
                          <div className="card-header-common">
                            <div className="row align-items-center">
                              <div className="col">
                                <div className="section_heading_wrapper">
                                  <h2 className="section_top_heading">
                                    {section.title}
                                  </h2>
                                  <p className="section_sub_heading">
                                    {section.description}
                                  </p>
                                </div>
                              </div>
                              {section.series.length > 10 && (
                                <div className="col-auto ml-auto">
                                  <div>
                                    <Link
                                      className="btn btn-outline btn-sm"
                                      href={`/testSeries/viewall/tags?tags=${section.tags.join(
                                        ","
                                      )}&title=${section.title}`}
                                    >
                                      View All
                                    </Link>
                                  </div>
                                  <div className="arrow ml-auto">
                                    <Link
                                      href={`/testSeries/viewall/tags?tags=${section.tags.join(
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
                              className="box-area-wrap box-area-wrap_new mx-0"
                              style={{ width: "235px" }}
                            >
                              <CustomCarousel
                                items={section.series.map((item, i) => (
                                  <div
                                    key={item._id}
                                    className="box-item p-0"
                                    style={{ width: "235px" }}
                                  >
                                    <div
                                      className="box box_new bg-white pt-0"
                                      style={{ width: "235px" }}
                                    >
                                      <div
                                        className="image-wrap cursor-pointer"
                                        onClick={() => viewDetails(item)}
                                      >
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
                                        <FavoriteButton
                                          item={item}
                                          type={`testseries`}
                                          changed={onFavoriteChanged}
                                        />
                                      </div>
                                      <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                                        <div className="info pubCourseS1 p-0 m-0">
                                          <h4
                                            className="cursor-pointer"
                                            title={item.title}
                                            onClick={() => viewDetails(item)}
                                          >
                                            {item.title}
                                          </h4>
                                          <div className="subject-name">
                                            <AppSubjects
                                              subjects={item.subjects}
                                            />
                                          </div>
                                          <div className="form-row small cardFontAll-imp">
                                            <div className="col-6 student-time">
                                              <div className="d-flex align-items-center">
                                                <span className="material-icons course">
                                                  people
                                                </span>
                                                <span className="icon-text">
                                                  {item.students}
                                                </span>
                                                <span className="icon-text">
                                                  {item.students === 1
                                                    ? "student"
                                                    : "students"}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="col-6">
                                              <div className="d-flex align-items-center">
                                                <span className="material-icons course">
                                                  timelapse
                                                </span>
                                                <span className="icon-text">
                                                  {item.totalTests}
                                                </span>
                                                <span className="icon-text">
                                                  Assessments
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          {item.accessMode === "buy" && (
                                            <div
                                              className="selling-price-info selling-price-info_new d-flex"
                                              style={{ minHeight: "29px" }}
                                            >
                                              <ItemPrice
                                                content={item}
                                                field="marketPlacePrice"
                                              />
                                            </div>
                                          )}
                                          {item.accessMode !== "buy" && (
                                            <div className="border-0 mt-1  box-inner_tag">
                                              <div className="d-flex align-items-center">
                                                {item.accessMode ===
                                                  "invitation" ||
                                                  item.accessMode === "buy" ? (
                                                  <span className="material-icons">
                                                    lock
                                                  </span>
                                                ) : (
                                                  <span className="material-icons">
                                                    lock_open
                                                  </span>
                                                )}
                                                <span className="stud2 ml-1">
                                                  <strong>
                                                    {item.accessMode ===
                                                      "public"
                                                      ? "PUBLIC"
                                                      : "PRIVATE"}
                                                  </strong>
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <a
                                        className="btn btn-buy btn-block btn-sm round-bottom"
                                        onClick={() => viewDetails(item)}
                                      >
                                        View Details
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* {!hasData && (
        <div className="empty-data course-search-empty">
          <figure className="mx-auto">
            <img src="assets/images/Search-rafiki.png" alt="" />
          </figure>

          <h3 className="text-center">No test series found</h3>

          {user.role === "director" || user.role === "operator" ? (
            <p>
              We couldn&apos;t find any result. You can bring test series from{" "}
              <a href={`/${user.role}/market-place`}>
                <b>Marketplace</b>
              </a>{" "}
              or{" "}
              <a className="d-inline" onClick={() => openCreateSeriesModal()}>
                <b>Create new</b>
              </a>
              .
            </p>
          ) : (
            <p>
              Please contact your director or{" "}
              <a className="d-inline" onClick={() => openCreateSeriesModal()}>
                <b>create a new</b>
              </a>{" "}
              test series.
            </p>
          )}
        </div>
      )} */}
      <Modal
        show={show}
        onHide={cancelModal}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-content form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h6 className="form-box_title">Create Test Series</h6>
          </div>
          <div className="modal-body form-boxes">
            <div className="create-course-modal create-ClassModalMain">
              <div className="class-board-info">
                <div className="mx-auto">
                  <div className="form-group mb-0">
                    <h6 className="form-box_subtitle mb-0">Test Series Name</h6>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      required
                      min="2"
                      max="50"
                      className="form-control form-control-sm"
                      style={{ outline: 0, border: 0 }}
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        setNewSeriesParams((prev) => ({
                          ...prev,
                          title: updatedValue,
                        }));
                      }}
                    />
                    <hr style={{ marginTop: 1, marginBottom: 5 }} />
                  </div>
                  <div className="form-group mb-0">
                    <h6 className="form-box_subtitle mb-0">Summary</h6>
                    <input
                      type="text"
                      name="name"
                      placeholder="Test Series summary"
                      required
                      className="form-control form-control-sm"
                      style={{ outline: 0, border: 0 }}
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        setNewSeriesParams((prev) => ({
                          ...prev,
                          summary: updatedValue,
                        }));
                      }}
                    />
                    <hr style={{ marginTop: 1, marginBottom: 5 }} />
                  </div>
                  <div className="overflow-unset">
                    <div className="form-group mb-0">
                      <div>
                        <h6 className="form-box_subtitle mb-0">Subject name</h6>
                      </div>

                      <Multiselect
                        options={createSeriesSubjects}
                        selectedValues={selectedObj}
                        onSelect={(selected) => {
                          setSelectedObj(selected);
                          setNewSeriesParams((prev) => ({
                            ...prev,
                            subjects: selected,
                          }));
                        }}
                        onRemove={(removed) => setSelectedObj(removed)}
                        displayValue="name"
                        placeholder="Select subjects"
                        style={styleForMultiSelect}
                        closeIcon="cancel"
                        avoidHighlightFirstOption={true}
                        showArrow={true}
                        showCheckbox={true}
                      />
                      <hr style={{ marginTop: 1, marginBottom: 5 }} />
                    </div>
                  </div>
                  <div>
                    <h6 className="form-box_subtitle mb-0">
                      Upload Test Series Picture
                    </h6>
                    {imageReview && uploadedUrl ? (
                      <div className="standard-upload-box mt-2 bg-white">
                        <button
                          type="reset"
                          aria-label="remove uploaded image"
                          className="close btn p-0 mb-2"
                          onClick={() => {
                            setImageReview(false);
                          }}
                        >
                          <img
                            src="/assets/images/close.png"
                            alt="user_uploaded image"
                          />
                        </button>
                        <figure>
                          <img
                            src={uploadedUrl}
                            alt="actually uploaded image"
                            className="actual-uploaded-image"
                          />
                        </figure>
                      </div>
                    ) : (
                      <div className="standard-upload-box mt-2">
                        <FileDrop onDrop={(f: any) => dropped(f)}>
                          <h2 className="upload_icon mb-0">
                            <span className="material-icons">file_copy</span>
                          </h2>
                          <p className="pro-text-drug text-center d-block active text-primary">
                            {uploadFile?.name}
                          </p>
                          <span className="title">
                            Drag and Drop or{" "}
                            <a onClick={filePicker} className="text-primary">
                              {" "}
                              browse{" "}
                            </a>{" "}
                            your files
                            <br></br>
                            For optimal view, we recommend size 190px * 200px
                          </span>
                          {/* {uploading && (
                        <div className="info mx-auto mt-1 mb-2">
                          <p className="text-center text-dark">
                            Uploading(
                            <span style={{ color: "#8C89F9" }}>
                              {uploadProgress.progress.toFixed(0)}%
                            </span>{" "}
                            <i className="fa fa-spinner fa-pulse"></i>)
                          </p>
                        </div>
                      )} */}

                          <div className="d-flex justify-content-center gap-xs">
                            {!uploadFile?.name && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  filePicker();
                                }}
                              >
                                Browse
                              </button>
                            )}
                            {uploadFile?.name && (
                              <>
                                <button
                                  className="btn btn-danger btn-sm"
                                  type="button"
                                  onClick={() => {
                                    setUploadFile({ ...uploadFile, name: "" });
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm ml-2"
                                  type="button"
                                  onClick={fileUpload}
                                >
                                  Upload
                                  {uploading && (
                                    <i className="fa fa-spinner fa-pulse"></i>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                          <input
                            accept=""
                            value=""
                            style={{ display: "none", opacity: 0 }}
                            ref={fileBrowseRef}
                            type="file"
                            onChange={(e) => dropped(e.target.files)}
                          />
                        </FileDrop>
                      </div>
                    )}
                  </div>
                  <br />
                  <div className="text-right">
                    <a onClick={cancelModal} className="btn btn-light">
                      Cancel
                    </a>
                    <button
                      type="submit"
                      className="btn btn-primary ml-2"
                      disabled={
                        !newSeriesParams.title ||
                        !newSeriesParams.subjects.length
                      }
                      onClick={createTestseries}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TeacherTestSeriesHome;
