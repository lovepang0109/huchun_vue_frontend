"use client"

import { useState, useEffect } from 'react'
import clientApi from "@/lib/clientApi";
import { useRouter } from "next/navigation";
import { secondsToDateTime } from "@/lib/pipe";

interface props {
  show?: boolean,
  attemptId?: string,
  takeQuiz?: any
}

const CourseAttempt = ({ show, attemptId, takeQuiz }: props) => {
  const [attempt, setAttempt] = useState<any>({});
  const router = useRouter()

  useEffect(() => {
    const getAttempt = async () => {
      let { data } = await clientApi.get(`/api/attempts/summary/${attemptId}`);
      setAttempt(data);
    }
    getAttempt();
  })

  return (
    <>
      <div className="border border-dark rounded p-3">
        <div className="section_heading_wrapper">
          <h3 className="section_top_heading">Result Overview</h3>
        </div>

        <div className="result-overview pt-0">
          <div className="result-overview-area-new mx-auto mw-100">
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Total Score</h4>
                  </div>

                  <div className="box-content">

                    <figure>
                      <img src="/assets/images/Group 2300.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over3">{attempt.totalMark} <small>/ {attempt.maximumMarks}</small>
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Total Time</h4>
                  </div>

                  <div className="box-content">
                    <figure>
                      <img src="/assets/images/over-img-3-new.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over2">{secondsToDateTime(attempt?.totalTime / 1000)}</h4>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="result-overview py-3">
          <div className="result-overview-area-new mx-auto mw-100">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">Question Summary</h3>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Correct</h4>
                  </div>

                  <div className="box-content">
                    <figure>
                      <img src="/assets/images/Group 2300.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over3">{attempt.totalCorrects}</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Incorrect</h4>
                  </div>

                  <div className="box-content">
                    <figure>
                      <img src="/assets/images/Group 2300.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over2">{attempt.totalErrors}</h4>
                    </div>
                  </div>

                </div>
              </div>
              {attempt?.pending ? (
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Pending</h4>
                  </div>

                  <div className="box-content">
                    <figure>
                      <img src="/assets/images/Group 2300.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over2">{attempt.pending}</h4>
                    </div>
                  </div>

                </div>
              ) : (<></>)}
            </div>
          </div>
        </div>

        <div className="text-center my-2">
          <a className="btn btn-outline mr-2 px-3" onClick={() => router.push(`/attempt-summary/${attemptId}`)}>Review</a>
          <a className="btn btn-primary ml-2" onClick={takeQuiz}>Retake Quiz</a >
        </div >

      </div >
    </>
  )
}

export default CourseAttempt;