"use client";
import { useEffect, useState, useRef } from "react";
import * as subjectService from "@/services/subjectService";
import * as instituteSvc from "@/services/instituteService";
import * as programService from "@/services/programService";
import * as userService from "@/services/userService";
import * as alertify from "alertifyjs";
import { FileDrop } from "react-file-drop";
import { Modal } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import Multiselect from "multiselect-react-dropdown";
import { TagsInput } from "react-tag-input-component";
import Link from "next/link";
import { saveBlobFromResponse } from "@/lib/common";
import { slugify } from "@/lib/validator";
import CustomPagination from "@/components/CustomPagenation";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import { useSession } from "next-auth/react";

export default function ProgramManagement({ institute, settings }: any) {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [program, setProgram] = useState<any>({});
  const [searchText, setSearchText] = useState<string>("");
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [selectedSubjects, setSelectedSubjects] = useState<any>([]);
  const [listSubjects, setListSubjects] = useState<any>(null);
  const [programs, setPrograms] = useState<any>([]);
  const [allPrograms, setAllPrograms] = useState<any>([]);
  const [countries, setCountries] = useState<any>(null);
  const [selectedCountries, setSelectedCountries] = useState<any>([]);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const user: any = useSession()?.data?.user?.info || {};
  const { update } = useSession();
  useEffect(() => {
    userService.get().then((us) => {
      const tmp_countries = settings.countries.map((c) => {
        return { code: c.code, name: c.name };
      });
      setCountries(tmp_countries);
      setSelectedCountries(
        tmp_countries.filter((c) => c.code == us.country.code)
      );
      loadPrograms(us);
    });
  }, []);

  const loadPrograms = (us?: any, show?: any) => {
    if (!user) {
      us = user;
    }
    if (us.role == "admin") {
      const params: any = { administration: true };
      if (show) {
        params.showInactive = show;
      }
      programService
        .findAll(params)
        .then((data: any[]) => {
          data.forEach((d) => (d.canEdit = canEdit(d, us)));
          setPrograms(data);
          setAllPrograms(data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else if (us.role == "publisher") {
      const params: any = { subject: true };
      if (show) {
        params.showInactive = show;
      }
      programService
        .getPublisherPrograms(params)
        .then((data: any[]) => {
          data.forEach((d) => (d.canEdit = canEdit(d, us)));
          setPrograms(data);
          setAllPrograms(data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      const params: any = { subject: true };
      if (show) {
        params.showInactive = show;
      }
      instituteSvc
        .getPrograms(params)
        .then((data: any[]) => {
          data.forEach((d) => (d.canEdit = canEdit(d, us)));
          console.log(data, "Data");
          setPrograms(data);
          setAllPrograms(data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }

    setLoading(true);
  };

  const canEdit = (p: any, us: any) => {
    return us.role == "admin" || (p.createdBy && p.createdBy._id == us._id);
  };

  const onShowInactiveChanged = (show: boolean) => {
    loadPrograms(user, show);
  };

  const openModal = (isEdit: boolean, pro: any) => {
    if (!listSubjects) {
      subjectService.findAll().then((data) => {
        setListSubjects(data);
      });
    }

    if (isEdit) {
      setIsEditMode(isEdit);
      setProgram({
        ...program,
        name: pro.name,
        _id: pro._id,
      });
      setSelectedSubjects(pro.subjects);
      setSelectedCountries(pro.countries);
    }

    setIsShowModal(true);
  };

  const cancel = () => {
    setProgram({
      name: "",
      subjects: [],
    });
    setSelectedCountries([]);
    setSelectedSubjects([]);
    setIsEditMode(false);
    setIsShowModal(false);
  };

  const addProgram = async () => {
    programService
      .addProgram({
        ...program,
        subjects: selectedSubjects.map((s) => s._id),
        countries: selectedCountries,
      })
      .then((newProg: any) => {
        newProg.canEdit = true;
        newProg.createdBy = {
          _id: user._id,
          name: user.name,
        };
        const tmp_programs = programs;
        tmp_programs.unshift(newProg);
        setPrograms(tmp_programs);
        if (institute) {
          // this.onInstituteProgramUpdate.emit(newProg)
        }
        alertify.success("Successfully Added");
        cancel();

        if (user.role == "director") {
          update().then(() => {
            // location.reload();
          });
        }
      })
      .catch((err) => {
        alertify.alert("Message", err.response.data.error);
      });
  };

  const onEdit = () => {
    programService
      .editProgram({
        ...program,
        subjects: selectedSubjects.map((s) => s._id),
        countries: selectedCountries,
      })
      .then((data: any) => {
        const srcData = programs.find((p) => p._id == data._id);
        if (srcData) {
          srcData.name = data.name;
          srcData.subjects = selectedSubjects;
          srcData.countries = selectedCountries;

          srcData.updatedAt = new Date();
          srcData.lastModifiedBy = { _id: user._id, name: user.name };
        }

        alertify.success("Successfully Updated");
        cancel();
      })
      .catch((err) => {
        alertify.alert("Message", err.error.error);
      });
  };

  const updateStatus = (status: any, p: any) => {
    alertify.confirm(
      `This will NOT ${
        status ? "activate" : "deactivate"
      } subjects of this program. Do you want to continue?`,
      (msg) => {
        const prog = {
          _id: p._id,
          active: status,
        };
        programService.updateStatus(prog).then((da) => {
          p.active = status;
          p.updatedAt = new Date();
          p.lastModifiedBy = { _id: user._id, name: user.name };
          loadPrograms(user, showInactive);
          alertify.success("Successfully Updated");
        });
      }
    );
  };

  const search = (text: string) => {
    setSearchText(text);
    if (text) {
      setPrograms(
        allPrograms.filter(
          (d) =>
            d.name.toLowerCase().toString().indexOf(text.toLowerCase()) != -1
        )
      );
      setIsSearch(true);
    } else {
      setPrograms(allPrograms);
      setIsSearch(false);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    search("");
  };

  const updateAllowReuse = (status: any, program: any) => {
    alertify.confirm("Are you sure you want to update this?", (msg) => {
      const prog = {
        _id: program._id,
        isAllowReuse: status,
      };
      programService.updateStatus(prog).then((da) => {
        alertify.success("Successfully Updated");
        program.isAllowReuse = status;
        program.updatedAt = new Date();
        program.lastModifiedBy = { _id: user._id, name: user.name };
        loadPrograms(user, showInactive);
      });
    });
  };

  const track = (index: any, item: any) => {
    return item._id;
  };

  return (
    <>
      <main className="pt-3">
        <div className="container">
          {/* start .dashboard-area */}
          <div className="rounded-boxes bg-white">
            <div className="row align-items-center">
              <div className="col">
                <div className="section_heading_wrapper mb-0">
                  <h3 className="section_top_heading">Program</h3>
                </div>
              </div>
              {user.role !== "support" && (
                <div className="col-auto ml-auto">
                  <div className="admin-filter d-lg-block">
                    <button
                      className="btn btn-primary"
                      onClick={() => openModal(false, null)}
                    >
                      Add Program
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex align-items-center my-2 gap-sm">
              {/* search */}
              <section className="flex-grow-1">
                <form
                  className="common_search-type-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
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
                    {isSearch && (
                      <div onClick={clearSearch}>
                        <figure>
                          <img src="/assets/images/close3.png" alt="" />
                        </figure>
                      </div>
                    )}
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search for program"
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
                          onShowInactiveChanged(e.target.checked);
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

            {!loading ? (
              <div className="mt-4">
                {programs && programs.length > 0 ? (
                  programs.map((p, index) => (
                    <div
                      key={p.id}
                      className={`rounded-boxes course-content dropShadowProgrammE ${
                        !p.active ? "border border-danger" : ""
                      }`}
                    >
                      <div className="content mb-2 pl-0 mw-100 mt-0 d-flex justify-content-between">
                        <h6 className="f-16 prog-head Prog_Head2 mb-0 mt-0">
                          {p.name}&nbsp;
                          {p.isAllowReuse === "global" && (
                            <i className="fas fa-globe text-primary"></i>
                          )}
                        </h6>
                        <h6 className="f-12 admin-info1 mt-0 ml-0">
                          Edited{" "}
                          {p.lastModifiedBy
                            ? `by ${p.lastModifiedBy.name}`
                            : p.createdBy
                            ? `by ${p.createdBy.name}`
                            : ""}{" "}
                          on {new Date(p.updatedAt).toLocaleDateString()} (
                          {new Date(p.updatedAt).toLocaleTimeString()})
                        </h6>
                      </div>

                      <h6 className="f-14 mb-1">Subjects</h6>
                      <div className="row">
                        <div className="col-lg-10">
                          <div className="question-tags ml-0 mt-2">
                            {p.subjects.map((s) => (
                              <span key={s.id} className="tags">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        {p.canEdit && (
                          <div className="col-lg-auto ml-auto text-right">
                            {p.active ? (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => updateStatus(false, p)}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => updateStatus(true, p)}
                              >
                                Activate
                              </button>
                            )}
                            {user &&
                              (user.role == "publisher" ||
                                user.role == "admin") &&
                              p.isAllowReuse == "self" && (
                                <button
                                  className="btn btn-outline btn-sm ml-2"
                                  onClick={() => updateAllowReuse("global", p)}
                                >
                                  Allow Global
                                </button>
                              )}
                            {user &&
                              (user.role == "publisher" ||
                                user.role == "admin") &&
                              p.isAllowReuse == "global" && (
                                <button
                                  className="btn btn-outline btn-sm ml-2"
                                  onClick={() => updateAllowReuse("self", p)}
                                >
                                  Allow Private
                                </button>
                              )}
                            <button
                              className="btn btn-primary btn-sm ml-2"
                              onClick={() => openModal(true, p)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center">
                    <img
                      className="text-center mx-auto"
                      src="/assets/images/program.svg"
                      alt="No Programs yet"
                    />
                    <h6>No Programs yet</h6>
                  </div>
                )}
              </div>
            ) : (
              <>
                <SkeletonLoaderComponent Cwidth="100" Cheight="135" />
                <br />
                <SkeletonLoaderComponent Cwidth="100" Cheight="135" />

                <br />
                <SkeletonLoaderComponent Cwidth="100" Cheight="135" />

                <br />
                <SkeletonLoaderComponent Cwidth="100" Cheight="135" />

                <br />
                <SkeletonLoaderComponent Cwidth="100" Cheight="135" />

                <br />
              </>
            )}
          </div>
        </div>
      </main>
      <Modal
        show={isShowModal}
        onHide={() => setIsShowModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h4 className="form-box_title mb-0 text-center">
              {isEditMode ? "Edit Program" : "Add Program"}
            </h4>
          </div>
          <div className="modal-body admiN_ModAlAlL">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="class-board-info">
                <h4 className="form-box_subtitle mb-0">
                  Which program would you like to add
                </h4>
                <input
                  type="text"
                  name="programName"
                  value={program.name}
                  onChange={(e) =>
                    setProgram({
                      ...program,
                      name: e.target.value,
                    })
                  }
                  placeholder="Program name"
                  required
                />
                <hr />
              </div>

              {listSubjects && listSubjects.length > 0 && (
                <div className="class-board-info">
                  <h4 className="form-box_subtitle mb-0">
                    Which subjects does this program comprise of?
                  </h4>
                  <Multiselect
                    name="programSubs"
                    placeholder="Select Subjects"
                    options={listSubjects}
                    selectedValues={selectedSubjects}
                    onSelect={(selectedList) =>
                      setSelectedSubjects(selectedList)
                    }
                    onRemove={(selectedList) =>
                      setSelectedSubjects(selectedList)
                    }
                    displayValue="name"
                  />
                  <hr />
                </div>
              )}

              {countries && (
                <div className="class-board-info">
                  <h4 className="form-box_subtitle mb-0">
                    In what countries is this program available?
                  </h4>
                  <Multiselect
                    placeholder="Select Countries"
                    options={countries}
                    selectedValues={selectedCountries}
                    onSelect={(selectedList) =>
                      setSelectedCountries(selectedList)
                    }
                    onRemove={(selectedList) =>
                      setSelectedCountries(selectedList)
                    }
                    displayValue="name"
                  />
                  <hr />
                </div>
              )}

              <div className="d-flex justify-content-end mt-2">
                <span>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={cancel}
                  >
                    Cancel
                  </button>
                </span>
                <span>
                  {!isEditMode ? (
                    <button
                      type="button"
                      className="btn btn-primary ml-1"
                      onClick={addProgram}
                      disabled={
                        !program.name ||
                        selectedSubjects.length === 0 ||
                        selectedCountries.length === 0
                      }
                    >
                      Add
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary ml-1"
                      onClick={onEdit}
                      disabled={
                        !program.name ||
                        selectedSubjects.length === 0 ||
                        selectedCountries.length === 0
                      }
                    >
                      Update
                    </button>
                  )}
                </span>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
