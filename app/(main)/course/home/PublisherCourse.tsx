"use client";

import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import clientApi, { apiVersion } from "@/lib/clientApi";
import * as courseService from "@/services/courseService";
import * as settingSvc from "@/services/settingService";
import * as subjectSvc from "@/services/subjectService";
import * as userSvc from "@/services/userService";
import * as favoriteSvc from "@/services/favaorite-service";
import * as shoppingCartService from "@/services/shopping-cart-service";
import { elipsisText, toQueryString } from "@/lib/validator";
import { useTakeTestStore } from "@/stores/take-test-store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import PImageComponent from "@/components/AppImage";
import { Form, Modal, Button } from "react-bootstrap";
import ItemPrice from "@/components/ItemPrice";
import Multiselect from "multiselect-react-dropdown";
import CustomCarousel from "@/components/assessment/carousel";
import RatingComponent from "@/components/rating";
import alertify from "alertifyjs";
import Link from "next/link";
import { FileUploader } from "react-drag-drop-files";
import { CourseDataEntry, SubjectEntry } from "@/interfaces/interface";
import { militoHour, numberToK } from "@/lib/pipe";
import FavoriteButton from "@/components/FavoriteButton";
import { FileDrop } from "react-file-drop";
import { uploadFile as uploaddFileFunc } from "@/lib/clientApi";

const styleForMultiSelect = {
  multiselectContainer: {},
  searchBox: {
    fontSize: "10px",
    minHeight: "50px",
  },
  inputField: {
    margin: 5,
  },
  option: {
    color: "black",
    height: 30,
    padding: "3px 5px",
    margin: 0,
    borderRadius: 5,
  },
  optionContainer: {
    display: "flex",
    flexDirection: "column",
  },
};

const fileTypes = ["JPEG", "PNG", "GIF", "JPG"];

