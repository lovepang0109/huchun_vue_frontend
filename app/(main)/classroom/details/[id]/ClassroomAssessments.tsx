import React, { useEffect, useState, useRef} from "react";
import * as testSvc from "@/services/practiceService";
import * as classSvc from "@/services/classroomService";

import { alert, success, error, confirm } from "alertifyjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { useRouter } from "next/navigation";
import { copyText as commonCopyText } from "@/lib/helpers";
import PImageComponent from "@/components/AppImage";
import SubjectComponent from "@/components/SubjectComponent";

const ClassroomAssessments = ({ classroom, settings, user }: any) => {
  const { push } = useRouter();

  const [title, setTitle] = useState<string>("");
  const [tests, setTests] = useState<any>(null);
  const [filteredTests, setFilteredTests] = useState<any>(null);
  const [count, setCount] = useState<number>(0);
  const [availableParams, setAvailableParams] = useState<any>({
    limit: 12,
    page: 1,
    accessMode: "invitation",
    multiStatus: "published,draft",
    sort: "title,1",
    notAdaptive: true,
    getPreference: true,
    title: "",
  });
  const [availableTests, setAvailableTests] = useState<any>(null);
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);
  const [tags, setTags] = useState<any>([{ name: "ALL", selected: true }]);
  const [showDropMenu, setShowDropMenu] = useState<any>([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    testSvc
      .findTeacherTests({
        noPaging: true,
        accessMode: "invitation",
        classRoom: classroom._id,
        multiStatus: "published,draft",
        sort: "title,1",
        getPreference: true,
      })
      .then((res) => {
        setTests(res.tests);
        setCount(res.tests.length);
        setFilteredTests(res.tests);
      })
      .catch((err) => {
        setTests([]);
      });

    setAvailableParams({
      ...availableParams,
      notInClass: classroom._id,
    });
    const avaiable_params = {
      ...availableParams,
      notInClass: classroom._id,
    };

    testSvc
      .findTeacherTests({ ...avaiable_params, includeCount: true })
      .then((res) => {
        setAvailableTests(res.tests);
        setAvailableCount(res.total);
      })
      .catch((err) => {
        setAvailableTests([]);
      });

    testSvc
      .findTeacherTestTags({ ...avaiable_params })
      .then((res) => {
        let updated_tags = tags;
        updated_tags = [
          ...tags,
          ...res.map((s) => {
            return {
              name: s,
              selected: false,
            };
          }),
        ];
        setTags(updated_tags);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const viewTestDetails = (test: any) => {
    push(`/assessment/details/${test._id}`);
  };

  const handleShowDropMenu = (index) => {
    const updatedShowDropMenu = [...showDropMenu];
    updatedShowDropMenu[index] = !updatedShowDropMenu[index];
    setShowDropMenu(updatedShowDropMenu);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropMenu([]);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addTest = (test: any, idx: string) => {
    confirm(
      "Do you want to add this assessment to the classroom? The students of this classroom will start using this assessment immediately. Please confirm.",
      () => {
        classSvc.addTestToClassroom(classroom._id, test._id).then(() => {
          success("Assessment is added successfully to classroom");
          const update_availableTests = [...availableTests];
          update_availableTests.splice(idx, 1);
          setAvailableTests(update_availableTests);

          setAvailableCount(availableCount - 1);

          setFilteredTests((prevTests) => [...prevTests, test]);
          setCount(count + 1);
          setTests((prevTests) => [...prevTests, test]);

          testSvc
            .findTeacherTests({
              ...availableParams,
              page: 1,
              limit: availableParams.limit * availableParams.page,
            })
            .then((res) => {
              setAvailableTests(res.tests);
            })
            .catch((err) => {
              console.error(err);
            });
        });
      }
    );
  };

  const publishTest = (test: any) => {
    if (!test.startDate && test.isProctored) {
      alert("Message", "Start date is required");
      return;
    }

    confirm("Are you sure you want to publish this Assessment?", (msg) => {
      test.processing = true;
      testSvc
        .checkQuestions(test._id)
        .then((res: any) => {
          testSvc
            .updateFunc(test._id, {
              ...test,
              status: "published",
              statusChangedAt: new Date().getTime(),
            })
            .subscribe((res: any) => {
              test.status = "published";
              test.statusChangedAt = new Date().getTime();

              success("Assessment is published successfully.");
              test.processing = false;
            })
            .catch((err) => {
              if (err.params) {
                alert("Message", err.message);
              } else {
                alert("Message", err);
              }
              test.processing = false;
            });
        })
        .catch((err) => {
          test.processing = false;
          if (err.error?.msg) {
            alert("Message", err.error.msg);
          } else {
            alert("Message", "Somethng went wrong, Please try after sometime.");
          }
        });
    });
  };

  const removeTest = (test: any, idx: string) => {
    confirm(
      "Do you want to remove the assessment from the classroom? The students of this classroom will no longer be able to take this assessment. Please confirm.",
      () => {
        classSvc.removeTestFromClassroom(classroom._id, test._id).then(() => {
          success("Assessment is removed successfully from classroom");
          const update_filterTests = [...filteredTests];
          update_filterTests.splice(idx, 1);
          setFilteredTests(update_filterTests);
          setCount(count - 1);
          const update_availableTests = availableTests;
          update_availableTests.push(test);
          setAvailableTests(update_availableTests);
          setAvailableCount(availableCount + 1);

          const ti = tests.findIndex((t) => t._id == test._id);
          const update_tests = tests.splice(ti, 1);
          setTests(update_tests);
        });
      }
    );
  };

  const searchAvailable = (text: string, tags?: string) => {
    if (searching) {
      return;
    }
    setAvailableTests(null);
    setAvailableCount(0);
    let temp_availableParams;
    if (tags) {
      temp_availableParams = {
        ...availableParams,
        page: 1,
        title: text,
        tags: tags,
      };
    } else {
      temp_availableParams = {
        ...availableParams,
        page: 1,
        title: text,
      };
    }
    setAvailableParams({
      ...availableParams,
      page: 1,
      title: text,
    });

    setSearching(true);

    testSvc
      .findTeacherTests({ ...temp_availableParams, includeCount: true })
      .then((res) => {
        setAvailableTests(res.tests);
        setAvailableCount(res.total);
        setSearching(false);
      })
      .catch((err) => {
        setAvailableTests([]);
        setSearching(false);
      });
  };

  const filterByTag = (tag: any) => {
    let temp_tags;
    if (tag.name == "ALL") {
      const update_tags = tags;
      update_tags.forEach((t) => (t.selected = t.name == "ALL"));
      setTags(update_tags);
      tag.selected = true;
    } else {
      tag.selected = !tag.selected;

      if (!tags.find((t) => t.selected)) {
        const update_tags = tags;
        update_tags.find((t) => t.name == "ALL").selected = true;
        setTags(update_tags);
      } else {
        const update_tags = tags;
        update_tags.find((t) => t.name == "ALL").selected = false;
        setTags(update_tags);
      }
    }

    if (tags.find((t) => t.selected).name == "ALL") {
      delete availableParams.tags;
    } else {
      setAvailableParams({
        ...availableParams,
        tags: tags
          .filter((t) => t.selected)
          .map((t) => t.name)
          .join(","),
      });
      temp_tags = tags
        .filter((t) => t.selected)
        .map((t) => t.name)
        .join(",");
    }

    if (temp_tags) {
      searchAvailable(
        availableParams.title,
        tags
          .filter((t) => t.selected)
          .map((t) => t.name)
          .join(",")
      );
    } else {
      searchAvailable(availableParams.title);
    }
  };

  const loadMore = () => {
    setAvailableParams({
      ...availableParams,
      page: availableParams.page + 1,
    });
    const temp_params = {
      ...availableParams,
      page: availableParams.page + 1,
    };

    testSvc
      .findTeacherTests({ ...temp_params })
      .then((res) => {
        setAvailableTests((prev) => [...prev, ...res.tests]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const search = (text: string) => {
    setTitle(text);
    let update_filtertests;
    if (!text) {
      update_filtertests = [...tests];
      setFilteredTests([...tests]);
    } else {
      update_filtertests = tests.filter(
        (t) => t.title.toLowerCase().indexOf(text.toLowerCase()) > -1
      );
      setFilteredTests(update_filtertests);
    }
    setCount(update_filtertests.length);
  };

  const copyTestLink = (test: any) => {
    if (!classroom.joinByCode) {
      alert(
        "Message",
        "Allow student to join by code is off in classroom setting. Please turn it on and try again."
      );
      return;
    }

    const val =
      "https://react.practiz.xyz/start/" + test.testCode + classroom.seqCode;
    commonCopyText(val);
    success("Successfully Copied");
  };

  const reviewTest = (test: any) => {
    if (!test.totalQuestion) {
      alert(
        "Message",
        "No questions are added to review. Please add some questions in assessment to review."
      );
      return;
    }
    push(`/assessment/review/${test._id}?classId=${classroom._id}`);
  };

  const getBaseUrl = () => {
    return user.primaryInstitute?.site
      ? user.primaryInstitute.site
      : settings.baseUrl;
  };

  const openAnswerSheet = (test: any) => {
    push(
      `/assessment/details/${test._id}?classId=${classroom._id}&menu=answersheet`
    );
  };

  return (
    <>
      <div className="rounded-boxes bg-white">
        <div className="d-flex justify-content-between">
          <div className="section_heading_wrapper">
            <h1 className="section_top_heading">
              Classroom Assessments ({count})
            </h1>
            <p className="section_sub_heading">
              These assessments are visible to the students of the classroom.
            </p>
          </div>

          {tests && (
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
                  placeholder="Search for assessments "
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
        <div>
          {tests ? (
            <div className="mt-3 box-area mb-0">
              <div className="box-area-wrap clearfix">
                <div className="row">
                  {filteredTests.map((test, i) => (
                    <div key={i} className="col-lg-4 col-6 mb-4">
                      <div className="slider">
                        <div className="box box_new bg-white pt-0 shadow">
                          <div
                            className="cursor-pointer"
                            onClick={() => viewTestDetails(test)}
                          >
                            <PImageComponent
                              height={120}
                              fullWidth
                              imageUrl={test.imageUrl}
                              backgroundColor={test.colorCode}
                              text={test.title}
                              radius={9}
                              fontSize={15}
                              type="assessment"
                              isProctored={test.isProctored}
                              testMode={test.testMode}
                              // testType={test.testType}
                            />
                          </div>
                          <div className="box-inner box-inner_new">
                            <div className="info p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={test.title}
                                className="mt-0 mb-0 cursor-pointer"
                                onClick={() => viewTestDetails(test)}
                              >
                                {test.title}
                              </h4>
                              <SubjectComponent
                                className="mb-1"
                                subjects={test.subjects}
                              />
                            </div>
                            <div className="form-row mt-1">
                              <div className="detailed col-6 small">
                                <div className="d-flex align-items-center">
                                  <span className="material-icons">
                                    content_paste
                                  </span>
                                  <span className="stud2 ml-1 text-truncate">
                                    <strong>
                                      {test.totalQuestion > 0
                                        ? test.totalQuestion
                                        : "No"}
                                    </strong>{" "}
                                    questions
                                  </span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <span className="material-icons">
                                    timelapse
                                  </span>
                                  <span className="stud2 ml-1 text-truncate">
                                    <strong className="text-black">
                                      {test.totalTime}
                                    </strong>{" "}
                                    minutes
                                  </span>
                                </div>
                              </div>
                              <div className="detailed col-6 small">
                                <div className="d-flex align-items-center">
                                  <span className="material-icons">people</span>
                                  <span className="stud2 ml-1 text-truncate">
                                    <strong>
                                      {test.totalJoinedStudent > 0
                                        ? test.totalJoinedStudent
                                        : "No"}
                                    </strong>{" "}
                                    {test.totalJoinedStudent === 1
                                      ? "student"
                                      : "students"}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <span className="material-icons">
                                    assignment
                                  </span>
                                  <span className="stud2 ml-1 text-truncate">
                                    <strong>
                                      {test.totalAttempt > 0
                                        ? test.totalAttempt
                                        : "No"}
                                    </strong>{" "}
                                    Attempt(s)
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="form-row mt-2">
                              <div className="col-auto">
                                <a
                                  className="btn btn-outline btn-sm d-block"
                                  onClick={() => reviewTest(test)}
                                >
                                  Review
                                </a>
                              </div>
                              <div className="col">
                                <a
                                  className="btn btn-light btn-sm d-block"
                                  onClick={() => viewTestDetails(test)}
                                >
                                  View Details
                                </a>
                              </div>
                              <div className="col">
                                <div className="btn-group w-100 open show" ref={dropdownRef}>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeTest(test, i)}
                                  >
                                    Remove
                                  </button>
                                  <button
                                    id="button-split"
                                    type="button"
                                    className="btn btn-outline btn-sm dropdown-toggle dropdown-toggle-split"
                                    aria-controls="dropdown-split"
                                    onClick={(e) => handleShowDropMenu(i)}
                                  >
                                    <span className="caret"></span>
                                    <span className="sr-only">
                                      Split button!
                                    </span>
                                  </button>
                                  {showDropMenu[i] && (
                                    <ul
                                      id="dropdown-split"
                                      className="dropdown-menu"
                                      role="menu"
                                      aria-labelledby="button-split"
                                      style={{ display: "block" }}
                                      ref={dropdownRef}
                                    >
                                      <li role="menuitem">
                                        <a
                                          className="dropdown-item"
                                          onClick={() => copyTestLink(test)}
                                        >
                                          Copy URL
                                        </a>
                                      </li>
                                      {test.totalAttempt > 0 && (
                                        <li role="menuitem">
                                          <a
                                            className="dropdown-item"
                                            onClick={() =>
                                              openAnswerSheet(test)
                                            }
                                          >
                                            View Answer Sheet
                                          </a>
                                        </li>
                                      )}
                                    </ul>
                                  )}
                                </div>
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
          ) : (
            <div className="mt-3">
              <div className="my-2">
                <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
              </div>
              <div className="my-2">
                <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
              </div>
            </div>
          )}
        </div>
        {tests && filteredTests && !filteredTests.length && (
          <div className="mt-3">
            <figure className="mx-auto">
              <img
                src="/assets/images/Search-rafiki.png"
                alt=""
                className="img-fluid d-block mx-auto no-result-img"
              />
            </figure>
            <p className="text-center">
              No Assessment in the classroom. Select one or more from the
              available assessments.
            </p>
          </div>
        )}
      </div>
      <br></br>
      <div className="rounded-boxes bg-white">
        <div className="d-flex justify-content-between">
          <div className="section_heading_wrapper">
            <h1 className="section_top_heading">
              Available Assessments ({availableCount})
            </h1>
            <p className="section_sub_heading">
              These assessments are not linked to the classroom but are
              available for use now.
            </p>
          </div>

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
                placeholder="Search for assessments "
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
      </div>
      {availableTests && availableTests.length > 0 ? (
        <div className="mt-3">
          <div className="d-flex flex-wrap gap-xs mb-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className={`btn btn-sm ${
                  tag.selected ? "btn-success" : "btn-outline"
                }`}
                onClick={() => filterByTag(tag)}
              >
                {tag.name}
              </div>
            ))}
          </div>

          <div className="box-area mb-0">
            <div className="box-area-wrap clearfix">
              <div className="row">
                {availableTests.map((test, i) => (
                  <div key={i} className="col-lg-4 col-6 mb-4">
                    <div className="slider">
                      <div className="box box_new bg-white pt-0 shadow">
                        <div
                          className="cursor-pointer"
                          onClick={() => viewTestDetails(test)}
                        >
                          <PImageComponent
                            height={120}
                            fullWidth
                            imageUrl={test.imageUrl}
                            backgroundColor={test.colorCode}
                            text={test.title}
                            radius={9}
                            fontSize={15}
                            type="assessment"
                            isProctored={test.isProctored}
                            testMode={test.testMode}
                            // testType={test.testType}
                          />
                        </div>
                        <div className="box-inner box-inner_new">
                          <div className="info p-0 m-0">
                            <h4
                              data-toggle="tooltip"
                              data-placement="top"
                              title={test.title}
                              className="mt-0 mb-0 cursor-pointer"
                              onClick={() => viewTestDetails(test)}
                            >
                              {test.title}
                            </h4>
                            <SubjectComponent
                              className="mb-1"
                              subjects={test.subjects}
                            />
                          </div>
                          <div className="form-row mt-1">
                            <div className="detailed col-6 small">
                              <div className="d-flex align-items-center">
                                <span className="material-icons">
                                  content_paste
                                </span>
                                <span className="stud2 ml-1 text-truncate">
                                  <strong>
                                    {test.totalQuestion > 0
                                      ? test.totalQuestion
                                      : "No"}
                                  </strong>{" "}
                                  questions
                                </span>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="material-icons">
                                  timelapse
                                </span>
                                <span className="stud2 ml-1 text-truncate">
                                  <strong className="text-black">
                                    {test.totalTime}
                                  </strong>{" "}
                                  minutes
                                </span>
                              </div>
                            </div>
                            <div className="detailed col-6 small">
                              <div className="d-flex align-items-center">
                                <span className="material-icons">people</span>
                                <span className="stud2 ml-1 text-truncate">
                                  <strong>
                                    {test.totalJoinedStudent > 0
                                      ? test.totalJoinedStudent
                                      : "No"}
                                  </strong>{" "}
                                  {test.totalJoinedStudent === 1
                                    ? "student"
                                    : "students"}
                                </span>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="material-icons">
                                  assignment
                                </span>
                                <span className="stud2 ml-1 text-truncate">
                                  <strong>
                                    {test.totalAttempt > 0
                                      ? test.totalAttempt
                                      : "No"}
                                  </strong>{" "}
                                  Attempt(s)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="form-row mt-2">
                            <div className="col-auto">
                              <a
                                className="btn btn-outline btn-sm d-block"
                                onClick={() => reviewTest(test)}
                              >
                                Review
                              </a>
                            </div>
                            <div className="col">
                              <a
                                className="btn btn-light btn-sm d-block"
                                onClick={() => viewTestDetails(test)}
                              >
                                View Details
                              </a>
                            </div>
                            {test.status === "published" && (
                              <div className="col">
                                <button
                                  className="btn btn-primary btn-sm d-block"
                                  onClick={() => addTest(test, i)}
                                  disabled={test.processing}
                                >
                                  Add
                                </button>
                              </div>
                            )}
                            {test.status === "draft" && (
                              <div className="col">
                                <button
                                  className="btn btn-success btn-sm d-block"
                                  onClick={() => publishTest(test)}
                                  disabled={test.processing}
                                >
                                  Publish
                                </button>
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

          {availableCount > availableTests.length && (
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
        </div>
      )}
      {availableTests && !availableTests.length && (
        <div className="mt-3">
          <figure className="mx-auto">
            <img
              src="/assets/images/Search-rafiki.png"
              alt=""
              className="img-fluid d-block mx-auto no-result-img"
            />
          </figure>
          <p className="text-center">No Assessment available.</p>
        </div>
      )}
    </>
  );
};

export default ClassroomAssessments;
