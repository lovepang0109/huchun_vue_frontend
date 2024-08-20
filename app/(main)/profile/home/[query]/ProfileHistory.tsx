"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import _ from 'lodash'
import SVG from '@/components/svg';
import PImageComponent from "@/components/AppImage";

const ProfileHistory = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [getClientData, setClientData]: any = useState();
  const [archivePractices, setArchivePractices] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [analytics, setAnalytics] = useState({
    overallAccuracy: 0,
    avgTime: 0,
    totalTest: 0,
    totalAnsweredQuestions: 0
  });
  let params = { page: 1, limit: 4 }
  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  const getPractiseSummary = async (userId: any) => {
    const { data } = await clientApi.get(`/api/users/analytics/practice-summary/${userId}${toQueryString({ ...params })}`);
    if (data['overallAccuracy']) {
      setAnalytics(data);
    }
  }

  const getArchivePracticeSets = async (userId: any) => {
    const { data } = await clientApi.get(`/api/tests/archive/${userId}${toQueryString({ ...params })}`);
    setArchivePractices(data?.tests);
  }

  const getEnrolledCourses = async (userId: any) => {
    const { data } = await clientApi.get(
      `/api/course/enrolledCourses/${userId}${toQueryString({ status: 'revoked' })}`
    );
    setMyCourses(data['courses']);
  }

  const loadData = async () => {
    const session: any = (await clientApi.get("/api/me")).data;
    getPractiseSummary(session?._id);
    getArchivePracticeSets(session?._id);
    getEnrolledCourses(session._id);
  }

  useEffect(() => {
    getClientDataFunc();
    loadData();
  }, []);

  return (
    <div>
      {
        archivePractices.length == 0 && myCourses.length == 0 &&
        <div className="empty-data">
          <SVG.NoHistory />
          <h3>No data yet !</h3>
        </div>
      }

      {
        archivePractices?.length > 0 &&
        <div className="checkout-remove-archive pb-0">
          <div className="checkout-area new-checkout-area-a mx-auto">
            <div className="rounded-boxes bg-light shadow">
              <div className="wrap">
                <div className="box-area mb-0">
                  <div className="heading heading_new px-0">
                    <div className="row">
                      <div className="col">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading"> Archived Assessments</h3>
                        </div>
                      </div>
                      {
                        archivePractices?.length > 5 &&
                        <div className="col-auto ml-auto">
                          <div className="view-all view-all_new ml-auto d-block">
                            <a href="/archived-assessment">View All</a>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <div className="box-area-wrap clearfix">
                    <div className="row">
                      {
                        archivePractices.map((item: any, index: any) => {
                          return <div className="col-xl-3 col-lg-4 col-6 mb-2" key={index}>
                            <div className="box-item-remove">
                              <div className="box bg-white pt-0">
                                <PImageComponent
                                  height={135}
                                  fullWidth
                                  imageUrl={item.imageUrl}
                                  backgroundColor={item.colorCode}
                                  text={item.title}
                                  radius={9}
                                  fontSize={15}
                                  type="assessment"
                                  testMode={item.testMode}
                                />


                                <div className="box-inner box-inner_new">
                                  <div className="info p-0 m-0">
                                    <h4 className="text-truncate">{item?.title}</h4>
                                    <p className="text-truncate">{item?.subjects[0].name}
                                      {
                                        item.subjects && item.subjects.length > 1 &&
                                        <span className="mb-1"> + {item.subjects.length - 1} more </span>
                                      }</p>

                                  </div>

                                  <div className="form-row">
                                    <div className="col-6">
                                      <div className="question-count">
                                        <span>{item?.totalQuestion} questions</span>
                                      </div>
                                    </div>

                                    <div className="col-6">
                                      <div className="time text-right">
                                        <span>{item?.totalTime} minutes</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="view-detail view-detail_new">
                                  <a className="text-center" href={`/assessment/home/${item?.title}?id=${item?._id}&withdraw=true`}>VIEW DETAILS</a>
                                  {/* /assessment/home/${item.title}?id=${item._id} */}
                                </div>
                              </div>
                            </div>
                            {/* <TestCard test={item} /> */}
                          </div>
                        })
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      {
        myCourses.length > 0 &&
        <div className="checkout-remove-archive pb-0" >
          <div className="checkout-area arc mx-auto mw-100">
            <div className="rounded-boxes bg-light shadow">
              <div className="wrap">
                <div className="box-area mb-0">
                  <div className="heading heading_new px-0">
                    <div className="row">
                      <div className="col">
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">Your Courses</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    {
                      myCourses.map((item: any) => {
                        return <div className="col-xl-3 col-lg-4 col-6 mb-2" key={item._id}>
                          <a href={`/course/details/${item?._id}`}>
                            <div className="video-item-remove course-item_new">
                              <div className="video-item-img">
                                <div className="image-wrap">
                                  <img src={item.imageUrl} style={{ width: '100%', height: 141 }}></img>
                                  {/* <p-image [height]="141" [width]="100" [imageUrl]="item.imageUrl"
                                                                [backgroundColor]="item.colorCode" [text]="item.title" [radius]="9"
                                                                [type]="'course'" [fontSize]="15">
                                                            </p-image> */}
                                </div>
                              </div>
                              <div className="box-inner box-inner_new">
                                <h4 className="text-truncate">{item?.title}</h4>
                                {
                                  item.subjects && item.subjects.length > 0 &&
                                  <p className="text-truncate mb-1">{item?.subjects[0]?.name}
                                    {
                                      item.subjects && item.subjects.length > 1 &&
                                      <span className="mb-1"> + {item.subjects.length - 1} more </span>
                                    }
                                  </p>
                                }

                                <div className="bottom-info">
                                  <div>
                                    <div className="progress mb-2" style={{ height: 6 }}>
                                      <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{
                                          width: `${item?.progress}%`,
                                          backgroundColor: "#43a74f",
                                        }}
                                        aria-valuenow={50}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="progress-bar"
                                      ></div>
                                    </div>
                                  </div>
                                  <p>{item?.progress}% Complete</p>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};
export default ProfileHistory;
