"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Svg from "@/components/svg";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import { useSession } from "next-auth/react";
import * as authService from "@/services/auth";

export default function SigninForm({ settings }) {
  const [showPass, setShowPass] = useState(false);
  const userInfo: any = useSession()?.data?.user?.info || {};
  const [loginError, setLoginError] = useState("");
  const { push } = useRouter();
  const queryParams = useSearchParams();
  const [classCode, setClassCode] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setClassCode(queryParams.get("code"));

    if (userInfo.primaryInstitute?.preferences.homePage)
      if (userInfo.primaryInstitute.preferences.homePage === "dashboard") {
        if (queryParams.get("contnetId")) {
          push(`/assessment/instruction/${queryParams.get("conentId")}`);
        } else {
          push("/home");
        }
      } else {
        if (queryParams.get("conentId")) {
          push(`/assessment/instruction/${queryParams.get("conentId")}`);
        } else {
          push(`/${userInfo.primaryInstitute.preferences.homePage}/home`);
        }
      }
  }, [userInfo]);

  const onSubmit = async (data) => {
    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setLoginError(result.error);
    } else {
      console.log(userInfo, "userInfo");
    }
  };

  return (
    <main className="institute-signup my-gap-common">
      <div className="container">
        <div className="mx-auto">
          <div className="container7 ml-0">
            <div className="row no-gutters">
              <div className="col-lg-6 pr-lg-0">
                <div className="signup-area h-100" style={{ padding: "15px" }}>
                  <h2
                    style={{
                      fontSize: "26px",
                      lineHeight: "16px",
                      paddingTop: "10px",
                    }}
                  >
                    Welcome,
                  </h2>
                  <h3 style={{ marginBottom: "3px" }}>
                    Good to see you again!
                  </h3>
                  <p>
                    By logging into {settings.productName}, you agree to our{" "}
                    <Link href="/terms" className="text-white">
                      Terms of use and Privacy Policy.
                    </Link>
                  </p>

                  <Svg.SignInWelcome />
                </div>
              </div>
              <div className="col-lg-6 pr-lg-0">
                <div className="signup-area-1 bg-white h-lg-100">
                  {settings.signupType.google && (
                    <button
                      className="btn btn-light border bg-white btn-block mb-3"
                      onClick={() => signIn("google")}
                    >
                      <div className="position-relative">
                        <div className="text-center">Continue with Google</div>
                        <div
                          className="position-absolute"
                          style={{ top: "0px", left: "10px" }}
                        >
                          <Svg.GoogleIcon />
                        </div>
                      </div>
                    </button>
                  )}

                  {settings.signupType.facebook && (
                    <button
                      className="btn btn-light border bg-white btn-block mb-3"
                      onClick={() => signIn("facebook")}
                    >
                      <div className="position-relative">
                        <div className="text-center">
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
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {loginError && (
                      <p className="label label-danger text-danger">
                        {loginError}
                      </p>
                    )}
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

                    <div className="form-group mb-0">
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
                          })}
                        ></input>
                        <a
                          onClick={() => setShowPass(!showPass)}
                          className="show-pass"
                        >
                          {showPass ? (
                            <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
                          ) : (
                            <FontAwesomeIcon
                              icon={faEyeSlash}
                            ></FontAwesomeIcon>
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
                            "Password must be 8-20 characters"}
                        </p>
                      </div>
                    </div>

                    <div className="forgot-pass">
                      <Link href="/forget-password">Forgot password?</Link>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block bold"
                    >
                      Login
                    </button>

                    {settings.signupType.local && (
                      <div className="text-center mt-2 create-account">
                        <Link href="/signup">Create an account</Link>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
