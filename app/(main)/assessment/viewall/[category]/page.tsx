"use client";
import { useState, useEffect } from "react";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { css } from "@emotion/react";
import { ClipLoader } from "react-spinners";
import Price from "@/components/assessment/price";
import Link from "next/link";
import { reloadItems } from "@/services/shopping-cart-service";
import alertify from "alertifyjs";
import { ucFirst, arrayToString, elipsis } from "@/lib/pipe";
import ItemPrice from "@/components/ItemPrice";
import PImageComponent from "@/components/AppImage";
import * as practiceService from "@/services/practiceService";
import * as attemptSvc from "@/services/attemptService";
import { formatDistanceToNow, format } from "date-fns";

export default function ViewAll() {
  const [params, setParams] = useState<any>({
    limit: 12,
    page: 1,
    sort: "updatedAt,-1",
    excludeUser: true,
    includeFields: "classRooms",
    getPreference: true,
  });
  const queryParams = useSearchParams();
  const [practices, setPractices] = useState<any>([]);
  const [practicesCount, setPracticesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const user: any = useSession()?.data?.user?.info || {};
  const [name, setName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const { push } = useRouter();

  const { category } = useParams();
  useEffect(() => {
    const cat = category;
    console.log(cat);
    setName(cat);
    const para = params;

    if (cat == "tags") {
      setTitle(queryParams.get("title"));
      para.tags = queryParams.get("tags");
      para.sort = "title,1";
    } else if (cat == "mine") {
      setTitle("My Assessments");
      para.centerOwned = true;
    } else if (cat == "attempted") {
      setTitle("Recent Attempts");
      para.attempted = true;
    } else if (cat == "recent") {
      setTitle("Recently Added Assessments");
    } else if (cat == "general") {
      setTitle("General Assessments");

      para.noTag = queryParams.get("noTag");
      para.publisherPushed = true;
    } else {
      setTitle(cat + " Assessments");
    }

    para.status = queryParams.get("status");
    para.accessMode = queryParams.get("accessMode");
    setParams(para);

    reload(para, cat);
  }, []);

  const reload = (para?: any, na?: any) => {
    if (!para) {
      para = params;
    }
    if (!na) {
      na = name;
    }
    para.page = 1;
    setPractices([]);
    setPracticesCount(0);
    setLoading(true);

    if (na == "recent") {
      practiceService
        .getPurchasedTests({ ...para, count: true })
        .then(({ tests, total }: any) => {
          tests.forEach((t) => {
            t.canEdit =
              (user.role != "teacher" && user.role != "mentor") ||
              t.user == user._id ||
              (t.instructors && t.instructors.find((i) => i == user._id));
          });
          setPractices(tests);
          setPracticesCount(total);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else if (na == "attempted") {
      attemptSvc
        .getRecentAttempts({ ...para, count: true })
        .then((res: any) => {
          setPractices(res.attempts);

          setPracticesCount(res.total);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      const pa = { ...para, includeCount: true };

      practiceService
        .findTeacherTests(pa)
        .then(({ total, tests }) => {
          tests.forEach((t) => {
            t.canEdit =
              (user.role != "teacher" && user.role != "mentor") ||
              t.user == user._id ||
              (t.instructors && t.instructors.find((i) => i == user._id));
          });
          setPractices(tests);
          setPracticesCount(total);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  };

  const clearSearch = () => {
    setParams({
      ...params,
      keyword: "",
    });
    const para = params;
    para.keyword = "";
    search(para);
  };

  const loadMore = () => {
    const para = params;
    para.page += 1;

    if (name == "recent") {
      practiceService.getPurchasedTests({ ...para }).then(({ tests }: any) => {
        tests.forEach((t) => {
          t.canEdit =
            (user.role != "teacher" && user.role != "mentor") ||
            t.user == user._id ||
            (t.instructors && t.instructors.find((i) => i == user._id));
        });
        setPractices(practices.concat(tests));
      });
    } else if (name == "attempted") {
      attemptSvc.getRecentAttempts({ ...para }).then((res: any) => {
        setPractices(practices.concat(res.attempts));
      });
    } else {
      practiceService.findTeacherTests(para).then(({ tests }: any) => {
        tests.forEach((t) => {
          t.canEdit =
            (user.role != "teacher" && user.role != "mentor") ||
            t.user == user._id ||
            (t.instructors && t.instructors.find((i) => i == user._id));
        });
        setPractices(practices.concat(tests));
      });
    }
  };
  const search = (text: string) => {
    setParams({
      ...params,
      keyword: text,
    });
    const para = params;
    para.keyword = text;
    setIsSearch(para.keyword !== "");
    reload(para);
  };

  const publish = (practice: any) => {
    if (practice._id) {
      if (practice.accessMode == "public" && user.role == "mentor") {
        alertify.alert(
          "Message",
          "You can not publish practice test with access mode is free."
        );
        return;
      }

      if (!practice.startDate && practice.isProctored) {
        alertify.alert("Message", "Start date is required");
        return;
      }

      practiceService
        .checkQuestions(practice._id)
        .then((res: any) => {
          alertify.confirm(
            "Are you sure you want to publish this Assessment?",
            (msg) => {
              const copy = Object.assign({}, practice);
              const lastData = copy;
              lastData.status = "published";
              lastData.statusChangedAt = new Date().getTime();
              // We will set this on server
              // lastData.testCode = commonHelper.getUniqCode(8)
              practiceService.updateFunc(practice._id, lastData).then(
                (res: any) => {
                  practice = res;

                  alertify.success("Practice test published successfully.");

                  // reload current page
                  practiceService
                    .findTeacherTests(params)
                    .then(({ tests }: any) => {
                      tests.forEach((t) => {
                        t.canEdit =
                          (user.role != "teacher" && user.role != "mentor") ||
                          t.user == user._id ||
                          (t.instructors &&
                            t.instructors.find((i) => i == user._id));
                      });
                      let pra = practices;
                      pra.splice(
                        (params.page - 1) * params.limit,
                        params.limit
                      );

                      pra = pra.concat(tests);
                      setPractices(pra);
                      setPracticesCount(practicesCount - 1);
                    });
                },
                (err) => {
                  let msg = err.error.message;
                  if (!err.error.message) {
                    if (err.error[0]?.msg) {
                      msg = err.error.map((e) => e.msg).join("<br/>");
                    } else {
                      msg = "Failed to update assessment!";
                    }
                  }
                  alertify.alert("Message", msg);
                }
              );
            }
          );
        })
        .catch((err) => {
          if (err.error) {
            if (err.error.msg) {
              alertify.alert("Message", err.error.msg);
            }
          } else {
            alertify.alert(
              "Message",
              "Somethng went wrong, Please try after sometime."
            );
          }
        });
    }
  };
  const viewTest = (item: any) => {
    if (user.role != "student") {
      push(`/view-assessment/${item._id}`);
    } else {
      push(`/assessment/${item.title}?id=${item._id}`);
    }
  };

  const reviewTest = (test: any) => {
    if (!test.totalQuestion) {
      alertify.alert(
        "Message",
        "No questions are added to review. Please add some questions in assessment to review."
      );
      return;
    }
    push(`/assessment/review/${test._id}`);
  };

  const track = (index: any, item: any) => {
    return item._id;
  };

  return (
    <>
      <div className="container">
        <div className="search-bar d-block d-lg-none mx-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="form-group mb-0">
              <input
                type="text"
                name="search"
                value={params.keyword}
                onChange={(e) => search(e.target.value)}
                className="form-control border-bottom rounded-0"
                placeholder="Search..."
              />
            </div>
          </form>
        </div>

        <div className="header-secondary bg-white d-block d-lg-none">
          <div className="container">
            <div className="header-area d-block d-lg-none mx-auto">
              <nav className="navbar navbar-expand-lg navbar-light p-0">
                <ul className="mr-auto">
                  <li className="nav-item">
                    {title.charAt(0).toUpperCase() + title.slice(1)} (
                    {practicesCount})
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <main className="pt-0 main-ClassViewAllTop-All1">
        <div className="main-area search-result mx-auto my-4">
          <div className="container">
            <div className="info mx-auto view-all-top d-none d-lg-block mb-0">
              <div className="row align-items-center pb-3">
                <div className="col-9 col-md-7 top head-text">
                  <div className="clearfix subject-all">
                    <div className="inner inner1_neW">
                      <div className="section_heading_wrapper">
                        {!loading ? (
                          <h3 className="section_top_heading">
                            {title.charAt(0).toUpperCase() + title.slice(1)} (
                            {practicesCount})
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
                            <div
                              onClick={() => {
                                setParams({
                                  ...params,
                                  keyword: "",
                                });
                                search("");
                              }}
                            >
                              <figure>
                                <img src="/assets/images/close3.png" alt="" />
                              </figure>
                            </div>
                          )}
                          <input
                            type="text"
                            className="form-control border-0"
                            placeholder="Search..."
                            maxLength={50}
                            value={params.keyword}
                            name="txtSearch"
                            onChange={(e) => search(e.target.value)}
                          />
                        </div>
                      </form>
                    </section>

                    {/* <div className="form-group switch-item">
                      <div className="d-flex align-items-center">
                        <span className=" mr-3">Show Inactive</span>
                        <div className="align-self-center">
                          <label className="switch col-auto ml-auto my-0 align-middle">
                            <input
                              type="checkbox"
                              checked={params.keyword}
                              onChange={(e) => {
                                setParams({
                                  ...params,
                                  keyword: e.target.value,
                                });
                              }}
                            />
                            <span
                              className="slider round translate-middle-y"
                              style={{ top: 0 }}
                            ></span>
                          </label>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
            {name != "attempted" && (
              <>
                <div className="box-area box-area_new d-none d-lg-block">
                  <div
                    className="box-area-wrap clearfix d-none d-lg-block"
                    style={{ position: "relative" }}
                  >
                    <div className="row">
                      {practices.map((test, index) => (
                        <div
                          key={track(test, index)}
                          className="col-lg-3 col-md-4 col-6 mb-3"
                        >
                          <div className="slider">
                            <div className="box box_new bg-white pt-0">
                              <div className="cursor-pointer">
                                <Link href={`/assessments/details/${test._id}`}>
                                  <PImageComponent
                                    height={110}
                                    fullWidth
                                    imageUrl={test.imageUrl}
                                    backgroundColor={test.colorCode}
                                    text={test.title}
                                    radius={9}
                                    fontSize={15}
                                    type="assessment"
                                    testMode={test.testMode}
                                    testType={test.testType}
                                    isProctored={test.isProctored}
                                  />
                                </Link>
                              </div>
                              <div className="box-inner box-inner_new">
                                {/* Mode-TAG */}
                                {test.accessMode !== "buy" && (
                                  <div className="Box-inner-accessModeTags">
                                    {(test.accessMode === "internal" ||
                                      test.accessMode === "public") && (
                                        <div className="border-0  box-inner_tag">
                                          <div className="d-flex align-items-center">
                                            {test.accessMode === "internal" && (
                                              <span className="material-icons">
                                                lock
                                              </span>
                                            )}
                                            {test.accessMode === "public" && (
                                              <span className="material-icons">
                                                lock_open
                                              </span>
                                            )}
                                            <div className="stud2 subjctViewAll">
                                              <strong>
                                                {test.accessMode.toUpperCase()}
                                              </strong>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    {test.accessMode === "invitation" && (
                                      <>
                                        {test.classRooms.length > 0 ? (
                                          <div className="text-ellipsis pt-1 h6">
                                            {test.classRooms
                                              .map((cr) => cr.name)
                                              .join(", ")}
                                          </div>
                                        ) : (
                                          <div className="text-ellipsis pt-1 h6">
                                            No classroom
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                                {test.accessMode === "buy" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <ItemPrice content={test} />
                                  </div>
                                )}
                                {/* END */}
                                <div className="info p-0 m-0">
                                  <h4
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title={test.title}
                                    className="cursor-pointer"
                                  >
                                    <Link
                                      href={`/assessments/details/${test._id}`}
                                    >
                                      {test.title}
                                    </Link>
                                  </h4>
                                  <ul className="nav">
                                    {test.subjects &&
                                      test.subjects.length > 0 && (
                                        <li>
                                          <a>{test.subjects[0].name}</a>
                                        </li>
                                      )}
                                    {test.subjects &&
                                      test.subjects.length > 1 && (
                                        <li className="ml-1">
                                          <a>
                                            {" "}
                                            + {test.subjects.length - 1} more
                                          </a>
                                        </li>
                                      )}
                                  </ul>
                                </div>

                                {user.role !== "publisher" ? (
                                  <div className="form-row mt-1 subjectViewCustomMx-1">
                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          content_paste
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalQuestion}
                                          </strong>{" "}
                                          questions
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          timelapse
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalTime}
                                          </strong>{" "}
                                          minutes
                                        </div>
                                      </div>
                                    </div>

                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          people
                                        </span>
                                        {test.totalJoinedStudent > 0 ? (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              {test.totalJoinedStudent}
                                            </strong>{" "}
                                            {test.totalJoinedStudent === 1
                                              ? "student"
                                              : "students"}
                                          </div>
                                        ) : (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              No
                                            </strong>{" "}
                                            students
                                          </div>
                                        )}
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          assignment
                                        </span>
                                        {test.totalAttempt > 0 ? (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              {test.totalAttempt}
                                            </strong>{" "}
                                            attempts
                                          </div>
                                        ) : (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              No
                                            </strong>{" "}
                                            attempts
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="form-row mt-1 subjectViewCustomMx">
                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          content_paste
                                        </span>
                                        <span className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalQuestion}
                                          </strong>{" "}
                                          questions
                                        </span>
                                      </div>
                                    </div>

                                    <div className="detailed col-6 small">
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
                                  </div>
                                )}

                                {test.status === "draft" && (
                                  <div className="form-row mt-2 pt-1">
                                    <div className="col">
                                      <a
                                        className="btn btn-outline btn-sm d-block"
                                        onClick={() => reviewTest(test)}
                                      >
                                        Review
                                      </a>
                                    </div>
                                    <div className="col">
                                      <div
                                        className="btn-group w-100"
                                        dropdown="true"
                                        container="body"
                                      >
                                        <Link
                                          className="btn btn-success btn-sm"
                                          href={`=/assessments/details/${test._id}`}
                                        >
                                          Edit
                                        </Link>
                                        {test.canEdit && (
                                          <>
                                            <button
                                              id="button-split"
                                              type="button"
                                              className="btn btn-outline btn-sm dropdown-toggle dropdown-toggle-split"
                                              data-toggle="dropdown"
                                              aria-haspopup="true"
                                              aria-expanded="false"
                                            >
                                              <span className="caret"></span>
                                              <span className="sr-only">
                                                Split button!
                                              </span>
                                            </button>
                                            <div
                                              className="dropdown-menu"
                                              aria-labelledby="button-split"
                                            >
                                              <button
                                                className="dropdown-item"
                                                onClick={() => publish(test)}
                                              >
                                                Publish
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {test.status === "published" && (
                                  <div className="form-row mt-2 pt-1">
                                    <div className="col">
                                      <a
                                        className="btn btn-outline btn-sm d-block"
                                        onClick={() => reviewTest(test)}
                                      >
                                        Review
                                      </a>
                                    </div>
                                    <div className="col">
                                      <Link
                                        className="btn btn-buy btn-block btn-sm"
                                        href={`/assessment/details/${test._id}`}
                                      >
                                        View Details
                                      </Link>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {practices.length === 0 && !loading && (
                      <div className="course-search-empty text-center empty-data">
                        <figure className="mx-auto">
                          <img
                            src="/assets/images/Search-rafiki.png"
                            alt=""
                            className="img-fluid d-block mx-auto mb-4"
                          />
                        </figure>
                        <h6>No Results Found</h6>
                        <p>We couldn&apos;t find any results based on your search</p>
                      </div>
                    )}
                  </div>
                  {loading && (
                    <div className="box-area-wrap clearfix">
                      <div className="heading">
                        <div className="row">
                          <div className="col-3">
                            <SkeletonLoaderComponent
                              Cwidth={100}
                              Cheight={30}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="box-item">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                      <div className="box-item">
                        <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="box-area box-area_new d-block d-lg-none mx-0">
                  <div className="row">
                    {!loading && (
                      <div className="col-8">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            {practicesCount}{" "}
                            {name === "attempted" ? "Attempts" : "Assessments"}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="box-area-wrap clearfix d-block d-lg-none mx-0 position-relative">
                    <div className="row">
                      {practices.map((test, index) => (
                        <div
                          key={index}
                          className="col-lg-3 col-md-4 col-6 mb-3"
                        >
                          <div className="slider">
                            <div className="box box_new bg-white pt-0">
                              <PImageComponent
                                height={105}
                                fullWidth
                                imageUrl={test.imageUrl}
                                backgroundColor={test.colorCode}
                                text={test.title}
                                radius={9}
                                fontSize={15}
                                type="assessment"
                                testMode={test.testMode}
                                testType={test.testType}
                                isProctored={test.isProctored}
                              />

                              <div className="box-inner box-inner_new">
                                <div className="info p-0 m-0">
                                  <h4
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title={test.title}
                                  >
                                    {test.title.length > 25
                                      ? `${test.title.substring(0, 25)}...`
                                      : test.title}
                                  </h4>
                                  <ul className="nav">
                                    {test.subjects &&
                                      test.subjects.length > 0 && (
                                        <li>
                                          <a>{test.subjects[0].name}</a>
                                        </li>
                                      )}
                                    {test.subjects &&
                                      test.subjects.length > 1 && (
                                        <li>
                                          <a>{test.subjects.length - 1}</a>
                                        </li>
                                      )}
                                  </ul>
                                </div>

                                {user.role !== "publisher" ? (
                                  <div className="form-row mt-1 subjectViewCustomMx-1">
                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          content_paste
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalQuestion}
                                          </strong>{" "}
                                          question
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          timelapse
                                        </span>
                                        <div className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalTime}
                                          </strong>{" "}
                                          minutes
                                        </div>
                                      </div>
                                    </div>

                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          people
                                        </span>
                                        {test.totalJoinedStudent > 0 ? (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              {test.totalJoinedStudent}
                                            </strong>{" "}
                                            {test.totalJoinedStudent === 1
                                              ? "student"
                                              : "students"}
                                          </div>
                                        ) : (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              No
                                            </strong>{" "}
                                            students
                                          </div>
                                        )}
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          assignment
                                        </span>
                                        {test.totalAttempt > 0 ? (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              {test.totalAttempt}
                                            </strong>{" "}
                                            attempts
                                          </div>
                                        ) : (
                                          <div className="stud2 ml-1 text-truncate">
                                            <strong className="text-black">
                                              No
                                            </strong>{" "}
                                            attempts
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="form-row mt-1 subjectViewCustomMx">
                                    <div className="detailed col-6 small">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          content_paste
                                        </span>
                                        <span className="stud2 ml-1 text-truncate">
                                          <strong className="text-black">
                                            {test.totalQuestion}
                                          </strong>{" "}
                                          questions
                                        </span>
                                      </div>
                                    </div>

                                    <div className="detailed col-6 small">
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
                                  </div>
                                )}

                                {test.status === "draft" ? (
                                  <div className="form-row mt-2 pt-1">
                                    <div className="col">
                                      <a
                                        className="btn btn-outline btn-sm d-block"
                                        onClick={() => reviewTest(test)}
                                      >
                                        Review
                                      </a>
                                    </div>

                                    <div className="col">
                                      <div className="btn-group w-100">
                                        <Link
                                          className="btn btn-success btn-sm"
                                          href={`/assessment/details/${test._id}`}
                                        >
                                          Edit
                                        </Link>
                                        {test.canEdit && (
                                          <>
                                            <button
                                              type="button"
                                              className="btn btn-outline btn-sm dropdown-toggle dropdown-toggle-split"
                                              data-toggle="dropdown"
                                              aria-haspopup="true"
                                              aria-expanded="false"
                                            >
                                              <span className="caret"></span>
                                              <span className="sr-only">
                                                Split button!
                                              </span>
                                            </button>
                                            <div
                                              className="dropdown-menu"
                                              aria-labelledby="button-split"
                                            >
                                              <button
                                                className="dropdown-item"
                                                onClick={() => publish(test)}
                                              >
                                                Publish
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <Link
                                      className="btn btn-buy btn-block btn-sm round-bottom"
                                      href={`/assessments/details/${test._id}`}
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && <SkeletonLoaderComponent />}
                    </div>
                  </div>
                </div>
              </>
            )}
            {name === "attempted" && (
              <div className="box-area box-area_new">
                <div className="box-area-wrap clearfix position-relative">
                  <div className="row">
                    {practices.map((attempt, index) => (
                      <div key={index} className="col-lg-3 col-md-4 col-6 mb-3">
                        <div className="slider">
                          <div className="box box_new bg-white pt-0">
                            <div
                              className="image-wrap cursor-pointer"
                              onClick={() => viewTest(attempt.test)}
                            >
                              <PImageComponent
                                height={120}
                                fullWidth
                                imageUrl={attempt.test.imageUrl}
                                backgroundColor={attempt.test.colorCode}
                                text={attempt.test.title}
                                radius={9}
                                fontSize={15}
                                type="assessment"
                                testMode={attempt.test.testMode}
                                testType={attempt.test.testType}
                                isProctored={attempt.test.isProctored}
                              />
                            </div>
                            <div className="box-inner box-inner_new">
                              <div className="Box-inner-accessModeTags">
                                <div className="text-ellipsis pt-1 h6">
                                  {attempt.studentName}
                                </div>
                              </div>

                              <div className="info p-0 m-0">
                                <h4
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title={attempt.test.title}
                                  className="mt-0 mb-0 cursor-pointer"
                                  onClick={() => viewTest(attempt.test)}
                                >
                                  {attempt.test.title}
                                </h4>
                                <div className="form-row">
                                  {attempt.test.subjects &&
                                    attempt.test.subjects.length > 0 && (
                                      <div className="col sub1_new text-truncate">
                                        <a>
                                          {attempt.test.subjects[0].name}
                                          {attempt.test.subjects.length > 1 && (
                                            <span>
                                              {" "}
                                              +{" "}
                                              {attempt.test.subjects.length -
                                                1}{" "}
                                              more
                                            </span>
                                          )}
                                        </a>
                                      </div>
                                    )}
                                </div>
                              </div>

                              <div className="Box-inner-1">
                                <div className="form-row mt-1">
                                  <div className="detailed col-6 small">
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        content_paste
                                      </span>
                                      <span className="stud2 ml-1 text-truncate">
                                        <strong>
                                          {attempt.test.totalQuestion > 0
                                            ? attempt.test.totalQuestion
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
                                          {attempt.test.totalTime}
                                        </strong>{" "}
                                        minutes
                                      </span>
                                    </div>
                                  </div>

                                  <div className="detailed col-6 small">
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        access_time
                                      </span>
                                      <span className="stud2 ml-1 text-truncate">
                                        <strong>
                                          {formatDistanceToNow(
                                            new Date(attempt.createdAt),
                                            { addSuffix: true }
                                          )}
                                        </strong>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="form-row mt-2">
                                  <div className="col">
                                    <Link
                                      className="btn btn-outline btn-sm d-block"
                                      href={`/assessment/review/${attempt.test._id}?attemptId=${attempt._id}`}
                                    >
                                      Review
                                    </Link>
                                  </div>
                                  <div className="col">
                                    <Link
                                      className="btn btn-buy btn-sm d-block"
                                      href={`/assessments/student-attempt-summary/${attempt._id}`}
                                    >
                                      View Result
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {practices.length === 0 && !loading && (
                    <div className="course-search-empty text-center empty-data">
                      <figure className="mx-auto">
                        <img
                          src="/assets/images/Search-rafiki.png"
                          alt=""
                          className="img-fluid d-block mx-auto mb-4"
                        />
                      </figure>
                      <h3>No Results Found</h3>
                      <p>We couldn&apos;t find any results based on your search</p>
                    </div>
                  )}
                </div>
                {loading && (
                  <div className="box-area-wrap clearfix">
                    <div className="heading">
                      <div className="row">
                        <div className="col-3">
                          <SkeletonLoaderComponent width={100} height={30} />
                        </div>
                      </div>
                    </div>
                    <div className="box-item">
                      <SkeletonLoaderComponent width={100} height={200} />
                    </div>
                    <div className="box-item">
                      <SkeletonLoaderComponent width={100} height={200} />
                    </div>
                    <div className="box-item">
                      <SkeletonLoaderComponent width={100} height={200} />
                    </div>
                    <div className="box-item">
                      <SkeletonLoaderComponent width={100} height={200} />
                    </div>
                    <div className="box-item">
                      <SkeletonLoaderComponent width={100} height={200} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {practices.length < practicesCount && (
              <div className="text-center">
                <button className="btn btn-light" onClick={loadMore}>
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
