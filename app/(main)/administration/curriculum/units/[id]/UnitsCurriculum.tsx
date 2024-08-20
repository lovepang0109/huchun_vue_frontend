"use client";
import { useEffect, useState, useRef } from "react";
import * as unitService from "@/services/unitService";
import * as userService from "@/services/userService";
import * as alertify from "alertifyjs";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";
import { TagsInput } from "react-tag-input-component";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import moment from "moment";
import { fromNow } from "@/lib/pipe";

export default function UnitsCurriculum() {
  const [user, setUser] = useState<any>(null);
  const [units, setUnits] = useState<any>([]);
  const [unit, setUnit] = useState<any>({ tags: [] });
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [allUnits, setAllUnits] = useState<any>([]);
  const [subject, setSubject] = useState<any>("");
  const [isAllowReuse, setIsAllowReuse] = useState<any>("self");
  const [canAddUnit, setCanAddUnit] = useState<boolean>(false);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [subjectId, setSubjectId] = useState<any>("");
  const queryParams = useSearchParams();
  const { push } = useRouter();

  useEffect(() => {
    userService.get().then((us) => {
      setUser(us);
      setSubjectId(id);
      loadUnits(id, us);
      setSubject(queryParams.get("subject"));
      if (queryParams.get("isAllowReuse")) {
        setIsAllowReuse(queryParams.get("isAllowReuse"));
      }
      setCanAddUnit(us.role === "admin");
    });
  }, []);

  const loadUnits = (subId?: any, us?: any, shoInact?: any) => {
    if (!subId) {
      subId = subjectId;
    }
    if (!us) {
      us = user;
    }
    const params: any = {};
    if (showInactive) {
      params.showInactive = shoInact;
    }
    unitService
      .getBySubject(subId, params)
      .then(({ subject, units }: { subject: any; units: [] }) => {
        units.forEach((u) => canEdit(u, us));
        setUnits(units);
        setAllUnits(units);
        setCanAddUnit(us.role == "admin" || subject.createdBy == us._id);
        setIsAllowReuse(subject.isAllowReuse);
      });
  };

  const canEdit = (u: any, us?: any) => {
    if (!us) {
      us = user;
    }
    u.canEdit = us.role == "admin" || u.createdBy == us._id;
  };

  const openModal = (isEdit: boolean, unitId?: any) => {
    setIsShowModal(true);
    if (isEdit) {
      setIsEditMode(isEdit);
      console.log(unitId, "unitid");
      unitService.getOneUnit(unitId).then((data: any[]) => {
        setUnit(data);
      });
    }
  };

  const cancel = () => {
    setUnit({ tags: [] });
    setIsEditMode(false);
    setIsShowModal(false);
  };

  const addUnit = () => {
    if (!unit.name) {
      alertify.alert("Message", "Please add unit name.");
      return;
    }
    setUnit({
      ...unit,
      subject: subjectId,
    });
    const tmp_unit = {
      ...unit,
      subject: subjectId,
    };

    unitService
      .addUnit(tmp_unit)
      .then((data) => {
        alertify.success("Successfully Added");
        cancel();
        loadUnits();
      })
      .catch((err) => {
        console.log(err);
        alertify.alert("Message", err.response.data.error);
      });
  };

  const onEdit = () => {
    if (!unit.name) {
      alertify.alert("Message", "Please add unit name.");
      return;
    }
    unitService.editUnit(unit).then((data) => {
      alertify.success("Successfully Updated");
      cancel();
      loadUnits();
    });
  };

  const updateStatus = (status: any, u: any) => {
    alertify.confirm(
      `This will ${
        status ? "activate" : "deactivate"
      } topics of this unit. Do you want to continue?`,
      (msg) => {
        const unit = {
          id: u,
          active: status,
        };
        unitService.updateStatus(unit).then((da) => {
          alertify.success("Successfully Updated");
          loadUnits();
        });
      },
      (e) => {}
    );
  };

  const search = (text: string) => {
    setSearchText(text);
    if (text) {
      setUnits(
        allUnits.filter(
          (t) => t.unitName.toLowerCase().indexOf(text.toLowerCase()) > -1
        )
      );
    } else {
      setUnits([...allUnits]);
    }
  };

  return (
    <>
      <main className="pt-lg-3 Admininistration-admin_new unit_curRiculam_new">
        <div className="container">
          <div className="dashboard-area classroom mx-auto">
            {/* start .dashboard-area */}
            <div className="Admin-Cur_ricuLam Un-ItCurCu-Lam">
              <div className="rounded-boxes bg-white">
                <div className="UserCardAdmiN-AlL1">
                  {/* common header */}
                  <div className="row align-items-center">
                    <div className="col info d-flex align-items-center subject-card">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading">
                          {subject}
                          {isAllowReuse === "global" && (
                            <i className="fas fa-globe text-primary"></i>
                          )}
                        </h3>
                        <Link
                          className="sub-heading1 cursor-pointer"
                          href={`/administration/curriculum`}
                        >
                          {subject}
                        </Link>
                      </div>
                    </div>

                    {canAddUnit && (
                      <div className="col-auto ml-auto">
                        <button
                          className="btn btn-primary"
                          onClick={() => openModal(false)}
                        >
                          Add Unit
                        </button>
                      </div>
                    )}
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
                            placeholder="Search for Unit"
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
                                loadUnits(subjectId, user, e.target.checked);
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
                    {units.length > 0 &&
                      units.map((u) => (
                        <div className="subject-card col-md-4 mb-3" key={u._id}>
                          <div
                            className={`curriculum_product_box shadow ${
                              !u.active ? "border-danger border" : ""
                            }`}
                          >
                            <div className="form-row">
                              <Link
                                className="col-10 cursor-pointer"
                                href={`/administration/curriculum/topics/${u._id}?unit=${u.unitName}&subject=${subject}&subjectId=${subjectId}`}
                              >
                                <div className="product_name">
                                  {u.unitName}
                                  {u.isAllowReuse === "global" && (
                                    <i className="fas fa-globe text-primary"></i>
                                  )}
                                </div>
                              </Link>
                              <div className="col-2 text-right">
                                {u.canEdit && (
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
                                      {u.active && (
                                        <>
                                          <li>
                                            <button
                                              onClick={() =>
                                                openModal(true, u._id)
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
                                                updateStatus(false, u._id)
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
                                      {!u.active && (
                                        <li>
                                          <button
                                            onClick={() =>
                                              updateStatus(true, u._id)
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
                            <Link
                              className="subject2 cursor-pointer"
                              href={`/administration/curriculum/topics/${u._id}?unit=${u.unitName}&subject=${subject}&subjectId=${subjectId}`}
                            >
                              <div className="curriculum-item-info text-dark">
                                Edited on{" "}
                                {moment(u.updatedAt).format("MMM D, YYYY")}(
                                {fromNow(u.updatedAt)})
                              </div>
                              <div className="d-flex curriculum-bottom-info">
                                <div className="d-flex align-items-center">
                                  <span className="material-icons ml-0">
                                    menu_book
                                  </span>
                                  <span>
                                    <strong className="text-dark ml-1">
                                      {u.topicsCount}
                                    </strong>{" "}
                                    <span className="text-dark">Topics</span>
                                  </span>
                                </div>
                                <div className="d-flex align-items-center ml-3">
                                  <span className="material-icons ml-0">
                                    assignment
                                  </span>
                                  <span>
                                    <strong className="text-dark ml-1">
                                      {u.questionCount}
                                    </strong>{" "}
                                    <span className="text-dark">Questions</span>
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                  {units.length == 0 && (
                    <div className="text-center">
                      <img
                        className="mx-auto"
                        src="/assets/images/unit.svg"
                        alt="No Units yet"
                      />
                      <strong>No Units yet</strong>
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
              <strong>{isEditMode ? "Edit Unit" : "Add Unit"}</strong>
            </h4>
          </div>
          <div className="modal-body admiN_ModAlAlL">
            <div className="class-board-info">
              <form>
                <h4 className="form-box_subtitle mb-0">
                  Which unit would you like to add?
                </h4>
                <input
                  type="text"
                  name="name"
                  className="border-bottom py-2"
                  value={unit.name}
                  onChange={(e) =>
                    setUnit({
                      ...unit,
                      name: e.target.value,
                    })
                  }
                  placeholder="unit name"
                />
              </form>
            </div>

            <div className="class-board-info mt-1">
              <form className="mb-2">
                <h4 className="form-box_subtitle mb-0">Unit Code</h4>
                <input
                  type="text"
                  name="code"
                  className="border-bottom py-2"
                  value={unit.code}
                  onChange={(e) =>
                    setUnit({
                      ...unit,
                      code: e.target.value,
                    })
                  }
                  placeholder="code"
                />
              </form>
              <sup>*Enter the code or it will be autogenerated</sup>
            </div>

            <div className="class-board-info">
              <h4 className="form-box_subtitle mb-0">Tags</h4>
              <div className="color-tags">
                <TagsInput
                  value={unit.tags}
                  onChange={(tags) => setUnit({ ...unit, tags })}
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
              {!isEditMode && (
                <button className="btn btn-primary ml-2" onClick={addUnit}>
                  Add
                </button>
              )}
              {isEditMode && (
                <button className="btn btn-primary ml-2" onClick={onEdit}>
                  Update
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
