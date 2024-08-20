"use client"; // This is a client component
import React, { useEffect, useState } from "react";
import countryBanner from "@/assets/images/country.png";
import instituteBanner from "@/assets/images/institute.png";
import { useSession } from "next-auth/react";
import * as userService from "@/services/userService";
import * as programSvc from "@/services/programService";
import * as instituteSvc from "@/services/instituteService";
import * as eventBus from "@/services/eventBusService";
import { fromEvent, Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as alertify from "alertifyjs";
import clientApi from "@/lib/clientApi";
import { useRouter } from "next/navigation";
import Modal from "react-bootstrap/Modal";

export function TeacherOnboarding() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [programs, setPrograms] = useState<any>(null);

  const [cachedPrograms, setCachedPrograms] = useState<any>({});

  const [countries, setCountries] = useState<any>([]);
  const [centerCode, setCenterCode] = useState("");
  const [joining, setJoining] = useState<boolean>(false);
  const [step, setStep] = useState("country");

  const [canSelectCountry, setCanSelectCountry] = useState<boolean>(false);
  const [instituteError, setInstituteError] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const unsubscriber: Subject<void> = new Subject<void>();
  const [show, setShow] = useState(true);
  const { update } = useSession();
  const [user, setUser] = useState<any>(null);
  const { push } = useRouter();

  const getUser = () => {
    userService.get().then((us) => {
      setUser(us);
    });
  };
  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    getClientDataFunc();
    getUser();
    history.pushState(null, "");
    fromEvent(window, "popstate")
      .pipe(takeUntil(unsubscriber))
      .subscribe((_) => {
        history.pushState(null, "");
        alertify.alert(
          "Message",
          `You can't go back at this time, Please fill the required details and move forward.`
        );
      });
    eventBus.emit("hideHeader", true);
  }, []);

  const start = async () => {
    setShow(false);
    const { data } = await clientApi.get(`/api/settings`);

    setSettings(data);

    setCountries(data.countries);
    userService.get().then((us) => {
      setSelectedCountry(us.country ? us.country.code : data.countries[0].code);
    });
    if (data.countries.length > 1) {
      setCanSelectCountry(true);
      setStep("country");
    } else {
      setCanSelectCountry(false);

      showInstitutes();
    }
  };

  const showInstitutes = () => {
    setStep("institute");
    setCurrentStep(1);
  };

  const showSubjects = async (skip: any) => {
    try {
      setInstituteError(false);
      if (skip) {
        await instituteSvc.setDefaultInstitute();
      } else {
        if (!centerCode) {
          setInstituteError(true);
          return;
        }
        setJoining(true);

        try {
          await instituteSvc.joinInstitute(centerCode);
        } catch (err) {
          setInstituteError(true);

          return;
        } finally {
          setJoining(false);
        }
      }
      await update();

      const tmp_cached = cachedPrograms;
      if (!cachedPrograms[selectedCountry]) {
        const p = await programSvc.findAll({ country: selectedCountry });

        tmp_cached[selectedCountry] = p;
        setCachedPrograms(tmp_cached);
      }

      setPrograms(tmp_cached[selectedCountry]);

      setCurrentStep(2);
      setStep("subjects");
    } catch (err) {
      console.log(err);
    }
  };

  const continueFunc = async () => {
    const selectedPrograms = [];
    const selectedSubjects = [];
    for (const p of programs) {
      if (p.selected) {
        selectedPrograms.push(p._id);
        for (const s of p.subjects) {
          selectedSubjects.push(s._id);
        }
      } else {
        for (const s of p.subjects) {
          if (s.selected) {
            selectedSubjects.push(s._id);
          }
        }
      }
    }

    if (selectedSubjects.length) {
      await userService.updateSubjects({
        programs: selectedPrograms,
        subjects: selectedSubjects,
        country: selectedCountry,
      });
      await update();
      userService
        .get()
        .then((us) => {
          setUser(us);
          push(`${getNavPage()}?replaceUrl=${true}`);
        })
        .catch((err) => {
          console.log(err);
          alertify.alert("Message", "Fail to update your subjects!");
        });
    } else {
      push(`${getNavPage()}?replaceUrl=${true}`);
    }
  };

  const setupInstitute = async () => {
    instituteSvc.setDefaultInstitute();

    await userService.updateCountry({ country: selectedCountry });

    await update();
    userService
      .get()
      .then((us) => {
        setUser(us);
        push(`/institute/wizard`);
      })
      .catch((err) => {
        console.log(err);
        alertify.alert("Message", "Fail to update your subjects!");
      });
  };

  const logOut = () => {
    alertify.confirm(
      "Are you sure you want to logout?",
      (ev) => {
        authSvc.logout();
      },
      (close) => {
        console.log("close");
      }
    );
  };

  const getNavPage = () => {
    let navPage = "home";
    let tmp_setting = "";
    if (user.primaryInstitute && user.primaryInstitute.preferences.homePage) {
      tmp_setting = user.primaryInstitute.preferences.homePage;
    } else if (settings && settings.homePage) {
      tmp_setting = settings.homePage;
    }

    if (tmp_setting) {
      if (tmp_setting == "dashboard") {
        navPage = "home";
      } else if (tmp_setting == "assessment") {
        navPage = "assessment/home";
      } else if (tmp_setting == "course") {
        navPage = "course/home";
      } else if (tmp_setting == "testseries") {
        navPage = "testseries/home";
      } else if (
        tmp_setting == "classroom" &&
        user.role != "mentor" &&
        user.role != "publisher"
      ) {
        navPage = "classroom/home";
      }
    }

    if (navPage == "home" && settings && !settings.features.dashboard) {
      navPage = "assessments";
    }

    return "/" + navPage;
  };

  const onProgramSelectionChanged = (pro: any, index: any) => {
    if (pro[index].selected) {
      pro[index].subjects.forEach((sub) => {
        sub.selected = true;
      });
    } else {
      pro[index].subjects.forEach((sub) => {
        sub.selected = false;
      });
    }

    setPrograms(pro);
  };

  const onSubjectSelectionChanged = (pro: any, proId: any, subId: any) => {
    if (pro[proId].subjects[subId].selected) {
      if (!pro[proId].subjects.find((s) => !s.selected)) {
        pro[proId].selected = true;
      }
    } else {
      if (pro[proId].selected) {
        pro[proId].selected = false;
      }
    }
    setPrograms(pro);
  };

  return (
    <>
      <main className="mentor-homepage pt-lg-3">
        <Modal show={show} onHide={() => setShow(false)} backdrop="static">
          <Modal.Body>
            <div className="row no-gutters">
              <div className="col-lg-6 welcome-left">
                <figure>
                  <img src="/assets/images/i-welcome1.png" alt="" />
                </figure>
              </div>
              <div className="col-lg-6 p-5">
                <h4 className="admin-user-head1">
                  <strong style={{ fontSize: 23 }}>
                    Welcome {user?.name} to {settings?.productName}
                  </strong>
                </h4>
                <p style={{ fontSize: 18, marginTop: 10 }}>
                  Your platform to help students realize potential and become
                  successful{" "}
                </p>

                <div className="mt-3">
                  <button className="btn btn-primary btn-block" onClick={start}>
                    Let’s get started
                  </button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <div className="institute-onboarding">
          <div className="container">
            <ul
              id="mm-stepper"
              className="stepper nav nav-pills nav-justified text-center"
            >
              <li className={`nav-item ${currentStep >= 0 ? "active" : ""}`}>
                <strong className={currentStep >= 0 ? "text-dark" : ""}>
                  Country
                </strong>
              </li>
              <li className={`nav-item ${currentStep >= 1 ? "active" : ""}`}>
                <strong className={currentStep >= 1 ? "text-dark" : ""}>
                  Institute
                </strong>
              </li>
              <li className={`nav-item ${currentStep >= 2 ? "active" : ""}`}>
                <strong className={currentStep >= 2 ? "text-dark" : ""}>
                  Programs
                </strong>
              </li>
            </ul>

            {countries && step === "country" && currentStep === 0 && (
              <div className="container6 rounded-boxes bg-white m-0 text-center">
                <img
                  style={{ height: "300px" }}
                  className="mx-auto"
                  src="assets/images/country.png"
                  alt=""
                />
                <span className="h6 text-dark">Please select your country</span>
                <div className="d-inline-block ml-3">
                  <select
                    className="form-control border-top-0 border-left-0 border-right-0"
                    name="userCountry"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <button className="btn btn-primary" onClick={showInstitutes}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === "institute" && (
              <div className="container6 rounded-boxes text-center bg-white m-0">
                <div className="d-flex justify-content-center align-items-center gap-sm my-3">
                  <div>
                    <img
                      style={{ height: "250px" }}
                      className="mx-auto"
                      src="assets/images/instituteTeacher.png"
                      alt=""
                    />
                    <div className="h6 text-dark">
                      Please enter your institute code
                    </div>
                    <div>
                      <em>
                        *Skip if you don&apos;t know or you want to setup your
                        institute later.
                      </em>
                    </div>

                    <div
                      style={{ width: "350px" }}
                      className="d-inline-block text-left"
                    >
                      <input
                        className="form-control border-bottom border-left-0 border-right-0 border-top-0"
                        maxLength={60}
                        placeholder="Institute code from your institute"
                        name="txtCenterCode"
                        value={centerCode}
                        onChange={(e) => setCenterCode(e.target.value)}
                      />
                      {instituteError && (
                        <em className="text-danger">Invalid institute code</em>
                      )}
                    </div>

                    <div className="d-flex justify-content-center gap-xs mt-2">
                      {canSelectCountry && (
                        <button
                          className="btn btn-light"
                          onClick={() => {
                            setStep("country");
                            setCurrentStep(0);
                          }}
                        >
                          Go Back
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        onClick={() => showSubjects(true)}
                      >
                        Skip
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => showSubjects(false)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      borderLeft: "2px solid #212121",
                      margin: "0px 20px",
                      height: "350px",
                    }}
                  >
                    &nbsp;
                  </div>
                  <div>
                    <div className="text-center">
                      <div className="h6 text-dark">
                        Interested in setting up your institute?
                      </div>
                      <div>
                        <em>
                          If you are not part of any institute, you may setup
                          your institute today
                        </em>
                      </div>

                      <button
                        className="btn btn-outline mt-3 px-4"
                        onClick={setupInstitute}
                      >
                        Setup Institute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "subjects" && currentStep === 2 && (
              <div className="container6 rounded-boxes bg-white m-0">
                <div className="section_heading_wrapper d-flex justify-content-between">
                  <div>
                    <h3 className="section_top_heading">
                      What programs you want to teach?
                    </h3>
                    <p className="section_sub_heading">
                      We have wide variety of program to learn from. Select the
                      programs you want to teach.
                    </p>
                  </div>
                </div>
                <hr />
                <div className="column-3">
                  {programs.map((pro, index) => (
                    <div key={index} className="onboarding-1 break-avoid">
                      <div className="card mb-3">
                        <div className="card-header bg-white">
                          <h3>
                            <label className="container2">
                              {pro.name}
                              <input
                                type="checkbox"
                                checked={pro.selected}
                                name="chkSub"
                                onChange={() => {
                                  const newPrograms = [...programs];
                                  newPrograms[index].selected =
                                    !newPrograms[index].selected;
                                  onProgramSelectionChanged(newPrograms, index);
                                }}
                              />
                              <span className="checkmark1 translate-middle-y left-0"></span>
                            </label>
                          </h3>
                        </div>
                        <div className="card-body test-graph-area-1 py-2">
                          {pro.subjects.map((sub, i) => (
                            <label key={sub.i} className="container2">
                              {sub.name}
                              <input
                                type="checkbox"
                                checked={sub.selected}
                                name="chkSub"
                                onChange={(e) => {
                                  const newPrograms = [...programs];
                                  newPrograms[index].subjects[i].selected =
                                    e.target.checked;
                                  onSubjectSelectionChanged(
                                    newPrograms,
                                    index,
                                    i
                                  );
                                }}
                              />
                              <span className="checkmark1 translate-middle-y left-0"></span>
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
                    className="btn btn-primary mr-2"
                    onClick={continueFunc}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
