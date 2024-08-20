"use client";
// import cookieCutter from 'cookie-cutter'

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import LoadingOverlay from "react-loading-overlay-ts";

import { fromNow, ucFirst } from "@/lib/pipe";
import MathJax from "@/components/assessment/mathjax";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { useParams, useRouter } from "next/navigation";
import { getSectionTime } from "@/lib/helpers";
import alertify from "alertifyjs";

const Instruction = () => {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useSession()?.data || {};
  const [clientData, setClientData] = useState<any>();
  const [practice, setPractice] = useState<any>();
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);
  const [donotShowTutorial, setDonotShowTutorial] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [dontshow, setDontShow] = useState<boolean>(false);
  const [totalTime, setTotalTime] = useState<any>();
  const [processing, setProcessing] = useState<boolean>(false);

  const getPractice = useCallback(async () => {
    const { data } = await clientApi.get(`/api/tests/${id}`);
    setPractice(data);
    setLoaded(true);
    return data;
  }, []);

  const getClientData = useCallback(async () => {
    const { data } = await clientApi.get("/api/settings");
    setClientData(data);
  }, []);

  const startTest = async () => {
    if (processing) {
      return;
    }
    setProcessing(true);
    setLoaded(false);

    if (dontshow) {
      // cookieCutter.set(user?._id + '_dontShowInstruction', '1')
    }
    try {
      const { data } = await clientApi.get(
        `/api/testSeries/getPackageAttemptCount/${practice._id}${toQueryString({
          practice: practice._id,
        })}`
      );
      if (data.attemptAllowed) {
        if (practice.accessMode === "invitation" && !user) {
          alert(
            "Message",
            "This practice test requires an active membership." +
              "You don't have an active membership or your membership has expired. Please purchase a membership package." +
              "You can still take free tests."
          );
          router.push("/membership");
          return;
        }

        navigateToTestPage();
      } else {
        return alert(
          "Message",
          "Continuous and consistent practice is important to your success. You can only take up to " +
            data.attemptAllowedCount +
            " tests in a day from this package. Please return tomorrow and continue your practice."
        );
      }
    } catch (error) {
      console.error(error);
      alert("Message", error?.message);
    } finally {
      setProcessing(false);
      setLoaded(true);
    }
  };

  const navigateToTestPage = () => {
    if (practice.testMode === "learning") {
      router.push(`/assessment/adaptive/learning/${practice._id}`);
      // if (practice.testType == 'adaptive') {
      //   router.push(`/assessment/adaptive/learning/${practice._id}`)
      // } else {
      //   router.push(`/assessment/learning-test/${practice._id}`)
      // }
    } else {
      if (practice.testType == "adaptive") {
        router.push(`/assessment/adaptive/learning/${practice._id}`);
      } else {
        router.push(`/assessment/take-test/${practice._id}`);
      }
    }
  };

  const goToTutorial = () => {
    router.push(
      `/assessment/tutorial/${practice._id}${toQueryString({
        testMode: practice.testMode,
        testType: practice.testType,
      })}`
    );
  };

  const goBack = () => {
    router.push(
      `/assessment/home/${practice.title}${toQueryString({
        id: practice._id,
      })}`
    );
  };
  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    const getFetchIntial = async () => {
      const pract = await getPractice();
      await getClientData();
      if (localStorage.getItem(id + "_tutorialCompleted") == "true") {
        setTutorialCompleted(true);
      }
      if (localStorage.getItem(id + "_donotShowTutorial") == "true") {
        setDonotShowTutorial(true);
      }
      let time: any = [];
      if (pract?.isAdaptive) {
        setTotalTime(
          pract.hasOwnProperty("totalTime") && pract.totalTime > 0
            ? Number(pract.totalTime / 60).toFixed(0)
            : Number(pract.timePerQuestion).toFixed(0)
        );
      } else {
        if (pract?.questionMode === "auto" && pract?.timePerQuestion) {
          setTotalTime(
            Number((pract.timePerQuestion * pract.totalQuestion) / 60).toFixed(
              0
            )
          );
        } else {
          if (pract.sectionsTotalTime && pract.sectionsTotalTime.length > 0) {
            time = getSectionTime(pract.sectionsTotalTime);
          } else if (
            pract.sectionsPerQuestionTime &&
            pract.sectionsPerQuestionTime.length > 0
          ) {
            time = getSectionTime(pract.sectionsPerQuestionTime);
          }

          if (time.length > 0) {
            let total = 0;
            time.forEach((item: any) => {
              for (const key in item) {
                const value = item[key];
                total += parseInt(value, 6);
              }
            });
            setTotalTime(total);
          } else {
            setTotalTime(pract.timePerQuestion);
          }
        }
      }
    };
    getFetchIntial();
  }, [getClientData, getPractice]);

  return (
    <LoadingOverlay
      active={!loaded}
      spinner={<img src="/assets/images/perfectice-loader.gif" alt="" />}
      styles={{
        overlay: (base) => ({
          ...base,
          height: "100vh",
        }),
      }}
    >
      <section className="details test_details-top-banner mt-0 text-white">
        <div className="container">
          <div className="details-area mx-auto mw-100">
            <div className="row align-items-center">
              <div className="col">
                <div className="asses-info">
                  <div className="title-wrap clearfix">
                    <div className="title">
                      <h3 className="mr-2">{practice?.title}</h3>
                    </div>

                    <div className="info-text">
                      <span>{ucFirst(practice?.testMode)}</span>
                    </div>
                  </div>

                  <div className="asses-user d-flex align-items-center pt-2 pb-0">
                    <figure className="user_img_circled_wrap">
                      <img
                        src="/assets/images/people.png"
                        alt=""
                        className="user_img_circled"
                      />
                    </figure>

                    <div className="name ml-2 pl-0">
                      <h4 className="py-0">{practice?.user?.name}</h4>
                      <small className="f-14">
                        Published
                        {fromNow(practice?.statusChangedAt)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-auto ml-auto">
                <div className="d-none d-lg-block">
                  <div className="asses-right clearfix border-0 ml-auto">
                    <div className="asses-item border-0">
                      <figure>
                        <img src="/assets/images/clock.png" alt="" />
                      </figure>
                      <h4>{practice?.totalTime}</h4>
                      <span>Minutes</span>
                    </div>

                    <div className="asses-item">
                      <figure>
                        <img src="/assets/images/question.png" alt="" />
                      </figure>
                      <h4>
                        {practice?.testType != "standard"
                          ? practice?.questionsToDisplay
                          : practice?.totalQuestion}
                      </h4>
                      <span>Questions</span>
                    </div>

                    <div className="asses-item pr-3">
                      <figure>
                        <img src="/assets/images/pen.png" alt="" />
                      </figure>
                      <h4>{practice?.totalAttempt}</h4>
                      <span>
                        {practice?.totalAttempt > 1 ? "Attempts" : "Attempt"}{" "}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="asses-about pt-3">
        <div className="container">
          <div className="asses-about-area mx-auto">
            <div className="row">
              <div className="col-md-8">
                <div className="info instruction mw-100 mb-2">
                  <div className="inner">
                    <div className="section_heading_wrapper">
                      <h3 className="section_top_heading">
                        Instructions from Examiner
                      </h3>
                      {(!practice?.instructions ||
                        practice?.instructions.length === 0) && (
                        <p className="section_sub_heading">
                          No specific instruction provided by the examiner.
                        </p>
                      )}
                    </div>
                    <div className="instruction_text">
                      {practice?.instructions && (
                        <MathJax value={practice?.instructions} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {clientData?.assessmentInstructions && (
              <div className="info instruction mw-100">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">General Instructions</h3>
                </div>
                <div className="inner">
                  <span>
                    <MathJax value={clientData?.assessmentInstructions} />
                  </span>
                </div>
              </div>
            )}

            <div className="take-asses-btn-remove mx-auto mb-0 text-center">
              {practice?.viewTemplate == "default" &&
                !donotShowTutorial &&
                !tutorialCompleted &&
                user?.info.provider !== "prodapt" && (
                  <a className="btn btn-secondary ml-2" onClick={goToTutorial}>
                    Go to tutorial
                  </a>
                )}
              {!donotShowTutorial &&
                !tutorialCompleted &&
                user?.info.provider === "prodapt" && (
                  <a className="btn btn-primary ml-2" onClick={goToTutorial}>
                    Have a demo then start test
                  </a>
                )}
              <a className="btn btn-primary ml-2" onClick={startTest}>
                Ready to start
                {processing && <i className="fa fa-spinner fa-pulse"></i>}
              </a>
              <a className="btn btn-outline-primary ml-2" onClick={goBack}>
                Take me back
              </a>
            </div>
          </div>
        </div>
      </section>
    </LoadingOverlay>
  );
};
export default Instruction;
