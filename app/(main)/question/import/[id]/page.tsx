"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { alert, success, error, confirm } from "alertifyjs";
import * as authService from "@/services/auth";
import * as subjectSvc from "@/services/subject-service";
import * as questionSvc from "@/services/question-service";
import clientApi from "@/lib/clientApi";
import { update } from "lodash";
import Multiselect from "multiselect-react-dropdown";
import MathJax from "@/components/assessment/mathjax";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { replaceQuestionText, replaceUserAnswer } from "@/lib/pipe";
import CodeMirror from "@uiw/react-codemirror";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
const styleForMultiSelect = {
  multiselectContainer: {},
  searchBox: {
    fontSize: "10px",
    minHeight: "50px",
  },
  inputField: {
    margin: 5,
  },
  option: {
    color: "black",
    height: 30,
    padding: "3px 5px",
    margin: 0,
    borderRadius: 5,
  },
  optionContainer: {
    display: "flex",
    flexDirection: "column",
  },
};

const ImportQuestion = () => {
  const { id } = useParams();

  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [subjects, setSubjects] = useState<any>([]);
  const [units, setUnits] = useState<any>([]);
  const user: any = useSession()?.data?.user?.info || {};
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [params, setParams] = useState<any>({
    limit: 10,
    sort: "updatedAt,-1",
    excludeTempt: true,

    subject: null,
    units: [],
    topics: [],
    category: "mcq",

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
  });
  const [topics, setTopics] = useState<any>([]);
  const [questions, setQuestions] = useState<any>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any>([]);
  const [totalQuestion, setTotalQuestions] = useState<any>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [pageImport, setPageImport] = useState<boolean>(false);
  const [importingQuestions, setImportingQuestions] = useState<any>(null);
  const [totalImportingQuestions, setTotalImportingQuestions] =
    useState<any>(0);
  const [currentSearchParams, setCurrentSearchParams] = useState<any>(null);
  const [excludedQuestions, setExcludedQuestions] = useState<any>([]);
  const [clientData, setClientData]: any = useState();
  const [selectedUnits, setSelectedUnits] = useState<
    { _id: number; name: string }[]
  >([]);
  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      setClientData(data);
    };
    getClientData();

    subjectSvc
      .getByTest(id, {
        testDetails: "title isMarksLevel status isAdaptive",
        unit: 1,
        topic: 1,
      })
      .then((res: { test: any; subjects: any }) => {
        setTest(res.test);
        setSubjects(res.subjects);
        if (res.subjects[0]) {
          setParams({
            ...params,
            subject: res.subjects[0],
          });

          setUnits(res.subjects[0]?.units);
        }
      });

    setParams({
      ...params,
      notInTest: id,
    });
  }, []);

  const importFunc = async () => {
    if (!importingQuestions.length) {
      return;
    }
    setProcessing(true);
    if (selectAll || excludedQuestions.length) {
      setCurrentSearchParams({
        ...currentSearchParams,
        excludeQuestions: excludedQuestions,
      });
      await questionSvc.importAllQuestionsFromSearch(
        test._id,
        currentSearchParams
      );
      setProcessing(false);
      router.push(`/assessment/details/${test._id}`);
    } else {
      questionSvc
        .importQuestion(
          test._id,
          selectedQuestions.map((q) => q._id)
        )
        .then((res: any) => {
          success("Questions are imported.");
          setProcessing(false);
          router.push(`/assessment/details/${test._id}`);

          // this.router.navigate(['./../../details', this.test._id], { relativeTo: this.activatedRoute, queryParams: { menu: 'question' } })
        })
        .catch((err) => {
          setProcessing(false);
          alert("Message", "Fail to import questions to this test.");
        });
    }
  };
  const deleteQuestion = (question: any) => {
    confirm(
      "Question will become inactive and will not be available for future use. Do you want to continue?",
      () => {
        questionSvc
          .destroy(question._id, { test: test._id })
          .then(() => {
            success("Question deleted successfully.");

            const qidx = questions.findIndex((q) => q._id == question._id);
            if (qidx > -1) {
              const update_question = questions.splice(qidx, 1);
              setQuestions(update_question);
            }
            setTotalQuestions(totalQuestion - 1);
          })
          .catch((err) => {
            console.log(err);
            alert("Message", "You are not authorized to perform this action");
          });
      }
    ).set("labels", { ok: "Yes", cancel: "No" });
  };

  const filter = () => {
    if (!params.subject) {
      alert("Message", "Please select a subject");
      return;
    }
    if (!params.units.length) {
      alert("Message", "Please select at least one unit");
      return;
    }

    setSelectAll(false);

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
      category: null,

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
      notInTest: test._id,
    });
    const param = {
      limit: 10,
      sort: "createdAt,-1",
      excludeTempt: true,
      subject: "",
      units: [],
      topics: [],
      category: null,

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
      notInTest: test._id,
    };
    setUnits([]);
    setTopics([]);
    setSelectAll(false);
    getQuestions(true, param);
  };

  const getQuestions = (refresh = false, param?: any, loadpage?: any) => {
    if (param) {
      if (processing) {
        return;
      }
      setProcessing(true);

      const copiedParams: any = {};
      for (const p in param) {
        if (param[p]) {
          if (p == "tags" && param[p][0]) {
            copiedParams.tags = param[p]?.map((p) => p.value);
          } else if (
            (p == "owners" || p == "topics" || p == "units") &&
            param[p].length
          ) {
            copiedParams[p] = param[p]?.map((p) => p._id);
          } else if (typeof param[p] == "object") {
            copiedParams[p] = param[p]._id;
          } else {
            copiedParams[p] = param[p];
          }
        }
      }
      if (refresh) {
        setCurrentPage(1);
        setQuestions([]);
        setExcludedQuestions([]);
        setTotalQuestions(0);
        setSelectedQuestions([]);
        copiedParams.includeCount = true;
      }
      copiedParams.page = currentPage;

      if (pageImport && (selectAll || excludedQuestions.length)) {
        copiedParams.excludeQuestions = excludedQuestions;
      }

      setCurrentSearchParams(copiedParams);
      questionSvc.getBankQuestions(copiedParams).then((res: any) => {
        if (refresh) {
          setQuestions(res.questions);
          setTotalQuestions(res.count);
        } else {
          setQuestions(questions.concat(res.questions));
        }

        if (selectAll || excludedQuestions.length) {
          res.questions.forEach((q) => {
            q.selected = true;
          });
          setSelectedQuestions([...selectedQuestions, ...res.questions]);
        } else {
          for (const sq of selectedQuestions) {
            const fq = res.questions.find((q) => q._id == sq._id);
            if (fq) {
              fq.selected = true;
            }
          }
        }

        if (pageImport) {
          setImportingQuestions(questions);
        }
      });
      setProcessing(false);
    } else {
      if (processing) {
        return;
      }
      setProcessing(true);

      const copiedParams: any = {};
      for (const p in params) {
        if (params[p]) {
          if (p == "tags" && params[p][0]) {
            copiedParams.tags = params.tags;
          } else if (
            (p == "owners" || p == "topics" || p == "units") &&
            params[p].length
          ) {
            copiedParams[p] = params[p]?.map((p) => p._id);
          } else if (typeof params[p] == "object") {
            copiedParams[p] = params[p]._id;
          } else {
            copiedParams[p] = params[p];
          }
        }
      }

      if (refresh) {
        setCurrentPage(1);
        setQuestions([]);
        setExcludedQuestions([]);
        setTotalQuestions(0);
        setSelectedQuestions([]);
        copiedParams.includeCount = true;
      }
      console.log(loadpage, "loadpage");
      if (loadpage) {
        copiedParams.page = loadpage;
      } else {
        copiedParams.page = currentPage;
      }

      if (pageImport && (selectAll || excludedQuestions.length)) {
        copiedParams.excludeQuestions = excludedQuestions;
      }

      setCurrentSearchParams(copiedParams);
      questionSvc.getBankQuestions(copiedParams).then((res: any) => {
        if (refresh) {
          setQuestions(res.questions);
          setTotalQuestions(res.count);
        } else {
          setQuestions(questions.concat(res.questions));
        }

        if (selectAll || excludedQuestions.length) {
          res.questions.forEach((q) => {
            q.selected = true;
          });
          setSelectedQuestions([...selectedQuestions, ...res.questions]);
        } else {
          for (const sq of selectedQuestions) {
            const fq = res.questions.find((q) => q._id == sq._id);
            if (fq) {
              fq.selected = true;
            }
          }
        }

        if (pageImport) {
          setImportingQuestions(questions);
        }
      });
      setProcessing(false);
    }
  };

  const loadMore = () => {
    setCurrentPage(currentPage + 1);
    getQuestions(false, false, currentPage + 1);
  };

  const track = (index, item) => {
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
          setExcludedQuestions([...excludedQuestions, q._id]);
        }
      }

      setQuestions(updatedQuestions); // Update the state with the modified questions array
    }
  };

  const onUnitsSelectionChanged = (item: any) => {
    setParams({
      ...params,
      units: item,
    });

    setTopics([]);
    let update_topics: any = [];
    for (const unit of item) {
      const orgUnit = units.find((u) => u._id == unit._id);
      update_topics = update_topics.concat(orgUnit.topics);
      setTopics(update_topics);
      console.log(update_topics, "topics");
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
    setExcludedQuestions([]);
  };

  const toSelectedList = () => {
    setPageImport(true);
  };

  const nextStep = () => {
    if (selectAll || excludedQuestions?.length) {
      setImportingQuestions(selectedQuestions);
      setTotalImportingQuestions(totalQuestion - excludedQuestions.length);
    } else {
      console.log(importingQuestions, "imp");
      setImportingQuestions(selectedQuestions);
      setTotalImportingQuestions(selectedQuestions?.length);
    }
    setPageImport(true);
  };

  const preStep = () => {
    setImportingQuestions(null);
    setPageImport(false);
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

  const onTopicsSelectisetonChanged = (item: any) => {
    setParams({
      ...params,
      topics: item,
    });
  };

  const cancel = () => {
    router.push("/assessment/details/" + test._id);
  };

  return (
    <div style={{ backgroundColor: "#f4f4f7" }}>
      <div className="container" style={{ paddingTop: "30px" }}>
        {!pageImport ? (
          <div className="dashboard-area quesBankImport mx-auto mb-5">
            <div className="rounded-boxes bg-white form-boxes mt-3">
              <span className="material-icons" style={{ marginTop: "10px" }}>
                assignment
              </span>
              <h4 className="assTitle f-16 ml-3">
                <strong>{test?.title}</strong>
              </h4>
              {test?.isAdaptive && <div>Adaptive Assessment</div>}
            </div>
            <div className="rounded-boxes bg-white form-boxes mt-3">
              <h3 className="form-box_title text-primary">
                Filter Questions from Question Bank
              </h3>
              <div className="row mt-2 sutpc">
                <div className="col-lg-4">
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
                    <option value="" disabled>
                      Select One
                    </option>
                    {subjects?.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <hr />
                </div>
                <div className="col-lg-4">
                  <h4 className="form-box_subtitle">Unit</h4>
                  <div className=" LibraryChange_new">
                    <Multiselect
                      options={units}
                      displayValue="name"
                      selectedValues={params.units}
                      onSelect={onUnitsSelectionChanged}
                      onRemove={onUnitsSelectionChanged}
                      placeholder="Select one or more units"
                    />
                  </div>

                  <hr />
                </div>
                <div className="col-lg-4">
                  <h4 className="form-box_subtitle">Topic</h4>
                  <Multiselect
                    options={topics}
                    displayValue="name"
                    selectedValues={params.topics}
                    onSelect={onTopicsSelectisetonChanged}
                    onRemove={onTopicsSelectisetonChanged}
                    placeholder="Select one or more topics"
                  />
                  <hr />
                </div>
              </div>
              <div className="row mt-2 sutpc">
                <div className="col-lg-4">
                  <h4 className="form-box_subtitle">Question Type</h4>
                  <div>
                    <select
                      className="form-control form-control-sm"
                      name="subject"
                      value={params.category}
                      onChange={(e) => {
                        setParams({
                          ...params,
                          category: e.target.value,
                        });
                      }}
                    >
                      <option disabled>Select One</option>
                      <option value="" hidden></option>
                      <option value="mcq">Multiple choices</option>
                      <option value="fib">Fill in the blanks</option>
                      {clientData?.features.coding && (
                        <option value="code">Coding</option>
                      )}
                      <option value="descriptive">Descriptive</option>
                      <option value="mixmatch">Mixmatch</option>
                    </select>
                    <hr />
                  </div>
                </div>
                <div className="col-4">
                  <h4 className="form-box_subtitle">Question Tags</h4>
                  <div className="color-tags question-tag-input-control">
                    <input
                      className="border-bottom"
                      placeholder="Enter a new Tag"
                      type="text"
                      value={params.tags}
                      onChange={(e) => {
                        setParams({
                          ...params,
                          tags: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-4">
                  <h4 className="form-box_subtitle">Difficulty</h4>
                  <div className="mt-2">
                    <label className="container2 d-inline">
                      Easy
                      <input
                        type="checkbox"
                        name="Complexity"
                        checked={params.isEasy}
                        onChange={(e) => {
                          setParams({
                            ...params,
                            isEasy: e.target.checked,
                          });
                        }}
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>
                    <label className="container2 d-inline ml-3">
                      Medium
                      <input
                        type="checkbox"
                        name="Complexity"
                        checked={params.isModerate}
                        onChange={(e) => {
                          setParams({
                            ...params,
                            isModerate: e.target.checked,
                          });
                        }}
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>
                    <label className="container2 d-inline ml-3">
                      Hard
                      <input
                        type="checkbox"
                        name="Complexity"
                        checked={params.isDifficult}
                        onChange={(e) => {
                          setParams({
                            ...params,
                            isDifficult: e.target.checked,
                          });
                        }}
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>
                  </div>
                </div>
              </div>
              <div
                className="row mt-2"
                style={{ position: "relative", zIndex: "0" }}
              >
                <div className="col-8 d-flex flex-wrap gap-sm">
                  <div className="d-flex align-items-center">
                    <h4 className="form-box_subtitle">Show active only</h4>
                    <div className="switch-item mt-3 ml-3">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="active"
                          id="active"
                          checked={params.isActive}
                          onChange={(e) =>
                            setParams({
                              ...params,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <h4 className="form-box_subtitle">Show unused only</h4>
                    <div className="switch-item mt-3 ml-3">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="unused"
                          id="unused"
                          checked={params.unusedOnly}
                          onChange={(e) => {
                            setParams({
                              ...params,
                              unusedOnly: e.target.checked,
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <h4 className="form-box_subtitle">
                      Search my question only
                    </h4>
                    <div className="switch-item mt-3 ml-3">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="myquestion"
                          id="myquestion"
                          checked={params.myquestion}
                          onChange={(e) =>
                            setParams({
                              ...params,
                              myquestion: e.target.checked,
                            })
                          }
                          className="border-bottom"
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-4 d-flex gap-xs align-items-center justify-content-between gap-sm">
                  <div>
                    <h4 className="form-box_subtitle">Order By</h4>
                    <div>
                      <select
                        className="form-control form-control-sm"
                        name="subject"
                        value={params.sort}
                        onChange={(e) =>
                          setParams({
                            ...params,
                            sort: e.target.value,
                          })
                        }
                      >
                        <option value="updatedAt,1">First Update</option>
                        <option value="updatedAt,-1">Last Update</option>
                        <option value="createdAt,1">Oldest</option>
                        <option value="createdAt,-1">Newest</option>
                      </select>
                      <hr />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-sm">
                    <button
                      className="btn btn-light border-dark"
                      onClick={resetFilter}
                      disabled={processing}
                    >
                      <i className="fas fa-redo-alt"></i>
                      Clear
                    </button>
                    <button
                      className="btn btn-primary filter"
                      onClick={filter}
                      disabled={processing}
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-boxes bg-white form-boxes mt-3">
              <label className="container2 d-flex align-items-center mb-0">
                {selectAll ? (
                  <p className="ques-found-top f-16 mx-2">
                    {totalQuestion}/{totalQuestion}
                  </p>
                ) : (
                  <p className="ques-found-top f-16 mx-2">
                    {excludedQuestions?.length
                      ? totalQuestion - excludedQuestions?.length
                      : selectedQuestions?.length}
                    /{totalQuestion}
                  </p>
                )}
                <p className="ques-found-rights f-16 mt-0">
                  Questions Selected
                </p>
                <input
                  type="checkbox"
                  name="selectAll"
                  checked={selectAll}
                  onChange={(e) => {
                    selectAllChanged(e);
                  }}
                  disabled={!totalQuestion}
                />
                <span className="checkmark1 translate-middle-y filter-out"></span>
              </label>
            </div>
            <div className="question-list">
              {questions.map((question: any, qi: any) => (
                <div
                  key={qi}
                  className="bg-white p-3 mb-3 question-answer-list_number"
                >
                  <div className={`accordion`} id={`accordion_${question._id}`}>
                    <div className="area bg-white">
                      <div id={`heading${question._id}`}>
                        <div className="mb-1" style={{ fontSize: "15px" }}>
                          Choose question
                        </div>
                        <div className="form-row flex-nowrap">
                          <div className="col-auto">
                            <label className="container2 q-num my-0 f-16">
                              #{qi + 1}
                              <input
                                type="checkbox"
                                name={`cls_${question._id}`}
                                checked={question.selected}
                                onChange={() =>
                                  onQuestionSelectionChange(question)
                                }
                              />
                              <span className="checkmark1 translate-middle-y"></span>
                            </label>
                          </div>
                          <div className="col">
                            <button
                              className="btn btn-light btn-nofocus active border-0 text-left w-100 collapsed bg-white p-0"
                              type="button"
                              data-toggle="collapse"
                              data-target={`#collapseContent${question._id}`}
                              aria-expanded="true"
                              aria-controls={`collapseContent${question._id}`}
                            >
                              <div className="form-row">
                                <div className="col-12 col-md px-0">
                                  <div className="ques">
                                    <span className="filteredQuestion-out">
                                      <MathJax value={question.questionText} />
                                    </span>
                                  </div>
                                </div>
                                {question.user === user._id ||
                                  (user.role === "admin" && (
                                    <div
                                      className="col-12 col-md-auto mt-2 mt-md-0 text-right d-flex align-items-center justify-content-end"
                                      style={{
                                        display:
                                          question.user === user._id ||
                                          user.role === "admin"
                                            ? "flex"
                                            : "none",
                                      }}
                                    >
                                      <div className="btn-group-remove">
                                        <a
                                          className="btn btn-light btn-sm mr-2"
                                          href={`/${user.role}/question/edit/${question._id}`}
                                        >
                                          Edit
                                        </a>
                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteQuestion(question);
                                          }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                      <i className="fas fa-angle-up f-20 ml-2"></i>
                                    </div>
                                  ))}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        id={`collapseContent${question._id}`}
                        className="collapse"
                        aria-labelledby={`heading${question._id}`}
                        data-parent={`#accordion_${question._id}`}
                      >
                        <div className="given-answer">
                          <hr />
                          <div className="row expand-filteredQues">
                            <div className="col-lg-3 col-md-6 col">
                              <h6 className="topic_type_title">Subjects</h6>
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
                              <h6 className="topic_type_title">Section</h6>
                              <span className="topic_below_info">
                                {question.section}
                              </span>
                            </div>
                          </div>
                          <br />
                          <div className="row expand-filteredQues">
                            <div className="col-lg-3 col-md-6 col">
                              <h6 className="topic_type_title">Difficulty</h6>
                              <span className="topic_below_info">
                                {question.complexity}
                              </span>
                            </div>
                            <div className="col-lg-3 col-md-6 col">
                              <h6 className="topic_type_title">
                                Correct Answer Type
                              </h6>
                              <span className="topic_below_info">
                                {question.questionType}
                              </span>
                            </div>
                            <div className="col-lg-3 col-md-6 col">
                              <h6 className="topic_type_title">
                                Number of Options
                              </h6>
                              <span className="topic_below_info">
                                {question.answers.length}
                              </span>
                            </div>
                            <div
                              className="col-lg-3 col-md-6 col"
                              style={{
                                display: !test.isMarksLevel ? "block" : "none",
                              }}
                            >
                              <h6 className="topic_type_title">Marks</h6>
                              <span className="topic_below_info mark-p text-white ml-0 d-inline-block">
                                +{question.plusMark}
                              </span>
                              <span className="topic_below_info mark-n text-white d-inline-block">
                                {question.minusMark}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="given-answer expand-filteredQues">
                          <hr />
                          <h6 className="topic_type_title">Question Tag</h6>
                          <div className="question-tags">
                            {question.tags.map((tag, index) => (
                              <span key={index} className="tags">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          className="given-answer expand-filteredQues"
                          style={{
                            display: question.questionHeader ? "block" : "none",
                          }}
                        >
                          <hr />
                          <h6 className="topic_type_title">Instruction</h6>
                          <span className="topic_below_info">
                            <MathJax value={question.questionHeader} />
                          </span>
                        </div>
                        <div className="given-answer expand-filteredQues">
                          <hr />
                          <h6 className="topic_type_title">Question</h6>
                          <span className="topic_below_info">
                            <MathJax value={question.questionText} />
                          </span>
                        </div>
                        <div
                          className="given-answer expand-filteredQues"
                          data-switch={question.category}
                        >
                          {question.category === "mcq" && (
                            <>
                              <hr />
                              {question.answers.map((ans, i) => (
                                <h6 key={i} className="topic_type_title">
                                  Answer Option {i + 1}
                                  {ans.isCorrectAnswer && (
                                    <span className="text-green ml-2">
                                      (Correct Option)
                                    </span>
                                  )}
                                  <span className="assess-ques">
                                    <MathJax value={ans.answerText} />
                                  </span>
                                </h6>
                              ))}
                            </>
                          )}
                          {question.category === "code" && (
                            <>
                              <hr />
                              {question.hasArg &&
                                question.argumentDescription && (
                                  <div>
                                    <h6 className="topic_type_title">
                                      Arguments
                                    </h6>
                                    <span className="codeArgDescriptIon">
                                      {question.argumentDescription}
                                    </span>
                                  </div>
                                )}
                              {question.hasUserInput &&
                                question.userInputDescription && (
                                  <div>
                                    <h6 className="topic_type_title">Input</h6>
                                    <span className="codeArgDescriptIon">
                                      {question.userInputDescription}
                                    </span>
                                  </div>
                                )}
                              <h6 className="topic_type_title">Test Cases</h6>
                              {/* Render test cases here */}
                            </>
                          )}
                          {/* Add more cases as needed */}
                        </div>
                        <div
                          className="given-answer expand-filteredQues"
                          style={{
                            display:
                              question.category !== "code" ? "block" : "none",
                          }}
                        >
                          <hr />
                          <h6 className="topic_type_title">
                            Answer Explanation
                          </h6>
                          <span className="topic_below_info">
                            {!question.answerExplain ? (
                              "No answer explanation"
                            ) : (
                              <MathJax value={question.answerExplain} />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {processing && (
              <div className="mt-2">
                <div className="mb-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                </div>
                <div className="mb-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                </div>
                <div className="mb-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                </div>
                <div className="mb-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                </div>
                <div className="mb-2">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="100" />
                </div>
              </div>
            )}

            <div className="mt-4 row mb-4">
              <div className="col"></div>
              <div className="col-auto text-center">
                {totalQuestion > questions.length && !processing && (
                  <button className="btn btn-light" onClick={loadMore}>
                    Load More
                  </button>
                )}
              </div>
              <div className="col text-right">
                <button
                  className="btn btn-outline steppers mr-3"
                  onClick={cancel}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={!selectedQuestions.length || processing}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-area mx-auto mb-5">
            <div className="rounded-boxes bg-white mt-3">
              <div className="row">
                <div className="col">
                  <strong className="text-black">
                    <i className="fas fa-file-signature"></i> {test?.title}
                  </strong>
                  {test?.isAdaptive && <div>(Adaptive Assessment)</div>}
                </div>
                <div className="col text-right">
                  <span>
                    <strong>{totalImportingQuestions}</strong>
                  </span>
                  &nbsp;selected questions
                </div>
              </div>
            </div>
            <div className="question-list">
              {importingQuestions?.map((question, index) => (
                <div
                  key={index}
                  className="bg-white p-3 mb-3 question-answer-list_number"
                >
                  <div className="accordion" id={`accordion_${question._id}`}>
                    <div className="area bg-white">
                      <div
                        id={`heading${question._id}`}
                        style={{ marginLeft: "10px" }}
                      >
                        <h6>
                          <div className="form-row flex-nowrap">
                            <div className="col-auto">
                              <label className="q-num my-0 f-16">
                                #{index + 1}
                              </label>
                            </div>
                            <div className="col" style={{ marginTop: "1px" }}>
                              <button
                                className="btn btn-light btn-nofocus active border-0 text-left w-100 collapsed bg-white p-0"
                                type="button"
                                data-toggle="collapse"
                                data-target={`#collapseContent${question._id}`}
                                aria-expanded="true"
                                aria-controls={`collapseContent${question._id}`}
                              >
                                <div className="form-row">
                                  <div className="col">
                                    <div className="ques">
                                      <span>
                                        <MathJax
                                          value={question.questionText}
                                        />
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-auto">
                                    <i className="fas fa-angle-up f-20 mr-4 "></i>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </h6>
                      </div>
                      <div
                        id={`collapseContent${question._id}`}
                        className="collapse"
                        aria-labelledby={`heading${question._id}`}
                        data-parent={`#accordion_${question._id}`}
                      >
                        <div className="given-answer">
                          <hr />
                          <div className="row">
                            <div className="col-lg-3 col-md-6 col">
                              <h6 className="topic_type_title">Subjects</h6>
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
                              <h6 className="topic_type_title">Section</h6>
                              <span className="topic_below_info">
                                {question.section}
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
                              <h6 className="topic_type_title">
                                Correct Answer Type
                              </h6>
                              <span className="topic_below_info">
                                {question.questionType}
                              </span>
                            </div>
                            <div className="col-lg-3 col-md-6 col">
                              <h6 className="topic_type_title">
                                Number of Options
                              </h6>
                              <span className="topic_below_info">
                                {question.answers.length}
                              </span>
                            </div>
                            <div
                              className="col-lg-3 col-md-6 col"
                              style={{
                                display: !test.isMarksLevel ? "block" : "none",
                              }}
                            >
                              <h6 className="topic_type_title">Marks</h6>
                              <span className="topic_below_info mark-p text-white ml-0 d-inline-block">
                                +{question.plusMark}
                              </span>
                              <span className="topic_below_info mark-n text-white d-inline-block">
                                {question.minusMark}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="given-answer">
                          <hr />
                          <h6 className="topic_type_title">Question Tag</h6>
                          <div className="question-tags">
                            {question.tags.map((tag, index) => (
                              <span key={index} className="tags">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {question.questionHeader && (
                          <div className="given-answer">
                            <hr />
                            <h6 className="topic_type_title">Instruction</h6>
                            <span className="topic_below_info">
                              <MathJax value={question.questionHeader} />
                            </span>
                          </div>
                        )}
                        <div className="given-answer">
                          <hr />
                          <h6 className="topic_type_title">Question</h6>
                          <span className="topic_below_info">
                            <MathJax value={question.questionText} />
                          </span>
                        </div>
                        <div className="given-answer">
                          {question.category === "mcq" && (
                            <>
                              <hr />
                              {question.answers.map((ans, i) => (
                                <h6 className="topic_type_title" key={i}>
                                  Answer Option {i + 1}
                                  {ans.isCorrectAnswer && (
                                    <span className="text-green ml-2">
                                      (Correct Option)
                                    </span>
                                  )}
                                  <span className="assess-ques">
                                    <MathJax value={ans.answerText} />
                                  </span>
                                </h6>
                              ))}
                            </>
                          )}

                          {question.category === "code" && (
                            <>
                              <hr />
                              {question.hasArg &&
                                question.argumentDescription && (
                                  <div>
                                    <h6 className="topic_type_title">
                                      Arguments
                                    </h6>
                                    <span className="codeArgDescriptIon">
                                      {question.argumentDescription}
                                    </span>
                                  </div>
                                )}

                              {question.hasUserInput &&
                                question.userInputDescription && (
                                  <div>
                                    <h6 className="topic_type_title">Input</h6>
                                    <span className="codeArgDescriptIon">
                                      {question.userInputDescription}
                                    </span>
                                  </div>
                                )}

                              <h6 className="mt-2">Test Cases</h6>
                              <div className="row testcase-header">
                                {question.hasArg ||
                                  (question.hasUserInput && (
                                    <div className="col">
                                      <div className="ml-1">
                                        {question.hasArg && (
                                          <h6 className="topic_type_title">
                                            Arguments
                                          </h6>
                                        )}
                                        {question.hasUserInput && (
                                          <h6 className="topic_type_title">
                                            Input
                                          </h6>
                                        )}
                                      </div>
                                    </div>
                                  ))}

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
                                  <div className="row" key={index}>
                                    <div className="col">
                                      <div className="row">
                                        {question.hasArg && (
                                          <div className="col pre-wrap">
                                            {testcase.args}
                                          </div>
                                        )}
                                        {question.hasUserInput && (
                                          <div className="col pre-wrap">
                                            {testcase.input}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="col pre-wrap">
                                      {testcase.output}
                                    </div>
                                    <div className="col-auto my-2">
                                      <div style={{ width: "90px" }}>
                                        {testcase.isSample && (
                                          <em className="text-primary">
                                            Sample
                                          </em>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2">
                                <Tabs id="noanim-tab-example" className="mb-3">
                                  {question.coding.map((code, index) => (
                                    <Tab
                                      title={code.language}
                                      eventKey={index}
                                      key={index}
                                    >
                                      <h6 className="topic_type_title">
                                        Constraints
                                      </h6>
                                      <div className="row text-dark">
                                        <div className="col">
                                          <span>Time Limit: </span>{" "}
                                          <strong>{code.timeLimit || 0}</strong>{" "}
                                          seconds
                                        </div>
                                        <div className="col">
                                          <span>Memory Limit: </span>{" "}
                                          <strong>{code.memLimit || 0}</strong>{" "}
                                          MB
                                        </div>
                                      </div>

                                      <h6 className="topic_type_title">
                                        Template
                                      </h6>
                                      <CodeMirror value={code.template} />

                                      <h6 className="topic_type_title">
                                        Solution
                                      </h6>
                                      <CodeMirror value={code.solution} />
                                    </Tab>
                                  ))}
                                </Tabs>
                              </div>
                            </>
                          )}

                          {question.category === "mixmatch" && (
                            <>
                              <hr />
                              <div className="selection-wrap mx-4">
                                <div className="mix-match d-flex">
                                  <div className="mix-match-content d-flex">
                                    <div className="mix-match-content-inner">
                                      <div className="mix-match-drag">
                                        {question.answers.map((ans, index) => (
                                          <MathJax
                                            value={ans.answerText}
                                            key={index}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <div className="line-wrap">
                                      {question.answers.map((ans, index) => (
                                        <div className="line" key={index}></div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="mix-match-drop-wrap">
                                    {question.answers.map((a, index) => (
                                      <div
                                        className="mix-match-drop border-0 bg-white"
                                        key={index}
                                      >
                                        <MathJax value={a.userText} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {question.category !== "code" && (
                          <div className="given-answer">
                            <hr />
                            <h6 className="topic_type_title">
                              Answer Explanation
                            </h6>
                            {!question.answerExplain && (
                              <span className="topic_below_info">
                                No answer explanation
                              </span>
                            )}
                            {question.answerExplain && (
                              <span className="topic_below_info">
                                <MathJax value={question.answerExplain} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 row">
                <div className="col"></div>
                <div className="col-auto text-center">
                  {totalImportingQuestions > importingQuestions?.length &&
                    !processing && (
                      <button className="btn btn-light" onClick={loadMore}>
                        Load More
                      </button>
                    )}
                </div>
                <div className="col text-right">
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-light mr-2"
                      disabled={processing}
                      onClick={preStep}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={processing}
                      onClick={importFunc}
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportQuestion;
