import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { alert, success, error, confirm } from "alertifyjs";
import { TagsInput } from "react-tag-input-component";
import Link from "next/link";
import Multiselect from "multiselect-react-dropdown";
import { Modal } from "react-bootstrap";
import { FileDrop } from "react-file-drop";
import ReactPlayer from "react-player";
import * as questionSvc from "@/services/question-service";
import * as feedbackSvc from "@/services/feedbackService";
import * as testSvc from "@/services/test-service";
import * as subjectSvc from "@/services/subjectService";
import { Tabs, Tab } from "react-bootstrap";
import MathJax from "@/components/assessment/mathjax";
import CodeRenderer from "@/components/assessment/code-renderer";
import QuestionFeedback from "@/components/assessment/question-feedback";
import { AppLogo } from "@/components/AppLogo";
import { VideoPlayer } from "@/components/VideoPlayer";
import AIGenerateComponent from "@/components/AIGenerateComponent";
import {
  replaceQuestionText,
  replaceUserAnswer,
  formatQuestion,
} from "@/lib/pipe";

const QuestionComponent = ({
  practice,
  setPractice,
  selectedQuestions,
  setSelectedQuestions,
  user,
  clientData,
}: any) => {
  const fileBrowseRef = useRef(null);

  const router = useRouter();
  const queryParams = useSearchParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [displayedQuestions, setDisplayedQuestions] = useState<any[]>([]);
  const [paging, setPaing] = useState<any>({
    limit: 15,
  });
  const [tagText, setTagText] = useState<string>("");
  const [selectedMenuText, setSelectedMenuText] = useState<string>("All");
  const [activeMenuText, setActiveMenuText] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState<any>({});
  const [topics, setTopics] = useState<any[]>([]);
  const [filterTopics, setFilterTopics] = useState<any[]>([]);
  const [uploadingQuestion, setUploadingQuestion] = useState<boolean>(false);
  const [ishasFeedback, setIsHasFeedback] = useState<any[]>([]);
  const [searcbParams, setSearchParams] = useState<any>({
    searchText: "",
    category: "",
    isEasy: false,
    isModerate: false,
    isHard: false,
    subjects: [],
    units: [],
    topics: [],
    tags: [],
  });
  const [searching, setSearching] = useState<boolean>(false);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [sellectAll, setSelectAll] = useState<boolean>(false);
  // modalRef: BsModalRef;
  const [tags, setTags] = useState<any>([]);
  // uploadFileModalRef: BsModalRef;
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploadOptions, setUploadOptions] = useState<any>({
    isAllowReuse: "none",
    tags: [],
  });
  const [searchText, setSearchText] = useState<string>("");
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showReportIssue, setShowReportIssue] = useState<any[]>([]);
  const [answerExplainVideo, setAnswerExplainVideo] = useState<any>("");
  const [videoTemplate, setVideoTemplate] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<any>([]);
  const [qodSubjects, setQodSubjects] = useState<any>({});
  const [isShowAIModal, setIsShowAIModal] = useState<boolean>(false);

  useEffect(() => {
    subjectSvc.getByTest(practice._id).then((res: any) => {
      setSubjects(res.subjects);
    });
    reloadQuestions(true);

    // if (user.primaryInstitute?.preferences.general.questionOfDay) {
    //   questionSvc.getQuestionOfDaySubjects().then((sub: []) => {
    //     for (const s of sub) {
    //       setQodSubjects({
    //         ...qodSubjects,
    //         [s]: true
    //       })
    //     }
    //   })
    // }
  }, []);

  const toggleAnswer = (question: any) => {
    setShowAnswer((prevShowAnswer: any) => ({
      ...prevShowAnswer,
      [question._id]: !prevShowAnswer[question._id],
    }));
  };

  const search = () => {
    if (searchText) {
      const toCompare = searchText.toLowerCase();
      setSelectedMenuText("All");
      const temp_filterQuestion = questions?.filter((q) => {
        let found = false;
        if (q.questionText.toLowerCase().indexOf(toCompare) != -1) {
          found = true;
        } else if (q.tags && q.tags.length) {
          for (const tag of q.tags) {
            if (tag.indexOf(toCompare) != -1) {
              found = true;
              break;
            }
          }
        }
        return found;
      });
      setFilteredQuestions(temp_filterQuestion);
    } else {
      setSelectedMenuText("All");
      setFilteredQuestions(questions);
    }
    setLimit(15);
  };

  const reset = () => {
    setSearchText("");
    setFilteredQuestions(questions);
    setLimit(15);
  };

  const loadMore = () => {
    setLimit(paging.limit + 5);
  };

  const setLimit = (limit: number, filterQ?: any) => {
    setPaing({
      ...paging,
      limit: limit,
    });
    if (filterQ?.length > 0) {
      const temp = filterQ?.slice(0, limit);
      setDisplayedQuestions(temp);
    } else {
      const temp = filteredQuestions?.slice(0, limit);
      setDisplayedQuestions(temp);
    }
  };

  const deleteQuestion = async (ques: any) => {
    const isOk = await confirm(
      "Delete Question",
      "Are you sure you want to remove this question?"
    );
    if (isOk) {
      testSvc
        .removeQuestion(practice._id, ques._id)
        .then((res: any) => {
          success("Question is removed successfully");
          // remove question
          let idx = questions?.findIndex((q) => q._id == ques._id);
          if (idx > -1) {
            setQuestions((prevQuestions) => {
              const newQuestions = [...prevQuestions];
              newQuestions.splice(idx, 1);
              return newQuestions;
            });
          }
          // remove it from filteredQuestions also
          idx = filteredQuestions?.findIndex((q) => q._id == ques._id);
          if (idx > -1) {
            setFilteredQuestions((prevFilterdQuetions) => {
              const newFilterdQuestions = [...prevFilterdQuetions];
              newFilterdQuestions.splice(idx, 1);
              return newFilterdQuestions;
            });
          }
          const cachedLimit = paging.limit;
          setTimeout(() => {
            setLimit(cachedLimit);
          }, 300);

          if (practice && practice.questions) {
            idx = practice?.questions?.findIndex((q) => q.quesiton == ques._id);
            if (idx > -1) {
              const temp = practice.questions.splice(idx, 1);
              setPractice({
                ...practice,
                questions: temp,
                totalQuestion: practice.totalQuestion - 1,
              });
            }
          }

          // update order
          updateQuestionOrder(res);
        })
        .catch((err: any) => error("Fail to remove question."));
    }
  };

  const editQuestion = (ques: any) => {
    const idx = questions?.findIndex((q) => q._id == ques._id);
    let last = false;
    if (idx == questions.length - 1) {
      last = true;
    }

    router.push(
      `/question/create?questionId=${ques._id}&testId=${practice._id}&isEdit=edit&testMenu='question'&status=${practice.status}&marksAtTestLevel=${practice.isMarksLevel}&last=${last}&order=${ques.order}`
    );
  };

  const updateQuestionOrder = (orderMap: any) => {
    // update order
    questions?.map((q) => {
      if (orderMap[q._id]) {
        q.order = orderMap[q._id];
      }
    });

    if (practice && practice?.questions) {
      practice?.questions?.map((q) => {
        if (orderMap[q._id]) {
          q.order = orderMap[q._id];
        }
      });
    }
  };
  const reloadQuestions = (initializing = false) => {
    questionSvc
      .getQuestionByTest(practice._id)
      .then((res) => {
        const tempTopics = [...topics];
        const updateQ = [];

        res.forEach((q) => {
          const canEdit =
            q.user === user._id ||
            user.role === "admin" ||
            user.role === "publisher" ||
            (user.role === "director" && q.userRole !== "publisher") ||
            (((q.userRole === "publisher" &&
              user.primaryInstitute?.type === "publisher") ||
              q.userRole !== "publisher") &&
              ((practice.owner && practice.owner._id === user._id) ||
                !!practice.instructors.find((i) => i._id === user._id)) &&
              (q.isAllowReuse === "none" ||
                (q.practiceSets &&
                  q.practiceSets.filter((t) => t !== practice._id).length ===
                    0)));

          updateQ.push({ ...q, canRemove: practice?.canEdit, canEdit });

          if (!tempTopics.find((t) => t._id === q.topic._id)) {
            tempTopics.push({
              _id: q.topic._id,
              name: q.topic.name,
              unit: q.unit._id,
            });
          }
        });

        setQuestions(updateQ);
        setFilterTopics(tempTopics);
        setSearchText("");
        setFilteredQuestions(updateQ);
        setPractice({ ...practice, totalQuestion: res.length });

        if (initializing) {
          const qorder = Number(queryParams.get("order"));

          if (qorder) {
            const q = questions.find((q) => q.order === qorder);

            if (q) {
              const updatedQuestions = questions.map((question) => {
                if (question.order === qorder) {
                  return { ...question, isOpen: true };
                } else {
                  return question;
                }
              });

              setQuestions(updatedQuestions);

              setTimeout(() => {
                const elem = document.getElementById("header-" + q._id);
                if (elem) {
                  elem.scrollIntoView();
                }
              }, 1000);

              if (qorder <= questions.length && qorder > 15) {
                setLimit(15 + 5 * (Math.floor((qorder - 15) / 5) + 1), updateQ);
                return;
              }
            }
          }
        }
        feedbackSvc
          .getQuestionFeedbacks({
            practiceSet: practice._id,
            studentId: user._id,
            idOnly: true,
          })
          .then((qs) => {
            const updatedQuestions = updateQ.map((q) => {
              if (qs.includes(q._id)) {
                return { ...q, hasFeedback: true };
              } else {
                return q;
              }
            });
            setQuestions(updatedQuestions);
            setFilteredQuestions(updatedQuestions);
            setLimit(15, updatedQuestions);
          });
      })
      .catch((error) => {
        // Handle errors
        setLimit(15, updateQ);
        console.error("Error fetching questions:", error);
      });
  };

  const dragDropQuestion = async (ev: any) => {
    if (ev.currentIndex == ev.previousIndex) {
      return;
    }

    const newOrder = ev.currentIndex + 1;
    // if go up
    if (questions[ev.previousIndex].order > newOrder) {
      // increase the order number of all questions between new location and old location
      questions?.map((q) => {
        if (
          q._id !== ev.item.data._id &&
          q.order >= newOrder &&
          q.order < questions[ev.previousIndex].order
        ) {
          q.order++;
        }
      });
    } else {
      // if go down
      // decrease the order number of all questions between new location and old location
      questions?.map((q) => {
        if (
          q._id !== ev.item.data._id &&
          q.order <= newOrder &&
          q.order > questions[ev.previousIndex].order
        ) {
          q.order--;
        }
      });
    }

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[ev.previousIndex] = {
        ...updatedQuestions[ev.previousIndex],
        order: newOrder,
      };
      return updatedQuestions;
    });

    const questionSort = (q1: any, q2: any) => {
      if (q1.order < q2.order) {
        return -1;
      } else if (q1.order > q2.order) {
        return 1;
      } else {
        return 0;
      }
    };

    questions.sort(questionSort);

    filteredQuestions.sort(questionSort);

    displayedQuestions.sort(questionSort);

    await testSvc.updateQuestionOrder(
      practice._id,
      ev.item.data._id,
      ev.currentIndex + 1
    );
  };

  const sectionUpdate = async (question: any) => {
    const res = await testSvc.updateQuestionSection(
      practice._id,
      question._id,
      question.section
    );
    success("Question section is updated");
    if (res?.error) {
      error(res.error);
    } else {
      error("Fail to update question section");
    }
  };

  const tagUpdate = async (question: any) => {
    try {
      await questionSvc.updateTags([question._id], question.tags);
      success("Question tags is updated");
    } catch {
      error("Fail to update question tags");
    }
  };
  const removeTag = (question: any, tag: any) => {
    const tagidx = question?.tags?.indexOf(tag);
    if (tagidx > -1) {
      question?.tags?.splice(tagidx, 1);
    }
  };
  const cancelUpload = () => {
    setShowUploadModal(false);
    setUploadFile("");
    setUploadOptions({
      ...uploadOptions,
      isAllowReuse: "none",
    });
  };

  const addTag = (question: any, tag: any) => {
    const tagidx = question?.tags?.indexOf(tag);
    if (tagidx == -1) {
      question?.tags.push(tag);
    }
    setTagText("");
  };

  const track = (index: number, item: any) => {
    return item._id;
  };

  const selectQuestion = (question: any) => {
    if (selectedQuestions?.map[question._id]) {
      const updatedArray = selectedQuestions.array.filter(
        (a) => a._id !== question._id
      );
      const updatedMap = { ...selectedQuestions.map, [question._id]: false };
      setSelectedQuestions({ map: updatedMap, array: updatedArray });
      setSelectAll(false);
    } else {
      setSelectedQuestions({
        map: { ...selectedQuestions.map, [question._id]: true },
        array: [...selectedQuestions.array, question],
      });
    }
  };

  // const selectQuestion = (question) => {
  //   const { map, array } = selectedQuestions; // Destructure selectedQuestions
  //   if (map[question._id]) {
  //     // If the question is already selected, remove it
  //     const newArray = array.filter((id) => id !== question._id);
  //     setSelectedQuestions({ map: { ...map, [question._id]: false }, array: newArray });
  //     setSelectAll(false);
  //   } else {
  //     // If the question is not selected, add it
  //     const newArray = [...array, question._id];
  //     setSelectedQuestions({ map: { ...map, [question._id]: true }, array: newArray });
  //   }
  // };

  const sort = (sort: any) => {
    search();
    if (sort == "all") {
      setDisplayedQuestions(filteredQuestions);
      setLimit(15);
    }
    if (sort == "mcq") {
      const temp = filteredQuestions?.filter((e) => e.category == "mcq");
      setFilteredQuestions(temp);
      setLimit(15);
    }
    if (sort == "mixmatch") {
      const temp = filteredQuestions?.filter((e) => e.category == "mixmatch");
      setFilteredQuestions(temp);
      setLimit(15);
    }
    if (sort == "fib") {
      const temp = filteredQuestions?.filter((e) => e.category == "fib");
      setFilteredQuestions(temp);
      setLimit(15);
    }
    if (sort == "code") {
      const temp = filteredQuestions.filter((e) => e.category == "code");
      setFilteredQuestions(temp);
      setLimit(15);
    }
    if (sort == "descriptive") {
      const temp = filteredQuestions.filter((e) => e.category == "descriptive");
      setFilteredQuestions(temp);
      setLimit(15);
    }
    if (sort == "mixmatch") {
      const temp = filteredQuestions.filter((e) => e.category == "mixmatch");
      setFilteredQuestions(temp);
      setLimit(15);
    }
  };

  const createClassBoard = (question: any) => {
    questionSvc.createClassBoard(question._id).then((res: any) => {
      sessionStorage.setItem(
        "classboard_org",
        `/${user.role}/assessments/details/${practice._id}?menu=question&order=${question.order}`
      );
      router.push(`/classboard`, res.code);
    });
  };

  const generateQuestions = () => {
    if (!practice?.subjects?.length || !practice?.units?.length) {
      return alert(
        "Message",
        "Please set at least one subject and one unit for this assessment."
      );
    }
    setIsShowAIModal(true);
  };

  const onClose = (res: any) => {
    if (res) {
      reloadQuestions();
    }
  };

  const clearUnits = () => {
    setSearchParams({
      ...searcbParams,
      units: [],
    });
  };

  const onUnitsSelectionChanged = () => {
    setSearchParams({
      ...searcbParams,
      topics: [],
    });
    const temp_filterTopics = topics.filter((t) =>
      searchParams.units.find((u) => t.unit == u._id)
    );
    setFilterTopics(temp_filterTopics);
  };

  const resetFilter = () => {
    setSearchParams({
      subjects: [],
      units: [],
      topics: [],
      category: "",
      isEasy: false,
      isModerate: false,
      isHard: false,
      tags: [],
    });

    setFilteredQuestions(questions);
    setSelectedQuestions({ map: {}, array: [] });
    setSelectAll(false);
    setLimit(15, questions);
  };
  const openVideoExp = (question: any) => {
    setTimeout(() => {
      setAnswerExplainVideo(question.answerExplainVideo);

      setVideoTemplate(true);
    });
  };
  const filter = () => {
    let fQuestions = questions;
    // setSearchParams({
    //   ...searcbParams,
    //   tags: tags,
    // });

    if (searcbParams?.subjects?.length) {
      fQuestions = fQuestions.filter((q) =>
        searcbParams.subjects.some((s) => s._id === q.subject._id)
      );
    }

    if (searcbParams?.units?.length) {
      fQuestions = fQuestions.filter((q) =>
        searcbParams.units.some((s) => s._id === q.unit._id)
      );
    }

    if (searcbParams?.topics?.length) {
      fQuestions = fQuestions.filter((q) =>
        searcbParams.topics.some((s) => s._id === q.topic._id)
      );
    }

    if (searcbParams?.category) {
      fQuestions = fQuestions.filter(
        (q) => q.category === searcbParams.category
      );
    }

    if (searcbParams?.tags?.length) {
      fQuestions = fQuestions.filter(
        (q) => q && q.tags.some((t1) => searcbParams.tags.includes(t1))
      );
    }

    if (
      searcbParams?.isEasy ||
      searcbParams?.isModerate ||
      searcbParams?.isHard
    ) {
      fQuestions = fQuestions.filter(
        (q) =>
          (q.complexity === "easy" && searcbParams.isEasy) ||
          (q.complexity === "moderate" && searcbParams.isModerate) ||
          (q.complexity === "hard" && searcbParams.isHard)
      );
    }

    if (searcbParams.text) {
      fQuestions = fQuestions.filter(
        (q) =>
          q.questionText
            .toLowerCase()
            .indexOf(searcbParams.text.toLowerCase()) > -1 ||
          (q.questionHeader &&
            q.questionHeader
              .toLowerCase()
              .indexOf(searcbParams.text.toLowerCase()) > -1)
      );
    }

    setFilteredQuestions(fQuestions);
    setLimit(15, fQuestions);
  };

  const selectAllChanged = () => {
    setSelectAll(!sellectAll);
    const temp = !sellectAll;
    if (temp) {
      filteredQuestions?.forEach((question) => {
        if (!selectedQuestions.map[question._id]) {
          setSelectedQuestions((prevSelectedQuestions) => ({
            map: { ...prevSelectedQuestions.map, [question._id]: true },
            array: [...prevSelectedQuestions.array, question],
          }));
        }
      });
    } else {
      setSelectedQuestions({ map: {}, array: [] });
    }
  };

  // const selectAllChanged = () => {
  //   const { map, array } = selectedQuestions; // Destructure selectedQuestions
  //   setSelectAll(!sellectAll)
  //   if (sellectAll) {
  //     // Iterate over filteredQuestions and add them to the map
  //     for (const question of filteredQuestions) {
  //       map[question] = true; // Use question as the key in the map
  //     }
  //     // Convert the map keys to an array and update selectedQuestions
  //     setSelectedQuestions({ map, array: Object.keys(map) });
  //   } else {
  //     // Clear both map and array
  //     setSelectedQuestions({ map: {}, array: [] });
  //   }
  // };

  // openModal(template: TemplateRef<any>, id) {
  //   this.modalRef = this.modalSvc.show(template, {
  //     id: id,
  //     ignoreBackdropClick: false,
  //     keyboard: false
  //   });
  // }
  const openModal = (id?: any) => {
    setShowTagModal(true);
  };

  // closeModal() {
  //   this.tags = []
  //   this.modalRef.hide()
  // }
  const closeModal = () => {
    setShowTagModal(false);
  };

  const applyTags = async () => {
    const res = await questionSvc.updateTags(
      selectedQuestions?.array?.map((s) => s._id),
      tags,
      null,
      "add"
    );

    if (res?.data.result) {
      success("Tags are added to selected questions.");

      selectedQuestions?.array?.map((q) => {
        tags?.map((tag) => {
          if (q.tags.indexOf(tag) === -1) {
            q.tags.push(tag);
          }
        });
      });

      setSelectedQuestions({ map: {}, array: [] });
      setSelectAll(false);
    }
    setShowTagModal(false);
  };

  const reportIssue = (index: any) => {
    setShowReportIssue({
      ...showReportIssue,
      [index]: true,
    });

    // const mdref = this.modalSvc.show(QuestionFeedbackComponent, {
    //   ignoreBackdropClick: true,
    //   keyboard: false,
    //   initialState: {
    //     practiceId: this.practice._id,
    //     questionId: q._id,
    //     userId: this.authService.userId
    //   }
    // })
    // mdref.content.onClose.subscribe(result => {
    //   if (result) {
    //     q.hasFeedback = true
    //   }
    // })
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const uploadModal = () => {
    setShowUploadModal(true);
  };

  // closeUploadModal() {
  //   this.uploadFileModalRef.hide();
  //   this.uploadOptions.tags = [];
  //   this.uploadOptions.isAllowReuse = 'none'
  //   this.uploadFile = null;
  // }
  const closeUploadModal = () => {};

  const uploadQuestions = (file: any) => {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("testId", practice._id);
    formData.append("QB", "false");
    formData.append("isAllowReuse", uploadOptions.isAllowReuse);

    if (uploadOptions.tags && uploadOptions.tags.length) {
      formData.append("tags", uploadOptions.tags.join(","));
    }

    setUploadingQuestion(true);

    testSvc
      .importFunc(formData)
      .then((data) => {
        setShowUploadModal(false);
        reloadQuestions();
        setUploadingQuestion(false);
      })
      .catch((err) => {
        if (err.error && err.error.errors) {
          alert(
            "Fail to upload questions",
            err.error.errors.map((e) => e.message).join("<br/>")
          );
        } else {
          alert("Message", "Fail to upload questions");
        }
        setUploadingQuestion(false);
      });
  };

  const toggleQuestionVisibility = (questionId) => {
    // Find the index of the question in the displayedQuestions array
    const questionIndex = displayedQuestions.findIndex(
      (question) => question._id === questionId
    );

    if (questionIndex !== -1) {
      // Create a copy of the question object
      const updatedQuestion = { ...displayedQuestions[questionIndex] };

      // Toggle the 'isOpen' property
      updatedQuestion.isOpen = !updatedQuestion.isOpen;

      // Create a copy of the displayedQuestions array and update the question at the found index
      const updatedQuestions = [...displayedQuestions];
      updatedQuestions[questionIndex] = updatedQuestion;

      // Update the state with the updated array of questions
      setDisplayedQuestions(updatedQuestions);
    }
  };

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  return (
    <>
      {practice.status == "draft" && practice.canEdit && (
        <div className="assess-btns">
          <div className="row Ques-bankCoPitemP my-4">
            <div className="col-lg-5">
              <div className="dashed-border-box assesm h-lg-100">
                <div>
                  <span className="helper-text">
                    <p className="assess-help">Create Question from scratch</p>
                  </span>
                  <div className="btn-spn text-right mt-2">
                    {user.primaryInstitute?.canUseAI && (
                      <button
                        className="btn btn-primary mr-2"
                        onClick={generateQuestions}
                      >
                        Generate Questions
                      </button>
                    )}

                    <Link
                      className="btn btn-primary"
                      href={`/question/create?testId=${
                        practice._id
                      }&marksAtTestLevel=${
                        practice.isMarksLevel
                      }&last=true&isNew=${true}`}
                    >
                      Create Question
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="dashed-border-box assesm h-lg-100">
                <div>
                  <span className="helper-text">
                    <p className="assess-help">
                      Import Questions From the Question Bank
                    </p>
                  </span>
                  <div className="btn-spn text-right mt-2">
                    <Link
                      className="btn btn-primary"
                      href={`/question/import/${practice._id}`}
                    >
                      Import Question
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="dashed-border-box assesm h-lg-100">
                <div>
                  <span className="helper-text2">
                    <p className="assess-help">
                      You can upload questions from the given template
                    </p>
                  </span>
                  <div className="form-row justify-content-end mt-2">
                    <div className="col-auto">
                      <div className="watch mb-2">
                        <button
                          className="btn btn-outline"
                          onClick={() => uploadModal()}
                        >
                          Upload Question
                        </button>
                      </div>
                    </div>
                    <div className="col-auto">
                      <a
                        className="btn btn-outline mr-2"
                        href="/assets/media/Question-Upload-Template.xlsx"
                        target="_blank"
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <img
                            className="tem-svg"
                            src="/assets/images/assessment-excel.svg"
                            alt=""
                          />
                          &nbsp;
                        </div>
                      </a>
                      <a
                        className="btn btn-outline"
                        href="/assets/media/Question-Upload-Template.docx"
                        target="_blank"
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <img
                            className="tem-svg"
                            src="/assets/images/assessment-word.svg"
                            alt=""
                          />
                          &nbsp;
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-boxes mt-3 p-3 text-black multiselect_controlled cheng-multiselect_controlled form-boxes">
        <h3 className="form-box_title text_secondary">
          <strong>Filter Questions</strong>
        </h3>
        <div className="row mt-2">
          <div className="col-md-4">
            <div className="form-group border-bottom">
              <h4 className="form-box_subtitle">Subject</h4>

              <Multiselect
                options={practice.subjects}
                selectedValues={searcbParams.subjects}
                onSelect={(e) =>
                  setSearchParams({ ...searcbParams, subjects: e })
                }
                onRemove={(e) =>
                  setSearchParams({ ...searcbParams, subjects: e })
                }
                displayValue="name"
                placeholder="Select one or more subjects"
                // style={styleForMultiSelect}
                showCheckbox={true}
                showArrow={true}
                closeIcon="cancel"
                avoidHighlightFirstOption={true}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group border-bottom">
              <h4 className="form-box_subtitle">Unit</h4>

              <Multiselect
                options={practice.units}
                selectedValues={searcbParams.units}
                onSelect={(e) => setSearchParams({ ...searcbParams, units: e })}
                onRemove={(e) => setSearchParams({ ...searcbParams, units: e })}
                displayValue="name"
                placeholder="Select one or more units"
                // style={styleForMultiSelect}
                showCheckbox={true}
                showArrow={true}
                closeIcon="cancel"
                avoidHighlightFirstOption={true}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group border-bottom">
              <h4 className="form-box_subtitle">Topic</h4>

              <Multiselect
                options={filterTopics}
                selectedValues={searcbParams.topics}
                onSelect={(e) =>
                  setSearchParams({ ...searcbParams, topics: e })
                }
                onRemove={(e) =>
                  setSearchParams({ ...searcbParams, topics: e })
                }
                displayValue="name"
                placeholder="Select one or more topics"
                // style={styleForMultiSelect}
                showCheckbox={true}
                showArrow={true}
                closeIcon="cancel"
                avoidHighlightFirstOption={true}
              />
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-4">
            <div className="form-group">
              <h4 className="form-box_subtitle">Difficulty</h4>
              <div className="mt-2">
                <label className="container2 d-inline">
                  Easy
                  <input
                    type="checkbox"
                    name="isEasy"
                    checked={searcbParams.isEasy}
                    onChange={() =>
                      setSearchParams({
                        ...searcbParams,
                        isEasy: !searcbParams.isEasy,
                      })
                    }
                  />
                  <span className="checkmark1 translate-middle-y"></span>
                </label>
                <label className="container2 d-inline ml-4">
                  Medium
                  <input
                    type="checkbox"
                    name="isModerate"
                    checked={searcbParams.isModerate}
                    onChange={() =>
                      setSearchParams({
                        ...searcbParams,
                        isModerate: !searcbParams.isModerate,
                      })
                    }
                  />
                  <span className="checkmark1 translate-middle-y"></span>
                </label>
                <label className="container2 d-inline ml-4">
                  Hard
                  <input
                    type="checkbox"
                    name="isHard"
                    checked={searcbParams.isHard}
                    onChange={() =>
                      setSearchParams({
                        ...searcbParams,
                        isHard: !searcbParams.isHard,
                      })
                    }
                  />
                  <span className="checkmark1 translate-middle-y"></span>
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group border-bottom">
              <h4 className="form-box_subtitle">Question Type</h4>
              <div>
                <select
                  className="form-control border-0"
                  name="subject"
                  value={searcbParams.category}
                  onChange={(e) =>
                    setSearchParams({
                      ...searcbParams,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  <option value="mcq">Multiple choices</option>
                  <option value="fib">Fill in the blanks</option>
                  {clientData?.features.coding && (
                    <option value="code">Coding</option>
                  )}
                  <option value="descriptive">Descriptive</option>
                  <option value="mixmatch">Mismatch</option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <h4 className="form-box_subtitle">Question Tags</h4>
            {/* <div className="color-tags new-color-tags"> */}
            <TagsInput
              //@ts-ignore
              value={searcbParams.tags}
              //@ts-ignore
              onChange={(e) => setSearchParams({ ...searcbParams, tags: e })}
              name="tags"
              placeHolder="+ Enter a new tag"
              separators={[" "]}
            />
            {/* </div> */}
          </div>
        </div>
        <div className="d-flex justify-content-end mt-2 gap-xs">
          <div className="flex-grow-1">
            <input
              value={searcbParams.text}
              onChange={(e) =>
                setSearchParams({
                  ...searcbParams,
                  text: e.target.value,
                })
              }
              className="form-control border-bottom"
              placeholder="Question text"
              name="txtText"
            />
          </div>
          <button
            className="btn btn-light border-dark"
            onClick={resetFilter}
            disabled={searching}
          >
            <i className="fas fa-redo-alt"></i>
            Reset
          </button>

          <button
            className="btn btn-primary"
            onClick={() => filter()}
            disabled={searching}
          >
            Filter
          </button>
        </div>
      </div>
      <div className="rounded-boxes bg-white d-flex align-items-center justify-content-between">
        <div>
          <label className="container2 d-flex align-items-center mb-0">
            <input
              type="checkbox"
              name="selectAll"
              checked={sellectAll}
              onChange={() => selectAllChanged()}
              disabled={!filteredQuestions?.length}
            />
            <span className="checkmark1 translate-middle-y filter-out"></span>
            <span className="text_secondary ml-2">
              <strong>
                {sellectAll
                  ? `${filteredQuestions?.length}/${filteredQuestions?.length}`
                  : `${selectedQuestions?.array?.length}/${filteredQuestions?.length}`}
              </strong>
            </span>
            <span>&nbsp;&nbsp;Questions Selected</span>
          </label>
        </div>
        <div>
          <button
            className="btn btn-secondary"
            disabled={!selectedQuestions?.array?.length}
            onClick={() => {
              openModal();
            }}
          >
            Add Tag
          </button>
        </div>
      </div>
      <div
        className="empty-data emptyPageteMplaTe"
        style={{ display: !filteredQuestions.length ? "block" : "none" }}
      >
        <figure className="m-0 w-auto">
          <img src="/assets/images/QuestionIllustraions.svg" alt="" />
        </figure>
        {/* <p className="bold mb-2">No Question Available</p> */}
      </div>

      <div
        className="eval ques-t AllQuesDeT gVn-Ans_onLy ml-0"
        style={{
          marginLeft: "0 !important",
          display: filteredQuestions.length > 0 ? "block" : "none",
        }}
      >
        <div>
          {displayedQuestions.map((question, index) => (
            <div
              key={index}
              className="panel pt-1 pb-3 mb-3 bg-white rounded question-answer-list_number"
            >
              <div className="pl-2 " id={`header-${question._id}`}>
                {practice.status == "draft" && (
                  <div className="text-center cursor-pointer">
                    <span className="material-icons rotate-90">
                      drag_indicator
                    </span>
                  </div>
                )}

                <div className="form-row flex-nowrap  ">
                  <div className="col-auto">
                    <label className="container2 my-0 pt-1 bold">
                      # {question.order}
                      <input
                        type="checkbox"
                        name={`cls_${question._id}`}
                        checked={
                          selectedQuestions.map.hasOwnProperty(question._id)
                            ? selectedQuestions.map[question._id]
                            : false
                        }
                        onChange={() => selectQuestion(question)}
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>
                  </div>

                  <div className="col align-self-center">
                    <div
                      className={`ques mathjax-over-initial ${
                        question.canEdit
                          ? "question-text-header"
                          : "question-text-header-readOnly"
                      } d-none d-md-block`}
                    >
                      {question.category !== "fib" ? (
                        <MathJax value={question.questionText} />
                      ) : (
                        <MathJax
                          value={replaceQuestionText(
                            question,
                            true,
                            !showAnswer[question._id]
                          )}
                        ></MathJax>
                      )}
                    </div>
                  </div>

                  <div className="col-auto">
                    <a
                      className="text-danger mx-2"
                      data-toggle="tooltip"
                      title="Report this question"
                      onClick={() => reportIssue(index)}
                    >
                      <i
                        className={`fa-flag ${
                          question.hasFeedback || ishasFeedback[index]
                            ? "fas"
                            : "far"
                        }`}
                      ></i>
                    </a>
                    <QuestionFeedback
                      reloadQuestions={reloadQuestions}
                      show={showReportIssue[index]}
                      practiceId={practice._id}
                      teacherId={practice.user._id}
                      attemptId={question.attemptId}
                      questionId={question._id}
                      userId={user._id}
                      onClose={() =>
                        setShowReportIssue({
                          ...showReportIssue,
                          [index]: false,
                        })
                      }
                      setIsHasFeedback={setIsHasFeedback}
                      ishasFeedback={ishasFeedback}
                      index={index}
                    />
                    {clientData?.features.classboard &&
                      user.primaryInstitute?.preferences?.classboard &&
                      (question.category === "mcq" ||
                        question.category === "code") && (
                        <a
                          className="text-primary mx-2"
                          data-toggle="tooltip"
                          title="Open Class Board"
                          onClick={() => createClassBoard(question)}
                        >
                          <i className="fa fa-share f-16"></i>
                        </a>
                      )}

                    <Link
                      href={`/assessment/review/${practice._id}?testId=${practice._id}&questionId=${question._id}&page=test&menu=question`}
                    >
                      <span
                        className="text-primary mx-2"
                        data-toggle="tooltip"
                        title="view"
                      >
                        <i className="fab fa-readme f-16"></i>
                      </span>
                    </Link>

                    {question.canEdit && (
                      <a
                        className="text-primary mx-2"
                        data-toggle="tooltip"
                        title="Edit"
                        onClick={() => editQuestion(question)}
                      >
                        <i className="fas fa-pencil-alt f-16"></i>
                      </a>
                    )}

                    {practice.status === "draft" && practice.canEdit && (
                      <a
                        className="text-danger mx-2"
                        onClick={() => deleteQuestion(question)}
                        data-toggle="tooltip"
                        title="Delete"
                      >
                        <i className="fa fa-trash f-16"></i>
                      </a>
                    )}
                  </div>
                  <div className="ques mathjax-over-initial d-block d-md-none mt-2">
                    {question.category !== "fib" ? (
                      <MathJax value={question.questionText} />
                    ) : (
                      <MathJax value={question.questionText} />
                    )}
                  </div>

                  <div
                    className="col-auto pr-4"
                    onClick={() => toggleQuestionVisibility(question._id)}
                  >
                    <i
                      className={`fas f-20 ${
                        question.isOpen ? "fa-angle-up" : "fa-angle-down"
                      }`}
                    ></i>
                  </div>
                </div>
              </div>
              <div>
                {question.isOpen && (
                  <div className="selection-wrap p-0 bg-white">
                    <div className="given-answer ml-0">
                      <hr />
                      <div className="form-row">
                        <div className="col-lg-3 col-md-6 col">
                          <h6 className="topic_type_title">Subject</h6>
                          <span className="topic_below_info">
                            {question.subject.name}
                          </span>
                        </div>
                        <div className="col-lg-3 col-md-6 col">
                          <h6 className="topic_type_title">Unit</h6>
                          <span className="topic_below_info">
                            {question.unit.name}
                          </span>
                        </div>
                        <div className="col-lg-3 col-md-6 col">
                          <h6 className="topic_type_title">Topic</h6>
                          <span className="topic_below_info">
                            {question.topic.name}
                          </span>
                        </div>
                        {practice.enableSection && (
                          <div className="col-lg-3 col-md-6 col">
                            <h6 className="topic_type_title">Section</h6>
                            {practice.canEdit ? (
                              <select
                                className="form-control form-control-sm border-top-0 border-left-0 border-right-0 pl-0 rounded-0 mw-100 my-0"
                                name="qSection"
                                value={question.section}
                                onChange={(e) => sectionUpdate(question)}
                              >
                                <option value="" disabled>
                                  Select Section
                                </option>
                                {practice.sections.map((section) => (
                                  <option
                                    key={section.name}
                                    value={section.name}
                                    disabled={section.isBreakTime}
                                  >
                                    {section.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="topic_below_info">
                                {question.section}
                              </span>
                            )}
                          </div>
                        )}
                        {!practice.enableSection && !practice.isMarksLevel && (
                          <div className="col-lg-3 col-md-6 col">
                            <h6 className="topic_type_title">Marks</h6>
                            <span className="topic_below_info mark-p text-white ml-0 d-inline-block">
                              +{question.plusMark}
                            </span>
                            <span className="topic_below_info mark-n text-white">
                              {question.minusMark}
                            </span>
                          </div>
                        )}
                      </div>
                      <br></br>
                      <div className="form-row">
                        <div className="col-lg-3 col-md-6 col">
                          <h6 className="topic_type_title">Difficulty</h6>
                          <span className="topic_below_info">
                            {question.complexity}
                          </span>
                        </div>
                        <div className="col-lg-3 col-md-6 col">
                          {question.category === "mcq" && (
                            <div>
                              <h6 className="topic_type_title">
                                Correct Answer Type
                              </h6>
                              <span className="topic_below_info">
                                {question.questionType}
                              </span>
                            </div>
                          )}
                          {question.category === "code" && (
                            <div>
                              <h6 className="topic_type_title">
                                Test Case Count
                              </h6>
                              <span className="topic_below_info">
                                {question.testcases.length}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="col-lg-3 col-md-6 col">
                          {question.category === "mcq" && (
                            <div>
                              <h6 className="topic_type_title">
                                Number of Options
                              </h6>
                              <span className="topic_below_info">
                                {question.answers.length}
                              </span>
                            </div>
                          )}
                        </div>
                        {practice.enableSection && !practice.isMarksLevel && (
                          <div className="col-lg-3 col-md-6 col">
                            <h6 className="topic_type_title">Marks</h6>
                            <span className="topic_below_info mark-p text-white ml-0 d-inline-block">
                              +{question.plusMark}
                            </span>
                            <span className="topic_below_info mark-n text-white">
                              {question.minusMark}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <hr></hr>

                    <div className="given-answer ml-0">
                      {question.isAllowReuse !== "none" && (
                        <div className="mb-2">
                          <h6 className="topic_type_title">Question Pool</h6>
                          <span>
                            {question.isAllowReuse.charAt(0).toUpperCase() +
                              question.isAllowReuse.slice(1)}
                          </span>
                        </div>
                      )}
                      {question.userRole != "publisher" ||
                        user.role == "publisher" ||
                        (user.primaryInstitute?.type == "publisher" && (
                          <h6 className="topic_type_title mb-0">
                            Question Tag
                            {!question?.tagEdit && (
                              <a
                                onClick={() => (question.tagEdit = true)}
                                className="ml-1"
                              >
                                <i className="fas fa-pen"></i>
                              </a>
                            )}
                            {question?.tagEdit && (
                              <a
                                onClick={() => {
                                  tagUpdate(question);
                                  question.tagEdit = false;
                                }}
                                className="ml-1"
                              >
                                <i className="fas fa-save"></i>
                              </a>
                            )}
                          </h6>
                        ))}

                      <div className="question-tags mt-2">
                        {!question?.tagEdit &&
                          (question.userRole !== "publisher" ||
                            user.role === "publisher" ||
                            user.primaryInstitute?.type === "publisher") &&
                          question.tags.map((tag, index) => (
                            <span key={index} className="tags">
                              {tag}
                            </span>
                          ))}
                      </div>
                      {question?.tagEdit && (
                        <TagsInput
                          //@ts-ignore
                          value={question.tags}
                          //@ts-ignore
                          onChange={setQuestion}
                          name="Tag"
                          placeHolder="+ Add Tag"
                          separators={[" "]}
                        />
                      )}
                    </div>
                    <hr></hr>
                    {question.questionHeader && (
                      <div className="given-answer ml-0">
                        <h6>Instruction</h6>
                        <span className="text-dark">
                          <MathJax value={question.questionHeader}></MathJax>
                        </span>
                      </div>
                    )}
                    {question?.questionHeader && <hr></hr>}
                    <div className="given-answer ml-0">
                      <h6 className="topic_type_treplaceQuestionTextitle mb-0">
                        Question
                        {question.category !== "descriptive" && (
                          <a
                            className="ml-2"
                            onClick={() => toggleAnswer(question)}
                          >
                            <i
                              className={`far ${
                                showAnswer[question._id]
                                  ? "fa-eye"
                                  : "fa-eye-slash"
                              }`}
                            ></i>
                          </a>
                        )}
                      </h6>
                      {question.category != "fib" && (
                        <span>
                          <MathJax value={question?.questionText}></MathJax>
                        </span>
                      )}
                      {question.category == "fib" && (
                        <span>
                          <MathJax
                            value={replaceQuestionText(
                              question,
                              true,
                              !showAnswer[question._id]
                            )}
                          ></MathJax>

                          {/* <MathJax
                            value={replaceQuestionText(
                              question?.questionText,
                              question,
                              
                            )}
                          /> */}

                          {/* <mathjax-renderer [content]="question.questionText | replaceQuestionText:question:true:!showAnswer[question._id]">
                        </mathjax-renderer> */}
                        </span>
                      )}
                      {question.audioFiles?.length > 0 && (
                        <div className="row mt-2">
                          {question.audioFiles?.map((audio, index) => (
                            <div className="col-6" key={index}>
                              <label>{audio.name}</label>
                              <audio
                                controls
                                src={audio.url}
                                className="w-100"
                              ></audio>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="given-answer ml-0">
                      {question.category === "mcq" && (
                        <div>
                          <hr />
                          {question.answers.map((ans, i) => (
                            <h6 key={i}>
                              <strong className="ansoption_hed OnLyOpt-ion">
                                Answer Option {i + 1}
                              </strong>
                              {ans.isCorrectAnswer &&
                                showAnswer[question._id] && (
                                  <span className="ml-2 corrctopTiOn-TaG">
                                    (Correct Option)✓
                                  </span>
                                )}
                              <span className="assess-ques AnswRtEx-T">
                                <MathJax value={ans.answerText}></MathJax>
                              </span>
                              {ans.audioFiles?.length > 0 && (
                                <div className="row">
                                  {ans.audioFiles.map((audio, index) => (
                                    <div
                                      key={index}
                                      className="position-relative my-2 col-lg-6 col-12"
                                    >
                                      <label>{audio.name}</label>
                                      <audio
                                        controls
                                        src={audio.url}
                                        className="w-100"
                                      ></audio>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </h6>
                          ))}
                        </div>
                      )}

                      {question.category === "code" && (
                        <div>
                          <hr />
                          {question.hasArg && question.argumentDescription && (
                            <div className="mb-3">
                              <h6>Arguments</h6>
                              <span className="codeArgDescriptIon">
                                {question.argumentDescription}
                              </span>
                            </div>
                          )}
                          {question.hasUserInput &&
                            question.userInputDescription && (
                              <div className="mb-3">
                                <h6 className="topic_type_title mb-0">Input</h6>
                                <span className="codeArgDescriptIon">
                                  {question.userInputDescription}
                                </span>
                              </div>
                            )}
                          <h6>Test Cases</h6>
                          <div className="row no-gutters testcase-header">
                            {question.hasArg ||
                              (question.hasUserInput && (
                                <div className="col">
                                  <div className="row">
                                    <div className="col">
                                      {question.hasArg && (
                                        <h6 className="mx-3">Arguments</h6>
                                      )}
                                    </div>
                                    <div className="col">
                                      {question.hasUserInput && (
                                        <h6 className="mx-3">Input</h6>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            <div className="col">
                              <h6 className="mx-3">Expected Output</h6>
                            </div>
                            <div className="col-auto">
                              <div style={{ width: "120px" }}></div>
                            </div>
                          </div>
                          <div className="testcase-table">
                            {question.testcases.map((testcase, index) => (
                              <div key={index} className="mt-3">
                                <div className="row">
                                  {question.hasArg ||
                                    (question.hasUserInput && (
                                      <div className="col">
                                        <div className="row">
                                          {question.hasArg && (
                                            <div className="col pre-wrap mx-3 my-2">
                                              {testcase.args}
                                            </div>
                                          )}
                                          {question.hasUserInput && (
                                            <div className="col pre-wrap mx-3 my-2">
                                              {testcase.input}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}

                                  <div className="col pre-wrap mx-3 my-2">
                                    {testcase.output}
                                  </div>
                                  <div className="col-auto my-2">
                                    <div style={{ width: "90px" }}>
                                      {testcase.isSample && (
                                        <em className="text-primary">Sample</em>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <Tabs>
                              {question.coding.map((code, index) => (
                                <Tab
                                  key={index}
                                  eventKey={code.language}
                                  title={code.language}
                                >
                                  <h6 className="topic_type_title my-1">
                                    Constraints
                                  </h6>
                                  <div className="row text-dark">
                                    <div className="col">
                                      <span>Time Limit: </span>
                                      <strong>{code.timeLimit || 0}</strong>
                                      seconds
                                    </div>
                                    <div className="col">
                                      <span>Memory Limit: </span>
                                      <strong>{code.memLimit || 0}</strong>MB
                                    </div>
                                  </div>
                                  <h6 className="topic_type_title mt-3">
                                    Template
                                  </h6>
                                  <CodeRenderer
                                    code={code.template}
                                    language={code.template}
                                  />
                                  {/* <code-renderer code={code.template} language={code.template}></code-renderer> */}
                                  {showAnswer[question._id] && (
                                    <div>
                                      <h6 className="topic_type_title mb-0">
                                        Solution
                                      </h6>
                                      <CodeRenderer
                                        code={code.solution}
                                        language={code.language}
                                      />
                                      {/* <code-renderer code={code.solution} language={code.language}></code-renderer> */}
                                    </div>
                                  )}
                                </Tab>
                              ))}
                            </Tabs>
                          </div>
                        </div>
                      )}

                      {question.category === "mixmatch" && (
                        <div>
                          <hr />
                          <div className="adaptive-question-box adaptive-question-ans overflow-hidden">
                            <div className="mix-match row">
                              <div className="col-5 mix-match-content">
                                <div className="mix-match-drag">
                                  {question?.answers?.map((ans, index) => (
                                    <span key={index}>
                                      <MathJax value={ans.answerText}></MathJax>
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="col-5 ml-auto">
                                <div className="mix-match-content w-100">
                                  <div className="mix-match-dragd">
                                    {question?.answers?.map((ans, index) => (
                                      <span
                                        key={index}
                                        hidden={!showAnswer[question._id]}
                                      >
                                        <MathJax
                                          value={ans.correctMatch}
                                        ></MathJax>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <hr></hr>
                    <div
                      className="given-answer pb-2 ml-0"
                      style={{
                        display: showAnswer[question._id] ? "block" : "none",
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <h6 className="topic_type_title mb-0">
                          Answer Explanation
                        </h6>
                        {question.answerExplain &&
                          question.answerExplainVideo && (
                            <button
                              className="btn btn-outline"
                              onClick={() => openVideoExp(question)}
                            >
                              Video Explanation
                            </button>
                          )}
                      </div>

                      {!question.answerExplain && (
                        <>
                          {!question.answerExplainVideo && (
                            <span className="topic_below_info">
                              No answer explanation
                            </span>
                          )}
                          {question.answerExplainVideo && (
                            <ReactPlayer
                              url={question.answerExplainVideo}
                              height={400}
                              width="100%"
                              controls
                            />
                          )}
                        </>
                      )}
                      {question.answerExplain && (
                        <span className="topic_below_info">
                          <MathJax value={question.answerExplain}></MathJax>
                        </span>
                      )}
                      {question.answerExplainAudioFiles?.length > 0 && (
                        <div className="row">
                          {question.answerExplainAudioFiles.map(
                            (audio, index) => (
                              <div
                                key={index}
                                className="position-relative my-2 col-lg-6 col-12"
                              >
                                <label>{audio.name}</label>
                                <audio
                                  controls
                                  src={audio.url}
                                  className="w-100"
                                ></audio>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {paging.limit < filteredQuestions.length && (
          <div className="text-center">
            <a className="btn btn-light" onClick={loadMore}>
              {" "}
              Load More
            </a>
          </div>
        )}
      </div>
      <Modal
        show={showTagModal}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        className=""
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h2 className="form-box_title mb-0 text-center">Add Tag</h2>
          </div>
          <div className="modal-body">
            <span>
              This will add a new tag to all{" "}
              <b>{selectedQuestions?.array?.length}</b> questions
            </span>
            <div className="color-tags new-specialization-input">
              <TagsInput
                //@ts-ignore
                value={tags}
                //@ts-ignore
                onChange={setTags}
                name="specialization"
                placeHolder="+ Add Question Tag"
                separators={[" "]}
              />
            </div>

            <div className="text-right mt-2">
              <button className="btn btn-light mr-2" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={applyTags}>
                Add
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        backdrop="static"
        keyboard={false}
        className=""
      >
        <div className="modal-content assess-modal-all modal-uploadAss-1 form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h2 className="form-box_title mb-0 text-center">
              Upload question file to this assessment
            </h2>
          </div>
          <div className="modal-body">
            <div className="classroom-create-modal">
              <div className="class-board-info form-boxes">
                <form onSubmit={() => uploadQuestions(uploadFile)}>
                  <div className="camera-sec-box">
                    <h4 className="form-box_subtitle mb-0">
                      Browse question file
                    </h4>
                    <div className="standard-upload-box mt-2">
                      <FileDrop onDrop={(f: any) => dropped(f)}>
                        <h2 className="upload_icon mb-0">
                          <span className="material-icons">file_copy</span>
                        </h2>
                        <p className="pro-text-drug text-center d-block active text-primary">
                          {uploadFile?.name}
                        </p>
                        <span className="title">
                          Drag and Drop or{" "}
                          <a
                            onClick={openFileSelector}
                            className="text-primary"
                          >
                            {" "}
                            browse{" "}
                          </a>{" "}
                          your file
                        </span>
                        <p className="text-dark">
                          Supported format:{" "}
                          <span className="text-danger">
                            .xls,.xlsx,.gzip,.zip,.docx
                          </span>
                        </p>
                        <div className="d-flex justify-content-center gap-xs mb-2">
                          {!uploadFile && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                openFileSelector();
                              }}
                            >
                              Browse
                            </button>
                          )}
                        </div>
                        <input
                          accept=".xls,.xlsx,.gzip,.zip,.docx"
                          value=""
                          style={{ display: "none", opacity: 0 }}
                          ref={fileBrowseRef}
                          type="file"
                          onChange={(e) => dropped(e.target.files)}
                        />
                      </FileDrop>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="form-box_subtitle mb-0">Question Tags</h4>
                    <div className="color-tags new-specialization-input">
                      <TagsInput
                        //@ts-ignore
                        value={uploadOptions?.tags}
                        //@ts-ignore
                        onChange={(e) =>
                          setUploadOptions({
                            ...uploadOptions,
                            tags: e,
                          })
                        }
                        name="tag"
                        placeHolder="+ Add Question Tag"
                        separators={[" "]}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="form-box_subtitle mb-0">Question Bank</h4>
                    <h6 className="f-12 sub-info custom ml-0">
                      Add questions in question bank
                    </h6>

                    <div className="row align-items-center container1 m-0 mr-2 float-none">
                      <div className="radio mt-1">
                        <input
                          type="radio"
                          value="none"
                          checked={uploadOptions.isAllowReuse === "none"}
                          onChange={() =>
                            setUploadOptions({
                              ...uploadOptions,
                              isAllowReuse: "none",
                            })
                          }
                          name="qbank"
                          id="none"
                        />
                        <label htmlFor="none" className="my-0"></label>
                      </div>
                      <div className="upload-right radio-all ml-1">None</div>
                    </div>
                    <p className="assess-help mt-1">
                      (Questions will not be added to question bank)
                    </p>

                    {(user.role === "publisher" ||
                      user.primaryInstitute?.type === "publisher") && (
                      <div>
                        <div className="row align-items-center container1 m-0 mr-2 float-none">
                          <div className="radio mt-1">
                            <input
                              type="radio"
                              value="global"
                              checked={uploadOptions.isAllowReuse === "global"}
                              onChange={() =>
                                setUploadOptions({
                                  ...uploadOptions,
                                  isAllowReuse: "global",
                                })
                              }
                              name="qbank"
                              id="global"
                            />
                            <label htmlFor="global" className="my-0"></label>
                          </div>
                          <div className="upload-right radio-all ml-1">
                            Global
                          </div>
                        </div>
                        <p className="assess-help mt-1">
                          (Everyone can view these questions after upload)
                        </p>
                      </div>
                    )}

                    {!(
                      user.role === "publisher" ||
                      user.primaryInstitute?.type === "publisher"
                    ) && (
                      <div>
                        <div className="row align-items-center container1 m-0 mr-2 float-none">
                          <div className="radio mt-1">
                            <input
                              type="radio"
                              value="everyone"
                              checked={
                                uploadOptions.isAllowReuse === "everyone"
                              }
                              onChange={() =>
                                setUploadOptions({
                                  ...uploadOptions,
                                  isAllowReuse: "everyone",
                                })
                              }
                              name="qbank"
                              id="everyone"
                            />
                            <label htmlFor="everyone" className="my-0"></label>
                          </div>
                          <div className="upload-right radio-all ml-1">
                            Everyone
                          </div>
                        </div>
                        <p className="assess-help mt-1">
                          (Everyone can view these questions after upload)
                        </p>

                        <div className="row align-items-center container1 m-0 mr-2 float-none">
                          <div className="radio mt-1">
                            <input
                              type="radio"
                              value="self"
                              checked={uploadOptions.isAllowReuse === "self"}
                              onChange={() =>
                                setUploadOptions({
                                  ...uploadOptions,
                                  isAllowReuse: "self",
                                })
                              }
                              name="qbank"
                              id="self"
                            />
                            <label htmlFor="self" className="my-0"></label>
                          </div>
                          <div className="upload-right radio-all ml-1">
                            Self
                          </div>
                        </div>
                        <p className="assess-help mt-1">
                          (Only you can view these questions after upload)
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => cancelUpload()}
                      disabled={uploadingQuestion}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary ml-2"
                      disabled={uploadingQuestion}
                      onClick={() => uploadQuestions(uploadFile)}
                    >
                      Upload{" "}
                      {uploadingQuestion && (
                        <i className="fa fa-spinner fa-pulse ml-1"></i>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        show={videoTemplate}
        onHide={() => setVideoTemplate(false)}
        backdrop="static"
        keyboard={false}
        className=""
      >
        <div className="modal-header">
          <AppLogo />
          <a className="pull-right" onClick={() => setVideoTemplate(false)}>
            <i className="fas fa-times"></i>
          </a>
        </div>
        <div className="modal-body">
          {/* <VideoPlayer
            link={answerExplainVideo}
            height={400}
            show={videoTemplate}
            setShow={setVideoTemplate}
          /> */}
          <ReactPlayer
            url={answerExplainVideo}
            height={400}
            width="100%"
            controls
          />
        </div>
      </Modal>
      {isShowAIModal && (
        <AIGenerateComponent
          subjects={subjects}
          test={practice}
          isShowAIModal={isShowAIModal}
          setIsShowAIModal={setIsShowAIModal}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default QuestionComponent;
