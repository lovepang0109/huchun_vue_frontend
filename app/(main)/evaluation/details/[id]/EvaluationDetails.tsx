"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as evaluationSvc from "@/services/evaluationService";
import moment from "moment";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import PImageComponent from "@/components/AppImage";
import EvaluationDetailsViewStudent from "./EvaluationDetailsViewStudent";
import EvaluationDetailsViewQuestion from "./EvaluationDetailsViewQuestion";

const EvaluationDetails = () => {
  const router = useRouter();
  const { id } = useParams();
  const queryParams = useSearchParams();

  const [questions, setQuestions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<any>(null);
  const [evaluatedQuestions, setEvaluatedQuestions] = useState<any[]>([]);
  const [test, setTest] = useState<any>(null);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [view, setView] = useState<string>("question");
  const [options, setOptions] = useState<any>({
    systemParam: false,
    attemptId: "",
  });

  useEffect(() => {
    setOptions({
      ...options,
      systemParam: !!queryParams.get("system"),
    });
    let query: any = {};
    if (!!queryParams.get("system")) {
      query.system = queryParams.get("system");
    }
    setOptions({
      ...options,
      attemptId: queryParams.get("attemptId"),
    });
    if (queryParams.get("attemptId")) {
      query.attemptId = queryParams.get("attemptId");
    }

    evaluationSvc.startTestEvaluation(id, query).then((res) => {
      setTest(res);
      if (res.startDate) {
        setTest({
          ...test,
          endDate: moment(res.startDate).add(res.totalTime, "m"),
        });
      }

      query = { isPending: isPending };
      if (options.systemParam) {
        query.system = 1;
      }

      if (options.attemptId) {
        query.attemptId = options.attemptId;
      }
    });
  }, []);

  return (
    <>
      <div className="topBlockHeader allEvalPages">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mt-3">
              {test ? (
                <div className="rounded-boxes bg-white">
                  <div className="row eval-header">
                    <div className="col-lg-4 eval-firstBlock eval-title">
                      <div className="d-flex square_profile_info">
                        <div className="squared-rounded_wrap_60">
                          <PImageComponent
                            sm={true}
                            width={100}
                            height={60}
                            imageUrl={test.imageUrl}
                            backgroundColor={test.colorCode}
                            text={test.title}
                            radius={9}
                            fontSize={8}
                            type="assessment"
                            testMode={test.testMode}
                          />
                        </div>
                        <div className="eval-firstBlock  eval-title ml-2">
                          <div className="evalTitleAssessment">
                            <h3
                              className="top-title main-titel-evaluation"
                              style={{ fontSize: "16px" }}
                            >
                              {test.title}
                            </h3>
                            {test.startDate && (
                              <h4 className="bottom-title eval-titleAll">
                                <span className="material-icons align-bottom">
                                  date_range
                                </span>{" "}
                                {test.startDate} - {test.endDate}
                              </h4>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {view === "question" && (
                      <>
                        <div className="col-lg-2 col-6 eval-secondBlock text-center mt-2 mt-lg-0">
                          <h4 className="eval-number">{test.evaluatedQ}</h4>
                          <span>Evaluated Questions</span>
                        </div>
                        <div className="col-lg-2 col-6 eval-secondBlock text-center mt-2 mt-lg-0">
                          <h4 className="eval-number">{test.pendingQ}</h4>
                          <span>Pending Questions</span>
                        </div>
                      </>
                    )}

                    {view === "student" && (
                      <>
                        <div className="col-lg-2 col-6 eval-secondBlock text-center mt-2 mt-lg-0">
                          <h4 className="eval-number">{test.evaluatedS}</h4>
                          <span>Evaluated Students</span>
                        </div>
                        <div className="col-lg-2 col-6 eval-secondBlock text-center mt-2 mt-lg-0">
                          <h4 className="eval-number">{test.pendingS}</h4>
                          <span>Pending Students</span>
                        </div>
                      </>
                    )}

                    <div className="col-lg-auto ml-auto eval-thirdBlock justify-content-end align-self-baseline mt-2 mt-lg-0">
                      <div className="d-flex flex-direction-column upper-sliderInline align-items-center">
                        <div className="d-flex align-items-center">
                          <span className="slider-textLeft">
                            Pending Evaluation
                          </span>
                          <div className="switch-item float-left">
                            <label className="switch">
                              <input
                                type="checkbox"
                                name="pendingToggle"
                                aria-label="pending question toggle"
                                checked={isPending}
                                onChange={(e) => setIsPending(!isPending)}
                              />
                              <span className="slider round translate-middle-y"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="bottom-radioBlocks d-flex justify-content-lg-end">
                        <div className="container1 m-0">
                          <div className="radio">
                            <input
                              type="radio"
                              value="student"
                              name="view"
                              id="view_s"
                              checked={view === "student"}
                              onChange={(e) => setView("student")}
                            />
                            <label htmlFor="view_s"></label>
                          </div>
                        </div>
                        <div className="rights m-2">Student-wise</div>

                        <div className="container1 m-0">
                          <div className="radio">
                            <input
                              type="radio"
                              value="question"
                              name="view"
                              id="view_q"
                              checked={view === "question"}
                              onChange={(e) => setView("question")}
                            />
                            <label htmlFor="view_q"></label>
                          </div>
                        </div>
                        <div className="rights m-2">Question-wise</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="87" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <main className="pt-0">
        <div className="container">
          <div className="dashboard-area classroom mx-auto mw-100">
            {test && (
              <>
                {view === "question" && (
                  <EvaluationDetailsViewQuestion
                    test={test}
                    setTest={setTest}
                    questions={questions}
                    setQuestions={setQuestions}
                    pendingQuestions={pendingQuestions}
                    setPendingQuestions={setPendingQuestions}
                    evaluatedQuestions={evaluatedQuestions}
                    setEvaluatedQuestions={setEvaluatedQuestions}
                    options={options}
                    isPending={isPending}
                  />
                )}
                {view === "student" && (
                  <EvaluationDetailsViewStudent
                    test={test}
                    setTest={setTest}
                    students={students}
                    setStudents={setStudents}
                    options={options}
                    isPending={isPending}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default EvaluationDetails;
