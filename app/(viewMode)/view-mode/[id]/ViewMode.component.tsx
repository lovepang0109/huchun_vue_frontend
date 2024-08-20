"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { AppLogo } from "@/components/AppLogo";
import Link from "next/link";
import {
  getElearningFullPath,
  bypassSecurityTrustHtml,
  isExpired,
  compileDiscussion,
} from "@/lib/helpers";
import { slugify } from "@/lib/validator";
import {
  addFavoriteContent,
  removeFavoriteContent,
  startContent,
  completeContent,
} from "@/services/courseService";
import {
  getPosts,
  post,
  comment,
  getComments,
  deleteFunc,
} from "@/services/discussionService";
import { getContentById } from "@/services/contentService";
import { confirm, success } from "alertifyjs";
import { formatQuestion } from "@/lib/pipe";
import MathJax from "@/components/assessment/mathjax";
import LoadingOverlay from "react-loading-overlay-ts";
import TeacherCourseLearningTest from "@/components/course/learning-test/CourseLearningTest";
import VideoPlayer from "@/components/course/video-player";
import ContentRenderer from "@/components/course/content-renderer";
import Chart from "react-apexcharts";
import { Modal } from "react-bootstrap";
import { error, warning } from "alertifyjs";

const ViewModeComponent = ({ user, settings }: any) => {
  const { id, content } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>({});
  const [userCourse, setUserCourse] = useState<any>({});
  const [activeSection, setActiveSection] = useState<any>({});
  const [nextContent, setNextContent] = useState<any>({});
  const [hasSummary, setHasSummary] = useState(false);
  const [activeContent, setActiveContent] = useState<any>({});
  const [postText, setPostText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [postPage, setPostPage] = useState(1);
  const [postLimit, setPostLimit] = useState(10);
  const [postDetail, setPostDetail] = useState(false);
  const [canLoadMorePosts, setCanLoadMorePosts] = useState(true);
  const [activePost, setActivePost] = useState<any>({});
  const [intervalHandler, setIntervalHandler] = useState(null);
  const [now, setNow] = useState(new Date());
  const [activeLearningTest, setActiveLearningTest] = useState(null);
  const [completed, setCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [totalContents, setTotalContents] = useState(0);
  const [completedContents, setCompletedContents] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [resetAssignment, setResetAssignment] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const chartOptions: any = {
    chart: {
      height: 32,
      type: "pie",
    },
    dataLabels: {
      enabled: false,
      name: {
        show: false,
      },
      value: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
    fill: {
      colors: ["#00ff00", "#999999"],
    },
  };
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [viewDiscussion, setViewDiscussion] = useState(false);
  const [showContentSummaryModal, setShowContentSummaryModal] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // const chatFileUploaderRef = useRef(null);
  // const feedbackModalRef = useRef(null);

  // Function to handle setting active content and determining if it has a summary
  const handleSetActiveContent = (value: any) => {
    setActiveContent(value);
    let hasSummary = false;
    if (value) {
      if (value.type === "video") {
        hasSummary =
          value.note &&
          value.note.length !== 0 &&
          value.note.find((i: any) => i.data);
      } else {
        hasSummary = !!value.summary && !!value.summary.trim();
      }
    }
    setHasSummary(hasSummary);
  };

  const recordWatchedDuration = (data: any) => {
    if (activeContent) {
      setActiveContent({
        ...activeContent,
        videoWatchedSeconds: data.seconds,
      });
    }
  };

  const onQuestionNumberChanged = (ev: any) => {
    if (activeContent && activeContent.type == "quiz") {
      setActiveContent({ ...activeContent, questionNumber: ev.number });
    }
  };

  useEffect(() => {
    initialFunction();
  }, []);

  useEffect(() => {
    setActiveContent({
      ...activeContent,
      timeSpent: timeSpent,
    });
  }, [timeSpent]);

  const initialFunction = async () => {
    const courseData = await getCourse();
    const contentId = content;

    let foundSection: any;
    let foundContent: any;

    courseData.sections.forEach((sec: any) => {
      setTotalContents(totalContents + sec.contents.length);
      if (contentId && !foundContent) {
        foundContent = sec.contents.find((c: any) => c._id == contentId);
        if (foundContent) {
          foundSection = sec;
        }
      }
    });

    let activeSectionData: any;
    let activeContentData: any;

    if (foundSection) {
      activeSectionData = foundSection;
      activeContentData = activeSectionData;
    } else {
      activeSectionData = courseData.sections[0];
      activeContentData = courseData.sections[0].contents[0];
    }
    setActiveSection(activeSectionData);
    setActiveContent(activeContentData);

    getContentData(courseData, activeSectionData, activeContentData);
    setNextContentFunction(activeSectionData, activeContentData);

    setSectionProgress(courseData);
    checkInstructorsOnlineStatus(courseData);

    // update every 1 sec
    const intervalHandlerData = setInterval(() => {
      const now = new Date();

      // log incompleted course content's spent time
      if (activeContentData && !activeContentData.completed) {
        setTimeSpent((prev) => (prev + 1) * 100);
      }
    }, 1000);
  };

  const getCourse = async () => {
    let { data } = await clientApi.get(
      `/api/course/getTeacherCourseDetails/${id}`
    );
    data = {
      ...data,
      slug: slugify(data.title),
    };
    let courseData = data;
    courseData.canEdit =
      ["teacher", "mentor", "support"].indexOf(user.userRole) == -1 ||
      courseData.user._id == user.info._id ||
      courseData.instructors.find((i: any) => i._id == user.info._id);
    if (courseData.startDate) {
      courseData.startDate = new Date(courseData.startDate);
    }
    if (courseData.expiresOn) {
      courseData.expiresOn = new Date(courseData.expiresOn);
    }
    courseData.isExpired = isExpired(data);

    setCourse(courseData);
    setPageLoaded(true);

    return courseData;
  };

  const checkOptionalSections = (activeSectionIdx: any) => {
    let updateCourseData = course;
    for (let i = activeSectionIdx; i >= 0; i--) {
      if (updateCourseData.sections[i].optional) {
        updateCourseData.sections[i].contents.forEach(
          (c: any) => (c.unlock = true)
        );
      }
    }

    // if current section is optional, enable first content of next mandatory section
    if (updateCourseData.sections[activeSectionIdx].optional) {
      for (
        let i = activeSectionIdx + 1;
        i < updateCourseData.sections.length;
        i++
      ) {
        if (!updateCourseData.sections[i].optional) {
          updateCourseData.sections[i].contents[0].unlock = true;
          break;
        } else {
          updateCourseData.sections[i].contents.forEach(
            (c: any) => (c.unlock = true)
          );
        }
      }
    }
    setCourse(updateCourseData);
  };

  const checkInstructorsOnlineStatus = (courseData: any) => {
    if (courseData.instructors.length) {
      // TODO: implement socket and chat feature
      // socketSvc.on('user.left', (usr) => {
      //   const f = course.instructors.find(ins => ins._id == usr.user)
      //   if (f) {
      //     f.isOnline = false
      //   }
      // }, 'course-stage');
      // socketSvc.on('user.join', (usr) => {
      //   const f = course.instructors.find(ins => ins._id == usr.user)
      //   if (f) {
      //     f.isOnline = true
      //   }
      // }, 'course-stage');
      // init status
      // for (const ins of course.instructors) {
      //   chatSvc.userOnline(ins._id).then(isOnline => {
      //     ins.isOnline = isOnline
      //   })
      // }
    }
  };

  const setSectionProgress = (courseData: any) => {
    let sectionData = courseData.sections;
    courseData.sections.map((section: any, index: number) => {
      const progress = 99;
      sectionData[index].chartSeries = [progress, 100 - progress];
    });
    setCourse({
      ...courseData,
      sections: sectionData,
    });
  };

  const updateFavorite = () => {
    if (activeContent && !activeContent.processing) {
      const processingContent = activeContent;
      processingContent.processing = true;
      if (!processingContent.favorite) {
        addFavoriteContent(course._id, processingContent._id).then((a: any) => {
          processingContent.favorite = true;
          processingContent.processing = false;
        });
      } else {
        removeFavoriteContent(course._id, processingContent._id).then(
          (a: any) => {
            processingContent.favorite = false;
            processingContent.processing = false;
          }
        );
      }
      setActiveContent(processingContent);
    }
  };

  const loadPosts = () => {
    setPostPage((prev) => prev + 1);
    getPosts({
      feedType: "courseContent",
      course: course._id,
      courseContent: activeContent._id,
      page: postPage,
      limit: postLimit,
      header: true,
    }).then((posts: any[]) => {
      setPosts((prev) => prev.concat(posts));
      getPosts({
        feedType: "courseContent",
        course: course._id,
        courseContent: activeContent._id,
        limit: postLimit,
        count: true,
        header: true,
      }).then((postLength: any) => {
        if (postLength <= posts.length) {
          setCanLoadMorePosts(false);
        }
      });
    });
  };

  const getContentData = (
    courseData: any,
    activeSectionData: any,
    activeContentData: any
  ) => {
    if (activeContentData) {
      // refresh quiz component
      setResetAssignment(false);
      setTimeout(() => {
        setResetAssignment(true);
      }, 500);

      activeContentData.startDate = new Date(activeSectionData.startDate);
      // set complete flag
      // const uc = userCourse.contents.find(c => c._id == activeContent._id)
      // activeContent.completed = uc && uc.completed
      // activeContent.timeSpent = uc && uc.timeSpent ? uc.timeSpent : 0
      // notify server that user has started the content
      startContent(
        courseData._id,
        activeSectionData._id,
        activeContentData._id
      ).then((c: any) => {
        if (c) {
          setActiveContent({
            ...activeContentData,
            favorite: c.favorite,
          });
        }
      });

      if (
        activeContentData.type == "ebook" ||
        activeContentData.type == "video"
      ) {
        if (activeContentData.source) {
          getContentById(activeContentData.source).then((data: any) => {
            if (data.contentType == "video") {
              if (data.url) {
                setActiveContent({
                  ...activeContentData,
                  link: data.url,
                });
              } else {
                setActiveContent({
                  ...activeContentData,
                  link: getElearningFullPath(settings.baseUrl, data.filePath),
                });
              }
            } else if (data.contentType == "ebook") {
              let url = data.url;
              if (data.filePath) {
                url = getElearningFullPath(settings.baseUrl, data.filePath);
              }
              setActiveContent({
                ...activeContentData,
                link: bypassSecurityTrustHtml(
                  "<object data='" +
                  url +
                  "' type='application/pdf' className='embed-responsive-item' style='min-height:600px; width: 100%;'>" +
                  "Object " +
                  data.url +
                  " failed" +
                  "</object>"
                ),
              });
            }
          });
        } else {
          if (activeContentData.type == "video") {
            setActiveContent({
              ...activeContentData,
              link: activeContentData.url,
            });
          } else {
            setActiveContent({
              ...activeContentData,
              link: bypassSecurityTrustHtml(
                "<object data='" +
                activeContentData.url +
                "' type='application/pdf' className='embed-responsive-item' style='min-height:600px; width: 100%;'>" +
                "Object " +
                activeContentData.url +
                " failed" +
                "</object>"
              ),
            });
          }
        }
      }
      setPostPage(1);
      setCanLoadMorePosts(false);
      getPosts({
        feedType: "courseContent",
        course: courseData._id,
        courseContent: activeContentData._id,
        page: postPage,
        limit: postLimit,
        header: true,
      }).then((posts: any[]) => {
        posts = posts;
        getPosts({
          feedType: "courseContent",
          course: courseData._id,
          courseContent: activeContentData._id,
          limit: postLimit,
          count: true,
          header: true,
        }).then((postLength: any) => {
          if (postLength > postLimit) {
            setCanLoadMorePosts(true);
          }
        });
      });
    }
  };

  const markComplete = (e: any) => {
    if (processing) {
      return;
    }
    if (e && e.redirect) {
      return;
    }

    if (nextContent) {
      setActiveContent({});
      setTimeout(() => {
        setActiveContent(nextContent);
        const sectionIdx = course.sections.findIndex((s: any) => {
          return (
            s.contents.findIndex((c: any) => c._id == nextContent._id) > -1
          );
        });
        setActiveSection(course.sections[sectionIdx]);
        backToQuestions();
        getContentData(course, course.sections[sectionIdx], nextContent);
        setNextContentFunction(course.sections[sectionIdx], nextContent);

        checkOptionalSections(sectionIdx);
      }, 100);
    }
  };

  const getPreviousContent = (e: any) => {
    if (processing) {
      return;
    }
    setProcessing(true);
    completeContent(
      course._id,
      activeSection._id,
      activeContent._id,
      activeContent.timeSpent
    )
      .then((res: any) => {
        setProcessing(false);
        if (e && e.redirect) {
          return;
        }

        if (nextContent) {
          setActiveContent({});
          setTimeout(() => {
            setActiveContent(nextContent);
            const sectionIdx = course.sections.findIndex((s: any) => {
              return (
                s.contents.findIndex((c: any) => c._id == activeContent._id) >
                -1
              );
            });
            setActiveSection(course.sections[sectionIdx]);
            backToQuestions();
            getContentData(course, activeSection, activeContent);

            checkOptionalSections(sectionIdx);
          }, 100);
        }
      })
      .catch((err: any) => {
        setProcessing(false);
      });
  };

  const checkFeedback = (showComplete = false) => {
    // ask feedback if this course is completed or user has completed 30% of the course
    if (progress >= 30) {
      // check if user has already asked but choose to give feedback later
      const wasAsked = localStorage.getItem(
        `${user._id}_course_feedback_${course._id}`
      );
      if (wasAsked == "askLater" && progress < 100) {
        return;
      }
      // if user already gave feedback
      if (userCourse.feedback) {
        if (showComplete) {
          setCompleted(progress === 100);
        }
        return;
      }
      setUserCourse({
        ...userCourse,
        feedback: "",
        rating: 0,
      });
      setShowFeedbackModal(true);
    }
  };

  const openFeedback = () => {
    setUserCourse({
      ...userCourse,
      feedback: "",
      rating: 0,
    });
    setShowFeedbackModal(true);
  };

  const addQuestion = () => {
    post({
      feedType: "courseContent",
      course: course._id,
      courseContent: activeContent._id,
      description: compileDiscussion(postText),
    })
      .then((newpost: any) => {
        newpost.user = {
          _id: user._id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          avatar: user.avatar,
        };
        setPosts([newpost, ...posts]);
        setPostText("");
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const addComment = () => {
    comment(activePost._id, { description: commentText })
      .then((newpost: any) => {
        newpost.user = {
          _id: user._id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          avatar: user.avatar,
        };
        setActivePost({
          ...activePost,
          comments: activePost.comments.unshift(newpost),
        });
        if (!activePost.totalComments) {
          activePost.totalComments = 0;
        }
        setActivePost({
          ...activePost,
          totalContents: activePost.totalContents + 1,
        });
        setCommentText("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const backToQuestions = (openDiscussion = false) => {
    setPostDetail(false);
    setTimeout(() => {
      setActivePost(null);

      setTimeout(() => {
        setViewDiscussion(openDiscussion);
      }, 100);
    }, 100);
  };

  const iewPost = (post: any) => {
    setActivePost(post);
    setPostDetail(true);

    getComments(post._id).then((comments: any) => {
      setActivePost({
        ...activePost,
        comments: comments,
      });
    });
  };

  const viewPost = (post: any) => {
    setActivePost(post);
    setPostDetail(true);

    getComments(post._id).then((comments: any) => {
      setActivePost({
        ...activePost,
        comments: comments,
      });
    });
  };

  const deletePost = (post: any) => {
    confirm("Are you sure you want to delete this question?", (status: any) => {
      deleteFunc(post._id).then(() => {
        const pid = posts.findIndex((p: any) => p._id == post._id);
        if (pid > -1) {
          posts.splice(pid, 1);
        }
        success("Question is removed successfully.");
      });
    });
  };

  const deleteComment = (comment: any) => {
    confirm("Are you sure you want to delete this comment?", (status: any) => {
      deleteFunc(comment._id).then(() => {
        const pid = activePost.comments.findIndex(
          (p: any) => p._id == comment._id
        );
        if (pid > -1) {
          setActivePost({
            ...activePost,
            comments: activePost.comments.splice(pid, 1),
            totalComments: activePost.totalComments - 1,
          });
        }
        success("Question is removed successfully.");
      });
    });
  };

  const setNextContentFunction = (
    activeSectionData: any,
    activeContentData: any
  ) => {
    let idx = activeSectionData.contents.findIndex(
      (c: any) => c == activeContentData
    );
    if (idx < activeSectionData.contents.length - 1) {
      setNextContent(activeSectionData.contents[idx + 1]);
    } else {
      // find next content in next section
      idx = course.sections?.findIndex((s: any) => s == activeSectionData);
      if (idx < course.sections?.length - 1) {
        const nextSection = course.sections[idx + 1];
        setNextContent(nextSection.contents[0]);
      } else {
        setNextContent(null);
      }
    }
  };

  const selectContent = (content: any) => {
    if (content == activeContent) {
      return;
    }

    setActiveContent({});
    setTimeout(() => {
      setActiveContent(content);
      const section = course.sections.find((s: any) => {
        return s.contents.findIndex((c: any) => c._id == content._id) > -1;
      });
      setActiveSection(section);
      backToQuestions();
      getContentData(course, section, content);
      setNextContentFunction(section, content);
    }, 100);
  };

  const openTab = (e: any, tabId: any) => {
    e.preventDefault();
    const tabElement = document.querySelector(tabId);
    if (tabElement) {
      tabElement.classList.add("show"); // Assuming you're using Bootstrap classes for tab functionality
    }
  };

  const takeAssessment = (content: any) => {
    // save course content and test relationship
    localStorage.setItem(
      `${user._id}_${content.source}_course_content_back`,
      JSON.stringify({ course: course._id, content: content._id })
    );
    localStorage.setItem(
      `${user._id}_${content.source}_reference`,
      JSON.stringify({
        referenceType: "course",
        referenceId: course._id,
        courseContent: content._id,
      })
    );

    const nextRoute = `/course/view-mode-assessment/${content.source}`;
    router.push(nextRoute);
  };

  const viewReport = (content: any) => {
    router.push(`/student/assessments/${content.title}?id=${content.source}`);
  };

  const uploadFile = async (event: any) => {
    let active_post = activePost;
    const file = event.target.files[0];
    const fileName = file.name;
    const toCheck = fileName.toLowerCase();
    if (
      !toCheck.endsWith(".png") &&
      !toCheck.endsWith(".jpeg") &&
      !toCheck.endsWith(".jpg") &&
      !toCheck.endsWith(".bmp") &&
      !toCheck.endsWith(".gif")
    ) {
      error("Please choose only image.");
      return;
    }

    setUploading(true);

    /// upload it to server
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);
    formData.append("uploadType", "file");
    try {
      const { data: res } = await clientApi.post("/api/files/upload", formData);
      if (active_post) {
        try {
          let { data: newpost } = await clientApi.post(
            `/api/discussions/${active_post._id}`,
            {
              description: `<img src="${res.fileUrl}" alt="${res.originalname}"></img>`,
            }
          );
          newpost.user = {
            _id: user?.info._id,
            name: user?.name,
            avatarUrl: user?.info.avatarUrl,
            avatar: user?.info.avatar,
          };
          active_post.comments.unshift(newpost);
          if (!active_post.totalComments) {
            active_post.totalComments = 0;
          }
          active_post.totalComments++;
          setCommentText("");
        } catch (error) {
          console.log(error);
        } finally {
          setUploading(false);
        }
        setActivePost(active_post);
      } else {
        try {
          let { data: newpost } = await clientApi.post("/api/discussions", {
            feedType: "courseContent",
            course: course._id,
            courseContent: activeContent._id,
            description: `<img src="${res.fileUrl}" alt="${res.originalname}"></img>`,
          });
          success("Uploaded successfully");
          newpost.user = {
            _id: user?.info._id,
            name: user?.name,
            avatarUrl: user?.info.avatarUrl,
            avatar: user?.info.avatar,
          };
          posts.unshift(newpost);
          setPosts([...posts]);
          setPostText("");
        } catch (err) {
          console.log(err);
        } finally {
          setUploading(true);
        }
      }
    } catch (error) {
      setUploading(false);
      warning("upload fail!");
    }
  };

  console.log(activeContent);

  return (
    <LoadingOverlay
      active={!pageLoaded}
      spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
      styles={{
        overlay: (base: any) => ({
          ...base,
          height: "100vh",
        }),
      }}
    >
      {pageLoaded && (
        <div className="bg-white">
          <div className="top-head d-none d-lg-block">
            <div className="container">
              <div className="top-head-area mx-auto mw-100">
                <div className="row align-items-center">
                  <div className="col-lg">
                    <div className="logo d-flex align-items-center">
                      <Link className="navbar-brand p-0" href="/">
                        <figure>
                          <img
                            src={
                              (user?.info?.primaryInstitute?.logo != '')
                                ? user?.info?.primaryInstitute?.logo
                                : "https://d15aq2mos7k6ox.cloudfront.net/images/codemode_logo.png"
                            }
                            alt="this is Logo"
                            width="166"
                            height="28"
                          ></img>
                        </figure>
                      </Link>
                      <span>{course?.title}</span>
                    </div>
                  </div>

                  <div className="col-lg-auto">
                    <div className="progress-info">
                      <div className="d-flex flex-column mt-2">
                        <Link
                          className="btn btn-primary mb-1 w-100"
                          href={`../course/details/${course?._id}`}
                        >
                          Exit Teaching Mode
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="video-blog mx-auto pt-0">
            <div className="container">
              <div className="video-blog-area video-blog-area_new mx-auto mw-100">
                <div className="row flex-lg-nowrap">
                  <div className="col-lg-3 d-none d-lg-block">
                    <div className="side-menu">
                      <div className="accordion" id="accordion">
                        {course &&
                          course.sections &&
                          course.sections.map((section: any, i: number) => (
                            <div className="item" key={i}>
                              <div
                                id={`section${i}`}
                                className="row no-gutters section-chart-wrapper d-flex align-items-center"
                              >
                                <div className="col-auto section-chart align-self-start">
                                  <div className="custom-pie"></div>
                                </div>
                                <h2 className="col my-1">
                                  <button
                                    className="text-left border-0 p-0 bg-white"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target={`#collapse${i}`}
                                    aria-expanded="true"
                                    aria-controls={`collapse${i}`}
                                  >
                                    {section.title}{" "}
                                    {section.optional && (
                                      <em className="text-success">
                                        (Optional)
                                      </em>
                                    )}
                                  </button>
                                </h2>
                              </div>

                              <div
                                id={`collapse${i}`}
                                className={`collapse ${activeSection === section ? "show" : ""
                                  }`}
                                aria-labelledby={`section${i}`}
                                data-parent="#accordion"
                              >
                                <ul>
                                  {section.contents.map(
                                    (content: any, j: number) => (
                                      <li key={j}>
                                        <a
                                          onClick={() => selectContent(content)}
                                          role="button"
                                        >
                                          {content.type === "video" && (
                                            <span className="iconc-video">
                                              <span
                                                className={`text-dark ${content._id ===
                                                  activeContent?._id
                                                  ? "font-weight-bold"
                                                  : "font-weight-light"
                                                  }`}
                                                style={{
                                                  fontWeight:
                                                    content._id ===
                                                      activeContent._id
                                                      ? "800"
                                                      : "300",
                                                }}
                                              >
                                                {content.title}
                                              </span>
                                              {content.optional && (
                                                <em className="text-success">
                                                  (Optional)
                                                </em>
                                              )}
                                            </span>
                                          )}

                                          {content.type === "ebook" && (
                                            <span className="icon3-ebook">
                                              <span
                                                className={`text-dark ${content._id ===
                                                  activeContent?._id
                                                  ? "font-weight-bold"
                                                  : "font-weight-light"
                                                  }`}
                                                style={{
                                                  fontWeight:
                                                    content._id ===
                                                      activeContent._id
                                                      ? "800"
                                                      : "300",
                                                }}
                                              >
                                                {content.title}
                                              </span>
                                              {content.optional && (
                                                <em className="text-success">
                                                  (Optional)
                                                </em>
                                              )}
                                            </span>
                                          )}

                                          {content.type === "note" && (
                                            <span className="iconc-content">
                                              <span
                                                className={`text-dark ${content._id ===
                                                  activeContent?._id
                                                  ? "font-weight-bold"
                                                  : "font-weight-light"
                                                  }`}
                                                style={{
                                                  fontWeight:
                                                    content._id ===
                                                      activeContent._id
                                                      ? "800"
                                                      : "300",
                                                }}
                                              >
                                                {content.title}
                                              </span>
                                              {content.optional && (
                                                <em className="text-success">
                                                  (Optional)
                                                </em>
                                              )}
                                            </span>
                                          )}

                                          {content.type === "quiz" && (
                                            <span className="iconc-quiz">
                                              <span
                                                className={`text-dark ${content._id ===
                                                  activeContent?._id
                                                  ? "font-weight-bold"
                                                  : "font-weight-light"
                                                  }`}
                                                style={{
                                                  fontWeight:
                                                    content._id ===
                                                      activeContent._id
                                                      ? "800"
                                                      : "300",
                                                }}
                                              >
                                                {content.title}
                                              </span>
                                              {content.optional && (
                                                <em className="text-success">
                                                  (Optional)
                                                </em>
                                              )}
                                            </span>
                                          )}

                                          {content.type === "assessment" && (
                                            <span className="icon3-assesment">
                                              <span
                                                className={`text-dark ${content._id ===
                                                  activeContent?._id
                                                  ? "font-weight-bold"
                                                  : "font-weight-light"
                                                  }`}
                                                style={{
                                                  fontWeight:
                                                    content._id ===
                                                      activeContent._id
                                                      ? "800"
                                                      : "300",
                                                }}
                                              >
                                                {content.title}
                                              </span>
                                              {content.optional && (
                                                <em className="text-success">
                                                  (Optional)
                                                </em>
                                              )}
                                            </span>
                                          )}

                                          {content.type === "onlineSession" && (
                                            <span className="icon3-onlineSession">
                                              <span
                                                className={`text-dark ${content._id ===
                                                  activeContent?._id
                                                  ? "font-weight-bold"
                                                  : "font-weight-light"
                                                  }`}
                                                style={{
                                                  fontWeight:
                                                    content._id ===
                                                      activeContent._id
                                                      ? "800"
                                                      : "300",
                                                }}
                                              >
                                                {content.title}
                                              </span>
                                              {content.optional && (
                                                <em className="text-success">
                                                  (Optional)
                                                </em>
                                              )}
                                            </span>
                                          )}
                                        </a>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {activeSection && (
                    <div className="col-lg">
                      <div className="video-blog-area-wrap video-blog-area-wrap_new mx-auto mw-100 border-bottom-0">
                        {activeContent.type != "assessment" &&
                          activeContent.type != "onlineSession" && (
                            <div className="heading mb-3">
                              <div className="row align-items-center">
                                <div className="col">
                                  <h4>{activeContent.title}</h4>
                                  <span>{activeSection.title}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        {resetAssignment && (
                          <div>
                            {activeContent.type === "video" && (
                              <div className="video-player">
                                <VideoPlayer
                                  _link={activeContent.link}
                                  _height={400}
                                  watchedDuration={recordWatchedDuration}
                                />
                              </div>
                            )}

                            {activeContent.type === "ebook" && (
                              <div className="video-player">
                                {activeContent.link ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: activeContent.link,
                                    }}
                                    className="w-100 pdf-panel"
                                  ></div>
                                ) : (
                                  <figure>
                                    <img
                                      src="/assets/images/document.png"
                                      alt=""
                                    />
                                  </figure>
                                )}
                              </div>
                            )}

                            {activeContent.type === "quiz" && (
                              <div className="video-player default">
                                <TeacherCourseLearningTest
                                  user={user}
                                  settings={settings}
                                  courseId={course._id}
                                  content={activeContent}
                                  finished={markComplete}
                                />
                              </div>
                            )}

                            {activeContent.type === "note" && (
                              <div className="video-player default">
                                {activeContent.note ? (
                                  <div className="adaptive-question-area mx-auto mw-100">
                                    <div className="adaptive-question-box bg-white min-h-0">
                                      <ContentRenderer
                                        _content={activeContent?.note}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <figure>
                                    <img
                                      src="/assets/images/presentation.png"
                                      alt=""
                                    />
                                  </figure>
                                )}
                              </div>
                            )}

                            {activeContent.type === "assessment" && (
                              <div className="session mx-auto mw-100">
                                <div className="session-inner">
                                  <div className="session-inner-wrap">
                                    <div className="session-info">
                                      <figure style={{ display: 'flex', justifyContent: 'center' }}>
                                        <img
                                          src="/assets/images/assessment-schedule.png"
                                          alt=""
                                        />
                                      </figure>
                                      <div className="session-content mx-auto">
                                        {activeContent.startDate >= now ? (
                                          <>
                                            <h4 className="text-center">
                                              Assessment
                                            </h4>
                                            <p className="text-center">
                                              Your Session is Scheduled on
                                            </p>
                                            <span className="text-center">
                                              {activeContent.startDate}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <h4 className="text-center">
                                              Assessment
                                            </h4>
                                            <p className="text-center">
                                              Click on Take Assessment button to
                                              attempt assessment
                                            </p>
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                margin: "3px",
                                              }}
                                            >
                                              <div className="join-btn mx-auto">
                                                <a
                                                  className="text-center text-white px-2"
                                                  onClick={() =>
                                                    takeAssessment(
                                                      activeContent
                                                    )
                                                  }
                                                >
                                                  Show Assessment
                                                </a>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeContent.type === "onlineSession" && (
                              <div className="session mx-auto mw-100">
                                <div className="session-inner">
                                  <div className="session-inner-wrap">
                                    <div className="session-info">
                                      <figure>
                                        <img
                                          src="/assets/images/live-session.png"
                                          alt=""
                                        />
                                      </figure>
                                      <div className="session-content mx-auto">
                                        {activeContent.startDate >= now ? (
                                          <>
                                            <h4 className="text-center">
                                              Online Session
                                            </h4>
                                            <p className="text-center">
                                              Your Session is Scheduled on
                                            </p>
                                            <span className="text-center">
                                              {activeContent.startDate}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <h4 className="text-center">
                                              Online Session
                                            </h4>
                                            <p className="text-center">
                                              <a href={activeContent.link}>
                                                Click Here to Join Your Session
                                              </a>
                                            </p>
                                            <div className="join-btn mx-auto">
                                              <a
                                                className="text-center text-white px-2"
                                                href={activeContent.link}
                                              >
                                                JOIN
                                              </a>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeContent.type != "assessment" &&
                          activeContent.type != "onlineSession" && (
                            <div>
                              {!postDetail ? (
                                <>
                                  <div className="d-none d-lg-block">
                                    <div className="tabs mb-3">
                                      <ul
                                        className="nav nav-tabs border-0"
                                        id="videoCommentTab"
                                      >
                                        {hasSummary && (
                                          <li>
                                            <a
                                              role="button"
                                              onClick={() =>
                                                setViewDiscussion(false)
                                              }
                                              className={
                                                !viewDiscussion ? "active" : ""
                                              }
                                              data-target="#overview"
                                              data-toggle="tab"
                                            >
                                              Summary
                                            </a>
                                          </li>
                                        )}
                                        <li>
                                          <a
                                            role="button"
                                            onClick={() =>
                                              setViewDiscussion(true)
                                            }
                                            className={
                                              (!activeContent?.summary &&
                                                activeContent.type !==
                                                "video") ||
                                                (activeContent?.note?.length ===
                                                  0 &&
                                                  activeContent.type ===
                                                  "video") ||
                                                viewDiscussion
                                                ? "active"
                                                : ""
                                            }
                                            data-target="#question"
                                            data-toggle="tab"
                                          >
                                            Discussion
                                          </a>
                                        </li>
                                      </ul>
                                    </div>

                                    <div className="tab-content">
                                      <div
                                        className={`tab-pane fade ${!viewDiscussion ? "show active" : ""
                                          }`}
                                        id="overview"
                                      >
                                        {hasSummary && (
                                          <div className="adaptive-question-area mx-auto mw-100">
                                            {activeContent.summary &&
                                              activeContent.type !==
                                              "video" && (
                                                <div className="adaptive-question-box bg-white min-h-0">
                                                  <MathJax
                                                    className="cl-black text-element"
                                                    value={formatQuestion(
                                                      activeContent.summary
                                                    )}
                                                  />
                                                </div>
                                              )}
                                            {activeContent.note &&
                                              activeContent.note.length !== 0 &&
                                              activeContent.type ===
                                              "video" && (
                                                <div className="adaptive-question-box bg-white min-h-0">
                                                  <ContentRenderer
                                                    _content={
                                                      activeContent.note
                                                    }
                                                  />
                                                </div>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        className={`tab-pane fade ${(!activeContent?.summary &&
                                          activeContent.type != "video") ||
                                          (activeContent?.note?.length == 0 &&
                                            activeContent.type == "video") ||
                                          viewDiscussion
                                          ? "show active"
                                          : ""
                                          }`}
                                        id="question"
                                      >
                                        <div className="post-box post-box_new bg-white">
                                          <div className="comment-form comment-form_new d-flex">
                                            <figure>
                                              <div
                                                className="avatar"
                                                style={{
                                                  backgroundImage: `url(${user.avatar})`,
                                                }}
                                              ></div>
                                            </figure>

                                            <div style={{ width: "100%" }}>
                                              <div className="form-group mb-0">
                                                <div className="row no-gutters align-items-center">
                                                  <div className="col">
                                                    <input
                                                      type="text"
                                                      className="form-control"
                                                      name="post"
                                                      value={postText}
                                                      onChange={(e) =>
                                                        setPostText(
                                                          e.target.value
                                                        )
                                                      }
                                                      required
                                                      maxLength={250}
                                                      placeholder="Add a Comment or post a question"
                                                    />
                                                    <button
                                                      type="submit"
                                                      className="btn-icone"
                                                      aria-label="button-icone"
                                                      onClick={() =>
                                                        addQuestion()
                                                      }
                                                    >
                                                      <i className="far fa-paper-plane"></i>
                                                    </button>
                                                  </div>
                                                  <div className="col-auto">
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-link"
                                                      aria-label="upload-button"
                                                    >
                                                      <img
                                                        src="/assets/images/icon-clip2.png"
                                                        alt=""
                                                      />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="user-comment">
                                            {posts.map((post, index) => (
                                              <div
                                                key={index}
                                                className="user-comment-box d-flex mb-3 clearfix"
                                              >
                                                <figure>
                                                  <div
                                                    className="avatar"
                                                    style={{
                                                      backgroundImage: `url(${post.user.avatar})`,
                                                    }}
                                                  ></div>
                                                </figure>

                                                <div className="user-comment-info mb-0 w-100 pl-0">
                                                  <h4>{post.user.name}</h4>
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html: post.description,
                                                    }}
                                                  ></div>

                                                  <ul className="nav">
                                                    <li>
                                                      <a
                                                        className="text-primary"
                                                        onClick={() =>
                                                          viewPost(post)
                                                        }
                                                      >
                                                        Reply
                                                      </a>
                                                    </li>
                                                    <li>
                                                      <a
                                                        className="text-primary"
                                                        onClick={() =>
                                                          viewPost(post)
                                                        }
                                                      >
                                                        View Replies
                                                      </a>
                                                    </li>
                                                    {post.user._id ===
                                                      user._id && (
                                                        <li>
                                                          <a
                                                            onClick={() =>
                                                              deletePost(post)
                                                            }
                                                            className="text-danger"
                                                          >
                                                            Delete
                                                          </a>
                                                        </li>
                                                      )}
                                                    <li>{post.updatedAt}</li>
                                                  </ul>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="d-block d-lg-none">
                                    <div className="tabs mb-3">
                                      <ul
                                        className="nav nav-tabs border-0"
                                        id="videoCommentTab"
                                      >
                                        <li className="mr-4">
                                          <a
                                            role="button"
                                            data-target="#learn"
                                            data-toggle="tab"
                                          >
                                            Learn
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            role="button"
                                            className="active px-2"
                                            data-target="#ques"
                                            data-toggle="tab"
                                          >
                                            Discussion
                                          </a>
                                        </li>
                                      </ul>
                                    </div>

                                    <div className="tab-content">
                                      <div
                                        className="tab-pane show active fade"
                                        id="ques"
                                      >
                                        <div className="post-box post-box_new bg-white">
                                          <div className="comment-form comment-form_new clearfix d-none d-lg-block">
                                            <figure>
                                              <div
                                                className="avatar"
                                                style={{
                                                  backgroundImage: `url(${user.avatar})`,
                                                }}
                                              ></div>
                                            </figure>

                                            <div style={{ width: "100%" }}>
                                              <div className="form-group mb-0">
                                                <div className="row no-gutters align-items-center">
                                                  <div className="col">
                                                    <input
                                                      type="text"
                                                      className="form-control"
                                                      name="post"
                                                      value={postText}
                                                      onChange={(e) =>
                                                        setPostText(
                                                          e.target.value
                                                        )
                                                      }
                                                      required
                                                      maxLength={250}
                                                      placeholder="Add a Comment or post a question"
                                                    />
                                                    <button
                                                      type="submit"
                                                      className="btn-icone"
                                                      aria-label="button-icone"
                                                      onClick={() =>
                                                        addQuestion()
                                                      }
                                                    >
                                                      <i className="far fa-paper-plane"></i>
                                                    </button>
                                                  </div>
                                                  <div className="col-auto">
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-link"
                                                      aria-label="upload-button"
                                                    >
                                                      <img
                                                        src="/assets/images/icon-clip2.png"
                                                        alt=""
                                                      />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="user-comment">
                                            {posts.map(
                                              (post: any, index: number) => (
                                                <div
                                                  key={index}
                                                  className="user-comment-box d-flex mb-3 clearfix"
                                                >
                                                  <figure>
                                                    <div
                                                      className="avatar"
                                                      style={{
                                                        backgroundImage: `url(${post.user.avatar})`,
                                                      }}
                                                    ></div>
                                                  </figure>

                                                  <div className="user-comment-info mb-0 w-100 pl-0">
                                                    <h4>{post.user.name}</h4>
                                                    <div
                                                      dangerouslySetInnerHTML={{
                                                        __html:
                                                          post.description,
                                                      }}
                                                    ></div>

                                                    <ul className="nav">
                                                      <li>
                                                        <a
                                                          className="text-primary"
                                                          onClick={() =>
                                                            viewPost(post)
                                                          }
                                                        >
                                                          Reply
                                                        </a>
                                                      </li>
                                                      <li>
                                                        <a
                                                          className="text-primary"
                                                          onClick={() =>
                                                            viewPost(post)
                                                          }
                                                        >
                                                          View Replies
                                                        </a>
                                                      </li>
                                                      {post.user._id ===
                                                        user._id && (
                                                          <li>
                                                            <a
                                                              onClick={() =>
                                                                deletePost(post)
                                                              }
                                                              className="text-danger"
                                                            >
                                                              Delete
                                                            </a>
                                                          </li>
                                                        )}
                                                      <li>{post.updatedAt}</li>
                                                    </ul>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>

                                          <div className="border"></div>

                                          <div className="comment-form comment-form_new clearfix d-block d-lg-none pt-3">
                                            <div style={{ width: "100%" }}>
                                              <div className="form-group mb-0">
                                                <div className="row no-gutters align-items-center">
                                                  <div className="col">
                                                    <input
                                                      type="text"
                                                      className="form-control"
                                                      name="post"
                                                      value={postText}
                                                      onChange={(e) =>
                                                        setPostText(
                                                          e.target.value
                                                        )
                                                      }
                                                      required
                                                      maxLength={250}
                                                      placeholder="Add a Comment or post a question"
                                                    />
                                                    <button
                                                      type="submit"
                                                      className="btn-icone"
                                                      aria-label="button-icone"
                                                    >
                                                      <i className="far fa-paper-plane"></i>
                                                    </button>
                                                  </div>
                                                  <div className="col-auto">
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-link"
                                                      aria-label="upload-button"
                                                      onClick={() =>
                                                        addQuestion()
                                                      }
                                                    >
                                                      <img
                                                        src="/assets/images/icon-clip2.png"
                                                        alt=""
                                                      />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="tab-pane fade" id="learn">
                                        <div className="side-menu">
                                          <div
                                            className="accordion"
                                            id="accordionMobile"
                                          >
                                            {course?.sections.map(
                                              (section: any, i: any) => (
                                                <div
                                                  key={i}
                                                  id={`section${i}Mobile`}
                                                >
                                                  <div
                                                    id={`section${i}`}
                                                    className="row no-gutters section-chart-wrapper align-items-center"
                                                  >
                                                    <div className="col-auto section-chart align-self-start">
                                                      <Chart
                                                        series={
                                                          section.chartSeries ||
                                                          []
                                                        }
                                                        options={chartOptions}
                                                        type="pie"
                                                        height={32}
                                                      />
                                                    </div>
                                                    <h2 className="col section-title">
                                                      <button
                                                        className="text-left border-0 p-0 bg-white"
                                                        type="button"
                                                        data-toggle="collapse"
                                                        data-target={`#collapse${i}`}
                                                        aria-expanded="true"
                                                        aria-controls={`collapse${i}`}
                                                      >
                                                        {section.title}
                                                        {section.optional && (
                                                          <em className="text-success">
                                                            (Optional)
                                                          </em>
                                                        )}
                                                      </button>
                                                    </h2>
                                                  </div>
                                                  <h2>
                                                    <button
                                                      className="text-left border-0 p-0"
                                                      type="button"
                                                      data-toggle="collapse"
                                                      data-target={`#collapseContent${i}Mobile`}
                                                      aria-expanded="true"
                                                      aria-controls={`collapseContent${i}Mobile`}
                                                    >
                                                      {section.title}
                                                    </button>
                                                  </h2>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="tabs mb-3">
                                  <ul
                                    className="nav nav-tabs border-0"
                                    id="videoCommentTab"
                                  >
                                    <li>
                                      <a
                                        role="button"
                                        className="active px-2"
                                        data-target="#ques2"
                                        data-toggle="tab"
                                      >
                                        Discussion
                                      </a>
                                    </li>
                                  </ul>

                                  <div className="tab-content">
                                    <div
                                      className="tab-pane show active fade"
                                      id="ques2"
                                    >
                                      <div className="post-box post-box_new bg-white">
                                        <div className="user-comment">
                                          <div className="mark-btn-remove-back-to-all my-4 d-block">
                                            <button
                                              className="btn btn-outline"
                                              onClick={() =>
                                                backToQuestions(true)
                                              }
                                            >
                                              Back to All Questions
                                            </button>
                                          </div>

                                          <div className="user-comment-box d-flex mb-3 clearfix">
                                            <figure>
                                              <div
                                                className="avatar"
                                                style={{
                                                  backgroundImage: `url(${activePost?.user?.avatar})`,
                                                }}
                                              ></div>
                                            </figure>
                                            <div className="user-comment-info mb-0 w-100 pl-0">
                                              <h4>{activePost?.user?.name}</h4>
                                              <div
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    activePost.description,
                                                }}
                                              ></div>
                                            </div>
                                          </div>

                                          <div className="reply-info mb-3">
                                            <p>
                                              {activePost.totalComments} Replies
                                            </p>
                                          </div>

                                          {activePost.comments &&
                                            activePost.comments.map(
                                              (comment: any, index: any) => (
                                                <div
                                                  key={index}
                                                  className="user-comment-box d-flex mb-3 clearfix"
                                                >
                                                  <figure>
                                                    <div
                                                      className="avatar"
                                                      style={{
                                                        backgroundImage: `url(${comment.user.avatar})`,
                                                      }}
                                                    ></div>
                                                  </figure>
                                                  <div className="user-comment-info mb-0 w-100 pl-0">
                                                    <h4>{comment.user.name}</h4>
                                                    <div
                                                      dangerouslySetInnerHTML={{
                                                        __html:
                                                          comment.description,
                                                      }}
                                                    ></div>
                                                    {comment.user._id ===
                                                      user._id && (
                                                        <ul className="nav">
                                                          <li
                                                            onClick={() =>
                                                              deleteComment(
                                                                comment
                                                              )
                                                            }
                                                            className="text-danger"
                                                          >
                                                            Delete
                                                          </li>
                                                        </ul>
                                                      )}
                                                  </div>
                                                </div>
                                              )
                                            )}

                                          <div className="comment-form comment-form_new clearfix d-none d-lg-flex">
                                            <figure>
                                              <div
                                                className="avatar"
                                                style={{
                                                  backgroundImage: `url(${user.avatar})`,
                                                }}
                                              ></div>
                                            </figure>
                                            <div>
                                              <div className="form-group">
                                                <div className="row no-gutters align-items-center">
                                                  <div className="col">
                                                    <input
                                                      type="text"
                                                      className="form-control"
                                                      name="comment"
                                                      value={commentText}
                                                      onChange={(e) =>
                                                        setCommentText(
                                                          e.target.value
                                                        )
                                                      }
                                                      required
                                                      maxLength={250}
                                                      placeholder="Add a Comment"
                                                    />
                                                    <button
                                                      type="submit"
                                                      className="btn-icone"
                                                      aria-label="button-icone"
                                                      onClick={() =>
                                                        addComment()
                                                      }
                                                    >
                                                      <i className="far fa-paper-plane"></i>
                                                    </button>
                                                  </div>
                                                  <div className="col-auto">
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-link"
                                                      disabled={uploading}
                                                      onClick={() =>
                                                        setUploading(true)
                                                      }
                                                      aria-label="upload-button"
                                                    >
                                                      <img
                                                        src="/assets/images/icon-clip2.png"
                                                        alt=""
                                                      />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="border d-block d-lg-none"></div>

                                          <div className="comment-form comment-form_new clearfix d-block d-lg-none pt-3">
                                            <div>
                                              <div className="form-group">
                                                <div className="row no-gutters align-items-center">
                                                  <div className="col">
                                                    <input
                                                      type="text"
                                                      className="form-control"
                                                      name="comment"
                                                      value={commentText}
                                                      onChange={(e) =>
                                                        setCommentText(
                                                          e.target.value
                                                        )
                                                      }
                                                      required
                                                      maxLength={250}
                                                      placeholder="Add a Comment"
                                                    />
                                                    <button
                                                      type="submit"
                                                      className="btn-icone"
                                                      aria-label="button-icone"
                                                      onClick={() =>
                                                        addComment()
                                                      }
                                                    >
                                                      <i className="far fa-paper-plane"></i>
                                                    </button>
                                                  </div>
                                                  <div className="col-auto">
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-link"
                                                      disabled={uploading}
                                                      onClick={() =>
                                                        setUploading(true)
                                                      }
                                                      aria-label="upload-button"
                                                    >
                                                      <img
                                                        src="/assets/images/icon-clip2.png"
                                                        alt=""
                                                      />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {!postDetail && canLoadMorePosts && (
                                <div className="load-more-result my-5 mx-auto">
                                  <a
                                    className="text-center px-2"
                                    onClick={() => loadPosts()}
                                  >
                                    Load more Discussions
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                      </div>

                      {nextContent && !postDetail && (
                        <div className="text-center">
                          <a
                            className="btn btn-outline d-none d-lg-block mx-2"
                            role="button"
                            style={{ border: "1px solid var(--primary)" }}
                            onClick={(e: any) => markComplete(e)}
                          >
                            Next
                          </a>
                          <a
                            className="btn btn-outline d-block d-lg-none fixed-bottom"
                            role="button"
                            style={{ border: "1px solid var(--primary)" }}
                            onClick={(e: any) => markComplete(e)}
                          >
                            Next
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      <Modal
        show={showContentSummaryModal}
        onHide={() => { }}
        backdrop="static"
        keyboard={false}
        className="forgot-pass-modal"
      >
        <div className="modal-dialog modal-sm" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="contentSummaryModalLabel">
                {nextContent?.title}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            {nextContent?.summary ? (
              <div className="modal-body">
                <p>{nextContent?.summary}</p>
              </div>
            ) : (
              <div className="modal-bodytext-center">
                <div className="empty-data my-0">
                  <svg
                    id="fd86286a-adcb-4d81-b7ed-f4cd333bf213"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="200.89861"
                    height="200"
                    viewBox="0 0 1036.89861 660"
                  >
                    <title>quiz</title>
                    <rect
                      x="45.02923"
                      y="494.17018"
                      width="785.45192"
                      height="2.78529"
                      fill="#3f3d56"
                    />
                    <rect width="899.86782" height="437.90359" fill="#3f3d56" />
                    <path
                      d="M981.41852,153.68489V141.65457H953.74878V120H941.71847v21.65457H121.25075V120H109.22043v21.65457H81.55069v12.03032h27.66974V524.2187H81.55069V536.249h27.66974v21.65457h12.03032V536.249H941.71847v21.65457h12.03031V536.249h27.66974V524.2187H953.74878V153.68489Zm-39.7,370.53381H121.25075V153.68489H941.71847Z"
                      transform="translate(-81.55069 -120)"
                      opacity="0.1"
                    />
                    <rect
                      x="397.73891"
                      y="57.74553"
                      width="141.88698"
                      height="134.9673"
                      fill="#d0cde1"
                    />
                    <rect
                      x="413.86243"
                      y="73.86905"
                      width="109.63994"
                      height="83.84231"
                      fill="#6c63ff"
                    />
                    <rect
                      x="437.98851"
                      y="87.64755"
                      width="38.437"
                      height="38.437"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M534.25342,217.2593v46.67356H580.927V217.2593Zm44.64908,44.649H536.27789V219.28377H578.9025Z"
                      transform="translate(-81.55069 -120)"
                      fill="#3f3d56"
                    />
                    <rect
                      x="413.75384"
                      y="166.03325"
                      width="59.63671"
                      height="3.13877"
                      fill="#f2f2f2"
                    />
                    <circle
                      cx="468.68239"
                      cy="65.59246"
                      r="6.27755"
                      fill="#3f3d56"
                    />
                    <rect
                      x="451.25154"
                      y="252.40895"
                      width="141.88698"
                      height="134.9673"
                      fill="#d0cde1"
                    />
                    <rect
                      x="467.37506"
                      y="268.53247"
                      width="109.63994"
                      height="83.84231"
                      fill="#6c63ff"
                    />
                    <rect
                      x="467.26648"
                      y="362.26606"
                      width="59.63671"
                      height="3.13877"
                      fill="#f2f2f2"
                    />
                    <rect
                      x="467.26648"
                      y="371.68238"
                      width="59.63671"
                      height="3.13877"
                      fill="#f2f2f2"
                    />
                    <circle
                      cx="486.88382"
                      cy="310.47628"
                      r="12.5551"
                      fill="#3f3d56"
                    />
                    <circle
                      cx="522.19503"
                      cy="310.47628"
                      r="12.5551"
                      fill="#f2f2f2"
                    />
                    <circle
                      cx="557.50625"
                      cy="310.47628"
                      r="12.5551"
                      fill="#ff6584"
                    />
                    <circle
                      cx="522.19503"
                      cy="260.25589"
                      r="6.27755"
                      fill="#3f3d56"
                    />
                    <rect
                      x="234.10182"
                      y="210.23848"
                      width="141.88698"
                      height="134.9673"
                      fill="#d0cde1"
                    />
                    <rect
                      x="250.22534"
                      y="226.362"
                      width="109.63994"
                      height="83.84231"
                      fill="#6c63ff"
                    />
                    <circle
                      cx="297.7449"
                      cy="278.08168"
                      r="26.61894"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M387.14143,418.61352a33.37392,33.37392,0,1,1,33.37392-33.37392A33.41168,33.41168,0,0,1,387.14143,418.61352Zm0-65.53424a32.16033,32.16033,0,1,0,32.16033,32.16032A32.19651,32.19651,0,0,0,387.14143,353.07928Z"
                      transform="translate(-81.55069 -120)"
                      fill="#3f3d56"
                    />
                    <rect
                      x="250.11676"
                      y="327.94252"
                      width="59.63671"
                      height="3.13877"
                      fill="#f2f2f2"
                    />
                    <rect
                      x="250.11676"
                      y="318.5262"
                      width="83.17752"
                      height="3.13877"
                      fill="#f2f2f2"
                    />
                    <circle
                      cx="305.04531"
                      cy="218.08542"
                      r="6.27755"
                      fill="#3f3d56"
                    />
                    <rect
                      x="78.15325"
                      y="55.33946"
                      width="141.88698"
                      height="134.9673"
                      fill="#d0cde1"
                    />
                    <rect
                      x="94.27677"
                      y="71.46299"
                      width="109.63994"
                      height="83.84231"
                      fill="#6c63ff"
                    />
                    <rect
                      x="137.30344"
                      y="137.09908"
                      width="23.58659"
                      height="6.98967"
                      fill="#3f3d56"
                    />
                    <rect
                      x="108.78832"
                      y="82.67952"
                      width="80.61684"
                      height="2.99557"
                      fill="#3f3d56"
                    />
                    <rect
                      x="108.78832"
                      y="92.1655"
                      width="80.61684"
                      height="2.99557"
                      fill="#3f3d56"
                    />
                    <rect
                      x="108.78832"
                      y="101.65148"
                      width="80.61684"
                      height="2.99557"
                      fill="#3f3d56"
                    />
                    <rect
                      x="108.78832"
                      y="111.13746"
                      width="80.61684"
                      height="2.99557"
                      fill="#3f3d56"
                    />
                    <rect
                      x="108.78832"
                      y="120.62344"
                      width="80.61684"
                      height="2.99557"
                      fill="#3f3d56"
                    />
                    <rect
                      x="94.16818"
                      y="163.62718"
                      width="59.63671"
                      height="3.13877"
                      fill="#f2f2f2"
                    />
                    <rect
                      x="94.16818"
                      y="171.47412"
                      width="83.17752"
                      height="3.13877"
                      fill="#f2f2f2"
                    />
                    <circle
                      cx="149.09674"
                      cy="63.1864"
                      r="6.27755"
                      fill="#3f3d56"
                    />
                    <path
                      d="M736.34136,263.5099l102.75768,7.55L868.1588,273.195l-1.80455-1.80455,5.45746,78.94095,2.72873,39.47048c.11025,1.59476.22337,3.18935.33075,4.7843.08927,1.326.4544,2.60355-1.11626,2.9308-3.1231.65069-6.375.92164-9.53893,1.32092q-9.64688,1.21743-19.33725,2.04886a490.06,490.06,0,0,1-77.70424.48715q-9.69743-.71021-19.36133-1.80753c-2.396-.27191-5.3699-.374-6.24485-3.06059-.90221-2.77026-1.05707-5.91942-1.46487-8.79368q-2.72528-19.20842-3.71435-38.61375a443.03351,443.03351,0,0,1,2.73037-77.25819q.581-4.70689,1.26884-9.39932c.33136-2.27193-3.14569-3.25277-3.48017-.95945a446.73739,446.73739,0,0,0-4.45859,80.001q.69924,20.07207,3.21363,40.02566.63617,5.03973,1.38148,10.065c.39608,2.66571.49363,5.80938,2.08021,8.10011,1.5307,2.21007,4.1012,2.91906,6.62733,3.25582,3.21513.42861,6.45157.73575,9.67944,1.0507a489.84415,489.84415,0,0,0,80.6337,1.19277q10.14215-.6871,20.24992-1.79435,4.9792-.54577,9.94649-1.19372,2.43128-.31716,4.85969-.656a22.37512,22.37512,0,0,0,4.46666-.77769c3.0408-1.0963,3.03979-4.02934,2.85083-6.76264l-.70285-10.16663-1.40571-20.33328-5.66418-81.93114-.70286-10.16664a1.85761,1.85761,0,0,0-1.80454-1.80454l-102.75768-7.55-29.05976-2.13512c-2.31712-.17025-2.3063,3.43964,0,3.60909Z"
                      transform="translate(-81.55069 -120)"
                      fill="#d0cde1"
                    />
                    <path
                      d="M780.37753,306.11775c.51883-1.37759-.78584,1.58957-.13064.27681.17412-.34888.33685-.70156.52146-1.04538a19.938,19.938,0,0,1,1.21978-1.98189c.4429-.63424,1.11587-.87887-.19388.22431a9.44307,9.44307,0,0,0,.76-.88085,22.19276,22.19276,0,0,1,1.95193-1.89242c.49473-.42459,1.43128-.78593-.24435.15444.33133-.186.63882-.46442.95535-.67724q.9737-.65463,2.00847-1.21164.5171-.27856,1.04726-.53188c.60014-.2868,1.59956-.38544-.28989.098.81106-.20751,1.59594-.59126,2.40714-.82152q1.034-.29351,2.09089-.49405c.62942-.11861,1.77166-.029-.37771.02041.38435-.00883.77774-.083,1.16237-.109a21.941,21.941,0,0,1,2.3288-.03489c.38807.015.77324.05348,1.16057.07661,1.28677.07684-1.94745-.35742-.00042.01354a19.65246,19.65246,0,0,1,2.25936.56993,8.60024,8.60024,0,0,0,1.10534.38783l-.99838-.43015q.36739.1596.728.334a20.08614,20.08614,0,0,1,2.08,1.16346c.33359.21337.65269.445.97986.6675,1.0273.6987-1.37676-1.17594.08013.10115q.74146.65,1.42243,1.36522.40885.42883.79486.87871c.43314.50441.76438,1.42567-.139-.22557.82691,1.51148,1.86035,2.88245,2.63913,4.44069.66429,1.32914-.60539-1.65088-.10088-.25161.136.37728.28226.74985.41061,1.13q.38509,1.14075.66457,2.31361c.18657.78308.27792,1.58253.44991,2.36621-.47335-2.15689-.12719-.9093-.08058-.32327q.06361.7997.07673,1.60234.016,1.00139-.04859,2.00226c-.02547.39066-.113.806-.10777,1.196-.0271-2.025.14657-1.01649.02064-.3363a22.68171,22.68171,0,0,1-.56036,2.33448q-.1715.5768-.3741,1.14342-.18006.50261-.37956.9978.58181-1.3554.09275-.25763c-1.99328,3.98659-4.47673,7.70371-6.43726,11.70413a53.40246,53.40246,0,0,0-4.67971,32.16207,7.22166,7.22166,0,0,0,3.31719,4.31382,7.37059,7.37059,0,0,0,5.562.72765c4.06859-1.31665,5.66815-4.86891,5.04146-8.87923-.22076-1.41272.11579,1.25968-.0286-.1628-.06192-.61005-.12384-1.219-.167-1.83078q-.12926-1.83419-.10533-3.6744.02021-1.57609.15156-3.14776a9.3298,9.3298,0,0,1,.18971-1.82894c-.00117.00389-.23251,1.45125-.07532.61815.06487-.34379.11114-.69191.1727-1.03649a44.59427,44.59427,0,0,1,1.79247-6.85428c.17323-.49616.36265-.98575.54522-1.47842.48191-1.30049-.50125,1.044.08123-.21473.51956-1.12281,1.05732-2.2309,1.649-3.31783,2.48482-4.56487,5.29537-8.842,7.1056-13.752a28.85557,28.85557,0,0,0,1.60166-12.0305c-.66969-8.41857-4.23915-16.96036-10.89178-22.411a28.40744,28.40744,0,0,0-25.0969-5.71855A30.00658,30.00658,0,0,0,766.45683,302.28c-1.33341,3.54049,1.47926,8.06787,5.04147,8.87923,4.10613.93524,7.45156-1.25067,8.87923-5.04147Z"
                      transform="translate(-81.55069 -120)"
                      fill="#d0cde1"
                    />
                    <path
                      d="M805.59589,392.11633a6,6,0,1,0-6-6,6.06754,6.06754,0,0,0,6,6Z"
                      transform="translate(-81.55069 -120)"
                      fill="#d0cde1"
                    />
                    <rect
                      x="39.7895"
                      y="481.98978"
                      width="33.68489"
                      height="33.68489"
                      fill="#6c63ff"
                    />
                    <path
                      d="M175.47663,616.42616H134.57355V575.52308h40.90308Zm-39.12469-1.77839h37.34629V577.30148H136.35194Z"
                      transform="translate(-81.55069 -120)"
                      fill="#3f3d56"
                    />
                    <path
                      d="M905.026,420.15645l-4.81212,14.43638s-30.0758,34.88792-8.42123,39.70005,24.06064-37.294,24.06064-37.294l6.01516-12.03032Z"
                      transform="translate(-81.55069 -120)"
                      fill="#ffb8b8"
                    />
                    <path
                      d="M938.71089,245.71683s-7.2182-1.203-9.62426,27.66973-3.60909,79.4001-3.60909,79.4001L897.8078,423.76554l34.88793,10.82729,16.84244-80.60314Z"
                      transform="translate(-81.55069 -120)"
                      fill="#575a89"
                    />
                    <polygon
                      points="841.521 555.199 837.912 578.057 870.394 578.057 869.191 555.199 841.521 555.199"
                      fill="#ffb8b8"
                    />
                    <polygon
                      points="946.185 580.463 943.778 611.742 965.433 614.148 965.433 578.057 946.185 580.463"
                      fill="#ffb8b8"
                    />
                    <path
                      d="M936.30482,376.8473,908.63509,535.6475l7.21819,144.36382h37.294V548.88085l36.09095-67.36978L1018.111,565.7233l7.21819,140.75473,40.90308-7.2182L1056.608,562.1142s-7.21819-182.86084-14.43639-185.2669S936.30482,376.8473,936.30482,376.8473Z"
                      transform="translate(-81.55069 -120)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M926.68057,690.83861s0-12.03032-9.62426-4.81213S895.40174,706.478,895.40174,706.478s-45.71521,25.26366-13.23335,28.87276,52.9334-16.84245,52.9334-16.84245l3.6091,3.6091s19.2485-3.6091,19.2485-8.42122a92.88949,92.88949,0,0,0-1.203-12.03032s-2.5303-20.40612-5.47576-16.21822S931.49269,698.0568,926.68057,690.83861Z"
                      transform="translate(-81.55069 -120)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M1048.18678,724.5235s-21.65457-10.82728-26.4667-1.203-8.42122,28.87277-8.42122,28.87277S997.65945,782.269,1025.32918,779.863s26.4667-18.04548,26.4667-21.65457-1.203-12.03032,0-15.63942S1048.18678,724.5235,1048.18678,724.5235Z"
                      transform="translate(-81.55069 -120)"
                      fill="#2f2e41"
                    />
                    <circle
                      cx="919.11633"
                      cy="44.51218"
                      r="33.68489"
                      fill="#ffb8b8"
                    />
                    <polygon
                      points="896.86 60.753 895.657 104.062 938.966 100.453 938.966 60.753 896.86 60.753"
                      fill="#ffb8b8"
                    />
                    <path
                      d="M1022.92311,198.79859s-20.45154,13.23335-26.4667,15.63941-19.24851-9.62425-19.24851-9.62425-3.60909,2.40606-3.60909,4.81212-2.40606,12.03032-2.40606,12.03032L942.32,316.69571l2.40606,67.36978s87.82133,8.42122,97.44558-2.40606-4.81212-166.0184-4.81212-166.0184Z"
                      transform="translate(-81.55069 -120)"
                      fill="#d0cde1"
                    />
                    <path
                      d="M1016.908,224.06225s-32.48186,12.03032-43.30915,1.203C973.59881,225.26529,989.23822,228.87438,1016.908,224.06225Z"
                      transform="translate(-81.55069 -120)"
                      opacity="0.1"
                    />
                    <path
                      d="M1102.32322,485.12017c-13.23335,8.42122-56.5425,19.24851-56.5425,19.24851s-4.728-101.83661-21.65457-117.89713c-16.83041-15.98826-44.30776-131.25081-19.59744-151.29329a3.70257,3.70257,0,0,1,.34893-.28872l15.63941-36.091s2.40606-3.6091,7.21819,1.203a131.36557,131.36557,0,0,1,10.82729,13.23335l.68581.27667,32.99908,12.95668-13.23335,58.94856S1115.55657,476.69894,1102.32322,485.12017Z"
                      transform="translate(-81.55069 -120)"
                      fill="#575a89"
                    />
                    <path
                      d="M1039.24834,213.51164l-9.107,33.40822-25.6126-11.7416a3.70257,3.70257,0,0,1,.34893-.28872l15.63941-36.091s2.40606-3.6091,7.21819,1.203a131.36557,131.36557,0,0,1,10.82729,13.23335Z"
                      transform="translate(-81.55069 -120)"
                      opacity="0.1"
                    />
                    <path
                      d="M976.60639,204.21223l-3.6091,40.90308-.19238,1.86469L945.32756,508.57929s-24.06064-8.42123-32.48186-18.04548,19.24851-116.69409,19.24851-116.69409l2.40606-134.73957s21.34178-15.02585,30.06376-23.27871c2.04509-1.92482,3.39263-3.4767,3.62114-4.391C969.3882,206.61829,976.60639,204.21223,976.60639,204.21223Z"
                      transform="translate(-81.55069 -120)"
                      fill="#575a89"
                    />
                    <path
                      d="M976.60639,204.21223l-3.6091,40.90308-.19238,1.86469-17.25158-2.4662,9.0107-28.69236c2.04509-1.92482,3.39263-3.4767,3.62114-4.391C969.3882,206.61829,976.60639,204.21223,976.60639,204.21223Z"
                      transform="translate(-81.55069 -120)"
                      opacity="0.1"
                    />
                    <path
                      d="M1040.96859,406.9231l-13.23335,12.03031s6.01516,25.26367,13.23335,26.4667c0,0,4.81213-7.21819,6.01516-13.23335s12.03032-12.03031,12.03032-12.03031Z"
                      transform="translate(-81.55069 -120)"
                      fill="#ffb8b8"
                    />
                    <path
                      d="M1056.608,224.06225l15.63941,2.40607s51.73037,87.82132,45.71521,119.10015-54.13643,85.41526-54.13643,85.41526l-30.0758-24.06063,44.51218-60.1516L1055.405,274.58959Z"
                      transform="translate(-81.55069 -120)"
                      fill="#575a89"
                    />
                    <path
                      d="M966.90608,168.29567s0-29.70655,7.21893-36.458h8.66271s10.1065-14.85328,23.10057-9.45209,34.65086,14.85328,33.20708,29.70655-5.94648,24.45041-5.94648,24.45041-2.40607,0-7.76912-8.07466c-7.16647-10.78991,9.38461-7.42664-12.27218-11.47753s-34.65086-9.45209-37.53843-4.0509S966.90608,168.29567,966.90608,168.29567Z"
                      transform="translate(-81.55069 -120)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M982.645,133.85359s1.15374-8.68188,5.90311-10.55126Z"
                      transform="translate(-81.55069 -120)"
                      fill="#2f2e41"
                    />
                    <path
                      d="M982.62423,135.63951s-2.40982-8.42015,1.19767-12.03086Z"
                      transform="translate(-81.55069 -120)"
                      fill="#2f2e41"
                    />
                  </svg>
                  <h3>No description available</h3>
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </LoadingOverlay>
  );
};

export default ViewModeComponent;
