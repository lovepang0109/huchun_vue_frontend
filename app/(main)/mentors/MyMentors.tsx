"use client"

import { useState, useEffect } from 'react';
import clientApi from '@/lib/clientApi';
import { toQueryString } from '@/lib/validator';
import { useSession } from 'next-auth/react'
import SVG from '@/components/svg'

export default function MyMentors() {


  const { user }: any = useSession()?.data || {}

  const [params, setParams] = useState({
    checkSession: false,
    limit: 15,
    page: 1,
    myMentor: true,
    pendingRequest: false,
    chatSupport: true,
    keyword: ''
  });

  const [totalMentors, setTotalMentors] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [mentors, setMentors] = useState<any[]>([]);


  const loadMentor = async () => {
    let newP
    const { data } = await clientApi.get(`/api/student/mentors${toQueryString(params)}`);
    setMentors(data.mentors);
    setTotalMentors(data.total);
  }

  const loadMoreMentors = async () => {
    setParams((prevState) => ({
      ...prevState,
      page: prevState.page + 1
    }))

    const { data } = await clientApi.get(`/api/student/mentors${toQueryString(params)}`);
    setMentors(mentors.concat(data.mentors));
  }

  const search = async (event: any) => {
    setSearchText(event.target.value);
    searchResult(event.target.value);
  }

  const searchResult = async (keyword: any) => {
    let newParams = {
      ...params,
      keyword: keyword,
      page: 1
    }
    setParams(newParams);
    const { data } = await clientApi.get(`/api/student/mentors${toQueryString(newParams)}`);
    setMentors(data.mentors);
    setTotalMentors(data.total);
  }

  const openChat = async (data: any) => {

  }

  useEffect(() => {
    loadMentor();
  }, [])

  return (
    <div>
      <div>
        <div className="row align-items-center">
          <div className="col-md-auto">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">My Mentors</h3>
            </div>
          </div>
          <div className="col-md">
            <div className="search-form-wrap mb-3">
              <div className="member-search2 clearfix">
                <div className="search-form ml-0 w-100">
                  <form className="common_search-type-1 form-half ml-auto">
                    <input type="text" className="form-control pl-4" value={searchText} onChange={(e) => search(e)} placeholder="Search for Mentors" />

                    <span>
                      <figure className="m-0 w-auto admin-search-bar-5">
                        <img src="/assets/images/search-icon-2.png" alt="" />
                      </figure>
                    </span>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {mentors.length > 0 && (<div className="rounded-boxes bg-white">
          <div className="row">
            {
              mentors.map((m: any, i: number) => (
                <div className="col-lg-6 col-md-6 col-12" key={i}>
                  <div className="mentor-box">
                    <div className="d-flex">
                      <figure className="user_img_circled_wrap m-0">
                        <img src={m.avatar} alt="" className="user_img_circled" />
                      </figure>
                      <div className="ml-2">
                        <h3 className="f-14 admin-head pb-0">
                          {m.name}
                          {m.isOnline && <span className="f-12 text-success px-1">
                            <i className="fa fa-circle" aria-hidden="true"></i>
                          </span>}
                          <span className="ml-2">
                            <a className="btn btn-outline-dark btn-sm  f-12"
                              href={`/public/profile/${m._id}`}>
                              <i className="fa fa-eye" aria-hidden="true"></i>
                              View
                            </a>
                          </span>
                        </h3>
                        <p className="f-12">{m.role}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <a className="btn btn-outline" onClick={openChat}>Message</a>
                    </div>
                  </div >
                </div >
              )

              )
            }
          </div >

          {totalMentors > mentors.length && <div className="text-center mt-2" >
            <button className="btn btn-light" onClick={loadMoreMentors} > Load More</button >
          </div >}
        </div >
        )}
      </div>
      {(!mentors || !mentors.length) && <div className="empty-data">
        <SVG.mentorBackgroundImg />
        <h3>Add mentors from your institute</h3>
      </div>
      }
    </div>
  );
};