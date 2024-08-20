"use client";

import React, { useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import { alert, success, set, confirm } from "alertifyjs";
import alertify from "alertifyjs";
import Link from "next/link";
import Svg from "@/components/svg";
import clientApi, { uploadFile } from "@/lib/clientApi";
import * as discussionService from "@/services/discussionService";
import { usePathname } from "next/navigation";
import { compileDiscussion } from "@/lib/helpers";
import { Modal } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { GlobalDate } from "@/components/GlobalDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fromNow, ucFirst } from "@/lib/pipe";
import moment from "moment";
import { FileUploader } from "react-drag-drop-files";
import { toQueryString } from "@/lib/validator";
import Mathjax from "@/components/assessment/mathjax";
import InfiniteScroll from "react-infinite-scroll-component";
const fileTypes = ["xls", "xlsx", "gzip", "zip", "doc", "docs"];

export default function Posts({ classroomId, settings }: any) {
  const [userInfo, setUserInfo]: any = useState();
  const [allpost, setAllPost] = useState<any>([]);
  const [fileToUpload, setFileToUpload]: any = useState();
  const [imageUrl, setImageURL]: any = useState();
  const [post, setPost]: any = useState();
  const [tpost, setTpost]: any = useState();
  const [submitted, setSubmitted]: any = useState(false);
  const [postContent, setPostContent]: any = useState("");
  const [voting, setVoting]: any = useState(false);
  const [comments, setComments]: any = useState(false);
  const [commentPost, setCommentPost]: any = useState(false);
  const [attachments, setAttachments]: any = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [documentModal, setDocumentModal] = useState(false);
  const [linkModal, setLinkModal] = useState<boolean>(false);
  const [editingComment, setEditingComment] = useState("");
  const [postId, setPostId] = useState("");
  const [docName, setDocName] = useState("");
  const imageUploadRef = useRef(null);
  const documentUploadRef = useRef(null);
  const [user, setUser] = useState<any>(useSession()?.data?.user?.info || {});
  const [loadingPost, setLoadingPost]: any = useState(false);
  const [nomoreItemToLoad, setNomoreItemToLoad]: any = useState(false);
  const [searchText, setSearchText] = useState<any>({
    token: "",
  });
  const [tags, setTags]: any = useState([]);
  const [loadMore, setLoadMore]: any = useState(0);
  const [sizeChanged, setSizeChanged]: any = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const path = usePathname();

  const scrollToEndWindow = () => {
    loadPosts(3, allpost.length);
  };

  const loadPosts = (count: number, skip: number) => {
    console.log("scroll");
    if (nomoreItemToLoad || loadingPost) {
      return;
    }
    setLoadingPost(true);
    postPaging(count, skip);
  };

  const postPaging = (count: number, skip: number) => {
    const param = {
      skip: 20,
      limit: count,
      sort: "updatedAt,-1",
      tags: null,
      text: "",
    };

    if (tags && tags.length > 0) {
      param.tags = tags.join("|");
    }

    if (searchText.token) {
      param.text = param.text
        ? param.text + "|" + searchText.token
        : searchText.token;
    }

    clientApi
      .get(`/api/discussions?limit=3&skip=${skip}&sort=updatedAt,-1`)
      .then((res: any[]) => {
        res.data.forEach((element) => {
          if (element && element.savedBy && element.savedBy.length > 0) {
            const index = element.savedBy.findIndex(
              (e) => e.toString() == user._id.toString()
            );
            if (index > -1) {
              element.isSaved = true;
            } else {
              element.isSaved = false;
            }
          }
        });
        successFunc(count, res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const successFunc = (count, posts) => {
    if (posts.length < count) {
      setNomoreItemToLoad(true);
      setHasMore(false);
    }

    posts.forEach((ps) => {
      setAllPost([...allpost, ps]);
    });
    setLoadingPost(false);

    if (loadMore > 0) {
      loadPosts(loadMore, posts.length);
      setLoadMore(0);
    }
    setSizeChanged(sizeChanged + 1);
  };

  const onFileSelected = async (
    files: FileList,
    target: any = undefined,
    isImage: any
  ) => {
    if (!files[0]) {
      return;
    }
    setFileToUpload(files[0]);
    // image preview
    const reader = new FileReader();
    reader.onload = (event: any) => {
      // setImageURL(event.target.result);
    };

    reader.readAsDataURL(files[0]);

    if (!isImage) {
      setDocName(files[0].name);
    }

    const uploadedFile = (
      await uploadFile(files[0], files[0].name, "discussions")
    ).data;

    if (uploadedFile?.fileUrl) {
      setImageURL(uploadedFile.fileUrl);
      const element = '<img src="' + uploadedFile.fileUrl + '" />';
      setPostContent(postContent + element);
    }
  };
  const cancel = () => {
    loadDiscussion();
    setPost(null);
    setTpost(null);
    setPostContent("");
    setAttachments([]);
    setPhotoModal(false);
    setDocumentModal(false);
    setLinkModal(false);
  };

  //file upload End
  const postDiscussion = async () => {
    if (!postContent && !attachments.length) {
      alert("Message", "Please add the description/attachments to the post !!");
      return;
    }
    // post.grade = _.pick(post.grade, "_id", "name");
    // post.classRooms = _.compact(post.classRooms);
    setSubmitted(true);
    let temp = compileDiscussion(postContent, true);

    try {
      let data: any;
      if (path === "/home") {
        const parameters = {
          description: temp,
          attachments: [],
          grade: {},
          classRooms: [],
        };
        data = // /api/discussions/classroom/${classroomId}
          (await clientApi.post("/api/discussions", parameters)).data;
      } else {
        let classrooms = [];
        classrooms.push({
          _id: classroomId,
          name: "",
        });
        data =
          // await clientApi.post(`/api/discussions/classroom/${classroomId}/submit`, { description: temp })
          (
            await clientApi.post("/api/discussions/submit", {
              description: temp,
              classRooms: classrooms,
            })
          ).data;
      }
      cancel();
      data.classRooms = [];
      await onNewPostAdded(data);
      success("Post submitted successfully.");
    } catch (err: any) {
      setSubmitted(false);
      window.scrollTo(0, 500);
      alert("Message", err.message);
    }finally{
      setSubmitted(false);
    }
  };

  const selectPhoto = (id: any) => {
    //@ts-ignore
    imageUploadRef.current.click();
  };

  const selectDoc = () => {
    documentUploadRef.current.click();
  };

  const onNewPostAdded = async (post: any) => {
    post.user = userInfo;
    await loadDiscussion();
    // this.serviceSvc.getTaggingServicesForStudents([this.user._id]).subscribe((serviceMap: any) => {
    //   if (serviceMap[this.user._id]) {
    //     post.services = serviceMap[this.user._id].services
    //   }
    // })

    // this.posts.unshift(post);
    // this.allpost.unshift(post);
    await setPostContent("");

    // this.post = {
    //   description: ""
    // };
  };

  const handleFileChange = (file: File) => {
    console.log(file);
    // setFile(URL.createObjectURL(file));
  };

  const deletePost = async (post: any, parent?: any) => {
    confirm("Are you Sure you want to delete?")
      .setHeader("Message")
      .setting({
        onok: async function () {
          if (userInfo._id !== post.user._id) {
            return;
          }

          const { data } = await clientApi.delete(
            `/api/discussions/${post._id}`
          );
          alertify.set("notifier", "position", "top-right");
          loadDiscussion();
          success("Successfully Deleted");
          if (parent) {
            const idx = parent.comments.indexOf(post);
            if (idx > -1) {
              parent.comments.splice(idx, 1);
            }
          } else {
            //@ts-ignore
            const idx = allpost.indexOf(post);
            if (idx > -1) {
              allpost.splice(idx, 1);
            }
          }
        },
      });
  };

  const loadMoreComments = (post: any) => {
    const tpage = post.commentPage + 1;
    const fil = { page: tpage };
    clientApi
      .get(`/api/discussions/comments/${post._id}${toQueryString(fil)}`)
      .then(async (comments: any) => {
        let tallpost = await allpost.map((p: any, index: number) =>
          p._id === post?._id
            ? {
                ...p,
                commentPage: tpage,
                comments: p.comments.concat(comments.data),
              }
            : p
        );
        setAllPost(tallpost);
      })
      .catch((err: any) => {
        console.log(err);
      });

    // this.discussionService
    //   .getComments(post._id, {
    //     page: post.commentPage,
    //   })
    //   .toPromise()
    //   .then(
    //     (comments: any) => {
    //       post.comments = post.comments.concat(comments);
    //       post.comments = post.comments.filter(
    //         (c, index, array) =>
    //           index ===
    //           array.findIndex(
    //             (findComment) => findComment._id.toString() === c._id.toString()
    //           )
    //       );
    //     },
    //     (err) => {
    //       console.log(err);
    //     }
    //   );
  };

  const hideAllComments = async (post: any) => {
    let tallpost = await allpost.map((p: any, index: number) =>
      p._id === post?._id
        ? {
            ...p,
            commentPage: 1,
            comments: post.comments.slice(0, 2),
          }
        : p
    );
    setAllPost(tallpost);
  };

  const openImageModel = (template: any) => {
    setPost({
      description: "",
      attachments: [],
    });
    // setModalRef(this.modalService.show(template, { class: "modal-medium" }));
  };

  const voted = (post: any) => {
    return post.vote && post.vote.indexOf(userInfo._id) > -1;
  };

  //edit post and comment start
  const editPost = (post: any, editTemp: any, index: any) => {
    setTpost({ ...post, index });
    setPost({ ...post, index });
    setPostContent(post.description);
  };

  const editComment = (post: any, pI: any, cI: any) => {
    // setPost({ ...post, index: pI });
    setPostId(post._id);
    setCommentPost({ ...post, index: pI, cIndex: cI });
    setPhotoModal(false);
    setTpost(post);
    setEditingComment(post.description);
  };

  const saveDiscussion = (epost = null) => {
    let attachments = [];
    if (tpost?.attachments) {
      attachments = tpost.attachments;
    }
    let p: any = {};
    if (commentPost) {
      p = { ...commentPost };
    } else {
      p = { ...tpost };
    }

    if ((!p.description || !p.description.trim()) && !attachments.length) {
      return;
    }
    setTpost(post);
    setPost(undefined);
    clientApi
      .put(`/api/discussions/${tpost?._id ? tpost._id : postId}`, {
        attachments: attachments,
        description: tpost?.description,
      })
      .then(
        () => {
          setTimeout(() => {
            if (tpost?.parent) {
              setAllPost(
                allpost.map((p, index) =>
                  p._id === tpost?.parent
                    ? {
                        ...p,
                        comments: p.comments.map((pc, idx) =>
                          pc._id === tpost._id
                            ? {
                                ...pc,
                                ...tpost,
                                edit: false,
                                updatedAt: new Date(),
                              }
                            : pc
                        ),
                      }
                    : p
                )
              );
            } else {
              setAllPost(
                allpost.map((p, index) => (p._id == epost._id ? epost : p))
              );
            }
            alertify.success("Your post has changed.");
            cancel();
          }, 200);
        },
        (err) => {
          alertify.alert("Message", "There is error saving your post");
        }
      );
  };

  const onEditComment = (comment: any) => {
    commentPost.description = comment.description;
    setCommentPost({ ...commentPost, description: comment.description });
    setPost(undefined);
    saveDiscussion();
  };

  const vote = async (onPost: any) => {
    if (voting) {
      return;
    }
    setVoting(true);
    let postvote = onPost;
    if (!postvote.vote) {
      postvote.vote = [];
    }

    const idx = postvote.vote.indexOf(userInfo._id);
    if (idx > -1) {
      postvote.vote.splice(idx, 1);
    } else {
      postvote.vote.push(userInfo._id);
    }

    let tallpost = await allpost.map((p: any, index: number) =>
      p._id === postvote?._id ? postvote : p
    );
    setAllPost(tallpost);
    setVoting(false);
  };

  const submitComment = (post: any, i: any) => {
    // e.preventDefault()
    if (!comments[post._id]) {
      return;
    }
    setSubmitted(true);
    const comment: any = {};
    clientApi
      .post(`/api/discussions/${post._id}`, comments[post._id])
      .then((res: any) => {
        alertify.success("Comment is posted successfully.");
        setComments({
          ...comments,
          [post._id]: { ...comments[post._id], description: "" },
        });
        loadDiscussion();
        setSubmitted(false);
      })
      .catch((err) => console.log(err));
  };

  const loadDiscussion = async () => {
    if (path === "/home") {
      const discussions = (
        await clientApi.get("/api/discussions?limit=5&skip=0&sort=updatedAt,-1")
      ).data;
      setAllPost(discussions);
    } else {
      const discussions = (
        await clientApi.get(
          `/api/discussions/classroom/${classroomId}?limit=8&skip=0&sort=updatedAt,-1`
        )
      ).data;

      setAllPost(discussions);
    }
  };

  const onPaste = (string: any) => {
    setPost((prev) => ({
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
        setPost((prev) => ({
          ...post,
          attachments: [...prev.attachments, data],
          description: "",
        }));
      });
    }
  };

  const flagPost = (post: any) => {
    clientApi.put(`/api/discussions/flag/${post._id}`, {}).then(
      async (d) => {
        await loadDiscussion();
        alertify.success("Successfully Flagged");
      },
      (err) => {
        alertify.alert(
          "Message",
          "Unable to flag this post. Please Try again later."
        );
      }
    );
  };

  const unflagPost = (post: any) => {
    clientApi.put(`/api/discussions/unflag/${post._id}`, {}).then(
      async (d) => {
        await loadDiscussion();
        alertify.success("Successfully Unflagged");
      },
      (err) => {
        alertify.alert(
          "Message",
          "Unable to unflag this post. Please Try again later."
        );
      }
    );
  };

  const savePost = (post: any) => {
    clientApi.put(`/api/discussions/savePost/${post._id}`, {}).then(
      async (d) => {
        await loadDiscussion();
        alertify.success("Successfully Saved");
      },
      (err) => {
        alertify.alert("Message", "Unable to Save");
      }
    );
  };

  const unsavePost = (post: any) => {
    clientApi.put(`/api/discussions/unsavedPost/${post._id}`, {}).then(
      async (d) => {
        await loadDiscussion();
        alertify.success("Successfully Unsaved");
      },
      (err) => {
        alertify.alert("Message", "Unable to unsave this post.");
      }
    );
  };

  const removeChildItem = async (item: any, index: number) => {
    let removePost = { ...post };
    await removePost.attachments.splice(index, 1);
    setPost(removePost);
  };

  const handleClose = () => {
    setPost(undefined);
  };

  useEffect(() => {
    async function fetchData() {
      const session = (await clientApi.get("/api/users/me")).data;
      setUser(session);
      setUserInfo(session);
      loadDiscussion();
    }
    fetchData();
    alertify.set("notifier", "position", "top-right");
  }, []);

  return (
    <>
      <div className="box-card-item dashboard-card-items bg-white share share_new mx-auto d-none d-lg-block">
        <div className="d-flex align-items-center">
          <div className="profile-box_new">
            <figure className="profile-user mb-0">
              <img
                src="/assets/images/defaultProfile.png"
                alt=""
                className="user_img_circled"
              />
            </figure>
          </div>

          <input
            value={postContent}
            type="text"
            className="form-control ml-2"
            style={{ border: "1px solid #ced4da", width: "90%" }}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Post a question or comment. Your post will be visible to everyone."
          />

          {/* <ckeditor [editor]="Editor" [(ngModel)]="post.description" name="post_description" [config]="ckeOptions" className="ml-2 w-100"></ckeditor> */}
        </div>

        <div className="row mt-3">
          <div className="col">
            <ul className="nav mt-0">
              <div className="form-group">
                <input
                  type="file"
                  ref={imageUploadRef}
                  onChange={(e: any) =>
                    onFileSelected(e.target.files, e.target, true)
                  }
                  hidden={true}
                  multiple={true}
                  accept="image/*"
                />
                <input
                  type="file"
                  ref={documentUploadRef}
                  hidden={true}
                  onChange={(e: any) =>
                    onFileSelected(e.target.files, e.target, false)
                  }
                  multiple={true}
                  accept=".doc, .docx,.txt,.pdf"
                />
              </div>

              {/* modal open */}
              <li>
                <a
                  onClick={() => {
                    setPhotoModal(true);
                  }}
                >
                  <span className="video">Photo</span>
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    setDocumentModal(true), setDocName("");
                  }}
                >
                  <span className="doc">Document</span>
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    setLinkModal(true);
                  }}
                >
                  <span className="link">Link</span>
                </a>{" "}
              </li>
            </ul>
          </div>
          <div className="col-auto ml-auto">
            <button className="btn btn-primary" disabled={submitted} onClick={() => postDiscussion()}>
              Post
            </button>
          </div>
        </div>
      </div>

      <InfiniteScroll
        dataLength={allpost.length}
        next={() => loadPosts(3, allpost.length)}
        hasMore={hasMore}
        loader={<></>}
      >
        {allpost.map((cpost: any, index: any) => {
          return (
            <div className="post-box post-box_new bg-white" key={cpost._id}>
              <div className="profile-box profile-box_new d-flex justify-content-between">
                <div className="d-flex">
                  <figure>
                    <div className="profile-user">
                      <img
                        src="/assets/images/defaultProfile.png"
                        alt=""
                        className="user_img_circled"
                      />
                    </div>
                  </figure>

                  <div className="profile-info ml-4 p-0">
                    <Link
                      href={
                        cpost.user
                          ? "/public/profile/" + cpost.user._id
                          : "/home"
                      }
                    >
                      <div className="d-flex align-items-center">
                        <h4>{cpost.user?.name}</h4>
                      </div>
                    </Link>
                    <ul className="nav">
                      <li>{cpost.user?.role} </li>
                      <span
                        className="material-icons dashboard-online-use-new"
                        hidden={!cpost.user?.isOnline}
                      >
                        lens
                      </span>
                      {cpost.classRooms && cpost.classRooms.length > 1 ? (
                        <li className="ml-1">
                          {" "}
                          | {cpost.classRooms[0]?.name}
                          <span> + {cpost.classRooms.length} more</span>
                        </li>
                      ) : (
                        <></>
                      )}
                    </ul>
                    <p className="post_updatedat_date">
                      {moment(cpost.updatedAt).format("MMM DD, YYYY")}(
                      {fromNow(cpost.updatedAt)})
                    </p>
                  </div>
                </div>
                {cpost.feedType == "reportedIssueResponse" ? (
                  <div className="text-success mr-5 btn btn-sm cursor-default">
                    Reported Question Response
                  </div>
                ) : (
                  <></>
                )}
                <div className="dropdown-edit-delete">
                  <div className="dropdown">
                    <a
                      role="button"
                      id="dropdown-profile-box-btn"
                      aria-label="p1"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
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
                      aria-label="p4"
                      aria-labelledby="dropdown-profile-box-btn1"
                    >
                      {userInfo?._id == cpost?.user?._id && (
                        <li onClick={() => editPost(cpost, null, index)}>
                          <a className="dropdown-item">
                            <span className="edit">Edit Post</span>
                          </a>
                        </li>
                      )}
                      {cpost.savedBy.includes(userInfo?._id) &&
                        userInfo?._id != cpost?.user?._id && (
                          <li onClick={() => unsavePost(cpost)}>
                            <a className="dropdown-item">
                              <span style={{ marginRight: 5 }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-floppy-fill"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z" />
                                  <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z" />
                                </svg>
                              </span>
                              Saved
                            </a>
                          </li>
                        )}
                      {!cpost.savedBy.includes(userInfo?._id) &&
                        userInfo?._id != cpost?.user?._id && (
                          <li onClick={() => savePost(cpost)}>
                            <a className="dropdown-item">
                              <span style={{ marginRight: 5 }}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-floppy"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M11 2H9v3h2z" />
                                  <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                                </svg>
                              </span>
                              Save
                            </a>
                          </li>
                        )}
                      {cpost.flagged && userInfo?._id != cpost?.user?._id && (
                        <li onClick={() => unflagPost(cpost)}>
                          <a className="dropdown-item">
                            <span style={{ marginRight: 5 }}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-flag-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001" />
                              </svg>
                            </span>
                            Flagged
                          </a>
                        </li>
                      )}
                      {!cpost.flagged && userInfo?._id != cpost?.user?._id && (
                        <li onClick={() => flagPost(cpost)}>
                          <a className="dropdown-item">
                            <span style={{ marginRight: 5 }}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-flag"
                                viewBox="0 0 16 16"
                              >
                                <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z" />
                              </svg>
                            </span>
                            Flag
                          </a>
                        </li>
                      )}
                      {userInfo?._id == cpost?.user?._id && (
                        <li onClick={() => deletePost(cpost)}>
                          <a className="dropdown-item">
                            <span className=" delete"></span>
                            Delete Post
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div
                className="post-box-content post-box-content_new mb-0"
                style={{
                  maxHeight: "250px",
                  overflowY: "scroll",
                  padding: "0px 10px 0px 0px !important",
                }}
              >
                {/* <p-discussion-viewer [content]="post.description">
                                          </p-discussion-viewer> */}
                <div
                  className="mathjax-container ck-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      cpost.description.indexOf("/uploads") > -1
                        ? cpost.description.replace(
                            /<img src="/g,
                            `<img src="https://www.practiz.xyz`
                          )
                        : cpost.description,
                  }}
                ></div>
              </div>

              {cpost.attachments?.length > 0 ? (
                <div>
                  {cpost.attachments.map((item: any) => {
                    return (
                      <div key={item._id}>
                        {item.type == "document" && (
                          <div className="special-info special-info_new">
                            <Link href={item.url ?? "/home"} target="_blank">
                              <div className="d-flex align-items-center">
                                <div className="col-auto pr-0 pl-0">
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
                                      className="m-0 text-truncate width-560"
                                      title={item.title}
                                    >
                                      {item.title}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}
                        {item.type == "image" && (
                          <div className="mb-0">
                            <Link
                              href={settings.baseUrl + item.url.substring(1)}
                              target="_blank"
                            >
                              <div className="d-flex align-items-center">
                                <div className="col-auto pr-0 post-box-content post-box-content_new mb-0">
                                  <figure
                                    style={{
                                      height: 400,
                                      width: 400,
                                    }}
                                  >
                                    <img
                                      src={
                                        settings.baseUrl + item.url.substring(1)
                                      }
                                      alt="image"
                                      style={{ height: "100%" }}
                                    />
                                  </figure>
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}
                        {item.type == "link" && (
                          <div className="special-info special-info_new mb-0">
                            <Link href={item.url ?? "/home"} target="_blank">
                              <div className="d-flex align-items-center">
                                <div className="col-1 pr-0">
                                  <figure>
                                    <img src={item.imageUrl} alt="" />
                                  </figure>
                                </div>

                                <div
                                  className={
                                    item.imageUrl ? "col-11" : "col-12"
                                  }
                                >
                                  <div className="inner">
                                    <div className="wrap">
                                      <h4>{item.title}</h4>
                                      <p>{item.description} </p>
                                      <span
                                        style={{
                                          overflowWrap: "anywhere",
                                        }}
                                      >
                                        {item.url}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <></>
              )}

              <div className="like like_new px-0 pt-2 pb-0">
                <ul className="nav">
                  {!voted(cpost) ? (
                    <li onClick={() => vote(cpost)}>
                      <span className="like py-0 pr-0">
                        {cpost?.vote?.length > 0 ? cpost?.vote?.length : " "}
                        {cpost.vote?.length == 1 ? " Like" : " Likes"}
                      </span>
                    </li>
                  ) : (
                    <li onClick={() => vote(cpost)}>
                      <span className="dis-like py-0 pr-0">
                        <i className="fas fa-heart"></i>
                        {cpost?.vote?.length > 0 ? cpost?.vote?.length : " "}
                        {cpost.vote?.length == 1 ? " Like" : " Likes"}
                      </span>
                    </li>
                  )}
                  {cpost?.comments && cpost?.totalComments ? (
                    <li>
                      <span className="comment">
                        {" "}
                        {cpost?.comments ? cpost?.totalComments : 0} Comments
                      </span>
                    </li>
                  ) : (
                    <></>
                  )}

                  {/* {post.comments && post.comments.length > 0 && (
                    <li>
                      <span className="comment" onClick={() => { }}>
                        {post?.totalComments} Comments
                      </span>
                    </li>
                  )} */}
                </ul>
              </div>
              <div className="comment-form comment-form_new clearfix d-flex">
                <figure>
                  <div className="profile-comment-box-user">
                    <img
                      src={
                        userInfo.avatar.sm
                          ? userInfo.avatar.sm
                          : "/assets/images/defaultProfile.png"
                      }
                      alt=""
                      className="user_img_circled"
                    />
                  </div>
                </figure>
                <div
                  // onSubmit={(e) => submitComment(e, post, index)}
                  className="w-100"
                >
                  <div className="form-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      disabled={submitted}
                      name="input_box_"
                      value={comments[cpost._id]?.description}
                      placeholder="Add a Comment"
                      onChange={(e: any) =>
                        setComments({
                          ...comments,
                          [cpost._id]: {
                            ...comments[cpost._id],
                            description: e.target.value,
                          },
                        })
                      }
                    />
                    <button
                      // type="submit"
                      className="btn-icone"
                      aria-label="post"
                      style={{ padding: "5px" }}
                      onClick={() => submitComment(cpost, index)}
                      disabled={submitted}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="#8d54e9"
                          d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="user-comment user-comment_new p-0">
                {cpost?.comments.map((comment: any, cI: any) => {
                  return (
                    <div
                      className="user-comment-box clearfix d-flex"
                      key={comment._id}
                    >
                      <figure className="user_img_circled_wrap">
                        <div className="comment-user">
                          <img
                            src={
                              comment?.user?.avatar.sm
                                ? comment?.user?.avatar.sm
                                : "/assets/images/defaultProfile.png"
                            }
                            alt={comment?.user?.name}
                            className="user_img_circled"
                          />
                        </div>
                      </figure>

                      <div className="user-comment-info pl-0 mb-0">
                        <div className="name-box-student">
                          <h4>{comment?.user?.name}</h4>
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
                              {comment.flagged ? (
                                <li onClick={() => unflagPost(post)}>
                                  {userInfo?._id != comment?.user?._id && (
                                    <a className="dropdown-item">
                                      <span
                                        style={{
                                          marginRight: 5,
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-flag-fill"
                                          viewBox="0 0 16 16"
                                        >
                                          <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001" />
                                        </svg>
                                      </span>
                                      Flagged
                                    </a>
                                  )}
                                </li>
                              ) : (
                                <li onClick={() => flagPost(post)}>
                                  {userInfo?._id != comment?.user?._id && (
                                    <a className="dropdown-item">
                                      <span
                                        style={{
                                          marginRight: 5,
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          fill="currentColor"
                                          className="bi bi-flag"
                                          viewBox="0 0 16 16"
                                        >
                                          <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z" />
                                        </svg>
                                      </span>
                                      Flag
                                    </a>
                                  )}
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                        <div className="post-box-content post-box-content_new mb-0 px-0">
                          <Mathjax value={comment.description} />
                          {comment.edit && (
                            <form>
                              <input
                                type="text"
                                className="form-control"
                                style={{
                                  border: "1px solid #ced4da",
                                  width: "90%",
                                }}
                                value={comment.description}
                                onChange={(e) => {
                                  setCommentPost({
                                    ...post,
                                    description: e.target.value,
                                  });
                                  let temp = allpost;
                                  temp[index].comments[cI].description =
                                    e.target.value;
                                  setAllPost([...temp]);
                                }}
                                placeholder="Post a question or comment. Your post will be visible to everyone."
                              />
                            </form>
                          )}
                        </div>
                        <div className="like like_new px-0 pt-2 pb-0 mlm">
                          <ul className="nav mt-1">
                            <li>
                              {!voted(comment) ? (
                                <span
                                  onClick={() => vote(comment)}
                                  className="like new-like-hart py-0 pr-0"
                                >
                                  <i className="fas fa-heart mt-0 pl-2"></i>
                                </span>
                              ) : (
                                <span
                                  onClick={() => vote(comment)}
                                  className="dis-like"
                                ></span>
                              )}
                            </li>

                            <li
                              className="likkes"
                              style={{ paddingLeft: "5px" }}
                            >
                              {comment.vote?.length > 0
                                ? comment.vote?.length
                                : 0}{" "}
                              {comment.vote?.length == 1 ? "Like" : "Likes"}
                            </li>
                            <li>
                              {userInfo?._id == comment?.user?._id &&
                                !comment.edit && (
                                  <a
                                    className="dashboard_edit_post"
                                    onClick={() => {
                                      comment.edit = true;
                                      editComment(comment, index, cI);
                                    }}
                                  >
                                    Edit
                                  </a>
                                )}
                              {userInfo?._id == comment?.user?._id &&
                                comment.edit && (
                                  <a
                                    className="dashboard_edit_post"
                                    onClick={() => onEditComment(comment)}
                                  >
                                    Save
                                  </a>
                                )}
                            </li>
                            <li>
                              {userInfo?._id == comment?.user?._id && (
                                <a
                                  className="dashboard_delete_post"
                                  onClick={() => deletePost(comment, post)}
                                >
                                  Delete
                                </a>
                              )}
                            </li>
                            <li>{fromNow(comment.updatedAt)} </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {cpost &&
                  cpost.totalComments / 2 > cpost.commentPage &&
                  cpost.totalComments > cpost.comments.length && (
                    <div className="load-more mt-4 text-center p-0">
                      <a onClick={() => loadMoreComments(cpost)}>
                        Load more comments
                      </a>
                    </div>
                  )}
                {cpost &&
                  cpost.totalComments / 2 <= cpost.commentPage &&
                  cpost.commentPage > 1 && (
                    <div className="load-more mt-4 text-center p-0">
                      <a onClick={() => hideAllComments(cpost)}>
                        Hide comments
                      </a>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </InfiniteScroll>
      {allpost.length === 0 && (
        <div className="empty-data">
          <div className="rounded-boxes">
            <Svg.NoDiscussion></Svg.NoDiscussion>
            <h3>Nothing to show in your discussion at the moment</h3>
          </div>
        </div>
      )}
      <Modal
        show={photoModal}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <Modal.Body>
          <div className="dashboard-area mx-auto">
            <div className="post-box bg-white mb-0">
              <div className="profile-box profile-box_new clearfix d-flex align-items-center p-0">
                <figure>
                  <div className="profile-user">
                    <img
                      src="/assets/images/defaultProfile.png"
                      alt=""
                      className="user_img_circled"
                    />
                  </div>
                </figure>

                <div className="profile-info ml-2 p-0">
                  <h4>{userInfo?.name}</h4>
                  <ul className="nav">
                    <li>{userInfo?.role}</li>
                  </ul>
                </div>
              </div>

              <div className="border-none mt-2 py-2">
                {/* <input
                  type="text"
                  className="form-control ml-2"
                  style={{ border: "1px solid #ced4da", width: "95%" }}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Post a question or comment. Your post will be visible to everyone."
                /> */}

                <CKEditorCustomized
                  defaultValue={postContent}
                  className="form-control ml-2"
                  style={{ border: "1px solid #ced4da", width: "90%" }}
                  config={{
                    placeholder:
                      "Post a question or comment. Your post will be visible to everyone.",

                    toolbar: {
                      items: [],
                    },
                    mediaEmbed: { previewsInData: true },
                  }}
                  onChangeCon={(e: any) => {
                    console.log(e);
                  }}
                />
              </div>
            </div>

            <div className="button-group ml-auto d-flex align-items-center justify-content-end">
              <button
                className="btn btn-light image-btn mr-2"
                onClick={() => selectPhoto("std_dash_discussionImageUpload")}
              >
                {" "}
                <span>Photo</span>
              </button>

              <button onClick={() => cancel()} className="btn btn-light mr-2">
                Cancel
              </button>
              <button className="btn btn-primary" disabled={submitted} onClick={() => postDiscussion()}>
                Post
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={documentModal}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <Modal.Body>
          <div className="dashboard-area mx-auto">
            <div className="post-box bg-white mb-0">
              <div className="profile-box profile-box_new clearfix d-flex align-items-center p-0">
                <figure>
                  <div className="profile-user">
                    <img
                      src="/assets/images/defaultProfile.png"
                      alt=""
                      className="user_img_circled"
                    />
                  </div>
                </figure>

                <div className="profile-info ml-2 p-0">
                  <h4>{userInfo?.name}</h4>
                  <ul className="nav">
                    <li>{userInfo?.role}</li>
                  </ul>
                </div>
              </div>

              <div className="border-none mt-2 py-2">
                {/* <CKEditorCustomized
                  defaultValue={postContent}
                  className="form-control ml-2"
                  style={{ border: "1px solid #ced4da", width: "90%" }}
                  config={{
                    placeholder: 'Post a question or comment. Your post will be visible to everyone.',

                    toolbar: {
                      items: []
                    },
                    mediaEmbed: { previewsInData: true }
                  }}
                  onChangeCon={(e: any) => { console.log(e) }}
                /> */}
                <input
                  type="text"
                  className="form-control ml-2"
                  style={{ border: "1px solid #ced4da", width: "95%" }}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Post a question or comment. Your post will be visible to everyone."
                />
              </div>
            </div>

            <div className="standard-upload-box">
              <div className="my-3">
                <div className=" d-flex  align-items-center justify-content-center">
                  {/* <h2 className="upload_icon">
                      {file ? (
                        <img
                          src={file}
                          alt="copy"
                          height={200}
                          style={{ height: 200 }}
                        />
                      ) : (
                        <span className="material-icons">file_copy</span>
                      )}
                    </h2> */}
                  <h2 className="upload_icon">
                    <span className="material-icons">file_copy</span>
                  </h2>
                </div>
                <p className="text-primary"></p>
                <span className="title">
                  Drag and Drop or{" "}
                  <a className="active text-primary" onClick={selectDoc}>
                    {docName == "" ? "Browse" : docName}
                  </a>{" "}
                  your files
                </span>
                <div className="text-center">
                  <a className="btn btn-secondary btn-sm">Upload</a>
                </div>
              </div>
            </div>

            <div className="button-group ml-auto d-flex align-items-center justify-content-end">
              {/* <a
                className="btn btn-light image-btn mr-2"
                onClick={() => selectPhoto("std_dash_discussionImageUpload")}
              >
                {" "}
                <span>Photo</span>
              </a> */}

              <button onClick={() => cancel()} className="btn btn-light mr-2">
                Cancel
              </button>
              <button className="btn btn-primary" disabled={submitted} onClick={() => postDiscussion()}>
                Post
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={linkModal}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <Modal.Body>
          <div className="dashboard-area mx-auto">
            <div className="post-box bg-white mb-0">
              <div className="profile-box profile-box_new clearfix d-flex align-items-center p-0">
                <figure>
                  <div className="profile-user">
                    <img
                      src="/assets/images/defaultProfile.png"
                      alt=""
                      className="user_img_circled"
                    />
                  </div>
                </figure>

                <div className="profile-info ml-2 p-0">
                  <h4>{userInfo?.name}</h4>
                  <ul className="nav">
                    <li>{userInfo?.role}</li>
                  </ul>
                </div>
              </div>

              <div className="border-none mt-2 py-2">
                <input
                  type="text"
                  className="form-control ml-2"
                  style={{ border: "1px solid #ced4da", width: "95%" }}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Paste your link here...."
                />
              </div>
            </div>

            <div className="button-group ml-auto d-flex align-items-center justify-content-end">
              {/* <a
                className="btn btn-light image-btn mr-2"
                onClick={() => selectPhoto("std_dash_discussionImageUpload")}
              >
                {" "}
                <span>Photo</span>
              </a> */}

              <button onClick={() => cancel()} className="btn btn-light mr-2">
                Cancel
              </button>
              <button className="btn btn-primary" disabled={submitted} onClick={() => postDiscussion()}>
                Post
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={!!post}
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
                        {/* <textarea
                          // type="text"
                          className="form-control ml-2"
                          style={{ border: "1px solid #ced4da", width: "90%" }}
                          value={postContent}
                          onChange={onPaste}
                        // dangerouslySetInnerHTML={{
                        //   __html:
                        //     postContent,
                        // }}
                        // placeholder="Start Posting"
                        /> */}

                        <CKEditorCustomized
                          defaultValue={postContent}
                          config={{
                            placeholder:
                              "Post a question or comment. Your post will be visible to everyone.",
                            toolbar: {
                              items: [],
                            },
                            mediaEmbed: { previewsInData: true },
                            height: 50,
                          }}
                          onChangeCon={onPaste}
                        />
                      </div>
                      {post?.attachments ? (
                        <>
                          {post?.attachments.map((item: any, index: number) => (
                            <>
                              {item.type == "link" && (
                                <div
                                  key={`attachment-item-${index}`}
                                  className="special-info mb-0"
                                >
                                  <div className="close-btn mr-2 remove-image-preview">
                                    <a
                                      onClick={() =>
                                        removeChildItem(item, index)
                                      }
                                    >
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
                                        onClick={() =>
                                          removeChildItem(item, index)
                                        }
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

                                  {/* <div className="close-btn mr-2">
                                <a onClick={() => removeChildItem(item, index)}>
                                  <figure>
                                    <img src="/assets/images/ant-design_close-circle-outlined.png" alt="" />
                                  </figure>
                                </a>
                              </div> */}
                                </div>
                              )}
                            </>
                          ))}
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="form-group" hidden>
                      <input
                        type="file"
                        id="yourPostImageUpload"
                        onChange={(e: any) =>
                          onFileSelected(e.target.files, true)
                        }
                        name="yourPostImageUpload"
                        multiple
                        accept="image/*"
                      />
                      <input
                        type="file"
                        id="yourPostFileUpload"
                        onChange={(e: any) =>
                          onFileSelected(e.target.files, false)
                        }
                        name="yourPostFileUpload"
                        multiple
                        accept=".doc, .docx,.txt,.pdf"
                      />
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
    </>
  );
}
