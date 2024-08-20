"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { fromNow, ucFirst } from "@/lib/pipe";
import clientApi, { uploadFileCertificate } from "@/lib/clientApi";
import alertify from "alertifyjs";
import "@/public/css/student.style.css";
import { range, update } from "lodash";
import RatingComponent from "@/components/rating";
import Rating from "react-rating";
import { faCropSimple } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from "react-bootstrap";

const Resume = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const user: any = useSession()?.data?.user?.info || {};
  const [profile, setProfile] = useState<any>(user);
  const [education, setEducation] = useState<any>({
    marksType: "marks",
  });
  const [programmingLang, setProgrammingLang] = useState<any>({
    rating: 0,
  });

  const [eform, setEform] = useState<any>({});
  const [eexamform, setEExamform] = useState<any>({});
  const [indform, setIndform] = useState<any>({});
  const [tform, setTform] = useState<any>({});
  const [apform, setApform] = useState<any>({});
  const [ecform, setEcform] = useState<any>({});
  const [awform, setAwform] = useState<any>({});
  const [tsform, setTsform] = useState<any>({});
  const [eaform, setEaform] = useState<any>({});

  const [masterData, setMasterData] = useState<any>({});
  const [eSumitted, setESubmitted] = useState<any>({
    educationDetails: false,
    entranceExam: false,
    industryCertificates: false,
    externalAssessment: false,
    trainingCertifications: false,
    awardsAndRecognition: false,
    programmingLang: false,
    extraCurricularActivities: false,
    academicProjects: false,
  });
  const [resumeSideMenus, setResumeSideMenus] = useState<any>([
    {
      name: "Summary",
      _id: "summary",
    },
    {
      name: "Education",
      _id: "education",
    },
    {
      name: "Entrance Exam",
      _id: "entranceexam",
    },
    {
      name: "Industry Certification",
      _id: "industrycertification",
    },

    {
      name: "Training & Internship",
      _id: "trainingandinternship",
    },
    {
      name: "Academic Projects",
      _id: "academicprojects",
    },
    {
      name: "Extra Curricular Activities",
      _id: "extracurricularactivities",
    },
    {
      name: "Awards & Recognations",
      _id: "awardsandrecognations",
    },
    {
      name: "Technical Skills",
      _id: "technicalskills",
    },
    {
      name: "External Assessments",
      _id: "externalsssessments",

      //  }, {
      //      name: 'Revision History',
      //      _id: 'revisionhistory'
    },
  ]);
  const [selectedMenu, setSelectedMenu] = useState<string>("educationaa");
  const [selectedMenuName, setSelectedMenuName] = useState<string>("Education");
  const [notes, setNotes] = useState<string>("");
  const [entranceExam, setEntranceExam] = useState<any>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [allowUserToChangeTheme, setAllowUserToChangeTheme] =
    useState<boolean>(false);
  const [numberStar, setNumberStar] = useState<number>(5);
  const [username, setUserName] = useState<string>("");
  const [grades, setGrades] = useState<any>([]);
  const [externalAssessment, setExternalAssessment] = useState<any>({});
  const [currUser, setCurrUser] = useState<any>({});
  const [states, setStates] = useState<any>([]);
  const [subjects, setSubjects] = useState<any>([]);
  const [progLang, setProgLang] = useState<any>([]);
  const [industryCertificate, setIndustryCertificate] = useState<any>({});
  const [providerCertificates, setProviderCertificates] = useState<any>([]);
  const [trainingCertifications, setTrainingCertifications] = useState<any>({});
  const [academicProjects, setAcademicProjects] = useState<any>({});
  const [extraCurricularActivities, setExtraCurricularActivities] =
    useState<any>({});
  const [awardsAndRecognition, setAwardsAndRecognition] = useState<any>({});

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalRef, setModalRef] = useState<any>(null);
  const downloadResume = () => {};

  const next = () => {
    setCurrentStep((prev) => prev + 1);
  };
  const checkCondition = () => {
    return (
      profile.educationDetails?.length > 0 &&
      profile.entranceExam?.length > 0 &&
      profile.industryCertificates?.length > 0 &&
      profile.trainingCertifications?.length > 0 &&
      profile.academicProjects?.length > 0 &&
      profile.programmingLang?.length > 0 &&
      profile.externalAssessment?.length > 0
    );
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const cancel = () => {
    setNotes("");
    if (modalRef) {
      modalRef.hide();
    }
    setModalRef(null);
    setModalVisible(false);
  };

  const sendForReview = async () => {
    let data = {};
    if (
      profile.dossier &&
      profile.dossier.notes &&
      profile.dossier.notes.length > 0
    ) {
      data = {
        notes: {
          version: profile.dossier.notes.length + 1,
          comment: notes,
        },
      };
    } else {
      data = {
        notes: {
          updatedAt: new Date(),
          userInfo: {
            user: user._id,
            name: user.name,
          },
          version: 1,
          comment: notes,
        },
      };
    }
    await clientApi
      .put(`/api/users/sendForReviewDossier/${user._id}`, data)
      .then((res) => {
        alertify.success("Successfully Sent for approval");
        cancel();
      });
  };

  const openChat = (userinfo: any, username?: any) => {};

  const setParams = (field: any) => {
    switch (field) {
      case "awardsAndRecognition":
        setAwardsAndRecognition({});
        break;
      case "extraCurricularActivities":
        setExtraCurricularActivities({});
        break;
      case "educationDetails":
        setEducation({
          marksType: "marks",
        });
        break;

      case "academicProjects":
        setAcademicProjects({});
        break;

      case "entranceExam":
        setEntranceExam({});
        break;
      case "externalAssessment":
        setExternalAssessment({});
        break;
      case "trainingCertifications":
        setTrainingCertifications({});
        break;
      case "programmingLang":
        setProgrammingLang({});

        break;

      case "industryCertificates":
        setIndustryCertificate({});

        break;

      default:
        return;
    }
  };

  const getCurUser = async () => {
    const { data } = await clientApi.get("/api/users/me");

    setProfile(data);

    const dat = (
      await clientApi.get(`/api/countries/findAllStates/${data.country.code}`)
    ).data;
    setStates(dat);
  };

  const getSubject = async () => {
    const { data } = await clientApi.get(`/api/settings/find-one/masterdata`);
    setMasterData(data);
    let tsubject = subjects;
    if (data.subjects.length > 0) {
      data.subjects.forEach((s: any) => {
        tsubject.push(s.name);
      });
    }
    setSubjects(tsubject);
    let tprog = progLang;
    if (data.progLang.length > 0) {
      data.progLang.forEach((s: any) => {
        tprog.push(s.name);
      });
    }
    setProgLang(tprog);
  };

  const submit = async (form: any, data: any, updatedField: any, e?: any) => {
    setSubmitted(true);
    let eS = eSumitted;
    eS[updatedField] = true;
    setESubmitted(eS);
    data._id = user._id;
    data.updatedField = updatedField;
    if (form.errors && form.errors.required === false) {
      form.valid = true;
    }
    if (!form.valid) {
      setSubmitted(false);
      let eS = eSumitted;
      eS[updatedField] = true;
      setESubmitted(eS);
    }

    let certiInculde = false;
    if (updatedField === "trainingCertifications") {
      certiInculde = !!trainingCertifications.certificate;
    } else if (updatedField === "academicProjects") {
      certiInculde = !!academicProjects.document;
    } else if (updatedField === "industryCertificates") {
      certiInculde = !!industryCertificate.certificate;
    }

    if (validation(updatedField, data, certiInculde)) {
      clientApi
        .put(`/api/users/updateProfile/${user._id}`, data)
        .then((res: any) => {
          setParams(updatedField);
          let eS = eSumitted;
          eS[updatedField] = false;
          setESubmitted(eS);

          clientApi.get(`/api/users/me`).then(async (res: any) => {
            // setTimeout(() => {
            setProfile(res.data);
            const dat = (
              await clientApi.get(
                `/api/countries/findAllStates/${res.data.country.code}`
              )
            ).data;
            setStates(dat);
            setSubmitted(false);
            alertify.success("Profile updated successfully");
            // }, 100)
          });
          getSubject();
          setMasterData({});
          setEducation({
            ...education,
            marks: "",
          });
          setEntranceExam({
            ...entranceExam,
            rank: "",
          });

          setExtraCurricularActivities({
            ...academicProjects,
            activityDetails: "",
          });

          setAwardsAndRecognition({
            ...awardsAndRecognition,
            awardDetails: "",
            date: "",
          });
          setExternalAssessment({
            ...externalAssessment,
            mostRecentScore: "",
            maximumScore: "",
            yearOfAssessment: "",
          });
          setProgrammingLang({
            ...programmingLang,
            rating: 0,
          });

          setTrainingCertifications({
            ...trainingCertifications,
            provider: "",
            city: "",
            startDate: "",
            endDate: "",
            expiredDate: "",
            description: "",
          });

          setAcademicProjects({
            ...academicProjects,
            name: "",
            description: "",
            startDate: "",
            endDate: "",
            description: "",
          });
        })
        .catch((err: any) => {
          setParams(updatedField);
          let eS = eSumitted;
          eS[updatedField] = false;
          setESubmitted(eS);

          clientApi.get(`/api/users/me`).then((res: any) => {
            setProfile(res.data);
            setSubmitted(false);
            alertify.success("Profile updated failed");
          });
        });
    }

    getCurUser();

    if (e) e.preventDefault();
  };

  const validation = (field: any, data: any, certi: any) => {
    console.log(field, "filed");
    let result = true;
    switch (field) {
      case "awardsAndRecognition":
        break;
      case "extraCurricularActivities":
        break;
      case "academicProjects":
        if (!certi) {
          alertify.alert("Message", "Upload Certificate Also");
          result = false;
        }

        break;
      case "educationDetails":
        break;
      case "entranceExam":
        break;
      case "externalAssessment":
        break;
      case "trainingCertifications":
        if (!certi) {
          alertify.alert("Message", "Upload Certificate Also");
          result = false;
        }

        break;
      case "programmingLang":
        if (profile[field].length > 0) {
          profile[field].forEach((value: any, key: any) => {
            if (value.name === data.name) {
              alertify.alert("Message", "Language already exist");
              result = false;
            }
          });
        }

        break;

      case "industryCertificates":
        if (!certi) {
          alertify.alert("Message", "Upload Certificate Also");
          result = false;
        }

        break;

      default:
        return;
    }
    return result;
  };

  // const cancel = () => {
  //   setNotes("");
  // };

  const selectIndcertificateFile = (id: any) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.click();
      } else {
        // Handle the case where the element is not found
        console.error(`Element with ID ${id} not found`);
      }
    }, 0);
  };

  const downloadCertificate = (url: any) => {
    const downloadLink = url;
    window.open(downloadLink, "_blank");
  };

  const remove = (data: any, field: any) => {
    let removeData = {
      ...data,
      updatedField: field,
    };
    clientApi
      .post(`/api/users/remove`, removeData)
      .then((res: any) => {
        if (res) {
          clientApi.get(`/api/users/me`).then((result: any) => {
            setProfile(result.data);
            alertify.success("Data deleted successfully");
          });
        }
      })
      .catch((err: any) => {
        clientApi.get(`/api/users/me`).then((result: any) => {
          // setTimeout(() => {
          setProfile(result.data);
          alertify.error("Data deleted failed");
          // }, 100)
        });
      });
  };

  const onProviderChange = (data: any) => {
    console.log(data, "data");
    if (masterData.certificateProvider.length > 0) {
      masterData.certificateProvider.forEach((doc: any) => {
        if (doc.name === data) {
          setProviderCertificates(doc.certificates);
        }
      });
    }
  };

  const handleFileChange = (e: any, type: any) => {
    const file = e.target.files[0];
    if (file) {
      uploadCertificate(file, type);
    }
  };

  async function uploadCertificate(file: any, id: any) {
    let formData = new FormData();
    formData.append("file", file, file.name);
    try {
      const response = await uploadFileCertificate(file, file.path);

      const res = response.data;

      if (id === "train") {
        setTrainingCertifications({
          ...trainingCertifications,
          certificate: res.fileName,
          url: res.fileUrl,
        });
      } else if (id === "academic") {
        setAcademicProjects({
          ...academicProjects,
          document: res.fileName,
          url: res.fileUrl,
        });
      } else {
        setIndustryCertificate({
          ...industryCertificate,
          certificate: res.fileName,
          url: res.fileUrl,
        });
      }
      alertify.success("Uploaded successfully");
    } catch (error) {
      // Handle errors
      console.error(error);
      alertify.error("An error occurred during upload");
    }
  }

  const showDetail = (describe: any, type: any) => {};

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");
    const getCurUser = async () => {
      const { data } = await clientApi.get("/api/users/me");

      setProfile(data);

      const dat = (
        await clientApi.get(`/api/countries/findAllStates/${data.country.code}`)
      ).data;
      setStates(dat);
    };

    const getSubject = async () => {
      const { data } = await clientApi.get(`/api/settings/find-one/masterdata`);
      setMasterData(data);
      let tsubject = subjects;
      if (data.subjects.length > 0) {
        data.subjects.forEach((s: any) => {
          tsubject.push(s.name);
        });
      }
      setSubjects(tsubject);
      let tprog = progLang;
      if (data.progLang.length > 0) {
        data.progLang.forEach((s: any) => {
          tprog.push(s.name);
        });
      }
      setProgLang(tprog);
    };

    getCurUser();
    getSubject();
  }, [user]);

  return (
    <>
      <main className=" psycho-test-2 pt-lg-3">
        <div className="container">
          <div className="dashboard-area classroom mx-auto mw-100">
            <div className="row flex-lg-nowrap">
              <div className="col-lg-auto">
                <div className="rounded-boxes bg-white min-w-lg-250px">
                  <ul id="mcq-stepper" className="stepper-vertical">
                    <li
                      className={
                        "nav-item " + (currentStep >= 0 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(0)}
                    >
                      <div className="text_item active">Resume summary</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 1 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(1)}
                    >
                      <div className="text_item">Education</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 2 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(2)}
                    >
                      <div className="text_item">Entrance Exam</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 3 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(3)}
                    >
                      <div className="text_item">Industry Certification</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 4 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(4)}
                    >
                      <div className="text_item">Training & Internship</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 5 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(5)}
                    >
                      <div className="text_item">Academic Projects</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 6 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(6)}
                    >
                      <div className="text_item">
                        Extra Curricular Activities
                      </div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 7 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(7)}
                    >
                      <div className="text_item">Awards & Recognations</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 8 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(8)}
                    >
                      <div className="text_item">Technical Skills</div>
                    </li>
                    <li
                      className={
                        "nav-item " + (currentStep >= 9 ? "active" : "")
                      }
                      onClick={() => setCurrentStep(9)}
                    >
                      <div className="text_item">External Assessments</div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg overflow-lg-hidden">
                <div className="rounded-boxes bg-white">
                  <div className="admin-box2-remove">
                    <div className="d-flex align-items-center">
                      <figure className="user_img_circled_wrap">
                        <img
                          src={
                            user?.avatar?.fileUrl
                              ? "https://www.practiz.xyz" +
                                user?.avatar?.fileUrl
                              : "/assets/images/defaultProfile.png"
                          }
                          alt=""
                          className="user_img_circled"
                        />
                      </figure>

                      <div className="ml-2">
                        <h3 className="profile_user_name">{user.name}</h3>
                        <p></p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {currentStep == 0 && (
                      <div className="mt-3 p-0">
                        {profile?.dossier &&
                        profile?.dossier?.notes &&
                        profile?.dossier?.notes?.length ? (
                          <>
                            {profile.dossier?.notes?.map(
                              (n: any, index: number) => {
                                return (
                                  <>
                                    <div
                                      className="gray_box_inside_rounded_box mt-3"
                                      key={index}
                                    >
                                      <div className="row mb-2">
                                        <div className="col">
                                          <h1
                                            className="admin-head2"
                                            style={{ lineHeight: "15px" }}
                                          >
                                            Version {n.version}
                                          </h1>
                                        </div>

                                        <div className="col-auto ml-auto">
                                          {/* {index == 1 && (
                                          <div className="save-ch-btn-remove">
                                            <a className="btn btn-primary btn-sm" onClick={downloadResume}>Download </a>
                                          </div>
                                        )} */}
                                        </div>
                                      </div>

                                      <div className="row">
                                        <div className="col-lg-10">
                                          <div className="d-flex">
                                            <figure className="user_img_circled_wrap m-0">
                                              <img
                                                src={
                                                  n?.userInfo?.avatar?.fileUrl
                                                    ? "https://www.practiz.xyz" +
                                                      n?.userInfo?.avatar
                                                        ?.fileUrl
                                                    : "/assets/images/defaultProfile.png"
                                                }
                                                alt=""
                                                className="user_img_circled"
                                              />
                                            </figure>

                                            <div className="ml-2">
                                              <h1 className="note-title">
                                                {n.userInfo.name}
                                              </h1>
                                              <p>
                                                {n.updatedAt &&
                                                  fromNow(n.updatedAt)}
                                              </p>
                                              <p className="mentor-msg">
                                                {n.comment}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                );
                              }
                            )}
                          </>
                        ) : (
                          <>
                            <svg
                              id="b85b6090-e265-40b4-b5a6-f759bbd384f1"
                              data-name="Layer 1"
                              xmlns="http://www.w3.org/2000/svg"
                              width="500.87469"
                              height="500.82827"
                              viewBox="0 0 753.87469 703.82827"
                            >
                              <path
                                d="M578.47505,103.95771l-23.06843,12.58664L271.19846,271.61447,248.13,284.2011a48.1793,48.1793,0,0,0-19.1955,65.29607L440.57765,737.39072a48.17922,48.17922,0,0,0,65.296,19.19561l.05958-.03251L836.15907,576.37545l.05958-.03251a48.17924,48.17924,0,0,0,19.19553-65.296L643.77106,123.15338A48.17929,48.17929,0,0,0,578.47505,103.95771Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M585.11115,116.11916l-27.323,14.908L282.08828,281.455,254.7657,296.36278a34.30947,34.30947,0,0,0-13.66965,46.4988L452.73916,730.75513a34.30947,34.30947,0,0,0,46.4988,13.66952l.05958-.0325L829.5234,564.21377l.06-.03274a34.30935,34.30935,0,0,0,13.66926-46.49851L631.60954,129.789A34.30936,34.30936,0,0,0,585.11115,116.11916Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#fff"
                              />
                              <path
                                d="M589.66653,236.52147,466.505,303.72109a8.01411,8.01411,0,1,1-7.677-14.07012l123.16157-67.19962a8.01411,8.01411,0,1,1,7.677,14.07012Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M631.641,244.43106,479.45984,327.46442a8.01411,8.01411,0,0,1-7.677-14.07012l152.18119-83.03336a8.01411,8.01411,0,1,1,7.677,14.07012Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M415.87223,275.74837l-113.5479,61.95419a3.84082,3.84082,0,0,0-1.53151,5.21006L349.14436,431.53a3.84075,3.84075,0,0,0,5.21,1.5317l113.5479-61.95419a3.84075,3.84075,0,0,0,1.53153-5.21l-48.35154-88.61735A3.84081,3.84081,0,0,0,415.87223,275.74837Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M650.7763,348.96263,483.723,440.11051a8.01411,8.01411,0,1,1-7.677-14.07012l167.05327-91.14788a8.01411,8.01411,0,1,1,7.677,14.07012Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M692.7508,356.87223,496.67791,463.85384a8.01411,8.01411,0,0,1-7.677-14.07012L685.07384,342.80211a8.01411,8.01411,0,1,1,7.677,14.07012Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#f2f2f2"
                              />
                              <circle
                                cx="197.03853"
                                cy="382.67177"
                                r="34"
                                fill="#f2f2f2"
                              />
                              <path
                                d="M928.81234,263.78816H552.494a48.17927,48.17927,0,0,0-48.125,48.12512V753.78907a48.17922,48.17922,0,0,0,48.125,48.12506H928.81234a48.17922,48.17922,0,0,0,48.125-48.12506V311.91328A48.17927,48.17927,0,0,0,928.81234,263.78816Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M928.81283,277.64235H552.494a34.30947,34.30947,0,0,0-34.271,34.27093V753.78907A34.30947,34.30947,0,0,0,552.494,788.06H928.81283a34.30936,34.30936,0,0,0,34.27051-34.27088V311.91328A34.30937,34.30937,0,0,0,928.81283,277.64235Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#fff"
                              />
                              <path
                                d="M875.14319,385.51745H734.84151a8.01411,8.01411,0,0,1,0-16.02823H875.14319a8.01412,8.01412,0,1,1,0,16.02823Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#6c63ff"
                              />
                              <path
                                d="M908.20141,412.56508H734.84151a8.01411,8.01411,0,1,1,0-16.02822h173.3599a8.01411,8.01411,0,0,1,0,16.02822Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#6c63ff"
                              />
                              <path
                                d="M703.79234,336.71073H574.44224a3.8408,3.8408,0,0,0-3.83984,3.84v100.95a3.84075,3.84075,0,0,0,3.83984,3.84h129.3501a3.84076,3.84076,0,0,0,3.83984-3.84v-100.95A3.84081,3.84081,0,0,0,703.79234,336.71073Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M609.92406,398.70111a34.087,34.087,0,0,1-8.804,23.076c-5.656,6.20712-14.07618,10.3236-22.57327,8.62043-7.82416-1.56829-14.18219-8.4067-13.389-16.6795a12.356,12.356,0,0,1,15.2668-11.09515c7.43265,1.92885,10.39415,12.64095,4.20051,17.669-1.4862,1.2065-3.62136-.90359-2.12132-2.12132,4.0944-3.32385,2.8295-10.5954-2.11244-12.419-5.75371-2.12311-11.84978,2.44324-12.26355,8.32554-.49057,6.97428,4.85221,12.22646,11.40422,13.463,7.08789,1.3377,14.11532-2.29,18.91808-7.29718a30.95507,30.95507,0,0,0,8.474-21.54183,1.5009,1.5009,0,0,1,3,0Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#2f2e41"
                              />
                              <circle
                                cx="416.15529"
                                cy="266.1673"
                                r="53.51916"
                                fill="#6c63ff"
                              />
                              <path
                                d="M636.47981,387.08916l-.05566-2c3.7207-.10352,7.001-.33692,9.46582-2.1377a6.14794,6.14794,0,0,0,2.38134-4.52832,3.51432,3.51432,0,0,0-1.15283-2.89453c-1.63623-1.38184-4.269-.93457-6.188-.05469l-1.65478.75879,3.17334-23.19043,1.98144.27149-2.69922,19.72656c2.60743-.7666,5.02344-.43652,6.67823.96094a5.471,5.471,0,0,1,1.86035,4.49218,8.13264,8.13264,0,0,1-3.2002,6.07325C643.90266,386.88115,639.78694,386.99638,636.47981,387.08916Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#2f2e41"
                              />
                              <rect
                                x="431.16715"
                                y="256.92907"
                                width="10.77148"
                                height="2"
                                fill="#2f2e41"
                              />
                              <rect
                                x="397.16715"
                                y="256.92907"
                                width="10.77148"
                                height="2"
                                fill="#2f2e41"
                              />
                              <path
                                d="M609.57212,445.34074a53.00636,53.00636,0,0,1,12.89014-5.93,8.56789,8.56789,0,0,1,.02-4.71,9.42609,9.42609,0,0,1,9.12988-6.63h13.04a9.45955,9.45955,0,0,1,9.15039,6.64,8.532,8.532,0,0,1,.01953,4.7,53.16732,53.16732,0,0,1,12.89014,5.93Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M700.52232,344.39072a11.57143,11.57143,0,0,0-3.52979-2.87,8.36739,8.36739,0,0,0-3.8501-.95,8.77158,8.77158,0,0,0-5.10986,1.72c-4.07031,2.88-6.89014,9.09-6.89014,16.28,0,9.02,4.43995,16.5,10.21,17.80005a8.25321,8.25321,0,0,0,1.79.2c6.60987,0,12-8.07,12-18C705.14243,352.81077,703.33238,347.68076,700.52232,344.39072Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M590.6024,341.86076h-.00977a8.57836,8.57836,0,0,0-4.4502-1.29,8.36738,8.36738,0,0,0-3.85009.95,11.57143,11.57143,0,0,0-3.52979,2.87l-.01025.01c-2.79981,3.29-4.60987,8.42-4.60987,14.17,0,7.76,3.27979,14.38,7.87989,16.91a8.54175,8.54175,0,0,0,4.12011,1.09,7.72431,7.72431,0,0,0,.96-.06h.00976c6.16016-.74,11.03027-8.5,11.03027-17.94C598.14243,351.01072,595.01255,344.52073,590.6024,341.86076Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M582.77242,373.76a1.50127,1.50127,0,0,0,1.42151-1.98,58.49864,58.49864,0,1,1,112.68726-6.5747,1.50006,1.50006,0,0,0,2.93554.61914A61.50091,61.50091,0,1,0,581.35116,372.739,1.50077,1.50077,0,0,0,582.77242,373.76Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#3f3d56"
                              />
                              <path
                                d="M666.10324,329.57746c2.11924,2.89278,1.07447,6.79121-1.15837,9.28528-2.90548,3.24541-7.53877,3.45016-11.5618,2.8478-4.51431-.67591-9.3026-2.7909-13.87293-1.3656-3.89537,1.2148-6.67418,4.74793-10.7211,5.63537-3.589.787-7.88081-.25477-9.139-4.08016-.60459-1.83823,2.29142-2.6261,2.89284-.79751.81395,2.47478,4.32865,2.42543,6.34145,1.74012,3.22689-1.09867,5.71374-3.77105,8.8854-5.04749,3.73933-1.50491,7.79621-.82549,11.60323.03181,3.58831.808,7.718,2.006,11.29267.49665,2.64515-1.1169,4.74985-4.635,2.84717-7.23211-1.14219-1.5591,1.45985-3.05738,2.59042-1.51416Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#2f2e41"
                              />
                              <path
                                d="M874.932,513.49157H684.63034a8.01411,8.01411,0,1,1,0-16.02823H874.932a8.01412,8.01412,0,0,1,0,16.02823Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M907.99023,540.5392H684.63034a8.01412,8.01412,0,1,1,0-16.02823H907.99023a8.01412,8.01412,0,1,1,0,16.02823Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M874.932,610.705H684.63034a8.01411,8.01411,0,1,1,0-16.02822H874.932a8.01411,8.01411,0,1,1,0,16.02822Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M907.99023,637.75267H684.63034a8.01411,8.01411,0,1,1,0-16.02823H907.99023a8.01411,8.01411,0,1,1,0,16.02823Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <circle
                                cx="386.2497"
                                cy="420.61448"
                                r="34"
                                fill="#e6e6e6"
                              />
                              <circle
                                cx="386.2497"
                                cy="518.61448"
                                r="34"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M874.932,708.705H684.63034a8.01411,8.01411,0,1,1,0-16.02822H874.932a8.01411,8.01411,0,1,1,0,16.02822Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <path
                                d="M907.99023,735.75267H684.63034a8.01411,8.01411,0,1,1,0-16.02823H907.99023a8.01411,8.01411,0,1,1,0,16.02823Z"
                                transform="translate(-223.06266 -98.08587)"
                                fill="#e6e6e6"
                              />
                              <circle
                                cx="386.2497"
                                cy="616.61448"
                                r="34"
                                fill="#e6e6e6"
                              />
                            </svg>
                          </>
                        )}
                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={() => next()}
                          >
                            Next Step
                          </a>
                        </div>
                      </div>
                    )}

                    {currentStep == 1 && (
                      <>
                        {profile?.dossier &&
                        profile?.dossier?.feedback &&
                        profile?.dossier?.feedback?.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile.dossier.feedback.map(
                              (f: any, index: number) => {
                                return (
                                  <div key={index}>
                                    {f.type === "education" && (
                                      <div className="row">
                                        <div className="col">
                                          <div className="d-flex my-1">
                                            <figure className="user_img_circled_wrap">
                                              <img
                                                src={
                                                  "/assets/images/defaultProfile.png"
                                                }
                                                alt=""
                                                className="user_img_circled"
                                              />
                                            </figure>

                                            <div className="ml-2">
                                              <h3 className="admin-head2 pl-0">
                                                {f.userInfo.name}
                                              </h3>
                                              <p>
                                                {f.updatedAt &&
                                                  fromNow(f.updatedAt)}
                                              </p>
                                              <p className="mentor-msg">
                                                {f.comment}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        {user._id !== f.userInfo?.user && (
                                          <div className="col-auto ml-auto">
                                            <div
                                              className="save-ch-btn-remove mt-1"
                                              onClick={() => openChat(f)}
                                            >
                                              <a className="btn btn-primary btn-sm">
                                                Reply
                                              </a>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="mentor-2-remove">
                          <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                            <h3 style={{ textAlign: "left" }}>Education </h3>
                            <form
                              role="form"
                              name="eprofile"
                              ref={(form) => setEform(form)}
                              onSubmit={(event) =>
                                submit(
                                  eform,
                                  education,
                                  "educationDetails",
                                  event
                                )
                              }
                            >
                              <div className="form-grey">
                                <div className="row">
                                  <div className="col-sm-3">
                                    <div className="form-group">
                                      <label>Education Type</label>
                                      <div className="select-option">
                                        <select
                                          className="form-control"
                                          name="edutype"
                                          onChange={(e) =>
                                            setEducation({
                                              ...education,
                                              educationType: e.target.value,
                                            })
                                          }
                                        >
                                          <option hidden selected></option>
                                          <option hidden>Select Type</option>
                                          {masterData?.educationType ? (
                                            <>
                                              {masterData?.educationType.map(
                                                (edu: any, ind: number) => {
                                                  return (
                                                    <option key={ind}>
                                                      {edu.name}
                                                    </option>
                                                  );
                                                }
                                              )}
                                            </>
                                          ) : (
                                            <></>
                                          )}
                                        </select>
                                      </div>
                                      <div className="m-b-xs">
                                        {eform?.control?.edutype &&
                                        ((eform.controls.edutype.touched &&
                                          eform.controls.edutype.pristine) ||
                                          eSumitted.educationDetails) &&
                                        eform.controls.edutype.errors
                                          ?.required ? (
                                          <p className=" label label-danger">
                                            Education type is required
                                          </p>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-3">
                                    <div className="form-group">
                                      <label>Affiliation</label>
                                      <div className="select-option">
                                        <select
                                          className="form-control"
                                          name="board"
                                          onChange={(e) =>
                                            setEducation({
                                              ...education,
                                              board: e.target.value,
                                            })
                                          }
                                          required
                                        >
                                          <option hidden></option>
                                          {masterData?.board ? (
                                            <>
                                              {masterData?.board.map(
                                                (board: any, ind: number) => {
                                                  return (
                                                    <option
                                                      key={ind}
                                                      value={board.name}
                                                    >
                                                      {board?.name}
                                                    </option>
                                                  );
                                                }
                                              )}
                                            </>
                                          ) : (
                                            <></>
                                          )}
                                        </select>
                                      </div>
                                      <div className="m-b-xs">
                                        {eform?.controls?.board &&
                                        ((eform.controls?.board.pristine &&
                                          eform.controls?.board.touched) ||
                                          eSumitted.educationDetails) &&
                                        eform.controls?.board.errors &&
                                        eform.controls.board?.errors
                                          ?.required ? (
                                          <p className="label label-danger">
                                            Affiliation is required
                                          </p>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-3">
                                    <div className="form-group">
                                      <label>Marks Type</label>
                                      <div className="select-option">
                                        <select
                                          name="marksType"
                                          className="form-control"
                                          onChange={(e: any) =>
                                            setEducation({
                                              ...education,
                                              marksType: e.target.value,
                                            })
                                          }
                                          required
                                        >
                                          <option hidden disabled>
                                            Select type
                                          </option>
                                          <option value={"marks"} selected>
                                            Marks
                                          </option>
                                          <option value={"cgpa"}>CGPA</option>
                                        </select>
                                        <div className="m-b-xs">
                                          {eform?.controls?.marksType &&
                                          ((eform.controls?.marksType
                                            .pristine &&
                                            eform.controls?.marksType
                                              .touched) ||
                                            eSumitted.educationDetails) &&
                                          eform.controls?.marksType.errors &&
                                          eform.controls.marksType?.errors
                                            ?.required ? (
                                            <p className="label label-danger">
                                              MarkType type is required
                                            </p>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-3">
                                    <div className="form-group">
                                      {education.marksType == "marks" && (
                                        <label>Marks(%)</label>
                                      )}

                                      {education.marksType == "cgpa" && (
                                        <label>CGPA</label>
                                      )}
                                      <div>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Marks or CGPA"
                                          name="marks"
                                          min="1"
                                          max="101"
                                          onChange={(e) =>
                                            setEducation({
                                              ...education,
                                              marks: e.target.value,
                                            })
                                          }
                                          value={education.marks}
                                          required
                                        />
                                      </div>
                                      <div className="m-b-xs">
                                        {eform?.controls?.marks &&
                                        ((eform.controls?.marks.pristine &&
                                          eform.controls?.marks.touched) ||
                                          eSumitted.educationDetails) &&
                                        eform.controls?.marks.errors &&
                                        eform.controls.marks?.errors
                                          ?.required ? (
                                          <p className="label label-danger">
                                            Enter Marks is between 1 to 100
                                          </p>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-sm-3">
                                    <div className="form-group">
                                      <label>Passing Year</label>
                                      <div className="select-option">
                                        <select
                                          className="form-control"
                                          name="passingYear"
                                          onChange={(e) =>
                                            setEducation({
                                              ...education,
                                              passingYear: e.target.value,
                                            })
                                          }
                                          required
                                        >
                                          <option hidden></option>
                                          {masterData?.passingYear ? (
                                            <>
                                              {masterData?.passingYear.map(
                                                (
                                                  passinngYear: any,
                                                  ind: number
                                                ) => {
                                                  return (
                                                    <option key={ind}>
                                                      {passinngYear?.name}
                                                    </option>
                                                  );
                                                }
                                              )}
                                            </>
                                          ) : (
                                            <></>
                                          )}
                                        </select>
                                      </div>
                                      <div className="m-b-xs">
                                        {eform?.controls?.passingYear &&
                                        ((eform.controls?.passingYear
                                          .pristine &&
                                          eform.controls?.passingYear
                                            .touched) ||
                                          eSumitted.educationDetails) &&
                                        eform.controls?.passingYear.errors &&
                                        eform.controls.passingYear?.errors
                                          ?.required ? (
                                          <p className="label label-danger">
                                            Passing Year is required
                                          </p>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col text-right align-self-end">
                                    <div className="form-group">
                                      <div className="button-profile">
                                        <button
                                          type="submit"
                                          className="btn btn-primary"
                                          disabled={
                                            profile?.dossier &&
                                            profile?.dossier?.status ==
                                              "pending"
                                          }
                                        >
                                          Add
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="table-responsive">
                                  <table className="table table-inverse vertical-middle">
                                    <thead>
                                      <tr>
                                        <th>Education Type</th>
                                        <th>Board</th>
                                        <th>Marks</th>
                                        <th>Passing Year</th>
                                        <th></th>
                                      </tr>
                                    </thead>
                                    {profile &&
                                    profile?.educationDetails &&
                                    profile?.educationDetails.length ? (
                                      <tbody>
                                        {profile?.educationDetails.map(
                                          (edu: any, ind: number) => {
                                            return (
                                              <tr key={ind}>
                                                <td>{edu?.educationType}</td>
                                                <td>{edu?.board}</td>
                                                <td>{edu?.marks}</td>
                                                <td>{edu?.passingYear}</td>
                                                <td className="text-right">
                                                  {profile?.dossier &&
                                                    profile.dossier?.status !==
                                                      "pending" && (
                                                      <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={(e) => {
                                                          remove(
                                                            edu,
                                                            "educationDetails"
                                                          );
                                                          e.preventDefault();
                                                        }}
                                                      >
                                                        Delete
                                                      </button>
                                                    )}
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                      </tbody>
                                    ) : (
                                      <></>
                                    )}
                                  </table>
                                  {!profile ||
                                    !profile?.educationDetails ||
                                    (!profile?.educationDetails.length && (
                                      <div className="text-center">
                                        <img
                                          className="text-center mx-auto"
                                          src="/assets/images/resume.svg"
                                          alt="Not Found"
                                        />
                                        <p className="text-center">
                                          {" "}
                                          Please add your details
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>

                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={() => next()}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 2 && (
                      <>
                        {profile?.dossier &&
                        profile?.dossier?.feedback?.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map(
                              (f: any, ind: number) => {
                                return (
                                  <div key={ind}>
                                    {f.type === "entranceexam" && (
                                      <div className="row">
                                        <div className="col">
                                          <div className="d-flex my-1">
                                            <figure className="user_img_circled_wrap">
                                              <img
                                                src={
                                                  "/assets/images/defaultProfile.png"
                                                }
                                                alt=""
                                                className="user_img_circled"
                                              />
                                            </figure>

                                            <div className="ml-2">
                                              <h3 className="admin-head2 pl-0">
                                                {f.userInfo.name}
                                              </h3>
                                              <p>
                                                {f.updatedAt &&
                                                  fromNow(f.updatedAt)}
                                              </p>
                                              <p className="mentor-msg">
                                                {f.comment}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        {user._id !== f.userinfo?.user ? (
                                          <div className="col-auto ml-auto">
                                            <div
                                              className="save-ch-btn-remove mt-1"
                                              onClick={() =>
                                                openChat(
                                                  f.userinfo.user,
                                                  f.userinfo.name
                                                )
                                              }
                                            >
                                              <a className="btn btn-primary btn-sm">
                                                Reply
                                              </a>
                                            </div>
                                          </div>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>Entrance Exam </h3>
                          <form
                            role="form"
                            name="enprofile"
                            ref={(form) => setEExamform(form)}
                            onSubmit={(event) =>
                              submit(
                                eexamform,
                                entranceExam,
                                "entranceExam",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Exam Name</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="ename"
                                        onChange={(e) =>
                                          setEntranceExam({
                                            ...entranceExam,
                                            name: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option hidden selected></option>
                                        <option disabled>Select Type</option>
                                        {masterData.entranceExamType ? (
                                          <>
                                            {masterData.entranceExamType.map(
                                              (exam: any, ind: number) => {
                                                return (
                                                  <option
                                                    key={ind}
                                                    value={exam.name}
                                                  >
                                                    {exam?.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {eexamform?.control?.ename &&
                                      ((eexamform.controls.ename.touched &&
                                        eexamform.controls.ename.pristine) ||
                                        eSumitted.entranceExam) &&
                                      eexamform.controls.ename.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Exam is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Exam Year</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="eyear"
                                        onChange={(e) =>
                                          setEntranceExam({
                                            ...entranceExam,
                                            year: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option hidden></option>
                                        {masterData.passingYear ? (
                                          <>
                                            {masterData.passingYear.map(
                                              (year: any, ind: number) => {
                                                return (
                                                  <option
                                                    key={ind}
                                                    value={year.name}
                                                  >
                                                    {year?.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {eexamform?.control?.eyear &&
                                      ((eexamform.controls.eyear.touched &&
                                        eexamform.controls.eyear.pristine) ||
                                        eSumitted.entranceExam) &&
                                      eexamform.controls.eyear.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Exam Year is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Rank</label>
                                    <input
                                      type="text"
                                      placeholder="Rank"
                                      name="rank"
                                      min="1"
                                      max="99999999"
                                      className="form-control"
                                      onChange={(e) =>
                                        setEntranceExam({
                                          ...entranceExam,
                                          rank: e.target.value,
                                        })
                                      }
                                      value={entranceExam.rank}
                                      required
                                    />
                                    <div className="m-b-xs">
                                      {eexamform?.control?.rank &&
                                      ((eexamform.controls.rank.touched &&
                                        eexamform.controls.rank.pristine) ||
                                        eSumitted.entranceExam) &&
                                      eexamform.controls.rank.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Rank is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3 text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Education Name</th>
                                      <th>Rank</th>
                                      <th>Year</th>
                                      <th></th>
                                    </tr>
                                  </thead>
                                  {profile &&
                                  profile?.entranceExam &&
                                  profile?.entranceExam?.length ? (
                                    <tbody>
                                      {profile.entranceExam.map(
                                        (edu: any, ind: number) => {
                                          return (
                                            <tr key={ind}>
                                              <td>{edu?.name}</td>
                                              <td>{edu?.rank}</td>
                                              <td>{edu?.year}</td>
                                              <td className="text-right">
                                                {profile?.dossier &&
                                                  profile.dossier?.status !==
                                                    "pending" && (
                                                    <button
                                                      className="btn btn-danger btn-sm"
                                                      onClick={(e) => {
                                                        remove(
                                                          edu,
                                                          "entranceExam"
                                                        );
                                                        e.preventDefault();
                                                      }}
                                                    >
                                                      Delete
                                                    </button>
                                                  )}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  ) : (
                                    <></>
                                  )}
                                </table>
                                {!profile ||
                                  !profile?.entranceExam ||
                                  (!profile?.entranceExam.length && (
                                    <div className="text-center">
                                      <img
                                        className="text-center mx-auto"
                                        src="/assets/images/resume.svg"
                                        alt="Not Found"
                                      />
                                      <p className="text-center">
                                        {" "}
                                        Please add your details
                                      </p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </form>
                        </div>

                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={() => next()}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 3 && (
                      <>
                        {profile?.dossier &&
                        profile?.dossier?.feedback?.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map((f: any) => {
                              return (
                                <>
                                  {f.type === "industrycertification" && (
                                    <div className="row">
                                      <div className="col">
                                        <div className="d-flex my-1">
                                          <figure className="user_img_circled_wrap">
                                            <img
                                              src={
                                                "/assets/images/defaultProfile.png"
                                              }
                                              alt=""
                                              className="user_img_circled"
                                            />
                                          </figure>
                                          <div className="ml-2">
                                            <h3 className="admin-head2 pl-0">
                                              {f.userInfo.name}
                                            </h3>
                                            <p>
                                              {f.updatedAt &&
                                                fromNow(f.updatedAt)}
                                            </p>
                                            <p className="mentor-msg">
                                              {f.comment}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {user._id !== f.userinfo?.user && (
                                        <div className="col-auto ml-auto">
                                          <div
                                            className="save-ch-btn-remove mt-1"
                                            onClick={() =>
                                              openChat(
                                                f.userinfo.user,
                                                f.userinfo.name
                                              )
                                            }
                                          >
                                            <a className="btn btn-primary btn-sm">
                                              Reply
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>
                            {" "}
                            Industry Certifications{" "}
                          </h3>
                          <form
                            role="form"
                            name="industryCert"
                            ref={(form) => setIndform(form)}
                            onSubmit={(event) =>
                              submit(
                                indform,
                                industryCertificate,
                                "industryCertificates",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Provider</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="ename"
                                        value={industryCertificate.provider}
                                        onChange={(e) => {
                                          setIndustryCertificate({
                                            ...industryCertificate,
                                            provider: e.target.value,
                                          });
                                          onProviderChange(e.target.value);
                                        }}
                                        required
                                      >
                                        <option selected hidden></option>
                                        {masterData?.certificateProvider ? (
                                          <>
                                            {masterData.certificateProvider.map(
                                              (provider: any, ind: number) => {
                                                return (
                                                  <option
                                                    key={ind}
                                                    value={provider.name}
                                                  >
                                                    {provider.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {indform?.controls?.ename &&
                                      ((indform?.controls.ename.pristine &&
                                        indform?.controls.ename.touched) ||
                                        eSumitted.industryCertificates) &&
                                      indform?.controls?.ename.errors &&
                                      indform?.controls.ename.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Provider is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Certificate Name</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="ecname"
                                        onChange={(e) =>
                                          setIndustryCertificate({
                                            ...industryCertificate,
                                            name: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option></option>
                                        <option disabled>Select Name</option>
                                        {masterData?.certificateProvider ? (
                                          <>
                                            {providerCertificates?.map(
                                              (cert: any, ind: number) => {
                                                return (
                                                  <option
                                                    key={ind}
                                                    value={cert.name}
                                                  >
                                                    {cert.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {indform?.controls?.ecname &&
                                      ((indform?.controls.ecname.pristine &&
                                        indform?.controls.ecname.touched) ||
                                        eSumitted.industryCertificates) &&
                                      indform?.controls?.ecname.errors &&
                                      indform?.controls.ecname.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Name is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label> Certificate </label>

                                    <div className="form-group">
                                      {industryCertificate?.certificate}
                                      <label
                                        htmlFor="fileUpload"
                                        className="edit-profile"
                                      >
                                        <i
                                          className="fa fa-upload"
                                          aria-hidden="true"
                                          style={{ color: "#1675e0" }}
                                        ></i>
                                      </label>
                                      <input
                                        type="file"
                                        id="fileUpload"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          handleFileChange(e, "certificate")
                                        }
                                      />
                                    </div>

                                    <div className="m-b-xs">
                                      {eSumitted?.industryCertificates &&
                                      !industryCertificate?.certificate ? (
                                        <p className=" label label-danger">
                                          Certificate is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Certificate Date </label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={
                                          industryCertificate?.certificateDate
                                        }
                                        onChange={(date: any) =>
                                          setIndustryCertificate({
                                            ...industryCertificate,
                                            certificateDate: date,
                                          })
                                        }
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>

                                    <div className="m-b-xs">
                                      {indform?.controls?.ecerti &&
                                      ((indform?.controls.ecerti.pristine &&
                                        indform?.controls.ecerti.touched) ||
                                        eSumitted.industryCertificates) &&
                                      indform?.controls?.ecerti.errors &&
                                      indform?.controls.ecerti.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Certificate Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Expiration </label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={
                                          industryCertificate?.expiredDate
                                        }
                                        onChange={(date: any) =>
                                          setIndustryCertificate({
                                            ...industryCertificate,
                                            expiredDate: date,
                                          })
                                        }
                                      />
                                      <span className="input-group-btn">
                                        <button className="btn btn-date">
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="col-sm-2 text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Provider</th>
                                      <th>Certificate</th>
                                      <th> Certificate Date</th>

                                      <th>Expiration Date</th>
                                    </tr>
                                  </thead>
                                  {profile &&
                                  profile?.industryCertificates &&
                                  profile?.industryCertificates.length ? (
                                    <tbody>
                                      {profile.industryCertificates.map(
                                        (indCert: any, ind: number) => {
                                          return (
                                            <tr key={ind}>
                                              <td>{indCert.name}</td>
                                              <td> {indCert.provider}</td>
                                              <td>{indCert.certificate}</td>
                                              <td>{indCert.certificateDate}</td>
                                              <td>
                                                {moment(
                                                  indCert.expiredDate
                                                ).format("DD-MM-YY")}
                                              </td>
                                              <td>
                                                {profile?.dossier &&
                                                profile.dossier?.status !==
                                                  "pending" ? (
                                                  <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={(e) => {
                                                      remove(
                                                        indCert,
                                                        "industryCertificates"
                                                      );
                                                      e.preventDefault();
                                                    }}
                                                  >
                                                    Delete
                                                  </button>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                              <td>
                                                <a
                                                  onClick={() =>
                                                    downloadCertificate(
                                                      indCert.url
                                                    )
                                                  }
                                                >
                                                  <i
                                                    title="download"
                                                    className="fa fa-download"
                                                    aria-hidden="true"
                                                  ></i>
                                                </a>
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  ) : (
                                    <></>
                                  )}
                                </table>
                                {!profile ||
                                !profile?.industryCertificates ||
                                !profile?.industryCertificates.length ? (
                                  <div className="text-center">
                                    <img
                                      className="text-center mx-auto"
                                      src="/assets/images/resume.svg"
                                      alt="Not Found"
                                    />
                                    <p className="text-center">
                                      {" "}
                                      Please add your details
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>
                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={next}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 4 && (
                      <>
                        {profile.dossier &&
                        profile?.dossier?.feedback.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map((f: any) => {
                              return (
                                <>
                                  {f.type === "trainingandinternship" ? (
                                    <div className="row">
                                      <div className="col">
                                        <div className="d-flex my-1">
                                          <figure className="user_img_circled_wrap">
                                            <img
                                              src={
                                                "/assets/images/defaultProfile.png"
                                              }
                                              alt=""
                                              className="user_img_circled"
                                            />
                                          </figure>

                                          <div className="ml-2">
                                            <h3 className="admin-head2 pl-0">
                                              {f.userInfo.name}
                                            </h3>
                                            <p>
                                              {f.updatedAt &&
                                                fromNow(f.updatedAt)}
                                            </p>
                                            <p className="mentor-msg">
                                              {f.comment}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {user._id !== f.userinfo?.user ? (
                                        <div className="col-auto ml-auto">
                                          <div
                                            className="save-ch-btn-remove mt-1"
                                            onClick={() =>
                                              openChat(
                                                f.userinfo.user,
                                                f.userinfo.name
                                              )
                                            }
                                          >
                                            <a className="btn btn-primary btn-sm">
                                              Reply
                                            </a>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>
                            Training and Internship{" "}
                          </h3>
                          <form
                            role="form"
                            name="ttyprofile"
                            ref={(form) => setTform(form)}
                            onSubmit={(event) =>
                              submit(
                                tform,
                                trainingCertifications,
                                "trainingCertifications",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Type</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="ttype"
                                        onChange={(e) =>
                                          setTrainingCertifications({
                                            ...trainingCertifications,
                                            type: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option hidden selected></option>
                                        {masterData?.trainingType ? (
                                          <>
                                            {masterData?.trainingType.map(
                                              (type: any, ind: number) => {
                                                return (
                                                  <option
                                                    key={ind}
                                                    value={type.name}
                                                  >
                                                    {" "}
                                                    {type.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {tform?.controls?.ttype &&
                                      ((tform?.controls?.ttype.pristine &&
                                        tform?.controls?.ttype.touched) ||
                                        eSumitted.trainingCertifications) &&
                                      tform?.controls?.ttype.errors &&
                                      tform?.controls.ttype?.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Training Type is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Provider </label>
                                    <input
                                      type="text"
                                      placeholder="Provider"
                                      name="provider"
                                      onChange={(e) =>
                                        setTrainingCertifications({
                                          ...trainingCertifications,
                                          provider: e.target.value,
                                        })
                                      }
                                      value={trainingCertifications.provider}
                                      className="form-control"
                                      required
                                    />
                                    <div className="m-b-xs">
                                      {tform?.controls?.provider &&
                                      ((tform?.controls?.provider.pristine &&
                                        tform?.controls?.provider.touched) ||
                                        eSumitted.trainingCertifications) &&
                                      tform?.controls?.provider.errors &&
                                      tform?.controls.provider?.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Provider is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>STATE</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="tstate"
                                        onChange={(e) =>
                                          setTrainingCertifications({
                                            ...trainingCertifications,
                                            state: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option hidden selected></option>
                                        {states ? (
                                          <>
                                            {states.map(
                                              (s: any, ind: number) => {
                                                return (
                                                  <option key={ind} value={s}>
                                                    {s}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {tform?.controls?.tstate &&
                                      ((tform?.controls?.tstate.pristine &&
                                        tform?.controls?.tstate.touched) ||
                                        eSumitted.trainingCertifications) &&
                                      tform?.controls?.tstate.errors &&
                                      tform?.controls?.tstate?.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          State is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>CITY</label>
                                    <input
                                      type="text"
                                      placeholder="City"
                                      className="form-control"
                                      onChange={(e) =>
                                        setTrainingCertifications({
                                          ...trainingCertifications,
                                          city: e.target.value,
                                        })
                                      }
                                      value={trainingCertifications.city}
                                      required
                                      name="tcity"
                                    />
                                    {tform?.controls?.tstate &&
                                    ((tform?.controls?.tstate.pristine &&
                                      tform?.controls?.tstate.touched) ||
                                      eSumitted.trainingCertifications) &&
                                    tform?.controls?.tstate.errors &&
                                    tform?.controls?.tstate?.errors
                                      ?.required ? (
                                      <>
                                        <div className="m-b-xs">
                                          <p className=" label label-danger">
                                            City is required
                                          </p>
                                        </div>
                                        <div className="m-b-xs">
                                          <p className=" label label-danger">
                                            City must be smaller than 100
                                            characters
                                          </p>
                                        </div>
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Start Date</label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={
                                          trainingCertifications?.startDate
                                        }
                                        onChange={(date: any) =>
                                          setTrainingCertifications({
                                            ...trainingCertifications,
                                            startDate: date,
                                          })
                                        }
                                        value={trainingCertifications.startDate}
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          {" "}
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                    <div className="m-b-xs">
                                      {tform?.controls?.tsdate &&
                                      ((tform?.controls?.tsdate.pristine &&
                                        tform?.controls?.tsdate.touched) ||
                                        eSumitted.trainingCertifications) &&
                                      tform?.controls?.tsdate.errors &&
                                      tform?.controls?.tsdate?.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Start Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>End Date </label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={
                                          trainingCertifications?.endDate
                                        }
                                        onChange={(date: any) =>
                                          setTrainingCertifications({
                                            ...trainingCertifications,
                                            endDate: date,
                                          })
                                        }
                                        value={trainingCertifications.endDate}
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                    <div className="m-b-xs">
                                      {tform?.controls?.tsdate &&
                                      ((tform?.controls?.tsdate.pristine &&
                                        tform?.controls?.tsdate.touched) ||
                                        eSumitted.trainingCertifications) &&
                                      tform?.controls?.tsdate.errors &&
                                      tform?.controls?.tsdate?.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          End Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Expiration </label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={
                                          trainingCertifications?.expiredDate
                                        }
                                        onChange={(date: any) =>
                                          setTrainingCertifications({
                                            ...trainingCertifications,
                                            expiredDate: date,
                                          })
                                        }
                                        value={
                                          trainingCertifications.expiredDate
                                        }
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Certificate</label>
                                    <div className="form-group">
                                      {trainingCertifications?.certificate}
                                      <label
                                        htmlFor="fileUpload"
                                        className="edit-profile"
                                      >
                                        <i
                                          className="fa fa-upload"
                                          aria-hidden="true"
                                          style={{ color: "#1675e0" }}
                                        ></i>
                                      </label>
                                      <input
                                        type="file"
                                        id="fileUpload"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          handleFileChange(e, "train")
                                        }
                                      />
                                    </div>
                                    <div className="m-b-xs">
                                      {eSumitted?.trainingCertifications &&
                                      !trainingCertifications?.certificate ? (
                                        <p className=" label label-danger">
                                          Certificate is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-2">
                                  <div className="form-group">
                                    <label>Description</label>

                                    <input
                                      type="text"
                                      placeholder="Description"
                                      name="description"
                                      className="form-control"
                                      onChange={(e) =>
                                        setTrainingCertifications({
                                          ...trainingCertifications,
                                          description: e.target.value,
                                        })
                                      }
                                      value={trainingCertifications.description}
                                      ng-hide="true"
                                    />
                                  </div>
                                </div>
                                <div className="col-sm-2 text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Type</th>
                                      <th>Provider</th>
                                      <th>State</th>
                                      <th>City</th>
                                      <th>Certificate</th>
                                      <th>Start Date</th>
                                      <th>End Date</th>
                                      <th>Expiration Date</th>
                                      <th>Description</th>

                                      <th></th>
                                    </tr>
                                  </thead>
                                  {profile &&
                                  profile?.trainingCertifications &&
                                  profile?.trainingCertifications.length ? (
                                    <tbody>
                                      {profile?.trainingCertifications.map(
                                        (edu: any, ind: number) => {
                                          return (
                                            <tr key={ind}>
                                              <td>{edu.type}</td>
                                              <td>{edu.provider}</td>
                                              <td>{edu.state}</td>
                                              <td>{edu.city}</td>
                                              <td>{edu.certificate}</td>
                                              <td>
                                                {moment(edu.startDate).format(
                                                  "DD-MM-YY"
                                                )}
                                              </td>
                                              <td>
                                                {moment(edu.endDate).format(
                                                  "DD-MM-YY"
                                                )}
                                              </td>
                                              <td>
                                                {moment(edu.expiredDate).format(
                                                  "DD-MM-YY"
                                                )}
                                              </td>
                                              <td>{edu.Description}</td>
                                              <td>
                                                {edu?.description &&
                                                edu?.description?.length >
                                                  70 ? (
                                                  <></>
                                                ) : (
                                                  <></>
                                                )}
                                                <a
                                                  style={{ color: "#807cf5" }}
                                                  onClick={() =>
                                                    showDetail(
                                                      edu.description,
                                                      "Work Description"
                                                    )
                                                  }
                                                >
                                                  <i className="fa fa-eye"></i>
                                                </a>
                                              </td>
                                              <td>
                                                {!edu.sysgen &&
                                                profile.dossier &&
                                                profile.dossier.status !==
                                                  "pending" ? (
                                                  <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={(e) => {
                                                      remove(
                                                        edu,
                                                        "trainingandinternship"
                                                      ),
                                                        e.preventDefault();
                                                    }}
                                                  >
                                                    Delete
                                                  </button>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                              <td>
                                                <a
                                                  onClick={() =>
                                                    downloadCertificate(edu.url)
                                                  }
                                                >
                                                  <i
                                                    title="download"
                                                    className="fa fa-download"
                                                    aria-hidden="true"
                                                  ></i>
                                                </a>
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  ) : (
                                    <></>
                                  )}
                                </table>
                                {!profile ||
                                !profile?.trainingCertifications ||
                                !profile?.trainingCertifications.length ? (
                                  <>
                                    <div className="text-center">
                                      <img
                                        className="text-center mx-auto"
                                        src="/assets/images/resume.svg"
                                        alt="Not Found"
                                      />
                                      <p className="text-center">
                                        {" "}
                                        Please add your details
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>

                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={next}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 5 && (
                      <>
                        {profile.dossier &&
                        profile?.dossier?.feedback.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map((f: any) => {
                              return (
                                <>
                                  {f.type === "academicprojects" ? (
                                    <div className="row">
                                      <div className="col">
                                        <div className="d-flex my-1">
                                          <figure className="user_img_circled_wrap">
                                            <img
                                              src={
                                                "/assets/images/defaultProfile.png"
                                              }
                                              alt=""
                                              className="user_img_circled"
                                            />
                                          </figure>

                                          <div className="ml-2">
                                            <h3 className="admin-head2 pl-0">
                                              {f.userInfo.name}
                                            </h3>
                                            <p>
                                              {f.updatedAt &&
                                                fromNow(f.updatedAt)}
                                            </p>
                                            <p className="mentor-msg">
                                              {f.comment}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {user._id !== f.userinfo?.user ? (
                                        <div className="col-auto ml-auto">
                                          <div
                                            className="save-ch-btn-remove mt-1"
                                            onClick={() =>
                                              openChat(
                                                f.userinfo.user,
                                                f.userinfo.name
                                              )
                                            }
                                          >
                                            <a className="btn btn-primary btn-sm">
                                              Reply
                                            </a>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>
                            Academic Projects{" "}
                          </h3>
                          <form
                            role="form"
                            name="ttyprofile"
                            ref={(form) => setApform(form)}
                            onSubmit={(event) =>
                              submit(
                                apform,
                                academicProjects,
                                "academicProjects",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Name</label>
                                    <input
                                      type="text"
                                      placeholder="Project Name"
                                      name="name"
                                      onChange={(e) =>
                                        setAcademicProjects({
                                          ...academicProjects,
                                          name: e.target.value,
                                        })
                                      }
                                      value={academicProjects.name}
                                      className="form-control"
                                      required
                                    />

                                    <div className="m-b-xs">
                                      {apform?.controls?.name &&
                                      ((apform?.controls?.name.pristine &&
                                        apform?.controls?.name.touched) ||
                                        eSumitted.academicProjects) &&
                                      apform?.controls?.name.errors &&
                                      apform?.controls?.name.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Name is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Group Size </label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="groupSize"
                                        onChange={(e) =>
                                          setAcademicProjects({
                                            ...academicProjects,
                                            groupSize: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option hidden selected></option>
                                        <option value="" disabled>
                                          Select Group Size{" "}
                                        </option>
                                        {masterData?.groupRange ? (
                                          <>
                                            {masterData?.groupRange.map(
                                              (range: any) => {
                                                return (
                                                  <option
                                                    key={range.name}
                                                    value={range.name}
                                                  >
                                                    {range.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {apform?.controls?.groupSize &&
                                      ((apform?.controls?.groupSize.pristine &&
                                        apform?.controls?.groupSize.touched) ||
                                        eSumitted.academicProjects) &&
                                      apform?.controls?.groupSize.errors &&
                                      apform?.controls?.groupSize.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Group Size is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Start Date</label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={academicProjects?.startDate}
                                        onChange={(date: any) =>
                                          setAcademicProjects({
                                            ...academicProjects,
                                            startDate: date,
                                          })
                                        }
                                        value={academicProjects.startDate}
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                    <div className="m-b-xs">
                                      {apform?.controls?.tsdate &&
                                      ((apform?.controls?.tsdate.pristine &&
                                        apform?.controls?.tsdate.touched) ||
                                        eSumitted.academicProjects) &&
                                      apform?.controls?.tsdate.errors &&
                                      apform?.controls?.tsdate.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Start Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>End Date </label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={academicProjects?.endDate}
                                        onChange={(date: any) =>
                                          setAcademicProjects({
                                            ...academicProjects,
                                            endDate: date,
                                          })
                                        }
                                        value={academicProjects.endDate}
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                    <div className="m-b-xs">
                                      {apform?.controls?.tedate &&
                                      ((apform?.controls?.tedate.pristine &&
                                        apform?.controls?.tedate.touched) ||
                                        eSumitted.academicProjects) &&
                                      apform?.controls?.tedate.errors &&
                                      apform?.controls?.tedate.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          End Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Project document</label>
                                    <div className="form-group">
                                      {academicProjects.document}
                                      <label
                                        htmlFor="fileUpload"
                                        className="edit-profile"
                                      >
                                        <i
                                          className="fa fa-upload"
                                          aria-hidden="true"
                                          style={{ color: "#1675e0" }}
                                        ></i>
                                      </label>
                                      <input
                                        type="file"
                                        id="fileUpload"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          handleFileChange(e, "academic")
                                        }
                                      />
                                    </div>

                                    <div
                                      className="ng-hide form-group"
                                      style={{ display: "none" }}
                                    ></div>
                                    <div className="m-b-xs">
                                      {eSumitted.academicProjects &&
                                      !academicProjects.document ? (
                                        <p className=" label label-danger">
                                          Project Document is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Description</label>

                                    <input
                                      type="text"
                                      placeholder="Description"
                                      name="description"
                                      className="form-control"
                                      onChange={(e) =>
                                        setAcademicProjects({
                                          ...academicProjects,
                                          description: e.target.value,
                                        })
                                      }
                                      value={academicProjects.description}
                                    />
                                  </div>
                                </div>
                                <div className="col text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Group Size</th>
                                      <th>Description</th>
                                      <th>Start Date</th>
                                      <th>End Date</th>
                                      <th>Project Document</th>
                                      <th></th>
                                      <th></th>
                                      <th></th>

                                      <th></th>
                                    </tr>
                                  </thead>
                                  {profile &&
                                  profile?.academicProjects &&
                                  profile?.academicProjects.length ? (
                                    <tbody>
                                      {profile?.academicProjects.map(
                                        (edu: any, ind: number) => {
                                          return (
                                            <tr key={ind}>
                                              <td>{edu.name}</td>
                                              <td>{edu.groupSize}</td>
                                              <td>
                                                {moment(edu.startDate).format(
                                                  "DD-MM-YY"
                                                )}
                                              </td>
                                              <td>
                                                {moment(edu.endDate).format(
                                                  "DD-MM-YY"
                                                )}
                                              </td>
                                              <td>{edu.description}</td>
                                              <td>
                                                {edu.description &&
                                                edu.description.length > 70 ? (
                                                  <a
                                                    style={{ color: "#806cf5" }}
                                                    onClick={() =>
                                                      showDetail(
                                                        edu.description,
                                                        "Work Description"
                                                      )
                                                    }
                                                  >
                                                    <i className="fa fa-eye"></i>
                                                  </a>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                              <td>{edu.endDate}</td>
                                              <td>{edu.expiredDate}</td>
                                              <td>{edu.Description}</td>
                                              <td>
                                                {edu?.description &&
                                                edu?.description?.length >
                                                  70 ? (
                                                  <>
                                                    <a
                                                      style={{
                                                        color: "#807cf5",
                                                      }}
                                                      onClick={() =>
                                                        showDetail(
                                                          edu.description,
                                                          "Work Description"
                                                        )
                                                      }
                                                    >
                                                      <i className="fa fa-eye"></i>
                                                    </a>
                                                  </>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                              <td>
                                                {!edu.sysgen &&
                                                profile.dossier &&
                                                profile.dossier.status !==
                                                  "pending" ? (
                                                  <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={(e) => {
                                                      remove(
                                                        edu,
                                                        "academicProjects"
                                                      ),
                                                        e.preventDefault();
                                                    }}
                                                  >
                                                    Delete
                                                  </button>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                              <td>
                                                <a
                                                  onClick={() =>
                                                    downloadCertificate(edu.url)
                                                  }
                                                >
                                                  <i
                                                    title="download"
                                                    className="fa fa-download"
                                                    aria-hidden="true"
                                                  ></i>
                                                </a>
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  ) : (
                                    <></>
                                  )}
                                </table>
                                {!profile ||
                                !profile?.academicProjects ||
                                !profile?.academicProjects.length ? (
                                  <>
                                    <div className="text-center">
                                      <img
                                        className="text-center mx-auto"
                                        src="/assets/images/resume.svg"
                                        alt="Not Found"
                                      />
                                      <p className="text-center">
                                        {" "}
                                        Please add your details
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>

                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={next}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 6 && (
                      <>
                        {profile.dossier &&
                        profile?.dossier?.feedback.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map((f: any) => {
                              return (
                                <>
                                  {f.type === "extracurricularactivities" ? (
                                    <div className="row">
                                      <div className="col">
                                        <div className="d-flex my-1">
                                          <figure className="user_img_circled_wrap">
                                            <img
                                              src={
                                                "/assets/images/defaultProfile.png"
                                              }
                                              alt=""
                                              className="user_img_circled"
                                            />
                                          </figure>

                                          <div className="ml-2">
                                            <h3 className="admin-head2 pl-0">
                                              {f.userInfo.name}
                                            </h3>
                                            <p>
                                              {f.updatedAt &&
                                                fromNow(f.updatedAt)}
                                            </p>
                                            <p className="mentor-msg">
                                              {f.comment}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {user._id !== f.userinfo?.user ? (
                                        <div className="col-auto ml-auto">
                                          <div
                                            className="save-ch-btn-remove mt-1"
                                            onClick={() =>
                                              openChat(
                                                f.userinfo.user,
                                                f.userinfo.name
                                              )
                                            }
                                          >
                                            <a className="btn btn-primary btn-sm">
                                              Reply
                                            </a>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>
                            Extra Curricular Activities{" "}
                          </h3>
                          <form
                            role="form"
                            name="ecaprofile"
                            ref={(form) => setEcform(form)}
                            onSubmit={(event) =>
                              submit(
                                ecform,
                                extraCurricularActivities,
                                "extraCurricularActivities",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label> ACTIVITY DETAILS</label>
                                    <input
                                      type="text"
                                      placeholder="ACTIVITY Details"
                                      name="activitydetail"
                                      className="form-control"
                                      onChange={(e) =>
                                        setExtraCurricularActivities({
                                          ...academicProjects,
                                          activityDetails: e.target.value,
                                        })
                                      }
                                      value={
                                        extraCurricularActivities.activityDetails
                                      }
                                    />
                                    <div className="m-b-xs">
                                      {ecform?.controls?.activitydetail &&
                                      ((ecform?.controls?.activitydetail
                                        .pristine &&
                                        ecform?.controls?.activitydetail
                                          .touched) ||
                                        eSumitted.extraCurricularActivities) &&
                                      ecform?.controls?.activitydetail.errors &&
                                      ecform?.controls?.activitydetail.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Activity Detail is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>Start Date</label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={
                                          extraCurricularActivities?.startDate
                                        }
                                        onChange={(date: any) =>
                                          setExtraCurricularActivities({
                                            ...extraCurricularActivities,
                                            startDate: date,
                                          })
                                        }
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                    <div className="m-b-xs">
                                      {ecform?.controls?.tsdate &&
                                      ((ecform?.controls?.tsdate.pristine &&
                                        ecform?.controls?.tsdate.touched) ||
                                        eSumitted.extraCurricularActivities) &&
                                      ecform?.controls?.tsdate.errors &&
                                      ecform?.controls?.tsdate.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Start Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3">
                                  <div className="form-group">
                                    <label>End Date </label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={
                                          extraCurricularActivities?.endDate
                                        }
                                        onChange={(date: any) =>
                                          setExtraCurricularActivities({
                                            ...extraCurricularActivities,
                                            endDate: date,
                                          })
                                        }
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                    <div className="m-b-xs">
                                      {ecform?.controls?.tedate &&
                                      ((ecform?.controls?.tedate.pristine &&
                                        ecform?.controls?.tedate.touched) ||
                                        eSumitted.extraCurricularActivities) &&
                                      ecform?.controls?.tedate.errors &&
                                      ecform?.controls?.tedate.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          End Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-3 text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Activity Details</th>
                                      <th>Start Date</th>
                                      <th>End Date</th>

                                      <th></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {profile &&
                                    profile?.extraCurricularActivities &&
                                    profile?.extraCurricularActivities
                                      .length ? (
                                      <>
                                        {profile.extraCurricularActivities.map(
                                          (extraActivity: any, ind: any) => {
                                            return (
                                              <tr key={ind}>
                                                <td>
                                                  {
                                                    extraActivity.activityDetails
                                                  }
                                                </td>
                                                <td>
                                                  {moment(
                                                    extraActivity.startDate
                                                  ).format("DD-MM-YY")}
                                                </td>
                                                <td>
                                                  {moment(
                                                    extraActivity.endDate
                                                  ).format("DD-MM-YY")}
                                                </td>
                                                <td className="text-right">
                                                  {profile?.dossier &&
                                                  profile?.dossier?.status !==
                                                    "pending" ? (
                                                    <button
                                                      className="btn btn-danger btn-sm"
                                                      onClick={(e: any) => {
                                                        remove(
                                                          extraActivity,
                                                          "extraCurricularActivities"
                                                        );
                                                        e.preventDefault();
                                                      }}
                                                    >
                                                      Delete
                                                    </button>
                                                  ) : (
                                                    <></>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </tbody>
                                </table>
                                {!profile ||
                                !profile?.extraCurricularActivities ||
                                !profile?.extraCurricularActivities.length ? (
                                  <div className="text-center">
                                    <img
                                      className="text-center mx-auto"
                                      src="/assets/images/resume.svg"
                                      alt="Not Found"
                                    />
                                    <p className="text-center">
                                      {" "}
                                      Please add your details
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>

                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={next}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 7 && (
                      <>
                        {profile.dossier &&
                        profile?.dossier?.feedback.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map((f: any) => {
                              return (
                                <>
                                  {f.type === "trainingandinternship" ? (
                                    <div className="row">
                                      <div className="col">
                                        <div className="d-flex my-1">
                                          <figure className="user_img_circled_wrap">
                                            <img
                                              src={
                                                "/assets/images/defaultProfile.png"
                                              }
                                              alt=""
                                              className="user_img_circled"
                                            />
                                          </figure>

                                          <div className="ml-2">
                                            <h3 className="admin-head2 pl-0">
                                              {f.userInfo.name}
                                            </h3>
                                            <p>
                                              {f.updatedAt &&
                                                fromNow(f.updatedAt)}
                                            </p>
                                            <p className="mentor-msg">
                                              {f.comment}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {user._id !== f.userinfo?.user ? (
                                        <div className="col-auto ml-auto">
                                          <div
                                            className="save-ch-btn-remove mt-1"
                                            onClick={() =>
                                              openChat(
                                                f.userinfo.user,
                                                f.userinfo.name
                                              )
                                            }
                                          >
                                            <a className="btn btn-primary btn-sm">
                                              Reply
                                            </a>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>
                            Awards and Recognition{" "}
                          </h3>
                          <form
                            role="form"
                            name="awardrecognition"
                            ref={(form) => setAwform(form)}
                            onSubmit={(event) =>
                              submit(
                                awform,
                                awardsAndRecognition,
                                "awardsAndRecognition",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-4">
                                  <label>AWARD DETAILS</label>
                                  <div className="form-group">
                                    <input
                                      type="text"
                                      placeholder="Awards Details"
                                      name="awarddetail"
                                      className="form-control"
                                      onChange={(e) =>
                                        setAwardsAndRecognition({
                                          ...awardsAndRecognition,
                                          awardDetails: e.target.value,
                                        })
                                      }
                                      value={awardsAndRecognition.awardDetails}
                                      required
                                    />

                                    <div className="m-b-xs">
                                      {awform?.controls?.awarddetail &&
                                      ((awform?.controls?.awarddetail
                                        .pristine &&
                                        awform?.controls?.awarddetail
                                          .touched) ||
                                        eSumitted.awardsAndRecognition) &&
                                      awform?.controls?.awarddetail.errors &&
                                      awform?.controls?.awarddetail.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Award Detail is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-4">
                                  <div className="form-group">
                                    <label> Date</label>
                                    <p className="input-group datepicker-box">
                                      <DatePicker
                                        className="form-control"
                                        selected={awardsAndRecognition?.date}
                                        onChange={(date: any) =>
                                          setAwardsAndRecognition({
                                            ...awardsAndRecognition,
                                            date: date,
                                          })
                                        }
                                      />
                                      <span className="input-group-btn">
                                        <button
                                          type="button"
                                          className="btn btn-date"
                                        >
                                          <i className="glyphicon glyphicon-calendar"></i>
                                        </button>
                                      </span>
                                    </p>
                                    <div className="m-b-xs">
                                      {awform?.controls?.tsdate &&
                                      ((awform?.controls?.tsdate.pristine &&
                                        awform?.controls?.tsdate.touched) ||
                                        eSumitted.awardsAndRecognition) &&
                                      awform?.controls?.tsdate.errors &&
                                      awform?.controls?.tsdate.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Date is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-4 text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Awards Details</th>
                                      <th>Date</th>

                                      <th></th>
                                    </tr>
                                  </thead>
                                  {profile &&
                                  profile?.awardsAndRecognition &&
                                  profile?.awardsAndRecognition?.length ? (
                                    <tbody>
                                      {profile?.awardsAndRecognition.map(
                                        (award: any, ind: any) => {
                                          return (
                                            <tr key={ind}>
                                              <td>{award.awardDetails}</td>
                                              <td>
                                                {moment(award.date).format(
                                                  "DD-MM-YY"
                                                )}
                                              </td>
                                              <td className="text-right">
                                                {profile?.dossier &&
                                                profile?.dossier?.status !==
                                                  "pending" ? (
                                                  <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={(e: any) => {
                                                      remove(
                                                        award,
                                                        "awardsAndRecognition"
                                                      ),
                                                        e.preventDefault();
                                                    }}
                                                  >
                                                    Delete
                                                  </button>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  ) : (
                                    <></>
                                  )}
                                </table>
                                {!profile ||
                                !profile?.awardsAndRecognition ||
                                !profile?.awardsAndRecognition.length ? (
                                  <div className="text-center">
                                    <img
                                      className="text-center mx-auto"
                                      src="/assets/images/resume.svg"
                                      alt="Not Found"
                                    />
                                    <p className="text-center">
                                      {" "}
                                      Please add your details
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>
                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={next}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 8 && (
                      <>
                        {profile.dossier &&
                        profile?.dossier?.feedback.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map((f: any) => {
                              return (
                                <>
                                  {f.type === "trainingandinternship" ? (
                                    <div className="row">
                                      <div className="col">
                                        <div className="d-flex my-1">
                                          <figure className="user_img_circled_wrap">
                                            <img
                                              src={
                                                "/assets/images/defaultProfile.png"
                                              }
                                              alt=""
                                              className="user_img_circled"
                                            />
                                          </figure>

                                          <div className="ml-2">
                                            <h3 className="admin-head2 pl-0">
                                              {f.userInfo.name}
                                            </h3>
                                            <p>
                                              {f.updatedAt &&
                                                fromNow(f.updatedAt)}
                                            </p>
                                            <p className="mentor-msg">
                                              {f.comment}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {user._id !== f.userinfo?.user ? (
                                        <div className="col-auto ml-auto">
                                          <div
                                            className="save-ch-btn-remove mt-1"
                                            onClick={() =>
                                              openChat(
                                                f.userinfo.user,
                                                f.userinfo.name
                                              )
                                            }
                                          >
                                            <a className="btn btn-primary btn-sm">
                                              Reply
                                            </a>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>
                            Technical Skills and Level
                          </h3>
                          <form
                            role="form"
                            name="tprogLang"
                            ref={(form) => setTsform(form)}
                            onSubmit={(event) =>
                              submit(
                                tsform,
                                programmingLang,
                                "programmingLang",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-4">
                                  <label>Programming Language</label>
                                  <div className="form-group">
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        onChange={(e) =>
                                          setProgrammingLang({
                                            ...programmingLang,
                                            name: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option hidden selected></option>
                                        <option value="" disabled>
                                          Select Language
                                        </option>
                                        {masterData?.progLang ? (
                                          <>
                                            {masterData.progLang.map(
                                              (lang: any, ind: number) => {
                                                return (
                                                  <option
                                                    value={lang.name}
                                                    key={ind}
                                                  >
                                                    {lang.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {tsform?.controls?.programming &&
                                      ((tsform?.controls?.programming
                                        .pristine &&
                                        tsform?.controls?.programming
                                          .touched) ||
                                        eSumitted.programmingLang) &&
                                      tsform?.controls?.programming.errors &&
                                      tsform?.controls?.programming.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Language is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-4">
                                  <div className="form-group">
                                    <label>Proficiency Level</label>
                                    <div className="rate-star">
                                      {/* <Rating className="start-yellow" name="rating"></Rating> */}
                                      <RatingComponent
                                        setvalue={true}
                                        changeValue={(e: any) =>
                                          setProgrammingLang({
                                            ...programmingLang,
                                            rating: e,
                                          })
                                        }
                                        value={programmingLang.rating}
                                      ></RatingComponent>
                                      <div className="m-b-xs">
                                        {tsform?.controls?.rating &&
                                        ((tsform?.controls?.rating.pristine &&
                                          tsform?.controls?.rating.touched) ||
                                          eSumitted.programmingLang) &&
                                        tsform?.controls?.rating.errors &&
                                        tsform?.controls?.rating.errors
                                          ?.required ? (
                                          <p className=" label label-danger">
                                            Proficiency Level is required
                                          </p>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-4 text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Language</th>
                                      <th>Rating</th>

                                      <th></th>
                                    </tr>
                                  </thead>
                                  {profile &&
                                  profile?.programmingLang &&
                                  profile?.programmingLang.length ? (
                                    <tbody>
                                      {profile.programmingLang.map(
                                        (lang: any, ind: number) => {
                                          return (
                                            <tr key={ind}>
                                              <td>{lang.name}</td>
                                              <td>{lang.rating}</td>
                                              <td className="text-right">
                                                {profile?.dossier &&
                                                profile?.dossier?.status !==
                                                  "pending" ? (
                                                  <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={(e: any) => {
                                                      remove(
                                                        lang,
                                                        "programmingLang"
                                                      ),
                                                        e.preventDefault();
                                                    }}
                                                  >
                                                    Delete
                                                  </button>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  ) : (
                                    <></>
                                  )}
                                </table>
                                {!profile ||
                                !profile?.programmingLang ||
                                !profile?.programmingLang.length ? (
                                  <div className="text-center">
                                    <img
                                      className="text-center mx-auto"
                                      src="/assets/images/resume.svg"
                                      alt="Not Found"
                                    />
                                    <p className="text-center">
                                      {" "}
                                      Please add your details
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>

                        <div className="text-right">
                          <a
                            className="btn btn-primary mt-2 steppers"
                            onClick={next}
                          >
                            Next Step
                          </a>
                        </div>
                      </>
                    )}

                    {currentStep == 9 && (
                      <>
                        {profile.dossier &&
                        profile?.dossier?.feedback.length ? (
                          <div className="gray_box_inside_rounded_box mb-3 mentor-1-remove">
                            {profile?.dossier?.feedback.map((f: any) => {
                              return (
                                <>
                                  {f.type === "trainingandinternship" ? (
                                    <div className="row">
                                      <div className="col">
                                        <div className="d-flex my-1">
                                          <figure className="user_img_circled_wrap">
                                            <img
                                              src={
                                                "/assets/images/defaultProfile.png"
                                              }
                                              alt=""
                                              className="user_img_circled"
                                            />
                                          </figure>

                                          <div className="ml-2">
                                            <h3 className="admin-head2 pl-0">
                                              {f.userInfo.name}
                                            </h3>
                                            <p>
                                              {f.updatedAt &&
                                                fromNow(f.updatedAt)}
                                            </p>
                                            <p className="mentor-msg">
                                              {f.comment}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {user._id !== f.userinfo?.user ? (
                                        <div className="col-auto ml-auto">
                                          <div
                                            className="save-ch-btn-remove mt-1"
                                            onClick={() =>
                                              openChat(
                                                f.userinfo.user,
                                                f.userinfo.name
                                              )
                                            }
                                          >
                                            <a className="btn btn-primary btn-sm">
                                              Reply
                                            </a>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="gray_box_inside_rounded_box box-grey-remove-box-profile">
                          <h3 style={{ textAlign: "left" }}>
                            External Assessment{" "}
                          </h3>
                          <form
                            role="form"
                            name="eaprofile"
                            ref={(form) => setEaform(form)}
                            onSubmit={(event) =>
                              submit(
                                eaform,
                                externalAssessment,
                                "externalAssessment",
                                event
                              )
                            }
                          >
                            <div className="form-grey">
                              <div className="row">
                                <div className="col-sm-4">
                                  <div className="form-group">
                                    <label> Assessment Type</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        onChange={(e) =>
                                          setExternalAssessment({
                                            ...externalAssessment,
                                            name: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        <option hidden selected></option>
                                        <option value="" disabled>
                                          Assessment Type{" "}
                                        </option>
                                        {masterData?.externalAssessment ? (
                                          <>
                                            {masterData.externalAssessment.map(
                                              (
                                                assessment: any,
                                                ind: number
                                              ) => {
                                                return (
                                                  <option
                                                    value={assessment.name}
                                                    key={ind}
                                                  >
                                                    {assessment.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {eaform?.controls?.aname &&
                                      ((eaform?.controls?.aname.pristine &&
                                        eaform?.controls?.aname.touched) ||
                                        eSumitted.externalAssessment) &&
                                      eaform?.controls?.aname.errors &&
                                      eaform?.controls?.aname.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Assessment Type is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-4">
                                  <div className="form-group">
                                    <label>Assessment Year</label>
                                    <div className="select-option">
                                      <select
                                        className="form-control"
                                        name="eyear"
                                        onChange={(e) =>
                                          setExternalAssessment({
                                            ...externalAssessment,
                                            yearOfAssessment: e.target.value,
                                          })
                                        }
                                        value={
                                          externalAssessment.yearOfAssessment
                                        }
                                        required
                                      >
                                        <option hidden selected></option>
                                        <option value="" disabled>
                                          Select Assessment Year
                                        </option>
                                        {masterData?.passingYear ? (
                                          <>
                                            {masterData?.passingYear.map(
                                              (year: any, ind: number) => {
                                                return (
                                                  <option
                                                    value={year.name}
                                                    key={ind}
                                                  >
                                                    {year.name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </select>
                                    </div>
                                    <div className="m-b-xs">
                                      {eaform?.controls?.eyear &&
                                      ((eaform?.controls?.eyear.pristine &&
                                        eaform?.controls?.eyear.touched) ||
                                        eSumitted.externalAssessment) &&
                                      eaform?.controls?.eyear.errors &&
                                      eaform?.controls?.eyear.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Assessment year is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-sm-4">
                                  <div className="form-group">
                                    <label>Most Recent score</label>
                                    <div>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Score"
                                        name="score"
                                        style={{ color: "black" }}
                                        min="0"
                                        max="999"
                                        onChange={(e) =>
                                          setExternalAssessment({
                                            ...externalAssessment,
                                            mostRecentScore: e.target.value,
                                          })
                                        }
                                        value={
                                          externalAssessment.mostRecentScore
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="m-b-xs">
                                      {eaform?.controls?.score &&
                                      ((eaform?.controls?.score.pristine &&
                                        eaform?.controls?.score.touched) ||
                                        eSumitted.externalAssessment) &&
                                      eaform?.controls?.score.errors &&
                                      eaform?.controls?.score.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Score is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-sm-4">
                                  <div className="form-group">
                                    <label>Maximum Score</label>
                                    <div>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Maximum Score"
                                        style={{ color: "black" }}
                                        name="maximumScore"
                                        max="999"
                                        min="1"
                                        onChange={(e) =>
                                          setExternalAssessment({
                                            ...externalAssessment,
                                            maximumScore: e.target.value,
                                          })
                                        }
                                        value={externalAssessment.maximumScore}
                                        required
                                      />
                                    </div>
                                    <div className="m-b-xs">
                                      {eaform?.controls?.maximumScore &&
                                      ((eaform?.controls?.maximumScore
                                        .pristine &&
                                        eaform?.controls?.maximumScore
                                          .touched) ||
                                        eSumitted.externalAssessment) &&
                                      eaform?.controls?.maximumScore.errors &&
                                      eaform?.controls?.maximumScore.errors
                                        ?.required ? (
                                        <p className=" label label-danger">
                                          Maximun Score is required
                                        </p>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col text-right align-self-end">
                                  <div className="form-group">
                                    <div className="button-profile">
                                      <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                          profile?.dossier &&
                                          profile?.dossier?.status == "pending"
                                        }
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-inverse vertical-middle">
                                  <thead>
                                    <tr>
                                      <th>Assessment Name</th>
                                      <th>Most Recent Score</th>
                                      <th>Year Of Assessment</th>
                                      <th>Maximum Score</th>
                                    </tr>
                                  </thead>
                                  {profile &&
                                  profile?.externalAssessment &&
                                  profile?.externalAssessment.length ? (
                                    <tbody>
                                      {profile.externalAssessment.map(
                                        (edu: any, ind: number) => {
                                          return (
                                            <tr key={ind}>
                                              <td>{edu.name}</td>
                                              <td>{edu.mostRecentScore}</td>
                                              <td>{edu.yearOfAssessment}</td>
                                              <td>{edu.maximumScore}</td>
                                              <td className="text-right">
                                                {profile?.dossier &&
                                                profile?.dossier?.status !==
                                                  "pending" ? (
                                                  <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={(e: any) => {
                                                      remove(
                                                        edu,
                                                        "externalAssessment"
                                                      ),
                                                        e.preventDefault();
                                                    }}
                                                  >
                                                    Delete
                                                  </button>
                                                ) : (
                                                  <></>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  ) : (
                                    <></>
                                  )}
                                </table>
                                {!profile ||
                                !profile?.externalAssessment ||
                                !profile?.externalAssessment.length ? (
                                  <div className="text-center">
                                    <img
                                      className="text-center mx-auto"
                                      src="/assets/images/resume.svg"
                                      alt="Not Found"
                                    />
                                    <p className="text-center">
                                      {" "}
                                      Please add your details
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>

                        <div className="text-right mt-2">
                          {checkCondition() && (
                            <button
                              onClick={openModal}
                              className="btn btn-primary"
                            >
                              Send For Review
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        show={modalVisible}
        onHide={cancel}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body>
          <div
            className="modal-content form-boxes"
            style={{ padding: "0 !important" }}
          >
            <div className="modal-header modal-header-bg justify-content-center">
              <h4 className="form-box_title">Send For Review</h4>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to send the resume?</p>
              <div className="class-board-info">
                <form>
                  <h4 className="form-box_subtitle mb-0">Notes</h4>
                  <input
                    type="text"
                    placeholder=""
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </form>
                <hr />
              </div>
              <div className="d-flex justify-content-end mt-2">
                <a className="btn btn-light" onClick={cancel}>
                  Cancel
                </a>
                <a className="btn btn-primary ml-2" onClick={sendForReview}>
                  Yes
                </a>
                <br />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default Resume;
