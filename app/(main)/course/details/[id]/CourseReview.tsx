import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { forkJoin } from "rxjs";
import {
  getAvgRatingByCourse,
  getRatingByCourse,
  getRatingCountByCourse,
} from "@/services/courseService";
import RatingComponent from "@/components/rating";
import { avatar, fromNow } from "@/lib/pipe";

interface ParamsInterfeceEntry {
  limit: number;
  page: number;
  keywords?: any;
  rating?: any;
}

const CourseReviewComponent = ({ user, course, setCourse }: any) => {
  const { id } = useParams();
  const [searchText, setSearchText] = useState<string>("");
  const [initialized, setInitialized] = useState<boolean>(false);
  const [selectedFilterText, setSelectedFilterText] =
    useState<string>("All Ratings");
  const [params, setParams] = useState<ParamsInterfeceEntry>({
    page: 1,
    limit: 5,
  });
  const [avgRating, setAvgRating] = useState<any>({});
  const [ratings, setRatings] = useState<any>({});
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const avgRating = getAvgRatingByCourse(id, { ...params });
      const ratings = getRatingByCourse(id, { ...params });
      const ratingsCount = getRatingCountByCourse(id, { ...params });
      const [aR, r, rc]: any = await forkJoin([
        avgRating,
        ratings,
        ratingsCount,
      ]).toPromise();
      setInitialized(true);
      setAvgRating(aR);
      setRatings(r);
      if (aR) {
        const updatedRatings = aR.ratings.map((d: any) => ({
          ...d,
          percent: (d.count / aR?.count) * 100,
        }));
        updatedRatings.sort((a: any, b: any) => (a.rating > b.rating ? -1 : 1));
        setAvgRating({ ...aR, ratings: updatedRatings });
      }
      setTotalItems(rc);
    } catch (err) {
      setInitialized(true);
      console.error(err);
    }
  };

  const search = (ev: any) => {
    const paramsData = params;
    paramsData.page = 1;
    paramsData.keywords = ev;
    setParams(paramsData);
    getResult(paramsData);
  };

  const filter = (type: any, value: any, displayText: string) => {
    const paramsData = params;
    paramsData.page = 1;
    paramsData.rating = value;
    setParams(paramsData);
    setSelectedFilterText(displayText);

    getResult(paramsData);
  };

  const getResult = async (data: any) => {
    const ratings = await getRatingByCourse(id, { ...data });
    const ratingsCount = await getRatingCountByCourse(id, { ...data });

    setRatings(ratings);
    setTotalItems(ratingsCount);
  };

  const loadMoreReview = async () => {
    const paramsData = params;
    paramsData.page++;
    setParams(paramsData);
    getRatingByCourse(id, { ...paramsData })
      .then((res) => {
        const result: any = res;
        setRatings(ratings.concat(result));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="rounded-boxes bg-white assess-feeds">
        <div className="class-board-info">
          <div className="section_heading_wrapper">
            <h3 className="section_top_heading">
              Student Rating and Feedbacks
            </h3>

            {avgRating ? (
              <div className="d-flex gap-sm">
                <div className="text-center">
                  <div className="headings">
                    {avgRating.avgRating?.toFixed(2)}
                  </div>

                  <div>
                    <RatingComponent value={avgRating.avgRating} />
                  </div>

                  <div className="mt-1">
                    {totalItems} Student{totalItems > 1 && <span>s</span>}
                  </div>
                </div>

                <div className="flex-grow-1">
                  {avgRating.ratings &&
                    avgRating.ratings.map((item: any, index: number) => (
                      <div key={index} className="middlepane-course">
                        <div style={{ width: "70%" }} className="bar-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${item.percent}%`,
                              height: "8.5px",
                              backgroundColor: "green",
                            }}
                          ></div>
                        </div>
                        <div style={{ width: "30%", paddingLeft: "10px" }}>
                          <RatingComponent value={item.rating} />
                          <span className="percent PeRc-eNt">
                            {item.percent && `(${item.percent.toFixed(0)}%)`}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="d-flex gap-sm">
                <div className="text-center">
                  <div className="headings"> NA</div>

                  <div>
                    <RatingComponent />
                  </div>
                </div>

                <div className="flex-grow-1">
                  <div className="middlepane-course">
                    <div className="bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `0%`,
                          height: "8.5px",
                          backgroundColor: "green",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <RatingComponent />
                    <span className="per cent PeRc-eNt">0%</span>
                  </div>

                  <div className="middlepane-course">
                    <div className="bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `0%`,
                          height: "8.5px",
                          backgroundColor: "green",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <RatingComponent />
                    <span className="per cent PeRc-eNt">0%</span>
                  </div>
                  <div className="middlepane-course">
                    <div className="bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `0%`,
                          height: "8.5px",
                          backgroundColor: "green",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <RatingComponent />

                    <span className="per cent PeRc-eNt">0%</span>
                  </div>

                  <div className="middlepane-course">
                    <div className="bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `0%`,
                          height: "8.5px",
                          backgroundColor: "green",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <RatingComponent />
                    <span className="per cent PeRc-eNt">0%</span>
                  </div>
                  <div className="middlepane-course">
                    <div className="bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `0%`,
                          height: "8.5px",
                          backgroundColor: "green",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <RatingComponent />
                    <span className="per cent PeRc-eNt">0%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="checkout archive py-0">
        <div className="checkout-area mx-auto">
          <div className="wrap ">
            <div className="box-area  mb-0">
              <div className="tab-pane show active fade" id="ques">
                <div className="bg-white rounded-boxes text-black controlling-feedback">
                  <div className="row">
                    <div className="col-8">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">Reviews</h3>
                      </div>
                    </div>
                  </div>

                  <div className="filter-area1">
                    <div className="filter-item">
                      <div className="rev d-none d-lg-block">
                        <div className="row my-4">
                          <div className="col">
                            <span className="search m-0 p-0">
                              <div className="d-flex">
                                <input
                                  className="rev-search-reviews w-100"
                                  type="text"
                                  placeholder=" Search Reviews"
                                  name="search"
                                  defaultValue={searchText}
                                  onChange={(e: any) => {
                                    setSearchText(e.target.value);
                                    search(e.target.value);
                                  }}
                                />
                                <button onClick={() => search(searchText)}>
                                  <i className="fa fa-search"></i>
                                </button>
                              </div>
                            </span>
                          </div>
                          <div className="col-auto">
                            <span className="dropdown">
                              <a
                                className="btn dropdown-toggle text-left"
                                role="button"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <span>
                                  {selectedFilterText}{" "}
                                  <i
                                    className="fa fa-sort-down"
                                    style={{ fontSize: "20px", float: "right" }}
                                  ></i>
                                </span>
                              </a>

                              <div className="dropdown-menu border-0 py-0">
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("rating", "", "All Ratings")
                                  }
                                >
                                  All Ratings
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("rating", "5", "5 star")
                                  }
                                >
                                  5 star
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("rating", "4", "4 star")
                                  }
                                >
                                  4 star
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("rating", "3", "3 star")
                                  }
                                >
                                  3 star
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("rating", "2", "2 star")
                                  }
                                >
                                  2 star
                                </a>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    filter("rating", "1", "1 star")
                                  }
                                >
                                  1 star
                                </a>
                              </div>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {ratings.length === 0 && initialized && (
                    <div className="container">
                      <div className="course-search-empty empty-data text-center">
                        <figure className="mx-auto ">
                          <img
                            className="d-inline"
                            src="/assets/images/no-reviews.png"
                            alt=""
                          />
                        </figure>

                        <h3 className="text-center">No Reviews Found</h3>
                        <p className="text-center">
                          We could not find any student reviews for this course
                        </p>
                      </div>
                    </div>
                  )}

                  {ratings.length > 0 && initialized && (
                    <div className="revs ck-0">
                      <div className="user-comment">
                        {ratings.map((item: any, index: number) => (
                          <>
                            <div className="user-comment-box mb-4 clearfix d-flex">
                              <figure className="user_img_circled_wrap">
                                <div className="profile-user">
                                  <img src={avatar(item.user, "sm")} alt="" />
                                </div>
                              </figure>

                              <div className="col user-comment-info mb-0">
                                <h4>
                                  <strong>{item.user?.name}</strong>
                                </h4>
                                <div className="f-t-0">
                                  <span>
                                    <RatingComponent value={item.rating} />
                                  </span>
                                  {fromNow(item.createdAt)}
                                </div>
                                <p>{item.comment}</p>
                              </div>
                            </div>
                            <hr />
                          </>
                        ))}
                      </div>
                      {totalItems > ratings.length && (
                        <div className="comment-form text-center">
                          <form>
                            <button
                              className="btn btn-outline learnmore-remove"
                              onClick={() => loadMoreReview()}
                            >
                              See More Reviews
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseReviewComponent;
