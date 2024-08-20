import React, { useEffect, useState } from "react";
import * as authService from "@/services/auth";
import { getTaggingServicesForStudents } from "@/services/suportService";
import {} from "@/services/settingService";
import {
  getCourseDiscussions,
  comment,
  getComments,
  deleteFunc as deleteFunction,
  editPost,
  unvotePost,
  votePost,
  savedPost,
  flag,
} from "@/services/discussionService";
import { replaceBadWords } from "@/lib/common";
import { alert, confirm, success } from "alertifyjs";
import MathJax from "@/components/assessment/mathjax";
import PaginationComponent from "@/components/Pagination";
import { avatar } from "@/lib/pipe";

const CourseDiscussionComponent = ({ user, course }: any) => {
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [posts, setPosts] = useState<any>([]);
  const [params, setParams] = useState<any>({
    page: 1,
    skip: 0,
    limit: 15,
  });
  const [filter, setFilter] = useState<any>({
    searchText: "",
    last90Days: false,
    unanswered: false,
  });
  const ckConfig = {
    simpleUpload: {
      uploadUrl: "/api/v1/files/discussionUpload?method=drop",
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(), // Assuming authSvc is a service available in your React setup
      },
    },
  };
  const [comments, setComments] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiscusstionFunction();
  }, []);

  const getDiscusstionFunction = () => {
    getCourseDiscussions(course._id, {
      limit: params.limit,
      skip: 0,
      count: true,
    })
      .then((data: any) => {
        setPosts(data.posts);
        setTotalPosts(data.count);
        getServices(data.posts);
        setLoading(false);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const getServices = (posts: any) => {
    if (posts.length) {
      getTaggingServicesForStudents(posts.map((r: any) => r.user._id)).then(
        (serviceMap: any[]) => {
          const postsData = posts;
          for (const member of postsData) {
            if (serviceMap[member.user._id]) {
              member.services = serviceMap[member.user._id].services;
            }
          }
          setPosts(postsData);
        }
      );
    }
  };

  const onPageChanged = () => {
    const paramsData: any = { ...params };
    paramsData.skip = (params.page - 1) * params.limit;
    if (filter.searchText) {
      paramsData.searchText = filter.searchText;
    }
    if (filter.last90Days) {
      paramsData.lastDays = 90;
    }
    if (filter.unanswered) {
      paramsData.unanswered = true;
    }

    setPosts(null);
    getCourseDiscussions(course._id, paramsData).then((data: any) => {
      setPosts(data.posts);
      getServices(data.posts);
    });
  };

  const filterChanged = (paramsData: any) => {
    setPosts(null);
    setTotalPosts(0);
    getCourseDiscussions(course._id, paramsData).then((data: any) => {
      setPosts(data.posts);
      setTotalPosts(data.count);
      getServices(data.posts);
    });
  };

  const voted = (post: any) => {
    return post.vote && post.vote.indexOf(user._id) > -1;
  };

  const submitComment = (post: any, i: number) => {
    const commentsData = comments;
    if (!commentsData[post._id] || !commentsData[post._id].trim()) {
      return;
    }

    setSubmitted(true);
    const commentData = {
      description: replaceBadWords(commentsData[post._id].trim()),
    };

    comment(post._id, commentData)
      .then((data: any) => {
        success("Comment is posted successfully.");
        data.user = { ...user };
        post.comments.push(data);

        setPosts((prev: any) => {
          const newArray = [...prev];
          newArray[i] = post;
          return newArray;
        });

        commentsData[post._id] = "";
      })
      .catch((err: any) => {
        let msg = "";
        for (const i in err) {
          msg += err[i].msg + "<br>";
        }
        alert("Message ", msg);
      });
    setComments(commentsData);
    setSubmitted(false);
  };

  const loadMoreComments = (post: any) => {
    post.commentPage++;
    getComments(post._id, {
      page: post.commentPage,
    })
      .then((comments: any) => {
        post.comments = post.comments.concat(comments);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deletePost = (id: number, post: any, parent?: any) => {
    confirm("Are you ure you want to delete this message?", (data: any) => {
      deleteFunction(post._id)
        .then((data: any) => {
          success("Successfully Deleted");
          if (parent) {
            const idx = parent.comments.indexOf(post);
            if (idx > -1) {
              setPosts((prev: any) => {
                const newArray = [...prev];
                newArray[id].comments.splice(idx, 1);
                return newArray;
              });
            }
          } else {
            setPosts((prev: any) => {
              let newArray = [...prev];
              newArray = newArray.filter(
                (item: any, index: number) => index !== id
              );
              return newArray;
            });
          }
        })
        .catch((err: any) => {
          alert("Message", "Unable to Delete");
        });
    });
  };

  const saveComment = (comment: any, postId: any, comId: any) => {
    editPost(comment._id, { description: replaceBadWords(comment.description) })
      .then(() => {
        success("Your post has changed.");
        setPosts((prev: any) => {
          const newArray = [...prev];
          newArray[postId].comments[comId].edit = false;
          return newArray;
        });
      })
      .catch((err) => {
        alert("Message", "There is error saving your post");
      });
  };

  const vote = (id: any, onPost: any) => {
    if (voting) {
      return;
    }
    setVoting(true);
    if (!onPost.vote) {
      setPosts((prev: any) => {
        const newArray = [...prev];
        newArray[id].vote = [];
        return newArray;
      });
    }
    const idx = onPost.vote.indexOf(user._id);
    if (idx > -1) {
      unvotePost(onPost._id)
        .then(() => {
          onPost.vote.splice(idx, 1);

          setPosts((prev: any) => {
            const newArray = [...prev];
            newArray[id].vote = [...onPost.vote];
            return newArray;
          });
        })
        .catch((err) => {
          console.log(err);
        });
      setVoting(false);
    } else {
      votePost(onPost._id)
        .then(() => {
          onPost.vote.push(user._id);

          setPosts((prev: any) => {
            const newArray = [...prev];
            newArray[id].vote = [...onPost.vote];
            return newArray;
          });
        })
        .catch((err) => {
          console.log(err);
        });
      setVoting(false);
    }
  };

  const commentVote = (postId: any, comId: any, onComment: any) => {
    if (voting) {
      return;
    }
    setVoting(true);
    if (!onComment.vote) {
      setPosts((prev: any) => {
        const newArray = [...prev];
        newArray[postId].comments[comId].vote = [];
        return newArray;
      });
    }
    const idx = onComment.vote.indexOf(user._id);
    if (idx > -1) {
      unvotePost(onComment._id)
        .then(() => {
          onComment.vote.splice(idx, 1);

          setPosts((prev: any) => {
            const newArray = [...prev];
            newArray[postId].comments[comId].vote = [...onComment.vote];
            return newArray;
          });
        })
        .catch((err) => {
          console.log(err);
        });
      setVoting(false);
    } else {
      votePost(onComment._id)
        .then(() => {
          onComment.vote.push(user._id);

          setPosts((prev: any) => {
            const newArray = [...prev];
            newArray[postId].comments[comId].vote = [...onComment.vote];
            return newArray;
          });
        })
        .catch((err) => {
          console.log(err);
        });
      setVoting(false);
    }
  };

  const savePost = (post: any) => {
    savedPost(post._id)
      .then((res: any) => {
        success("Successfully Saved");
      })
      .catch((err) => {
        alert(" Alert", "Unable to Save");
      });
  };

  const addToFlagPost = (post: any, id: number) => {
    flag(post._id)
      .then((d: any) => {
        success("Successfully Flagged");
        post.flagged = true;
        setPosts((prev: any) => {
          const newArray = [...prev];
          newArray[id] = post;
          return newArray;
        });
      })
      .catch((err: any) => {
        alert("Message", "Unable to add in Flagged, Please Try again later");
      });
  };

  const postTrack = (index: any, item: any) => {
    return item._id;
  };

  return (
    <>
      <div>
        <div className="post-box post-box_new bg-white">
          <div className="section_heading_wrapper">
            <h3 className="section_top_heading">Discussions</h3>
          </div>
          <div className="d-flex justify-content-between">
            <div className="d-flex align-items-center">
              <label>Show Unanswered</label>
              <div className="switch-item ml-3">
                <label className="switch">
                  <input
                    type="checkbox"
                    value="1"
                    defaultChecked={filter.unanswered}
                    name="unanswered"
                    onChange={(e: any) => {
                      const paramsData: any = { ...params, count: true };
                      paramsData.unanswered = e.target.checked;
                      filterChanged(paramsData);
                    }}
                    aria-label="checkbox"
                  />
                  <span className="slider round translate-middle-y"></span>
                </label>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <label>Show last 90 days</label>
              <div className="switch-item ml-3">
                <label className="switch">
                  <input
                    type="checkbox"
                    value="1"
                    defaultChecked={filter.last90Days}
                    name="last90Days"
                    onChange={(e: any) => {
                      const paramsData: any = { ...params, count: true };
                      if (e.target.checked) {
                        paramsData.lastDays = 90;
                      }
                      filterChanged(paramsData);
                    }}
                    aria-label="checkbox"
                  />
                  <span className="slider round translate-middle-y"></span>
                </label>
              </div>
            </div>

            <div className="search-form">
              <div className="common_search-type-1 form-half ml-auto ">
                <input
                  type="text"
                  max={50}
                  placeholder="Search by concept title"
                  name="searchText"
                  className="form-control border-0 my-0"
                  defaultValue={filter.searchText}
                  onChange={(e: any) => {
                    const paramsData: any = { ...params, count: true };
                    paramsData.searchText = e.target.value;
                    filterChanged(paramsData);
                  }}
                />
                <span className="m-0 w-auto h-auto">
                  <figure className="m-0 w-auto">
                    <img
                      src="/assets/images/search-icon-2.png"
                      alt=""
                      className="search-1Fldr-remove m-0 h-auto mw-100"
                    />
                  </figure>
                </span>
              </div>
            </div>
          </div>
        </div>
        {!loading && posts && posts.length == 0 && (
          <>
            <h5 className="text-center">
              <figure>
                <img
                  style={{ height: "400px" }}
                  className="mx-auto mb-2"
                  src="/assets/images/undraw_predictive_analytics_kf9n.svg"
                  alt="Not Found"
                />
              </figure>
              No discussion
            </h5>
          </>
        )}
        {posts && posts.length !== 0 && (
          <ul className="list-test list-test-student cn-pad-tst">
            {posts.map((post: any, post_id: number) => (
              <li key={post_id}>
                <div className="post-box post-box_new bg-white">
                  <div className="profile-box profile-box_new clearfix d-flex">
                    <figure>
                      <div className="profile-user">
                        <img
                          src={avatar(post.user, "sm")}
                          alt=""
                          className="user_img_circled"
                        />
                      </div>
                    </figure>
                    <div className="profile-info ml-2 p-0">
                      <div className="d-flex align-items-center">
                        <h4>{post.user.name}</h4>
                        {post.services && (
                          <div className="d-flex align-items-center">
                            {post.services.map(
                              (service: any, index: number) => (
                                <span
                                  key={index}
                                  className={`${service.type}_${service.duration}_${service.durationUnit} ml-1`}
                                ></span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <ul className="nav">
                        <li>
                          {post.user.role} - {post.updatedAt}
                        </li>
                        <span
                          className="material-icons dashboard-online-use-new"
                          hidden={!post.user.isOnline}
                        >
                          lens
                        </span>
                      </ul>
                      <p className="post_updatedat_date">
                        <span className="mr-4">{post.sectionTitle}</span>
                        <span className="mr-4">{post.contentTitle}</span>
                        {post.questionNumber && (
                          <span>Q. {post.questionNumber}</span>
                        )}
                      </p>
                    </div>
                    <div className="dropdown-edit-delete">
                      <div className="dropdown">
                        <a
                          href="#"
                          role="button"
                          id="discussion_dropdown-profile-box-btn"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                          aria-label="dropdown"
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
                          {post.flagged ? (
                            <li>
                              {user._id !== post.user._id && (
                                <a className="dropdown-item">
                                  <span style={{ marginRight: "5px" }}>
                                    <i className="fas fa-flag"></i>
                                  </span>
                                  Flagged
                                </a>
                              )}
                            </li>
                          ) : (
                            <li>
                              {user._id !== post.user._id && (
                                <a
                                  className="dropdown-item"
                                  onClick={() => addToFlagPost(post, post_id)}
                                >
                                  <span style={{ marginRight: "5px" }}>
                                    <i className="far fa-flag"></i>
                                  </span>
                                  Flag
                                </a>
                              )}
                            </li>
                          )}
                          <li>
                            <a
                              className="dropdown-item"
                              onClick={() => deletePost(post_id, post)}
                            >
                              <span className="delete"></span>Delete Discussion
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="post-box-content post-box-content_new mb-0">
                    <MathJax value={post.description} />
                  </div>

                  {post.attachments && post.attachments.length > 0 && (
                    <div>
                      {post.attachments.map((item: any, index: any) => (
                        <div
                          key={index}
                          className="special-info special-info_new"
                        >
                          {item.type === "document" && (
                            <a href={item.url} target="_blank">
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
                                    <h4 className="m-0 text-truncate width-560">
                                      {item.title}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            </a>
                          )}
                          {item.type === "link" && (
                            <a href={item.url} target="_blank">
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
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="like like_new px-0 pt-2 pb-0">
                    <ul className="nav">
                      {!voted(post) && (
                        <li onClick={() => vote(post_id, post)}>
                          <span className="like py-0 pr-0">
                            {post.vote && post.vote.length > 0
                              ? post.vote.length
                              : ""}{" "}
                            Like
                          </span>
                        </li>
                      )}
                      {voted(post) && (
                        <li onClick={() => vote(post_id, post)}>
                          <span className="dis-like">
                            {post.vote && post.vote.length > 0
                              ? post.vote.length
                              : ""}{" "}
                            Like
                          </span>
                        </li>
                      )}
                      <li>
                        {post.comments && post.comments.length > 0 ? (
                          <span className="comment">
                            {post.comments.length} Comment
                          </span>
                        ) : (
                          ""
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className="comment-form comment-form_new clearfix d-flex">
                    <div className="profile-comment-box-user">
                      <img
                        src={avatar(user.avatar, "sm")}
                        alt=""
                        className="user_img_circled"
                      />
                    </div>
                    <div className="w-100">
                      <div className="form-group mb-2">
                        <input
                          type="text"
                          className="form-control border-0 my-0"
                          value={comments[post._id]}
                          onChange={(e) => {
                            const commentsData = comments;
                            commentsData[post._id] = e.target.value;
                            setComments(commentsData);
                          }}
                          placeholder="Add a Comment"
                        />
                        <button
                          className="btn-icone"
                          aria-label="button-icone"
                          type="submit"
                          onClick={() => submitComment(post, post_id)}
                        >
                          <i className="far fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="user-comment user-comment_new p-0">
                    {post.comments.map((comment: any, com_id: any) => (
                      <div
                        key={com_id}
                        className="user-comment-box clearfix d-flex"
                      >
                        <figure className="user_img_circled_wrap">
                          <div className="comment-user">
                            <img
                              src={avatar(comment.user, "sm")}
                              alt="avatar"
                              className="user_img_circled"
                            />
                          </div>
                        </figure>
                        <div className="user-comment-info pl-0 mb-0">
                          <h4>{comment.user?.name}</h4>
                          <div className="post-box-content post-box-content_new mb-0 px-0">
                            {comment.edit ? (
                              <div>
                                <input
                                  type="text"
                                  defaultValue={comment.description}
                                  onChange={(e) => {
                                    setPosts((prev: any) => {
                                      const newArray = [...prev];
                                      newArray[post_id].comments[
                                        com_id
                                      ].description = e.target.value;
                                      return newArray;
                                    });
                                  }}
                                  className="form-control border-0 px-1 py-2"
                                />
                              </div>
                            ) : (
                              <p>{comment.description}</p>
                            )}
                          </div>
                          <ul className="nav mt-1">
                            <li
                              onClick={() =>
                                commentVote(post_id, com_id, comment)
                              }
                            >
                              {comment.vote && comment.vote.length > 0
                                ? comment.vote.length
                                : ""}{" "}
                              Like
                            </li>
                            {user._id === comment.user._id && (
                              <li>
                                {!comment.edit ? (
                                  <a
                                    className="text-primary"
                                    onClick={() => {
                                      setPosts((prev: any) => {
                                        const newArray = [...prev];
                                        newArray[post_id].comments[
                                          com_id
                                        ].edit = true;
                                        return newArray;
                                      });
                                    }}
                                  >
                                    Edit
                                  </a>
                                ) : (
                                  <a
                                    className="text-primary"
                                    onClick={() =>
                                      saveComment(comment, post_id, com_id)
                                    }
                                  >
                                    Save
                                  </a>
                                )}
                              </li>
                            )}
                            <li>
                              <a
                                className="text-danger"
                                onClick={() =>
                                  deletePost(post_id, comment, post)
                                }
                              >
                                Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                    {post.comments.length / 2 > post.commentPage && (
                      <div className="load-more mt-4 text-center p-0">
                        <a onClick={() => loadMoreComments(post)}>
                          Load more comments
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="text-center">
          <div className="d-inline-block">
            <PaginationComponent
              totalItems="totalPosts"
              itemsPerPage={params.limit}
              currentPage={params.page}
              onPageChange={onPageChanged}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDiscussionComponent;
