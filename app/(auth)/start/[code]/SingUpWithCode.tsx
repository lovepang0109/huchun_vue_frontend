"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import clientApi, { uploadFile } from "@/lib/clientApi";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import * as userSvc from "@/services/userService";
import * as testSvc from "@/services/practiceService";
import * as authSvc from "@/services/auth";
import Link from "next/link";
import * as alertify from "alertifyjs";
import { FormDataType, TargetType } from "../../signup/SignupTypes";
import Svg from "@/components/svg";
import { confirm, alert } from "@/lib/asyncAlertify";
import { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import moment from "moment";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

export default function SingUpWithCode() {
  const [getClientData, setClientData]: any = useState(null);
  // const [errors, setErrors]: any = useState([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [tc, setTc] = useState<boolean>(true);
  const [role, setRole] = useState<string>("student");
  const [clientId, setClientId] = useState<any>("");
  const { code } = useParams();
  const [content, setContent]: any = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const queryParams = useSearchParams();
  const token = useSession()?.data?.accessToken;
  const { update } = useSession();
  const years: number[] = [];
  const months = moment.monthsShort();
  const [days, setDays] = useState<number[]>([]);

  const [isFormActive, setIsFormActive] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataType>({
    role: "student",
    day: "Day",
    month: "Month",
    year: "Year",
  });
  const { push } = useRouter();

  const [signupErrors, setSignupErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  // const checkLoginStatus = () => {
  //   if (token) {
  //     const isExpired = isTokenExpired(token);
  //     setIsLoggedIn(!isExpired);
  //     return isExpired
  //   } else {
  //     setIsLoggedIn(false);
  //     return false
  //   }
  // };

  // const isTokenExpired = (token) => {
  //   try {
  //     const decodedToken = jwt_decode(token);
  //     const currentTime = Date.now() / 1000;
  //     return decodedToken.exp < currentTime;
  //   } catch (error) {
  //     console.error('Invalid token:', error);
  //     return true;
  //   }
  // };

  useEffect(() => {
    if (queryParams.get("clientId")) {
      setClientId(queryParams.get("clientId"));
    }
    testSvc.getTestByTestCode(code).then((ct) => {
      setContent(ct);
      console.log(ct, "content");
      // const isLogedin = checkLoginStatus();
      clientApi.get(`/api/settings`).then((res) => {
        setClientData(res.data);
        if (token) {
          if (ct.type == "practice") {
            if (code.length > 6) {
              const params = {
                seqCode: code,
                programs: ct.programs.map((d) => d._id).join(","),
                subjects: ct.subjects.map((d) => d._id).join(","),
                testId: ct._id,
              };

              authSvc
                .addUserInClassroom(params)
                .then((data) => {
                  update(() => {
                    startTest();
                  });
                })
                .catch((res) => {
                  if (res.response.data?.err) {
                    alertify.alert("Message", res.response.data?.err);
                  } else {
                    alertify.alert("Message", "Failed to add you to classroom");
                  }
                  push("/not-found");
                });
            } else {
              testSvc.enrollTest(ct._id).then((data) => {
                update(() => {
                  startTest();
                });
              });
            }
          } else if (ct.type == "course") {
            if (code.length > 6) {
              const params = {
                seqCode: code,
                programs: ct.programs.map((d) => d._id).join(","),
                subjects: ct.subjects.map((d) => d._id).join(","),
                testId: ct._id,
              };
              authSvc
                .addUserInClassroom(params)
                .then((data) => {
                  update(() => {
                    openCourseDetails();
                  });
                })
                .catch((res) => {
                  if (res.error?.err) {
                    alertify.alert("Message", res.error.err);
                  } else {
                    alertify.alert("Message", "Failed to add you to classroom");
                  }
                  push("/not-found");
                });
            } else {
              userSvc
                .addSubjects(ct.subjects.map((d) => d._id))
                .then((data) => {
                  update(() => {
                    openCourseDetails();
                  });
                });
            }
          } else if (ct.type == "testseries") {
            if (code.length > 6) {
              const params = {
                seqCode: code,
                programs: ct.programs.map((d) => d._id).join(","),
                subjects: ct.subjects.map((d) => d._id).join(","),
                testId: ct._id,
              };
              authSvc
                .addUserInClassroom(params)
                .then((data) => {
                  update(() => {
                    openTestSeriesDetails();
                  });
                })
                .catch((res) => {
                  if (res.error?.err) {
                    alertify.alert("Message", res.error.err);
                  } else {
                    alertify.alert("Message", "Failed to add you to classroom");
                  }
                  push("/not-found");
                });
            } else {
              userSvc
                .addSubjects(ct.subjects.map((d) => d._id))
                .then((data) => {
                  update(() => {
                    openTestSeriesDetails();
                  });
                });
            }
          }
        } else {
          localStorage.setItem("requestedPath", "/start/" + code);
          if (!res.data.signupType.local) {
            push("/");
          } else {
            setInitialized(true);
          }
        }
      });
    });
  }, []);

  const startTest = () => {
    if (content.accessMode === "buy") {
      push(`/assessment/${content.slugfly}?id=${content._id}`);
    } else if (content.isProctored) {
      push(`/assessment/instruction-camera/${content._id}`);
    } else {
      push(`/assessment/instruction/${content._id}`);
    }
  };

  const openCourseDetails = () => {
    push(`/course/details/${content._id}`);
  };

  const openTestSeriesDetails = () => {
    push(`/testSeries/details/${content._id}`);
  };

  const year = moment().year();
  for (let i = 13; i < 100; i++) {
    years.push(year - i);
  }

  const onMonthChanged = (m) => {
    const currentYear = new Date().getFullYear();
    const days = moment(
      new Date(
        formData.year == "Year" ? currentYear : Number(formData.year),
        months.indexOf(m),
        1
      )
    ).daysInMonth();

    const tmp = [];
    for (let i = 1; i <= days; i++) {
      tmp.push(i);
    }
    setDays(tmp);

    if (Number(formData.day) > days) {
      handleChange({ target: { name: "day", value: "Day" } });
    }
  };

  const handleChange = (e: TargetType) => {
    let { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name == "month") {
      onMonthChanged(value);
    }
  };

  const handleSignUpwithEmail = () => {
    if (formData.role == "student") {
      if (
        formData.month != "Month" &&
        formData.day != "Day" &&
        formData.year != "Year"
      ) {
        setIsFormActive(true);
      } else {
        alert("Message", "Please enter correct date of birth");
      }
    } else {
      setIsFormActive(true);
    }
  };

  async function onSubmit(data) {
    let isOk = true;
    if (formData.role != "student") {
      isOk = await confirm(
        "Are you sure you want to signup as <b>" + formData.role + "</b>?"
      );
    }

    if (isOk) {
      try {
        const user: any = {
          role: formData.role,
          name: data.name,
          userId: data.username,
          password: data.password,
        };

        if (user.role == "student") {
          user.birthdate = new Date(
            Date.UTC(
              Number(formData.year),
              months.indexOf(formData.month || ""),
              Number(formData.day)
            )
          );
        }

        clientApi.post("/api/user", user).then((msg) => {
          setSubmitted(false);
          signIn("credentials", {
            username: data.username,
            password: data.password,
            redirect: false,
          }).then((user) => {
            update().then((currentUser) => {
              if (content.type == "practice") {
                startTest();
              } else if (content.type == "course") {
                openCourseDetails();
              } else if (content.type == "testseries") {
                openTestSeriesDetails();
              }
            });
          });
        });
      } catch (ex: AxiosError) {
        if (ex.response.data) {
          setSignupErrors(ex.response.data.map((i) => i.msg));
        } else {
          alert("Message", "Fail to sign up!");
        }
      }
    }
  }

  return (
    <div className="signup-area-1 bg-white h-100">
      {isFormActive ? (
        <>
          <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
            <div className="heading mx-auto">
              <h4 className="text-center">
                Join {getClientData?.productName || "Perfectice"} as a{" "}
                {formData.role}
              </h4>
            </div>

            <div>
              {signupErrors.map((e, idx) => (
                <p key={idx} className="label label-danger text-danger">
                  {" "}
                  {e}
                </p>
              ))}
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control border"
                placeholder="Name"
                {...register("name", {
                  required: true,
                  minLength: 3,
                  maxLength: 50,
                  pattern: /^[a-zA-Z'& ]*$/,
                })}
              ></input>

              {errors.name && (
                <div>
                  {errors.name.type == "pattern" && (
                    <p className="label label-danger text-danger">
                      Name contains invalid characters.
                    </p>
                  )}
                  {errors.name.type == "required" && (
                    <p className="label label-danger text-danger">
                      Name is required
                    </p>
                  )}
                  {errors.name.type == "minLength" && (
                    <p className="label label-danger text-danger">
                      Name must be greater than 3 characters.
                    </p>
                  )}
                  {errors.name.type == "maxLength" && (
                    <p className="label label-danger text-danger">
                      Name must be smaller than 50 characters.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Email or Phone Number</label>
              <input
                className="form-control border"
                placeholder="Email or Phone Number"
                maxLength={50}
                {...register("username", {
                  required: true,
                  maxLength: 50,
                  pattern:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/,
                })}
              ></input>

              <div>
                <p className="label label-danger text-danger">
                  {errors.username &&
                    errors.username.type == "required" &&
                    "Email or phone number is required"}
                  {errors.username &&
                    errors.username.type == "pattern" &&
                    "Invalid email or phone number entered"}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="position-relative">
                <input
                  placeholder="Password"
                  className="form-control pr-5 border"
                  type={showPass ? "text" : "password"}
                  maxLength={20}
                  minLength={8}
                  {...register("password", {
                    required: true,
                    maxLength: 20,
                    minLength: 8,
                    pattern:
                      /(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/,
                  })}
                ></input>
                <a onClick={() => setShowPass(!showPass)} className="show-pass">
                  {showPass ? (
                    <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash}></FontAwesomeIcon>
                  )}
                </a>
              </div>
              <div>
                <p className="label label-danger text-danger">
                  {errors.password &&
                    errors.password.type == "required" &&
                    "Password is required"}
                  {errors.password &&
                    errors.password.type != "required" &&
                    "Password must be 8 - 20 characters with at least one number and one alphabet"}
                </p>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Continue
            </button>
          </form>

          <div className="text-center mt-2">
            <Link
              href={`/?conentId=${content?._id}`}
              style={{ color: "#004FA3" }}
            >
              Already have an account?
            </Link>
          </div>
        </>
      ) : (
        <>
          <p>Join as a</p>
          <div className="add-view-window bg-white">
            <section className="analytics p-0">
              <div className="container p-0">
                <div className="analytics-area arc mx-auto mb-0">
                  <ul
                    className="nav nav-pills nav-justified ml-0"
                    id="analytics-tab"
                    role="tablist"
                  >
                    {getClientData?.roles.student && (
                      <li
                        className="nav-item"
                        role="tab"
                        id="pills-student-tab-student"
                        aria-controls="pills-student"
                        aria-selected="true"
                      >
                        <a
                          className="nav-link active"
                          data-toggle="pill"
                          href="#pills-student"
                          onClick={() => {
                            handleChange({
                              target: { name: "role", value: "student" },
                            });
                          }}
                        >
                          Student
                        </a>
                      </li>
                    )}
                    {getClientData?.roles.teacher && (
                      <li
                        className="nav-item"
                        role="tab"
                        id="pills-teacher-tab-teacher"
                        aria-controls="pills-teacher"
                        aria-selected="true"
                      >
                        <a
                          className="nav-link"
                          data-toggle="pill"
                          href="#pills-teacher"
                          onClick={() => {
                            handleChange({
                              target: { name: "role", value: "teacher" },
                            });
                          }}
                        >
                          Teacher
                        </a>
                      </li>
                    )}

                    {getClientData?.roles.mentor && (
                      <li
                        className="nav-item"
                        role="tab"
                        id="pills-mentor-tab-mentor"
                        aria-controls="pills-mentor"
                        aria-selected="true"
                      >
                        <a
                          className="nav-link"
                          data-toggle="pill"
                          href="#pills-mentor"
                          onClick={() => {
                            handleChange({
                              target: { name: "role", value: "mentor" },
                            });
                          }}
                        >
                          Parent/Mentor
                        </a>
                      </li>
                    )}
                  </ul>

                  <div className="tab-content" id="pills-tabContent">
                    <div
                      className="tab-pane fade show active"
                      id="pills-student"
                      role="tabpanel"
                      aria-labelledby="pills-student-tab"
                    >
                      <p>Date of birth</p>

                      <div className="filter-area clearfix mb-0">
                        <div className="filter-item">
                          <div className="dropdown dob-dropdown">
                            <a
                              className="btn dropdown-toggle text-left"
                              role="button"
                              id="filterLavel_month_label"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <span>{formData.month}</span>
                            </a>

                            <div
                              className="dropdown-menu border-0 py-0 "
                              aria-labelledby="filterLavel"
                            >
                              {months.map((m) => (
                                <a
                                  key={m}
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleChange({
                                      target: { name: "month", value: m },
                                    });
                                  }}
                                >
                                  {m}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="filter-item">
                          <div className="dropdown dob-dropdown">
                            <a
                              className="btn dropdown-toggle text-left"
                              role="button"
                              id="filterLavel_day_label"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <span>{formData.day}</span>
                            </a>

                            <div
                              className="dropdown-menu border-0 py-0 "
                              aria-labelledby="filterLavel"
                            >
                              {days.map((d) => (
                                <a
                                  key={d}
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleChange({
                                      target: {
                                        name: "day",
                                        value: d.toString(),
                                      },
                                    });
                                  }}
                                >
                                  {d}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="filter-item">
                          <div className="dropdown dob-dropdown">
                            <a
                              className="btn dropdown-toggle text-left"
                              role="button"
                              id="filterLavel_year_label"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <span>{formData.year}</span>
                            </a>

                            <div
                              className="dropdown-menu border-0 py-0 "
                              aria-labelledby="filterLavel"
                            >
                              {years.map((y) => (
                                <a
                                  key={y}
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleChange({
                                      target: {
                                        name: "year",
                                        value: y.toString(),
                                      },
                                    });
                                  }}
                                >
                                  {y}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {getClientData?.signupType.google && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={() =>
                            signIn("google", undefined, { role: "student" })
                          }
                        >
                          <div className="position-relative">
                            <div className="text-center ml-4">
                              Continue with Google
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.GoogleIcon />
                            </div>
                          </div>
                        </button>
                      )}

                      {getClientData?.signupType.facebook && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={() =>
                            signIn("facebook", undefined, { role: "student" })
                          }
                        >
                          <div className="position-relative">
                            <div className="text-center ml-4">
                              Continue with Facebook
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.FacebookIcon />
                            </div>
                          </div>
                        </button>
                      )}

                      {getClientData?.signupType.local && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={handleSignUpwithEmail}
                        >
                          <div className="position-relative">
                            <div className="text-center ml-5">
                              Sign up with Email or Phone Number
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.EmailIcon />
                            </div>
                          </div>
                        </button>
                      )}
                    </div>

                    <div
                      className="tab-pane fade"
                      id="pills-teacher"
                      role="tabpanel"
                      aria-labelledby="pills-teacher-tab"
                    >
                      {getClientData?.signupType.google && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={() =>
                            signIn("google", undefined, { role: "teacher" })
                          }
                        >
                          <div className="position-relative">
                            <div className="text-center ml-4">
                              Continue with Google
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.GoogleIcon />
                            </div>
                          </div>
                        </button>
                      )}

                      {getClientData?.signupType.facebook && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={() =>
                            signIn("facebook", undefined, { role: "teacher" })
                          }
                        >
                          <div className="position-relative">
                            <div className="text-center ml-4">
                              Continue with Facebook
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.FacebookIcon />
                            </div>
                          </div>
                        </button>
                      )}

                      {getClientData?.signupType.local && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={handleSignUpwithEmail}
                        >
                          <div className="position-relative">
                            <div className="text-center ml-5">
                              Sign up with Email or Phone Number
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.EmailIcon />
                            </div>
                          </div>
                        </button>
                      )}
                    </div>

                    <div
                      className="tab-pane fade"
                      id="pills-mentor"
                      role="tabpanel"
                      aria-labelledby="pills-mentor-tab"
                    >
                      {getClientData?.signupType.google && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={() =>
                            signIn("google", undefined, { role: "mentor" })
                          }
                        >
                          <div className="position-relative">
                            <div className="text-center ml-4">
                              Continue with Google
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.GoogleIcon />
                            </div>
                          </div>
                        </button>
                      )}

                      {getClientData?.signupType.facebook && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={() =>
                            signIn("facebook", undefined, { role: "mentor" })
                          }
                        >
                          <div className="position-relative">
                            <div className="text-center ml-4">
                              Continue with Facebook
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.FacebookIcon />
                            </div>
                          </div>
                        </button>
                      )}

                      {getClientData?.signupType.local && (
                        <button
                          className="btn btn-light border bg-white btn-block mt-3"
                          onClick={handleSignUpwithEmail}
                        >
                          <div className="position-relative">
                            <div className="text-center ml-5">
                              Sign up with Email or Phone Number
                            </div>
                            <div
                              className="position-absolute"
                              style={{ top: "0px", left: "10px" }}
                            >
                              <Svg.EmailIcon />
                            </div>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="text-center mt-2">
                      <Link
                        href={`/?conentId=${content?._id}`}
                        style={{ color: "#004FA3" }}
                      >
                        Already have an account?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
