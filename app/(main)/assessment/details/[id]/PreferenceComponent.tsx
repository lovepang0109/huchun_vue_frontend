import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { alert, success, error, confirm } from "alertifyjs";
import { TagsInput } from "react-tag-input-component";
import Link from "next/link";
import Multiselect from "multiselect-react-dropdown";
import { Modal } from "react-bootstrap";
import { FileDrop } from "react-file-drop";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as questionSvc from "@/services/question-service";
import * as feedbackSvc from "@/services/feedbackService";
import * as testSvc from "@/services/practiceService";

import { Tabs, Tab } from "react-bootstrap";
import MathJax from "@/components/assessment/mathjax";

import CodeRenderer from "@/components/assessment/code-renderer";
import QuestionFeedback from "@/components/assessment/question-feedback";

import {
  replaceQuestionText,
  replaceUserAnswer,
  formatQuestion,
} from "@/lib/pipe";

const PreferenceComponent = ({
  practice,
  setPractice,
  preferences,
  setPreferences,
  user,
  clientData,
  updated,
}: any) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const datePickerRef = useRef(null);
  const enddatePickerRef = useRef(null);

  useEffect(() => {
    if (
      preferences.startDate &&
      new Date(preferences.startDate).getTime() < new Date().getTime()
    ) {
      setMinDate(new Date(preferences.startDate));
    }
  }, []);

  const onSubmit = () => {
    if (preferences.isProctored) {
      if (preferences.startDate) {
        if (
          preferences.expiresOn &&
          preferences.startDate.getTime() > preferences.expiresOn.getTime()
        ) {
          alert(
            "Message",
            "Start date must be before expiration date (if set)."
          );
          return;
        }
      } else {
        alert("Message", "Please set start date for proctored assessment.");
        return;
      }
    }

    if (
      preferences.redirectAfterAttempt &&
      !isValidUrl(preferences.redirectAfterAttempt)
    ) {
      alert("Message", "Please enter valid parent site URL.");
      return;
    }

    setSaving(true);
    testSvc
      .updatePreferences(practice._id, preferences)
      .then((res) => {
        success("Preferences is updated.");
        setPractice({
          ...practice,
          isProctored: preferences.isProctored,
        });

        updated();
        setSaving(false);
      })
      .catch((err) => {
        setSaving(false);
      });
  };

  const isValidUrl = (url: string): boolean => {
    // Check if the provided URL is valid
    // Implement URL validation logic here
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    // Check if the URL matches the pattern
    return urlRegex.test(url);
  };

  const clearExpireDate = () => {
    setPreferences({
      ...preferences,
      expiresOn: null,
    });
  };

  const onViewResultChanged = (isShowAttempt: any) => {
    if (!isShowAttempt) {
      setPreferences({
        ...preferences,
        isShowAttempt: isShowAttempt,
        isShowResult: false,
        isShowConvertedScore: false,
      });
    } else {
      setPreferences({
        ...preferences,
        isShowAttempt: isShowAttempt,
      });
    }
  };

  return preferences ? (
    <div className="OptIOnalQueS">
      <div className="class-board-info optionalCustom-settings2">
        <div className="bg-white rounded-boxes form-boxes text-black">
          <h4 className="form-box_title mb-2">Optional Preferences</h4>
          <div className="row">
            <div className="col-lg-6">
              <div className="profile-info bg-white">
                <div className="assess-set-toggle-box">
                  <div className="my-2">
                    <div className="switch-item d-flex align-items-center float-none">
                      <span className="assess-set-head">
                        Allow students to view result
                      </span>
                      <label
                        className="switch col-auto ml-auto my-0 align-middle"
                        style={{ marginLeft: "18px" }}
                      >
                        <input
                          type="checkbox"
                          name="isShowAttempt"
                          value="1"
                          checked={preferences.isShowAttempt}
                          onChange={(e) =>
                            onViewResultChanged(e.target.checked)
                          }
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                    <p>Let students view result after submitting a test</p>
                  </div>

                  <div
                    className="my-3"
                    style={{
                      display: preferences.isShowAttempt ? "none" : "block",
                    }}
                  >
                    <strong>Redirect students to parent site</strong>
                    <input
                      type="text"
                      name="txtParentSite"
                      placeholder="Parent URL..."
                      value={preferences.redirectAfterAttempt}
                      onChange={(e) => {
                        setPreferences({
                          ...preferences,
                          redirectAfterAttempt: e.target.value,
                        });
                      }}
                      className="form-control border-bottom rounded-0"
                      pattern="[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
                    />
                  </div>

                  <div
                    className="my-2"
                    style={{
                      display: preferences.isShowAttempt ? "block" : "none",
                    }}
                  >
                    <div className="switch-item d-flex align-items-center float-none">
                      <span className="assess-set-head">
                        Allow students to view answer
                      </span>
                      <label
                        className="switch col-auto ml-auto my-0 align-middle"
                        style={{ marginLeft: "18px" }}
                      >
                        <input
                          type="checkbox"
                          name="isShowResult"
                          value="1"
                          checked={preferences.isShowResult}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              isShowResult: e.target.checked,
                            })
                          }
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                    <p>Let students view answer after submitting a test</p>
                  </div>

                  <div
                    className="my-2"
                    style={{
                      display:
                        preferences.isShowResult && practice.fullLength
                          ? "block"
                          : "none",
                    }}
                  >
                    <div className="switch-item d-flex align-items-center float-none">
                      <span className="assess-set-head">
                        Allow students to view converted score
                      </span>
                      <label
                        className="switch col-auto ml-auto my-0 align-middle"
                        style={{ marginLeft: "18px" }}
                      >
                        <input
                          type="checkbox"
                          name="isShowConvertedScore"
                          value="1"
                          checked={preferences.isShowConvertedScore}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              isShowConvertedScore: e.target.checked,
                            })
                          }
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                    <p>
                      Applies only to programs with score conversion e.g.
                      SAT/ACT/PSAT
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="profile-info bg-white">
                <div className="assess-set-toggle-box">
                  <div className="my-2">
                    <div className="switch-item d-flex align-items-center float-none">
                      <span className="assess-set-head">Random questions</span>
                      <label
                        className="switch col-auto ml-auto my-0 align-middle"
                        style={{ marginLeft: "18px" }}
                      >
                        <input
                          type="checkbox"
                          checked={preferences.randomQuestions}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              randomQuestions: e.target.checked,
                            })
                          }
                          disabled={practice.status === "revoked"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                    <p>Questions will appear randomly in a section</p>
                  </div>

                  <div className="my-2">
                    <div className="switch-item d-flex align-items-center float-none">
                      <span className="assess-set-head">
                        Randomise answer options
                      </span>
                      <label
                        className="switch col-auto ml-auto my-0 align-middle"
                        style={{ marginLeft: "18px" }}
                      >
                        <input
                          type="checkbox"
                          checked={preferences.randomizeAnswerOptions}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              randomizeAnswerOptions: e.target.checked,
                            })
                          }
                          disabled={practice.status === "revoked"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                    <p>
                      Answer options show jumbled in a multiple choice questions
                    </p>
                  </div>

                  <div className="my-2">
                    <div className="switch-item d-flex align-items-center float-none">
                      <span className="assess-set-head">
                        Exclude incorrect/missed questions in the targeted
                        Practice
                      </span>
                      <label
                        className="switch col-auto ml-auto my-0 align-middle"
                        style={{ marginLeft: "18px" }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            preferences.excludeParentQuestionsFromTargetedTest
                          }
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              excludeParentQuestionsFromTargetedTest:
                                e.target.checked,
                            })
                          }
                          disabled={practice.status === "revoked"}
                        />
                        <span className="slider round translate-middle-y"></span>
                      </label>
                    </div>
                    <p>
                      Allows to control targeted practice test generation by
                      including or excluding incorrect/missed questions from the
                      parent test
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="row mt-2"
            style={{
              display: practice.testMode !== "learning" ? "block" : "none",
            }}
          >
            <div className="col-lg-6">
              <div>
                {practice.status !== "revoked" ? (
                  <>
                    <h4>Offscreen Limit</h4>
                    <p>
                      Number of times student goes out of full screen mode. Test
                      will get submitted automatically when the limit exceeds
                    </p>
                    <input
                      type="text"
                      name="search"
                      placeholder="Keep it empty for no limits"
                      value={preferences.offscreenLimit}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          offscreenLimit: e.target.value,
                        })
                      }
                      className="form-control border-bottom rounded-0"
                    />
                  </>
                ) : (
                  <>
                    <h4>Offscreen Limit</h4>
                    <p>{preferences.offscreenLimit}</p>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <h4>Attempts allowed per student</h4>
              <p>Set the number of attempts for a student</p>
              <form>
                {practice.status !== "revoked" ? (
                  <input
                    type="number"
                    name="search"
                    placeholder=""
                    value={preferences.attemptAllowed}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        attemptAllowed: e.target.value,
                      })
                    }
                    className="form-control border-bottom rounded-0"
                  />
                ) : (
                  <p>{preferences.attemptAllowed}</p>
                )}
              </form>
            </div>
          </div>
        </div>
        {practice.accessMode === "invitation" &&
          practice.testMode === "practice" &&
          user.primaryInstitute.preferences.assessment.proctor && (
            <div className="bg-white rounded-boxes form-boxes text-black">
              <h4 className="form-box_title mb-2">Proctor Settings</h4>
              <p>
                Watch live test progress of a student including the camera. Set
                start date, start time, expiration date and expiration time on
                top of start time by which a student can start the assessment
              </p>

              <div className="row my-2">
                <div className="col-lg-6">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className=" mr-3">
                      Turn your assessment into proctor mode
                    </span>
                    <div className="align-self-center">
                      <label className="switch col-auto ml-auto my-0 align-middle">
                        <input
                          type="checkbox"
                          checked={preferences.isProctored}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              isProctored: e.target.checked,
                            });
                          }}
                        />
                        <span
                          className="slider round translate-middle-y"
                          style={{ top: 0 }}
                        ></span>
                      </label>
                    </div>
                  </div>
                  <p>
                    Turning this on will make your assessment proctored where
                    you can track your students live
                  </p>
                </div>

                {preferences.isProctored && (
                  <div className="col-lg-6">
                    <div className="d-flex align-items-center justify-content-between">
                      <h4 className="form-box_subtitle">Watch student live</h4>

                      <span className=" form-box_subtitle">
                        Watch student live
                      </span>
                      <div className="align-self-center">
                        <label className="switch col-auto ml-auto my-0 align-middle">
                          <input
                            type="checkbox"
                            checked={preferences.camera}
                            onChange={(e) => {
                              setPreferences({
                                ...preferences,
                                camera: e.target.checked,
                              });
                            }}
                          />
                          <span
                            className="slider round translate-middle-y"
                            style={{ top: 0 }}
                          ></span>
                        </label>
                      </div>
                    </div>
                    <p>
                      Student must start the camera and keep it ON when taking
                      the test
                    </p>
                  </div>
                )}
              </div>

              {preferences.isProctored && (
                <div className="row my-3">
                  <div className="col-lg-6">
                    <div className="row">
                      <div className="col-lg-5">
                        <h4 className="form-box_subtitle">Start Date</h4>
                        <div className="input-group datepicker-box border-bottom rounded-0">
                          <DatePicker
                            selected={preferences.startDate || null}
                            onChange={(date) =>
                              setPreferences((prevPrefs) => ({
                                ...prevPrefs,
                                startDate: date,
                              }))
                            }
                            minDate={minDate}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Start date"
                            className="form-control"
                            readOnly
                            ref={datePickerRef}
                          />
                          <span className="input-group-btn">
                            <button
                              type="button"
                              className="btn btn-date"
                              onClick={() => {
                                if (datePickerRef.current) {
                                  datePickerRef.current.input.focus();
                                }
                              }}
                            >
                              <i className="far fa-calendar-alt"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                      {preferences.startDate && (
                        <div className="col-lg-7">
                          <h4 className="form-box_subtitle">Start Time</h4>
                          <input
                            type="time"
                            style={{ width: "50%" }}
                            value={
                              preferences.startDate instanceof Date
                                ? preferences.startDate
                                    .toTimeString()
                                    .slice(0, 5)
                                : ""
                            }
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const currentTime = new Date();
                              const hours = parseInt(timeValue.split(":")[0]);
                              const minutes = parseInt(timeValue.split(":")[1]);
                              currentTime.setHours(hours, minutes);
                              setPreferences({
                                ...preferences,
                                startDate: currentTime,
                              });
                            }}
                            className="form-control"
                            disabled={practice.status === "revoked"}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="row">
                      <div className="col-lg-5">
                        <h4 className="form-box_subtitle">Expiration Date</h4>
                        <div className="input-group datepicker-box border-bottom rounded-0">
                          <DatePicker
                            selected={preferences.expiresOn || null}
                            onChange={(date) =>
                              setPreferences((prevPrefs) => ({
                                ...prevPrefs,
                                expiresOn: date,
                              }))
                            }
                            minDate={minDate}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Expired date"
                            className="form-control"
                            readOnly
                            ref={enddatePickerRef}
                          />
                          <span className="input-group-btn">
                            <button
                              type="button"
                              className="btn btn-date"
                              onClick={() => {
                                if (enddatePickerRef.current) {
                                  enddatePickerRef.current.input.focus();
                                }
                              }}
                            >
                              <i className="far fa-calendar-alt"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                      {preferences.expiresOn && (
                        <div className="col-lg-7">
                          <h4 className="form-box_subtitle">End Time</h4>
                          <div className="form-row flex-nowrap align-items-center">
                            <div className="col">
                              <input
                                type="time"
                                style={{ width: "50%" }}
                                value={
                                  preferences.expiresOn instanceof Date
                                    ? preferences.expiresOn
                                        .toTimeString()
                                        .slice(0, 5)
                                    : ""
                                }
                                onChange={(e) => {
                                  const timeValue = e.target.value;
                                  const currentTime = new Date();
                                  const hours = parseInt(
                                    timeValue.split(":")[0]
                                  );
                                  const minutes = parseInt(
                                    timeValue.split(":")[1]
                                  );
                                  currentTime.setHours(hours, minutes);
                                  setPreferences({
                                    ...preferences,
                                    expiresOn: currentTime,
                                  });
                                }}
                                className="form-control"
                                disabled={practice.status === "revoked"}
                              />
                            </div>
                            <div className="col-auto ml-auto">
                              <span
                                className="cursor-pointer"
                                onClick={clearExpireDate}
                              >
                                X
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="row my-2">
                {preferences.isProctored && (
                  <div className="col-lg-6">
                    <h4 className="form-box_subtitle">
                      Allowance Time (minutes)
                    </h4>
                    <p>
                      How late a student can start the test (after the start
                      time)
                    </p>
                    <input
                      type="text"
                      className="form-control border-bottom rounded-0"
                      placeholder=""
                      value={preferences.startTimeAllowance}
                      onChange={(e) =>
                        setPreferences((prevPrefs) => ({
                          ...prevPrefs,
                          startTimeAllowance: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
      <div className="text-right">
        <button
          className="btn btn-primary"
          disabled={saving}
          onClick={onSubmit}
        >
          Save&nbsp; {saving && <i className="fa fa-pulse fa-spinner"></i>}
        </button>
      </div>
    </div>
  ) : (
    <div className="text-center mt-3">
      <i className="fa fa-2x fa-spinner fa-pulse"></i>
    </div>
  );
};

export default PreferenceComponent;
