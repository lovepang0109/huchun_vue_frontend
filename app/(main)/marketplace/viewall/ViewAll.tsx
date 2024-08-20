"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import ItemPrice from "@/components/ItemPrice";
import PImageComponent from "@/components/AppImage";
import { toQueryString } from "@/lib/validator";
import { addItem, getItems } from "@/services/shopping-cart-service";
import { Button } from "react-bootstrap";

const ViewAll = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<any>();


  const category = searchParams.get("type");

  const [params, setParams]: any = useState({
    title: "",
    limit: 50,
    mode: "",
  });
  const [practices, setPractices]: any = useState([]);
  const [searchText, setsearchText]: any = useState();
  const [isCourse, setisCourse]: any = useState(false);
  const [isTestSeries, setisTestSeries]: any = useState(false);
  const [testLoaded, settestLoaded]: any = useState(false);

  // check this some confusion was here
  const search = (e: any) => {
    e.preventDefault();
    setPractices([]);
    settestLoaded(false);
    startFunc();
  };

  const buyNow = (course: any, type: string) => {
    if (user.role != "student") {
      course.price = course.marketPlacePrice;
    }
    if (course.gocart) {
      push("/cart");
    } else {
      const newItem = {
        ...course,
        gocart: true,
      };
      addItem(course, 1, type);

      setPractices(
        practices.map((item: any) =>
          item._id === newItem._id ? newItem : item
        )
      );
    }
  };

  const viewTestSeries = (item: any) => {
    if (user.role != "student") {
      push(`/${user.role}/view-testseries/${item._id}`);
    } else {
      push(`/testSeries/details/${item._id}`);
    }
  };

  const viewCourse = (item: any) => {
    if (user.role != "student") {
      push(`/${user.role}/view-course/${item._id}`);
    } else {
      push(`/course/details/${item._id}`);
    }
  };

  const viewTest = (item: any) => {
    if (user.role != "student") {
      push(`/${user.role}/view-assessment/${item._id}`);
    } else {
      push(`/assessment/home/${item.title}?id=${item._id}`);
    }
  };

  const startFunc = async () => {
    if (category === "popularCourse") {
      await setParams({
        ...params,
        limit: 50,
        mode: "buy",
      });
      const { data } = await clientApi.get(
        `/api/course/teacher/mostPopularCourses/${toQueryString({
          ...params,
          mode: "buy",
        })}`
      );
      setPractices(data);
      settestLoaded(true);
      setisCourse(true);
    } else if (category === "popularTestSeries") {
      await setParams({
        ...params,
        limit: 50,
        mode: "buy",
      });
      const { data } = await clientApi.get(
        `/api/testSeries/teacher/mostPopular${toQueryString(params)}`
      );
      setPractices(data.sort((a: any, b: any) => a.enrolled - b.enrolled));
      setisTestSeries(true);
      settestLoaded(true);
    } else if (category === "course") {
      let citems = getItems();
      setCartItems(citems);
      const { data } = await clientApi.get(
        `/api/course/getPublisherCourse${toQueryString(params)}`
      );
      let coursedata = data.map((d: any) => {
        let f = citems.find((element: any) => element._id == d._id);
        if (f) {
          return {
            ...d,
            gocart: true,
          };
        } else {
          return {
            ...d,
            gocart: false,
          };
        }
      });
      setPractices(
        coursedata.sort((a: any, b: any) => a.enrolled - b.enrolled)
      );
      // setPractices(data.sort((a: any, b: any) => a.enrolled - b.enrolled));
      setisCourse(true);
      settestLoaded(true);
    } else if (category === "testseries") {
      await setParams({
        ...params,
        limit: 50,
      });
      let citems = getItems();
      setCartItems(citems);
      const { data } = await clientApi.get(
        `/api/testSeries/getPublisherTestseries${toQueryString(params)}`
      );
      let coursedata = data.map((d: any) => {
        let f = citems.find((element: any) => element._id == d._id);
        if (f) {
          return {
            ...d,
            gocart: true,
          };
        } else {
          return {
            ...d,
            gocart: false,
          };
        }
      });
      setPractices(
        coursedata.sort((a: any, b: any) => a.enrolled - b.enrolled)
      );
      setisTestSeries(true);
      settestLoaded(true);
    } else if (category === "assessment") {

      await setParams({
        ...params,
        limit: 50,
      });
      let citems = getItems();
      setCartItems(citems);
      const { data } = await clientApi.get(
        `/api/tests/getPublisherAssessments${toQueryString(params)}`
      );
      let coursedata = data.map((d: any) => {
        let f = citems.find((element: any) => element._id == d._id);
        if (f) {
          return {
            ...d,
            gocart: true,
          };
        } else {
          return {
            ...d,
            gocart: false,
          };
        }
      });
      setPractices(
        coursedata.sort((a: any, b: any) => a.enrolled - b.enrolled)
      );
      settestLoaded(true);
    }
  };

  useEffect(() => {
    startFunc();
  }, []);
  return (
    <div>
      <div className="container">
        <div className="search-bar d-block d-lg-none mx-0">
          <form onSubmit={search}>
            <div className="form-group mb-0">
              <input
                type="text"
                name="search"
                value={params.title}
                onChange={(e) =>
                  setParams({ ...params, title: e.target.value })
                }
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
                {category == "course" && <li className="nav-item ">Courses</li>}
                {category == "assessment" && (
                  <li className="nav-item ">Assessments</li>
                )}
                {category == "testseries" && (
                  <li className="nav-item ">Test Series</li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <main className="pt-3">
        <div className="main-area mx-auto mw-100">
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
                        {category == "course" && (
                          <h3 className="subject_title">Courses</h3>
                        )}
                        {category == "assessment" && (
                          <h3 className="subject_title">Assessments</h3>
                        )}
                        {category == "testseries" && (
                          <h3 className="subject_title">Test series</h3>
                        )}
                        {!testLoaded ? (
                          <SkeletonLoaderComponent Cwidth="40" Cheight="25" />
                        ) : (
                          <span className="subject_number">
                            {practices?.length}{" "}
                            {category == "assessment"
                              ? "Assessments"
                              : category == "course"
                              ? "Courses"
                              : "Test Series"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-3 col-md-5">
                    <form
                      className="common_search-type-1 form-half topic_form-remove ml-auto my-0"
                      onSubmit={search}
                    >
                      <div className="form-group">
                        <input
                          type="text"
                          name="search"
                          defaultValue={params.title}
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            {!testLoaded && (
              <div className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block">
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
                <div
                  className="box-area-wrap box-area-wrap_new clearfix d-none d-lg-block"
                  style={{ position: "relative" }}
                >
                  {practices && practices.length && (
                    <div className="row">
                      {practices.map((test: any, index: any) => {
                        return (
                          <div
                            className="col-lg-3 col-md-4 col-6 mb-3 box-item-remove"
                            key={"category" + index}
                          >
                            {category === "popularCourse" ||
                              (category === "course" && (
                                <div
                                  className="box box_new bg-white pt-0 cursor-pointer"
                                  onClick={() => viewCourse(test)}
                                >
                                  <PImageComponent
                                    height={135}
                                    fullWidth
                                    imageUrl={test.imageUrl}
                                    backgroundColor={test.colorCode}
                                    text={test.title}
                                    radius={9}
                                    fontSize={15}
                                    type="course"
                                    testMode={test.testMode}
                                  />
                                </div>
                              ))}
                            {category === "popularTestSeries" ||
                              (category === "testseries" && (
                                <div
                                  className="box box_new bg-white pt-0 cursor-pointer"
                                  onClick={() => viewTestSeries(test)}
                                >
                                  <PImageComponent
                                    height={135}
                                    fullWidth
                                    imageUrl={test.imageUrl}
                                    backgroundColor={test.colorCode}
                                    text={test.title}
                                    radius={9}
                                    fontSize={15}
                                    type="testseries"
                                    testMode={test.testMode}
                                  />
                                </div>
                              ))}
                            {category === "assessment" && (
                              <div
                                className="box box_new bg-white pt-0 cursor-pointer"
                                onClick={() => viewTest(test)}
                              >
                                <PImageComponent
                                  height={135}
                                  fullWidth
                                  imageUrl={test.imageUrl}
                                  backgroundColor={test.colorCode}
                                  text={test.title}
                                  radius={9}
                                  fontSize={15}
                                  type="assessment"
                                  testMode={test.testMode}
                                />
                              </div>
                            )}
                            <div className="box-inner box-inner_new">
                              <div className="info p-0 m-0">
                                {category === "popularCourse" ||
                                  (category === "course" && (
                                    <h4
                                      className="cursor-pointer text-ellipsis-2"
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={test.title}
                                      onClick={() => viewCourse(test)}
                                      style={{ height: "30px" }}
                                    >
                                      {test.title}
                                    </h4>
                                  ))}
                                {category === "popularTestSeries" ||
                                  (category === "testseries" && (
                                    <h4
                                      className="cursor-pointer text-ellipsis-2"
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={test.title}
                                      onClick={() => viewTestSeries(test)}
                                      style={{ height: "30px" }}
                                    >
                                      {test.title}
                                    </h4>
                                  ))}
                                {category === "assessment" && (
                                  <h4
                                    className="cursor-pointer text-ellipsis-2"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title={test.title}
                                    onClick={() => viewTest(test)}
                                    style={{ height: "30px" }}
                                  >
                                    {test.title}
                                  </h4>
                                )}

                                <div className="form-row">
                                  {test.subjects &&
                                    test.subjects.length > 0 && (
                                      <div className="col sub1_new text-truncate">
                                        <a>
                                          {test.subjects[0].name}
                                          {test.subjects.length > 1 && (
                                            <span>
                                              +{test.subjects.length - 1} more
                                            </span>
                                          )}
                                        </a>
                                      </div>
                                    )}
                                </div>
                                <div className="author-name">
                                  <p>
                                    <span>
                                      {test.userName || test.user.name}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              {test.accessMode == "buy" &&
                                user.role != "student" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <ItemPrice
                                      {...test}
                                      field="marketPlacePrice"
                                    />
                                  </div>
                                )}
                              {test.accessMode == "buy" &&
                                user.role == "student" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <ItemPrice {...test} field="price" />
                                  </div>
                                )}
                              {category === "popularTestSeries" ||
                                (category === "testseries" && (
                                  <div className="view-detail view-detail_new">
                                    {!test.enrolled ? (
                                      <div className="row pt-4 mt-2 align-items-center gap-1">
                                        <div className="col-6 pr-1">
                                          <Button
                                            variant="outline-primary"
                                            className="w-100"
                                            onClick={() => viewTestSeries(test)}
                                          >
                                            View
                                          </Button>{" "}
                                        </div>
                                        <div className="col-6 pl-1">
                                          <Button
                                            variant="light"
                                            className="w-100"
                                            onClick={() =>
                                              buyNow(test, "testseries")
                                            }
                                          >
                                            {test?.gocart == true ? (
                                            <>Go To Cart</>
                                          ) : (
                                            <>Add To Cart</>
                                          )}
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="px-2">
                                        <h5 className="">Already Purchased</h5>
                                        <Button
                                          variant="outline-primary"
                                          className="w-100 mt-2"
                                          onClick={() => viewTest(test)}
                                        >
                                          View
                                        </Button>{" "}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              {category === "assessment" && (
                                <div className="view-detail view-detail_new">
                                  {!test.enrolled ? (
                                    <div className="row pt-4 mt-2 align-items-center gap-1">
                                      <div className="col-6 pr-1">
                                        <Button
                                          variant="outline-primary"
                                          className="w-100"
                                          onClick={() => viewTest(test)}
                                        >
                                          View
                                        </Button>{" "}
                                      </div>
                                      <div className="col-6 pl-1">
                                        <Button
                                          variant="light"
                                          className="w-100"
                                          onClick={() =>
                                            buyNow(test, "practice")
                                          }
                                        >
                                          {test?.gocart == true ? (
                                            <>Go To Cart</>
                                          ) : (
                                            <>Add To Cart</>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="px-2">
                                      <h5 className="">Already Purchased</h5>
                                      <Button
                                        variant="outline-primary"
                                        className="w-100 mt-2"
                                        onClick={() => viewTest(test)}
                                      >
                                        View
                                      </Button>{" "}
                                    </div>
                                  )}
                                </div>
                              )}
                              {category === "popularCourse" ||
                                (category === "course" && (
                                  <div className="view-detail view-detail_new">
                                    {!test.enrolled ? (
                                      <div className="row pt-4 mt-2 align-items-center gap-1">
                                        <div className="col-6 pr-1">
                                          <Button
                                            variant="outline-primary"
                                            className="w-100"
                                            onClick={() => viewCourse(test)}
                                          >
                                            View
                                          </Button>{" "}
                                        </div>
                                        <div className="col-6 pl-1">
                                          <Button
                                            variant="light"
                                            className="w-100"
                                            onClick={() =>
                                              buyNow(test, "course")
                                            }
                                          >
                                            {test?.gocart == true ? (
                                            <>Go To Cart</>
                                          ) : (
                                            <>Add To Cart</>
                                          )}
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="px-2">
                                        <h5 className="">Already Purchased</h5>
                                        <Button
                                          variant="outline-primary"
                                          className="w-100 mt-2"
                                          onClick={() => viewTest(test)}
                                        >
                                          View
                                        </Button>{" "}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {practices && !practices.length && (
                    <div className="course-search-empty text-center empty-data">
                      <figure className="mx-auto">
                        <img
                          src="/assets/images/Search-rafiki.png"
                          alt=""
                          className="img-fluid d-block mx-auto mb-4"
                        />
                      </figure>

                      <h3>No Results Found</h3>
                      <p>
                        We couldn&apos;t find any results based on your search
                      </p>
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
};
export default ViewAll;
