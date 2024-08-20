import React, { useEffect, useState } from "react";
import * as testseriesSvc from "@/services/testseriesService";
import * as classSvc from "@/services/classroomService";

import { alert, success, error, confirm } from "alertifyjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import CustomPagination from "@/components/CustomPagenation";
import { useRouter } from "next/navigation";
import { copyText as commonCopyText } from "@/lib/helpers";
import PImageComponent from "@/components/AppImage";
import Link from "next/link";
import SubjectComponent from "@/components/SubjectComponent";
import moment from "moment";

const ClassroomTestSeries = ({ classroom, settings, user }: any) => {
  const { push } = useRouter();

  const [title, setTitle] = useState<string>("");
  const [testseries, setTestseries] = useState<any>(null);
  const [filteredTestseries, setFilteredTestseries] = useState<any>(null);
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
  const [availableTestseries, setAvailableTestseries] = useState<any>(null);
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    testseriesSvc
      .find({
        noPaging: true,
        accessMode: "invitation",
        classroom: classroom._id,
        status: "published",
      })
      .then((ts) => {
        setTestseries(ts.series);
        setCount(ts.series.length);
        setFilteredTestseries(ts.series);
      })
      .catch((err) => {
        setFilteredTestseries([]);
      });

    setAvailableParams({
      ...availableParams,
      notInClass: classroom._id,
    });

    const temp_availableParams = {
      ...availableParams,
      notInClass: classroom._id,
    };

    testseriesSvc
      .find({ ...temp_availableParams, includeCount: true })
      .then((ts) => {
        setAvailableTestseries(ts.series);
        setAvailableCount(ts.count);
      })
      .catch((err) => {
        setAvailableTestseries([]);
      });

    setAvailableParams({
      ...availableParams,
      notInClass: classroom._id,
    });
  }, []);

  const viewTestseries = (id: string) => {
    push(`/testSeries/details/${id}`);
  };

  const addTestseries = (series: any, idx: any) => {
    confirm(
      "Do you want to add this test series to the classroom? The students of this classroom will start using this test series immediately. Please confirm.",
      () => {
        classSvc
          .addTestseriesToClassroom(classroom._id, series._id)
          .then(() => {
            success("Assessment is added successfully to classroom");
            const temp_availableTestseries = availableTestseries;
            temp_availableTestseries.splice(idx, 1);
            setAvailableTestseries(temp_availableTestseries);
            setAvailableCount(availableCount - 1);

            setFilteredTestseries([...filteredTestseries, series]);
            setCount(count + 1);

            const temp_testseries = testseries;
            temp_testseries.push(series);
            setTestseries(temp_testseries);
          });
      }
    );
  };

  const publishTestseries = (testseries: any) => {
    // validate data
    if (!testseries.subjects[0]) {
      alert("Message", "Please select at least one subject.");
      return false;
    }

    if (testseries.expiresOn && !testseries.startDate) {
      alert("Message", "Please select the start date.");
      return false;
    }

    if (testseries.startDate && testseries.expiresOn) {
      if (
        moment(testseries.startDate, "DD-MM-YYYY").isAfter(
          moment(testseries.expiresOn, "DD-MM-YYYY")
        )
      ) {
        alert("Message", "Start date cannot be greater than end date.");
        return false;
      }
    }

    if (!testseries.description) {
      alert("Message", "Please fill in description before publishing.");
      return false;
    }

    if (!testseries.practiceIds || testseries.practiceIds.length < 2) {
      alert("Message", "Please select at least two assessments.");
      return false;
    }

    confirm("Are you sure you want to publish this Test Series?", (msg) => {
      testseriesSvc.publish(testseries._id).then(
        (res: any) => {
          testseries.status = "published";
          testseries.statusChangedAt = res.statusChangedAt;

          success("Test Series published successfully.");
        },
        (res: any) => {
          if (res.error && res.error.message) {
            alert("Message", res.error.message);
          } else {
            alert(
              "Message",
              "Something went wrong. Please check browser console for more details."
            );
          }
        }
      );
    });
  };

  const removeTestseries = (item: any, idx: any) => {
    confirm(
      "Do you want to remove the test series from the classroom? The students of this classroom will no longer be able to take this test series. Please confirm.",
      () => {
        classSvc
          .removeTestseriesFromClassroom(classroom._id, item._id)
          .then(() => {
            success("Test Series is removed successfull from classroom");
            const temp_filteredTestseries = filteredTestseries;
            temp_filteredTestseries.splice(idx, 1);
            setFilteredTestseries(temp_filteredTestseries);
            setCount(count - 1);

            const temp_availableTestseries = availableTestseries;
            temp_availableTestseries.push(item);
            setAvailableTestseries(temp_availableTestseries);
            setAvailableCount(availableCount + 1);

            const ti = testseries.findIndex((t) => t._id == item._id);
            const temp_testseries = testseries;
            temp_testseries.splice(ti, 1);
            setTestseries(temp_testseries);
          });
      }
    );
  };

  const search = (text: string) => {
    setTitle(text);
    let temp_filteredTestseries;
    if (!text) {
      setFilteredTestseries([...testseries]);
      temp_filteredTestseries = [...testseries];
    } else {
      temp_filteredTestseries = testseries.filter(
        (t) => t.title.toLowerCase().indexOf(text.toLowerCase()) > -1
      );
      setFilteredTestseries(temp_filteredTestseries);
    }
    setCount(temp_filteredTestseries.length);
  };

  const searchAvailable = (text: string) => {
    if (searching) {
      return;
    }
    setAvailableTestseries(null);
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

    testseriesSvc
      .find({ ...temp_availableParams, includeCount: true })
      .then((res) => {
        setAvailableTestseries(res.series);
        setAvailableCount(res.count);
        setSearching(false);
      })
      .catch((err) => {
        setAvailableTestseries([]);
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

    testseriesSvc
      .find({ ...temp_availableParams })
      .then((res) => {
        setAvailableTestseries([...availableTestseries, ...res.series]);
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
            <h1 className="section_top_heading">
              Classroom Test Series ({count})
            </h1>
            <p className="section_sub_heading">
              These test series are visible to the students of the classroom
            </p>
          </div>

          {testseries && (
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
                  placeholder="Search for test series "
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

        {testseries ? (
          <div className="mt-3">
            <div className="box-area mb-0">
              <div className="box-area-wrap clearfix">
                <div className="row">
                  {filteredTestseries?.map((item, index) => (
                    <div key={index} className="col-lg-4 col-6 mb-4">
                      <div className="slider">
                        <div className="box box_new bg-white pt-0 shadow">
                          <div
                            className="image-wrap cursor-pointer"
                            onClick={() => viewTestseries(item._id)}
                          >
                            <PImageComponent
                              height={118}
                              fullWidth
                              imageUrl={item.imageUrl}
                              backgroundColor={item.colorCode}
                              text={item.title}
                              radius={9}
                              fontSize={15}
                              type="testSeries"
                              isProctored={item.isProctored}
                              testMode={item.testMode}
                              // testType={test.testType}
                            />
                          </div>

                          <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                            <div className="info pubCourseS1 p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={item.title}
                                onClick={() => viewTestseries(item._id)}
                                className="cursor-pointer"
                              >
                                {item.title}
                              </h4>
                              <SubjectComponent
                                className="mb-1"
                                subjects={item.subjects}
                              />

                              <div className="form-row small cardFontAll-imp">
                                <div className="col-12">
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
                            <div className="form-row mt-2">
                              <div className="col-6">
                                <a
                                  href="#"
                                  className="btn btn-outline btn-sm d-block"
                                  onClick={() => viewTestseries(item._id)}
                                >
                                  View
                                </a>
                              </div>

                              <div className="col-6">
                                <a
                                  href="#"
                                  className="btn btn-danger btn-sm d-block"
                                  onClick={() => removeTestseries(item, index)}
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
        {testseries && filteredTestseries && !filteredTestseries.length && (
          <div className="mt-3">
            <figure className="mx-auto">
              <img
                src="/assets/images/Search-rafiki.png"
                alt=""
                className="img-fluid d-block mx-auto no-result-img"
              />
            </figure>
            <p className="text-center">
              No Test Series in the classroom. Select one or more from the
              available test series.
            </p>
          </div>
        )}
      </div>
      <br></br>

      <div className="rounded-boxes bg-white">
        <div className="d-flex justify-content-between">
          <div className="section_heading_wrapper">
            <h1 className="section_top_heading">
              Available Test Series ({availableCount})
            </h1>
            <p className="section_sub_heading">
              These test series are not linked to the classroom but are
              available for use now
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
                placeholder="Search for test series "
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

        {availableTestseries ? (
          <div className="mt-3">
            <div className="box-area mb-0">
              <div className="box-area-wrap clearfix">
                <div className="row">
                  {availableTestseries.map((item, index) => (
                    <div key={index} className="col-lg-4 col-6 mb-4">
                      <div className="slider">
                        <div className="box box_new bg-white pt-0 shadow">
                          <div
                            className="image-wrap cursor-pointer"
                            onClick={() => viewTestseries(item._id)}
                          >
                            <PImageComponent
                              height={118}
                              fullWidth
                              imageUrl={item.imageUrl}
                              backgroundColor={item.colorCode}
                              text={item.title}
                              radius={9}
                              fontSize={15}
                              type="testSeries"
                              isProctored={item.isProctored}
                              testMode={item.testMode}
                              // testType={test.testType}
                            />
                          </div>

                          <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                            <div className="info pubCourseS1 p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={item.title}
                                onClick={() => viewTestseries(item._id)}
                                className="cursor-pointer"
                              >
                                {item.title}
                              </h4>
                              <SubjectComponent
                                className="mb-1"
                                subjects={item.subjects}
                              />

                              <div className="form-row small cardFontAll-imp">
                                <div className="col-12">
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
                            <div className="form-row mt-2">
                              {item.status === "published" && (
                                <div className="col">
                                  <a
                                    href="#"
                                    className="btn btn-outline btn-sm d-block"
                                    onClick={() => addTestseries(item, index)}
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
                                    onClick={() => publishTestseries(item)}
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

            {availableTestseries.length < availableCount && (
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

        {availableTestseries && !availableTestseries.length && (
          <div className="mt-3">
            <figure className="mx-auto">
              <img
                src="/assets/images/Search-rafiki.png"
                alt=""
                className="img-fluid d-block mx-auto no-result-img"
              />
            </figure>
            <p className="text-center">No Test Series available</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ClassroomTestSeries;
