"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
// import  alertifyjs  from "alertifyjs";
import SVG from "@/components/svg";
import moment from "moment";

export default function AllMentors() {
  const { user }: any = useSession()?.data || {};

  const [params, setParams] = useState({
    checkSession: false,
    limit: 10,
    page: 1,
    myMentor: false,
    pendingRequest: false,
    chatSupport: false,
    keyword: "",
  });

  const [totalMentors, setTotalMentors] = useState<number>(0);
  const [mentors, setMentors] = useState([]);

  const [pendingParams, setPendingParams] = useState({
    checkSession: false,
    limit: 10,
    page: 1,
    myMentor: false,
    pendingRequest: true,
    chatSupport: false,
    keyword: "",
  });

  const [totalPendingMentors, setTotalPendingmentors] = useState(0);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [pendingMentorsLoaded, setPendingMentorsLoaded] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("mentor");
  const [textSearch, setTextSearch] = useState<string>("");

  const loadMentor = async () => {
    const { data } = await clientApi.get(
      `/api/student/mentors${toQueryString(params)}`
    );
    setMentors(data.mentors);
    setTotalMentors(data.total);
  };

  const searchResult = async (keyword) => {
    let newParams = {
      ...params,
      keyword: keyword,
      page: 1,
    };
    setParams(newParams);
    const { data } = await clientApi.get(
      `/api/student/mentors${toQueryString(newParams)}`
    );
    setMentors(data.mentors);
    setTotalMentors(data.total);
  };

  const search = async (event) => {
    setTextSearch(event.target.value);
    if (activeTab == "mentor") {
      searchResult(event.target.value);
    } else {
      setPendingParams({
        ...pendingParams,
        keyword: textSearch,
        page: 1,
      });
      const { data } = await clientApi.get(
        `/api/student/mentors${toQueryString(pendingParams)}`
      );
      setPendingMentors(data.mentors);
      setTotalPendingmentors(data.total);
    }
  };

  const loadMoreMentors = async () => {
    setParams((prevState) => ({
      ...prevState,
      page: prevState.page + 1,
    }));

    const { data } = await clientApi.get(
      `/api/student/mentors${toQueryString(params)}`
    );
    setMentors(mentors.concat(data.mentors));
  };

  const loadMorePendingMentors = async () => {
    setPendingParams((prevState) => ({
      ...prevState,
      page: prevState.page + 1,
    }));

    const { data } = await clientApi.get(
      `/api/student/mentors${toQueryString(pendingParams)}`
    );
    setPendingMentors(pendingMentors.concat(data.mentors));
  };

  const addMentor = async (mentor) => {
    const condition = {
      name: mentor.name,
      mentorId: mentor.userId,
    };
    const { data } = await clientApi.get(
      `/api/student/mentors/findOne${toQueryString(condition)}`
    );
    if (data && data.error) {
      if (data.error) {
        alert(data.error);
      }
    } else {
      const { data } = await clientApi.post(
        `/api/student/mentors/add${condition}`
      );
      // alertifyjs.success('Invitation sent successfully.');
      setPendingMentorsLoaded(false);
      const idx = mentors.findIndex((m) => m._id == mentor._id);
      if (idx > -1) {
        mentors.splice(idx, 1);
      }
    }
  };

  const switchTab = async (tabName: any) => {
    setActiveTab(tabName);
    if (tabName === "pending" && !pendingMentorsLoaded) {
      setPendingMentorsLoaded(true);
      const { data } = await clientApi.get(
        `/api/student/mentors${toQueryString(pendingParams)}`
      );
      setPendingMentors(data.mentors);
      setTotalPendingmentors(data.total);
    }
  };

  function track(idx, item) {
    return item._id;
  }

  useEffect(() => {
    loadMentor();
  }, []);

  // useEffect(() => {

  //   loadMentor();
  // },[textSearch])

  return (
    <div>
      <div className="row align-items-center mt-3">
        <div className="col-md-auto">
          <div className="section_heading_wrapper">
            <h3 className="section_top_heading">All Mentors</h3>
          </div>
        </div>
        <div className="col-md">
          <div className="search-form-wrap ml-auto">
            <div className="member-search2 clearfix">
              <div className="search-form ml-0 w-100">
                <form
                  className="common_search-type-1 form-half ml-auto"
                  noValidate
                >
                  <input
                    type="text"
                    className="form-control pl-4"
                    placeholder="Search for mentors"
                    onChange={(e) => search(e)}
                    value={textSearch}
                    maxLength="50"
                  />
                  <figure className="m-0 w-auto admin-search-bar-5">
                    <span>
                      <img alt="" src="/assets/images/search-icon-2.png" />
                    </span>
                  </figure>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="myeducoins-section">
        <div className="educoin-teb bg-white">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation">
              <a
                aria-selected="true"
                className="active"
                data-toggle="tab"
                href="#addmentor"
                role="tab"
                onClick={() => switchTab("mentor")}
              >
                <span>Add Mentor</span>
              </a>
            </li>
            <li role="presentation">
              <a
                aria-selected="false"
                className=""
                data-toggle="tab"
                href="#pendingrequest"
                role="tab"
                onClick={() => switchTab("pending")}
              >
                <span>Pending Request</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="tab-content">
          <div
            className="tab-pane fade active show"
            id="addmentor"
            role="tabpanel"
          >
            <div className="earn-body mt-0">
              {mentors.length > 0 && (
                <>
                  <div className="row">
                    {mentors.map((m) => (
                      <div key={m._id} className="col-lg-6 col-md-12 col-12">
                        <div className="mentor-box p-0">
                          <div className="d-flex justify-content-between">
                            <div className="d-flx pt-3 pl-3 pr-3">
                              <div>
                                <figure className="user_img_circled_wrap m-0">
                                  <img
                                    src={m.avatar}
                                    alt="Avatar"
                                    className="user_img_circled"
                                  />
                                </figure>
                              </div>
                              <div className="ml-2">
                                <h3 className="f-14 admin-head pb-0">
                                  {m.name}
                                  {m.isOnline && (
                                    <>
                                      <span className="f-12 text-success px-1">
                                        <i
                                          className="fa fa-circle"
                                          aria-hidden="true"
                                        ></i>
                                      </span>
                                      <span className="ml-2">
                                        <a
                                          className="btn btn-outline-dark btn-sm f-12"
                                          href={`/public/profile/${m._id}`}
                                        >
                                          <i
                                            className="fa fa-eye"
                                            aria-hidden="true"
                                          ></i>
                                          View
                                        </a>
                                      </span>
                                    </>
                                  )}
                                </h3>
                                <p className="f-12">{m.role}</p>
                                <p className="f-12 mt-2 text-dark">
                                  {m.knowAboutUs}
                                </p>
                              </div>
                            </div>
                            {m.featured && (
                              <>
                                <div className="pr-3 pb-3">
                                  <div className="text-center">
                                    <img
                                      className="d-inline-block"
                                      alt=""
                                      src="/assets/images/vector-y.png"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="text-right pb-3 pr-3">
                            <a
                              className="btn btn-primary btn-sm"
                              onClick={() => addMentor(m)}
                            >
                              Add
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalMentors > mentors.length && (
                    <>
                      <div className="text-center mt-2">
                        <button
                          className="btn btn-light"
                          onClick={() => loadMoreMentors()}
                        >
                          Load More
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
              {(!mentors || (mentors && mentors.length == 0)) && (
                <>
                  <div className="empty-data">
                    <SVG.mentorBackgroundImg />
                    <h3>No mentors from your institute</h3>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="tab-pane" id="pendingrequest" role="tabpanel">
            <div className="earn-body mt-0">
              {pendingMentors.length > 0 && (
                <>
                  <div className="row">
                    {pendingMentors.map((m) => (
                      <>
                        <div className="col-lg-6 col-md-12 col-12">
                          <div className="mentor-box">
                            <div className="d-flex justify-content-between">
                              <div className="d-flex">
                                <div>
                                  <figure className="user_img_circled_wrap m-0">
                                    <img
                                      src={m.avatar}
                                      alt=""
                                      className="user_img_circled"
                                    />
                                  </figure>
                                </div>
                                <div className="ml-2">
                                  <h3 className="f-14 admin-head pb-0">
                                    {m.name}
                                    {m.isOnline && (
                                      <>
                                        <span className="f-12 text-success px-1">
                                          <i
                                            className="fa fa-circle"
                                            aria-hidden="true"
                                          ></i>
                                        </span>
                                        <span className="ml-2">
                                          <a
                                            className="btn btn-outline-dark btn-sm f-12"
                                            href={`/public/profile/${m._id}`}
                                          >
                                            <i
                                              className="fa fa-eye"
                                              aria-hidden="true"
                                            ></i>
                                            View
                                          </a>
                                        </span>
                                      </>
                                    )}
                                  </h3>
                                  <p className="f-12">{m.role}</p>
                                  <p className="f-12 mt-2 text-dark">
                                    {m.knowAboutUs}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-2">
                                <p className="f-12 mt-0">
                                  {moment(m.myMentees.createdAt).fromNow()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <a className="btn btn-primary btn-sm">Pending</a>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                  {totalPendingMentors > pendingMentors.length && (
                    <>
                      <div className="text-center mt-2">
                        <button
                          className="btn btn-light"
                          onClick={() => loadMorePendingMentors()}
                        >
                          Load More
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
              {(!pendingMentors ||
                (pendingMentors && pendingMentors.length == 0)) && (
                <>
                  <div className="empty-data">
                    <SVG.mentorBackgroundImg />
                    <h3>No pending request for mentors from your institute</h3>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
