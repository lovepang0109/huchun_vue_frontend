import clientApi from "@/lib/clientApi";
import { round, secondsToDateTime } from "@/lib/pipe";
import { toQueryString } from "@/lib/validator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface props {
  attempt: any;
  setAttempt: any;
  percentile: any
}
const AttemptOverview = ({ attempt, setAttempt, percentile }: props) => {
  const { user } = useSession()?.data || {};
  const router = useRouter();
  const [sections, setSections] = useState<any[]>([]);
  const [SAT, setSAT] = useState<any>();
  const isCourseAttempt = attempt?.referenceType !== "testseries";

  useEffect(() => {
    const fetchData = async () => {
      if (attempt.subjects) {
        const subjectIds = attempt.subjects.map((d: any) => d._id);
        const condObj = {
          subjects: subjectIds.join(","),
          practicesetId: attempt.practicesetId,
        };
        await clientApi.get(
          `/api/attempts/me/topperSummary/${
            condObj.practicesetId
          }${toQueryString(condObj)}`
        );
      }
      if (attempt.practiceSetInfo.fullLength) {
        let { data } = await clientApi.get(
          `/api/student/satScore/${attempt._id}`
        );
        data.data.forEach((d: any) => {
          if (d.section == "Math") {
            d.maxMarks = 800;
          }
          if (d.section == "Reading") {
            d.maxMarks = 400;
          }
          if (d.section == "Writing") {
            d.maxMarks = 400;
          }
        });
        setSAT(data.data);
        setAttempt((prev: any) => ({
          ...prev,
          totalMark:
            Math.round(
              (Number(SAT.reduce((p: number, c: any) => p + c?.sat, 0)) +
                Number.EPSILON) *
                100
            ) / 100,
          maximumMarks: 1600,
        }));
      }

      if (
        attempt.practiceSetInfo.enableSection ||
        attempt.practiceSetInfo.fullLength
      ) {
        let section: any = [];
        for (const section of attempt.practiceSetInfo.sections) {
          let secData: any = { name: section.name, mark: 0, maxMark: 0 };
          for (const question of attempt.practiceSetInfo.questions) {
            if (question.section == secData.name) {
              const qaData = attempt.QA.find(
                (qa: any) => qa.question == question.question
              );
              if (qaData) {
                secData.mark += qaData.obtainMarks;
                secData.maxMark += qaData.actualMarks;
              }
            }
          }

          section.push(secData);
        }
        setSections(section);
      }
    };
    fetchData();
  }, []);

  const goToNextPage = () => {
    if (!attempt || !attempt.referenceType || !attempt.referenceId) {
      console.error("Incomplete attempt data. Unable to proceed.");
      return;
    }


    const { referenceType, practicesetId, referenceData, referenceId } =
      attempt;

    if (referenceType === "course") {
      const contentInfoKey = `${user?.info?._id}_${practicesetId}_course_content_back`;
      const contentInfo = localStorage.getItem(contentInfoKey);

      let queryParams = {
        finishedContent: referenceData,
      };

      if (contentInfo) {
        const courseParams = JSON.parse(contentInfo);
        localStorage.removeItem(contentInfoKey);

        if (courseParams.demoSection) {
          queryParams.demoSection = courseParams.demoSection;
        }
      }

      router.push(`/course/stage/${referenceId}${toQueryString(queryParams)}`);
    } else {
      router.push(`/testSeries/details/${referenceId}`);
    }
  };

  const continueButton =
    attempt && attempt.referenceType && attempt.referenceId ? (
      <a className="btn btn-primary mt-2 mb-5" onClick={goToNextPage}>
        {attempt.referenceType === "course"
          ? "Continue to Course"
          : "Continue to Test Series"}
      </a>
    ) : null;

  return (
    <div>
      <div id="overview bg-white">
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
                      <img src="/assets/images/Group 2300.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over3">
                        {attempt?.totalMark}{" "}
                        <small> / {attempt?.maximumMarks}</small>
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Percentile</h4>
                  </div>

                  <div className="box-content">
                    <figure>
                      <img src="/assets/images/over-img-2-new.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over2">
                        {percentile}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className="result-overview-box">
                  <div className="title">
                    <h4 className="text-center">Total Time</h4>
                  </div>

                  <div className="box-content">
                    <figure>
                      <img src="/assets/images/over-img-3-new.png" alt="" />
                    </figure>

                    <div className="info">
                      <h4 className="over2">
                        {secondsToDateTime(attempt?.totalTime / 1000)}
                      </h4>
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
              <h3 className="section_top_heading">Subject Score</h3>
              <p className="section_sub_heading">
                Know how much you have scored in each subject.{" "}
              </p>
            </div>
            {!attempt.practiceSetInfo.fullLength && (
              <div className="row">
                {attempt?.subjects.map((item: any, index: number) => (
                  <div className="col-md-3 mb-3" key={item.name + index}>
                    <div className="result-overview-box">
                      <div className="title">
                        <h4 className="text-center">{item.name}</h4>
                      </div>

                      <div className="box-content">
                        <figure>
                          <img src="/assets/images/copyrep 2.png" alt="" />
                        </figure>

                        <div className="info">
                          <h4 className="over3 text-dark">
                            {item.mark} <small> / {item.maxMarks}</small>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {attempt?.practiceSetInfo?.fullLength && SAT && (
              <div className="row">
                {SAT.map((item: any, index: number) => (
                  <div className="col-md-3 mb-3" key={item.section + index}>
                    <div className="result-overview-box">
                      <div className="title">
                        <h4 className="text-center">{item.section}</h4>
                      </div>

                      <div className="box-content">
                        <figure>
                          {item.section == "Reading" && (
                            <img
                              src="/assets/images/ant-design_read-outlined.png"
                              alt=""
                            />
                          )}
                          {item.section == "Writing" && (
                            <img src="/assets/images/jam_write-1.png" alt="" />
                          )}
                          {item.section == "Math" && (
                            <img
                              src="/assets/images/mdi_math-compass.png"
                              alt=""
                            />
                          )}
                          {item.section != "Reading" &&
                            item.section != "Writing" &&
                            item.section != "Math" && (
                              <img src="/assets/images/copyrep 2.png" alt="" />
                            )}
                        </figure>

                        <div className="info">
                          <h4 className="over3 text-dark">
                            {item.sat} <small> / {item.maxMarks}</small>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {attempt?.practiceSetInfo.enableSection ||
          (SAT && (
            <div className="result-overview pt-2 pb-3">
              <div className="result-overview-area-new mx-auto mw-100">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Section Score</h3>
                  <p className="section_sub_heading">
                    Here comes the description for the section score.{" "}
                  </p>
                </div>
                <div className="row">
                  {sections.map((section: any, index: number) => (
                    <div className="col-md-3 mb-3" key={section.name + index}>
                      <div className="result-overview-box">
                        <div className="title-1">
                          <h4 className="text-center over-text">
                            <figure className="mr-1 d-inline-block  align-top">
                              {section.name.indexOf("Reading") > -1 && (
                                <img
                                  src="/assets/images/ant-design_read-outlined.png"
                                  alt=""
                                />
                              )}
                              {section.name.indexOf("Writing") > -1 && (
                                <img
                                  src="/assets/images/jam_write-1.png"
                                  alt=""
                                />
                              )}
                              {section.name.indexOf("Math") > -1 && (
                                <img
                                  src="/assets/images/mdi_math-compass.png"
                                  alt=""
                                />
                              )}
                              {section.name.indexOf("Reading") == -1 &&
                                section.name.indexOf("Writing") == -1 &&
                                section.name.indexOf("Math") == -1 && (
                                  <img
                                    src="/assets/images/copyrep 2.png"
                                    alt=""
                                  />
                                )}
                            </figure>
                            {section.name}
                          </h4>
                        </div>

                        <div className="box-content">
                          <h4 className="over4 text-dark">
                            {section.mark} <small> / {section.maxMark}</small>
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

        <div className="text-center">{continueButton}</div>
      </div>
    </div>
  );
};

export default AttemptOverview;
