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
import * as testSvc from "@/services/practiceService";
import * as settingSvc from "@/services/settingService";
import * as serviceSvc from "@/services/suportService";
import * as userSvc from "@/services/userService";
import * as shoppingCartService from "@/services/shopping-cart-service";
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

const StudentAssessment = ({ classroom, settings }: any) => {
  const { push } = useRouter();
  const user: any = useSession()?.data?.user?.info || {};
  const [showMemberShip, setShowMemberShip] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [expiredDays, setExpiredDays] = useState<string>("");
  const [tests, setTests] = useState<any>(null);
  const [filteredTests, setFilteredTests] = useState<any>(null);
  const [title, setTitle] = useState<any>("");
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    userSvc.get().then((us) => {
      clientApi.get(`/api/settings`).then((res) => {
        if (res.data.features?.services) {
          serviceSvc.checkAvailable().then((res: any) => {
            if (res.isAvailable) {
              serviceSvc
                .getTaggingServicesForStudent(us._id)
                .then((services: any[]) => {
                  setShowMemberShip(!services.length);

                  for (const svc of services) {
                    if (moment(svc.expiresOn).diff(moment(), "d") < 15) {
                      setShowExpired(true);
                      const days = moment(svc.expiresOn).diff(moment(), "d");
                      setExpiredDays(days > 1 ? days + " days" : days + " day");
                      if (days == 0) {
                        const hours = moment(svc.expiresOn).diff(moment(), "h");
                        setExpiredDays(
                          hours > 1 ? hours + " hours" : hours + " hour"
                        );

                        if (hours == 0) {
                          const min = moment(svc.expiresOn).diff(
                            moment(),
                            "minutes"
                          );
                          setExpiredDays(
                            min > 1 ? min + " minutes" : min + " minute"
                          );

                          if (min == 0) {
                            setShowExpired(false);
                          }
                        }
                      }

                      break;
                    }
                  }
                });
            }
          });
        }
      });
      testSvc
        .findByClassRoom({ noPaging: true, classroom: classroom._id })
        .then((res) => {
          setTests(res.tests);
          setFilteredTests([...res.tests]);
          setCount(res.tests.length);
        })
        .catch((err) => {
          setTests([]);
          setFilteredTests([]);
        });
    });
  }, [classroom]);
  const viewTestDetails = (test: any) => {
    push(`/assessment/home/${test.title}?id=${test._id}`);
  };

  const search = (text: string) => {
    setTitle(text);
    if (!text) {
      setFilteredTests([...tests]);
      setCount(test.length);
    } else {
      const tmp = tests.filter(
        (t) => t.title.toLowerCase().indexOf(text.toLowerCase()) > -1
      );
      setFilteredTests(tmp);
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

      {showMemberShip && (
        <div
          className="p-2 mb-3 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#f6cefc" }}
        >
          <p className="h6 mb-0 bold">
            You are on a free plan with limited practice tests. Get unlimited
            practice and access to all features with our premium plan.
          </p>
          <Link href="/membership" className="btn btn-primary">
            Buy Now
          </Link>
        </div>
      )}

      {showExpired && (
        <div
          className="p-2 mb-3 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#ff7f7f" }}
        >
          <p className="h6 mb-0 bold">
            Your existing premium plan expires in {expiredDays} days. Continue
            your preparation with a new premium plan and avoid interruption.
          </p>
          <Link href="/membership" className="btn btn-primary">
            Buy Now
          </Link>
        </div>
      )}

      <div className="rounded-boxes bg-white">
        <div className="row">
          <div className="section_heading_wrapper col-8">
            <h1 className="section_top_heading">
              Classroom Assessments ({count})
            </h1>
          </div>
          <div className="col-4">
            {tests && (
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
                    placeholder="Search for assessments "
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

        {tests ? (
          filteredTests?.length ? (
            <div className="box-area mb-0">
              <div className="box-area-wrap clearfix">
                <div className="row">
                  {filteredTests.map((test, i) => (
                    <div key={i} className="col-lg-4 col-6 mb-3">
                      <div className="slider">
                        <div className="box box_new bg-white pt-0">
                          <div
                            className="cursor-pointer"
                            onClick={() => viewTestDetails(test)}
                          >
                            <PImageComponent
                              height={120}
                              fullWidth
                              imageUrl={test.imageUrl}
                              backgroundColor={test.colorCode}
                              text={test.title}
                              radius={9}
                              fontSize={15}
                              type="assessment"
                              isProctored={test.isProctored}
                              testMode={test.testMode}
                              testType={test.testType}
                            />
                          </div>
                          <div className="box-inner box-inner_new">
                            <div className="info p-0 m-0">
                              <h4
                                data-toggle="tooltip"
                                data-placement="top"
                                title={test.title}
                                className="mt-0 mb-0 cursor-pointer"
                                onClick={() => viewTestDetails(test)}
                              >
                                {test.title}
                              </h4>
                              <div className="form-row">
                                {test.subjects && test.subjects.length > 0 && (
                                  <div className="col sub1_new text-truncate">
                                    <a>
                                      {test.subjects[0].name}
                                      {test.subjects.length > 1 &&
                                        ` + ${test.subjects.length - 1} more`}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="form-row mt-1">
                              <div className="detailed col-6 small">
                                <div className="d-flex align-items-center">
                                  <span className="material-icons">
                                    content_paste
                                  </span>
                                  <span className="stud2 ml-1 text-truncate">
                                    {test.totalQuestion > 0 ? (
                                      <strong>
                                        {test.questionsToDisplay ||
                                          test.totalQuestion}{" "}
                                      </strong>
                                    ) : (
                                      <strong>No </strong>
                                    )}
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
                          </div>
                          <div className="view-detail view-detail_new asspubLishDarcHV">
                            <a
                              className="text-center"
                              onClick={() => viewTestDetails(test)}
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
              <p className="text-center">No Assessment Available</p>
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

export default StudentAssessment;
