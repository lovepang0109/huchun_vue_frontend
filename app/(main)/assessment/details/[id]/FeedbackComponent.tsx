import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { ProgressBar } from "react-bootstrap";


import * as practicesetService from "@/services/practice-service";
import * as feedbackService from "@/services/feedbackService";
import * as serviceSvc from "@/services/suportService";
import RatingComponent from "@/components/rating";
import { fromNow } from "@/lib/pipe";


const FeedbackComponent = ({
  practice,
  setPractice,
  practicesetId,
  updatePractice,
  user,
  clientData,
  selectedSideMenu,
}: any) => {
  const router = useRouter();
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    sortAttr: 'createdAt',
    isAscSort: false,
    rating: 0
  });

  const [avgParams, setAvgParams] = useState<any>({
    page: 1,
    limit: 5
  })

  const [avgRating, setAvgRating] = useState<any>({})
  const [ratings, setRatings] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilterText, setSelectedFilterText] = useState<string>('All Ratings');
  const [feedbacks, setFeedbacks] = useState<any>([]);
  const [stackedHelpful, setStackedHelpful] = useState<any>([]);
  const [stackedAllCheck, setStackedAllCheck] = useState<any>([]);
  const [types, setTypes] = useState<any>(['success', 'danger']);
  const [reviews, setReviews] = useState<any>([]);
  const [tags, setTags] = useState<any>([]);

  useEffect(() => {
    practicesetService.getFeedbackRatingByAssessment(practicesetId, avgParams).then((f: any) => {
      const feedback = f?.map((d: any) => {
        const data = { ...d, percent: (d?.reviewCount / d?.count) * 100 };
        return data;
      });
      setFeedbacks(feedback);
      console.log(feedback, "feedback")

      feedback?.map((e: any, i: any) => {
        if (e.name === 'helpfulCheck') {
          const updatedStackedHelpful = [
            { value: Math.round(e.percent), type: 'success', label: Math.round(e.percent) + '%' },
            { value: Math.round(100 - e.percent), type: 'danger', label: Math.round(100 - e.percent) + '%' }
          ];
          setStackedHelpful([...stackedHelpful, ...updatedStackedHelpful])
        }
        if (e.name === 'viewAllCheck') {
          const updatedStackedAllCheck = [
            { value: Math.round(e.percent), type: 'success', label: Math.round(e.percent) + '%' },
            { value: Math.round(100 - e.percent), type: 'danger', label: Math.round(100 - e.percent) + '%' }
          ];
          console.log(updatedStackedAllCheck, "ffff")

          setStackedAllCheck([...stackedAllCheck, ...updatedStackedAllCheck]);
        }
      })
    });
    practicesetService.getAvgRatingByAssessment(practicesetId, avgParams).then((data: any) => {
      setAvgRating(data)
      if (data) {
        const updatedRatings = data.ratings.map((d: any) => ({
          ...d,
          percent: (d?.count / data?.count) * 100
        }));
        if (data.ratings.length !== 5) {
          const loop = 5 - data.ratings.length;
          for (let i = 0; i < loop; i++) {
            updatedRatings.push({ percent: 0, rating: 0 });
          }
        }
        updatedRatings.sort((a: any, b: any) => (a.rating > b.rating ? -1 : 1));
        setAvgRating({ ...data, ratings: updatedRatings });
      }
    });

    feedbackService.findAllByPractice(practicesetId, params).then((da: any) => {
      console.log(da, "Ddddaaa")
      setReviews(da?.data);
      setTotalItems(da?.count)
      setServices(reviews)
    });
    feedbackService.getTopFeedbacks(practicesetId).then((data: any) => {
      setTags(data)
    })

  }, [])

  const setServices = (reviewList: any) => {
    if (reviewList?.length) {
      serviceSvc.getTaggingServicesForStudents(reviewList.map((r: any) => r.user._id)).then((serviceMap: any) => {
        reviewList?.map((r: any) => {
          if (serviceMap[r.user._id]) {
            r.services = serviceMap[r.user._id].services
          }
        })
      })
    }
  }

  const search = (ev: any) => {
    setSearchText(ev)
    setParams({
      ...params,
      page: 1,
      keywords: ev
    })
    const param = {
      ...params,
      page: 1,
      keywords: ev

    }
    feedbackService.findAllByPractice(practicesetId, param).then((da: any) => {
      setTotalItems(da?.count);
      setReviews(da?.data)

      setServices(reviews)
    });
  }

  const filter = (type: any, value: any, displayText: any) => {
    console.log(value,"value")
    setParams({
      ...params,
      page: 1,
      rating: value
    })
    const param = {
      ...params,
      page: 1,
      rating: value
    }
    setSelectedFilterText(displayText);

    feedbackService.findAllByPractice(practicesetId, param).then((da: any) => {

      setTotalItems(da.count)
      setReviews(da.data)

      setServices(reviews)
    });
  }

  const loadMoreReview = () => {
    setParams({
      ...params,
      page: params.page + 1
    })
    feedbackService.findAllByPractice(practicesetId, params).then((da: any) => {
      setTotalItems(da.count)
      setReviews(reviews.concat(da.data))
      setServices(reviews)
    });
  }

  const filterTags = (tags: any) => {

    setParams({
      limit: 10,
      page: 1,
      sortAttr: 'createdAt',
      isAscSort: false,
      rating: 0,
      tags: tags
    })
    feedbackService.findAllByPractice(practicesetId, params).then((da: any) => {

      setTotalItems(da.count)
      setReviews(da.data)

      setServices(reviews)
    });

  }

  const timeAgo = (timestamp: any) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 0) {
      return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 0) {
      return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 0) {
      return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 0) {
      return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 0) {
      return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    }
    return Math.floor(seconds) + " second" + (seconds > 1 ? "s" : "") + " ago";
  }
  console.log(stackedHelpful, "stact")

  return (
    <>
      <div>
        <div className="d-lg-block">
          <div className="rounded-boxes class-boards-remove bg-white assess-feeds">
            <div className="clearfix">
              <div className="class-board-info top-feedbck-bars mb-3">
                <div className="row">
                  <div className="col-lg-12 ck-0 ml-0">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">Feedbacks</h3>

                    </div>
                    <div>
                      <div className="form-row">
                        <div className="col-md-auto text-center leftpane-remove feedBa-CkAs-ses assess-feedbck ml-0">
                          <div className="headings feedback">
                            {avgRating?.avgRating ? avgRating.avgRating.toFixed(2) : ''}
                          </div>
                          {avgRating && (
                            <div>
                              <RatingComponent
                                value={avgRating.avgRating}
                              />
                            </div>
                          )}
                          {!avgRating && <div className="headings feedback">NA</div>}
                          <div className="text3">Assessment Rating</div>
                        </div>
                        {!avgRating ? (

                          <div className="col">
                            <div className="form-row align-items-center">
                              <div className="col">
                                <div className="bar-container">
                                  <div className="progressbar_wrap mt-2">

                                    <ProgressBar
                                      now={
                                        0
                                      }
                                      style={{ height: "8.5px" }}
                                      variant="success"
                                    />
                                  </div>
                                  <ProgressBar
                                    now={
                                      0
                                    }
                                    style={{ height: "8.5px" }}
                                    variant="success"
                                  />
                                </div>
                              </div>
                              <div className="col-auto ml-auto rating-assess all rating-common-1">
                                <RatingComponent />
                                <span className="per cent PeRc-eNt">0%</span>
                              </div>
                            </div>
                            <div className="form-row align-items-center">
                              <div className="col">
                                <div className="bar-container">
                                  <ProgressBar
                                    now={
                                      0
                                    }
                                    style={{ height: "8.5px" }}
                                    variant="success"
                                  />
                                </div>
                              </div>
                              <div className="col-auto ml-auto rating-assess all rating-common-1">
                                <RatingComponent />
                                <span className="per cent PeRc-eNt">0%</span>
                              </div>
                            </div>
                            <div className="form-row align-items-center">
                              <div className="col">
                                <div className="bar-container">
                                  <ProgressBar
                                    now={
                                      0
                                    }
                                    style={{ height: "8.5px" }}
                                    variant="success"
                                  />
                                </div>
                              </div>
                              <div className="col-auto ml-auto rating-assess all rating-common-1">
                                <RatingComponent />

                                <span className="per cent PeRc-eNt">0%</span>
                              </div>
                            </div>
                            <div className="form-row align-items-center">
                              <div className="col">
                                <div className="bar-container">
                                  <ProgressBar
                                    now={
                                      0
                                    }
                                    style={{ height: "8.5px" }}
                                    variant="success"
                                  />
                                </div>
                              </div>
                              <div className="col-auto ml-auto rating-assess all rating-common-1">
                                <RatingComponent />

                                <span className="per cent PeRc-eNt">0%</span>
                              </div>
                            </div>
                            <div className="form-row align-items-center">
                              <div className="col">
                                <div className="bar-container">
                                  <ProgressBar
                                    now={
                                      0
                                    }
                                    style={{ height: "8.5px" }}
                                    variant="success"
                                  />
                                </div>
                              </div>
                              <div className="col-auto ml-auto rating-assess all rating-common-1">
                                <RatingComponent />
                                <span className="per cent PeRc-eNt">0%</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="col" >
                            <div className="form-row align-items-center" style={{ display: 'flex', flexDirection: 'column' }}>

                              {avgRating?.ratings?.map((item: any, index: number) => (
                                <div key={index} className="col" style={{ display: 'flex' }}>
                                  <div className="bar-container" >
                                    <ProgressBar
                                      now={
                                        item.percent
                                      }
                                      style={{ height: "8.5px" }}
                                      variant="success"
                                    />

                                  </div>
                                  <div className="col-auto ml-auto rating-assess all rating-common-1" style={{ display: 'flex', flexDirection: 'row', width: '155px' }}>
                                    <RatingComponent
                                      value={item.rating}
                                    />
                                    <span className="per cent PeRc-eNt">{item.percent.toFixed(0)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              </div>
              <div>
                {feedbacks?.map((item: any, index: number) => (
                  <div key={index} className="middlepane w-100">
                    {(item.name === 'helpfulCheck' || item.name === 'viewAllCheck') && (
                      <div className="bar-container BaR_ContaIneR-2 small w-100">
                        <div className="form-row assess-feed-all top my-1">
                          <div className="col">
                            <span className="top all f-14 ml-0" style={{ display: item.name === 'helpfulCheck' ? 'block' : 'none' }}>
                              Was this assessment helpful?
                            </span>
                          </div>
                          
                          <div className="col"  style={{ display: item.name === 'helpfulCheck' ? 'block' : 'none' }}>

                            <ProgressBar>
                              {stackedHelpful[0].value != 0 && (
                                <ProgressBar
                                  key={0}
                                  now={
                                    stackedHelpful[0].value
                                  }
                                  label={
                                    stackedHelpful[0].label

                                  }
                                  style={{ height: "8.5px" }}
                                  variant={stackedHelpful[0].type}
                                />
                              )}
                              {stackedHelpful[1].value != 0 && (

                                <ProgressBar
                                  key={1}
                                  now={
                                    stackedHelpful[1].value
                                  }
                                  label={
                                    stackedHelpful[1].label

                                  }
                                  style={{ height: "8.5px" }}
                                  variant={stackedHelpful[1].type}
                                />
                              )}
                            </ProgressBar>
                          </div>

                          <div className="col-auto rating-common-1 d-none d-lg-block"></div>
                        </div>
                        <div className="form-row assess-feed-all">
                          <div className="col">
                            <span className="all f-14 ml-0" style={{ display: item.name === 'viewAllCheck' ? 'block' : 'none' }}>
                              Were you able to view and answer all questions?
                            </span>
                          </div>
                          <div className="col" style={{ display: item.name === 'viewAllCheck' ? 'block' : 'none' }}>

                            {item.name === 'viewAllCheck' &&
                              <ProgressBar>
                                {/* {stackedAllCheck.map((item, index) => { */}
                                {stackedAllCheck[0].value !== 0 && (
                                  <ProgressBar
                                    key={0}
                                    now={
                                      stackedAllCheck[0].value
                                    }
                                    label={
                                      stackedAllCheck[0].label

                                    }
                                    style={{ height: "8.5px" }}
                                    variant={stackedAllCheck[0].type}
                                  />
                                )}
                                {stackedAllCheck[1].value !== 0 && (
                                  <ProgressBar
                                    key={1}
                                    now={
                                      stackedAllCheck[1].value
                                    }
                                    label={
                                      stackedAllCheck[1].label

                                    }
                                    style={{ height: "8.5px" }}
                                    variant={stackedAllCheck[1].type}
                                  />
                                )}


                                {/* })} */}
                              </ProgressBar>

                            }
                          </div>

                          <div className="col-auto rating-common-1 d-none d-lg-block"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {tags && tags?.length > 0 && (
              <div className="row mt-3">
                <div className="col ProGrammE ml-2">
                  <div className="row">
                    <div className="assess-tags ml-0">
                      <span className="question-tag tag-color-3 bg-tag3 cursor-pointer" onClick={() => filterTags('')}>All Tags</span>
                      {tags?.map((tag: any, index: number) => (
                        <span
                          key={index}
                          className={`question-tag tag-color-3 cursor-pointer ${index === 0 ? 'bg-tag0' : index === 1 ? 'bg-tag1' : index === 2 ? 'bg-tag2' : index === 3 ? 'bg-tag3' : 'bg-tag4'
                            }`}
                          onClick={() => filterTags(tag._id.tags)}
                        >
                          {tag._id.tags}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
        <div className="checkout archive pb-0">
          <div className="checkout-area mx-auto">
            <div className="wrap">
              <div className="box-area mb-0">
                <div className="tab-pane show active fade" id="ques">
                  <div className="post-box-remove bg-white rounded-boxes text-black controlling-feedback">
                    <div className="row">
                      <div className="col-8">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">Reviews</h3>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="filter-area1 clearfix">
                        <div className="filter-item">
                          <div className="rev">
                            <div className="row">
                              <div className="col">
                                <span className="search m-0 p-0">
                                  <form action="#" className="d-flex">
                                    <input
                                      className="rev-search-reviews w-100"
                                      type="text"
                                      placeholder=" Search Reviews"
                                      name="search"
                                      value={searchText}
                                      onChange={(e) => search(e.target.value)}
                                    />
                                    <button type="button" onClick={() => search(searchText)}>
                                      <i className="fa fa-search" aria-label="search" role="button"></i>
                                    </button>
                                  </form>
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
                                      {selectedFilterText} <i className="fa fa-sort-down" style={{ fontSize: '20px', float: 'right' }}></i>
                                    </span>
                                  </a>

                                  <div className="dropdown-menu border-0 py-0">
                                    <a className="dropdown-item" onClick={() => filter('rating', '', 'All Ratings')}>
                                      All Ratings
                                    </a>
                                    <a className="dropdown-item" onClick={() => filter('rating', '5', '5 star')}>
                                      5 star
                                    </a>
                                    <a className="dropdown-item" onClick={() => filter('rating', '4', '4 star')}>
                                      4 star
                                    </a>
                                    <a className="dropdown-item" onClick={() => filter('rating', '3', '3 star')}>
                                      3 star
                                    </a>
                                    <a className="dropdown-item" onClick={() => filter('rating', '2', '2 star')}>
                                      2 star
                                    </a>
                                    <a className="dropdown-item" onClick={() => filter('rating', '1', '1 star')}>
                                      1 star
                                    </a>
                                  </div>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {reviews && reviews.length == 0 && (
                      <div className="container">
                        <div className="course-search-empty empty-data text-center">
                          <svg id="b8669117-6177-4f3a-a75c-05852d999d53" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"
                            width="400.95277" height="400" viewBox="0 0 801.95277 537">
                            <path
                              d="M857.27306,503.00345a10.52659,10.52659,0,0,1,1.6208-.34681l21.89865-44.4965-6.68563-10.02281,13.80744-12.06683,17.35728,21.24-35.35067,51.44811a10.49579,10.49579,0,1,1-12.64787-5.75514Z"
                              transform="translate(-199.02361 -181.5)" fill="#a0616a" />
                            <path
                              d="M894.65563,442.21808a4.51373,4.51373,0,0,1-1.01617.801l-22.4057,12.98872a4.49929,4.49929,0,0,1-6.32407-1.96783l-10.89742-23.02258a4.47646,4.47646,0,0,1,1.53737-5.64507l13.88914-9.44831a4.502,4.502,0,0,1,5.718.54388L894.57,435.94935a4.504,4.504,0,0,1,.08559,6.26873Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <polygon points="727.092 515.689 715.262 518.908 697.217 474.811 714.677 470.06 727.092 515.689"
                              fill="#a0616a" />
                            <path
                              d="M906.71654,697.9165h23.64387a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H891.82969a0,0,0,0,1,0,0v0A14.88686,14.88686,0,0,1,906.71654,697.9165Z"
                              transform="translate(-352.24737 82.43915) rotate(-15.22067)" fill="#2f2e41" />
                            <polygon points="625.961 524.716 613.702 524.715 607.869 477.427 625.963 477.428 625.961 524.716"
                              fill="#a0616a" />
                            <path
                              d="M604.94435,521.2124h23.64387a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H590.05749a0,0,0,0,1,0,0v0A14.88686,14.88686,0,0,1,604.94435,521.2124Z"
                              fill="#2f2e41" />
                            <circle cx="638.87797" cy="194.16535" r="24.56103" fill="#a0616a" />
                            <path
                              d="M824.23418,672.5H807.48052a4.51307,4.51307,0,0,1-4.4956-4.22266c-4.99219-79.36132-2.072-136.28906,9.18969-179.15332a4.67831,4.67831,0,0,1,.18238-.55175l.89721-2.24317a4.47879,4.47879,0,0,1,4.17847-2.8291h34.4519a4.4927,4.4927,0,0,1,3.41675,1.57129l4.67945,5.46c.0913.10645.17675.21484.259.3291,21.10107,29.42578,40.01123,86.9541,61.91235,164.27832a4.48492,4.48492,0,0,1-2.95849,5.5166L901.18877,666.417a4.52419,4.52419,0,0,1-5.425-2.332l-46.72266-96.90723a3.50019,3.50019,0,0,0-6.62036,1.0459l-13.728,100.38575A4.51721,4.51721,0,0,1,824.23418,672.5Z"
                              transform="translate(-199.02361 -181.5)" fill="#2f2e41" />
                            <path
                              d="M858.09209,490.93066c-.04711,0-.094-.001-.14135-.00195l-41.84839-1.32129a4.4854,4.4854,0,0,1-4.32862-3.9541c-5.30493-42.94141,9.24415-54.44531,15.74561-57.39746a3.45965,3.45965,0,0,0,2.01221-2.74316l.5625-4.501a4.48359,4.48359,0,0,1,.88916-2.18555c10.1936-13.20508,24.11279-17.43359,31.50268-18.77832a4.49307,4.49307,0,0,1,5.25122,3.84961l.84278,6.46289a3.56038,3.56038,0,0,0,.71338,1.69141c21.259,27.792-2.42456,68.82715-7.38819,76.77051h0A4.50839,4.50839,0,0,1,858.09209,490.93066Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path
                              d="M887.45489,378.43036A97.75259,97.75259,0,0,0,867.94952,358.01c-6.19825-4.84149-13.09766-8.97778-20.70948-10.95636-7.6123-1.97858-16.01855-1.64179-22.96338,2.04919-6.94531,3.691-14.12548,11.02454-14.16943,18.88941-.01367,2.52661.62891,5.94494,3.11719,5.50781l.71973.09546q9.00366-1.81851,18.00683-3.637,3.835,13.30782,7.66943,26.61572c.53907,1.86981,1.26172,3.96081,3.03663,4.75818,1.67187.751,3.60449.04345,5.29589-.66266.27832-.11627,2.66844-5.48164,2.66844-5.48164a1.00005,1.00005,0,0,1,1.72268-.28844l1.41987,1.77465a2,2,0,0,0,2.3321.59617q14.68261-6.12932,29.3657-12.25858c1.35254-.56476,2.86475-1.30218,3.25684-2.71478C889.09454,380.94391,888.26739,379.57556,887.45489,378.43036Z"
                              transform="translate(-199.02361 -181.5)" fill="#2f2e41" />
                            <path d="M999.97639,718.5h-301a1,1,0,0,1,0-2h301a1,1,0,0,1,0,2Z"
                              transform="translate(-199.02361 -181.5)" fill="#3f3d56" />
                            <path
                              d="M836.79313,562.66406a3.20348,3.20348,0,0,1-1.88891-.62549l-4.552-3.30712a2.20585,2.20585,0,0,0-2.60181,0l-4.552,3.30712a3.21341,3.21341,0,0,1-4.94507-3.59228l1.73877-5.35108a2.20712,2.20712,0,0,0-.8042-2.4746l-4.552-3.30762a3.21342,3.21342,0,0,1,1.88891-5.813h5.62647a2.20812,2.20812,0,0,0,2.10522-1.5293l1.73853-5.35107a3.2133,3.2133,0,0,1,6.1123,0l1.73877,5.35107a2.20783,2.20783,0,0,0,2.105,1.5293h5.62647a3.21342,3.21342,0,0,1,1.88891,5.813l-4.552,3.30713a2.20831,2.20831,0,0,0-.804,2.47509l1.73877,5.35108a3.16508,3.16508,0,0,1-1.16748,3.59228A3.20336,3.20336,0,0,1,836.79313,562.66406Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M854.18878,551.96606a10.74269,10.74269,0,0,0,1.40649-16.41247l7.77327-93.87138-23.14412,3.1839-.4403,91.20458a10.80091,10.80091,0,0,0,14.40466,15.89537Z"
                              transform="translate(-199.02361 -181.5)" fill="#a0616a" />
                            <path
                              d="M864.88091,455.19922a4.51364,4.51364,0,0,1-1.28051-.18555l-24.846-7.30762a4.49928,4.49928,0,0,1-2.92676-5.9414l9.19482-23.75391a4.47646,4.47646,0,0,1,5.15259-2.77148l16.4148,3.56836a4.502,4.502,0,0,1,3.54223,4.52148l-.76367,27.49219a4.504,4.504,0,0,1-4.48755,4.37793Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path
                              d="M631.02373,572.5H206.02361a7.00787,7.00787,0,0,1-7-7v-127a7.00787,7.00787,0,0,1,7-7H631.02373a7.00786,7.00786,0,0,1,7,7v127A7.00786,7.00786,0,0,1,631.02373,572.5Zm-425.00012-139a5.0058,5.0058,0,0,0-5,5v127a5.0058,5.0058,0,0,0,5,5H631.02373a5.00572,5.00572,0,0,0,5-5v-127a5.00572,5.00572,0,0,0-5-5Z"
                              transform="translate(-199.02361 -181.5)" fill="#3f3d56" />
                            <path
                              d="M391.99874,625.97522a3.9245,3.9245,0,0,1-2.314-.76625l-5.57643-4.0514a2.70227,2.70227,0,0,0-3.18734,0l-5.57643,4.0514a3.9366,3.9366,0,0,1-6.058-4.40073l2.13008-6.55533a2.7053,2.7053,0,0,0-.98488-3.03212l-5.57643-4.0514a3.93647,3.93647,0,0,1,2.31372-7.1212h6.893a2.70468,2.70468,0,0,0,2.57871-1.87346l2.12978-6.55533a3.93667,3.93667,0,0,1,7.48818,0l2.12977,6.55533a2.70469,2.70469,0,0,0,2.57871,1.87346h6.893a3.93652,3.93652,0,0,1,2.31371,7.1212l-5.57642,4.0514a2.70531,2.70531,0,0,0-.98489,3.03212l2.13008,6.55533a3.87738,3.87738,0,0,1-1.43022,4.40073A3.92432,3.92432,0,0,1,391.99874,625.97522Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M448.50715,625.97522a3.92453,3.92453,0,0,1-2.314-.76625l-5.57643-4.0514a2.70227,2.70227,0,0,0-3.18734,0l-5.57643,4.0514a3.93659,3.93659,0,0,1-6.058-4.40073l2.13008-6.55533a2.70532,2.70532,0,0,0-.98489-3.03212l-5.57643-4.0514a3.9366,3.9366,0,0,1,2.314-7.1212h6.8927a2.70467,2.70467,0,0,0,2.5787-1.87346l2.13008-6.55533a3.93646,3.93646,0,0,1,7.48788,0l2.12978,6.55533a2.705,2.705,0,0,0,2.579,1.87346h6.8927a3.9366,3.9366,0,0,1,2.314,7.1212l-5.57643,4.0514a2.705,2.705,0,0,0-.98518,3.03212l2.13007,6.55533a3.87738,3.87738,0,0,1-1.43022,4.40073A3.92429,3.92429,0,0,1,448.50715,625.97522Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M505.01555,625.97522a3.92434,3.92434,0,0,1-2.31372-.76625l-5.57642-4.0514a2.70843,2.70843,0,0,0-3.18765,0l-5.57642,4.0514a3.93639,3.93639,0,0,1-6.05766-4.40073l2.12978-6.55533a2.7053,2.7053,0,0,0-.98488-3.03212l-5.57643-4.0514a3.9366,3.9366,0,0,1,2.314-7.1212h6.8927a2.70468,2.70468,0,0,0,2.57871-1.87346l2.13008-6.55533a3.93645,3.93645,0,0,1,7.48787,0l2.13008,6.55533a2.70469,2.70469,0,0,0,2.57871,1.87346h6.8927a3.9366,3.9366,0,0,1,2.314,7.1212l-5.57643,4.0514a2.7053,2.7053,0,0,0-.98488,3.03212l2.12978,6.55533a3.87769,3.87769,0,0,1-1.42992,4.40073A3.9252,3.9252,0,0,1,505.01555,625.97522Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M561.52425,625.97522a3.92452,3.92452,0,0,1-2.314-.76625l-5.57643-4.0514a2.70227,2.70227,0,0,0-3.18734,0L544.87,625.209a3.93659,3.93659,0,0,1-6.058-4.40073l2.13007-6.55533a2.70383,2.70383,0,0,0-.98518-3.03152l-5.57643-4.052a3.9366,3.9366,0,0,1,2.314-7.1212h6.8927a2.705,2.705,0,0,0,2.579-1.87346l2.12978-6.55533a3.93646,3.93646,0,0,1,7.48788,0l2.13008,6.55533a2.70467,2.70467,0,0,0,2.5787,1.87346h6.8927a3.9366,3.9366,0,0,1,2.314,7.1212l-5.57643,4.0514a2.70532,2.70532,0,0,0-.98489,3.03212l2.13008,6.55533A3.87738,3.87738,0,0,1,563.838,625.209,3.92432,3.92432,0,0,1,561.52425,625.97522Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M599.06451,626.36377a4.31316,4.31316,0,0,1-2.54126-.84082,4.26058,4.26058,0,0,1-1.57129-4.835l2.13037-6.55518a2.31852,2.31852,0,0,0-.84424-2.59814l-5.57666-4.05176a4.324,4.324,0,0,1,2.54175-7.82227H600.096a2.31763,2.31763,0,0,0,2.21-1.60595l2.13037-6.55518a4.32409,4.32409,0,0,1,8.22486,0l2.12988,6.55518a2.31815,2.31815,0,0,0,2.2102,1.60595h6.89283a4.32414,4.32414,0,0,1,2.54174,7.82227l-5.57641,4.05176a2.31752,2.31752,0,0,0-.84448,2.59814l2.13012,6.55518a4.32423,4.32423,0,0,1-6.65429,4.83447l-5.57618-4.05127a2.318,2.318,0,0,0-2.73217,0l-5.57642,4.05127A4.31,4.31,0,0,1,599.06451,626.36377Zm9.48413-7.33887a4.31539,4.31539,0,0,1,2.54126.82813l5.57641,4.05127a2.32385,2.32385,0,0,0,3.57642-2.59815l-2.12988-6.55517a4.31291,4.31291,0,0,1,1.571-4.83448l5.57617-4.05175a2.324,2.324,0,0,0-1.366-4.20411h-6.89283a4.31293,4.31293,0,0,1-4.1123-2.98779l-2.13013-6.55517a2.324,2.324,0,0,0-4.42065,0l-2.13013,6.55517a4.3124,4.3124,0,0,1-4.11206,2.98779h-6.89282a2.324,2.324,0,0,0-1.36621,4.20411l5.57666,4.05175a4.31367,4.31367,0,0,1,1.5708,4.83448l-2.13037,6.55517a2.324,2.324,0,0,0,3.57641,2.59815l5.57666-4.05127A4.31666,4.31666,0,0,1,608.54864,619.0249Z"
                              transform="translate(-199.02361 -181.5)" fill="#3f3d56" />
                            <path d="M254.02363,461.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,1,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,495.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,1,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,529.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,1,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,461.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,1,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,495.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,1,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,529.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,1,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path
                              d="M631.02373,322.5H206.02361a7.00787,7.00787,0,0,1-7-7v-127a7.00787,7.00787,0,0,1,7-7H631.02373a7.00786,7.00786,0,0,1,7,7v127A7.00786,7.00786,0,0,1,631.02373,322.5Zm-425.00012-139a5.0058,5.0058,0,0,0-5,5v127a5.0058,5.0058,0,0,0,5,5H631.02373a5.00572,5.00572,0,0,0,5-5v-127a5.00572,5.00572,0,0,0-5-5Z"
                              transform="translate(-199.02361 -181.5)" fill="#3f3d56" />
                            <path
                              d="M391.99874,375.97522a3.9245,3.9245,0,0,1-2.314-.76625l-5.57643-4.0514a2.70227,2.70227,0,0,0-3.18734,0l-5.57643,4.0514a3.9366,3.9366,0,0,1-6.058-4.40073l2.13008-6.55533a2.7053,2.7053,0,0,0-.98488-3.03212l-5.57643-4.0514a3.93647,3.93647,0,0,1,2.31372-7.1212h6.893a2.70468,2.70468,0,0,0,2.57871-1.87346l2.12978-6.55533a3.93667,3.93667,0,0,1,7.48818,0l2.12977,6.55533a2.70469,2.70469,0,0,0,2.57871,1.87346h6.893a3.93652,3.93652,0,0,1,2.31371,7.1212l-5.57642,4.0514a2.70531,2.70531,0,0,0-.98489,3.03212l2.13008,6.55533a3.87738,3.87738,0,0,1-1.43022,4.40073A3.92432,3.92432,0,0,1,391.99874,375.97522Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M448.50715,375.97522a3.92453,3.92453,0,0,1-2.314-.76625l-5.57643-4.0514a2.70227,2.70227,0,0,0-3.18734,0l-5.57643,4.0514a3.93659,3.93659,0,0,1-6.058-4.40073l2.13008-6.55533a2.70532,2.70532,0,0,0-.98489-3.03212l-5.57643-4.0514a3.9366,3.9366,0,0,1,2.314-7.1212h6.8927a2.70467,2.70467,0,0,0,2.5787-1.87346l2.13008-6.55533a3.93646,3.93646,0,0,1,7.48788,0l2.12978,6.55533a2.705,2.705,0,0,0,2.579,1.87346h6.8927a3.9366,3.9366,0,0,1,2.314,7.1212l-5.57643,4.0514a2.705,2.705,0,0,0-.98518,3.03212l2.13007,6.55533a3.87738,3.87738,0,0,1-1.43022,4.40073A3.92429,3.92429,0,0,1,448.50715,375.97522Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M505.01555,375.97522a3.92434,3.92434,0,0,1-2.31372-.76625l-5.57642-4.0514a2.70843,2.70843,0,0,0-3.18765,0l-5.57642,4.0514a3.93639,3.93639,0,0,1-6.05766-4.40073l2.12978-6.55533a2.7053,2.7053,0,0,0-.98488-3.03212l-5.57643-4.0514a3.9366,3.9366,0,0,1,2.314-7.1212h6.8927a2.70468,2.70468,0,0,0,2.57871-1.87346l2.13008-6.55533a3.93645,3.93645,0,0,1,7.48787,0l2.13008,6.55533a2.70469,2.70469,0,0,0,2.57871,1.87346h6.8927a3.9366,3.9366,0,0,1,2.314,7.1212l-5.57643,4.0514a2.7053,2.7053,0,0,0-.98488,3.03212l2.12978,6.55533a3.87769,3.87769,0,0,1-1.42992,4.40073A3.9252,3.9252,0,0,1,505.01555,375.97522Z"
                              transform="translate(-199.02361 -181.5)" fill="#6c63ff" />
                            <path
                              d="M599.06451,376.36377a4.31316,4.31316,0,0,1-2.54126-.84082,4.26058,4.26058,0,0,1-1.57129-4.835l2.13037-6.55518a2.31852,2.31852,0,0,0-.84424-2.59814l-5.57666-4.05176a4.324,4.324,0,0,1,2.54175-7.82227H600.096a2.31763,2.31763,0,0,0,2.21-1.606l2.13037-6.55518a4.32409,4.32409,0,0,1,8.22486,0l2.12988,6.55518a2.31815,2.31815,0,0,0,2.2102,1.606h6.89283a4.32414,4.32414,0,0,1,2.54174,7.82227l-5.57641,4.05176a2.31752,2.31752,0,0,0-.84448,2.59814l2.13012,6.55518a4.32423,4.32423,0,0,1-6.65429,4.83447l-5.57618-4.05127a2.318,2.318,0,0,0-2.73217,0l-5.57642,4.05127A4.31,4.31,0,0,1,599.06451,376.36377Zm9.48413-7.33887a4.31539,4.31539,0,0,1,2.54126.82813l5.57641,4.05127a2.32385,2.32385,0,0,0,3.57642-2.59815l-2.12988-6.55517a4.31291,4.31291,0,0,1,1.571-4.83448l5.57617-4.05175a2.324,2.324,0,0,0-1.366-4.20411h-6.89283a4.31293,4.31293,0,0,1-4.1123-2.98779l-2.13013-6.55517a2.324,2.324,0,0,0-4.42065,0l-2.13013,6.55517a4.3124,4.3124,0,0,1-4.11206,2.98779h-6.89282a2.324,2.324,0,0,0-1.36621,4.20411l5.57666,4.05175a4.31367,4.31367,0,0,1,1.5708,4.83448l-2.13037,6.55517a2.324,2.324,0,0,0,3.57641,2.59815l5.57666-4.05127A4.31666,4.31666,0,0,1,608.54864,369.0249Z"
                              transform="translate(-199.02361 -181.5)" fill="#3f3d56" />
                            <path
                              d="M542.06451,376.20313a4.31317,4.31317,0,0,1-2.54126-.84083,4.26058,4.26058,0,0,1-1.57129-4.835l2.13037-6.55517a2.31854,2.31854,0,0,0-.84424-2.59815l-5.57666-4.05175A4.324,4.324,0,0,1,536.20318,349.5H543.096a2.31764,2.31764,0,0,0,2.21-1.606l2.13037-6.55517a4.32409,4.32409,0,0,1,8.22486,0l2.12988,6.55517a2.31816,2.31816,0,0,0,2.2102,1.606h6.89283a4.32414,4.32414,0,0,1,2.54174,7.82227l-5.57641,4.05175a2.31754,2.31754,0,0,0-.84448,2.59815l2.13012,6.55517a4.32423,4.32423,0,0,1-6.65429,4.83448l-5.57618-4.05127a2.318,2.318,0,0,0-2.73217,0l-5.57642,4.05127A4.31009,4.31009,0,0,1,542.06451,376.20313Zm9.48413-7.33887a4.31545,4.31545,0,0,1,2.54126.82812l5.57641,4.05127a2.32385,2.32385,0,0,0,3.57642-2.59814l-2.12988-6.55518a4.31289,4.31289,0,0,1,1.571-4.83447l5.57617-4.05176a2.324,2.324,0,0,0-1.366-4.2041h-6.89283a4.31293,4.31293,0,0,1-4.1123-2.98779l-2.13013-6.55518a2.324,2.324,0,0,0-4.42065,0l-2.13013,6.55518A4.3124,4.3124,0,0,1,543.096,351.5h-6.89282a2.324,2.324,0,0,0-1.36621,4.2041l5.57666,4.05176a4.31365,4.31365,0,0,1,1.5708,4.83447l-2.13037,6.55518a2.324,2.324,0,0,0,3.57641,2.59814l5.57666-4.05127A4.31672,4.31672,0,0,1,551.54864,368.86426Z"
                              transform="translate(-199.02361 -181.5)" fill="#3f3d56" />
                            <path d="M254.02363,211.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,0,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,245.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,0,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,279.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,0,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,211.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,0,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,245.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,0,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                            <path d="M254.02363,279.5a6.5,6.5,0,0,0,0,13h329a6.5,6.5,0,0,0,0-13Z"
                              transform="translate(-199.02361 -181.5)" fill="#ccc" />
                          </svg>
                          <h3 className="text-center">No Reviews Found</h3>
                          <p className="text-center">We couldn&apos;t find any student reviews for this course</p>
                        </div>
                      </div>
                    )}
                    {reviews && reviews.length > 0 && (
                      <div className="user-comment">
                        {reviews.map((item, index) => (
                          <div key={index} className="user-comment-box mt-3 clearfix d-flex">
                            <figure className="user_img_circled_wrap">
                              <div className="profile-user">
                                {/* {item.user.avatar ? (
                                  <img src={item.user.avatar} alt="image" className="user_img_circled" />
                                ) : ( */}
                                <img src='/assets/images/defaultProfile.png' alt="image" className="user_img_circled" />
                                {/* )} */}
                              </div>
                            </figure>

                            <div className="col user-comment-info mb-0">
                              <div className="d-flex align-items-center">
                                <h4 className="f-14 cust-FeEdnaMeY">{item.user.name}</h4>
                                {item.services && (
                                  <div className="d-flex align-items-center">
                                    {item.services.map((service, i) => (
                                      <span
                                        key={i}
                                        className={`${service.type}_${service.duration}_${service.durationUnit} ml-1`}
                                        container="body"
                                        tooltip={`Membership: ${service.title} (${service.duration} ${service.durationUnit} ${service.duration > 1 ? 's' : ''})`}
                                      ></span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="f-t-0">
                                <span>
                                  <RatingComponent
                                    value={item.rating}
                                  />
                                </span> {fromNow(item.createdAt)} {/* Implement your fromNow logic here */}
                              </div>
                              <div className="mb-2">
                                <div className="gEtfeEd-Loop d-flex align-items-center mt-1">
                                  {item.feedbacks.map((f, j) => (
                                    <div key={j} className="d-flex align-items-center">
                                      {f.name === 'helpfulCheck' && (
                                        <>
                                          <p className="f-12 mb-0">Was This question?</p>
                                          <ul className="Lik-UnLiKE">
                                            <span>{f.value ? <button className="mx-2 emoji-btn-n lik btn"><i className="fas fa-smile"></i></button> : <button className="mx-2 emoji-btn-n dislik btn"><i className="fas fa-frown"></i></button>}</span>
                                          </ul>
                                        </>
                                      )}
                                      {f.name === 'viewAllCheck' && (
                                        <>
                                          <p className="f-12 mb-0">Were you able to view and answers all questions?</p>
                                          <ul className="Lik-UnLiKE">
                                            <span>{f.value ? <button className="mx-2 emoji-btn-n lik btn"><i className="fas fa-smile"></i></button> : <button className="mx-2 emoji-btn-n dislik btn"><i className="fas fa-frown"></i></button>}</span>
                                          </ul>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="feeDbAcK-tagS-8">
                                {item.feedbacks.map((y, k) => (
                                  <React.Fragment key={k}>
                                    {y.name === 'Amazing Questions' && y.value && <p className="amaZing-QuEs">Amazing Questions</p>}
                                    {y.name === 'Ample Time' && y.value && <p className="ample-TimE">Ample Time</p>}
                                    {y.name === 'Smooth Software' && y.value && <p className="SmoOtH-SoFt">Smooth Software</p>}
                                    {y.name === 'Difficult Questions' && y.value && <p className="amaZing-QuEs">Difficult Questions</p>}
                                    {y.name === 'Irrelevant Questions' && y.value && <p className="amaZing-QuEs">Irrelevant Questions</p>}
                                    {y.name === 'Insufficient Time' && y.value && <p className="amaZing-QuEs">Insufficient Time</p>}
                                    {y.name === 'Software Issues' && y.value && <p className="amaZing-QuEs">Software Issues</p>}
                                  </React.Fragment>
                                ))}
                              </div>

                              <p className="mt-2">{item.comment}</p>
                            </div>
                          </div>
                        ))}
                        <hr />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default FeedbackComponent;
