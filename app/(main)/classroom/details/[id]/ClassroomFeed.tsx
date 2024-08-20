"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import * as alertify from "alertifyjs";

import Link from "next/link";
import moment from "moment";
import Posts from "@/app/(main)/home/Posts";
import PImageComponent from "@/components/AppImage";

import { toQueryString } from "@/lib/validator";
import { useRouter } from "next/navigation";
import * as userSevice from "@/services/userService";
import * as classroomService from "@/services/classroomService";
import * as chatSvc from "@/services/chatService";
import * as discussionService from "@/services/discussionService";
import * as authService from "@/services/auth";
import _ from "lodash";
import { compileDiscussion } from "@/lib/helpers";
import { replaceBadWords } from "@/lib/common";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DiscussionViewer from "@/components/DiscussionViewer";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { fromNow } from "@/lib/pipe";
import { Modal } from "react-bootstrap";
import { secondsToDateTime } from "@/lib/pipe";

const ClassroomFeed = ({
  course,
  classroom,
  setClassroom,
  getClientData,
  user,
}: any) => {
  const { id } = useParams();
  const { push } = useRouter();
  const input_box = useRef(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [leaderboardTopTime, setLeaderboardTopTime] = useState<any>(null);
  const [leaderboardTopAccu, setLeaderboardTopAccu] = useState<any>(null);
  const [post, setPost] = useState<any>({
    classRooms: [],
    description: "",
    attachments: [],
  });

  const [loadMore, setLoadMore] = useState<number>(0);
  const [linkPreview, setLinkPreview] = useState<any>({
    image: "",
    description: "",
    url: "",
    title: "",
  });
  const [fileToUpload, setFileToUpload] = useState<File>();
  const [imageUrl, setImageUrl] = useState<any>(null);
  const [nomoreItemToLoad, setNomoreItemToLoad] = useState<any>(null);
  const [ckeOptions, setCkeOptions] = useState<any>({
    placeholder: "Start Posting",
    toolbar: {
      items: [],
    },
    mediaEmbed: { previewsInData: true },
  });

  const [linkCkeOptions, setLinkCkeOptions] = useState<any>({
    placeholder: " Paste your link here...",

    toolbar: {
      items: [],
    },
  });
  const [enabledToolbar, setEnabledToolbar] = useState<boolean>(false);
  const [userOnlineStatus, setUserOnlineStatus] = useState<any>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [uploadImageTarget, setUploadImageTarget] = useState<any>(null);
  const [ckeOptionswithToolbar, setCkeOptionswithToolbar] = useState<any>({
    placeholder: "",
    simpleUpload: null,
  });
  const [searchText, setSearchText] = useState<any>({
    token: "",
  });
  const [expandedEditor, setExpandedEditor] = useState<any>({
    toolbar: {
      items: [],
    },
  });
  const [height, setHeight] = useState<any>(null);
  const [commentData, setCommentData] = useState<any>({
    post: {},
    text: "",
  });
  const [loadingPost, setLoadingPost] = useState<boolean>(false);
  const [showFullEditor, setShowFullEditor] = useState<boolean>(false);
  const [cmtTop, setCmtTop] = useState<string>(0 + "px");
  const [comments, setComments] = useState<any>({});
  const [allpost, setAllpost] = useState<any>([]);
  const [assignments, setAssignments] = useState<any>(null);
  const [scrollbarUpdater, setScrollbarUpdater] = useState<any>({
    caller: null,
  });
  const [limit, setLimit] = useState<number>(0);
  const [numPostToLoad, setNumPostToLoad] = useState<number>(8);
  const [currentDay, setCurrentDay] = useState<any>(new Date());
  const [week, setWeek] = useState<any>([]);
  const [assignmentsByWeek, setAssignmentsByWeek] = useState<any>([]);
  const [instructors, setInstructors] = useState<any>([]);
  const [sessionJoined, setSessionJoined] = useState<boolean>(false);
  const [session, setSession] = useState<any>({
    teacher: "",
    subject: "",
  });
  const [attachments, setAttachments] = useState<any>([]);
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [voting, setVoting] = useState<any>(null);
  const [discussionImageUpload, setDiscussionImageUpload] =
    useState<boolean>(false);
  const [imageTemplate, setImageTemplate] = useState<boolean>(false);
  const [documentTemplate, setDocumentTemplate] = useState<boolean>(false);
  const [questionTemplate, setQuestionTemplate] = useState<boolean>(false);
  const [linkTemplate, setLinkTemplate] = useState<boolean>(false);
  const [editPostTemplate, setEditPostTemplate] = useState<boolean>(false);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setCurrentDay(new Date());
    getWeekDays();
    setCkeOptionswithToolbar({
      placeholder: "Start Posting",
      simpleUpload: {
        // The URL that the images are uploaded to.
        uploadUrl: "/api/v1/files/discussionUpload?method=drop",

        // Enable the XMLHttpRequest.withCredentials property.
        withCredentials: true,

        // Headers sent along with the XMLHttpRequest to the upload server.
        headers: {
          "X-CSRF-TOKEN": "CSRF-Token",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    });

    setPost({
      ...post,
      classRooms: {
        ...post.classRooms,
        id,
      },
    });

    classroomService.leaderboard(id, { classroom: id }).then((ldb) => {
      setLeaderboard(ldb);
      const temp_leaderboardTopTime = ldb.slice().sort(function (a, b) {
        return a.averageTime - b.averageTime;
      });
      setLeaderboardTopTime(temp_leaderboardTopTime);
      const temp_leaderboardTopAccu = ldb.slice().sort(function (a, b) {
        return b.percentage - a.percentage;
      });
      setLeaderboardTopAccu(temp_leaderboardTopAccu);
    });

    setLoading(true);
    discussionService
      .getClassroomPosts(id, {
        limit: 8,
        skip: 0,
        sort: "createdAt,-1",
      })
      .then((allPosts: []) => {
        success(numPostToLoad, allPosts);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });

    if (
      user.primaryInstitute?.preferences.classroom.assignment &&
      classroom.assignments &&
      classroom.assignments.length > 0
    ) {
      getThisWeeksAssignments();
    }
  }, []);

  const onPaste = (data: any) => {
    setPost({ ...post, description: data });

    const string = data;
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const matches: any = [];

    string.replace(urlRegex, (url) => {
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
      userSevice.getLinkPreview(params).then((res: any) => {
        const data = {
          type: "link",
          title: res.title,
          imageUrl: res.image,
          url: res.url,
          description: res.description,
        };
        if (!post.attachments) {
          setPost({
            ...post,
            attachments: [],
          });
        }
        const index = post.attachments.findIndex((x) => x.url == data.url);
        // here you can check specific property for an object whether it exist in your array or not

        if (index === -1) {
          setPost({
            ...post,
            attachments: [...post.attachments, data],
            description: "",
          });
        }
      });
    }
  };

  const onFileSelected = (file: FileList, isImage: any) => {
    console.log(file, "file");
    setFileToUpload(file.item(0));
    // image preview
    const reader = new FileReader();
    reader.onload = (event: any) => {
      setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file.item(0));
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", file.item(0), file.item(0).name);
    formData.append("uploadType", "discussions");

    authService
      .uploadFile(formData)
      .then((data: any) => {
        if (data) {
          if (!isImage) {
            if (!post.attachments) {
              setPost({
                ...post,
                attachments: [],
              });
            }
            setPost({
              ...post,
              attachments: [
                ...post.attachments,
                {
                  title: data.fileName,
                  url: data.fileUrl,
                  type: "document",
                },
              ],
            });

            this.post.attachments.push({
              title: data.fileName,
              url: data.fileUrl,
              type: "document",
            });
            setAttachments([
              ...post.attachments,
              {
                title: data.fileName,
                url: data.fileUrl,
                type: "document",
              },
            ]);
          } else {
            if (uploadImageTarget) {
              if (uploadImageTarget.immediate) {
                setComments((prevComments) => ({
                  ...prevComments,
                  [uploadImageTarget.post._id]: `<img src="${data.fileUrl}" />`,
                }));
                submitComment(uploadImageTarget.post);
              } else {
                const element = '<img src="' + data.fileUrl + '" />';

                setPost({
                  ...post,
                  description: post.description + element,
                });
              }
            } else {
              const element = '<img src="' + data.fileUrl + '" />';
              setPost({
                ...post,
                description: post.description + element,
              });
            }
          }
        }
        // Sanitized logo returned from backend
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const scrollToEndWindow = () => {
    loadPosts(numPostToLoad, allpost.length);
  };

  const postDiscussion = () => {
    if (!post.description && !post.attachments.length) {
      alertify.alert(
        "Message",
        "Please add the description/attachments to the post!!"
      );
      return;
    }
    setPost({
      ...post,
      classRooms: [post.classRooms.id],
      description: compileDiscussion(post.description, true),
    });
    const tmp_post = {
      ...post,
      classRooms: [post.classRooms.id],
      description: compileDiscussion(post.description, true),
    };

    setSubmitted(true);

    discussionService
      .post(tmp_post)
      .then((data: any) => {
        cancel();
        setSubmitted(false);

        data.classRooms = [];

        onNewPostAdded(data);

        alertify.success("Post submitted successfully.");
      })
      .catch((err) => {
        // $scope.submitted = false;
        if (err) {
          window.scrollTo(0, 500);
          let msg = "";
          for (const i in err) {
            msg += err[i].msg + "<br>";
          }
          alertify.alert("Message ", msg);
        }
      });
    if (post.classRooms.length == 0) {
      setPost({
        ...post,
        classRooms: [...post.classRooms, id],
      });
    }
  };

  const onNewPostAdded = (pt: any) => {
    pt.user = user;
    pt.totalComments = 0;

    if (pt.description.length > 300) {
      setAllpost((prevAllpost) => [{ ...pt, readMore: true }, ...prevAllpost]);
    } else {
      setAllpost((prevAllpost) => [{ ...pt, readMore: false }, ...prevAllpost]);
    }
  };

  const submitComment = (post: any) => {
    if (!comments[post._id] || !comments[post._id].trim()) {
      return;
    }

    setSubmitted(true);
    const comment: any = {};
    comment.description = replaceBadWords(comments[post._id].trim());
    comment.classes = { ...post.classes };

    discussionService
      .comment(post._id, comment)
      .then((data: any) => {
        comment.description = " ";
        alertify.success("Comment is posted successfully.");
        data.user = { ...user };
        post.comments.push(data);
        post.totalComments = post.totalComments + 1;
        setComments({
          ...comments,
          [post._id]: "",
        });

        setCommentData({
          ...commentData,
          text: "",
          post: null,
        });
        setShowFullEditor(false);
        setExpandedEditor({
          ...expandedEditor,
          [post._id]: false,
        });
        setSubmitted(false);
      })
      .catch((err) => {
        if (err.error) {
          let msg = "";
          for (const i in err.error) {
            msg += err.error[i].msg + "<br>";
          }
          alertify.alert("Message ", msg);
        }
        setSubmitted(false);
      });
  };

  const loadMoreComments = (post: any) => {
    setPost({
      ...post,
      commentPage: post.commentPage + 1,
    });
    discussionService
      .getComments(post._id, {
        page: post.commentPage,
      })
      .then((comments: any) => {
        post.comments = post.comments.concat(comments);
        post.comments = post.comments.filter(
          (c, index, array) =>
            index ===
            array.findIndex(
              (findComment) => findComment._id.toString() === c._id.toString()
            )
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const hideAllComments = (post: any) => {
    post.commentPage = 1;
    post.comments = post.comments.slice(0, 2);
  };

  const loadPosts = (count: number, skip: any) => {
    if (nomoreItemToLoad || loadingPost) {
      return;
    }
    setLoadingPost(true);
    postPaging(count, skip);
  };

  const postPaging = (count: number, skip: any) => {
    const param = {
      skip: skip,
      limit: count,
      sort: "createdAt,-1",
      tags: null,
      text: "",
    };

    discussionService
      .getClassroomPosts(id, param)
      .then((data: any) => {
        success(count, data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const success = (count: any, posts: any) => {
    if (posts.length < count) {
      setNomoreItemToLoad(true);
    }
    const tmp_allpost = [];
    posts.forEach((ps) => {
      if (ps.savedBy) {
        ps.isSaved = !!ps.savedBy.find(
          (e) => e.toString() == user._id.toString()
        );
      }
      ps.user.isOnline = isUserOnline(ps.user);
      // const tmp_allpost = allpost;
      tmp_allpost.push({ ...ps, readMore: ps.description.length > 300 });
      setAllpost(tmp_allpost);
    });
    setLoadingPost(false);

    if (loadMore > 0) {
      loadPosts(loadMore, allpost.length);
      setLoadMore(0);
    }
  };

  const voted = (post: any) => {
    return post.vote && post.vote.indexOf(user._id) > -1;
  };

  const vote = (onPost: any) => {
    if (voting) {
      return;
    }
    setVoting(true);
    if (!onPost.vote) {
      onPost.vote = [];
    }
    const idx = onPost.vote.indexOf(user._id);
    if (idx > -1) {
      onPost.vote.splice(idx, 1);

      discussionService
        .unvotePost(onPost._id)
        .then(() => {})
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setVoting(false);
        });
    } else {
      onPost.vote.push(user._id);

      discussionService
        .votePost(onPost._id)
        .then(() => {})
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setVoting(false);
        });
    }
  };

  const deletePost = (pt: any, parent?: any) => {
    if (user._id !== pt.user._id) {
      return;
    }
    alertify.confirm("Are you Sure you want to delete ?", (data) => {
      discussionService
        .deleteFunc(pt._id)
        .then((data) => {
          alertify.success("Successfully Deleted");
          if (parent) {
            const idx = parent.comments.indexOf(pt);
            if (idx > -1) {
              const tmp_allpost = [...allpost]; // Create a shallow copy of allpost array

              // Find the post by parent._id and create a shallow copy of its comments array
              const postIndex = tmp_allpost.findIndex(
                (post) => post._id === parent._id
              );
              const post = tmp_allpost[postIndex];
              const comments = [...post.comments];

              comments.splice(idx, 1);

              const updatedPost = {
                ...post,
                comments: comments,
              };

              tmp_allpost[postIndex] = updatedPost;

              setAllpost(tmp_allpost);
            }
          } else {
            const idx = allpost.indexOf(pt);
            if (idx > -1) {
              const tmp_allpost = [...allpost];
              tmp_allpost.splice(idx, 1);
              setAllpost(tmp_allpost);
            }
          }
        })
        .catch((err) => {
          alertify.alert("Message", "Unable to Delete");
        });
    });
  };

  const savePost = (post: any) => {
    discussionService
      .savedPost(post._id)
      .then((res) => {
        post.isSaved = true;
        alertify.success("Successfully Saved");
      })
      .catch((err) => {
        post.isSaved = false;
        alertify.alert("Message", "Unable to Save");
      });
  };
  const unsavePost = (post: any) => {
    discussionService
      .unsavedPost(post._id)
      .then((res) => {
        post.isSaved = false;
        alertify.success("Successfully Unsaved");
      })
      .catch((err) => {
        post.isSaved = true;
        alertify.alert("Message", "Unable to unsave this post.");
      });
  };

  const openImageModel = (template: any) => {
    if (template === "imageTemplate") {
      setImageTemplate(true);
    }
    if (template === "documentTemplate") {
      setDocumentTemplate(true);
    }
    if (template === "questionTemplate") {
      setQuestionTemplate(true);
    }
    if (template === "linkTemplate") {
      setLinkTemplate(true);
    }

    // this.modalRef = this.modalService.show(template, { class: 'modal-medium' });
  };

  const cancel = () => {
    setPost({
      ...post,
      description: "",
      attachments: [],
      classRooms: [id],
    });

    // if (this.modalRef) {
    //   this.modalRef.hide()
    // }
    setDocumentTemplate(false);
    setImageTemplate(false);
    setQuestionTemplate(false);
    setLinkTemplate(false);
    setEditPostTemplate(false);

    setSession({
      teacher: "",
      subject: "",
    });
  };

  const enableToolbar = () => {
    setEnabledToolbar(true);
  };

  const isUserOnline = (user: any) => {
    if (!user) {
      return false;
    }

    if (!userOnlineStatus[user._id]) {
      if (user.asking) {
        return false;
      }
      user.asking = true;
      // Get user online status
      chatSvc.userOnline(user._id).then((isOnline) => {
        setUserOnlineStatus({
          ...userOnlineStatus,
          [user._id]: isOnline,
        });
        user.asking = false;
        return isOnline;
      });
    } else {
      return userOnlineStatus[user._id];
    }
  };
  const onUserLeft = (data: any) => {
    if (userOnlineStatus[data.user]) {
      setUserOnlineStatus({
        ...userOnlineStatus,
        [user._id]: false,
      });
    }
  };

  const selectPhoto = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.click();
    }
  };

  const expandText = (post: any) => {
    setTimeout(() => {
      // let the div colllapse first then we can calculate position correctly
      for (const i in expandedEditor) {
        setExpandedEditor({
          ...expandedEditor,
          [i]: false,
        });
        // jQuery('.comment-area').height('auto');
      }

      setTimeout(() => {
        const divComment = document.getElementById("c-" + post._id);
        if (divComment) {
          const parentArea = document.getElementById("post-area");
          let target = divComment;
          while (target.className !== "comment-area") {
            target = target.parentElement;
          }
          setHeight(target.clientHeight);
          setHeight(target.clientHeight + 100);
          const parentRect = parentArea.getBoundingClientRect();
          const elemRect = divComment.getBoundingClientRect();
          const topOffset = elemRect.top - parentRect.top;
          setCommentData({
            ...commentData,
            post: post,
          });
          if (comments[post._id] != undefined) {
            setCommentData({
              ...commentData,
              post: comments[post._id],
            });
          }
          setExpandedEditor({
            ...expandedEditor,
            [post._id]: true,
          });
          setShowFullEditor(true);
          // jQuery(target).height(this.height);
          setCmtTop(topOffset + "px");
        }
      }, 10);
    }, 20);
  };

  const editPost = (pt: any, editTemp: any, index: any) => {
    setPost({ ...pt, index: index });
    setEditPostTemplate(true);
    // this.modalRef = this.modalService.show(editTemp);
  };

  const editComment = (pt: any, pI: any, cI: any) => {
    console.log({ ...pt, index: pI, cIndex: cI }, "edit post");
    setPost({ ...pt, index: pI, cIndex: cI });
  };

  const onEditComment = (commnet: any, pI: any, cI: any) => {
    setPost({
      ...commnet,
      index: pI,
      cIndex: cI,
      description: commnet.description,
    });
    const pt = {
      ...commnet,
      index: pI,
      cIndex: cI,
      description: commnet.description,
    };
    saveDiscussion(pt);
  };

  const saveDiscussion = (pt?: any) => {
    if (!pt) {
      pt = post;
    }
    let attachments = [];
    if (pt.attachments) {
      attachments = pt.attachments;
    }
    if ((!pt.description || !pt.description.trim()) && !attachments.length) {
      return;
    }
    discussionService
      .editPost(pt._id, {
        attachments: attachments,
        description: pt.description,
        pin: pt.pin,
      })
      .then(() => {
        setTimeout(() => {
          if (pt.parent) {
            console.log(pt.index, "check commenctes");
            const updatedComment = {
              ...allpost[pt.index].comments[pt.cIndex],
              edit: false,
              updatedAt: new Date(),
            };

            const updatedComments = [...allpost[pt.index].comments];
            updatedComments[pt.cIndex] = updatedComment;

            const updatedPost = {
              ...allpost[pt.index],
              comments: updatedComments,
            };

            const updatedAllPost = [...allpost];
            updatedAllPost[pt.index] = updatedPost;

            setAllpost(updatedAllPost);
          } else {
            const updatedPosts = [...allpost];
            updatedPosts[post.index] = { ...pt };
            setAllpost(updatedPosts);
          }
          alertify.success("Your post has changed.");
          cancel();
        }, 200);
      })
      .catch((err) => {
        alertify.alert("Message", "There is error saving your post");
      });
  };

  const removeChildItem = (item: any, index: string) => {
    const updated_post = post;
    updated_post.attachments.splice(index, 1);
    setPost(updated_post);
  };

  const goToCourse = () => {
    push(`/course/details/${course["_id"]}`);
  };

  const getWeekDays = () => {
    const current = new Date();
    setWeek([]);
    // Starting Monday not Sunday
    current.setDate(current.getDate() - current.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const updated_week = week;
      updated_week.push(new Date(current));
      setWeek(updated_week);
      current.setDate(current.getDate() + 1);
    }
  };

  const getThisWeeksAssignments = () => {
    setAssignmentsByWeek(
      classroom?.assignments.filter(
        (d) =>
          new Date(d.dueDate).getTime() >= week[0].getTime() &&
          new Date(d.dueDate).getTime() <= week[week.length - 1].getTime()
      )
    );
  };

  const futureAssignments = () => {
    setCurrentDay(new Date());
    const current = week[week.length - 1];
    setWeek([]);
    current.setDate(current.getDate() - current.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const updated_week = week;
      updated_week.push(new Date(current));
      setWeek(updated_week);
      current.setDate(current.getDate() + 1);
    }
    setAssignmentsByWeek(
      classroom?.assignments.filter(
        (d) =>
          new Date(d.dueDate).getTime() >= week[0].getTime() &&
          new Date(d.dueDate).getTime() <= week[week.length - 1].getTime()
      )
    );
  };

  const pastAssignments = () => {
    setCurrentDay(new Date());
    const current = week[0];
    setWeek([]);

    current.setDate(current.getDate() - current.getDay() - 6);
    for (let i = 7; i > 0; i--) {
      const updated_week = week;
      updated_week.push(new Date(current));
      setWeek(updated_week);
      current.setDate(current.getDate() + 1);
    }
    setAssignmentsByWeek(
      classroom?.assignments.filter(
        (d) =>
          new Date(d.dueDate).getTime() >= week[0].getTime() &&
          new Date(d.dueDate).getTime() <= week[week.length - 1].getTime()
      )
    );
  };

  const flagPost = (post: any) => {
    discussionService
      .flag(post._id)
      .then((d) => {
        post.flagged = true;
        alertify.success("Successfully Flagged");
      })
      .catch((err) => {
        alertify.alert(
          "Message",
          "Unable to flag this post. Please Try again later."
        );
      });
  };

  const unflagPost = (post: any) => {
    discussionService
      .unflag(post._id)
      .then((d) => {
        post.flagged = false;
        alertify.success("Successfully Unflagged");
      })
      .catch((err) => {
        alertify.alert(
          "Message",
          "Unable to unflag this post. Please Try again later."
        );
      });
  };

  const joinSession = () => {
    classroomService
      .joinSession(id)
      .then((res: any) => {
        if (res && res.url) {
          window.open(res.url, "_blank");
          setClassroom({
            ...classroom,
            sessionJoined: true,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const startSession = (form: any) => {
    classroomService
      .startWbSession({ room: id, ...form.value })
      .then((res: any) => {
        if (res && res.url) {
          window.open(res.url, "_blank");
          setClassroom({
            ...classroom,
            sessionJoined: true,
          });
          cancel();
        }
      })
      .catch((err) => {
        console.log(err.error);
        alertify.alert("Message", err.error.error);
      });
  };

  return (
    <>
      <div className="row">
        <div className="col-sm-9">
          <div className="d-none d-lg-block">
            <div className="class-board bg-white">
              <div className="square_profile_info d-flex align-items-center">
                <div className="squared-rounded_wrap_80">
                  <PImageComponent
                    height={80}
                    fullWidth
                    imageUrl={classroom.imageUrl}
                    backgroundColor={classroom.colorCode}
                    text={classroom.name}
                    radius={9}
                    fontSize={8}
                    type="classroom"
                  />
                </div>

                <div className="class-board-info assignment-top-detail ml-2">
                  <h3 className="top-title text-truncate">{classroom.name}</h3>
                  {course && (
                    <>
                      <h2 className="profile_user_info">
                        Course: {course.title}
                      </h2>
                      {course.expiresOn ? (
                        <span className="profile_user_info">
                          Expires on{" "}
                          {new Date(course.expiresOn).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                      ) : (
                        <span className="profile_user_info">Ongoing</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="box-card-item dashboard-card-items bg-white share share_new mx-auto border-none">
            <form className="d-flex">
              <figure className="user_img_circled_wrap mb-0">
                <img
                  src={`${user?.avatar}`}
                  alt=""
                  className="user_img_circled"
                />
              </figure>

              <div className="info py-0 ml-2 w-100">
                <div className="form-group mb-0">
                  <CKEditorCustomized
                    defaultValue={post.description}
                    onChangeCon={(data) => {
                      onPaste(data);
                    }}
                    config={{
                      placeholder: "Start Posting",
                    }}
                  />
                </div>
              </div>
            </form>
            <div className="row">
              <div className="col-md col-12">
                <ul className="nav">
                  <div className="form-group" hidden>
                    <input
                      type="file"
                      id="teach_feed_discussionImageUpload"
                      onChange={(event) =>
                        onFileSelected(event.target.files, true)
                      }
                      multiple
                      accept="image/*"
                    />
                    <input
                      type="file"
                      id="teach_feed_discussionFileUpload"
                      onChange={(event) =>
                        onFileSelected(event.target.files, false)
                      }
                      multiple
                      accept=".doc, .docx,.txt,.pdf"
                    />
                  </div>
                  <li>
                    <a onClick={() => openImageModel("imageTemplate")}>
                      <span className="video">Image</span>
                    </a>
                  </li>
                  <li>
                    <a onClick={() => openImageModel("documentTemplate")}>
                      <span className="doc">Document</span>
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        openImageModel("questionTemplate");
                        enableToolbar();
                      }}
                    >
                      <span className="ques">Question</span>
                    </a>
                  </li>
                  <li>
                    <a onClick={() => openImageModel("linkTemplate")}>
                      <span className="link">Link</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-auto ml-auto">
                <ul>
                  <li className="mr-0 post_btn">
                    <a onClick={() => postDiscussion()} className="text-center">
                      Post
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {!loading ? (
            <div>
              {allpost && allpost.length > 0 && (
                <div
                  infiniteScroll
                  infiniteScrollDistance={1}
                  infiniteScrollThrottle={150}
                  scrolled={scrollToEndWindow}
                  scrollWindow={true}
                >
                  {allpost.map((pst, i) => (
                    <div
                      className="post-box post-box_new bg-white"
                      key={pst._id}
                    >
                      <div className="profile-box profile-box_new d-flex justify-content-between">
                        <div className="d-flex">
                          <figure
                            className="user_img_circled_wrap cursor-pointer"
                            onClick={() =>
                              push(`/public/profile/${pst.user._id}`)
                            }
                          >
                            <div className="profile-user">
                              <img
                                src={`${pst.user?.avatar}`}
                                alt="this user post avatar"
                                className="user_img_circled"
                              />
                            </div>
                          </figure>

                          <div className="profile-info ml-2 p-0">
                            <a
                              className="cursor-pointer"
                              href={`/public/profile/${pst.user._id}`}
                            >
                              <h4>
                                {pst.user?.name}
                                <span className="status">
                                  <span
                                    className={`active ${
                                      pst.user.isOnline ? "active" : ""
                                    }`}
                                  ></span>
                                </span>
                              </h4>
                            </a>
                            <ul className="nav">
                              <li>
                                {new Date(pst.updatedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div
                          className={
                            post.feedType === "reportedIssueResponse"
                              ? "text-success mr-5 btn btn-sm cursor-default"
                              : "d-none"
                          }
                        >
                          Reported Question Response
                        </div>
                        <div className="dropdown-edit-delete">
                          <div className="dropdown">
                            <a
                              role="button"
                              id={`dropdown-profile-box-btn${i}`}
                              aria-label="dropdown for teacher classroom feed "
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
                              aria-labelledby={`dropdown-profile-box-btn${i}`}
                            >
                              <li>
                                <a
                                  className="dropdown-item"
                                  onClick={() =>
                                    editPost(pst, "editPostTemplate", i)
                                  }
                                >
                                  <span className="edit">Edit Post</span>
                                </a>
                              </li>
                              <li
                                className={
                                  pst.isSaved && user?._id !== pst.user._id
                                    ? ""
                                    : "d-none"
                                }
                              >
                                <a
                                  className="dropdown-item"
                                  onClick={() => unsavePost(pst)}
                                >
                                  <span style={{ marginRight: "5px" }}>
                                    <i className="fas fa-save"></i>
                                  </span>
                                  Saved
                                </a>
                              </li>
                              <li
                                className={
                                  !pst.isSaved && user?._id !== pst.user._id
                                    ? ""
                                    : "d-none"
                                }
                              >
                                <a
                                  className="dropdown-item"
                                  onClick={() => savePost(pst)}
                                >
                                  <span style={{ marginRight: "5px" }}>
                                    <i className="fas fa-save"></i>
                                  </span>
                                  Save
                                </a>
                              </li>
                              <li
                                className={
                                  pst.flagged && user?._id !== pst.user?._id
                                    ? ""
                                    : "d-none"
                                }
                              >
                                <a
                                  className="dropdown-item"
                                  onClick={() => unflagPost(pst)}
                                >
                                  <span style={{ marginRight: "5px" }}>
                                    <i className="fas fa-flag"></i>
                                  </span>
                                  Flagged
                                </a>
                              </li>
                              <li
                                className={
                                  !pst.flagged && user?._id !== pst.user?._id
                                    ? ""
                                    : "d-none"
                                }
                              >
                                <a
                                  className="dropdown-item"
                                  onClick={() => flagPost(pst)}
                                >
                                  <span style={{ marginRight: "5px" }}>
                                    <i className="far fa-flag"></i>
                                  </span>
                                  Flag
                                </a>
                              </li>
                              <li>
                                <a
                                  className="dropdown-item"
                                  onClick={() => deletePost(pst)}
                                >
                                  <span className="delete"></span>Delete Post
                                </a>
                              </li>
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
                        <DiscussionViewer
                          content={pst.description}
                          className="post-Discussion_nEw"
                        />
                      </div>
                      {pst?.attachments?.length > 0 &&
                        pst.attachments.map((item, index) => (
                          <div
                            key={index}
                            className="special-info"
                            style={{ marginBottom: "0" }}
                          >
                            {item.type === "document" && (
                              <a href={item.url} target="_blank">
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
                                      <h6 className="mt-2">{item.title}</h6>
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
                                      <img src={item.url} alt="" />
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
                            {item.type === "image" && (
                              <a
                                aria-label="user uploaded file in teacher feed"
                                href={getClientData?.baseUrl + item.url}
                                target="_blank"
                              >
                                <div className="row mx-0">
                                  <div className="col-3 px-0">
                                    <figure
                                      style={{
                                        height: "400px",
                                        width: "400px",
                                      }}
                                    >
                                      <img
                                        src={item.imageUrl}
                                        alt="user uploaded file"
                                        height="100%"
                                      />
                                    </figure>
                                  </div>
                                </div>
                              </a>
                            )}
                          </div>
                        ))}
                      <div className="like like_new px-0 pt-2 pb-0">
                        <ul className="nav">
                          {!voted(pst) && (
                            <li onClick={() => vote(pst)}>
                              <span className="like py-0 pr-0">
                                {pst?.vote?.length > 0 ? pst?.vote?.length : 0}
                                {pst.vote?.length === 1 ? "Like" : "Likes"}
                              </span>
                            </li>
                          )}
                          {voted(pst) && (
                            <li onClick={() => vote(pst)}>
                              <span className="dis-like">
                                {pst?.vote?.length > 0 ? pst?.vote?.length : 0}
                                {pst.vote?.length === 1 ? "Like" : "Likes"}
                              </span>
                            </li>
                          )}
                          <li>
                            <span
                              className="comment"
                              // onClick={() => focusInput(input_box)}
                            >
                              {pst?.totalComments} Comments
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="comment-form comment-form_new clearfix d-flex">
                        <figure className="user_img_circled_wrap">
                          <div className="profile-user">
                            <img
                              src={`${user?.avatar}`}
                              alt="this user profile of post in feed"
                              className="user_img_circled"
                            />
                          </div>
                        </figure>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            submitComment(pst);
                          }}
                          hidden={expandedEditor[pst._id]}
                        >
                          <div className="form-group">
                            <input
                              type="text"
                              className="form-control"
                              value={comments[pst._id]}
                              onChange={(event) =>
                                setComments({
                                  ...comments,
                                  [pst._id]: event.target.value,
                                })
                              }
                              disabled={submitted}
                              ref={(input) => (input_box.current = input)}
                              name={`input_box_${i}`}
                              placeholder="Add a Comment"
                            />
                            <button
                              // type="submit"
                              className="btn-icone"
                              aria-label="post button for teacher Feed in classroom"
                            >
                              <i className="far fa-paper-plane"></i>
                            </button>
                          </div>
                        </form>
                      </div>
                      <div className="user-comment user-comment_new p-0">
                        {pst?.comments.map((comment, cI) => (
                          <div
                            key={cI}
                            className="user-comment-box clearfix d-flex"
                          >
                            <figure className="user_img_circled_wrap">
                              <div className="comment-user">
                                <img
                                  src={`${comment.user?.avatar}`}
                                  alt={comment.user.name}
                                  className="user_img_circled"
                                />
                              </div>
                            </figure>

                            <div className="user-comment-info pl-0">
                              <h4>{comment.user.name}</h4>
                              <div className="post-box-content post-box-content_new mb-0">
                                {!comment.edit ? (
                                  <DiscussionViewer
                                    content={comment.description}
                                  />
                                ) : (
                                  <form>
                                    <CKEditorCustomized
                                      defaultValue={comment.description}
                                      className="form-control ml-2"
                                      onChangeCon={(data) => {
                                        const newComments = [
                                          ...allpost[i].comments,
                                        ];
                                        newComments[cI].description = data;
                                        setAllpost((prevAllpost) => [
                                          ...prevAllpost.slice(0, i),
                                          {
                                            ...prevAllpost[i],
                                            comments: newComments,
                                          },
                                          ...prevAllpost.slice(i + 1),
                                        ]);
                                      }}
                                      config={ckeOptions}
                                    />
                                  </form>
                                )}
                              </div>

                              <div className="like like_new px-0 pt-1 pb-0 mlm">
                                <ul className="nav mt-0">
                                  <li>
                                    {!voted(comment) && (
                                      <span
                                        onClick={() => vote(comment)}
                                        className="like new-like-hart py-0 pr-0"
                                      >
                                        <i className="fas fa-heart text-danger mt-0 pl-2"></i>
                                      </span>
                                    )}
                                  </li>
                                  <li>
                                    {voted(comment) && (
                                      <span
                                        onClick={() => vote(comment)}
                                        className="dis-like"
                                      ></span>
                                    )}
                                  </li>
                                  <li className="likkes">
                                    {comment.vote?.length > 0
                                      ? comment.vote?.length
                                      : 0}{" "}
                                    {comment.vote?.length === 1
                                      ? "Like"
                                      : "Likes"}
                                  </li>
                                  <li>
                                    {user._id === comment.user?._id &&
                                      !comment.edit && (
                                        <a
                                          style={{ color: "#007bff" }}
                                          onClick={() => {
                                            const newComments = [
                                              ...allpost[i].comments,
                                            ];
                                            newComments[cI].edit = true;
                                            setAllpost((prevAllpost) => [
                                              ...prevAllpost.slice(0, i),
                                              {
                                                ...prevAllpost[i],
                                                comments: newComments,
                                              },
                                              ...prevAllpost.slice(i + 1),
                                            ]);
                                            editComment(comment, i, cI);
                                          }}
                                        >
                                          Edit
                                        </a>
                                      )}
                                    {user._id === comment.user?._id &&
                                      comment.edit && (
                                        <a
                                          style={{ color: "#007bff" }}
                                          onClick={() =>
                                            onEditComment(comment, i, cI)
                                          }
                                        >
                                          Save
                                        </a>
                                      )}
                                  </li>
                                  <li>
                                    {user._id === comment.user?._id && (
                                      <a
                                        style={{ color: "#007bff" }}
                                        onClick={() => deletePost(comment, pst)}
                                      >
                                        Delete
                                      </a>
                                    )}
                                  </li>
                                  <li>{fromNow(comment.updatedAt)}</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                        {pst.totalComments / 2 > pst?.commentPage &&
                          pst.totalComments > pst.comments.length && (
                            <div className="load-more mt-4 text-center p-0">
                              <a onClick={() => loadMoreComments(pst)}>
                                Load more comments
                              </a>
                            </div>
                          )}
                        {pst.totalComments / 2 === pst.commentPage &&
                          pst.commentPage > 2 && (
                            <div className="load-more mt-4 text-center p-0">
                              <a onClick={() => hideAllComments(pst, i)}>
                                Hide comments
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                  {!allpost.length && (
                    <div className="post-box bg-white addNoDataFullpageImgs emptyPostBox_new">
                      <figure>
                        <img
                          src="/assets/images/emptyfeed-class.svg"
                          alt="Not Found"
                          className="img-fluid"
                        />
                      </figure>
                      <h4 className="text-center">No Feed yet! </h4>
                      <p>There is no feed posted, Lets create one !</p>
                    </div>
                  )}
                </div>
              )}
              {!allpost ||
                (allpost.length === 0 && (
                  <div className="empty-data">
                    <svg
                      id="f2d0d819-1d50-4c68-8678-d6061f301faf"
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="500.25"
                      height="405.69"
                      viewBox="0 0 947.25 603.69"
                    >
                      <path
                        d="M452.65527,713.275l-29,16.84,28.58985-6.9c-.22022,2.36-.52,4.68-.91992,6.95-.11036.63-.23,1.25-.36036,1.87a51.87781,51.87781,0,0,1-5.25,14.92005c-.48.86-.96,1.69995-1.46,2.51-.48.82-.98,1.61-1.48974,2.38H365.895c-.64014-.77-1.25-1.57-1.81006-2.38a35.97564,35.97564,0,0,1-6.17969-26.62,44.96785,44.96785,0,0,1,1.19971-5.63,51.56839,51.56839,0,0,1,1.83008-5.57,73.442,73.442,0,0,1,4.41015-9.35c3.52-6.34,9.00977-12.06,15.48-17.14a108.06933,108.06933,0,0,1,9.77978-6.8q.96021-.615,1.9502-1.2c1.00976-.6,2.02-1.19,3.04-1.76,2.02979-1.16,4.07959-2.26,6.12989-3.3.54-.28,1.06982-.55,1.6001-.81,4.4497-2.22,8.87988-4.21,13.0996-5.96.53028-.22,1.07032-.44,1.6001-.65a233.30757,233.30757,0,0,1,25.72022-8.81s.02978.08.08008.25c.12988.46.46,1.57.90966,3.21,1.25,4.55,3.4502,13.23,5.22022,23.71.1001.57.18994,1.15.29,1.73005a181.68776,181.68776,0,0,1,2.4497,26.81c.01026.56.01026,1.11.01026,1.67Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#f2f2f2"
                      />
                      <path
                        d="M445.86523,654.845c-.01025.03-.11035.52-.34033,1.42-.18994.75-.4497,1.78-.79,3.06-1.16992,4.47-3.25,11.96-6.21,20.98-.16992.52-.3501,1.06-.52978,1.6-2.06006,6.17-4.51026,12.99-7.33985,20-.71045,1.76-1.42041,3.49-2.15039,5.18-.21972.53-.43994,1.05005-.66992,1.56q-4.65015,10.77007-9.56982,19.71l-.83008,1.49a134.52429,134.52429,0,0,1-13.18994,19.62c-.66992.82-1.3501,1.61-2.04,2.38h-2.32031c.70019-.77,1.40039-1.57,2.08007-2.38a132.14581,132.14581,0,0,0,13.87012-20.4c.28027-.49.56006-.98.83008-1.48,3.52978-6.41,6.74023-13.11,9.60986-19.75.23-.51.4502-1.03.66992-1.56,3.75-8.78,6.90039-17.41,9.44-25.00994.18017-.54.36035-1.08.53027-1.61005,3.70019-11.22,6.02-20.02,6.91016-23.54.11962-.52.21972-.93.29-1.21.06983-.26.09961-.41.10987-.44l.81006.19h.00976Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <path
                        d="M451.48486,683.165c-.50976-.03-1.02-.08-1.52978-.13a44.99648,44.99648,0,0,1-11.43018-2.73c-.52978-.21-1.06982-.42-1.60986-.65a45.858,45.858,0,0,1-4.28027-2.11,45.27611,45.27611,0,0,1-14.60987-12.87c-.12988-.17-.25976-.35-.37988-.52q-.78.33-1.58984.66c.11962.17.23974.34.36962.51a46.76551,46.76551,0,0,0,15.39014,13.7,48.307,48.307,0,0,0,4.56983,2.24006c.53027.22,1.07031.44,1.61035.63995a46.89079,46.89079,0,0,0,12.25,2.86005c.5.05,1.00976.09,1.50976.12C451.665,684.295,451.5752,683.725,451.48486,683.165Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <path
                        d="M452.69482,711.575a45.37037,45.37037,0,0,1-24.18994-4.49q-.79467-.375-1.56006-.81a4.2326,4.2326,0,0,1-.46972-.25,45.58023,45.58023,0,0,1-23.1499-34.74c-.02-.17-.04-.35-.06006-.51995-.54.28-1.08008.55-1.60987.83.01953.17.03955.33.06983.5a47.22571,47.22571,0,0,0,23.93017,35.41c.19971.11.40967.23.61963.32995q.78.42,1.56006.81a47.05043,47.05043,0,0,0,24.82031,4.63c.44971-.04.89991-.09,1.34961-.13995,0-.57.01026-1.13.01026-1.7C453.5752,711.485,453.13477,711.535,452.69482,711.575Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <path
                        d="M451.3252,730.165a45.54776,45.54776,0,0,1-27.75.21,44.468,44.468,0,0,1-5.31006-2.02c-.54-.24-1.07032-.5-1.6001-.77-.56983-.28-1.12988-.57995-1.68018-.87994a45.67468,45.67468,0,0,1-23.38965-42.39,43.76337,43.76337,0,0,1,.96-7.16c.02978-.16.06-.32.10009-.48-.66015.41-1.32031.82-1.97021,1.24-.02979.15-.06006.29-.08008.44a46.77057,46.77057,0,0,0-.73,9.79,47.25281,47.25281,0,0,0,24.28027,40.03c.55957.31,1.11963.61,1.67969.89.53027.27,1.07031.53,1.6001.78a47.17478,47.17478,0,0,0,33.52978,2.19c.37012-.1.74024-.22,1.11036-.34.1499-.64.27978-1.28.3999-1.92C452.09521,729.915,451.71484,730.045,451.3252,730.165Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <rect
                        x="200.25"
                        y="246.52002"
                        width="56"
                        height="56"
                        fill="#9e616a"
                      />
                      <polygon
                        points="165.326 581.214 176.36 581.213 181.608 538.656 165.324 538.657 165.326 581.214"
                        fill="#9e616a"
                      />
                      <path
                        d="M321.98486,741.805l-16.57959-11.45v-7.47l-1.88037.11-11.81982.71-3.74024.22-2.12988,25.54-.06982.85h7.83007l.15967-.85,1.24024-6.54,3.16992,6.54.41016.85H319.335a4.67905,4.67905,0,0,0,4.66992-4.66A4.67076,4.67076,0,0,0,321.98486,741.805Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#2f2e41"
                      />
                      <polygon
                        points="229.853 574.209 240.457 577.258 257.265 537.81 241.615 533.309 229.853 574.209"
                        fill="#9e616a"
                      />
                      <path
                        d="M381.895,742.695l-12.77-15.59,2.06982-7.18-1.83984-.41-10.25-2.3-1.31006-.29-3.6499-.82-9.41016,24.75,7.52,2.17,3.39014-6.72,1.39014,8.09,4.73974,1.36005,12.89014,3.71,2.33008.67a4.66278,4.66278,0,0,0,4.8999-7.44Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M1070.355,148.155H485.895a3.28,3.28,0,0,0-3.27,3.28v19.25a3.27992,3.27992,0,0,0,3.27,3.28h584.46a3.27961,3.27961,0,0,0,3.27-3.28v-19.25A3.27966,3.27966,0,0,0,1070.355,148.155Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <circle
                        id="b5b16cf8-67a2-4f26-b1bf-3e43b6764a92"
                        data-name="Ellipse 90"
                        cx="375.2487"
                        cy="11.96482"
                        r="4.64784"
                        fill="#fff"
                      />
                      <circle
                        id="b66c556c-a3ce-485d-a169-682ae89102b6"
                        data-name="Ellipse 91"
                        cx="392.89038"
                        cy="11.96482"
                        r="4.64784"
                        fill="#fff"
                      />
                      <circle
                        id="b9ccba63-6bb8-47f6-85e8-d2b1a1d873e2"
                        data-name="Ellipse 92"
                        cx="410.53288"
                        cy="11.96482"
                        r="4.64784"
                        fill="#fff"
                      />
                      <path
                        d="M1053.06494,153.915h-20.31006a1.505,1.505,0,1,0,0,3.01h20.31006a1.505,1.505,0,1,0,0-3.01Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <path
                        d="M1053.06494,159.555h-20.31006a1.505,1.505,0,1,0,0,3.01h20.31006a1.505,1.505,0,1,0,0-3.01Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <path
                        d="M1053.06494,165.195h-20.31006a1.505,1.505,0,1,0,0,3.01h20.31006a1.505,1.505,0,1,0,0-3.01Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <path
                        d="M1050.75488,229.645H899.3252a3.99016,3.99016,0,0,0-3.98,3.98v61.45a3.9901,3.9901,0,0,0,3.98,3.98h151.42968a3.9838,3.9838,0,0,0,3.98-3.98v-61.45A3.98385,3.98385,0,0,0,1050.75488,229.645Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M1036.335,318.975H913.74512a4.775,4.775,0,0,0,0,9.55H1036.335C1042.55518,328.615,1042.49512,318.885,1036.335,318.975Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M1036.335,340.865H913.74512a4.775,4.775,0,0,0,0,9.55H1036.335C1042.55518,350.505,1042.49512,340.775,1036.335,340.865Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M1036.335,362.755H913.74512a4.775,4.775,0,0,0,0,9.55H1036.335C1042.55518,372.395,1042.49512,362.665,1036.335,362.755Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M851.75488,229.645H700.3252a3.99016,3.99016,0,0,0-3.98,3.98v61.45a3.9901,3.9901,0,0,0,3.98,3.98H851.75488a3.9838,3.9838,0,0,0,3.98-3.98v-61.45A3.98385,3.98385,0,0,0,851.75488,229.645Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M837.335,318.975H714.74512a4.775,4.775,0,0,0,0,9.55H837.335C843.55518,328.615,843.49512,318.885,837.335,318.975Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M837.335,340.865H714.74512a4.775,4.775,0,0,0,0,9.55H837.335C843.55518,350.505,843.49512,340.775,837.335,340.865Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M837.335,362.755H714.74512a4.775,4.775,0,0,0,0,9.55H837.335C843.55518,372.395,843.49512,362.665,837.335,362.755Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M472.04287,345.86227a10.02421,10.02421,0,0,0-.42317,1.74747l-62.00428-10.95961-53.4076-28.7994a15.08,15.08,0,0,0-16.0966,25.41817l.00006,0A118.971,118.971,0,0,0,372.847,350.26435l38.71983,12.96946,67.82117-4.34723a9.9971,9.9971,0,1,0-7.34512-13.02431Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#9e616a"
                      />
                      <path
                        d="M624.55518,346.055h-193.02a5.08706,5.08706,0,0,0-5.08008,5.08v78.31a5.087,5.087,0,0,0,5.08008,5.07995h193.02A5.08488,5.08488,0,0,0,629.625,429.445v-78.31A5.0849,5.0849,0,0,0,624.55518,346.055Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M606.1748,459.915H449.915a6.09,6.09,0,0,0,0,12.18H606.1748C614.105,472.20505,614.0249,459.805,606.1748,459.915Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M606.1748,487.815H449.915a6.09,6.09,0,0,0,0,12.18H606.1748C614.105,500.105,614.0249,487.70505,606.1748,487.815Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M606.1748,515.725H449.915a6.085,6.085,0,1,0,0,12.17H606.1748C614.105,528.005,614.0249,515.615,606.1748,515.725Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#6c63ff"
                      />
                      <circle
                        cx="357.65385"
                        cy="265.79258"
                        r="29.72868"
                        transform="translate(-173.49417 303.97269) rotate(-61.33683)"
                        fill="#9e616a"
                      />
                      <path
                        d="M362.625,229.675H343.4209c-12.58985,0-22.7959,11.48193-22.7959,25.64563-9.5,9.53894-6.64893,21.48919.88867,34.35437a149.22541,149.22541,0,0,1,39.541,10.57574l1.79248-7.65448,3.53564,10.08081q4.71679,2.28534,9.35352,4.99793c-3.60791-16.95111-5.09278-33.86286-2.61572-47H379.625v-7.1181l2.208,7.1181h11.792V260.675A30.9998,30.9998,0,0,0,362.625,229.675Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M360.625,303.675,324.66978,302.116l-.967,3.67373a213.66873,213.66873,0,0,0-3.59909,92.56989l0,0h0a8.24249,8.24249,0,0,1,2.34458,8.00651l-.5165,2.0591.04779.07542a12.06182,12.06182,0,0,1,1.60133,9.00482v0l1.79834,9.90181L383.625,401.675l13-45Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#cacaca"
                      />
                      <path
                        d="M449.73154,398.51889a10.024,10.024,0,0,0-1.08438,1.43417L396.1439,365.196l-37.51032-47.69436a15.08,15.08,0,0,0-24.89132,16.89988l0,0a118.97085,118.97085,0,0,0,23.25336,28.63132l30.34607,27.323,63.93732,23.03539a9.9971,9.9971,0,1,0-1.54751-14.87242Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#9e616a"
                      />
                      <path
                        d="M563.90846,298.81988a28.73541,28.73541,0,1,1,28.73541-28.73541A28.73543,28.73543,0,0,1,563.90846,298.81988Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#e4e4e4"
                      />
                      <path
                        d="M575.24669,267.25h-8.50362v-8.50373a2.83461,2.83461,0,0,0-5.66922,0V267.25h-8.50374a2.83457,2.83457,0,0,0,0,5.66913h8.50374v8.50372a2.83461,2.83461,0,0,0,5.66922,0v-8.50372h8.50362a2.83457,2.83457,0,1,0,0-5.66913Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#fff"
                      />
                      <path
                        d="M420.61426,619.61374a16.87393,16.87393,0,0,0-1.57031-15.08753L393.625,472.675l-10-50h-60s-37.5,41.5-29.5,94.5l-2.23926,74.64014a27.44788,27.44788,0,0,0-1.50342,16.18585l.89112,4.22223-.34375.63592a21.33414,21.33414,0,0,0-.26856,19.77216L288.125,717.175l18-1,26.5-98.5,17.5-88.5,29.5,68.5,1,16-.48535,14.10333L357.125,710.175l19.5,7.5Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M566.05518,750.655a1.193,1.193,0,0,1-1.18995,1.19H127.56494a1.19,1.19,0,0,1,0-2.38H564.86523A1.18664,1.18664,0,0,1,566.05518,750.655Z"
                        transform="translate(-126.375 -148.155)"
                        fill="#cacaca"
                      />
                    </svg>
                  </div>
                ))}
            </div>
          ) : (
            <div>
              <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
              <br></br>
              <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
              <br></br>
              <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
              <br></br>
              <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
              <br></br>
              <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
            </div>
          )}
        </div>
        <div className="col-sm-3">
          <div className="d-none d-lg-block">
            {user.primaryInstitute?.preferences.classroom.assignment && (
              <div className="dashboard-card-items card-common event-calender p-0 bg-white">
                <div className="card-header-common">
                  <h4 className="widget_title">Due Assignments</h4>
                </div>
                <div className="card-body-common">
                  <div className="date-info mx-auto">
                    <button
                      className="caret-btn-left border-0 p-0"
                      aria-label="caretleft_button for teacher classroom feed"
                      onClick={pastAssignments}
                    ></button>
                    <span className="text-center">
                      <strong>{`${week[0]?.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} - ${week[week.length - 1]?.toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}`}</strong>
                    </span>
                    <button
                      className="caret-btn-right border-0 p-0"
                      aria-label="caretright_button for teacher classroom feed"
                      onClick={futureAssignments}
                    ></button>
                  </div>
                  {assignmentsByWeek && assignmentsByWeek.length > 0 && (
                    <div>
                      {assignmentsByWeek.map((assignment, index) => (
                        <div className="event classroom mb-0" key={index}>
                          <div className="row">
                            <div className="col-7 pr-0">
                              <h4>{assignment.title}</h4>
                            </div>
                            <div className="col-5 px-2">
                              <div className="date ml-auto">
                                <span>
                                  <span>
                                    {assignment.dueDate
                                      ? new Date(
                                          assignment.dueDate
                                        ).toLocaleDateString("en-US", {
                                          day: "numeric",
                                          month: "numeric",
                                          year: "2-digit",
                                        })
                                      : ""}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!assignmentsByWeek ||
                    (!assignmentsByWeek.length && (
                      <div className="text-center">
                        <svg
                          id="ee53e21e-3957-4d81-a8a1-5950f465cd80"
                          data-name="Layer 1"
                          xmlns="http://www.w3.org/2000/svg"
                          width="200.19718"
                          height="200.27258"
                          viewBox="0 0 801.19718 614.27258"
                        >
                          <path
                            d="M743.1742,755.17457c-.78106.66616-1.587,1.31586-2.40141,1.95737H641.90134c-.56742-.64151-1.13525-1.29121-1.69424-1.95737a109.34753,109.34753,0,0,1-11.999-17.641c-8.11741-14.6227-10.914-33.79337-10.914-53.31768,0-1.19253.00843-2.385.03293-3.57752.09076-5.47737.39515-10.96291.84732-16.358.08232-.93757.16465-1.86691.255-2.79625.73207-7.739,1.7601-15.27235,2.92787-22.31229.14778-.89646.296-1.78469.45218-2.66469a365.995,365.995,0,0,1,9.55665-41.42544s.13171.03293.38631.09869c.73207.20561,2.48373.69086,5.05822,1.45571,7.089,2.1054,20.404,6.34913,35.75893,12.6571.83889.33717,1.68581.6908,2.54116,1.05267A283.26673,283.26673,0,0,1,712.72809,629.237c.74853.45232,1.48863.91288,2.22873,1.37343v.06581l-1.61994,52.44587,14.47472-43.6624q4.42855,3.3678,8.46276,6.98236c.7401.65793,1.4802,1.33232,2.19581,2.03141a81.02719,81.02719,0,0,1,15.46139,19.28578C775.586,706.79966,766.4984,735.50218,743.1742,755.17457Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#f2f2f2"
                          />
                          <path
                            d="M729.23437,757.13194h-2.63191c-.01646-.64974-.041-1.29944-.08232-1.95737-1.06056-19.72991-9.52332-41.51594-21.04567-62.54524-.41122-.7649-.83046-1.54616-1.2746-2.31106-5.59272-10.00064-11.82674-19.78749-18.266-29.08909-.49353-.72374-1.00353-1.45566-1.51353-2.17939-8.56958-12.22943-17.41866-23.546-25.41278-33.20944-.5594-.69086-1.13485-1.36525-1.70228-2.03141-11.85124-14.21144-21.63-24.56577-25.55293-28.62854-.58389-.60035-1.03606-1.06091-1.34848-1.38166-.28793-.31253-.46061-.477-.49354-.5099l.92121-.92111.008-.02465.93768-.92116c.03293.04116.60035.58394,1.60348,1.62843.84732.86354,2.00666,2.07248,3.42984,3.58576,4.96747,5.26352,13.18326,14.21967,22.69052,25.57733.551.658,1.11838,1.34055,1.68581,2.02317,6.489,7.83772,13.52058,16.71987,20.48668,26.26819q2.62749,3.60219,5.09918,7.14686c.518.72373,1.028,1.44747,1.52116,2.17121q10.44915,15.075,18.24992,28.99863l1.29909,2.32743c13.25755,24.17925,20.39633,45.59512,21.31754,64.02564C729.193,755.8325,729.21791,756.4822,729.23437,757.13194Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#fff"
                          />
                          <path
                            d="M674.01679,607.36871c-.46863.64975-.9457,1.29121-1.44727,1.9245a70.24156,70.24156,0,0,1-13.06841,12.92023c-.71561.52636-1.44767,1.06919-2.19581,1.5955a72.0404,72.0404,0,0,1-6.33281,3.94767,70.82539,70.82539,0,0,1-29.16308,8.75054c-.32889.03293-.66622.05757-.9951.074-.14818.88-.28793,1.76-.44414,2.65641.32888-.01642.65777-.03288.98706-.06576a73.30553,73.30553,0,0,0,30.89829-9.10423,75.17819,75.17819,0,0,0,6.75206-4.22726c.7401-.51813,1.46373-1.06091,2.17934-1.60374a73.267,73.267,0,0,0,13.92376-13.89073c.47707-.63323.9457-1.27474,1.40631-1.91621C675.66164,608.0678,674.83118,607.71417,674.01679,607.36871Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#fff"
                          />
                          <path
                            d="M713.6248,627.37828c-.28792.625-.59232,1.24186-.89671,1.85868a70.84226,70.84226,0,0,1-25.95531,28.4147c-.77343.48525-1.55449.954-2.35242,1.39813-.23853.1398-.49313.28783-.73167.41944a71.27838,71.27838,0,0,1-65.25933,2.0149c-.247-.1151-.4855-.23026-.724-.34541-.09035.93758-.17267,1.87515-.23813,2.82091.2301.10692.46864.22207.70717.32075a73.88,73.88,0,0,0,66.78893-2.50014c.32889-.181.64974-.36187.9706-.55106.79753-.46056,1.587-.92934,2.36005-1.40631a73.40144,73.40144,0,0,0,26.66288-29.14667c.32086-.61682.62525-1.24187.92121-1.87515C715.1299,628.32408,714.38137,627.84706,713.6248,627.37828Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#fff"
                          />
                          <path
                            d="M736.71007,644.57512c-.13975.625-.2795,1.25009-.43571,1.86691a71.08037,71.08037,0,0,1-29.7305,42.37947c-.765.51814-1.55449,1.01157-2.344,1.49677-.84732.51-1.69424,1.01985-2.56605,1.49682a71.45879,71.45879,0,0,1-84.30678-11.1767c-.18914-.17273-.36985-.35364-.551-.5346,0,1.2254-.008,2.43439.00843,3.65156.16425.15626.33692.31253.5096.46056a74.08268,74.08268,0,0,0,85.62273,9.91018c.87182-.477,1.72717-.97045,2.55763-1.49676.806-.477,1.58742-.97051,2.36848-1.4804a73.80814,73.80814,0,0,0,30.62722-42.67549c.15621-.59217.31242-1.18429.45217-1.78469C738.20714,645.965,737.4586,645.28244,736.71007,644.57512Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#fff"
                          />
                          <path
                            d="M667.75692,510.65184H199.40141v-351.389H667.75692Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#fff"
                          />
                          <circle
                            cx="113.49141"
                            cy="71.09365"
                            r="18.64295"
                            fill="#e6e6e6"
                          />
                          <path
                            d="M355.94913,201.52872a3.10716,3.10716,0,0,0,0,6.21431H582.80785a3.10716,3.10716,0,0,0,0-6.21431Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#e6e6e6"
                          />
                          <path
                            d="M355.94913,220.17163a3.10716,3.10716,0,1,0-.01311,6.21431H499.35845a3.10716,3.10716,0,1,0,0-6.21431Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#e6e6e6"
                          />
                          <path
                            d="M667.75692,510.65184H199.40141v-351.389H667.75692Zm-463.11344-5.24207H662.51485V164.50494H204.64348Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#e6e6e6"
                          />
                          <path
                            d="M225.57906,266.42192v209h416v-209Zm414,51.75h-101.5v-49.75h101.5Zm-205,0v-49.75h101.5v49.75Zm101.5,2v49.75h-101.5v-49.75Zm-103.5-2h-101.5v-49.75h101.5Zm0,2v49.75h-101.5v-49.75Zm-103.5,49.75h-101.5v-49.75h101.5Zm0,2v49.75h-101.5v-49.75Zm2,0h101.5v49.75h-101.5Zm101.5,51.75v49.75h-101.5v-49.75Zm2,0h101.5v49.75h-101.5Zm0-2v-49.75h101.5v49.75Zm103.5-49.75h101.5v49.75h-101.5Zm0-2v-49.75h101.5v49.75Zm-209-101.5v49.75h-101.5v-49.75Zm-101.5,155.25h101.5v49.75h-101.5Zm310.5,49.75v-49.75h101.5v49.75Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#e4e4e4"
                          />
                          <path
                            d="M396.35088,322.64939l-41.39272-.93718c-4.14034-16.03871-2.27631-31.30987,1.0277-45.38227l41.39252.93715A90.6291,90.6291,0,0,0,396.35088,322.64939Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#6c63ff"
                          />
                          <polygon
                            points="163.676 143.496 163.698 141.921 185.143 142.687 185.12 144.262 163.676 143.496"
                            fill="#fff"
                          />
                          <polygon
                            points="163.586 149.796 163.608 148.221 185.052 148.988 185.03 150.563 163.586 149.796"
                            fill="#fff"
                          />
                          <polygon
                            points="163.495 156.096 163.518 154.521 184.962 155.288 184.94 156.863 163.495 156.096"
                            fill="#fff"
                          />
                          <polygon
                            points="163.405 162.396 163.427 160.821 184.872 161.588 184.849 163.163 163.405 162.396"
                            fill="#fff"
                          />
                          <polygon
                            points="163.315 168.696 163.337 167.121 184.782 167.888 184.759 169.463 163.315 168.696"
                            fill="#fff"
                          />
                          <path
                            d="M306.35088,438.64939l-41.39272-.93718c-4.14034-16.03871-2.27631-31.30987,1.0277-45.38227l41.39252.93715A90.6291,90.6291,0,0,0,306.35088,438.64939Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#f0f0f0"
                          />
                          <polygon
                            points="73.676 259.496 73.698 257.921 95.143 258.687 95.12 260.262 73.676 259.496"
                            fill="#fff"
                          />
                          <polygon
                            points="73.586 265.796 73.608 264.221 95.052 264.988 95.03 266.563 73.586 265.796"
                            fill="#fff"
                          />
                          <polygon
                            points="73.495 272.096 73.518 270.521 94.962 271.288 94.94 272.863 73.495 272.096"
                            fill="#fff"
                          />
                          <polygon
                            points="73.405 278.396 73.427 276.821 94.872 277.588 94.849 279.163 73.405 278.396"
                            fill="#fff"
                          />
                          <polygon
                            points="73.315 284.696 73.337 283.121 94.782 283.888 94.759 285.463 73.315 284.696"
                            fill="#fff"
                          />
                          <path
                            d="M522.35088,385.64939l-41.39272-.93718c-4.14034-16.03871-2.27631-31.30987,1.0277-45.38227l41.39252.93715A90.6291,90.6291,0,0,0,522.35088,385.64939Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#f0f0f0"
                          />
                          <polygon
                            points="289.676 206.496 289.698 204.921 311.143 205.687 311.12 207.262 289.676 206.496"
                            fill="#fff"
                          />
                          <polygon
                            points="289.586 212.796 289.608 211.221 311.052 211.988 311.03 213.563 289.586 212.796"
                            fill="#fff"
                          />
                          <polygon
                            points="289.495 219.096 289.518 217.521 310.962 218.288 310.94 219.863 289.495 219.096"
                            fill="#fff"
                          />
                          <polygon
                            points="289.405 225.396 289.427 223.821 310.872 224.588 310.849 226.163 289.405 225.396"
                            fill="#fff"
                          />
                          <polygon
                            points="289.315 231.696 289.337 230.121 310.782 230.888 310.759 232.463 289.315 231.696"
                            fill="#fff"
                          />
                          <path
                            d="M504.35088,375.64939l-41.39272-.93718c-4.14034-16.03871-2.27631-31.30987,1.0277-45.38227l41.39252.93715A90.6291,90.6291,0,0,0,504.35088,375.64939Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#6c63ff"
                          />
                          <polygon
                            points="271.676 196.496 271.698 194.921 293.143 195.687 293.12 197.262 271.676 196.496"
                            fill="#fff"
                          />
                          <polygon
                            points="271.586 202.796 271.608 201.221 293.052 201.988 293.03 203.563 271.586 202.796"
                            fill="#fff"
                          />
                          <polygon
                            points="271.495 209.096 271.518 207.521 292.962 208.288 292.94 209.863 271.495 209.096"
                            fill="#fff"
                          />
                          <polygon
                            points="271.405 215.396 271.427 213.821 292.872 214.588 292.849 216.163 271.405 215.396"
                            fill="#fff"
                          />
                          <polygon
                            points="271.315 221.696 271.337 220.121 292.782 220.888 292.759 222.463 271.315 221.696"
                            fill="#fff"
                          />
                          <path
                            d="M657.017,466.999l-41.39273-.93718c-4.14034-16.03871-2.27631-31.30987,1.02771-45.38227l41.39251.93715A90.6291,90.6291,0,0,0,657.017,466.999Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#6c63ff"
                          />
                          <polygon
                            points="424.342 287.845 424.365 286.27 445.809 287.037 445.786 288.612 424.342 287.845"
                            fill="#fff"
                          />
                          <polygon
                            points="424.252 294.145 424.274 292.57 445.719 293.337 445.696 294.912 424.252 294.145"
                            fill="#fff"
                          />
                          <polygon
                            points="424.161 300.446 424.184 298.871 445.628 299.637 445.606 301.212 424.161 300.446"
                            fill="#fff"
                          />
                          <polygon
                            points="424.071 306.746 424.094 305.171 445.538 305.937 445.515 307.512 424.071 306.746"
                            fill="#fff"
                          />
                          <polygon
                            points="423.981 313.046 424.003 311.471 445.448 312.238 445.425 313.813 423.981 313.046"
                            fill="#fff"
                          />
                          <path
                            d="M612.35088,330.64939l-41.39272-.93718c-4.14034-16.03871-2.27631-31.30987,1.0277-45.38227l41.39252.93715A90.6291,90.6291,0,0,0,612.35088,330.64939Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#f0f0f0"
                          />
                          <polygon
                            points="379.676 151.496 379.698 149.921 401.143 150.687 401.12 152.262 379.676 151.496"
                            fill="#fff"
                          />
                          <polygon
                            points="379.586 157.796 379.608 156.221 401.052 156.988 401.03 158.563 379.586 157.796"
                            fill="#fff"
                          />
                          <polygon
                            points="379.495 164.096 379.518 162.521 400.962 163.288 400.94 164.863 379.495 164.096"
                            fill="#fff"
                          />
                          <polygon
                            points="379.405 170.396 379.427 168.821 400.872 169.588 400.849 171.163 379.405 170.396"
                            fill="#fff"
                          />
                          <polygon
                            points="379.315 176.696 379.337 175.121 400.782 175.888 400.759 177.463 379.315 176.696"
                            fill="#fff"
                          />
                          <path
                            d="M654.78481,433.55383a10.05579,10.05579,0,0,0,6.786-13.84578L687.67,395.29875l-18.0556-4.33922-22.01607,23.84474a10.11028,10.11028,0,0,0,7.1865,18.74956Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#ffb6b6"
                          />
                          <path
                            d="M668.26737,413.892l-12.17171-17.16138,45.71846-47.28659,10.61553-74.53553a25.35292,25.35292,0,0,1,33.19643-20.44981h0a25.37994,25.37994,0,0,1,15.92679,32.12217l-27.08463,80.35815Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#e4e4e4"
                          />
                          <polygon
                            points="554.708 588.617 541.196 588.616 534.768 536.499 554.711 536.5 554.708 588.617"
                            fill="#ffb6b6"
                          />
                          <path
                            d="M761.37838,757.13629h-9.58777l-1.71137-9.052-4.38308,9.052h-25.429a5.71622,5.71622,0,0,1-3.24815-10.42013l20.30688-14.02466v-9.15125l21.35929,1.27486Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#2f2e41"
                          />
                          <polygon
                            points="638.069 574.867 626.2 581.325 595.643 538.619 613.16 529.088 638.069 574.867"
                            fill="#ffb6b6"
                          />
                          <path
                            d="M856.11741,736.79167l-8.42164,4.58269-5.82984-7.133.47662,10.046-22.33622,12.1544a5.71622,5.71622,0,0,1-7.83363-7.60025l11.13363-22.025-4.37405-8.03822,19.37081-9.08937Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M759.802,712.92192H731.87838V613.48735l-17.28711-64.82617a371.10613,371.10613,0,0,1-9.709-142.30127l.02417-.19482.15015-.126c.44385-.373,44.68872-36.957,72.67529-8.9707,18.864,18.86425,1.13843,86.6958.14649,90.41894V604.42192Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#2f2e41"
                          />
                          <path
                            d="M696.37838,424.42192l9-90c-1.16919-2.4541-18-18-.40186-45.33252l19.0083-44.61767,35.59741-.55323.14966.14991a71.70284,71.70284,0,0,1,19.6482,64.894l-10.48926,52.44727,9.08838,36.354Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#e4e4e4"
                          />
                          <polygon
                            points="543.742 471.137 601.106 551.824 623.111 536.179 575.202 437.728 543.742 471.137"
                            fill="#2f2e41"
                          />
                          <circle
                            cx="539.05571"
                            cy="59.66845"
                            r="32.87"
                            fill="#ffb6b6"
                          />
                          <polygon
                            points="530.977 178.558 539.977 232.558 530.977 277.558 512.977 277.558 521.159 232.558 530.977 178.558"
                            opacity="0.1"
                          />
                          <path
                            d="M738.965,466.787a10.05579,10.05579,0,0,0-.53235-15.41014l11.5323-33.82285-17.97207,4.67314-8.196,31.40231A10.11027,10.11027,0,0,0,738.965,466.787Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#ffb6b6"
                          />
                          <path
                            d="M741.602,443.09282l-18.81836-9.40918L740.853,370.44048l-25.729-70.75489a25.35292,25.35292,0,0,1,19.658-33.67138h0A25.38,25.38,0,0,1,763.95723,286.854l13.94117,83.646Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#e4e4e4"
                          />
                          <path
                            d="M1000.59859,755.94194a1.18663,1.18663,0,0,1-1.18994,1.19h-647.29a1.19,1.19,0,1,1,0-2.38h647.29A1.193,1.193,0,0,1,1000.59859,755.94194Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#cacaca"
                          />
                          <path
                            d="M866.29571,200.92492c-4.147,6.73212-12.93122,9.69989-20.72236,8.35193-7.79113-1.3479-14.56121-6.37658-19.56158-12.50146-5.00043-6.12494-8.45929-13.33454-11.8631-20.47119-3.40381-7.13672-6.84692-14.35181-11.82226-20.497-4.97535-6.14527-11.70966-11.21259-19.48957-12.624-4.23407-.76812-9.02972-.261-12.11914,2.73444a11.80248,11.80248,0,0,0-3.2381,8.3313,8.70266,8.70266,0,0,0-11.58221,8.63678c-.11523-.0022-.22913-.00983-.34436-.00983-14.49615-8.24164-36.4989-3.45392-36.4989,5.54608-7.9541,0-17.67578,7.85529-17.67578,19.78363v.00006c16.44848,0,26.12823,21.07471,16.52612,36.18561a103.28775,103.28775,0,0,1-8.18018,11.0307H730.293a17.13739,17.13739,0,0,0,3.01819-8.37134,38.50432,38.50432,0,0,1,1.34637,8.37134s56.18494,7.23975,41.68341-48.76294a5.868,5.868,0,0,0,2.71784-.82373c2.18976-1.31976,3.38232-4.111,3.59112-6.9433q.813.21735,1.62116.43366c3.86566,1.04352,7.88092,2.39563,10.53418,5.39441,4.48419,5.06817,3.54095,12.76068,5.16919,19.3291,1.96362,7.92108,7.83789,14.32794,14.36352,19.22845,7.01123,5.26514,15.20142,9.26526,23.93006,10.09559,8.7287.83032,18.01672-1.824,24.06482-8.17218S870.487,208.6264,866.29571,200.92492Z"
                            transform="translate(-199.40141 -142.86371)"
                            fill="#2f2e41"
                          />
                        </svg>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div className="bg-white dashboard-card-items has-rounded-img card-common">
              {leaderboard &&
                leaderboard.length > 0 &&
                leaderboardTopTime &&
                leaderboardTopTime.length > 0 &&
                leaderboardTopAccu &&
                leaderboardTopAccu.length > 0 && (
                  <>
                    <div className="card-header-common">
                      <h4 className="widget_title">Leaderboard</h4>
                    </div>
                    <div className="card-body-common custom_scrollbar">
                      <div className="leader-board-wrap">
                        <div className="title">
                          <h5>Best 5 Performers (Overall)</h5>
                        </div>
                        <div>
                          {leaderboard.slice(0, 5).map((item, index) => (
                            <div key={index} className="product_wrapper p-1">
                              <div className="form-row">
                                <div className="col-4">
                                  <figure title={item.name}>
                                    <div className="leaderboard">
                                      {item.user.avatar.length > 0 ? (
                                        <img src={item.user?.avatar} alt="" />
                                      ) : (
                                        <img
                                          src="/assets/images/defaultProfile.png"
                                          alt="image"
                                          className="user_img_circled"
                                        />
                                      )}
                                    </div>
                                  </figure>
                                </div>
                                <div className="col-8">
                                  <div className="product_wrapper_inner ml-1">
                                    <h5 className="product_top_title text-truncate f-12">
                                      {item.name}
                                    </h5>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="leader-board-wrap">
                        <div className="title">
                          <h5>Best Performers (Accuracy)</h5>
                        </div>
                        {leaderboardTopAccu.slice(0, 5).map((item, index) => (
                          <div key={index} className="product_wrapper p-1">
                            <div className="form-row">
                              <div className="col-4">
                                <figure title={item.name}>
                                  <div className="leaderboard">
                                    <img src={item.user?.avatar} alt="" />
                                  </div>
                                </figure>
                              </div>
                              <div className="col-8">
                                <div className="product_wrapper_inner ml-1">
                                  <h5 className="product_top_title text-truncate f-12">
                                    {item.name}
                                  </h5>
                                  <p className="product_bottom_info text-break">
                                    {Math.round(item.percentage)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="leader-board-wrap">
                        <div className="title">
                          <h5>Best Performers (Time)</h5>
                        </div>
                        {leaderboardTopTime.slice(0, 5).map((item, index) => (
                          <div key={index} className="product_wrapper p-1">
                            <div className="form-row">
                              <div className="col-4">
                                <figure title={item.name}>
                                  <div className="leaderboard">
                                    <img src={item.user?.avatar} alt="" />
                                  </div>
                                </figure>
                              </div>
                              <div className="col-8">
                                <div className="product_wrapper_inner ml-1">
                                  <h5 className="product_top_title text-truncate f-12">
                                    {item.name}
                                  </h5>
                                  <p className="product_bottom_info text-break">
                                    {secondsToDateTime(item.averageTime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
            <div className="bg-white dashboard-card-items has-rounded-img card-common">
              {!(
                leaderboard &&
                leaderboard.length &&
                leaderboardTopTime &&
                leaderboardTopTime.length &&
                leaderboardTopAccu &&
                leaderboardTopAccu.length
              ) && (
                <>
                  <div className="card-header-common">
                    <h4 className="widget_title">Leaderboard</h4>
                  </div>
                  <div className="card-body-common">
                    <img
                      src="/assets/images/no-data-board.svg"
                      className="m-auto"
                      alt="No data available"
                    />
                    <p className="text-center">No data yet!</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={documentTemplate}
        onHide={() => setDocumentTemplate(false)}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div id="dashboardModal_7" tabIndex="-1" aria-hidden="true">
          <div className="forgot-pass-modal">
            <div className="modal-content border-0">
              <div className="modal-body">
                <div className="dashboard-area mx-auto">
                  <div className="post-box bg-white mb-0">
                    <div className="profile-box d-flex p-0">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={user.avatar}
                          alt=""
                          className="user_img_circled"
                        />
                      </figure>

                      <div className="profile-info ml-2 p-0">
                        <h4>{user.name}</h4>
                        <ul className="nav">
                          <li>{user.role}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="post-box-content post-box-content_new mb-0 border-none">
                      <CKEditorCustomized
                        defaultValue={post.description}
                        onChangeCon={(data) => {
                          setPost({ ...post, description: data });
                        }}
                        config={ckeOptions}
                      />
                    </div>

                    {post.attachments.map((item, index) => (
                      <div className="special-info mb-0" key={index}>
                        <a aria-label="user uploaded file in feed in classroom">
                          <div className="row mx-0">
                            <div className="col-2 px-0">
                              <figure className="doc">
                                <img
                                  src="/assets/images/img-doc.png"
                                  alt="user uploaded picture"
                                />
                              </figure>
                            </div>

                            <div className="col-10 pl-0">
                              <div className="inner">
                                <h6 className="mt-2">{item.title}</h6>
                              </div>
                            </div>
                          </div>
                        </a>

                        <div className="close-btn mr-2">
                          <a
                            onClick={() =>
                              // removeChildItem(index)
                              console.log("d")
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
                      </div>
                    ))}

                    <div className="d-flex align-items-center">
                      <div className="instance-head mt-0">Pin to top</div>
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={post.pin}
                            onChange={(e) => {
                              onPaste(data);
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="post-box bg-white mb-0">
                    <div className="button-group ml-auto d-flex align-items-center justify-content-end">
                      <button
                        className="btn btn-light document-btn mr-2"
                        onClick={() =>
                          selectPhoto("teach_feed_discussionFileUpload")
                        }
                      >
                        <span className="doc">Document</span>
                      </button>
                      <button
                        className="btn btn-light mr-2"
                        onClick={() => cancel()}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={postDiscussion}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* image upload */}
      <Modal
        show={imageTemplate}
        onHide={() => setImageTemplate(false)}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div
          id="dashboardModal_3"
          tabIndex="-1"
          aria-hidden="true"
          style={{ display: "block" }}
        >
          <div className="forgot-pass-modal">
            <div className="modal-content border-0">
              <div className="modal-body">
                <div className="dashboard-area mx-auto">
                  <div className="post-box bg-white mb-0">
                    <div className="profile-box clearfix d-flex p-0">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={user?.avatar}
                          alt=""
                          className="user_img_circled"
                        />
                      </figure>

                      <div className="profile-info ml-2 p-0">
                        <h4>{user.name}</h4>
                        <ul className="nav">
                          <li>{user.role}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="post-box-content post-box-content_new mb-0 border-none">
                      <CKEditorCustomized
                        defaultValue={post.description}
                        onChangeCon={(data) => {
                          onPaste(data);
                        }}
                        config={ckeOptions}
                      />
                    </div>

                    <div className="d-flex align-items-center">
                      <div className="instance-head mt-0">Pin to top</div>
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={post.pin}
                            onChange={(e) => {
                              /* handle pin change */
                              setPost({
                                ...post,
                                pin: e.target.checked,
                              });
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>

                    <div className="button-group ml-auto d-flex align-items-center justify-content-end">
                      <button
                        className="btn btn-light image-btn mr-2"
                        onClick={() =>
                          selectPhoto("teach_feed_discussionImageUpload")
                        }
                      >
                        <span>Image</span>
                      </button>
                      <button
                        className="btn btn-light mr-2"
                        onClick={() => cancel()}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={postDiscussion}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* question upload */}
      <Modal
        show={questionTemplate}
        onHide={() => setQuestionTemplate(false)}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div id="dashboardModal_4" tabIndex="-1" aria-hidden="true">
          <div className="forgot-pass-modal">
            <div className="modal-content border-0">
              <div className="modal-body">
                <div className="dashboard-area mx-auto">
                  <div>
                    <div className="profile-box clearfix d-flex p-0">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={user?.avatar}
                          alt=""
                          className="user_img_circled"
                        />
                      </figure>

                      <div className="profile-info ml-2 p-0">
                        <h4>{user.name}</h4>
                        <ul className="nav">
                          <li>{user.role}</li>
                        </ul>
                      </div>
                    </div>
                    <form className="clearfix mt-2">
                      <div className="editor">
                        <CKEditorCustomized
                          defaultValue={post.description}
                          onChangeCon={(event, editor) => {
                            onPaste(data);
                          }}
                          config={ckeOptionswithToolbar}
                        />
                      </div>
                    </form>
                    <div className="d-flex align-items-center">
                      <div className="instance-head mt-0">Pin to top</div>
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={post.pin}
                            onChange={(e) => {
                              setPost({
                                ...post,
                                pin: e.target.checked,
                              });
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="post-box bg-white mb-0">
                    <div className="button-group ml-auto d-flex align-items-center justify-content-end">
                      <button
                        className="btn btn-light mr-2"
                        onClick={() => cancel()}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={postDiscussion}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* linl temp */}
      <Modal
        show={linkTemplate}
        onHide={() => setLinkTemplate(false)}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div id="dashboardModal_6" tabIndex="-1" aria-hidden="true">
          <div className="forgot-pass-modal">
            <div className="modal-content border-0">
              <div className="modal-body">
                <div className="dashboard-area mx-auto">
                  <div className="post-box bg-white mb-0">
                    <div className="profile-box clearfix d-flex p-0">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={user?.avatar}
                          alt=""
                          className="user_img_circled"
                        />
                      </figure>

                      <div className="profile-info ml-2 p-0">
                        <h4>{user.name}</h4>
                        <ul className="nav">
                          <li>{user.role}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="post-box-content post-box-content_new mb-0 border-none">
                      <CKEditorCustomized
                        defaultValue={post.description}
                        onChangeCon={(data) => {
                          onPaste(data);
                        }}
                        config={linkCkeOptions}
                      />
                    </div>

                    <div className="special-info mb-0">
                      {post.attachments.map((item, index) => (
                        <a key={index} aria-label="user uploaded file in feed">
                          <div className="row mx-0">
                            <div className="col-3 px-0">
                              <figure>
                                <img
                                  src={item.imageUrl}
                                  alt="user uploaded picture in feed"
                                />
                              </figure>
                            </div>

                            <div className="col-9 pr-2">
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
                      ))}
                    </div>

                    <div className="d-flex align-items-center">
                      <div className="instance-head mt-0">Pin to top</div>
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={post.pin}
                            onChange={(e) => {
                              /* handle pin change */
                              setPost({
                                ...post,
                                pin: e.target.checked,
                              });
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="post-box bg-white mb-0">
                    <div className="button-group ml-auto d-flex align-items-center justify-content-end">
                      <button
                        className="btn btn-light mr-2"
                        onClick={() => cancel()}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={postDiscussion}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* editPostTemplate */}
      <Modal
        show={editPostTemplate}
        onHide={() => setEditPostTemplate(false)}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div id="dashboardModal_4" tabIndex="-1" aria-hidden="true">
          <div className="forgot-pass-modal">
            <div className="modal-content border-0">
              <div className="modal-body">
                <div className="dashboard-area mx-auto">
                  <div className="post-box bg-white mb-0">
                    <div className="profile-box clearfix d-flex p-0">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={user.avatar}
                          alt=""
                          className="user_img_circled"
                        />
                      </figure>

                      <div className="profile-info ml-2 p-0">
                        <h4>{user.name}</h4>
                        <ul className="nav">
                          <li>{user.role}</li>
                        </ul>
                      </div>
                    </div>
                    <div className="post-box-content post-box-content_new mb-0">
                      <CKEditorCustomized
                        defaultValue={post.description}
                        onChangeCon={(data) => {
                          onPaste(data);
                        }}
                        config={ckeOptions}
                      />
                    </div>

                    {post.attachments.map((item, i) => (
                      <div key={i}>
                        {item.type === "link" && (
                          <div className="special-info mb-0 mt-2">
                            <div className="close-btn mr-2 remove-image-preview">
                              <a onClick={() => removeChildItem(item, i)}>
                                <figure>
                                  <img
                                    src="assets/images/ant-design_close-circle-outlined.png"
                                    alt=""
                                  />
                                </figure>
                              </a>
                            </div>
                            <div className="row mx-0 mt-2">
                              <div className="col-3 px-0">
                                <figure>
                                  <img src={item.imageUrl} alt="" />
                                </figure>
                              </div>

                              <div className="col-9 pr-2">
                                <div className="inner">
                                  <div className="wrap">
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                    <span>{item.url}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {item.type === "document" && (
                          <div className="special-info mb-0">
                            <a aria-label="user uploaded file in feed">
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
                                    <h6 className="mt-2">{item.title}</h6>
                                  </div>
                                </div>
                              </div>
                            </a>

                            <div className="close-btn mr-2">
                              <a onClick={() => removeChildItem(item, i)}>
                                <figure>
                                  <img
                                    src="assets/images/ant-design_close-circle-outlined.png"
                                    alt=""
                                  />
                                </figure>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="d-flex align-items-center">
                      <div className="instance-head mt-0">Pin to top</div>
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={post.pin}
                            onChange={(e) => {
                              setPost({
                                ...post,
                                pin: e.target.checked,
                              });
                            }}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="post-box bg-white mb-0">
                    <div className="button-group ml-auto d-flex align-items-center justify-content-end">
                      <button
                        className="btn btn-light document-btn mr-2"
                        onClick={() =>
                          selectPhoto("teach_feed_discussionFileUpload")
                        }
                      >
                        <span className="doc">Document</span>
                      </button>
                      <button
                        className="btn btn-light image-btn mr-2"
                        onClick={() =>
                          selectPhoto("teach_feed_discussionImageUpload")
                        }
                      >
                        <span>Image</span>
                      </button>
                      <button
                        className="btn btn-light mr-2"
                        onClick={() => cancel()}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={saveDiscussion}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default ClassroomFeed;
