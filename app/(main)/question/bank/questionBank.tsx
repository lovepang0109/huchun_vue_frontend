"use client";
import React, { useEffect, useState, useRef } from "react";
import { success, alert, confirm } from "alertifyjs";
import { useSession } from "next-auth/react";
import * as testSvc from "@/services/test-service";
import * as classRoomService from "@/services/classroomService";
import * as questionSvc from "@/services/question-service";
import * as subjectSvc from "@/services/subject-service";
import * as authSvc from "@/services/auth";
import * as userService from "@/services/userService";
import { update } from "lodash";
import { useRouter } from "next/navigation";
import { TagsInput } from "react-tag-input-component";
import Link from "next/link";
import Multiselect from "multiselect-react-dropdown";
import { Modal } from "react-bootstrap";
import { FileDrop } from "react-file-drop";
import MathJax from "@/components/assessment/mathjax";
import { replaceQuestionText, replaceUserAnswer } from "@/lib/pipe";
import {
  Accordion,
  AccordionCollapse,
  AccordionToggle,
  Tabs,
  Tab,
  Card,
} from "react-bootstrap";
import CodeRenderer from "@/components/assessment/code-renderer";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { firstValueFrom } from "rxjs";
import { AppLogo } from "@/components/AppLogo";
import { VideoPlayer } from "@/components/VideoPlayer";
import AIGenerateComponent from "@/components/AIGenerateComponent";

import clientApi, { uploadFile as uploaddFileFunc } from "@/lib/clientApi";

