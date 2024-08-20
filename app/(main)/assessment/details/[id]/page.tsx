"use client";
import { useState, useEffect, useRef } from "react";
import { slugify } from "@/lib/validator";
import { useSession } from "next-auth/react";
import { Value, Question } from "@/interfaces/interface";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { saveBlobFromResponse } from "@/lib/common";
import * as practicesetService from "@/services/practice-service";
import * as userService from "@/services/userService";
import * as favoriteSvc from "@/services/favaorite-service";
import alertify from "alertifyjs";
import { success, error, alert } from "alertifyjs";
import SummaryComponent from "./SummaryComponent";
import SettingsComponent from "./SettingsComponent";
import ReportedIssueComponent from "@/components/assessment/reported-issue";
import ResultComponent from "./ResultComponent";
import FeedbackComponent from "./FeedbackComponent";
import PImageComponent from "@/components/AppImage";
import QuestionComponent from "./QuestionComponent";
import AnswerSheetComponent from "./answersheet/AnswerSheetComponent";
import PreferenceComponent from "./PreferenceComponent";
import Rating from "react-rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fasHeart } from "@fortawesome/free-solid-svg-icons";
import Facebook from "next-auth/providers/facebook";
import { Modal } from "react-bootstrap";

import {
  faFacebookSquare,
  faLinkedin,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import { bool } from "aws-sdk/clients/signer";

const AssessmentDetails = () => {
  const { id } = useParams();
  const { push } = useRouter();
  // const queryParams = useSearchParams();
  const [clientData, setClientData]: any = useState();

  const user: any = useSession()?.data?.user?.info || {};

  const [isSaveAsClicked, setIsSaveAsClicked] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [classroom, setClassrom] = useState<any>();
  const [practicesetId, setPracticesetId] = useState<any>(null);
  const [practice, setPractice] = useState<any>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [initMenu, setInitMenu] = useState<Record<string, any>>({});
  const [instructors, setInstructors] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [fraudChecking, setFraudChecking] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const componentResultRef = useRef<any>(null);
  const [needEvaluation, setNeedEvaluation] = useState<boolean>(false);
  const [testExporting, setTestExporting] = useState<boolean>(false);
  const [testDownloading, setTestDownloading] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [sideMenus, setSideMenus] = useState<any>([
    {
      name: "Summary",
      _id: "summary",
    },
  ]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedSideMenu, setSelectedSideMenu] = useState<any>("");

  const queryParams = useSearchParams();
  const [preferences, setPreferences] = useState<any>(null);

  const [selectedSection, setSelectedSection] = useState<string>("");
  const [loadedMenus, setLoadedMenus] = useState({});
  const [downloadingAnswerSheet, setDownloadingAnswerSheet] =
    useState<boolean>(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState<boolean>(false);
  const [selectedQuestions, setSelectedQuestions] = useState<{
    map: Record<string, boolean>;
    array: any;
  }>({
    map: {},
    array: [],
  });
  const [proctorDownloading, setProctorDownloading] = useState<boolean>(false);
  const [testPublishing, setTestPublishing] = useState<boolean>(false);

  useEffect(() => {
    userService.get().then((us) => {
      if (sideMenus.length > 0) {
        let toOpen = sideMenus[0];
        if (queryParams.get("tab")) {
          toOpen =
            sideMenus.find((m) => m._id == queryParams.get("tab")) ||
            sideMenus[0];
        }

        onMenuChange(toOpen);
      }

      clientApi.get(`/api/settings`).then((res) => {
        setSettings(res.data);
        setBaseUrl(
          user.primaryInstitute?.site
            ? user.primaryInstitute?.site
            : res.data.baseUrl
        );

        setPracticesetId(id);

        practicesetService
          .showDetail(id)
          .then((da) => {
            const value = setPracticeFunc(da, us);
            setNeedEvaluation(
              da.status == "published" &&
              (!da.autoEvaluation ||
                da.questions.find(
                  (q) => q.question.category == "descriptive"
                ))
            );
            setSideMenus(rebuildMenu(value, us));
            for (const k in loadedMenus) {
              const updatedLoadedMenus = loadedMenus;
              updatedLoadedMenus[k] = false;
              setLoadedMenus(updatedLoadedMenus);
            }

            if (queryParams.get("menu")) {
              const toOpenMenu = sideMenus.find(
                (m) => m._id == queryParams.get("menu")
              );
              if (toOpenMenu) {
                onMenuChange(toOpenMenu);
                return;
              }
            } else {
              const savedMenu = sessionStorage.getItem(
                "teacher_test_detail_current_page_" + id
              );
              if (savedMenu) {
                sessionStorage.removeItem(
                  "teacher_test_detail_current_page_" + id
                );
                const toOpenMenu = sideMenus.find((m) => m._id == savedMenu);
                if (toOpenMenu) {
                  onMenuChange(toOpenMenu);
                  return;
                }
              }
            }

            onMenuChange(sideMenus[0]);
          })
          .catch((err) => {
            if (err.status == 404) {
              push("/not-found");
            }
          });
      });
    });
  }, []);

  const onMenuChange = (menu: any): void => {
    setLoadedMenus({
      ...loadedMenus,
      [menu._id]: true,
    });
    setSelectedSideMenu(menu._id);
  };

  const setPracticeFunc = (value: any, us?: any) => {
    if (!us) {
      us = user;
    }
    if (value) {
      value.slug = slugify(value.title);
      // if owner is not set, the test is not from marketplace, only the creator can edit it
      // else only owner can edit
      value.canEdit =
        us.role == "admin" ||
        us.role == "publisher" ||
        (value.instructors &&
          value.instructors.findIndex((e) => e._id == us._id) > -1) ||
        (value.origin == "institute" &&
          (us.role == "director" || value.user._id == us._id)) ||
        (value.origin == "publisher" && value.owner._id == us._id);
    }
    setPractice(value);
    return value;
  };

  const handleBeforeUnload = (event: any) => {
    sessionStorage.setItem(
      "teacher_test_detail_current_page_" + id,
      selectedSideMenu
    );
  };

  const downloadResult = () => {
    if (downloading) {
      return;
    }
    setDownloading(true);
  };

  const onDownloaded = (result: any) => {
    setDownloading(false);
    if (!result) {
      alertify.alert(
        "Message",
        "An error occurred while processing your request."
      );
    }
  };

  const downloadAnswerSheet = () => {
    if (downloadingAnswerSheet) {
      return;
    }
    setDownloadingAnswerSheet(true);
  };

  const onAnswerSheetDownloaded = (result: any) => {
    setDownloadingAnswerSheet(false);
    if (!result) {
      alertify.alert(
        "Message",
        "An error occurred while processing your request."
      );
    }
  };

  const openModal = () => {
    setShowSaveAsModal(true);
  };

  const saveAs = (title: any, id: any) => {
    setIsSaveAsClicked(true);
    if (practicesetId) {
      practicesetService
        .saveAs(practicesetId, { title })
        .then(async (data: any) => {
          alertify.success("Test created successfully.");
          setSubmitted(false);
          cancel(id);
          setIsSaveAsClicked(false);

          push(`/assessment/details/${data._id}?title=${data.title}`);
          setPracticesetId(data.id);

          setPracticeFunc(data);

          setSideMenus(rebuildMenu());
        })
        .catch((error) => {
          setIsSaveAsClicked(false);

          if (error.msg) {
            alertify.alert("Message", error.msg);
          } else if (error.error == "name_exists") {
            alertify.alert(
              "Warning",
              "Test already exists with same name. It may be inactive."
            );
          } else {
            alertify.alert(
              "Message",
              "Something went wrong. Please try again after some time."
            );
          }
        });
    } else {
      alertify.alert(
        "Message",
        "Something went wrong. Please try again after some time."
      );
    }
  };

  const cancel = (id: string) => {
    setTitle("");
    setShowSaveAsModal(false);
  };

  const updatePractice = async () => {
    const tmp_sideMenus = await rebuildMenu();
    setSideMenus(tmp_sideMenus);
  };

  const exportPDF = (id: any) => {
    setTestExporting(true);
    practicesetService
      .exportPDF(practice._id, true)
      .then((res: any) => {
        saveBlobFromResponse({
          fileName: slugify(practice.title),
          blob: res.blob,
        });
        setTestExporting(false);
      })
      .catch((err) => {
        alertify.alert(
          "Message",
          "An error occurred while creating the pdf document."
        );
        console.log("Fail to download test as pdf!", err);
        setTestExporting(false);
      });
  };

  const downloadTest = async (practiceId: string) => {
    const params = {
      directDownload: true,
      id: practiceId,
    };
    setTestDownloading(true);
    practicesetService
      .exportTest(params)
      .then((res: any) => {
        saveBlobFromResponse({
          fileName: slugify(practice.title),
          blob: res.blob,
        });
        setTestDownloading(false);
      })
      .catch((error) => {
        setTestDownloading(false);
        console.log(error);
      });
  };

  const genuinityCheck = async () => {
    if (fraudChecking) {
      return;
    }

    try {
      setFraudChecking(true);
      const res = await practicesetService.fraudCheck(practice._id);
      // if (this.componentResult) {
      //   this.componentResult.loadResult()
      // }
    } catch (err) {
      alert("Message", "Fraud check fail!");
    }

    setFraudChecking(false);
  };

  const notifyCopied = () => {
    alert("Message", "Public link is copied to clipboard!");
  };

  const closeModal = () => {
    setShowSaveAsModal(false);
    setTags([]);
    setSelectedSection("");
  };

  const sectionUpdate = async () => {
    const section = {
      questions: selectedQuestions.array.map((e) => e._id),
      section: selectedSection,
    };

    try {
      const res = await practicesetService.updateAllQuestionSection(
        practice._id,
        section
      );
      success("Question section is updated");
      selectedQuestions.map((q) => {
        q.section = selectedSection;
      });
      setSelectedSection("");
      // this.selectedQuestions.clear()
      // this.closeModal();
    } catch (err) {
      success("Fail to update question section");
    }
  };

  const addFavorite = async () => {
    try {
      const res = await favoriteSvc.create({ practiceSetId: practice._id });
      success("Assessment is added to your favorites");
      setPractice({
        ...practice,
        isFavorite: true,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const removeFavorite = async () => {
    try {
      const res = await favoriteSvc.deleteFav(practice._id);
      success("Assessment is removed from your favorites");
      setPractice({
        ...practice,
        isFavorite: false,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const confirmMimicQuestion = () => {
    success(
      "This AI-based Save As will include all questions and will create a copy of the assessment. Do you want to continue?"
    );
  };

  const mimicQuestion = (frm: any) => {
    setProcessing(true);
    practicesetService
      .mimicQuestions(
        frm.value.title,
        selectedQuestions.array.map((s) => s._id)
      )
      .then((data: any) => {
        alertify.success("Assessment is created");
        closeModal();

        push(`/assessment/details/${data._d}?title=${data.title}`);
        setProcessing(false);
      })
      .catch((error) => {
        if (error.msg) {
          alertify.alert("Message", error.msg);
        } else if (error.error == "name_exists") {
          alertify.alert("Warning", "Test already exists with same name.");
        } else {
          alertify.alert(
            "Message",
            "Something went wrong. Please try again after some time."
          );
        }
      });
  };

  const reviewTest = () => {
    if (!practice.totalQuestion) {
      alert(
        "Message",
        "No questions are added to review. Please add some questions in assessment to review."
      );
      return;
    }
    push(`/assessment/review/${practice._id}?menu=question`);
  };

  const rebuildMenu = (pra?: any, us?: any) => {
    if (!pra) {
      pra = practice;
    }
    if (!us) {
      us = user;
    }
    const sideMenu = [
      {
        name: "Summary",
        _id: "summary",
      },
    ];

    if (pra.canEdit) {
      sideMenu.push({
        name: "Settings",
        _id: "settings",
      });

      sideMenu.push({
        name: "Questions",
        _id: "question",
      });

      if (
        pra.status == "published" &&
        us.role != "publisher" &&
        us.primaryInstitute?.type != "publisher"
      ) {
        if (pra.origin == "publisher" && us.role == "admin") {
          sideMenu.push({
            name: "Preferences",
            _id: "preferences",
          });
        }
        sideMenu.push({
          name: "Answer Sheet",
          _id: "answersheet",
        });
      }

      sideMenu.push({
        name: "Reported Issues",
        _id: "issues",
      });

      if (pra.status !== "draft" && us.role !== "mentor") {
        if (
          us.role != "publisher" &&
          us.primaryInstitute?.type != "publisher"
        ) {
          sideMenu.unshift({
            name: "Result",
            _id: "result",
          });
        }

        if (pra.showFeedback) {
          sideMenu.push({
            name: "Feedback",
            _id: "feedback",
          });
        }
      }

      if (!pra.assignee) {
        sideMenu.push({
          name: "Linked Assessments",
          _id: "linked",
        });
      }

      if (pra.status == "published" && pra.accessMode == "buy") {
        sideMenu.push({
          name: "Coupons",
          _id: "coupon",
        });
      }
    } else {
      if (pra.status !== "draft" && us.role !== "mentor") {
        sideMenu.unshift({
          name: "Result",
          _id: "result",
        });
      }

      if (pra.status == "published") {
        sideMenu.push({
          name: "Preferences",
          _id: "preferences",
        });
      }

      sideMenu.push({
        name: "Questions",
        _id: "question",
      });

      if (!pra.assignee) {
        sideMenu.push({
          name: "Linked Assessments",
          _id: "linked",
        });
      }

      if (pra.status == "published") {
        sideMenu.push({
          name: "Answer Sheet",
          _id: "answersheet",
        });
      }
    }

    let updatedPreference: any;
    if (!pra.canEdit) {
      if (pra.status == "published") {
        if (!preferences) {
          practicesetService.getPreferences(pra._id).then((res) => {
            setPreferences(res);
            updatedPreference = res;
          });
        }

        if (pra.accessMode == "invitation" && updatedPreference?.isProctored) {
          sideMenu.push({
            name: "Proctor",
            _id: "proctor",
          });
        }
      }
    } else {
      if (
        pra.status == "published" &&
        pra.origin == "publisher" &&
        user.role == "admin" &&
        user.primaryInstitute?.type != "publisher"
      ) {
        if (!preferences) {
          practicesetService.getPreferences(pra._id).then((res) => {
            setPreferences(res);
          });
        }
      }

      if (
        pra.isProctored &&
        pra.status == "published" &&
        (user.role !== "publisher" || user.primaryInstitute.type != "publisher")
      ) {
        sideMenu.push({
          name: "Proctor",
          _id: "proctor",
        });
      }
    }

    return sideMenu;
  };

  const refreshProctor = () => {
    // this.componentProctor.refresh()
  };

  const onPreferencesUpdated = async () => {
    const updatedsideMenus = await rebuildMenu();
    setSideMenus(updatedsideMenus);
  };

  const downloadProctorStatus = async () => {
    // setProctorDownloading(true)
    // // await this.componentProctor.exportStatus()
    // this.proctorDownloading = false
  };

  const publish = (practice: any) => {
    if (practice.testType === "random") {
      const questionCount: any = {};
      for (const randomDetail of practice.randomTestDetails) {
        questionCount[randomDetail.topic] = {
          name: "",
          count: 0,
        };

        practice.questions.forEach((e) => {
          if (e.question.topic._id === randomDetail.topic) {
            questionCount[randomDetail.topic].name = e.question.topic.name;
            questionCount[randomDetail.topic].count++;
          }
        });

        if (randomDetail.questions > questionCount[randomDetail.topic].count) {
          alertify.alert(
            "Message",
            "Please add the minimum number of questions required for the topic " +
            questionCount[randomDetail.topic].name
          );
          return;
        }
      }
    }
    if (!practice.startDate && practice.isProctored) {
      alertify.alert("Message", "Start date is required.");
      return;
    }

    if (practice.testType === "random") {
      let totalQues = 0;
      practice.randomTestDetails.forEach((element) => {
        totalQues = totalQues + element.questions;
      });
      if (totalQues !== practice.questionsToDisplay) {
        alertify.alert(
          "Message",
          "Total questions count is not matching, you need to add or delete some questions while choosing random type"
        );
        return;
      }
    }
    if (!practice || (practice && typeof practice._id === "undefined")) {
      alertify.alert("Message", "Your practice is not found");
      return;
    }
    if (!practice.totalTime) {
      alertify.alert("Warning", "Time is empty");
      return;
    }
    let codingAndDesTypeQuestion = 0;

    if (practice.questions.length >= 2) {
      practice.questions.forEach(function (q, qI) {
        if (
          q.question.category == "code" ||
          q.question.category == "descriptive"
        ) {
          codingAndDesTypeQuestion++;
        }
      });
    }
    if (practice.totalQuestion < 5 && codingAndDesTypeQuestion < 2) {
      alertify.alert(
        "Message",
        "Please add at least " +
        5 +
        " questions before publishing the assessment."
      );
      return;
    }
    if (practice.startDate && practice.isProctored) {
      if (
        new Date(practice.startDate) < new Date() ||
        (practice.expiresOn &&
          new Date(practice.startDate) > new Date(practice.expiresOn))
      ) {
        alertify.alert(
          "Message",
          "Test start date must be after current date and before expiration date (if set)."
        );
        return;
      }
    }
    const validDate = addMinutes(new Date(), 30);
    if (practice.expiresOn && practice.expiresOn < validDate) {
      alertify.alert(
        "Message",
        "Expiration date must be at least 30 mins from now."
      );
      return;
    }
    if (practice.startTimeAllowance > 0) {
      if (
        practice.startTimeAllowance > practice.totalTime &&
        practice.isProctored
      ) {
        alertify.alert(
          "Message",
          "Start time allowance should not pass total test time."
        );
        return;
      }
    }

    alertify.confirm(
      "Are you sure you want to publish this Assessment?",
      (success) => {
        practice.status = "published";
        practice.statusChangedAt = new Date().getTime();
        // We will set this on server
        practicesetService
          .updateFunc(practice._id, practice)
          .then((data: any) => {
            practice.status = data.status;
            practice.statusChangedAt = data.statusChangedAt;
            practice.testCode = data.testCode;

            practice.lastModifiedBy = { name: user.name };
            practice.lastModifiedDate = new Date();

            alertify.success("Assessment published successfully.");
          })
          .catch((err) => {
            let msg = err.error.message;
            if (!err.error.message) {
              if (err.response.data[0]?.msg) {
                msg = err.response.data.map((e) => e.msg).join("<br/>");
              } else {
                msg = "Failed to update assessment!";
              }
            }
            alertify.alert("Message", msg);
          });
      }
    );
  };
  const addMinutes = (date: any, minutes: any) => {
    const newDate = new Date(date.getTime() + minutes * 60 * 1000);
    return new Date(newDate.setSeconds(0, 0));
  };
  return (
    <>
      <div className="d-block d-lg-none" style={{ backgroundColor: "#f4f4f7" }}>
        <div className="container">
          <div className="dashboard-area classroom">
            <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mt-2 mw-100">
              <div className="navbar-brand p-0"></div>

              <button
                className="navbar-toggler px-0"
                type="button"
                data-toggle="collapse"
                data-target="#navbarContentMobile"
                aria-controls="navbarContentMobile"
                aria-label="navbar-toggler"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div
                className="collapse navbar-collapse"
                id="navbarContentMobile"
              >
                <ul className="navbar-nav mr-auto">
                  {sideMenus.map((item: any) => (
                    <li
                      key={item._id}
                      className="mb-1"
                      onClick={() => onMenuChange(item)}
                    >
                      <a
                        className={
                          item.name === selectedSideMenu ? "active" : ""
                        }
                      >
                        {item?.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
      {course && (
        <div className="d-block d-lg-none" style={{ position: "sticky" }}>
          <div className="class-board bg-white mb-0 mt-3">
            <div className="class-board-inner mx-auto">
              <div className="d-flex">
                <figure className="squared-rounded_wrap_80">
                  <img
                    src="/assets/images/class-subject-img.png"
                    alt=""
                    className="user_squared-rounded"
                  />
                </figure>

                <div className="class-board-info ml-3">
                  <h3>{course.title}</h3>
                  <p>
                    <span>{instructors.toString()}</span>
                  </p>
                </div>
              </div>

              <div className="class-board-wrap">
                <h5>Course Completion Date</h5>
                <span>
                  {new Date(course.expiresOn).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="pt-lg-3" style={{ backgroundColor: "#f4f4f7" }}>
        <div className="container">
          <div className="dashboard-area classroom mx-auto">
            <div className="row">
              <div className="d-none d-lg-block col-lg-2">
                <div className="sidebar" sticky-menu>
                  <div className="all-classes-btn">
                    <a href="./../../" className="text-center text-white px-2">
                      All Assessments
                    </a>
                  </div>
                  <br />
                  <ul className="mt-0">
                    {sideMenus.map((item: any) => (
                      <li key={item._id} onClick={() => onMenuChange(item)}>
                        <a
                          className={
                            item._id === selectedSideMenu ? "active" : ""
                          }
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {practice && (
                <>
                  <div className="col-lg-10">
                    <div className="assessment-settings">
                      {!(selectedSideMenu == "Feedback") && (
                        <div className="assignment assessments-detail bg-white rounded-boxes text-black assesment-box">
                          <div className="form-row">
                            <div className="col-lg-auto d-none d-lg-block">
                              <div className="squared-rounded_wrap_100 mx-auto">
                                <PImageComponent
                                  height={100}
                                  width={100}
                                  imageUrl={practice.imageUrl}
                                  backgroundColor={practice.colorCode}
                                  text={practice.title}
                                  radius={9}
                                  fontSize={8}
                                  type="assessment"
                                  testMode={practice.testMode}
                                />
                              </div>
                            </div>
                            <div className="col-lg clearfix">
                              <div className="class-board-info TopMenuDetailAssess">
                                <div className="d-flex justify-content-between">
                                  <div className="d-flex align-items-center">
                                    <div className="publishedDet1Tag">
                                      <span
                                        className={`statusDetailsAssesP1 tag-type ${practice.status === "draft"
                                          ? "status_draft"
                                          : practice.status === "published"
                                            ? "status_published"
                                            : practice.status === "revoked"
                                              ? "status_revoked"
                                              : ""
                                          }`}
                                      >
                                        {practice.status}
                                      </span>
                                    </div>
                                    <div className="detNAmeAssess1">
                                      <span className="material-icons">
                                        lock_open
                                      </span>
                                    </div>
                                    <div
                                      className="lock ml-1 mode-title"
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={practice.title}
                                    >
                                      {practice.title}
                                    </div>
                                    {/* <Rating
      initialRating={practice.rating}
      readonly={true}
      emptySymbol={<i className="fa fa-star-o"></i>}
      fullSymbol={<i className="fa fa-star"></i>}
    /> */}
                                    <a className="btn btn-sm btn-icon">
                                      {!isFavorite && (
                                        <FontAwesomeIcon
                                          icon={farHeart}
                                          onClick={addFavorite}
                                        />
                                      )}
                                      {isFavorite && (
                                        <FontAwesomeIcon
                                          icon={fasHeart}
                                          onClick={removeFavorite}
                                          className="text-danger"
                                        />
                                      )}
                                    </a>
                                  </div>
                                  <div className="form-row mt-2">
                                    {(!user.primaryInstitute ||
                                      user.primaryInstitute.preferences.general
                                        .socialSharing) &&
                                      clientData &&
                                      practice.status === "published" &&
                                      practice.accessMode !== "invitation" && (
                                        <>
                                          <a
                                            className="col-auto text-black"
                                            onClick={() =>
                                              handleShareClick("facebook")
                                            }
                                            role="button"
                                          >
                                            <FontAwesomeIcon
                                              icon={faFacebookSquare}
                                              size="2x"
                                            />
                                          </a>
                                          <a
                                            className="col-auto text-black"
                                            onClick={() =>
                                              handleShareClick("linkedin")
                                            }
                                            role="button"
                                          >
                                            <FontAwesomeIcon
                                              icon={faLinkedin}
                                              size="2x"
                                            />
                                          </a>
                                          <a
                                            className="col-auto text-black"
                                            onClick={() =>
                                              handleShareClick("twitter")
                                            }
                                            role="button"
                                          >
                                            <FontAwesomeIcon
                                              icon={faTwitterSquare}
                                              size="2x"
                                            />
                                          </a>
                                          {/* Uncomment the following lines if you want to include a copy button */}
                                          <a
                                            className="col-auto text-black"
                                            // onClick={copyUrl}
                                            role="button"
                                          >
                                            {/* <FontAwesomeIcon
                                              icon={faCopy}
                                              size="2x"
                                            /> */}
                                          </a>
                                        </>
                                      )}
                                  </div>
                                </div>
                                <div className="assess-demo detail contntSujCt1 m-0 d-flex align-items-center my-1">
                                  <span className="material-icons">
                                    border_color
                                  </span>
                                  {practice.subjects &&
                                    practice.subjects[0] && (
                                      <span className="sub-text ml-2">
                                        {practice.subjects[0].name}
                                      </span>
                                    )}
                                  {practice.subjects &&
                                    practice.subjects.length > 1 && (
                                      <span className="sub-text ml-2">
                                        + {practice.subjects.length - 1} more
                                      </span>
                                    )}

                                  <span className="material-icons ml-2">
                                    content_paste
                                  </span>
                                  {practice.units && practice.units[0] && (
                                    <span className="sub-text ml-2">
                                      {practice.units[0].name}
                                    </span>
                                  )}
                                  {practice.units &&
                                    practice?.units?.length > 1 && (
                                      <span className="sub-text ml-2">
                                        + {practice?.units?.length - 1} more
                                      </span>
                                    )}
                                </div>
                                <div className="row text-center align-items-end">
                                  <div className="col-lg-6 mt-2 mt-lg-0">
                                    <div className="assess-demo-head del2 detail">
                                      <div>
                                        <div className="asses-right overview clearfix border-0">
                                          <div className="asses-item py-0 border-0 pl-0">
                                            <h4 className="number-big">
                                              {practice.totalQuestion}
                                            </h4>
                                            <small className="number-big_subtitle">
                                              Questions
                                            </small>
                                          </div>
                                          <div className="asses-item py-0">
                                            <h4 className="number-big">
                                              {practice.totalTime}
                                            </h4>
                                            <small className="number-big_subtitle">
                                              Minutes
                                            </small>
                                          </div>
                                          {practice.totalJoinedStudent > 0 && (
                                            <div className="asses-item py-0">
                                              <h4 className="number-big">
                                                {practice.totalJoinedStudent}
                                              </h4>
                                              <small className="number-big_subtitle">
                                                Students
                                              </small>
                                            </div>
                                          )}
                                          {practice.totalAttempt > 0 && (
                                            <div className="asses-item py-0">
                                              <h4 className="number-big">
                                                {practice.totalAttempt}
                                              </h4>
                                              <small className="number-big_subtitle">
                                                Attempts
                                              </small>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-6 ml-lg-auto mt-2 mt-lg-0">
                                    {user.role !== "mentor" && (
                                      <div>
                                        <div className="form-row">
                                          {selectedSideMenu !== "Result" && (
                                            <>
                                              {selectedSideMenu ===
                                                "Questions" &&
                                                user.primaryInstitute
                                                  ?.canUseAI && (
                                                  <div
                                                    className={`col cursor-pointer ${selectedQuestions.array
                                                      .length === 0 &&
                                                      "disabled"
                                                      }`}
                                                    onClick={
                                                      confirmMimicQuestion
                                                    }
                                                  >
                                                    <i className="fas fa-tags fa-2x d-block mb-1"></i>
                                                    <strong className="up ah-cursor">
                                                      Create Mimic Question
                                                    </strong>
                                                    <p className="small font-italic down">
                                                      Select the question to
                                                      mimic
                                                    </p>
                                                  </div>
                                                )}

                                              {selectedSideMenu ===
                                                "question" &&
                                                practice.enableSection &&
                                                practice.sections.length >
                                                0 && (
                                                  <div
                                                    className={`col cursor-pointer ${selectedQuestions.array
                                                      .length === 0 &&
                                                      "disabled"
                                                      }`}
                                                    onClick={() => openModal()}
                                                  >
                                                    <i className="fas fa-layer-group fa-2x d-block mb-1"></i>
                                                    <strong className="up ah-cursor">
                                                      Update Section
                                                    </strong>
                                                  </div>
                                                )}

                                              {selectedSideMenu ===
                                                "question" && (
                                                  <div
                                                    className="col cursor-pointer"
                                                    onClick={reviewTest}
                                                  >
                                                    <i className="fas fa-book-reader fa-2x d-block mb-1"></i>
                                                    <strong className="up ah-cursor">
                                                      Review
                                                    </strong>
                                                  </div>
                                                )}

                                              {selectedSideMenu !== "proctor" &&
                                                selectedSideMenu !== "result" &&
                                                (user.role === "admin" ||
                                                  practice.origin !==
                                                  "publisher" ||
                                                  user.role === "publisher" ||
                                                  user.primaryInstitute.type ===
                                                  "publisher") && (
                                                  <>
                                                    {practice.status ===
                                                      "draft" &&
                                                      (user.role === "admin" ||
                                                        practice.canEdit) && (
                                                        <div
                                                          className="cursor-pointer"
                                                          onClick={() =>
                                                            publish(practice)
                                                          }
                                                        >
                                                          <i className="fas fa-book-open fa-2x d-block mb-1"></i>
                                                          <strong className="up ah-cursor">
                                                            Publish&nbsp;
                                                            {testPublishing && (
                                                              <i className="fa fa-spinner fa-pulse"></i>
                                                            )}
                                                          </strong>
                                                        </div>
                                                      )}

                                                    {practice.canEdit && (
                                                      <div
                                                        className="col cursor-pointer"
                                                        onClick={() =>
                                                          setShowSaveAsModal(
                                                            true
                                                          )
                                                        }
                                                      >
                                                        <i className="far fa-copy fa-2x d-block mb-1"></i>
                                                        <strong className="up ah-cursor">
                                                          Save As
                                                        </strong>
                                                        <p className="small font-italic down">
                                                          (To duplicate this
                                                          test)
                                                        </p>
                                                      </div>
                                                    )}

                                                    {(user.role === "admin" ||
                                                      settings?.features
                                                        ?.testExport) &&
                                                      practice.canEdit && (
                                                        <div
                                                          className="col cursor-pointer"
                                                          onClick={() =>
                                                            downloadTest(
                                                              practice._id
                                                            )
                                                          }
                                                        >
                                                          <i className="far fa-file-excel fa-2x d-block mb-1"></i>
                                                          <strong className="up ah-cursor">
                                                            Download&nbsp;
                                                            {testDownloading && (
                                                              <i className="fa fa-spinner fa-pulse"></i>
                                                            )}
                                                          </strong>
                                                          <p className="small font-italic down">
                                                            (Excel)
                                                          </p>
                                                        </div>
                                                      )}

                                                    {(settings?.features
                                                      ?.testExport ||
                                                      user.role === "admin" ||
                                                      user.role ===
                                                      "publisher") && (
                                                        <div
                                                          className="col cursor-pointer"
                                                          onClick={() =>
                                                            exportPDF(
                                                              practice._id
                                                            )
                                                          }
                                                        >
                                                          <i className="far fa-file-pdf fa-2x d-block mb-1"></i>
                                                          <strong className="up ah-cursor">
                                                            Export&nbsp;
                                                            {testExporting && (
                                                              <i className="fa fa-spinner fa-pulse"></i>
                                                            )}
                                                          </strong>
                                                          <p className="small font-italic down">
                                                            (PDF)
                                                          </p>
                                                        </div>
                                                      )}
                                                  </>
                                                )}
                                            </>
                                          )}
                                          {selectedSideMenu === "result" && (
                                            <div className="form-row alWhenNotresuLt justify-content-end">
                                              {settings?.features
                                                ?.fraudDetect &&
                                                practice.status ===
                                                "published" &&
                                                practice.isProctored &&
                                                (user.role === "admin" ||
                                                  user.role === "director" ||
                                                  user._id ===
                                                  practice.user._id) && (
                                                  <div
                                                    className="col-4 cursor-pointer"
                                                    onClick={genuinityCheck}
                                                  >
                                                    <span className="material-icons d-block ah-cursor">
                                                      check_circle
                                                    </span>
                                                    <p className="up ah-cursor">
                                                      Genuinity Check
                                                    </p>
                                                  </div>
                                                )}

                                              {settings?.features?.evaluation &&
                                                user.role !== "support" &&
                                                needEvaluation && (
                                                  <div
                                                    className="col-4 cursor-pointer"
                                                    onClick={() => { }}
                                                  >
                                                    {/* Need to implement routerLink and queryParams */}
                                                    <span className="material-icons d-block ah-cursor">
                                                      pending
                                                    </span>
                                                    <p className="up ah-cursor">
                                                      Pending Evaluation
                                                    </p>
                                                  </div>
                                                )}

                                              <div
                                                className="col-4 cursor-pointer"
                                                onClick={downloadResult}
                                              >
                                                <span className="material-icons d-block ah-cursor">
                                                  download
                                                </span>
                                                <p className="up ah-cursor">
                                                  Download Result{" "}
                                                  <i
                                                    className={`${downloading &&
                                                      "fa fa-spinner fa-pulse"
                                                      }`}
                                                  ></i>
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          {selectedSideMenu ===
                                            "answersheet" && (
                                              <>
                                                <div
                                                  className="col-4 cursor-pointer"
                                                  onClick={downloadAnswerSheet}
                                                >
                                                  <span className="material-icons d-block ah-cursor">
                                                    download
                                                  </span>
                                                  <p className="up ah-cursor">
                                                    Download Result{" "}
                                                    <i
                                                      className={` ${downloadingAnswerSheet &&
                                                        "fa-pulse fa fa-spinner"
                                                        }`}
                                                    ></i>
                                                  </p>
                                                </div>
                                              </>
                                            )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedSideMenu === "summary" && (
                      <SummaryComponent
                        practice={practice}
                        setPractice={setPractice}
                        clientData={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                        classroom={classroom}
                        setClassrom={setClassrom}
                      />
                    )}
                    {selectedSideMenu === "settings" && (
                      <SettingsComponent
                        practice={practice}
                        setPractice={setPractice}
                        practicesetId={practicesetId}
                        clientData={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                      />
                    )}
                    {selectedSideMenu === "issues" && (
                      <ReportedIssueComponent
                        test={practice}
                        practicesetId={practicesetId}
                        setTest={setPractice}
                        clientData={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                      />
                    )}
                    {selectedSideMenu === "result" && (
                      <ResultComponent
                        practice={practice}
                        setPractice={setPractice}
                        practicesetId={practicesetId}
                        updatePractice={updatePractice}
                        clientData={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                        downloading={downloading}
                        setDownloading={setDownloading}
                      />
                    )}

                    {selectedSideMenu === "feedback" && (
                      <FeedbackComponent
                        practice={practice}
                        setPractice={setPractice}
                        practicesetId={practicesetId}
                        updatePractice={updatePractice}
                        clientData={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                      />
                    )}

                    {selectedSideMenu === "answersheet" && (
                      <AnswerSheetComponent
                        practice={practice}
                        setPractice={setPractice}
                        practicesetId={practicesetId}
                        updatePractice={updatePractice}
                        settings={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                        downloading={downloadingAnswerSheet}
                        setDownloading={setDownloadingAnswerSheet}
                      />
                    )}

                    {selectedSideMenu === "question" && (
                      <QuestionComponent
                        practice={practice}
                        setPractice={setPractice}
                        practicesetId={practicesetId}
                        selectedQuestions={selectedQuestions}
                        setSelectedQuestions={setSelectedQuestions}
                        updatePractice={updatePractice}
                        clientData={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                      />
                    )}
                    {selectedSideMenu === "preferences" && (
                      <PreferenceComponent
                        practice={practice}
                        setPractice={setPractice}
                        practicesetId={practicesetId}
                        preferences={preferences}
                        setPreferences={setPreferences}
                        clientData={settings}
                        user={user}
                        selectedSideMenu={selectedSideMenu}
                        updated={onPreferencesUpdated}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <Modal
            show={showSaveAsModal}
            onHide={() => setShowSaveAsModal(false)}
            backdrop="static"
            keyboard={false}
          >
            <div className="form-boxes">
              <div className="modal-header modal-header-bg justify-content-center">
                <h1 className="form-box_title">New Assessment</h1>
              </div>
              <div className="modal-body text-black">
                <p className="mb-1">
                  This will create new assessment with similar settings from the
                  current assessment.
                </p>

                <input
                  type="text"
                  className="form-control border-bottom rounded-0"
                  maxLength="50"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  name="test_title"
                  required
                />
                <div>
                  {submitted && !title.trim() && (
                    <p className="label label-danger text-danger">
                      Title is required
                    </p>
                  )}
                  {title.length > 50 && (
                    <p className="label label-danger text-danger">
                      Title must be smaller than 50 characters.
                    </p>
                  )}
                  {title.length < 3 && (
                    <p className="label label-danger text-danger">
                      Title must be greater than 2 characters.
                    </p>
                  )}
                </div>

                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn bg_light mr-1"
                    onClick={() => cancel(1)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={!title.trim()}
                    onClick={() => saveAs(title, 1)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </>
  );
};

export default AssessmentDetails;
