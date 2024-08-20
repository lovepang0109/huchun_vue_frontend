import clientApi from "@/lib/clientApi";
import { round, secondsToDateTime } from "@/lib/pipe";
import { toQueryString } from "@/lib/validator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as studentSvc from "@/services/student-service";
import * as userService from "@/services/userService";

interface props {
  attempt: any;
  setAttempt: any;
}
const PublicAttemptOverview = ({ attempt, setAttempt }: props) => {
  const router = useRouter();
  const [sections, setSections] = useState<any[]>([]);
  const [satScore, setSatScore] = useState<any>();
  const [actScore, setActScore] = useState<any>();
  const [subjectsScore, setSubjectsScore] = useState<any>();
  const [currentUser, setCurrentUser] = useState<any>();

  useEffect(() => {
    userService.get().then((user) => {
      setCurrentUser(user);
    });

    if (
      attempt.practiceSetInfo.enableSection ||
      attempt.practiceSetInfo.fullLength
    ) {
      for (const section of attempt.practiceSetInfo.sections) {
        if (section.isBreakTime) {
          continue;
        }
        const secData: any = {
          name: section.name,
          mark: 0,
          maxMark: 0,
          displayName: section.displayName,
        };
        for (const question of attempt.practiceSetInfo.questions) {
          if (question.section == secData.name) {
            const qaData = attempt.QA.find(
              (qa) => qa.question == question.question
            );
            if (qaData) {
              secData.mark += qaData.obtainMarks;
              secData.maxMark += qaData.actualMarks;
            }
          }
        }
        setSections([...sections, secData]);
      }
    }

    if (attempt.practiceSetInfo.fullLength) {
      getFullLengthScore();
    }
  }, []);

  const getFullLengthScore = async () => {
    const att = attempt;

    if (att.practiceSetInfo.view == "SAT") {
      let totalMathRaw = 0;
      let totalRWRaw = 0;
      const secs = sections;
      for (const section of secs) {
        if (section.name.indexOf("Math") > -1) {
          totalMathRaw += section.mark;
        } else {
          totalRWRaw += section.mark;
        }
      }
      setSections(secs);
      if (!attempt.SAT.sections.length) {
        const res: any = await studentSvc.getSatScore(attempt._id);
        att.SAT.sections = res.data;
        att.SAT.total = 0;
        for (const sec of res.data) {
          att.SAT.total += sec.sat;
        }
      }

      if (att.practiceSetInfo.apiVersion == "PSAT") {
        att.minMarks = att.subjects.length == 1 ? 160 : 320;

        att.SAT.sections.forEach((sect) => {
          sect.minMarks = 160;
          if (sect.section == "Math") {
            sect.maxMarks = 760;
            if (totalMathRaw == 0) {
              sect.min = true;
            }
          } else if (sect.section == "Reading") {
            sect.maxMarks = 380;
          } else if (sect.section == "Writing") {
            sect.maxMarks = 380;
          } else if (sect.section == "Reading and Writing") {
            sect.maxMarks = 760;
            if (totalRWRaw == 0) {
              sect.min = true;
            }
          }
        });
      } else {
        att.minMarks = att.subjects.length == 1 ? 200 : 400;

        att.SAT.sections.forEach((sect) => {
          sect.minMarks = 200;
          if (sect.section == "Math") {
            sect.maxMarks = 800;
            if (totalMathRaw == 0) {
              sect.min = true;
            }
          } else if (sect.section == "Reading") {
            sect.maxMarks = 400;
          } else if (sect.section == "Writing") {
            sect.maxMarks = 400;
          } else if (sect.section == "Reading and Writing") {
            sect.maxMarks = 800;
            if (totalRWRaw == 0) {
              sect.min = true;
            }
          }
        });
      }

      setTimeout(() => {
        att.SAT.sections.sort((a, b) => b.section.localeCompare(a.section));
        setSubjectsScore(att.SAT.sections);

        att.totalMark = att.SAT.total;

        if (att.practiceSetInfo.apiVersion == "PSAT") {
          att.maximumMarks = att.subjects.length == 1 ? 760 : 1520;
        } else {
          att.maximumMarks = att.subjects.length == 1 ? 800 : 1600;
        }

        if (totalMathRaw == 0 && totalRWRaw == 0) {
          att.SAT.min = true;
        }

        if (att.totalMark > 0) {
          studentSvc
            .satToAct(att._id, { total: att.totalMark })
            .then((act: any) => {
              setActScore(act);
            });
        }
      });
    } else if (att.practiceSetInfo.view == "ACT") {
      studentSvc
        .getActScore(att._id)
        .then(
          ({
            data: { total, subjects },
          }: {
            data: { total: number; subjects: any };
          }) => {
            setSatScore([]);
            const actToSatParams = {
              total: total,
              math: 0,
              reading: 0,
              english: 0,
              science: 0,
            };
            for (const sub in subjects) {
              actToSatParams[sub] = subjects[sub].scale;
              setSubjectsScore([
                ...subjectsScore,
                {
                  section: sub,
                  maxMarks: sub == "math" ? 60 : sub == "english" ? 75 : 40,
                  sat: subjects[sub].raw < 1 ? 1 : subjects[sub].raw,
                },
              ]);
            }

            att.totalMark = total < 1 ? 1 : total;
            att.maximumMarks = att.subjects.length == 1 ? 12 : 36;

            if (actToSatParams.total > 0) {
              studentSvc.actToSat(att._id, actToSatParams).then((sat: any) => {
                setSatScore(sat);
              });
            }
          }
        );
    }
    setAttempt(att);
  };

  return (
    <div>
      <div id="overview" className="bg-white">
        <div className="result-overview pt-0">
          <div className="result-overview-area-new mx-auto mw-100">
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Total Score</h4>
                  </div>
                  <div className="box-content">
                    <figure>
                      <img src="assets/images/Group 2300.png" alt="" />
                    </figure>
                    <div className="info">
                      {attempt?.practiceSetInfo.fullLength &&
                      attempt?.practiceSetInfo.view === "SAT" &&
                      attempt.SAT ? (
                        <h4 className="over3">
                          {!attempt.SAT.min ? (
                            <>
                              {attempt.SAT.total - 20} -{" "}
                              {attempt.SAT.total + 20}{" "}
                              <small>/ {attempt.maximumMarks}</small>
                            </>
                          ) : (
                            <>
                              {attempt.minMarks}{" "}
                              <small>/ {attempt.maximumMarks}</small>
                            </>
                          )}
                        </h4>
                      ) : attempt?.practiceSetInfo.fullLength &&
                        attempt.practiceSetInfo.view === "ACT" ? (
                        <h4 className="over3">
                          {attempt.ACT?.total}{" "}
                          <small>
                            / {attempt.subjects.length === 1 ? 12 : 36}
                          </small>
                        </h4>
                      ) : (
                        <h4 className="over3">
                          {attempt.totalMark}{" "}
                          <small>/ {attempt.maximumMarks}</small>
                        </h4>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {attempt?.practiceSetInfo.fullLength &&
                attempt?.practiceSetInfo.view === "SAT" &&
                actScore &&
                attempt.subjects.length > 1 && (
                  <div className="col-md-3 mb-3">
                    <div className="result-overview-box">
                      <div className="title">
                        <h4 className="text-center">Equivalent ACT Score</h4>
                      </div>
                      <div className="box-content">
                        <figure>
                          <img src="assets/images/Group 2300.png" alt="" />
                        </figure>
                        <div className="info">
                          <h4 className="over3">
                            {actScore.score}{" "}
                            <small>/ {actScore.maxScore}</small>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {attempt?.practiceSetInfo.fullLength &&
                attempt.practiceSetInfo.view === "ACT" &&
                satScore &&
                attempt.subjects.length > 1 && (
                  <div className="col-md-3 mb-3">
                    <div className="result-overview-box">
                      <div className="title">
                        <h4 className="text-center">Equivalent SAT Score</h4>
                      </div>
                      <div className="box-content">
                        <figure>
                          <img src="assets/images/Group 2300.png" alt="" />
                        </figure>
                        <div className="info">
                          <h4 className="over3">
                            {satScore.score}{" "}
                            <small>/ {satScore.maxScore}</small>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {attempt.preferences?.assessment.comparativeAnalysis && (
                <div className="col-md-3 mb-3">
                  <div className="result-overview-box">
                    <div className="title">
                      <h4 className="text-center">Percentile</h4>
                    </div>
                    <div className="box-content">
                      <figure>
                        <img src="assets/images/over-img-2-new.png" alt="" />
                      </figure>
                      <div className="info">
                        <h4 className="over2">
                          {round(attempt?.accuracyPercent)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-md-3 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Total Time</h4>
                  </div>
                  <div className="box-content">
                    <figure>
                      <img src="assets/images/over-img-3-new.png" alt="" />
                    </figure>
                    <div className="info">
                      <h4 className="over2">
                        {formatTime(attempt?.totalTime)}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {attempt?.practiceSetInfo.fullLength &&
              attempt.practiceSetInfo.view === "SAT" && (
                <p className="section_sub_heading">
                  The total score may not reflect your actual score in the exam.
                  It may vary by +-50-100 points.
                </p>
              )}
          </div>
        </div>

        <div className="result-overview py-3">
          <div className="result-overview-area-new mx-auto mw-100">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">Subject Score</h3>
              <p className="section_sub_heading">
                Know how much student has scored in a particular subject.
              </p>
            </div>
            {!attempt?.practiceSetInfo.fullLength ? (
              <div className="row">
                {attempt.subjects.map((item, index) => (
                  <div className="col-md-3 mb-3" key={index}>
                    <div className="result-overview-box">
                      <div className="title">
                        <h4 className="text-center">{item.name}</h4>
                      </div>
                      <div className="box-content">
                        <figure>
                          <img src="assets/images/copyrep 2.png" alt="" />
                        </figure>
                        <div className="info">
                          <h4 className="over3 text-dark">
                            {item.mark} <small>/ {item.maxMarks}</small>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row">
                {subjectsScore.map((item, index) => (
                  <div className="col-md-3 mb-3" key={index}>
                    <div className="result-overview-box">
                      <div className="title">
                        <h4 className="text-center">{item.section}</h4>
                      </div>
                      <div className="box-content">
                        <figure>
                          {item.section === "Reading" && (
                            <img
                              src="assets/images/ant-design_read-outlined.png"
                              alt=""
                            />
                          )}
                          {(item.section === "Writing" ||
                            item.section === "English") && (
                            <img src="assets/images/jam_write-1.png" alt="" />
                          )}
                          {(item.section === "Math" ||
                            item.section === "Science") && (
                            <img
                              src="assets/images/mdi_math-compass.png"
                              alt=""
                            />
                          )}
                          {item.section !== "English" &&
                            item.section !== "Science" &&
                            item.section !== "Reading" &&
                            item.section !== "Writing" &&
                            item.section !== "Math" && (
                              <img src="assets/images/copyrep 2.png" alt="" />
                            )}
                        </figure>
                        <div className="info">
                          {attempt.practiceSetInfo.view === "SAT" ? (
                            <h4 className="over3 text-dark">
                              {!item.min ? (
                                <>
                                  {item.sat - 20} - {item.sat + 20}{" "}
                                  <small>/ {item.maxMarks}</small>
                                </>
                              ) : (
                                <>
                                  {item.minMarks}{" "}
                                  <small>/ {item.maxMarks}</small>
                                </>
                              )}
                            </h4>
                          ) : (
                            <h4 className="over3 text-dark">
                              {item.sat} <small>/ {item.maxMarks}</small>
                            </h4>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {attempt.practiceSetInfo.enableSection && (
          <div className="result-overview pt-2 pb-3">
            <div className="result-overview-area-new mx-auto mw-100">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Section Score (Raw)</h3>
                <p className="section_sub_heading">
                  Know how much student has scored in each section based on
                  number of correct answers and marks assigned to the questions.
                </p>
              </div>
              <div className="row">
                {sections.map((section, index) => (
                  <div className="col-md-3" key={index}>
                    <div className="result-overview-box">
                      <div className="title-1">
                        <h4 className="text-center over-text">
                          <figure className="mr-1 d-inline-block align-top">
                            {section.name.includes("Reading") && (
                              <img
                                src="assets/images/ant-design_read-outlined.png"
                                alt=""
                              />
                            )}
                            {section.name.includes("English") && (
                              <img src="assets/images/jam_write-1.png" alt="" />
                            )}
                            {section.name.includes("Math") && (
                              <img
                                src="assets/images/mdi_math-compass.png"
                                alt=""
                              />
                            )}
                            {!section.name.includes("Reading") &&
                              !section.name.includes("English") &&
                              !section.name.includes("Math") && (
                                <img src="assets/images/copyrep 2.png" alt="" />
                              )}
                          </figure>
                          {section.displayName || section.name}
                        </h4>
                      </div>
                      <div className="box-content">
                        <h4 className="over4 text-dark">
                          {section.mark} <small>/ {section.maxMark}</small>
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAttemptOverview;
