"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PImageComponent from "@/components/AppImage";
import ItemPrice from "@/components/ItemPrice";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import * as alertify from "alertifyjs";
import { useSession } from "next-auth/react";
import * as courseService from "@/services/courseService";
import * as favoriteSvc from "@/services/favaorite-service";
import { fromNow, ucFirst } from "@/lib/pipe";

const TeacherCourseViewAll = () => {
  const router = useRouter();
  const { category } = useParams() || "subject";
  const id = useSearchParams().get("id");
  const [courses, setCourses] = useState<any[]>([]);
  const [subject, setSubject] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [params, setParams] = useState<any>({
    limit: 12,
    page: 1,
    excludeEnrolled: true,
  });
  const user: any = useSession()?.data?.user?.info || {};
  const [type, setType] = useState<string>("");
  const [loadMoreClicked, setLoadMoreClicked] = useState();
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [title, setTitle] = useState();
  const queryParams = useSearchParams();
  const { push } = useRouter();


  useEffect(() => {

    setType(queryParams.get("type"));

    const tp = category;
    if (tp == "tags") {
      setTitle(queryParams.get("title"));
    } else {
      setType(tp);
      setTitle(tp);
    }
    load(tp, params);
  }, []);

  const load = (tp?: string, para) => {
    if (!tp) {
      tp = type;
    }
    setInitialized(false);
    if (loadMoreClicked) {
      para.page = 1;
    }

    setCourses([]);
    setCoursesCount(0);
    setParams(para);

    if (tp == "live") {
      courseService
        .getMyCourses({ ...para, count: true, type: "ongoing" })
        .then((d: any) => {
          setCourses(d.courses);
          setCoursesCount(d.total);
          setInitialized(true);
        });
    } else if (tp == "draft") {
      courseService
        .getMyCourses({ ...para, count: true, type: "draft" })
        .then((s: any) => {
          setCourses(s.courses);
          setCoursesCount(s.total);
          setInitialized(true);
        });
    } else if (tp == "published") {
      courseService
        .getMyCourses({ ...para, count: true, type: "published" })
        .then((d: any) => {
          setCourses(d.courses);
          setCoursesCount(d.total);
          setInitialized(true);
        });
    } else if (tp == "mine") {
      courseService
        .getTeacherCourses({
          ...para,
          origin: "institute",
          count: true,
          status: "draft,published",
        })
        .then((d: any) => {
          setCourses(d.courses);
          setCoursesCount(d.total);
          setInitialized(true);
        });
    } else if (tp == "archived") {
      courseService
        .getMyArchivedCourses({ ...para })
        .then((a: any) => {
          setCourses(a.courses);
          setCoursesCount(a.total);
          setInitialized(true);
        })
        .catch((err) => {
          setCourses([]);
          setInitialized(true);
        });
    } else if (tp == "tags") {
      para.tags = queryParams.get("tags");
      para.sort = "title,1";
      courseService
        .getCourses({ para })
        .then((a: any) => {
          setCourses(a.courses);
          setCoursesCount(a.total);
          setInitialized(true);
        })
        .catch((err) => {
          setCourses([]);
          setInitialized(true);
        });
    } else if (tp == "favorite") {
      favoriteSvc
        .findCourses({ ...para, count: true })
        .then((res: any) => {
          setCourses(res.courses);
          setCoursesCount(res.total);
          setInitialized(true);
        })
        .catch((err) => {
          setCourses([]);
          setInitialized(true);
        });
    }
    setParams(para);
  };

  const search = (para?: any) => {
    if (!para) {
      para = params;
    }
    para.page = 1;
    if (para.keyword === "") {
      setIsSearch(false);
    } else {
      setIsSearch(true);
    }
    setParams(para);
    load(type, para);
  };
  const clearSearch = () => {
    const para = params;
    para.keyword = "";
    search(para);
  };

  const viewDetails = (item: any) => {
    sessionStorage.removeItem("teacher_course_detail_current_page_" + item._id);
    push(`/course/details${item._id}`);
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
              "Please add classroom also before publishing it"
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
              setCourses(courses.filter((c) => c._id != item._id));

              alertify.success("Course published successfully.");
            })
            .then((err) => {
              if (err.response.data) {
                // const errors = err.response.dat.message;
                // let msg = ''
                // if (errors) {
                //   for (const prop in errors) {
                //     console.log(errors[prop])
                //     msg = errors[prop].message;
                //   }
                // } else if (err.error.message) {
                //   msg = err.error.message
                // }
                alertify.alert("Message", err.response.dat.message);
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

  const checkOwner = (item: any) => {
    if (
      (user.role != "teacher" && user.role != "mentor") ||
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

  return (
    <div>
      <div className="container">
        <div className="search-bar d-block d-lg-none mx-0">
          <form>
            <div className="form-group mb-0">
              <input
                type="text"
                name="search"
                value={params.keyword}
                onChange={(e) => {
                  const para = params;
                  setParams({
                    ...params,
                    keyword: e.target.value,
                  });
                  search(para.keyword);
                }} // Example of two way data binding
                className="form-control border-bottom rounded-0"
                placeholder="Search..."
              />
            </div>
          </form>
        </div>
      </div>
      <div className="header-secondary bg-white d-block d-lg-none">
        <div className="container">
          <div className="header-area d-block d-lg-none mx-auto">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <ul className="mr-auto">
                {initialized && (
                  <li className="nav-item">
                    {ucFirst(title)} courses ({coursesCount})
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <main className="pt-0 main-ClassViewAllTop-All1">
        <div className="main-area view-all-remove  search-result mx-auto my-4">
          <div className="container">
            <div className="info mx-auto view-all-top d-none d-lg-block mb-0">
              <div className="row align-items-center pb-3">
                <div className="col-9 col-md-7 top head-text">
                  <div className="clearfix subject-all">
                    <div className="inner inner1_neW">
                      <div className="section_heading_wrapper">
                        {initialized ? (
                          <h3 className="section_top_heading">
                            {ucFirst(title)} courses ({coursesCount})
                          </h3>
                        ) : (
                          <SkeletonLoaderComponent Cwidth="40" Cheight="40" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-3 col-md-5 top head-search">
                  <div className="d-flex align-items-center my-3 gap-sm">
                    <section className="flex-grow-1">
                      <form
                        className="common_search-type-1"
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <div className="form-group">
                          <span>
                            <figure>
                              <img
                                className="searchBoxIcon-5"
                                src="/assets/images/search-icon-2.png"
                                alt=""
                              />
                            </figure>
                          </span>
                          {isSearch && (
                            <div onClick={clearSearch}>
                              <figure>
                                <img src="/assets/images/close3.png" alt="" />
                              </figure>
                            </div>
                          )}
                          <input
                            type="text"
                            className="form-control border-0"
                            placeholder="Search for Subject"
                            maxLength="50"
                            value={params.searchText}
                            name="txtSearch"
                            onChange={(e) => search(e.target.value)}
                          />
                        </div>
                      </form>
                    </section>
                  </div>
                </div>
              </div>
              <div className="box-area box-area_new d-none d-lg-block">
                <div className="box-area-wrap d-none d-lg-block position-relative">
                  <div className="row">
                    {courses.map((test, index) => (
                      <div
                        key={index}
                        className="col-lg-3 col-md-4 col-6 mb-3"
                      >
                        <div className="slider">
                          <div className="box box_new bg-white pt-0">
                            <div
                              className="cursor-pointer"
                              onClick={() => viewDetails(test)}
                            >
                              <PImageComponent
                                height={110}
                                width={100}
                                imageUrl={test.imageUrl}
                                backgroundColor={test.colorCode}
                                text={test.title}
                                radius={9}
                                fontSize={15}
                                type="course"
                              />
                            </div>
                            <div
                              className="box-inner box-inner_new"
                              style={{
                                minHeight:
                                  type === "published" ? "100px" : "unset",
                              }}
                            >
                              {type !== "published" && (
                                <div className="Box-inner-accessModeTags">
                                  <div className="border-0 box-inner_tag">
                                    <div className="d-flex align-items-center">
                                      {test.accessMode === "invitation" ||
                                        test.accessMode === "buy" ? (
                                        <span className="material-icons">
                                          lock
                                        </span>
                                      ) : (
                                        <span className="material-icons">
                                          lock_open
                                        </span>
                                      )}
                                      <div className="stud2 subjctViewAll">
                                        {test.accessMode === "invitation" ||
                                          test.accessMode === "buy" ? (
                                          <strong>PRIVATE</strong>
                                        ) : (
                                          <strong>PUBLIC</strong>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="info p-0 m-0">
                                <h4
                                  className="cursor-pointer"
                                  onClick={() => viewDetails(test)}
                                  title={test.title}
                                >
                                  {test.title}
                                </h4>
                                <ul className="nav">
                                  {test.subjects &&
                                    test.subjects.length > 0 && (
                                      <li className="p-0 m-0">
                                        <a>{test.subjects[0].name}</a>
                                      </li>
                                    )}
                                  {test.subjects &&
                                    test.subjects.length > 1 && (
                                      <li className="p-0 m-0">
                                        <a>
                                          {" "}
                                          + {test.subjects.length - 1} more
                                        </a>
                                      </li>
                                    )}
                                </ul>
                                {type === "published" && (
                                  <div className="row cardFontAll-imp3">
                                    <div className="col-6 pl-2 student-time">
                                      <div className="row">
                                        <span className="material-icons course">
                                          people
                                        </span>
                                        <span className="icon-text">
                                          {" "}
                                          {test.students}
                                        </span>
                                        <span className="icon-text">
                                          {test.students === 1
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
                                          {test.timeSpent}
                                        </span>
                                        <span className="icon-text">
                                          hrs spent
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {test.accessMode === "buy" &&
                                  type === "published" && (
                                    <div className="selling-price-info selling-price-info_new d-flex">
                                      <ItemPrice
                                        content={test}
                                        field="marketPlacePrice"
                                      />
                                    </div>
                                  )}
                                {type === "published" &&
                                  test.accessMode !== "buy" && (
                                    <div className="Box-inner-accessModeTags mt-1">
                                      <div className="border-0 box-inner_tag">
                                        <div className="d-flex align-items-center">
                                          {test.accessMode ===
                                            "invitation" ||
                                            test.accessMode === "buy" ? (
                                            <span className="material-icons">
                                              lock
                                            </span>
                                          ) : (
                                            <span className="material-icons">
                                              lock_open
                                            </span>
                                          )}
                                          <div className="stud2 subjctViewAll">
                                            {test.accessMode ===
                                              "invitation" ||
                                              test.accessMode === "buy" ? (
                                              <strong>PRIVATE</strong>
                                            ) : (
                                              <strong>PUBLIC</strong>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                            {type === "published" && (
                              <div className="form-row pb-2 px-2">
                                <div className="col-6">
                                  <a
                                    className="btn btn-outline btn-sm d-block"
                                    href={`../../view-mode/${test._id}`}
                                  >
                                    Teach
                                  </a>
                                </div>
                                <div className="col-6">
                                  <a
                                    className="btn btn-view btn-sm d-block"
                                    onClick={() => viewDetails(test)}
                                  >
                                    View
                                  </a>
                                </div>
                              </div>
                            )}
                            {type !== "draft" && type !== "published" && (
                              <div className="view-detail view-detail_new">
                                <a
                                  className="text-center"
                                  onClick={() => viewDetails(test)}
                                >
                                  VIEW COURSE
                                </a>
                              </div>
                            )}
                            {type === "draft" && (
                              <div className="form-row pb-2">
                                <div className="col-5 ml-2">
                                  <a
                                    className="btn btn-outline btn-sm d-block"
                                    onClick={() => viewDetails(test)}
                                  >
                                    Edit
                                  </a>
                                </div>
                                {checkOwner(test) && (
                                  <div className="col-6 mx-1">
                                    <a
                                      className="btn btn-success btn-sm d-block"
                                      onClick={() => publish(test)}
                                    >
                                      Publish
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {courses.length === 0 && initialized && (
                    <div className="course-search-empty text-center empty-data">
                      <figure className="mx-auto">
                        <img
                          src="assets/images/Search-rafiki.png"
                          alt=""
                          className="img-fluid d-block mx-auto mb-4"
                        />
                      </figure>
                      <h6>No Results Found</h6>
                      <p>
                        We couldn&apos;t find any results based on your search
                      </p>
                    </div>
                  )}
                </div>
                {!initialized && (
                  <div className="box-area-wrap clearfix">
                    <div className="heading">
                      <div className="row">
                        <div className="col-3">
                          <SkeletonLoaderComponent
                            Cwidth="100"
                            Cheight="30"
                          />
                        </div>
                      </div>
                    </div>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="box-item">
                        <SkeletonLoaderComponent
                          Cwidth="100"
                          Cheight="200"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="box-area box-area_new d-block d-lg-none mx-0">
          <div className="row">
            {initialized && (
              <div className="col-8">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">{`${courses.length} Courses`}</h3>
                </div>
              </div>
            )}
          </div>
          <div className="box-area-wrap clearfix d-block d-lg-none mx-0 position-relative">
            <div className="row">
              {courses.map((test, index) => (
                <div key={index} className="col-lg-3 col-md-4 col-6 mb-3">
                  <div className="slider">
                    <div className="box box_new bg-white pt-0">
                      <PImageComponent
                        height={105}
                        width={100}
                        imageUrl={test.imageUrl}
                        backgroundColor={test.colorCode}
                        text={test.title}
                        radius={9}
                        fontSize={15}
                        type="course"
                      />
                      <div className="box-inner box-inner_new">
                        <div className="info p-0 m-0">
                          <div className="row">
                            <div className="col-12 Box-inner-accessModeTags">
                              <div className="border-0 mt-1 box-inner_tag">
                                <div className="d-flex align-items-center">
                                  {(test.accessMode === "invitation" ||
                                    test.accessMode === "buy") && (
                                      <span className="material-icons">
                                        lock
                                      </span>
                                    )}
                                  {test.accessMode === "public" && (
                                    <span className="material-icons">
                                      lock_open
                                    </span>
                                  )}
                                  <span className="stud2 ml-1">
                                    {(test.accessMode === "invitation" ||
                                      test.accessMode === "buy") && (
                                        <strong>PRIVATE</strong>
                                      )}
                                    {test.accessMode === "public" && (
                                      <strong>PUBLIC</strong>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <h4 title={test.title}>
                            {test.title.length > 25
                              ? `${test.title.substring(0, 25)}...`
                              : test.title}
                          </h4>
                          {test.subjects && test.subjects.length > 0 && (
                            <div className="nav">
                              <li className="w-100">
                                <a>{test.subjects[0].name}</a>
                              </li>
                              <li className="w-100">
                                <a>
                                  &nbsp;
                                  <span>
                                    {test.subjects.length > 1 &&
                                      `+ ${test.subjects.length - 1} more`}
                                  </span>
                                </a>
                              </li>
                            </div>
                          )}
                          {type === "live" && (
                            <div className="d-flex flex-column cardFontAll-imp3">
                              <div className="student-time">
                                <span className="material-icons course">
                                  people
                                </span>
                                <span className="icon-text">
                                  {" "}
                                  {test.students}
                                </span>
                                <span className="icon-text">
                                  {test.students === 1
                                    ? "student"
                                    : "students"}
                                </span>
                              </div>
                              <div className="student-time">
                                <span className="material-icons course">
                                  timelapse
                                </span>
                                <span className="icon-text">
                                  {test.timeSpent}
                                </span>
                                <span className="icon-text">hrs spent</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {type === "published" && (
                        <div className="form-row pb-2 px-2">
                          <div className="col-6">
                            <a
                              className="btn btn-outline btn-sm d-block"
                              href={`../../view-mode/${test._id}`}
                            >
                              Teach
                            </a>
                          </div>
                          <div className="col-6">
                            <a
                              className="btn btn-view btn-sm d-block"
                              onClick={() => viewDetails(test)}
                            >
                              View
                            </a>
                          </div>
                        </div>
                      )}
                      {type !== "draft" && type !== "published" && (
                        <div className="view-detail view-detail_new">
                          <a
                            className="text-center"
                            onClick={() => viewDetails(test)}
                          >
                            VIEW COURSE
                          </a>
                        </div>
                      )}
                      {type === "draft" && (
                        <div className="form-row">
                          <div className="col-6">
                            <a
                              className="btn btn-outline btn-sm d-block"
                              onClick={() => edit(test)}
                            >
                              Edit
                            </a>
                          </div>
                          <div className="col-6">
                            <a
                              className="text-center btn btn-success btn-sm d-block"
                              onClick={() => publish(test)}
                            >
                              Publish
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* <Spinner animation="border" role="status" className="text-center">
                    <span className="sr-only">Loading...</span>
                </Spinner> */}
          </div>
        </div>
        <div className="text-center">
          {courses.length < coursesCount && (
            <a className="btn btn-light" onClick={() => load(type, params)}>
              Load More
            </a>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherCourseViewAll;
