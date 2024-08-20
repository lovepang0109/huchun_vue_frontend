"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { Modal } from "react-bootstrap";
import * as CryptoJS from "crypto-js";
import LoadingOverlay from "react-loading-overlay-ts";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import Countdown from "react-countdown";
import CodingQuestion from "@/components/assessment/coding-question";
import Descriptive from "@/components/assessment/descriptive-question";
import FibQuestion from "@/components/assessment/fib-question";
import MathJax from "@/components/assessment/mathjax";
import McqQuestion from "@/components/assessment/mcq-question";
import MixmatchQuestion from "@/components/assessment/mixmatch-question";
import CalculatorModal from "@/components/calculator";
import LearningTestReportModal from "@/components/feedback/ReportModal";
import ScratchPad from "@/components/assessment/scratchpad";
import { avatar, formatQuestion } from "@/lib/pipe";
import * as attemptService from "@/services/attemptService";
import * as feedbackSvc from "@/services/feedbackService";
import Webcam from "react-webcam";

import {
  codeLanguageDisplay,
  elipsisText,
  slugify,
  toQueryString,
} from "@/lib/validator";
import clientApi from "@/lib/clientApi";
import { alert, confirm } from "alertifyjs";
import alertify from "alertifyjs";
import {
  cacheQuestionOrder,
  cacheTestAttemptMap,
  cacheTestDataOfAttempt,
  getCacheAttemptFraudCheck,
  getCacheUserAnswers,
  getCacheQuestionOrder,
  getCacheAttemptQuestionPosition,
  getCachedAttemptTime,
  getCacheTestCameraTime,
  cacheTestCameraTime,
  cacheAttemptQuestionPosition,
  cacheUserAnswers,
  createQARow,
  getCacheOffscreenTime,
  removeCacheOffscreenTime,
  cacheAttemptFraudCheck,
  getUserAnswers,
  clearCachedAttempt,
  cacheAttemptSubmission,
  getCacheAttemptSubmission,
  isFullscreen,
  fullScreen,
  setElapseTime,
  changeCachedAttemptId,
  cacheAttemptTime,
} from "@/lib/helpers";
import { codeLanguages, questionStatus, reArrangeAnswers } from "@/lib/common";
import { useTakeTestStore } from "@/stores/take-test-store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import test from "node:test";
const TakeTest = () => {
  const router = useRouter();
  const { user } = useSession().data || {};
  const {
    updateAnswersOfUser,
    answersOfUser,
    localStartTime,
    updateLocalStartTime,
    serverStartTime,
    updateServerStartTime,
    adjustLocalTime,
    updateTestStarted,
    updateClientData,
    previousUrl,
    updateIsCoding,
    codingQuestion,
  } = useTakeTestStore();
  const { id } = useParams();
  const codingRef: any = useRef();
  const [practice, setPractice] = useState<any>({});
  const [clientData, setClientData] = useState<any>();
  const [view, setView] = useState<string>("default");
  const [lgBreak, setlgBreak] = useState<boolean>(false);
  const [sectionSettings, setSectionSettings] = useState<any>({});
  const [sectionQuestions, setSectionQuestions] = useState<any>({});
  const [sections, setSections] = useState<any[]>([]);
  const [savedFraudData, setSavedFraudData] = useState<any>();
  const [fraudCheckingQuestions, setFraudCheckingQuestions] = useState<any[]>(
    []
  );
  const [clearFraudListOnNext, setClearFraudListOnNext] =
    useState<boolean>(false);
  const [fraudDetected, setFraudDetected] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [sectionNo, setSectionNo] = useState<number>(0);
  const [sectionTimeElapse, setSectionTimeElapse] = useState<any>({});
  const [currentTimeElapse, setCurrentTimeElapse] = useState<number>(0);
  const [lastLength, setLastLength] = useState<number>(0);
  const [sortSection, setSortSection] = useState<number>(0);
  const [testTimeCountDown, setTestTimeCountDown] = useState<number>(0);
  const [lastCheckpointTime, setLastCheckpointTime] = useState<any>(
    new Date().getTime()
  );
  const [currPage, setCurrPage] = useState<number>(1);
  const [finishingSectionNo, setFinishingSectionNo] = useState<number>();
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<any>();
  const [currentSection, setCurrentSection] = useState<any>();
  const [totalQuestion, setTotalQuestion] = useState<number>(0);
  const [question, setQuestion] = useState<any>({});
  const [cameraTime, setCameraTime] = useState<any[]>([]);
  const [toggleQuestionPanel, setToggleQuestionPanel] =
    useState<boolean>(false);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [pauseTimer, setPauseTimer] = useState<boolean>(false);
  const [headerTooLong, setHeaderTooLong] = useState<boolean>(false);
  const [fullscreen, setFullScreen] = useState<boolean>(false);
  const [handleClose, setHandleClose] = useState<boolean>(false);
  const [refreshTimer, setRefreshTimer] = useState<boolean>(false);
  const [logTimeCount, setLogTimeCount] = useState<number>(0);
  const [logTime, setLogTime] = useState<any>();
  const [turnServers, setTurnServers] = useState<any>();
  const [terminating, setTerminating] = useState<boolean>(false);
  const [timerStopManually, setTimerStopManually] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [disableOffscreenCheck, setDisableOffscreenCheck] =
    useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>();
  const [offscreenTime, setOffscreenTime] = useState<number>(0);
  const [totalMissedQuestion, setTotalMissedQuestion] = useState<number>(0);
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalMarked, setTotalMarked] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showQuestionHeader, setShowQuestionHeader] = useState<boolean>(false);
  const [totalAnswerAndMarked, setTotalAnswerAndMarked] = useState<number>(0);
  const [rtcPeers, setRtcPeers] = useState<any>({});
  const [showSketchpad, setShowSketchpad] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<any>();
  const [languageIndex, setLanguageIndex] = useState<number>(0);
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] =
    useState<boolean>(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState<boolean>(false);
  const [isAnswerCrossOutShow, setIsAnswerCrossOutShow] =
    useState<boolean>(false);
  const [clockHidden, setClockHidden] = useState<boolean>(false);
  const [reviewAttempt, setReviewAttempt] = useState<boolean>(false);
  const [expandedPanel, setExpandedPanel] = useState<string>("none");
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [answerArray, setAnswerArray] = useState<any>([]);
  const [answeredQuestion, setAnsweredQuestion] = useState<any>([]);
  const [descriptiveAnswer, setDescriptiveAnswer] = useState<any>([]);

  const [feedbackSubmiting, setFeedbackSubmiting] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>("");
  const [avgTimeSpent, setAvgTimeSpent] = useState<number>(0);
  const [timeElapse, setTimeElapse] = useState<number>(0);
  const [isReported, setIsReported] = useState<boolean[]>([]);
  const [qfeedbackForm, setQFeedbackForm] = useState<any>({
    ckFrame: false,
    ckMore: false,
    ckAnother: false,
    ckExp: false,
    ckVideo: false,
    txtAnother: "",
  });
  const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
  const [mouseMode, setMouseMode] = useState("pointer");

  const baseQuestionIdx = useMemo(
    () => questionIndex + lastLength,
    [questionIndex, lastLength]
  );
  const [timerConfig, setTimerConfig] = useState<any>({
    format: "mm:ss",
    leftTime: 5,
    demand: false,
  });

  const [breakTimerConfig, setBreakTimerConfig] = useState<any>({
    format: "mm:ss",
    leftTime: 5,
    demand: false,
  });
  const [capturing, setCapturing] = useState<boolean>(false);
  const [showAnnotationPanel, setShowAnnotationPanel] =
    useState<boolean>(false);
  const [capturingTime, seCapturingTime] = useState<any>();
  const [selectingText, setSelectingText] = useState<string>("");
  const [sectionDirection, setSectionDirection] = useState<boolean>(false);
  const [graphingModal, setGraphingModal] = useState<boolean>(false);
  const [isCalculatorModal, setIsCalculatorModal] = useState<boolean>(false);
  const [answerMasking, setAnswerMasking] = useState<boolean>(false);
  const fibQuestion = useRef(null);
  const handleMouseModeChange = (mode) => {
    setMouseMode(mode);
    onMousePointerChanged(mode);
  };

  const onFibTextChange = (evt: any) => {
    // this.question.isAnswered = true;
    const index = evt.index;
    let text = evt.text;
    const latex = evt.latex;
    // Mean this is math data comming from mathlive tool
    if (latex && text.indexOf("<math ") == -1) {
      text =
        '<math xmlns="http://www.w3.org/1998/Math/MathML">' + text + "</math>";
    }

    if (text === "" || text == undefined) {
      const newQuestions = [...question.answers]; // Make a copy of the current questions array
      newQuestions[index].answeredText = text;
      newQuestions[index].isChecked = false;
      newQuestions[index].answeredText = text;
      newQuestions[index].mathData = latex;
      setQuestion({
        ...question,
        answers: newQuestions,
      });

      // if (this.appInit.answersOfUser.QA[this.baseQuestionIdx]) {
      //   this.appInit.answersOfUser.QA[this.baseQuestionIdx].isMissed = true;
      // }
      questionAnswered(false);
    } else {
      const newQuestions = [...question.answers]; // Make a copy of the current questions array

      newQuestions[index].isChecked = true;

      // if (this.appInit.answersOfUser.QA[this.baseQuestionIdx]) {
      //   this.appInit.answersOfUser.QA[this.baseQuestionIdx].isMissed = false;
      // }
      newQuestions[index].answeredText = text.trim();
      newQuestions[index].mathData = latex;
      setQuestion({
        ...question,
        answers: newQuestions,
      });

      questionAnswered(true);
    }

    // if (this.appInit.answersOfUser.QA[this.baseQuestionIdx]) {
    //   if (this.appInit.answersOfUser.QA[this.baseQuestionIdx].answers[index]) {
    //     this.appInit.answersOfUser.QA[this.baseQuestionIdx].answers[
    //       index
    //     ].answerText = this.question.answers[index].answeredText;
    //     this.appInit.answersOfUser.QA[this.baseQuestionIdx].answers[
    //       index
    //     ].mathData = latex;
    //   } else {
    //     if (index > 0) {
    //       const answer = {
    //         answerId: this.question.answers[index]._id,
    //         answerText: this.question.answers[index].answeredText,
    //         mathData: latex,
    //       };
    //       this.appInit.answersOfUser.QA[this.baseQuestionIdx].answers.push(
    //         answer
    //       );
    //     }
    //   }
    // }

    // this.attemptHelper.createQARow(this.question, this.baseQuestionIdx);
  };

  const onMousePointerChanged = (mode) => {
    if (!mode) {
      mode = mouseMode;
    }
    if (mode == "eliminator") {
      setIsAnswerCrossOutShow(true);
    } else {
      setIsAnswerCrossOutShow(false);
    }
  };
  const graphingCalculatorModal = () => {
    if (!graphingModal) {
      setGraphingModal(true);
    }
  };

  const toogleAnswerMasking = () => {
    setAnswerMasking(!answerMasking);
  };

  const openCalculatorModal = () => {
    if (!isCalculatorModal) {
      setIsCalculatorModal(true);
    }
  };
  const showSectionDirection = () => {
    setSectionDirection(true);
    setReviewAttempt(false);
  };

  const hideSectionDirection = () => {
    setSectionDirection(false);
  };
  const ensureQuestionRow = (q: any, qIdx: number) => {
    const { QA } = answersOfUser;
    if (!QA || qIdx > QA.length - 1) {
      createQARow(q, qIdx, answersOfUser, updateAnswersOfUser, adjustLocalTime);
    }
  };

  const finishSection = () => {
    addDescriptiveAnswer();
    let msg = "You are finishing current section and";
    msg = msg + " you will not be able to return to previous section.";
    msg = msg + " Do you want to continue?";
    setFinishingSectionNo(sectionNo);
    setPauseTimer(true);
    confirm(msg, (resp: any) => {
      if (finishingSectionNo != sectionNo) {
        return;
      }
      timerStopped();
    }).setHeader(" Message ");
  };
  console.log(sectionQuestions, "sectionQuestions");
  const openSketch = () => {
    setShowSketchpad(!showSketchpad);

    // if (codeEditor) {
    //     codeEditor.setOption('readOnly', .showSketchpad ? 'nocursor' : false)
    // }
  };

  const calculatorModal = () => {
    const elem = document.getElementById("calculatoModalButton");
    if (elem) {
      elem.click();
    }
  };

  const watchCodingInstruction = () => {
    // document.getElementById("openModalButton").click();
  };

  const markForReview = async (isMarked: any, next: any) => {
    if (!question) {
      return;
    }

    if (question.hasMarked == isMarked) {
      if (next) {
        await nextQuestion();
      }
      return;
    }
    // console.log('markForReview called')
    setQuestion((prev: any) => ({ ...prev, hasMarked: isMarked }));
    let newAnswersOfUser = answersOfUser;
    newAnswersOfUser.QA[baseQuestionIdx] = {
      ...newAnswersOfUser.QA[baseQuestionIdx],
      hasMarked: isMarked,
    };
    updateAnswersOfUser(newAnswersOfUser);
    setTotalMarked((prev: any) => (isMarked ? prev + 1 : prev - 1));

    if (question.isAnswered) {
      setTotalAnswerAndMarked((prev: any) => (isMarked ? prev + 1 : prev - 1));
    }

    if (next) {
      await nextQuestion();
    }
  };

  const previousQuestion = async () => {
    if (!ensureFullScreen()) {
      return;
    }
    // if (!(await ensureCamCondition())) {
    //   return;
    // }
    addDescriptiveAnswer();

    if (currPage == totalQuestion) {
      ensureQuestionRow(question, baseQuestionIdx);
    }

    setLastCheckpointTime(
      setElapseTime(
        practice,
        baseQuestionIdx,
        lastCheckpointTime,
        answersOfUser,
        updateAnswersOfUser
      )
    );

    setCurrPage((prev: number) => prev - 1);
    setQuestionIndex((prev: number) => prev - 1);
    setUserAnswers(answersOfUser.QA[baseQuestionIdx]);
    setTimeout(() => {
      let quest = practice.enableSection
        ? currentSectionQuestions[questionIndex - 1]
        : answeredQuestion[questionIndex - 1];
      reArrangeAnswers(quest.answers);
      questionChanges(quest);
      setQuestion(quest);
    }, 300);
  };

  const feedbackClose = () => {
    setShowReportModal(false);
    setQFeedbackForm({
      ckFrame: false,
      ckMore: false,
      ckAnother: false,
      txtAnother: "",
    });
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
      questionId: question?._id,
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

    setFeedbackSubmiting(true);
    try {
      await clientApi.post("/api/feedbacks/questionFeedback", qfeedback);
      setShowReportModal(false);
      alertify.success("Your feedback is submitted.");
      setIsReported((prevArray) =>
        prevArray.map((item, idx) => (idx === currPage - 1 ? !item : item))
      );
      // alert("Message","Success", "Your feedback is submitted.");
    } catch (error) {
      // setShowReportModal(false);
      alertify.error("Failed to submit your feedback.");
      // alert("Message","Warning", "Failed to submit your feedback.");
    }
  };

  const questionChanges = (question: any) => {
    let q = question;
    setIsAnswerCrossOutShow(false);
    updateIsCoding(false);

    if (view != "reading") {
      setToggleQuestionPanel(false);
    }
    if (q) {
      setHeaderTooLong(false);
      q.visited = true;
      setShowQuestionHeader(q.questionHeader);

      if (!!q.questionHeader && !q.oriHeader) {
        q.oriHeader = q.questionHeader;

        let isComprehension = false;
        if (q.tags) {
          const found = q.tags.findIndex((t: any) => t && t.indexOf("@@") == 0);
          if (found > -1) {
            isComprehension = true;
          }
        }

        q.isComprehension = isComprehension;
      }
      setHeaderTooLong(q.questionHeader && q.questionHeader.length > 200);
      // Make sure we create question in attempt for all navigated questions
      const qstIndex = baseQuestionIdx;
      ensureQuestionRow(q, qstIndex);

      if (q.category == "descriptive") {
        setFullScreen(false);

        if (!q.answerText) {
          q.answerText = "";
        }
      } else if (q.category === "code") {
        // Handled in coding component
        updateIsCoding(true);
      } else {
        setFullScreen(false);
      }

      cacheAttemptQuestionPosition(practice.attemptId, {
        questionIndex: questionIndex,
        sectionNo: sectionNo,
        sectionID: currentSection,
        lastLength: lastLength,
      });
      cacheUserAnswers(practice.attemptId, answersOfUser);
      setUserAnswers(answersOfUser.QA[baseQuestionIdx]);

      // Check fraud on next question
      // if (!isCareerBot) {
      //     fraudCheck()
      // }
    } else {
      setFullScreen(false);
    }
  };

  const submitCurrentQuestion = async () => {
    if (!practice.attemptId) {
      return;
    }

    let answerData = {
      question: answersOfUser.QA[baseQuestionIdx],
      practiceId: practice._id,
    };

    if (!answerData.question) {
      return;
    }

    const answeredQuestionData = answeredQuestion;
    if (answeredQuestion.length < currPage - 1) {
      answeredQuestionData.push(
        practice.questions[currPage - 1].category === "mcq"
          ? question
          : descriptiveAnswer
      );
    } else {
      answeredQuestion[currPage - 1] =
        practice.questions[currPage - 1].category === "mcq"
          ? question
          : descriptiveAnswer;
    }

    setAnsweredQuestion(answeredQuestionData);

    answerData.question.category = question.category;
    delete answerData.question.oldAnswers;

    if (question.category === "mcq") {
      answerData.question.crossedoutAnswers = question.answers
        .filter((a) => a.crossedOut)
        .map((a) => a._id);
    }
    try {
      const { data } = await clientApi.post(
        `/api/attempts/questionSubmit/${practice.attemptId}`,
        answerData
      );

      if (data.attemptId && data.attemptId !== practice.attemptId) {
        // update this practice attemptId
        changeCachedAttemptId(
          user?.info._id,
          practice._id,
          practice.attemptId,
          data.attemptId
        );
        let pract = { ...practice, attemptId: data.attemptId };
        setPractice(pract);
        cacheTestDataOfAttempt(pract.attemptId, pract);
      }
    } catch (error) {
      console.log("fail to submitAttemptPartially", error);
    }
  };

  const ensureFullScreen = () => {
    if (
      !clientData.features.fraudDetect ||
      (practice.testMode != "proctored" && !practice.fraudDetect)
      // || deviceService.os == 'iOS'
    ) {
      return true;
    }
    if (!isFullscreen(document)) {
      setDisableOffscreenCheck(true);
      alert("Warning", "Go full screen to continue", (closeEvent: any) => {
        fullScreen(true, document);
        setTimeout(() => {
          setDisableOffscreenCheck(false);
        }, 2000);
      });
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    onDescriptiveUpdate(descriptiveAnswer);
  }, [descriptiveAnswer]);

  const onDescriptiveUpdate = (data: any) => {
    questionAnswered(data.isAnswered, data);
  };
  const ensureCamCondition = async () => {
    try {
      // if (practice.camera) {
      //   // Check if camera is on and permitted.
      //   const devices = await navigator.mediaDevices.enumerateDevices()
      //   let camOn = false
      //   if (devices) {
      //     for (let i = 0; i < devices.length; i++) {
      //       // when cam is not permitted the label = '' otherwise it is = cam-name
      //       if (devices[i].kind == 'videoinput' && devices[i].label) {
      //         camOn = true
      //       }
      //     }
      //   }
      //   if (!camOn) {
      //     // Turn cam on if it is off
      //     alertify.alert("Message",'Warning', 'You need to enable camera to continue taking this test!.')
      //     practice.error = true;
      //     return false;
      //   } else {
      //     practice.error = false;
      //   }
      // }
      // return true;
    } catch (exc) {
      console.log(exc);
      return false;
    }
  };

  const nextQuestion = async (sectionChanged = false) => {
    if (!sectionChanged && !ensureFullScreen()) {
      return;
    }

    // if (
    //   !sectionChanged
    //   //&& !(await ensureCamCondition())
    // ) {
    //   return;
    // }
    addDescriptiveAnswer();

    if (currPage < totalQuestion) {
      setLastCheckpointTime(
        setElapseTime(
          practice,
          baseQuestionIdx,
          lastCheckpointTime,
          answersOfUser,
          updateAnswersOfUser
        )
      );
      // submit attempt before loading next question
      if (!sectionChanged) {
        submitCurrentQuestion();
      }

      setQuestionIndex(currPage);
      setCurrPage((prev: number) => prev + 1);
      setTimeout(() => {
        let quest = practice.enableSection
          ? currentSectionQuestions[currPage]
          : answeredQuestion.length < currPage + 1
          ? practice.questions[currPage]
          : answeredQuestion[currPage];
        setQuestion(quest);
        reArrangeAnswers(quest.answers);
        questionChanges(quest);
      }, 300);
    }
  };

  const loadFeedbackStatus = (pr) => {
    feedbackSvc
      .getQuestionFeedbacks({ idOnly: true, practiceSet: pr._id })
      .then((qs: any[]) => {
        pr.questions.forEach((q) => {
          if (qs.indexOf(q._id) > -1) {
            q.hasFeedback = true;
          }
        });
        setPractice(pr);
      });
  };

  const toQuestion = async (toquestionIndex: number) => {
    if (practice?.error) {
      return;
    }

    if (!ensureFullScreen()) {
      return;
    }
    // if (!(await ensureCamCondition())) {
    //   return;
    // }
    // Log the time and data or current question before go to another question
    addDescriptiveAnswer();

    ensureQuestionRow(question, baseQuestionIdx);
    setLastCheckpointTime(
      setElapseTime(
        practice,
        baseQuestionIdx,
        lastCheckpointTime,
        answersOfUser,
        updateAnswersOfUser
      )
    );
    // submit attempt before loading next question
    submitCurrentQuestion();
    setQuestionIndex(toquestionIndex - 1);
    setCurrPage(toquestionIndex);

    setUserAnswers(answersOfUser.QA[baseQuestionIdx]);

    setTimeout(() => {
      let quest = practice.enableSection
        ? currentSectionQuestions[toquestionIndex - 1]
        : practice.questions[toquestionIndex - 1];
      setQuestion(quest);
      reArrangeAnswers(question.answers);
      questionChanges(quest);

      if (
        !question.prefferedLanguage ||
        question.prefferedLanguage.length === 1
      ) {
        setLanguageIndex(0);
      }
    }, 300);
  };

  const addDescriptiveAnswer = (finalcheck?: any) => {
    let pract = practice;
    if (question.category == "descriptive") {
      let newAnswersOfUser: any = answersOfUser;
      let pIndex: any;
      for (let i = 0; i < practice.questions.length; i++) {
        if (practice.questions[i]._id == descriptiveAnswer._id) {
          pIndex = i;
        }
      }
      ensureQuestionRow(descriptiveAnswer, pIndex);
      if (descriptiveAnswer.answerText || descriptiveAnswer.attachments) {
        pract.questions[pIndex] = {
          ...pract.questions[pIndex],
          isAnswered: true,
        };
        if (!newAnswersOfUser.QA[pIndex].createdAt) {
          newAnswersOfUser.QA[pIndex] = {
            ...newAnswersOfUser.QA[pIndex],
            createdAt: adjustLocalTime(new Date()),
          };
        }
        newAnswersOfUser.QA[pIndex] = {
          ...newAnswersOfUser.QA[pIndex],
          isMissed: false,
        };
        if (newAnswersOfUser.QA[pIndex].answers.length > 0) {
          newAnswersOfUser.QA[pIndex].answers[0] = {
            ...newAnswersOfUser.QA[pIndex].answers[0],
            answerText: descriptiveAnswer.answerText,
            attachments: descriptiveAnswer.attachments,
          };
        } else {
          newAnswersOfUser.QA[pIndex].answers = {
            answerText: descriptiveAnswer.answerText,
            attachments: descriptiveAnswer.attachments,
          };
        }
      } else {
        pract.questions[pIndex] = {
          ...pract.questions[pIndex],
          isAnswered: false,
        };
        newAnswersOfUser.QA[pIndex] = {
          ...newAnswersOfUser.QA[pIndex],
          isMissed: true,
          answers: [],
        };
      }
      if (finalcheck) {
        newAnswersOfUser.QA.forEach((aQues: any, aQ: any) => {
          if (aQues && !aQues.isMissed && aQues.answers.length < 1) {
            for (let i = 0; i < pract.questions.length; i++) {
              if (pract.questions[i]._id == aQues.question) {
                aQues.answers.push({
                  answerText: pract.questions[i].answerText,
                  attachments: pract.questions[i].attachments,
                });
              }
            }
          }
        });
      }

      setPractice(pract);
      updateAnswersOfUser(newAnswersOfUser);
    }
  };

  const closeRtcPeer = (teacher: any, emitEvent: boolean) => {
    if (emitEvent) {
      // socketSvc.emit('video.call', { action: 'stop', peer: teacher })
    }
    let rtc = rtcPeers;
    if (rtcPeers[teacher]) {
      delete rtc[teacher];
      setRtcPeers(rtc);
    }
  };

  const currentCodeData = (q?: any) => {
    if (q) {
      return q.userCode[q.userCode.selectedLang.language];
    }
    return question.userCode[question.userCode?.selectedLang.language];
  };

  const submitCode = async (showToast?: any) => {
    // Do not submit code if there is already run code
    if (
      !!answersOfUser.QA[baseQuestionIdx]?.answers[0] &&
      !!answersOfUser.QA[baseQuestionIdx]?.answers[0].compileTime
    ) {
      return;
    }
    if (!!answersOfUser.QA[baseQuestionIdx]?.answers[0]) {
      if (!!answersOfUser.QA[baseQuestionIdx]?.answers[0]?.compileMessage) {
        return;
      }
    }
    question.answers[0].codeLanguage = question.userCode?.selectedLang.language;
    question.answers[0].code = currentCodeData().code;
    let newAnswersOfUser: any = answersOfUser;
    if (newAnswersOfUser.QA[baseQuestionIdx]) {
      const answer = {
        codeLanguage: question.answers[0].codeLanguage,
        code: question.answers[0].code,
        testcases: question.answers[0].testcases,
        userInput: currentCodeData().userInput,
        userArgs: currentCodeData().userArgs,
        output: currentCodeData().output,
        compileMessage: currentCodeData().compileMessage,
        status: currentCodeData().status,
        customInput: currentCodeData().customInput,
      };
      newAnswersOfUser.QA[baseQuestionIdx].answers[0] = answer;
    }
    updateAnswersOfUser(newAnswersOfUser);

    questionAnswered(true, question);

    if (showToast) {
      alert("Message", "Code are saved");
    }
  };
  const refreshPage = () => {
    setRefreshing(true);
    window.location.reload();
  };
  const retryAttemptSubmission = async (
    answerData: any,
    isAbandoned: any,
    terminated: any
  ) => {
    try {
      const { data } = await clientApi.get("/api/settings/getCurrentDateTime");
      let savedAttempt = getCacheAttemptSubmission(practice.attemptId);
      if (savedAttempt) {
        savedAttempt.try++;
        cacheAttemptSubmission(practice.attemptId, savedAttempt);
      } else {
        savedAttempt = answerData;
      }
      submitAttempt(savedAttempt, isAbandoned, terminated);
    } catch (error) {
      setTimeout(() => {
        retryAttemptSubmission(answerData, isAbandoned, terminated);
      }, 10 * 1000);
    }
  };

  const clearAnswer = () => {
    if (question) {
      if (question.category == "mcq") {
        question.answers.forEach((a: any) => {
          a.isChecked = false;
        });

        selectAnswer({ isAnswer: false });
      } else if (question.category == "fib") {
        // fibQuestion.clear();
      } else if (question.category == "descriptive") {
        question.answerText = "";
        questionAnswered(
          !!(question.attachments && question.attachments.length),
          question
        );
      } else if (question.category == "code") {
        codingRef?.current?.clear();
      } else if (question.category == "mixmatch") {
        // mixmatchQuestion.clear();
      }
    }
  };

  const submitAttempt = async (
    answerData: any,
    isAbandoned: any,
    terminated: any
  ) => {
    const submitToQueue = async (ans: any) => {
      const { data } = await clientApi.post("/api/attempts/submitToQueue", ans);
      return data;
    };

    const finish = async (ans: any) => {
      const { data } = await clientApi.post("/api/attempts/finish", ans);
      return data;
    };

    clientData.useAttemptQueue
      ? await submitToQueue(answerData)
      : await finish(answerData);

    try {
      setTimeout(() => {
        setSubmitMessage("Your test is submitted!");
        setTimeout(() => {
          setSubmitting(false);
        }, 3000);
      }, 100);

      updateAnswersOfUser({ ...answersOfUser, QA: [] });
      // if (appInit.totalMarkeds) {
      //   delete appInit.totalMarkeds
      // }

      // appInit.testStarted = false
      clearCachedAttempt(user?.info._id, practice._id, practice.attemptId);

      if (terminated) {
        const savedAttempt = getCacheUserAnswers(practice.attemptId);
        if (savedAttempt) {
          savedAttempt._id = practice.attemptId;
          cacheUserAnswers(practice.attemptId, savedAttempt);
        }
      }

      if (isAbandoned) {
        // eventBusService.emit('hideHeader', false)
        // eventBusService.emit('hideFooter', false)
        router.push(
          `/assessment/home/${practice.title}${toQueryString({
            replaceUrl: true,
            queryParams: { id: practice._id },
          })}`
        );
        return;
      }

      if (practice.isPartnerExam) {
        router.push("/assessment/result-submission");
        return;
      }

      if (!("showFeedback" in practice) || practice.showFeedback) {
        router.push(
          `/assessment/test-feedbacks/${practice.attemptId}/${
            practice._id
          }${toQueryString({ replaceUrl: true })}`
        );
      } else {
        // eventBusService.emit('hideHeader', false)
        // eventBusService.emit('hideFooter', false)

        let isFeedback = false;
        let questionPage = 0;

        answerData.answersOfUser.forEach((question: any, index: number) => {
          if (question.feedback && questionPage < 1) {
            isFeedback = true;
            questionPage = index + 1;
            return;
          }
        });

        if (isFeedback) {
          confirm(
            "You have marked one or more question for feedback. Do you want to give feedback now?",
            // () => {
            //   router.push(
            //     `/assessment/question-review/feedback/${
            //       practice.attemptId
            //     }/${questionPage}${toQueryString({ replaceUrl: true })}`,
            //   )
            // },
            () => {
              router.push(
                `/assessment/test-feedbacks/${practice.attemptId}/${
                  practice._id
                }${toQueryString({ replaceUrl: true })}`
              );
            }
          ).setHeader(" Message ");
        } else {
          // router.push(
          //   `/assessment/test-feedbacks/${practice.attemptId}/${
          //     practice._id
          //   }${toQueryString({ replaceUrl: true })}`
          // );
          router.push(
            `/attempt-summary/${practice.attemptId}${toQueryString({
              replaceUrl: true,
            })}`
          );
        }
      }
    } catch (error) {
      if (error.status == 401) {
        alert(
          "Message",
          "Please login again to submit the test.",
          (data: any) => {
            setRefreshing(true);
            updateTestStarted(false);

            localStorage.setItem(
              "requestedPath",
              `/student/assessments/${slugify(practice.title)}?id=${
                practice._id
              }`
            );

            router.push("/");
          }
        );
        setSubmitting(false);
        return;
      }
      if (error.error && error.error.msg) {
        alert("Message", error.msg);
        setSubmitting(false);
        return;
      }
      setSubmitMessage(
        "Your test is submitting. It may take few seconds/minutes depending on your Internet speed. Do not close the browser."
      );

      setTimeout(() => {
        retryAttemptSubmission(answerData, isAbandoned, terminated);
      }, 10 * 1000);
    }
  };

  const finish = async (
    isTimeout?: any,
    terminated?: any,
    isAbandoned?: any
  ) => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setSubmitMessage("Submitting test.");

    setDisableOffscreenCheck(true);

    // if (testAbandonedSub) {
    //   testAbandonedSub.unsubscribe()
    // }

    // stopLogTime()

    if (question.category === "code") {
      submitCode();
    }
    addDescriptiveAnswer(true);

    let answerData: any = getUserAnswers(
      practice,
      baseQuestionIdx,
      lastCheckpointTime,
      answersOfUser,
      updateAnswersOfUser,
      adjustLocalTime
    );

    answerData = { ...answerData, attemptId: practice.attemptId };
    if (isAbandoned) {
      answerData.isAbandoned = true;
    }

    if (answersOfUser._id) {
      answerData._id = answersOfUser._id;
    }

    answerData.createdAt = new Date();
    // answerData.createdAt = appInit.serverStartTime

    answerData.answersOfUser.map((e: any, ind: number) => {
      let ans = [];
      let tempanswer = answerData.answersOfUser[ind].answers;
      tempanswer = {
        ...tempanswer,
        answerId: tempanswer._id,
      };
      ans.push(tempanswer);
      answerData.answersOfUser[ind].answers = ans;
    });

    if (practice.testType === "psychometry") {
      try {
        await clientApi.post("/api/attempts/finishPsychoTest", answerData);
        clearCachedAttempt(user?.info?._id, practice._id, practice.attemptId);
        updateAnswersOfUser({ ...answersOfUser, QA: [] });
        updateTestStarted(false);
      } catch (error) {
        console.error(error);
      } finally {
      }
      return;
    }

    if (fraudDetected.length > 0) {
      answerData.fraudDetected = fraudDetected;
    }

    const savedOrder = getCacheQuestionOrder(practice.attemptId);

    if (savedOrder) {
      answerData.questionOrder = savedOrder.questions;
    }

    // remove subject/unit/topic from question to reduce payload
    answerData.answersOfUser.forEach((a: any) => {
      a && a["subject"] && delete a["subject"];
      a && a["unit"] && delete a["unit"];
      a && a["topic"] && delete a["topic"];
      a && a["oldAnswers"] && delete a["oldAnswers"];
    });

    answerData.try = 1;

    cacheAttemptSubmission(practice.attemptId, answerData);

    try {
      // Stop all video streaming before submit attempt
      for (const peer in rtcPeers) {
        closeRtcPeer(peer, true);
      }

      // socketPeers = {}

      // if (videoStreamingHandler) {
      //   clearInterval(videoStreamingHandler)
      //   videoStreamingHandler = null
      // }
    } catch (ex) {
      console.log("stopping video streaming error", ex);
    }

    submitAttempt(answerData, isAbandoned, terminated);
  };

  const finishTest = (isTimeout?: any) => {
    let msg = "Are you sure you want to end this practice test?";
    if (practice.showFeedback) {
      msg = msg + " You will not be able to review or change answers.";
      msg =
        msg +
        " You must provide feedback on the next screen before you see your test result.";
    } else {
      msg = msg + " You will not be able to review or change answers.";
    }

    confirm(msg, (success: any) => {
      setTimerStopManually(true);
      // counter.stop();
      finish(isTimeout);
    }).setHeader(" Message ");
  };

  const getCurrentSectionTime = () => {
    let sectionTime = 0;
    const questionToCheck = practice.enableSection
      ? currentSectionQuestions[questionIndex]
      : practice.questions[questionIndex];

    if (questionToCheck.section) {
      practice.sections.forEach((sec: any) => {
        if (sec.name === questionToCheck.section) {
          sectionTime = sec.time;
        }
      });
    } else {
      sectionTime = practice.sections[sectionNo].time;
    }

    return sectionTime;
  };

  const getAvgTime = () => {
    let avgTimeSecond = 0;
    if (practice.sectionTimeLimit) {
      const totalTimeSecond = getCurrentSectionTime() * 60;
      avgTimeSecond = currentSectionQuestions.length
        ? totalTimeSecond / currentSectionQuestions.length
        : 1;
    } else {
      const totalTimeSecond = practice.totalTime * 60;
      avgTimeSecond = totalTimeSecond / practice.totalQuestion;
    }

    return avgTimeSecond * 1000;
  };

  const questionAnswered = async (
    isAnswer?: boolean,
    quest?: any,
    qstIndex?: number
  ) => {
    let questionTemp: any = quest;
    let qstIdx: any = qstIndex;
    if (!questionTemp) {
      questionTemp = question;
    }
    if (!qstIdx) {
      qstIdx = practice.questions?.findIndex((q: any) => q._id == question._id);
    }
    ensureQuestionRow(questionTemp, qstIdx);
    if (answersOfUser.QA[qstIdx]) {
      const elapseTime = new Date().getTime() - lastCheckpointTime;
      let newAnswersOfUser = answersOfUser;
      newAnswersOfUser.QA[qstIdx] = {
        ...newAnswersOfUser.QA[qstIdx],
        timeEslapse: newAnswersOfUser.QA[qstIdx].timeEslapse + elapseTime,
      };
      updateAnswersOfUser(newAnswersOfUser);
      // reset start test time, so when user change the answer the elapse time is calculated correctly
      setLastCheckpointTime(new Date().getTime());
    }

    let toUpdateQuestion = questionTemp;

    const currentStatus = toUpdateQuestion.isAnswered;

    toUpdateQuestion.isAnswered = isAnswer;

    if (toUpdateQuestion.questionType === "single") {
      toUpdateQuestion.isAnswered = isAnswer;
    } else {
      let numberNotChecked = 0;
      for (const i in toUpdateQuestion.answers) {
        const asw = toUpdateQuestion.answers[i];
        if (asw.isChecked) {
          toUpdateQuestion.isAnswered = true;
          break;
        } else {
          numberNotChecked++;
        }
      }
      if (numberNotChecked === toUpdateQuestion.answers?.length) {
        toUpdateQuestion.isAnswered = false;
      }
    }
    let totalMissedQuest = totalMissedQuestion;
    let totalAttempt = totalAttempted;
    let totalAnswerAndMark = totalAnswerAndMarked;
    if (currentStatus === false && toUpdateQuestion.isAnswered) {
      totalMissedQuest -= 1;
      totalAttempt += 1;

      if (toUpdateQuestion.hasMarked) {
        totalAnswerAndMark++;
      }
    }
    if (currentStatus === true && !toUpdateQuestion.isAnswered) {
      totalMissedQuest += 1;
      totalAttempt -= 1;

      if (toUpdateQuestion.hasMarked) {
        totalAnswerAndMark--;
      }
    }
    setTotalMissedQuestion(totalMissedQuest);
    setTotalAttempted(totalAttempt);
    setTotalAnswerAndMarked(totalAnswerAndMark);
    cacheUserAnswers(practice.attemptId, answersOfUser);

    // Add this question to fraud check list
    if (toUpdateQuestion.isAnswered && toUpdateQuestion.category == "mcq") {
      let isCorrect = true;
      for (let i = 0; i < toUpdateQuestion.answers.length; i++) {
        if (
          (toUpdateQuestion.answers[i].isCorrectAnswer &&
            !toUpdateQuestion.answers[i].isChecked) ||
          (!toUpdateQuestion.answers[i].isCorrectAnswer &&
            toUpdateQuestion.answers[i].isChecked)
        ) {
          isCorrect = false;
          break;
        }
      }

      if (isCorrect) {
        // add to check list if not added
        const qIdx = fraudCheckingQuestions.findIndex(
          (e) => e.question === toUpdateQuestion._id
        );
        if (qIdx == -1) {
          try {
            fraudCheckingQuestions.push({
              question: toUpdateQuestion._id,
              timeElapse: answersOfUser.QA[qstIdx].timeEslapse,
              offscreenTime: answersOfUser.QA[qstIdx].offscreenTime,
              avgTime: getAvgTime(),
            });
          } catch (ex) {
            console.log(ex);
          }
        }
        setClearFraudListOnNext(false);
      } else {
        // not correct and in the list => remove it
        const qIdx = fraudCheckingQuestions.findIndex(
          (e) => e.question === toUpdateQuestion._id
        );
        if (qIdx > -1) {
          fraudCheckingQuestions.splice(qIdx, 1);
        }
        setClearFraudListOnNext(true);
      }

      // Save fraud checking
      cacheAttemptFraudCheck(practice.attemptId, {
        checkingQuestions: fraudCheckingQuestions,
        detected: fraudDetected,
        clear: clearFraudListOnNext,
      });
    }

    return toUpdateQuestion;
  };

  const selectAnswer = async (ev: any) => {
    let isAnswer = ev.isAnswer;
    setQuestion(ev.question);
    if (ev.answer) {
      isAnswer = ev.answer.isChecked;
    }

    const ans = answerArray;
    let sectionquestionlist = sectionQuestions;
    await sections.map((data: any) => {
      sectionquestionlist[data._id].map((sect: any, ind: number) => {
        if (currPage == sect.countNumber) {
          sectionquestionlist[data._id][ind] = {
            ...sect,
            isAnswered: ev?.isAnswer == false ? false : true,
          };
        }
      });
    });

    setSectionQuestions(sectionquestionlist);

    if (ans[baseQuestionIdx]) {
      ans[baseQuestionIdx] = ev;
    } else {
      ans.push(ev);
    }

    setAnswerArray(ans);

    createQARow(
      ev.question,
      baseQuestionIdx,
      answersOfUser,
      updateAnswersOfUser,
      adjustLocalTime
    );

    // Checking you changed answer
    const oldAnswers = answersOfUser.QA[baseQuestionIdx]?.oldAnswers;
    const newAnswers = ev.answer;
    const currentChanged = answersOfUser.QA[baseQuestionIdx]?.answerChanged;

    const dif = JSON.stringify(oldAnswers) === JSON.stringify(newAnswers);
    let newAnswersOfUser = answersOfUser;
    if (dif && dif.length > 0) {
      if (question.questionType === "single") {
        newAnswersOfUser.QA.forEach(
          (element: any, idx: number) =>
            (element.answerChanged =
              idx === baseQuestionIdx
                ? currentChanged + 1
                : element.answerChanged)
        );
      } else {
        if (oldAnswers.indexOf(dif[0]) > -1) {
          newAnswersOfUser.QA.forEach(
            (element: any, idx: number) =>
              (element.answerChanged =
                idx === baseQuestionIdx
                  ? currentChanged + 1
                  : element.answerChanged)
          );
        }
      }
    }

    newAnswersOfUser.QA.forEach((element: any, idx: number) => {
      if (idx == baseQuestionIdx) {
        if (element?.answers) {
          element.answers =
            idx === baseQuestionIdx ? newAnswers : element?.oldAnswers;
        } else {
          element = {
            ...element,
            answers: idx === baseQuestionIdx ? newAnswers : element?.oldAnswers,
            answerChanged: true,
          };
        }
      }
    });
    updateAnswersOfUser(newAnswersOfUser);
    // after checking and counter answerChanged number
    questionAnswered(isAnswer);
  };

  const setFull = async () => {
    if (!isFullscreen(document)) {
      setDisableOffscreenCheck(true);
      // alert(
      //   "Message",
      //   "Warning",
      //   "Go full screen to continue",
      //   (closeEvent: any) => {
      //     fullScreen(true, document);
      //     setTimeout(() => {
      //       setDisableOffscreenCheck(false);
      //     }, 2000);
      //   }
      // );
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    setView(practice.viewTemplate);
  }, [practice]);

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    const getPractice = async () => {
      if (window.screen.width >= 992) {
        setlgBreak(true);
      }
      try {
        let { data } = await clientApi.get(
          `/api/tests/findOneWithQuestions/${id}${toQueryString({
            hasAccessMode: true,
            hasMeta: true,
          })}`
        );
        data.questions.forEach((question: any) =>
          question.answers.forEach((answer: any) => {
            const meta = CryptoJS.AES.decrypt(answer.meta, answer._id);
            const decryptedData = JSON.parse(meta.toString(CryptoJS.enc.Utf8));
            answer.isCorrectAnswer = decryptedData.isCorrect;
          })
        );
        const { data: serverTime } = await clientApi.get(
          "/api/settings/getCurrentDateTime"
        );
        setPractice({ ...data, serverTime });
        loadFeedbackStatus({ ...data, serverTime });
      } catch (ex: any) {
        console.error(ex);
        if (ex.error && ex.error.message) {
          if (ex.error.params == "start-date") {
            if (ex.error.startDate) {
              const startDate = moment(ex.error.startDate);
              alert(
                "Message",
                "You cannot take this test before " +
                  startDate.format("MMMM DD YYYY, h:mm:ss a")
              );
            } else {
              alert("Message", ex.error.message);
            }
          } else {
            alert("Message", ex.error.message);
          }
        } else {
          alert(
            "Message",
            "The practice test is no longer available. It may have been withdrawn or expired."
          );
        }
      }
    };

    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      updateClientData(data);
      setClientData(data);
    };
    getPractice();
    getClientData();
  }, []);

  useEffect(() => {
    const setQuest = (array: any) => {
      const arr = array;
      for (let i = 0; i < array.length; i++) {
        const txt = array[i].questionText;
        const re = /\{(.*)\}/i;
        const inside = txt.match(re)[1];
        let txtArr = txt.split("{" + inside + "}");
        arr[i].questionTextArray = txtArr;

        for (let j = 0; j < array[i].answers.length; j++) {
          const ansTxt = array[i].answers[j].answerText;
          txtArr = ansTxt.split("{" + inside + "}");
          arr[i].answers[j].answerTextArray = txtArr;
        }
      }
      return arr;
    };

    const setupSectionQuestions = async () => {
      if (sortSection >= 3) {
        setSortSection((prev: number) => prev + 1);
        return;
      }
      setSortSection((prev: number) => prev + 1);
      let sectionQuestionList: any = [];
      let sectionList: any = [];

      await practice.questions.map((data: any, i: any) => {
        if (practice.enableSection) {
          const section = practice.sections.find(
            (s: any) => s.name == practice.questions[i].section
          );
          if (!sectionQuestionList[section._id]) {
            sectionQuestionList[section._id] = [];
            sectionList.push(section);
          }
          if (
            sectionQuestionList[section._id].answerNumber !=
            practice.questions[i].answerNumber
          ) {
            sectionQuestionList[section._id].push(practice.questions[i]);
          }
        } else {
          const subjectQ = practice.questions[i].subject;

          if (!sectionQuestionList[subjectQ._id]) {
            sectionQuestionList[subjectQ._id] = [];
            sectionList.push(subjectQ);
          } else if (!sectionList.find(({ _id }) => _id === subjectQ._id)) {
            sectionList.push(subjectQ);
          }
          if (
            sectionQuestionList[subjectQ._id].answerNumber !=
            practice.questions[i].answerNumber
          ) {
            sectionQuestionList[subjectQ._id].push(practice.questions[i]);
          }
        }
      });

      await sectionList.map((data: any) => {
        if (sectionQuestionList[data._id]) {
          sectionQuestionList[data._id].sort((q1: any, q2: any) => {
            if (q1.countNumber < q2.countNumber) {
              return -1;
            } else if (q1.countNumber > q2.countNumber) {
              return 1;
            } else return 0;
          });
        }
      });

      // console.log(sectionQuestionList, sectionList, sortSection, "sortSection>>>>>>")

      setSections(sectionList);
      setSectionQuestions(sectionQuestionList);
    };

    const shuffleArray = (array: any) => {
      let m = array.length,
        t,
        i;

      // While there remain elements to shuffle
      while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
      return array;
    };

    const sortQuestion = (practice: any) => {
      let pract = practice;
      if (pract.randomQuestions) {
        if (pract.enableSection) {
          let sectionQuestionList = sectionQuestions;

          for (const currentSec in sectionQuestionList) {
            let sectionQuestion = sectionQuestionList[currentSec];
            let tempQuestionSets: any = {};
            let tempS = [];

            for (let i = 0; i < sectionQuestion.length; i++) {
              const q = sectionQuestion[i];
              let isClubbed = false;
              let tag = "";
              if (q.tags) {
                if (q.tags.length > 0) {
                  q.tags.forEach((t: any) => {
                    if (t && t.startsWith("@@")) {
                      isClubbed = true;
                      tag = t.toLowerCase();
                    }
                  });
                }
              }

              if (isClubbed) {
                if (tempQuestionSets[tag]) {
                  if (tempQuestionSets[tag].indexOf(q) === -1) {
                    tempQuestionSets[tag].push(q);
                  }
                } else {
                  tempQuestionSets[tag] = [];
                  tempS.push(tag);
                  tempQuestionSets[tag].push(q);
                }
              } else {
                if (tempQuestionSets["defaultSet"]) {
                  if (tempQuestionSets.defaultSet.indexOf(q) === -1) {
                    tempQuestionSets.defaultSet.push(q);
                  }
                } else {
                  tempQuestionSets["defaultSet"] = [];
                  tempQuestionSets.defaultSet.push(q);
                }
              }
            }

            let suffled = [];
            sectionQuestionList[currentSec] = [];

            if (tempS.length > 0) {
              if (tempQuestionSets.defaultSet) {
                tempS = tempS.concat(tempQuestionSets.defaultSet);
              }
              tempS = shuffleArray(tempS);

              tempS.forEach((qs: any) => {
                if (typeof qs === "object") {
                  sectionQuestionList[currentSec].push(qs);
                } else {
                  if (qs.startsWith("@@")) {
                    suffled = shuffleArray(tempQuestionSets[qs]);
                    sectionQuestionList[currentSec] =
                      sectionQuestionList[currentSec].concat(suffled);
                  } else {
                    sectionQuestionList[currentSec].push(qs);
                  }
                }
              });
            } else {
              for (const set in tempQuestionSets) {
                suffled = shuffleArray(tempQuestionSets[set]);
                sectionQuestionList[currentSec] =
                  sectionQuestionList[currentSec].concat(suffled);
              }
            }
          }
          setSectionQuestions(sectionQuestionList);
          //Arrange Question
          pract.questions = [];

          for (const sec in sectionQuestionList) {
            pract.questions = pract.questions.concat(sectionQuestionList[sec]);
          }
        } else {
          const tempQuestionSets: any = {};
          let tempS = [];

          for (let i = 0; i < pract.questions.length; i++) {
            const q = pract.questions[i];
            let isClubbed = false;
            let tag = "";
            if (q.tags) {
              if (q.tags.length > 0) {
                q.tags.forEach((t: any, tagIndex: number) => {
                  if (t && t.startsWith("@@")) {
                    isClubbed = true;
                    tag = t.toLowerCase();
                  }
                });
              }
            }

            if (isClubbed) {
              if (tempQuestionSets[tag]) {
                if (tempQuestionSets[tag].indexOf(q) === -1) {
                  tempQuestionSets[tag].push(q);
                }
              } else {
                tempQuestionSets[tag] = [];
                tempS.push(tag);
                tempQuestionSets[tag].push(q);
              }
            } else {
              if (tempQuestionSets["defaultSet"]) {
                if (tempQuestionSets.defaultSet.indexOf(q) === -1) {
                  tempQuestionSets.defaultSet.push(q);
                }
              } else {
                tempQuestionSets["defaultSet"] = [];
                tempQuestionSets.defaultSet.push(q);
              }
            }
          }

          let suffled = [];
          pract.questions = [];

          if (tempS.length > 0) {
            if (tempQuestionSets.defaultSet) {
              tempS = tempS.concat(tempQuestionSets.defaultSet);
            }
            tempS = shuffleArray(tempS);

            tempS.forEach((qs: any) => {
              if (typeof qs === "object") {
                pract.questions.push(qs);
              } else {
                if (qs.startsWith("@@")) {
                  suffled = shuffleArray(tempQuestionSets[qs]);
                  pract.questions = pract.questions.concat(suffled);
                } else {
                  pract.questions.push(qs);
                }
              }
            });
          } else {
            for (const set in tempQuestionSets) {
              suffled = [];
              suffled = shuffleArray(tempQuestionSets[set]);
              pract.questions = pract.questions.concat(suffled);
            }
          }
        }
      }

      if (pract.randomizeAnswerOptions) {
        pract.questions.forEach((value: any, key: number) => {
          if (value.category != "fib") {
            shuffleArray(practice.questions[key].answers);
          }
        });
      }
      return pract;
    };

    const saveQuestionOrder = () => {
      let qList = practice.questions.map((q: any) => ({
        q: q._id,
        countNumber: q.countNumber,
        answers: q.answers.map((a: any) => a._id),
      }));
      let secList: any = {};
      for (const sec in sectionQuestions) {
        secList[sec] = sectionQuestions[sec].map((q: any) => {
          return {
            q: q._id,
          };
        });
      }
      cacheQuestionOrder(practice.attemptId, {
        sections: secList,
        questions: qList,
      });
    };

    const setQuestionNumber = (practice: any) => {
      let pract = practice;
      let sectionQuestion = sectionQuestions;
      if (pract.enableSection) {
        for (const sec in sectionQuestion) {
          sectionQuestion[sec].forEach((q: any, idx: number) => {
            q.countNumber = idx + 1;
          });
        }
      } else {
        for (let i = 0; i < pract.questions.length; i++) {
          pract.questions[i].countNumber = i + 1;
        }

        // sort question in sections base on countNumber
        for (const sec in sectionQuestion) {
          sectionQuestion[sec].sort((q1: any, q2: any) => {
            if (q1.countNumber < q2.countNumber) {
              return -1;
            }
            if (q1.countNumber > q2.countNumber) {
              return 1;
            }
            return 0;
          });
        }
      }
      return pract;
    };

    const restoreAttempt = async () => {
      // Restore question order
      const savedOrder = getCacheQuestionOrder(practice.attemptId);
      let sectionQuestion = sectionQuestions;
      if (savedOrder) {
        let newOrder: any = [];
        savedOrder.questions.forEach((qOrder: any) => {
          // Find question data in order
          let reorderQuestion = practice.questions.find(
            (q: any) => q._id == qOrder.q
          );
          reorderQuestion.countNumber = qOrder.countNumber;
          newOrder.push(reorderQuestion);

          // Answer order
          let newAnsOrder: any = [];
          qOrder.answers.forEach((aId: any) => {
            const aIdx = reorderQuestion.answers.findIndex(
              (answer: any) => answer._id === aId
            );
            newAnsOrder.push(reorderQuestion.answers[aIdx]);
          });
          reorderQuestion.answers = newAnsOrder;
        });
        setPractice((prev: any) => ({ ...prev, question: newOrder }));
        // reorder questions in section
        for (const sec in savedOrder.sections) {
          let newOrder: any = [];
          savedOrder.sections[sec].forEach((qOrder: any) => {
            // Find question data in order
            const reorderQuestion = sectionQuestion[sec].find(
              (sq: any) => sq._id == qOrder.q
            );
            newOrder.push(reorderQuestion);
          });

          sectionQuestion[sec] = newOrder;
        }
      }

      // Restore user answer
      answersOfUser.QA.forEach((a: any, idx: number) => {
        if (a) {
          setQuestionIndex(idx);
          idx = practice.questions.findIndex(
            (prac: any) => prac._id === a.question
          );
          if (idx > -1) {
            let quest = practice.questions[idx];
            quest.visited = true;
            quest.hasMarked = a.hasMarked;
            if (a.answers && a.answers.length) {
              if (quest.category === "descriptive") {
                if (a.answers && a.answers[0]) {
                  quest.answerText = a.answers[0].answerText;
                  quest.attachments = a.answers[0].attachments;
                }
              } else if (quest.category === "code") {
                if (!quest.answers[0]) {
                  quest.answers.push({});
                }
                quest.answers[0].codeLanguage = a.answers[0].codeLanguage;
                quest.answers[0].code = a.answers[0].code;
                quest.answers[0].testcases = a.answers[0].testcases;
                quest.answers[0].isChecked = !!a.answers[0].compileMessage;

                if (!quest.userCode) {
                  const codingLanguages = codeLanguages;
                  const langIdx = codingLanguages.findIndex(
                    (lang) => lang.language === a.answers[0].codeLanguage
                  );
                  quest = {
                    ...quest,
                    userCode: {
                      selectedLang: codingLanguages[langIdx],
                    },
                  };
                  quest.userCode[a.answers[0].codeLanguage] = {
                    customInput: a.answers[0].customInput,
                    code: a.answers[0].code,
                    userInput: a.answers[0].userInput,
                    output: a.answers[0].output,
                    compileMessage: a.answers[0].compileMessage,
                    status: a.answers[0].status,
                  };
                }
              } else if (quest.category === "mixmatch") {
                a.answers.forEach((element: any, i: number) => {
                  quest.answers[i].userText = element.userText;
                  quest.answers[i].answerText = element.answerText;
                  quest.answers[i].isChecked = element.isChecked;
                });
              } else {
                a.answers.forEach((ua: any) => {
                  const aidx = quest.answers.findIndex(
                    (answer: any) => answer._id === ua.answerId
                  );
                  if (aidx > -1) {
                    quest.answers[aidx].isChecked = true;
                    quest.answers[aidx].answeredText = ua.answerText;
                  }
                });
              }
            }
          }
        }
      });

      const questionPos: any = getCacheAttemptQuestionPosition(
        practice.attemptId
      );

      // Handle section index and question index

      let questionId = questionPos.questionIndex;
      let sectionNum = questionPos.sectionNo;

      // Recalculate start time, time end ...etc in case this is a hard refresh
      const savedTime: any = getCachedAttemptTime(practice.attemptId);

      let sectionTimeEl = savedTime.sectionTimeElapse;
      setSectionTimeElapse(sectionTimeEl);
      setCurrentTimeElapse(
        practice.sectionTimeLimit
          ? sectionTimeEl[sectionNum]
          : savedTime.elapseSeconds
      );
      let lastLen = questionPos.lastLength;

      let testTimeCount = savedTime.testTimeCountDown;

      // appInit.serverStartTime = new Date(savedTime.serverStartTime)
      // appInit.localStartTime = new Date(savedTime.localStartTime)
      // Recalculate lastCheckpointTime
      if (savedTime.lastCheckpointTime) {
        setLastCheckpointTime(savedTime.lastCheckpointTime);
      }

      if (practice.enableSection) {
        const timepassed =
          (new Date().getTime() - new Date(savedTime.savePoint).getTime()) /
          1000;
        let countdown = testTimeCount;

        // bypass section if they are also timeout
        while (
          practice.sections[sectionNum + 1] &&
          countdown - timepassed < 0
        ) {
          sectionNum++;
          countdown += practice.sections[sectionNum].time * 60;

          questionId = 0;
          lastLen +=
            sectionQuestion[Object.keys(sectionQuestion)[sectionNum]].length;
        }
        testTimeCount = countdown - timepassed;
      } else {
        // recalculate test time count down
        testTimeCount -=
          (new Date().getTime() - new Date(savedTime.savePoint).getTime()) /
          1000;
      }
      setQuestionIndex(questionId);
      setSectionNo(sectionNum);
      setTestTimeCountDown(testTimeCount);
      setLastLength(lastLen);
      await sections.map((data: any) => {
        sectionQuestion[data._id].sort((q1: any, q2: any) => {
          if (q1.countNumber < q2.countNumber) {
            return -1;
          }
          if (q1.countNumber > q2.countNumber) {
            return 1;
          }
          return 0;
        });
        const tsection = sectionQuestion[data._id];
      });

      setSectionQuestions(sectionQuestion);
      setCurrPage(questionId + 1);
    };

    const setMissedAndReviewQst = () => {
      let totalMissedQuestion = 0;
      let totalMarked = 0;
      let totalAttempted = 0;
      let totalAnswerAndMarked = 0;

      if (practice.enableSection) {
        for (const i in currentSectionQuestions) {
          const checkingQuestion = currentSectionQuestions[i];
          const answers = checkingQuestion.answers;
          let isCheckedAnswer = false;

          if (checkingQuestion.category === "descriptive") {
            isCheckedAnswer =
              !!checkingQuestion.answerText ||
              (checkingQuestion.attachments && checkingQuestion.attachments[0]);
          } else if (checkingQuestion.category === "code") {
            if (
              checkingQuestion.userCode &&
              checkingQuestion.userCode?.selectedLang
            ) {
              const lang = checkingQuestion.userCode?.selectedLang.language;

              isCheckedAnswer =
                checkingQuestion.userCode[lang] &&
                checkingQuestion.userCode[lang].compileMessage;
            }
          } else {
            for (const j in answers) {
              if (answers[j].isChecked) {
                isCheckedAnswer = true;
                break;
              }
            }
          }

          if (checkingQuestion.hasMarked) {
            totalMarked += 1;
            if (isCheckedAnswer) {
              totalAnswerAndMarked += 1;
            }
          }
          if (!isCheckedAnswer) {
            totalMissedQuestion += 1;
            checkingQuestion.isAnswered = false;
          } else {
            totalAttempted += 1;
            checkingQuestion.isAnswered = true;
          }
        }
      } else {
        for (let i = 0; i < practice.questions.length; i++) {
          const checkingQuestion = practice.questions[i];
          const answers = checkingQuestion.answers;
          let isCheckedAnswer = false;

          if (checkingQuestion.category === "descriptive") {
            isCheckedAnswer =
              !!checkingQuestion.answerText ||
              (checkingQuestion.attachments && checkingQuestion.attachments[0]);
          } else if (checkingQuestion.category === "code") {
            if (
              checkingQuestion.userCode &&
              checkingQuestion.userCode?.selectedLang
            ) {
              const lang = checkingQuestion.userCode?.selectedLang.language;

              isCheckedAnswer =
                checkingQuestion.userCode[lang] &&
                checkingQuestion.userCode[lang].compileMessage;
            }
          } else {
            for (let j = 0; j < answers.length; j++) {
              if (answers[j].isChecked) {
                isCheckedAnswer = true;
                break;
              }
            }
          }

          if (checkingQuestion.hasMarked) {
            totalMarked += 1;
            if (isCheckedAnswer) {
              totalAnswerAndMarked += 1;
            }
          }
          if (!isCheckedAnswer) {
            totalMissedQuestion += 1;
            checkingQuestion.isAnswered = false;
          } else {
            totalAttempted += 1;
            checkingQuestion.isAnswered = true;
          }
        }
      }

      setTotalMissedQuestion(totalMissedQuestion);
      setTotalMarked(totalMarked);
      setTotalAttempted(totalAttempted);
      setTotalAnswerAndMarked(totalAnswerAndMarked);
    };

    const setupCameraCapture = () => {
      let cameraT = cameraTime;
      if (
        clientData?.features?.fraudDetect &&
        practice.camera &&
        practice.testMode == "proctored"
      ) {
        if (practice.cameraTime) {
          for (let i = practice.cameraTime.length - 1; i >= 0; i--) {
            cameraT.push(practice.cameraTime[i]);
          }
        }

        const saveCamTime = getCacheTestCameraTime(
          user?.info._id,
          practice._id
        );
        if (saveCamTime) {
          cameraT = saveCamTime.split(",").map((t) => Number(t));
        } else {
          cacheTestCameraTime(user?.info._id, practice._id, cameraT.join(","));
        }
      }
      setCameraTime(cameraT);
    };

    const startTimer = (isResetTestTime: any) => {
      let testTimeCount = testTimeCountDown;
      if (isResetTestTime) {
        const totalTime = practice.enableSection
          ? getCurrentSectionTime()
          : practice.totalTime;
        testTimeCount = totalTime * 60;
        setTestTimeCountDown(testTimeCount);
      }
      setTimerStarted(true);
      setPageLoaded(true);
      // if (!isFullscreen(document)) {
      //   setDisableOffscreenCheck(true);
      //   // alert("Message","Message", "Go full screen to continue", (closeEvent: any) => {
      //   fullScreen(true, document);
      //   setTimeout(() => {
      //     setDisableOffscreenCheck(false);
      //   }, 2000);
      //   // });
      // }
    };

    // const logTimeHandler = () => {
    //   let logCount = logTimeCount + 1
    //   // let testTimeCount = testTimeCountDown - 1
    //   setLogTimeCount(logCount)
    //   // setTestTimeCountDown(testTimeCount)
    //   const elapseSeconds = currentTimeElapse + logCount;
    //   if (practice.sectionTimeLimit) {
    //     sectionTimeElapse[sectionNo] = elapseSeconds
    //   }

    //   cacheAttemptTime(practice.attemptId, {
    //     questionIndex: questionIndex,
    //     sectionNo: sectionNo,
    //     lastLength: lastLength,
    //     elapseSeconds: elapseSeconds,
    //     sectionTimeElapse: sectionTimeElapse,
    //     testTimeCountDown: testTimeCountDown,
    //     lastCheckpointTime: lastCheckpointTime,
    //     serverStartTime: serverStartTime,
    //     localStartTime: localStartTime,
    //     savePoint: Date.now()
    //   })

    //   if (clientData?.features.fraudDetect && practice.camera && practice.testMode == 'proctored' && cameraTime.length) {
    //     // if it is time to capture the image or user has answered questions too fast
    //     let timeToCompare = testTimeCountDown;
    //     if (practice.enableSection) {
    //       for (let idx = 0; idx < practice.sections.length; idx++) {
    //         if (idx <= sectionNo) {
    //           continue;
    //         }
    //         timeToCompare += practice.sections[idx].time * 60
    //       }
    //     }
    //     if (timeToCompare < cameraTime[0]) {
    //       // attemptHelper.camCaptured()
    //       // console.log('logTimeHandler ' + ++startCaptureCount)
    //       // startCamCature();
    //       // cameraTime.splice(0, 1)

    //       // attemptHelper.cacheTestCameraTime(user._id, practice._id, cameraTime.join(','))
    //     }
    //   }
    // }

    // const stopLogTime = () => {
    //   setLogTimeCount(0)
    //   if (logTime) {
    //     clearInterval(logTime)
    //     setLogTime(null)
    //   }
    // }

    // const startLogTime = () => {
    //   stopLogTime()
    //   let timer = setInterval(() => logTimeHandler(), 1000)
    //   setLogTime(timer)
    // }

    const setupVideoCall = async () => {
      if (practice.camera && practice.testMode == "proctored") {
        const { data } = await clientApi.get("/api/users/turnConfig");
        setTurnServers(data);

        // socketSvc.on(
        //   'video.call',
        //   (data) => videoCallHandler(data),
        //   'take-test',
        // )
      }
    };

    const terminateTest = () => {
      if (terminating) {
        return;
      }
      setTerminating(true);
      setTimerStopManually(true);
      // counter.stop()
      finish(false, true);
    };

    const offscreenCheck = () => {
      if (
        !clientData.features.fraudDetect ||
        (practice.testMode != "proctored" && !practice.fraudDetect)
      ) {
        return;
      }
      let wrnTitle = "Warning!";
      let warning =
        "Do not move away from window, else your test will be marked as suspicious!";
      let limit = practice.offscreenLimit;

      if (practice.attendance && practice.attendance.offscreenLimit) {
        limit = practice.attendance.offscreenLimit;
      }

      let totalOffscreen = 0;
      if (limit > 0) {
        answersOfUser.QA.forEach((qa: any) => {
          if (qa) {
            totalOffscreen += qa.offscreen ? qa.offscreen.length : 0;
          }
        });

        // Terminate the test if totalOffscreen > limit
        if (totalOffscreen > limit) {
          alert(
            "Message",
            "Despite several warnings, you continued to exit test mode. Your test has been terminated. Please contact Test Administrator if you think you were not at fault."
          );

          setTimeout(() => {
            terminateTest();
          }, 5000);

          return;
        }

        warning =
          "Do not exit test mode. Your test will be TERMINATED after " +
          (limit - totalOffscreen) +
          " warning(s)!";
        if (limit - totalOffscreen == 0) {
          wrnTitle = "Last warning!";
          warning = "Do not exit test mode. Your test will be TERMINATED!!!";
        }
      }
      alert("Message", warning);
    };

    const checkAfterUnload = () => {
      const hiddenCheck = getCacheOffscreenTime(practice.attemptId);
      if (hiddenCheck) {
        removeCacheOffscreenTime(practice.attemptId);
        let offscreenT = offscreenTime;
        offscreenT = new Date().getTime() - new Date(hiddenCheck).getTime();
        let newAnswersOfUser: any = answersOfUser;
        if (!newAnswersOfUser.QA[baseQuestionIdx].offscreen) {
          newAnswersOfUser.QA[baseQuestionIdx].offscreen = [];
        }

        newAnswersOfUser.QA[baseQuestionIdx].offscreen.push(offscreenT);
        cacheUserAnswers(practice.attemptId, newAnswersOfUser);
        updateAnswersOfUser(newAnswersOfUser);
        offscreenCheck();
        offscreenT = 0;
        setOffscreenTime(offscreenT);
      }
    };

    const fetchMainData = async () => {
      let pract = practice;
      if (clientData?.useQuestionViewTemplate)
        setView(practice.viewTemplate || "default");
      if (pract.sections) {
        let sectionSetting = sectionSettings;
        for (let s = 0; s < pract.sections.length; s++) {
          const sec = pract.sections[s];
          sectionSetting[sec.name] = {
            showCalculator: sec.showCalculator,
            direction: sec.direction,
          };
          sectionSetting[sec._id] = sec.showCalculator;
          if (sec.name) {
            sectionSetting[sec.name] = sec.showCalculator;
          }
        }
        setSectionSettings(sectionSetting);
      }

      // isCareerBot = pract.subjects[0].name == 'Career Selection'
      let dayRanger = ["English"];

      const txt = pract.questions[0].questionText;
      // Ensure we have second language here, Indian font may have '{'
      // let re = /\{(.*)\}/i
      const re = /\{\s{0,1}Hindi|Marathi|English\s{0,1}\}/i;

      let secondLenguage = txt.match(re);
      if (secondLenguage != null) {
        const newTxt = txt.split("{");
        for (let i = 1; i < newTxt.length; i++) {
          dayRanger.push(newTxt[i].split("}")[0]);
        }
      }

      if (dayRanger && dayRanger.length > 1) {
        pract.questions = setQuest(pract.questions);
      }

      await setupSectionQuestions();

      let attemptIsRestored = false;
      // initialize attempt data
      if (!pract.attemptId) {
        // Shuffle section if it is random
        if (
          pract.randomSection &&
          pract.enableSection &&
          pract.sections.length
        ) {
          pract.sections = shuffleArray(pract.sections);
          let secQues: any = [];
          for (let i = 0; i < pract.sections.length; i++) {
            let sectionQuestions = pract.questions.filter(
              (e: any) => e.section == pract.sections[i].name
            );
            if (pract.randomQuestions) {
              sectionQuestions = shuffleArray(sectionQuestions);
            }

            secQues = secQues.concat(sectionQuestions);
          }
          pract.questions = [...secQues];
        }

        pract = sortQuestion(pract);

        pract = setQuestionNumber(pract);

        let startParam: any = { testId: pract._id };

        try {
          const testRef = JSON.parse(
            localStorage.getItem(`${user?.info._id}_${pract._id}_reference`)!
          );
          startParam.referenceType = testRef.referenceType;
          startParam.referenceId = testRef.referenceId;
          if (testRef.courseContent) {
            startParam.referenceData = testRef.courseContent;
          }

          pract.ref = testRef;

          localStorage.removeItem(`${user?.info._id}_${pract._id}_reference`);
        } catch (ex) {
          // console.log('no test ref')
        }

        const { data } = await clientApi.post(
          "/api/attempts/start",
          startParam
        );
        pract = { ...pract, attemptId: data.attempt };

        cacheTestAttemptMap(user?.info._id, pract._id, pract.attemptId);

        // Save test data for this attempt
        cacheTestDataOfAttempt(pract.attemptId, pract);

        // Store question order for test refresh/resume
        saveQuestionOrder();
      } else {
        // Check if there is saved attempt after user reload page or resume test
        let savedFraud = getCacheAttemptFraudCheck(pract.attemptId);
        setSavedFraudData(savedFraud);
        if (savedFraud) {
          setFraudCheckingQuestions(savedFraud.checkingQuestions);
          setFraudDetected(savedFraud.detected);
          setClearFraudListOnNext(savedFraud.clear);
        }
        const savedAttempt = getCacheUserAnswers(pract.attemptId);
        // Restore user answer in case of refresh or user resume
        if (savedAttempt && previousUrl == "/") {
          updateAnswersOfUser(savedAttempt);
        }
        if (
          savedAttempt &&
          answersOfUser &&
          answersOfUser.QA &&
          answersOfUser.QA.length > 0
        ) {
          restoreAttempt();
          attemptIsRestored = true;
        } else {
          sortQuestion(pract);

          setQuestionNumber(pract);

          // Store question order for test refresh/resume
          saveQuestionOrder();

          // appInit.serverStartTime = pract.serverTime
          // appInit.localStartTime = new Date()
        }
      }

      // set question
      let quest;
      // userAnswers = user.answersOfUser.QA[baseQuestionIdx]
      if (pract.enableSection) {
        setFinishingSectionNo(sectionNo);
        const currentSectionQuestion =
          sectionQuestions[Object.keys(sectionQuestions)[sectionNo]];
        setCurrentSectionQuestions(currentSectionQuestion);
        setCurrentSection(Object.keys(sectionQuestions)[sectionNo]);
        setTotalQuestion(currentSectionQuestions?.length);
        quest = currentSectionQuestions[questionIndex];
      } else {
        setTotalQuestion(pract.questions.length);
        quest = pract.questions[questionIndex];
      }

      setQuestion(quest);

      setMissedAndReviewQst();

      setupCameraCapture();

      questionChanges(quest);

      startTimer(!attemptIsRestored);

      // startLogTime()

      // appInit.testStarted = true

      // testAbandonedSub = eventBusService
      //   .listen('test.abandoned')
      //   .subscribe((data) => {
      //     //user abandon the test
      //     if (data == 'asking') {
      //       disableOffscreenCheck = true
      //     } else {
      //       if (data == 'ok') {
      //         finish(false, false, true)

      //         commonHelper.fullscreen(false, document)
      //       } else {
      //         disableOffscreenCheck = false
      //       }
      //     }
      //   })

      setupVideoCall();

      checkAfterUnload();
      setPractice(pract);
    };
    if (!!Object.keys(practice).length && !!user) {
      fetchMainData();
    }
  }, [practice, user]);

  useEffect(() => {
    let timer: any;
    // const startTimer = () => {

    if (timerStarted && !pauseTimer && !!practice.attemptId) {
      timer = setInterval(() => {
        let sectionElapse = sectionTimeElapse;
        const elapseSeconds = currentTimeElapse + logTimeCount + 1;

        if (practice.sectionTimeLimit) {
          sectionElapse[sectionNo] = elapseSeconds;
          setSectionTimeElapse(sectionElapse);
        }

        setTestTimeCountDown((prev) => prev - 1);
        setLogTimeCount((prev: any) => prev + 1);
        cacheAttemptTime(practice.attemptId, {
          questionIndex: questionIndex,
          sectionNo: sectionNo,
          lastLength: lastLength,
          elapseSeconds: elapseSeconds,
          sectionTimeElapse: sectionElapse,
          testTimeCountDown: testTimeCountDown,
          lastCheckpointTime: lastCheckpointTime,
          serverStartTime: serverStartTime,
          localStartTime: localStartTime,
          savePoint: Date.now(),
        });
      }, 1000);
    }
    setFull();
    // ensureFullScreen()

    return () => clearInterval(timer);
  }, [timerStarted, logTimeCount, testTimeCountDown]);

  useEffect(() => {
    setIsReported((prevArray) => [
      ...prevArray,
      ...new Array(totalQuestion).fill(false),
    ]);
  }, [totalQuestion]);

  const codeSubmitTime = (qidx: any) => {
    let returnTime =
      answersOfUser.QA[qidx].timeEslapse +
      (new Date().getTime() - lastCheckpointTime);
    if (answersOfUser.QA[qidx].answers.length > 0) {
      answersOfUser.QA[qidx].answers.forEach((at: any) => {
        returnTime -= at.timeElapse;
      });
    }
    return returnTime;
  };

  const onCodeUpdate = (event: any) => {
    let answerOfUser = answersOfUser;
    if (answerOfUser.QA[baseQuestionIdx]) {
      const answer = event.answer;
      answer.timeElapse = codeSubmitTime(baseQuestionIdx);
      answerOfUser.QA[baseQuestionIdx].answers.unshift(answer);
    }
    updateAnswersOfUser(answerOfUser);
    questionAnswered(true, event.question, baseQuestionIdx);
  };

  const saveMixMatchAnswers = (event: any) => {
    createQARow(
      question,
      baseQuestionIdx,
      answersOfUser,
      updateAnswersOfUser,
      adjustLocalTime
    );
    questionAnswered(event.isAnswer, event.question);
  };

  const expandPanel = (panel: any) => {
    if (expandedPanel == "none") {
      setExpandedPanel(panel);
    } else if (expandedPanel == panel) {
      setExpandedPanel("none");
    } else {
      setExpandedPanel(panel);
    }
  };

  const closeDirection = () => {
    setTimeout(() => {
      setIsDirectionsOpen(false);
    });
  };

  const closeQuestionPanel = () => {
    setTimeout(() => {
      setIsQuestionPanelOpen(false);
    });
  };

  const showAttemptReview = () => {
    setReviewAttempt(true);
  };

  const hideAttemptReview = () => {
    setReviewAttempt(false);
  };

  const nextFromAttemptReview = () => {
    if (practice.enableSection) {
      addDescriptiveAnswer();
      setFinishingSectionNo(sectionNo);
      timerStopped();
    } else {
      setTimerStopManually(true);
      // counter.stop();
      finish();
    }
  };

  const timerStopped = async (isBreakTime = false) => {
    setIsBreakTime(false);
    if (timerStopManually) {
      return;
    }

    if (practice.enableSection) {
      setSectionNo(sectionNo + 1);

      if (practice.sections[sectionNo + 1]) {
        setReviewAttempt(false);
        if (isBreakTime) {
          // reset last checkpoint after section break
          setLastCheckpointTime(new Date().getTime());
        } else {
          if (question && question.category === "code") {
            submitCode();
          }
        }

        if (practice.sections[sectionNo + 1].isBreakTime) {
          // set the elapse time for current question

          setLastCheckpointTime(
            setElapseTime(practice, baseQuestionIdx, lastCheckpointTime)
          );

          setIsBreakTime(true);

          startBreakTimer(true);
          setAvgTimeSpent(0);
        } else {
          if (
            (practice.testType == "section-adaptive" &&
              !sectionQuestions[practice.sections[sectionNo]._id]) ||
            !sectionQuestions[practice.sections[sectionNo]._id].length
          ) {
            // get section data from api
            // this.spinner.show("appLoader");

            let newData = null;
            try {
              newData = await attemptService.getNextAdaptiveSection(
                practice.attemptId,
                {
                  subjectId: question.subject._id,
                  sectionName: practice.sections[sectionNo].name,
                  sectionId: practice.sections[sectionNo]._id,
                }
              );
            } catch (ex) {
              alertify.alert(
                "Message",
                "You appear to be offline. Check your internet connection and try again"
              );
              console.log(ex);

              // set section back
              setSectionNo(sectionNo - 1);

              return;
            }

            setSectionQuestions({
              ...sectionQuestions,
              [practice.sections[sectionNo]._id]: newData.questions,
            });
            setPractice({
              ...practice,
              questions: [...practice.questions, ...newData.questions],
              totalQuestion: newData.totalQuestion,
            });

            if (newData.orderedQuestions) {
              for (const q of [...practice.questions, ...newData.questions]) {
                const oq = newData.orderedQuestions.find(
                  (qq) => qq.question == q._id
                );
                if (oq) {
                  q.order = oq.order;
                }
              }

              practice.questions.sort((q1, q2) => {
                if (q1.order < q2.order) {
                  return -1;
                } else if (q1.order > q2.order) {
                  return 1;
                } else {
                  return 0;
                }
              });
            }

            newData.questions.forEach((q, idx) => {
              q.countNumber = idx + 1;
            });

            cacheTestDataOfAttempt(practice.attemptId, practice);
            saveQuestionOrder();
          }

          setLastLength(lastLength + currentSectionQuestions.length);
          setCurrentSectionQuestions(
            sectionQuestions[practice.sections[sectionNo]._id]
          );

          setTotalQuestion(
            sectionQuestions[practice.sections[sectionNo]._id].length
          );
          setCurrentTimeElapse(0);

          setMissedAndReviewQst();
          setCurrPage(0);
          await nextQuestion(true);

          startTimer(true);
          startLogTime();
          setAvgTimeSpent(
            (practice.sections[sectionNo].time * 60 * 1000) / totalQuestion
          );
        }
      } else {
        finish();
      }
    } else {
      alertify.success("Examination Time has expired");

      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });

      finish();
    }
  };

  const startLogTime = () => {
    stopLogTime();
    const tmp_logTime = setInterval(() => logTimeHandler(), 1000);
    setLogTime(tmp_logTime);
  };

  const stopLogTime = () => {
    setLogTimeCount(0);
    if (logTime) {
      clearInterval(logTime);
      setLogTime(null);
    }
  };

  const logTimeHandler = () => {
    setTimeElapse(timeElapse + 1 * 1000);
    setLogTimeCount(logTimeCount + 1);
    setTestTimeCountDown(testTimeCountDown - 1);
    const elapseSeconds = currentTimeElapse + logTimeCounter;
    if (practice.enableSection) {
      setSectionTimeElapse({
        ...sectionTimeElapse,
        [practice.sections[sectionNo]._id]: elapseSeconds,
      });
    }

    cacheAttemptTime(practice.attemptId, {
      questionIndex: questionIndex,
      sectionNo: sectionNo,
      lastLength: lastLength,
      elapseSeconds: elapseSeconds,
      sectionTimeElapse: sectionTimeElapse,
      testTimeCountDown: testTimeCountDown,
      lastCheckpointTime: lastCheckpointTime,
      serverStartTime: serverStartTime,
      localStartTime: localStartTime,
      savePoint: Date.now(),
    });

    if (
      clientData.features.fraudDetect &&
      practice.camera &&
      practice.isProctored &&
      cameraTime.length
    ) {
      // if it is time to capture the image or user has answered questions too fast
      let timeToCompare = testTimeCountDown;
      if (practice.enableSection) {
        for (let idx = 0; idx < practice.sections.length; idx++) {
          if (idx <= sectionNo) {
            continue;
          }
          timeToCompare += practice.sections[idx].time * 60;
        }
      }
      if (timeToCompare < cameraTime[0]) {
        startCamCature();
        const tmp = cameraTime;
        tmp.splice(0, 1);
        setCameraTime(tmp);

        cacheTestCameraTime(user._id, practice._id, cameraTime.join(","));
      }
    }
  };

  const startCamCature = () => {
    setCapturing(true);
    seCapturingTime(cameraTime[0]);

    // this.camSubject.next()
  };

  const reportIssue = () => {
    const state: any = {
      practiceId: practice._id,
      teacherId: practice.user,
      attemptId: question.attemptID,
      questionId: question._id,
      userId: user._id,
    };

    if (practice.ref) {
      if (practice.ref.referenceType == "course") {
        state.courseId = practice.ref.referenceId;
      } else if (practice.ref.referenceType == "testseries") {
        state.testseriesId = practice.ref.referenceId;
      }
    }
    setShowReportModal(true);
    // const mdref = this.modalSvc.show(QuestionFeedbackComponent, {
    //   ignoreBackdropClick: true,
    //   keyboard: false,
    //   initialState: state
    // })

    // mdref.content.onClose.subscribe(result => {
    //   if (result) {
    //     this.question.hasFeedback = true
    //   }
    // })
  };

  const getAnnotation = () => {
    if (selectingText) {
      setShowAnnotationPanel(true);
    }
  };

  const startTimer = (isResetTestTime) => {
    if (isResetTestTime) {
      const totalTime = practice.enableSection
        ? getCurrentSectionTime()
        : practice.totalTime;
      setTestTimeCountDown(totalTime * 60);
    }

    if (totalTime * 60 > 60 * 60) {
      setTimerConfig({
        ...timerConfig,
        format: "HH:mm:ss",
      });
    } else {
      setTimerConfig({
        ...timerConfig,
        format: "mm:ss",
      });
    }

    if (testTimeCountDown <= 0) {
      setTestTimeCountDown(1);
    }

    setTimerConfig({
      ...timerConfig,
      leftTime: 1,
    });
    setRefreshTimer(false);
    setTimeout(() => {
      setRefreshTimer(true);
    }, 300);
  };

  const setMissedAndReviewQst = () => {
    let totalMissedQuestion = 0;
    let totalMarked = 0;
    let totalAttempted = 0;
    let totalAnswerAndMarked = 0;

    if (practice.enableSection) {
      for (const i in currentSectionQuestions) {
        const checkingQuestion = currentSectionQuestions[i];
        const answers = checkingQuestion.answers;
        let isCheckedAnswer = false;

        if (checkingQuestion.category === "descriptive") {
          isCheckedAnswer =
            !!checkingQuestion.answerText ||
            (checkingQuestion.attachments && checkingQuestion.attachments[0]);
        } else if (checkingQuestion.category === "code") {
          if (
            checkingQuestion.userCode &&
            checkingQuestion.userCode.selectedLang
          ) {
            const lang = checkingQuestion.userCode.selectedLang.language;

            isCheckedAnswer =
              checkingQuestion.userCode[lang] &&
              checkingQuestion.userCode[lang].compileMessage;
          }
        } else {
          for (const j in answers) {
            if (answers[j].isChecked) {
              isCheckedAnswer = true;
              break;
            }
          }
        }

        if (checkingQuestion.hasMarked) {
          totalMarked += 1;
          if (isCheckedAnswer) {
            totalAnswerAndMarked += 1;
          }
        }
        if (!isCheckedAnswer) {
          totalMissedQuestion += 1;
          checkingQuestion.isAnswered = false;
        } else {
          totalAttempted += 1;
          checkingQuestion.isAnswered = true;
        }
      }
    } else {
      for (let i = 0; i < practice.questions.length; i++) {
        const checkingQuestion = practice.questions[i];
        const answers = checkingQuestion.answers;
        let isCheckedAnswer = false;

        if (checkingQuestion.category === "descriptive") {
          isCheckedAnswer =
            !!checkingQuestion.answerText ||
            (checkingQuestion.attachments && checkingQuestion.attachments[0]);
        } else if (checkingQuestion.category === "code") {
          if (
            checkingQuestion.userCode &&
            checkingQuestion.userCode.selectedLang
          ) {
            const lang = checkingQuestion.userCode.selectedLang.language;

            isCheckedAnswer =
              checkingQuestion.userCode[lang] &&
              checkingQuestion.userCode[lang].compileMessage;
          }
        } else {
          for (let j = 0; j < answers.length; j++) {
            if (answers[j].isChecked) {
              isCheckedAnswer = true;
              break;
            }
          }
        }

        if (checkingQuestion.hasMarked) {
          totalMarked += 1;
          if (isCheckedAnswer) {
            totalAnswerAndMarked += 1;
          }
        }
        if (!isCheckedAnswer) {
          totalMissedQuestion += 1;
          checkingQuestion.isAnswered = false;
        } else {
          totalAttempted += 1;
          checkingQuestion.isAnswered = true;
        }
      }
    }

    setTotalMissedQuestion(totalMissedQuestion);
    setTotalMarked(totalMarked);
    setTotalAttempted(totalAttempted);
    setTotalAnswerAndMarked(totalAnswerAndMarked);
  };

  const saveQuestionOrder = () => {
    const qList = practice.questions.map((q) => {
      return {
        q: q._id,
        countNumber: q.countNumber,
        answers: q.answers.map((a) => {
          return a._id;
        }),
      };
    });
    const secList = {};
    for (const sec in this.sectionQuestions) {
      secList[sec] = this.sectionQuestions[sec].map((q) => {
        return {
          q: q._id,
        };
      });
    }
    cacheQuestionOrder(practice.attemptId, {
      sections: secList,
      questions: qList,
    });
  };

  const renderer = (value: number) => {
    if (value === 0) {
      if (timerStarted) finishTest();
    } else {
      const hours = Math.floor(value / 60 / 60);
      const minutes = Math.floor((value / 60) % 60);
      const seconds = Math.floor(value % 60);
      return (
        <span>{`${hours ? (hours > 9 ? hours : "0" + hours + ":") : ""}${
          minutes > 9 ? minutes : "0" + minutes
        }:${seconds > 9 ? seconds : "0" + seconds}`}</span>
      );
    }
  };

  const getButtonClass = (secQuestion: any) => {
    if (secQuestion.hasMarked) {
      return "btn d-block number blue";
    } else if (!secQuestion.hasMarked && secQuestion.isAnswered) {
      return "btn d-block number green";
    } else if (!secQuestion.isAnswered && secQuestion.visited) {
      return "btn d-block number red";
    } else {
      return "btn d-block number";
    }
  };

  const showCalculatorButton = (type, clickHandler) =>
    practice.showCalculator === type &&
    (!practice.enableSection ||
      sectionSettings[question.section]?.showCalculator) && (
      <button
        className="btn btn-light"
        title="Calculator"
        onClick={clickHandler}
      >
        <i className="fas fa-calculator"></i>
      </button>
    );

  // const renderQuestion = (secQuestion) => (
  //   <div
  //     key={secQuestion._id}
  //     className={`p-2 border cursor-pointer d-flex position-relative ${
  //       !reviewAttempt && !sectionDirection && secQuestion._id === question._id
  //         ? "selected"
  //         : ""
  //     }`}
  //     onClick={() => {
  //       toQuestion(secQuestion.countNumber);
  //       popReview.hide();
  //     }}
  //   >
  //     <div className="isAnswered-on-question">
  //       {!secQuestion.isAnswered && <i className="fas fa-circle"></i>}
  //     </div>
  //     &nbsp;&nbsp;&nbsp;
  //     <span>Question {secQuestion.countNumber}</span>
  //     {secQuestion.hasMarked && (
  //       <div className="bookmark-on-question">
  //         <i className="fas fa-bookmark text-primary"></i>
  //       </div>
  //     )}
  //   </div>
  // );

  return (
    <LoadingOverlay
      active={!pageLoaded}
      spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
      styles={{
        overlay: (base) => ({
          ...base,
          height: "100vh",
        }),
      }}
    >
      {pageLoaded && (
        <>
          {view === "default" && (
            <>
              <header className="mcq text-white">
                <div className="container-fluid">
                  <div className="header-area mx-auto">
                    <nav className="navbar navbar-expand-lg navbar-light p-0 form-row d-flex">
                      <div className="col-6">
                        <div className="p-0 m-0">
                          <div className="d-flex align-items-lg-center">
                            <figure className="user_img_circled_wrap col-auto px-0">
                              <div
                                className="avatar"
                                style={{
                                  backgroundImage: user?.info.avatar.fileUrl
                                    ? "url(" +
                                      "https://www.practiz.xyz" +
                                      user.info.avatar?.fileUrl +
                                      ")"
                                    : 'url("/assets/images/defaultProfile.png")',
                                }}
                              ></div>
                            </figure>
                            <h4 className="ml-2 text-capitalize text-white f-16">
                              {user?.name}
                            </h4>
                          </div>
                        </div>
                        <div className="assesment-name mx-auto d-lg-none d-block">
                          <span>{practice.title}</span>
                        </div>
                        {!lgBreak && (
                          <div className="d-lg-none d-block">
                            {
                              // practice.camera &&
                              // <webcam className="mr-3" [height]="70" [width]="70" [imageQuality]="1"
                              //     id="test_cam" [videoOptions]="videoOptions" [trigger]="camTrigger" (imageCapture)="camCaptured($event)"
                              //     (initError)="handleInitError($event)" [allowCameraSwitch]="false"></webcam>
                            }
                          </div>
                        )}
                      </div>
                      <div className="assesment-name mx-auto d-lg-block d-none">
                        <span>{practice.title}</span>
                      </div>

                      <div className="col-auto ml-auto">
                        <div className="d-flex justify-content-end align-items-start gap-xs">
                          {lgBreak && (
                            <div className="d-lg-block d-none">
                              {
                                // practice.camera &&
                                // <webcam className="mr-3" [height]="70" [width]="70"
                                //     [imageQuality]="1" id="test_cam" [videoOptions]="videoOptions" [trigger]="camTrigger"
                                //     (imageCapture)="camCaptured($event)" (initError)="handleInitError($event)" [allowCameraSwitch]="false"></webcam>
                              }
                            </div>
                          )}
                          {!clockHidden && (
                            <div className="timer">
                              <h5 className="text-white text-center">
                                Time Remaining
                              </h5>

                              <div className="timer-clock text-center text-white">
                                {renderer(testTimeCountDown)}
                                {/* <countdown #timer [config]="timerConfig" (event)="onNotifyTimer($event)"></countdown> */}
                              </div>
                            </div>
                          )}
                          {clockHidden && (
                            <div
                              className="text-center mt-1"
                              style={{ height: "35px" }}
                            >
                              <i className="far fa-clock fa-2x"></i>
                            </div>
                          )}
                          <button
                            className="btn btn-outline btn-sm bg-whilte border-dark text-white rounded mt-1"
                            onClick={() => {
                              setClockHidden(!clockHidden);
                            }}
                            style={{ width: "65px" }}
                          >
                            {clockHidden ? "Show" : "Hide"}
                          </button>
                          {(practice?.sectionJump ||
                            !practice?.sectionTimeLimit) && (
                            <div className="finish-btn top-set position-relative">
                              <a
                                className={`text-white text-center ${
                                  practice.error ? "disabled" : ""
                                }`}
                                onClick={() => finishTest()}
                              >
                                Finish
                              </a>
                            </div>
                          )}
                          {!practice?.sectionJump &&
                            practice?.sectionTimeLimit && (
                              <div className="btn btn-success">
                                <a
                                  className={`text-white text-center ${
                                    practice.error ? "disabled" : ""
                                  }`}
                                  onClick={() => finishSection()}
                                >
                                  Finish Section
                                </a>
                              </div>
                            )}
                        </div>
                      </div>
                    </nav>
                  </div>
                </div>
              </header>
              <section className="question">
                <div className="question-area">
                  <div className="form-row">
                    <div
                      className={`${question.category == "code" ? "col" : ""} ${
                        question.category !== "code" ? "col-lg-8" : ""
                      }`}
                    >
                      <div className="board">
                        <div className="heading">
                          <div className="row align-items-center">
                            <div className="col-6">
                              <ul className="nav info">
                                <li className="pl-0">Question</li>
                                <li className="count text-white text-center clearfix">
                                  <span>{currPage}</span>
                                  <span> / </span>
                                  <span>{totalQuestion}</span>
                                </li>
                                <li
                                  className="d-none d-lg-block"
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title="Reload Question"
                                >
                                  <a
                                    onClick={refreshPage}
                                    className="cursor-pointer"
                                  >
                                    <figure>
                                      <img
                                        src="/assets/images/refress.png"
                                        alt=""
                                      />
                                    </figure>
                                  </a>
                                </li>
                                {question.category === "code" && (
                                  <li className="d-none d-lg-block">
                                    <a
                                      onClick={watchCodingInstruction}
                                      className="cursor-pointer"
                                    >
                                      Coding Instruction
                                    </a>
                                    {/* <video-player-modal hidden='true' link={codingInstruction}></video-player-modal> */}
                                  </li>
                                )}
                                {practice.enableSection &&
                                  user?.info.primaryInstitute?.preferences
                                    ?.assessment.overrunNotification &&
                                  (practice.sections[sectionNo].time *
                                    60 *
                                    1000) /
                                    totalQuestion >
                                    0 &&
                                  (userAnswers ? userAnswers.timeEslapse : 0) +
                                    (new Date().getTime() -
                                      lastCheckpointTime) >
                                    (practice.sections[sectionNo].time *
                                      60 *
                                      1000) /
                                      totalQuestion && (
                                    <div className="animate-float-left">
                                      <img
                                        src="/assets/images/turtle.png"
                                        style={{ width: "35px" }}
                                        title="Average Time Overrun"
                                      />
                                    </div>
                                  )}
                                {!practice.enableSection &&
                                  user?.info.primaryInstitute?.preferences
                                    ?.assessment.overrunNotification &&
                                  (practice.totalTime * 60 * 1000) /
                                    totalQuestion >
                                    0 &&
                                  (userAnswers ? userAnswers.timeEslapse : 0) +
                                    (new Date().getTime() -
                                      lastCheckpointTime) >
                                    (practice.totalTime * 60 * 1000) /
                                      totalQuestion && (
                                    <div className="animate-float-left">
                                      <img
                                        src="/assets/images/turtle.png"
                                        style={{ width: "35px" }}
                                        title="Average Time Overrun"
                                      />
                                    </div>
                                  )}
                              </ul>
                            </div>

                            <div className="col-6 ml-auto">
                              <div className="btn-group">
                                <ul className="nav">
                                  {question.category !== "code" && (
                                    <li className="edit">
                                      <a onClick={openSketch}>
                                        <figure>
                                          <img
                                            src="/assets/images/edit-icon-white.png"
                                            alt=""
                                          />
                                        </figure>
                                      </a>
                                    </li>
                                  )}
                                  {practice.showCalculator &&
                                    question.category !== "code" && (
                                      <li className="calc">
                                        <a onClick={calculatorModal}>
                                          <figure>
                                            <img
                                              src="/assets/images/calc-icon.png"
                                              alt=""
                                            />
                                          </figure>
                                        </a>
                                      </li>
                                    )}

                                  <li className="report bg-white">
                                    <a
                                      className="text-uppercase"
                                      type="button"
                                      onClick={() => {
                                        setShowReportModal(true),
                                          setFeedbackSubmiting(true);
                                      }}
                                    >
                                      <i
                                        className={`${
                                          isReported[currPage - 1]
                                            ? "fa-solid fa-flag"
                                            : "fa-regular fa-flag"
                                        }`}
                                        style={{ color: "#ff0000" }}
                                      ></i>
                                    </a>
                                  </li>
                                  {question.category == "code" && (
                                    <li
                                      className={`qest-panel-btn dropdown ${
                                        toggleQuestionPanel ? "open" : ""
                                      }`}
                                    >
                                      <a
                                        className="text-white text-center dropdown-toggle"
                                        type="button"
                                        onClick={() =>
                                          setToggleQuestionPanel(
                                            !toggleQuestionPanel
                                          )
                                        }
                                      >
                                        Question Panel
                                      </a>
                                      <div className="dropdown-menu dropdown-menu-right">
                                        <ul className="nav p-0 m-4">
                                          <li className="clearfix w-50 mx-0 mb-4">
                                            <div className="number red">
                                              <span className="text-center text-white p-0">
                                                {totalMissedQuestion}
                                              </span>
                                            </div>
                                            <span>Unattempted</span>
                                          </li>

                                          <li className="clearfix w-50 mx-0 mb-4">
                                            <div className="number blue">
                                              <span className="text-center text-white p-0">
                                                {totalMarked}
                                              </span>
                                            </div>
                                            <span>Marked for Review</span>
                                          </li>

                                          <li className="clearfix w-50 mx-0">
                                            <div className="number green">
                                              <span className="text-center text-white p-0">
                                                {totalAttempted}
                                              </span>
                                            </div>
                                            <span>Answered</span>
                                          </li>

                                          <li className="clearfix w-50 mx-0">
                                            <div className="number blue">
                                              <span className="circle text-center text-white p-0">
                                                {totalAnswerAndMarked}
                                              </span>
                                            </div>
                                            <span className="pt-0">
                                              Answered and Marked for review
                                            </span>
                                          </li>
                                        </ul>

                                        <div
                                          className="accordion"
                                          id="accordion"
                                        >
                                          {sections.length}
                                          {sections.map((section, index) => (
                                            <div
                                              className="item"
                                              hidden={
                                                practice.enableSection &&
                                                index !== sectionNo
                                              }
                                              key={index}
                                            >
                                              <div
                                                id={`heading${index}`}
                                                className="header"
                                              >
                                                <h2>
                                                  <button
                                                    className="bg-white border-0 text-left {{$index > 0 ? 'collapsed' : ''}}"
                                                    type="button"
                                                    data-toggle="collapse"
                                                    data-target={`#collapse + ${index}`}
                                                    aria-expanded="true"
                                                    aria-controls={`collapse${index}`}
                                                  >
                                                    {section.name}
                                                  </button>
                                                </h2>
                                              </div>

                                              <div
                                                id={`collapse${index}`}
                                                className={`collapse ${
                                                  index == 0 ? "show" : ""
                                                }`}
                                                aria-labelledby={`heading${index}`}
                                                data-parent="#accordion"
                                              >
                                                <div className="question-table">
                                                  {sectionQuestions[
                                                    section._id
                                                  ]?.map(
                                                    (
                                                      question: any,
                                                      idx: number
                                                    ) => (
                                                      <div
                                                        className="question-table-item p-2"
                                                        key={question._id}
                                                      >
                                                        <div
                                                          className={getButtonClass(
                                                            question
                                                          )}
                                                          onClick={() =>
                                                            toQuestion(
                                                              question.countNumber
                                                            )
                                                          }
                                                        >
                                                          <span
                                                            className={`text-center p-0 ${
                                                              question.hasMarked &&
                                                              question.isAnswered
                                                                ? "circle"
                                                                : ""
                                                            }`}
                                                          >
                                                            {
                                                              question.countNumber
                                                            }
                                                          </span>
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        {practice.enableMarks && !question.partialMark && (
                          <div className="title">
                            <div className="title-right ml-auto">
                              <ul className="nav">
                                <li className="text-white">Marking Scheme</li>

                                <li className="number">
                                  +
                                  {practice.isMarksLevel
                                    ? practice.plusMark
                                    : question.plusMark}
                                </li>

                                <li className="number">
                                  {practice.isMarksLevel
                                    ? practice.minusMark
                                    : question.minusMark}
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                        {question.questionHeader && (
                          <div className="title question-header-panel">
                            {!showAll ? (
                              <MathJax
                                value={formatQuestion(question?.questionHeader)}
                              />
                            ) : (
                              <h4 className="overflow-auto">
                                <MathJax
                                  value={formatQuestion(
                                    question.questionHeader
                                  )}
                                  className="take-test-question-header"
                                />
                              </h4>
                            )}
                            {headerTooLong && (
                              <div>
                                {!showAll ? (
                                  <a
                                    onClick={() => setShowAll(true)}
                                    className="underline"
                                  >
                                    See all
                                  </a>
                                ) : (
                                  <a
                                    onClick={() => setShowAll(false)}
                                    className="underline"
                                  >
                                    Hide
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {question?.category === "mcq" && (
                          <McqQuestion
                            clientData={clientData}
                            question={question}
                            answerText={answerArray[baseQuestionIdx]}
                            setQuestion={setQuestion}
                            answerChanged={selectAnswer}
                          />
                        )}
                        {question?.category === "fib" && (
                          <FibQuestion
                            question={question}
                            setQuestion={setQuestion}
                            userAnswers={userAnswers}
                          />
                        )}
                        {question.category === "descriptive" && (
                          <Descriptive
                            question={question}
                            practice={practice}
                            setDescriptiveAnswer={setDescriptiveAnswer}
                            answerChanged={onDescriptiveUpdate}
                          />
                        )}
                        {question.category === "code" && (
                          <CodingQuestion
                            question={question}
                            setQuestion={setQuestion}
                            practice={practice}
                            userAnswers={userAnswers}
                            answerChanged={onCodeUpdate}
                            hideRunButton={true}
                            ref={codingRef}
                          />
                        )}
                        {question.category === "mixmatch" && (
                          <MixmatchQuestion
                            question={question}
                            answerChanged={saveMixMatchAnswers}
                          />
                        )}

                        <div className="button-group">
                          <div className="row">
                            <div className="col">
                              <div className="left-btn-group clearfix px-2">
                                <div className="clear-btn btn p-0">
                                  <a
                                    className="text-white"
                                    onClick={clearAnswer}
                                  >
                                    Clear
                                  </a>
                                </div>

                                <div className="review-next-btn btn p-0 d-none d-lg-block">
                                  <a
                                    className={`text-white ${
                                      practice.error ? "disabled" : ""
                                    }`}
                                    onClick={() =>
                                      markForReview(!question.hasMarked, true)
                                    }
                                  >
                                    {question.hasMarked
                                      ? "Remove Mark For Review & Next"
                                      : "Mark For Review & Next"}{" "}
                                  </a>
                                </div>

                                <div className="save-btn btn p-0 d-none d-lg-block">
                                  <a
                                    className={`text-white ${
                                      practice.error ? "disabled" : ""
                                    }`}
                                    onClick={() =>
                                      markForReview(!question.hasMarked, false)
                                    }
                                  >
                                    {question.hasMarked
                                      ? "Save & Remove Mark For Review"
                                      : "Save & Mark For Review"}
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="col-auto ml-auto">
                              <div className="right-btn-group clearfix ml-auto">
                                {questionIndex > 0 && (
                                  <div className="previous-btn btn p-0 d-none d-lg-block">
                                    <a
                                      className={`text-white ${
                                        practice.error ? "disabled" : ""
                                      }`}
                                      onClick={previousQuestion}
                                    >
                                      Previous
                                    </a>
                                  </div>
                                )}
                                {question.category == "code" && (
                                  <div
                                    className={`run-code-btn btn p-0 d-none d-lg-block ${
                                      question.processing ? "disabled" : ""
                                    }`}
                                  >
                                    <a
                                      className="text-white"
                                      onClick={() =>
                                        codingRef?.current?.executeCode(
                                          question
                                        )
                                      }
                                    >
                                      Run Code{" "}
                                      {question.processing && (
                                        <i className="fa fa-spinner fa-pulse"></i>
                                      )}
                                    </a>
                                  </div>
                                )}
                                {questionIndex !== totalQuestion - 1 && (
                                  <div className="save-next-btn btn p-0 d-none d-lg-block">
                                    <a
                                      className={`text-white ${
                                        practice.error ? "disabled" : ""
                                      }`}
                                      onClick={() => nextQuestion()}
                                    >
                                      Save and Next
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {question.category !== "code" && (
                      <div className="col-lg-4">
                        <div className="statics">
                          <ul className="nav">
                            <li className="clearfix w-50">
                              <div className="number red">
                                <span className="text-center text-white p-0">
                                  {totalMissedQuestion}
                                </span>
                              </div>
                              <span>Unattempted</span>
                            </li>

                            <li className="clearfix w-50">
                              <div className="number blue">
                                <span className="text-center text-white p-0">
                                  {totalMarked}
                                </span>
                              </div>
                              <span>Marked for Review</span>
                            </li>

                            <li className="clearfix w-50">
                              <div className="number green">
                                <span className="text-center text-white p-0">
                                  {totalAttempted}
                                </span>
                              </div>
                              <span>Answered</span>
                            </li>

                            <li className="clearfix w-50">
                              <div className="number blue">
                                <span className="circle text-center text-white p-0">
                                  {totalAnswerAndMarked}
                                </span>
                              </div>
                              <span className="pt-0">
                                Answered and Marked for review
                              </span>
                            </li>
                          </ul>

                          <div className="accordion" id="accordion">
                            {sections.map(
                              (section: any, sectionIndex: number) => (
                                <div
                                  className="item"
                                  hidden={
                                    practice.enableSection &&
                                    sectionIndex !== sectionNo
                                  }
                                  key={section._id}
                                >
                                  <div
                                    id={`heading${sectionIndex}`}
                                    className="header"
                                  >
                                    <h2>
                                      <button
                                        className="bg-white border-0 text-left {{$index > 0 ? 'collapsed' : ''}}"
                                        type="button"
                                        data-toggle="collapse"
                                        data-target={`#collapse${sectionIndex}`}
                                        aria-expanded="true"
                                        aria-controls={`collapse${sectionIndex}`}
                                      >
                                        {section.name}
                                      </button>
                                    </h2>
                                  </div>

                                  <div
                                    id={`collapse${sectionIndex}`}
                                    className={`"collapse ${
                                      sectionIndex == 0 ? "show" : ""
                                    }`}
                                    aria-labelledby={`heading${sectionIndex}`}
                                    data-parent="#accordion"
                                  >
                                    <div className="question-table">
                                      {sectionQuestions[section._id]?.map(
                                        (question: any, index: number) => (
                                          <div
                                            className="question-table-item p-2"
                                            key={question._id}
                                          >
                                            <div
                                              className={getButtonClass(
                                                question
                                              )}
                                              onClick={() =>
                                                toQuestion(question.countNumber)
                                              }
                                            >
                                              <span
                                                className={`text-center p-0 ${
                                                  question.hasMarked &&
                                                  question.isAnswered
                                                    ? "circle"
                                                    : ""
                                                }`}
                                              >
                                                {question.countNumber}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {question.category == "code" && (
                    <div className="clearfix d-lg-block">
                      {codingQuestion?.stats[
                        codingQuestion.selectedLang.language
                      ]?.show && (
                        <div className="result" id="result">
                          <div
                            className={`result-board bg-white ${
                              codingQuestion.stats[
                                question.userCode?.selectedLang.language
                              ]?.correct
                                ? "correct"
                                : ""
                            }`}
                          >
                            <div className="result-board-title">
                              {codingQuestion?.stats[
                                question.userCode?.selectedLang.language
                              ]?.testcasesPassed !=
                                codingQuestion?.stats[
                                  question.userCode?.selectedLang.language
                                ]?.totalTestcases && (
                                <h4>
                                  Result:<span> Wrong Answer</span>
                                </h4>
                              )}
                            </div>

                            <div className="result-board-wrap">
                              <div className="row">
                                <div className="col-lg-4">
                                  <div className="result-info">
                                    <h5>Time (sec)</h5>
                                    <span>
                                      {codingQuestion?.stats[
                                        question.userCode?.selectedLang.language
                                      ]?.runTime / 1000}
                                    </span>
                                  </div>
                                </div>

                                <div className="col-lg-4">
                                  <div className="result-info">
                                    <h5>Language</h5>
                                    <span>
                                      {codeLanguageDisplay(
                                        question.userCode?.selectedLang.language
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div className="col-lg-4">
                                  <div className="result-info">
                                    <h5>Passed Test Cases</h5>
                                    <span>
                                      {
                                        codingQuestion?.stats[
                                          question.userCode?.selectedLang
                                            .language
                                        ]?.testcasesPassed
                                      }{" "}
                                      out of{" "}
                                      {
                                        codingQuestion?.stats[
                                          question.userCode?.selectedLang
                                            .language
                                        ]?.totalTestcases
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {codingQuestion?.stats[
                            question.userCode?.selectedLang.language
                          ]?.compileError && (
                            <div className="output compile-error">
                              <div className="output-info">
                                <h4>Compilation error</h4>
                                <p className="pre-wrap">
                                  {
                                    codingQuestion?.stats[
                                      question.userCode?.selectedLang.language
                                    ]?.compileError
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                          {!codingQuestion?.stats[
                            question.userCode?.selectedLang.language
                          ]?.compileError &&
                            (practice.testMode != "proctored" ||
                              !clientData.features.hideCodeQuestionOutput) && (
                              <div className="output">
                                <div
                                  className={`output-info ${
                                    codingQuestion.stats[
                                      question.userCode?.selectedLang.language
                                    ]?.correct
                                      ? "correct"
                                      : ""
                                  }`}
                                >
                                  <h4>Your Code’s Output</h4>
                                  {codingQuestion?.stats[
                                    question.userCode?.selectedLang.language
                                  ]?.testcaseToDisplay.output && (
                                    <p className="pre-wrap">
                                      {
                                        codingQuestion?.stats[
                                          question.userCode?.selectedLang
                                            .language
                                        ]?.testcaseToDisplay.output
                                      }
                                    </p>
                                  )}
                                  {codingQuestion?.stats[
                                    question.userCode?.selectedLang.language
                                  ]?.testcaseToDisplay.error && (
                                    <p className="pre-wrap">
                                      {
                                        codingQuestion?.stats[
                                          question.userCode?.selectedLang
                                            .language
                                        ]?.testcaseToDisplay.error
                                      }
                                    </p>
                                  )}
                                  {!codingQuestion?.stats[
                                    question.userCode?.selectedLang.language
                                  ]?.testcaseToDisplay.output &&
                                    !codingQuestion?.stats[
                                      question.userCode?.selectedLang.language
                                    ]?.testcaseToDisplay.error && (
                                      <p>
                                        Your code didn&apos;t print anything.
                                      </p>
                                    )}
                                </div>

                                <div
                                  className={`output-info ${
                                    codingQuestion.stats[
                                      question.userCode?.selectedLang.language
                                    ]?.correct
                                      ? "correct"
                                      : ""
                                  }`}
                                >
                                  <h4>Expected Output</h4>

                                  <p className="pre-wrap">
                                    {
                                      codingQuestion?.stats[
                                        question.userCode?.selectedLang.language
                                      ]?.testcaseToDisplay.expected
                                    }
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="button-group bg-white d-block d-lg-none"
                    hidden={practice.error}
                  >
                    <div className="review-next-btn btn p-0">
                      <a
                        className={`text-center ${
                          practice.error ? "disabled" : ""
                        }`}
                        onClick={() => markForReview(!question.hasMarked, true)}
                      >
                        {question.hasMarked
                          ? "Remove Mark For Review & Next"
                          : "Mark For Review & Next"}{" "}
                      </a>
                    </div>

                    <div className="save-btn btn p-0">
                      <a
                        className={`text-center ${
                          practice.error ? "disabled" : ""
                        }`}
                        onClick={() =>
                          markForReview(!question.hasMarked, false)
                        }
                      >
                        {question.hasMarked
                          ? "Save & Remove Mark For Review"
                          : "Save & Mark For Review"}
                      </a>
                    </div>
                    {question.category == "code" && (
                      <div
                        className={`run-code-btn btn p-0 ${
                          question.processing ? "disabled" : ""
                        }`}
                      >
                        <a
                          className="text-white"
                          onClick={
                            () => codingRef?.current?.executeCode(question)
                            // codingQuestion?.executeCode(
                            //   question,
                            //   baseQuestionIdx
                            // )
                          }
                        >
                          Run Code{" "}
                          {question.processing && (
                            <i className="fa fa-spinner fa-pulse"></i>
                          )}
                        </a>
                      </div>
                    )}
                    <table className="w-100">
                      <tbody>
                        <tr>
                          <td>
                            {questionIndex > 0 && (
                              <div className="save-next-btn-remove pl-2 pr-2 previous-btn btn p-0">
                                <a
                                  className={`text-white text-center ${
                                    practice.error ? "disabled" : ""
                                  }`}
                                  onClick={previousQuestion}
                                >
                                  Previous
                                </a>
                              </div>
                            )}
                          </td>
                          <td>
                            {questionIndex !== totalQuestion - 1 && (
                              <div className="save-next-btn btn p-0">
                                <a
                                  className={`text-white text-center ${
                                    practice.error ? "disabled" : ""
                                  }`}
                                  onClick={() => nextQuestion()}
                                >
                                  Save and Next
                                </a>
                              </div>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}
          {view === "SAT" && (
            <div className="SAT">
              {question && !isBreakTime && (
                <div className="sat-header">
                  <div className="px-5 py-3 position-relative sat-header-inner">
                    <div className="row">
                      <div className="col d-flex justify-content-start gap-sm">
                        <div>
                          <label>{question.section}</label>
                          {sectionSettings[question.section]?.direction && (
                            <button
                              type="button"
                              className="btn btn-link text-dark pl-0 bold"
                              onClick={() =>
                                setIsDirectionsOpen(!isDirectionsOpen)
                              }
                            >
                              Directions&nbsp;&nbsp;
                              <i
                                className={`fas ${
                                  isDirectionsOpen
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                }`}
                              ></i>
                            </button>
                          )}
                          {isDirectionsOpen && (
                            <div className="direction-popover">
                              <div className="px-3 py-4 h-100 d-flex flex-column justify-content-between">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      sectionSettings[question.section]
                                        ?.direction,
                                  }}
                                  className="overflow-auto"
                                />
                                <div className="text-right mt-2">
                                  <button
                                    className="btn rounded bold btn-warning"
                                    onClick={closeDirection}
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* {practice.isProctored && practice.camera && (
                          <Webcam
                            height={70}
                            width={70}
                            imageSmoothing={true}
                            videoConstraints={practice.videoOptions}
                            screenshotQuality={1}
                            screenshotFormat="image/jpeg"
                            onUserMediaError={handleInitError}
                            onUserMedia={() => {}}
                            onScreenshot={camCaptured}
                          />
                        )} */}
                      </div>
                      <div className="col d-flex justify-content-start flex-column align-items-center">
                        {!clockHidden ? (
                          <div className="timer">
                            {true && (
                              <div className="timer-clock text-center bold mt-2">
                                {/* <Countdown
                                  date={Date.now() + timerConfig.time}
                                  onComplete={onNotifyTimer}
                                /> */}
                                {renderer(testTimeCountDown)}
                                {/* <countdown #timer [config]="timerConfig" (event)="onNotifyTimer($event)"></countdown> */}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <i className="far fa-clock fa-2x"></i>
                          </div>
                        )}
                        <button
                          className="btn btn-outline btn-sm bg-white border-dark text-dark rounded"
                          onClick={() => setClockHidden(!clockHidden)}
                          style={{ width: "65px" }}
                        >
                          {clockHidden ? "Show" : "Hide"}
                        </button>
                      </div>
                      <div className="col d-flex justify-content-end align-items-center gap-sm">
                        <button
                          className="text-center text-danger"
                          onClick={reportIssue}
                        >
                          <i
                            className={`fa-flag f-16 ${
                              question.hasFeedback ? "fas" : "far"
                            }`}
                          ></i>
                          <div>Report</div>
                        </button>
                        <button
                          className="text-center text-dark"
                          onClick={refreshPage}
                        >
                          <i className="fas fa-sync"></i>
                          <div>Refresh</div>
                        </button>
                        {sectionSettings[question.section]?.showCalculator && (
                          <>
                            {practice.showCalculator === "desmos" && (
                              <button
                                className="text-center text-dark"
                                onClick={graphingCalculatorModal}
                              >
                                <i className="fas fa-calculator"></i>
                                <div>Calculator</div>
                              </button>
                            )}
                            {practice.showCalculator === "scientific" && (
                              <button
                                className="text-center text-dark"
                                onClick={openCalculatorModal}
                              >
                                <i className="fas fa-calculator"></i>
                                <div>Calculator</div>
                              </button>
                            )}
                            <button
                              className="text-center text-dark"
                              // onClick={openReference}
                            >
                              <i className="fas fa-square-root-alt"></i>
                              <div>Reference</div>
                            </button>
                          </>
                        )}
                        {!sectionSettings[question.section]?.showCalculator && (
                          <div
                            className="text-center text-dark"
                            onClick={getAnnotation}
                          >
                            <i className="fas fa-pen-fancy"></i>
                            <div>Annotate</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="dash-border"></div>
                </div>
              )}

              <div className="position-relative">
                {!reviewAttempt && (
                  <div className="sat-body">
                    <div className="px-5 py-2 d-flex">
                      {question.questionHeader && (
                        <div
                          className={`pt-4 pb-3 pr-1 position-relative ${
                            expandedPanel == "left"
                              ? "flex-grow-2"
                              : "flex-grow-1"
                          }`}
                        >
                          <div className="question-header-panel pr-4">
                            <MathJax
                              value={formatQuestion(
                                clientData?.baseUrl,
                                question.questionHeader
                              )}
                              className="take-test-question-header"
                            />
                          </div>

                          <a
                            className="btn-expand-collapse-left rounded-circle shadow py-1 px-2 text-dark"
                            onClick={() => expandPanel("left")}
                          >
                            <i
                              className={`fas ${
                                expandedPanel != "left"
                                  ? "fa-expand"
                                  : "fa-compress"
                              }`}
                            ></i>
                          </a>
                        </div>
                      )}
                      {question.questionHeader && (
                        <div className="separator"></div>
                      )}

                      <div
                        className={`pt-4 pb-3 pr-1 position-relative ${
                          expandedPanel == "right"
                            ? "flex-grow-2"
                            : "flex-grow-1"
                        }`}
                      >
                        <section className="question question-content-panel pr-4 pl-4">
                          <div>
                            <div className="d-flex gap-sm align-items-center bg-light-grey">
                              <div className="px-3 py-2 bg-dark text-white bold f-16">
                                {currPage}
                              </div>

                              <a
                                onClick={() =>
                                  markForReview(!question.hasMarked, false)
                                }
                                className="f-16 text-dark"
                              >
                                <i
                                  className={`fa-bookmark mr-2 ${
                                    !question.hasMarked ? "far" : "fas"
                                  } ${question.hasMarked ? "text-danger" : ""}`}
                                ></i>
                                Mark for review
                              </a>
                              {question.category == "mcq" && (
                                <div className="flex-grow-1 text-right">
                                  <a
                                    className={`btn btn-sm p-1 line-through ${
                                      isAnswerCrossOutShow
                                        ? "btn-primary"
                                        : "btn-outline"
                                    }`}
                                    onClick={() =>
                                      setIsAnswerCrossOutShow(
                                        !isAnswerCrossOutShow
                                      )
                                    }
                                    tooltip="Cross out answer choices you think are wrong"
                                    placement="bottom"
                                  >
                                    ABC
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="dash-border"></div>
                          </div>
                          <div className="question-area">
                            {/* {question.category}--- */}
                            {question.category === "mcq" && (
                              <McqQuestion
                                clientData={clientData}
                                question={question}
                                setQuestion={setQuestion}
                                answerChanged={selectAnswer}
                              />
                            )}
                            {question.category === "fib" && (
                              <FibQuestion
                                question={question}
                                setQuestion={setQuestion}
                                userAnswers={userAnswers}
                              />
                            )}
                            {question.category === "descriptive" && (
                              <Descriptive
                                question={question}
                                practice={practice}
                                answerChanged={onDescriptiveUpdate}
                              />
                            )}
                            {question.category === "code" && (
                              <CodingQuestion
                                question={question}
                                setQuestion={setQuestion}
                                practice={practice}
                                userAnswers={userAnswers}
                                answerChanged={onCodeUpdate}
                                hideRunButton={true}
                                ref={codingRef}
                              />
                            )}
                            {question.category === "mixmatch" && (
                              <MixmatchQuestion
                                question={question}
                                answerChanged={saveMixMatchAnswers}
                              />
                            )}
                            {question.category == "code" && (
                              <div className="clearfix d-lg-block">
                                {codingQuestion?.stats[
                                  codingQuestion.selectedLang.language
                                ]?.show && (
                                  <div className="result" id="result">
                                    <div
                                      className={`result-board bg-white ${
                                        codingQuestion.stats[
                                          question.userCode.selectedLang
                                            .language
                                        ].correct
                                          ? "correct"
                                          : ""
                                      }`}
                                    >
                                      <div className="result-board-title">
                                        <h4>
                                          Result:
                                          {codingQuestion?.stats[
                                            question.userCode.selectedLang
                                              .language
                                          ].testcasesPassed !=
                                            codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].totalTestcases && (
                                            <span> Wrong Answer</span>
                                          )}
                                        </h4>
                                      </div>

                                      <div className="result-board-wrap">
                                        <div className="row">
                                          <div className="col-lg-4">
                                            <div className="result-info">
                                              <h5>Time (sec)</h5>
                                              <span>
                                                {codingQuestion?.stats[
                                                  question.userCode.selectedLang
                                                    .language
                                                ].runTime / 1000}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="col-lg-4">
                                            <div className="result-info">
                                              <h5>Language</h5>
                                              <span>
                                                {codeLanguageDisplay(
                                                  question.userCode.selectedLang
                                                    .language
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="col-lg-4">
                                            <div className="result-info">
                                              <h5>Passed Test Cases</h5>
                                              <span>
                                                {
                                                  codingQuestion?.stats[
                                                    question.userCode
                                                      .selectedLang.language
                                                  ].testcasesPassed
                                                }{" "}
                                                out of{" "}
                                                {
                                                  codingQuestion?.stats[
                                                    question.userCode
                                                      .selectedLang.language
                                                  ].totalTestcases
                                                }
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {codingQuestion?.stats[
                                      question.userCode.selectedLang.language
                                    ].compileError && (
                                      <div className="output compile-error">
                                        <div className="output-info">
                                          <h4>Compilation error</h4>
                                          <p className="pre-wrap">
                                            {
                                              codingQuestion?.stats[
                                                question.userCode.selectedLang
                                                  .language
                                              ].compileError
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    {!codingQuestion?.stats[
                                      question.userCode.selectedLang.language
                                    ].compileError &&
                                      (practice.testMode != "proctored" ||
                                        !clientData?.features
                                          .hideCodeQuestionOutput) && (
                                        <div className="output">
                                          <div
                                            className={`output-info ${
                                              codingQuestion.stats[
                                                question.userCode.selectedLang
                                                  .language
                                              ].correct
                                                ? "correct"
                                                : ""
                                            }`}
                                          >
                                            <h4>Your Code’s Output</h4>
                                            {codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].testcaseToDisplay.output && (
                                              <p className="pre-wrap">
                                                {
                                                  codingQuestion?.stats[
                                                    question.userCode
                                                      .selectedLang.language
                                                  ].testcaseToDisplay.output
                                                }
                                              </p>
                                            )}
                                            {codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].testcaseToDisplay.error && (
                                              <p className="pre-wrap">
                                                {
                                                  codingQuestion?.stats[
                                                    question.userCode
                                                      .selectedLang.language
                                                  ].testcaseToDisplay.error
                                                }
                                              </p>
                                            )}
                                            {!codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].testcaseToDisplay.output &&
                                              !codingQuestion?.stats[
                                                question.userCode.selectedLang
                                                  .language
                                              ].testcaseToDisplay.error && (
                                                <p>
                                                  Your code didn&apos;t print
                                                  anything.
                                                </p>
                                              )}
                                          </div>

                                          <div
                                            className={`output-info ${
                                              codingQuestion.stats[
                                                question.userCode.selectedLang
                                                  .language
                                              ].correct
                                                ? "correct"
                                                : ""
                                            }`}
                                          >
                                            <h4>Expected Output</h4>

                                            <p className="pre-wrap">
                                              {
                                                codingQuestion?.stats[
                                                  question.userCode.selectedLang
                                                    .language
                                                ].testcaseToDisplay.expected
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </section>
                        {question.questionHeaderv && (
                          <a
                            className="btn-expand-collapse-right rounded-circle shadow py-1 px-2 text-dark"
                            onClick={() => expandPanel("right")}
                          >
                            <i
                              className={`fas ${
                                expandedPanel == "right"
                                  ? "fa-compress"
                                  : "fa-expand"
                              }`}
                            ></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {reviewAttempt && (
                  <div className="sat-body bg-light-grey">
                    <div
                      className="px-5 py-2 text-center mx-auto"
                      style={{ maxWidth: "800px" }}
                    >
                      <h4 className="h4 my-4">Check Your Work</h4>
                      {practice.testMode != "proctored" && (
                        <div>
                          On test day, you won&apos;t be able to move on to the
                          next module until time expires.
                          <br />
                          For these practice questions, you can click{" "}
                          <b>Next</b> when you&apos;re ready to move on.
                        </div>
                      )}

                      <div
                        className="bg-white shadow d-inline-block mx-auto p-3 my-4"
                        style={{ borderRadius: "6px" }}
                      >
                        <div className="d-flex justify-content-between mb-3">
                          <div className="h5 bold mb-0 mr-4">
                            Section {sectionNo + 1}: {question.section}
                          </div>
                          <div className="d-flex justify-content-center align-items-center gap-sm">
                            <div>
                              <div
                                className="d-inline-block"
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  border: "1px dashed",
                                  verticalAlign: "text-bottom",
                                }}
                              ></div>
                              &nbsp;Unanswered
                            </div>

                            <div>
                              <i className="fas fa-bookmark text-danger"></i>
                              &nbsp;For Review
                            </div>
                          </div>
                        </div>
                        {/* {
  sections.map((section:any, index:number)=>
  <>
  (!practice.enableSection || $index == sectionNo) && 
  <div className="d-flex flex-wrap gap-xs" key={index}>
    {
      sectionQuestions[section._id].map((secQuestion:any, i: number)=> 
      <div className="question-review-item mt-2">
          <a className={`px-1 pt-1 ${secQuestion.isAnswered? 'answered': ''}`} onClick={()=>toQuestion(question.countNumber)}>
              {secQuestion.countNumber}
          </a>
          {
            secQuestion.hasMarked
          <span className="question-bookmark shadow">
              <i className="fas fa-bookmark text-danger"></i>
          </span>
          }
      </div>
      )
    }
  </div>
  </>
  )
} */}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sat-footer">
                  <div className="dash-border"></div>
                  <div className="px-5 py-3 sat-footer-inner">
                    <div className="row">
                      <div className="col d-flex align-items-center">
                        <label>{user?.name}</label>
                      </div>
                      {!reviewAttempt && (
                        <div className="col d-flex justify-content-center align-items-center flex-column">
                          <div
                            onClick={() =>
                              setIsQuestionPanelOpen(!isQuestionPanelOpen)
                            }
                          >
                            {isQuestionPanelOpen && (
                              <>
                                <div className="d-flex flex-column justify-content-around p-2 gap-sm">
                                  <div className="d-flex">
                                    <div className="flex-grow-1 text-center">
                                      <label>
                                        Section {sectionNo + 1}:{" "}
                                        {question.section}
                                      </label>
                                    </div>
                                    <label>
                                      <a
                                        className="text-dark ml-2"
                                        onClick={closeQuestionPanel}
                                      >
                                        &times;
                                      </a>
                                    </label>
                                  </div>

                                  <div className="border-top border-bottom d-flex justify-content-center gap-sm py-2">
                                    <div>
                                      <i className="fas fa-map-marker"></i>
                                      &nbsp;Current
                                    </div>

                                    <div>
                                      <div
                                        className="d-inline-block"
                                        style={{
                                          width: "18px",
                                          height: "18px",
                                          border: "1px dashed",
                                          verticalAlign: "text-bottom",
                                        }}
                                      ></div>
                                      &nbsp;Unanswered
                                    </div>

                                    <div>
                                      <i className="fas fa-bookmark text-danger"></i>
                                      &nbsp;For Review
                                    </div>
                                  </div>

                                  <div>
                                    {sections.map(
                                      (section: any, index: number) => (
                                        <div key={index}>
                                          {(!practice.enableSection ||
                                            index == sectionNo) && (
                                            <div className="d-flex flex-wrap gap-xs">
                                              {sectionQuestions[
                                                section._id
                                              ].map(
                                                (
                                                  secQuestion: any,
                                                  id: number
                                                ) => (
                                                  <div
                                                    className="question-review-item"
                                                    key={id}
                                                  >
                                                    <a
                                                      className={`mt-2 px-1 ${
                                                        secQuestion.isAnswered
                                                          ? "answered"
                                                          : ""
                                                      } ${
                                                        secQuestion._id ==
                                                        question._id
                                                          ? "underline"
                                                          : ""
                                                      }`}
                                                      onClick={() => {
                                                        setIsQuestionPanelOpen(
                                                          false
                                                        );
                                                        toQuestion(
                                                          secQuestion.countNumber
                                                        );
                                                      }}
                                                    >
                                                      {secQuestion.countNumber}
                                                    </a>
                                                    <span className="question-bookmark shadow">
                                                      <i className="fas fa-bookmark text-danger"></i>
                                                    </span>
                                                    {secQuestion._id ==
                                                      question._id && (
                                                      <i className="fas fa-map-marker"></i>
                                                    )}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>

                                  <div className="text-center">
                                    <button
                                      className="btn btn-outline rounded text-primary bold"
                                      onClick={showAttemptReview}
                                    >
                                      Go to Review Page
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <a
                            type="button"
                            className="btn btn-dark bold"
                            onClick={() =>
                              setIsQuestionPanelOpen(!isQuestionPanelOpen)
                            }
                          >
                            Question {currPage} of {totalQuestion}&nbsp;&nbsp;
                            <i
                              className={`fas ${
                                isQuestionPanelOpen
                                  ? "fa-chevron-down"
                                  : "fa-chevron-up"
                              }`}
                            ></i>
                          </a>
                        </div>
                      )}

                      <div className="col d-flex justify-content-end gap-sm align-items-center">
                        {question.category == "code" && (
                          <button
                            className={`btn btn-lg btn-success rounded ${
                              question.processing ? "disabled" : ""
                            }`}
                            onClick={() =>
                              codingRef?.current?.executeCode(question)
                            }
                          >
                            Run Code{" "}
                            {question.processing && (
                              <i className="fa fa-spinner fa-pulse"></i>
                            )}
                          </button>
                        )}

                        {!reviewAttempt && questionIndex > 0 && (
                          <button
                            className={`"btn btn-lg btn-primary rounded ${
                              practice.error ? "disabled" : ""
                            }`}
                            onClick={previousQuestion}
                          >
                            Back
                          </button>
                        )}
                        {!reviewAttempt &&
                          questionIndex < totalQuestion - 1 && (
                            <button
                              className={`"btn btn-lg btn-primary rounded ${
                                practice.error ? "disabled" : ""
                              }`}
                              onClick={() => nextQuestion()}
                            >
                              Next
                            </button>
                          )}
                        {!reviewAttempt &&
                          questionIndex == totalQuestion - 1 && (
                            <button
                              className={`"btn btn-lg btn-primary rounded ${
                                practice.error ? "disabled" : ""
                              }`}
                              onClick={showAttemptReview}
                            >
                              Next
                            </button>
                          )}
                        {reviewAttempt && (
                          <>
                            <button
                              className="btn btn-lg btn-primary rounded"
                              onClick={hideAttemptReview}
                            >
                              Back
                            </button>

                            <button
                              className={`btn btn-lg btn-primary rounded ${
                                practice.error ? "disabled" : ""
                              }`}
                              onClick={nextFromAttemptReview}
                            >
                              Next
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {isDirectionsOpen && <div className="direction-curtain"></div>}
              </div>
            </div>
          )}
          {view === "ACT" && (
            <div className="ACT">
              {question && !isBreakTime && (
                <div className="act-header">
                  <div className="d-flex justify-content-between">
                    <div>
                      <button
                        className="btn btn-primary"
                        style={{
                          display: !reviewAttempt ? "inline-block" : "none",
                        }}
                        disabled={questionIndex === 0}
                        onClick={previousQuestion}
                        title="previous"
                      >
                        <i className="fas fa-arrow-left"></i>
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{
                          display: reviewAttempt ? "inline-block" : "none",
                        }}
                        onClick={hideAttemptReview}
                        title="previous"
                      >
                        <i className="fas fa-arrow-left"></i>
                      </button>
                      &nbsp;
                      <button
                        className="btn btn-primary"
                        style={{
                          display:
                            !sectionDirection &&
                            questionIndex < totalQuestion - 1
                              ? "inline-block"
                              : "none",
                        }}
                        disabled={reviewAttempt}
                        onClick={nextQuestion}
                        title="next"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{
                          display:
                            !sectionDirection &&
                            questionIndex === totalQuestion - 1
                              ? "inline-block"
                              : "none",
                        }}
                        disabled={reviewAttempt}
                        onClick={showAttemptReview}
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{
                          display: sectionDirection ? "inline-block" : "none",
                        }}
                        onClick={hideSectionDirection}
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <button
                        type="button"
                        className="btn btn-light"
                        title="Review"
                      >
                        Review&nbsp;<i className="fas fa-list"></i>
                      </button>
                      &nbsp;
                      <button
                        className="btn btn-light"
                        style={{
                          display:
                            !reviewAttempt && !sectionDirection
                              ? "inline-block"
                              : "none",
                        }}
                        onClick={() =>
                          markForReview(!question.hasMarked, false)
                        }
                        title="Bookmark Question for Review"
                      >
                        <i
                          className={`fa-bookmark mr-2 ${
                            question.hasMarked ? "fas text-danger" : "far"
                          }`}
                        ></i>
                        Bookmark
                      </button>
                      &nbsp;
                      <button
                        className="btn btn-light"
                        title="Refresh"
                        onClick={refreshPage}
                      >
                        <i className="fas fa-sync mr-2"></i>Refresh
                      </button>
                      &nbsp;
                      <button
                        className="btn btn-light"
                        style={{
                          display:
                            !sectionDirection && !reviewAttempt
                              ? "inline-block"
                              : "none",
                        }}
                        title="Report"
                        onClick={reportIssue}
                      >
                        <i
                          className={`fa-flag f-16 text-danger mr-2 ${
                            question.hasFeedback ? "fas" : "far"
                          }`}
                        ></i>
                        Report
                      </button>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {!isBreakTime && (
                        <div
                          className="btn-group"
                          role="group"
                          aria-label="Mouse mode"
                        >
                          <button
                            className={`btn btn-light ${
                              mouseMode === "pointer" ? "active" : ""
                            }`}
                            onClick={() => handleMouseModeChange("pointer")}
                            title="Pointer"
                          >
                            <i className="fas fa-mouse-pointer"></i>
                          </button>
                          <button
                            className={`btn btn-light ${
                              mouseMode === "eliminator" ? "active" : ""
                            }`}
                            onClick={() => handleMouseModeChange("eliminator")}
                            title="Answer Eliminator"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                      {showCalculatorButton("desmos", graphingCalculatorModal)}
                      {showCalculatorButton("scientific", openCalculatorModal)}
                    </div>
                    <div className="d-flex align-items-center">
                      {practice.isProctored && practice.camera && (
                        <Webcam
                          className="mr-2"
                          height={70}
                          width={70}
                          screenshotQuality={1}
                          videoConstraints={videoOptions}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          onUserMediaError={handleInitError}
                        />
                      )}
                      {refreshTimer && (
                        <div
                          className="timer-clock text-center bold"
                          style={{
                            borderRight: "2px solid green",
                            borderRadius: "0px",
                            marginRight: "10px",
                          }}
                        >
                          <Countdown
                            date={Date.now() + timerConfig.time}
                            onComplete={onNotifyTimer}
                          />
                        </div>
                      )}
                      <label>{user.name}</label>
                      &nbsp;&nbsp;
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-outline dropdown-toggle caret-on-dropdown"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="fas fa-user"></i>
                        </button>
                        <div className="dropdown-menu">
                          <a
                            className="dropdown-item"
                            onClick={toogleAnswerMasking}
                          >
                            {answerMasking ? "Disable" : "Enable"} Answer
                            Masking
                          </a>
                          <div className="dropdown-divider"></div>
                          <a
                            className="dropdown-item"
                            onClick={() => location.back()}
                          >
                            Quit The Test
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="test-info">
                    {!reviewAttempt && (
                      <div>
                        <strong>
                          {practice.title}&nbsp;/&nbsp;{question.section}
                          &nbsp;/&nbsp;{currPage} of {totalQuestion}
                        </strong>
                      </div>
                    )}

                    {reviewAttempt && (
                      <div>
                        <h4>
                          {practice.title}&nbsp;/&nbsp;
                          {practice.enableSection &&
                          sectionNo < practice.sections.length - 1
                            ? "End of Section"
                            : "End Test"}
                        </h4>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!reviewAttempt && !sectionDirection && question && (
                <div className="question-section shadow bg-white d-flex">
                  {question.questionHeader && (
                    <div className="flex-grow-1 flex-basic-0">
                      <div className="question-box" id="sat-question-header">
                        <div className="question-header-wrapper">
                          {/* Replace mathjax-renderer with appropriate JSX for rendering math content */}
                          <div className="question-header">
                            {question.questionHeader}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="position-relative flex-grow-1 flex-basic-0">
                    <section className="question question-content-panel">
                      <div className="question-area">
                        {/* Using switch case for different question categories */}
                        {question.category === "mcq" && (
                          <McqQuestion
                            question={question}
                            testView="ACT"
                            setQuestion={setQuestion}
                            answerChanged={selectAnswer}
                            userAnswers={userAnswers}
                            showCrossOut={isAnswerCrossOutShow}
                            answerMasking={answerMasking}
                          />
                        )}

                        {question.category === "fib" && (
                          <FibQuestion
                            ref={fibQuestion} // Use ref appropriately if needed
                            question={question}
                            inputChanged={onFibTextChange}
                            id="questionText"
                            inputClick={onFibTextClicked}
                            userAnswers={userAnswers}
                          />
                        )}

                        {question.category === "descriptive" && (
                          <Descriptive
                            question={question}
                            practice={practice}
                            answerChanged={onDescriptiveUpdate}
                            setDescriptiveAnswer={setDescriptiveAnswer}
                          />
                        )}

                        {question.category === "code" && (
                          <CodingQuestion
                            // ref={codingQuestion} // Use ref appropriately if needed
                            hideRunButton={true} // Example usage of props
                            question={question}
                            practice={practice}
                            userAnswers={userAnswers}
                            answerChanged={onCodeUpdate}
                            setQuestion={setQuestion}
                          />
                        )}

                        {question.category === "mixmatch" && (
                          <MixmatchQuestion
                            // ref={mixmatchQuestion} // Use ref appropriately if needed
                            question={question}
                            answerChanged={saveMixMatchAnswers}
                          />
                        )}

                        {/* Additional logic for displaying code question result */}
                        {question.category === "code" && (
                          <div className="clearfix d-lg-block">
                            <div
                              className="result"
                              id="result"
                              style={{
                                display: codingQuestion?.stats[
                                  codingQuestion.selectedLang.language
                                ]?.show
                                  ? "block"
                                  : "none",
                              }}
                            >
                              <div
                                className={`result-board bg-white ${
                                  codingQuestion.stats[
                                    question.userCode.selectedLang.language
                                  ].correct
                                    ? "correct"
                                    : ""
                                }`}
                              >
                                <div className="result-board-title">
                                  <h4>
                                    Result:{" "}
                                    <span>
                                      {codingQuestion?.stats[
                                        question.userCode.selectedLang.language
                                      ].testcasesPassed !==
                                      codingQuestion?.stats[
                                        question.userCode.selectedLang.language
                                      ].totalTestcases
                                        ? "Wrong Answer"
                                        : ""}
                                    </span>
                                  </h4>
                                </div>
                                <div className="result-board-wrap">
                                  <div className="row">
                                    <div className="col-lg-4">
                                      <div className="result-info">
                                        <h5>Time (sec)</h5>
                                        <span>
                                          {codingQuestion?.stats[
                                            question.userCode.selectedLang
                                              .language
                                          ].runTime / 1000}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-lg-4">
                                      <div className="result-info">
                                        <h5>Language</h5>
                                        <span>
                                          {
                                            question.userCode.selectedLang
                                              .language
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-lg-4">
                                      <div className="result-info">
                                        <h5>Passed Test Cases</h5>
                                        <span>
                                          {
                                            codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].testcasesPassed
                                          }{" "}
                                          out of{" "}
                                          {
                                            codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].totalTestcases
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {codingQuestion?.stats[
                                question.userCode.selectedLang.language
                              ].compileError && (
                                <div className="output compile-error">
                                  <div className="output-info">
                                    <h4>Compilation error</h4>
                                    <p className="pre-wrap">
                                      {
                                        codingQuestion?.stats[
                                          question.userCode.selectedLang
                                            .language
                                        ].compileError
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}
                              {!codingQuestion?.stats[
                                question.userCode.selectedLang.language
                              ].compileError &&
                                (!practice.isProctored ||
                                  !clientData.features
                                    .hideCodeQuestionOutput) && (
                                  <div className="output">
                                    <div
                                      className={`output-info ${
                                        codingQuestion.stats[
                                          question.userCode.selectedLang
                                            .language
                                        ].correct
                                          ? "correct"
                                          : ""
                                      }`}
                                    >
                                      <h4>Your Code’s Output</h4>
                                      {codingQuestion?.stats[
                                        question.userCode.selectedLang.language
                                      ].testcaseToDisplay.output && (
                                        <p className="pre-wrap">
                                          {
                                            codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].testcaseToDisplay.output
                                          }
                                        </p>
                                      )}
                                      {codingQuestion?.stats[
                                        question.userCode.selectedLang.language
                                      ].testcaseToDisplay.error && (
                                        <p className="pre-wrap">
                                          {
                                            codingQuestion?.stats[
                                              question.userCode.selectedLang
                                                .language
                                            ].testcaseToDisplay.error
                                          }
                                        </p>
                                      )}
                                      {!codingQuestion?.stats[
                                        question.userCode.selectedLang.language
                                      ].testcaseToDisplay.output &&
                                        !codingQuestion?.stats[
                                          question.userCode.selectedLang
                                            .language
                                        ].testcaseToDisplay.error && (
                                          <p>
                                            Your code didn&apos;t print
                                            anything.
                                          </p>
                                        )}
                                    </div>
                                    <div
                                      className={`output-info ${
                                        codingQuestion.stats[
                                          question.userCode.selectedLang
                                            .language
                                        ].correct
                                          ? "correct"
                                          : ""
                                      }`}
                                    >
                                      <h4>Expected Output</h4>
                                      <p className="pre-wrap">
                                        {
                                          codingQuestion?.stats[
                                            question.userCode.selectedLang
                                              .language
                                          ].testcaseToDisplay.expected
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {reviewAttempt && (
                <div
                  className="question-section"
                  style={{
                    width: "650px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <div
                    className="text-center p-3 text-white border rounded h4 bold"
                    style={{ backgroundColor: "#40657A" }}
                  >
                    Congratulations, you have finished!
                  </div>
                  <div className="mt-4 bg-white p-3">
                    <h3 className="h3 text-center">
                      End of {question.section}
                    </h3>
                    <div>
                      Use the <b>Review</b> button above, or the list below, to
                      go back and review your answers. When you are done, use
                      the <b>Submit Final Answers</b> button below to submit
                      your answers.
                    </div>

                    {!(totalMissedQuestion > 0 || totalMarked > 0) && (
                      <div className="d-flex justify-content-center gap-sm mt-3">
                        <div className="text-center">
                          <i className="fas fa-check-circle fa-4x text-success"></i>
                          <p>
                            All Questions
                            <br />
                            Answered
                          </p>
                        </div>

                        <div>
                          <div
                            className="text-center text-white bold position-relative"
                            style={{ width: "42px", height: "56px" }}
                          >
                            <div
                              className="position-absolute"
                              style={{ left: "15px" }}
                            >
                              <i className="fas fa-bookmark fa-4x text-primary"></i>
                            </div>
                            <p
                              className="position-absolute h5"
                              style={{ left: "30px", top: "15px" }}
                            >
                              0
                            </p>
                          </div>

                          <p>Bookmarks</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-center">
                      {!practice?.enableSection ||
                      sectionNo === practice.sections.length - 1 ? (
                        <button
                          className="btn btn-success px-5"
                          onClick={finishTest}
                        >
                          Submit Final Answers
                        </button>
                      ) : (
                        <button
                          className="btn btn-success px-5"
                          onClick={() => nextFromAttemptReview(true)}
                        >
                          Go To Next Section
                        </button>
                      )}
                    </div>

                    {(totalMissedQuestion > 0 || totalMarked > 0) && (
                      <div
                        className="mt-3 p-3 border rounded"
                        style={{ backgroundColor: "#EEEEEE" }}
                      >
                        {totalMissedQuestion > 0 && (
                          <div className="d-flex">
                            <div className="isAnswered-on-question">
                              <i className="fas fa-circle"></i>
                            </div>
                            &nbsp;&nbsp;&nbsp; Unanswered questions are marked
                            with a dot.
                          </div>
                        )}
                        {totalMarked > 0 && (
                          <div className="d-flex">
                            <div>
                              <i className="fas fa-bookmark text-primary"></i>
                            </div>
                            &nbsp;&nbsp;&nbsp; Bookmarked questions are marked
                            with a bookmark symbol.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-3">
                      {!practice.enableSection && (
                        <div className="row">
                          {practice.questions.map((secQuestion) => (
                            <div
                              key={secQuestion.countNumber}
                              className="col-4 mb-4"
                            >
                              <div
                                className="p-2 border cursor-pointer d-flex position-relative border rounded"
                                style={{ backgroundColor: "#EEEEEE" }}
                                onClick={() =>
                                  toQuestion(secQuestion.countNumber)
                                }
                              >
                                <div className="isAnswered-on-question">
                                  {!secQuestion.isAnswered && (
                                    <i className="fas fa-circle"></i>
                                  )}
                                </div>
                                &nbsp;&nbsp;&nbsp;
                                <span className="">
                                  Question {secQuestion.countNumber}
                                </span>
                                {secQuestion.hasMarked && (
                                  <div className="bookmark-on-question">
                                    <i className="fas fa-bookmark text-primary"></i>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {practice.enableSection && (
                        <div className="row">
                          {sectionQuestions[sections[sectionNo]._id].map(
                            (secQuestion) => (
                              <div
                                key={secQuestion.countNumber}
                                className="col-4 mb-4"
                              >
                                <div
                                  className="p-2 border cursor-pointer d-flex position-relative border rounded"
                                  style={{ backgroundColor: "#EEEEEE" }}
                                  onClick={() =>
                                    toQuestion(secQuestion.countNumber)
                                  }
                                >
                                  <div className="isAnswered-on-question">
                                    {!secQuestion.isAnswered && (
                                      <i className="fas fa-circle"></i>
                                    )}
                                  </div>
                                  &nbsp;&nbsp;&nbsp;
                                  <span className="">
                                    Question {secQuestion.countNumber}
                                  </span>
                                  {secQuestion.hasMarked && (
                                    <div className="bookmark-on-question">
                                      <i className="fas fa-bookmark text-primary"></i>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {sectionDirection && (
                <div
                  className="bg-white question-section"
                  style={{
                    width: "650px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <div className="mt-4 bg-white p-4">
                    <h4 className="h4 text-center">
                      {sections[sectionNo].name}
                    </h4>
                    <div className="my-3 d-flex justify-content-center">
                      <div className="d-inline-block py-2 px-5 border rounded bg-light-grey text-center">
                        <p className="h5">
                          {sectionQuestions[sections[sectionNo]._id].length}{" "}
                          Questions
                        </p>
                        <p className="h5">{sections[sectionNo].time} minutes</p>
                      </div>
                    </div>

                    {sections[sectionNo].direction && (
                      <mathjax-renderer
                        content={sections[sectionNo].direction}
                      />
                    )}

                    <div className="text-center mt-2">
                      <button
                        className="btn btn-primary"
                        onClick={hideSectionDirection}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Review attempt section */}
              {reviewAttempt && (
                <div
                  className="question-section"
                  style={{
                    width: "650px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {/* Placeholder text */}
                  <div
                    className="text-center p-3 text-white border rounded h4 bold"
                    style={{ backgroundColor: "#40657A" }}
                  >
                    Congratulations, you have finished!
                  </div>
                  <div className="mt-4 bg-white p-3">
                    <h3 className="h3 text-center">
                      End of {question.section}
                    </h3>
                    <div>
                      Use the <b>Review</b> button above, or the list below, to
                      go back and review your answers. When you are done, use
                      the <b>Submit Final Answers</b> button below to submit
                      your answers.
                    </div>
                    {/* Placeholder content */}
                    {/* Placeholder content */}
                    <div className="mt-3 text-center">
                      {/* Adjust the logic for displaying buttons based on practice.enableSection and sectionNo */}
                      <button
                        className="btn btn-success px-5"
                        onClick={finishTest}
                      >
                        Submit Final Answers
                      </button>
                      <button
                        className="btn btn-success px-5"
                        onClick={() => nextFromAttemptReview(true)}
                      >
                        Go To Next Section
                      </button>
                    </div>
                    {/* Placeholder content */}
                    {/* Placeholder content */}
                    <div
                      className="mt-3 p-3 border rounded"
                      style={{ backgroundColor: "#EEEEEE" }}
                    >
                      <div className="d-flex">
                        {/* Placeholder content */}
                        <div className="isAnswered-on-question">
                          <i className="fas fa-circle"></i>
                        </div>
                        &nbsp;&nbsp;&nbsp; Unanswered questions are marked with
                        a dot.
                      </div>
                      {/* Placeholder content */}
                      <div className="d-flex">
                        <div className="">
                          <i className="fas fa-bookmark text-primary"></i>
                        </div>
                        &nbsp;&nbsp;&nbsp; Bookmarked questions are marked with
                        a bookmark symbol.
                      </div>
                    </div>
                    {/* Placeholder content */}
                    {/* Placeholder content */}
                    <div className="p-3">
                      <div className="row">
                        {/* Placeholder content */}
                        <div className="col-4 mb-4">
                          <div
                            className="p-2 border cursor-pointer d-flex position-relative border rounded"
                            style={{ backgroundColor: "#EEEEEE" }}
                            onClick={() => toQuestion(secQuestion.countNumber)}
                          >
                            <div className="isAnswered-on-question">
                              <i className="fas fa-circle"></i>
                            </div>
                            &nbsp;&nbsp;&nbsp;
                            <span className="">
                              Question {secQuestion.countNumber}
                            </span>
                            <div className="bookmark-on-question">
                              <i className="fas fa-bookmark text-primary"></i>
                            </div>
                          </div>
                        </div>
                        {/* Placeholder content */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <LearningTestReportModal
            show={showReportModal}
            onClose={() => feedbackClose}
            feedbackSubmit={feedbackSubmit}
            feedbackError={feedbackError}
            qfeedbackForm={qfeedbackForm}
            onFeedbackCheck={onFeedbackCheck}
            setQFeedbackForm={setQFeedbackForm}
          />

          {showSketchpad && (
            <>
              <ScratchPad
                show={showSketchpad}
                onClose={openSketch}
              ></ScratchPad>
            </>
          )}

          {/* {practice.showCalculator && <CalculatorModal />} */}
          {/* <app-calculator *ngIf="practice.showCalculator"></app-calculator>

    <app-scratchpad [hidden]="!showSketchpad" className='m-sm' (onClose)="openSketch()" (onDrawing)="onScratchpadDrawing($event)" [question]="question._id"></app-scratchpad> */}
          {submitting && (
            <div className="test-submit-panel">
              <div className="test-submit-curtain"></div>
              <div className="test-submit-msg">
                <span>{submitMessage}</span>
                <img
                  src="https://d15aq2mos7k6ox.cloudfront.net/images/ajax-loader.gif"
                  className="d-inline"
                  alt=""
                />
              </div>
            </div>
          )}
        </>
      )}
    </LoadingOverlay>
  );
};

export default TakeTest;
