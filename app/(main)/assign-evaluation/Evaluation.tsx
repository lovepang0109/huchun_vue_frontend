"use client";
import { useEffect, useState, useRef } from "react";
import * as evalSvc from "@/services/evaluationService";
import * as userService from "@/services/userService";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import CustomPagination from "@/components/CustomPagenation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import AddEvaluatorModal from "./AddEvaluatorModal";
import RemoveEvaluatorModal from "./RemoveEvaluatorModal";
import { useRouter } from "next/navigation";

export default function Evaluation() {
  const [activePage, setActivePage] = useState<string>("unassigned");

  const [assignedE, setAssignedE] = useState<any[]>([]);
  const [assignedTotal, setAssignedTotal] = useState<number>(0);
  const [loadingAssignedE, setLoadingAssignedE] = useState<boolean>(false);

  const [unassignedE, setUnassignedE] = useState<any[]>([]);
  const [unassignedTotal, setUnassignedTotal] = useState<number>(0);
  const [loadingUnassignedE, setLoadingUnassignedE] = useState<boolean>(false);

  const [assignedParams, setAssignedParams] = useState<any>({
    limit: 5,
    page: 1,
    text: "",
  });

  const [unassignedParams, setUnassignedParams] = useState<any>({
    limit: 15,
    page: 1,
    text: "",
  });

  const [addEvaluatorModal, setAddEvaluatorModal] = useState<boolean>(false);
  const [removeEvaluatorModal, setRemoveEvaluatorModal] =
    useState<boolean>(false);

  const [addtest, setAddtest] = useState<any>(null);
  const [removetest, setRemovetest] = useState<any>(null);
  const [removeevaluator, setRemoveevalutor] = useState<any>(null);
  const { push } = useRouter();

  useEffect(() => {
    userService.get().then((us) => {
      if (us.role === "director" || us.role === "admin") {
        refreshUnassigned();
        refreshAssigned();
      } else {
        push("/home");
      }
    });
  }, []);

  const refreshUnassigned = (search?: string) => {
    if (!search) {
      search = "";
    }
    setUnassignedParams({
      ...unassignedParams,
      page: 1,
      text: search,
    });
    setUnassignedTotal(0);
    setUnassignedE([]);
    const params = {
      ...unassignedParams,
      page: 1,
      text: search,
    };

    getUnassigned(true, params);
  };

  const getUnassigned = (includeCount: boolean, para?: any) => {
    if (!para) {
      para = unassignedParams;
    }
    const params: any = { limit: para.limit, page: para.page };
    if (includeCount) {
      params.includeCount = true;
    }
    if (para.text) {
      params.text = para.text;
    }
    setLoadingUnassignedE(true);
    evalSvc
      .getUnassignedTests(params)
      .then((res: any) => {
        if (includeCount) {
          setUnassignedTotal(res.count);
        }
        setUnassignedE(res.tests);
        setLoadingUnassignedE(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingUnassignedE(false);
      });
  };

  const refreshAssigned = (search?: string) => {
    if (!search) {
      search = "";
    }
    setAssignedParams({
      ...assignedParams,
      page: 1,
      text: search,
    });
    setAssignedTotal(0);
    const params = {
      ...assignedParams,
      page: 1,
      text: search,
    };
    getAssigned(true, params);
  };

  const getAssigned = (includeCount: boolean, para?: any) => {
    if (!para) {
      para = assignedParams;
    }
    const params: any = { limit: para.limit, page: para.page };
    if (includeCount) {
      params.includeCount = true;
    }
    if (para.text) {
      params.text = para.text;
    }
    setLoadingAssignedE(true);
    evalSvc
      .getAssignedTests(params)
      .then((res: any) => {
        if (includeCount) {
          setAssignedTotal(res.count);
        }
        setAssignedE(res.tests);
        setLoadingAssignedE(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingAssignedE(false);
      });
  };

  const assignEvaluator = (test: any) => {
    setAddEvaluatorModal(true);
    setAddtest(test);
    // closeEvent(test._id)
  };
  const closeEvent = (testId: string) => {
    if (testId) {
      setUnassignedTotal(unassignedTotal - 1);
      const idx = unassignedE.findIndex((e) => e._id == testId);
      if (idx > -1) {
        const tmp = unassignedE;
        tmp.splice(idx, 1);
        setUnassignedE(tmp);
      }
      refreshAssigned();
    }
  };

  const removeEvaluator = (test, evaluator) => {
    setRemoveEvaluatorModal(true);
    setRemoveevalutor(evaluator);
    setRemovetest(test);
  };

  const removeCloseEvent = (data: any) => {
    if (data.test) {
      const idx = assignedE.findIndex((e) => e._id == data.test);
      if (idx > -1) {
        getAssigned(false);
      }

      if (data.option == "unassigned") {
        setAssignedTotal(assignedTotal - 1);
        refreshUnassigned();
      }
    }
  };

  const unassignedPageChanged = (ev) => {
    setUnassignedParams({
      ...unassignedParams,
      page: ev,
    });
    const para = {
      ...unassignedParams,
      page: ev,
    };
    getUnassigned(false, para);
  };

  const assignedPageChanged = (ev) => {
    setAssignedParams({
      ...assignedParams,
      page: ev,
    });
    const para = {
      ...assignedParams,
      page: ev,
    };
    getAssigned(false, para);
  };

  const openTab = (tab: string) => {
    setActivePage(tab);
    if (tab == "assigned" && !assignedE) {
      refreshAssigned();
    }
  };

  const searchUnassinged = (searchText: string) => {
    setUnassignedParams({
      ...unassignedParams,
      text: searchText,
    });
    refreshUnassigned(searchText);
  };

  const searchAssigned = (searchText: string) => {
    setAssignedParams({
      ...assignedParams,
      text: searchText,
    });
    refreshAssigned(searchText);
  };

  return (
    <>
      <main className="pt-3">
        <div className="container">
          <div className="dashboard-area classroom mx-auto">
            <div className="row">
              <div className="col-lg-2">
                <nav className="navbar navbar-expand-lg navbar-light sidebar p-0 mb-2 justify-content-end">
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
                      <li>
                        <a
                          className={
                            activePage === "unassigned" ? "active" : ""
                          }
                          onClick={() => openTab("unassigned")}
                        >
                          Unassigned ({unassignedTotal})
                        </a>
                      </li>
                      <li>
                        <a
                          className={activePage === "assigned" ? "active" : ""}
                          onClick={() => openTab("assigned")}
                        >
                          Assigned ({assignedTotal})
                        </a>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
              <div
                className={`col-lg-10 evaluationAdminSide1 ${
                  activePage !== "unassigned" ? "d-none" : ""
                }`}
              >
                <div className="row align-items-center adminTopRow1 mb-3">
                  <div className="col-md">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        Unassigned Evaluation
                      </h3>
                    </div>
                  </div>
                  <div className="col-md">
                    <div className="common_search-type-1 form-half ml-auto">
                      <span>
                        <figure className="img-search">
                          <img src="/assets/images/search-icon-2.png" alt="" />
                        </figure>
                      </span>
                      <input
                        type="text"
                        name="unassignedSearch"
                        value={unassignedParams.text}
                        onChange={(e) => {
                          searchUnassinged(e.target.value);
                        }}
                        placeholder="Search for Assessments"
                        style={{ border: "1px" }}
                      />
                    </div>
                  </div>
                </div>

                {!loadingUnassignedE ? (
                  unassignedE.length > 0 ? (
                    <div className="folder-area clearfix rounded-boxes bg-white m-0">
                      <div className="table-wrap table-responsive adminTableLayout-1">
                        <table className="table vertical-middle mb-0">
                          <thead>
                            <tr>
                              <th className="border-0 px-0">
                                <div className="d-flex align-items-center">
                                  <span className="material-icons">
                                    receipt_long
                                  </span>
                                  <span className="stud1 ml-1 my-0">Test</span>
                                </div>
                              </th>
                              <th className="border-0 tableCenterHead1">
                                <div className="d-flex align-items-center justify-content-center">
                                  <span className="material-icons adminEvalMaterial-1-remove">
                                    assignment
                                  </span>
                                  <span className="stud1 ml-1 my-0">
                                    Questions
                                  </span>
                                </div>
                              </th>
                              <th className="border-0 tableCenterHead1">
                                <div className="d-flex align-items-center justify-content-center">
                                  <span className="material-icons adminEvalMaterial-1-remove">
                                    people
                                  </span>
                                  <span className="stud1 ml-1 my-0">
                                    Attempt
                                  </span>
                                </div>
                              </th>
                              <th className="border-0"></th>
                            </tr>
                          </thead>

                          <tbody>
                            {unassignedE.map((ev, index) => (
                              <tr key={index}>
                                <td className="px-0">
                                  <div className="folder mb-0 p-0">
                                    <div className="inner">
                                      <h4>{ev.testTitle}</h4>
                                    </div>
                                  </div>
                                </td>
                                <td className="tableCenterHead1">
                                  <div className="email">
                                    <h4>{ev.pendingQuestions}</h4>
                                  </div>
                                </td>
                                <td className="tableCenterHead1">
                                  <div className="status tableCenterHead1s">
                                    <h4>{ev.pendingAttempts}</h4>
                                  </div>
                                </td>
                                <td className="text-right">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => assignEvaluator(ev)}
                                  >
                                    Select Evaluator
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="class-board col-lg-10 text-center">
                      <img
                        src="/assets/images/no-question.svg"
                        className="m-auto"
                        alt="No Questions"
                      />
                      <h6 className="mt-2">No Questions</h6>
                    </div>
                  )
                ) : (
                  <div>
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                  </div>
                )}

                {unassignedTotal > unassignedParams.limit && (
                  <div className="text-center mt-3">
                    <div className="d-inline-block">
                      <CustomPagination
                        totalItems={unassignedTotal}
                        limit={unassignedParams.limit}
                        currentPage={unassignedParams.page}
                        onPageChange={(e) => unassignedPageChanged(e)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`folder-board col-lg-10 evaluationAdminSide2 ${
                  activePage !== "assigned" ? "d-none" : ""
                }`}
              >
                <div className="row align-items-center mb-3">
                  <div className="col-md">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        Assigned Evaluation
                      </h3>
                    </div>
                  </div>
                  <div className="col-md">
                    <div className="common_search-type-1 form-half ml-auto">
                      <span>
                        <figure className="img-search">
                          <img src="/assets/images/search-icon-2.png" alt="" />
                        </figure>
                      </span>
                      <input
                        type="text"
                        name="assignedSearch"
                        value={assignedParams.text}
                        onChange={(e) => {
                          searchAssigned(e.target.value);
                        }}
                        placeholder="Search for Assessments"
                        style={{ border: "1px" }}
                      />
                    </div>
                  </div>
                </div>

                {!loadingAssignedE ? (
                  assignedE.length > 0 ? (
                    <div className="folder-area folder-evaluation-area_new clearfix">
                      {assignedE.map((test) => (
                        <div
                          key={test._id}
                          className="accordion rounded-boxes bg-white"
                          id={`accordion_${test._id}`}
                        >
                          <div id={`heading${test._id}`}>
                            <button
                              className="btn btn-light btn-nofocus border-0 bg-white text-left active text-dark px-0 w-100 collapsed"
                              data-toggle="collapse"
                              data-target={`#collapseContent${test._id}`}
                              aria-expanded="true"
                              aria-controls={`collapseContent${test._id}`}
                            >
                              <div className="form-row">
                                <div className="col-lg-8 col-6">
                                  <span className="material-icons f-16 alingCommoNGRow">
                                    receipt_long
                                  </span>
                                  <span className="commonFont-SizeK1 ml-1">
                                    {test.title}
                                  </span>
                                </div>
                                <div className="col-lg-3 col-5">
                                  <span className="material-icons f-16 alingCommoNGRow">
                                    people
                                  </span>
                                  <span className="commonFont-SizeK1 ml-1">
                                    <strong>{test.attempts}</strong> Attempts
                                  </span>
                                </div>
                                <div className="col-1 text-right">
                                  <FontAwesomeIcon
                                    icon={faAngleUp}
                                    className="f-20"
                                  />
                                </div>
                              </div>
                            </button>
                          </div>

                          <div
                            id={`collapseContent${test._id}`}
                            className="collapse border-top"
                            aria-labelledby={`heading${test._id}`}
                            data-parent={`#accordion_${test._id}`}
                          >
                            <div className="table-wrap table-responsive">
                              <table className="table mb-0">
                                <thead>
                                  <tr>
                                    <th className="border-0">
                                      <div className="student">Evaluators</div>
                                    </th>
                                    <th className="border-0">
                                      <div className="student text-center">
                                        Student Assigned
                                      </div>
                                    </th>
                                    <th className="border-0">
                                      <div className="student text-center">
                                        Question Assigned
                                      </div>
                                    </th>
                                    <th className="border-0">
                                      <div className="student text-center">
                                        Question Evaluated
                                      </div>
                                    </th>
                                    <th className="border-0">
                                      <div className="student text-center">
                                        Last Evaluated
                                      </div>
                                    </th>
                                    <th className="border-0"></th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {test.teachers.map((teacher, index) => (
                                    <tr key={index}>
                                      <td className="border-0">
                                        {teacher.name}
                                      </td>
                                      <td className="border-0 text-center">
                                        {teacher.students}
                                      </td>
                                      <td className="border-0 text-center">
                                        {teacher.questions}
                                      </td>
                                      <td className="border-0 text-center">
                                        {teacher.evaluated}
                                      </td>
                                      <td className="border-0 text-center">
                                        {teacher.evaluationDate &&
                                          new Date(
                                            teacher.evaluationDate
                                          ).toLocaleDateString()}
                                      </td>
                                      <td className="border-0">
                                        <a
                                          onClick={() =>
                                            removeEvaluator(test, teacher)
                                          }
                                        >
                                          <FontAwesomeIcon icon={faTimes} />
                                        </a>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <img
                        src="/assets/images/no-question.svg"
                        className="m-auto"
                        alt="No Questions"
                      />
                      <h6 className="mt-2">No Questions</h6>
                    </div>
                  )
                ) : (
                  <div>
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                    <SkeletonLoaderComponent Cwidth="100" Cheight="51" />
                  </div>
                )}

                {assignedTotal > assignedParams.limit && (
                  <div className="text-center mt-2">
                    <div className="d-inline-block">
                      <CustomPagination
                        totalItems={assignedTotal}
                        limit={assignedParams.limit}
                        currentPage={assignedParams.page}
                        onPageChange={assignedPageChanged}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        show={addEvaluatorModal}
        onHide={() => setAddEvaluatorModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <AddEvaluatorModal
          test={addtest}
          closeEvent={closeEvent}
          setAddEvaluatorModal={setAddEvaluatorModal}
        />
      </Modal>
      <Modal
        show={removeEvaluatorModal}
        onHide={() => setRemoveEvaluatorModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <RemoveEvaluatorModal
          test={removetest}
          evaluator={removeevaluator}
          closeEvent={removeCloseEvent}
          setRemoveEvaluatorModal={setRemoveEvaluatorModal}
        />
      </Modal>
    </>
  );
}
