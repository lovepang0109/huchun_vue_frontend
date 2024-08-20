"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { Player } from "@lottiefiles/react-lottie-player";
import { alert } from "alertifyjs";
import { replaceBadWords } from "@/lib/common";
import { useRouter } from "next/navigation";

const TestFeedback = () => {
  const router = useRouter();
  const star_one = useRef<any>(null);
  const star_two = useRef<any>(null);
  const { attemptId, id } = useParams();
  const [helpfulCheck, setHelpfulCheck] = useState<boolean>();
  const [viewAllCheck, setViewAllCheck] = useState<boolean>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [impressList, setImpressList] = useState<any>({
    amazing: false,
    ample: false,
    smooth: false,
  });
  const [feedbackContent, setFeedbackContent] = useState<string>("");
  const [attempt, setAttempt] = useState<any>();
  const [feedback, setFeedback] = useState<any>({
    attemptId: "",
    owner: "",
    practiceSetId: "",
    rating: 0,
    comment: "",
    helpfulCheck: null,
    viewAllCheck: null,
    feedbacks: [],
  });

  useEffect(() => {
    const onBeforeUnload = (event: any) => {
      const message = "Are you sure you want to abandon this practice test?";
      if (!event) {
        event = window.event;
      }
      event.returnValue = message;
      return message;
    };

    setTimeout(() => {
      window.onbeforeunload = onBeforeUnload;
    }, 1000);

    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  useEffect(() => {
    const getAttempt = async () => {
      const { data } = await clientApi.get(`/api/attempts/${attemptId}`);
      setAttempt(data);
      setFeedback((prev: any) => ({
        ...prev,
        attemptId: attemptId,
        practiceSetId: id,
        owner: data?.practiceset.user._id,
      }));
    };
    getAttempt();
  }, []);

  const submit = async (event: any) => {
    event.preventDefault();
    if (processing) {
      return;
    }
    if (
      (helpfulCheck !== null || helpfulCheck !== undefined) &&
      (viewAllCheck !== null || viewAllCheck !== undefined)
    ) {
      setProcessing(true);
      let feedbacks = [
        { name: "helpfulCheck", value: true },
        { name: "viewAllCheck", value: true },
      ];

      Object.entries(impressList)
        .filter(([key, val]) => val === true)
        .forEach((obj: any) =>
          feedbacks.push({
            name:
              obj[0] === "amazing"
                ? "Amazing Questions"
                : obj[0] === "ample"
                ? "Ample Time"
                : "Smooth Software",
            value: true,
          })
        );

      const payload = {
        ...feedback,
        attemptId: attemptId,
        feedbacks: feedbacks,
        comment: replaceBadWords(feedbackContent),
        viewAllCheck: true,
        helpfulCheck: true,
      };

      console.log("feedbacks: ", feedbacks, payload);
      try {
        const { data } = await clientApi.post(
          "/api/feedbacks/create",
          payload,
          {
            responseType: "text",
          }
        );
        setProcessing(false);
        goNextPage();
      } catch (error) {
        alert(
          "Message",
          "Fail to submit feedback. Please check internet connection and try to submit again."
        );
        setProcessing(false);
      }
    }
  };

  const goNextPage = () => {
    let isFeedback = false;
    let questionPage = 0;
    if (attempt.QA.length > 0) {
      attempt.QA.forEach((question: any, index: number) => {
        if (question.feedback && questionPage < 1) {
          isFeedback = true;
          questionPage = index + 1;
          return;
        }
      });
    }
    if (isFeedback) {
      alert(
        "Message",
        "You have marked one or more question for feedback. Do you want to give feedback now?"
        // (closeEvent) => {
        //   router.navigate(['/student/question-review', 'feedback', attemptId, 'question', questionPage], { replaceUrl: true });
        // }, (closeEvent) => {
        //   router.navigate(['/student/assessments'], { replaceUrl: true });
        // }
      );
      router.push("/assessment/home");
    } else {
      router.push(`/attempt-summary/${attemptId}`);
    }
  };

  const setRating = (rate: any) => {
    setFeedback((prev: any) => ({ ...prev, rating: rate }));
    if (rate == 1) {
      // for star animation
      setTimeout(() => {
        star_two.current.style.dispaly = "block";
        star_one.current.style.dispaly = "none";
      }, 800);
    }
  };
  console.log(attempt);

  return (
    <>
      <header>
        <div className="container">
          <div className="header-area classroom d-none d-lg-block ml-4">
            <nav className="d-flex justify-content-between align-items-center p-0">
              <a className="navbar-brand p-0">
                <AppLogo />
              </a>
              <h2 className="heading"> Feedback</h2>
              <h2 className="heading">
                {" "}
                Assessment{" "}
                <span style={{ color: "#7a62f9" }}>
                  {attempt ? "- " + attempt?.practiceset?.title : ""}
                </span>
              </h2>
            </nav>
          </div>
          <div className="header-area classroom d-block d-lg-none mx-auto">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <a className="navbar-brand p-0">
                <AppLogo />
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div id="wrapper">
        <section className="ratings">
          <div className="ratings-area bg-white mx-auto">
            {feedback?.rating == 0 && (
              <div>
                <div className="heading">
                  <h5 className="text-center">
                    How was your <span>Experience?</span>
                  </h5>
                </div>

                <div className="stars ratingOne mx-auto">
                  <ul className="nav">
                    <li>
                      <a onClick={() => setRating(1)}>
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      </a>
                    </li>

                    <li>
                      <a
                        onClick={() =>
                          setFeedback((prev: any) => ({ ...prev, rating: 2 }))
                        }
                      >
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      </a>
                    </li>

                    <li>
                      <a
                        onClick={() =>
                          setFeedback((prev: any) => ({ ...prev, rating: 3 }))
                        }
                      >
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      </a>
                    </li>

                    <li>
                      <a
                        onClick={() =>
                          setFeedback((prev: any) => ({ ...prev, rating: 4 }))
                        }
                      >
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      </a>
                    </li>

                    <li>
                      <a
                        onClick={() =>
                          setFeedback((prev: any) => ({ ...prev, rating: 5 }))
                        }
                      >
                        <figure>
                          <img src="/assets/images/star.png" alt="" />
                        </figure>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {feedback?.rating > 0 && (
              <div className="ratings-area-wrap">
                <form onSubmit={submit}>
                  <div className="heading">
                    {feedback?.rating === 1 && (
                      <h4 className="text-center">VERY BAD</h4>
                    )}
                    {feedback?.rating === 2 && (
                      <h4 className="text-center">BAD</h4>
                    )}
                    {feedback?.rating === 3 && (
                      <h4 className="text-center">AVERAGE</h4>
                    )}
                    {feedback?.rating === 4 && (
                      <h4 className="text-center">GOOD</h4>
                    )}
                    {feedback?.rating === 5 && (
                      <h4 className="text-center">AMAZING</h4>
                    )}
                  </div>

                  <div className="stars mx-auto">
                    <ul className="nav">
                      <li className="mx-0">
                        <a onClick={() => setRating(1)}>
                          {feedback?.rating == 1 && (
                            <>
                              <div ref={star_one}>
                                <Player
                                  src="https://assets6.lottiefiles.com/private_files/lf30_uuirhaey.json"
                                  background="transparent"
                                  className="star"
                                  speed={1}
                                  autoplay
                                  id="star_one"
                                />
                              </div>
                              <div ref={star_two}>
                                <Player
                                  src="https://assets4.lottiefiles.com/private_files/lf30_digrehtx.json"
                                  background="transparent"
                                  className="star"
                                  speed={1}
                                  style={{ display: "none" }}
                                  loop
                                  autoplay
                                />
                              </div>
                            </>
                          )}
                          {feedback?.rating > 1 && (
                            <figure>
                              <img
                                src="/assets/images/star-active.png"
                                alt=""
                              />
                            </figure>
                          )}
                        </a>
                      </li>

                      <li>
                        <a
                          onClick={() =>
                            setFeedback((prev: any) => ({ ...prev, rating: 2 }))
                          }
                        >
                          {feedback?.rating < 2 && (
                            <figure>
                              <img src="/assets/images/star.png" alt="" />
                            </figure>
                          )}
                          {feedback?.rating == 2 && (
                            <Player
                              className="star"
                              src="https://assets7.lottiefiles.com/private_files/lf30_yt0dbfaw.json"
                              background="transparent"
                              speed={1}
                              loop
                              autoplay
                            />
                          )}
                          {feedback?.rating > 2 && (
                            <figure>
                              <img
                                src="/assets/images/star-active.png"
                                alt=""
                              />
                            </figure>
                          )}
                        </a>
                      </li>

                      <li>
                        <a
                          onClick={() =>
                            setFeedback((prev: any) => ({ ...prev, rating: 3 }))
                          }
                        >
                          {feedback?.rating < 3 && (
                            <figure>
                              <img src="/assets/images/star.png" alt="" />
                            </figure>
                          )}
                          {feedback?.rating == 3 && (
                            <Player
                              className="star"
                              src="https://assets10.lottiefiles.com/private_files/lf30_ae1w5qve.json"
                              background="transparent"
                              speed={1}
                              loop
                              autoplay
                            />
                          )}
                          {feedback?.rating > 3 && (
                            <figure>
                              <img
                                src="/assets/images/star-active.png"
                                alt=""
                              />
                            </figure>
                          )}
                        </a>
                      </li>

                      <li>
                        <a
                          onClick={() =>
                            setFeedback((prev: any) => ({ ...prev, rating: 4 }))
                          }
                        >
                          {feedback?.rating < 4 && (
                            <img src="/assets/images/star.png" alt="" />
                          )}
                          {feedback?.rating == 4 && (
                            <Player
                              className="star"
                              src="https://assets5.lottiefiles.com/private_files/lf30_x4i7ykiv.json"
                              background="transparent"
                              speed={1}
                              loop
                              autoplay
                            />
                          )}
                          {feedback?.rating > 4 && (
                            <figure>
                              <img
                                src="/assets/images/star-active.png"
                                alt=""
                              />
                            </figure>
                          )}
                        </a>
                      </li>

                      <li>
                        <a
                          onClick={() =>
                            setFeedback((prev: any) => ({ ...prev, rating: 5 }))
                          }
                        >
                          {feedback?.rating < 5 && (
                            <img src="/assets/images/star.png" alt="" />
                          )}
                          {feedback?.rating == 5 && (
                            <Player
                              className="star"
                              src="https://assets2.lottiefiles.com/private_files/lf30_zxj3gzwi.json"
                              background="transparent"
                              speed={1}
                              loop
                              autoplay
                            />
                          )}
                        </a>
                      </li>
                    </ul>
                  </div>
                  {feedback?.rating < 4 ? (
                    <div className="info mx-auto">
                      <div className="title">
                        <h4 className="text-center">
                          What Went <span>Wrong?</span>
                        </h4>
                      </div>

                      <ul className="text-center">
                        <li>
                          <div
                            className="btn-group-toggle"
                            data-toggle="buttons"
                          >
                            <label className="btn box">
                              <input
                                type="checkbox"
                                autoComplete="off"
                                name="Difficult Questions"
                              />
                            </label>
                          </div>
                          <p className="text-center">Difficult Questions</p>
                        </li>

                        <li>
                          <div
                            className="btn-group-toggle"
                            data-toggle="buttons"
                          >
                            <label className="btn box">
                              <input
                                type="checkbox"
                                autoComplete="off"
                                name="Insufficient Time"
                              />
                            </label>
                          </div>
                          <p className="text-center">Insufficient Time</p>
                        </li>

                        <li>
                          <div
                            className="btn-group-toggle"
                            data-toggle="buttons"
                          >
                            <label className="btn box">
                              <input
                                type="checkbox"
                                autoComplete="off"
                                name="Irrelevant Questions"
                              />
                            </label>
                          </div>
                          <p className="text-center">Irrelevant Questions</p>
                        </li>

                        <li>
                          <div
                            className="btn-group-toggle"
                            data-toggle="buttons"
                          >
                            <label className="btn box">
                              <input
                                type="checkbox"
                                autoComplete="off"
                                name="Software Issues"
                              />
                            </label>
                          </div>
                          <p className="text-center">Software Issues</p>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="info mx-auto">
                      <div className="title">
                        <h4 className="text-center">
                          What <span className="blue">Impressed</span> you?
                        </h4>
                      </div>

                      <ul className="text-center">
                        <li>
                          <div
                            className="btn-group-toggle"
                            data-toggle="buttons"
                          >
                            <label className="btn box">
                              <input
                                type="checkbox"
                                autoComplete="off"
                                name="Amazing Questions"
                                onChange={(e) =>
                                  setImpressList((prev: any) => ({
                                    ...prev,
                                    amazing: e.target.checked,
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <p className="text-center">Amazing Questions</p>
                        </li>

                        <li>
                          <div
                            className="btn-group-toggle"
                            data-toggle="buttons"
                          >
                            <label className="btn box">
                              <input
                                type="checkbox"
                                autoComplete="off"
                                name="Ample Time"
                                onChange={(e) =>
                                  setImpressList((prev: any) => ({
                                    ...prev,
                                    ample: e.target.checked,
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <p className="text-center">Ample Time</p>
                        </li>

                        <li>
                          <div
                            className="btn-group-toggle"
                            data-toggle="buttons"
                          >
                            <label className="btn box">
                              <input
                                type="checkbox"
                                autoComplete="off"
                                name="Smooth Software"
                                onChange={(e) =>
                                  setImpressList((prev: any) => ({
                                    ...prev,
                                    smooth: e.target.checked,
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <p className="text-center">Smooth Software</p>
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="help mb-3 p-0">
                    <div className="btn-groups">
                      <div className="clearfix">
                        <div className="title">
                          <h5>Was this assesment helpful?</h5>
                        </div>

                        <div className="yes-no">
                          <div className="float-right">
                            <label
                              className={`btn ${
                                helpfulCheck === true ? "active" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                id="helpful_y"
                                name="helpfulCheck"
                                onClick={() => setHelpfulCheck(true)}
                              />{" "}
                              Yes
                            </label>
                            <label
                              className={`btn ${
                                helpfulCheck === false ? "active" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                id="helpful_n"
                                name="helpfulCheck"
                                onClick={() => setHelpfulCheck(false)}
                              />{" "}
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="help mb-4 p-0">
                    <div className="btn-groups">
                      <div className="clearfix">
                        <div className="title">
                          <h5>
                            Were you able to view and answer all questions?
                          </h5>
                        </div>

                        <div className="yes-no">
                          <div className="float-right">
                            <label
                              className={`btn ${
                                viewAllCheck === true ? "active" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                id="view_all_y"
                                name="viewAllCheck"
                                onClick={() => setViewAllCheck(true)}
                              />{" "}
                              Yes
                            </label>
                            <label
                              className={`btn ${
                                viewAllCheck === false ? "active" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                id="view_all_n"
                                name="viewAllCheck"
                                onClick={() => setViewAllCheck(false)}
                              />{" "}
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <textarea
                      className="form-control"
                      name="comment"
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      value={feedbackContent}
                      maxLength={4000}
                      placeholder={
                        feedback?.rating >= 4
                          ? "Tell us what you liked..."
                          : "Tell us more..."
                      }
                    ></textarea>
                  </div>
                  <button
                    className="btn text-white p-0 mx-auto fixed-bottom"
                    type="submit"
                    disabled={
                      helpfulCheck === undefined || viewAllCheck === undefined
                    }
                  >
                    Submit Feedback
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default TestFeedback;
