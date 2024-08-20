"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getPublicSummary } from "@/services/testseriesService";
import { getByTestseries } from "@/services/practiceService";
import { testSeriesSummaryBySubject } from "@/services/questionService";
import { addItem } from "@/services/shopping-cart-service";
import { base64UrlEncode, embedVideo } from "@/lib/helpers";
import { slugify } from "@/lib/validator";
import { success } from "alertifyjs";
import { avatar, elipsis } from "@/lib/pipe";
import {
  LinkedinShareButton,
  FacebookShareButton,
  TwitterShareButton,
} from "react-share";
import {
  faFacebookSquare,
  faLinkedin,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import ItemPrice from "@/components/ItemPrice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Mathjax from "@/components/assessment/mathjax";
import PQuestionChart from "@/components/assessment/p-question-chart";

const TestSeriesViewComponent = ({ user, settings }: any) => {
  const { id } = useParams();
  const router = useRouter();
  const [testSeries, setTestSeries] = useState<any>([]);
  const [practices, setPractices] = useState<any>();
  const [summarySubject, setSummarySubject] = useState<any>();
  const [loader, setLoader] = useState<boolean>(false);

  useEffect(() => {
    initialFunction();
  }, []);

  const initialFunction = () => {
    setLoader(true);
    getPublicSummary(id).then((res: any) => {
      if (res.videoUrl) {
        res.videoUrl = embedVideo(res.videoUrl);
      }
      res.slug = slugify(res.title);
      setTestSeries(res);

      setLoader(false);
      getByTestseries({ id }).then((data: any) => {
        setPractices(data.practiceSetByExam);
        const p = {
          practice: data.practiceSetByExam.map((w: any) => w._id),
        };
        testSeriesSummaryBySubject(p).then((r: any[]) => {
          setSummarySubject(r.slice(0, 5));
        });
      });
    });
  };

  const addToCart = (testSeries: any) => {
    addItem(testSeries, 1, "testseries");
  };
  const buyNow = (testSeries: any) => {
    setTestSeries({
      ...testSeries,
      price: testSeries.marketPlacePrice,
    });

    addItem(testSeries, 1, "testseries");
    router.push("/teacher/cart");
  };

  const getUtmLink = (src: any, med: any) => {
    const utmData = `source=${src}&medium=${med}&campaign=${user.userId}`;
    return `${settings.baseUrl}public/testSeries/${testSeries._id}/${
      testSeries.slug
    }?utm=${base64UrlEncode(utmData)}&loc=${user.activeLocation}`;
  };

  const notifyCopied = () => {
    success("Public link is copied to clipboard!");
  };

  return (
    <>
      <section className="details_top_area_common">
        <div className="container">
          <div className="row">
            <div className="col-lg-auto left_area">
              <h2 className="main_title" title={testSeries?.title}>
                {elipsis(testSeries?.title, 60, true)}
              </h2>
              <p className="bottom_title">{testSeries?.summary}</p>
              <div className="details_below_summary">
                <div className="row mt-2">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <h2 className="main_sub_title">Publisher</h2>
                    <div className="form-row align-items-center">
                      <div className="col-auto">
                        <div className="d-flex align-items-center">
                          <div className="user_img_circled_wrap mr-2">
                            <img
                              src={avatar(testSeries?.user)}
                              className="user_img_circled"
                              alt=""
                            />
                          </div>
                          <p className="profile_user_name">
                            {testSeries?.user?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row">
                      <div className="col-6">
                        <h2 className="main_sub_title">Subject(s)</h2>
                        <div className="d-flex align-items-center height_match_user_profile">
                          <p>{testSeries?.subjects[0]?.name}</p>
                          {testSeries?.subjects[1] && (
                            <span>
                              &nbsp;+{testSeries.subjects.length - 1} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="col-6">
                          {user.primaryInstitute?.preferences.general
                            .socialSharing &&
                            testSeries &&
                            testSeries.status === "published" &&
                            testSeries.accessMode !== "invitation" && (
                              <>
                                <h4 className="main_sub_title">Share</h4>
                                <div className="d-flex align-items-center height_match_user_profile">
                                  <div className="socials_icons_wrap cursor-pointer">
                                    <LinkedinShareButton
                                      url={getUtmLink("linkedin", "post")}
                                      className="mx-1"
                                    >
                                      <FontAwesomeIcon
                                        icon={faLinkedin}
                                        size="2x"
                                      />
                                    </LinkedinShareButton>
                                    <FacebookShareButton
                                      url={getUtmLink("facebook", "post")}
                                      className="mx-1"
                                    >
                                      <FontAwesomeIcon
                                        icon={faFacebookSquare}
                                        size="2x"
                                      />
                                    </FacebookShareButton>
                                    <TwitterShareButton
                                      url={getUtmLink("twitter", "post")}
                                      className="mx-1"
                                    >
                                      <FontAwesomeIcon
                                        icon={faTwitterSquare}
                                        size="2x"
                                      />
                                    </TwitterShareButton>
                                    <a
                                      className="mx-1"
                                      aria-label="Copy link"
                                      onClick={notifyCopied}
                                    >
                                      <FontAwesomeIcon
                                        icon={faCopy}
                                        size="2x"
                                      />
                                    </a>
                                  </div>
                                </div>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="my-gap-common details_page_new__bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-auto order-lg-1 order-2 left_area">
              <div className="id_sections" id="course-content">
                <h2 className="border_below_heading">
                  What is Test Series all about ?
                </h2>
                <div>
                  <ul className="right_tick_list two-column-list-md clearfix">
                    <li>
                      <Mathjax value={testSeries?.description} />
                    </li>
                  </ul>
                </div>
              </div>
              <div className="id_sections" id="syllabus">
                <h2 className="border_below_heading">Test Series Content</h2>
                <div className="product_type_row type-1">
                  {practices?.map((test: any, index: number) => (
                    <div key={index} className="product_type_row type-1">
                      <div className="d-flex">
                        <div className="col-auto px-0">
                          <figure className="product_img">
                            <img
                              src={test.imageUrl}
                              alt={test.title}
                              height={100}
                              width={100}
                              style={{ backgroundColor: test.colorCode }}
                            />
                          </figure>
                        </div>
                        <div className="col text-truncate">
                          <div className="product_inner">
                            <div className="row">
                              <div className="col-lg-10 col-sm">
                                <h2 className="product_title text-truncate">
                                  {test.title}
                                </h2>
                                <div className="form-row">
                                  <div className="col-auto text-truncate">
                                    <p className="subject_name">
                                      {test.subjects[0].name}
                                    </p>
                                  </div>
                                  <div className="col-auto">
                                    {test.subjects.length > 1 && (
                                      <span>
                                        +{test.subjects.length - 1} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="form-row my-2">
                                  <div className="col-auto questions_number">
                                    <i className="fas fa-sort-numeric-up mr-1"></i>
                                    {test.totalQuestion} questions
                                  </div>
                                  <div className="col-auto minutes_number">
                                    <i className="fas fa-clock mr-1"></i>
                                    {test.totalTime} minutes
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-auto order-lg-2 order-1 right_area">
              <div className="sidebar_new_d sidebar_up">
                {testSeries &&
                  ((!testSeries.enrolled && testSeries.accessMode === "buy") ||
                    testSeries.videoUrl ||
                    testSeries.includes) && (
                    <div className="widget">
                      {testSeries.videoUrl && (
                        <div className="embed-responsive embed-responsive-16by9 mb-2">
                          <iframe
                            className="embed-responsive-item"
                            src={testSeries.videoUrl}
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                      {!testSeries.enrolled &&
                        testSeries.accessMode === "buy" && (
                          <div className="d-flex align-items-center">
                            <ItemPrice
                              {...testSeries}
                              newPriceclassName="text-left text-dark"
                              digitsInfo="1.0-2"
                            />
                          </div>
                        )}
                      {testSeries.includes && (
                        <div>
                          <h4 className="widget_title">Test Series includes</h4>
                          <ul className="list-style-disc pl-3 mt-2">
                            <li>
                              <Mathjax
                                className="max-with-image-break-w"
                                value={testSeries.includes}
                              />
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                <div className="widget text-center">
                  <div className="form-row">
                    <div className="col-6">
                      <div className="stage-3-data">
                        <h2 className="stage_3_t_head">Questions</h2>
                        <div className="icon_wrapper">
                          <i className="far fa-play-circle"></i>
                        </div>
                        <h6 className="stage_3_b_info">
                          {testSeries?.totalQuestions}
                        </h6>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stage-3-data">
                        <h5 className="stage_3_t_head">Assessments</h5>
                        <div className="icon_wrapper">
                          <i className="far fa-file-alt"></i>
                        </div>
                        <h6 className="stage_3_b_info">
                          {testSeries?.totalTests}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="widget text-center">
                  <div className="form-row">
                    <div className="col-4">
                      <div className="stage-3-data">
                        <h5 className="stage_3_t_head">Target Audience</h5>
                        <div className="icon_wrapper">
                          <i className="fas fa-users"></i>
                        </div>
                        <h6 className="stage_3_b_info">ALL</h6>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stage-3-data">
                        <h5 className="stage_3_t_head">Duration</h5>
                        <div className="icon_wrapper">
                          {testSeries?.totalHours}
                        </div>
                        <h6 className="stage_3_b_info">hours</h6>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stage-3-data">
                        <h5 className="stage_3_t_head">Starts date</h5>
                        <div className="icon_wrapper">
                          {new Date(testSeries?.startDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </div>
                        <h6 className="stage_3_b_info">
                          {new Date(testSeries?.startDate).getFullYear()}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="widget">
                  <h2 className="border_below_heading">Subject Distribution</h2>
                  <PQuestionChart
                    practice={practices}
                    summarySubject={summarySubject}
                    pieChartTitle={"Question Distribution"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestSeriesViewComponent;
