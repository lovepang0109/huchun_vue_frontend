"use client";

import { useEffect, useState } from "react";
import * as _ from "lodash";
import { alert, success } from "alertifyjs";
import Link from "next/link";
import Svg from "@/components/svg";
import { useSession } from "next-auth/react";
import { toQueryString } from "@/lib/validator";
import { useRouter } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import CustomCarousel from "@/components/assessment/carousel";
import PImageComponent from "@/components/AppImage";
import clientApi from "@/lib/clientApi";

export default function TeacherLiveBoard() {
  const [searchText, setsearchText] = useState("");
  const [initialized, setinitialized] = useState(false);
  const [isSearching, setisSearching] = useState(false);
  const [ongoingClassrooms, setongoingClassrooms] = useState([]);
  const [upcomingClassrooms, setupcomingClassrooms] = useState([]);
  const [completedClassrooms, setcompletedClassrooms] = useState([]);
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const router = useRouter();

  const reset = () => {
    setsearchText("");
    setisSearching(false);
  };

  const search = (ev: any) => {
    if (searchText === "") {
      setisSearching(false);
    } else {
      setisSearching(true);
    }
  };

  const getLiveBoardClassrooms = async (stat: string) => {
    const { data } = await clientApi.get(
      `/api/users/liveBoard/classrooms/${stat}`
    );
    return data;
  };

  useEffect(() => {
    const startFunc = async () => {
      const data1 = await getLiveBoardClassrooms("ongoing");
      const data2 = await getLiveBoardClassrooms("upcoming");
      const data3 = await getLiveBoardClassrooms("completed");
      setongoingClassrooms(data1);
      setupcomingClassrooms(data2);
      setcompletedClassrooms(data3);
      setinitialized(true);
    };
    startFunc();
  }, []);

  return (
    <>
      <section className="banner d-block banner_new bg-color1 course">
        <div className="container">
          <div className="banner-area-ag banner-content mx-auto">
            <div className="banner-info mx-auto">
              <h1 className="banner_title">Proctor your assessments</h1>
              <form>
                {initialized ? (
                  <div className="form-group mb-0">
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search for Classroom"
                      defaultValue={searchText}
                      onChange={search}
                    />
                    <span>
                      <figure>
                        <img src="/assets/images/search-icon-2.png" alt="" />
                      </figure>
                    </span>
                    {isSearching && (
                      <button type="button" className="btn p-0" onClick={reset}>
                        <figure>
                          <img src="/assets/images/close3.png" alt="" />
                        </figure>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="form-group mb-0">
                    <SkeletonLoaderComponent Cwidth={100} Cheight={40} />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <main className="pt-3" hidden={isSearching}>
        <div className="main-area mx-auto mw-100">
          <div className="container">
            {initialized && ongoingClassrooms.length > 0 ? (
              <div className="box-area box-area_new mb-2">
                <div className="card-common products_slider">
                  <div className="card-header-common">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            Ongoing Classes{" "}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body-common">
                    <CustomCarousel
                      items={ongoingClassrooms.map((item: any, i: number) => (
                        <div
                          key={item._id}
                          style={{ width: 250 }}
                          className="box-area-wrap clearfix mx-0"
                        >
                          <div className="box-item" style={{ width: 250 }}>
                            <div className="box box_new bg-white pt-0">
                              <div className="image-wrap">
                                <img
                                  width="100%"
                                  style={{
                                    height: 141,
                                    background: item.colorCode,
                                    fontSize: 15,
                                  }}
                                  src={
                                    item.imageUrl
                                      ? item.imageUrl
                                      : "/assets/images/classroomjpgimg.jpg"
                                  }
                                  alt={item.title}
                                />
                                {/*<PImageComponent
                                  height={141}
                                  fullWidth
                                  imageUrl={item.imageUrl}
                                  backgroundColor={item.colorCode}
                                  type="classroom"
                                  text={item.title}
                                  radius={9}
                                  fontSize={15}
                                />*/}
                              </div>

                              <div
                                className="box-inner box-inner_new no-bottom-info cursor-pointer"
                                onClick={() =>
                                  router.replace(
                                    `/liveboard/details/${item._id}`,
                                    item._id
                                  )
                                }
                              >
                                <div className="info p-0 m-0">
                                  <h4 title={item.name}>{item.name}</h4>
                                </div>
                                <div className="d-flex align-items-center">
                                  <span className="material-icons mr-1">
                                    people_alt
                                  </span>
                                  <span className="stud">
                                    {item.students} students
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
            {!initialized && (
              <div className="box-area ">
                <div className="heading">
                  <div className="row">
                    <div className="col-8">
                      <h3>
                        <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                      </h3>
                    </div>

                    <div className="col-4">
                      <div className="create-btn ml-auto">
                        <a className="text-center text-white px-2">
                          <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-8">
                      <h3>
                        <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                      </h3>
                    </div>

                    <div className="col-4">
                      <div className="view-all ml-auto">
                        <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                      </div>

                      <div className="arrow ml-auto">
                        <a>
                          <figure>
                            <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                          </figure>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="box-area-wrap clearfix mx-0">
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
              </div>
            )}
            {initialized && upcomingClassrooms.length > 0 ? (
              <div className="box-area box-area_new mb-2">
                <div className="card-common products_slider">
                  <div className="card-header-common">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="section_heading_wrapper">
                          <h2 className="section_top_heading">Upcoming</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body-common">
                    <CustomCarousel
                      items={upcomingClassrooms.map((item: any, i: number) => (
                        <div id={item._id} key={i} style={{ width: 250 }}>
                          <div className="box-item" style={{ width: 250 }}>
                            <div className="box box_new bg-white pt-0">
                              <div className="image-wrap">
                                <PImageComponent
                                  height={141}
                                  fullWidth
                                  imageUrl={item.imageUrl}
                                  backgroundColor={item.colorCode}
                                  type="classroom"
                                  text={item.title}
                                  radius={9}
                                  fontSize={15}
                                />
                              </div>
                              <div
                                className="box-inner box-inner_new no-bottom-info upcomingLiveCards-5 cursor-pointer"
                                onClick={() =>
                                  router.replace(
                                    `/liveboard/details/${item._id}`,
                                    item._id
                                  )
                                }
                              >
                                <div className="info p-0 m-0">
                                  <h4 title={item.name}>{item.name}</h4>
                                </div>
                                <div className="d-flex align-items-center">
                                  <span className="material-icons mr-1">
                                    people_alt
                                  </span>
                                  <span className="stud">
                                    {item.students} students
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
            {!initialized && (
              <div className="box-area">
                <div className="heading">
                  <div className="row">
                    <div className="col-8">
                      <h3>
                        <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                      </h3>
                    </div>

                    <div className="col-4">
                      <div className="view-all ml-auto">
                        <a>
                          <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                        </a>
                      </div>

                      <div className="arrow ml-auto">
                        <a>
                          <figure>
                            <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                          </figure>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="box-area-wrap clearfix mx-0">
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
              </div>
            )}
            {initialized && completedClassrooms.length > 0 ? (
              <div className="box-area box-area_new mb-2">
                <div className="card-common products_slider">
                  <div className="card-header-common">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="section_heading_wrapper">
                          <h2 className="section_top_heading">Completed</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body-common">
                    <CustomCarousel
                      items={completedClassrooms.map((item: any, i: number) => (
                        <div id={item._id} key={i}>
                          <div className="box-item" style={{ width: 250 }}>
                            <div className="box box_new bg-white pt-0">
                              <div className="image-wrap">
                                <PImageComponent
                                  height={141}
                                  fullWidth
                                  imageUrl={item.imageUrl}
                                  backgroundColor={item.colorCode}
                                  type="classroom"
                                  text={item.title}
                                  radius={9}
                                  fontSize={15}
                                />
                              </div>
                              <div
                                className="box-inner box-inner_new no-bottom-info upcomingLiveCards-5 cursor-pointer"
                                onClick={() =>
                                  router.replace(
                                    `/liveboard/details/${item._id}`,
                                    item._id
                                  )
                                }
                              >
                                <div className="info p-0 m-0">
                                  <h4 title={item.name}>{item.name}</h4>
                                </div>
                                <div className="d-flex align-items-center">
                                  <span className="material-icons mr-1">
                                    people_alt
                                  </span>
                                  <span className="stud">
                                    {item.students} students
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
            {!initialized && (
              <div className="box-area">
                <div className="heading">
                  <div className="row">
                    <div className="col-8">
                      <h3>
                        <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                      </h3>
                    </div>

                    <div className="col-4">
                      <div className="view-all ml-auto">
                        <a>
                          <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                        </a>
                      </div>

                      <div className="arrow ml-auto">
                        <a>
                          <figure>
                            <SkeletonLoaderComponent Cwidth={30} Cheight={30} />
                          </figure>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="box-area-wrap clearfix mx-0 ">
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
              </div>
            )}
          </div>
        </div>
        {(!ongoingClassrooms && !completedClassrooms && !upcomingClassrooms) ||
        (ongoingClassrooms &&
          ongoingClassrooms.length == 0 &&
          completedClassrooms &&
          completedClassrooms.length == 0 &&
          upcomingClassrooms &&
          upcomingClassrooms.length == 0) ? (
          <div className="empty-data text-center" hidden={isSearching}>
            <Svg.NoLiveBoard />
            <h2>No Proctor Exam Today </h2>
          </div>
        ) : (
          <></>
        )}
      </main>
    </>
  );
}
