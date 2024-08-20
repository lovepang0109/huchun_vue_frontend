"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as instituteSvc from "@/services/instituteService";
import * as programSvc from "@/services/programService";
import * as userService from "@/services/userService";
import * as authService from "@/services/auth";
import clientApi from "@/lib/clientApi";
import { isValidEmail } from "@/lib/helpers";
import * as alertify from "alertifyjs";
import { BehaviorSubject } from "rxjs";
export default function InstituteWizard() {
  const [fileToUpload, setFileToUpload] = useState<any>(null);
  const [logoUploading, setLogoUploading] = useState<boolean>(false);
  const router = useRouter();
  const currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  const [activeMenu, setActiveMenu] = useState<string>("basic");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [institute, setInstitute] = useState<any>({});
  const [programs, setPrograms] = useState<any>(null);
  const [emails, setEmails] = useState<string>("");
  const [steps, setSteps] = useState<any>({
    basic: true,
    subjects: false,
    invite: false,
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);
  const [hostName, setHostName] = useState<any>(null);
  const { push, back } = useRouter();

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };
  useEffect(() => {
    getClientDataFunc();
    setHostName(window.location.hostname);
    if (isValidEmail(user.userId)) {
      setInstitute({
        ...institute,
        email: user.userId,
      });
    } else {
      setInstitute({
        ...institute,
        contactNumber: user.userId,
      });
    }
  }, []);

  const checkInstituteIdAvailability = (id: string) => {
    instituteSvc
      .checkInstituteAvailability(id)
      .then(({ status, message }: any) => {
        setIsCheckPassed(status);
        if (!status) {
          alertify.alert("Message", message);
        } else {
          alertify.success("The Institute Identifier/Code is available");
        }
      });
  };

  const onMenuChange = (item: any) => {
    // console.log(steps[item], "ddd", activeMenu);
    // if (!steps[item] && activeMenu == item) {
    //   return;
    // }

    // if (activeMenu == "basic") {
    //   // validate basic data
    //   return;
    // }

    if (item == "basic") {
      setCurrentStep(0);
    }
    if (item == "subjects") {
      setCurrentStep(1);
    }
    if (item == "invite") {
      setCurrentStep(2);
    }
    setActiveMenu(item);

    if (item == "subjects" && !programs) {
      programSvc
        .findAll()
        .then((res: any[]) => {
          for (const p of res) {
            p.selected = !!user.programs.find((us) => us == p._id);
          }
          setPrograms(res);
        })
        .catch((err) => {
          setPrograms([]);
          console.log(err);
        });
    }
  };

  const next = (item: any) => {
    setSteps((prevSteps) => ({
      ...prevSteps,
      [item]: true,
    }));
    onMenuChange(item);
  };

  const validateEmails = () => {
    if (!emails) {
      return [];
    }

    const emailValidate =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/;
    const items = emails.split("\n");
    for (const item of items) {
      if (!emailValidate.test(item.trim())) {
        alertify.alert("Message", "Invalid email: " + item);
        return false;
      }
    }

    return items;
  };

  const submitBasic = (form: any) => {
    console.log(form, institute, "Ddd");
    setSubmitted(true);
    // setInstitute({ ...institute, ...form });
    onMenuChange("subjects");
  };

  const create = async () => {
    const selectedPrograms = [];
    const selectedSubjects = [];
    for (const p of programs) {
      if (p.selected) {
        selectedPrograms.push(p._id);
        for (const s of p.subjects) {
          selectedSubjects.push(s._id);
        }
      }
    }

    setInstitute({
      ...institute,
      programs: selectedPrograms,
      subjects: selectedSubjects,
    });
    const tmp = {
      ...institute,
      programs: selectedPrograms,
      subjects: selectedSubjects,
    };

    try {
      await instituteSvc.createInstitute(tmp);
      alertify.success("institute created successfully.");

      await update();
      userService.get().then((us) => {
        if (us.role != "publisher") {
          push(`/assessment/home `);
        } else {
          push(`/institute/home `);
        }
      });
    } catch (err) {
      if (
        err?.response?.data &&
        err?.response?.data[0] &&
        err?.response?.data[0].msg
      ) {
        alertify.alert("Message", err.response.data[0].msg);
      } else {
        alertify.alert("Message", "Fail to create institute.");
      }
    }
  };

  const refreshCurrentUserData = async (cb) => {
    const token = localStorage.getItem("token");

    if (!token) {
      cb && cb();
      return null;
    }

    try {
      const new_user = await userService.get();
      console.log(new_user, "user");
      localStorage.setItem("currentUser", JSON.stringify(new_user));
      currentUserSubject.next(new_user);
      cb && cb(new_user);
      return user;
    } catch (err) {
      throw err;
    }
  };

  const dropped = (files: any) => {
    setFileToUpload(files[0]);
  };

  const upload = (type: any) => {
    setLogoUploading(true);

    const formData: FormData = new FormData();
    formData.append("file", fileToUpload, fileToUpload.name);
    formData.append("uploadType", "file");

    authService
      .uploadFile(formData)
      .then((res: any) => {
        setInstitute({
          ...institute,
          imageUrl: res.fileUrl,
        });

        setLogoUploading(false);

        alertify.success("Uploaded successfully");
      })
      .catch((err) => {
        setLogoUploading(false);
        alertify.success("upload failed");
      });
  };

  const removeImage = () => {
    setInstitute({
      ...institute,
      imageUrl: "",
    });
    setFileToUpload(null);
  };

  const validateName = (name) => {
    const pattern = /^[a-zA-Z0-9-@! ]*$/;
    if (!name) return "Institute Name is required";
    if (name.length < 3)
      return "Institute Name must have at least 3 characters.";
    if (name.length > 36)
      return "Institute Name must be smaller than 36 characters.";
    if (!pattern.test(name))
      return "Institute Name contains invalid characters.";
    return "";
  };

  const validateCode = (code) => {
    if (!code) return "Institute Identifier/Code is required";
    if (code.length < 4)
      return "Institute Identifier/Code must have at least 4 characters.";
    if (code.length > 24)
      return "Institute Identifier/Code must be smaller than 24 characters.";
    return "";
  };

  return (
    <>
      <main className="mentor-homepage-profile Stu_profile pt-3">
        <div className="container">
          <div className="institute-onboarding">
            {started ? (
              <div className="container">
                <ul
                  id="mm-stepper"
                  className="stepper nav nav-pills nav-justified text-center"
                >
                  <li
                    className={`nav-item ${currentStep >= 0 ? "active" : ""}`}
                    onClick={() => onMenuChange("basic")}
                  >
                    <strong className={currentStep >= 0 ? "text-dark" : ""}>
                      Basic Information
                    </strong>
                  </li>
                  <li
                    className={`nav-item ${currentStep >= 1 ? "active" : ""}`}
                    onClick={() => onMenuChange("subjects")}
                  >
                    <strong className={currentStep >= 1 ? "text-dark" : ""}>
                      Programs
                    </strong>
                  </li>
                  <li
                    className={`nav-item ${currentStep >= 2 ? "active" : ""}`}
                    onClick={() => onMenuChange("invite")}
                  >
                    <strong className={currentStep >= 2 ? "text-dark" : ""}>
                      Logo & Contact Information
                    </strong>
                  </li>
                </ul>
                <div className="rounded-boxes bg-white">
                  {currentStep === 0 && (
                    <div>
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          Basic Information
                        </h3>
                        <p className="section_sub_heading">
                          Basic information of your institute
                        </p>
                      </div>
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="login-area">
                            <form
                              className="bg-white p-0"
                              noValidate
                              onSubmit={(e) => e.preventDefault()}
                            >
                              <div>
                                <div className="form-group">
                                  <label>Institute Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={institute.name}
                                    onChange={(e) => {
                                      setInstitute({
                                        ...institute,
                                        name: e.target.value,
                                      });
                                      setSubmitted(true);
                                    }}
                                    required
                                    minLength="3"
                                    maxLength="36"
                                    pattern="^[a-zA-Z0-9-@! ]*$"
                                  />
                                  <div className="text-danger">
                                    {submitted && validateName(institute.name)}
                                  </div>
                                </div>
                                <label>Institute Identifier/Code</label>
                                <p>
                                  Create an alphanumeric code as an identifier.
                                  You will share this with your students and
                                  teachers later.
                                </p>
                                {settings?.canHaveSubdomain && (
                                  <p>
                                    Also, used in white-labelling e.g. https://
                                    {`{instituteCode}`}.{hostName}
                                  </p>
                                )}
                                <div className="row">
                                  <div className="col-lg-7">
                                    <div className="form-group position-relative">
                                      <input
                                        type="text"
                                        name="code"
                                        value={institute.code}
                                        onChange={(e) => {
                                          setInstitute({
                                            ...institute,
                                            code: e.target.value,
                                            instituteId: e.target.value,
                                          });
                                          setSubmitted(true);
                                          setIsCheckPassed(false);
                                        }}
                                        className="form-control pr-5"
                                        required
                                        minLength="4"
                                        maxLength="24"
                                      />
                                      {isCheckPassed && (
                                        <span className="check-in-input">
                                          <i
                                            className="fas fa-check fa-2x"
                                            style={{ color: "#7472FE" }}
                                          ></i>
                                        </span>
                                      )}
                                      <div className="text-danger">
                                        {submitted &&
                                          validateCode(institute.code)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-5">
                                    <a
                                      type="button"
                                      className={`btn btn-secondary btn-block ${
                                        validateCode(institute.code)
                                          ? "disabled"
                                          : "active"
                                      }`}
                                      onClick={() =>
                                        checkInstituteIdAvailability(
                                          institute.code
                                        )
                                      }
                                    >
                                      Check Availability
                                    </a>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="row pull-right px-3 mt-5"
                                style={{ float: "right" }}
                              >
                                <a
                                  type="submit"
                                  className={`btn btn-primary btn-block mt-3 ${
                                    !isCheckPassed ||
                                    validateName(institute.name) ||
                                    validateCode(institute.code)
                                      ? "disabled inst-disabled"
                                      : "active"
                                  }`}
                                  onClick={() => submitBasic(institute)}
                                >
                                  Save And Next
                                </a>
                              </div>
                            </form>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <figure className="pro-basic-img-1-remove mt-2">
                            <img
                              src="/assets/images/instituteP.png"
                              className="d-block mx-auto max-height-250px"
                              alt="Institute"
                            />
                          </figure>
                          <p className="admin-head-pro text-center ml-0">
                            Your expertise and knowledge for all
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {currentStep === 1 && (
                    <div>
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          What programs do you want to teach?
                        </h3>
                        <p className="section_sub_heading">
                          Select the program you teach. You can add your custom
                          programs later.
                        </p>
                      </div>
                      <hr />
                      <div className="column-3">
                        {programs?.map((program, index) => (
                          <div
                            className="onboarding-1 break-avoid pb-3"
                            key={program.name}
                          >
                            <div className="card shadow border-0">
                              <div className="card-header bg-white">
                                <h6 className="box_heading">
                                  <label className="container2">
                                    {program.name}
                                    <input
                                      type="checkbox"
                                      checked={program.selected}
                                      onChange={() => {
                                        const newPrograms = [...programs];
                                        newPrograms[index].selected =
                                          !newPrograms[index].selected;
                                        setPrograms(newPrograms);
                                      }}
                                      name="chkSub"
                                    />
                                    <span className="checkmark1 translate-middle-y left-0"></span>
                                  </label>
                                </h6>
                              </div>
                              <div className="card-body">
                                {program.subjects.map((subject) => (
                                  <label key={subject.name} className="my-3">
                                    <i
                                      className={`mx-1 ${
                                        program.selected
                                          ? "fas fa-check check-primary"
                                          : "fas fa-dot-circle empty-check"
                                      }`}
                                    ></i>
                                    {subject.name}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <hr />
                      <div className="text-right">
                        <button
                          className="btn btn-light mr-2"
                          onClick={() => onMenuChange("basic")}
                        >
                          Previous
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => next("invite")}
                        >
                          Save And Next
                        </button>
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div>
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="row">
                          <div className="col-6">
                            <b>Institute Logo</b>
                            <p className="f-12">
                              You can modify these details by going to &quot;My
                              Institute&quot; from &quot;Profile Menu&quot;.
                            </p>
                            <div className="position-relative mt-2">
                              {!institute.imageUrl ? (
                                <div className="standard-upload-box my-0">
                                  <div
                                    className="ngx-file-drop"
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      // dropped(e.target.files);
                                    }}
                                  >
                                    <h2 className="upload_icon">
                                      <span className="material-icons">
                                        file_copy
                                      </span>
                                    </h2>
                                    <p
                                      className="pro-text-drug text-center"
                                      style={{ color: "#0782d0" }}
                                    >
                                      {fileToUpload?.name}
                                    </p>
                                    <span className="title">
                                      Drag and drop or{" "}
                                      <span
                                        className="text-primary"
                                        onClick={() =>
                                          document
                                            .getElementById("fileInput")
                                            .click()
                                        }
                                      >
                                        browse
                                      </span>{" "}
                                      your file
                                    </span>
                                    <p className="text-dark">
                                      For optimal view, we recommend size{" "}
                                      <span className="text-danger">
                                        190px * 200px
                                      </span>
                                    </p>
                                    <div className="d-flex justify-content-center gap-xs">
                                      <a
                                        type="button"
                                        className="btn btn-primary btn-sm mx-2"
                                        onClick={() =>
                                          document
                                            .getElementById("fileInput")
                                            .click()
                                        }
                                      >
                                        Browse
                                      </a>
                                      <a
                                        type="button"
                                        className={`btn btn-secondary btn-sm ${
                                          !fileToUpload ? "disabled" : ""
                                        }`}
                                        onClick={upload}
                                      >
                                        Upload
                                        {logoUploading && (
                                          <i className="fa fa-pulse fa-spinner"></i>
                                        )}
                                      </a>
                                    </div>
                                    <input
                                      type="file"
                                      id="fileInput"
                                      accept="image/*"
                                      style={{ display: "none" }}
                                      onChange={(e) => dropped(e.target.files)}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="standard-upload-box my-0 uploaded-image bg-white">
                                  <button
                                    type="button"
                                    className="close btn p-0 mb-2"
                                    onClick={removeImage}
                                    aria-label="cancel"
                                  >
                                    <img
                                      src="/assets/images/close.png"
                                      alt="close"
                                    />
                                  </button>
                                  <figure>
                                    <img
                                      src={institute.imageUrl}
                                      className="actual-uploaded-image"
                                      alt="institue-logo"
                                    />
                                  </figure>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-6">
                            <b className="mb-0">Describe your institute</b>
                            <p className="f-12">
                              This, along with phone number and email appears in
                              the footer of the emails communications to
                              students and teachers.
                            </p>
                            <textarea
                              type="text"
                              rows="5"
                              className="form-control mt-2"
                              name="description"
                              value={institute.description}
                              onChange={(e) => {
                                setInstitute({
                                  ...institute,
                                  description: e.target.value,
                                });
                              }}
                            ></textarea>
                          </div>
                        </div>
                        <br />
                        <div className="row">
                          <div className="col-6">
                            <div className="form-group">
                              <b>Institute Contact Number</b>
                              <input
                                className="form-control"
                                type="tel"
                                required
                                placeholder="Enter numbers only"
                                name="contactNumber"
                                value={institute.contactNumber}
                                onChange={(e) => {
                                  setInstitute({
                                    ...institute,
                                    contactNumber: e.target.value,
                                  });
                                }}
                                pattern="^[0-9]{10}$"
                              />
                              {submitted && !institute.contactNumber && (
                                <p className="label label-danger text-danger">
                                  Phone number is required.
                                </p>
                              )}
                              {submitted &&
                                institute.contactNumber &&
                                !/^[0-9]{10}$/.test(
                                  institute.contactNumber
                                ) && (
                                  <p className="label label-danger text-danger">
                                    Invalid phone number.
                                  </p>
                                )}
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="form-group">
                              <b>Institute Email</b>
                              <input
                                className="form-control"
                                type="email"
                                name="email"
                                value={institute.email}
                                onChange={(e) => {
                                  setInstitute({
                                    ...institute,
                                    email: e.target.value,
                                  });
                                }}
                                placeholder="a valid email"
                                pattern='^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
                              />
                              {submitted && !institute.email && (
                                <p className="label label-danger text-danger">
                                  Email is required.
                                </p>
                              )}
                              {submitted &&
                                institute.email &&
                                !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                                  institute.email
                                ) && (
                                  <p className="label label-danger text-danger">
                                    Invalid email.
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <button
                            className="btn btn-light mr-2"
                            type="button"
                            onClick={() => onMenuChange("subjects")}
                          >
                            Previous
                          </button>
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={
                              !institute.contactNumber || !institute.email
                            }
                            onClick={create}
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center bg-white py-3">
                <figure>
                  <img
                    src="/assets/images/instituteP.png"
                    className="d-block mx-auto"
                    alt="Institute"
                    style={{ height: "350px" }}
                  />
                </figure>
                <p className="admin-head-pro text-center ml-0">
                  Your expertise and knowledge for all
                </p>
                <h6 className="my-2">
                  Setup your virtual center, add classrooms, add/invite
                  students, use our content or create your own.
                </h6>
                <button
                  className="btn btn-primary"
                  onClick={() => setStarted(true)}
                >
                  Start
                </button>
                {started && (
                  <p className="text-center mt-3">
                    Let&apos;s get started with setting up your virtual center!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
