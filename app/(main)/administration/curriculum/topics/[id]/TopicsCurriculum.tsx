"use client";
import { useEffect, useState, useRef } from "react";
import * as topicService from "@/services/topicService";
import * as userService from "@/services/userService";
import * as alertify from "alertifyjs";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";
import { TagsInput } from "react-tag-input-component";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import moment from "moment";
import { fromNow } from "@/lib/pipe";

export default function TopicsCurriculum() {
  const [user, setUser] = useState<any>(null);
  const { id } = useParams();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [topics, setTopics] = useState<any>([]);
  const [topic, setTopic] = useState<any>({ tags: [] });
  const [unitId, setUnitId] = useState<any>("");
  const [searchText, setSearchText] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [allTopics, setAllTopics] = useState<any>([]);
  const [unitName, setUnitName] = useState<any>("");
  const [isAllowReuse, setIsAllowReuse] = useState<string>("self");
  const [subjectName, setSubjectName] = useState<any>("");
  const [subjectId, setSubjectId] = useState<any>("");
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [canAddTopic, setCanAddTopic] = useState<boolean>(false);
  const [unit, setUnit] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const queryParams = useSearchParams();
  const { push } = useRouter();

  useEffect(() => {
    setUnitId(id);
    userService.get().then((us) => {
      setUser(us);
      loadTopics(id, us);
      setUnitName(queryParams.get("unit"));
      setSubjectName(queryParams.get("subject"));
      setSubjectId(queryParams.get("subjectId"));
      setCanAddTopic(us.role == "admin");
    });
  }, []);

  const loadTopics = (uid?: any, us?: any, show?: any) => {
    if (!us) {
      us = user;
    }
    // if (!show) {
    //   show = showInactive;
    // }
    if (!uid) {
      uid = unitId;
    }
    const params: any = {};
    if (show) {
      params.showInactive = show;
    }
    topicService
      .getByUnit(uid, params)
      .then(
        ({
          subject,
          unit,
          topics,
        }: {
          subject: any;
          unit: any;
          topics: [];
        }) => {
          topics.forEach((t) => canEdit(t, us));
          setAllTopics(topics);
          setTopics(topics);
          setCanAddTopic(us.role == "admin" || unit.createdBy == us._id);
          setUnit(unit);
          setSubject(subject);
        }
      );
  };

  const canEdit = (t, u) => {
    t.canEdit = u.role == "admin" || t.createdBy == u._id;
  };

  const openModal = (isEdit: boolean, topicId?: string) => {
    setIsShowModal(true);
    if (isEdit) {
      setIsEditMode(isEdit);
      topicService.getOneTopic(topicId).then((data: any[]) => {
        setTopic(data);
      });
    }
  };

  const cancel = () => {
    setTopic({ tags: [] });
    setIsEditMode(false);
    setIsShowModal(false);
  };

  const addTopic = () => {
    if (!topic.name) {
      alertify.alert("Message", "Please add topic name.");
      return;
    }
    setTopic({
      ...topic,
      unit: unitId,
    });
    const tmp_topic = {
      ...topic,
      unit: unitId,
    };
    topicService.addTopic(tmp_topic).then((data) => {
      setIsShowModal(false);
      alertify.success("Successfully Added");
      cancel();
      loadTopics();
    });
  };

  const onEdit = () => {
    if (!topic.name) {
      alertify.alert("Message", "Please add topic name.");
      return;
    }
    topicService.editTopic(topic).then((data) => {
      alertify.success("Successfully Updated");
      cancel();
      loadTopics();
    });
  };

  const updateStatus = (status: any, u: any) => {
    alertify.confirm(
      `Are you sure to ${status ? "activate" : "deactivate"} this topic?`,
      (msg) => {
        const topic = {
          _id: u,
          active: status,
        };
        topicService.updateStatus(topic).then((da) => {
          alertify.success("Successfully Updated");
          loadTopics();
        });
      }
    );
  };

  const search = (text: string) => {
    setSearchText(text);
    if (text) {
      setTopics(
        allTopics.filter(
          (t) => t.topicName.toLowerCase().indexOf(text.toLowerCase()) > -1
        )
      );
    } else {
      setTopics([...allTopics]);
    }
  };
  return (
    <>
      <main className="pt-lg-3 Admininistration-admin_new topic_cuRiculam_new">
        <div className="container">
          <div className="dashboard-area classroom mx-auto">
            {/* start .dashboard-area */}
            <div className="Admin-Cur_ricuLam topiC-ur-culaM">
              <div className="rounded-boxes bg-white">
                <div className="UserCardAdmiN-AlL1">
                  <div className="Header-administration_new">
                    <div className="info subject-card">
                      <div className="row">
                        <div className="col">
                          <div className="section_heading_wrapper">
                            <h3 className="section_top_heading">
                              {subjectName}
                            </h3>
                            <div className="section_sub_heading cursor-pointer">
                              <span>{subjectName}</span>&nbsp;&nbsp;
                              {subject?.isAllowReuse === "global" && (
                                <>
                                  <i className="fas fa-globe text-primary"></i>
                                </>
                              )}
                              &gt;
                              <Link
                                className="sub-heading1"
                                href={`/administration/curriculum//units/${subjectId}?subject=${subjectName}`}
                              >
                                {unitName}&nbsp;&nbsp;
                                {unit?.isAllowReuse === "global" && (
                                  <i className="fas fa-globe text-primary"></i>
                                )}
                              </Link>
                            </div>
                          </div>
                        </div>
                        {canAddTopic && (
                          <div className="col-auto ml-auto">
                            <span className="admin-filter1 d-lg-block">
                              <div className="subject-card">
                                <button
                                  className="btn btn-primary"
                                  onClick={() => openModal(false)}
                                >
                                  Add Topic
                                </button>
                              </div>
                              <br />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center my-3 gap-sm">
                    <section className="flex-grow-1">
                      <form
                        className="common_search-type-1"
                        onSubmit={(e) => e.preventDefault()}
                      >
                        <div className="form-group">
                          <span>
                            <figure>
                              <img
                                className="searchBoxIcon-5"
                                src="/assets/images/search-icon-2.png"
                                alt=""
                              />
                            </figure>
                          </span>
                          <input
                            type="text"
                            className="form-control border-0"
                            placeholder="Search for topics"
                            maxLength="50"
                            value={searchText}
                            onChange={(e) => search(e.target.value)}
                          />
                        </div>
                      </form>
                    </section>

                    <div className="form-group switch-item">
                      <div className="d-flex align-items-center">
                        <span className=" mr-3">Show Inactive</span>
                        <div className="align-self-center">
                          <label className="switch col-auto ml-auto my-0 align-middle">
                            <input
                              type="checkbox"
                              checked={showInactive}
                              onChange={(e) => {
                                setShowInactive(e.target.checked);
                                loadTopics(unitId, user, e.target.checked);
                              }}
                            />
                            <span
                              className="slider round translate-middle-y"
                              style={{ top: 0 }}
                            ></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* end */}

                  <div className="row">
                    {topics.length > 0 &&
                      topics.map((t) => (
                        <div className="subject-card col-md-4 mb-3" key={t._id}>
                          <div
                            className={`curriculum_product_box shadow ${
                              !t.active ? "border-danger border" : ""
                            }`}
                          >
                            <div className="form-row">
                              <div className="col-10">
                                <div className="product_name">
                                  {t.topicName}
                                  {t.isAllowReuse === "global" && (
                                    <i className="fas fa-globe text-primary ml-2"></i>
                                  )}
                                </div>
                              </div>
                              <div className="col-2 text-right">
                                {t.canEdit && (
                                  <div className="dropdown mat-blue">
                                    <button
                                      className="material-icons"
                                      id="dropdown-profile-box-btn"
                                      data-toggle="dropdown"
                                      aria-haspopup="true"
                                      aria-expanded="false"
                                    >
                                      more_vert
                                    </button>
                                    <ul
                                      className="dropdown-menu dropdown-menu-right py-0 border-0"
                                      aria-labelledby="dropdown-profile-box-btn"
                                    >
                                      {t.active && (
                                        <>
                                          <li>
                                            <button
                                              onClick={() =>
                                                openModal(true, t._id)
                                              }
                                              className="dropdown-item"
                                            >
                                              <span
                                                style={{ marginRight: "5px" }}
                                              >
                                                <i className="fas fa-edit"></i>
                                              </span>
                                              Edit
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              onClick={() =>
                                                updateStatus(false, t._id)
                                              }
                                              className="dropdown-item"
                                            >
                                              <span
                                                style={{ marginRight: "9px" }}
                                              >
                                                <i className="fas fa-save"></i>
                                              </span>
                                              Deactivate
                                            </button>
                                          </li>
                                        </>
                                      )}
                                      {!t.active && (
                                        <li>
                                          <button
                                            onClick={() =>
                                              updateStatus(true, t._id)
                                            }
                                            className="dropdown-item"
                                          >
                                            <span
                                              style={{ marginRight: "9px" }}
                                            >
                                              <i className="fas fa-save"></i>
                                            </span>
                                            Activate
                                          </button>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="subject2">
                              <div className="admin-user-info-remove">
                                <div className="curriculum-item-info">
                                  Edited on{" "}
                                  {moment(t.updatedAt).format("MMM D, YYYY")}(
                                  {fromNow(t.updatedAt)})
                                </div>
                                <div className="admin-wrap1-remove">
                                  <div className="bottom clearfix">
                                    <div className="form-row curriculum-bottom-info">
                                      <div className="col-12 d-flex align-items-center">
                                        <span className="material-icons ml-0">
                                          assignment
                                        </span>
                                        <span>
                                          <strong className="text-dark ml-1">
                                            {t.questionCount}
                                          </strong>{" "}
                                          Questions
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {topics.length === 0 && (
                    <div className="text-center">
                      <img
                        className="mx-auto"
                        src="/assets/images/topic.svg"
                        alt="No Topics yet"
                      />
                      <strong className="text-center mt-2">
                        No Topics yet
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* //end .dashboard-area */}
        </div>
      </main>
      <Modal
        show={isShowModal}
        onHide={() => setIsShowModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-content form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h4 className="form-box_title">
              {isEditMode ? "Edit Topic" : "Add Topic"}
            </h4>
          </div>
          <div className="modal-body admiN_ModAlAlL">
            <div className="class-board-info">
              <form>
                <h4 className="form-box_subtitle mb-0">
                  Which topic would you like to add?
                </h4>
                <input
                  type="text"
                  name="search"
                  className="border-bottom py-2"
                  value={topic.name}
                  onChange={(e) => setTopic({ ...topic, name: e.target.value })}
                  placeholder="Topic name"
                />
              </form>
              {/* <hr> */}
            </div>

            <div className="class-board-info mt-1">
              <h4 className="form-box_subtitle mb-0">Tags</h4>
              <div className="color-tags">
                <TagsInput
                  value={topic.tags}
                  onChange={(tags) => setTopic({ ...topic, tags })}
                  name="tags"
                  placeHolder="+ Enter a new tag"
                  separators={[" "]}
                  classNames={"py-2"}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-2">
              <button className="btn btn-light" onClick={cancel}>
                Cancel
              </button>

              <button
                className="btn btn-primary ml-1"
                onClick={isEditMode ? onEdit : addTopic}
              >
                {isEditMode ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
