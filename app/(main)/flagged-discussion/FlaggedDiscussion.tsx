"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as dicussionSvc from "@/services/discussionService";
import * as authSvc from "@/services/auth";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import PImageComponent from "@/components/AppImage";
import * as alertify from "alertifyjs";
import { avatar } from "@/lib/pipe";
import moment from "moment";
import DiscussionViewer from "@/components/DiscussionViewer";

const FlaggedDiscussion = () => {
  const queryParams = useSearchParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    let postID = queryParams.get("post");
    dicussionSvc.getOneFlaggedPost(postID).then((res: any) => {
      setPost(res);
    });
  }, []);

  const deletePost = (post: any) => {
    dicussionSvc
      .deleteFunc(post._id)
      .then(() => {
        alertify.success("This post is deleted.");
        post.deleted = true;
      })
      .catch((res) => {
        if (res.response.data && res.response.data.msg) {
          alertify.alert("Message", res.response.data);
        } else {
          alertify.alert("Message", "Fail to delete this post.");
        }
      });
  };

  const disableUser = (post: any, userId: any) => {
    authSvc
      .changeStatus(userId, { isActive: false })
      .then(() => {
        alertify.success("This user is disabled.");
        post.disabledUser = true;
      })
      .catch((res) => {
        if (res.response.data && res.response.data.msg) {
          alertify.alert("Message", res.response.data.msg);
        } else {
          alertify.alert(
            "Message",
            "Error in disabling the user. The user could not be disabled."
          );
        }
      });
  };

  return (
    <main className="psycho-test2 flagged-discussion pt-lg-3">
      <div className="container">
        <div className="dashboard-area classroom mx-auto bg-white py-3">
          <h4 className="admin-head ml-4 mb-4">Flagged Discussion</h4>
          {post ? (
            <>
              <div
                className={`post-box post-box_new mx-4 ${
                  post.flagged ? "bg-flagged" : "bg-white"
                }`}
              >
                <div className="profile-box profile-box_new d-flex">
                  <figure>
                    <div className="profile-user">
                      <img
                        src={avatar(post.user)}
                        alt=""
                        className="user_img_circled"
                      />
                    </div>
                  </figure>

                  <div className="profile-info ml-4 p-0">
                    <h4>
                      {post.user?.name}{" "}
                      <span className="flagged ml-3">&nbsp;&nbsp;&nbsp;</span>
                    </h4>
                    <ul className="nav">
                      <li>{post.user.role}</li>
                      &nbsp;
                      <li>
                        {moment(post.updatedAt).format(
                          "MMM D, YYYY, h:mm:ss A"
                        )}
                      </li>
                    </ul>
                  </div>

                  {post.flagged && (
                    <div className="dropdown-edit-delete">
                      <div className="dropdown">
                        <a
                          role="button"
                          id="dropdown-profile-box-btn"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                          aria-label="dropdown for more options"
                        >
                          <figure>
                            <img
                              src="/assets/images/carbon_overflow-menu-horizontal.png"
                              alt=""
                            />
                          </figure>
                        </a>

                        <ul
                          className="dropdown-menu dropdown-menu-right py-0 border-0"
                          aria-labelledby="dropdown-profile-box-btn"
                        >
                          {!post.deleted && (
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => deletePost(post)}
                              >
                                <span className=" delete">
                                  &nbsp;&nbsp;&nbsp;
                                </span>
                                Delete
                              </a>
                            </li>
                          )}
                          {!post.disabledUser && (
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => disableUser(post, post.user._id)}
                              >
                                <span className=" disable">
                                  &nbsp;&nbsp;&nbsp;
                                </span>
                                Disable User
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                <div className="post-box-content post-box-content_new mt-3">
                  {/* <DiscussionViewer
                    content={post.description}
                    className="post-Discussion_nEw"
                  /> */}
                </div>
                {post.attachments?.length > 0 && (
                  <>
                    {post.attachments.map((item, index) => (
                      <div key={index}>
                        {item.type === "document" && (
                          <div className="special-info special-info_new">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="d-flex align-items-center">
                                <div className="col-auto pr-0">
                                  <figure className="doc">
                                    <img
                                      src="assets/images/img-doc.png"
                                      alt=""
                                    />
                                  </figure>
                                </div>
                                <div className="col">
                                  <div className="inner">
                                    <h4
                                      className="mt-2 text-truncate"
                                      title={item.title}
                                    >
                                      {item.title}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            </a>
                            <div className="close-btn">
                              {/* <a>
                <figure>
                  <img src="assets/images/ant-design_close-circle-outlined.png" alt="" />
                </figure>
              </a> */}
                            </div>
                          </div>
                        )}
                        {item.type === "link" && (
                          <div className="special-info special-info_new mb-0">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="d-flex align-items-center">
                                <div className="col-auto pr-0">
                                  <figure>
                                    <img src={item.imageUrl} alt="" />
                                  </figure>
                                </div>
                                <div className="col">
                                  <div className="inner">
                                    <div className="wrap">
                                      <h4>{item.title}</h4>
                                      <p>{item.description}</p>
                                      <span>{item.url}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
                <div className="mb-3"></div>
                <div className="comments comments_new border-bottom border-secondary">
                  <ul className="nav px-0 m-0 py-2">
                    <li>
                      <span className="like-count">
                        {post.vote?.length > 0 ? post.vote.length : ""} Likes
                      </span>
                    </li>
                    <li className="dot">{post.comments.length} Comments</li>
                  </ul>
                </div>
                <div className="user-comment user-comment_new p-0">
                  {post.comments.map((comment, cI) => (
                    <div
                      key={cI}
                      className={`mt-3 px-2 py-1 mx--5 ${
                        comment.flagged ? "bg-flagged" : ""
                      }`}
                    >
                      <div className="profile-box profile-box_new mt-4 d-flex">
                        <figure>
                          <div className="profile-user">
                            <img
                              src={avatar(comment.user, "sm")}
                              alt=""
                              className="user_img_circled"
                            />
                          </div>
                        </figure>

                        <div className="profile-info ml-4 p-0">
                          <h4>
                            {comment?.user?.name}
                            {comment?.flagged && (
                              <span className="flagged ml-3">
                                &nbsp;&nbsp;&nbsp;
                              </span>
                            )}
                          </h4>
                          <ul className="nav">
                            <li>{comment?.user?.role}</li>
                            <li>
                              {new Date(post?.updatedAt).toLocaleString()}
                            </li>
                          </ul>
                        </div>
                        {comment?.flagged && (
                          <div className="dropdown-edit-delete">
                            <div className="dropdown">
                              <a
                                role="button"
                                id="flaged_dropdown-profile-box-btn"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <figure>
                                  <img
                                    src="/assets/images/carbon_overflow-menu-horizontal.png"
                                    alt="this is flaged discusion"
                                  />
                                </figure>
                              </a>

                              <ul
                                className="dropdown-menu dropdown-menu-right py-0 border-0"
                                aria-labelledby="dropdown-profile-box-btn"
                              >
                                {!comment?.deleted && (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      onClick={() => deletePost(comment)}
                                    >
                                      <span className="delete">
                                        &nbsp;&nbsp;&nbsp;
                                      </span>
                                      Delete
                                    </a>
                                  </li>
                                )}
                                {!comment?.disabledUser && (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      onClick={() =>
                                        disableUser(comment, comment.user._id)
                                      }
                                    >
                                      <span className="disable">
                                        &nbsp;&nbsp;&nbsp;
                                      </span>
                                      Disable User
                                    </a>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="post-box-content post-box-content_new mt-3">
                        {/* <DiscussionViewer content={comment.description} /> */}
                      </div>

                      {comment?.attachments?.length > 0 && (
                        <>
                          {comment?.attachments.map((item, index) => (
                            <div key={index}>
                              {item.type === "document" && (
                                <div className="special-info special-info_new">
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <div className="d-flex align-items-center">
                                      <div className="col-auto pr-0">
                                        <figure className="doc">
                                          <img
                                            src="/assets/images/img-doc.png"
                                            alt=""
                                          />
                                        </figure>
                                      </div>
                                      <div className="col">
                                        <div className="inner">
                                          <h4
                                            className="mt-2 text-truncate"
                                            title={item.title}
                                          >
                                            {item.title}
                                          </h4>
                                        </div>
                                      </div>
                                    </div>
                                  </a>
                                  <div className="close-btn">
                                    {/* <a>
                      <figure>
                        <img src="assets/images/ant-design_close-circle-outlined.png" alt="" />
                      </figure>
                    </a> */}
                                  </div>
                                </div>
                              )}
                              {item.type === "link" && (
                                <div className="special-info special-info_new mb-0">
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <div className="d-flex align-items-center">
                                      <div className="col-auto pr-0">
                                        <figure>
                                          <img src={item.imageUrl} alt="" />
                                        </figure>
                                      </div>
                                      <div className="col">
                                        <div className="inner">
                                          <div className="wrap">
                                            <h4>{item.title}</h4>
                                            <p>{item.description}</p>
                                            <span>{item.url}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mx-4">
              <SkeletonLoaderComponent Cwidth="100" Cheight="300" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default FlaggedDiscussion;
