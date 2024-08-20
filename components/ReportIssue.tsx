import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getQuestionFeedbacks,
  respondFeedback,
  markQuestionResolved,
} from "@/services/feedbackService";
import { createDiscussionRespond } from "@/services/discussionService";
import { replaceBadWords } from "@/lib/common";
import { success, alert } from "alertifyjs";
import {
  Accordion,
  AccordionCollapse,
  AccordionToggle,
  Card,
} from "react-bootstrap";
import { Modal } from "react-bootstrap";
import MathJax from "@/components/assessment/mathjax";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import { fromNow } from "@/lib/pipe";
import { AnyAaaaRecord } from "dns";
import ToggleComponent from "@/components/ToggleComponent";

interface FeedbackEntry {
  comment: string;
  chatComment: string;
  classRooms: string[];
  studentId: string;
  question: string;
  _id: string;
}

const ReportIssueComponent = ({
  user,
  course,
  setCourse,
  testseries,
  test,
}: any) => {
  const router = useRouter();
  const [params, setParams] = useState<any>({});
  const [questions, setQuestions] = useState<any>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry>({
    comment: "",
    chatComment: "",
    classRooms: [],
    studentId: "",
    question: "",
    _id: "",
  });
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [feedbackOptions, setFeedbackOptions] = useState<string>("");
  const [currentQues, setCurrentQues] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    total: 0,
    resolved: 0,
  });
  const [respondModal, setRespondeModal] = useState<boolean>(false);
  const [includeResolved, setIncludeResolved] = useState<boolean>(false);
  const [filteredQuestions, setFilteredQuestions] = useState<any>([]);

  const ckeOptionswithToolbar = {
    placeholder: "Share somethings...",
    ckeOptions: {
      simpleUpload: {
        uploadUrl: "/api/v1/files/discussionUpload?method=drop",
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": "CSRF-Token",
          Authorization: "Bearer " + user.token,
        },
      },
    },
  };

  useEffect(() => {
    const paramsData = params;
    if (course) {
      paramsData.course = course._id;
    } else if (testseries) {
      paramsData.testseries = testseries._id;
    } else if (test) {
      paramsData.practiceSet = test._id;
    }
    setParams(paramsData);
    getQuestionFeedbacksFunction(paramsData);
  }, []);

  const getQuestionFeedbacksFunction = async (data: any) => {
    getQuestionFeedbacks(data).then((result: any[]) => {
      const processquestionDataResult = processQuestionData(result);
      setQuestions(processquestionDataResult);
      filterQuestionFun(processquestionDataResult, includeResolved);
    });
  };

  const processQuestionData = (data: any[]) => {
    let statsData = stats;
    statsData.total = data.length;
    statsData.resolved = 0;
    data.forEach((r) => {
      let respondedCount = 0;
      let hasUnsolve = false;
      for (const fb of r.feedback) {
        if (fb.feedbackComments.length > 0) {
          fb.feedbackComments.forEach((fc: any) => {
            fb.comment = fb.comment + "<br>" + fc;
          });
        }
        if (!fb.resolved) {
          hasUnsolve = true;
        }

        respondedCount += fb.responded ? 1 : 0;
      }

      if (!hasUnsolve) {
        statsData.resolved++;
      }
      r.unsolved = hasUnsolve;

      r.respondedCount = respondedCount;
    });
    setStats(statsData);

    data.sort((q1, q2) => {
      if (!q1.unsolved && q2.unsolved) {
        return 1;
      }

      if (q1.unsolved && !q2.unsolved) {
        return -1;
      }

      return 1;
    });

    return data;
  };

  const openRespondModal = (question: any, feedback?: any) => {
    setCurrentQues(question);
    if (feedback) {
      setCurrentFeedback([feedback]);
    } else {
      setCurrentFeedback(question.feedback);
    }
    setRespondeModal(true);
  };

  const cancel = () => {
    setRespondeModal(false);
    setFeedback({
      ...feedback,
      comment: "",
      chatComment: "",
    });
  };

  const submit = () => {
    if (feedbackOptions === "discussion") {
      postDiscussion();
    } else if (feedbackOptions === "email") {
      sendMail();
    } else if (feedbackOptions === "chat") {
      chat();
    }
  };

  const postDiscussion = async () => {
    if (!feedback.comment) {
      return;
    }
    const dataToSave = {
      classRooms: [],
      comment: replaceBadWords(currentQues.questionText),
      feedType: "reportedIssueResponse",
      studentQ: [{}],
      teacherR: {
        comment: replaceBadWords(feedback.comment),
      },
    };

    if (course) {
      dataToSave.classRooms = course.classrooms.map((c: any) => c._id);
    } else if (testseries) {
      dataToSave.classRooms = testseries.classrooms.map((c: any) => c._id);
    } else if (test) {
      dataToSave.classRooms = test.classRooms.map((c: any) => c._id);
    }

    currentFeedback.forEach((element: any) => {
      dataToSave.studentQ.push({
        comment: element.comment,
        studentId: element.studentId,
        feedbackId: element.feedbackId,
      });
    });

    createDiscussionRespond(currentFeedback[0].feedbackId, dataToSave)
      .then((data: any) => {
        cancel();
        getQuestionFeedbacks(params).then((result: any[]) => {
          if (result.length === 0) {
            return;
          }
          setQuestions(processQuestionData(result));
          filterQuestionFun(processQuestionData(result), includeResolved);
        });
        success("Respond submitted successfully.");
      })
      .catch((err) => {
        alert("Message", "Action failed, Please try again.");
      });
  };

  const sendMail = () => {
    if (!feedback.comment) {
      return;
    }
    const dataToSave = {
      question: replaceBadWords(currentQues.questionText),
      studentQ: [{}],
      teacherR: {
        comment: replaceBadWords(feedback.comment),
      },
      test: currentQues.test.title,
    };

    currentFeedback.forEach((element: any) => {
      dataToSave.studentQ.push({
        studentId: element.studentId,
        feedbackId: element.feedbackId,
      });
    });

    respondFeedback(dataToSave, { sendMail: true })
      .then((da: any) => {
        cancel();
        getQuestionFeedbacks(params).then((result: any[]) => {
          if (result.length === 0) {
            return;
          }
          setQuestions(processQuestionData(result));
          filterQuestionFun(processQuestionData(result), includeResolved);
        });
        success("Email Sent successfully.");
      })
      .catch((err) => {
        alert("Message ", "Action failed, Please try again.");
      });
  };

  const chat = () => {
    //  TODO: implement chat feature
  };

  const resolveQuestion = (question: any, id: number) => {
    const questionsData = questions;
    markQuestionResolved(question._id)
      .then(() => {
        questionsData[id].unsolved = false;
        setQuestions(questionsData);
        setStats({ ...stats, resolved: stats.resolved + 1 });
        filterQuestionFun(questionsData, includeResolved);
        success("Question is resolved");
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const openQuestion = (question: any) => {
    const queryParams: any = { nav: false };
    if (test) {
      queryParams.testId = test._id;
      queryParams.testMenu = "issues";
    }
    // TODO: go to question bank link
    router.push(`/question/edit/${question._id}`, queryParams);
  };

  const filterQuestions = (value: boolean) => {
    filterQuestionFun(questions, value);
  };

  const filterQuestionFun = (data: any, value: boolean) => {
    setFilteredQuestions(
      value ? [...data] : data.filter((q: any) => q.unsolved)
    );
  };

  return (
    <>
      {questions && questions.length !== 0 && (
        <div className="assessment-settings non-stepper">
          <div className="bg-white rounded-boxes mb-3 d-flex align-items-center justify-content-between">
            <div className="d-flex text-center f-16">
              <div className="p-3">
                <b>{stats.total}</b>
                <p>Reported</p>
              </div>
              <div className="p-3">
                <b>{stats.resolved}</b>
                <p>Resolved</p>
              </div>
              <div className="p-3">
                <b>{stats.total - stats.resolved}</b>
                <p>Pending</p>
              </div>
            </div>
            <div className="">
              <ToggleComponent
                label="Include Resolved"
                value={includeResolved}
                setValue={setIncludeResolved}
                onValueChange={filterQuestions}
              />
            </div>
          </div>
          <Accordion defaultActiveKey="0">
            {filteredQuestions.map((question: any, index: number) => (
              <div
                key={index}
                className="assess-reportedIssue bg-white rounded-boxes"
              >
                <AccordionToggle as={Card.Header} eventKey={`${index}`}>
                  <div className="contents">
                    <div className="form-row">
                      <div className="col-auto num-question">
                        <div className="number_box">{question.order}</div>
                      </div>
                      <div className="col align-self-center">
                        <div>
                          <em>Assessment: {question.test?.title}</em>
                          &nbsp;&nbsp;
                          {!question.unsolved && (
                            <em className="text-success bg-warning">
                              &nbsp;Resolved&nbsp;
                            </em>
                          )}
                        </div>
                        <MathJax
                          value={question.questionText}
                          className="word-break-w"
                        />
                      </div>
                      {question.feedback.length - question.respondedCount >
                        1 && (
                        <div className="col-auto ml-auto">
                          <a
                            onClick={() => openRespondModal(question)}
                            className="btn btn-primary btn-sm no_link_type"
                          >
                            Respond All
                          </a>
                        </div>
                      )}
                      <div className="col-auto">
                        <i className="fas fa-angle-down fa-2x "></i>
                      </div>
                    </div>
                  </div>
                </AccordionToggle>
                <AccordionCollapse eventKey={`${index}`}>
                  <div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between">
                      <span>
                        The question last updated{" "}
                        {fromNow(question.questionUpdatedDate)}
                      </span>
                      <div>
                        {question.unsolved && (
                          <a
                            className="btn btn-sm btn-light mr-2"
                            onClick={() => resolveQuestion(question, index)}
                          >
                            Mark Resolved
                          </a>
                        )}
                        <a
                          className="btn btn-sm btn-light"
                          onClick={() => openQuestion(question)}
                        >
                          Open Question
                        </a>
                      </div>
                    </div>

                    <div className="content bg-white mt-2">
                      <div className="asses-rights clearfix border-0 py-0">
                        {question.feedback.map(
                          (qFeedback: any, index: number) => (
                            <div key={index}>
                              <span>
                                <h4 className="mb-2">
                                  <strong className="byStdNameAllStrng-1">
                                    By {qFeedback.studentName}{" "}
                                  </strong>
                                  <span style={{ fontSize: "15px" }}>
                                    ({fromNow(qFeedback.createdAt)})
                                  </span>
                                </h4>
                                <div className="row">
                                  <div className="col commentStd-MathCls1">
                                    <MathJax value={qFeedback.comment} />
                                  </div>
                                  <div className="col-auto ml-auto">
                                    {!qFeedback.responded && (
                                      <a
                                        className="btn btn-primary"
                                        onClick={() =>
                                          openRespondModal(question, qFeedback)
                                        }
                                      >
                                        Respond
                                      </a>
                                    )}
                                    {qFeedback.responded && (
                                      <h2 className="d-inline f-16">
                                        <span className="badge badge-success">
                                          Responded
                                        </span>
                                      </h2>
                                    )}
                                  </div>
                                </div>
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionCollapse>
              </div>
            ))}
          </Accordion>
        </div>
      )}

      <Modal
        show={respondModal}
        onHide={cancel}
        backdrop="static"
        keyboard={false}
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h2 className="form-box_title mb-0 text-center">
              Respond To issue
            </h2>
          </div>
          <div className="modal-body">
            <h4 className="form-box_subtitle">
              How would like to reply this question issue?
            </h4>
            <div className="d-flex align-items-center">
              <div className="container1">
                <form>
                  <input
                    type="radio"
                    style={{ appearance: "radio" }}
                    value="email"
                    checked={feedbackOptions === "email"}
                    name="access"
                    id="rdEmail"
                    onChange={(e: any) => setFeedbackOptions(e.target.value)}
                  />
                  <label></label>
                </form>
              </div>
              <div className="rights mt-0">Email in response</div>

              <div className="container1 ml-3">
                <form>
                  <input
                    type="radio"
                    value="discussion"
                    checked={feedbackOptions === "discussion"}
                    style={{ appearance: "radio" }}
                    name="access"
                    id="rdDiscussion"
                    onChange={(e: any) => setFeedbackOptions(e.target.value)}
                  />
                  <label></label>
                </form>
              </div>
              <div className="rights mt-0">Post in discussion</div>

              <div className="container1 ml-3">
                <form>
                  <input
                    type="radio"
                    value="chat"
                    checked={feedbackOptions === "chat"}
                    style={{ appearance: "radio" }}
                    name="access"
                    id="rdChat"
                    onChange={(e: any) => setFeedbackOptions(e.target.value)}
                  />
                  <label></label>
                </form>
              </div>
              <div className="rights mt-0">Chat</div>
            </div>
            {feedbackOptions != "chat" && (
              <CKEditorCustomized
                defaultValue={feedback.comment}
                onChangeCon={(data: any) => {
                  setFeedback({
                    ...feedback,
                    comment: data,
                  });
                }}
                config={ckeOptionswithToolbar}
              />
            )}

            {feedbackOptions === "chat" && (
              <input
                className="form-control border-bottom"
                placeholder="Enter chat message"
                max={400}
                value={feedback.chatComment}
                onChange={(e: any) =>
                  setFeedback({
                    ...feedback,
                    chatComment: e.target.value,
                  })
                }
                type="text"
                name="txtResponse"
              />
            )}

            <div className="mt-2 text-right">
              <a className="btn btn-light" onClick={() => cancel()}>
                Cancel
              </a>
              <a className="btn btn-primary ml-3" onClick={() => submit()}>
                Submit
              </a>
            </div>
          </div>
        </div>
      </Modal>

      {(!questions || !questions.length) && (
        <div className="text-center">
          <svg
            id="ee5e9a7f-a4df-4a6d-b09f-4738fb55969f"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            width="400.93236"
            height="400.62397"
            viewBox="0 0 666.93236 675.62397"
          >
            <path
              d="M677.20782,733.36829,667.734,727.333a141.39157,141.39157,0,0,1-.40722-15.93137l4.91442,1.25557-4.85062-3.09005c.2679-6.56875.86121-10.90171.86121-10.90171s19.15481,12.442,31.37125,29.30667l-2.08317,14.26309,4.96809-9.97459a57.19923,57.19923,0,0,1,3.41786,6.324c10.06524,21.98883,11.04333,43.10158,2.18448,47.15667s-24.19979-10.48311-34.26506-32.47195a75.3084,75.3084,0,0,1-5.73518-22.22544Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e6e6e6"
            />
            <path
              d="M657.74755,754.59262l-11.22966-.26942a141.39171,141.39171,0,0,1-8.58354-13.42749l4.856-1.46545-5.74959-.13792c-3.16605-5.76163-4.8979-9.77754-4.8979-9.77754s22.82871.74979,42.00386,8.872l5.58933,13.28665-.903-11.10673a57.20156,57.20156,0,0,1,6.19474,3.647c19.98239,13.62068,31.73283,31.18858,26.24537,39.23905s-26.13485,3.53489-46.11721-10.08577a75.309,75.309,0,0,1-16.398-16.06146Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e6e6e6"
            />
            <polygon
              points="457.583 662.235 445.323 662.234 440.724 614.548 457.585 614.947 457.583 662.235"
              fill="#a0616a"
            />
            <path
              d="M727.24345,786.30684l-39.53076-.00147v-.5a15.38731,15.38731,0,0,1,15.38648-15.38623h.001l24.144.001Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#2f2e41"
            />
            <polygon
              points="602.22 626.845 594.179 636.099 554.657 609.488 566.525 595.829 602.22 626.845"
              fill="#a0616a"
            />
            <path
              d="M879.77568,744.46664,853.848,774.30684l-.37744-.32793a15.38731,15.38731,0,0,1-1.52349-21.70619l.00064-.00074,15.8358-18.22532Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#2f2e41"
            />
            <path
              d="M932.2755,787.812h-334.294a1.19068,1.19068,0,0,1,0-2.38136h334.294a1.19068,1.19068,0,1,1,0,2.38136Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#cacaca"
            />
            <path
              d="M751.0525,662.174,725.258,757.73633h-20l4.3928-104.514,11.59485-101.826,42.1156-2.23792Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#2f2e41"
            />
            <path
              d="M795.81117,551.39625s2.23791,14.54657-6.71381,30.2121-3.35687,68.257-3.35687,68.257l75.51748,75.871s-11.73635,20.36018-17.3312,19.24122-93.99322-72.73285-93.99322-72.73285l-28.688-116.37255Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#2f2e41"
            />
            <circle cx="487.6377" cy="244.08045" r="25.73625" fill="#a0616a" />
            <path
              d="M755.258,396.73633s30-11.35691,30-8,29.5756,31.74083,22.86179,68.66673-14.54657,54.82938-11.18963,74.97079,1.119,24.61725,1.119,24.61725-77.92249,6.71381-79.04145-1.119,3.25027-19.77888,3.25027-23.13575S753.17724,405.37483,755.258,396.73633Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#575a89"
            />
            <polygon
              points="522.527 394.596 492.911 443.125 502.981 443.125 522.527 394.596"
              opacity="0.2"
              style={{ isolation: "isolate" }}
            />
            <path
              d="M765.82,371.73326c-2.0835-1.10162-4.50372-1.3287-6.75891-2.01343-8.0683-2.44974-13.47321-11.57049-11.74762-19.824a10.11488,10.11488,0,0,0,.42377-3.26725c-.30164-2.44445-2.80292-4.02169-5.20136-4.58178s-4.95038-.47873-7.2428-1.37937c-3.53955-1.39059-5.89068-5.02807-6.40039-8.79669a18.171,18.171,0,0,1,2.42731-10.952l.86633,2.493a9.24688,9.24688,0,0,0,2.83075-4.23377,5.8321,5.8321,0,0,1,4.44348,3.57331c1.39063.82,1.591-2.54755,3.127-3.04435a2.75907,2.75907,0,0,1,1.91723.4729c3.09522,1.44361,6.69135.20932,10.0116-.59088a37.68771,37.68771,0,0,1,17.4953-.0206c3.82184.91159,7.6048,2.499,10.3396,5.32a24.80841,24.80841,0,0,1,4.83679,8.31134c2.93323,7.38193,4.87091,15.36942,3.90265,23.25351a32.91448,32.91448,0,0,1-7.75683,17.43942c-2.21466,2.55167-9.44031,11.45374-13.40223,9.936C764.9535,381.92161,771.68562,374.83458,765.82,371.73326Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#2f2e41"
            />
            <rect
              x="735.34422"
              y="592.54587"
              width="1.59216"
              height="82.62854"
              transform="translate(-444.08791 191.75733) rotate(-20.87686)"
              opacity="0.2"
              style={{ isolation: "isolate" }}
            />
            <path
              d="M413.03065,573.64624a75.34194,75.34194,0,1,0-130.19693,71.56982c.6762.852,1.37948,1.70405,2.09663,2.529.05415.05406.09444.10821.14858.16228a73.077,73.077,0,0,0,5.61239,5.78829c.51442.47339,1.05525.96024,1.59609,1.4201,1.02752.91963,2.08277,1.79865,3.1783,2.63714.43254.33811.85187.67621,1.29827,1.00086,1.7308,1.3118,3.52961,2.529,5.38258,3.69206l.08122.04053c.527.32465,1.06846.64922,1.6093.96024.97337.58153,1.97447,1.13607,2.97491,1.66345l.63593.32465c1.46071.75735,2.9485,1.47408,4.47657,2.13675.311.13529.64913.2705.96016.40571.02707.01354.04028.01354.06736.02707.71714.29758,1.43363.58153,2.164.852a71.07862,71.07862,0,0,0,7.33,2.35319,75.37807,75.37807,0,0,0,19.43435,2.54254c2.3938,0,4.76052-.10821,7.10017-.3381a75.07761,75.07761,0,0,0,15.74229-3.17814c.01321,0,.02707-.01354.04028-.01354a73.88847,73.88847,0,0,0,9.45369-3.74621c.01321-.01354.04028-.01354.05415-.027.68942-.32465,1.35242-.67621,2.02862-1.01431.1083-.05415.21594-.10822.32424-.16237.54083-.284,1.08233-.568,1.62316-.86548,1.35241-.7439,2.67775-1.52824,3.98923-2.36673.36517-.21643.71714-.44632,1.08232-.68974.51376-.3381,1.02752-.68975,1.52807-1.05492.66234-.45978,1.32534-.93317,1.97447-1.42.20273-.14875.41933-.29749.62206-.45978a75.31525,75.31525,0,0,0,25.58757-84.76939Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#fff"
            />
            <path
              d="M380.92468,655.278a125.27814,125.27814,0,0,0-19.98905-8.41206l-.87893-9.72386-35.64946-3.84081L319.87652,645.73,307.08274,650.531a6.22748,6.22748,0,0,0-1.29827.6762h-.01386a6.33911,6.33911,0,0,0-2.70483,4.21953,6.48067,6.48067,0,0,0,.09509,2.54254l.67621,2.77244c.97337.58152,1.97447,1.13606,2.97491,1.66344l.63593.32465c1.46071.75735,2.9485,1.47408,4.47657,2.13675.311.13529.64913.2705.96016.40571.02707.01354.04028.01354.06736.02708.71714.29757,1.43363.58152,2.164.852a71.07862,71.07862,0,0,0,7.33,2.35319,75.37808,75.37808,0,0,0,19.43435,2.54255c2.3938,0,4.76052-.10822,7.10017-.33811a75.07761,75.07761,0,0,0,15.74229-3.17814c.01321,0,.02707-.01354.04028-.01354a73.887,73.887,0,0,0,9.45369-3.74621c.01321-.01354.04028-.01354.05415-.027.68942-.32465,1.35242-.67621,2.02862-1.01431.1083-.05415.21594-.10822.32424-.16237.54083-.284,1.08233-.568,1.62316-.86548,1.35241-.74389,2.67775-1.52823,3.98923-2.36672.36517-.21644.71714-.44632,1.08232-.68975.51376-.3381,1.02752-.68974,1.52807-1.05492C383.58857,656.77918,382.2771,656.0083,380.92468,655.278Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M314.02047,661.26921l-2.23136-10.0755h-5.829a1.3954,1.3954,0,0,0-.17566.01353h-.01386a12.63162,12.63162,0,0,0-5.86927,2.02862,12.99975,12.99975,0,0,0-3.13736,2.813c1.7308,1.3118,3.52961,2.529,5.38258,3.69206l.08122.04053c.527.32465,1.06846.64922,1.6093.96025.97337.58152,1.97447,1.13606,2.97491,1.66344l.63593.32465c1.46071.75735,2.9485,1.47408,4.47657,2.13675.311.13529.64913.2705.96016.40571.02707.01354.04028.01354.06736.02708.71714.29757,1.43363.58152,2.164.852Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <circle cx="74.29911" cy="489.29061" r="25.67504" fill="#fff" />
            <path
              d="M340.796,628.166a26.68032,26.68032,0,1,1,12.83178-50.09375h0A26.69227,26.69227,0,0,1,340.796,628.166Zm.07861-51.35839a24.6681,24.6681,0,1,0,11.79394,3.01953A24.69663,24.69663,0,0,0,340.87464,576.80762Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M323.59492,588.97284c2.65777,3.14533,7.15575,4.03288,11.30494,4.39678,8.42647.739,20.67955-.45974,28.91446-2.361.58771,5.69657-1.01475,11.83884,2.34057,16.52486a76.71381,76.71381,0,0,0,2.72569-17.39078,16.64606,16.64606,0,0,0-.9634-7.4484c-1.0253-2.3159-3.26089-4.28176-5.83562-4.30233a14.62576,14.62576,0,0,1,6.524-2.78917l-8.1524-4.09689,2.09353-2.14933-14.75945-.90318,4.27487-2.71578a92.69626,92.69626,0,0,0-19.42014-.613c-3.0077.22158-6.15226.6449-8.58921,2.38755s-3.84506,5.20619-2.33222,7.76474a11.27422,11.27422,0,0,0-8.592,6.81737,18.20057,18.20057,0,0,0-.6522,8.74845,62.01346,62.01346,0,0,0,3.2515,13.75557Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M413.03065,573.64624a75.34194,75.34194,0,1,0-130.19693,71.56982c.6762.852,1.37948,1.70405,2.09663,2.529.05415.05406.09444.10821.14858.16228a73.077,73.077,0,0,0,5.61239,5.78829c.51442.47339,1.05525.96024,1.59609,1.4201,1.02752.91963,2.08277,1.79865,3.1783,2.63714.43254.33811.85187.67621,1.29827,1.00086,1.7308,1.3118,3.52961,2.529,5.38258,3.69206l.08122.04053c.527.32465,1.06846.64922,1.6093.96024.97337.58153,1.97447,1.13607,2.97491,1.66345l.63593.32465c1.46071.75735,2.9485,1.47408,4.47657,2.13675.311.13529.64913.2705.96016.40571.02707.01354.04028.01354.06736.02707.71714.29758,1.43363.58153,2.164.852a71.07862,71.07862,0,0,0,7.33,2.35319,75.37807,75.37807,0,0,0,19.43435,2.54254c2.3938,0,4.76052-.10821,7.10017-.3381a75.07761,75.07761,0,0,0,15.74229-3.17814c.01321,0,.02707-.01354.04028-.01354a73.88847,73.88847,0,0,0,9.45369-3.74621c.01321-.01354.04028-.01354.05415-.027.68942-.32465,1.35242-.67621,2.02862-1.01431.1083-.05415.21594-.10822.32424-.16237.54083-.284,1.08233-.568,1.62316-.86548,1.35241-.7439,2.67775-1.52824,3.98923-2.36673.36517-.21643.71714-.44632,1.08232-.68974.51376-.3381,1.02752-.68975,1.52807-1.05492.66234-.45978,1.32534-.93317,1.97447-1.42.20273-.14875.41933-.29749.62206-.45978a75.31525,75.31525,0,0,0,25.58757-84.76939Zm-28.0758,81.48295c-.4464.35165-.906.68975-1.36628,1.00086-.4464.3381-.89214.66267-1.35241.96016-.39226.284-.78451.55454-1.19.8115-.04028.027-.08122.05407-.12151.08114-.29782.20281-.595.39217-.8928.58153q-1.68392,1.0548-3.40811,2.02862c-.12151.0676-.24367.13521-.36518.20281-.51376.284-1.02752.55454-1.54128.825-.068.04053-.14924.0676-.21659.10813l-.08123.04061c-.64913.33811-1.31213.66267-1.97447.9737a66.33658,66.33658,0,0,1-7.88468,3.19176c-.352.12167-.70328.24343-1.05459.35156a70.9389,70.9389,0,0,1-14.90363,3.02948c-2.21815.20281-4.46337.311-6.72179.311a70.257,70.257,0,0,1-18.3791-2.40734,66.78427,66.78427,0,0,1-9.02049-3.05639c-.14925-.06768-.31169-.12175-.46027-.18935-.16179-.06761-.311-.12176-.45961-.18936-.16245-.06761-.311-.13521-.47348-.21635-1.27119-.55454-2.52917-1.16314-3.75942-1.79874l-.595-.311c-1.50166-.78443-2.97558-1.62292-4.40922-2.51556-.41933-.257-.85186-.52738-1.258-.81141-.10764-.06761-.20273-.13521-.311-.2029-.96016-.63559-1.92032-1.29826-2.85341-1.988-.63526-.47339-1.27119-.9467-1.89325-1.43355-1.04138-.78443-2.04249-1.62292-3.01585-2.48848-.51376-.43278-1.01431-.9061-1.501-1.35242a68.71379,68.71379,0,0,1-5.43673-5.626c-.56791-.64922-1.12261-1.29835-1.65024-1.97456a5.15352,5.15352,0,0,1-.3381-.41924,71.2169,71.2169,0,1,1,98.88868,12.48275Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M413.03065,368.96563a75.34194,75.34194,0,1,0-130.19693,71.56982c.6762.852,1.37948,1.704,2.09663,2.529.05415.05406.09444.10821.14858.16228a73.077,73.077,0,0,0,5.61239,5.78829c.51442.47339,1.05525.96024,1.59609,1.4201,1.02752.91963,2.08277,1.79865,3.1783,2.63714.43254.3381.85187.67621,1.29827,1.00086,1.7308,1.3118,3.52961,2.529,5.38258,3.69206l.08122.04053c.527.32465,1.06846.64922,1.6093.96024.97337.58153,1.97447,1.13607,2.97491,1.66345l.63593.32465c1.46071.75734,2.9485,1.47408,4.47657,2.13675.311.13529.64913.2705.96016.40571.02707.01354.04028.01354.06736.02707.71714.29758,1.43363.58153,2.164.852a71.07862,71.07862,0,0,0,7.33,2.35319,75.37807,75.37807,0,0,0,19.43435,2.54254c2.3938,0,4.76052-.10821,7.10017-.3381a75.07761,75.07761,0,0,0,15.74229-3.17814c.01321,0,.02707-.01354.04028-.01354a73.88847,73.88847,0,0,0,9.45369-3.74621c.01321-.01354.04028-.01354.05415-.027.68942-.32465,1.35242-.67621,2.02862-1.01431.1083-.05415.21594-.10822.32424-.16237.54083-.284,1.08233-.568,1.62316-.86548,1.35241-.7439,2.67775-1.52824,3.98923-2.36673.36517-.21643.71714-.44632,1.08232-.68974.51376-.33811,1.02752-.68975,1.52807-1.05492.66234-.45978,1.32534-.93317,1.97447-1.42.20273-.14875.41933-.29749.62206-.45978a75.31525,75.31525,0,0,0,25.58757-84.76939Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#fff"
            />
            <path
              d="M315.33222,411.35842l4.3759,15.15835,55.9201-.98653-.49-27.77382c-.38784-21.984-15.92463-40.94467-37.90816-40.55684s-35.96174,18.973-35.5739,40.957l3.19358,28.62234,9.11738-.16084Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <circle cx="73.19515" cy="284.68013" r="25.08994" fill="#fff" />
            <path
              d="M389.66988,435.99475l-.56853,10.55326a67.18015,67.18015,0,0,1-93.11189,3.60665c-.57985-.51027-1.14838-1.04369-1.705-1.58879,3.4791-3.45588,13.08175-11.99127,23.73933-12.77986l48.058-3.02687S384.28871,430.62533,389.66988,435.99475Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M367.195,379.25058a9.73109,9.73109,0,0,0-1.72822-5.36942c-.11552-.16238-.2316-.31315-.34769-.46391a9.77725,9.77725,0,0,0-7.83987-3.74581l-18.03313.32468-18.0218.31314a9.76417,9.76417,0,0,0-9.56754,9.91543l4.29112,8.63979,2.47,4.96355.406-.232c15.59764-8.76734,21.976-8.88335,42.619-.73062l.41733.16238,1.63536-4.18658,3.71071-9.498Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M395.36261,443.09427c-1.44962,1.85549-2.75823,1.82176-4.39359,3.51488-4.128,4.30251-10.716,7.98718-15.86506,11.06042L373.97937,437.514l15.69051-1.51921S393.18251,437.864,395.36261,443.09427Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M413.03065,368.96563a75.34194,75.34194,0,1,0-130.19693,71.56982c.6762.852,1.37948,1.704,2.09663,2.529.05415.05406.09444.10821.14858.16228a73.077,73.077,0,0,0,5.61239,5.78829c.51442.47339,1.05525.96024,1.59609,1.4201,1.02752.91963,2.08277,1.79865,3.1783,2.63714.43254.3381.85187.67621,1.29827,1.00086,1.7308,1.3118,3.52961,2.529,5.38258,3.69206l.08122.04053c.527.32465,1.06846.64922,1.6093.96024.97337.58153,1.97447,1.13607,2.97491,1.66345l.63593.32465c1.46071.75734,2.9485,1.47408,4.47657,2.13675.311.13529.64913.2705.96016.40571.02707.01354.04028.01354.06736.02707.71714.29758,1.43363.58153,2.164.852a71.07862,71.07862,0,0,0,7.33,2.35319,75.37807,75.37807,0,0,0,19.43435,2.54254c2.3938,0,4.76052-.10821,7.10017-.3381a75.07761,75.07761,0,0,0,15.74229-3.17814c.01321,0,.02707-.01354.04028-.01354a73.88847,73.88847,0,0,0,9.45369-3.74621c.01321-.01354.04028-.01354.05415-.027.68942-.32465,1.35242-.67621,2.02862-1.01431.1083-.05415.21594-.10822.32424-.16237.54083-.284,1.08233-.568,1.62316-.86548,1.35241-.7439,2.67775-1.52824,3.98923-2.36673.36517-.21643.71714-.44632,1.08232-.68974.51376-.33811,1.02752-.68975,1.52807-1.05492.66234-.45978,1.32534-.93317,1.97447-1.42.20273-.14875.41933-.29749.62206-.45978a75.31525,75.31525,0,0,0,25.58757-84.76939Zm-28.0758,81.483c-.4464.35164-.906.68975-1.36628,1.00086-.4464.3381-.89214.66267-1.35241.96016-.39226.284-.78451.55454-1.19.8115-.04028.027-.08122.05407-.12151.08114-.29782.20281-.595.39217-.8928.58153q-1.68392,1.0548-3.40811,2.02862c-.12151.0676-.24367.13521-.36518.20281-.51376.284-1.02752.55454-1.54128.825-.068.04053-.14924.0676-.21659.10813l-.08123.04061c-.64913.33811-1.31213.66267-1.97447.9737a66.33658,66.33658,0,0,1-7.88468,3.19176c-.352.12167-.70328.24343-1.05459.35156a70.9389,70.9389,0,0,1-14.90363,3.02948c-2.21815.20281-4.46337.311-6.72179.311a70.257,70.257,0,0,1-18.3791-2.40734,66.78427,66.78427,0,0,1-9.02049-3.05639c-.14925-.06768-.31169-.12175-.46027-.18935-.16179-.06761-.311-.12176-.45961-.18936-.16245-.06761-.311-.13521-.47348-.21635-1.27119-.55454-2.52917-1.16314-3.75942-1.79874l-.595-.311c-1.50166-.78442-2.97558-1.62291-4.40922-2.51555-.41933-.257-.85186-.52738-1.258-.81141-.10764-.06761-.20273-.13521-.311-.2029-.96016-.63559-1.92032-1.29826-2.85341-1.988-.63526-.47339-1.27119-.9467-1.89325-1.43355-1.04138-.78443-2.04249-1.62292-3.01585-2.48848-.51376-.43278-1.01431-.9061-1.501-1.35242a68.71539,68.71539,0,0,1-5.43673-5.626c-.56791-.64922-1.12261-1.29835-1.65024-1.97456a5.15524,5.15524,0,0,1-.3381-.41924,71.2169,71.2169,0,1,1,98.88868,12.48275Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M415.98158,163.78638a76.85931,76.85931,0,1,0-132.81909,73.01114c.68982.86919,1.40727,1.73838,2.13819,2.57994.05524.05516.09633.1104.15157.16556a74.69039,74.69039,0,0,0,5.7261,5.90495c.5241.48284,1.07583.97949,1.62755,1.44861,1.04889.93816,2.12472,1.835,3.24232,2.69034a75.57144,75.57144,0,0,0,6.8154,4.78735l.08286.04143c1.53122.952,3.09007,1.83488,4.67721,2.67653l.64806.3311c1.49013.7726,3.00788,1.50378,4.56672,2.17979.3173.138.66221.276.9795.414.02762.01381.04177.01381.06939.02754a74.66014,74.66014,0,0,0,9.68518,3.26977,76.89139,76.89139,0,0,0,19.82508,2.59375c2.442,0,4.8564-.11031,7.24318-.34491a76.58152,76.58152,0,0,0,16.05933-3.24215c.01415,0,.02762-.01381.04109-.01381a75.33788,75.33788,0,0,0,9.64409-3.82166c.01347-.01373.04177-.01373.05524-.02754.7033-.3311,1.37965-.68982,2.06948-1.03474l.33144-.16555c.55172-.28976,1.10345-.57951,1.65518-.883,1.37965-.75879,2.73168-1.559,4.07024-2.41439.37253-.22079.73092-.45531,1.10345-.70363,1.21393-.80022,2.41439-1.6556,3.57308-2.52479.20749-.15174.42778-.30348.63526-.469a76.83562,76.83562,0,0,0,26.1029-86.47656Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#fff"
            />
            <circle
              id="bf91a0f9-b34c-4dd5-a205-d34f0555e32d"
              data-name="Ellipse 188"
              cx="102.22724"
              cy="97.02391"
              r="11.51871"
              fill="#e4e4e4"
            />
            <path
              id="a8dca41c-33b1-460f-bf5d-f4e2657dd513"
              data-name="Path 969"
              d="M371.97018,198.01054a11.52012,11.52012,0,0,1,10.14041,16.98629,11.51594,11.51594,0,1,0-19.133-12.65417,11.49129,11.49129,0,0,1,8.99392-4.33212Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <circle
              id="ee3a206a-c546-4577-b9a7-054ec3fd2c40"
              data-name="Ellipse 189"
              cx="80.70191"
              cy="63.16174"
              r="33.83734"
              fill="#e4e4e4"
            />
            <path
              id="fdfc7426-35cb-40c9-aba8-b1c391ef3d9b"
              data-name="Path 970"
              d="M320.67878,154.35564a33.83185,33.83185,0,0,1,46.89435-3.54849c-.27594-.26348-.55189-.5284-.83744-.78363a33.83734,33.83734,0,0,0-45.15622,50.40612q.09637.08628.19334.17187c.287.25523.5822.49666.87609.74086a33.8318,33.8318,0,0,1-1.96877-46.98681Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <circle
              id="a62bd645-2725-442b-8d00-c1bfcb60d6c9"
              data-name="Ellipse 190"
              cx="80.41494"
              cy="74.91913"
              r="21.79298"
              fill="#fff"
            />
            <path
              d="M385.94654,243.889v7.31214c-1.33856.85538-2.69059,1.6556-4.07024,2.41439-.55173.30348-1.10345.59324-1.65518.883l-.33144.16555c-.68982.34491-1.36618.70363-2.06948,1.03474-.01347.01381-.04176.01381-.05524.02753a75.33647,75.33647,0,0,1-9.64409,3.82167c-.01347,0-.02694.01381-.04109.01381a76.5815,76.5815,0,0,1-16.05933,3.24214c-2.38677.23461-4.80116.34492-7.24317.34492a76.891,76.891,0,0,1-19.82509-2.59376,74.6606,74.6606,0,0,1-9.68518-3.26976c-.02762-.01373-.04177-.01373-.06939-.02754-.31729-.138-.6622-.276-.97949-.414-1.55885-.676-3.0766-1.40719-4.56673-2.17979l-.64806-.3311c-1.58714-.84166-3.146-1.72457-4.67721-2.67653l-.08286-.04143a75.57345,75.57345,0,0,1-6.8154-4.78735c-1.1176-.85538-2.19343-1.75219-3.24231-2.69034-.55173-.46912-1.10346-.96577-1.62756-1.44862a74.69045,74.69045,0,0,1-5.7261-5.90495,27.9121,27.9121,0,0,1,1.04889-4.23554l.01347-.01381a6.19143,6.19143,0,0,1,.28968-.68982,5.50075,5.50075,0,0,1,.262-.57943c2.46963-4.6218,6.94-5.76694,12.48625-6.01527,3.13184-.138,6.59444.01381,10.25106-.02762,1.93137-.01381,3.93146-.08277,5.93223-.26213,12.62368-1.145,10.33391-8.59521,10.89911-12.61.56588-3.89054,4.07024-.52419,4.30468-.30348l.01347.01381a44.52359,44.52359,0,0,0,22.90235,4.01475c1.352-.16555,2.70407-.26214,4.0561-.30349,3.55961-.04143,2.78692.9795,1.55952,1.82115a15.42869,15.42869,0,0,1-1.86267,1.04855s-.56587,3.44913-1.14522,8.609c-.55172,4.93909,16.8455,6.64993,20.25353,7.726h.01348A12.44171,12.44171,0,0,1,385.94654,243.889Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              id="afe1b400-7bb3-471b-bfb6-771e67eb46b9"
              data-name="Path 975"
              d="M328.30965,159.86591v21.79848h5.04679l6.42232-6.88171-.8595,6.88171H361.2282l-1.37965-6.88171,2.7593,6.88171h3.55675V159.86591Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <ellipse
              id="f3d4acd6-e9dd-4f82-a51e-6d6f5add322c"
              data-name="Ellipse 191"
              cx="58.335"
              cy="70.33179"
              rx="1.72043"
              ry="3.15388"
              fill="#e4e4e4"
            />
            <ellipse
              id="a3160813-753f-4b2a-bfa5-8e9f95e585bb"
              data-name="Ellipse 192"
              cx="102.49627"
              cy="70.33179"
              rx="1.72043"
              ry="3.15388"
              fill="#e4e4e4"
            />
            <path
              d="M415.98158,163.78638a76.85931,76.85931,0,1,0-132.81909,73.01114c.68982.86919,1.40727,1.73838,2.13819,2.57994.05524.05516.09633.1104.15157.16556a74.69039,74.69039,0,0,0,5.7261,5.90495c.5241.48284,1.07583.97949,1.62755,1.44861,1.04889.93816,2.12472,1.835,3.24232,2.69034a75.57144,75.57144,0,0,0,6.8154,4.78735l.08286.04143c1.53122.952,3.09007,1.83488,4.67721,2.67653l.64806.3311c1.49013.7726,3.00788,1.50378,4.56672,2.17979.3173.138.66221.276.9795.414.02762.01381.04177.01381.06939.02754a74.66014,74.66014,0,0,0,9.68518,3.26977,76.89139,76.89139,0,0,0,19.82508,2.59375c2.442,0,4.8564-.11031,7.24318-.34491a76.58152,76.58152,0,0,0,16.05933-3.24215c.01415,0,.02762-.01381.04109-.01381a75.33788,75.33788,0,0,0,9.64409-3.82166c.01347-.01373.04177-.01373.05524-.02754.7033-.3311,1.37965-.68982,2.06948-1.03474l.33144-.16555c.55172-.28976,1.10345-.57951,1.65518-.883,1.37965-.75879,2.73168-1.559,4.07024-2.41439.37253-.22079.73092-.45531,1.10345-.70363,1.21393-.80022,2.41439-1.6556,3.57308-2.52479.20749-.15174.42778-.30348.63526-.469a76.83562,76.83562,0,0,0,26.1029-86.47656Zm-28.64191,83.124c-.4554.35873-.92426.70364-1.39313,1.02093-.45539.34492-.91079.676-1.37965.9795-.40015.28976-.80031.56571-1.21461.82784-.34491.23452-.68982.45531-1.03474.676q-1.71681,1.07616-3.47607,2.06948c-.12463.069-.24858.13793-.37321.207-.5241.28967-1.04821.56562-1.57232.84156-.06938.04135-.15224.069-.221.1104l-.08286.04135c-.6622.34491-1.33788.676-2.01423.99339a67.64106,67.64106,0,0,1-8.04348,3.256c-.35839.12412-.71745.24832-1.07583.35872a72.37219,72.37219,0,0,1-15.20379,3.09041c-2.26282.20689-4.55326.31729-6.85717.31729a71.67545,71.67545,0,0,1-18.74925-2.45574,68.142,68.142,0,0,1-9.20217-3.118c-.31729-.12421-.63458-.26214-.9384-.38635-.165-.069-.31729-.13793-.483-.2207-1.2968-.56571-2.57944-1.18648-3.83514-1.835l-.607-.3173c-1.53122-.80022-3.0355-1.6556-4.498-2.56613-.53758-.33119-1.07583-.6761-1.59994-1.03474-1.65585-1.09-3.26993-2.26265-4.84293-3.49056-1.06236-.80022-2.08295-1.6556-3.07659-2.53859-.52411-.44142-1.03474-.92435-1.53123-1.37965a70.198,70.198,0,0,1-5.54622-5.73932c-.57935-.6622-1.14522-1.32449-1.68348-2.01432a5.24155,5.24155,0,0,1-.34491-.42769,72.65116,72.65116,0,1,1,100.8803,12.73424Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#e4e4e4"
            />
            <path
              d="M437.37073,284.60946l-54.10914-1.22509c-5.4123-20.966-2.97562-40.92869,1.34344-59.32432l54.10886,1.22505A118.47157,118.47157,0,0,0,437.37073,284.60946Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#6c63ff"
            />
            <polygon
              points="127.341 124.983 127.371 122.924 155.403 123.926 155.374 125.985 127.341 124.983"
              fill="#fff"
            />
            <polygon
              points="127.223 133.218 127.253 131.159 155.285 132.162 155.255 134.221 127.223 133.218"
              fill="#fff"
            />
            <polygon
              points="127.105 141.454 127.135 139.395 155.167 140.397 155.137 142.456 127.105 141.454"
              fill="#fff"
            />
            <polygon
              points="126.987 149.69 127.016 147.631 155.049 148.633 155.019 150.692 126.987 149.69"
              fill="#fff"
            />
            <polygon
              points="126.869 157.925 126.898 155.866 154.931 156.869 154.901 158.927 126.869 157.925"
              fill="#fff"
            />
            <path
              d="M437.37073,479.60946l-54.10914-1.22509c-5.4123-20.966-2.97562-40.92869,1.34344-59.32432l54.10886,1.22505A118.47157,118.47157,0,0,0,437.37073,479.60946Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#6c63ff"
            />
            <polygon
              points="127.341 319.983 127.371 317.924 155.403 318.926 155.374 320.985 127.341 319.983"
              fill="#fff"
            />
            <polygon
              points="127.223 328.218 127.253 326.159 155.285 327.162 155.255 329.221 127.223 328.218"
              fill="#fff"
            />
            <polygon
              points="127.105 336.454 127.135 334.395 155.167 335.397 155.137 337.456 127.105 336.454"
              fill="#fff"
            />
            <polygon
              points="126.987 344.69 127.016 342.631 155.049 343.633 155.019 345.692 126.987 344.69"
              fill="#fff"
            />
            <polygon
              points="126.869 352.925 126.898 350.866 154.931 351.869 154.901 353.927 126.869 352.925"
              fill="#fff"
            />
            <path
              d="M437.37073,674.60946l-54.10914-1.22509c-5.4123-20.966-2.97562-40.92869,1.34344-59.32432l54.10886,1.22505A118.47157,118.47157,0,0,0,437.37073,674.60946Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#6c63ff"
            />
            <polygon
              points="127.341 514.983 127.371 512.924 155.403 513.926 155.374 515.985 127.341 514.983"
              fill="#fff"
            />
            <polygon
              points="127.223 523.218 127.253 521.159 155.285 522.162 155.255 524.221 127.223 523.218"
              fill="#fff"
            />
            <polygon
              points="127.105 531.454 127.135 529.395 155.167 530.397 155.137 532.456 127.105 531.454"
              fill="#fff"
            />
            <polygon
              points="126.987 539.69 127.016 537.631 155.049 538.633 155.019 540.692 126.987 539.69"
              fill="#fff"
            />
            <polygon
              points="126.869 547.925 126.898 545.866 154.931 546.869 154.901 548.927 126.869 547.925"
              fill="#fff"
            />
            <path
              d="M726.07463,561.57909a10.05579,10.05579,0,0,1,12.1587-9.48271L756.76785,521.544l7.95178,16.781-18.81979,26.44038a10.11027,10.11027,0,0,1-19.82521-3.18628Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#a0616a"
            />
            <path
              d="M792.4543,400.33583s26.29016,3.00986,16.502,51.29895-47.83307,104.23743-47.83307,104.23743L735.387,543.56355l33.569-66.019-7.83277-41.40176S756.64735,396.97887,792.4543,400.33583Z"
              transform="translate(-266.53382 -112.18802)"
              fill="#575a89"
            />
          </svg>
          <h1 className="mt-1">No Issues Reported</h1>
        </div>
      )}
    </>
  );
};

export default ReportIssueComponent;