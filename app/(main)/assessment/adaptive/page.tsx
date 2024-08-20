"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import Descriptive from "@/components/assessment/descriptive-question";
// import { alert } from 'alertifyjs'

const Adaptive = () => {
  const router = useRouter();
  const queryParams = useSearchParams();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>({});
  const units = useMemo(() => selectedSubject?.units, [selectedSubject]);
  const [selectedUnit, setSelectedUnit] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLearningMode, setIsLearningMode] = useState<boolean>(true);

  useEffect(() => {
    const getSubjects = async () => {
      const { data } = await clientApi.get("/api/subjects/adaptive");
      setSubjects(data);
      const subject = queryParams.get("subject");
      if (!!subject) {
        setSelectedSubject(data.find((s: any) => s._id === subject));
      }
    };
    getSubjects();
  }, []);

  const startTest = async () => {
    setIsSubmitted(true);
    if (!Object.keys(selectedSubject) || !selectedSubject._id) return;
    if (!Object.keys(selectedUnit) || !selectedUnit._id) return;
    try {
      const { data } = await clientApi.post("/api/adaptiveTest/generate", {
        subject: selectedSubject._id,
        unit: selectedUnit._id,
        learningMode: isLearningMode,
      });
      const url = isLearningMode
        ? "assessment/adaptive/learning/"
        : "assessment/adaptive/test/";
      router.push(url + data._id);
    } catch (error) {
      console.error("error: ", error);
      alert(error?.response?.data?.error);
    }
  };
  return (
    <main className="pt-0 bg-light">
      <section className="adaptive-test">
        <div className="hadding-name">
          <div className="container">
            <div className="box">
              <h3>COMPUTER GENERATED ASSESSMENT</h3>
              <p>
                Not feeling challenged? Tired of solving questions from
                assessment created by a human? Let computer challenge you. It is
                like playing chess against a computer.
              </p>
            </div>
          </div>
        </div>
        <div className="adaptive-body">
          <div className="container">
            <div className="adaptive-card">
              <div className="left-card">
                <div className="content">
                  <h4>What is an Computer Generated Assessment?</h4>
                  <p>
                    Adaptive assessment involves modifying the assessment to
                    take account of the candidate’s ability.  In adaptive
                    assessments, the assessment&apos;s difficulty adapts to the
                    performance of the candidate, getting harder or easier
                    following a correct or incorrect answer respectively.
                  </p>
                </div>
                <div className="content">
                  <h4>How does it work?</h4>
                  <p>
                    Computer generated assessment are designed to adjust their
                    level of difficulty based on the responses provided, to
                    match the knowledge and ability of a assessment taker. If
                    the candidate answers the first question correctly, the next
                    question will be harder, if they get the next question
                    incorrect, the next question will be easier.
                  </p>
                </div>
                <div className="content">
                  <h4>Why is it good for you?</h4>
                  <div className="main-box">
                    <div className="cart-box">
                      <div className="image">
                        <img src="/assets/images/timer.svg" alt="" />
                      </div>
                      <div className="content-box">
                        <h5>Quicker</h5>
                        <p>
                          {" "}
                          Computer generated assessments can be considerably
                          shorter than traditional assessments
                        </p>
                      </div>
                    </div>
                    <div className="cart-box">
                      <div className="image">
                        <img src="/assets/images/gool.svg" alt="" />
                      </div>
                      <div className="content-box">
                        <h5>More Accurate</h5>
                        <p>
                          Computer generated assessments provide uniformly
                          precise scores
                        </p>
                      </div>
                    </div>
                    <div className="cart-box">
                      <div className="image">
                        <img src="/assets/images/waiting.svg" alt="" />
                      </div>
                      <div className="content-box">
                        <h5>More Fair</h5>
                        <p>
                          {" "}
                          Questions difficulty matters and harder questions are
                          given more weighting than easy questions
                        </p>
                      </div>
                    </div>
                    <div className="cart-box">
                      <div className="image">
                        <img src="/assets/images/ok.svg" alt="" />
                      </div>
                      <div className="content-box">
                        <h5>Better candidate experience</h5>
                        <p>
                          Candidates are only given questions commensurate with
                          their ability
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="right-card">
                <div className="content">
                  <h4 className="mb-1">Create your own Adaptive Assessment </h4>
                  <div className="adaptive adaptive_new mx-auto pb-0 pt-0">
                    <div className="adaptive-form mx-auto mt-3">
                      <div className="body-box">
                        <div className="form-group">
                          <label className="text-uppercase">
                            Subject<sup>*</sup>
                          </label>
                          <div className="position-relative">
                            <select
                              className="form-control"
                              name="subject"
                              onChange={(e) => {
                                setSelectedSubject(
                                  subjects.find(
                                    (sub) => sub._id === e.target.value
                                  )
                                );
                                setSelectedUnit({});
                              }}
                              value={selectedSubject?._id}
                              required
                            >
                              <option disabled value={0}>
                                Select
                              </option>
                              {subjects.map((sub) => (
                                <option key={sub._id} value={sub._id}>
                                  {sub.name}
                                </option>
                              ))}
                            </select>
                            {!selectedSubject && isSubmitted && (
                              <p className="label label-danger text-danger">
                                Subject is required
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="text-uppercase">
                            Unit<sup>*</sup>
                          </label>
                          <div className="position-relative">
                            <select
                              className="form-control"
                              name="unit"
                              onChange={(e) =>
                                setSelectedUnit(
                                  units.find(
                                    (unit: any) => unit._id === e.target.value
                                  )
                                )
                              }
                              value={selectedUnit._id}
                              required
                            >
                              <option disabled>Select</option>
                              {units?.map((unit: any) => (
                                <option key={unit._id} value={unit._id}>
                                  {unit.name}
                                </option>
                              ))}
                            </select>
                            {!Object.keys(selectedUnit).length &&
                              isSubmitted && (
                                <p className="label label-danger text-danger">
                                  Unit is required
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="mode">
                          <div className="row">
                            <div className="col-9">
                              <h5 className="text-uppercase mb-2">
                                Learning mode
                              </h5>
                              <p>
                                After attempting each question, you will be able
                                to see the answer, explanation, and recommended
                                learning. Keep this off when you want to see
                                results at the end of the assessment.
                              </p>
                            </div>

                            <div className="col-3">
                              <div className="switch-item d-block">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    name="isLearningMode"
                                    aria-label="isLearningModecheckbox"
                                    id="isLearningMode"
                                    checked={isLearningMode}
                                    onChange={(e) =>
                                      setIsLearningMode(e.target.checked)
                                    }
                                  />
                                  <span className="slider round"></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-theme-blue-g mt-5 w-100"
                        onClick={startTest}
                      >
                        Start the Assessment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Adaptive;
