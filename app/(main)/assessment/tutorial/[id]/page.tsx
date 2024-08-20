"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import StepOne from "../one/page";
import StepTwo from "../three/page";
import StepThree from "../three/page";
import StepFour from "../four/page";
import StepFive from "../five/page";
import StepSix from "../six/page";
import StepSeven from "../seven/page";
import { useSession } from "next-auth/react";
const Tutorial = () => {
  const router = useRouter();
  const { user } = useSession().data || {};
  const searchParams = useSearchParams();
  const testMode = searchParams.get("testMode");
  const testType = searchParams.get("testType");
  const { id } = useParams();
  const [activeInstruction, setActiveInstruction] = useState<string>("one");
  const [processing, setProcessing] = useState<boolean>(false);

  const nextInstruction = (instruction: string) => {
    setActiveInstruction(instruction);
  };

  const navigateToTestPage = () => {
    if (testMode === "learning") {
      router.push(`/assessment/adaptive/learning/${id}`);
      // if (testType == 'adaptive') {
      //   router.push(`/assessment/adaptive/learning/${id}`)
      // } else {
      //   router.push(`/assessment/learning-test/${id}`)
      // }
    } else {
      if (testType == "adaptive") {
        router.push(`/assessment/adaptive/test/${id}`);
      } else {
        router.push(`/assessment/take-test/${id}`);
      }
    }
  };
  const startTest = async () => {
    if (processing) {
      return;
    }
    setProcessing(true);
    try {
      const { data } = await clientApi.get(
        `/api/testSeries/getPackageAttemptCount/${id}${toQueryString({
          practice: id,
        })}`
      );
      if (data.attemptAllowed) {
        localStorage.setItem(id + "_tutorialCompleted", "true");
        navigateToTestPage();
      } else {
        return alert(
          "Continuous and consistent practice is important to your success. You can only take up to " +
            data.attemptAllowedCount +
            " tests in a day from this package. Please return tomorrow and continue your practice."
        );
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {console.log("current step: ", activeInstruction)}
      <header className="mcq">
        <div className="container-fluid">
          <div className="header-area mx-auto">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <a className="navbar-brand clearfix p-0 m-0" href="#">
                <figure>
                  <img src="/assets/images/student-profile.png" alt="" />
                </figure>
                <span className="text-white">Student Name</span>
              </a>
              <div className="assesment-name mx-auto">
                <span className="text-white">Assessment Name</span>
              </div>
              <div className="navbar-nav ml-auto">
                <div className="timer">
                  <h6 className="text-white text-center">Time Remaining</h6>
                  <div className="timer-clock text-center">
                    <span className="text-white">19:30</span>
                  </div>
                </div>
                <div className="finish-btn">
                  <a className="text-white text-center" href="#">
                    Finish
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>
      {activeInstruction === "one" && (
        <StepOne handleNextInstruction={nextInstruction} />
      )}
      {activeInstruction === "two" && (
        <StepTwo
          handleNextInstruction={nextInstruction}
          startTest={startTest}
        />
      )}
      {activeInstruction === "three" && (
        <StepThree
          handleNextInstruction={nextInstruction}
          startTest={startTest}
        />
      )}
      {activeInstruction === "four" && (
        <StepFour
          handleNextInstruction={nextInstruction}
          startTest={startTest}
        />
      )}

      {activeInstruction === "five" && (
        <StepFive
          handleNextInstruction={nextInstruction}
          startTest={startTest}
        />
      )}
      {activeInstruction === "six" && (
        <StepSix
          handleNextInstruction={nextInstruction}
          startTest={startTest}
        />
      )}
      {activeInstruction === "seven" && (
        <StepSeven startTest={startTest} id={user?.info._id} />
      )}
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default Tutorial;
