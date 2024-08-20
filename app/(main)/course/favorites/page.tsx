"use client";

import { useState, useEffect } from "react";
import PImageComponent from "@/components/AppImage";
import { elipsisText, toQueryString } from "@/lib/validator";
import { useSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import { useRouter } from "next/navigation";

const CourseFavorites = () => {
  const router = useRouter();
  const user = useSession().data || {};
  const [pageInitialization, setPageInitialization] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 8,
    includeCourses: true,
  });
  const [selectedFilter, setSelectedFilter] = useState<any>({
    subject: "Select a Subject",
    course: "Select a Course",
  });

  useEffect(() => {
    const getIntialData = async () => {
      const [_favorites, _totalItems, _subject, _course] = await Promise.all([
        clientApi.get(`/api/course/favorite/me${toQueryString(params)}`),
        clientApi.get(
          `/api/course/favorite/me${toQueryString({ count: true })}`
        ),
        clientApi.get(`/api/course/favorite/subject`),
        clientApi.get(`/api/course/favorite/course`),
      ]);
      setFavorites(_favorites.data);
      setTotalItems(_totalItems.data);
      setSubjects(_subject.data);
      setCourses(_course.data);
      setPageInitialization(true);
    };
    getIntialData();
  }, []);

  const loadMore = async () => {
    let param = { ...params, page: params.page + 1 };
    setParams(param);
    const { data } = await clientApi.get(
      `/api/course/favorite/me${toQueryString(params)}`
    );
    setFavorites((p: any) => p.concat(data));
  };

  const filter = (type: any, value: any, displayText: any) => {
    let param = params;
    let selected_filter = selectedFilter;
    param["page"] = 1;
    param[type] = value;
    selected_filter[type] = displayText;
    setParams(param);
    setSelectedFilter(selected_filter);
    getResult(param);
  };

  const viewContentDetails = (item: any) => {
    if (item.type == "course") {
      router.push(`course/details/${item.itemId}`);
      return;
    }
    router.push(
      `/course/stage/${item.course._id}${toQueryString({
        content: item.itemId,
      })}`
    );
  };

  const toggleFilter = () => {
    setShowFilter((p: any) => !p);
    if (showFilter) {
      setSelectedFilter({
        subject: "Select a Subject",
        course: "Select a Course",
      });
      let param = {
        page: params.page,
        limit: params.limit,
        includeCourses: true,
      };
      setParams(param);
      getResult(param);
    }
  };

  const getResult = async (param: any) => {
    let _param = { ...param };
    _param["count"] = true;
    try {
      const [_favorites, _count] = await Promise.all([
        clientApi.get(`/api/course/favorite/me${toQueryString(param)}`),
        clientApi.get(`/api/course/favorite/me${toQueryString(_param)}`),
      ]);
      setFavorites(_favorites.data);
      setTotalItems(_count.data);
    } catch (error) {
      setFavorites([]);
      setTotalItems(0);
      console.error(error);
    }
  };

  return (
    <main className="my-gap-common">
      <section className="checkout p-0">
        <div className="checkout-area favorites_wrap mw-100 mx-auto">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="order-area breadcrumbs_area mw-100">
                  <div className="heading mycart breadcrumbs_new">
                    <h2>
                      <a href="/course/home"> Course</a> /{" "}
                      <span>Favorites</span>
                    </h2>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="filter-area filter-area_new d-none d-lg-block">
                  <div className="row">
                    <div className="col-md-5"></div>
                    <div className="col-md-4">
                      {showFilter ? (
                        <div className="filter-item">
                          <div className="title">
                            <h4>Subject</h4>
                          </div>
                          <div className="dropdown">
                            <a
                              className="btn dropdown-toggle text-left"
                              role="button"
                              id="filterSubject"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <span>
                                {elipsisText(selectedFilter.subject, 15, true)}
                              </span>
                            </a>

                            <div
                              className="dropdown-menu border-0 py-0"
                              aria-labelledby="filterSubject"
                            >
                              {subjects.map((item: any, i: number) => (
                                <a
                                  className="dropdown-item"
                                  key={"subject" + i}
                                  onClick={() =>
                                    filter("subject", item._id, item.name)
                                  }
                                >
                                  {elipsisText(item?.name, 20, true)}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="col-auto ml-auto">
                      <div className="filter-item">
                        <div className="filter filter_btn_new ml-auto">
                          <a className="text-center" onClick={toggleFilter}>
                            <span>Filters</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {totalItems > 0 || !pageInitialization ? (
              <div className="row">
                {favorites.map((item: any, i: number) => (
                  <div
                    className=" col-lg-3 col-md-4 col-6 mb-3"
                    key={"course_favorites" + i}
                  >
                    <div
                      className="course-item course-item_new cursor-pointer"
                      onClick={() => viewContentDetails(item)}
                    >
                      <div className="video-item-img">
                        {item != "course" ? (
                          <figure>
                            {item.contentType === "note" && (
                              <img src="/assets/images/3.png" alt="" />
                            )}
                            {item.contentType === "assesment" && (
                              <img src="/assets/images/4.png" alt="" />
                            )}
                            {item.contentType === "video" && (
                              <img src="/assets/images/6.png" alt="" />
                            )}
                            {item.contentType === "ebook" && (
                              <img src="/assets/images/5.png" alt="" />
                            )}
                            {item.contentType === "quiz" && (
                              <img src="/assets/images/2.png" alt="" />
                            )}
                          </figure>
                        ) : (
                          <></>
                        )}
                        {item.type == "course" && (
                          <PImageComponent
                            height={191}
                            fullWidth
                            type="course"
                            imageUrl={item.imageUrl}
                            backgroundColor={item.colorCode}
                            text={item.title}
                            radius={9}
                            fontSize={15}
                          />
                        )}
                        <div className="favorite-icon">
                          <figure>
                            <img src="/assets/images/heart.png" alt="" />
                          </figure>
                        </div>
                      </div>
                      <div
                        className="box-inner box-inner_new"
                        style={{ minHeight: "52px" }}
                      >
                        <h1 className="text-truncate">{item?.title}</h1>
                        {item.type != "course" && (
                          <p className="text-capitalize">
                            {item.course?.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <></>
            )}
            {totalItems > 0 && (
              <div className="text-center">
                {totalItems > favorites.length !== 0 && (
                  <div className="load-more-result load-more-result_new mx-auto my-5">
                    <a
                      className="text-center btn-outline-black border "
                      onClick={loadMore}
                    >
                      Load more results
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="text-center empty-data">
              {totalItems == 0 && pageInitialization && (
                <figure className="mx-auto">
                  <img
                    className="d-block mx-auto img-fluid mb-4"
                    src="/assets/images/Appreciation-rafiki.png"
                    alt=""
                  />
                </figure>
              )}
              {totalItems == 0 && pageInitialization && (
                <div className="order-area-wrap mx-auto">
                  <h3>Your Favorites is empty</h3>
                  <p>
                    Save Learning Content that you like in your favorites.
                    <br className="d-md-block d-none" /> Review them anytime
                    from this page
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CourseFavorites;
