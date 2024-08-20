"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import _ from "lodash";
import { success } from "alertifyjs";
import { saveBlobFromResponse } from "@/lib/common";
import SVG from "@/components/svg";
import { Modal } from "react-bootstrap";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import moment from "moment";

const ProfileYourPosts = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [getClientData, setClientData]: any = useState();
  const [posts, setPosts] = useState([]);
  const [postDescription, setPostDescription] = useState<boolean>(false);
  const [voting, setVoting]: any = useState();
  const [fileToUpload, setFileToUpload]: any = useState();
  const [imageUrl, setImageURL]: any = useState();
  const [post, setPost]: any = useState();
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

  const getYourPosts = async () => {
    const p = {
      limit: 100,
      skip: 0,
      sort: "updatedAt,-1",
    };
    const { data } = await clientApi.get(
      `/api/discussions/yourPost/${toQueryString(p)}`
    );
    if (data) {
      setPosts(data.posts);
    }
  };

  const voted = (post: any) => {
    return post?.vote && post?.vote.indexOf(user._id) > -1;
  };

  const focusInput = (inputElement: any) => {
    inputElement.focus();
  };

  const removeChildItem = async (item: any, index: number) => {
    let removePost = { ...post };
    await removePost.attachments.splice(index, 1);
    setPost(removePost);
  };

  const vote = async (selectpost: any) => {
    if (voting) {
      return;
    }
    setVoting(true);
    if (!selectpost.vote) {
      selectpost.vote = [];
    }
    const idx = selectpost.vote.indexOf(user._id);
    if (idx > -1) {
      selectpost.vote.splice(idx, 1);
      await clientApi
        .put(`/api/discussions/unvote/${selectpost._id}`, {
          id: selectpost._id,
        })
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
      selectpost.vote.push(user._id);
      await clientApi
        .put(`/api/discussions/vote/${selectpost._id}`, { id: selectpost._id })
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
    if (uploadedFile) {
      if (!isImage) {
        let tpost = post.attachments;
        tpost.push({
          title: uploadedFile.fileName,
          url: uploadedFile.fileUrl,
          type: "document",
        });
        setPost((prev: any) => ({
          ...prev,
          attachments: tpost,
        }));
      } else {
        const element = '<img src="' + uploadedFile.fileUrl + '" />';
        setPost((prev: any) => ({
          ...prev,
          description: prev.description + element,
        }));
      }
      alertify.success("Successfully uploaded");
    } else {
      alertify.error("Upload Error");
    }
  };

  const saveDiscussion = () => {
    let attachments = [];
    if (post?.attachments) {
      attachments = post?.attachments;
    }
    if (
      (!post?.description || !post?.description.trim()) &&
      !attachments.length
    ) {
      return;
    }
    clientApi
      .put(`/api/discussions/${post?._id}`, {
        attachments: attachments,
        description: post?.description,
      })
      .then(
        async (data) => {
          if (post?.parent) {
            setPosts((prev: any) =>
              prev.map((p: any, index: number) =>
                index === post?.index
                  ? {
                      ...p,
                      comments: p.comments.map((c: any, idx: number) =>
                        idx === post?.cIndex ? { ...post, edit: false } : c
                      ),
                    }
                  : p
              )
            );
          } else {
            setPosts((prev: any) =>
              prev.map((p: any, index: number) =>
                p._id === post?._id ? post : p
              )
            );
          }
          alertify.success("Your post has changed.");
          cancel();
        },
        (err) => {
          alertify.alert("Message", "There is error saving your post");
        }
      );
  };

  const editPost = (selectedPost: any, index: any) => {
    setPostDescription(true);
    setPost(selectedPost);
  };

  const handleClose = () => {
    setPostDescription(false);
  };

  const deletePost = async (post: any) => {
    if (user._id !== post?.user._id) {
      return;
    }
    alertify
      .confirm("Are you Sure you want to delete ?", async (data: any) => {
        await clientApi.delete(`/api/discussions/${post?._id}`);
        success("Successfully Deleted");
        await getYourPosts();
      })
      .setHeader("Message");
  };

  const cancel = () => {
    setPostDescription(false);
    // setPost({})
    //modal hide
    getYourPosts();
  };

  const onPaste = (string: any) => {
    setPost((prev: any) => ({
      ...prev,
      description: string,
    }));
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const matches: any[] = [];

    string.replace(urlRegex, function (url: any) {
      if (matches.indexOf(url) == -1) {
        matches.push(url);
      }
    });
    if (matches.length > 0) {
      const url = matches[matches.length - 1];
      const params = {
        _id: user._id,
        url: url,
      };
      clientApi.get(`/users/link-preview`, params).then((res: any) => {
        const data = {
          type: "link",
          title: res.title,
          imageUrl: res.image,
          url: res.url,
          description: res.description,
        };
        setPost((prev: any) => ({
          ...post,
          attachments: [...prev.attachments, data],
          description: "",
        }));
      });
    }
  };

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    getClientDataFunc();
    getYourPosts();
  }, []);

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
          {posts.map((tpost: any, index: any) => {
            return (
              <div
                className="post-box post-box_new bg-white shadow-none break-avoid"
                key={index}
              >
                <div className="profile-box profile-box_new clearfix d-flex">
                  <figure className="profile-user">
                    <img
                      src={
                        tpost?.user?.avatar
                          ? "/assets/images/defaultProfile.png"
                          : tpost?.user?.avatar
                      }
                      alt=""
                      className="user_img_circled"
                    />
                  </figure>
                  <div className="profile-info ml-2">
                    <h4>{tpost?.user?.name}</h4>
                    <ul className="nav">
                      <li>{moment(tpost.updatedAt).format("MMM D, YYYY")}</li>
                    </ul>
                  </div>
                  <div className="dropdown-edit-delete">
                    <div className="dropdown">
                      <a
                        role="button"
                        id="dropdown-profile-box-btn"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <figure>
                          <img
                            src="/assets/images/carbon_overflow-menu-horizontal.png"
                            alt="this is dropdownmenu common post"
                          />
                        </figure>
                      </a>

                      <ul
                        className="dropdown-menu dropdown-menu-right py-0 border-0"
                        aria-labelledby="dropdown-profile-box-btn"
                      >
                        {user?._id == tpost?.user?._id && (
                          <li>
                            <a
                              className="dropdown-item"
                              onClick={() => editPost(tpost, index)}
                            >
                              <span className="edit">Edit Post</span>
                            </a>
                          </li>
                        )}
                        {user?._id == tpost?.user?._id && (
                          <li>
                            <a
                              className="dropdown-item"
                              onClick={() => deletePost(tpost)}
                            >
                              <span className=" delete"></span>Delete Post
                            </a>
                          </li>
                        )}
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
                        tpost?.description?.indexOf("/uploads") > -1
                          ? tpost?.description.replace(
                              /<img src="/g,
                              `<img src="https://www.practiz.xyz`
                            )
                          : tpost?.description,
                    }}
                  ></div>
                </div>
                {tpost?.attachments?.length > 0 && (
                  <div>
                    {tpost?.attachments?.map((item: any, index: any) => {
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

                                  <div className="col-9 pl-0">
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
                    {!voted(tpost) && (
                      <li onClick={() => vote(tpost)}>
                        <span className="like py-0 pr-0">
                          {" "}
                          {tpost?.vote?.length > 0
                            ? tpost?.vote?.length
                            : ""}{" "}
                          Like
                        </span>
                      </li>
                    )}
                    {voted(tpost) && (
                      <li onClick={() => vote(tpost)}>
                        <span className="dis-like">
                          {tpost?.vote?.length > 0 ? tpost?.vote?.length : ""}{" "}
                          Like
                        </span>
                      </li>
                    )}
                    <li>
                      <span className="comment">
                        {" "}
                        {tpost?.totalComments} Comments
                      </span>
                    </li>
                    {/* <li><span className="like py-0 pr-0"> {post?.vote?.length > 0 ? post?.vote?.length : ''} Like</span>
                    </li>


                    <li><span className="comment"> {post?.totalComments} Comments</span>
                    </li> */}
                  </ul>
                </div>
                {tpost && tpost?.comments?.length > 0 && (
                  <div className="user-comment user-comment_new p-0 border-top mt-2">
                    {tpost?.comments.map((comment: any, index: any) => {
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
                                  <li>
                                    {" "}
                                    {moment(new Date()).diff(
                                      moment(comment.updatedAt),
                                      "d"
                                    )}{" "}
                                    {moment(new Date()).diff(
                                      moment(comment.updatedAt),
                                      "d"
                                    ) > 1
                                      ? "days"
                                      : "day"}{" "}
                                    ago{" "}
                                  </li>
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
        (posts && posts.length == 0 && (
          <div className="empty-data">
            <SVG.EmptyPosts />
            <h3>No Post Found</h3>
          </div>
        ))}
      <Modal
        show={postDescription}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <Modal.Body>
          <div id="dashboardModal_4" aria-hidden="true">
            <div className="forgot-pass-modal">
              <div className="modal-content border-0">
                <div className="modal-body">
                  <div className="dashboard-area mx-auto">
                    <div className="post-box post-box_new bg-white shadow-none mb-0">
                      <div className="profile-box profile-box_new clearfix  d-flex">
                        <figure className="profile-user">
                          <img
                            src={post?.user}
                            alt=""
                            className="user_img_circled"
                          />
                        </figure>

                        <div className="profile-info ml-2">
                          <h4>{user.name}</h4>
                          <ul className="nav">
                            <li>{user.role}</li>
                          </ul>
                        </div>
                      </div>
                      <div className="post-box-content post-box-content_new mb-0">
                        <CKEditorCustomized
                          defaultValue={post?.description}
                          config={{
                            placeholder: "Start Posting",

                            toolbar: {
                              items: [],
                            },
                            mediaEmbed: { previewsInData: true },
                          }}
                          onChangeCon={onPaste}
                        />
                      </div>
                      {post?.attachments?.map((item: any, index: number) => (
                        <>
                          {item.type == "link" && (
                            <div
                              key={`attachment-item-${index}`}
                              className="special-info mb-0"
                            >
                              <div className="close-btn mr-2 remove-image-preview">
                                <a onClick={() => removeChildItem(item, index)}>
                                  <figure>
                                    <img
                                      src="/assets/images/ant-design_close-circle-outlined.png"
                                      alt=""
                                    />
                                  </figure>
                                </a>
                              </div>
                              <div className="row mx-0">
                                <div className="col-3 px-0">
                                  <figure>
                                    <img src={item.imageUrl} alt="" />
                                  </figure>
                                </div>
                                <div className="col-9 pr-2">
                                  <div className="inner">
                                    <div className="wrap">
                                      <h4>{item.title}</h4>
                                      <p>{item.description} </p>

                                      <span>{item.url}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {item.type == "document" && (
                            <div className="special-info mb-0">
                              <a className="px-4 mt-2">
                                <div className="row">
                                  <div className="col-2 px-0">
                                    <figure className="doc">
                                      <img
                                        src="/assets/images/img-doc.png"
                                        alt=""
                                      />
                                    </figure>
                                  </div>

                                  <div className="col-9 pl-0">
                                    <div className="inner">
                                      <h4 className="mt-2">{item.title}</h4>
                                    </div>
                                  </div>
                                  <div
                                    className="col-1 p-0 m-0 center"
                                    onClick={() => removeChildItem(item, index)}
                                  >
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
                              </a>
                            </div>
                          )}
                        </>
                      ))}
                    </div>
                    <div className="post-box bg-white mb-0">
                      <div className="button-group ml-auto d-flex align-items-center justify-content-end">
                        <a
                          className="btn btn-light document-btn mr-2"
                          onClick={() =>
                            document
                              .getElementById("yourPostFileUpload")
                              .click()
                          }
                        >
                          <span className="doc">Document</span>
                        </a>
                        <a
                          className="btn btn-light image-btn mr-2"
                          onClick={() =>
                            document
                              .getElementById("yourPostImageUpload")
                              .click()
                          }
                        >
                          {" "}
                          <span>Photo</span>
                        </a>
                        <a
                          onClick={() => cancel()}
                          className="btn btn-light mr-2"
                        >
                          Cancel
                        </a>
                        <a
                          className="btn btn-primary"
                          onClick={() => saveDiscussion()}
                        >
                          Save
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default ProfileYourPosts;
