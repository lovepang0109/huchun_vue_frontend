"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import Link from "next/link";
import { success } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import MathJax from "@/components/assessment/mathjax";
import ItemPrice from "@/components/ItemPrice";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import SVG from "@/components/svg";
import { addItem } from "@/services/shopping-cart-service";
import * as authSvc from "@/services/auth";
import * as serviceSvc from "@/services/suportService";
import * as userSvc from "@/services/userService";
import * as paymentService from "@/services/paymentService";
import * as chatSvc from "@/services/chatService";
import alertify from "alertifyjs";
import { slugify } from "@/lib/validator";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
const ServiceMembers = ({ service, user }: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<any>([]);
  const [params, setParams] = useState<any>({
    skip: 0,
    limit: 10,
    searchText: "",
  });
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    findMembers(true);
  }, []);

  const search = (text: string) => {
    setParams({
      ...params,
      skip: 0,
      searchText: text,
    });
    const para = {
      ...params,
      skip: 0,
      searchText: text,
    };
    findMembers(true, para);
  };

  const findMembers = (isRefresh: boolean, para?: any) => {
    if (!para) {
      para = params;
    }
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    if (isRefresh) {
      setTotalCount(0);
      setMembers([]);
    }
    const query: any = { ...para };
    if (isRefresh) {
      query.count = true;
    }
    serviceSvc
      .getMembers(service._id, query)
      .then((res: any) => {
        if (isRefresh) {
          setMembers(res.users);
          setTotalCount(res.count);
        } else {
          setMembers(members.concat(res.users));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const loadMore = () => {
    setParams({
      ...params,
      skip: members.length,
    });
    const para = {
      ...params,
      skip: members.length,
    };

    findMembers(false, para);
  };

  const openStudentChat = (studentId: any, name: any) => {
    console.log("openStudentChat");
    chatSvc.openChat(user.activeLocation, studentId, name);
  };

  const track = (idx: any, item: any) => {
    return item._id;
  };

  return (
    <div className="text-dark bg-white py-3 px-4">
      <div className="rounded-boxes bg-white">
        <div className="row">
          <div className="col-6"></div>
          <div className="col-6">
            <div className="member-search my-3">
              <form
                className="w-100-xs common_search-type-1 form-half mt-1 ml-auto"
                style={{ maxWidth: "100%" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  // search();
                }}
              >
                <input
                  type="text"
                  className="form-control border-0 my-0"
                  maxLength={50}
                  placeholder="Search for member"
                  name="txtSearch"
                  value={params.searchText}
                  onChange={(e) => {
                    search(e.target.value);
                  }}
                />
                {params.searchText !== "" && (
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
          </div>
        </div>

        {!isLoading ? (
          <>
            {members.length ? (
              <div className="folder-area clearfix">
                <div className="table-responsive table-wrap">
                  <table className="table vertical-middle mb-0">
                    <thead>
                      <tr>
                        <th className="border-0">Name</th>
                        <th className="border-0 text-center">Price</th>
                        <th className="border-0 text-center">Joining Date</th>
                        <th className="border-0 text-center">
                          Expiration Date
                        </th>
                        <th className="border-0"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((mem, index) => (
                        <tr key={index}>
                          <td className="px-0">
                            <div className="folder mb-0 p-0">
                              <a className="d-flex align-items-center border-0 p-0">
                                <figure className="user_img_circled_wrap">
                                  <img
                                    className="avatar"
                                    src={mem.userInfo.avatar}
                                    alt=""
                                  />
                                </figure>
                                <div className="inner ml-2 pl-0">
                                  <div className="inners">
                                    <div className="d-flex align-items-center">
                                      <h4>{mem.userInfo.name}</h4>
                                    </div>
                                    <p>{mem.userInfo.userId}</p>
                                  </div>
                                </div>
                              </a>
                            </div>
                          </td>
                          <td className="text-center">
                            <h4>
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: mem.currency,
                              }).format(mem.price)}
                            </h4>
                          </td>
                          <td className="text-center">
                            <h4>
                              {moment(mem.createdAt).format("MMM DD, YYYY")}
                            </h4>
                          </td>
                          <td className="text-center">
                            <h4>
                              {moment(mem.expiresOn).format("MMM DD, YYYY")}
                            </h4>
                          </td>
                          <td>
                            <div className="text-right">
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() =>
                                  openStudentChat(
                                    mem.userInfo._id,
                                    mem.userInfo.name
                                  )
                                }
                              >
                                Message
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalCount > members.length && (
                  <div className="text-center">
                    <button className="btn btn-light" onClick={loadMore}>
                      Load More
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="folder-area clearfix mx-auto mt-4 text-center">
                <figure className="mx-auto">
                  <img
                    src="/assets/images/Search-rafiki.png"
                    alt=""
                    className="img-fluid d-block mx-auto"
                  />
                </figure>
                <strong>No Results Found</strong>
                <p>We couldn&apos;t find any results based on your search</p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-2">
            <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
            <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
            <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
            <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
            <SkeletonLoaderComponent Cwidth="100" Cheight="30" />
          </div>
        )}
      </div>
    </div>
  );
};
export default ServiceMembers;
