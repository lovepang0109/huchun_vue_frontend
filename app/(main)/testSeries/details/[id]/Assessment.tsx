import React, { useEffect, useState } from "react";
import { findByExamId } from "@/services/practiceService";
import { addTest, removeTest } from "@/services/testseriesService";
import { success, error } from "alertifyjs";
import { arrayToString } from "@/lib/pipe";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import PImageComponent from "@/components/AppImage";

const AssessmentComponent = ({ user, series, setSeries }: any) => {
  const [tests, setTests] = useState<any>([]);
  const [totalTest, setTotalTest] = useState<any>(0);
  const [params, setParams] = useState<any>({
    testseriesOnly: false,
    name: "",
    limit: 10,
    page: 1,
    select:
      "title,subjects,totalQuestion,totalTime,status,imageUrl,totalJoinedStudent,totalAttempt,testMode",
    testType: "standard,random",
    notAdaptive: true,
    accessMode: "internal",
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setParams({
      ...params,
      testseriesOnly: series?.practiceIds?.length > 0,
    });
    const paramsData = { ...params };
    paramsData.testseriesOnly = series?.practiceIds?.length > 0;

    getTests(paramsData);
  }, []);

  const getTests = async (paramsData: any) => {
    console.log(series, "this is series data");
    setLoading(true);
    if (paramsData.testseriesOnly) {
      if (series?.practiceIds?.length > 0) {
        paramsData.series = series._id;
      } else {
        setTests([]);
        setTotalTest(0);
        setLoading(false);
        return;
      }
    } else {
      paramsData.subjects = series.subjects.map((s: any) => s._id).join(",");
    }

    const loadMore = paramsData.page > 1;
    if (!loadMore) {
      setTests([]);
      paramsData.count = true;
    }

    findByExamId(paramsData).then((res: any) => {
      const data = res.practiceSetByExam;
      for (const t of data) {
        t.added = series.practiceIds.indexOf(t._id) > -1;
      }
      if (loadMore) {
        setTests((prev: any) => prev.concat(data));
      } else {
        setTests(data);
        setTotalTest(res.count);
      }
      setLoading(false);
    });
  };

  const searchTests = (data: any) => {
    data.page = 1;
    setParams({ ...data });
    getTests(data);
  };

  const loadMore = () => {
    setParams({
      ...params,
      page: params.page + 1,
    });
    const paramsData = params;
    paramsData.page++;
    getTests(paramsData);
  };

  const addTestFunc = async (test: any, id: number) => {
    setLoading(true);
    addTest(series._id, test._id)
      .then((res: any) => {
        success("Test is added successfully.");
        setTests((prev: any) => {
          const newArray = [...prev];
          newArray[id].added = true;
          return newArray;
        });
        setSeries((prev: any) => {
          const newArray = { ...prev };
          newArray.practiceIds.push(test._id);
          newArray.totalTests = res.totalTests;
          newArray.totalQuestions = res.totalQuestions;
          newArray.totalStudents = res.totalStudents;
          return newArray;
        });
        setLoading(false);
      })
      .catch((err: any) => {
        error("Fail to add test");
        setLoading(false);
      });
  };

  const removeTestFunction = async (test: any, id: number) => {
    setLoading(true);
    removeTest(series._id, test._id)
      .then((res: any) => {
        success("Test is removed successfully.");
        const seriesData = { ...series };
        setTests((prev: any) => {
          const newArray = [...prev];
          newArray[id].added = false;
          return newArray;
        });
        const tidx = series.practiceIds.findIndex((t: any) => t == test._id);
        if (tidx > -1) {
          seriesData.practiceIds.splice(tidx, 1);
        }

        if (params.testseriesOnly) {
          const idx = tests.findIndex((t: any) => t._id == test._id);
          if (idx > -1) {
            setTests((prev: any) => {
              const newArray = [...prev.splice(idx, 1)];
              return newArray;
            });
          }
          setTotalTest((prev: any) => prev - 1);
        }
        setSeries({
          ...seriesData,
          totalTests: res.totalTests,
          totalQuestions: res.totalQuestions,
          totalStudents: res.totalStudents,
        });
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        error("Fail to remove test");
      });
  };

  const track = (index: any, item: any) => {
    return item._id;
  };

  return (
    <>
      <div className="d-lg-block">
        <div className="class-board-remove">
          <div className="info">
            <div className="heading">
              <div className="row align-items-center mb-3">
                <div className="col-sm-7">
                  <div className="switch-item d-flex align-items-center float-none">
                    <span className="f-16">
                      Show Test Series&apos;s test only
                    </span>
                    <label className="switch my-0">
                      <input
                        type="checkbox"
                        name="testseriesOnly"
                        aria-label="toggle switch for testseries"
                        id="testseriesOnly"
                        disabled={
                          series.origin === "publisher" &&
                          user.role !== "publisher" &&
                          series.owner !== user._id
                        }
                        checked={params.testseriesOnly}
                        onChange={(e: any) => {
                          const paramsData = params;
                          paramsData.testseriesOnly = e.target.checked;
                          searchTests(paramsData);
                        }}
                      />
                      <span className="slider round translate-middle-y"></span>
                    </label>
                  </div>
                </div>
                <div className="col-sm-5">
                  <div className="form-group search-box common_search-type-1">
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
                      defaultValue={params.name}
                      style={{ border: "unset" }}
                      onChange={(e) => {
                        const paramsData = params;
                        paramsData.name = e.target.value;
                        searchTests(paramsData);
                      }}
                      placeholder="Search for assessments"
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <>
                <SkeletonLoaderComponent
                  Cwidth="100"
                  Cheight="93"
                  className="mb-4"
                />
                <SkeletonLoaderComponent
                  Cwidth="100"
                  Cheight="93"
                  className="mb-4"
                />
                <SkeletonLoaderComponent
                  Cwidth="100"
                  Cheight="93"
                  className="mb-4"
                />
                <SkeletonLoaderComponent
                  Cwidth="100"
                  Cheight="93"
                  className="mb-4"
                />
                <SkeletonLoaderComponent
                  Cwidth="100"
                  Cheight="93"
                  className="mb-4"
                />
              </>
            ) : params.testseriesOnly && series.status == "draft" ? (
              !tests.length ? (
                <div className="text-center">
                  <img
                    className="mx-auto"
                    src="/assets/images/testseriesteacher.svg"
                    alt="No tests"
                  />
                  <h1>No tests yet</h1>
                </div>
              ) : (
                <div className="cdkDropList">
                  {tests.map((test: any, index: number) => (
                    <div
                      key={index}
                      className="product_type_row type-1 position-relative"
                    >
                      <div className="d-flex">
                        <div>
                          <div className="product_img new-image-box h-100">
                            <PImageComponent
                              height={100}
                              fullHeight={true}
                              imageUrl={test.imageUrl}
                              backgroundColor={test.colorCode}
                              type="assessment"
                              text={test.title}
                              radius={9}
                              fontSize={15}
                              testMode={test.testMode}
                              isProctored={test.isProctored}
                              status={test.status}

                            />
                          </div>
                        </div>
                        <div className="flex-grow-1 overflow-auto px-2 pb-2 mt-2">
                          <div className="product_inner">
                            <p className="">
                              <a
                                href={`/assessment/details/${test._id}`}
                                className="product_title"
                              >
                                {test.title}
                              </a>
                            </p>
                            <p className="subject_name">
                              {arrayToString(test.subjects, "name")}
                            </p>
                            <div className="d-flex flex-wrap mt-2">
                              <div className="questions_number  mr-2">
                                <span className="material-icons mr-1">
                                  description
                                </span>
                                <span>
                                  <span className="number_dark">
                                    {test.totalQuestion}
                                  </span>{" "}
                                  Question
                                </span>
                              </div>

                              <div className="minutes_number  mr-2">
                                <span className="material-icons mr-1">
                                  timelapse
                                </span>
                                <span>
                                  <span className="number_dark">
                                    {test.totalTime}
                                  </span>{" "}
                                  Minutes
                                </span>
                              </div>

                              <div className="students_number  mr-2">
                                <span className="material-icons mr-1">
                                  people
                                </span>
                                <span>
                                  <span className="number_dark">
                                    {test.totalJoinedStudent}
                                  </span>{" "}
                                  Students
                                </span>
                              </div>
                              <div className="attempts_number ">
                                <span className="material-icons mr-1">
                                  assignment
                                </span>
                                <span>
                                  <span className="number_dark">
                                    {test.totalAttempt}
                                  </span>{" "}
                                  Attempts
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {!test.added && series.canEdit && (
                              <button
                                onClick={() => addTestFunc(test, index)}
                                className="btn btn-outline btn-sm"
                              >
                                Add Test
                              </button>
                            )}
                            {test.added &&
                              series.status === "draft" &&
                              series.canEdit && (
                                <button
                                  onClick={() =>
                                    removeTestFunction(test, index)
                                  }
                                  className="btn btn-outline btn-sm"
                                >
                                  Remove Test
                                </button>
                              )}
                          </div>
                        </div>
                        {series.status === "draft" && series.canEdit && (
                          <div
                            className="text-center"
                            style={{
                              position: "absolute",
                              top: "5px",
                              left: "50%",
                              cursor: "move",
                            }}
                          >
                            <span className="material-icons rotate-90">
                              drag_indicator
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : !tests.length ? (
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/assets/images/testseriesteacher.svg"
                  alt="No tests"
                />
                <h1>No tests yet</h1>
              </div>
            ) : (
              tests.map((test: any, index: number) => (
                <div key={index} className="product_type_row type-1">
                  <div className="d-flex">
                    <div className="">
                      <div className="product_img new-image-box h-100">
                        <PImageComponent
                          height={100}
                          fullHeight={true}
                          imageUrl={test.imageUrl}
                          backgroundColor={test.colorCode}
                          type="assessment"
                          text={test.title}
                          radius={9}
                          fontSize={15}
                          testMode={test.testMode}
                          isProctored={test.isProctored}
                          status={test.status}
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1 overflow-auto px-2 pb-2">
                      <div className="product_inner">
                        <a
                          href={`/assessment/details/${test._id}`}
                          className="product_title"
                        >
                          {test.title}
                        </a>
                        <p className="subject_name EtEsT">
                          {/* {test.subjects.join(", ")} */}
                          {arrayToString(test.subjects, "name")}

                        </p>
                        <div className="d-flex flex-wrap mt-2">
                          <div className="questions_number  mr-2">
                            <span className="material-icons mr-1">
                              description
                            </span>
                            <span>
                              <span className="number_dark">
                                {test.totalQuestion}
                              </span>{" "}
                              Question
                            </span>
                          </div>
                          <div className="minutes_number  mr-2">
                            <span className="material-icons mr-1">
                              timelapse
                            </span>
                            <span>
                              <span className="number_dark">
                                {test.totalTime}
                              </span>{" "}
                              Minutes
                            </span>
                          </div>
                          <div className="students_number  mr-2">
                            <span className="material-icons mr-1">people</span>
                            <span>
                              <span className="number_dark">
                                {test.totalJoinedStudent}
                              </span>{" "}
                              Students
                            </span>
                          </div>
                          <div className="attempts_number ">
                            <span className="material-icons mr-1">
                              assignment
                            </span>
                            <span>
                              <span className="number_dark">
                                {test.totalAttempt}
                              </span>{" "}
                              Attempts
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          href={`/assessment/details/${test._id}`}
                          className="btn btn-outline btn-sm px-4"
                        >
                          View
                        </a>
                        {!test.added && series.canEdit && (
                          <button
                            onClick={() => addTestFunc(test, index)}
                            className="ml-2 btn btn-outline btn-sm"
                          >
                            Add Test
                          </button>
                        )}
                        {test.added &&
                          series.status === "draft" &&
                          series.canEdit && (
                            <button
                              onClick={() => removeTestFunction(test, index)}
                              className="ml-2 btn btn-outline btn-sm"
                            >
                              Remove Test
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="text-center">
              {tests.length < totalTest && !loading && (
                <button onClick={loadMore} className="btn btn-light">
                  Load more
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentComponent;
