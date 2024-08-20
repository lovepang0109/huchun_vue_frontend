"use client";
import { useState, useEffect } from "react";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { css } from "@emotion/react";
import { ClipLoader } from "react-spinners";
import ItemPrice from "@/components/ItemPrice";
import Price from "@/components/assessment/price";
import Link from "next/link";
import * as testseriesSvc from "@/services/testseriesService";
import * as favoriteSvc from "@/services/favaorite-service";
import * as userService from "@/services/userService";
import * as alertify from "alertifyjs";
import moment from "moment";
import PImageComponent from "@/components/AppImage";

export default function ViewAll() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<any>({
    limit: 12,
    page: 1,
    countStudent: true,
    countQuestion: true,
    title: "",
  });
  const [series, setSeries] = useState<any>();
  const [totalItems, setTotalItems] = useState<number>(0);
  const user: any = useSession()?.data?.user?.info || {};
  const { category } = useParams();
  const [name, setName] = useState<string>("");
  const queryParams = useSearchParams();

  useEffect(() => {
    const para = searchParams;
    if (category == "my-series") {
      setName("My");
    } else if (category == "published") {
      setName("Active");
      setSearchParams({
        ...searchParams,
        status: category,
      });
      para.status = category;
    } else if (category == "tags") {
      setName(queryParams.get("title"));
      setSearchParams({
        ...searchParams,
        tags: queryParams.get("title"),
        sort: "title,1",
      });
      para.tags = queryParams.get("title");
      para.sort = "title,1";
    } else if (category == "favorite") {
      setName("Favorite");
      setSearchParams({
        ...searchParams,
        favorite: true,
      });
      para.favorite = true;
    } else {
      setName(category);
      setSearchParams({
        ...searchParams,
        status: category,
      });
      para.status = category;
    }

    search(para);
  }, []);

  const search = (para?: any) => {
    if (!para) {
      para = searchParams;
    }
    setSearchParams({
      ...searchParams,
      page: 1,
    });
    para.page++;
    setSearchParams({
      ...para,
    });
    setIsSearching(true);
    const query = { ...para, includeCount: true };
    if (!query.title) {
      delete query.title;
    }

    if (category == "favorite") {
      favoriteSvc
        .findTestSeries({ ...searchParams, count: true })
        .then((res: any) => {
          setTotalItems(res.total);
          setSeries(res.series);
          setIsSearching(false);
        })
        .catch((err) => {
          setIsSearching(false);
        });
    } else {
      testseriesSvc
        .find(query)
        .then((res: any) => {
          setTotalItems(res.count);

          setSeries(res.series);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }
  };

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, title: e.target.value });
    setTimeout(() => {
      search();
    }, 500); // Debounce logic
  };

  const loadMore = () => {
    setSearchParams({
      ...searchParams,
      page: searchParams.page + 1,
    });
    const query = {
      ...searchParams,
      page: searchParams.page + 1,
    };
    if (category == "favorite") {
      favoriteSvc.findTestSeries(query).then((res: any) => {
        setSeries(series.concat(res.series));
      });
    } else {
      testseriesSvc.find(query).then((res: any) => {
        setSeries(series.concat(res.series));
      });
    }
  };

  const validate = (seri: any) => {
    // validate data
    if (!seri.subjects[0]) {
      alertify.alert("Message", "Please select at least one subject.");
      return false;
    }

    if (seri.expiresOn && !seri.startDate) {
      alertify.alert("Message", "Start date is required.");
      return false;
    }

    if (seri.startDate && seri.expiresOn) {
      if (
        moment(seri.startDate, "DD-MM-YYYY").isAfter(
          moment(seri.expiresOn, "DD-MM-YYYY")
        )
      ) {
        alertify.alert(
          "Message",
          "Start date cannot be greater than end date."
        );
        return false;
      }
    }

    if (seri.accessMode == "buy") {
      if (!seri.countries.length) {
        alertify.alert("Message", "Please set at least one currency.");
        return false;
      }
      // if (seri.countries.find(c => !c.price && !c.marketPlacePrice)) {
      //   alertify.alert('Please enter a valid price.');
      //   return false
      // }
      if (seri.discount > 100) {
        alertify.alert("Message", "Discount cannot be greater than 100%.");
        return false;
      }
    }

    if (
      user.role != "publisher" &&
      seri.accessMode == "invitation" &&
      !seri.classrooms.length
    ) {
      alertify.alert("Message", "Please select at least one classroom.");
      return false;
    }

    if (!seri.practiceIds || seri.practiceIds.length < 2) {
      alertify.alert("Message", "Please select at least two assessments.");
      return false;
    }

    return true;
  };

  const publish = (seri) => {
    if (validate(seri)) {
      alertify.confirm(
        "Are you sure you want to publish this Test Series?",
        (msg) => {
          testseriesSvc.publish(seri._id).then(
            (res: any) => {
              seri.status = "published";
              seri.statusChangedAt = res.statusChangedAt;

              alertify.success("Test Series published successfully.");
            },
            (err) => {
              alertify.alert(
                "Message",
                "Something went wrong. Please check browser console for more details."
              );
            }
          );
        }
      );
    }
  };

  const checkOwner = (item) => {
    if (
      (user.role != "teacher" && user.role != "mentor") ||
      item.user._id == user._id
    ) {
      return true;
    }
    let val = false;
    if (item.instructors && item.instructors.length) {
      const index = item.instructors.findIndex((e) => e == user._id);
      if (index > -1) {
        val = true;
      }
    }
    return val;
  };

  const track = (index, item) => {
    return item._id;
  };

  return (
    <>
      <div>
        <div className="container">
          <div className="search-bar d-block d-lg-none mx-0">
            <form>
              <div className="form-group mb-0">
                <input
                  className="form-control border-bottom rounded-0"
                  placeholder="Search..."
                  type="text"
                  name="search"
                  value={searchParams.title}
                  onChange={handleChange}
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
                  <li className="nav-item">
                    {name.charAt(0).toUpperCase() + name.slice(1)} Test Series (
                    {totalItems})
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
            <div className="info mx-auto view-all-top d-none d-lg-block mb-3">
              <div className="row align-items-center pb-3">
                <div className="col-9 col-md-7 top head-text">
                  <div className="clearfix subject-all">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        {name.charAt(0).toUpperCase() + name.slice(1)} Test
                        Series ({totalItems})
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="col-3 col-md-5 top head-search">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchParams.title}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="box-area box-area_new d-none d-lg-block">
              <div className="box-area-wrap d-none d-lg-block position-relative">
                {series ? (
                  <div className="row">
                    {series.map((testseries) => (
                      <div
                        key={testseries._id}
                        className="col-lg-3 col-md-4 col-6 mb-3"
                      >
                        <div className="box-item-remove w-100">
                          <div className="box box_new bg-white pt-0">
                            <div
                              className="image-wrap cursor-pointer"
                              onClick={() =>
                                (window.location.href = `/testseries/details/${testseries._id}`)
                              }
                            >
                              <PImageComponent
                                height={118}
                                fullWidth
                                imageUrl={testseries.imageUrl}
                                backgroundColor={testseries.colorCode}
                                type="testSeries"
                                text={testseries.title}
                                radius={9}
                                fontSize={15}
                              />

                              <div className="box-inner box-inner_new cardFontAll-imp1">
                                {status !== "published" && (
                                  <div className="Box-inner-accessModeTags">
                                    <div className="border-0 box-inner_tag">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {testseries.accessMode ===
                                            "invitation" ||
                                            testseries.accessMode === "buy"
                                            ? "lock"
                                            : "lock_open"}
                                        </span>
                                        <div className="stud2 subjctViewAll">
                                          <strong>
                                            {testseries.accessMode ===
                                              "invitation" ||
                                              testseries.accessMode === "buy"
                                              ? "PRIVATE"
                                              : "PUBLIC"}
                                          </strong>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="info p-0 m-0">
                                  <h4
                                    title={testseries.title}
                                    className="cursor-pointer"
                                    onClick={() =>
                                      (window.location.href = `/${user.role}/testseries/details/${testseries._id}`)
                                    }
                                  >
                                    {testseries.title}
                                  </h4>
                                  <div className="subject-name">
                                    <p>
                                      {testseries.subjects.length > 1
                                        ? "Multiple Subjects"
                                        : testseries.subjects[0].name}
                                    </p>
                                  </div>
                                </div>
                                <div className="form-row cardFontAll-imp justify-content-between">
                                  {testseries.status !== "draft" && (
                                    <div className="col-6 text-truncate">
                                      <span className="material-icons course">
                                        people
                                      </span>
                                      <span className="icon-text">
                                        {testseries.students}
                                      </span>
                                      <span className="icon-text">
                                        {testseries.students === 1
                                          ? "student"
                                          : "students"}
                                      </span>
                                    </div>
                                  )}

                                  <div className="col-6 text-truncate">
                                    <span className="material-icons course">
                                      timelapse
                                    </span>
                                    <span className="icon-text">
                                      {testseries.totalTests}
                                    </span>
                                    <span className="icon-text">
                                      Assessments
                                    </span>
                                  </div>

                                  {testseries.status === "draft" && (
                                    <div className="col-6 text-truncate">
                                      <span className="material-icons course">
                                        content_paste
                                      </span>
                                      <span className="icon-text">
                                        {testseries.questions}
                                      </span>
                                      <span className="icon-text">
                                        Questions
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {testseries.accessMode === "buy" &&
                                  status === "published" && (
                                    <div className="selling-price-info selling-price-info_new d-flex">
                                      <ItemPrice
                                        content={testseries}
                                        field="marketPlacePrice"
                                      />
                                    </div>
                                  )}

                                {status === "published" &&
                                  testseries.accessMode !== "buy" && (
                                    <div className="mt-1">
                                      <div className="border-0 box-inner_tag">
                                        <div className="d-flex align-items-center">
                                          <span className="material-icons">
                                            {testseries.accessMode ===
                                              "invitation" ||
                                              testseries.accessMode === "buy"
                                              ? "lock"
                                              : "lock_open"}
                                          </span>
                                          <div className="stud2 subjctViewAll">
                                            <strong>
                                              {testseries.accessMode ===
                                                "invitation" ||
                                                testseries.accessMode === "buy"
                                                ? "PRIVATE"
                                                : "PUBLIC"}
                                            </strong>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {testseries.status === "draft" && (
                                  <div className="form-row mt-2">
                                    <div className="col">
                                      <a
                                        className="btn btn-outline btn-sm btn-block"
                                        href={`/testseries/details/${testseries._id}`}
                                      >
                                        Edit
                                      </a>
                                    </div>
                                    {checkOwner(testseries) && (
                                      <div className="col">
                                        <a
                                          className="btn btn-success btn-sm btn-block"
                                          onClick={() => publish(testseries)}
                                        >
                                          Publish
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {testseries.status !== "draft" && (
                                <a
                                  className="btn btn-buy btn-block btn-sm round-bottom"
                                  href={`/testseries/details/${testseries._id}`}
                                >
                                  View Details
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
            </div>

            <div className="box-area box-area_new d-block d-lg-none mx-0">
              <div className="heading">
                <div className="row">
                  <div className="col-8">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        {totalItems} Assessments
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="box-area-wrap clearfix d-block d-lg-none mx-0 position-relative">
                {series ? (
                  <div className="row">
                    {series.map((testseries) => (
                      <div
                        key={testseries._id}
                        className="col-lg-3 col-md-4 col-6 mb-3"
                      >
                        <div className="box-item-remove w-100">
                          <div className="box box_new bg-white pt-0">
                            <div
                              className="image-wrap cursor-pointer"
                              onClick={() =>
                                (window.location.href = `/testseries/details/${testseries._id}`)
                              }
                            >
                              <PImageComponent
                                height={118}
                                fullWidth
                                imageUrl={testseries.imageUrl}
                                backgroundColor={testseries.colorCode}
                                type="testSeries"
                                text={testseries.title}
                                radius={9}
                                fontSize={15}
                              />
                            </div>

                            <div className="box-inner box-inner_new cardFontAll-imp1">
                              {status !== "published" && (
                                <div className="Box-inner-accessModeTags">
                                  <div className="border-0 box-inner_tag">
                                    <div className="d-flex align-items-center">
                                      <span className="material-icons">
                                        {testseries.accessMode ===
                                          "invitation" ||
                                          testseries.accessMode === "buy"
                                          ? "lock"
                                          : "lock_open"}
                                      </span>
                                      <div className="stud2 subjctViewAll">
                                        <strong>
                                          {testseries.accessMode ===
                                            "invitation" ||
                                            testseries.accessMode === "buy"
                                            ? "PRIVATE"
                                            : "PUBLIC"}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="info p-0 m-0">
                                <h4
                                  title={testseries.title}
                                  className="cursor-pointer"
                                  onClick={() =>
                                    (window.location.href = `/${user.role}/testseries/details/${testseries._id}`)
                                  }
                                >
                                  {testseries.title}
                                </h4>
                                <div className="subject-name">
                                  <p>
                                    {testseries.subjects.length > 1
                                      ? "Multiple Subjects"
                                      : testseries.subjects[0].name}
                                  </p>
                                </div>
                              </div>
                              <div className="form-row cardFontAll-imp justify-content-between">
                                {testseries.status !== "draft" && (
                                  <div className="col-6 text-truncate">
                                    <span className="material-icons course">
                                      people
                                    </span>
                                    <span className="icon-text">
                                      {testseries.students}
                                    </span>
                                    <span className="icon-text">
                                      {testseries.students === 1
                                        ? "student"
                                        : "students"}
                                    </span>
                                  </div>
                                )}

                                <div className="col-6 text-truncate">
                                  <span className="material-icons course">
                                    timelapse
                                  </span>
                                  <span className="icon-text">
                                    {testseries.totalTests}
                                  </span>
                                  <span className="icon-text">Assessments</span>
                                </div>

                                {testseries.status === "draft" && (
                                  <div className="col-6 text-truncate">
                                    <span className="material-icons course">
                                      content_paste
                                    </span>
                                    <span className="icon-text">
                                      {testseries.questions}
                                    </span>
                                    <span className="icon-text">Questions</span>
                                  </div>
                                )}
                              </div>

                              {testseries.accessMode === "buy" &&
                                status === "published" && (
                                  <div className="selling-price-info selling-price-info_new d-flex">
                                    <ItemPrice
                                      content={testseries}
                                      field="marketPlacePrice"
                                    />
                                  </div>
                                )}

                              {status === "published" &&
                                testseries.accessMode !== "buy" && (
                                  <div className="mt-1">
                                    <div className="border-0 box-inner_tag">
                                      <div className="d-flex align-items-center">
                                        <span className="material-icons">
                                          {testseries.accessMode ===
                                            "invitation" ||
                                            testseries.accessMode === "buy"
                                            ? "lock"
                                            : "lock_open"}
                                        </span>
                                        <div className="stud2 subjctViewAll">
                                          <strong>
                                            {testseries.accessMode ===
                                              "invitation" ||
                                              testseries.accessMode === "buy"
                                              ? "PRIVATE"
                                              : "PUBLIC"}
                                          </strong>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {testseries.status === "draft" && (
                                <div className="form-row mt-2">
                                  <div className="col">
                                    <a
                                      className="btn btn-outline btn-sm btn-block"
                                      href={`/${user.role}/testseries/details/${testseries._id}`}
                                    >
                                      Edit
                                    </a>
                                  </div>
                                  {checkOwner(testseries) && (
                                    <div className="col">
                                      <a
                                        className="btn btn-success btn-sm btn-block"
                                        onClick={() => publish(testseries)}
                                      >
                                        Publish
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {testseries.status !== "draft" && (
                              <a
                                className="btn btn-buy btn-block btn-sm round-bottom"
                                href={`/testseries/details/${testseries._id}`}
                              >
                                View Details
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
            </div>

            {series && series.length < totalItems && (
              <div className="text-center">
                <button className="btn btn-light" onClick={loadMore}>
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      {!series && (
        <div className="box-area-wrap clearfix">
          <div className="heading">
            <div className="row">
              <div className="col-3">
                <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
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
    </>
  );
}
