"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import clientApi from "@/lib/clientApi";
import alertify, { alert } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import { TagsInput } from "react-tag-input-component";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import DropzoneContainer from "@/components/dropzone";

const ChangePassword = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  const [getClientData, setClientData] = useState();
  const [submittedPassword, setSubmittedPassword] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [infoPassword, setInfoPassword]: any = useState({});
  const [errors, setErrors]: any = useState({});
  const [showPass, setShowPass]: any = useState({
    oldPass: false,
    newPass: false,
    confirmPass: false,
  });

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  const changePassword = async (e: any) => {
    e.preventDefault();
    setSubmittedPassword(true);
    if (infoPassword?.newPassword === infoPassword?.rePassword) {
      try {
        await clientApi.put(`/api/users/${user._id}/password`, {
          newPassword: infoPassword.newPassword,
          oldPassword: infoPassword.password,
        });
        await update();
        setSubmittedPassword(false);
        alert("Message", "Password successfully changed.");
        setWrongPassword(false);
      } catch (e) {
        console.log(e);
        setSubmittedPassword(false);
        setErrors({ password: "Existing Password is incorrect" });
        setWrongPassword(true);
      }
    }
  };
  const showHidePass = (id: any) => {
    setShowPass((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  useEffect(() => {
    getClientDataFunc();
  }, []);

  return (
    <div className="institute-onboarding Stu_profile">
      <div>
        <div className="rounded-boxes bg-white m-0">
          <div className="section_heading_wrapper">
            <h3 className="section_top_heading">Change Password</h3>
          </div>
          <div className="row mt-3">
            <div className="col-lg-6">
              <div className="login-area">
                <form
                  name="pChange"
                  className="bg-white ml-0"
                  onSubmit={changePassword}
                >
                  <div className="">
                    {wrongPassword && errors?.password && (
                      <p className="label label-danger text-danger mb-2">
                        {errors?.password}
                      </p>
                    )}
                  </div>
                  <div className="form-group position-relative">
                    <label>Old Password</label>
                    <input
                      className="form-control"
                      required
                      minLength={8}
                      maxLength={12}
                      name="password"
                      id="oldPass"
                      placeholder="Old Password"
                      defaultValue={infoPassword.password}
                      value={infoPassword.password}
                      onChange={(e) =>
                        setInfoPassword((old: any) => {
                          return {
                            ...infoPassword,
                            password: e.target.value,
                          };
                        })
                      }
                      type={showPass.oldPass ? "text" : "password"}
                      pattern="(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*"
                    />
                    <a
                      className="show-pass mt-4 pt-1"
                      onClick={() => showHidePass("oldPass")}
                    >
                      {showPass.oldPass ? (
                        <FontAwesomeIcon icon={faEye} />
                      ) : (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      )}
                    </a>
                    {/* {
                                  (password.invalid && (password.dirty || password.touched || submittedPassword)) &&
                                  <div>
                                      <p *ngIf="password.errors.required" className="label label-danger text-danger">Password is required</p>
                                      <p className="label label-danger text-danger" *ngIf="password.errors.pattern && (password.invalid && (password.dirty || password.touched || submittedPassword))">
                                          Old Password must be 8-16 characters with at least one number and one alphabet.
                                      </p>
                                      <p className="label-danger label text-danger" *ngIf="wrongPassword && submittedPassword && (password.invalid && (password.dirty || password.touched || submittedPassword))">
                                          {{errors?.password}}
                                      </p>
                                  </div>
                                } */}
                  </div>
                  <div className="form-group position-relative">
                    <label>New Password</label>
                    <input
                      className="form-control"
                      required
                      minLength={8}
                      maxLength={12}
                      id="newPass"
                      name="newPassword"
                      placeholder="Password"
                      type={showPass.newPass ? "text" : "password"}
                      defaultValue={infoPassword.newPassword}
                      pattern="(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*"
                    />
                    <a
                      className="show-pass mt-4 pt-1"
                      onClick={() => showHidePass("newPass")}
                    >
                      {showPass.newPass ? (
                        <FontAwesomeIcon icon={faEye} />
                      ) : (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      )}
                    </a>
                    {/* {
                                  newPassword.invalid && (newPassword.dirty || newPassword.touched || submittedPassword) &&
                                  <div>
                                    <p className="label label-danger text-danger" *ngIf="newPassword.errors.required">
                                    New password is required.
                                    </p>
                                    <p className="label label-danger text-danger" *ngIf="newPassword.errors.pattern">
                                        New Password must be 8-12 characters with at least one number and one alphabet.
                                    </p>
                                    <p className="label label-danger text-danger" *ngIf="newPassword.errors.maxlength">
                                        New Password must be 8-12 characters with at least one number and one alphabet.
                                    </p>
                                  </div>
                                } */}
                    {infoPassword.password &&
                      infoPassword.newPassword &&
                      infoPassword.password == infoPassword.newPassword && (
                        <p className="label label-danger text-danger">
                          New password must be different than old password.
                        </p>
                      )}
                  </div>
                  <div className="form-group position-relative">
                    <label>Confirm Password</label>
                    <input
                      className="form-control"
                      required
                      minLength={8}
                      maxLength={12}
                      id="confirmPass"
                      name="rePassword"
                      placeholder="Confirm Password"
                      type={showPass.confirmPass ? "text" : "password"}
                      defaultValue={infoPassword.rePassword}
                      pattern="(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*"
                    />
                    <a
                      className="show-pass mt-4 pt-1"
                      onClick={() => showHidePass("confirmPass")}
                    >
                      {showPass.confirmPass ? (
                        <FontAwesomeIcon icon={faEye} />
                      ) : (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      )}
                    </a>
                    {/* {
                                  rePassword.invalid && (rePassword.dirty || rePassword.touched || submittedPassword) &&
                                  <div>
                                    <p className="label label-danger text-danger" *ngIf="rePassword.errors.required">
                                        Confirm password is required.
                                    </p>
                                </div>
                                } */}
                    {infoPassword.newPassword &&
                      infoPassword.rePassword &&
                      infoPassword.newPassword != infoPassword.rePassword && (
                        <p className="label label-danger text-danger">
                          Confirm password does not match.
                        </p>
                      )}
                  </div>
                  <button
                    type="submit"
                    className="btn text-white change-pass py-0 ml-auto"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <figure className="pro-basic-img-1-remove mt-2">
                <img
                  src="/assets/images/profile-pass.png"
                  alt=""
                  className="d-block mx-auto max-height-250px"
                />
              </figure>
              <p className="admin-head-pro text-center ml-0">
                Passwords are meant to be updated :)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChangePassword;
