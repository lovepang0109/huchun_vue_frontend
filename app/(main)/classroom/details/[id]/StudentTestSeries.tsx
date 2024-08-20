"use client";

import { useState, useEffect } from "react";
import "react-alice-carousel/lib/alice-carousel.css";
import LoadingOverlay from "react-loading-overlay-ts";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PImageComponent from "@/components/AppImage";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { toQueryString } from "@/lib/validator";
import TestSkeleton from "@/components/skeleton/TestSkeleton";
import TestCardContainerWithCarousel from "@/components/assessment/test-card/ContainerWithCarousel";
import TestCardContainer from "@/components/assessment/test-card/Container";
import svg from "@/components/svg";
import CustomCarousel from "@/components/assessment/carousel";
import clientApi from "@/lib/clientApi";
import * as testseriesSvc from "@/services/testseriesService";
import { alert, success } from "alertifyjs";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.min.css";
import "alertifyjs/build/css/themes/default.min.css";
//import "./MyCarousel.css";
//import "./MyCarousel.module.css";
import { limitTo } from "@/lib/pipe";
import moment from "moment";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";

const StudentTestSeries = ({ classroom, settings }: any) => {
  const { push } = useRouter();
  const user: any = useSession()?.data?.user?.info || {};
  const [testseries, setTestseries] = useState<any>(null);
  const [filteredItems, setFilteredItems] = useState<any>(null);
  const [title, setTitle] = useState<any>("");
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    testseriesSvc
      .getByClassroom(classroom._id)
      .then((ts) => {
        setTestseries(ts);
        setFilteredItems([...ts]);
        setCount(ts.length);
      })
      .catch((err) => {
        setTestseries([]);
        setFilteredItems([]);
      });
  }, []);

  const viewTestseries = (id: any) => {
    push(`/testSeries/details/${id}`);
  };
  const search = (text: string) => {
    setTitle(text);
    if (!text) {
      setFilteredItems([...testseries]);
      setCount(testseries.length);
    } else {
      const tmp = testseries.filter(
        (t) => t.title.toLowerCase().indexOf(text.toLowerCase()) > -1
      );
      setFilteredItems(tmp);
      setCount(tmp.length);
    }
  };

  return (
    <>
      <div className="rounded-boxes class-board assignment bg-white">
        <div className="square_profile_info clearfix classroom-topImage1 d-flex align-items-center">
          {classroom.imageUrl ? (
            <figure className="squared-rounded_wrap_80">
              <img
                src={classroom.imageUrl}
                alt=""
                className="user_squared-rounded"
              />
            </figure>
          ) : (
            <figure className="squared-rounded_wrap_80">
              <img
                src="/assets/images/classroomjpgimg.jpg"
                alt=""
                className="user_squared-rounded"
              />
            </figure>
          )}

          <div className="class-board-info ml-0 pl-3">
            <h3 className="top-title text-truncate">{classroom.name}</h3>
            {classroom.user && (
              <p className="bottom-title text-truncate mb-2">
                <span>{classroom.user.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-boxes bg-white">
        <div className="row">
          <div className="section_heading_wrapper col-8">
            <h1 className="section_top_heading">
              Classroom Test Series ({count})
            </h1>
          </div>
          <div className="col-4">
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
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "3px",
                      }}
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
        </div>

        {testseries ? (
          filteredItems?.length ? (
            <div className="box-area mb-0 mt-3">
              <div className="box-area-wrap clearfix">
                <div className="row">
                  {filteredItems.map((item, i) => (
                    <div key={i} className="col-lg-4 col-6 mb-3">
                      <div className="slider">
                        <div className="box box_new bg-white pt-0">
                          <div
                            className="image-wrap cursor-pointer"
                            onClick={() => viewTestseries(item._id)}
                          >
                            <PImageComponent
                              height={118}
                              fullWidth
                              type="testSeries"
                              imageUrl={item.imageUrl}
                              backgroundColor={item.colorCode}
                              text={item.title}
                              radius={9}
                              fontSize={15}
                            />
                          </div>

                          <div className="box-inner box-inner_new has-shdow cardFontAll-imp1">
                            <div className="info pubCourseS1 p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={item.title}
                                className="cursor-pointer"
                                onClick={() => viewTestseries(item._id)}
                              >
                                {item.title}
                              </h4>
                              <div className="subject-name">
                                <p>
                                  {item.subjects
                                    .map((subject) => subject.name)
                                    .join(", ")}
                                </p>
                              </div>
                              <div className="form-row small cardFontAll-imp">
                                <div className="col-6">
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
                          </div>
                          <div className="view-detail view-detail_new has-shadow drfArchivedCatgry">
                            <a
                              className="text-center"
                              onClick={() => viewTestseries(item._id)}
                            >
                              VIEW DETAILS
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <figure className="mx-auto">
                <img
                  src="/assets/images/Search-rafiki.png"
                  alt=""
                  className="img-fluid d-block mx-auto"
                />
              </figure>
              <p className="text-center">No Test Series Available</p>
            </div>
          )
        ) : (
          <div className="mt-3">
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="my-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentTestSeries;