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

export default function ViewAll() {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [testseries, setTestseries] = useState<any>();
  const [type, setType] = useState<any>();
  const [practices, setPractices] = useState<any>([]);
  const [practicesCount, setPracticesCount] = useState(0);
  const [totalCount, setTotalCount] = useState<any>(0);
  const [isCompanySpecific, setIsCompanySpecific] = useState<boolean>(false);
  const [testLoaded, setTestLoaded] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [params, setParams] = useState<any>({
    title: "",
    limit: 12,
    page: 1,
    category: "",
    sort: "statusChangedAt,desc",
  });
  const router = useRouter();
  const [user, setUser] = useState<any>(useSession()?.data?.user?.info || {});
  const { category, query } = useParams();

  const findFunction = async (param: any) => {
    if (category == "myseries") {
      return await clientApi.get(
        `/api/testSeries/myBoughtTestSeries${toQueryString({
          ...param,
          count: true,
        })}`
      );
    } else {
      return await clientApi.get(
        `/api/testSeries/summaryPackagesByStudent${toQueryString({
          ...param,
          count: true,
        })}`
      );
    }
  };

  useEffect(() => {
    console.log(query);
    setLoading(false);
    if (category === "recent-tests") {
      clientApi
        .get(
          `/api/tests/recent/${user?.info?._id}${toQueryString({
            ...params,
            limit: 50,
          })}`
        )
        .then((res: any) => {
          setPractices(res.data);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "company-specific") {
      clientApi
        .post("/api/tests/findAll", {
          ...params,
          limit: 12,
          tags: "company-specific",
        })
        .then((res: any) => {
          setPractices(res.data.results);
          setTotalCount(res.data.count.count || 0);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (
      category === "newly-added-assessments" ||
      category === "challenging-assessments"
    ) {
      clientApi
        .post("/api/tests/findAll", params)
        .then((res: any) => {
          setTotalCount(res.data.count.count || 0);
          let practiceRes = res.data.results.map((d: any) => {
            let data = d;
            data.slugfly = d.title.replace(/\s+/g, "-");
            console.log(data.slugfly, d.title.replace(/\s+/g, "-"));
            return data;
          });
          setPractices(practiceRes);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "exam-specific") {
      clientApi
        .post("/api/tests/findAll", { ...params, tags: "exam-specific" })
        .then((res: any) => {
          setTotalCount(res.data.count.count || 0);
          setPractices(res.data.results);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "classroom-assessments") {
      let practiceData = practices;
      clientApi
        .get(
          `/api/classrooms/findByClassRoom${toQueryString({
            page: 1,
            limit: 12,
          })}`
        )
        .then((res: any) => {
          res.data.result.map((e: any) => {
            practiceData.push(e);
          });
          setTotalCount(res.data.count);
          setPractices(practiceData);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "recommended-assessments") {
      const cParam = {
        page: 1,
        limit: 12,
        type: "all",
        testOnly: true,
        home: true,
      };
      clientApi
        .get(`/api/tests/recommended${toQueryString(cParam)}`)
        .then((res: any) => {
          setPractices(res.data);
          clientApi
            .get(
              `/api/tests/recommended${toQueryString({
                ...cParam,
                count: true,
              })}`
            )
            .then((d: any) => {
              setTotalCount(res.data.total);
              setTestLoaded(true);
            });
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category == "adaptive") {
      clientApi
        .post("/api/tests/findAll", { ...params, adaptive: true })
        .then((res: any) => {
          setTotalCount(res.data.count.count || 0);
          let practiceRes = res.data.results.map((d: any) => {
            let data = d;
            data.slugfly = d.title.replace(/\s+/g, "-");
            return data;
          });
          setPractices(practiceRes);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category == "favorite-assessments") {
      // this.params.excludeUser = true;
      // this.favoriteService.countPractices({ ...this.params }).subscribe((res: any) => {
      //   this.totalCount = res.count
      // });
      // this.favoriteService.findPractices({ ...this.params }).subscribe((res: any[]) => {
      //   this.testLoaded = true;
      //   this.practices = res.map(d => {
      //     d.slugfly = d.title.replace(/\s+/g, "-")
      //     return d;
      //   });
      //   this.spinner.hide('appLoader')
      // });
      setTestLoaded(true);
    }
    setLoading(true);
  }, []);

  // search page
  const reload = async () => {
    console.log(user, "=======-");
    setParams({ ...params, page: 1 });
    setLoading(true);
    setPractices([]);
    setPracticesCount(0);

    const pa = { ...params, includeCount: true };

    clientApi
      .post("/api/tests/teacher/find", pa)
      .then((res: any) => {
        console.log("test loaded");
        console.log(res);
        let tests = res.data.tests;
        tests.map((t: any) => {
          t.canEdit =
            (user?.role != "teacher" && user?.role != "mentor") ||
            t.user == user?._id ||
            (t.instructors && t.instructors.find((i: any) => i == user?._id));
        });
        setPractices(tests);
        setPracticesCount(res.data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadMore = () => {
    console.log("lodadmore", category);
    setParams({ ...params, page: params.page + 1 });
    setLoading(false);
    if (category === "company-specific") {
      clientApi
        .post("/api/tests/findAll", {
          ...params,
          page: params.page + 1,
          limit: 12,
          tags: "company-specific",
        })
        .then((res: any) => {
          setPractices([...practices, ...res.data.results]);
          setTotalCount(res.data.count.count || 0);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (
      category === "newly-added-assessments" ||
      category === "challenging-assessments"
    ) {
      clientApi
        .post("/api/tests/findAll", { ...params, page: params.page + 1 })
        .then((res: any) => {
          setTotalCount(res.data.count.count || 0);
          let practiceRes = res.data.results.map((d: any) => {
            let data = d;
            data.slugfly = d.title.replace(/\s+/g, "-");
            return data;
          });
          setPractices([...practices, ...practiceRes]);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "exam-specific") {
      clientApi
        .post("/api/tests/findAll", {
          ...params,
          page: params.page + 1,
          tags: "exam-specific",
        })
        .then((res: any) => {
          setTotalCount(res.data.count.count || 0);
          setPractices(res.data.results);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "classroom-assessments") {
      let practiceData = practices;
      clientApi
        .get(
          `/api/classrooms/findByClassRoom${toQueryString({
            ...params,
            page: params.page + 1,
          })}`
        )
        .then((res: any) => {
          res.data.result.map((e: any) => {
            practiceData.push(e);
          });
          setTotalCount(res.data.count);
          setPractices(practiceData);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "recommended-assessments") {
      const cParam = {
        ...params,
        page: params.page + 1,
      };
      clientApi
        .get(`/api/tests/recommended${toQueryString(cParam)}`)
        .then((res: any) => {
          setPractices(res.data);
          clientApi
            .get(
              `/api/tests/recommended${toQueryString({
                ...cParam,
                count: true,
              })}`
            )
            .then((d: any) => {
              setTotalCount(res.data.total);
              setTestLoaded(true);
            });
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category == "adaptive") {
      clientApi
        .post("/api/tests/findAll", {
          ...params,
          page: params.page + 1,
          adaptive: true,
        })
        .then((res: any) => {
          setTotalCount(res.data.count.count || 0);
          let practiceRes = res.data.results.map((d: any) => {
            let data = d;
            data.slugfly = d.title.replace(/\s+/g, "-");
            return data;
          });
          setPractices(practiceRes);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category == "favorite-assessments") {
      // this.params.excludeUser = true;
      // this.favoriteService.countPractices({ ...this.params }).subscribe((res: any) => {
      //   this.totalCount = res.count
      // });
      // this.favoriteService.findPractices({ ...this.params }).subscribe((res: any[]) => {
      //   this.testLoaded = true;
      //   this.practices = res.map(d => {
      //     d.slugfly = d.title.replace(/\s+/g, "-")
      //     return d;
      //   });
      //   this.spinner.hide('appLoader')
      // });

      setTestLoaded(true);
    }
  };

  const search = () => {
    setLoading(false);
    setPractices([]);

    if (category === "recent tests") {
      clientApi
        .get(
          `/api/tests/recent/${user?.info?._id}${toQueryString({
            ...params,
            limit: 50,
            page: 1,
            totalCount: 0,
          })}`
        )
        .then((res: any) => {
          setPractices(res.data);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "company specific") {
      clientApi
        .post("/api/tests/findAll", {
          ...params,
          limit: 12,
          page: 1,
          totalCount: 0,
        })
        .then((res: any) => {
          setPractices(res.data.results);
          setTotalCount(res.data.count.count || 0);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (
      category === "newly added assessments" ||
      category === "challenging assessments"
    ) {
      clientApi
        .post("/api/tests/findAll", { ...params, page: 1, totalCount: 0 })
        .then((res: any) => {
          let practiceRes = res.data.results.map((d: any) => {
            d.slugfly = d.title.replace(/\s+/g, "-");
            return d;
          });
          setPractices(practiceRes);
          setTotalCount(res.data.count.count || 0);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "exam specific") {
      clientApi
        .post("/api/tests/findAll", {
          ...params,
          limit: 12,
          page: 1,
          totalCount: 0,
          tags: "exam-specific",
        })
        .then((res: any) => {
          setPractices(res.data.results);
          setTotalCount(res.data.count.count || 0);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "classroom assessments") {
      let practiceData = practices;
      clientApi
        .get(
          `/api/classrooms/findByClassRoom${toQueryString({
            page: 1,
            limit: 12,
            keyword: params.title,
          })}`
        )
        .then((res: any) => {
          res.data.result.map((e: any) => {
            practiceData.push(e);
          });
          setTotalCount(res.data.count);
          setPractices(practiceData);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category === "recommended assessments") {
      let cParam = {
        ...params,
        limit: 12,
        page: 1,
        totalCount: 0,
      };

      clientApi
        .get(`/api/tests/recommended${toQueryString(cParam)}`)
        .then((res: any) => {
          setPractices(res.data);
          clientApi
            .get(
              `/api/tests/recommended${toQueryString({
                ...cParam,
                count: true,
              })}`
            )
            .then((d: any) => {
              setTotalCount(res.data.total);
              setTestLoaded(true);
            });
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category == "adaptive") {
      clientApi
        .post("/api/tests/findAll", {
          ...params,
          limit: 12,
          page: 1,
          totalCount: 0,
          adaptive: true,
        })
        .then((res: any) => {
          setTotalCount(res.data.count.count || 0);
          let practiceRes = res.data.results.map((d: any) => {
            d.slugfly = d.title.replace(/\s+/g, "-");
            return d;
          });
          setPractices(practiceRes);
          setTestLoaded(true);
        })
        .catch((err) => {
          setTestLoaded(true);
        });
    } else if (category == "favorite assessments") {
      // this.params.limit = 12;
      // this.params.page = 1;
      // this.totalCount = 0
      // this.favoriteService.countPractices({ ...this.params }).subscribe((res: any) => {
      //   this.totalCount = res.count
      // });
      // this.favoriteService.findPractices({ ...this.params }).subscribe((res: any[]) => {
      //   this.testLoaded = true;
      //   this.practices = res.map(d => {
      //     d.slugfly = d.title.replace(/\s+/g, "-")
      //     return d;
      //   });
      //   this.spinner.hide('appLoader')
      // });
    }
    setLoading(true);
  };

  const removeFavorite = (practice: any) => {
    alertify.set("notifier", "position", "top-right");
    clientApi
      .delete(`/api/favorites/delete/${practice._id}`, {})
      .then((res: any) => {
        alertify.success(
          "This practice test has been removed from your favorite list successfully."
        );
        const idx = practices.findIndex((t: any) => t._id == practice._id);
        if (idx > -1) {
          practices.splice(idx, 1);
          if (totalCount > 0) {
            setTotalCount(totalCount - 1);
          }
        }
      });
  };

  const addFavorite = (practice: any) => {
    alertify.set("notifier", "position", "top-right");
    if (practice.isFavorite === true) {
      alertify.alert(
        "Message",
        "This practice test already  exists in your favorite list!"
      );
      return false;
    }
    clientApi
      .post("/api/favorites/create", { practiceSetId: practice._id })
      .then((res: any) => {
        alertify.success("Added to favorites successfully.");
        const idx = practices.findIndex((t: any) => t._id == practice._id);
        let temp = practices;
        temp[idx].isFavorite = true;
        setPractices(temp);
      });
  };

  return (
    <div>
      <div className="container">
        <div className="search-bar d-block d-lg-none mx-0">
          {/* <form onSubmit={search}> */}
          <div className="form-group mb-0">
            <input
              type="text"
              name="search"
              value={params?.keywords}
              onChange={search}
              className="form-control border-bottom rounded-0"
              placeholder="Search..."
            />
          </div>
          {/* </form> */}
        </div>
      </div>

      <div className="header-secondary bg-white d-block d-lg-none mt-0">
        <div className="container">
          <div className="header-area d-block d-lg-none mx-auto">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <a className="d-none">
                <figure>
                  <img src="/assets/images/arrow-left.png" alt="" />
                </figure>
              </a>

              <ul className="mr-auto">
                <li className="nav-item text-uppercase">{category}</li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <main className="pt-0 main-ClassViewAllTop-All1 student_assessment">
        <div className="main-area view-all-remove search-result mx-auto my-4">
          <div className="main-area-top p-0 d-none d-lg-block">
            <div className="container">
              <div className="info mx-auto mb-3">
                <div className="row align-items-center">
                  <div className="col-9 col-md-7">
                    <div className="d-flex align-items-center clearfix">
                      <figure className="squared-rounded_wrap_80">
                        <img src="/assets/images/img1.png" alt="" />
                      </figure>

                      <div className="subject_title_wrapper inner ml-2 p-0">
                        <h3 className="subject_title">{category}</h3>
                        {!testLoaded && (
                          <SkeletonLoaderComponent
                            Cwidth="40"
                            Cheight="40"
                          ></SkeletonLoaderComponent>
                        )}
                        {testLoaded && (
                          <span className="subject_number">
                            {totalCount} Tests
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-3 col-md-5">
                    <form
                      className="common_search-type-1 form-half topic_form-remove ml-auto my-0"
                      action="search.html"
                    >
                      <div className="form-group">
                        <input
                          type="text"
                          name="search"
                          value={params.title}
                          onChange={search}
                          className="form-control border-0"
                          placeholder="Search..."
                        />

                        <span>
                          <figure>
                            <img
                              src="/assets/images/search-icon-2.png"
                              alt=""
                            />
                          </figure>
                        </span>
                      </div>
                    </form>

                    <div className="search-btn ml-auto">
                      <a href="#">
                        <figure>
                          <img src="/assets/images/search.png" alt="" />
                        </figure>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            {!testLoaded && (
              <div className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block">
                <div className="heading heading_new ">
                  <div className="row" style={{ padding: "2%" }}>
                    <div className="col-3">
                      <SkeletonLoaderComponent
                        Cwidth="100"
                        Cheight="30"
                      ></SkeletonLoaderComponent>
                    </div>
                  </div>
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent
                    Cwidth="100"
                    Cheight="200"
                  ></SkeletonLoaderComponent>
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent
                    Cwidth="100"
                    Cheight="200"
                  ></SkeletonLoaderComponent>
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent
                    Cwidth="100"
                    Cheight="200"
                  ></SkeletonLoaderComponent>
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent
                    Cwidth="100"
                    Cheight="200"
                  ></SkeletonLoaderComponent>
                </div>
                <div className="box-item">
                  <SkeletonLoaderComponent
                    Cwidth="100"
                    Cheight="200"
                  ></SkeletonLoaderComponent>
                </div>
              </div>
            )}
            {testLoaded && (
              <div className="box-area">
                {practices && practices.length > 0 && (
                  <div className="row">
                    <div className="col-8">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">All tests</h3>
                      </div>
                    </div>

                    <div className="col-4"></div>
                  </div>
                )}

                <div
                  className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                  style={{ position: "relative" }}
                >
                  <div className="row">
                    {practices.map((test: any, index: number) => (
                      <div
                        className="col-lg-3 col-md-4 col-6 mb-3 box-item"
                        key={index}
                      >
                        <div className="box box_new bg-white pt-0">
                          <div className="image-wrap cursor-pointer">
                            <PImageComponent
                              height={135}
                              fullWidth
                              imageUrl={test.imageUrl}
                              text={test.title}
                              radius={9}
                              fontSize={15}
                              type="assessment"
                              testMode={test.testMode}
                            />
                            {/* <Link href={`/assessments/home/${test.slugfly}?id=${test._id}`}> */}

                            {category != "adaptive" && (
                              <div className="favorite-icon">
                                {!test.isFavorite && (
                                  <a onClick={() => addFavorite(test)}>
                                    <figure>
                                      <img
                                        className="addfavrouite"
                                        src="/assets/images/like-white-bg.png"
                                        alt="this add favourite "
                                      />
                                    </figure>
                                  </a>
                                )}
                                {test.isFavorite && (
                                  <a onClick={() => removeFavorite(test)}>
                                    <figure>
                                      <img
                                        className="removeFavorite"
                                        src="/assets/images/like-red-bg.png"
                                        alt="this remove from favourite"
                                      />
                                    </figure>
                                  </a>
                                )}
                              </div>
                            )}
                            {/* </Link> */}
                          </div>

                          <div className="box-inner box-inner_new">
                            <div className="info p-0 m-0">
                              <Link
                                href={`/assessment/home/${test.slugfly}?id=${test._id}`}
                              >
                                <h4
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title={test.title}
                                  className="text-truncate cursor-pointer"
                                >
                                  {test.title}
                                </h4>
                              </Link>

                              <div className="form-row subjectAndMore_new small">
                                {test.subjects && test.subjects.length && (
                                  <div className="col sub1_new text-truncate">
                                    <a
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={test.subjects[0].name}
                                    >
                                      {test.subjects[0].name}
                                      {test.subjects.length > 1 && (
                                        <span className="mb-1">
                                          {" "}
                                          + {test.subjects.length - 1} more{" "}
                                        </span>
                                      )}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="row">
                              <div className="col-6">
                                <div className="question-count">
                                  <span>
                                    {test.questionsToDisplay ||
                                      test.totalQuestion}{" "}
                                    questions
                                  </span>
                                </div>
                              </div>

                              <div className="col-6">
                                <div className="time text-right">
                                  <span>{test.totalTime} minutes</span>
                                </div>
                              </div>
                            </div>
                            {test.accessMode == "buy" && (
                              <div className="selling-price-info selling-price-info_new d-flex">
                                <ItemPrice {...test} />
                              </div>
                            )}
                          </div>

                          <div className="view-detail view-detail_new">
                            <Link
                              href={`/assessment/home/${test.slugfly}?id=${test._id}`}
                            >
                              VIEW DETAILS
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {practices && practices.length < totalCount ? (
                    <div className="text-center">
                      <a className="btn btn-light" onClick={() => loadMore()}>
                        Load More
                      </a>
                    </div>
                  ) : null}
                </div>

                <div
                  className="box-area-wrap box-area-wrap_new clearfix d-block d-lg-none"
                  style={{ position: "relative" }}
                >
                  <div className="row">
                    {practices.map((test: any, index: number) => (
                      <div
                        className="col-lg-3 col-md-4 col-6 mb-3 box-item"
                        key={index}
                      >
                        <div className="box box_new bg-white pt-0">
                          <div className="image-wrap">
                            <PImageComponent
                              height={135}
                              fullWidth
                              imageUrl={test.imageUrl}
                              text={test.title}
                              radius={9}
                              fontSize={15}
                              type="assessment"
                              testMode={test.testMode}
                            />
                            {category != "adaptive" && (
                              <div className="favorite-icon">
                                {!test.isFavorite && (
                                  <a onClick={() => addFavorite(test)}>
                                    <figure>
                                      <img
                                        className="addfavrouite"
                                        src="/assets/images/like-white-bg.png"
                                        alt="this add favourite "
                                      />
                                    </figure>
                                  </a>
                                )}
                                {test.isFavorite && (
                                  <a onClick={() => removeFavorite(test)}>
                                    <figure>
                                      <img
                                        className="removeFavorite"
                                        src="/assets/images/like-red-bg.png"
                                        alt="this remove from favourite"
                                      />
                                    </figure>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="box-inner box-inner_new">
                            <div className="info p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={test.title}
                                className="text-truncate"
                              >
                                {test.title}
                              </h4>

                              <div className="form-row subjectAndMore_new small">
                                {test.subjects && test.subjects.length && (
                                  <div className="col sub1_new text-truncate">
                                    <a
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={test.subjects[0].name}
                                    >
                                      {test.subjects[0].name}
                                      {test.subjects.length > 1 && (
                                        <span className="mb-1">
                                          {" "}
                                          + {test.subjects.length - 1} more{" "}
                                        </span>
                                      )}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="row">
                              <div className="col-6">
                                <div className="question-count">
                                  <span>
                                    {test.questionsToDisplay ||
                                      test.totalQuestion}{" "}
                                    questions
                                  </span>
                                </div>
                              </div>

                              <div className="col-6">
                                <div className="time text-right">
                                  <span>{test.totalTime} minutes</span>
                                </div>
                              </div>
                            </div>
                            {test.accessMode == "buy" && (
                              <div className="selling-price-info selling-price-info_new d-flex">
                                <ItemPrice {...test} />
                              </div>
                            )}
                          </div>

                          <div className="view-detail view-detail_new">
                            <Link
                              href={`/assessment/home/${test.slugfly}?id=${test._id}`}
                            >
                              VIEW DETAILS
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {practices && practices.length < totalCount && (
                    <div className="text-center mx-auto">
                      <a className="btn btn-light" onClick={() => loadMore()}>
                        Load More
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
