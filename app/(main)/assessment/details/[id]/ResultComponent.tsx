import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { MenuItemSort } from "@/interfaces/interface";

import * as adminService from "@/services/adminService";
import * as serviceSvc from "@/services/suportService";
import * as attemptService from "@/services/attemptService";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";

import { success, error, alert } from "alertifyjs";
import { slugify } from "@/lib/validator";
import { getFileNameFromResponse, saveBlobFromResponse } from "@/lib/common";
import Link from "next/link";

const ResultComponent = ({
  practice,
  setPractice,
  practicesetId,
  updatePractice,
  user,
  clientData,
  selectedSideMenu,
  downloading,
  setDownloading
}: any) => {
  const router = useRouter();
  const [paramsData, setParamsData] = useState<any>({
    limit: 20,
    page: 1,
    sort: "pecentCorrects,-1",
    includeCount: true,
    classroom: [],
  });
  const [totalItems, setTotalItems] = useState<number>(0);
  const [results, setResults] = useState<any>([]);
  const [practiceClassroom, setPracticeClassroom] = useState<any>([]);
  const [practiceClassrooms, setPracticeClassrooms] = useState<any>([]);
  const [reverse, setReverse] = useState<boolean>(true);
  const [activeMenuSort, setActiveMenuSort] =
    useState<string>("pecentCorrects");
  const [selectedMenuText, setSelectedMenuText] =
    useState<string>("Arrange By Marks");
  const [menuItemSort, setMenuItemSort] = useState<MenuItemSort>({
    totalTimeTaken: "Arrange By Time Taken",
    pecentCorrects: "Arrange By Marks",
    studentName: "Arrange By Name",
    rollNumber: "Arrange By Roll Number",
  });

  const [paging, setPaging] = useState<any>({
    currentPage: 0,
  });
  const [searchText, setSearchText] = useState<string>("");
  const [totalTimeMil, setTotalTimeMil] = useState<any>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(false);

  const get_downloading = () => {
    return downloading;
  };

  const set_dwonloading = (value: boolean) => {
    if (downloading !== value) {
      setDownloading(value);

      if (downloading) {
        excelExport();
      }
    }
  };

  useEffect(() => {
    if (downloading) {
      excelExport();
    }
  }, [downloading])

  useEffect(() => {
    setTotalItems(practice.totalItems * 60 * 1000);
    if (practice.accessMode == "invitation") {
      if (practice.testType == "psychometric") {
        attemptService
          .getPsychoClassroom(practicesetId)
          .then((res: any) => {
            setPracticeClassroom(res);
            const temp_classroom = res.map((e: any) => e._id);
            setParamsData({
              ...paramsData,
              classroom: temp_classroom,
            });
            loadResult();
          })
          .catch((err: any) =>
            alert("Something went wrong while fetching classroom info", err)
          );
      } else {
        attemptService
          .getClassroomByTest(practicesetId)
          .then((res: any) => {
            setPracticeClassroom(res);
            const temp_classroom = res.map((e: any) => e._id);
            setParamsData({
              ...paramsData,
              classroom: temp_classroom,
            });
            loadResult();
          })
          .catch((err: any) =>
            alert("Something went wrong while fetching classroom info", err)
          );
      }
    } else {
      loadResult();
    }
  }, []);

  const loadResult = (params?: any) => {
    if (!params) {
      params = paramsData;
    }
    if (practice.testType == "psychometry") {
      attemptService
        .summaryPsychoPractice(practicesetId, params)
        .then((res: any) => {
          if (res.total) {
            setTotalItems(res?.total);
          }
          setResults(res?.attempts);
        });
    } else {
      // Load all result
      attemptService
        .summaryAttemptedPractice(practicesetId, params)
        .then((res: any) => {
          if (res?.count) {
            setTotalItems(res?.total);
          }
          setResults(res?.attempts);
          setServices(res?.attempts);
        });
    }
  };

  const onPaging = () => {
    const params = { ...paramsData };
    delete params.includeCount;
    loadResult(params);
  };

  const setServices = (sList: any) => {
    if (sList?.length) {
      serviceSvc
        .getTaggingServicesForStudents(sList.map((r: any) => r.user))
        .then((serviceMap: any) => {
          for (const r of sList) {
            if (serviceMap[r.user]) {
              r.services = serviceMap[r.user].services;
            }
          }
        });
    }
  };

  const filterData = (classrooms: any, name?: any) => {
    if (classrooms == "all") {
      const temp_classroom = practiceClassroom.map((e: any) => e._id);
      setParamsData({
        ...paramsData,
        classroom: temp_classroom,
      });
      setSelectedClassroom("All");
    } else if (classrooms) {
      setParamsData({
        ...paramsData,
        classroom: [classrooms],
      });
      setSelectedClassroom(name);
    } else {
      setParamsData({
        ...paramsData,
        classroom: [],
      });
      setSelectedClassroom("Select a classroom");
    }
    loadResult();
  };

  const sort = ($sort: string, $des: any, $filtername: string) => {
    setSelectedMenuText($filtername);
    setReverse($des);
    setReverse(activeMenuSort === $sort ? !reverse : false);
    setActiveMenuSort($sort);
    const asc = reverse === false ? "1" : "-1";
    setParamsData({ ...paramsData, sort: $sort + "," + asc });

    attemptService
      .summaryAttemptedPractice(practice._id, paramsData)
      .then((res: any) => {
        setResults(res?.attempts);
        setServices(res?.attempts);
      });
  };

  const search = (text: string) => {
    setSearchText(text);
    setParamsData({
      ...paramsData,
      searchText: text,
      page: 1,
    });
    setPaging({
      currentPage: 1,
    });
    loadResult();
  };

  const excelExport = () => {
    const query: any = { test: practice._id, directDownload: true };
    if (paramsData.classroom) {
      query["classrooms"] = paramsData.classroom;
    }
    query["center"] = user.activeLocation;
    adminService
      .downloadReportData(
        practice.testType == "psychometry"
          ? "downloadStudentPersonalityResultByTest"
          : "downloadTestResult",
        query
      )
      .then(
        (res: any) => {
          setDownloading(false)
          saveBlobFromResponse({
            fileName: slugify(practice.title),
            blob: res.blob,
          });
        },
        (err) => {
          console.log(err);
          setDownloading(false)
        }
      );
  };

  const updateAttempt = (attempt: any) => {
    attempt.isAbandoned = true;
    attemptService.updateAbandonStatus(attempt._id).then((d: any) => {
      loadResult();
      success("Attempt has updated successfully.");
    });
  };

  const downloadPsychoForStudent = (psychoAttempt: any) => {
    psychoAttempt.downloading = true;

    adminService
      .downloadReportData("exportpsychometryresult", {
        user: psychoAttempt.user._id,
        test: practice._id,
        directDownload: true,
      })
      .then((res: any) => {
        saveBlobFromResponse({
          fileName: slugify(psychoAttempt.user.name + " - " + practice.title),
          blob: res.blob,
        });
        psychoAttempt.downloading = false;
      })
      .catch((error) => {
        console.error("Error downloading psychometry data:", error);
        psychoAttempt.downloading = false;
      });
  };

  const clearSearch = () => {
    setSearchText("");
    search("");
  };

  const convertMillisToMinutes = (milliseconds: number): string => {
    if (milliseconds === 0) {
      return "0 min";
    }

    let minutes = Math.round(milliseconds / 1000 / 60);

    if (minutes < 2) {
      return "1 min";
    }

    return minutes + " mins";
  };

  const timeAgo = (timestamp: any) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 0) {
      return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 0) {
      return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 0) {
      return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 0) {
      return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 0) {
      return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    }
    return Math.floor(seconds) + " second" + (seconds > 1 ? "s" : "") + " ago";
  };

  return (
    <>
      <main className="pt-0">
        <div className="assessment-settings non-stepper">
          <div className="dashboard-area classroom mx-auto">
            <div className="class-board folder-board bg-white rounded-boxes text-black">
              <div className="title allDetailPagePosition mb-3 p-0">
                <div className="d-lg-block">
                  <div className="tab-content">
                    <div
                      className="tab-pane show active fade"
                      id="searchResult_1"
                    >
                      <div className="row filter-area nonStepper mb-3 clearfix">
                        {practiceClassroom &&
                          practiceClassroom.length > 0 ? (

                          <div className="col-lg-3 col-12 mb-2">
                            <div className="filter-item">
                              <div className="form-boxes mb-1">
                                <h4 className="form-box_subtitle">Classroom</h4>
                              </div>
                              <div className="dropdown new-padding-1">
                                <a
                                  className="btn dropdown-toggle text-left arranged-border"
                                  type="button"
                                  id="filterDurations"
                                  style={{ border: "1.125px solid #cfcfcf;" }}
                                  data-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <span>{selectedClassroom}</span>
                                </a>
                                <div
                                  className="dropdown-menu border-0 py-0 w-100"
                                  aria-labelledby="filterLavel"
                                >
                                  <a
                                    className="dropdown-item"
                                    onClick={() => filterData("all")}
                                  >
                                    All
                                  </a>
                                  {practiceClassroom.map((classRoom: any) => (
                                    <a
                                      key={classRoom._id}
                                      className="dropdown-item pre-wrap"
                                      onClick={() =>
                                        filterData(
                                          classRoom._id,
                                          classRoom.name
                                        )
                                      }
                                    >
                                      {classRoom.name}
                                    </a>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : (
                          // <div className="dropdown new-padding-b">
                          //   <span>No Classroom</span>
                          // </div>
                          <></>
                        )}
                        {practice.testType != "psychometry" && (
                          <div className="col-lg-3 col-12 mb-2">
                            <div className="filter-item arrange-response">
                              <div className="form-boxes mb-1">
                                <h4 className="form-box_subtitle">
                                  Arranged By
                                </h4>
                              </div>

                              <div className="dropdown new-padding-1">
                                <a
                                  className="btn dropdown-toggle text-left arranged-border"
                                  type="button"
                                  id="filterDurations"
                                  style={{ border: "1.125px solid #cfcfcf;" }}
                                  data-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <span>{selectedMenuText}</span>
                                </a>

                                <div
                                  className="dropdown-menu border-0 py-0 w-100"
                                  aria-labelledby="filterDurations"
                                >
                                  <button
                                    className={`dropdown-item ${activeMenuSort === "pecentCorrects"
                                      ? "selected"
                                      : ""
                                      }`}
                                    onClick={() =>
                                      sort(
                                        "pecentCorrects",
                                        "reverse",
                                        "Arrange By Marks"
                                      )
                                    }
                                  >
                                    Arrange By Marks
                                  </button>
                                  <button
                                    className={`dropdown-item ${activeMenuSort === "totalTimeTaken"
                                      ? "selected"
                                      : ""
                                      }`}
                                    onClick={() =>
                                      sort(
                                        "totalTimeTaken",
                                        "reverse",
                                        "Arrange By Time Taken"
                                      )
                                    }
                                  >
                                    Arrange By Time Taken
                                  </button>
                                  <button
                                    className={`dropdown-item ${activeMenuSort === "studentName"
                                      ? "selected"
                                      : ""
                                      }`}
                                    onClick={() =>
                                      sort(
                                        "studentName",
                                        "reverse",
                                        "Arrange By Name"
                                      )
                                    }
                                  >
                                    Arrange By Name
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="col-lg-5 col-12 ml-auto align-self-end">
                          <div className="filter-item pt-3">
                            <form
                              className="form-group search-box common_search-type-1"
                              onSubmit={(e) => {
                                e.preventDefault(); // Prevent default form submission behavior
                              }}
                            >
                              <span>
                                <figure>
                                  <img
                                    className="search-icon"
                                    src="/assets/images/search-icon-2.png"
                                    alt="search icon"
                                  />
                                </figure>
                              </span>

                              <input
                                type="text"
                                className="form-control border-0 flex-grow-1 flex-basic-0"
                                placeholder="Search By User ID/Name."
                                name="txtSearch"
                                value={searchText}
                                onChange={(e) => search(e.target.value)}
                              // disabled={disabled}
                              />

                              {searchText && (
                                <div
                                  onClick={clearSearch}
                                  className="result-close-icon"
                                >
                                  <figure>
                                    <img
                                      src="/assets/images/close3.png"
                                      alt="clear icon"
                                      className="clear-icon"
                                    />
                                  </figure>
                                </div>
                              )}
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {!loading ? (
                  <>
                    {practice.testType != "psychometry" &&
                      results &&
                      results.length && (
                        <div className="folder-area clearfix">
                          <div className="table-wrap table-responsive">
                            <table className="table response-result mb-0 vertical-middle">
                              <thead>
                                <tr>
                                  <th className="border-0 ml-66px">Name</th>
                                  <th className="border-0 text-center">
                                    Response
                                  </th>
                                  <th className="border-0 text-center">Time</th>
                                  <th className="border-0 text-center">
                                    Score
                                  </th>
                                  <th className="border-0 text-center">
                                    Percentile
                                  </th>
                                  {clientData?.features?.fraudDetect &&
                                    practice.testMode === "proctored" && (
                                      <th className="border-0">
                                        Genuinity Penalty
                                      </th>
                                    )}
                                  <th className="border-0"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {results?.map((result: any) => (
                                  <tr
                                    key={result._id}
                                    className={
                                      clientData?.features?.fraudDetect &&
                                        result.fraudPenalty >= 2.25
                                        ? "fraud-attempt"
                                        : ""
                                    }
                                  >
                                    <td className="pr-0">
                                      <div className="folder mb-0 p-0">
                                        <div className="p-0 border-0 clearfix">
                                          <div className="d-flex inner pl-0">
                                            <figure className="user_img_circled_wrap">
                                              {result?.avatar?.length > 0 ? (
                                                <img
                                                  className="user_img_circled"
                                                  src={`${result.avatar}`}
                                                  alt="user-img"
                                                />
                                              ) : (
                                                <img
                                                  className="user_img_circled"
                                                  src="/assets/images/defaultProfile.png"
                                                  alt="user-img"
                                                />
                                              )}
                                            </figure>
                                            <div className="inners ml-2">
                                              <div className="d-flex align-items-center">
                                                <h4>{result.studentName}</h4>
                                                {result.services && (
                                                  <div className="d-flex align-items-center">
                                                    {result.services.map(
                                                      (
                                                        service: any,
                                                        index: any
                                                      ) => (
                                                        <span
                                                          key={index}
                                                          className={`${service.type}_${service.duration}_${service.durationUnit} ml-1`}
                                                          title={`Service: ${service.title
                                                            } (${service.duration
                                                            } ${service.durationUnit
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                            service.durationUnit.slice(
                                                              1
                                                            )
                                                            }${service.duration > 1
                                                              ? "s"
                                                              : ""
                                                            })`}
                                                        ></span>
                                                      )
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                              <p>{result.userId}</p>
                                              <p>{timeAgo(result.startTime)}</p>
                                              {result.isAbandoned && (
                                                <p
                                                  onClick={() =>
                                                    updateAttempt(result)
                                                  }
                                                  className="text-danger cursor-pointer"
                                                >
                                                  Abandoned
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="d-flex justify-content-center gap-xs">
                                        <h4
                                          className="f-14 correct-dot"
                                          title="Correct"
                                        >
                                          {result.totalCorrects}
                                        </h4>
                                        <h4
                                          className="f-14 incorrect-dot"
                                          title="Incorrect"
                                        >
                                          {result.totalErrors}
                                        </h4>
                                        <h4
                                          className="f-14 missed-dot"
                                          title="Missed"
                                        >
                                          {result.totalMissed}
                                        </h4>
                                        {result.totalPartial > 0 && (
                                          <h4
                                            className="f-14 partial-dot"
                                            title="Partial"
                                          >
                                            {result.totalPartial}
                                          </h4>
                                        )}
                                        {result.totalPending > 0 && (
                                          <h4
                                            className="f-14 pending-dot"
                                            title="Pending"
                                          >
                                            {result.totalPending}
                                          </h4>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <div className="progresss text-center">
                                          <h4 className="f-14">
                                            {convertMillisToMinutes(
                                              result.totalTimeTaken
                                            )}
                                          </h4>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <h4 className="f-14">
                                          {practice.fullLength &&
                                            practice.viewTemplate === "SAT"
                                            ? result.SAT?.total || 400
                                            : practice.fullLength &&
                                              practice.viewTemplate === "ACT"
                                              ? result.ACT || 9
                                              : result.totalMark.toFixed(2)}
                                        </h4>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <h4 className="f-14">{result.rank}</h4>
                                      </div>
                                    </td>
                                    {clientData?.features?.fraudDetect &&
                                      practice.testMode === "proctored" && (
                                        <td>
                                          <div className="progresss text-center">
                                            <h4 className="f-14">
                                              {result.fraudPenalty.toFixed(2)}
                                            </h4>
                                          </div>
                                        </td>
                                      )}
                                    <td>
                                      <div className="d-flex gap-xs">
                                        <Link
                                          className="btn btn-sm btn-outline"
                                          href={`/assessment/student-attempt-summary/${result._id}?percentile=${result.rank}`}
                                        >
                                          <span className="edit">View</span>
                                        </Link>
                                        <Link
                                          className="btn btn-sm btn-outline"
                                          href={`/assessment/review/${practicesetId}?attemptId=${result._id}`}
                                        >
                                          <span className="edit">Review</span>
                                        </Link>
                                        {clientData?.features?.evaluation &&
                                          !result.isEvaluated && (
                                            <a
                                              className="btn btn-sm btn-outline"
                                              href={`/${user.role}/evaluation/details/${practicesetId}?system=1&attemptId=${result._id}`}
                                            >
                                              <span>Evaluate</span>
                                            </a>
                                          )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {totalItems > paramsData.limit && (
                              <div className="text-center mt-3">
                                <div className="d-inline-block">
                                  {/* <pagination totalItems={totalItems} itemsPerPage={paramsData.limit} value={paramsData.page} onChange={(value) => onPaging(value)} maxSize={10} /> */}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    {practice.testType == "psychometry" &&
                      results &&
                      results.length && (
                        <div className="folder-area clearfix">
                          <div className="table-wrap table-responsive">
                            <table className="table response-result mb-0 vertical-middle">
                              <thead>
                                <tr>
                                  <th className="border-0 ml-66px">Name</th>
                                  <th className="border-0 text-center">
                                    Neuroticism
                                  </th>
                                  <th className="border-0 text-center">
                                    Extraversion
                                  </th>
                                  <th className="border-0 text-center">
                                    Openness
                                  </th>
                                  <th className="border-0 text-center">
                                    Agreeableness
                                  </th>
                                  <th className="border-0 text-center">
                                    Conscientiousness
                                  </th>
                                  <th></th>
                                </tr>
                              </thead>

                              <tbody>
                                {results.map((result: any) => (
                                  <tr key={result._id}>
                                    <td className="pr-0">
                                      <div className="folder mb-0 p-0">
                                        <div className="p-0 border-0 clearfix">
                                          <div className="d-flex inner pl-0">
                                            <figure className="user_img_circled_wrap">
                                              <img
                                                className="user_img_circled"
                                                src={`${result.user.avatar}`}
                                                alt="user-img"
                                              />
                                            </figure>
                                            <div className="inners ml-2">
                                              <div className="d-flex align-items-center">
                                                <h4>{result.user.name}</h4>
                                              </div>
                                              <p>{result.user.rollNumber}</p>
                                              <p>{result.createdAt}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <h4 className="f-14">
                                          {result.neuroticism}
                                        </h4>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <h4 className="f-14">
                                          {result.extraversion}
                                        </h4>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <h4 className="f-14">
                                          {result.openness}
                                        </h4>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <h4 className="f-14">
                                          {result.agreeableness}
                                        </h4>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="progresss text-center">
                                        <h4 className="f-14">
                                          {result.conscientiousness}
                                        </h4>
                                      </div>
                                    </td>
                                    <td>
                                      <button
                                        className="btn btn-sm"
                                        onClick={() =>
                                          downloadPsychoForStudent(result)
                                        }
                                        disabled={result.downloading}
                                      >
                                        {!result.downloading ? (
                                          <span className="material-icons d-block ah-cursor">
                                            download
                                          </span>
                                        ) : (
                                          <i className="fa fa-spinner fa-pulse"></i>
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </>
                ) : (
                  <>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                  </>
                )}
              </div>
              {!loading && (!results || !results.length) && (
                <div className="empty-data">
                  <svg
                    id="b4e67b16-eb74-42a6-b922-9d4e1a643c89"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="500"
                    height="584.36886"
                    viewBox="0 0 1036 784.36886"
                  >
                    <title>result</title>
                    <path
                      d="M760.3971,57.81557,571.58623,268.54987A93.59629,93.59629,0,1,1,446.98448,407.6196L183.98192,701.16027a431.11734,431.11734,0,0,0,265.19837,90.715c239.14941,0,433.01786-193.86875,433.01786-433.01785A431.55472,431.55472,0,0,0,760.3971,57.81557Z"
                      transform="translate(-82 -57.81557)"
                      fill="#f2f2f2"
                    />
                    <circle
                      cx="435.41672"
                      cy="289.50597"
                      r="56.4927"
                      fill="#f2f2f2"
                    />
                    <rect
                      x="95.56776"
                      y="394.39221"
                      width="617.22853"
                      height="388.91696"
                      fill="#3f3d56"
                    />
                    <path
                      d="M855.44477,259.418s-39.78248-1.6128-40.85768,39.24488,0,75.80175,0,75.80175h79.565V300.81332S892.53925,262.106,855.44477,259.418Z"
                      transform="translate(-82 -57.81557)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M839.91584,332.23292s2.36184,26.76756-5.511,29.12941,3.14912,36.21494,3.14912,36.21494l31.49125,7.08553,18.10747-36.21494L879.2799,358.2132s-13.38378-18.10747-7.08553-30.704S839.91584,332.23292,839.91584,332.23292Z"
                      transform="translate(-82 -57.81557)"
                      fill="#ffb9b9"
                    />
                    <path
                      d="M839.91584,332.23292s2.36184,26.76756-5.511,29.12941,3.14912,36.21494,3.14912,36.21494l31.49125,7.08553,18.10747-36.21494L879.2799,358.2132s-13.38378-18.10747-7.08553-30.704S839.91584,332.23292,839.91584,332.23292Z"
                      transform="translate(-82 -57.81557)"
                      opacity="0.1"
                    />
                    <circle
                      cx="768.93777"
                      cy="256.30988"
                      r="30.70397"
                      fill="#ffb9b9"
                    />
                    <path
                      d="M731.271,419.62114s-18.89475,14.17107-13.38378,25.193,22.04387,48.81144,22.04387,48.81144,3.14913,29.12941,16.53291,27.55485,0-30.704,0-30.704l-16.53291-44.875,5.511-8.6601Z"
                      transform="translate(-82 -57.81557)"
                      fill="#ffb9b9"
                    />
                    <path
                      d="M986.35016,424.34483s21.25659,16.53291,8.66009,22.83116-66.13163,36.21494-66.13163,36.21494-32.27853,24.40572-36.21494,5.511,21.2566-18.10747,21.2566-18.10747,50.386-30.704,52.74784-37.00222S986.35016,424.34483,986.35016,424.34483Z"
                      transform="translate(-82 -57.81557)"
                      fill="#ffb9b9"
                    />
                    <path
                      d="M798.97721,532.20237s-10.23466,55.897-4.72369,87.38822a155.82721,155.82721,0,0,1-1.57456,59.0461l30.704,3.14912s19.682-116.51763,30.704-115.73035,34.64038,117.30492,34.64038,117.30492l33.06581-4.72369s-10.23466-51.96057-5.511-67.70619,1.57456-72.42988-10.23465-78.72813S798.97721,532.20237,798.97721,532.20237Z"
                      transform="translate(-82 -57.81557)"
                      fill="#575a89"
                    />
                    <path
                      d="M826.53205,678.63669s-35.42765-11.80922-38.57678-3.14913-2.36184,105.4957-1.57456,111.794,3.14912,3.14912.78728,6.29825-2.36184-3.93641-1.57456,4.72368S787.168,808.5381,787.168,808.5381s-14.17106,33.06581,11.02194,32.27853,13.38378-24.40572,13.38378-24.40572,3.93641-7.08553,1.57456-11.02193-3.14912-10.23466,0-13.38379-3.14912-9.44737-3.9364-11.80922-3.14913-1.57456,3.14912-9.44737,3.14913-11.80922,2.36185-14.17106,5.511-16.53291,5.511-16.53291Z"
                      transform="translate(-82 -57.81557)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M886.36543,678.63669s35.42766-11.80922,38.57679-3.14913,2.36184,105.4957,1.57456,111.794-3.14913,3.14912-.78728,6.29825,2.36184-3.93641,1.57456,4.72368-1.57456,10.23466-1.57456,10.23466,14.17106,33.06581-11.02194,32.27853-13.38378-24.40572-13.38378-24.40572-3.93641-7.08553-1.57457-11.02193,3.14913-10.23466,0-13.38379,3.14913-9.44737,3.93641-11.80922,3.14913-1.57456-3.14912-9.44737-3.14913-11.80922-2.36185-14.17106-5.511-16.53291-5.511-16.53291Z"
                      transform="translate(-82 -57.81557)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M852.51234,386.55533s-5.511-16.53291-8.6601-19.682-5.19241-11.29824-5.19241-11.29824-17.63874,6.57455-22.36243,8.14911-20.46932,1.57456-20.46932,3.93641v50.386s-1.57456,10.23466,1.57457,36.21494,12.5965,41.72591,1.57456,52.74785-1.57456,37.7895,3.93641,42.51319,112.58122,29.1294,113.3685-28.34213c0,0-25.98028-45.66232-14.95834-60.62066s20.46931-40.15135,20.46931-40.15135v-50.386s-17.32019-5.511-22.83116-6.29825-18.89475-15.74562-20.46931-14.95834-4.61732-.03-4.61732-.03l-.10637,11.05194Z"
                      transform="translate(-82 -57.81557)"
                      fill="#6c63ff"
                    />
                    <path
                      d="M806.85,371.597l-11.02194-3.9364s-13.38378,7.08553-13.38378,8.66009-7.87281,8.6601-11.80922,11.80922-14.95834,3.93641-14.95834,5.511-34.64038,26.76756-31.49125,30.704,13.38378,18.10747,18.89475,18.10747S761.975,428.28124,764.33683,427.494s26.76757-15.74563,34.64038-13.38379S806.85,371.597,806.85,371.597Z"
                      transform="translate(-82 -57.81557)"
                      fill="#6c63ff"
                    />
                    <path
                      d="M906.83475,373.17155l14.95834-3.14913s28.34213,21.2566,29.12941,22.04388,44.875,29.12941,42.51319,34.64037-27.55485,13.38379-33.8531,11.02194-33.06581-22.04387-43.30047-19.682S906.83475,373.17155,906.83475,373.17155Z"
                      transform="translate(-82 -57.81557)"
                      fill="#6c63ff"
                    />
                    <path
                      d="M883.61,304.28443c3.73766-15.69816,2.20928-19.868,2.20928-19.868l-47.84649-11.82722-16.66563,16.128v16.66564l1.68218,5.19975s6.91943-5.19975,4.23143-12.72617C827.22072,297.85651,880.92194,315.57406,883.61,304.28443Z"
                      transform="translate(-82 -57.81557)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M884.206,295.49719l-4.53249,4.85084c7.14858.08654-2.3728,57.61624.78728,66.91891l11.80922.2688V290.90452Z"
                      transform="translate(-82 -57.81557)"
                      fill="#2f2e41"
                    />
                    <ellipse
                      cx="739.41473"
                      cy="251.58619"
                      rx="2.36184"
                      ry="5.11733"
                      fill="#ffb9b9"
                    />
                    <ellipse
                      cx="800.03539"
                      cy="251.58619"
                      rx="2.36184"
                      ry="5.11733"
                      fill="#ffb9b9"
                    />
                    <polygon
                      points="372.707 694.753 371.293 693.339 432.086 632.546 378.293 578.753 379.707 577.339 434.914 632.546 372.707 694.753"
                      fill="#2f2e41"
                    />
                    <circle cx="430" cy="633.04558" r="21" fill="#6c63ff" />
                    <circle cx="375" cy="694.04558" r="21" fill="#6c63ff" />
                    <polygon
                      points="376.707 578.753 375.293 577.339 436.086 516.546 382.293 462.753 383.707 461.339 438.914 516.546 376.707 578.753"
                      fill="#2f2e41"
                    />
                    <circle cx="383" cy="462.04558" r="21" fill="#6c63ff" />
                    <circle cx="434" cy="517.04558" r="21" fill="#6c63ff" />
                    <circle cx="379" cy="578.04558" r="21" fill="#6c63ff" />
                    <rect
                      x="123"
                      y="419.04558"
                      width="104"
                      height="19"
                      fill="#6c63ff"
                      opacity="0.3"
                    />
                    <rect
                      x="538"
                      y="634.04558"
                      width="104"
                      height="5"
                      fill="#6c63ff"
                      opacity="0.3"
                    />
                    <rect
                      x="538"
                      y="649.04558"
                      width="104"
                      height="5"
                      fill="#6c63ff"
                      opacity="0.3"
                    />
                    <rect
                      x="538"
                      y="664.04558"
                      width="104"
                      height="5"
                      fill="#6c63ff"
                      opacity="0.3"
                    />
                    <rect
                      x="538"
                      y="679.04558"
                      width="104"
                      height="5"
                      fill="#6c63ff"
                      opacity="0.3"
                    />
                    <rect
                      x="538"
                      y="694.04558"
                      width="104"
                      height="5"
                      fill="#6c63ff"
                      opacity="0.3"
                    />
                    <rect
                      x="538"
                      y="709.04558"
                      width="104"
                      height="5"
                      fill="#6c63ff"
                      opacity="0.3"
                    />
                    <path
                      d="M148.758,800.79734c6.914,25.55823,30.59594,41.38709,30.59594,41.38709s12.47217-25.60923,5.55818-51.16746-30.59593-41.38709-30.59593-41.38709S141.844,775.23911,148.758,800.79734Z"
                      transform="translate(-82 -57.81557)"
                      fill="#3f3d56"
                    />
                    <path
                      d="M158.91757,795.3046c18.97207,18.46854,21.28937,46.859,21.28937,46.859s-28.4425-1.553-47.41457-20.02152-21.28937-46.859-21.28937-46.859S139.9455,776.83606,158.91757,795.3046Z"
                      transform="translate(-82 -57.81557)"
                      fill="#6c63ff"
                    />
                    <rect
                      y="782.04558"
                      width="1036"
                      height="2"
                      fill="#3f3d56"
                    />
                    <path
                      d="M1060.5,778.33814a22.03135,22.03135,0,0,0-14.03113-20.5,22,22,0,1,0-15.93774,0,21.99119,21.99119,0,0,0,0,41,22,22,0,1,0,15.93774,0A22.03136,22.03136,0,0,0,1060.5,778.33814Zm-42-41a20,20,0,1,1,24.51294,19.46734,22.02362,22.02362,0,0,0-9.02588,0A20.02093,20.02093,0,0,1,1018.5,737.33814Zm40,82a20,20,0,1,1-24.51294-19.46735,22.02316,22.02316,0,0,0,9.02588,0A20.02094,20.02094,0,0,1,1058.5,819.33814Zm-15.48706-21.53266a22.02362,22.02362,0,0,0-9.02588,0,19.97883,19.97883,0,0,1,0-38.93469,22.02316,22.02316,0,0,0,9.02588,0,19.97883,19.97883,0,0,1,0,38.93469Z"
                      transform="translate(-82 -57.81557)"
                      fill="#3f3d56"
                    />
                    <path
                      d="M188.5,414.33813a22,22,0,1,1,22-22A22.02489,22.02489,0,0,1,188.5,414.33813Zm0-42a20,20,0,1,0,20,20A20.02229,20.02229,0,0,0,188.5,372.33813Z"
                      transform="translate(-82 -57.81557)"
                      fill="#3f3d56"
                    />
                    <path
                      d="M655.5,195.33813a22,22,0,1,1,22-22A22.02489,22.02489,0,0,1,655.5,195.33813Zm0-42a20,20,0,1,0,20,20A20.02229,20.02229,0,0,0,655.5,153.33813Z"
                      transform="translate(-82 -57.81557)"
                      fill="#3f3d56"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ResultComponent;