const PublisherCourse = () => {
  const fileBrowseRef = useRef(null);

  const { push } = useRouter();
  const user: any = useSession()?.data?.user?.info || {};
  const { clientData, updateClientData, updateUserInfo } = useTakeTestStore();
  const [settings, setSettings] = useState<any>();
  const [isSeaching, setIsSearching] = useState<boolean>(false);
  const [numberStar, setnumberStar] = useState<number>(5);
  const [publishedCourses, setpublishedCourses] = useState<any>([]);
  const [archivedCourses, setarchivedCourses] = useState<[]>([]);
  const [draftCourses, setdraftCourses] = useState<[]>([]);
  const [bestSellers, setbestSellers] = useState<[]>();
  const [mostPopularCourses, setmostPopularCourses] = useState<[]>();
  const [highestPaidCourses, sethighestPaidCourses] = useState<[]>();
  const [topCategories, settopCategories] = useState<[]>([]);
  const [isDragging, setisDragging] = useState<boolean>(false);
  const [course, setcourse] = useState<CourseDataEntry | null>(null);
  const [userSubjects, setuserSubjects] = useState<any>();
  const [selected, setselected] = useState<any>("");
  const [showModal, setshowModal] = useState<any>(false);
  const [show, setShow] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [selectedObj, setSelectedObj] = useState("");
  const [createSeriesSubjects, setCreateSeriesSubjects] = useState<any>();
  const [file, setFile] = useState("");
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseSummary, setCourseSummary] = useState<string>("");
  const [fileUploadStatus, setFileUploadStatus] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [marketplaceCourses, setMarketplaceCourses] = useState<any>([]);
  const [myCourses, setMyCourses] = useState<any>([]);
  const [recentCourses, setRecentCourses] = useState<any>([]);
  const [favorites, setFavorites] = useState<any>([]);
  const [sections, setSections] = useState<any>([]);
  const [allLoadedSections, setAllLoadedSections] = useState<any>([]);
  const [searchedCourses, setSearchedCourses] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<any>(0);
  const [params, setParams] = useState<any>({
    limit: 8,
    page: 1,
  });
  const [activeSearchSubject, setActiveSearchSubject] = useState<any>();
  const [selectedTabSubject, setSelectedTabSubject] = useState<any>();
  const [courseBySubject, setCourseBySubject] = useState<any>({});
  const [selectedFilter, setSelectedFilter] = useState<any>({
    level: "Select a Level",
    duration: "Select a Duration",
    author: "Select an Author",
    price: "Select a price",
  });
  const [searchInit, setSearchInit] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState<any>("₹");
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [isPublsihed, setIsPublished] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [imageReview, setImageReview] = useState<boolean>(false);

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  useEffect(() => {
    clientApi.get(`/api/settings`).then((res) => {
      setSettings(res.data);
      courseService
        .getMyCourses({ ...params, type: "published" })
        .then((pC: any) => {
          setpublishedCourses(pC.courses);
          setAllLoadedSections([...allLoadedSections, ...pC.courses]);
          setHasData(publishedCourses.length > 0);
        })
        .catch((err) => {
          setpublishedCourses([]);
        });

      courseService
        .getMyCourses({ ...params, type: "draft" })
        .then((dC: any) => {
          setdraftCourses(dC.courses);
          setAllLoadedSections([...allLoadedSections, ...dC.courses]);

          setHasData(draftCourses?.length > 0);
        })
        .catch((err) => {
          setdraftCourses([]);
        });

      courseService
        .getMyArchivedCourses({ ...params })
        .then((aC: any) => {
          setarchivedCourses(aC);
          setHasData(archivedCourses.length > 0);
        })
        .catch((err) => {
          setarchivedCourses([]);
        });

      courseService
        .getBestSeller({ ...params })
        .then((bS: any) => {
          setbestSellers(bS.courses);
          setAllLoadedSections([...allLoadedSections, ...bS.courses]);
          setHasData(bestSellers.length > 0);
        })
        .catch((err) => {
          setbestSellers([]);
        });

      courseService
        .getMostPopularCourses({ ...params })
        .then((bS: any) => {
          setmostPopularCourses(bS);
          setAllLoadedSections([...allLoadedSections, ...bS]);

          setHasData(mostPopularCourses.length > 0);
        })
        .catch((err) => {
          setmostPopularCourses([]);
        });

      courseService
        .getHighestPaidCourses({ ...params })
        .then((hpc: any) => {
          sethighestPaidCourses(hpc);
          setAllLoadedSections([...allLoadedSections, ...hpc]);
          setHasData(highestPaidCourses.length > 0);
        })
        .catch((err) => {
          sethighestPaidCourses([]);
        });

      favoriteSvc
        .findCourses({
          page: 1,
          limit: 8,
          excludeUser: true,
          showClassrooms: true,
        })
        .then((res: any) => {
          setFavorites(res.courses);
          setHasData(favorites.length > 0);
        });
    });
  }, []);

  const reset = (ev: any) => {
    setSearchText("");
    setIsSearching(false);
  };
  const search = (ev: any) => {
    setIsSearching(!!searchText);
  };

  const viewDetails = (item: any, cat?: any) => {
    if (cat == "mostPopular" && user.role == "publisher") {
      push(`/course/view-course${item._id}`);
      return;
    }
    if (cat == "bestSeller" && user.role == "publisher") {
      push(`/course/view-course${item._id}`);

      return;
    }

    sessionStorage.removeItem("publisher_course_detail_current_page_" + item._id);
    push(`/course/details/${item._id}`);
  };

  const publish = (item: any) => {
    if (item._id) {
      alertify.confirm(
        "Are you sure you want to publish this Course?",
        (msg) => {
          if (
            (!item.hasOwnProperty("startDate") || !item.startDate) &&
            (!item.sections || item.sections.length == 0)
          ) {
            alertify.alert(
              "Message",
              "Add Start Date and Sections, then only you can able to publish this test !"
            );
            return;
          }
          if (!item.hasOwnProperty("startDate") || !item.startDate) {
            alertify.alert("Message", "Add Start Date first");
            return;
          }
          if (!item.sections || item.sections.length == 0) {
            alertify.alert(
              "Message",
              "Please add sections in course curriculum before publishing the course"
            );
            return;
          }
          if (item.accessMode === "buy" && !item.countries.length) {
            alertify.alert(
              "Message",
              "Please set at least one currency before publishing it"
            );
            return;
          }

          if (
            item.accessMode === "invitation" &&
            item.locations &&
            item.locations.length == 0
          ) {
            alertify.alert("Message", "Please add institute also");
            return;
          }

          if (
            user.role != "publisher" &&
            item.accessMode === "invitation" &&
            item.classrooms &&
            item.classrooms.length == 0
          ) {
            alertify.alert(
              "Message",
              "Please add the classroom before publishing"
            );
            return;
          }

          const copy = { ...item };
          const lastData = copy;
          lastData.status = "published";
          lastData.statusChangedAt = new Date().getTime();

          courseService
            .update(item._id, lastData)
            .then((res: any) => {
              if (res.err) {
                alertify.error("Your changes could not be saved.");
              }
              item.status = "published";
              item.statusChangedAt = new Date().getTime();
              const draft = draftCourses.filter((c) => c._id != item._id);
              const publish = publishedCourses;
              setdraftCourses(draft);
              setpublishedCourses(publish);

              alertify.success("Course published successfully.");
            })
            .catch((err) => {
              if (err.error) {
                const errors = err.error.errors;
                let msg = "";
                if (errors) {
                  for (const prop in errors) {
                    console.log(errors[prop]);
                    msg = errors[prop].message;
                  }
                } else if (err.error.message) {
                  msg = err.error.message;
                }
                alertify.alert("Message", msg);
              } else {
                console.log(err);
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

  const fileUpload = async () => {
    const formData: FormData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    //   formData.append('uploadType', this.uploadType)
    try {
      setUploading(true);
      const res = await uploaddFileFunc(uploadFile, uploadFile.name, "file");
      setFile(res.data.fileUrl);
      setUploading(false);
      setImageReview(true);
      setUploadedUrl(res.data.fileUrl);
      setUploading(false);
      // setImageReview(true);
    } catch (err) {
      alert("message", err);
    }
  };

  const withdraw = (item: any) => {
    if (item._id) {
      alertify.confirm(
        "Are you sure you want to withdraw this course? You will not be able to change or re-publish once withdrawn.",
        (ev) => {
          item.status = "revoked";
          courseService
            .update(item._id, { status: "revoked" })
            .then((res) => {
              const best = bestSellers.filter((c) => c._id != item._id);
              setbestSellers(best);
              const publised = publishedCourses.filter(
                (c) => c._id != item._id
              );
              setpublishedCourses(publised);
              const achived = archivedCourses.unshift(item);
              setarchivedCourses(achived);

              alertify.success("Course withdrawn successfully..");
            })
            .catch((err) => {
              console.log(res);
              if (res.error) {
                const errors = res.error.errors;
                let msg = "Failed to withdraw course.";
                if (errors) {
                  for (const prop in errors) {
                    msg += errors[prop].message + " ";
                  }
                } else if (res.error.message) {
                  msg = res.error.message;
                }
                alertify.alert("Message", msg);
              } else {
                console.log(res);
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

  const deleteFunc = (item: any) => {
    alertify.confirm("Are you sure, you want to delete this course?", (ev) => {
      courseService
        .Delete(item._id)
        .then((res) => {
          setdraftCourses(draftCourses.filter((c) => c._id != item._id));
          setarchivedCourses(archivedCourses.unshift(item));

          alertify.success("Course is deleted successfully.");
        })
        .catch((err) => {
          if (err.error) {
            const errors = err.error.errors;
            let msg = "";
            for (const prop in errors) {
              console.log(errors[prop]);
              msg = errors[prop].message;
            }
            alertify.alert("Message", msg);
          } else {
            console.log(err);
            alertify.alert(
              "Message",
              "You are not allowed to delete this course. Only Director and creator of this course can delete it."
            );
          }
        });
    });
  };

  const uploadModal = (template: any) => {
    setshowModal(true);
  };

  const save = (form) => {
    if (!user.email) {
      alertify.alert("Message", "Please add your mail before create a course");
      return;
    }
    if (!selected || !selected.length) {
      alertify.alert("Message", "Add Subject");
      return;
    }
    const updatedCourse = course;
    setcourse({
      ...course,
      subjects: selected,
    });
    updatedCourse.subjects = selected;
    courseService
      .create(updatedCourse)
      .then((da: any) => {
        cancel();
        viewDetails(da);
      })
      .catch((err) => {
        if (err.error && err.error.length) {
          alertify.alert("Message", err.error[0].msg);
          return;
        }
        console.log(err);
        alertify.alert(
          "Message",
          "Something went wrong. Please check browser console for more details."
        );
      });
  };

  const cancel = () => {
    setselected("");
    setcourse({
      ...course,
      title: "",
      summary: "",
      imageUrl: "",
    });
    setshowModal(false);
  };

  const checkOwner = (item: any) => {
    if (
      (user.role != "publisher" && user.role != "mentor") ||
      item.user._id == user._id
    ) {
      return true;
    }
    let val = false;
    if (item.instructors && item.instructors.length) {
      const index = item.instructors.findIndex((e) => e._id == user._id);
      if (index > -1) {
        val = true;
      }
    }
    return val;
  };

  const createCourseWithAI = () => {
    if (!user.email) {
      alertify.alert("Message", "Please add your mail before create a course");
      return;
    }
    if (!selected || !selected.length) {
      alertify.alert("Message", "Add Subject");
      return;
    }
    const updatedC = course;
    setcourse({
      ...course,
      subjects: selected,
    });
    course.subjects = selected;
    setProcessing(true);
    courseService
      .aiGenerate(course)
      .then((da: any) => {
        cancel();
        viewDetails(da);
        setProcessing(false);
      })
      .catch((err) => {
        if (err.error?.message) {
          alertify.alert("Message", err.error.message);
        } else {
          alertify.alert("Message", "Fail to generate course.");
        }
        setProcessing(false);
      });
  };

  const onFavoriteChanged = (ev: any) => {
    if (!ev.favorite) {
      const idx = favorites.findIndex((f) => f._id == ev._id);
      if (idx > -1) {
        const fav = favorites.splice(idx, 1);
        setFavorites(fav);
      }
    } else {
      favoriteSvc
        .findCourses({
          page: 1,
          limit: 8,
          excludeUser: true,
          showClassrooms: true,
        })
        .then((res: any) => {
          setFavorites(res.courses);
        });
    }
    const all = allLoadedSections;
    for (const course of all) {
      if (course._id == ev._id) {
        course.isFavorite = ev.favorite;
      }
    }
    setAllLoadedSections(all);
  };

  const onSearch = async (e: any) => {
    setSearchText(e.target.value);
    setIsSearching(!!e.target.value);
    setSearchedCourses([]);
    if (!!e.target.value) {
      let param = { ...params, keywords: e.target.value };
      setParams(param);
      try {
        const { data } = await clientApi.get(
          `/api/course${toQueryString({ ...param, count: true })}`
        );
        setSearchedCourses(data.courses);
        setTotalItems(data.total);
        setSearchInit(false);
      } catch (error) {
        setSearchedCourses([]);
        setTotalItems(0);
        setSearchInit(false);
      }
    }
  };

  const DraftItem = (item: any) => {
    item = item.item;
    return (
      <div className="box-item p-0" style={{ width: "255px" }}>
        <div className="box box_new bg-white pt-0" style={{ width: "255px" }}>
          <div
            className="image-wrap cursor-pointer"
            onClick={() => viewDetails(item)}
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
            <FavoriteButton
              item={item}
              type="course"
              changed={onFavoriteChanged}
            />
          </div>
          <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
            <div className="info p-0 m-0">
              {item.accessMode === "buy" && (
                <div
                  className="selling-price-info selling-price-info_new d-flex"
                  style={{ minHeight: "29px" }}
                >
                  <ItemPrice content={item} field="marketPlacePrice" />
                </div>
              )}
              {item.accessMode !== "buy" && (
                <div className="border-0 mt-1 box-inner_tag">
                  <div className="d-flex align-items-center">
                    {(item.accessMode === "invitation" ||
                      item.accessMode === "buy") && (
                        <span className="material-icons">lock</span>
                      )}
                    {item.accessMode === "public" && (
                      <span className="material-icons">lock_open</span>
                    )}
                    <span className="stud2 ml-1">
                      <strong>
                        {(item.accessMode === "invitation" ||
                          item.accessMode === "buy") &&
                          "PRIVATE"}
                        {item.accessMode === "public" && "PUBLIC"}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
              <h4
                data-toggle="tooltip"
                data-placement="top"
                title={item.title}
                className="cursor-pointer"
                onClick={() => viewDetails(item)}
              >
                {item.title}
              </h4>
              <div className="subject-name">
                {item.subjects && item.subjects.length > 0 && (
                  <p className="mb-1">
                    {item.subjects[0].name}
                    {item.subjects.length > 1 && (
                      <span className="mb-1">
                        {" "}
                        + {item.subjects.length - 1} more{" "}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="form-row mt-4">
              <div className="col">
                <a
                  className="btn btn-outline btn-sm d-block p-2"
                  onClick={() => viewDetails(item)}
                >
                  Edit
                </a>
              </div>
              {checkOwner(item) && (
                <div className="col">
                  <a
                    className="text-center btn btn-success btn-sm d-block p-2"
                    onClick={() => publish(item)}
                  >
                    Publish
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PublishedItem = (item: any) => {
    return (
      <div className="box-item p-0" style={{ width: "255px" }}>
        <div className="box box_new bg-white pt-0" style={{ width: "255px" }}>
          <div
            className="image-wrap cursor-pointer"
            onClick={() => viewDetails(item.item)}
          >
            <PImageComponent
              height={141}
              fullWidth
              type="course"
              imageUrl={item.item.imageUrl}
              backgroundColor={item.item.colorCode}
              text={item.item.title}
              radius={9}
              fontSize={15}
            />
            <FavoriteButton
              item={item.item}
              type="course"
              changed={onFavoriteChanged}
            />
          </div>

          <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
            <div className="info pubCourseS p-0 m-0">
              {item.item.accessMode === "buy" && (
                <div
                  className="selling-price-info selling-price-info_new d-flex"
                  style={{ minHeight: "29px" }}
                >
                  <ItemPrice content={item.item} field="marketPlacePrice" />
                </div>
              )}

              {item.item.accessMode !== "buy" && (
                <div className="border-0 mt-1 box-inner_tag">
                  <div className="d-flex align-items-center">
                    {item.item.accessMode === "invitation" ||
                      item.item.accessMode === "buy" ? (
                      <span className="material-icons">lock</span>
                    ) : (
                      <span className="material-icons">lock_open</span>
                    )}
                    <span className="stud2 ml-1">
                      <strong>
                        {item.item.accessMode === "invitation" ||
                          item.item.accessMode === "buy"
                          ? "PRIVATE"
                          : "PUBLIC"}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              <h4
                data-toggle="tooltip"
                data-placement="top"
                title={item.title}
                // onClick={() => edit(item)}
                className="cursor-pointer"
              >
                {item.item.title}
              </h4>

              <div className="subject-name">
                {item.item.subjects && item.item.subjects.length > 0 && (
                  <p className="mb-1">
                    {item.item.subjects[0].name}
                    {item.item.subjects.length > 1 && (
                      <span className="mb-1">
                        {" "}
                        + {item.item.subjects.length - 1} more{" "}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="row cardFontAll-imp3">
                <div className="col-6 pl-2 student-time">
                  <div className="row">
                    <span className="material-icons course">people</span>
                    <span className="icon-text"> {item.item.students}</span>
                    <span className="icon-text">
                      {item.item.students === 1 ? "student" : "students"}
                    </span>
                  </div>
                </div>

                <div className="col-6 pr-2">
                  <div className="row">
                    <span className="material-icons course">timelapse</span>
                    <span className="icon-text">
                      {" "}
                      {numberToK(militoHour(item.item.timeSpent, true)) >= 0
                        ? numberToK(militoHour(item.item.timeSpent, true))
                        : 0}
                    </span>
                    <span className="icon-text">hrs spent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row mt-2">
              <div className="col-6">
                <Link
                  className="btn btn-outline btn-sm d-block p-2"
                  href={`/course/view-mode/${item.item._id}`}
                >
                  Teach
                </Link>
              </div>

              <div className="col-6">
                <a
                  className="btn btn-buy btn-sm d-block p-2"
                  onClick={() => viewDetails(item.item)}
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ListLoading = () => (
    <div className="mb-3">
      <SkeletonLoaderComponent Cwidth="30" Cheight="40" />

      <div className="mt-2">
        <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
      </div>
    </div>
  );

  return (
    <>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto">
            <div className="banner-info mx-auto">
              <h1 className="banner_title">What do you want to publish today?</h1>
              <form>
                <div className="form-group mb-0">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for courses"
                    value={searchText}
                    onChange={(e) => onSearch(e)}
                  />
                  <span>
                    <figure className="img-search">
                      <img src="/assets/images/search-icon-2.png" alt="" />
                    </figure>
                  </span>
                  {isSeaching && (
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
      {!isSeaching && (
        <main className="extraCustom-cs_new course_home_wrap">
          <div className="main-area next mx-auto mw-100">
            <div className="container course-home">
              <div className="box-area box-area_new home-all mb-2">
                {user.role != "support" &&
                  user.role != "mentor" &&
                  (!user.primaryInstitute ||
                    user.primaryInstitute.preferences?.course
                      .allowToCreate) && (
                    <div className="row mb-3">
                      <div className="col-auto ml-auto">
                        <button
                          className="btn btn-primary"
                          onClick={() => uploadModal("createCourseTemplate")}
                        >
                          Create Course
                        </button>
                      </div>
                    </div>
                  )}
              </div>

              {favorites ? (
                <div className="box-area box-area_new home-all mb-2">
                  {favorites.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">
                                Favorite Courses
                              </h1>
                              <p className="section_sub_heading">
                                Quickly organize and find courses of your
                                interest. You can add or remove by opening a
                                course and clicking Heart icon next to the name.
                              </p>
                            </div>
                          </div>
                          {favorites.length > 5 && (
                            <div className="col-auto ml-auto">
                              <div className="view-all ml-auto">
                                <Link
                                  href={`/course/view-all/favorite`}
                                  className="btn btn-outline btn-sm"
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto p-0">
                                <Link href={`/course/view-all/favorite`}>
                                  <i className="fas fa-arrow-right"></i>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="box-area-wrap box-area-wrap_new clearfix mx-0">
                          <CustomCarousel
                            items={favorites.map((item, index) => (
                              <div
                                className="item"
                                key={index}
                                style={{ width: "255px" }}
                              >
                                {item.status === "draft" ? (
                                  <DraftItem item={item} />
                                ) : (
                                  <PublishedItem item={item} />
                                )}
                              </div>
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ListLoading />
              )}

              {publishedCourses ? (
                <div className="box-area box-area_new home-all mb-2">
                  {publishedCourses.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">
                                Published Courses
                              </h1>
                              <p className="section_sub_heading">
                                Explore our &apos;Published Courses&apos; section to
                                access your live courses. Engage in real-time
                                learning experiences tailored to your needs.
                              </p>
                            </div>
                          </div>
                          {publishedCourses.length > 5 && (
                            <div className="col-auto ml-auto">
                              <div className="view-all ml-auto">
                                <Link
                                  href={`/course/view-all/published`}
                                  className="btn btn-outline btn-sm"
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto p-0">
                                <Link href={`/course/view-all/published`}>
                                  <i className="fas fa-arrow-right"></i>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="box-area-wrap box-area-wrap_new clearfix mx-0">
                          <CustomCarousel
                            items={publishedCourses.map((item) => (
                              <div
                                key={item._id}
                                className="slider"
                                style={{ width: 255 }}
                              >
                                <PublishedItem item={item} />
                              </div>
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ListLoading />
              )}
              {draftCourses ? (
                <div className="box-area box-area_new home-all mb-2">
                  {draftCourses.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                Draft Courses
                              </h3>
                              <p className="section_sub_heading">
                                Access your partially created courses with Draft
                                Courses. Easily revisit and complete your
                                work-in-progress courses.
                              </p>
                            </div>
                          </div>
                          {draftCourses.length > 5 && (
                            <div className="col-auto ml-auto">
                              <div className="view-all ml-auto">
                                <Link
                                  href={`/course/view-all/draft`}
                                  className="btn btn-outline btn-sm"
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto">
                                <Link href={`/course/view-all/draft`}>
                                  <i className="fas fa-arrow-right"></i>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-body-common">
                        <div className="box-area-wrap box-area-wrap_new clearfix mx-0">
                          <CustomCarousel
                            items={draftCourses.map((item) => (
                              <div
                                key={item._id}
                                className="slider"
                                style={{ width: 255 }}
                              >
                                <DraftItem item={item} />
                              </div>
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ListLoading />
              )}
              {bestSellers ? (
                <div className="box-area box-area_new home-all mb-2">
                  {bestSellers.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                Bestseller
                              </h3>
                              <p className="section_sub_heading">
                                Course(s) with best review
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body-common">
                        <CustomCarousel
                          items={bestSellers.map((item) => (
                            <div
                              key={item._id}
                              className="box-item slider"
                              style={{ width: 255 }}
                            >
                              <div className="box box_new bg-white pt-0">
                                <div
                                  className="image-wrap cursor-pointer"
                                  onClick={() => viewDetails(item)}
                                >
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    style={{
                                      height: 141,
                                      width: 100,
                                      borderRadius: 9,
                                    }}
                                  />
                                  <button
                                    onClick={() => onFavoriteChanged(item)}
                                    className="favorite-button"
                                  >
                                    <i className="fas fa-heart"></i>
                                  </button>
                                </div>
                                <div className="box-inner box-inner_new p-0 m-0 cardFontAll-imp1">
                                  <div className="info p-0 m-0">
                                    <h4
                                      title={item.title}
                                      onClick={() => viewDetails(item)}
                                      className="cursor-pointer"
                                    >
                                      {item.title}
                                    </h4>
                                    {item.rating && (
                                      <h4>
                                        <span>{item.rating}</span>
                                        {/* Assuming 'rating' is another component that handles star ratings */}
                                        <RatingComponent
                                          value={item.rating}
                                          max={numberStar}
                                          readonly
                                        />
                                        {item.totalRatings > 0 && (
                                          <span>({item.totalRatings})</span>
                                        )}
                                      </h4>
                                    )}
                                    {item.accessMode === "buy" && (
                                      <div className="selling-price-info selling-price-info_new d-flex">
                                        <ItemPrice
                                          item={item}
                                          field="marketPlacePrice"
                                        />
                                      </div>
                                    )}
                                    <div className="row cardFontAll-imp3">
                                      <div className="col-6 pl-2 student-time">
                                        <div className="row">
                                          <span className="material-icons course">
                                            people
                                          </span>
                                          <span className="icon-text">
                                            {" "}
                                            {item.students}
                                          </span>
                                          <span className="icon-text">
                                            {item.students === 1
                                              ? "student"
                                              : "students"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-6 pr-2">
                                        <div className="row">
                                          <span className="material-icons course">
                                            timelapse
                                          </span>
                                          <span className="icon-text">
                                            {item.timeSpent}
                                          </span>
                                          <span className="icon-text">
                                            hrs spent
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="form-row mt-2">
                                    <div className="col-6">
                                      <Link
                                        href={`/course/view-mode/${item._id}`}
                                        className="btn btn-outline btn-sm d-block"
                                      >
                                        Teach
                                      </Link>
                                    </div>
                                    <div className="col-6">
                                      <button
                                        className="btn btn-buy btn-sm d-block"
                                        onClick={() => viewDetails(item)}
                                      >
                                        View Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ListLoading />
              )}
              {mostPopularCourses ? (
                <div className="box-area box-area_new home-all mb-2">
                  {mostPopularCourses.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                Most Popular
                              </h3>
                              <p className="section_sub_heading">
                                Courses with maximum students enrollment
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body-common">
                        <CustomCarousel
                          items={mostPopularCourses.map((item) => (
                            <div
                              key={item._id}
                              className="box-item slider"
                              style={{ width: 255 }}
                            >
                              <a
                                className="box-item"
                                onClick={() => viewDetails(item, "mostPopular")}
                              >
                                <div className="box box_new bg-white pt-0">
                                  <div className="image-wrap">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      style={{
                                        height: 141,
                                        width: 100,
                                        borderRadius: 9,
                                      }}
                                    />
                                    <button
                                      onClick={() => onFavoriteChanged(item)}
                                      className="favorite-button"
                                    >
                                      <i className="fas fa-heart"></i>
                                    </button>
                                  </div>
                                  <div
                                    className="box-inner box-inner_new p-0 m-0 cardFontAll-imp1"
                                    style={{ height: 100 }}
                                  >
                                    <div className="info p-0 m-0">
                                      <h4 title={item.title}>{item.title}</h4>
                                      {item.instructors &&
                                        item.instructors.length > 0 && (
                                          <div className="author-name">
                                            <p>
                                              <span>
                                                {item.instructors[0].name}
                                              </span>
                                              {item.instructors.length > 1 && (
                                                <span>
                                                  +{" "}
                                                  {item.instructors.length - 1}{" "}
                                                  more
                                                </span>
                                              )}
                                            </p>
                                          </div>
                                        )}
                                      <h4>
                                        <RatingComponent
                                          value={item.rating}
                                          max={numberStar}
                                          readonly
                                        />
                                        {item.totalRatings > 0 && (
                                          <span>
                                            {" "}
                                            ({item.totalRatings.toFixed(0)})
                                          </span>
                                        )}
                                      </h4>
                                      {item.accessMode === "buy" && (
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice
                                            item={item}
                                            field="marketPlacePrice"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <button
                                      className="btn btn-buy btn-block btn-sm round-bottom"
                                      onClick={() =>
                                        viewDetails(item, "mostPopular")
                                      }
                                    >
                                      View Course
                                    </button>
                                  </div>
                                </div>
                              </a>
                            </div>
                          ))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ListLoading />
              )}
              {highestPaidCourses ? (
                <div className="box-area box-area_new home-all">
                  {highestPaidCourses.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                Highest Paid
                              </h3>
                              <p className="section_sub_heading">
                                Discover our Highest Paid Courses for valuable
                                skills and in-demand knowledge.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body-common">
                        <CustomCarousel
                          items={highestPaidCourses.map((item) => (
                            <div
                              key={item._id}
                              className="box-item slider"
                              style={{ width: 255 }}
                            >
                              <a
                                className="box-item"
                                onClick={() => viewDetails(item, "bestSeller")}
                              >
                                <div className="box box_new bg-white pt-0">
                                  <div className="image-wrap">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      style={{
                                        height: 141,
                                        width: 100,
                                        borderRadius: 9,
                                      }}
                                    />
                                    <button
                                      onClick={() => onFavoriteChanged(item)}
                                      className="favorite-button"
                                    >
                                      <i className="fas fa-heart"></i>
                                    </button>
                                  </div>
                                  <div
                                    className="box-inner box-inner_new p-0 m-0 cardFontAll-imp1"
                                    style={{ height: 100 }}
                                  >
                                    <div className="info p-0 m-0">
                                      <h4 title={item.title}>{item.title}</h4>
                                      {item.instructors && (
                                        <div className="author-name">
                                          <p className="text-truncate">
                                            <span>
                                              {item.instructors.join(", ")}
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                      <h4>
                                        <RatingComponent
                                          value={item.rating}
                                          max={numberStar}
                                          readonly
                                        />
                                        {item.totalRatings > 0 && (
                                          <span> ({item.totalRatings})</span>
                                        )}
                                      </h4>
                                      {item.accessMode === "buy" && (
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice
                                            item={item}
                                            field="marketPlacePrice"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <button
                                      className="btn btn-buy btn-block btn-sm round-bottom"
                                      onClick={() =>
                                        viewDetails(item, "bestSeller")
                                      }
                                    >
                                      View Course
                                    </button>
                                  </div>
                                </div>
                              </a>
                            </div>
                          ))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ListLoading />
              )}
              {archivedCourses ? (
                <div className="box-area box-area_new home-all">
                  {archivedCourses.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h3 className="section_top_heading">
                                Highest Paid
                              </h3>
                              <p className="section_sub_heading">
                                Discover our Archived Courses for valuable
                                skills and in-demand knowledge.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body-common">
                        <CustomCarousel
                          items={archivedCourses.map((item) => (
                            <div
                              key={item._id}
                              className="box-item slider"
                              style={{ width: 255 }}
                            >
                              <a
                                className="box-item"
                                onClick={() => viewDetails(item, "bestSeller")}
                              >
                                <div className="box box_new bg-white pt-0">
                                  <div className="image-wrap">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      style={{
                                        height: 141,
                                        width: 100,
                                        borderRadius: 9,
                                      }}
                                    />
                                    <button
                                      onClick={() => onFavoriteChanged(item)}
                                      className="favorite-button"
                                    >
                                      <i className="fas fa-heart"></i>
                                    </button>
                                  </div>
                                  <div
                                    className="box-inner box-inner_new p-0 m-0 cardFontAll-imp1"
                                    style={{ height: 100 }}
                                  >
                                    <div className="info p-0 m-0">
                                      <h4 title={item.title}>{item.title}</h4>
                                      {item.instructors && (
                                        <div className="author-name">
                                          <p className="text-truncate">
                                            <span>
                                              {item.instructors.join(", ")}
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                      <h4>
                                        <RatingComponent
                                          value={item.rating}
                                          max={numberStar}
                                          readonly
                                        />
                                        {item.totalRatings > 0 && (
                                          <span> ({item.totalRatings})</span>
                                        )}
                                      </h4>
                                      {item.accessMode === "buy" && (
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice
                                            item={item}
                                            field="marketPlacePrice"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <button
                                      className="btn btn-buy btn-block btn-sm round-bottom"
                                      onClick={() =>
                                        viewDetails(item, "bestSeller")
                                      }
                                    >
                                      View Course
                                    </button>
                                  </div>
                                </div>
                              </a>
                            </div>
                          ))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ListLoading />
              )}
            </div>
          </div>
        </main>
      )}
      <Modal show={showModal} onHide={cancel}>
        <Modal.Header>
          <Modal.Title className="text-center w-100">Create Course</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "0 1rem" }}>
          <div className="form-group">
            <h6 className="form-box_subtitle">Course Name</h6>
            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              min="2"
              max="50"
              style={{ border: "unset" }}
              className="form-control form-control-sm my-0 py-0"
              onChange={(e) => setCourseTitle(e.target.value)}
            />
            <hr className="my-0 py-0" />
          </div>
          <div className="form-group">
            <h6 className="form-box_subtitle">Summary</h6>
            <input
              type="text"
              name="name"
              placeholder="Course summary"
              required
              className="form-control form-control-sm my-0 py-0"
              style={{ border: "unset" }}
              onChange={(e) => setCourseSummary(e.target.value)}
            />
            <hr className="my-0 py-0" />
          </div>
          <div className="overflow-unset">
            <div className="form-group">
              <div>
                <h6 className="form-box_subtitle">Subject name</h6>
              </div>
              <Multiselect
                options={userSubjects}
                selectedValues={selectedObj}
                onSelect={(e) => setSelectedObj(e)}
                onRemove={(e) => setSelectedObj(e)}
                displayValue="name"
                placeholder="Select subjects"
                style={styleForMultiSelect}
                showCheckbox={true}
                showArrow={true}
                closeIcon="cancel"
                avoidHighlightFirstOption={true}
              />
              <hr className="my-0 py-0" />
            </div>
          </div>
          <div className="overflow-unset">
            <h6 className="form-box_subtitle">Upload course Picture</h6>
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
        </Modal.Body>
        {/* <Modal.Footer> */}
        <div className="row m-2">
          {user.primaryInstitute?.canUseAI && (
            <div className="col-auto">
              <div>
                <em>Create course and course chapters with help of AI</em>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={
                  processing || !(courseTitle || courseSummary || selectedObj)
                }
                onClick={createCourseWithAI}
              >
                Create Course With AI&nbsp;
                {processing && <i className="fa fa-spinner fa-pulse"></i>}
              </button>
            </div>
          )}

          <div className="col text-right">
            <div>&nbsp;</div>
            <button
              type="button"
              onClick={() => cancel()}
              className="btn btn-light"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary ml-2"
              onClick={() => save()}
              disabled={
                processing || !(courseTitle || courseSummary || selectedObj)
              }
            >
              Create Course
            </button>
          </div>
        </div>
        {/* </Modal.Footer> */}
      </Modal>
    </>
  );
};

export default PublisherCourse;
