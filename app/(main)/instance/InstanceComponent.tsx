"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import * as settingService from "@/services/settingService";
import * as alertify from "alertifyjs";
import clientApi from "@/lib/clientApi";
import { FileDrop } from "react-file-drop";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";

export default function InstanceComponent() {
  const fileBrowseRef = useRef(null);
  const logofileBrowseRef = useRef(null);
  const [features, setFeatures] = useState<any>({});
  const [requiredUserFields, setRequiredUserFields] = useState<any>({});
  const [roles, setRoles] = useState<any>({});
  const [detectFraud, setDetectFraud] = useState<boolean>(false);
  const [allowMarksChange, setAllowMarksChange] = useState<boolean>(false);
  const [IdentityMatchThreshold, setIdentityMatchThreshold] =
    useState<number>(0);
  const [signupType, setSignupType] = useState<any>({});
  const user: any = useSession()?.data?.user?.info || {};
  const [identityInfo, setIidentityInfo] = useState<any>({});
  const [advertismentTestSeries, setAdvertismentTestSeries] = useState<any>([]);
  const [logo, setLogo] = useState<any>({
    url: "",
    name: "",
    path: "",
  });
  const [settingData, setSettingData] = useState<any>({});
  const [afterUpdated, setAfterUpdated] = useState<any>({});
  const [signupMsg, setSignupMsg] = useState<string>("");
  const [assessmentInstructions, setAssessmentInstructions] =
    useState<string>("");
  const [ambassadorDiscount, setAmbassadorDiscount] = useState<any>(null);
  const [notificationTemplates, setNotificationTemplates] = useState<any>([]);
  const [logoFiles, setlogoFiles] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    settingService
      .show()
      .then((data: any) => {
        setSettingData({ ...data });
        setFeatures(data.features);
        setRequiredUserFields(data.requiredUserFields);
        setAssessmentInstructions(data.assessmentInstructions);
        setRoles(data.roles);
        setIdentityMatchThreshold(data.IdentityMatchThreshold);
        setSignupType(data.signupType);
        setIidentityInfo(data.identityInfo);
        setAdvertismentTestSeries(
          data.bannerImages.filter((b) => b.type == "testseries")
        );
        setLogo(data.pageLogo);
        setSignupMsg(data.signupMsg);
        setDetectFraud(data.detectFraud);
        setAllowMarksChange(data.allowMarksChange);
        setAmbassadorDiscount(
          data.ambassadorDiscount == undefined ? 10 : data.ambassadorDiscount
        );
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const openFileSelector = () => {
    fileBrowseRef?.current?.click();
  };

  const openLogoFileSelector = () => {
    logofileBrowseRef?.current?.click();
  };
  const onSave = () => {
    const dataToChange = {
      // notificationTemplates: this.notificationTemplates,
      signupType: signupType,
      IdentityMatchThreshold: IdentityMatchThreshold,
      features: features,
      requiredUserFields: requiredUserFields,
      roles: roles,
      detectFraud: detectFraud,
      identityInfo: identityInfo,
      pageLogo: logo,
      signupMsg: signupMsg,
      assessmentInstructions: assessmentInstructions,
      allowMarksChange: allowMarksChange,
      ambassadorDiscount: ambassadorDiscount,
      endTimeFixed: settingData.endTimeFixed,
      allowDescriptiveUpload: settingData.allowDescriptiveUpload,
      homePage: settingData.homePage,
    };
    setLoading(true);
    settingService
      .update(dataToChange)
      .then((da) => {
        settingService
          .show()
          .then((data: any) => {
            setSettingData({ ...data });
            setFeatures(data.features);
            setRequiredUserFields(data.requiredUserFields);
            setRoles(data.roles);
            setIdentityMatchThreshold(data.IdentityMatchThreshold);
            setSignupType(data.signupType);
            setAssessmentInstructions(data.assessmentInstructions);
            setAllowMarksChange(data.allowMarksChange);
            setAmbassadorDiscount(data.ambassadorDiscount);
            setLogo(data.pageLogo);
            setSignupMsg(data.signupMsg);

            // this.appInit.clientDataSubject.next(this.settingData);
            alertify.success("Successfully Updated");
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
          });
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const dropped = (files: any) => {
    setFiles(files[0]);
  };

  const uploadDocs = async () => {
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", files, files.name);
    formData.append("uploadType", "file");
    const session = await getSession();
    clientApi
      .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      })
      .then((data: any) => {
        if (data) {
          settingService
            .addAdvertismentImage({
              title: data.data.originalname,
              url: data.data.fileUrl,
            })
            .then((d) => {
              reload();
              setFiles([]);
              alertify.success("File uploaded successfully.");
            });
        }
        // Sanitized logo returned from backend
      })
      .catch((err) => {
        console.log(err);
        alertify.alert(
          "Message",
          "Uploaded file type not supported. Supported file types are jpg,jpeg and png."
        );
      });
  };

  const logoDropped = (files: any) => {
    setlogoFiles(files[0]);
  };

  const uploadLogo = async () => {
    ///  You could upload it like this:
    const formData: FormData = new FormData();
    formData.append("file", logoFiles, logoFiles.name);
    formData.append("uploadType", "file");

    const session = await getSession();
    clientApi
      .post(`https://newapi.practiz.xyz/api/v1/files/upload`, formData, {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      })
      .then((data: any) => {
        if (data) {
          setLogo({
            name: data.data.originalname,
            url: data.data.fileUrl,
            path: data.data.path,
          });
          setlogoFiles([]);
        }
        // Sanitized logo returned from backend
      })
      .catch((err) => {
        console.log(err);
        alertify.alert(
          "Message",
          "Uploaded file type not supported. Supported file types are jpg,jpeg and png."
        );
      });
  };

  const reload = () => {
    setLoading(true);
    settingService
      .show()
      .then((data: any) => {
        setSettingData({ ...data });
        setFeatures(data.features);
        setRequiredUserFields(data.requiredUserFields);
        setAssessmentInstructions(data.assessmentInstructions);
        setRoles(data.roles);
        setIdentityMatchThreshold(data.IdentityMatchThreshold);
        setSignupType(data.signupType);
        setIidentityInfo(data.identityInfo);
        setAdvertismentTestSeries(
          data.bannerImages.filter((b) => b.type == "testseries")
        );
        setLogo(data.pageLogo);
        setSignupMsg(data.signupMsg);
        setLoading(false);

        // this.appInit.clientDataSubject.next(this.settingData)
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const deleteAdvertismentImage = (i, id) => {
    settingService.deleteAdvertismentImage(id).then((d) => {
      alertify.success("Successfully Deleted");
      reload();
    });
  };

  const removeDocs = () => {
    setFiles([]);
    setlogoFiles([]);
  };

  return (
    <main className="instance-set instance-set_new pt-3">
      <div className="container">
        <div className="container5-remove rounded-boxes bg-white">
          <div className="section_heading_wrapper">
            <h3 className="section_top_heading">Instance Settings</h3>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Features</h4>
              <p className="card-text-common">description</p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Chat</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.chat}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              chat: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Class Attendance</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.classAttendance}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              classAttendance: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Classroom Proctoring
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.classroomProctoring}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              classroomProctoring: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2 mb-2">
                    <div className="instance-head mt-0">Show banner</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.showBanner}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              showBanner: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">My Educoins</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.myEducoins}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              myEducoins: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Join Institute</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.joinInstitute}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              joinInstitute: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Enable PDF Export</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.testExport}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              testExport: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Hide Code Question Output
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.hideCodeQuestionOutput}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              hideCodeQuestionOutput: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Edit Profile</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.editProfile}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              editProfile: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Code Editor</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.codeEditor}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              codeEditor: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Referral Program</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.ambassadorProgram}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              ambassadorProgram: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Adaptive</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.adaptive}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              adaptive: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Use Captcha</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.showTestCaptcha}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              showTestCaptcha: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Score Trend</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.scoreTrend}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              scoreTrend: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Fraud Detect</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={detectFraud}
                          onChange={(e) => {
                            setDetectFraud(e.target.checked);
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">My Performance</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.myPerformance}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              myPerformance: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Class Quiz</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.classboard}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              classboard: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Question Bank</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.questionBank}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              questionBank: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Partial coding marks
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.partialCodingMark}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              partialCodingMark: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Exam Schedule</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.examschedules}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              examschedules: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Marketplace</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.marketplace}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              marketplace: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Student Weekly Report
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.studentWeeklyReport}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              studentWeeklyReport: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Coding</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.coding}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              coding: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Capture Additional Info
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.captureAdditionalInfo}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              captureAdditionalInfo: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Course Reminder</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.courseReminder}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              courseReminder: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Membership</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.services}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              services: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">My profile</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.myProfile}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              myProfile: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Institute Setup</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.newInstitute}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              newInstitute: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Marketplace for Student
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.marketplaceForStudent}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              marketplaceForStudent: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Role</h4>
              <p className="card-text-common">description</p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Student</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={roles.student}
                          onChange={(e) => {
                            setRoles({
                              ...roles,
                              student: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Teacher</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={roles.teacher}
                          onChange={(e) => {
                            setRoles({
                              ...roles,
                              teacher: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Director</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={roles.director}
                          onChange={(e) => {
                            setRoles({
                              ...roles,
                              director: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Publisher</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={roles.publisher}
                          onChange={(e) => {
                            setRoles({
                              ...roles,
                              publisher: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Support</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={roles.support}
                          onChange={(e) => {
                            setRoles({
                              ...roles,
                              support: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Operator</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={roles.operator}
                          onChange={(e) => {
                            setRoles({
                              ...roles,
                              operator: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Mentor</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={roles.mentor}
                          onChange={(e) => {
                            setRoles({
                              ...roles,
                              mentor: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Modules</h4>
              <p className="card-text-common">description</p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Test Series</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.testseries}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              testseries: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Course</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.course}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              course: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Assessment</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.assessment}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              assessment: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Evaluation</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.evaluation}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              evaluation: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Classroom</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.classroom}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              classroom: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Dashboard</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.dashboard}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              dashboard: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Resume</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.resume}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              resume: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Mentors</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.mentors}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              mentors: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Content</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.content}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              content: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Default Navigation</h4>
              <p className="card-text-common">
                Once a teacher or student logs in, the system will open this
                module.
              </p>
            </div>
            <div className="card-body-common">
              <div className="d-flex justify-content-start gap-sm">
                <div className="d-flex align-items-center">
                  <div className="container1 my-0">
                    <div className="radio my-0">
                      <input
                        type="radio"
                        value="dashboard"
                        name="homePage"
                        id="dashboard"
                        checked={settingData.homePage === "dashboard"}
                        onChange={(e) => {
                          setSettingData({
                            ...settingData,
                            homePage: "dashboard",
                          });
                        }}
                      />
                      <label htmlFor="dashboard" className="my-0"></label>
                    </div>
                  </div>
                  <div className="rights my-0">Dashboard</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="container1 my-0">
                    <div className="radio my-0">
                      <input
                        type="radio"
                        value="assessment"
                        name="homePage"
                        id="assessment"
                        checked={settingData.homePage === "assessment"}
                        onChange={(e) => {
                          setSettingData({
                            ...settingData,
                            homePage: "assessment",
                          });
                        }}
                      />
                      <label htmlFor="assessment" className="my-0"></label>
                    </div>
                  </div>
                  <div className="rights my-0">Assessment</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="container1 my-0">
                    <div className="radio my-0">
                      <input
                        type="radio"
                        value="course"
                        name="homePage"
                        id="course"
                        checked={settingData.homePage === "course"}
                        onChange={(e) => {
                          setSettingData({
                            ...settingData,
                            homePage: "course",
                          });
                        }}
                      />
                      <label htmlFor="course" className="my-0"></label>
                    </div>
                  </div>
                  <div className="rights my-0">Course</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="container1 my-0">
                    <div className="radio my-0">
                      <input
                        type="radio"
                        value="testseries"
                        name="homePage"
                        id="testseries"
                        checked={settingData.homePage === "testseries"}
                        onChange={(e) => {
                          setSettingData({
                            ...settingData,
                            homePage: "testseries",
                          });
                        }}
                      />
                      <label htmlFor="testseries" className="my-0"></label>
                    </div>
                  </div>
                  <div className="rights my-0">Test Series</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="container1 my-0">
                    <div className="radio my-0">
                      <input
                        type="radio"
                        value="classroom"
                        name="homePage"
                        id="classroom"
                        checked={settingData.homePage === "classroom"}
                        onChange={(e) => {
                          setSettingData({
                            ...settingData,
                            homePage: "classroom",
                          });
                        }}
                      />
                      <label htmlFor="classroom" className="my-0"></label>
                    </div>
                  </div>
                  <div className="rights my-0">Classroom</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Exam & Proctor</h4>
              <p className="card-text-common">
                Settings for proctoring student in exam.
              </p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">University Exam</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.universityExam}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              universityExam: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Fraud Detection</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.fraudDetect}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              fraudDetect: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Camera Detection</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.faceDetect}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              faceDetect: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Demographic Threshold
                    </div>
                    <input
                      style={{ border: "none" }}
                      type="number"
                      min="0"
                      value={IdentityMatchThreshold}
                      onChange={(e) => {
                        setIdentityMatchThreshold(e.target.value);
                      }}
                      disabled={user.role !== "admin"}
                      className="ml-2 border-bottom w-60px"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Allow Teacher To Change Mark
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={allowMarksChange}
                          onChange={(e) =>
                            setAllowMarksChange(e.target.checked)
                          }
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Fixed End Time</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={settingData.endTimeFixed}
                          onChange={(e) => {
                            setSettingData({
                              ...settingData,
                              endTimeFixed: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">
                      Enable Descriptive Upload
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={settingData.allowDescriptiveUpload}
                          onChange={(e) => {
                            setSettingData({
                              ...settingData,
                              allowDescriptiveUpload: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="instance-head mt-0">Time Accommodation</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.timeAccommodation}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              timeAccommodation: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Registration Fields</h4>
              <p className="card-text-common">
                Settings for registration fields.
              </p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Registration No</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={requiredUserFields.registrationNo}
                          onChange={(e) => {
                            setRequiredUserFields({
                              ...requiredUserFields,
                              registrationNo: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Roll Number</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={requiredUserFields.rollNumber}
                          onChange={(e) => {
                            setRequiredUserFields({
                              ...requiredUserFields,
                              rollNumber: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Passing Year</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={requiredUserFields.passingYear}
                          onChange={(e) => {
                            setRequiredUserFields({
                              ...requiredUserFields,
                              passingYear: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Placement Status</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={requiredUserFields.placementStatus}
                          onChange={(e) => {
                            setRequiredUserFields({
                              ...requiredUserFields,
                              placementStatus: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Login & Signup</h4>
              <p className="card-text-common">
                Select login and signup options for your institute.
              </p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Google Signup</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={signupType.google}
                          onChange={(e) => {
                            setSignupType({
                              ...signupType,
                              google: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Facebook Signup</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={signupType.facebook}
                          onChange={(e) => {
                            setSignupType({
                              ...signupType,
                              facebook: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">Standard Signup</div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={signupType.local}
                          onChange={(e) => {
                            setSignupType({
                              ...signupType,
                              local: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg border-right-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">
                      Email/Phone Verification
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.accountVerification}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              accountVerification: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="d-flex align-items-center">
                    <div className="instance-head mt-0">
                      Identity Verification for Teacher
                    </div>
                    <div className="switch-item mt-0 float-none ml-auto d-block">
                      <label className="switch my-0">
                        <input
                          type="checkbox"
                          value="1"
                          checked={features.identityVerification}
                          onChange={(e) => {
                            setFeatures({
                              ...features,
                              identityVerification: e.target.checked,
                            });
                          }}
                          disabled={user.role !== "admin"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Page Message</h4>
              <p className="card-text-common">Description</p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg">
                  <div className="instance-head mt-0">Signup Message</div>
                  <div className="mt-2">
                    <CKEditorCustomized
                      defaultValue={signupMsg}
                      className="form-control ml-2"
                      style={{
                        border: "1px solid #ced4da",
                        width: "90%",
                      }}
                      config={{
                        placeholder: "Share somethings...",

                        toolbar: ["bold", "italic"],
                        mediaEmbed: { previewsInData: true },
                      }}
                      onChangeCon={(data) => {
                        setSignupMsg(data);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Instructions For Assessment</h4>
              <p className="card-text-common">Description</p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg">
                  <div className="instance-head mt-0">General Instructions</div>
                  <div className="mt-2">
                    <CKEditorCustomized
                      defaultValue={assessmentInstructions}
                      className="form-control ml-2"
                      style={{
                        border: "1px solid #ced4da",
                        width: "90%",
                      }}
                      config={{
                        placeholder: "Share somethings...",

                        toolbar: ["bold", "italic"],
                        mediaEmbed: { previewsInData: true },
                      }}
                      onChangeCon={(data) => {
                        setAssessmentInstructions(data);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Identity Info</h4>
              <p className="card-text-common">Description</p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="col-lg">
                  <div className="instance-head mt-0">
                    Identity Verification
                  </div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            checked={
                              identityInfo.identityVerification === "user"
                            }
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                identityVerification: e.target.value,
                              })
                            }
                            name="level"
                            id="user"
                          />
                          <label htmlFor="user" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            checked={
                              identityInfo.identityVerification === "system"
                            }
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                identityVerification: e.target.value,
                              })
                            }
                            name="level"
                            id="system"
                          />
                          <label
                            htmlFor="system"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="instance-head mt-0">College Name</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            checked={identityInfo.collegeName === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                collegeName: e.target.value,
                              })
                            }
                            name="name"
                            id="userN"
                          />
                          <label htmlFor="userN" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            checked={identityInfo.collegeName === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                collegeName: e.target.value,
                              })
                            }
                            name="name"
                            id="systemN"
                          />
                          <label
                            htmlFor="systemN"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="instance-head mt-0">Core Branch</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            checked={identityInfo.coreBranch === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                coreBranch: e.target.value,
                              })
                            }
                            name="branch"
                            id="openB"
                          />
                          <label htmlFor="openB" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            checked={identityInfo.coreBranch === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                coreBranch: e.target.value,
                              })
                            }
                            name="branch"
                            id="systemB"
                          />
                          <label
                            htmlFor="systemB"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="instance-head mt-0">Passing Year</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            checked={identityInfo.passingYear === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                passingYear: e.target.value,
                              })
                            }
                            name="Year"
                            id="openY"
                          />
                          <label htmlFor="openY" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            checked={identityInfo.passingYear === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                passingYear: e.target.value,
                              })
                            }
                            name="Year"
                            id="systemY"
                          />
                          <label
                            htmlFor="systemY"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg">
                  <div className="instance-head mt-0">Roll Number</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            name="number"
                            checked={identityInfo.rollNumber === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                rollNumber: e.target.value,
                              })
                            }
                            id="openR"
                          />
                          <label htmlFor="openR" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            name="number"
                            checked={identityInfo.rollNumber === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                rollNumber: e.target.value,
                              })
                            }
                            id="systemR"
                          />
                          <label
                            htmlFor="systemR"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="instance-head mt-0">Gender</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            name="gender"
                            checked={identityInfo.gender === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                gender: e.target.value,
                              })
                            }
                            id="openG"
                          />
                          <label htmlFor="openG" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            name="gender"
                            checked={identityInfo.gender === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                gender: e.target.value,
                              })
                            }
                            id="systemG"
                          />
                          <label
                            htmlFor="systemG"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="instance-head mt-0">DOB</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            name="DOB"
                            checked={identityInfo.dob === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                dob: e.target.value,
                              })
                            }
                            id="openO"
                          />
                          <label htmlFor="openO" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            name="DOB"
                            checked={identityInfo.dob === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                dob: e.target.value,
                              })
                            }
                            id="systemO"
                          />
                          <label
                            htmlFor="systemO"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="instance-head mt-0">State</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            name="state"
                            checked={identityInfo.state === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                state: e.target.value,
                              })
                            }
                            id="openS"
                          />
                          <label htmlFor="openS" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            name="state"
                            checked={identityInfo.state === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                state: e.target.value,
                              })
                            }
                            id="systemS"
                          />
                          <label
                            htmlFor="systemS"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg">
                  <div className="instance-head mt-0">
                    Identification Number
                  </div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            name="inumber"
                            checked={
                              identityInfo.identificationNumber === "user"
                            }
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                identificationNumber: e.target.value,
                              })
                            }
                            id="openI"
                          />
                          <label htmlFor="openI" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            name="inumber"
                            checked={
                              identityInfo.identificationNumber === "system"
                            }
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                identificationNumber: e.target.value,
                              })
                            }
                            id="systemI"
                          />
                          <label
                            htmlFor="systemI"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg">
                  <div className="instance-head mt-0">City</div>
                  <div className="radio form-row align-items-center my-1">
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="user"
                            name="city"
                            checked={identityInfo.city === "user"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                city: e.target.value,
                              })
                            }
                            id="openC"
                          />
                          <label htmlFor="openC" className="radio my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">User</div>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="system"
                            name="city"
                            checked={identityInfo.city === "system"}
                            onChange={(e) =>
                              setIidentityInfo({
                                ...identityInfo,
                                city: e.target.value,
                              })
                            }
                            id="systemC"
                          />
                          <label
                            htmlFor="systemC"
                            className="radio my-0"
                          ></label>
                        </div>
                      </div>
                      <div className="rights my-0">System</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-common shadow border-0">
            <div className="card-header-common">
              <h4 className="card-title-common">Landing Page Images</h4>
              <p className="card-text-common">description</p>
            </div>
            <div className="card-body-common">
              <div className="row">
                <div className="inst-upload col-lg-3">
                  <h4 className="inst-head-set mt-0 mb-2 pl-0 pt-0">Logo</h4>
                  <div className="standard-upload-box mx-0 my-3">
                    <FileDrop
                      dropZoneLabel="Drop files here"
                      showBrowseBtn={true}
                      onDrop={logoDropped}
                      accept=".jpg,.png,.jpeg"
                    >
                      <div className="upload_icon">
                        <span className="material-icons setting-image">
                          file_copy
                        </span>
                      </div>
                      <p className="pro-text-drug text-center d-block active text-primary">
                        {logoFiles?.name}
                      </p>
                      <span className="title text-center">
                        Drag and drop or{" "}
                        <a
                          onClick={openLogoFileSelector}
                          className="text-primary"
                        >
                          browse
                        </a>{" "}
                        your files
                      </span>
                      <div>
                        <a
                          className="btn btn-danger btn-sm mx-2"
                          onClick={removeDocs}
                        >
                          Cancel
                        </a>
                        <a
                          className="btn btn-secondary btn-sm"
                          onClick={uploadLogo}
                        >
                          Upload
                        </a>
                      </div>
                      <input
                        accept=".jpg,.png,.jpeg"
                        value=""
                        style={{ display: "none", opacity: 0 }}
                        ref={logofileBrowseRef}
                        type="file"
                        onChange={(e) => logoDropped(e.target.files)}
                      />
                    </FileDrop>
                  </div>
                  {logo?.url && (
                    <img
                      src={logo.url}
                      alt="this is Logo"
                      width="166"
                      height="28"
                    />
                  )}
                </div>
                <div className="inst-upload col-lg-3">
                  <h3 className="inst-head-set mt-0 mb-2 pl-0 pt-0">
                    Advertisment Image
                  </h3>
                  <div className="standard-upload-box mx-0 my-3">
                    <FileDrop
                      dropZoneLabel="Drop files here"
                      showBrowseBtn={true}
                      onDrop={dropped}
                      accept=".jpg,.png,.jpeg"
                    >
                      <div className="upload_icon">
                        <span className="material-icons setting-image">
                          file_copy
                        </span>
                      </div>
                      <p className="pro-text-drug text-center d-block active text-primary">
                        {files?.name}
                      </p>
                      <span className="title">
                        Drag and drop or{" "}
                        <a onClick={openFileSelector} className="text-primary">
                          browse
                        </a>{" "}
                        your files
                      </span>
                      <div>
                        <a
                          className="btn btn-danger btn-sm mx-2"
                          onClick={removeDocs}
                        >
                          Cancel
                        </a>
                        <a
                          className="btn btn-secondary btn-sm"
                          onClick={uploadDocs}
                        >
                          Upload
                        </a>
                      </div>
                      <input
                        accept=".jpg,.png,.jpeg"
                        value=""
                        style={{ display: "none", opacity: 0 }}
                        ref={fileBrowseRef}
                        type="file"
                        onChange={(e) => dropped(e.target.files)}
                      />
                    </FileDrop>
                  </div>
                  {advertismentTestSeries.map((im, i) => (
                    <div key={i}>
                      {i + 1} {im.title}
                      <span
                        className="mx-2"
                        onClick={() => deleteAdvertismentImage(i, im._id)}
                      >
                        X
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-2">
            <button
              className="btn btn-primary ml-2"
              disabled={loading}
              onClick={onSave}
            >
              Save&nbsp;
              {loading && <i className="fa fa-spinner fa-pulse"></i>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
