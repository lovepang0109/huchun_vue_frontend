"use client";

import React, { useEffect, useState } from "react";

// import { error, success } from "@/lib/asyncAlertify"
import { useRouter } from "next/navigation";
import clientApi from "@/lib/clientApi";
import { success, alert } from "alertifyjs";
import { useSession } from "next-auth/react";
import Modal from "react-bootstrap/Modal";
//@ts-ignore
import $ from "jquery";

export function StudentOnboarding() {
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [programs, setPrograms] = useState([]);
  const [instituteCode, setInstituteCode] = useState("");
  const [show, setShow] = useState(true);
  const [err, setError] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [instituteId, setInstituteId] = useState("");
  const { push } = useRouter();
  const { user }: any = useSession()?.data || {};
  const { update } = useSession();

  const countries = [
    { name: "USA", code: "US" },
    { name: "India", code: "IN" },
  ];

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(event.target.value);
  };

  const [step, setStep] = useState(0);

  const nextStep = () => {
    setStep(step + 1);
  };

  const goToSubjectStep = async () => {
    await clientApi.post(`/api/setDefaultInstitute`);

    const res = (await clientApi.get(`/api/program?country=${selectedCountry}`))
      .data;
    if (!res) {
      setPrograms([]);
    } else {
      setPrograms(res);
    }
    setStep(step + 1);
  };

  const joinInstitute = async () => {
    if (!instituteCode) {
      // error("");
      setError("Invalid institute code");
      return;
    }
    try {
      const code = (
        await clientApi.post(`/api/institute/join`, { code: instituteCode })
      ).data;
      setInstituteId(code.institute);
    } catch (e) {
      // error("Institute code wrong!");
      setError("Institute code wrong!");
      return;
    }
    setError("");

    const res = (await clientApi.get(`/api/program?country=${selectedCountry}`))
      .data;
    setPrograms(res);
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const submitHandler = async (e: any) => {
    // set("notifier", "position", "top-right");
    e.preventDefault();
    const data = new FormData(e.target);
    const value = Object.fromEntries(data.entries());
    let result: any = [];
    Object.keys(value).forEach((key) => {
      result.push(key);
    });
    // if (result.length === 0) {
    //   alert("Message","Please select subject to continue.").setHeader(
    //     "<em> Warning! </em> "
    //   );
    //   // error("Please select subject to continue");
    //   return;
    // }
    if (result.length === 0) {
      console.log("non selected subject");
      await update();
      push("/home");
      return;
    }
    const formData = {
      country: selectedCountry,
      subjects: result,
    };
    const res = await clientApi.put(`/api/updateSubjects`, formData);
    //@ts-ignore
    if (res.data === "ok") {
      success("Welcome! Your request has succeed.");
      await update();
      push("/home");

      // location.href = "/home";
    }
  };

  const start = () => {
    //@ts-ignore
    ($("#welcomeModal") as any).modal("hide");
  };

  useEffect(() => {
    //@ts-ignore
    // ($("#welcomeModal") as any).modal("hide");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position, "pos>>>");
        // setLocation({
        //   latitude: position.coords.latitude,
        //   longitude: position.coords.longitude
        // });
      });
    }
  }, []);

  return (
    <>
      <main className="mentor-homepage pt-lg-3">
        <Modal show={show} onHide={handleClose} backdrop="static">
          <Modal.Body>
            <div className="row no-gutters">
              <div className="col-lg-6 welcome-left">
                <figure>
                  <img src="/assets/images/i-welcome.png" alt="" />
                </figure>
              </div>
              <div className="col-lg-6 p-5">
                <h4 className="admin-user-head1">
                  <strong style={{ fontSize: 23 }}>Welcome {user?.name}</strong>
                </h4>
                <p style={{ fontSize: 20, marginTop: 10 }}>
                  Use platform to practice course, test series and assessment{" "}
                </p>

                <div className="mt-3">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleClose}
                  >
                    Let’s get started
                  </button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        {/* Country */}
        {step === 0 && (
          <div className="institute-onboarding-country">
            <div className="container">
              <ul
                id="mm-stepper"
                className="stepper nav nav-pills nav-justified text-center"
              >
                <li className="nav-item active text-dark">Country</li>
                <li className="nav-item">Institute</li>
                <li className="nav-item">Subjects</li>
              </ul>

              <div className="container6 rounded-boxes bg-white m-0 text-center">
                <img
                  src="/assets/images/country.png"
                  width={300}
                  alt="country_photo"
                  className="mx-auto"
                />
                <span className="h6 text-dark">Please select your country</span>
                <div className="d-inline-block ml-3">
                  <select
                    className="form-control border-top-0 border-left-0 border-right-0"
                    name="userCountry"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    style={{ width: "60%" }}
                  >
                    <option value={""} disabled>
                      Select Country
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4">
                  <button className="btn btn-primary" onClick={nextStep}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Institute */}
        {step === 1 && (
          <div className="institute-onboarding-institute">
            <div className="container">
              <ul
                id="mm-stepper"
                className="stepper nav nav-pills nav-justified text-center"
              >
                <li className="nav-item active">Country</li>
                <li className="nav-item active text-dark">Institute</li>
                <li className="nav-item">Subjects</li>
              </ul>

              <div className="container6 rounded-boxes bg-white m-0 text-center">
                <img
                  src="/assets/images/institute.png"
                  width={300}
                  alt="institute_photo"
                  className="mx-auto"
                />
                <div className="h6 text-dark">
                  Please enter your institute code
                </div>
                <div>
                  <em>
                    *If you don&apos;t know your institute, you can skip and add
                    later.
                  </em>
                </div>
                <div
                  style={{ width: "350px" }}
                  className="d-inline-block text-left"
                >
                  <input
                    className="form-control border-bottom border-left-0 border-right-0 border-top-0"
                    maxLength={60}
                    placeholder="Institute code"
                    name="txtCenterCode"
                    value={instituteCode}
                    onChange={(e) => setInstituteCode(e.target.value)}
                  />
                  <em className="text-danger">{err}</em>
                </div>
                <div className="text-center mt-2">
                  <button
                    className="btn btn-light mr-2 btn-spacer"
                    onClick={prevStep}
                  >
                    Go Back
                  </button>
                  <button
                    className="btn btn-primary mr-2 btn-spacer"
                    onClick={joinInstitute}
                  >
                    Next
                  </button>
                  <button
                    className="btn btn-primary btn-spacer"
                    onClick={goToSubjectStep}
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subjects */}
        {step === 2 && (
          <div className="institute-onboarding-subject">
            <div className="container">
              <ul
                id="mm-stepper"
                className="stepper nav nav-pills nav-justified text-center"
              >
                <li className="nav-item active">Country</li>
                <li className="nav-item active">Institute</li>
                <li className="nav-item active">Subjects</li>
              </ul>

              <div className="container5" style={{ marginLeft: "0px" }}>
                <div className="section_heading_wrapper d-flex justify-content-between">
                  <div>
                    <h3 className="section_top_heading">
                      What Subject you want to learn?
                    </h3>
                    <p className="section_sub_heading">
                      We have wide variety of Subject to learn from. Select the
                      Subject you want to learn
                    </p>
                  </div>
                </div>
                <hr />
                <form onSubmit={submitHandler}>
                  <div className="d-flex flex-row">
                    <div
                      className="container7 rounded-boxes bg-white m-0"
                      style={{ flex: 1 }}
                    >
                      <div className="column-3">
                        {programs.map((program: any, index) => {
                          return (
                            <div
                              className="onboarding-1 break-avoid p-0"
                              key={index}
                            >
                              <div className="card mb-3">
                                <div className="card-header bg-white">
                                  <h3
                                    style={{
                                      fontSize: "16px",
                                      lineHeight: "13px",
                                    }}
                                  >
                                    {program.name}
                                  </h3>
                                </div>
                                <div className="card-body test-graph-area-1">
                                  {program.subjects.map((sub: any) => {
                                    return (
                                      <label
                                        className="container2"
                                        key={sub._id}
                                      >
                                        {sub.name}
                                        <input
                                          type="checkbox"
                                          name={`${sub._id}`}
                                        />
                                        <span className="checkmark_boarding translate-middle-y left-0"></span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="text-primary col-lg-9">
                      <strong>
                        Dont see your program? Just &apos;Continue&apos; and add
                        it later.
                      </strong>
                    </div>
                    <div className="col-auto ml-auto">
                      <button type="submit" className="btn btn-primary">
                        Continue
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
