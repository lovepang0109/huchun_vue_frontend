"use client";
import { useEffect, useState, useRef } from "react";
import * as subjectService from "@/services/subjectService";
import * as instituteSvc from "@/services/instituteService";
import * as programService from "@/services/programService";
import * as adminSvc from "@/services/adminService";
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

export default function SubjectCurriculum() {
  const fileBrowseRef = useRef(null);
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any>([]);
  const [subject, setSubject] = useState<any>({
    tags: [],
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [cTags, setCTags] = useState<any>([]);
  const [programs, setPrograms] = useState<any>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [files, setFiles] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 30,
    showInactive: false,
    searchText: "",
  });
  const [total, setTotal] = useState<any>(0);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  useEffect(() => {
    userService.get().then((u) => {
      setUser(u);
      loadSubjects(true, params, u);

      if (u.role == "publisher") {
        programService.getPublisherPrograms().then((data: any[]) => {
          setPrograms(data);
        });
      } else if (u.role == "admin") {
        programService.findAll({ administration: true }).then((data: any[]) => {
          setPrograms(data);
        });
      } else {
        instituteSvc.getPrograms().then((programs: any[]) => {
          setPrograms(programs);
        });
      }
    });
  }, []);

  const loadSubjects = (refresh = true, paras?: any, u?: any) => {
    if (!paras) {
      paras = params;
    }
    if (!u) {
      u = user;
    }
    setLoading(true);
    const para: any = { ...paras };
    if (refresh) {
      setParams({
        ...paras,
        page: 1,
      });
      para.page = 1;
      para.count = true;
    }

    if (u.role == "publisher") {
      subjectService
        .getPublisherSubject(para)
        .then((data: any) => {
          data.subjects.forEach((s) => {
            canEdit(s, u);
          });
          console.log(data.subjects, "Data");
          setSubjects(data.subjects);
          if (refresh) {
            setTotal(data.total);
          }
          setLoading(false);
        })
        .catch((err) => setLoading(false));
    } else if (u.role == "admin") {
      subjectService
        .getSubjectList(para)
        .then((data: any) => {
          data.subjects.forEach((s) => {
            canEdit(s, u);
          });
          setSubjects(data.subjects);
          if (refresh) {
            setTotal(data.total);
          }
          setLoading(false);
        })
        .catch((err) => setLoading(false));
    } else {
      instituteSvc
        .getSubjects(para)
        .then((data: any) => {
          data.subjects.forEach((s) => {
            canEdit(s, u);
          });
          setSubjects(data.subjects);
          if (refresh) {
            setTotal(data.total);
          }
          setLoading(false);
        })
        .catch((err) => setLoading(false));
    }
  };

  const canEdit = (s: any, u?: any) => {
    if (!u) {
      u = user;
    }
    s.canEdit = u.role == "admin" || s.createdBy == u._id;
  };

  const onShowInactiveChanged = (show: boolean) => {
    setParams({
      ...params,
      showInactive: show,
    });
    const para = {
      ...params,
      showInactive: show,
    };
    loadSubjects(true, para);
  };

  const openModal = (isEdit: boolean, subjectId?: any) => {
    setIsShowModal(true);
    if (isEdit) {
      setIsEditMode(isEdit);
      subjectService.getOneSubject(subjectId).then((data: any) => {
        setSubject(data);
        const updatedCTags = programs
          .filter((d) => data.programs.indexOf(d._id) != -1)
          .map((d) => {
            return { ...d, value: d._id, display: d.name };
          });
        setCTags(updatedCTags);
      });
    }
  };

  const cancel = () => {
    setSubject({ tags: [] });
    setIsEditMode(false);
    setIsShowModal(false);
    setCTags([]);
  };

  const addSubject = () => {
    if (!subject.name) {
      alertify.alert("Message", "Please add subject name");
      return;
    }

    setSubject({
      ...subject,
      programs: cTags.map((d) => d._id),
    });
    const updatedSub = {
      ...subject,
      programs: cTags.map((d) => d._id),
    };
    subjectService
      .addSubject(updatedSub)
      .then((data) => {
        alertify.success("Successfully Added");
        cancel();
        loadSubjects();
      })
      .catch((err) => {
        cancel();
        alertify.alert("Message", err.response.data.error);
      });
  };

  const onEdit = () => {
    if (!subject.name) {
      alertify.alert("Message", "Please add subject name");
      return;
    }

    setSubject({
      ...subject,
      programs: cTags.map((d) => d._id),
    });
    const updatedSub = {
      ...subject,
      programs: cTags.map((d) => d._id),
    };
    subjectService
      .editSubject(updatedSub._id, updatedSub)
      .then((data) => {
        alertify.success("Successfully Updated");
        cancel();
        loadSubjects();
      })
      .catch((err) => {
        cancel();
        alertify.alert("Message", err.error.error);
      });
  };

  const updateStatus = (status: any, u: any) => {
    alertify.confirm(
      `This will ${
        status ? "activate" : "deactivate"
      } units and topics of this subject. Do you want to continue?`,
      (msg) => {
        const subject = {
          id: u,
          active: status,
        };
        subjectService.updateStatus(subject).then((da) => {
          alertify.success("Successfully Updated");
          loadSubjects();
        });
      }
    );
  };

  const updateAllowReuse = (status: any, u: any) => {
    alertify.confirm("Are you sure you want to update this?", (msg) => {
      const subject = {
        id: u,
        isAllowReuse: status,
      };
      subjectService.updateStatus(subject).then((da) => {
        alertify.success("Successfully Updated");
        loadSubjects();
      });
    });
  };

  const dropped = (files: any) => {
    setFiles(files);
    setUploadFile(files[0]);
  };

  const filePicker = () => {
    fileBrowseRef?.current?.click();
  };

  const upload = (file: any) => {
    if (!file) {
      return;
    }
    setUploading(true);
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);
    subjectService
      .importFunc(formData)
      .then((data: any) => {
        setUploading(false);
        setUploadFile(null);

        if (data.code < 0) {
          alertify.alert(
            "Message",
            "Subject uploading process failed. Please fix and upload again."
          );
          return;
        }
        loadSubjects();
        alertify.success("Uploaded successfully");
      })
      .catch((err) => {
        setUploading(false);

        alertify.alert(
          "Message",
          "Subject uploading process failed. Please fix and upload again."
        );
      });
  };

  const search = (text: string) => {
    setParams({
      ...params,
      searchText: text,
    });
    const updatedParams = {
      ...params,
      searchText: text,
    };
    if (updatedParams.searchText === "") {
      setIsSearch(false);
    } else {
      setIsSearch(true);
    }
    loadSubjects(true, updatedParams);
  };

  const cancelDocs = () => {
    setUploadFile(null);
    setFiles(null);
  };

  const clearSearch = () => {
    setParams({
      ...params,
      searchText: "",
    });
    search("");
  };

  const downloadSubject = (sub: any) => {
    adminSvc
      .downloadReportData("get_subject_list", {
        directDownload: true,
        subject: sub._id,
      })
      .then((res: any) => {
        saveBlobFromResponse({
          fileName: slugify("subject-" + sub.subjectName),
          blob: res,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <main className="pt-3 Admininistration-admin_new CurriculamSub-admin_new">
        <div className="container">
          <div className="dashboard-area classroom mx-auto mw-100">
            <div className="Admin-Cur_ricuLam">
              <div className="rounded-boxes bg-white">
                <div className="UserCardAdmiN-AlL1">
                  <div className="section_heading_wrapper mb-0">
                    <h6 className="section_top_heading">Subjects</h6>
                  </div>
                  <div className="row my-3">
                    {user?.role !== "support" && (
                      <>
                        <div className="col-lg-3 col-md-4">
                          <div className="dashed-border-box h-lg-100 d-flex flex-column">
                            <p className="assess-help">
                              Add subject individually. You can open a subject
                              and add unit later.
                            </p>
                            <div>
                              <button
                                className="btn btn-primary mt-2"
                                onClick={() => openModal(false)}
                              >
                                Add Subject
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-9 col-md-8">
                          <div className="dashed-border-box h-lg-100">
                            <div className="row">
                              <div className="col-md-8">
                                <div className="standard-upload-box">
                                  <FileDrop
                                    className="mt-4"
                                    onDrop={(f: any) => dropped(f)}
                                  >
                                    <h2 className="upload_icon mb-0">
                                      <span className="material-icons">
                                        file_copy
                                      </span>
                                    </h2>
                                    <p className="pro-text-drug text-center d-block active text-primary">
                                      {uploadFile?.name}
                                    </p>
                                    <span className="title">
                                      Drag and Drop or{" "}
                                      <a
                                        onClick={filePicker}
                                        className="text-primary"
                                      >
                                        {" "}
                                        browse{" "}
                                      </a>{" "}
                                      your files
                                    </span>
                                    <div className="d-flex justify-content-center gap-xs">
                                      {uploadFile?.name && (
                                        <button
                                          className="btn btn-secondary btn-sm set_cancel__btn mx-2"
                                          onClick={cancelDocs}
                                        >
                                          Cancel
                                        </button>
                                      )}
                                      {!uploadFile?.name && (
                                        <button
                                          type="button"
                                          className="btn btn-primary btn-sm mx-2"
                                          onClick={filePicker}
                                        >
                                          Browse
                                        </button>
                                      )}
                                      <button
                                        className={`btn btn-secondary btn-sm ${
                                          !uploadFile ? "disabled" : ""
                                        }`}
                                        onClick={() => upload(uploadFile)}
                                      >
                                        Upload{" "}
                                        {uploading && (
                                          <i className="fa fa-pulse fa-spinner"></i>
                                        )}
                                      </button>
                                    </div>
                                    <input
                                      value=""
                                      style={{ display: "none", opacity: 0 }}
                                      ref={fileBrowseRef}
                                      type="file"
                                      onChange={(e) => dropped(e.target.files)}
                                    />
                                  </FileDrop>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <p className="assess-help">
                                  Use template to add subject, unit and topic in
                                  bulk
                                </p>
                                <a
                                  href="/assets/media/SubjectUploadTemplate.xlsx"
                                  target="_blank"
                                  className="btn btn-outline mt-2"
                                >
                                  <div className="d-flex align-items-center justify-content-center">
                                    <img
                                      src="/assets/images/assessment-excel.svg"
                                      alt=""
                                      className="tem-svg mr-2"
                                    />{" "}
                                    Download Template
                                  </div>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="d-flex align-items-center my-3 gap-sm">
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
                            placeholder="Search for Subject"
                            maxLength="50"
                            value={params.searchText}
                            name="txtSearch"
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
                              checked={params.showInactive}
                              onChange={(e) =>
                                onShowInactiveChanged(e.target.checked)
                              }
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
                  {!loading ? (
                    <>
                      {total > 0 ? (
                        <div className="row">
                          {subjects.map((s) => (
                            <div
                              className="subject-card col-md-4 mb-3"
                              key={s._id}
                            >
                              <div
                                className={`curriculum_product_box shadow ${
                                  !s.active ? "border-danger border" : ""
                                }`}
                              >
                                <div className="form-row">
                                  <div className="col-10 cursor-pointer">
                                    <Link
                                      href={`./curriculum/units/${s._id}?subject=${s.subjectName}`}
                                    >
                                      <div className="product_name">
                                        {s.subjectName}
                                        &nbsp;&nbsp;
                                        {s.isAllowReuse === "global" && (
                                          <i className="fas fa-globe text-primary"></i>
                                        )}
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="col-2 text-right">
                                    <div className="dropdown mat-blue">
                                      <a
                                        role="button"
                                        className="material-icons"
                                        id="dropdown-profile-box-btn"
                                        data-toggle="dropdown"
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                      >
                                        more_vert
                                      </a>
                                      <ul
                                        className="dropdown-menu dropdown-menu-right smAlLPop_up py-0 border-0"
                                        aria-labelledby="dropdown-profile-box-btn"
                                      >
                                        {s.canEdit && s.active && (
                                          <li>
                                            <a
                                              onClick={() =>
                                                openModal(true, s._id)
                                              }
                                              className="dropdown-item"
                                            >
                                              <span>
                                                <i className="fas fa-edit"></i>
                                              </span>
                                              Edit
                                            </a>
                                          </li>
                                        )}
                                        {s.canEdit &&
                                          s.isAllowReuse === "self" && (
                                            <li>
                                              <a
                                                onClick={() =>
                                                  updateAllowReuse(
                                                    "global",
                                                    s._id
                                                  )
                                                }
                                                className="dropdown-item"
                                              >
                                                <span>
                                                  <i className="fas fa-globe"></i>
                                                </span>
                                                Allow Global
                                              </a>
                                            </li>
                                          )}
                                        {s.canEdit &&
                                          s.isAllowReuse === "global" && (
                                            <li>
                                              <a
                                                onClick={() =>
                                                  updateAllowReuse(
                                                    "self",
                                                    s._id
                                                  )
                                                }
                                                className="dropdown-item"
                                              >
                                                <span>
                                                  <i className="fas fa-globe"></i>
                                                </span>
                                                Allow Private
                                              </a>
                                            </li>
                                          )}
                                        {s.canEdit && s.active && (
                                          <li>
                                            <a
                                              onClick={() =>
                                                updateStatus(false, s._id)
                                              }
                                              className="dropdown-item"
                                            >
                                              <span>
                                                <i className="fas fa-save"></i>
                                              </span>
                                              Deactivate
                                            </a>
                                          </li>
                                        )}
                                        {s.canEdit && !s.active && (
                                          <li>
                                            <a
                                              onClick={() =>
                                                updateStatus(true, s._id)
                                              }
                                              className="dropdown-item"
                                            >
                                              <span>
                                                <i className="fas fa-save"></i>
                                              </span>
                                              Activate
                                            </a>
                                          </li>
                                        )}
                                        <li>
                                          <a
                                            onClick={() => downloadSubject(s)}
                                            className="dropdown-item"
                                          >
                                            <span>
                                              <i className="fas fa-download"></i>
                                            </span>
                                            Download
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                                <div className="subject2 cursor-pointer">
                                  <div className="curriculum-item-info d-flex align-items-center">
                                    {/* <span className="material-icons mr-1">
                                      book
                                    </span> */}
                                    {s.programs && s.programs.length > 0 && (
                                      <>
                                        <span>{s.programs[0]}</span>
                                        {s.programs.length > 1 && (
                                          <span className="mr-1">,</span>
                                        )}
                                        {s.programs.length > 1 && (
                                          <span>{s.programs[1]}</span>
                                        )}
                                        {s.programs.length > 2 && (
                                          <span className="mx-1">
                                            +{s.programs.length - 2} others
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <Link
                                    href={`./curriculum/units/${s._id}?subject=${s.subjectName}`}
                                    className="form-row curriculum-bottom-info"
                                  >
                                    <div className="col-auto d-flex align-items-center">
                                      <span className="material-icons">
                                        ballot
                                      </span>
                                      <span>
                                        <strong className="text-dark ml-1">
                                          {s.unitCount}
                                        </strong>{" "}
                                        <span className="text-dark">Units</span>
                                      </span>
                                    </div>
                                    <div className="col-auto d-flex align-items-center">
                                      <span className="material-icons">
                                        menu_book
                                      </span>
                                      <span>
                                        <strong className="text-dark ml-1">
                                          {s.topicCount}
                                        </strong>{" "}
                                        <span className="text-dark">
                                          Topics
                                        </span>
                                      </span>
                                    </div>
                                    <div className="col-auto d-flex align-items-center">
                                      <span className="material-icons">
                                        assignment
                                      </span>
                                      <span>
                                        <strong className="text-dark ml-1">
                                          {s.questionCount}
                                        </strong>{" "}
                                        <span className="text-dark">
                                          Questions
                                        </span>
                                      </span>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mx-auto">
                          <img
                            className="mx-auto"
                            src="/assets/images/subject.svg"
                            alt="No Subjects"
                          />
                          <h6 className="text-center">No Subjects yet</h6>
                        </div>
                      )}

                      {total > params.limit && (
                        <div className="text-center mt-2 d-flex justify-content-center">
                          <CustomPagination
                            totalItems={total}
                            limit={params.limit}
                            currentPage={params.page}
                            onPageChange={(e) => {
                              setParams({
                                ...params,
                                page: e,
                              });
                              loadSubjects(false, { ...params, page: e });
                            }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="row">
                      <div className="subject-card col-md-4 mb-3">
                        <div className="curriculum_product_box shadow p-0">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="99" />
                        </div>
                      </div>
                      <div className="subject-card col-md-4 mb-3">
                        <div className="curriculum_product_box shadow  p-0">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="99" />
                        </div>
                      </div>
                      <div className="subject-card col-md-4 mb-3">
                        <div className="curriculum_product_box shadow  p-0">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="99" />
                        </div>
                      </div>
                      <div className="subject-card col-md-4 mb-3">
                        <div className="curriculum_product_box shadow  p-0">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="99" />
                        </div>
                      </div>
                      <div className="subject-card col-md-4 mb-3">
                        <div className="curriculum_product_box shadow  p-0">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="99" />
                        </div>
                      </div>
                      <div className="subject-card col-md-4 mb-3">
                        <div className="curriculum_product_box shadow p-0">
                          <SkeletonLoaderComponent Cwidth="100" Cheight="99" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
              {isEditMode ? "Edit Subject" : "Add Subject"}
            </h4>
          </div>
          <div className="modal-body admiN_ModAlAlL">
            <div className="form-row mb-2">
              <div className="col-auto">
                <figure className="squared-rounded_wrap_80 admin-user-image1">
                  <img src="/assets/images/img1.png" alt="" />
                </figure>
              </div>
              <div className="col">
                <div className="clearfix">
                  <div className="class-board-info">
                    <form>
                      <h4 className="form-box_subtitle mb-0">
                        Which subject would you like to add?
                      </h4>
                      <input
                        type="text"
                        className="border-bottom py-2"
                        name="name"
                        value={subject.name}
                        onChange={(e) =>
                          setSubject({
                            ...subject,
                            name: e.target.value,
                          })
                        }
                        placeholder="Subject name"
                      />
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="clearfix">
              <div className="class-board-info mt-1">
                <form className="mb-2" onSubmit={(e) => e.preventDefault()}>
                  <h4 className="form-box_subtitle mb-0">Subject code</h4>
                  <input
                    type="text"
                    name="code"
                    className="border-bottom py-2"
                    maxLength="10"
                    value={subject.code}
                    onChange={(e) =>
                      setSubject({
                        ...subject,
                        code: e.target.value,
                      })
                    }
                    placeholder="Subject Code"
                    disabled={isEditMode}
                  />
                </form>
                <sup>*Enter the code or it will be autogenerated</sup>
              </div>
            </div>
            <div className="clearfix">
              <div className="color-tags">
                <h4 className="form-box_subtitle mb-0">Programs</h4>
                <Multiselect
                  options={programs}
                  selectedValues={cTags}
                  onSelect={(e) => setCTags(e)}
                  onRemove={(e) => setCTags(e)}
                  displayValue="name"
                  placeholder="Enter Programs"
                  className="multiSelectLocCls border-bottom py-2"
                  showCheckbox={true}
                  showArrow={true}
                  closeIcon="cancel"
                  avoidHighlightFirstOption={true}
                />
              </div>
            </div>
            <div className="clearfix">
              <div className="color-tags">
                <h4 className="form-box_subtitle mb-0">Tags</h4>
                <TagsInput
                  value={subject.tags}
                  onChange={(tags) => setSubject({ ...subject, tags })}
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
              {isEditMode ? (
                <button className="btn btn-primary ml-2" onClick={onEdit}>
                  Update
                </button>
              ) : (
                <button className="btn btn-primary ml-2" onClick={addSubject}>
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
