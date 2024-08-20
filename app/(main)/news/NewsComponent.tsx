"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import PImageComponent from "@/components/AppImage";
import * as alertify from "alertifyjs";
import { Modal } from "react-bootstrap";
import { useSession } from "next-auth/react";
import * as adminSvc from "@/services/adminService";
import EditNews from "./editNews";

const NewsComponent = () => {
  const [isSeaching, setIsSeaching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newsList, setNewsList] = useState<any>([]);
  const [params, setParams] = useState<any>({
    skip: 0,
    limit: 10,
    searchText: "",
  });
  const [canLoadMore, setCanLoadMore] = useState<boolean>(false);
  const user: any = useSession()?.data?.user?.info || {};
  const [editServiceModal, setEditServiceModal] = useState<boolean>(false);
  const [createServiceModal, setCreateServiceModal] = useState<boolean>(false);
  const [news, setNews] = useState<any>({
    title: "",
    desciption: "",
    link: "",
    imageUrl: "",
    active: true,
  });

  useEffect(() => {
    fetchNews(true);
  }, []);

  const search = (txt?: string) => {
    setParams({
      ...params,
      skip: 0,
      searchText: txt,
    });
    const updatedParams = {
      ...params,
      skip: 0,
      searchText: txt,
    };
    fetchNews(true, updatedParams);
  };

  const reset = () => {
    setParams({
      ...params,
      skip: 0,
      searchText: "",
    });
    const updatedParams = {
      ...params,
      skip: 0,
      searchText: "",
    };
    fetchNews(true, updatedParams);
  };

  const loadMore = () => {
    setParams({
      ...params,
      skip: newsList.length,
    });
    const updatedParams = {
      ...params,
      skip: newsList.length,
    };
    fetchNews(true, updatedParams);
  };

  const fetchNews = (isNew: boolean, para?: any) => {
    if (!para) {
      para = params;
    }
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    if (isNew) {
      setNewsList([]);
    }
    adminSvc
      .getNews(para)
      .then((r: any[]) => {
        if (isNew) {
          setNewsList(r);
        } else {
          setNewsList(newsList.concat(r));
        }
        setCanLoadMore(r.length == para.limit);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const create = () => {
    setCreateServiceModal(true);
  };

  const onClose = (res: any) => {
    if (res) {
      const updatedNewList = newsList;
      updatedNewList.unshift(res);
      setNewsList(updatedNewList);
      alertify.success("What's New is created!");
    }
    setCreateServiceModal(false);
  };

  const edit = (news: any) => {
    setEditServiceModal(true);
    setNews(news);
  };

  const editOnClose = (res: any) => {
    if (res) {
      alertify.success("What's New is updated!");
    }
    setEditServiceModal(false);
  };

  const deactivate = (news: any) => {
    alertify.confirm(
      "Are you sure you want to deactivate this What's New?",
      (msg) => {
        adminSvc.updateNews(news._id, { active: false }).then((res) => {
          alertify.success("What's New is deactivated!");
          setNewsList((prevNewsList) =>
            prevNewsList.map((item) =>
              item._id === news._id ? { ...item, active: false } : item
            )
          );
        });
      }
    );
  };

  const activate = (news: any) => {
    adminSvc.updateNews(news._id, { active: true }).then((res) => {
      alertify.success("What's New is activated!");
      news.active = true;
      setNewsList((prevNewsList) =>
        prevNewsList.map((item) =>
          item._id === news._id ? { ...item, active: true } : item
        )
      );
    });
  };

  const track = (idx: any, item: any) => {
    return item._id;
  };

  return (
    <>
      {" "}
      <div className="container mt-3">
        <div className="rounded-boxes bg-white">
          <div className="row align-items-center">
            <div className="col-12 col-lg-10">
              <div className="UserCardAdmiN-AlL1">
                <section className="my-2">
                  <form className="common_search-type-1">
                    <div className="form-group">
                      <figure>
                        <span>
                          <img
                            alt=""
                            className="searchBoxIcon-5"
                            src="/assets/images/search-icon-2.png"
                          />
                        </span>
                      </figure>
                      <input
                        className="form-control border-0"
                        maxLength="50"
                        value={params.searchText}
                        onChange={(e) => search(e.target.value)}
                        placeholder="Search for What's New"
                        type="text"
                      />
                    </div>
                  </form>
                </section>
              </div>
            </div>
            <div className="col-auto ml-auto col-lg-2 text-right">
              <div className="admin-filter d-lg-block">
                <button className="btn btn-primary" onClick={create}>
                  Add What&apos;s New
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2">
            {newsList.map((news, index) => (
              <div
                className="rounded-boxes course-content dropShadowProgrammE bg-white"
                key={index}
              >
                <div className="row">
                  <div className="col-3 col-lg-2">
                    <img src={news.imageUrl} alt={news.title} />
                  </div>
                  <div className="col-9 col-lg-8">
                    <div className="assess-tags ml-0 mt-2">
                      <h4 className="f-16 mb-1">{news.title}</h4>
                      <p className="f-14 admin-info1 mt-0 ml-0">
                        {news.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 col-lg-auto ml-auto text-right">
                    {news.active ? (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => deactivate(news)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => activate(news)}
                      >
                        Activate
                      </button>
                    )}
                    <button
                      className="btn btn-primary btn-sm ml-2"
                      onClick={() => edit(news)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!newsList.length && !isLoading && (
            <div className="container">
              <div className="course addNoDataFullpageImgs">
                <figure>
                  <img
                    src="/assets/images/undraw_Online_learning_re_qw08.svg"
                    alt="Not Found"
                  />
                </figure>
                <h4 className="text-center">No news found!</h4>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="mt-2">
              <div className="my-3">
                <SkeletonLoaderComponent width="100" height="120" />
              </div>
              <div className="my-3">
                <SkeletonLoaderComponent width="100" height="120" />
              </div>
              <div className="my-3">
                <SkeletonLoaderComponent width="100" height="120" />
              </div>
            </div>
          )}
          {!isLoading && canLoadMore && (
            <div className="text-center mt-3">
              <button className="btn btn-light" onClick={loadMore}>
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
      {createServiceModal && (
        <EditNews
          isShow={createServiceModal}
          setIsShow={setCreateServiceModal}
          onClose={onClose}
          isNew={true}
          news={news}
          setNews={setNews}
        />
      )}
      {editServiceModal && (
        <EditNews
          isShow={editServiceModal}
          setIsShow={setEditServiceModal}
          onClose={editOnClose}
          isNew={false}
          news={news}
          setNews={setNews}
        />
      )}
    </>
  );
};

export default NewsComponent;
