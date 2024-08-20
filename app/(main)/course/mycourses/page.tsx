"use client";

import { useState, useEffect } from "react";
import PImageComponent from "@/components/AppImage";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { limitTo } from "@/lib/pipe";
import { toQueryString } from "@/lib/validator";
import { ProgressBar } from "react-bootstrap";
import { useSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import Link from "next/link";

const MyCourses = () => {
  const { user } = useSession().data || {};
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paging, setPaging] = useState<any>({
    limit: 12,
    showing: 0,
  });

  useEffect(() => {
    const getIntialData = async () => {
      setLoading(true);
      const { data } = await clientApi.get(
        `/api/course/enrolledCourses/${user?.info._id}`
      );
      setCourses(data.courses);
      setPaging((p: any) => ({
        ...p,
        showing: Math.min(paging.limit, data.courses.length),
      }));
      setLoading(false);
    };
    if (user) getIntialData();
  }, [user]);

  const loadMore = () => {
    setPaging((p: any) => ({
      ...p,
      showing: Math.min(paging.showing + paging.limit, courses.length),
    }));
  };
  return (
    <main className="my-gap-common">
      <div id="wrapper">
        <section className="checkout mylibrary_wrap">
          <div className="container">
            <div className="checkout-area mx-auto mw-100">
              <div className="order-area breadcrumbs_area">
                <div className="heading mycart breadcrumbs_new">
                  <h2>
                    <a href="/course/home"> Course</a> / <span>My Courses</span>
                  </h2>
                </div>
              </div>
              {courses.length ? (
                <div className="wrap">
                  <div className="box-area box-area_new mx-0">
                    <div className="row">
                      {limitTo(courses, paging.showing, 0).map(
                        (item: any, index: number) => (
                          <div
                            className=" col-lg-3 col-md-4 col-6 mb-3"
                            key={"course" + index}
                          >
                            <div className="course-item course-item_new ">
                              <Link
                                className="video-item-img cursor-pointer"
                                href={`/course/details/${item._id}`}
                              >
                                <PImageComponent
                                  height={102}
                                  fullWidth
                                  imageUrl={item.imageUrl}
                                  type="course"
                                  backgroundColor={item.colorCode}
                                  text={item.title}
                                  radius={9}
                                  fontSize={15}
                                />
                              </Link>
                              <div className="box-inner box-inner_new">
                                <Link href={`/course/details/${item.id}`}>
                                  <h4 className="m-0 text-truncate cursor-pointer text-black">
                                    {item.title}
                                  </h4>
                                </Link>
                                {item.subjects && item.subjects.length ? (
                                  <p className="text-capitalize mb-1">
                                    {item.subjects[0].name}
                                    {item.subjects.length > 1 ? (
                                      <span className="mb-1">
                                        {" "}
                                        +{item.subjects.length - 1} more{" "}
                                      </span>
                                    ) : (
                                      <></>
                                    )}
                                  </p>
                                ) : (
                                  <></>
                                )}

                                <div className="bottom-info">
                                  <ProgressBar
                                    now={item.progress}
                                    variant="success"
                                  />
                                  <p>{item.progress + "%"}</p>
                                </div>
                              </div>
                              <div className="form-row px-2 pb-2">
                                <div className="col-7">
                                  {item.progress == 100 ? (
                                    <a
                                      className="btn btn-success btn-sm d-block"
                                      href={`/profile/home/certificates${toQueryString(
                                        { tab: "certificates" }
                                      )}`}
                                    >
                                      <span>Get Certificate</span>
                                    </a>
                                  ) : (
                                    <></>
                                  )}
                                </div>

                                <div className="col-5">
                                  <a
                                    className="btn btn-outline btn-sm d-block mobile_sett"
                                    href={`/course/stage/${item._id}`}
                                  >
                                    {item.progress == 100 ? "Review" : "Resume"}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
              {loading ? (
                <div className="wrap">
                  <div className="box-area box-area_new mx-0">
                    <div className="row">
                      <div className=" col-lg-3 col-md-4 col-6 mb-3">
                        <SkeletonLoaderComponent Cwidth="100" Cheight="230" />
                      </div>
                      <div className=" col-lg-3 col-md-4 col-6 mb-3">
                        <SkeletonLoaderComponent Cwidth="100" Cheight="230" />
                      </div>
                      <div className=" col-lg-3 col-md-4 col-6 mb-3">
                        <SkeletonLoaderComponent Cwidth="100" Cheight="230" />
                      </div>
                      <div className=" col-lg-3 col-md-4 col-6 mb-3">
                        <SkeletonLoaderComponent Cwidth="100" Cheight="230" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}

              {paging.showing < courses.length && !loading && (
                <div className="text-center">
                  <a className="btn btn-light" onClick={loadMore}>
                    {" "}
                    Load More
                  </a>
                </div>
              )}
              {courses.length === 0 && !loading && (
                <div className="empty-data text-center">
                  <figure className="mx-auto">
                    <img
                      className="img-fluid d-block mx-auto mb-4"
                      src="/assets/images/AddtoCart-amico1.png"
                      alt=""
                    />
                  </figure>
                  <h3>Hey, There is nothing here</h3>
                  <p>Lets get some courses</p>

                  <a className="btn btn-primary mt-3" href="/course/home">
                    {" "}
                    Explore
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MyCourses;
