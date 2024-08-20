import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { alert } from "alertifyjs";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";

interface props {
  attempt: any;
  setAttempt: any;
}
const AttempRecommendations = ({ attempt, setAttempt, settings }: any) => {
  const { user } = useSession()?.data || {};
  const router = useRouter();

  const [owlOptions, setOwlOptions] = useState<any>({
    loop: false,
    autoplay: false,
    margin: 10,
    nav: true,
    dots: false,
    autoWidth: true,
    autoHeight: false,
    smartSpeed: 900,
    autoplayTimeout: 5000,
    navText: ["", ""],
    autoplayHoverPause: true,
    animateOut: "fadeOut",
    responsive: {
      0: {
        items: 4,
      },
    },
  });
  const [generating, setGenerating] = useState<any>(null);
  const [recommendedTests, setRecommendedTests] = useState<any>(null);
  const [previousAccuracyBySub, setPreviousAccuracyBySub] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await clientApi.get(
          `/api/tests/${attempt.practicesetId}/addLinkedTest${toQueryString({
            studentId: attempt.user._id,
          })}`
        );
        setRecommendedTests(res.data);
      } catch (err) {
        console.error(err);
        setRecommendedTests([]);
      }
      if (attempt.subjects) {
        const subjectIds = attempt.subjects.map((d) => d._id);
        const params = {
          subjects: subjectIds.join(","),
          practicesetId: attempt.practicesetId,
          currentAttempt: attempt._id,
          user: attempt.user._id,
          attemptDate: attempt.createdAt,
        };
        const query = toQueryString(params);
        const res = await clientApi.get(
          `/api/attempts/accuracyBySubject/${attempt.practicesetId}${query}`
        );
        res.data.forEach((el) => {
          const sub = attempt.units.find((d) => d.name == el.unit);
          if (sub) {
            el.cAcc = sub.accuracy;
          } else {
            el.cAcc = 0;
          }
        });
        const temp = res.data.filter((s) => s.cAcc * 100 < s.accuracy);
        setPreviousAccuracyBySub(temp);
        setPreviousAccuracyBySub(
          temp.sort((s1, s2) => s2.accuracy - s1.accuracy)
        );
      }
    };
    fetchData();
  }, []);

  const practiceMore = async () => {
    setGenerating(true);
    try {
      const res = await clientApi.post(`/api/tests/generateTargetedTest`, {
        attemptId: attempt._id,
        studentId: attempt.user._id,
      });
      router.push(`/assessment/details/${res.data._id}`);
      setGenerating(false);
    } catch (err) {
      alert(
        "Message",
        err?.message || "Failed to generate targeted assessment."
      );
      setGenerating(false);
    }
  };

  return (
    <div className="pb-4">
      <div className="rounded bg-white shadow">
        {settings?.features?.targetedPractice &&
          !attempt.isAbandoned &&
          !attempt.ongoing && (
            <>
              <div className="card-header-common">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Targeted Practice</h3>
                  <p className="section_sub_heading">
                    Based on performance in this assessment.
                  </p>
                </div>
              </div>
              <div className="p-3">
                <div className="d-flex flex-column gap-xs">
                  <p className="f-14">
                    The system has identified few areas of improvement based.
                  </p>
                  {previousAccuracyBySub?.length > 1 && (
                    <div className="right_tick_list">
                      {previousAccuracyBySub?.map((item, index) => (
                        <p key={index}>
                          {item.unit} ({item.subject})
                        </p>
                      ))}
                    </div>
                  )}
                  <div>
                    <p>
                      Click Create And Assign button and the system will
                      generate a personalized assessment based on the above
                      areas of improvement and assign it to the student.
                    </p>
                  </div>
                </div>
                <div className="text-right p-3">
                  {attempt.targetedTest && (
                    <p>
                      <em>*Targeted Practice was generated.</em>
                    </p>
                  )}
                  <button
                    className="btn btn-primary"
                    disabled={attempt.targetedTest || generating}
                    onClick={practiceMore}
                    style={{ width: "250px" }}
                  >
                    Create And Assign &nbsp;
                    <i
                      className={`fa fa-spinner fa-pulse ${
                        generating ? "" : "d-none"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>
            </>
          )}
      </div>
      <div className="box-area box-area_new mt-4">
        {recommendedTests && (
          <div className="card-common products_slider">
            <div className="card-header-common">
              <div className="row align-items-center">
                <div className="col">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">
                      Recommended Assessments
                    </h3>
                    <p className="section_sub_heading">
                      Those who took this assessment also took one or more of
                      these assessments. However, it is recommended to analyze
                      your performance, identify areas of improvement, and
                      practice more on specific skills before attempting another
                      full-length or section assessment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body-common">
              {recommendedTests.length > 0 && (
                <div className="box-area-wrap box-area-wrap_new clearfix">
                  {/* Here you should implement your carousel component (like OwlCarousel) */}
                  {/* Iterate over recommendedTests */}
                  {recommendedTests.map((test, index) => (
                    <div key={index} className="box-item">
                      <div className="box box_new bg-white pt-0">
                        <div
                          className="image-wrap cursor-pointer"
                          onClick={() => {
                            window.location.href = `/${user.role}/assessments/details/${test._id}`;
                          }}
                        >
                          {/* p-image component */}
                          <div
                            className="favorite-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(test);
                            }}
                          >
                            <figure>
                              <img
                                className="removeFavorite"
                                src="assets/images/like-red-bg.png"
                                alt="this remove from favourite"
                              />
                            </figure>
                          </div>
                        </div>
                        <div className="box-inner box-inner_new">
                          <div className="info p-0 m-0">
                            <h4
                              className="text-truncate cursor-pointer"
                              onClick={() => {
                                window.location.href = `/${user.role}/assessments/details/${test._id}`;
                              }}
                              title={test.title}
                            >
                              {test.title}
                            </h4>
                            <div className="form-row subjectAndMore_new small">
                              <div className="col sub1_new text-truncate">
                                {test.subjects && test.subjects.length > 0 && (
                                  <a>
                                    {test.subjects[0].name}{" "}
                                    {test.subjects.length > 1 && (
                                      <span className="mb-1">
                                        {" "}
                                        + {test.subjects.length - 1} more{" "}
                                      </span>
                                    )}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="form-row small mt-1">
                            <div className="col-6">
                              <div className="question-count">
                                <span>{test.questions?.length} questions</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="time text-right">
                                <span>{test.totalTime} minutes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <a
                            className="btn btn-buy btn-block btn-sm round-bottom"
                            href={`/${user.role}/assessments/details/${test._id}`}
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {recommendedTests.length === 0 && (
                <div className="text-center">
                  <figure className="mx-auto">
                    <img
                      src="/assets/images/Search-rafiki.png"
                      alt=""
                      className="img-fluid d-block mx-auto mb-4"
                    />
                  </figure>
                  <h6>No Recommended Assessments Found</h6>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="box-area box-area_new mt-4">
        {!recommendedTests && (
          <>
            <div className="heading heading_new">
              <div className="row">
                <div className="col-3">
                  <SkeletonLoaderComponent Cwidth={100} Cheight={30} />
                </div>
              </div>
            </div>
            <div>
              <SkeletonLoaderComponent Cwidth={100} Cheight={200} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttempRecommendations;
