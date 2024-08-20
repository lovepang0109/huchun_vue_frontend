"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { alert, success, error, confirm } from "alertifyjs";
import * as questionSvc from "@/services/questionService";
import * as UserService from "@/services/userService";
import { getCodeLanguages } from "@/lib/common";
import clientApi, { uploadFile } from "@/lib/clientApi";
import { Modal } from "react-bootstrap";
import { TagsInput } from "react-tag-input-component";

const AIGenerateComponent = ({
  subjects,
  test,
  isShowAIModal,
  setIsShowAIModal,
  onClose,
}: any) => {
  const user: any = useSession()?.data?.user?.info || {};
  const [processing, setProcessing] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    subject: null,
    unit: null,
    topic: null,
    locationId: "",
    userId: useSession()?.data?.user?.info._id,
    quesNumber: 10,
    quetype: "mcq",
    isAllowReuse: "self",
    complexity: "moderate",
    language: "python",
    tags: [],
  });
  const [settings, setSettings] = useState<any>(null);
  const [codingLanguages, setCodingLanguages] = useState<any>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };
  useEffect(() => {
    getClientDataFunc();
    UserService.get().then((usr) => {
      const para = params;
      if (
        usr.role == "publisher" ||
        usr.primaryInstitute?.type == "publisher"
      ) {
        para.isAllowReuse = "global";
      }

      para.userId = usr._id;
      para.locationId = usr.activeLocation;
      if (subjects?.length == 1) {
        para.subject = subjects[0];
        setSelectedSub(para.subject);
        if (para.subject.units.length == 1) {
          para.unit = para.subject.units[0];
          setSelectedUnit(para.unit);
          if (para.unit.topics.length == 1) {
            para.topic = para.unit.topics;
            setSelectedTopic(para.topic);
          }
        }
      }
      setParams(para);
      setSelectedSub(para.subject);

      setCodingLanguages(getCodeLanguages());
    });
  }, []);

  const generate = () => {
    if (!params.subject) {
      alert("Message", "Please select subject.");
      return;
    }

    if (!params.unit) {
      alert("Message", "Please select unit.");
      return;
    }

    if (!params.topic) {
      alert("Message", "Please select topic.");
      return;
    }

    if (!params.quesNumber) {
      alert("Message", "Please enter number of question.");
      return;
    }

    const para: any = {
      subjectId: params.subject._id,
      unitId: params.unit[0]._id,
      topicId: params.topic[0]._id,
      userId: params.userId,
      locationId: params.locationId,
      quesNumber: params.quesNumber,
      quetype: params.quetype,
      tags: params.tags || [],
      isAllowReuse: params.isAllowReuse,
      complexity: params.complexity,
    };

    if (params.quetype == "code") {
      para.language = params.language;
    }
    if (test) {
      para.testId = test._id;
    }

    setProcessing(true);

    questionSvc
      .generateQuestions(para)
      .then((res) => {
        success("Questions are generated successfully.");
        setIsShowAIModal(false);
        onClose(true);
        setProcessing(false);
      })
      .catch((err) => {
        console.log(err);
        alert("Message", "Failed to generate questions. Please try again.");
        setProcessing(false);
      });
  };

  const close = () => {
    setIsShowAIModal(false);
    onClose(false);
  };

  const clearUnit = () => {
    setParams({
      ...params,
      unit: null,
    });
  };

  const clearTopic = () => {
    setParams({
      ...params,
      topic: null,
    });
  };

  const selectSubject = (subId: any) => {
    setSelectedSub(subId);
    const selected = subjects.find((sub) => sub._id === subId);
    setParams({
      ...params,
      subject: selected,
      unit: null,
    });
    // clearUnit();
  };

  const selectUnit = (unitId: any) => {
    setSelectedUnit(unitId);

    const selected = params.subject?.units.filter((uni) => uni._id === unitId);
    setParams({
      ...params,
      unit: selected,
      topic: null,
    });
    // clearTopic();
  };

  const selectTopic = (topId: any) => {
    setSelectedTopic(topId);
    const selected = params.unit[0]?.topics.filter((top) => top._id === topId);
    setParams({
      ...params,
      topic: selected,
    });
  };
  const beforeAddValidate = (tag) => {
    return tag.trim() !== "";
  };
  return (
    <Modal
      show={isShowAIModal}
      onHide={() => setIsShowAIModal(false)}
      backdrop="static"
      keyboard={false}
      className="ai-generator"
    >
      <div className="modal-header justify-content-center">
        <h6 className="modal-title text-dark">Generate Questions</h6>
      </div>
      <div className="modal-body text-dark">
        <div className="bg-white px-2">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group border-bottom">
                <strong className="form-box_subtitle">Subject</strong>
                <select
                  className="form-control border-0 my-0 pl-0"
                  name="subject"
                  value={selectedSub || ""}
                  onChange={(e) => {
                    selectSubject(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  {subjects.map((subject, index) => (
                    <option key={index} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group border-bottom">
                <strong className="form-box_subtitle">Unit</strong>
                <select
                  className="form-control border-0 my-0 pl-0"
                  name="unit"
                  value={selectedUnit || ""}
                  onChange={(e) => {
                    selectUnit(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  {params.subject?.units?.map((unit, index) => (
                    <option key={index} value={unit._id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group border-bottom">
                <strong className="form-box_subtitle">Topic</strong>
                <select
                  className="form-control border-0 my-0 pl-0"
                  name="topic"
                  value={selectedTopic || ""}
                  onChange={(e) => selectTopic(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  {params?.unit &&
                    params?.unit[0].topics?.map((topic, index) => (
                      <option key={index} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-md-4">
              <div className="form-group">
                <strong className="form-box_subtitle">Difficulty</strong>
                <div className="form-row mt-2">
                  {["easy", "moderate", "hard"].map((level, index) => (
                    <div
                      key={index}
                      className="col-auto d-flex align-items-center"
                    >
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value={level}
                            name="complexity"
                            id={level}
                            checked={params.complexity === level}
                            onChange={(e) => {
                              setParams({
                                ...params,
                                complexity: level,
                              });
                            }}
                          />
                          <label htmlFor={level} className="my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group border-bottom">
                <strong className="form-box_subtitle">Question Type</strong>
                <select
                  className="form-control border-0 my-0 pl-0"
                  name="quetype"
                  value={params.quetype}
                  onChange={(e) => {
                    setParams({
                      ...params,
                      quetype: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  <option value="mcq">Multiple choices</option>
                  {settings?.features.coding && (
                    <option value="code">Coding</option>
                  )}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <strong className="form-box_subtitle">
                  Add to Question Bank
                </strong>
                <div className="form-row mt-2">
                  {user.role === "publisher" ||
                  user.primaryInstitute?.type === "publisher" ? (
                    <div className="col-auto d-flex align-items-center">
                      <div className="container1 my-0">
                        <div className="radio my-0">
                          <input
                            type="radio"
                            value="global"
                            name="isAllowReuse"
                            id="global"
                            checked={params.isAllowReuse === "global"}
                            onChange={(e) => {
                              setParams({
                                ...params,
                                isAllowReuse: "global",
                              });
                            }}
                          />
                          <label htmlFor="global" className="my-0"></label>
                        </div>
                      </div>
                      <div className="rights my-0">Global</div>
                    </div>
                  ) : (
                    <>
                      <div className="col-auto d-flex align-items-center">
                        <div className="container1 my-0">
                          <div className="radio my-0">
                            <input
                              type="radio"
                              value="everyone"
                              name="isAllowReuse"
                              id="everyone"
                              checked={params.isAllowReuse === "everyone"}
                              onChange={(e) => {
                                setParams({
                                  ...params,
                                  isAllowReuse: "everyone",
                                });
                              }}
                            />
                            <label htmlFor="everyone" className="my-0"></label>
                          </div>
                        </div>
                        <div className="rights my-0">Everyone</div>
                      </div>
                      <div className="col-auto d-flex align-items-center">
                        <div className="container1 my-0">
                          <div className="radio my-0">
                            <input
                              type="radio"
                              value="self"
                              name="isAllowReuse"
                              id="self"
                              checked={params.isAllowReuse === "self"}
                              onChange={(e) => {
                                setParams({
                                  ...params,
                                  isAllowReuse: "self",
                                });
                              }}
                            />
                            <label htmlFor="self" className="my-0"></label>
                          </div>
                        </div>
                        <div className="rights my-0">Self</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-2">
            <div
              className={params.quetype === "code" ? "col-md-4" : "col-md-8"}
            >
              <strong className="form-box_subtitle">Question Tags</strong>
              <div className="color-tags new-color-tags">
                <TagsInput
                  className={"tag-input-normal-height"}
                  value={params.tags}
                  onChange={(tags) => {
                    if (tags !== "") {
                      console.log(tags, "tags");
                      setParams({ ...params, tags });
                    }
                  }}
                  separators={["Enter", " "]}
                  beforeAddValidate={beforeAddValidate}
                />
              </div>
            </div>
            {params.quetype === "code" && (
              <div className="col-md-4">
                <strong className="form-box_subtitle">Language</strong>
                <select
                  className="form-control border-top-0 border-left-0 border-right-0 my-0 pl-0"
                  name="language"
                  value={params.language}
                  onChange={(e) => {
                    setParams({
                      ...params,
                      language: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  {codingLanguages.map((code, index) => (
                    <option key={index} value={code.language}>
                      {code.display}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-4">
              <div className="form-group border-bottom">
                <strong className="form-box_subtitle">
                  Number Of Questions
                </strong>
                <input
                  style={{ border: "none" }}
                  type="number"
                  min="0"
                  max="60"
                  className="form-control my-0 pl-0"
                  name="quesNumber"
                  value={params.quesNumber}
                  onChange={(e) => {
                    setParams({
                      ...params,
                      quesNumber: e.target.value,
                    });
                  }}
                  aria-label="Enter the Number Of Questions"
                />
              </div>
            </div>
          </div>

          <div className="mt-2 text-right">
            <button
              className="btn btn-outline mr-2"
              onClick={close}
              disabled={processing}
            >
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={generate}
              disabled={processing}
            >
              Generate&nbsp;
              {processing && <i className="fa fa-spinner fa-pulse"></i>}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AIGenerateComponent;