const QuestionBank = () => {
  const { push } = useRouter();
  const [isShowAIModal, setIsShowAIModal] = useState<boolean>(false);
  const fileBrowseRef = useRef(null);
  const [videoTemplate, setVideoTemplate] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState<any>("");
  const [answerExplainVideo, setAnswerExplainVideo] = useState<any>("");
  const [subjects, setSubjects] = useState<any>([]);
  const [classes, setClasses] = useState<any>([]);
  const user: any = useSession()?.data?.user?.info || {};
  const [owners, setOwners] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [params, setParams] = useState<any>({
    limit: 10,
    sort: "updatedAt,-1",
    excludeTempt: true,

    subject: null,
    units: [],
    topics: [],
    category: null,

    isEasy: true,
    isModerate: true,
    isDifficult: true,
    isActive: true,
    unusedOnly: false,
    tags: [],
    level: null,
    myquestion: false,
    pendingReview: false,
    marks: 0,
    owners: [],
  });
  const [uploadingQuestion, setUploadingQuestion] = useState<boolean>(false);

  const [topics, setTopics] = useState<any>([]);
  const [questions, setQuestions] = useState<any>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any>([]);
  const [totalQuestions, setTotalQuestions] = useState<any>(0);
  const [parmasSub, setParamsSub] = useState<any>(null);
  const [isShowUploadModal, setIsShowUploadModal] = useState<boolean>(false);
  const [isShowTagModal, setIsShowTagModal] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [uploadOptions, setUploadOptions] = useState<any>({
    isAllowReuse: "self",
    tags: [],
  });
  const [units, setUnits] = useState<any>([]);

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [practice, setPractice] = useState<any>({});
  const [dropdownSetting, setDropdownSettings] = useState<any>({
    singleSelection: false,
    textField: "name",
    idField: "_id",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: false,
  });
  const [activeSearchParams, setActiveSearchParams] = useState<any>({});
  const [selectedSubjects, setSelectedSubjects] = useState<any>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<any>([]);
  const [selectedUnits, setSelectedUnits] = useState<any>([]);
  const [practiceUnits, setPracticeUnits] = useState<any>([]);
  const [excludedQuestions, setExcludeQuestions] = useState<any>([]);

  const [settings, setSettings] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState<any>({});
  const [showCreateAssessmentModal, setShowCreateAssessmentModal] =
    useState<boolean>(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageReview, setImageReview] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const [uploadProgress, setUploadProgress] = useState<any>({
    progress: 0,
    state: "pending",
  });

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    getClientDataFunc();
    subjectSvc.getMine({ unit: 1, topic: 1 }).then((subs: any[]) => {
      sortByName(subs);
      for (const sub of subs) {
        sortByName(sub.units);
      }
      setSubjects(subs);
      // setParams({
      //   ...params,
      //   subject: subs[0]
      // })
      // setUnits(subs[0]?.units)

      const savedParams = sessionStorage.getItem("qb_query");
      if (savedParams) {
        try {
          const parsedData = JSON.parse(savedParams);
          if (parsedData.subject) {
            parsedData.subject = subjects.find(
              (s) => s._id == parsedData.subject._id
            );
          }
          setParams(parsedData);
        } catch (ex) {
        } finally {
          sessionStorage.removeItem("qb_query");
        }
      }

      getQuestions(true);
    });
    authSvc
      .findUsers({ roles: "director,teacher,operator" })
      .then(({ users }: { users: [] }) => {
        setOwners(users);
      });
    userService.get().then((user) => {
      if (user.primaryInstitute && user.primaryInstitute.type != "publisher") {
        classRoomService
          .getClassRoomByLocation([user.activeLocation])
          .then((classes: any[]) => {
            setClasses(classes);
          });
      }
    });
  }, []);

  const sortByName = (arr: any[]) => {
    arr.sort((a: any, b: any) => {
      const i1 = a.name;
      const i2 = b.name;
      return i1.toLowerCase().localeCompare(i2.toLowerCase());
    });
  };

  const toggleAnswer = (question: any) => {
    setShowAnswer((prevShowAnswer: any) => ({
      ...prevShowAnswer,
      [question._id]: !prevShowAnswer[question._id],
    }));
  };

  const filter = () => {
    getQuestions(true);
  };

  const resetFilter = () => {
    setParams({
      limit: 10,
      sort: "createdAt,-1",
      excludeTempt: true,

      subject: "",
      units: [],
      topics: [],
      category: "",

      isEasy: true,
      isModerate: true,
      isDifficult: true,
      isActive: true,
      unusedOnly: false,
      level: null,
      myquestion: false,
      pendingReview: false,
      marks: 0,
      tags: [],
      owners: [],
    });
    const temp_params = {
      limit: 10,
      sort: "createdAt,-1",
      excludeTempt: true,

      subject: "",
      units: [],
      topics: [],
      category: "",

      isEasy: true,
      isModerate: true,
      isDifficult: true,
      isActive: true,
      unusedOnly: false,
      level: null,
      myquestion: false,
      pendingReview: false,
      marks: 0,
      tags: [],
      owners: [],
    };

    getQuestions(true, temp_params);
  };

  const clearSelection = () => {
    const temp = selectedQuestions.forEach((q) => (q.selected = false));
    setSelectedQuestions(temp);
    setSelectedQuestions([]);
    setSelectAll(false);
  };

  const getQuestions = async (refresh = false, para?: any, cp?: any) => {
    if (!para) {
      para = params;
    }
    if (!cp) {
      cp = currentPage;
    }

    const copiedParams: any = {};
    for (const p in para) {
      // exclude all null/false/0 params
      if (para[p]) {
        if (p == "tags" && para[p][0]) {
          copiedParams.tags = para[p];
        } else if (
          (p == "owners" || p == "topics" || p == "units") &&
          para[p].length
        ) {
          copiedParams[p] = para[p].map((p) => p._id);
        } else if (typeof para[p] == "object") {
          copiedParams[p] = para[p]._id;
        } else {
          copiedParams[p] = para[p];
        }
      }
    }
    if (refresh) {
      setCurrentPage(1);
      cp = 1;
      copiedParams.includeCount = true;
      setQuestions([]);
      setTotalQuestions(0);
      setExcludeQuestions([]);
      clearSelection();
    }
    copiedParams.page = cp;
    try {
      setProcessing(true);
      const res: any = await questionSvc.getBankQuestions(copiedParams);
      if (refresh) {
        setActiveSearchParams(copiedParams);
        setQuestions(res.questions);
        setTotalQuestions(res.count);
      } else {
        if (selectAll || excludedQuestions.length) {
          res.questions.forEach((q) => (q.selected = true));
        }

        setQuestions(questions.concat(res.questions));
      }
    } catch (ex) {
      console.error(ex);
    } finally {
      setProcessing(false);
    }
  };

  const loadMore = () => {
    setCurrentPage(currentPage + 1);
    const current_page = currentPage + 1;
    getQuestions(false, params, current_page);
  };

  const deleteQuestion = (question: any) => {
    confirm(
      "Question will become inactive and will not be available for future use. Do you want to continue?",
      () => {
        questionSvc
          .destroy(question._id)
          .then(() => {
            const qidx = questions.findIndex((q) => q._id == question._id);
            if (qidx > -1) {
              setQuestions((prevQuestions) => {
                const newQuestions = [...prevQuestions];
                newQuestions.splice(qidx, 1);
                return newQuestions;
              });
            }
            setTotalQuestions(totalQuestions - 1);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    ).set("labels", { ok: "Yes", cancel: "No" });
  };

  const track = (index: any, item: any) => {
    return item._id;
  };

  const onQuestionSelectionChange = (q) => {
    const updatedQuestions = [...questions]; // Create a copy of the questions array

    const questionIndex = updatedQuestions.findIndex(
      (question) => question._id === q._id
    );

    if (questionIndex !== -1) {
      updatedQuestions[questionIndex].selected =
        !updatedQuestions[questionIndex].selected;

      if (updatedQuestions[questionIndex].selected) {
        setSelectedQuestions([...selectedQuestions, q]);
      } else {
        const updatedSelectedQuestions = selectedQuestions.filter(
          (selectedQ) => selectedQ._id !== q._id
        );
        setSelectedQuestions(updatedSelectedQuestions);

        if (selectAll || excludedQuestions.length) {
          setSelectAll(false);
          setExcludeQuestions([...excludedQuestions, q._id]);
        }
      }

      setQuestions(updatedQuestions); // Update the state with the modified questions array
    }
  };

  const openTagModal = (template: any) => {
    // this.modalRef = this.modalSvc.show(template, { class: 'modal-small', ignoreBackdropClick: true });
    setIsShowTagModal(true);
  };

  const openCreateAssessmentModel = async (template: any) => {
    setPractice({});
    setSelectedSubjects([]);
    setPracticeUnits([]);
    setSelectedUnits([]);
    setSelectedClassrooms([]);

    if (selectAll || excludedQuestions.length) {
      const questionSearchParams: any = { ...activeSearchParams };

      if (excludedQuestions.length) {
        questionSearchParams.excludeQuestions = excludedQuestions;
      }
      const units: any[] = await questionSvc.getQuestionUnits(
        questionSearchParams
      );

      for (const unit of units) {
        let sub = selectedSubjects.find((s) => s._id == unit.subject._id);
        if (!sub) {
          sub = { _id: unit.subject._id, name: unit.subject.name, units: [] };
          const update_selectedS = [];
          update_selectedS.push(sub);
          setSelectedSubjects(update_selectedS);
        }
        const newU = { _id: unit._id, name: unit.name };
        sub.units.push(newU);
        const update_selectedU = [];
        update_selectedU.push(newU);
        setSelectedUnits(update_selectedU);
      }
      for (const sub of selectedSubjects) {
        setPracticeUnits((prevPracticeUnits) => [
          ...prevPracticeUnits,
          ...sub.units,
        ]);
      }
    } else {
      selectedQuestions.forEach((q) => {
        if (!selectedSubjects.find((s) => s._id == q.subject._id)) {
          const update_selectedS = [];
          update_selectedS.push(q.subject);
          setSelectedSubjects(update_selectedS);
          setPracticeUnits((prevPracticeUnits) => [
            ...prevPracticeUnits,
            ...(subjects.find((s) => s._id === q.subject._id)?.units || []),
          ]);
        }
        if (!selectedUnits.find((s) => s._id == q.unit._id)) {
          console.log(q, "selecteds");
          const update_unitS = [];
          update_unitS.push(q.unit);
          setSelectedUnits(update_unitS);
        }
      });
    }

    setShowCreateAssessmentModal(true);

    // this.modalRef = this.modalSvc.show(template, { class: 'modal-mg', backdrop: 'static', keyboard: true, ignoreBackdropClick: true });
  };

  const onSubjectChange = () => {
    setSelectedUnits([]);
    let units: any[] = [];
    selectedSubjects.forEach((e) => {
      const sub: any = subjects.find((sub) => sub._id == e._id);
      units = [...units, ...sub.units];
    });
    sortByName(units);
    setPracticeUnits(units);
  };

  const onSubjectSelect = (item: any) => {
    onSubjectChange();
  };

  const onSubjectDeselect = (ev) => {
    const idToRemove = ev._id;
    setSelectedSubjects(
      selectedSubjects.filter((item) => item._id !== idToRemove)
    );
    onSubjectChange();
  };

  const closeAssessmentModal = (val: any) => {
    setPractice({});
    setSelectedSubjects([]);
    setSelectedUnits([]);
    setPracticeUnits([]);
    setSelectedClassrooms([]);

    // this.modalRef.hide();
  };

  const closeTagModal = () => {
    // this.modalRef.hide();
    setTagText("");
    setTags([]);
    setIsShowTagModal(false);
  };

  const applyTags = () => {
    let questionSearchParams = null;
    if (selectAll || excludedQuestions.length) {
      questionSearchParams = activeSearchParams;
      questionSearchParams.nopaging = true;
      if (excludedQuestions.length) {
        questionSearchParams.excludeQuestions = excludedQuestions;
      }
    }
    questionSvc
      .updateTags(
        selectedQuestions.map((s) => s._id),
        tags,
        questionSearchParams,
        "add"
      )
      .then((res) => {
        success("Tags are added to selected questions.");
        const updatedQuestions = selectedQuestions.map((q) => {
          const updatedTags = [...q.tags];

          for (const tag of tags) {
            if (!updatedTags.includes(tag)) {
              updatedTags.push(tag);
            }
          }

          return { ...q, tags: updatedTags };
        });

        // Update the state variable 'selectedQuestions' with the updated questions
        setSelectedQuestions(updatedQuestions);

        clearSelection();
        closeTagModal();
      })
      .catch((err) => {
        alert("Message", "Fail to add tags.");
      });
  };

  const uploadModal = (template: any) => {
    if (template === "uploadQuestionsTemplate") {
      setIsShowUploadModal(true);
    }
    // this.uploadFileModalRef = this.modalSvc.show(template, { backdrop: 'static', keyboard: true, ignoreBackdropClick: true });
  };

  const closeUploadModal = () => {
    // this.uploadFileModalRef.hide();
    setIsShowUploadModal(false);
    setUploadOptions({
      ...uploadOptions,
      tags: [],
      isAllowReuse:
        user.role == "publisher" || user.primaryInstitute?.type == "publisher"
          ? "global"
          : "self",
    });
    setUploadFile(null);
  };

  const uploadQuestions = (file: any) => {
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);
    formData.append("QB", "true");
    formData.append("isAllowReuse", uploadOptions.isAllowReuse);

    if (uploadOptions.tags && uploadOptions.tags.length) {
      formData.append("tags", uploadOptions.tags.join(","));
    }
    setUploadingQuestion(true);

    testSvc
      .importFunc(formData)
      .then((data) => {
        closeUploadModal();
        // success('Uploaded successfully');
        setUploadingQuestion(false);
      })
      .catch((err) => {
        if (err.error && err.error.errors) {
          alert(
            "Fail to upload questions",
            err.error.errors.map((e) => e.message).join("<br>")
          );
        } else {
          console.log(err);
          alert("Messate", "Fail to upload questions");
        }
        setUploadingQuestion(false);
      });
  };

  const dropped = (files: any) => {
    setUploadFile(files[0]);
  };

  const openVideoExp = (question: any) => {
    setTimeout(() => {
      setAnswerExplainVideo(question.answerExplainVideo);

      setVideoTemplate(true);
    });
  };

  const clearUnits = (e) => {
    const selectedSubjectId = e.target.value;
    const selectedSubject = subjects.find(
      (subject) => subject._id === selectedSubjectId
    );

    if (selectedSubject) {
      setUnits(selectedSubject?.units);
      setParams({
        ...params,
        subject: selectedSubjectId,
        units: [],
        topics: [],
      });
    } else {
      console.log("Subject not found");
    }
  };

  const selectAllChanged = (e) => {
    setSelectAll(e.target.checked);

    const updatedQuestions = questions.map((q) => ({
      ...q,
      selected: e.target.checked,
    }));

    setQuestions(updatedQuestions);
    const updateSelectedQuestions = updatedQuestions.filter((q) => q.selected);
    setSelectedQuestions(updateSelectedQuestions);
    setExcludeQuestions([]);
  };

  const createAssessment = (publish = false) => {
    setPractice({
      ...practice,
      subjects: selectedSubjects,
      units: selectedUnits,
      classRooms: selectedClassrooms.map(({ _id }) => _id),
    });
    let prac = practice;
    prac = {
      ...prac,
      subjects: selectedSubjects,
      units: selectedUnits,
      classRooms: selectedClassrooms.map(({ _id }) => _id),
    };
    if (
      !selectedSubjects ||
      selectedSubjects.length === 0 ||
      !selectedUnits ||
      selectedUnits.length === 0
    ) {
      alert("Messate", "Please add subjects/units");
      return;
    }

    if (selectAll || excludedQuestions.length) {
      setPractice((prevPractice) => ({
        ...prevPractice,
        questionSearchParams: {
          ...prevPractice.questionSearchParams,
          ...activeSearchParams,
          nopaging: true,
        },
      }));
      prac.questionSearchParams = activeSearchParams;
      prac.questionSearchParams.nopaging = true;
      if (excludedQuestions.length) {
        setPractice({
          ...practice,
          questionSearchParams: {
            ...practice.questionSearchParams,
            excludeQuestions: excludedQuestions,
          },
        });
        prac.questionSearchParams = {
          ...prac.questionSearchParams,
          excludeQuestions: excludedQuestions,
        };
      }
    } else {
      const updatedQuestions = selectedQuestions.map((q, idx) => ({
        question: q._id,
        section: q.subject.name,
        minusMark: 0,
        plusMark: 0,
        createdAt: new Date(),
        order: idx + 1,
      }));
      prac.questions = updatedQuestions;
      prac.totalQuestion = updatedQuestions.length;

      setPractice({
        ...practice,
        questions: updatedQuestions,
        totalQuestion: updatedQuestions.length,
      });
    }

    testSvc
      .createFunc(prac)
      .then((data) => {
        if (!publish) {
          push(`/assessment/details/${data._id}`);
        } else {
          if (data.totalQuestion < 5) {
            alert(
              "Messsage",
              "Please add at least " +
                5 +
                " questions before publishing the assessment."
            );

            push(`/assessment/details/${data._id}`);

            return;
          }

          data.status = "published";
          testSvc
            .updateFunc(data._id, data)
            .then(() => {
              // this.router.navigate(['/' + this.user.role + '/assessments/details', newTest._id]);
              success("New assessment is published!");
              setShowCreateAssessmentModal(false);
            })
            .catch((err) => {
              let msg = err.response.data.message;
              if (!err.response.data.message) {
                if (err.response.data[0]?.msg) {
                  msg = err.response.data.map((e) => e.msg).join("<br/>");
                } else {
                  msg = "Failed to publish assessment!";
                }
              }
              alert("Message", msg);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        alert(
          "Message",
          err.response.data[0]?.msg || "Fail to create assessment."
        );
      });
  };

  const createClassBoard = (question: any) => {
    questionSvc.createClassBoard(question._id).then((res: any) => {
      sessionStorage.setItem(
        "classboard_org",
        `/question/bank?openQuestion=${question._id}`
      );
      push(`/classboard${res.code}`);
    });
  };

  const tagEdit = (question: any) => {
    // Create a new array to avoid mutating the state directly
    const updatedQuestions = [...questions];

    // Update the tagEdit property of the question to true
    updatedQuestions[question] = {
      ...updatedQuestions[question],
      tagEdit: true,
    };

    // Update the state with the modified questions array
    setQuestions(updatedQuestions);
  };

  const tagUpdate = (question: any) => {
    questionSvc
      .updateTags([question._id], question.tags)
      .then((res: any) => {
        success("Question tags is updated");
      })
      .catch((err) => {
        if (err.error) {
          if (err.error.sysTags && err.error.sysTags[question._id]) {
            question.tags = [
              ...err.error.sysTags[question._id],
              ...question.tags,
            ];
          }
          alert("Message", err.error.message);

          return;
        }
        alert("Message", "Fail to update question tags");
      });
  };

  const generateQuestions = () => {
    setIsShowAIModal(true);
  };

  const onClose = (res: any) => {
    if (res) {
      filter();
    }
  };

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  const cancelUpload = () => {
    setIsShowUploadModal(false);
    setUploadFile("");
    setUploadOptions({
      ...uploadOptions,
      isAllowReuse: "none",
    });
  };

  const onUnitsSelectionChanged = (item: any) => {
    console.log(item, "unit");
    if (item.length === 0) {
      console.log("zeo");
      setParams({
        ...params,
        units: [],
        topics: [],
      });
    } else {
      setParams({
        ...params,
        units: item,
      });

      setTopics([]);
      let update_topics: any = [];
      for (const unit of item) {
        const orgUnit = units.find((u) => u._id == unit._id);
        update_topics = update_topics.concat(orgUnit.topics);
        sortByName(update_topics);
        setTopics(update_topics);
      }

      // remove selected topics not in new list
      const remainingTopics = [];
      for (const topic of params.topics) {
        if (topics.find((t) => t._id == topic._id)) {
          remainingTopics.push(topic);
        }
      }
      setParams({
        ...params,
        units: item,
        topics: remainingTopics,
      });
    }
  };

  const onTopicsSelectisetonChanged = (item: any) => {
    setParams({
      ...params,
      topics: item,
    });
  };

  const fileUpload = async () => {
    const formData: FormData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    //   formData.append('uploadType', this.uploadType)
    try {
      const res = await uploaddFileFunc(uploadFile, uploadFile.name, "file");
      setUploadedUrl(res.data.fileUrl);
      setPractice({
        ...practice,
        imageUrl: res.data.fileUrl,
      });
      setImageReview(true);
    } catch (err) {
      alert("message", err);
    }
  };

  return (
    <>
      <div className="assess-btns forQues_BanKteMpL mb-3">
        {!user.primaryInstitute ||
          (user.primaryInstitute.preferences?.questionBank.createQuestion && (
            <div className="row Ques-bankCoPitemP">
              <div className="assesm-remove col-lg-6 col-md-5">
                <div className="new-assesm-box-body dashed-border-box">
                  <div className="row">
                    <div className="col d-flex flex-column justify-content-between">
                      <span className="helper-text">
                        <p className="assess-help lh-16">
                          Create individual question from scratch
                        </p>
                      </span>
                      <div className=" mt-2">
                        <Link
                          className="btn btn-primary"
                          href="/question/create?forQB=true"
                        >
                          Create Question
                        </Link>
                      </div>
                    </div>

                    {user.primaryInstitute?.canUseAI && (
                      <div className="col d-flex flex-column justify-content-between">
                        <span className="helper-text">
                          <p className="assess-help lh-16">
                            Generate questions with AI
                          </p>
                        </span>
                        <div className="mt-2">
                          <a
                            className="btn btn-primary"
                            onClick={generateQuestions}
                          >
                            Generate Questions
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="col d-flex flex-column justify-content-between">
                      <span className="helper-text2">
                        <p className="assess-help lh-16">
                          Create questions in bulk using your Excel or Word
                          template
                        </p>
                      </span>
                      <div className="mt-2">
                        <a
                          className="btn btn-primary"
                          onClick={() => uploadModal("uploadQuestionsTemplate")}
                        >
                          Upload Questions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="curriculam-buttons assesm col-lg-6 col-md-7">
                <div className="dashed-border-box h-md-100">
                  <div className="col-lg-12 ">
                    <div className="form-row justify-content-end justify-content-sm-start mt-md-0 mt-2">
                      <div className="col-12 pl-0">
                        <p className="mb-2">
                          Download the template to create questions in bulk
                        </p>
                      </div>
                      <div className="form-row justify-content-end justify-content-sm-start text-right mt-lg-3">
                        <div className="col-sm-auto col-12">
                          <a
                            className="btn btn-outline"
                            href="/assets/media/Question-Upload-Template.xlsx"
                            target="_blank"
                          >
                            <div className="d-flex align-items-center">
                              <img
                                className="tem-svg mr-2"
                                src="/assets/images/assessment-excel.svg"
                                alt=""
                              />{" "}
                              Excel Template
                            </div>
                          </a>
                        </div>
                        <div className="col-sm-auto col-12">
                          <p className="my-2">OR</p>
                        </div>
                        <div className="col-sm-auto col-12">
                          <a
                            className="btn btn-outline"
                            href="/assets/media/Question-Upload-Template.docx"
                            target="_blank"
                          >
                            <div className="d-flex align-items-center">
                              <img
                                className="tem-svg mr-2"
                                src="/assets/images/assessment-word.svg"
                                alt=""
                              />
                              Word Template
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="bg-white rounded-boxes mt-3 p-3 text-black multiselect_controlled cheng-multiselect_controlled form-boxes">
        <h3 className="form-box_title text_secondary">
          <strong>Filter Questions</strong>
        </h3>
        <div className="row mt-2">
          <div className="col-md-4">
            <div className="form-group border-bottom">
              <h4 className="form-box_subtitle">Subject</h4>
              <select
                className="form-control form-control-sm my-0"
                name="subject"
                value={params.subject}
                onChange={(e) => {
                  clearUnits(e);
                }}
                required
              >
                <option value="" disabled selected>
                  Select One
                </option>
                {subjects?.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group border-bottom">
              <h4 className="form-box_subtitle">Unit</h4>
              <Multiselect
                options={units}
                selectedValues={params.units}
                onSelect={onUnitsSelectionChanged}
                onRemove={onUnitsSelectionChanged}
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
                options={topics}
                displayValue="name"
                selectedValues={params.topics}
                onSelect={onTopicsSelectisetonChanged}
                onRemove={onTopicsSelectisetonChanged}
                placeholder="Select one or more topics"
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
                    name="Complexity"
                    checked={params.isEasy}
                    onChange={(e) =>
                      setParams({ ...params, isEasy: e.target.checked })
                    }
                  />
                  <span className="checkmark1 translate-middle-y"></span>
                </label>
                <label className="container2 d-inline ml-4">
                  Medium
                  <input
                    type="checkbox"
                    name="Complexity"
                    checked={params.isModerate}
                    onChange={(e) =>
                      setParams({ ...params, isModerate: e.target.checked })
                    }
                  />
                  <span className=" checkmark1 translate-middle-y"></span>
                </label>
                <label className="container2 d-inline ml-4">
                  Hard
                  <input
                    type="checkbox"
                    name="Complexity"
                    checked={params.isDifficult}
                    onChange={(e) =>
                      setParams({ ...params, isDifficult: e.target.checked })
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
                  value={params.category}
                  onChange={(e) =>
                    setParams({ ...params, category: e.target.value })
                  }
                >
                  <option value="" disabled selected>
                    Select One
                  </option>
                  <option value="mcq">Multiple choices</option>
                  <option value="fib">Fill in the blanks</option>
                  {settings?.features.coding && (
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
            <div className="color-tags new-color-tags">
              {/* Render your tag input component */}
              <TagsInput
                //@ts-ignore
                style={{ padding: "2px" }}
                value={params.tags}
                //@ts-ignore
                onChange={(e) => setParams({ ...params, tags: e })}
                name="tags"
                placeHolder="+ Enter a new tag"
                separators={[" "]}
              />
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-4">
            <div className="form-group border-bottom">
              <h4 className="form-box_subtitle">Teacher name</h4>
              {/* Render your multiselect dropdown for teachers */}
              <Multiselect
                options={owners}
                selectedValues={params.owners}
                onSelect={(e) => setParams({ ...params, owners: e })}
                onRemove={(e) => setParams({ ...params, owners: e })}
                displayValue="name"
                placeholder="Select one or more teacher"
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
              <h4 className="form-box_subtitle">Marks</h4>
              <input
                type="number"
                aria-label="Enter the marks for questions"
                name="marks"
                className="form-control"
                value={params.marks}
                onChange={(e) =>
                  setParams({ ...params, marks: e.target.value })
                }
              />
            </div>
          </div>

          <div className="col-md-4 text-right">
            <div className="row justify-content-end">
              <div className="col-auto">
                <br />
                <button
                  className="btn btn-light border-dark"
                  onClick={resetFilter}
                  disabled={processing}
                >
                  <i className="fas fa-redo-alt"></i>
                  Reset
                </button>
              </div>
              <div className="col-auto">
                <br />
                <button
                  className="btn btn-primary"
                  onClick={filter}
                  disabled={processing}
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-boxes bg-white d-flex align-items-center justify-content-between">
        <div>
          <label className="container2 d-flex align-items-center mb-0">
            <input
              type="checkbox"
              name="selectAll"
              checked={selectAll}
              onChange={(e) => {
                selectAllChanged(e);
              }}
              disabled={!totalQuestions}
            />
            <span className="checkmark1 translate-middle-y filter-out"></span>
            <span className="text_secondary ml-2">
              <strong>
                {selectAll
                  ? `${totalQuestions}/${totalQuestions}`
                  : `${
                      excludedQuestions.length
                        ? totalQuestions - excludedQuestions.length
                        : selectedQuestions.length
                    }/${totalQuestions}`}
              </strong>
            </span>
            <span>&nbsp;&nbsp;Questions Selected</span>
          </label>
        </div>
        <div>
          <button
            className="btn btn-primary mr-3"
            disabled={!selectedQuestions.length}
            onClick={() =>
              openCreateAssessmentModel("createAssessmentTemplate")
            }
          >
            Create New Assessment
          </button>
          <button
            className="btn btn-secondary"
            disabled={!selectedQuestions.length}
            onClick={() => openTagModal("tagsTemplate")}
          >
            Add Tag
          </button>
        </div>
      </div>
      <div className="mt-2">
        {questions.map((question, qi) => (
          <div
            className="rounded-boxes bg-white question-answer-list_number"
            key={qi}
          >
            <div className="accordion" id={`accordion_${question._id}`}>
              <div className="area bg-white">
                <div id={`heading${question._id}`}>
                  <h2>
                    <div className="form-row">
                      <div
                        className="col-12 mb-2"
                        style={{ fontSize: "15px", height: "25px" }}
                      >
                        Choose question
                      </div>
                      <div className="col-auto pr-0">
                        <label className="container2 mt-0">
                          # {qi + 1}
                          <input
                            type="checkbox"
                            name={`cls_${question._id}`}
                            checked={question.selected}
                            onChange={() => onQuestionSelectionChange(question)}
                          />
                          <span className="checkmark1 translate-middle-y"></span>
                        </label>
                      </div>
                      <div
                        className={`col ${
                          question.category === "descriptive" && "mt-3"
                        } ${question.category === "code" && "mt-3"}  `}
                      >
                        <button
                          className="btn btn-light btn-nofocus active border-0 text-left w-100 collapsed bg-white py-0"
                          type="button"
                          data-toggle="collapse"
                          data-target={`#collapseContent${question._id}`}
                          aria-expanded="true"
                          aria-controls={`collapseContent${question._id}`}
                        >
                          <div className="form-row">
                            <div className="col-12 col-md px-0 ">
                              <div className="ques bold f-20">
                                <span>
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
                                </span>
                              </div>
                            </div>
                            <div className="col-12 col-md-auto mt-2 mt-md-0 text-right d-flex align-items-center justify-content-end">
                              <div className="btn-group">
                                <Link
                                  className="text-primary mx-2"
                                  tooltip="view"
                                  href={`/question/view/${question._id}`}
                                >
                                  <i className="fab fa-readme f-16"></i>
                                </Link>
                                {question.user === user._id ||
                                user.role === "admin" ||
                                (question.userRole !== "publisher" &&
                                  user.role === "director") ||
                                user.role === "publisher" ? (
                                  <Link
                                    className="text-primary mx-2"
                                    tooltip="editquestion"
                                    href={`/question/create?questionId=${question._id}`}
                                  >
                                    <i className="fas fa-pencil-alt f-16"></i>
                                  </Link>
                                ) : null}
                                {question.user === user._id ||
                                user.role === "admin" ||
                                (question.userRole !== "publisher" &&
                                  user.role === "director") ||
                                user.role === "publisher" ? (
                                  <a
                                    className="text-danger mx-2"
                                    onClick={() => deleteQuestion(question)}
                                  >
                                    <i className="fa fa-trash f-16"></i>
                                  </a>
                                ) : null}
                              </div>
                              <i className="fas fa-angle-up f-20 ml-2"></i>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </h2>
                </div>
                <div
                  id={`collapseContent${question._id}`}
                  className="collapse px-3"
                  aria-labelledby={`heading${question._id}`}
                  data-parent={`#accordion_${question._id}`}
                >
                  <div className="given-answer">
                    <hr />
                    <div className="row">
                      <div className="col-lg-3 col-md-6 col">
                        <h6 className="topic_type_title">Subject</h6>
                        <span className="topic_below_info">
                          {question.subject.name}
                        </span>
                      </div>
                      <div className="col-lg-3 col-md-6 col">
                        <h6 className="topic_type_title">Unit</h6>
                        <span className="topic_below_info">
                          {question.unit?.name}
                        </span>
                      </div>
                      <div className="col-lg-3 col-md-6 col">
                        <h6 className="topic_type_title">Topic</h6>
                        <span className="topic_below_info">
                          {question.topic.name}
                        </span>
                      </div>
                      <div className="col-lg-3 col-md-6 col">
                        <h6 className="topic_type_title">Marks</h6>
                        <span className="topic_below_info mark-p text-white ml-0 d-inline-block">
                          +{question.plusMark}
                        </span>
                        <span className="topic_below_info mark-n text-white d-inline-block">
                          {question.minusMark}
                        </span>
                      </div>
                    </div>
                    <br />
                    <div className="row">
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
                    </div>
                  </div>
                  <div className="given-answer mb-0 f-16-all">
                    <hr />
                    {(question.userRole !== "publisher" ||
                      user.role === "publisher" ||
                      user.primaryInstitute?.type === "publisher") && (
                      <h6 className="topic_type_title">
                        Question Tag
                        {!question.tagEdit && (
                          <a onClick={() => tagEdit(qi)} className="ml-1">
                            <i className="fas fa-pen"></i>
                          </a>
                        )}
                        {question.tagEdit && (
                          <a
                            onClick={() => {
                              tagUpdate(question);
                              const updatedQuestions = [...questions];
                              updatedQuestions[qi] = {
                                ...updatedQuestions[qi],
                                tagEdit: false,
                              };
                              setQuestions(updatedQuestions);
                            }}
                            className="ml-1"
                          >
                            <i className="fas fa-save"></i>
                          </a>
                        )}
                      </h6>
                    )}
                    <div className="question-tags mt-2">
                      {!question.tagEdit &&
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
                        onChange={(e) => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[qi] = {
                            ...updatedQuestions[qi],
                            tags: e,
                          };
                          setQuestions(updatedQuestions);
                        }}
                        name="Tag"
                        placeHolder="+ Add Tag"
                        separators={[" "]}
                      />
                    )}
                  </div>
                  {question.questionHeader && (
                    <div className="given-answer mb-0 f-16-all">
                      <hr />
                      <h6 className="topic_type_title">Instruction</h6>
                      <span className="topic_below_info">
                        <MathJax value={question.questionHeader}></MathJax>
                      </span>
                    </div>
                  )}
                  <div className="given-answer mb-0 f-16-all">
                    <hr />
                    <h6 className="topic_type_title">
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
                    {question.category !== "fib" ? (
                      <MathJax value={question?.questionText}></MathJax>
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
                  <div className="given-answer mb-0 f-16-all">
                    {question.category === "mcq" && (
                      <>
                        <hr />
                        {question.answers.map((ans, i) => (
                          <h6 className="topic_type_title mb-0" key={i}>
                            Answer Option {i + 1}
                            {ans.isCorrectAnswer &&
                              showAnswer[question._id] && (
                                <span className="ml-2 corrctopTiOn-TaG">
                                  (Correct Option)
                                  <i className="ml-2 text-success fas fa-check"></i>
                                </span>
                              )}
                            <span className="assess-ques">
                              <MathJax value={ans.answerText}></MathJax>
                            </span>
                          </h6>
                        ))}
                      </>
                    )}

                    {question.category === "code" && (
                      <>
                        <hr />
                        {question.hasArg && question.argumentDescription && (
                          <>
                            <h6 className="topic_type_title">Arguments</h6>
                            <span className="codeArgDescriptIon">
                              {question.argumentDescription}
                            </span>
                          </>
                        )}
                        {question.hasUserInput &&
                          question.userInputDescription && (
                            <>
                              <h6 className="topic_type_title">Input</h6>
                              <span className="codeArgDescriptIon">
                                {question.userInputDescription}
                              </span>
                            </>
                          )}
                        <h4 className="text-black my-2">Test Cases</h4>
                        <div className="row no-gutters testcase-header">
                          {(question.hasArg || question.hasUserInput) && (
                            <div className="col">
                              <div className="row">
                                {question.hasArg && (
                                  <h6 className="mx-3">Arguments</h6>
                                )}
                                {question.hasUserInput && (
                                  <h6 className="mx-3">Input</h6>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="col">
                            <h6 className="topic_type_title">
                              Expected Output
                            </h6>
                          </div>
                          <div className="col-auto">
                            <div style={{ width: "120px" }}></div>
                          </div>
                        </div>
                        <div className="testcase-table">
                          {question.testcases.map((testcase, index) => (
                            <div key={index} className="mt-3">
                              <div className="row">
                                {(question.hasArg || question.hasUserInput) && (
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
                                )}
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
                        <div className="mt-2">
                          <Tabs id="coding-tabs" className="mt-2">
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
                      </>
                    )}

                    {question.category === "mixmatch" && (
                      <>
                        <hr />
                        <div className="adaptive-question-box adaptive-question-ans overflow-hidden">
                          <div className="mix-match row">
                            <div className="col-5 mix-match-content">
                              {question.answers.map((ans, index) => (
                                <div className="mix-match-drag" key={index}>
                                  <span>
                                    <MathJax value={ans.answerText}></MathJax>
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="col-5 ml-auto">
                              <div className="mix-match-content w-100">
                                {question.answers.map((ans, index) => (
                                  <div className="mix-match-dragd" key={index}>
                                    <span hidden={!showAnswer[question._id]}>
                                      <MathJax
                                        value={ans.correctMatch}
                                      ></MathJax>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    className="given-answer mb-0 f-16-all"
                    style={{
                      display: showAnswer[question._id] ? "block" : "none",
                    }}
                  >
                    <hr />
                    <h6 className="topic_type_title">Answer Explanation</h6>
                    {question.answerExplain && question.answerExplainVideo && (
                      <button
                        className="btn btn-outline"
                        onClick={() => openVideoExp(question)}
                      >
                        Video Explanation
                      </button>
                    )}
                    {question.answerExplain ? (
                      <span className="topic_below_info">
                        <MathJax value={question.answerExplain}></MathJax>
                      </span>
                    ) : (
                      <span className="topic_below_info">
                        No answer explanation
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {processing && (
        <div className="mt-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="mb-2">
              <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
            </div>
          ))}
        </div>
      )}
      {totalQuestions > questions.length && !processing && (
        <div className="mt-4 text-center">
          <button className="btn btn-light" onClick={loadMore}>
            Load More
          </button>
        </div>
      )}
      {!processing && !questions.length && (
        <div className="empty-data emptyPageteMplaTe">
          <figure className="m-0 w-auto">
            <img src="assets/images/QuestionIllustraions.svg" alt="" />
          </figure>
          <p className="bold mb-2">No Question Available</p>
          <p>
            You may change the search criteria. Optionally, add new questions
            and try again.
          </p>
        </div>
      )}

      <Modal
        show={isShowUploadModal}
        onHide={() => setIsShowUploadModal(false)}
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
                        onChange={(e) => {
                          setUploadOptions({
                            ...uploadOptions,
                            tags: e,
                          });
                        }}
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
        show={showCreateAssessmentModal}
        onHide={() => setShowCreateAssessmentModal(false)}
        backdrop="static"
        keyboard={false}
        className=""
      >
        <div className="modal-content assess-modal-all modal-createAss-1 form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h2 className="form-box_title mt-0">Create Assessment</h2>
          </div>

          <div className="modal-body">
            <div className="classroom-create-modal">
              <div className="class-board-info">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="form-group  border-bottom pb-1">
                    <h4 className="form-box_subtitle">Assessment Name</h4>
                    <input
                      type="text"
                      name="name"
                      className="bg-transparent"
                      placeholder="Name"
                      value={practice.title}
                      onChange={(e) =>
                        setPractice({
                          ...practice,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    {/* {(name.invalid && (name.dirty || name.touched || submitted)) && (
                      <>
                        {name.errors.pattern && <p className="label label-danger text-danger">Name contains invalid characters.</p>}
                        {name.errors.required && <p className="label label-danger text-danger">Name is required</p>}
                        {name.errors.maxlength && <p className="label label-danger text-danger">Name must be smaller than 50 characters.</p>}
                        {name.errors.minlength && <p className="label label-danger text-danger">Name must be greater than 2 characters.</p>}
                      </>
                    )} */}
                  </div>

                  <div className="form-group  LibraryChange_new border-bottom">
                    <h4 className="form-box_subtitle">Subject</h4>
                    <Multiselect
                      options={subjects}
                      displayValue="name"
                      onSelect={onSubjectSelect}
                      onRemove={onSubjectDeselect}
                      selectedValues={selectedSubjects}
                      placeholder={
                        selectedSubjects.length > 0 ? "" : "Select Subjects"
                      }
                    />
                  </div>

                  <div className="form-group  LibraryChange_new border-bottom">
                    <h4 className="form-box_subtitle">Unit</h4>
                    <Multiselect
                      options={practiceUnits}
                      displayValue="name"
                      selectedValues={selectedUnits}
                      onSelect={(selectedList) =>
                        setSelectedUnits(selectedList)
                      }
                      onRemove={(selectedList) =>
                        setSelectedUnits(selectedList)
                      }
                      placeholder={
                        selectedUnits.length > 0 ? "" : "Select Units"
                      }
                      closeOnSelect={false}
                    />
                  </div>
                  <div className="form-group LibraryChange_new border-bottom">
                    <h4 className="form-box_subtitle">Classroom</h4>

                    <Multiselect
                      placeholder="Select Classroom"
                      options={classes}
                      selectedValues={selectedClassrooms}
                      onSelect={(cls) => setSelectedClassrooms(cls)}
                      onRemove={(cls) => setSelectedClassrooms(cls)}
                      displayValue="name" // Adjust this based on the structure of your `classes` data
                      className="multiSelectLocCls"
                      {...dropdownSetting}
                    />
                  </div>

                  <div className="camera-sec-box form-group ">
                    <h4 className="form-box_subtitle">
                      Upload Assessment Picture
                    </h4>
                    {imageReview && uploadedUrl ? (
                      <div className="standard-upload-box mt-2 bg-white">
                        <button
                          type="reset"
                          aria-label="remove uploaded image"
                          className="close btn p-0 mb-2"
                          onClick={() => {
                            setImageReview(false);
                          }}
                        >
                          <img
                            src="/assets/images/close.png"
                            alt="user_uploaded image"
                          />
                        </button>
                        <figure>
                          <img
                            src={uploadedUrl}
                            alt="actually uploaded image"
                            className="actual-uploaded-image"
                          />
                        </figure>
                      </div>
                    ) : (
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
                            your files
                            <br></br>
                            For optimal view, we recommend size 190px * 200px
                          </span>
                          {uploading && (
                            <div className="info mx-auto mt-1 mb-2">
                              <p className="text-center text-dark">
                                Uploading(
                                <span style={{ color: "#8C89F9" }}>
                                  {uploadProgress.progress.toFixed(0)}%
                                </span>{" "}
                                <i className="fa fa-spinner fa-pulse"></i>)
                              </p>
                            </div>
                          )}
                          {uploadProgress.state === "inprogress" && (
                            <div
                              className="progress mb-2 mx-auto"
                              style={{ height: "6px", width: "60%" }}
                            >
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${uploadProgress.progress}%`,
                                  backgroundColor: "#8C89F9",
                                }}
                                aria-valuenow={uploadProgress.progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label="progress-bar"
                              ></div>
                            </div>
                          )}

                          <div className="d-flex justify-content-center gap-xs">
                            {!uploadFile?.name && (
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
                            {uploadFile?.name && (
                              <>
                                <button
                                  className="btn btn-secondary btn-sm ml-2"
                                  type="button"
                                  onClick={fileUpload}
                                >
                                  Upload
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  type="button"
                                  onClick={() => {
                                    setUploadFile({ ...uploadFile, name: "" });
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                          <input
                            accept=""
                            value=""
                            style={{ display: "none", opacity: 0 }}
                            ref={fileBrowseRef}
                            type="file"
                            onChange={(e) => dropped(e.target.files)}
                          />
                        </FileDrop>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-end mt-2">
                    <a
                      className="btn btn-light mr-2"
                      onClick={() => setShowCreateAssessmentModal(false)}
                    >
                      Cancel
                    </a>
                    <button
                      className="btn btn-primary"
                      onClick={() => createAssessment()}
                    >
                      Create Assessment
                    </button>
                    {user.primaryInstitute?.type != "publisher" && (
                      <button
                        className="btn btn-primary ml-2"
                        onClick={() => createAssessment(true)}
                      >
                        Create & Publish
                      </button>
                    )}
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
          <VideoPlayer
            link={answerExplainVideo}
            height={400}
            show={videoTemplate}
            setShow={setVideoTemplate}
          />
        </div>
      </Modal>

      <Modal
        show={isShowTagModal}
        onHide={() => setIsShowTagModal(false)}
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
              <b>
                {selectAll
                  ? totalQuestions
                  : excludedQuestions.length
                  ? totalQuestions - excludedQuestions.length
                  : selectedQuestions.length}
              </b>{" "}
              questions
            </span>

            <TagsInput
              //@ts-ignore
              style={{ padding: "2px" }}
              value={tags}
              //@ts-ignore
              onChange={(e) => setTags(e)}
              name="tags"
              placeHolder="+ Add Question Tag"
              separators={[" "]}
            />

            <div className="text-right mt-2">
              <button
                className="btn btn-light mr-2"
                onClick={() => closeTagModal()}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!tags.length}
                onClick={() => applyTags()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Modal>
      {isShowAIModal && (
        <AIGenerateComponent
          subjects={subjects}
          isShowAIModal={isShowAIModal}
          setIsShowAIModal={setIsShowAIModal}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default QuestionBank;
