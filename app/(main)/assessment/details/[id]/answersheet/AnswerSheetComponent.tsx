import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProgressBar } from "react-bootstrap";
import { numberToAlpha } from "@/lib/pipe";
import Link from "next/link";
import CustomPagination from "@/components/CustomPagenation";
import * as testSvc from "@/services/practiceService";
import * as questionSvc from "@/services/questionService";
import * as attemptService from "@/services/attemptService";
import RatingComponent from "@/components/rating";
import { fromNow, answerStatusToText } from "@/lib/pipe";
import { slugify } from "@/lib/validator";
import { jsonToCsv } from "@/lib/common";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import "./AnswerSheet.css";

const AnswerSheetComponent = ({
  practice,
  setPractice,
  practicesetId,
  updatePractice,
  user,
  settings,
  selectedSideMenu,
  downloading,
  setDownloading,
}: any) => {
  const [classrooms, setClassrom] = useState<any>([]);
  const [selectedClassroom, setSselectedClassroom] = useState<any>(null);
  const [params, setParams] = useState<any>({
    limit: 20,
    page: 1,
  });
  const [total, setTotal] = useState<number>(0);
  const [attempts, setAttempts] = useState<any>([]);
  const [questions, setQuestions] = useState<any>([]);
  const [testQuestions, setTestQuestions] = useState<any>([]);
  const [totalMark, setTotalMark] = useState<number>(0);
  const [avgMark, setAvgMark] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [paging, setPaging] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [modules, setModules] = useState<any>(null);
  const queryParams = useSearchParams();

  useEffect(() => {
    if (downloading) {
      exportCSV();
    }
  }, [downloading]);
  useEffect(() => {
    setLoading(true);
    questionSvc
      .getQuestionByTest(practice._id)
      .then((qs: any) => {
        setTestQuestions(qs);

        if (practice.accessMode != "invitation" || practice.assignee) {
          filterData(null, qs);
        } else {
          attemptService
            .getClassroomByTest(practice._id)
            .then((res) => {
              setClassrom(res);

              if (res[0]) {
                let classToView = res[0];
                if (queryParams.get("classId")) {
                  const found = res.find(
                    (cl) => cl._id == queryParams.get("classId")
                  );
                  if (found) {
                    classToView = found;
                  }
                }
                filterData(classToView, qs);
              } else {
                setLoading(false);
              }
            })
            .catch((err) => {
              console.log(
                "Something, Went wrong while fetching classroom info",
                err
              );
              setLoading(false);
            });
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const filterData = async (classroom?: any, testQ?: any) => {
    if (!testQ) {
      testQ = testQuestions;
    }
    let para = params;
    if (classroom) {
      setSselectedClassroom(classroom);
      setParams({
        ...params,
        classroom: classroom._id,
      });
      para = {
        ...params,
        classroom: classroom._id,
      };
    }

    try {
      const res: any = await attemptService.getAttemptsByTest(practice._id, {
        ...para,
        count: true,
      });
      // );

      console.log(res, "Res");

      setTotal(res.total);
      setAvgMark(res.avgMark);
      setTotalMark(res.maximumMarks);
      setQuestions([...testQ]);
      let temp = [...testQ];

      for (const sq of res.stats) {
        const question = temp.find((q) => q._id == sq._id);
        if (question) {
          question.percentCorrect = Math.round(
            (sq.totalCorrect / res.total) * 100
          );
          question.totalIncorrect = sq.totalIncorrect;
        } else {
          // const q_temp = temp;
          temp.push({
            _id: sq._id,
            category: sq.question.category,
            answers: sq.question.answers,
            plusMark: sq.question.plusMark,
            totalIncorrect: sq.question.totalIncorrect,
            percentCorrect: Math.round((sq.totalCorrect / total) * 100),
          });
          // setQuestions(q_temp);
        }
      }

      if (practice.testType == "section-adaptive" && !modules) {
        const tmp_modules = testSvc.getModuleTests(practice._id);
        setModules(tmp_modules);
      }

      for (const question of temp) {
        question.displayAnswers = [];
        if (question.category == "mcq") {
          let i = 0;
          for (const an of question.answers) {
            if (an.isCorrectAnswer) {
              question.displayAnswers.push(numberToAlpha(i));
            }
            i++;
          }
        }

        if (
          !question.order &&
          practice.testType == "section-adaptive" &&
          modules
        ) {
          if (modules.english) {
            if (modules.english.easy) {
              const found = modules.english.easy.questions.find(
                (mq) => mq.question == question._id
              );
              if (found) {
                question.order = "EE-" + found.order;
              }
            }
            if (!question.order && modules.english.hard) {
              const found = modules.english.hard.questions.find(
                (mq) => mq.question == question._id
              );
              if (found) {
                question.order = "EH-" + found.order;
              }
            }
          }

          if (!question.order && modules.math) {
            if (modules.math.easy) {
              const found = modules.math.easy.questions.find(
                (mq) => mq.question == question._id
              );
              if (found) {
                question.order = "ME-" + found.order;
              }
            }
            if (!question.order && modules.math.hard) {
              const found = modules.math.hard.questions.find(
                (mq) => mq.question == question._id
              );
              if (found) {
                question.order = "MH-" + found.order;
              }
            }
          }
        }
      }

      temp.sort((q1, q2) => {
        if (q1.totalIncorrect > q2.totalIncorrect) {
          return -1;
        }

        if (q1.totalIncorrect < q2.totalIncorrect) {
          return 1;
        }

        return 1;
      });

      setAttempts(processAttempts(res.attempts, temp));

      setQuestions(temp);
    } catch (ex) {
    } finally {
      setLoading(false);
    }
  };
  console.log(attempts, "ateeemots");

  const processAttempts = (attempts: any, questions: any) => {
    for (const attempt of attempts) {
      // re-arrange questions according to test questions
      attempt.newQA = [];
      for (const question of questions) {
        const qa = attempt.QA.find((q) => q.question == question._id);
        if (qa && qa.answers && qa.answers.length) {
          attempt.newQA.push(qa);
          qa.displayAnswers = [];
          if (question.category == "mcq") {
            for (const qas of qa.answers) {
              const aidx = question.answers.findIndex(
                (a) => a._id == qas.answerId
              );
              if (aidx > -1) {
                qa.displayAnswers.push(numberToAlpha(aidx));
              }
            }
          }
        } else {
          attempt.newQA.push({
            question: question._id,
            status: 3,
          });
        }
      }
    }

    return attempts;
  };

  const onPaging = () => {
    setPaging(true);
    attemptService
      .getAttemptsByTest(practice._id, { ...params })
      .then((res: any) => {
        setAttempts(processAttempts(res.attempts, questions));
        setPaging(false);
      });
  };

  const exportCSV = () => {
    const csvFileName = slugify(practice.title + " answer sheet") + ".csv";

    const questions_tmp = [...questions];
    questions_tmp.sort((q1, q2) => {
      if (q1.order > q2.order) {
        return 1;
      }

      if (q1.order < q2.order) {
        return -1;
      }

      return 1;
    });

    const dataPush = [
      [
        "Student",
        "Total Score",
        "Percent Score",
        ...questions_tmp.map((q) => q.order),
      ],
      [
        "Answer",
        totalMark,
        100,
        ...questions_tmp.map((q) => {
          if (q.category == "mcq") {
            return q.displayAnswers.join(", ");
          }
          return q.category;
        }),
      ],
    ];

    attemptService
      .getAttemptsByTest(practice._id, { ...params, noPaging: true })
      .then((res: any) => {
        const attempts = processAttempts(res.attempts, questions);

        for (const attempt of attempts) {
          const tmp = [
            attempt.user.name,
            attempt.totalMark,
            totalMark > 0
              ? ((attempt.totalMark / totalMark) * 100).toFixed(0)
              : 0,
          ];

          for (const qa of attempt.newQA) {
            if (qa.category == "mcq") {
              tmp.push(
                qa.displayAnswers.join(", ") +
                  (qa.status != 1
                    ? " (" + answerStatusToText(qa.status) + ")"
                    : "")
              );
            } else {
              tmp.push(answerStatusToText(qa.status));
            }
          }

          dataPush.push(tmp);
        }

        dataPush.push([
          "Average",
          avgMark.toFixed(0),
          totalMark > 0 ? ((avgMark / totalMark) * 100).toFixed(0) : 0,
          ...questions.map((q) => q.percentCorrect),
        ]);

        jsonToCsv(dataPush, csvFileName);

        setDownloading(false);
      })
      .catch((err) => {
        setDownloading(false);
      });
  };

  const getCategoryIcon = (category: any) => {
    switch (category) {
      case "fib":
        return "fa-edit";
      case "code":
        return "fa-code";
      case "descriptive":
        return "fa-pencil-ruler";
      case "mixmatch":
        return "fa-grip-horizontal";
      default:
        return "";
    }
  };

  const getCategoryTitle = (category: any) => {
    switch (category) {
      case "fib":
        return "Fill in the blank";
      case "code":
        return "Code";
      case "descriptive":
        return "Descriptive";
      case "mixmatch":
        return "Mismatch";
      default:
        return "";
    }
  };

  const getButtonClass = (status: any) => {
    switch (status) {
      case 1:
        return "correct-btn";
      case 2:
        return "incorrect-btn";
      case 4:
        return "pending-btn";
      case 5:
        return "partial-btn";
      case 3:
        return "missed-btn";
      default:
        return "";
    }
  };
  const LinkButton = ({ q, attempt, showAnswer }: any) => {
    console.log(q.category === "mcq", q.status !== 1, showAnswer, "false");
    return (
      <Link
        className={`btn btn-sm ${getButtonClass(q.status)}`}
        href={`/assessments/review/${practice._id}?attemptId=${attempt._id}&questionId=${q.question}&menu=answersheet&page=test`}
      >
        {q.category === "mcq" && q.status !== 1 && showAnswer ? (
          q.displayAnswers.map((a, idx) => <span key={idx}>{a}</span>)
        ) : (
          <span>&nbsp;&nbsp;&nbsp;</span>
        )}
      </Link>
    );
  };

  return (
    <>
      <main className="pt-0">
        <div className="assessment-settings non-stepper">
          <div className="classroom mx-auto">
            <div className="class-board folder-board bg-white rounded-boxes text-black overflow-auto">
              <div className="title allDetailPagePosition mb-3 p-0">
                {practice.accessMode == "invitation" &&
                  classrooms &&
                  classrooms.length > 0 && (
                    <div className="d-lg-block">
                      <div className="tab-content">
                        <div
                          className="tab-pane show active fade"
                          id="searchResult_1"
                        >
                          <div className="row filter-area nonStepper mb-3 clearfix">
                            <div className="col-lg-3 col-12 mb-2">
                              <div className="filter-item">
                                <div className="form-boxes mb-1">
                                  <h4 className="form-box_subtitle">
                                    Classroom
                                  </h4>
                                </div>
                                <div className="dropdown new-padding-1">
                                  <a
                                    className="btn dropdown-toggle text-left arranged-border"
                                    type="button"
                                    id="filterDurations"
                                    style={{ border: "1.125px solid #cfcfcf;" }}
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                  >
                                    <span>
                                      {selectedClassroom
                                        ? selectedClassroom.name
                                        : "Select a classroom"}
                                    </span>
                                  </a>
                                  <div
                                    className="dropdown-menu border-0 py-0 w-100"
                                    aria-labelledby="filterLavel"
                                  >
                                    {classrooms.map((classRoom: any) => (
                                      <a
                                        key={classRoom._id}
                                        className="dropdown-item pre-wrap"
                                        onClick={() => filterData(classRoom)}
                                      >
                                        {classRoom.name}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                {!loading ? (
                  <div className="folder-area">
                    {total > 0 ? (
                      <>
                        <div className="overflow-auto">
                          <table>
                            <tr>
                              <th className="ans-th">
                                <div>Students</div>
                              </th>
                              <th className="ans-th rotate-header">
                                <div>Total Score</div>
                              </th>
                              <th className="ans-th rotate-header">
                                <div
                                  style={{
                                    transform:
                                      "translate(-77px, -60px) rotate(-315deg)",
                                  }}
                                >
                                  Percent Score
                                </div>
                              </th>
                              {questions.map((q, i) => (
                                <th className="ans-th" key={i}>
                                  <div className="text-center">
                                    <span>{q.order}</span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                            <tr className="bg-color7">
                              <td className="ans-td">
                                <div>
                                  <b>Answer</b>
                                  <button
                                    className={`btn text-primary ${
                                      loading ? "disabled" : ""
                                    }`}
                                    onClick={() => setShowAnswer(!showAnswer)}
                                  >
                                    <i
                                      className={`far ${
                                        showAnswer ? "fa-eye" : "fa-eye-slash"
                                      }`}
                                    ></i>
                                  </button>
                                </div>
                              </td>
                              <td className="ans-td">
                                <div className="text-center">{totalMark}</div>
                              </td>
                              <td className="ans-td">
                                <div className="text-center">100</div>
                              </td>
                              {questions.map((q, i) => (
                                <td key={i} className="ans-td">
                                  <div
                                    className={`d-flex justify-content-around gap-xs ${
                                      q.category === "mcq" ? "" : "text-center"
                                    }`}
                                  >
                                    {q.category === "mcq" && showAnswer ? (
                                      q.displayAnswers.map((a, idx) => (
                                        <span key={idx}>{a}</span>
                                      ))
                                    ) : q.category === "mcq" ? (
                                      <span>&nbsp;&nbsp;&nbsp;</span>
                                    ) : (
                                      <i
                                        className={`far ${getCategoryIcon(
                                          q.category
                                        )}`}
                                        title={getCategoryTitle(q.category)}
                                      ></i>
                                    )}
                                  </div>
                                </td>
                              ))}
                            </tr>
                            {!paging ? (
                              <>
                                {attempts.map((attempt) => (
                                  <tr key={attempt._id}>
                                    <td className="ans-td">
                                      <div>{attempt.user.name}</div>
                                    </td>
                                    <td className="bg-color7 ans-td">
                                      <div className="text-center">
                                        {attempt.totalMark}
                                      </div>
                                    </td>
                                    <td className="bg-color7 ans-td">
                                      <div className="text-center">
                                        {totalMark > 0
                                          ? (
                                              (attempt.totalMark / totalMark) *
                                              100
                                            ).toFixed(0)
                                          : 0}
                                      </div>
                                    </td>
                                    {attempt.newQA.map((q, i) => (
                                      <td key={i} className="ans-td">
                                        <div className="d-flex justify-content-around gap-xs">
                                          {q.status !== 3 ? (
                                            q.category === "mcq" ? (
                                              q.status !== 1 || showAnswer ? (
                                                q.displayAnswers.map(
                                                  (a, idx) => (
                                                    <Link
                                                      key={idx}
                                                      className={`btn btn-sm ${getButtonClass(
                                                        q.status
                                                      )}`}
                                                      href={`/assessment/review/${practice._id}?attemptId=${attempt._id}&questionId=${q.question}&menu=answersheet&page=test`}
                                                    >
                                                      {a}
                                                    </Link>
                                                  )
                                                )
                                              ) : (
                                                <a className="btn btn-sm correct-btn">
                                                  &nbsp;&nbsp;&nbsp;
                                                </a>
                                              )
                                            ) : (
                                              <Link
                                                className={`btn btn-sm ${getButtonClass(
                                                  q.status
                                                )}`}
                                                href={`/assessment/review/${practice._id}?attemptId=${attempt._id}&questionId=${q.question}&menu=answersheet&page=test`}
                                              >
                                                &nbsp;&nbsp;&nbsp;
                                              </Link>
                                            )
                                          ) : (
                                            <Link
                                              className="btn btn-sm missed-btn"
                                              href={`/assessment/review/${practice._id}?attemptId=${attempt._id}&questionId=${q.question}&menu=answersheet&page=test`}
                                            >
                                              &nbsp;&nbsp;&nbsp;
                                            </Link>
                                          )}
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </>
                            ) : (
                              <>
                                <tr>
                                  <td colspan="999" className="ans-td">
                                    <div className="py-1">
                                      <SkeletonLoaderComponent
                                        Cwidth="100"
                                        Cheight="40"
                                      />
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="999" className="ans-td">
                                    <div className="py-1">
                                      <SkeletonLoaderComponent
                                        Cwidth="100"
                                        Cheight="40"
                                      />
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="999" className="ans-td">
                                    <div className="py-1">
                                      <SkeletonLoaderComponent
                                        Cwidth="100"
                                        Cheight="40"
                                      />
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="999" className="ans-td">
                                    <div className="py-1">
                                      <SkeletonLoaderComponent
                                        Cwidth="100"
                                        Cheight="40"
                                      />
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="999" className="ans-td">
                                    <div className="py-1">
                                      <SkeletonLoaderComponent
                                        Cwidth="100"
                                        Cheight="40"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </>
                            )}

                            <tr className="bg-color7">
                              <td className="ans-td">
                                <div>
                                  <b>Average:</b>
                                </div>
                              </td>
                              <td className="ans-td">
                                <div className="text-center">
                                  {avgMark.toFixed(0)}
                                </div>
                              </td>
                              <td className="ans-td">
                                <div className="text-center">
                                  {totalMark > 0
                                    ? ((avgMark / totalMark) * 100).toFixed(0)
                                    : 0}
                                </div>
                              </td>
                              {questions.map((q, i) => (
                                <td className="ans-td" key={i}>
                                  <div className="d-flex justify-content-around gap-xs">
                                    <span>{q.percentCorrect}</span>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          </table>
                        </div>

                        <div className="text-center mt-3">
                          {total > params.limit && (
                            <CustomPagination
                              totalItems={total}
                              limit={params.limit}
                              currentPage={params.page}
                              onPageChange={onPaging}
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="empty-data">
                        <img src="/assets/images/no-data-1.svg" alt="No data" />
                        <p>No attempt found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="40" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                    <div className="my-2">
                      <SkeletonLoaderComponent Cwidth="100" Cheight="50" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AnswerSheetComponent;
