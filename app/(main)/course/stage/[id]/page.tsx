"use client";

import { useState, useEffect, useRef } from "react";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from "react-share";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MathJax from "@/components/assessment/mathjax";
import { avatar, date, formatQuestion, fromNow } from "@/lib/pipe";
import { getSession } from "next-auth/react";

import {
  faFacebookSquare,
  faLinkedin,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import {
  faHeart,
  faHeart as regularHeart,
} from "@fortawesome/free-regular-svg-icons";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import {
  faFileLines,
  faPaperPlane,
  faCopy,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clientApi from "@/lib/clientApi";
import * as courseService from "@/services/courseService";
import { slugify, toQueryString } from "@/lib/validator";
import {
  base64UrlEncode,
  compileDiscussion,
  getElearningFullPath,
  trimEmptySpace,
} from "@/lib/helpers";
import { useTakeTestStore } from "@/stores/take-test-store";
import { useSession } from "next-auth/react";
import { alert, confirm, success, warning } from "alertifyjs";
import alertify from "alertifyjs";
import { getFileNameFromResponse, saveBlobFromResponse } from "@/lib/common";
import CourseLearningTest from "@/components/course/learning-test/LearningTest";
import VideoPlayer from "@/components/course/video-player";
import ContentRenderer from "@/components/course/content-renderer";
import Chart from "react-apexcharts";
import CourseStageFeedback from "@/components/course/stage/FeedbackModal";
import CompletedModal from "@/components/course/stage/CompletedModal";
import ReportModal from "@/components/course/stage/ReportModal";

const reportIssue = () => {
  // modalRef = modalSvc.show(reportModal, {
  //   ignoreBackdropClick: true,
  //   keyboard: false
  // })
};
const CourseStage = () => {
  const { id } = useParams();
  const { user } = useSession().data || {};
  const router = useRouter();
  const queryParams = useSearchParams();
  const content = queryParams.get("content");
  const finishedContent = queryParams.get("finishedContent");
  const demoSection = queryParams.get("demoSection");
  const isDemo = !!demoSection;
  const params = { courseStage: true, ...(demoSection && { demoSection }) };
  // const [now, setNow] = useState(new Date())

  const chatFileUploader = useRef<any>(null);
  const initialSnapshotLoaded = useRef<boolean>(false);
  const initialized = useRef<boolean>(false);
  const intervalFlag = useRef<boolean>(false);
  const selectContentCalled = useRef<boolean>(false);
  const checkOptionalContentsCalled = useRef<boolean>(false);
  const goNextFromAttemptSummaryCalled = useRef<boolean>(false);
  const { clientData } = useTakeTestStore();
  const [course, setCourse] = useState<any>();
  const [userCourse, setUserCourse] = useState<any>();
  const [activeSection, setActiveSection] = useState<any>();
  const [hasSummary, setHasSummary] = useState<boolean>(false);
  const [isBought, setIsBought] = useState<boolean>(false);
  const [allSections, setAllSections] = useState<any[]>([]);
  const [totalContents, setTotalContents] = useState<number>(0);
  const [flattenContents, setFlattenContents] = useState<any>([]);
  const [activeContent, setActiveContent] = useState<any>();
  const [completedContents, setCompletedContents] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [resetAssignment, setResetAssignment] = useState<boolean>(true);
  const [postPage, setPostPage] = useState<number>(1);
  const [canLoadMorePosts, setCanLoadMorePosts] = useState<boolean>(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [postLimit, setPostLimit] = useState<number>(5);
  const [nextContent, setNextContent] = useState<any>();
  const [showReport, setShowReport] = useState<any>(false);
  const now = useRef<Date>(new Date());
  const [showAttemptSummary, setShowAttemptSummary] = useState<boolean>(false);
  const [postDetail, setPostDetail] = useState<boolean>(false);
  const [activePost, setActivePost] = useState<any>();
  const [viewDiscussion, setViewDiscussion] = useState<boolean>(false);
  const [postText, setPostText] = useState<string>("");
  const [voting, setVoting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [sendingFeedback, setSendingFeedback] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showCompletedModal, setShowCompletedModal] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>("");

  const [qfeedbackForm, setQFeedbackForm] = useState<any>({
    ckFrame: false,
    ckMore: false,
    ckAnother: false,
    ckExp: false,
    ckVideo: false,
    txtAnother: "",
  });

  const [isLiked, setIsLiked] = useState(false);
  const handleLikeClick = () => {
    if (!isLiked) {
      alertify.success("Successfully added to favorite");
    } else {
      alertify.success("Successfully removed from favorite");
    }
    setIsLiked(!isLiked);
  };
  const likeStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
  };

  const heartIconStyle = {
    color: isLiked ? "red" : "#999",
  };

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

  useEffect(() => {
    console.log("666666666666666666666666666666666666666666666");
    alertify.set("notifier", "position", "top-right");

    const getCourse = async () => {
      const { data } = await clientApi.get(
        `/api/course/${id}${toQueryString(params)}`
      );
      setCourse(data);
    };

    const getUserCourseData = async () => {
      const { data } = await clientApi.get(
        `/api/course/userCourse/${id}/${toQueryString(params)}`
      );
      setUserCourse(data);
    };

    getCourse();
    getUserCourseData();
    initialSnapshotLoaded.current = true;
  }, []);

  useEffect(() => {

    if (!!course && !!userCourse && initialSnapshotLoaded.current) {
      console.log("222222222222222222222222222222222")
      let cours: any = course;
      let usercours: any = userCourse;
      let flattenContent: any = flattenContents;
      let activeSec: any = activeSection;
      let completedContent: any;

      if (cours.accessMode == "buy" && !usercours.isBought) {
        setIsBought(false);
      }

      // defer rendering list of sections
      let allSec: any = allSections;
      for (let i = 0; i < cours.sections.length / 20; i++) {
        allSec = allSections.concat(cours.sections.slice(i * 20, i * 20 + 20));
      }
      setAllSections(allSec);
      cours = { ...cours, slug: slugify(cours.title) };
      let total = totalContents;
      cours.sections.forEach((sec: any) => {
        total += sec.contents.length;
      });
      setTotalContents(total);

      if (!usercours.rating) {
        usercours = { ...usercours, rating: 0 };
      }

      // fill in flattenContents
      for (let i = 0; i < cours.sections.length; i++) {
        for (let j = 0; j < cours.sections[i].contents.length; j++) {
          cours.sections[i].contents[j] = {
            ...cours.sections[i].contents[j],
            optionalSection: cours.sections[i].optional,
            sectionId: cours.sections[i]._id,
            isDemo: cours.sections[i].isDemo,
          };
          flattenContent.push(cours.sections[i].contents[j]);
        }
      }

      const currentSectionIdx = 0;

      if (cours.enableOrdering) {
        if (!usercours.contents.length) {
          activeSec = cours.sections[currentSectionIdx];
          setActive_Content(activeSec.contents[0]);

          usercours.contents.push({
            _id: activeSec.contents[0]._id,
            section: activeSec._id,
            completed: false,
          });
        } else {
          // find active section and content using usercourse
          let contentId = content;
          completedContent = usercours.contents.filter(
            (c: any) => c.completed
          ).length;
          let progress = Math.floor((completedContents / totalContents) * 100);

          // unlock contents that user has visited
          for (let i = 0; i < flattenContent.length; i++) {
            for (const ucon of usercours.contents) {
              if (ucon._id == flattenContent[i]._id) {
                flattenContent[i].unlock = true;
                flattenContent[i].completed = ucon.completed;
              }
            }
          }

          // move user to next content after finished content
          if (!contentId && finishedContent) {
            const fcIdx = flattenContent.findIndex(
              (c: any) => c._id == finishedContent
            );
            if (fcIdx > -1 && fcIdx < flattenContent.length - 1) {
              if (!(isDemo && !flattenContent[fcIdx + 1].isDemo && !isBought)) {
                contentId = flattenContent[fcIdx + 1]._id;
              }
            }
          }

          if (contentId) {
            let act = activeContent;
            for (const section of cours.sections) {
              for (const c of section.contents) {
                if (c._id == contentId) {
                  activeSec = section;

                  act = c;
                  setActive_Content(c);
                  c.unlock = true;
                  break;
                }
              }
              if (act) {
                break;
              }
            }
          } else {
            if (isDemo && demoSection) {
              // open contents in demoSection
              for (const section of cours.sections) {
                if (section._id == demoSection) {
                  activeSec = section;
                  setActive_Content(section.contents[0]);
                  for (const c of section.contents) {
                    c.unlock = true;
                  }
                }
              }
            } else {
              let lastCompletedIdx = -1;
              for (let i = 0; i < flattenContent.length; i++) {
                if (flattenContent[i].completed) {
                  lastCompletedIdx = i;
                }
              }
              let nextContentId = lastCompletedIdx + 1;

              // no more content => go back to lastCompletedIdx
              if (
                !flattenContent[nextContentId] ||
                (isDemo && !flattenContent[nextContentId].isDemo && !isBought)
              ) {
                nextContentId = lastCompletedIdx;
              }

              // ensure user take course in order
              if (isBought && !flattenContent[nextContentId].isDemo) {
                for (let i = 0; i < flattenContent.length; i++) {
                  if (!flattenContent[i].completed) {
                    nextContentId = i;
                    break;
                  }
                }
              }
              setActive_Content(flattenContent[nextContentId]);
              activeSec = cours.sections.find(
                (sec: any) => sec._id == flattenContent[nextContentId].sectionId
              );
              checkOptionalContents(
                flattenContent,
                flattenContent[nextContentId]
              );
            }
          }
        }
      } else {
        const usrContent = usercours.contents.filter((c: any) => c.completed);
        completedContent = usrContent.length;
        setProgress(Math.floor((completedContent / totalContents) * 100));

        if (isDemo && demoSection) {
          // open content in demoSection
          for (const section of cours.sections) {
            if (section._id == demoSection) {
              activeSec = section;
              setActive_Content(section.contents[0]);
              for (const c of section.contents) {
                c.unlock = true;
              }
            }
          }
        } else {
          // for check last seen status
          let lastSeenDate = new Date().setFullYear(2020, 1, 1);
          let lastSeenContent: any = null;

          for (let i = 0; i < flattenContent.length; i++) {
            for (const ucon of usercours.contents) {
              if (ucon._id == flattenContent[i]._id) {
                flattenContent[i].unlock = true;
                flattenContent[i].updatedAt = ucon.updatedAt;
                flattenContent[i].completed = ucon.completed;
                if (
                  ucon.updatedAt &&
                  new Date(lastSeenDate).getTime() <
                  new Date(ucon.updatedAt).getTime()
                ) {
                  lastSeenDate = ucon.updatedAt;
                  lastSeenContent = flattenContent[i];
                }
              }
            }
          }

          let findLastSeenIndex = 0;
          if (lastSeenContent && lastSeenContent._id) {
            findLastSeenIndex = flattenContent.findIndex(
              (e: any) => e._id == lastSeenContent._id
            );
          }
          let nextContentId = findLastSeenIndex;
          // no more content => go back to lastCompletedIdx
          if (!flattenContent[nextContentId]) {
            nextContentId = 0;
          }
          setActive_Content(flattenContent[nextContentId]);
          activeSec = cours.sections.find(
            (sec: any) => sec._id == flattenContent[nextContentId].sectionId
          );
          checkOptionalContents(flattenContent, flattenContent[nextContentId]);
        }
      }

      initialSnapshotLoaded.current = false;
      setCourse(cours);
      setUserCourse(usercours);
      setFlattenContents(flattenContent);
      setActiveSection(activeSec);
      setCompletedContents(completedContent);
      initialized.current = true;
    }
  }, [course, userCourse]);

  useEffect(() => {
    if (initialized.current) {
      console.log("11111111111111111111111111111111111111111");
      getContentData();
      setNextContents();
      setSectionProgress();
      checkInstructorsOnlineStatus();
      initialized.current = false;
      intervalFlag.current = true;
    }
  }, [completedContents, flattenContents, activeSection]);



  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeContent && !activeContent.completed) {
      console.log("777777777777777777777777777777777777777777");
      intervalRef.current = setInterval(() => {
        setActiveContent((prevActiveContent) => ({
          ...prevActiveContent,
          timeSpent: prevActiveContent.timeSpent + 1000,
        }));
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [activeContent]);

  const setActive_Content = (value: any) => {
    if (!!value) {
      setActiveContent(value);
      setHasSummary(
        value.type === "video"
          ? value.note &&
          value.note.length !== 0 &&
          value.note.find((i: any) => i.data)
          : !!value.summary && !!trimEmptySpace(value.summary)
      );
    }
  };

  const checkOptionalContents = (flattenContent: any, activeContents: any) => {
    let flatten_content = flattenContent;
    let lastActiveContentIdx = flatten_content.findIndex(
      (c: any) => c._id == activeContents._id
    );
    for (let i = 0; i < flatten_content.length; i++) {
      if (i < lastActiveContentIdx) {
        flatten_content[i].unlock =
          flatten_content[i].unlock ||
          flatten_content[i].optional ||
          flatten_content[i].optionalSection;
      } else if (i == lastActiveContentIdx) {
        flatten_content[i].unlock = true;
        if (flatten_content[i].optional || flatten_content[i].optionalSection) {
          lastActiveContentIdx++;
        }
      }
      setFlattenContents(flatten_content);
    }
    checkOptionalContentsCalled.current = true;
  };

  const getContentData = async () => {
    if (activeContent) {
      let active_content = activeContent;
      let user_course = userCourse;
      // refresh quiz component
      setResetAssignment(false);
      setTimeout(() => {
        setResetAssignment(true);
      }, 500);

      active_content.startDate = new Date(active_content.startDate);
      // set complete flag
      const uc = user_course.contents.find(
        (c: any) => c._id == active_content._id
      );
      if (uc) {
        active_content.completed = uc.completed;
        active_content.timeSpent = uc.timeSpent ? uc.timeSpent : 0;
      } else {
        user_course.contents.push({
          _id: active_content._id,
          section: activeSection._id,
          completed: false,
        });
      }
      // notify server that user has started the content
      const { data: c } = await clientApi.put(
        `/api/course/startContent/${course._id}`,
        { section: activeSection._id, content: active_content._id }
      );
      if (c) {
        active_content = { ...active_content, favorite: c.favorite };
      }

      if (active_content.type == "ebook" || active_content.type == "video") {
        try {
          const { data } = await clientApi.get(
            `/api/contents/${active_content.source}`
          );
          if (data.contentType == "video") {
            active_content = {
              ...active_content,
              link: data.url
                ? data.url
                : getElearningFullPath(clientData.baseUrl, data.filePath),
            };
          } else if (data.contentType == "ebook") {
            let url = data.url;
            if (url == "") {
              alertify.error("Document file does not exist");
              return;
            }
            if (data.filePath) {
              url = getElearningFullPath(clientData.baseUrl, data.filePath);
            }
            active_content = {
              ...active_content,
              link:
                "<object data='" +
                url +
                "' type='application/pdf' class='embed-responsive-item' style='min-height:600px; width: 100%;'>" +
                "Object " +
                data.url +
                " failed" +
                "</object>",
            };
          }
        } catch (error) {
          console.error(error);
        }
      }
      setPostPage(1);
      setCanLoadMorePosts(false);
      setUserCourse(user_course);
      setActive_Content(active_content);
      try {
        const { data: posts } = await clientApi.get(
          `/api/discussions${toQueryString({
            feedType: "courseContent",
            course: course._id,
            courseContent: activeContent._id,
            limit: postLimit,
          })}`
        );
        setPosts(posts);
        setCanLoadMorePosts(posts.length > postLimit);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const setNextContents = () => {
    let idx = activeSection.contents.findIndex((c: any) => c == activeContent);
    if (idx < activeSection.contents.length - 1) {
      setNextContent(activeSection.contents[idx + 1]);
    } else {
      // find next content in next section
      idx = course.sections.findIndex((s: any) => s == activeSection);
      if (idx < course.sections.length - 1) {
        const nextSection = course.sections[idx + 1];
        if (!isDemo || nextSection.isDemo || isBought) {
          setNextContent(nextSection.contents[0]);
        }
      } else {
        setNextContent(null);
      }
    }
  };

  const setSectionProgress = () => {
    const cours = course;
    for (const section of cours.sections) {
      const completedContents = userCourse.contents.filter(
        (c: any) => c.section == section._id && c.completed
      ).length;
      let progress = Math.floor(
        (completedContents / section.contents.length) * 100
      );
      progress = progress > 100 ? 100 : progress;
      section.chartSeries = [progress, 100 - progress];
    }
    setCourse(cours);
  };

  const checkInstructorsOnlineStatus = () => {
    // if (course.instructors.length) {
    //   socketSvc.on('user.left', (usr) => {
    //     const f = course.instructors.find(ins => ins._id == usr.user)
    //     if (f) {
    //       f.isOnline = false
    //     }
    //   }, 'course-stage');
    //   socketSvc.on('user.join', (usr) => {
    //     const f = course.instructors.find(ins => ins._id == usr.user)
    //     if (f) {
    //       f.isOnline = true
    //     }
    //   }, 'course-stage');
    //   // init status
    //   for (const ins of course.instructors) {
    //     chatSvc.userOnline(ins._id).then(isOnline => {
    //       ins.isOnline = isOnline
    //     })
    //   }
    // }
  };

  useEffect(() => {
    if (intervalFlag) {
      console.log("8888888888888888888888888888888888888888888888888")
      const intervalHandler = setInterval(() => {
        now.current = new Date();
        if (activeContent && !activeContent.completed) {
          setActiveContent((prev: any) => ({
            ...prev,
            timeSpent: (prev.timeSpent += 1000),
          }));
        }
      }, 1000);
      return () => clearInterval(intervalHandler);
    }
  }, [intervalFlag]);

  const updateContentTimeSpent = async () => {
    if (
      !activeContent ||
      !activeContent.timeSpent ||
      (activeContent.completed && !activeContent.videoWatchedSeconds)
    ) {
      return;
    }
    await clientApi.put(`/api/course/updateContentTimeSpent/${course._id}`, {
      section: activeSection._id,
      content: activeContent._id,
      timeSpent: activeContent.timeSpent,
      videoWatchedSeconds: activeContent.videoWatchedSeconds || 0,
    });
  };

  const selectContent = (content: any) => {
    if (content == activeContent || (!content.isDemo && isDemo && !isBought)) {
      return;
    }
    // check if this content is in user history
    const uc = userCourse.contents.find((c: any) => c._id == content._id);
    if (uc || content.unlock || content.isDemo || !course.enableOrdering) {
      // update current active content before select new one
      updateContentTimeSpent();
      setActive_Content({});
      setTimeout(() => {
        setShowAttemptSummary(false);
        setActive_Content(content);
        // set active section
        setActiveSection(
          course.sections.find((s: any) => {
            return s.contents.findIndex((c: any) => c._id == content._id) > -1;
          })
        );
        selectContentCalled.current = true;
      }, 100);
    }
  };

  const feedbackSubmit = async () => {
    setFeedbackError("");
    if (
      !qfeedbackForm.ckFrame &&
      !qfeedbackForm.ckMore &&
      !qfeedbackForm.ckAnother &&
      !qfeedbackForm.ckExp &&
      !qfeedbackForm.ckVideo
    ) {
      alert("Message", "Please select at least one option.");
      setFeedbackError("Please select at least one option.");
      return;
    }
    if (qfeedbackForm.ckAnother && !qfeedbackForm.txtAnother) {
      alert("Message", "Please enter your comment.");
      setFeedbackError("Please enter your comment.");
      return;
    }

    let qfeedback: any = {
      courseId: id,
      questionId: activeContent?._id,
      studentId: user?.info._id,
      feedbacks: [],
      comment: "",
    };

    if (qfeedbackForm.ckFrame) {
      qfeedback.feedbacks.push("The question isn’t framed correctly");
    }
    if (qfeedbackForm.ckMore) {
      qfeedback.feedbacks.push("Problem with one or more options");
    }
    if (qfeedbackForm.ckExp) {
      qfeedback.feedbacks.push(
        "Explanation is correct, unclear, or needs improvement"
      );
    }
    if (qfeedbackForm.ckVideo) {
      qfeedback.feedbacks.push(
        "Learning video is irrelevant, not loading, or inappropriate"
      );
    }
    if (qfeedbackForm.ckAnother && !!qfeedbackForm.txtAnother) {
      qfeedback.comment = qfeedbackForm.txtAnother;
    }

    try {
      await clientApi.post("/api/feedbacks/questionFeedback", qfeedback);
      setShowReport(false);
      alertify.success("Your feedback is submitted.");
      // alert("Message","Success", "Your feedback is submitted.");
    } catch (error) {
      // setShowReportModal(false);
      alertify.error("Failed to submit your feedback.");
      // alert("Message","Warning", "Failed to submit your feedback.");
    }
  };

  const onFeedbackCheck = (event: any, checkProp: any) => {
    let qfeedbackF = qfeedbackForm;
    // if this prop is checked, uncheck others
    if (qfeedbackF[checkProp] == true) {
      qfeedbackF[checkProp] = false;
    } else {
      qfeedbackF[checkProp] = true;
    }
    setQFeedbackForm(qfeedbackF);
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

  useEffect(() => {
    if (selectContentCalled.current) {
      console.log("3333333333333333333333333333333")
      backToQuestions();
      getContentData();
      setNextContents();
      selectContentCalled.current = false;
    }
  }, [activeContent, activeSection]);

  const openChat = (user: any) => {
    // chatSvc.openChat(user._id, user.name, user.avatar)
  };

  const openChatWithInstructor = () => {
    // if (course.instructors.length) {
    //   openChat(course.instructors[0])
    // } else {
    //   openChat(course.user)
    // }
  };

  const updateFavorite = async () => {
    if (activeContent && !activeContent.processing) {
      let processingContent = activeContent;
      processingContent = { ...processingContent, processing: true };
      if (!processingContent.favorite) {
        try {
          const { data } = await clientApi.put(
            `/api/course/favorite/${course._id}/${processingContent._id}`
          );
          processingContent = { ...processingContent, favorite: true };
        } catch (error) {
          console.error(error);
        } finally {
          processingContent = { ...processingContent, processing: false };
        }
      } else {
        try {
          await clientApi.delete(
            `/api/course/favorite/${course._id}/${processingContent._id}`
          );
          processingContent = { ...processingContent, favorite: false };
        } catch (error) {
          console.error(error);
        } finally {
          processingContent = { ...processingContent, processing: false };
        }
      }
    }
  };

  const getUtmLink = (src: any, med: any) => {
    const utmData = `source=${src}&medium=${med}&campaign=${user?.info?.userId}`;
    return `${clientData.baseUrl}public/courses/${course._id}/${course.slug
      }?utm=${base64UrlEncode(utmData)}}&loc=${user?.info?.activeLocation}`;
  };

  const viewReport = (content: any) => {
    router.push(`/attempt-summary/${content.attempt._id}`);
  };

  const takeAssessment = (content: any) => {
    // save course content and test relationship
    localStorage.setItem(
      `${user?.info._id}_${content.source}_course_content_back`,
      JSON.stringify({
        course: course._id,
        content: content._id,
        demoSection: demoSection,
      })
    );
    localStorage.setItem(
      `${user?.info._id}_${content.source}_reference`,
      JSON.stringify({
        referenceType: "course",
        referenceId: course._id,
        courseContent: content._id,
      })
    );
    router.push(`/assessment/instruction/${content.source}`);
  };

  const addQuestion = async (e: any) => {
    e.preventDefault();
    if (!!postText) {
      const params: any = {
        feedType: "courseContent",
        course: course._id,
        courseContent: activeContent._id,
        description: compileDiscussion(postText),
        ...(activeContent.type == "quiz" &&
          activeContent.questionNumber && {
          questionNumber: activeContent.questionNumber,
        }),
      };
      try {
        const { data: newpost } = await clientApi.post(
          "/api/discussions",
          params
        );
        newpost.user = {
          _id: user?.info._id,
          name: user?.name,
          avatarUrl: user?.info.avatarUrl,
          avatar: user?.info.avatar,
        };
        setPosts([...posts, newpost]);
        setPostText("");
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  const voted = (post: any) => {
    return post.vote && post.vote.indexOf(user?.info._id) > -1;
  };

  const vote = async (onPost: any) => {
    if (voting) {
      return;
    }
    setVoting(true);
    if (!onPost.vote) {
      onPost.vote = [];
    }
    const idx = onPost.vote.indexOf(user?.info._id);
    if (idx > -1) {
      onPost.vote.splice(idx, 1);
      await clientApi.put(`/api/discussion/unvote/${onPost._id}`, {
        postId: onPost._id,
      });
      setVoting(false);
    } else {
      onPost.vote.push(user?.info._id);
      await clientApi.put(`/api/discussion/vote/${onPost._id}`, {
        postId: onPost._id,
      });
      setVoting(false);
    }
  };

  const viewPost = async (post: any) => {
    setActivePost(post);
    setPostDetail(true);
    const { data: comments } = await clientApi.get(
      `/api/discussions/comments/${post._id}`
    );
    setActivePost({ ...post, comments });
  };

  const deletePost = (post: any) => {
    confirm("Are you sure you want to delete this question?", async () => {
      await clientApi.delete(`/api/discussions/${post._id}`);
      let oldposts = posts;
      const pid = oldposts.findIndex((p) => p._id == post._id);
      if (pid > -1) {
        oldposts.splice(pid, 1);
      }
      setPosts(oldposts);
      success("Question is removed successfully.");
    });
  };

  const addComment = async () => {
    if (!!commentText) {
      let { data: newpost } = await clientApi.post(
        `/api/discussions/${activePost?._id}`,
        { description: commentText }
      );
      newpost = {
        ...newpost,
        _id: user?.info._id,
        name: user?.name,
        avatarUrl: user?.info.avatarUrl,
        avatar: user?.info.avatar,
      };
      let active_post = activePost;
      active_post.comments.unshift(newpost);
      active_post = {
        ...active_post,
        ...(!active_post.totalComments && { totalComments: 0 }),
        totalComments: active_post.totalComments + 1,
      };
      setActivePost(active_post);
      setCommentText("");
    }
  };

  const deleteComment = (comment: any) => {
    confirm("Are you sure you want to delete this comment?", async () => {
      await clientApi.delete(`/api/discussions/${comment._id}`);
      const pid = activePost.comments.findIndex(
        (p: any) => p._id == comment._id
      );
      let active_post = activePost;
      if (pid > -1) {
        active_post.comments.splice(pid, 1);
        active_post.totalComments--;
      }
      setActivePost(active_post);
      success("Question is removed successfully.");
    });
  };

  const loadPosts = async () => {
    setPostPage((prev: any) => prev + 1);
    const { data } = await clientApi.post(`/api/discussions`, {
      feedType: "courseContent",
      course: course._id,
      courseContent: activeContent._id,
      page: postPage,
      limit: postLimit,
    });
    let new_post = posts.concat(data);
    setPosts(new_post);
    if (new_post.length < postLimit) {
      setCanLoadMorePosts(false);
    }
  };

  const checkFeedback = (showComplete: any = false) => {
    // ask feedback if this course is completed or user has completed 30% of the course
    if (progress >= 30) {
      // check if user has already asked but choose to give feedback later
      const wasAsked = localStorage.getItem(
        `${user?.info._id}_course_feedback_${course._id}`
      );
      if (wasAsked == "askLater" && progress < 100) {
        return;
      }
      // if user already gave feedback
      if (userCourse.feedback) {
        if (showComplete) {
          if (progress == 100) {
            setShowCompletedModal(!showCompletedModal);
          }
        }
        return;
      }
      setUserCourse((userCourse: any) => ({
        ...userCourse,
        feedback: "",
        rating: 0,
      }));
    }
  };

  const markComplete = (e?: any) => {
    if (processing) {
      return;
    }
    setProcessing(true);
    courseService
      .completeContent(
        course._id,
        activeSection._id,
        activeContent._id,
        activeContent.timeSpent
      )
      .then((res) => {
        setProcessing(false);
        setActiveContent({
          ...activeContent,
          completed: true,
        });
        setCompletedContents(completedContents + 1);

        const updatedCompletedCon = completedContents + 1;

        if (isDemo && !isBought) {
          // ask user to buy the course to continue
          const demoContent = flattenContents.find(
            (c) => c.isDemo && !c.completed
          );
          if (!demoContent) {
            alert(
              "Message",
              "You have completed demo section. Please buy the course to continue."
            );
          }
        }
        // mark current content as completed
        const uc = userCourse.contents.find((c) => c._id == activeContent._id);
        const updatedCourse = course;
        if (uc) {
          uc.completed = true;
          updatedCourse.sections.forEach((sec) => {
            if (uc.section === sec._id) {
              sec.contents.forEach((con) => {
                if (uc._id === con._id) {
                  con.unlock = true;
                }
              });
            }
          });
          setCourse(updatedCourse);
        }
        setProgress(Math.floor((updatedCompletedCon / totalContents) * 100));

        if (e?.showAttemptSummary) {
          setShowAttemptSummary(true);
          return;
        }

        if (nextContent) {
          const nextUserCourse: any = {
            _id: nextContent._id,
            completed: false,
          };

          setActiveContent({});
          setTimeout(() => {
            setShowAttemptSummary(false);
            setActiveContent(nextContent);
            const sectionIdx = updatedCourse.sections.findIndex((s) => {
              return s.contents.findIndex((c) => c._id == nextContent._id) > -1;
            });
            setActiveSection(updatedCourse.sections[sectionIdx]);
            const updatedActiveSec = updatedCourse.sections[sectionIdx];

            nextUserCourse.section = updatedActiveSec._id;
            setUserCourse({
              ...userCourse,
              contents: [...userCourse.contents, nextUserCourse],
            });

            backToQuestions();
            getContentData();
            setNextContents();
            checkOptionalContents(flattenContents, nextContent);
          }, 100);
        }
        setSectionProgress();
        checkFeedback(true);
      })
      .catch((err) => {
        setProcessing(false);
      });
  };

  useEffect(() => {

    if (checkOptionalContentsCalled.current) {
      console.log("444444444444444444444444444444444444444444444444");
      backToQuestions();
      getContentData();
      setNextContents();
      // checkOptionalContents(flattenContents, nextContent);
      checkOptionalContentsCalled.current = false;
    }
  }, [completedContents, flattenContents, activeSection]);

  const goNextFromAttemptSummary = () => {
    if (nextContent) {
      let user_course = userCourse;
      if (!userCourse.contents.find((c: any) => c._id == nextContent._id)) {
        user_course.contents.push({
          _id: nextContent._id,
          section: activeSection._id,
          completed: false,
        });
      }
      setActive_Content({});
      setUserCourse(user_course);
      setTimeout(() => {
        setShowAttemptSummary(false);
        setActive_Content(nextContent);
        const sectionIdx = course.sections.findIndex((s: any) => {
          return (
            s.contents.findIndex((c: any) => c._id == nextContent._id) > -1
          );
        });
        setActive_Content(course.sections[sectionIdx]);
        goNextFromAttemptSummaryCalled.current = true;
      }, 100);
    }
    checkFeedback(true);
  };

  useEffect(() => {
    if (goNextFromAttemptSummaryCalled.current) {
      console.log("55555555555555555555555555555555555555")
      backToQuestions();
      getContentData();
      setNextContents();
      setSectionProgress();
      checkOptionalContents(flattenContents, nextContent);
      goNextFromAttemptSummaryCalled.current = false;
    }
  }, [goNextFromAttemptSummaryCalled.current]);

  const notifyCopied = () => {
    const text = getUtmLink("platform", "individual");
    navigator.clipboard.writeText(text);
    alertify.set("notifier", "position", "top-right");
    success("Public link is copied to clipboard!");
  };

  const exportReport = async () => {
    const query = {
      user: user?.info._id,
      course: course._id,
      location: user?.info.activeLocation,
      directDownload: true,
    };
    try {
      const session = await getSession();

      const response = await clientApi.get(
        `https://newapi.practiz.xyz/api/v1/admin/reportData/exportweeklyreport${toQueryString(
          query
        )}`,
        {
          responseType: "blob",
          headers: {
            instancekey: session?.instanceKey,
            Authorization: `bearer ${session?.accessToken}`,
          },
        }
      );

      const contentType = response.headers["content-type"];
      const fileName = getFileNameFromResponse(response);
      saveBlobFromResponse({
        fileName: slugify(course.title),
        blob: response.data,
      });
    } catch (error: any) {
      alert("Message", "No data to download.");
    }
  };

  const openFeedback = () => {
    setUserCourse((prev: any) => ({ ...prev, feedback: "", rating: 0 }));
    setShowFeedback(true);
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
      alertify.error("Please choose only image.");
      return;
    }

    chatFileUploader.current.nativeElement.value = "";
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
          alertify.success("Uploaded successfully");
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

  const onQuestionNumberChanged = (ev: any) => {
    if (activeContent && activeContent.type == "quiz") {
      setActive_Content({ ...activeContent, questionNumber: ev.number });
    }
  };

  const recordWatchedDuration = (data: any) => {
    if (activeContent) {
      setActive_Content({
        ...activeContent,
        videoWatchedSeconds: data.seconds,
      });
    }
  };

  const askFeedbackLater = () => {
    setUserCourse({
      ...userCourse,
      rating: 0,
      feedback: "",
    });
    setShowFeedback(false);
    localStorage.setItem(
      `${user?.info._id}_course_feedback_${course._id}`,
      "askLater"
    );
  };

  const sendFeedback = async (feedback: any) => {
    if (sendingFeedback) {
      return;
    }
    if (!userCourse.feedback) {
      userCourse.feedback = "";
    }
    setSendingFeedback(true);
    const { rating } = userCourse;
    try {
      await clientApi.put(`/api/course/feedback/${course._id}`, {
        rating,
        feedback,
      });
      localStorage.setItem(
        `${user?.info._id}_course_feedback_${course._id}`,
        "sent"
      );
      success("Thank you for your feedback!");
      let com = progress == 100;
      setCompleted(com);
      if (com) {
        setShowCompletedModal(!showCompletedModal);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSendingFeedback(false);
      setShowFeedback(false);
    }
  };

  const setRating = (rate: any) => {
    setUserCourse({ ...userCourse, rating: rate });
    if (rate == 1) {
      // for star animation
      setTimeout(() => {
        // document?.getElementById("star_two").style.display = "block";
        // document?.getElementById("star_one").style.display = "none";
      }, 800);
    }
  };

  const gotoCertificate = () => {
    setShowCompletedModal(false);
    router.push(
      `/profile/home/certificates${toQueryString({ tab: "certificates" })}`
    );
  };

  return (
    <>
      <div className="bg-white">
        <div className="top-head d-none d-lg-block">
          <div className="container">
            <div className="top-head-area mx-auto mw-100">
              <div className="row align-items-center">
                <div className="col-lg">
                  <div className="logo d-flex align-items-center">
                    <a
                      href="/course/home"
                      className="clearfix"
                      aria-label="app symbol"
                    >
                      <figure>
                        <img
                          src={
                            (user?.info.primaryInstitute?.logo != '')
                              ? user?.info.primaryInstitute?.logo
                              : "https://d15aq2mos7k6ox.cloudfront.net/images/codemode_logo.png"
                          }
                          alt="this is Logo"
                          width="166"
                          height="28"
                        ></img>
                      </figure>
                    </a>
                    <span>{course?.title}</span>
                  </div>
                </div>

                <div className="col-lg-auto">
                  <div className="right-gallery_new">
                    <div className="d-flex flex-column mt-2">
                      {course && (
                        <a
                          className="btn btn-primary mb-1 w-100"
                          href={`/course/details/${course._id}`}
                        >
                          Return to Course Summary
                        </a>
                      )}
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
                {activeSection && (
                  <div className="col-lg">
                    <div className="row">
                      <div className="col-3 d-none d-lg-block">
                        <div className="side-menu">
                          <div className="accordion" id="accordion">
                            {allSections.map((section: any, i: number) => (
                              <div className="item" key={"section" + i}>
                                <div
                                  aria-label={`mcq options${i}`}
                                  className="row no-gutters section-chart-wrapper d-flex align-items-center"
                                >
                                  <div className="col-auto section-chart align-self-start">
                                    <div
                                      className="custom-pie"
                                      style={{
                                        "--p": `${section?.chartSeries
                                          ? section?.chartSeries[0]
                                          : 0
                                          }`,
                                      }}
                                    ></div>
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
                                  aria-label={`mcq options${i}`}
                                  className={`collapse ${activeSection == section ? "show" : ""
                                    }`}
                                  aria-labelledby={`section${i}`}
                                  data-parent="#accordion"
                                >
                                  <ul>
                                    {section.contents.map(
                                      (content: any, j: number) => (
                                        <li key={`section_content` + j}>
                                          <a
                                            onClick={() =>
                                              selectContent(content)
                                            }
                                            className={`${activeContent === content
                                              ? "active"
                                              : ""
                                              }`}
                                            role="button"
                                          >
                                            {content.type === "video" && (
                                              <span
                                                className={`${content.completed
                                                  ? "iconc-video"
                                                  : "iconc-video-lock"
                                                  }`}
                                              >
                                                <span
                                                  className={`${content._id ==
                                                    activeContent._id
                                                    ? "text-dark text-bolder"
                                                    : ""
                                                    }`}
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
                                              <span
                                                className={`${content.completed
                                                  ? "icon3-ebook"
                                                  : "icon3-ebook-lock"
                                                  }`}
                                              >
                                                <span
                                                  className={`${content._id ==
                                                    activeContent._id
                                                    ? "text-dark text-bolder"
                                                    : ""
                                                    }`}
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
                                              <span
                                                className={`${content.completed
                                                  ? "iconc-content"
                                                  : "iconc-content-lock"
                                                  }`}
                                              >
                                                <span
                                                  className={`${content._id ==
                                                    activeContent._id
                                                    ? "text-dark text-bolder"
                                                    : ""
                                                    }`}
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
                                              <span
                                                className={`${content.completed
                                                  ? "iconc-quiz"
                                                  : "iconc-quiz-lock"
                                                  }`}
                                              >
                                                <span
                                                  className={`${content._id ==
                                                    activeContent._id
                                                    ? "text-dark text-bolder"
                                                    : ""
                                                    }`}
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
                                              <span
                                                className={`${content.completed
                                                  ? "icon3-assesment"
                                                  : "icon3-assesment-lock"
                                                  }`}
                                              >
                                                <span
                                                  className={`${content._id ==
                                                    activeContent._id
                                                    ? "text-dark text-bolder"
                                                    : ""
                                                    }`}
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
                                            {content.type ===
                                              "onlineSession" && (
                                                <span
                                                  className={`${content.completed
                                                    ? "icon3-onlineSession"
                                                    : "icon3-onlineSession-lock"
                                                    }`}
                                                >
                                                  <span
                                                    className={`${content._id ==
                                                      activeContent._id
                                                      ? "text-dark text-bolder"
                                                      : ""
                                                      }`}
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
                      <div className="col-12 col-lg-9">
                        {activeSection.locked && (
                          <div className="session mx-auto mw-100">
                            <div className="session-inner">
                              <div className="session-inner-wrap">
                                <div className="session-info">
                                  <figure className="mx-auto">
                                    <img
                                      src="/assets/images/Safe-pana.png"
                                      alt=""
                                    />
                                  </figure>

                                  <div className="session-content mx-auto text-center">
                                    <h1>Section Locked</h1>
                                    <p>
                                      Request your instructor to unlock this
                                      section
                                    </p>

                                    <button
                                      className="btn btn-primary mt-2"
                                      onClick={openChatWithInstructor}
                                    >
                                      Chat with instructor
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {!activeSection.locked && (
                          <div className="video-blog-area-wrap video-blog-area-wrap_new mx-auto mw-100 border-bottom-0">
                            {activeContent.type != "assessment" &&
                              activeContent.type != "onlineSession" && (
                                <div className="heading mb-3">
                                  <div className="row align-items-center">
                                    <div className="col">
                                      <h5>{activeContent.title}</h5>
                                      <span>{activeSection.title}</span>
                                    </div>
                                    <div className="col-auto">
                                      <figure className="ml-auto">
                                        <a
                                          onClick={updateFavorite}
                                          role="button"
                                          aria-label="favorite button"
                                        >
                                          <img
                                            src={
                                              activeContent.favorite
                                                ? "/assets/images/like-red-bg.png"
                                                : "/assets/images/like-white-bg.png"
                                            }
                                            alt=""
                                          />
                                        </a>
                                      </figure>
                                    </div>
                                  </div>
                                </div>
                              )}
                            {resetAssignment && (
                              <>
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
                                    <CourseLearningTest
                                      courseId={course._id}
                                      content={activeContent}
                                      questionNumberChanged={
                                        onQuestionNumberChanged
                                      }
                                      finished={markComplete}
                                    />
                                  </div>
                                )}
                                {activeContent.type === "note" && (
                                  <div className="video-player default">
                                    {!activeContent.note ? (
                                      <figure>
                                        <img
                                          src="/assets/images/presentation.png"
                                          alt=""
                                        />
                                      </figure>
                                    ) : (
                                      <div className="adaptive-question-area mx-auto mw-100">
                                        <div className="adaptive-question-box bg-white min-h-0">
                                          <ContentRenderer
                                            _content={activeContent?.note}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {activeContent.type === "assessment" && (
                                  <div className="session mx-auto mw-100">
                                    <div className="session-inner">
                                      <div className="session-inner-wrap">
                                        <div className="session-info">
                                          <figure className="mx-auto">
                                            <img
                                              src="/assets/images/assessment-schedule.png"
                                              alt=""
                                            />
                                          </figure>
                                          {activeContent.startDate >=
                                            now.current ? (
                                            <div className="session-content mx-auto">
                                              <h4 className="text-center">
                                                Assessment
                                              </h4>
                                              <p className="text-center">
                                                Your Session is Scheduled on
                                              </p>
                                              <span className="text-center">
                                                {date(
                                                  activeContent.startDate,
                                                  "dd-MM-yyyy, hh:mma"
                                                )}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="session-content mx-auto">
                                              <h4 className="text-center">
                                                Assessment
                                              </h4>
                                              <p className="text-center">
                                                Click on Take Assessment button
                                                to attempt Assessment
                                              </p>

                                              <div
                                                style={{
                                                  display: "flex",
                                                  flexDirection: "row",
                                                  margin: "3px",
                                                }}
                                              >
                                                {activeContent.attempt && (
                                                  <div className="join-btn mx-auto">
                                                    <a
                                                      className="text-center text-white px-2"
                                                      onClick={() =>
                                                        viewReport(
                                                          activeContent
                                                        )
                                                      }
                                                    >
                                                      View Report
                                                    </a>
                                                  </div>
                                                )}
                                                <div className="join-btn mx-auto">
                                                  <a
                                                    className="text-center text-white px-2"
                                                    onClick={() =>
                                                      takeAssessment(
                                                        activeContent
                                                      )
                                                    }
                                                  >
                                                    Take Assessment
                                                  </a>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {activeContent.type === "onlineSession" && (
                                  <div className="session mx-auto mw-100">
                                    <div className="session mx-auto mw-100">
                                      <div className="session-inner">
                                        <div className="session-inner-wrap">
                                          <div className="session-info">
                                            <figure className="mx-auto">
                                              <img
                                                src="/assets/images/live-session.png"
                                                alt=""
                                              />
                                            </figure>
                                            {activeContent.startDate >=
                                              now.current ? (
                                              <div className="session-content mx-auto">
                                                <h4 className="text-center">
                                                  Online Session
                                                </h4>
                                                <p className="text-center">
                                                  Your Session is Scheduled on
                                                </p>
                                                <span className="text-center">
                                                  {date(
                                                    activeContent.startDate,
                                                    "dd-MM-yyyy, hh:mma"
                                                  )}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="session-content mx-auto">
                                                <h4 className="text-center">
                                                  Online Session
                                                </h4>
                                                <p className="text-center">
                                                  <a href={activeContent.link}>
                                                    Click Here to Join Your
                                                    Session
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
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                            {activeContent.type != "assessment" &&
                              activeContent.type != "onlineSession" && (
                                <>
                                  {!postDetail ? (
                                    <div>
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
                                                  className={`${!viewDiscussion
                                                    ? "active"
                                                    : ""
                                                    }`}
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
                                                data-target="#question"
                                                data-toggle="tab"
                                                className={`${(!activeContent.summary &&
                                                  activeContent.type !=
                                                  "video") ||
                                                  (activeContent.note?.length ==
                                                    0 &&
                                                    activeContent.type ==
                                                    "video") ||
                                                  viewDiscussion
                                                  ? "active"
                                                  : ""
                                                  }`}
                                              >
                                                Discussion
                                              </a>
                                            </li>
                                          </ul>
                                        </div>

                                        <div className="tab-content">
                                          {hasSummary && (
                                            <div
                                              className={`tab-pane fade ${!viewDiscussion
                                                ? "show active"
                                                : ""
                                                }`}
                                              id="overview"
                                            >
                                              {activeContent.summary &&
                                                activeContent.type !=
                                                "video" && (
                                                  <div className="adaptive-question-area mx-auto mw-100">
                                                    <div className="adaptive-question-box bg-white min-h-0">
                                                      <MathJax
                                                        className="cl-black text-element"
                                                        value={formatQuestion(
                                                          clientData.baseUrl,
                                                          activeContent.summary
                                                        )}
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              {!!activeContent.note?.length &&
                                                activeContent.type ==
                                                "video" && (
                                                  <div className="adaptive-question-area mx-auto mw-100">
                                                    <div className="adaptive-question-box bg-white min-h-0">
                                                      <ContentRenderer
                                                        _content={
                                                          activeContent?.note
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                            </div>
                                          )}

                                          <div
                                            className={`tab-pane fade ${(!activeContent?.summary &&
                                              activeContent.type !=
                                              "video") ||
                                              (activeContent?.note?.length ==
                                                0 &&
                                                activeContent.type ==
                                                "video") ||
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
                                                      backgroundImage: `url(${avatar(
                                                        user
                                                      )})`,
                                                    }}
                                                  ></div>
                                                </figure>

                                                <form
                                                  name="questionForm"
                                                  onSubmit={addQuestion}
                                                >
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
                                                          aria-label="postbust for Discussion"
                                                          className="btn-icone"
                                                        >
                                                          <FontAwesomeIcon
                                                            icon={faPaperPlane}
                                                          />
                                                        </button>
                                                      </div>
                                                      <div className="col-auto">
                                                        <button
                                                          type="button"
                                                          aria-label="button for file upload discussion"
                                                          className="btn btn-sm btn-link"
                                                          disabled={uploading}
                                                          onClick={() =>
                                                            chatFileUploader.current.click()
                                                          }
                                                        >
                                                          <img
                                                            src="/assets/images/icon-clip2.png"
                                                            alt="this is image for upload file"
                                                          />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </form>
                                              </div>

                                              <div className="user-comment">
                                                {posts.map(
                                                  (post: any, i: number) => (
                                                    <div
                                                      key={"post" + i}
                                                      className="user-comment-box d-flex mb-3 clearfix"
                                                    >
                                                      <figure>
                                                        <div
                                                          className="avatar"
                                                          style={{
                                                            backgroundImage: `url(${avatar(
                                                              post.user
                                                            )})`,
                                                          }}
                                                        ></div>
                                                      </figure>
                                                      <div className="user-comment-info mb-0 w-100 pl-0">
                                                        <h4>
                                                          {post.user.name}
                                                        </h4>
                                                        <div
                                                          dangerouslySetInnerHTML={{
                                                            __html:
                                                              post.description,
                                                          }}
                                                        ></div>
                                                        <div className="like like_new px-0 pt-2 pb-0 mlm">
                                                          <ul className="nav">
                                                            <li>
                                                              {!voted(post) ? (
                                                                <span
                                                                  onClick={() =>
                                                                    vote(post)
                                                                  }
                                                                  className="like new-like-hart py-0 pr-0"
                                                                >
                                                                  <FontAwesomeIcon
                                                                    icon={
                                                                      faHeart
                                                                    }
                                                                    className="mt-0 pl-2"
                                                                  />
                                                                </span>
                                                              ) : (
                                                                <span
                                                                  onClick={() =>
                                                                    vote(post)
                                                                  }
                                                                  className="dis-like"
                                                                ></span>
                                                              )}
                                                            </li>
                                                            <li className="likkes">
                                                              {post.vote
                                                                ?.length > 0
                                                                ? post.vote
                                                                  ?.length
                                                                : 0}{" "}
                                                              {post.vote
                                                                ?.length == 1
                                                                ? "Like"
                                                                : "Likes"}
                                                            </li>
                                                            <li>
                                                              {" "}
                                                              <a
                                                                className="text-primary"
                                                                onClick={() =>
                                                                  viewPost(post)
                                                                }
                                                              >
                                                                Reply{" "}
                                                              </a>
                                                            </li>
                                                            <li>
                                                              {" "}
                                                              <a
                                                                className="text-primary"
                                                                onClick={() =>
                                                                  viewPost(post)
                                                                }
                                                              >
                                                                View Replies{" "}
                                                              </a>
                                                            </li>
                                                            {post.user._id ==
                                                              user?.info
                                                                ?._id && (
                                                                <li>
                                                                  <a
                                                                    onClick={() =>
                                                                      deletePost(
                                                                        post
                                                                      )
                                                                    }
                                                                    className="text-danger"
                                                                  >
                                                                    Delete{" "}
                                                                  </a>
                                                                </li>
                                                              )}
                                                            <li>
                                                              {fromNow(
                                                                post.updatedAt
                                                              )}
                                                            </li>
                                                          </ul>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
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
                                                      backgroundImage: `url(${avatar(
                                                        user
                                                      )})`,
                                                    }}
                                                  ></div>
                                                </figure>

                                                <form
                                                  name="questionForm"
                                                  onSubmit={addQuestion}
                                                >
                                                  <div className="form-group mb-0">
                                                    <div className="row no-gutters align-items-center">
                                                      <div className="col">
                                                        <input
                                                          type="text"
                                                          className="form-control"
                                                          name="post"
                                                          onChange={(e) =>
                                                            setPostText(
                                                              e.target.value
                                                            )
                                                          }
                                                          value={postText}
                                                          required
                                                          maxLength={250}
                                                          placeholder="Add a Comment or post a question"
                                                        />
                                                        <button
                                                          type="submit"
                                                          className="btn-icone"
                                                          aria-label="button-icone"
                                                        >
                                                          <FontAwesomeIcon
                                                            icon={faPaperPlane}
                                                          />
                                                        </button>
                                                      </div>
                                                      <div className="col-auto">
                                                        <button
                                                          type="button"
                                                          className="btn btn-sm btn-link"
                                                          disabled={uploading}
                                                          onClick={() =>
                                                            chatFileUploader.current.click()
                                                          }
                                                        >
                                                          <img
                                                            src="/assets/images/icon-clip2.png"
                                                            alt="this is image for upload file"
                                                          />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </form>
                                              </div>

                                              <div className="user-comment">
                                                {posts.map(
                                                  (post: any, i: number) => (
                                                    <div
                                                      key={"post" + i}
                                                      className="user-comment-box d-flex mb-3 clearfix"
                                                    >
                                                      <figure>
                                                        <div
                                                          className="avatar"
                                                          style={{
                                                            backgroundImage: `url(${avatar(
                                                              post.user
                                                            )})`,
                                                          }}
                                                        ></div>
                                                      </figure>

                                                      <div className="user-comment-info mb-0 w-100 pl-0">
                                                        <h4>
                                                          {post.user.name}
                                                        </h4>
                                                        <div
                                                          dangerouslySetInnerHTML={{
                                                            __html:
                                                              post.description,
                                                          }}
                                                        ></div>
                                                        <div className="like like_new px-0 pt-2 pb-0 mlm">
                                                          <ul className="nav">
                                                            <li>
                                                              {!voted(post) ? (
                                                                <span
                                                                  onClick={() =>
                                                                    vote(post)
                                                                  }
                                                                  className="like new-like-hart py-0 pr-0"
                                                                >
                                                                  <FontAwesomeIcon
                                                                    icon={
                                                                      faHeart
                                                                    }
                                                                    className="mt-0 pl-2"
                                                                  />
                                                                </span>
                                                              ) : (
                                                                <span
                                                                  onClick={() =>
                                                                    vote(post)
                                                                  }
                                                                  className="dis-like"
                                                                ></span>
                                                              )}
                                                            </li>
                                                            <li className="likkes">
                                                              {post.vote
                                                                ?.length > 0
                                                                ? post.vote
                                                                  ?.length
                                                                : 0}{" "}
                                                              {post.vote
                                                                ?.length == 1
                                                                ? "Like"
                                                                : "Likes"}
                                                            </li>
                                                            <li>
                                                              <a
                                                                className="text-primary"
                                                                onClick={() =>
                                                                  viewPost(post)
                                                                }
                                                              >
                                                                Reply{" "}
                                                              </a>
                                                            </li>
                                                            <li>
                                                              <a
                                                                className="text-primary"
                                                                onClick={() =>
                                                                  viewPost(post)
                                                                }
                                                              >
                                                                View Replies{" "}
                                                              </a>
                                                            </li>
                                                            {post.user._id ==
                                                              user?.info
                                                                ?._id && (
                                                                <li>
                                                                  <a
                                                                    onClick={() =>
                                                                      deletePost(
                                                                        post
                                                                      )
                                                                    }
                                                                    className="text-danger"
                                                                  >
                                                                    Delete{" "}
                                                                  </a>
                                                                </li>
                                                              )}
                                                            <li>
                                                              {fromNow(
                                                                post.updatedAt
                                                              )}
                                                            </li>
                                                          </ul>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </div>

                                              <div className="border"></div>

                                              <div className="comment-form comment-form_new clearfix d-block d-lg-none pt-3">
                                                <form
                                                  name="questionForm"
                                                  onSubmit={addQuestion}
                                                >
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
                                                          aria-label="addQuestion to form"
                                                          className="btn-icone"
                                                        >
                                                          <FontAwesomeIcon
                                                            icon={faPaperPlane}
                                                          />
                                                        </button>
                                                      </div>
                                                      <div className="col-auto">
                                                        <button
                                                          type="button"
                                                          aria-label="uploadfile_quetions"
                                                          className="btn btn-sm btn-link"
                                                          disabled={uploading}
                                                          onClick={() =>
                                                            chatFileUploader.current.click()
                                                          }
                                                        >
                                                          <img
                                                            src="/assets/images/icon-clip2.png"
                                                            alt="this is image for upload file"
                                                          />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </form>
                                              </div>
                                            </div>
                                          </div>

                                          <div
                                            className="tab-pane fade"
                                            id="learn"
                                          >
                                            <div className="side-menu">
                                              <div
                                                className="accordion"
                                                id="accordionMobile"
                                              >
                                                {allSections.map(
                                                  (section: any, i: number) => (
                                                    <div
                                                      key={`section${i}mobile`}
                                                    >
                                                      <div>
                                                        <div
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
                                                                options={
                                                                  chartOptions
                                                                }
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
                                                                aria-controls={`collapse${i}"`}
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
                                                      </div>
                                                      <div
                                                        id={`collapseContent${i}Mobile`}
                                                        className="collapse show"
                                                        aria-labelledby={`section${i}Mobile`}
                                                        data-parent="#accordionMobile"
                                                      >
                                                        <ul>
                                                          {section.contents.map(
                                                            (
                                                              content: any,
                                                              j: number
                                                            ) => (
                                                              <li
                                                                key={
                                                                  "sectionContent" +
                                                                  j
                                                                }
                                                              >
                                                                <a
                                                                  onClick={() =>
                                                                    selectContent(
                                                                      content
                                                                    )
                                                                  }
                                                                  role="button"
                                                                  className={
                                                                    activeContent ==
                                                                      content
                                                                      ? "active"
                                                                      : ""
                                                                  }
                                                                >
                                                                  {content.type ===
                                                                    "video" &&
                                                                    content.unlock && (
                                                                      <span className="iconc-video">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "video" &&
                                                                    !content.unlock && (
                                                                      <span className="iconc-video-lock">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "ebook" &&
                                                                    content.unlock && (
                                                                      <span className="icon3-ebook">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "ebook" &&
                                                                    !content.unlock && (
                                                                      <span className="icon3-ebook-lock">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "note" &&
                                                                    content.unlock && (
                                                                      <span className="iconc-content">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "note" &&
                                                                    !content.unlock && (
                                                                      <span className="iconc-content-lock">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "quiz" &&
                                                                    content.unlock && (
                                                                      <span className="iconc-quiz">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "quiz" &&
                                                                    !content.unlock && (
                                                                      <span className="iconc-quiz-lock">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "assessment" &&
                                                                    content.unlock && (
                                                                      <span className="icon3-assesment">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "assessment" &&
                                                                    !content.unlock && (
                                                                      <span className="icon3-assesment-lock">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "onlineSession" &&
                                                                    content.unlock && (
                                                                      <span className="icon3-onlineSession">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  {content.type ===
                                                                    "onlineSession" &&
                                                                    !content.unlock && (
                                                                      <span className="icon3-onlineSession-lock">
                                                                        <span className="font-karla">
                                                                          {
                                                                            content.title
                                                                          }
                                                                          {content.optional && (
                                                                            <em className="text-success">
                                                                              (Optional)
                                                                            </em>
                                                                          )}
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                </a>
                                                              </li>
                                                            )
                                                          )}
                                                        </ul>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
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
                                      </div>

                                      <div className="tab-content">
                                        <div
                                          className="tab-pane show active fade"
                                          id="ques2"
                                        >
                                          <div className="post-box post-box_new bg-white">
                                            <div className="user-comment">
                                              <div className="mark-btn-remove-back-to-all my-4 d-block">
                                                <a
                                                  className="btn btn-outline"
                                                  onClick={() =>
                                                    backToQuestions(true)
                                                  }
                                                >
                                                  Back to All Questions
                                                </a>
                                              </div>

                                              <div className="user-comment-box d-flex mb-3 clearfix">
                                                <figure>
                                                  <div
                                                    className="avatar"
                                                    style={{
                                                      backgroundImage: `url(${avatar(
                                                        activePost?.user
                                                      )})`,
                                                    }}
                                                  ></div>
                                                </figure>

                                                <div className="user-comment-info mb-0 w-100 pl-0">
                                                  <h4>
                                                    {activePost?.user.name}
                                                  </h4>
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        activePost?.description,
                                                    }}
                                                  ></div>
                                                </div>
                                              </div>

                                              <div className="reply-info mb-3">
                                                <p>
                                                  {activePost?.totalComments}{" "}
                                                  Replies
                                                </p>
                                              </div>
                                              {activePost?.comments.map(
                                                (comment: any, i: number) => (
                                                  <div
                                                    className="user-comment-box d-flex mb-3 clearfix"
                                                    key={comment._id}
                                                  >
                                                    <figure>
                                                      <div
                                                        className="avatar"
                                                        style={{
                                                          backgroundImage: `url(${avatar(
                                                            comment.user
                                                          )})`,
                                                        }}
                                                      ></div>
                                                    </figure>

                                                    <div className="user-comment-info mb-0 w-100 pl-0">
                                                      <h4>
                                                        {comment.user.name}
                                                      </h4>
                                                      <div
                                                        dangerouslySetInnerHTML={{
                                                          __html:
                                                            comment.description,
                                                        }}
                                                      ></div>
                                                      {comment.user._id ==
                                                        user?.info?._id && (
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
                                            </div>

                                            <div className="comment-form comment-form_new clearfix d-none d-lg-flex">
                                              <figure>
                                                <div
                                                  className="avatar"
                                                  style={{
                                                    backgroundImage: `url(${avatar(
                                                      user
                                                    )})`,
                                                  }}
                                                ></div>
                                              </figure>

                                              <form
                                                name="commentForm"
                                                onSubmit={addComment}
                                              >
                                                <div className="form-group">
                                                  <div className="row no-gutters align-items-center">
                                                    <div className="col">
                                                      <input
                                                        type="text"
                                                        className="form-control"
                                                        name="comment"
                                                        value={commentText}
                                                        onChange={(e: any) =>
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
                                                        aria-label="mobile_post button for discussion"
                                                        className="btn-icone"
                                                      >
                                                        <FontAwesomeIcon
                                                          icon={faPaperPlane}
                                                        />
                                                      </button>
                                                    </div>
                                                    <div className="col-auto">
                                                      <button
                                                        type="button"
                                                        aria-label="mobile_Fileupload button for discussion"
                                                        className="btn btn-sm btn-link"
                                                        disabled={uploading}
                                                        onClick={() =>
                                                          chatFileUploader.current.click()
                                                        }
                                                      >
                                                        <img
                                                          src="/assets/images/icon-clip2.png"
                                                          alt="this is image for upload file"
                                                        />
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </form>
                                            </div>

                                            <div className="border d-block d-lg-none"></div>

                                            <div className="comment-form comment-form_new clearfix d-block d-lg-none pt-3">
                                              <form
                                                name="commentForm"
                                                onSubmit={addComment}
                                              >
                                                <div className="form-group">
                                                  <div className="row no-gutters align-items-center">
                                                    <div className="col">
                                                      <input
                                                        type="text"
                                                        className="form-control"
                                                        name="comment"
                                                        value={commentText}
                                                        onChange={(e: any) =>
                                                          setCommentText(
                                                            e.target.value
                                                          )
                                                        }
                                                        required
                                                        maxLength={250}
                                                        placeholder="Add a Comment"
                                                      />
                                                    </div>
                                                    <div className="col-auto">
                                                      <button
                                                        type="button"
                                                        className="btn btn-sm btn-link"
                                                        disabled={uploading}
                                                        onClick={() =>
                                                          chatFileUploader.current.click()
                                                        }
                                                      >
                                                        <img
                                                          src="/assets/images/icon-clip2.png"
                                                          alt="this is image for upload file"
                                                        />
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </form>
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
                                        onClick={loadPosts}
                                      >
                                        Load more Discussions
                                      </a>
                                    </div>
                                  )}
                                </>
                              )}
                          </div>
                        )}
                        {!showAttemptSummary &&
                          !activeSection.locked &&
                          !postDetail &&
                          !activeContent.completed &&
                          ((activeContent.type != "assessment" &&
                            activeContent.type != "quiz") ||
                            activeContent.optional) && (
                            <div className="text-center">
                              <a
                                className="btn btn-outline d-none d-lg-block"
                                role="button"
                                onClick={() => markComplete()}
                              >
                                Mark as Complete
                              </a>
                              <a
                                className="btn btn-outline d-block d-lg-none fixed-bottom"
                                role="button"
                                onClick={() => markComplete()}
                              >
                                Mark as Complete
                              </a>
                            </div>
                          )}
                        {showAttemptSummary && (
                          <div className="text-center">
                            <a
                              className="btn btn-outline d-none d-lg-block"
                              role="button"
                              onClick={() => goNextFromAttemptSummary()}
                            >
                              Mark as Complete
                            </a>
                            <a
                              className="btn btn-outline d-block d-lg-none fixed-bottom"
                              role="button"
                              onClick={() => goNextFromAttemptSummary()}
                            >
                              Mark as Complete
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-lg-auto d-none d-lg-block">
                  <div className="right-gallery right-gallery_new">
                    {course && (
                      <div className="item ml-auto">
                        <div className="my-2 mb-3 text-dark">
                          <span>
                            {" "}
                            <b>{completedContents} </b> of{" "}
                            <b>{totalContents} </b>
                          </span>
                          <div className="progress-line">
                            <div
                              className="progress-status"
                              style={{
                                width: `${(completedContents / totalContents) * 100
                                  }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        {user?.info?.primaryInstitute?.preferences.general
                          .socialSharing && (
                            <div className="card-common widget bg-primary text-white p-3">
                              <h5 className="main_sub_title">Share</h5>
                              <div className="d-flex align-items-center height_match_user_profile">
                                <div className="d-flex align-items-center height_match_user_profile">
                                  <div className="socials_icons_wrap">
                                    <LinkedinShareButton
                                      url={getUtmLink("linkedin", "post")}
                                      className="mr-2"
                                    >
                                      <FontAwesomeIcon
                                        icon={faLinkedin}
                                        size="2x"
                                      />
                                    </LinkedinShareButton>
                                    <FacebookShareButton
                                      url={getUtmLink("facebook", "post")}
                                      className="mr-2"
                                    >
                                      <FontAwesomeIcon
                                        icon={faFacebookSquare}
                                        size="2x"
                                      />
                                    </FacebookShareButton>
                                    <TwitterShareButton
                                      url={getUtmLink("twitter", "post")}
                                      className="mr-2"
                                    >
                                      <FontAwesomeIcon
                                        icon={faTwitterSquare}
                                        size="2x"
                                      />
                                    </TwitterShareButton>
                                    <a
                                      aria-label="copy url"
                                      onClick={notifyCopied}
                                      className="mr-2"
                                    >
                                      <FontAwesomeIcon
                                        icon={faCopy}
                                        size="2x"
                                        color="white"
                                      />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="card-common widget">
                          <div className="card-header-common d-flex align-items-center">
                            <div
                              style={{
                                borderRadius: "50%",
                                border: "1px solid white",
                                backgroundColor: "#2525fe",
                                width: "30px",
                                height: "30px",
                                position: "relative",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faFileLines}
                                title="description"
                                style={{
                                  position: "absolute",
                                  transform: "translate(-50%, -50%)",
                                  left: "50%",
                                  top: "50%",
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            </div>

                            <div className="ml-2">
                              <h5 className="card-title-common">Analytics</h5>
                              <p className="card-text-common">
                                Manage your analytics
                              </p>
                            </div>
                          </div>
                          <div className="card-body-common">
                            <div className="text-right">
                              <button
                                className="btn btn-outline btn-sm btn-link-remove border-remove"
                                onClick={() =>
                                  router.push(`/course/analytics/${course._id}`)
                                }
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                        {clientData?.features?.studentWeeklyReport && (
                          <div className="card-common widget">
                            <div className="card-header-common d-flex align-items-center">
                              <div
                                style={{
                                  borderRadius: "50%",
                                  border: "1px solid white",
                                  backgroundColor: "#2525fe",
                                  width: "30px",
                                  height: "30px",
                                  position: "relative",
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faFileLines}
                                  title="description"
                                  style={{
                                    position: "absolute",
                                    transform: "translate(-50%, -50%)",
                                    left: "50%",
                                    top: "50%",
                                    width: "20px",
                                    height: "20px",
                                  }}
                                />
                              </div>

                              <div className="ml-2">
                                <h4 className="card-title-common">
                                  Weekly Report
                                </h4>
                                <p className="card-text-common">
                                  Download your weekly report
                                </p>
                              </div>
                            </div>
                            <div className="card-body-common">
                              <div className="text-right">
                                <button
                                  className="btn btn-outline btn-sm btn-link-remove border-remove"
                                  onClick={exportReport}
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {course.status == "revoked" &&
                          course.notificationMsg && (
                            <div className="card-common widget">
                              <div className="card-header-common d-flex align-items-center">
                                <div
                                  style={{
                                    borderRadius: "50%",
                                    border: "1px solid white",
                                    backgroundColor: "#2525fe",
                                    width: "30px",
                                    height: "30px",
                                    position: "relative",
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faFileLines}
                                    title="description"
                                    style={{
                                      position: "absolute",
                                      transform: "translate(-50%, -50%)",
                                      left: "50%",
                                      top: "50%",
                                      width: "20px",
                                      height: "20px",
                                    }}
                                  />
                                </div>
                                <div className="ml-2">
                                  <h4 className="card-title-common">
                                    Notification
                                  </h4>
                                </div>
                              </div>
                              <div className="card-body-common">
                                <div>
                                  <p className="card-text-common">
                                    {course.notificationMsg}{" "}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        {course.instructors?.length > 0 && (
                          <div className="card-common widget">
                            <div className="card-header-common">
                              <h5 className="card-title-common">
                                Instructor(s)
                              </h5>
                              <p className="card-text-common">
                                Ask your instructor a question
                              </p>
                            </div>
                            <div className="card-body-common">
                              {course.instructors.map(
                                (item: any, i: number) => (
                                  <div
                                    className="profile-item d-flex justify-content-between align-items-center my-1"
                                    key={"instructor" + i}
                                  >
                                    <div className="profile-item-info d-flex align-items-center">
                                      <figure className="user_img_circled_wrap">
                                        <img
                                          src={`/${avatar(item)}`}
                                          className="user_img_circled"
                                          alt=""
                                        />
                                      </figure>
                                      <div className="profile-name">
                                        <h5 className="instructor-name">
                                          {item.name}
                                        </h5>
                                      </div>
                                    </div>
                                    <a
                                      className="massage-btn text-center ml-auto"
                                      onClick={() => openChat(item)}
                                    >
                                      Message
                                    </a>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <div className="card-common widget">
                          <div className="card-header-common d-flex align-items-center">
                            <h5 className="card-title-common2">
                              Provide Course Feedback
                            </h5>
                          </div>
                          <div className="card-body-common">
                            <p className="mb-3">
                              Your feedback is valuable to us. Please provide
                              suggestions for improvements.
                            </p>
                            <div className="text-center">
                              <button
                                className="btn btn-outline btn-sm btn-link-remove border-remove"
                                onClick={openFeedback}
                              >
                                Send Feedback
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div >
      <CompletedModal
        show={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        course={course}
        gotoCertificate={gotoCertificate}
      />
      {/* <ContentSummaryModal /> */}
      <input
        hidden
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/bmp,image/gif"
        onChange={(e) => uploadFile(e)}
        ref={chatFileUploader}
      />
      <ReportModal
        show={showReport}
        onClose={() => setShowReport(false)}
        feedbackSubmit={feedbackSubmit}
        feedbackError={feedbackError}
        qfeedbackForm={qfeedbackForm}
        onFeedbackCheck={onFeedbackCheck}
        setQFeedbackForm={setQFeedbackForm}
      />
      <CourseStageFeedback
        show={showFeedback}
        onClose={() => setShowFeedback(false)}
        userCourse={userCourse}
        setUserCourse={setUserCourse}
        setRating={setRating}
        sendFeedback={sendFeedback}
        progress={progress}
        askFeedbackLater={askFeedbackLater}
      />
    </>
  );
};

export default CourseStage;
