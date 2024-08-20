import React, { useEffect, useState } from "react";
import * as attemptService from "@/services/attemptService";
import * as serviceSvc from "@/services/suportService";
import * as classroomSvc from "@/services/classroomService";

import { alert, success, error } from "alertifyjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import CustomPagination from "@/components/CustomPagenation";
import { useRouter } from "next/navigation";
import { copyText } from "@/lib/helpers";
import PImageComponent from "@/components/AppImage";
import Link from "next/link";
import { fromNow } from "@/lib/pipe";

const ClassroomAttempt = ({ id, settings, user }: any) => {
  const { push } = useRouter();

  const [paramsData, setParamsData] = useState<any>({
    limit: 20,
    page: 1,
    sort: "createdAt,-1",
    includeCount: true,
    classroom: [],
  });
  const [totalItems, setTotalItems] = useState<any>(0);
  const [results, setResults] = useState<any>([]);
  const [paging, setPaging] = useState<any>({
    currentPage: 0,
  });
  const [searchText, setSearchText] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [classroom, setClassrom] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);

  useEffect(() => {
    classroomSvc
      .findById(id, {
        includeUser: true,
        checkSession: true,
        owners: true,
        classroomSetting: true,
      })
      .then((classroom) => {
        setClassrom(classroom);
        setParamsData({
          ...paramsData,
          classroom: [classroom._id],
        });
        const params = {
          ...paramsData,
          classroom: classroom._id,
        };
        loadResult(params, classroom);
      });
  }, []);

  const loadResult = (params?: any, cls?: any) => {
    if (loading) {
      return;
    }
    setLoading(true);
    if (!params) {
      params = paramsData;
    }

    // if(cls.length === 0) {
    //   cls = classroom
    // }

    // Load all result
    attemptService.getClassroomAttempts(cls._id, params).then((res: any) => {
      if (res.count) {
        setTotalItems(res.count);
      }

      setResults(res.attempts);
      setServicesFunc(res.attempts);

      setLoading(false);
    });
  };

  const onPaging = (page: any) => {
    setCurrentPage(page);
    setParamsData({
      ...paramsData,
      page: page,
    });
    const params = { ...paramsData, page: page };
    delete params.includeCount;
    loadResult(params, classroom);
  };

  const setServicesFunc = (sList: any) => {
    if (sList.length) {
      serviceSvc
        .getTaggingServicesForStudents(sList.map((r) => r.user))
        .then((serviceMap) => {
          for (const r of sList) {
            if (serviceMap[r.user]) {
              r.services = serviceMap[r.user].services;
            }
          }
        });
    }
  };

  const search = (text) => {
    setSearchText(text);
    setParamsData({
      ...paramsData,
      searchText: text,
      page: 1,
    });
    const params = {
      ...paramsData,
      searchText: text,
      page: 1,
    };
    setPaging({
      ...paging,
      currentPage: 1,
    });
    loadResult(params, classroom);
  };

  const viewTestDetails = (test: any) => {
    push(`/assessment/details/${test}`);
  };

  const viewCourseDetails = (item: any) => {
    push(`/course/details/${item._id}`);
  };

  const viewTestseriesDetails = (item: any) => {
    push(`/testseries/details/${item._id}`);
  };

  const copyCode = () => {
    copyText(classroom.seqCode);
    success("Successfully Copied");
  };
  const openChat = (userId, name) => {
    // TODO
  };
  const militoMinute = (data: any): any => {
    if (data == 0) {
      return "0 min";
    }

    data = Math.round(data / 1000 / 60);

    if (data < 2) {
      return "1 min";
    }

    return data + " mins";
  };

  // console.log(results, 'results')

  return (
    <>
      <main className="py-0">
        <div className="dashboard-area memberClassroomMain1 classroom mx-auto">
          <div className="rounded-boxes class-board bg-white">
            <div className="row align-items-center">
              <div className="col-md">
                <div className="square_profile_info d-flex align-items-center">
                  <div className="squared-rounded_wrap_80">
                    {/* Assuming p-image is a custom component */}
                    <PImageComponent
                      height={80}
                      width={80}
                      imageUrl={classroom.imageUrl}
                      backgroundColor={classroom.colorCode}
                      text={classroom.name}
                      radius={9}
                      fontSize={15}
                      type="classroom"
                    />
                  </div>

                  <div className="class-board-info assignment-top-detail ml-2">
                    <h3 className="top-title text-truncate">
                      {classroom.name}
                    </h3>
                    <div className="d-flex align-items-center">
                      {classroom.joinByCode && (
                        <>
                          <h6 className="text-truncate mr-1">
                            {classroom.seqCode}
                          </h6>
                          <button
                            aria-label="copy class code"
                            className="btn btn-secondary btn-sm"
                            onClick={copyText}
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </>
                      )}
                    </div>
                    {classroom.user && (
                      <p className="bottom-title mt-1 d-flex">
                        <span
                          className="material-icons-two-tone"
                          style={{
                            fontFamily: "Material Icons",
                            fontSize: "14px",
                          }}
                        >
                          portrait
                        </span>
                        <Link
                          href={`/public/profile/${classroom.user._id}`}
                          className="mr-2"
                        >
                          {classroom.user.name}
                        </Link>
                        {classroom.user._id !== user._id && (
                          <a
                            href="#"
                            onClick={() =>
                              openChat(classroom.user._id, classroom.user.name)
                            }
                            className="mr-3"
                          >
                            <i className="fas fa-comments"></i>
                          </a>
                        )}
                        <span className="one-line">{totalItems} attempts</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md">
                <div className="member-search my-3">
                  <form
                    className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
                    style={{ maxWidth: "100%" }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      // search();
                    }}
                  >
                    <input
                      type="text"
                      className="form-control border-0 my-0"
                      maxLength={50}
                      placeholder="Search assessment or student"
                      name="txtSearch"
                      value={searchText}
                      onChange={(e) => search(e.target.value)}
                    />
                    {searchText !== "" && (
                      <span
                        className="search-pause"
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "3px",
                        }}
                        onClick={() => {
                          setSearchText("");
                          setParamsData({
                            ...paramsData,
                            searchText: "",
                          });
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
              </div>
            </div>
          </div>
        </div>
      </main>
      <main className="pt-0">
        <div className="assessment-settings non-stepper">
          <div className="dashboard-area-remove classroom mx-auto">
            <div className="class-board folder-board bg-white rounded-boxes text-black">
              <div className="title allDetailPagePosition mb-3 p-0">
                {!loading ? (
                  results &&
                  results.length > 0 && (
                    <div className="folder-area clearfix">
                      <div className="table-wrap table-responsive">
                        <table className="table response-result mb-0 vertical-middle">
                          <thead>
                            <tr>
                              <th className="border-0 ml-66px">Name</th>
                              <th className="border-0">Assessment</th>
                              <th className="border-0 text-center">Response</th>
                              <th className="border-0 text-center">Time</th>
                              <th className="border-0 text-center">Score</th>
                              <th className="border-0"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {results?.map((result: any, index: any) => (
                              <tr
                                key={index}
                                className={
                                  settings?.features?.fraudDetect &&
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
                                                  (service, index) => (
                                                    <span
                                                      key={index}
                                                      className={`${service.type}_${service.duration}_${service.durationUnit} ml-1`}
                                                      container="body"
                                                      tooltip={`Membership: ${
                                                        service.title
                                                      } (${service.duration} ${
                                                        service.durationUnit
                                                      } ${
                                                        service.duration > 1
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
                                          <p>
                                            {fromNow(result.createdAt)}
                                          </p>{" "}
                                          {/* Assuming fromNow is handled elsewhere */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ maxWidth: "400px" }}>
                                  <div className="progresss">
                                    <h4
                                      className="f-14"
                                      style={{ whiteSpace: "normal" }}
                                    >
                                      <a
                                        onClick={() =>
                                          viewTestDetails(result.practicesetId)
                                        }
                                      >
                                        {result.practiceSetInfo.title}
                                      </a>
                                    </h4>
                                    {result.course && (
                                      <p
                                        className="f-14"
                                        style={{ whiteSpace: "normal" }}
                                      >
                                        Course:{" "}
                                        <a
                                          onClick={() =>
                                            viewCourseDetails(result.course)
                                          }
                                        >
                                          {result.course.title}
                                        </a>
                                      </p>
                                    )}
                                    {result.testseries && (
                                      <p
                                        className="f-14"
                                        style={{ whiteSpace: "normal" }}
                                      >
                                        Test Series:{" "}
                                        <a
                                          onClick={() =>
                                            viewTestseriesDetails(
                                              result.testseries
                                            )
                                          }
                                        >
                                          {result.testseries.title}
                                        </a>
                                      </p>
                                    )}
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
                                    <h4 className="f-14">
                                      {militoMinute(result.totalTimeTaken)}
                                    </h4>
                                  </div>
                                </td>
                                <td>
                                  <div className="progresss text-center">
                                    {result.practiceSetInfo.fullLength &&
                                      result.practiceSetInfo.viewTemplate ===
                                        "SAT" && (
                                        <h4 className="f-14">
                                          {result.SAT?.total || 400}
                                        </h4>
                                      )}
                                    {result.practiceSetInfo.fullLength &&
                                      result.practiceSetInfo.viewTemplate ===
                                        "ACT" && (
                                        <h4 className="f-14">
                                          {result.ACT?.total || 9}
                                        </h4>
                                      )}
                                    {(!result.practiceSetInfo.fullLength ||
                                      (result.practiceSetInfo.viewTemplate !==
                                        "SAT" &&
                                        result.practiceSetInfo.viewTemplate !==
                                          "ACT")) && (
                                      <h4 className="f-14">
                                        {result.totalMark === 0
                                          ? 0
                                          : result.totalMark.toFixed(2)}
                                      </h4>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex gap-xs">
                                    <Link
                                      className="btn btn-sm btn-outline"
                                      href={`/assessment/student-attempt-summary/${result._id}`}
                                    >
                                      <span className="edit">View</span>
                                    </Link>
                                    {settings?.features?.evaluation &&
                                      result.isEvaluated === false && (
                                        <Link
                                          className="btn btn-sm btn-outline"
                                          href={`/evaluation/details/${result.practicesetId}?system=1&attemptId=${result._id}`}
                                        >
                                          <span>Evaluate</span>
                                        </Link>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="text-center mt-3">
                          <div className="d-inline-block">
                            {totalItems > paramsData.limit && (
                              <CustomPagination
                                totalItems={totalItems}
                                limit={paramsData.limit}
                                onPageChange={(e) => onPaging(e)}
                                currentPage={currentPage}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
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

                  <div className="text-center">
                    You may not have added students or tests or students have
                    not taken any test yet.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ClassroomAttempt;
