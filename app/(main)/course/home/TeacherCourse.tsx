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

const TeacherCourse = () => {
  const fileBrowseRef = useRef(null);

  const { push } = useRouter();
  const user: any = useSession()?.data?.user?.info || {};
  const { clientData, updateClientData, updateUserInfo } = useTakeTestStore();
  const [settings, setSettings] = useState<any>();
  const [isSeaching, setIsSearching] = useState<boolean>(false);
  const [numberStar, setnumberStar] = useState<number>(5);
  const [publishedCourses, setpublishedCourses] = useState<any>([]);
  const [archivedCourses, setarchivedCourses] = useState<[]>();
  const [draftCourses, setdraftCourses] = useState<[]>();
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
  useEffect(() => {
    userSvc.get().then((us) => {
      clientApi.get(`/api/settings`).then((res) => {
        setSettings(res.data);
        if (
          res.data.features?.marketplace &&
          (us.role == "director" || us.role == "admin")
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
              setMarketplaceCourses(processData(courses));
              setHasData(courses.length > 0);
            });
        }
      });
    });

    courseService
      .getTeacherCourses({
        ...params,
        origin: "institute",
        favorite: true,
        status: "draft,published",
      })
      .then((pC: any) => {
        setMyCourses(processData(pC.courses));
        setHasData(pC.courses?.length > 0);
      })
      .catch((err) => {
        setMyCourses([]);
      });

    courseService
      .getCourses({
        ...params,
        origin: "publisher",
        favorite: true,
        status: "published",
        getStats: true,
      })
      .then((r: any) => {
        setRecentCourses(processData(r.courses));
        setHasData(r.courses?.length > 0);
      });

    favoriteSvc
      .findCourses({
        page: 1,
        limit: 6,
        excludeUser: true,
        showClassrooms: true,
      })
      .then((res: any) => {
        setFavorites(res.courses);
        setHasData(res.courses?.length > 0);
      });

    settingSvc.findOne("contentOrganizer").then((conf: any) => {
      if (conf?.course?.length) {
        const updatedSection = [...sections];
        for (const sec of conf.course) {
          if (sec.visible) {
            updatedSection.push(sec);
            courseService
              .getCourses({
                ...params,
                favorite: true,
                tags: sec.tags.join(","),
                sort: "title,1",
                getStats: true,
              })
              .then((secResult: any) => {
                sec.courses = processData(secResult.courses);
                setHasData(sec.courses?.length > 0);
              });
          }
        }
        setSections(updatedSection);
      }
    });
    getCourseSubject();
    getAuthors();
  }, [isPublsihed]);

  const getAuthors = async () => {
    const { data } = await clientApi.get(`/api/course/authors`);
    setAuthors(data);
  };
  const getCourseSubject = async () => {
    const { data } = await clientApi.get(
      `/api/course/subjects/me${toQueryString({ excludeEnrolled: true })}`
    );
    let subject = data.sort((prev: any, next: any) =>
      prev.name.localeCompare(next.name)
    );
    setSubjects(subject);
    changeTabs(subject[0], false);
  };

  const processData = (courses: any) => {
    setAllLoadedSections([...allLoadedSections, ...courses]);
    return courses;
  };

  const reset = (ev: any) => {
    setsearchText("");
    setIsSearching(false);
  };

  const search = (ev: any) => {
    setIsSearching(!!searchText);
  };

  const viewDetails = (item: any) => {
    if (item.isFromMarketPlace) {
      push(`/course/view-course/${item._id}`);
      return;
    }

    sessionStorage.removeItem("teacher_course_detail_current_page_" + item._id);
    push(`/course/details/${item._id}`);
  };

  const viewMarketplaceCourse = (item: any) => {
    push(`/course/view-course${item._id}`);
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
              item.status = "published";
              item.statusChangedAt = new Date().getTime();
              setIsPublished(true);
              alertify.success("Course published successfully.");
            })
            .catch((err) => {
              if (err.response.data) {
                // let msg = "";
                // if (errors) {
                //   for (const prop in errors) {
                //     console.log(errors[prop]);
                //     msg = errors[prop].message;
                //   }
                // } else if (err.error.message) {
                //   msg = err.error.message;
                // }
                alertify.alert("Message", err.response.data.message);
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

  const withdraw = (item: any) => {
    if (item._id) {
      alertify.confirm(
        "Are you sure you want to withdraw this course? You will not be able to change or re-publish once withdrawn.",
        (ev) => {
          courseService
            .update(item._id, { status: "revoked" })
            .then((res) => {
              item.status = "revoked";
              item.statusChangedAt = new Date().getTime();
              alertify.success("Course withdrawn successfully..");
            })
            .catch((err) => {
              if (err) {
                const errors = err.response.data;
                let msg = "Failed to withdraw course.";
                if (errors) {
                  for (const prop in errors) {
                    msg += errors[prop].message + " ";
                  }
                } else if (err.response.data.msg) {
                  msg = err.response.data.msg;
                }
                alertify.alert("Message", msg);
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

  const deleteFunc = (item: any) => {
    alertify.confirm("Are you sure, you want to delete this course?", (ev) => {
      courseService
        .Delete(item._id)
        .then((res) => {
          alertify.success("Course is deleted successfully.");
        })
        .catch((err) => {
          if (err.response.data) {
            const errors = err.response.data;
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

  const uploadModal = () => {
    setshowModal(true);
    subjectSvc.getMine().then((res: any[]) => {
      const updatedUserSubjects = res.map((d) => {
        return {
          _id: d._id,
          name: d.name,
        };
      });
      setuserSubjects(updatedUserSubjects);
    });
  };

  const save = async () => {
    if (!user.email) {
      alertify.alert("Message", "Please add your mail before create a course");
    }
    const title = courseTitle;
    const summary = courseSummary;
    const subjects = selectedObj;
    const imageUrl = file;

    if (!subjects || !subjects.length) {
      alertify.alert("Message", "Add Subject");
      return;
    }

    await clientApi
      .post("/api/course", {
        title,
        summary,
        subjects,
        imageUrl,
      })
      .then((res) => {
        console.log(res);
        setcourse(res.data);
        viewDetails(res.data);
      })
      .catch((err) => {
        alertify.alert("Error", "Course creating failed!");
        console.log(err);
      });
    cancel();
  };

  const cancel = () => {
    setCourseTitle("");
    setCourseSummary("");
    setSelectedObj("");
    setFile("");
    setshowModal(false);
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
      const index = item.instructors.findIndex((e: any) => e._id == user._id);
      if (index > -1) {
        val = true;
      }
    }
    return val;
  };

  const handleFileChange = (file: File) => {
    console.log(file);
    setFile(URL.createObjectURL(file));
    setFileUploadStatus(true);
  };

  const renameObjectKey = (data: any, oldKey: string, newKey: string) => {
    let newData = [];
    for (let i = 0; i < data.length; i++) {
      let subject = data[i];
      if (oldKey === newKey) return;
      if (!subject[oldKey]) return;
      if (subject[newKey] !== undefined) return;
      subject = { ...subject, [newKey]: subject[oldKey] };
      delete subject[oldKey];
      newData.push({ ...subject });
    }
    return newData;
  };

  const createCourseWithAI = () => {
    if (!user.email) {
      alertify.alert("Message", "Please add your mail before create a course");
      return;
    }
    if (!selectedObj || !selectedObj.length) {
      alertify.alert("Message", "Add Subject");
      return;
    }
    const title = courseTitle;
    const summary = courseSummary;
    const subjects = selectedObj;
    const imageUrl = file;

    setProcessing(true);
    courseService
      .aiGenerate({
        title,
        summary,
        subjects,
        imageUrl,
      })
      .then((da: any) => {
        cancel();
        viewDetails(da);
        setProcessing(false);
      })
      .catch((err) => {
        if (err.response.data?.message) {
          alertify.alert("Message", err.response.data?.message);
        } else {
          alertify.alert("", "Fail to generate course.");
        }
        setProcessing(false);
      });
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
  const onFavoriteChanged = (ev: any) => {
    favoriteSvc
      .findCourses({
        page: 1,
        limit: 6,
        excludeUser: true,
        showClassrooms: true,
      })
      .then((res: any) => {
        setFavorites(res.courses);
      });

    const updatedAllLoadedSections = allLoadedSections;

    for (const course of updatedAllLoadedSections) {
      if (course._id == ev._id) {
        course.isFavorite = ev.favorite;
      }
    }
    setAllLoadedSections(updatedAllLoadedSections);
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
                  href={`/view-mode/${item.item._id}`}
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

  const changeTabs = async (subject: any, reload: any) => {
    setSelectedTabSubject(subject);
    if (!subject) return;
    if (!courseBySubject[subject?._id] || reload) {
      const params = {
        subject: subject._id,
        isCheckEnroll: true,
        excludeEnrolled: true,
      };
      const { data } = await clientApi.get(
        `/api/course${toQueryString(params)}`
      );
      let courseBySub = courseBySubject;
      courseBySub[subject._id] = data.courses;
      setCourseBySubject(courseBySub);
    }
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

  const toggleFilter = () => {
    if (!showFilter) {
      setSelectedFilter({
        level: "Select a Level",
        duration: "Select a Duration",
        author: "Select an Author",
        price: "Select a price",
      });
      let param = {
        page: params.page,
        limit: params.limit,
        keywords: params.keywords || "",
      };
      setParams(param);
      getResult(param);
    }
    setShowFilter(!showFilter);
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  return (
    <>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto">
            <div className="banner-info mx-auto">
              <h1 className="banner_title">What do you want to teach today?</h1>

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

      {!isSeaching ? (
        <main className="extraCustom-cs_new course_home_wrap">
          <div className="main-area next mx-auto mw-100">
            <div className="container course-home">
              {user.role !== "support" &&
                user.role !== "mentor" &&
                (!user.primaryInstitute ||
                  user.primaryInstitute.preferences?.course.allowToCreate) && (
                  <div className="box-area box-area_new home-all mb-2">
                    <div className="row mb-3">
                      <div className="col-auto ml-auto">
                        <button
                          className="btn btn-primary"
                          onClick={() => uploadModal()}
                        >
                          Create Course
                        </button>
                      </div>
                    </div>
                  </div>
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
                                className="btn btn-outline btn-sm "
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
                        className="box-area-wrap box-area-wrap_new clearfix mx-0"
                        style={{ width: "255px" }}
                      >
                        <CustomCarousel
                          items={marketplaceCourses.map((item, index) => (
                            <div
                              className="item"
                              key={item._id}
                              style={{ width: "255px" }}
                            >
                              <div
                                className="box-item p-0"
                                style={{ width: "255px" }}
                              >
                                <div
                                  className="box box_new bg-white pt-0"
                                  style={{ width: "255px" }}
                                >
                                  <div
                                    className="image-wrap cursor-pointer"
                                    onClick={() => viewMarketplaceCourse(item)}
                                  >
                                    <PImageComponent
                                      height={141}
                                      fullWidth
                                      imageUrl={item.imageUrl}
                                      backgroundColor={item.colorCode}
                                      text={item.title}
                                      radius={9}
                                      fontSize={15}
                                      type="course"
                                      testMode={item.testMode}
                                    />

                                    <FavoriteButton
                                      item={item}
                                      type={`course`}
                                      changed={onFavoriteChanged}
                                    />
                                  </div>
                                  <div className="box-inner box-inner_new has-shadow no-bottom-info cardFontAll-imp1">
                                    <div className="info pubCourseS p-0 m-0">
                                      <h4
                                        title={item.title}
                                        // onClick={() => edit(item)}
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
                                                  1}{" "}
                                                more{" "}
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
                                        <a
                                          className="btn btn-buy btn-sm btn-block"
                                          onClick={() =>
                                            viewMarketplaceCourse(item)
                                          }
                                        >
                                          View Details
                                        </a>
                                      </div>
                                      {!item.enrolled && !item.addedToCart && (
                                        <div className="flex-grow-1 flex-basic-0">
                                          <a
                                            className="btn btn-outline btn-sm btn-block"
                                            onClick={() =>
                                              addToCart(item, index)
                                            }
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
                            </div>
                          ))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {favorites ? (
                favorites.length > 0 && (
                  <div className="box-area box-area_new home-all mb-2">
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
                                course and clicking the Heart icon next to the
                                name.
                              </p>
                            </div>
                          </div>
                          {favorites.length > 6 && (
                            <div className="col-auto ml-auto">
                              <div className="view-all ml-auto">
                                <Link
                                  href={`/course/view-all/favorite`}
                                  className="btn btn-outline btn-sm "
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
                        <div
                          className="box-area-wrap box-area-wrap_new"
                          style={{ width: "255px" }}
                        >
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
                  </div>
                )
              ) : (
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />

                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}

              {myCourses ? (
                <div className="box-area box-area_new home-all mb-2">
                  {myCourses.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">
                                My Courses
                              </h1>
                              <p className="section_sub_heading">
                                Explore our &apos;My Courses&apos; section to
                                access your live courses. Engage in real-time
                                learning experiences tailored to your needs.
                              </p>
                            </div>
                          </div>
                          {myCourses.length > 6 && (
                            <div className="col-auto ml-auto">
                              <div className="view-all ml-auto">
                                <Link
                                  href={`/course/view-all/mine`}
                                  className="btn btn-outline btn-sm "
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto p-0">
                                <Link href={`/course/view-all/mine`}>
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
                            items={myCourses.map((item, index) => (
                              <div
                                className="item"
                                key={index}
                                style={{ width: "250px" }}
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
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />

                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}

              {/* Recently Added Courses Section */}
              {recentCourses ? (
                <div className="box-area box-area_new home-all mb-2">
                  {recentCourses.length > 0 && (
                    <div className="card-common products_slider">
                      <div className="card-header-common">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="section_heading_wrapper">
                              <h1 className="section_top_heading">
                                Recently Added Courses
                              </h1>
                              <p className="section_sub_heading">
                                Explore our &apos;Recently Added Courses&apos;
                                section to access newly published courses.
                              </p>
                            </div>
                          </div>
                          {recentCourses.length > 6 && (
                            <div className="col-auto ml-auto">
                              <div className="view-all ml-auto">
                                <Link
                                  href={`/course/view-all/published`}
                                  className="btn btn-outline btn-sm "
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
                        <div
                          className="box-area-wrap box-area-wrap_new"
                          style={{ width: "250px" }}
                        >
                          <CustomCarousel
                            items={recentCourses.map((item, index) => (
                              <div
                                className="item"
                                key={index}
                                style={{ width: "250px" }}
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
                <div className="mb-3">
                  <SkeletonLoaderComponent Cwidth="30" Cheight="40" />

                  <div className="mt-2">
                    <SkeletonLoaderComponent Cwidth="100" Cheight="235" />
                  </div>
                </div>
              )}
              {sections.map((section, sectionIndex) => (
                <div
                  className="box-area box-area_new home-all mb-2"
                  key={sectionIndex}
                >
                  {section.courses && section.courses.length > 0 && (
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
                          {section.courses.length > 6 && (
                            <div className="col-auto ml-auto">
                              <div className="view-all ml-auto">
                                <Link
                                  href={`/course/view-all?tags=${section.tags.join(
                                    ","
                                  )}&title=${section.title}`}
                                  className="btn btn-outline btn-sm "
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="arrow ml-auto p-0">
                                <Link
                                  href={`/course/view-all?tags=${section.tags.join(
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
                          style={{ width: "250px" }}
                        >
                          <CustomCarousel
                            items={section.courses.map((item, index) => (
                              <div
                                className="item"
                                key={index}
                                style={{ width: "250px" }}
                              >
                                {item.status === "draft" ? (
                                  <div
                                    className="box-item p-0"
                                    style={{ width: "250px" }}
                                  >
                                    <DraftItem item={item} />
                                  </div>
                                ) : (
                                  <div
                                    className="box-item p-0"
                                    style={{ width: "250px" }}
                                  >
                                    <PublishedItem item={item} />
                                  </div>
                                )}
                              </div>
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
                  {isSeaching && (searchInit || searchedCourses.length > 0) && (
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
      {!hasData && !isSeaching && (
        <div className="empty-data course-search-empty">
          <figure className="mx-auto">
            <img src="/assets/images/Search-rafiki.png" alt="No Course Found" />
          </figure>
          <h3 className="text-center">No Course found</h3>
          {user.role === "director" || user.role === "operator" ? (
            <p>
              We couldn&apos;t find any result. You can bring courses from{" "}
              <Link className="d-inline" href={`/market-place`}>
                <b>Marketplace</b>
              </Link>{" "}
              or{" "}
              <a className="d-inline" onClick={() => uploadModal()}>
                <b>Create new</b>
              </a>
              .
            </p>
          ) : (
            <p>
              Please contact your director or{" "}
              <a className="d-inline" onClick={() => uploadModal()}>
                <b>create a new</b>
              </a>{" "}
              course.
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default TeacherCourse;
