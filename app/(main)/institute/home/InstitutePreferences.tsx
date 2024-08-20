"use client";
import { useState, useEffect, useRef } from "react";
import * as authService from "@/services/auth";
import * as instituteSvc from "@/services/instituteService";
import * as alertify from "alertifyjs";
import clientApi from "@/lib/clientApi";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ToggleComponent from "@/components/ToggleComponent";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";

const InstitutePreferences = ({ updatePreferences, user }: any) => {
  const [preferences, setPreferences] = useState<any>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [institute, setInstitute] = useState<any>(null);
  const [getClientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [certTemplate, setCertTemplate] = useState<string>(
    "/assets/media/Course_Certificate_template_myperfectice.docx"
  );
  const { update } = useSession();
  const { push } = useRouter();
  const certTemplateBrowser = useRef(null);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  useEffect(() => {
    getClientDataFunc()
      .then((d) => {
        setLoading(true);
        instituteSvc
          .getInstitute(user.activeLocation, { preferencesOnly: true })
          .then((res) => {
            setInstitute(res);
            setPreferences(res.preferences);
            let tmp_preferences = res.preferences;

            if (!tmp_preferences.certificate) {
              tmp_preferences.certificate = {
                name: "",
                template: "",
              };
            }

            if (
              tmp_preferences.certificate &&
              tmp_preferences.certificate.template
            ) {
              setCertTemplate(res.preferences.certificate.template);
            }

            if (user._id == res.user || user.role == "admin") {
              setIsDisabled(false);
            }

            if (tmp_preferences?.ambassadorDiscount == undefined) {
              tmp_preferences.ambassadorDiscount =
                getClientData.ambassadorDiscount;
            }

            if (tmp_preferences?.referralPercentage == undefined) {
              tmp_preferences.referralPercentage = 10;
            }
            setPreferences(tmp_preferences);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.log(err);
        setPreferences({});
        setLoading(false);
      });
  }, [user]);

  const updatePreferencesFunc = async () => {
    if (
      (preferences.homePage == "assessment" &&
        !preferences.assessment.isShow) ||
      (preferences.homePage == "course" && !preferences.course.isShow) ||
      (preferences.homePage == "testseries" &&
        !preferences.testSeries.isShow) ||
      (preferences.homePage == "classroom" && !preferences.classroom.isShow)
    ) {
      alertify.alert(
        "Message",
        "Home page is disabled, please change your home page."
      );
      return;
    }
    if (
      preferences.ambassadorDiscount < 0 ||
      preferences.ambassadorDiscount > 100
    ) {
      alertify.alert(
        "Message",
        "Ambassador discount must be between 0 and 100"
      );
      return;
    }
    if (
      preferences.referralPercentage < 0 ||
      preferences.referralPercentage > 100
    ) {
      alertify.alert(
        "Message",
        "Referral Percentage must be between 0 and 100"
      );
      return;
    }
    setSaving(true);
    await instituteSvc.updateInstitutePrefernces(institute._id, {
      preferences: preferences,
    });
    await update();
    updatePreferences(preferences);
    alertify.success("Successfully Updated");
    // push(`/institute/home?menu=preferences`);
    setSaving(false);
  };

  const toggle = (tab, isOn) => {
    if (tab == "assessment") {
      setPreferences({
        ...preferences,
        assessment: {
          ...preferences.assessment,
          isShow: isOn,
          allowToCreate: isOn,
          adaptive: isOn,
          proctor: isOn,
          liveBoard: isOn,
          evaluation: isOn,
          comparativeAnalysis: isOn,
          sectionAdaptive: isOn,
        },
      });

      return;
    }

    if (!isOn && tab == "testseries") {
      setPreferences({
        ...preferences,
        testSeries: {
          ...preferences.testSeries,
          isShow: false,
          allowToCreate: false,
        },
      });
      return;
    }
    if (isOn && tab == "testseries") {
      setPreferences({
        ...preferences,
        testSeries: {
          ...preferences.testSeries,
          isShow: true,
          allowToCreate: true,
        },
      });
      return;
    }
    if (!isOn && tab == "course") {
      setPreferences({
        ...preferences,
        course: {
          ...preferences.course,
          isShow: false,
          allowToCreate: false,
        },
      });

      return;
    }
    if (isOn && tab == "course") {
      setPreferences({
        ...preferences,
        course: {
          ...preferences.course,
          isShow: true,
          allowToCreate: true,
        },
      });
      return;
    }
    if (!isOn && tab == "classroom") {
      setPreferences({
        ...preferences,
        classroom: {
          ...preferences.classroom,
          isShow: false,
          folder: false,
          assignment: false,
        },
      });

      return;
    }
    if (isOn && tab == "classroom") {
      setPreferences({
        ...preferences,
        classroom: {
          ...preferences.classroom,
          isShow: true,
          folder: true,
          assignment: true,
        },
      });

      return;
    }
    if (isOn && tab == "questionBank") {
      setPreferences({
        ...preferences,
        questionBank: {
          ...preferences.questionBank,
          isShow: true,
          createQuestion: true,
        },
      });

      return;
    }
    if (!isOn && tab == "questionBank") {
      setPreferences({
        ...preferences,
        questionBank: {
          ...preferences.questionBank,
          isShow: false,
          createQuestion: false,
        },
      });
      return;
    }

    if (tab == "eCommerce") {
      setPreferences({
        ...preferences,
        eCommerce: {
          ...preferences.eCommerce,
          isEnabled: isOn,
          showRevenue: isOn,
          sellContent: isOn,
        },
      });
    }
  };

  const uploadCert = async ($event) => {
    if (!$event.target.files[0]) {
      return;
    }
    setUploading(true);
    const file = $event.target.files[0];
    const fileName = file.name;
    if (file.name.indexOf(".docx") == -1) {
      $event.target.value = "";
      alertify.alert("Message", "Please use docx only.");
      setUploading(false);
      return;
    }

    const formData: FormData = new FormData();
    formData.append("file", file, fileName);
    formData.append("uploadType", "file");
    const session = await getSession();

    clientApi
      .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      })
      .then((res) => {
        alertify.success("Uploaded successfully");
        setPreferences({
          ...preferences,
          certificate: {
            ...preferences.certificate,
            name: res.data.originalname,
            template: res.data.fileUrl,
          },
        });
        setCertTemplate(res.data.fileUrl);
        $event.target.value = "";
        setUploading(false);
      })
      .catch((err) => {
        alertify.error("upload failed");
        $event.target.value = "";
        setUploading(false);
      });
  };

  const handleHomePageChange = (event) => {
    setPreferences({ ...preferences, homePage: event.target.value });
  };

  return (
    <>
      <div className="institute-onboarding">
        <div className="rounded-boxes bg-white">
          <div className="section_heading_wrapper mb-0">
            <h3 className="section_top_heading">Preferences</h3>
            <p className="section_sub_heading">
              Manage all preference settings of your institute.
            </p>
          </div>
        </div>
        {!loading ? (
          <>
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading tr">Select Home Page</h3>
                  <p className="institute-font-1">
                    The landing page of the application after successful login
                    by the user.
                  </p>
                </div>

                <div className="form-row mt-2">
                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio my-0">
                        <input
                          type="radio"
                          value="dashboard"
                          name="homePage"
                          id="dashboard"
                          checked={preferences.homePage === "dashboard"}
                          onChange={handleHomePageChange}
                        />
                        <label htmlFor="dashboard" className="my-0"></label>
                      </div>
                    </div>
                    <div className="rights my-0">Dashboard</div>
                  </div>

                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio my-0">
                        <input
                          type="radio"
                          value="assessment"
                          name="homePage"
                          id="assessment"
                          checked={preferences.homePage === "assessment"}
                          onChange={handleHomePageChange}
                        />
                        <label htmlFor="assessment" className="my-0"></label>
                      </div>
                    </div>
                    <div className="rights my-0">Assessment</div>
                  </div>

                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio my-0">
                        <input
                          type="radio"
                          value="course"
                          name="homePage"
                          id="course"
                          checked={preferences.homePage === "course"}
                          onChange={handleHomePageChange}
                        />
                        <label htmlFor="course" className="my-0"></label>
                      </div>
                    </div>
                    <div className="rights my-0">Course</div>
                  </div>

                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio my-0">
                        <input
                          type="radio"
                          value="testseries"
                          name="homePage"
                          id="testseries"
                          checked={preferences.homePage === "testseries"}
                          onChange={handleHomePageChange}
                        />
                        <label htmlFor="testseries" className="my-0"></label>
                      </div>
                    </div>
                    <div className="rights my-0">Test Series</div>
                  </div>

                  <div className="col-auto d-flex align-items-center">
                    <div className="container1 my-0">
                      <div className="radio my-0">
                        <input
                          type="radio"
                          value="classroom"
                          name="homePage"
                          id="classroom"
                          checked={preferences.homePage === "classroom"}
                          onChange={handleHomePageChange}
                        />
                        <label htmlFor="classroom" className="my-0"></label>
                      </div>
                    </div>
                    <div className="rights my-0">Classroom</div>
                  </div>
                </div>
              </div>
            )}
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="row">
                  <div className="col section_heading_wrapper">
                    <h3 className="section_top_heading tr">Assessment</h3>
                    <p className="institute-font-1">
                      Turning this on will grant director and teachers and
                      Students access to the assessments in that module.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.assessment.isShow}
                          onChange={(e) => {
                            toggle(
                              "assessment",
                              !preferences.assessment.isShow
                            );
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Allow to create Assessment
                    </div>
                    <p className="institute-font-1">
                      Turning this on will allow director and teachers to create
                      new assessments in the assessment module.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.assessment.allowToCreate}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              assessment: {
                                ...preferences.assessment,
                                allowToCreate:
                                  !preferences.assessment.allowToCreate,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col">
                    <div className="instance-head-program">
                      Personalized Learning and Assessment
                    </div>
                    <p className="institute-font-1">
                      Turning this on will enable Personalized Learning and
                      Assessment functionality for Students. Tests are auto
                      generated to adjust their level of difficulty based on the
                      responses provided by students, to match the knowledge and
                      ability of a student.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.assessment.adaptive}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              assessment: {
                                ...preferences.assessment,
                                adaptive: !preferences.assessment.adaptive,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col">
                    <div className="instance-head-program">Proctor</div>
                    <p className="institute-font-1">
                      Turning this on will enable Proctor mode. Student will be
                      given fixed durations for exams with ample restrictions.
                      Director and teachers will have to ability to monitor
                      students&apos; movements live while they write the exam.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.assessment.proctor}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              assessment: {
                                ...preferences.assessment,
                                proctor: !preferences.assessment.proctor,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col">
                    <div className="instance-head-program">
                      Evaluation module
                    </div>
                    <p className="institute-font-1">
                      Turning this on will enable the Evaluation module where
                      Director and teachers can evaluate the assessments.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.assessment.evaluation}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              assessment: {
                                ...preferences.assessment,
                                evaluation: !preferences.assessment.evaluation,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col">
                    <div className="instance-head-program">
                      Comparative Analysis
                    </div>
                    <p className="institute-font-1">
                      Turning this on will enable the comparative analysis where
                      teacher and student can see the comparison between other
                      students.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.assessment.comparativeAnalysis}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              assessment: {
                                ...preferences.assessment,
                                comparativeAnalysis:
                                  !preferences.assessment.comparativeAnalysis,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                {getClientData?.sectionAdaptive && (
                  <div className="row mt-2">
                    <div className="col">
                      <div className="instance-head-program">
                        Section Adaptive
                      </div>
                      <p className="institute-font-1">
                        Turning this on will enable Section Adaptive
                        functionality for Students.
                      </p>
                    </div>
                    <div className="col-auto ml-auto">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={preferences.assessment.sectionAdaptive}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                assessment: {
                                  ...preferences.assessment,
                                  sectionAdaptive:
                                    !preferences.assessment.sectionAdaptive,
                                },
                              })
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                <div className="row mt-2">
                  <div className="col">
                    <div className="instance-head-program">
                      Overrun time in learning assessments
                    </div>
                    <p className="institute-font-1">
                      To change behavior of overspending time on a question,
                      show an indicator to the students while solving a question
                      in the default view (irrespective of test types).
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.assessment.overrunNotification}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              assessment: {
                                ...preferences.assessment,
                                overrunNotification:
                                  !preferences.assessment.overrunNotification,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && getClientData?.features?.testseries && (
              <div className="rounded-boxes bg-white">
                <div className="row">
                  <div className="col section_heading_wrapper">
                    <h3 className="section_top_heading tr">Test Series</h3>
                    <p className="institute-font-1">
                      Turning this on will grant director and teachers and
                      students access to the test series in that module.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.testSeries.isShow}
                          onChange={(e) =>
                            toggle("testseries", !preferences.testSeries.isShow)
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Allow to create Test series
                    </div>
                    <p className="institute-font-1">
                      Turning this on will allow director and teachers to create
                      new test series in the test series module.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.testSeries.allowToCreate}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              testSeries: {
                                ...preferences.testSeries,
                                allowToCreate:
                                  !preferences.testSeries.allowToCreate,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && getClientData?.features?.course && (
              <div className="rounded-boxes bg-white">
                <div className="row">
                  <div className="col section_heading_wrapper">
                    <h3 className="section_top_heading">Course</h3>
                    <p className="institute-font-1">
                      When this is turned on, Director and teachers and Students
                      will have full access to this course in the module. Course
                      is a collection of content.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.course.isShow}
                          onChange={(e) => toggle("course", e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Allow to create Course
                    </div>
                    <p className="institute-font-1">
                      Turning this on will allow the Teachers to create a new
                      course in the course module.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.course.allowToCreate}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              course: {
                                ...preferences.course,
                                allowToCreate:
                                  !preferences.course.allowToCreate,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences &&
              getClientData?.features?.course &&
              user.role !== "publisher" && (
                <div className="rounded-boxes bg-white">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading">
                      Course Certificate Template
                    </h3>
                  </div>
                  <hr />
                  <div>
                    <p className="institute-font-1">
                      Personalize your certificate using your institute&apos;s
                      logo and your director&apos;s signature. You can download
                      the certificate template, edit, save, and upload a new
                      version.
                      <br />
                      <a
                        href={certTemplate}
                        className="underline"
                        target="_blank"
                      >
                        Click here
                      </a>{" "}
                      to get the existing template.
                    </p>
                  </div>
                  <div className="d-flex form-boxes gap-sm">
                    <input
                      name="certTemplate"
                      className="border-bottom flex-grow-1"
                      value={preferences.certificate.name}
                      readOnly
                      onClick={() => {
                        !uploading && certTemplateBrowser?.current?.click();
                      }}
                      // onChange={handleInputChange}
                    />
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        certTemplateBrowser?.current?.click();
                      }}
                      disabled={uploading}
                    >
                      Upload{" "}
                      <i
                        className={`fa fa-spinner fa-pulse ${
                          uploading ? "" : "d-none"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              )}
            {preferences &&
              getClientData?.features?.classroom &&
              user.role !== "publisher" && (
                <div className="rounded-boxes bg-white">
                  <div className="row">
                    <div className="col section_heading_wrapper">
                      <h3 className="section_top_heading">Classroom</h3>
                      <p className="institute-font-1">
                        When this is turned on, Director and teachers and
                        students will have full access to this classroom module.
                      </p>
                    </div>
                    <div className="col-auto ml-auto">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={preferences.classroom.isShow}
                            onChange={(e) =>
                              toggle("classroom", e.target.checked)
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col">
                      <div className="instance-head-program">Folder</div>
                      <p className="institute-font-1">
                        Turning this on will allow the Director and teachers and
                        students to access <b>Folder</b> inside classroom
                        module.
                      </p>
                    </div>
                    <div className="col-auto ml-auto">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={preferences.classroom.folder}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                classroom: {
                                  ...preferences.classroom,
                                  folder: !preferences.classroom.folder,
                                },
                              })
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col">
                      <div className="instance-head-program">Assignment</div>
                      <p className="institute-font-1">
                        Turning this on will allow the Director and teachers and
                        students to access <b>Assignments</b> inside classroom
                        module.
                      </p>
                    </div>
                    <div className="col-auto ml-auto">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={preferences.classroom.assignment}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                classroom: {
                                  ...preferences.classroom,
                                  assignment: !preferences.classroom.assignment,
                                },
                              })
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">User</h3>
                  <p className="institute-font-1">
                    Allow director and administrator to manage user management
                    related features.
                  </p>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Allow to add or upload users
                    </div>
                    <p className="institute-font-1">
                      Director and administrator can add individual users (in
                      different roles) or volume upload using Microsoft Excel
                      template.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.user.canCreate}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              user: {
                                ...preferences.user,
                                canCreate: !preferences.user.canCreate,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="row">
                  <div className="col section_heading_wrapper">
                    <h3 className="section_top_heading tr">Revenue</h3>
                    <p className="institute-font-1">
                      Turning this on will allow institute to sell content and
                      manage revenue.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.eCommerce.isEnabled}
                          onChange={(e) =>
                            toggle("eCommerce", e.target.checked)
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row mb-3">
                  <div className="col">
                    <div className="instance-head-program">
                      Allows institute to manage sell and revenue
                    </div>
                    <p className="institute-font-1">
                      Turning this on will allow access of revenue page to the
                      director.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.eCommerce.showRevenue}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              eCommerce: {
                                ...preferences.eCommerce,
                                showRevenue: e.target.checked,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Allow institute to sell content
                    </div>
                    <p className="institute-font-1">
                      Turning this on will allow institute to create a buy mode
                      content and sell it.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.eCommerce.sellContent}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              eCommerce: {
                                ...preferences.eCommerce,
                                sellContent: e.target.checked,
                              },
                            })
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">General</h3>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">Change Subject</div>
                    <p className="institute-font-1">
                      Turning this on will allow director and teachers to change
                      the subject in the institute.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.general.editProfileSubject}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              general: {
                                ...preferences.general,
                                editProfileSubject: e.target.checked,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">Social Sharing</div>
                    <p className="institute-font-1">
                      Allow students and teachers to share courses, assessments
                      etc. on social media including Twitter, Facebook, LinkedIn
                      etc.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.general.socialSharing}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              general: {
                                ...preferences.general,
                                socialSharing:
                                  !preferences.general.socialSharing,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Question of the Day
                    </div>
                    <p className="institute-font-1">
                      Show Question of the Day to students.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.general.questionOfDay}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              general: {
                                ...preferences.general,
                                questionOfDay:
                                  !preferences.general.questionOfDay,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">Chat</div>
                    <p className="institute-font-1">
                      Enable chat feature in your institute.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.general.chat}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              general: {
                                ...preferences.general,
                                chat: !preferences.general.chat,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">Notification</div>
                    <p className="institute-font-1">
                      Enable message and notification in your institute.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.general.notification}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              general: {
                                ...preferences.general,
                                notification: !preferences.general.notification,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Reports</h3>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">Reports</div>
                    <p className="institute-font-1">
                      Turning this on will grant you access to different types
                      of reports.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.reports}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              reports: !preferences.reports,
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Question Bank</h3>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Question Bank Module
                    </div>
                    <p className="institute-font-1">
                      Turning this on will allow director and teachers to use
                      their question bank.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.questionBank.isShow}
                          onChange={(e) => {
                            toggle("questionBank", e.target.checked);
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Allow to create Question
                    </div>
                    <p className="institute-font-1">
                      Turning this on will allow director and teachers to create
                      new questions in the question bank.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.questionBank.createQuestion}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              questionBank: {
                                ...preferences.questionBank,
                                createQuestion:
                                  !preferences.questionBank.createQuestion,
                              },
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Code Editor</h3>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">Code Editor</div>
                    <p className="institute-font-1">
                      Turning this on will grant access of code editor to
                      director, teacher and student.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.codeEditor}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              codeEditor: !preferences.codeEditor,
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && user.role !== "publisher" && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Class Quiz</h3>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">Class Quiz</div>
                    <p className="institute-font-1">
                      Turning this on will grant access of class quiz to
                      director, teacher and student.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.classboard}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              classboard: !preferences.classboard,
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {preferences && user.role !== "publisher" && (
              <div className="rounded-boxes bg-white">
                <div className="section_heading_wrapper">
                  <h3 className="section_top_heading">Referral Program</h3>
                </div>
                <hr />
                <div className="row">
                  <div className="col">
                    <div className="instance-head-program">
                      Referral Program
                    </div>
                    <p className="institute-font-1">
                      Expand your reach by creating a referral program for your
                      institute.
                    </p>
                  </div>
                  <div className="col-auto ml-auto">
                    <div className="switch-item">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={preferences.ambassadorProgram}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              ambassadorProgram: !preferences.ambassadorProgram,
                            });
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="rounded-boxes bg-white">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="rounded-boxes bg-white">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="rounded-boxes bg-white">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="rounded-boxes bg-white">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
            <div className="rounded-boxes bg-white">
              <SkeletonLoaderComponent Cwidth="100" Cheight="200" />
            </div>
          </>
        )}
      </div>
      {!isDisabled && (
        <div className="text-right mb-3">
          <button
            className="btn btn-primary"
            disabled={loading || saving}
            onClick={updatePreferencesFunc}
          >
            Save
          </button>
        </div>
      )}
      <input
        name="certTemplateBrowser"
        type="file"
        accept=".docx"
        hidden
        ref={certTemplateBrowser}
        onChange={(event) => uploadCert(event)}
      />
    </>
  );
};

export default InstitutePreferences;
