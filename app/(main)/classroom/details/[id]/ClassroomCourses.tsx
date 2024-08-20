import React, { useEffect, useState } from "react";
import * as courseSvc from "@/services/courseService";
import * as classSvc from "@/services/classroomService";
import { alert, success, error, confirm } from "alertifyjs";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import PImageComponent from "@/components/AppImage";
import SubjectComponent from "@/components/SubjectComponent";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";

const ClassroomCourses = ({ classroom, settings, user }: any) => {
  const { push } = useRouter();

  const [title, setTitle] = useState<string>("");
  const [courses, setCourses] = useState<any>(null);
  const [filteredCourses, setFilteredCourses] = useState<any>(null);
  const [count, setCount] = useState<number>(0);
  const [availableParams, setAvailableParams] = useState<any>({
    limit: 12,
    page: 1,
    accessMode: "invitation",
    multiStatus: "published,draft",
    title: "",
  });
  const [availableCourses, setAvailableCourses] = useState<any>(null);
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    courseSvc
      .getClassroomCourse(classroom._id, { noPaging: true })
      .then((course) => {
        setCourses(course);
        setCount(course.length);
        setFilteredCourses(course);
      })
      .catch((err) => {
        setCourses([]);
      });

    setAvailableParams({
      ...availableParams,
      notInClass: classroom._id,
    });
    const temp_availableParams = {
      ...availableParams,
      notInClass: classroom._id,
    };

    courseSvc
      .getCourses({ ...temp_availableParams, count: true })
      .then((res) => {
        setAvailableCourses(res.courses);
        setAvailableCount(res.total);
      })
      .catch((err) => {
        setAvailableCourses([]);
      });
  }, []);

  const teachCourse = (id: string) => {
    push(`/course/view-mode/${id}`);
  };

  const viewCourseDetails = (id: string) => {
    push(`/course/details/${id}`);
  };

  const addCourse = (course: any, idx: any) => {
    confirm(
      "Do you want to add this course to the classroom? The students of this classroom will start using this course immediately. Please confirm.",
      () => {
        classSvc.addCourseToClassroom(classroom._id, course._id).then(() => {
          success("Course is added successfully to classroom");
          const temp_availableCourses = availableCourses;
          temp_availableCourses.splice(idx, 1);
          setAvailableCourses(temp_availableCourses);
          setAvailableCount(availableCount - 1);
          const temp_filterCourses = filteredCourses;
          temp_filterCourses.push(course);
          setFilteredCourses(temp_filterCourses);
          setCount(count + 1);
          const temp_courses = courses;
          temp_courses.push(course);
          setCourses(temp_courses);
        });
      }
    );
  };

  const publishCourse = (item: any) => {
    confirm("Are you sure you want to publish this course?", (msg) => {
      if (!item.startDate && (!item.sections || item.sections.length == 0)) {
        alert(
          "Message",
          "Add Start Date and Sections, then only you can able to publish this test !"
        );
        return;
      }
      if (!item.startDate) {
        alert("Message", "Add Start Date first");
        return;
      }
      if (!item.sections || item.sections.length == 0) {
        alert(
          "Message",
          "Please add sections in course curriculum before publishing the course"
        );
        return;
      }

      const lastData = { ...item };
      lastData.status = "published";
      lastData.statusChangedAt = new Date().getTime();

      item.processing = true;

      courseSvc
        .update(item._id, lastData)
        .then((res: any) => {
          item.status = "published";
          item.statusChangedAt = new Date().getTime();

          success("Course published successfully.");
          item.processing = false;
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
            alert("Message", msg);
          } else {
            console.log(err);
            alert(
              "Message",
              "Something went wrong. Please check browser console for more details."
            );
          }
          item.processing = false;
        });
    });
  };

  const removeCourse = (item: any, idx: any) => {
    confirm(
      "Do you want to remove the course from the classroom? The students of this classroom will no longer be able to take this course. Please confirm.",
      () => {
        classSvc.removeCourseFromClassroom(classroom._id, item._id).then(() => {
          success("Course is removed successfull from classroom");
          const temp_filteredCourses = filteredCourses;

          temp_filteredCourses.splice(idx, 1);
          setFilteredCourses(temp_filteredCourses);
          setCount(count - 1);
          const temp_availableCourses = availableCourses;
          temp_availableCourses.push(item);
          setAvailableCourses(temp_availableCourses);
          setAvailableCount(availableCount - 1);

          const ti = courses.findIndex((t) => t._id == item._id);
          const temp_courses = courses;
          temp_courses.splice(ti, 1);
          setCourses(temp_courses);
        });
      }
    );
  };

  const search = (text: string) => {
    setTitle(text);
    if (!text) {
      setFilteredCourses([...courses]);
    } else {
      const temp_filterCourses = courses.filter(
        (t) => t.title.toLowerCase().indexOf(text.toLowerCase()) > -1
      );
      setFilteredCourses(temp_filterCourses);
    }
    setCount(filteredCourses.length);
  };

  const searchAvailable = (text: string) => {
    if (searching) {
      return;
    }
    setAvailableCourses(null);
    setAvailableCount(0);
    setAvailableParams({
      ...availableParams,
      page: 1,
      title: text,
    });
    const temp_availableParams = {
      ...availableParams,
      page: 1,
      title: text,
    };
    setSearching(true);
    courseSvc
      .getCourses({ ...temp_availableParams, count: true })
      .then((res) => {
        setAvailableCourses(res.courses);
        setAvailableCount(res.total);
        setSearching(false);
      })
      .catch((err) => {
        setAvailableCourses([]);
        setSearching(false);
      });
  };

  const loadMore = () => {
    setAvailableParams({
      ...availableParams,
      page: availableParams.page + 1,
    });

    const temp_availableParams = {
      ...availableParams,
      page: availableParams.page + 1,
    };

    courseSvc
      .getCourses({ ...temp_availableParams })
      .then((res) => {
        setAvailableCourses([...availableCourses, ...res.courses]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <>
      <div className="rounded-boxes bg-white">
        <div className="d-flex justify-content-between">
          <div className="section_heading_wrapper">
            <h1 className="section_top_heading">Classroom Courses ({count})</h1>
            <p className="section_sub_heading">
              These courses are visible to the students of the classroom
            </p>
          </div>

          {courses && (
            <div className="member-search my-3">
              <form
                className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  // search();
                }}
              >
                <input
                  type="text"
                  className="form-control border-0 my-0"
                  maxLength={50}
                  placeholder="Search for courses "
                  name="txtSearch"
                  value={title}
                  onChange={(e) => search(e.target.value)}
                />
                {title !== "" && (
                  <span
                    className="search-pause"
                    style={{ position: "absolute", top: "12px", right: "3px" }}
                    onClick={() => {
                      search("");
                    }}
                  >
                    <FontAwesomeIcon icon={faXmarkCircle} />
                  </span>
                )}

                <span className="m-0 w-auto h-auto">
                  <figure className="m-0 w-auto">
                    <img
                      className="m-0 h-auto mw-100"
                      src="/assets/images/search-icon-2.png"
                      alt=""
                    />
                  </figure>
                </span>
              </form>
            </div>
          )}
        </div>

        {courses ? (
          <div className="mt-3">
            <div className="box-area mb-0">
              <div className="box-area-wrap clearfix">
                <div className="row">
                  {filteredCourses?.map((item, index) => (
                    <div key={index} className="col-lg-4 col-6 mb-4">
                      <div className="slider">
                        <div className="box box_new bg-white pt-0 shadow">
                          <div
                            className="image-wrap cursor-pointer"
                            onClick={() => viewCourseDetails(item._id)}
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
                              // isProctored={test.isProctored}
                              // testMode={test.testMode}
                              // testType={test.testType}
                            />
                          </div>

                          <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
                            <div className="info pubCourseS p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={item.title}
                                onClick={() => viewCourseDetails(item._id)}
                                className="cursor-pointer"
                              >
                                {item.title}
                              </h4>
                              <SubjectComponent
                                className="mb-1"
                                subjects={item.subjects}
                              />
                            </div>

                            <div className="form-row mt-2">
                              <div className="col-6">
                                <a
                                  href="#"
                                  className="btn btn-outline btn-sm d-block"
                                  onClick={() => viewCourseDetails(item._id)}
                                >
                                  View
                                </a>
                              </div>

                              <div className="col-6">
                                <a
                                  href="#"
                                  className="btn btn-danger btn-sm d-block"
                                  onClick={() => removeCourse(item, index)}
                                >
                                  Remove
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
          </div>
        )}

        {courses && filteredCourses && !filteredCourses.length && (
          <div className="mt-3">
            <figure className="mx-auto">
              <img
                src="/assets/images/Search-rafiki.png"
                alt=""
                className="img-fluid d-block mx-auto no-result-img"
              />
            </figure>
            <p className="text-center">
              No Course in the classroom. Select one or more from the available
              courses.
            </p>
          </div>
        )}
      </div>
      <br></br>
      <div className="rounded-boxes bg-white">
        <div className="d-flex justify-content-between">
          <div className="section_heading_wrapper">
            <h1 className="section_top_heading">
              Available Courses ({availableCount})
            </h1>
            <p className="section_sub_heading">
              These courses are not linked to the classroom but are available
              for use now
            </p>
          </div>
          <div className="member-search my-3">
            <form
              className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
              onSubmit={(e) => {
                e.preventDefault();
                // searchAvailable();
              }}
            >
              <input
                type="text"
                className="form-control border-0 my-0"
                maxLength={50}
                placeholder="Search for courses "
                name="txtSearch"
                value={availableParams.title}
                onChange={(e) => searchAvailable(e.target.value)}
              />
              {availableParams.title !== "" && (
                <span
                  className="search-pause"
                  style={{ position: "absolute", top: "12px", right: "3px" }}
                  onClick={() => {
                    searchAvailable("");
                  }}
                >
                  <FontAwesomeIcon icon={faXmarkCircle} />
                </span>
              )}

              <span className="m-0 w-auto h-auto">
                <figure className="m-0 w-auto">
                  <img
                    className="m-0 h-auto mw-100"
                    src="/assets/images/search-icon-2.png"
                    alt=""
                  />
                </figure>
              </span>
            </form>
          </div>
        </div>

        {availableCourses ? (
          <div className="mt-3">
            <div className="box-area mb-0">
              <div className="box-area-wrap clearfix">
                <div className="row">
                  {availableCourses?.map((item, index) => (
                    <div key={index} className="col-lg-4 col-6 mb-4">
                      <div className="slider">
                        <div className="box box_new bg-white pt-0 shadow">
                          <div
                            className="image-wrap cursor-pointer"
                            onClick={() => viewCourseDetails(item._id)}
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
                              // isProctored={test.isProctored}
                              // testMode={test.testMode}
                              // testType={test.testType}
                            />
                          </div>

                          <div className="box-inner box-inner_new has-shdow no-bottom-info cardFontAll-imp1">
                            <div className="info pubCourseS p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={item.title}
                                onClick={() => viewCourseDetails(item._id)}
                                className="cursor-pointer"
                              >
                                {item.title}
                              </h4>
                              <SubjectComponent
                                className="mb-1"
                                subjects={item.subjects}
                              />
                              {/* <div className="row cardFontAll-imp3">
                              <div className="col-6 pl-2 student-time">
                                <div className="row">
                                  <span className="material-icons course">people</span>
                                  <span className="icon-text"> {item.students|numberToK}</span>
                                  <span className="icon-text">{item.students == 1 ? 'student' : 'students'}</span>
                                </div>
                              </div>

                              <div className="col-6 pr-2">
                                <div className="row">
                                  <span className="material-icons course">timelapse</span>
                                  <span className="icon-text">{item.timeSpent|militoHour|numberToK}</span>
                                  <span className="icon-text">hrs spent</span>
                                </div>
                              </div>
                            </div> */}
                            </div>

                            <div className="form-row mt-2">
                              {item.status === "published" && (
                                <div className="col">
                                  <a
                                    href="#"
                                    className="btn btn-outline btn-sm d-block"
                                    onClick={() => addCourse(item, index)}
                                  >
                                    Add
                                  </a>
                                </div>
                              )}

                              {item.status === "draft" && (
                                <div className="col">
                                  <a
                                    href="#"
                                    className={`btn btn-success btn-sm d-block ${
                                      item.processing ? "disabled" : ""
                                    }`}
                                    onClick={() => publishCourse(item)}
                                  >
                                    Publish
                                  </a>
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
            </div>

            {availableCourses.length < availableCount && (
              <div className="text-center mt-2">
                <button className="btn btn-light" onClick={loadMore}>
                  Load More
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
          </div>
        )}

        {availableCourses && !availableCourses.length && (
          <div className="mt-3">
            <figure className="mx-auto">
              <img
                src="/assets/images/Search-rafiki.png"
                alt=""
                className="img-fluid d-block mx-auto no-result-img"
              />
            </figure>
            <p className="text-center">No Course available.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ClassroomCourses;
