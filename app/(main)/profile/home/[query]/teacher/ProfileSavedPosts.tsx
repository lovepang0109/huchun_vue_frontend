"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi, { uploadFile, apiVersion } from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import _ from "lodash";
import { success } from "alertifyjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SVG from "@/components/svg";
import { faFlag, faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { GlobalDate } from "@/components/GlobalDate";

const ProfileSavedPosts = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [getClientData, setClientData]: any = useState();
  const [posts, setPosts] = useState([]);
  const [voting, setVoting]: any = useState();
  const [fileToUpload, setFileToUpload]: any = useState();
  const [imageUrl, setImageURL]: any = useState();
  const [post, setPost]: any = useState<any>();
  const linkPreview: any = {
    image: "",
    description: "",
    url: "",
    title: "",
  };

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  const getSavedPosts = async () => {
    const p = {
      limit: 100,
      skip: 0,
      sort: "updatedAt,-1",
    };
    const { data } = await clientApi.get(
      `/api/discussions/savedPost/${toQueryString(p)}`
    );
    if (data) {
      setPosts(data.posts);
    }
  };

  const voted = (post: any) => {
    return post.vote && post.vote.indexOf(user._id) > -1;
  };

  const focusInput = (inputElement: any) => {
    inputElement.focus();
  };

  const vote = async (post: any) => {
    if (voting) {
      return;
    }
    setVoting(true);
    if (!post.vote) {
      post.vote = [];
    }
    const idx = post.vote.indexOf(user._id);
    if (idx > -1) {
      post.vote.splice(idx, 1);
      await clientApi
        .put(`/api/discussions/unvote/${post._id}`, { id: post._id })
        .then(
          () => {},
          (err) => {
            console.log(err);
          }
        )
        .finally(() => {
          setVoting(false);
        });
    } else {
      post.vote.push(user._id);
      await clientApi
        .put(`/api/discussions/vote/${post._id}`, { id: post._id })
        .then(
          () => {},
          (err) => {
            console.log(err);
          }
        )
        .finally(() => {
          setVoting(false);
        });
    }
  };

  // const onFileSelected = (file: FileList, isImage: any) => {
  //   fileToUpload = file.item(0);
  //   // image preview
  //   const reader = new FileReader();
  //   reader.onload = (event: any) => {
  //     this.imageUrl = event.target.result;
  //   };
  //   reader.readAsDataURL(this.fileToUpload);
  //   ///  You could upload it like this:
  //   const formData: FormData = new FormData()
  //   formData.append('file', this.fileToUpload, this.fileToUpload.name)
  //   formData.append('uploadType', 'discussions')

  //   this.authService.uploadFile(formData)
  //     .subscribe((data: any) => {
  //       if (data) {
  //         if (!isImage) {
  //           this.post.attachments.push({
  //             title: data.fileName,
  //             url: data.fileUrl,
  //             type: 'document'
  //           });
  //         } else {
  //           const element = '<img src="' + data.fileUrl + '" />';
  //           this.post.description += element;
  //         }

  //       }
  //       // Sanitized logo returned from backend
  //     }, (err) => {
  //       console.log(err)
  //     })
  // }
  const onFileSelected = async (files: FileList, isImage: any) => {
    if (!files[0]) {
      return;
    }
    setFileToUpload(files[0]);
    // image preview
    const reader = new FileReader();
    reader.onload = (event: any) => {
      setImageURL(event.target.result);
    };

    reader.readAsDataURL(files[0]);

    const uploadedFile = (
      await uploadFile(files[0], files[0].name, "discussions")
    ).data;
    console.log("uploadedFile", uploadedFile);
  };

  const saveDiscussion = () => {
    let attachments = [];
    if (post.attachments) {
      attachments = post.attachments;
    }
    if (
      (!post.description || !post.description.trim()) &&
      !attachments.length
    ) {
      return;
    }
    // this.discussionService.editPost(this.post._id, { attachments: attachments, description: this.post.description }).subscribe(() => {
    //   setTimeout(() => {
    //     if (this.post.parent) {
    //       this.posts[this.post.index].comments[this.post.cIndex] = { ...this.post, edit: false }

    //     } else {
    //       this.posts[this.post.index] = { ...this.post }

    //     }
    //     alertify.success('Your post has changed.');
    //     this.cancel()
    //   }, 200)
    // }, (err) => {
    //   alertify.alert("Message",'There is error saving your post');
    // })
  };

  const editPost = (post: any, index: any) => {
    post = { ...post, index: index };
    // this.modalRef = this.modalService.show(editTemp);
  };

  // const deletePost = (post: any) {
  //   if (user._id !== post.user._id) {
  //     return;
  //   }
  //   alertify.confirm('Are you Sure you want to delete ?', (data: any) => {

  //     this.discussionService.delete(post._id).subscribe(data => {
  //       alertify.success('Successfully Deleted');
  //       const idx = this.posts.indexOf(post);
  //       if (idx > -1) {
  //         this.posts.splice(idx, 1);
  //       }
  //     }, (err) => {
  //       alertify.alert("Message",'Unable to Delete');
  //     });
  //   });

  // }

  // const deletePost = async (post: any) => {
  //   if (user._id !== post.user._id) {
  //     return;
  //   }
  //   alertify.confirm('Are you Sure you want to delete ?', async (data: any) => {
  //     await clientApi.delete(`/api/discussions/${post._id}`);
  //     success("Successfully Deleted");
  //     //@ts-ignore
  //     const idx = posts.indexOf(post);
  //     if (idx > -1) {
  //       posts.splice(idx, 1);
  //     }
  //   }).setHeader('Message');
  // };

  const removeChildItem = (item: any, index: any) => {
    post.attachments.splice(index, 1);
  };
  const cancel = () => {
    setPost({
      description: "",
      attachments: [],
    });
    //modal hide
  };

  useEffect(() => {
    getClientDataFunc();
    getSavedPosts();
  }, []);

  const removeSavedPost = async (post: any) => {
    alertify.set("notifier", "position", "top-right");
    clientApi
      .put(`/api/discussions/unsavedPost/${post._id}`, { id: post._id })
      .then(() => {
        alertify.success("Successfully Removed");
        getSavedPosts();
      })
      .catch(() => {
        alertify.alert("Message", "Unable to remove");
      });
  };

  return (
    <div>
      {posts.length > 0 && (
        <div className="classroom-wrap-remove column-2">
          <div className="form-group" hidden>
            <input
              type="file"
              id="yourPostImageUpload"
              onChange={(e: any) => onFileSelected(e.target.files, true)}
              name="yourPostImageUpload"
              multiple
              accept="image/*"
            />
            <input
              type="file"
              id="yourPostFileUpload"
              onChange={(e: any) => onFileSelected(e.target.files, false)}
              name="yourPostFileUpload"
              multiple
              accept=".doc, .docx,.txt,.pdf"
            />
          </div>
          {posts.map((post: any, index: any) => {
            return (
              <div
                className="post-box post-box_new bg-white  break-avoid"
                key={index}
              >
                <div className="profile-box profile-box_new d-flex justify-content-between">
                  <div className="d-flex align-items-center">
                    <figure className="profile-user">
                      <img
                        src={
                          post.user.avatar
                            ? "/assets/images/defaultProfile.png"
                            : post.user.avatar
                        }
                        alt=""
                        className="user_img_circled"
                      />
                    </figure>
                    <div className="profile-info ml-2">
                      <h4>{post?.user?.name}</h4>
                      <ul className="nav">
                        <li>
                          <GlobalDate date={post.updatedAt} />
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="dropdown show">
                      <a
                        role="button"
                        id="dropdown-profile-box-btn3"
                        aria-label="p1"
                        data-toggle="dropdown"
                      >
                        <figure>
                          <img
                            src="/assets/images/carbon_overflow-menu-horizontal.png"
                            alt=""
                          />
                        </figure>
                      </a>
                      <ul
                        aria-labelledby="dropdown-profile-box-btn4"
                        aria-label="p3"
                        className="dropdown-menu dropdown-menu-right py-0 border-0 "
                        x-placement="bottom-end"
                      >
                        <li className="mt-3">
                          <a
                            className="btn btn-light dropdown-item"
                            onClick={() => removeSavedPost(post)}
                          >
                            <FontAwesomeIcon
                              icon={faFloppyDisk}
                              className="mr-2"
                            />
                            Unsave
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="post-box-content post-box-content_new mb-0">
                  {/* <p-discussion-viewer [content]="post?.description">
                            </p-discussion-viewer> */}
                  <div
                    className="mathjax-container ck-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        post.description.indexOf("/uploads") > -1
                          ? post.description.replace(
                              /<img src="/g,
                              `<img src="https://www.practiz.xyz`
                            )
                          : post.description,
                    }}
                  ></div>
                </div>
                {post?.attachments?.length > 0 && (
                  <div>
                    {post?.attachments.map((item: any, index: any) => {
                      return (
                        <div key={index}>
                          {item.type == "document" && (
                            <div className="special-info">
                              <a href={item.url}>
                                <div className="row mx-0">
                                  <div className="col-2 px-0">
                                    <figure className="doc">
                                      <img
                                        src="/assets/images/img-doc.png"
                                        alt=""
                                      />
                                    </figure>
                                  </div>

                                  <div className="col-10 pl-0">
                                    <div className="inner">
                                      <h4 className="mt-2">{item.title}</h4>
                                    </div>
                                  </div>
                                </div>
                              </a>

                              <div className="close-btn">
                                <a>
                                  <figure>
                                    <img
                                      src="/assets/images/ant-design_close-circle-outlined.png"
                                      alt=""
                                    />
                                  </figure>
                                </a>
                              </div>
                            </div>
                          )}
                          {item.type == "link" && (
                            <div className="special-info special-info_new mb-0">
                              <a href={item.url} target="_blank">
                                <div className="row mx-0">
                                  {item.imageUrl && (
                                    <div className="col-1 px-0 d-flex align-items-center justify-content-end">
                                      <figure>
                                        <img src={item.imageUrl} alt="" />
                                      </figure>
                                    </div>
                                  )}

                                  <div
                                    className={
                                      item.imageUrl ? "col-11" : "col-12"
                                    }
                                  >
                                    <div className="inner">
                                      <div className="wrap">
                                        <h4>{item.title}</h4>
                                        <p>{item.description} </p>
                                        <span className="text-break">
                                          {item.url}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="like like_new px-0 pt-2 pb-0">
                  <ul className="nav">
                    {/* <li onClick={() => vote(post)}><span className={`like py-0 pr-0`}> {post?.vote?.length > 0 ? post?.vote?.length : ''} Like</span>
                    </li> */}
                    {!voted(post) && (
                      <li onClick={() => vote(post)}>
                        <span className="like py-0 pr-0">
                          {" "}
                          {post?.vote?.length > 0
                            ? post?.vote?.length
                            : ""}{" "}
                          Like
                        </span>
                      </li>
                    )}
                    {voted(post) && (
                      <li onClick={() => vote(post)}>
                        <span className="dis-like">
                          {post?.vote?.length > 0 ? post?.vote?.length : ""}{" "}
                          Like
                        </span>
                      </li>
                    )}

                    <li>
                      <span className="comment">
                        {" "}
                        {post?.totalComments} Comments
                      </span>
                    </li>
                  </ul>
                </div>
                {post && post?.comments?.length > 0 && (
                  <div className="user-comment user-comment_new p-0 border-top mt-2">
                    {post?.comments.map((comment: any, index: any) => {
                      return (
                        <div key={index}>
                          <div className="user-comment-box clearfix d-flex">
                            <figure className="user_img_circled_wrap">
                              <div className="comment-user">
                                <img
                                  src={comment.user}
                                  alt={comment?.user?.name}
                                  className="user_img_circled"
                                />
                              </div>
                            </figure>

                            <div className="user-comment-info pl-0 mb-0">
                              <div className="name-box-student">
                                <h4>{comment?.user?.name}</h4>
                              </div>
                              <div className="post-box-content post-box-content_new mb-0 px-0">
                                {/* <p-discussion-viewer [content]="comment.description">
                                                        </p-discussion-viewer> */}
                                <div
                                  className="mathjax-container ck-content"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      comment.description.indexOf("/uploads") >
                                      -1
                                        ? comment.description.replace(
                                            /<img src="/g,
                                            `<img src="https://www.practiz.xyz`
                                          )
                                        : comment.description,
                                  }}
                                ></div>
                              </div>
                              <div className="like like_new px-0 pt-2 pb-0 mlm">
                                <ul className="nav mt-1">
                                  {!voted(comment) && (
                                    <li>
                                      <span
                                        onClick={() => vote(comment)}
                                        className="like new-like-hart py-0 pr-0"
                                      >
                                        <i className="fas fa-heart mt-0 pl-2"></i>
                                      </span>
                                    </li>
                                  )}
                                  {voted(comment) && (
                                    <li>
                                      {" "}
                                      <span
                                        onClick={() => vote(comment)}
                                        className="dis-like"
                                      ></span>
                                    </li>
                                  )}
                                  <li className="likkes">
                                    {comment.vote?.length > 0
                                      ? comment.vote?.length
                                      : 0}{" "}
                                    {comment.vote?.length == 1
                                      ? "Like"
                                      : "Likes"}
                                  </li>
                                  <li>{comment.updatedAt}</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!posts ||
        (posts.length == 0 && (
          <div className="empty-data">
            <SVG.EmptyPosts />
            <h3>No Post Found</h3>
          </div>
        ))}
    </div>
  );
};
export default ProfileSavedPosts;
