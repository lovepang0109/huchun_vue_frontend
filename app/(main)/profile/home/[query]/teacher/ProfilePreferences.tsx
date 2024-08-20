"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import clientApi from "@/lib/clientApi";
import * as subjectService from "@/services/subjectService";
import * as userService from "@/services/userService";
import alertify, { alert } from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString } from "@/lib/validator";
import { TagsInput } from "react-tag-input-component";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import DropzoneContainer from "@/components/dropzone";
import { sortByName } from "@/lib/helpers";
import { avatar } from "@/lib/pipe";

const ProfilePreferences = () => {
  const { update } = useSession();
  const { push } = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    userService.get().then((res) => {
      setUser(res);
    });
  }, []);

  const updatePreferences = () => {
    const preferences = { ...user.preferences };
    const data = {
      isPublic: user.isPublic,
      preferences: preferences,
    };
    userService.updateMentorPrefernces(user._id, data).then((d) => {
      update().then((res) => {
        alertify.success("Updated Successfully");
        push(`/profile/home/basic`);
      });
    });
  };

  return (
    <>
      <div className="institute-onboarding">
        <div>
          <div className="container6 rounded-boxes bg-white m-0">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">Preferences</h3>
              <p className="section_sub_heading">
                Here you can customise your experience as a mentor or parent
              </p>
            </div>
          </div>

          <div className="instance-set mt-3">
            <div className="container6 rounded-boxes bg-white m-0">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">Publicly Available</h3>
              </div>
              {user && (
                <div className="d-flex align-items-center my-1">
                  <div>
                    <div className="instance-head mt-0">
                      You are available to all students
                    </div>
                  </div>
                  <div className="switch-item ml-auto mt-0">
                    <label className="switch my-0">
                      <input
                        type="checkbox"
                        value="1"
                        checked={user.isPublic}
                        onChange={() =>
                          setUser({ ...user, isPublic: !user.isPublic })
                        }
                      />
                      <span className="slider round translate-middle-y"></span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="instance-set mt-3">
            <div className="container6 rounded-boxes bg-white m-0">
              <div className="section_heading_wrapper">
                <h3 className="section_top_heading">My Students</h3>
              </div>
              {user && (
                <div className="row">
                  <div className="col-lg-12">
                    <div className="d-flex align-items-center my-1">
                      <div>
                        <div className="instance-head mt-0">
                          Adding Students
                        </div>
                        <p>
                          Turning this on will enable you to add students on
                          your own
                        </p>
                      </div>
                      <div className="switch-item ml-auto mt-0">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={user.preferences.addingStudents}
                            onChange={() =>
                              setUser({
                                ...user,
                                preferences: {
                                  ...user.preferences,
                                  addingStudents:
                                    !user.preferences.addingStudents,
                                },
                              })
                            }
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="d-flex align-items-center my-1">
                      <div>
                        <div className="instance-head mt-0">
                          Least Practice Daily
                        </div>
                        <p>
                          Turning on will show you student who had practice
                          least
                        </p>
                      </div>
                      <div className="switch-item ml-auto mt-0">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={user.preferences.leastPracticeDaily}
                            onChange={() =>
                              setUser({
                                ...user,
                                preferences: {
                                  ...user.preferences,
                                  leastPracticeDaily:
                                    !user.preferences.leastPracticeDaily,
                                },
                              })
                            }
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="d-flex align-items-center my-1">
                      <div>
                        <div className="instance-head mt-0">
                          Resumes Requests
                        </div>
                        <p>
                          Turning on will allow student to send you resume to
                          review
                        </p>
                      </div>
                      <div className="switch-item ml-auto mt-0">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={user.preferences.resumesRequests}
                            onChange={() =>
                              setUser({
                                ...user,
                                preferences: {
                                  ...user.preferences,
                                  resumesRequests:
                                    !user.preferences.resumesRequests,
                                },
                              })
                            }
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="d-flex align-items-center my-1">
                      <div>
                        <div className="instance-head mt-0">
                          Mentoring Requests
                        </div>
                        <p>Turning on will allow student to send you request</p>
                      </div>
                      <div className="switch-item ml-auto mt-0">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={user.preferences.mentoringRequests}
                            onChange={() =>
                              setUser({
                                ...user,
                                preferences: {
                                  ...user.preferences,
                                  mentoringRequests:
                                    !user.preferences.mentoringRequests,
                                },
                              })
                            }
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <a className="btn btn-primary" onClick={updatePreferences}>
          Save
        </a>
      </div>
    </>
  );
};
export default ProfilePreferences;
